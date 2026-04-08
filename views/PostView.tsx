import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { FeedPost } from '../types';
import { Button } from '../components/Button';
import { LucideArrowLeft, LucideCalendar, LucideTrash2, LucideYoutube } from 'lucide-react';
import { PostImageCarousel } from '../components/PostImageCarousel';
import { UserProfile } from '../types';
import { Comments } from '../components/Comments';
import { LikeButton } from '../components/LikeButton';
import { extractYouTubeVideoId } from '../utils/youtube';

interface PostViewProps {
    post: FeedPost;
    onBack: () => void;
    userProfile?: UserProfile | null;
    onDeleted?: () => void;
    onOpenPlayer?: (playerId: string) => void;
}

const getYoutubeEmbed = (url: string) => {
    const videoId = extractYouTubeVideoId(url);
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

export const PostView: React.FC<PostViewProps> = ({ post, onBack, userProfile, onDeleted, onOpenPlayer }) => {
    const [authorName, setAuthorName] = useState('ANCB');
    const [authorPhoto, setAuthorPhoto] = useState<string | null>(null);
    const [authorPlayerId, setAuthorPlayerId] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const resolveAuthor = async () => {
            if (!post.author_id) {
                if (isMounted) {
                    setAuthorName('ANCB');
                    setAuthorPhoto(null);
                    setAuthorPlayerId(null);
                }
                return;
            }

            try {
                const userDoc = await db.collection('usuarios').doc(post.author_id).get();
                if (!isMounted) return;

                if (!userDoc.exists) {
                    setAuthorName('ANCB');
                    setAuthorPhoto(null);
                    setAuthorPlayerId(null);
                    return;
                }

                const userData = userDoc.data();
                setAuthorName(userData?.apelido || userData?.nome || 'Usuário');
                setAuthorPhoto(userData?.foto || null);
                setAuthorPlayerId(userData?.linkedPlayerId || null);
            } catch {
                if (!isMounted) return;
                setAuthorName('ANCB');
                setAuthorPhoto(null);
                setAuthorPlayerId(null);
            }
        };

        resolveAuthor();

        return () => {
            isMounted = false;
        };
    }, [post.author_id]);

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
        <section className="relative min-h-screen py-1 md:py-4">
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
                <div className="absolute -top-28 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-200/40 blur-3xl dark:bg-cyan-900/30" />
                <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-amber-200/30 blur-3xl dark:bg-amber-900/20" />
            </div>

            <div className="max-w-3xl mx-auto px-3 md:px-4">
                <div className="mb-3 sticky top-1 z-10">
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200/70 bg-white/80 px-3 py-2 backdrop-blur-md dark:border-gray-700/70 dark:bg-gray-900/70">
                        <Button
                            variant="secondary"
                            onClick={onBack}
                            className="inline-flex items-center gap-2 !border-0 !bg-transparent hover:!bg-gray-100 dark:hover:!bg-gray-800"
                        >
                            <LucideArrowLeft size={18} />
                            Voltar
                        </Button>

                        {canDelete && (
                            <Button
                                variant="secondary"
                                onClick={handleDelete}
                                className="inline-flex items-center gap-2 !border-0 !bg-transparent !text-red-600 hover:!bg-red-50 dark:hover:!bg-red-950/30"
                            >
                                <LucideTrash2 size={16} />
                                Apagar post
                            </Button>
                        )}
                    </div>
                </div>

                <article className="overflow-hidden rounded-3xl border border-gray-200/70 bg-white/85 shadow-sm backdrop-blur-md dark:border-gray-700/70 dark:bg-gray-900/75">
                    <header className="px-4 md:px-6 pt-5 md:pt-6 pb-4 border-b border-gray-200/70 dark:border-gray-700/70">
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <button
                                type="button"
                                onClick={() => authorPlayerId && onOpenPlayer?.(authorPlayerId)}
                                disabled={!authorPlayerId || !onOpenPlayer}
                                className="inline-flex items-center gap-2"
                            >
                                <img
                                    src={authorPhoto || `https://ui-avatars.com/api/?name=${authorName}`}
                                    alt={authorName}
                                    className="h-7 w-7 rounded-full object-cover"
                                />
                                <span className={authorPlayerId && onOpenPlayer ? 'text-gray-500 hover:underline dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}>
                                    {authorName}
                                </span>
                            </button>
                            <span className="inline-flex items-center gap-1.5">
                                <LucideCalendar size={14} />
                                {formatTime(post.timestamp)}
                            </span>
                            {post.content.link_video && (
                                <span className="inline-flex items-center gap-1 text-red-500 font-semibold">
                                    <LucideYoutube size={14} />
                                    Video
                                </span>
                            )}
                        </div>

                        <h1 className="mt-4 text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
                            {post.content.titulo || 'Post da ANCB'}
                        </h1>
                    </header>

                    {(videoSrc || postImages.length > 0) && (
                        <div className="px-4 md:px-6 pt-5">
                            {videoSrc && (
                                <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-sm ring-1 ring-black/5 dark:ring-white/10">
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

                    <div className="px-4 md:px-6 py-6 md:py-8">
                        <div className="max-w-2xl mx-auto text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-base md:text-lg">
                            {postText}
                        </div>

                        <div className="max-w-2xl mx-auto mt-6 border-t border-gray-200/80 dark:border-gray-700/80 pt-4">
                            <LikeButton postId={post.id} userId={userProfile?.uid} variant="light" />
                        </div>

                        <div className="max-w-2xl mx-auto mt-5 rounded-2xl border border-gray-200/70 bg-white/60 px-3 py-2 dark:border-gray-700/70 dark:bg-gray-900/55">
                            <Comments
                                postId={post.id}
                                user={userProfile || null}
                                onOpenPlayer={onOpenPlayer}
                                variant="light"
                            />
                        </div>
                    </div>
                </article>
            </div>
        </section>
    );
};
