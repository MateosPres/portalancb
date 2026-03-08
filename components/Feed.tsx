
import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { FeedPost } from '../types';
import { LucideAlertTriangle, LucideYoutube, LucideCalendar, LucidePlay } from 'lucide-react';

interface FeedProps {
    onOpenPost: (post: FeedPost) => void;
}

export const Feed: React.FC<FeedProps> = ({ onOpenPost }) => {
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loading, setLoading] = useState(true);

    const getPosts = async () => {
        try {
            const snapshot = await db.collection("feed_posts")
                .orderBy("timestamp", "desc")
                .limit(6)
                .get();
            setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as FeedPost)));
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
        return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' }).format(date);
    };

    const getYoutubeId = (url: string) => {
        try {
            const parsed = new URL(url);
            const host = parsed.hostname.replace('www.', '').toLowerCase();
            if (host === 'youtu.be') return parsed.pathname.replace('/', '').split('/')[0] || null;
            if (host === 'youtube.com' || host === 'm.youtube.com') {
                if (parsed.pathname === '/watch') return parsed.searchParams.get('v');
                if (parsed.pathname.startsWith('/shorts/')) return parsed.pathname.split('/shorts/')[1]?.split('/')[0] || null;
                if (parsed.pathname.startsWith('/embed/')) return parsed.pathname.split('/embed/')[1]?.split('/')[0] || null;
            }
            return null;
        } catch {
            return null;
        }
    };

    const getYoutubeThumbnail = (url: string) => {
        const videoId = getYoutubeId(url);
        if (videoId) {
            return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        }
        return null;
    };

    if (loading) return <div className="text-center py-10 opacity-50">Carregando feed...</div>;
    if (posts.length === 0) return null;

    return (
        <section className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b-2 border-gray-200 dark:border-gray-700 pb-2 inline-block">
                📰 Últimas Atualizações
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map(post => {
                    const videoThumbnail = post.content.link_video ? getYoutubeThumbnail(post.content.link_video) : null;
                    const dateStr = formatTime(post.timestamp).split(' às ')[0];
                    if (post.type === 'placar') {
                        return (
                            <div 
                                key={post.id} 
                                onClick={() => onOpenPost(post)}
                                className="bg-ancb-black text-white rounded-xl overflow-hidden shadow-lg border border-gray-700 flex flex-col cursor-pointer transform transition-transform hover:-translate-y-1 hover:shadow-xl group"
                            >
                                <div className="bg-gray-800 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest flex justify-between">
                                    <span>{post.content.titulo || 'Placar Final'}</span>
                                    <span>{dateStr}</span>
                                </div>
                                {post.image_url && (
                                    <div className="h-40 w-full relative">
                                        <img src={post.image_url} alt="Foto do Jogo" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-ancb-black to-transparent"></div>
                                    </div>
                                )}
                                <div className="p-6 flex-grow flex flex-col justify-center">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-lg">ANCB</span>
                                        <span className="text-4xl font-bold text-ancb-orange">{post.content.placar_ancb}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-lg truncate w-24" title={post.content.time_adv}>{post.content.time_adv}</span>
                                        <span className="text-4xl font-bold text-white">{post.content.placar_adv}</span>
                                    </div>
                                    <div className="mt-4 text-center text-xs text-gray-500 font-bold uppercase tracking-wider group-hover:text-ancb-blue transition-colors">
                                        Ver Detalhes
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    if (post.type === 'aviso') {
                        return (
                            <div 
                                key={post.id} 
                                onClick={() => onOpenPost(post)}
                                className="bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-400 rounded-r-xl p-6 shadow-sm flex flex-col cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-colors"
                            >
                                <div className="flex items-center gap-3 mb-3 text-yellow-700 dark:text-yellow-500">
                                    <LucideAlertTriangle size={24} />
                                    <span className="font-bold text-xs uppercase tracking-wider">{dateStr}</span>
                                </div>
                                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2 line-clamp-2">{post.content.titulo}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">{post.content.resumo}</p>
                                <span className="mt-auto pt-4 text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase">Ler comunicado</span>
                            </div>
                        );
                    }
                    if (post.type === 'resultado_evento') {
                        return (
                            <div 
                                key={post.id} 
                                onClick={() => onOpenPost(post)}
                                className="bg-blue-50 dark:bg-blue-900/10 border-l-4 border-ancb-blue rounded-r-xl p-6 shadow-sm flex flex-col cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                            >
                                <div className="flex items-center gap-3 mb-3 text-ancb-blue dark:text-blue-400">
                                    <LucideCalendar size={24} />
                                    <span className="font-bold text-xs uppercase tracking-wider">{dateStr}</span>
                                </div>
                                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2 line-clamp-2">{post.content.titulo}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">{post.content.resumo}</p>
                                <span className="mt-auto pt-4 text-xs font-bold text-ancb-blue dark:text-blue-400 uppercase">Ver resultado completo</span>
                            </div>
                        );
                    }
                    return (
                        <div 
                            key={post.id} 
                            onClick={() => onOpenPost(post)}
                            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                        >
                            {videoThumbnail ? (
                                <div className="aspect-video w-full bg-black relative flex items-center justify-center overflow-hidden">
                                    <img 
                                        src={videoThumbnail} 
                                        alt="Video Thumbnail" 
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity transform group-hover:scale-105 duration-500" 
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <LucidePlay className="text-white fill-white ml-1" size={20} />
                                        </div>
                                    </div>
                                </div>
                            ) : post.image_url ? (
                                <div className="h-48 w-full overflow-hidden">
                                    <img src={post.image_url} alt={post.content.titulo} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                                </div>
                            ) : null}
                            <div className="p-5 flex flex-col flex-grow">
                                <div className="text-xs text-ancb-blue dark:text-blue-400 font-bold mb-2 uppercase flex items-center gap-1">
                                    {post.content.link_video && <LucideYoutube size={14} />}
                                    {dateStr}
                                </div>
                                <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-3 leading-tight line-clamp-2 group-hover:text-ancb-blue transition-colors">
                                    {post.content.titulo}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">{post.content.resumo}</p>
                                <span className="mt-auto text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-ancb-blue transition-colors">Leia mais</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
