import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { FeedPost, UserProfile } from '../types';
import { LikeButton } from "../components/LikeButton";
import { Comments } from "../components/Comments";
import { motion, AnimatePresence } from 'framer-motion';
import { PostImageCarousel } from './PostImageCarousel';
import { LucideMessageCircle, LucideTrash2 } from 'lucide-react';

interface FeedProps {
  userProfile: UserProfile | null;
  onOpenPost?: (post: FeedPost) => void;
  onOpenPlayer?: (playerId: string) => void;
}

/* LEGENDA SIMPLES */
const Caption: React.FC<{ text: string }> = ({ text }) => {
  return (
    <p className="px-3 py-1 pl-[3.9rem] text-white text-sm leading-relaxed text-left">
      {text}
    </p>
  );
};

export const Feed: React.FC<FeedProps> = ({ userProfile, onOpenPost, onOpenPlayer }) => {
  const [posts, setPosts] = useState<(FeedPost & { authorName?: string; authorPhoto?: string | null; authorPlayerId?: string | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [commentsCount, setCommentsCount] = useState<Record<string, number>>({});

  const getPosts = async () => {
    try {
      const snapshot = await db.collection("feed_posts")
        .orderBy("timestamp", "desc")
        .limit(10)
        .get();

      const postsData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data() as FeedPost;

          let authorName = "ANCB";
          let authorPhoto: string | null = null;
          let authorPlayerId: string | null = null;

          if (data.author_id) {
            const userDoc = await db.collection("usuarios").doc(data.author_id).get();
            if (userDoc.exists) {
              const userData = userDoc.data();
              authorName = userData?.apelido || userData?.nome || "Usuário";
              authorPhoto = userData?.foto || null;
              authorPlayerId = userData?.linkedPlayerId || null;
            }
          }

          return { ...data, id: doc.id, authorName, authorPhoto, authorPlayerId };
        })
      );

      setPosts(postsData);
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
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getYoutubeId = (url: string) => {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace('www.', '').toLowerCase();
      if (host === 'youtu.be') return parsed.pathname.replace('/', '');
      if (host.includes('youtube.com')) {
        if (parsed.pathname === '/watch') return parsed.searchParams.get('v');
        if (parsed.pathname.startsWith('/shorts/')) return parsed.pathname.split('/shorts/')[1];
        if (parsed.pathname.startsWith('/embed/')) return parsed.pathname.split('/embed/')[1];
      }
      return null;
    } catch {
      return null;
    }
  };

  const getPostText = (post: FeedPost): string => {
    const content = post.content || {};
    if (content.text?.trim()) return content.text;
    if (content.resumo?.trim()) return content.resumo;

    const legacyScore =
      content.placar_ancb !== undefined || content.placar_adv !== undefined
        ? `ANCB ${content.placar_ancb ?? '-'} x ${content.placar_adv ?? '-'} ${content.time_adv ? `(${content.time_adv})` : ''}`
        : '';

    const legacyPieces = [content.titulo, legacyScore, content.resultado_detalhes]
      .filter(Boolean)
      .map((item) => String(item).trim())
      .filter(Boolean);

    return legacyPieces.join('\n') || 'Post sem texto';
  };

  const canDeletePost = (post: FeedPost): boolean => {
    if (!userProfile?.uid) return false;
    const isAdmin = userProfile.role === 'admin' || userProfile.role === 'super-admin';
    const isAuthor = post.author_id === userProfile.uid || post.userId === userProfile.uid;
    return isAdmin || isAuthor;
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Deseja realmente apagar este post?')) return;
    try {
      await db.collection('feed_posts').doc(postId).delete();
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      setShowComments((prev) => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
    } catch (error) {
      console.error('Erro ao apagar post:', error);
      alert('Não foi possível apagar o post. Tente novamente.');
    }
  };

  if (loading) return <div className="text-center py-10 opacity-50">Carregando feed...</div>;
  if (!posts.length) return <div className="text-center py-10 text-slate-400">Nenhum post disponível.</div>;

  return (
    <section className="mt-4">
      <div className="w-full max-w-[600px] mx-auto flex flex-col">
        {posts.map((post) => {
          const videoUrl = post.content?.link_video;
          const youtubeId = videoUrl ? getYoutubeId(videoUrl) : null;
          const dateStr = formatTime(post.timestamp);
          const postText = getPostText(post);
          const postImages = (post.images && post.images.length ? post.images : post.image_url ? [post.image_url] : []).filter(Boolean) as string[];

          return (
            <div key={post.id} className="flex flex-col border-b border-white/10 pb-8 mb-8 last:mb-0 last:border-b-0">
              {/* HEADER */}
              <div className="flex items-start gap-3 px-3">
                <button
                  type="button"
                  onClick={() => post.authorPlayerId && onOpenPlayer?.(post.authorPlayerId)}
                  disabled={!post.authorPlayerId || !onOpenPlayer}
                  className="rounded-full"
                >
                  <img
                    src={post.authorPhoto || `https://ui-avatars.com/api/?name=${post.authorName}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </button>
                <div className="flex flex-1 items-start justify-between gap-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => post.authorPlayerId && onOpenPlayer?.(post.authorPlayerId)}
                      disabled={!post.authorPlayerId || !onOpenPlayer}
                      className={post.authorPlayerId && onOpenPlayer ? 'font-bold text-white text-sm hover:underline' : 'font-bold text-white text-sm cursor-default'}
                    >
                      {post.authorName}
                    </button>
                    <span className="text-slate-400 text-xs">· {dateStr}</span>
                  </div>
                  {canDeletePost(post) && (
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.id)}
                      className="rounded-full p-1.5 text-slate-400 transition hover:bg-red-500/15 hover:text-red-300"
                      title="Apagar post"
                    >
                      <LucideTrash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* MÍDIA COM MARGEM VISUAL */}
              {!!postImages.length && (
                <div className="w-full mt-2 pl-[3.9rem] pr-3">
                  <PostImageCarousel images={postImages} imageClassName="max-h-[340px]" />
                </div>
              )}

              {/* CONTEÚDO */}
              <button
                type="button"
                className="text-left"
                onClick={() => onOpenPost?.(post)}
              >
                <Caption text={postText} />
              </button>

              {youtubeId && (
                <div className="w-full mt-2 pl-[3.9rem] pr-3">
                  <div className="relative pb-[56.25%] rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                      className="absolute top-0 left-0 w-full h-full"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* AÇÕES */}
              <div className="mt-2 flex items-center gap-3 pl-[3.9rem] pr-3 text-sm text-slate-300">
                <LikeButton postId={post.id} userId={userProfile?.uid} />
                <button
                  className="inline-flex items-center gap-1.5 rounded-full px-1 py-0.5 transition hover:bg-white/5"
                  onClick={() => setShowComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
                >
                  <LucideMessageCircle size={18} />
                  <span className="text-sm text-slate-300">{commentsCount[post.id] || 0}</span>
                </button>
              </div>

              {/* COMENTÁRIOS COM ANIMAÇÃO */}
              <AnimatePresence>
                {showComments[post.id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 pl-[3.9rem] pr-3"
                  >
                    <Comments
                      postId={post.id}
                      user={userProfile}
                      onOpenPlayer={onOpenPlayer}
                      onChangeCount={(count) =>
                        setCommentsCount(prev => ({ ...prev, [post.id]: count }))
                      }
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
};