import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { FeedPost } from '../types';

interface FeedProps {
    onOpenPost: (post: FeedPost) => void;
}

export const Feed: React.FC<FeedProps> = () => {
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loading, setLoading] = useState(true);

    const getPosts = async () => {
        try {
            const snapshot = await db.collection("feed_posts")
                .orderBy("timestamp", "desc")
                .limit(6)
                .get();

            setPosts(
                snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...(doc.data() as any)
                } as FeedPost))
            );
        } catch (error) {
            console.error("Error fetching feed:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getPosts();
    }, []);

    const formatTime = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getYoutubeId = (url: string) => {
        try {
            const parsed = new URL(url);
            const host = parsed.hostname.replace('www.', '').toLowerCase();

            if (host === 'youtu.be') {
                return parsed.pathname.replace('/', '').split('/')[0] || null;
            }

            if (host === 'youtube.com' || host === 'm.youtube.com') {
                if (parsed.pathname === '/watch') return parsed.searchParams.get('v');
                if (parsed.pathname.startsWith('/shorts/')) return parsed.pathname.split('/shorts/')[1]?.split('/')[0];
                if (parsed.pathname.startsWith('/embed/')) return parsed.pathname.split('/embed/')[1]?.split('/')[0];
            }

            return null;
        } catch {
            return null;
        }
    };

    if (loading) {
        return <div className="text-center py-10 opacity-50">Carregando feed...</div>;
    }

    if (posts.length === 0) return null;

    return (
        <section className="mt-8">
            <div className="w-full max-w-[500px] mx-auto space-y-6">
                {posts.map((post) => {
                    const videoUrl = post.content?.link_video;
                    const youtubeId = videoUrl ? getYoutubeId(videoUrl) : null;
                    const isShort = post.content?.link_video?.includes("shorts");
                    const dateStr = formatTime(post.timestamp);
                    

                    return (
                        <article
                            key={post.id}
                            className="bg-[#041b3d]/60 border border-white/10 rounded-xl overflow-hidden shadow-lg"
                        >
                            {/* HEADER */}
                            <div className="flex items-center gap-3 p-3">
                                <img
                                    src={`https://ui-avatars.com/api/?name=ANCB`}
                                    className="w-9 h-9 rounded-full"
                                />
                                <div className="flex flex-col">
                                    <span className="text-white font-bold text-sm">ANCB</span>
                                    <span className="text-xs text-slate-400">{dateStr}</span>
                                </div>
                            </div>

                            {/* MÍDIA */}
                            {youtubeId ? (
                            <div className="w-full h-[500px] relative overflow-hidden bg-black">
                                <iframe
                                    src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                                    className="absolute top-1/2 left-1/2 w-[177%] h-[177%] -translate-x-1/2 -translate-y-1/2"
                                    frameBorder="0"
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                />
                            </div>
                            ) : post.image_url ? (
                            <img
                            src={post.image_url}
                            className="w-full h-[500px] object-cover bg-black"
                            />
                            ) : null}
                            {/* AÇÕES */}
                            <div className="flex gap-4 p-3">
                                <button className="text-slate-300 hover:text-red-500">
                                    ❤️
                                </button>
                                <button className="text-slate-300">
                                    💬
                                </button>
                            </div>

                            {/* LEGENDA COM LER MAIS */}
                            <Caption text={post.content?.resumo || ""} title={post.content?.titulo} />
                        </article>
                    );
                })}
            </div>
        </section>
    );
};


/* 🔥 COMPONENTE DE LEGENDA (LER MAIS) */
const Caption = ({ text, title }: { text: string; title?: string }) => {
    const [expanded, setExpanded] = useState(false);

    const isLong = text.length > 120;
    const displayText = expanded ? text : text.slice(0, 120);

    return (
        <div className="px-3 pb-4 text-sm text-slate-200">
    <div className="font-bold text-white mb-1">
        {title || "ANCB"}
    </div>

    <div className="text-justify leading-relaxed">
        {displayText}
    </div>

    {isLong && (
        <button
            onClick={() => setExpanded(!expanded)}
            className="text-slate-400 font-semibold ml-1"
        >
            {expanded ? "ver menos" : "... ler mais"}
        </button>
    )}
</div>
    );
};