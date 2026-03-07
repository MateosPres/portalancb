import React from 'react';
import { FeedPost } from '../types';
import { Button } from '../components/Button';
import { LucideArrowLeft, LucideCalendar, LucideYoutube } from 'lucide-react';

interface PostViewProps {
    post: FeedPost;
    onBack: () => void;
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

export const PostView: React.FC<PostViewProps> = ({ post, onBack }) => {
    const videoSrc = post.content.link_video ? getYoutubeEmbed(post.content.link_video) : null;

    return (
        <section className="min-h-screen py-6 md:py-10 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-5xl mx-auto px-4">
                <div className="mb-6">
                    <Button
                        variant="secondary"
                        onClick={onBack}
                        className="inline-flex items-center gap-2"
                    >
                        <LucideArrowLeft size={18} />
                        Voltar
                    </Button>
                </div>

                <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <header className="px-5 md:px-8 pt-6 md:pt-8 pb-5 border-b border-gray-100 dark:border-gray-700">
                        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                            {post.content.titulo || (post.content.time_adv ? `Jogo contra ${post.content.time_adv}` : 'Sem titulo')}
                        </h1>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <span className="inline-flex items-center gap-1.5">
                                <LucideCalendar size={14} />
                                {formatTime(post.timestamp)}
                            </span>
                            <span className="text-gray-400 dark:text-gray-500">por ANCB</span>
                            {post.type === 'aviso' && <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Aviso Oficial</span>}
                            {post.type === 'resultado_evento' && <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Resultado de Evento</span>}
                            {post.content.link_video && (
                                <span className="inline-flex items-center gap-1 text-red-500 font-semibold">
                                    <LucideYoutube size={14} />
                                    Video
                                </span>
                            )}
                        </div>
                    </header>

                    {(videoSrc || post.image_url) && (
                        <div className="px-5 md:px-8 pt-6">
                            {videoSrc ? (
                                <div className="w-full aspect-video rounded-xl overflow-hidden bg-black shadow-sm">
                                    <iframe
                                        src={videoSrc}
                                        className="w-full h-full"
                                        title={post.content.titulo || 'Video do post'}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            ) : post.image_url ? (
                                <img
                                    src={post.image_url}
                                    alt={post.content.titulo || 'Imagem do post'}
                                    className="w-full max-h-[560px] object-cover rounded-xl shadow-sm"
                                />
                            ) : null}
                        </div>
                    )}

                    <div className="px-5 md:px-8 py-8 md:py-10">
                        <div className="max-w-3xl mx-auto text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-base md:text-lg">
                            {post.content.resumo}
                        </div>
                    </div>
                </article>
            </div>
        </section>
    );
};
