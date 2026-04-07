import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { FeedPost, UserProfile } from '../types';
import { LikeButton } from "../components/LikeButton";
import { Comments } from "../components/Comments";
import { FaRegComment } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedProps {
  userProfile: UserProfile | null;
}

/* LEGENDA SIMPLES */
const Caption: React.FC<{ text: string }> = ({ text }) => {
  return (
    <p className="px-3 py-1 text-white text-sm leading-relaxed text-left">
      {text}
    </p>
  );
};

export const Feed: React.FC<FeedProps> = ({ userProfile }) => {
  const [posts, setPosts] = useState<(FeedPost & { authorName?: string; authorPhoto?: string | null })[]>([]);
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

          if (data.author_id) {
            const userDoc = await db.collection("usuarios").doc(data.author_id).get();
            if (userDoc.exists) {
              const userData = userDoc.data();
              authorName = userData?.apelido || userData?.nome || "Usuário";
              authorPhoto = userData?.foto || null;
            }
          }

          return { ...data, id: doc.id, authorName, authorPhoto };
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

  if (loading) return <div className="text-center py-10 opacity-50">Carregando feed...</div>;
  if (!posts.length) return <div className="text-center py-10 text-slate-400">Nenhum post disponível.</div>;

  return (
    <section className="mt-4">
      <div className="w-full max-w-[600px] mx-auto flex flex-col">
        {posts.map((post) => {
          const videoUrl = post.content?.link_video;
          const youtubeId = videoUrl ? getYoutubeId(videoUrl) : null;
          const dateStr = formatTime(post.timestamp);

          return (
            <div key={post.id} className="flex flex-col border-b border-white/10 pb-4 mb-4 last:mb-0 last:border-b-0">
              {/* HEADER */}
              <div className="flex items-start gap-3 px-3">
                <img
                  src={post.authorPhoto || `https://ui-avatars.com/api/?name=${post.authorName}`}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-white text-sm">{post.authorName}</span>
                    <span className="text-slate-400 text-sm">@{post.authorName?.toLowerCase() || 'ancb'}</span>
                    <span className="text-slate-400 text-xs">· {dateStr}</span>
                  </div>
                </div>
              </div>

              {/* CONTEÚDO */}
              <Caption text={post.content?.resumo || ""} />

              {/* MÍDIA COM MARGEM VISUAL */}
              {youtubeId && (
                <div className="w-full mt-2 px-3">
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
              {!youtubeId && post.image_url && (
                <div className="w-full mt-2 px-3">
                  <img
                    src={post.image_url}
                    className="w-full max-h-[300px] object-cover rounded-lg"
                  />
                </div>
              )}

              {/* AÇÕES */}
              <div className="flex items-center mt-2 px-3 text-slate-400 text-sm gap-4">
                <LikeButton postId={post.id} userId={userProfile?.uid} />
                <button
                  className="flex items-center gap-1"
                  onClick={() => setShowComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
                >
                  <FaRegComment />
                  <span className="text-sm">{commentsCount[post.id] || 0}</span>
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
                    className="mt-2 px-3"
                  >
                    <Comments
                      postId={post.id}
                      user={userProfile}
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