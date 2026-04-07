import React from 'react';
import { db } from '../services/firebase';
import { FeedPost } from '../types';
import { Button } from '../components/Button';
import { LucideArrowLeft, LucideCalendar, LucideTrash2, LucideYoutube } from 'lucide-react';
import { PostImageCarousel } from '../components/PostImageCarousel';
import { UserProfile } from '../types';

interface PostViewProps {
    post: FeedPost;
    onBack: () => void;
    userProfile?: UserProfile | null;
    onDeleted?: () => void;
}

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

const getYoutubeEmbed = (url: string) => {
    const videoId = getYoutubeId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

export const PostView: React.FC<PostViewProps> = ({ post, onBack, userProfile, onDeleted }) => {
    const videoSrc = post.content.link_video ? getYoutubeEmbed(post.content.link_video) : null;
    const postText =
        post.content.text?.trim() ||
        post.content.resumo?.trim() ||
        [
            post.content.titulo,
            post.content.placar_ancb !== undefined || post.content.placar_adv !== undefined
                ? `ANCB ${post.content.placar_ancb ?? '-'} x ${post.content.placar_adv ?? '-'} ${post.content.time_adv ? `(${post.content.time_adv})` : ''}`
                : '',
            post.content.resultado_detalhes,
        ]
            .filter(Boolean)
            .join('\n') ||
        'Post sem texto';

    const postImages = (post.images && post.images.length ? post.images : post.image_url ? [post.image_url] : []).filter(Boolean) as string[];
    const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super-admin';
    const isAuthor = userProfile?.uid === post.author_id || userProfile?.uid === post.userId;
    const canDelete = Boolean(userProfile?.uid && (isAdmin || isAuthor));

    const handleDelete = async () => {
        if (!window.confirm('Deseja realmente apagar este post?')) return;
        try {
            await db.collection('feed_posts').doc(post.id).delete();
            onDeleted?.();
        } catch (error) {
            console.error('Erro ao apagar post:', error);
            alert('Não foi possível apagar o post. Tente novamente.');
        }
    };

    return (
        <section className="min-h-screen py-6 md:py-10 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-5xl mx-auto px-4">
                <div className="mb-6">
                    <div className="flex items-center justify-between gap-3">
                        <Button
                            variant="secondary"
                            onClick={onBack}
                            className="inline-flex items-center gap-2"
                        >
                            <LucideArrowLeft size={18} />
                            Voltar
                        </Button>

                        {canDelete && (
                            <Button
                                variant="secondary"
                                onClick={handleDelete}
                                className="inline-flex items-center gap-2 !border-red-300 !text-red-600 hover:!bg-red-50"
                            >
                                <LucideTrash2 size={16} />
                                Apagar post
                            </Button>
                        )}
                    </div>
                </div>

                <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <header className="px-5 md:px-8 pt-6 md:pt-8 pb-5 border-b border-gray-100 dark:border-gray-700">
                        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                            {post.content.titulo || 'Post da ANCB'}
                        </h1>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <span className="inline-flex items-center gap-1.5">
                                <LucideCalendar size={14} />
                                {formatTime(post.timestamp)}
                            </span>
                            <span className="text-gray-400 dark:text-gray-500">por ANCB</span>
                            {post.content.link_video && (
                                <span className="inline-flex items-center gap-1 text-red-500 font-semibold">
                                    <LucideYoutube size={14} />
                                    Video
                                </span>
                            )}
                        </div>
                    </header>

                    {(videoSrc || postImages.length > 0) && (
                        <div className="px-5 md:px-8 pt-6">
                            {videoSrc && (
                                <div className="w-full aspect-video rounded-xl overflow-hidden bg-black shadow-sm">
                                    <iframe
                                        src={videoSrc}
                                        className="w-full h-full"
                                        title={post.content.titulo || 'Video do post'}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            )}

                            {postImages.length > 0 && (
                                <div className="mt-4">
                                    <PostImageCarousel images={postImages} imageClassName="max-h-[560px]" />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="px-5 md:px-8 py-8 md:py-10">
                        <div className="max-w-3xl mx-auto text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-base md:text-lg">
                            {postText}
                        </div>
                    </div>
                </article>
            </div>
        </section>
    );
};
