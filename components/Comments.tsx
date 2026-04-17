import React, { useEffect, useRef, useState } from 'react';
import { db } from '../services/firebase';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane } from 'react-icons/fa';
import { LucideEllipsisVertical } from 'lucide-react';
import { CommentLikeButton } from './CommentLikeButton';

export interface CommentType {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: any;
  userPhoto?: string | null;
  likesCount?: number;
  linkedPlayerId?: string | null;
}

interface CommentsProps {
  postId: string;
  user: UserProfile | null;
  onChangeCount?: (count: number) => void; // <--- aqui
  onOpenPlayer?: (playerId: string) => void;
  variant?: 'dark' | 'light';
}

export const Comments: React.FC<CommentsProps> = ({ postId, user, onChangeCount, onOpenPlayer, variant = 'dark' }) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [authorPlayerByUserId, setAuthorPlayerByUserId] = useState<Record<string, string | null>>({});
  const onChangeCountRef = useRef<CommentsProps['onChangeCount']>(onChangeCount);

  useEffect(() => {
    onChangeCountRef.current = onChangeCount;
  }, [onChangeCount]);

  const handleSend = async () => {
    if (!newComment.trim() || !user) return;

    const commentData: Omit<CommentType, 'id'> = {
      text: newComment,
      userId: user.uid,
      userName: user.apelido || user.nome || 'Usuário',
      createdAt: new Date(),
      userPhoto: user.foto || null,
      likesCount: 0,
      linkedPlayerId: user.linkedPlayerId || null,
    };

    try {
      const commentRef = await db
        .collection('feed_posts')
        .doc(postId)
        .collection('comments')
        .add(commentData);

      setComments(prev => [...prev, { id: commentRef.id, ...commentData }]);
      setNewComment('');
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
    }
  };

  const canManageComment = (comment: CommentType) => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'super-admin') return true;
    return user.uid === comment.userId;
  };

  const handleDeleteComment = async (comment: CommentType) => {
    const confirmDelete = window.confirm('Tem certeza que deseja apagar este comentário?');
    if (!confirmDelete) return;

    try {
      await db
        .collection('feed_posts')
        .doc(postId)
        .collection('comments')
        .doc(comment.id)
        .delete();

      setComments(prev => prev.filter(c => c.id !== comment.id));
      setMenuOpenId(null);
    } catch (error) {
      console.error('Erro ao apagar comentário:', error);
    }
  };

  const startEditComment = (comment: CommentType) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
    setMenuOpenId(null);
  };

  const saveEditedComment = async (comment: CommentType) => {
    const text = editingText.trim();
    if (!text) return;

    try {
      await db
        .collection('feed_posts')
        .doc(postId)
        .collection('comments')
        .doc(comment.id)
        .update({ text, updatedAt: new Date() });

      setComments(prev => prev.map(c => (c.id === comment.id ? { ...c, text } : c)));
      setEditingCommentId(null);
      setEditingText('');
    } catch (error) {
      console.error('Erro ao editar comentário:', error);
    }
  };

useEffect(() => {
  setLoading(true);
  const unsubscribe = db
    .collection('feed_posts')
    .doc(postId)
    .collection('comments')
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      (snapshot) => {
        const commentsData: CommentType[] = snapshot.docs.map((doc) => {
          const data = doc.data() as CommentType;
          return {
            id: doc.id,
            text: data.text,
            userId: data.userId,
            userName: data.userName,
            createdAt: data.createdAt,
            userPhoto: data.userPhoto || null,
            likesCount: Number(data.likesCount || 0),
            linkedPlayerId: data.linkedPlayerId || null,
          };
        });

        commentsData.sort((a, b) => {
          const likesDiff = Number(b.likesCount || 0) - Number(a.likesCount || 0);
          if (likesDiff !== 0) return likesDiff;

          const aDate = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
          const bDate = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
          return bDate - aDate;
        });

        setComments(commentsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching comments:', error);
        setLoading(false);
      }
    );

  return () => unsubscribe();
}, [postId]);

useEffect(() => {
  const pendingUserIds = Array.from(new Set(comments.map((comment) => comment.userId))).filter((userId) => {
    return authorPlayerByUserId[userId] === undefined;
  });

  if (!pendingUserIds.length) return;

  const resolveAuthors = async () => {
    const entries = await Promise.all(
      pendingUserIds.map(async (userId) => {
        try {
          const userDoc = await db.collection('usuarios').doc(userId).get();
          const linkedPlayerId = userDoc.exists ? (userDoc.data()?.linkedPlayerId as string | undefined) : undefined;
          return [userId, linkedPlayerId || null] as const;
        } catch {
          return [userId, null] as const;
        }
      })
    );

    setAuthorPlayerByUserId((prev) => {
      const next = { ...prev };
      entries.forEach(([userId, playerId]) => {
        next[userId] = playerId;
      });
      return next;
    });
  };

  resolveAuthors();
}, [comments, authorPlayerByUserId]);

useEffect(() => {
  onChangeCountRef.current?.(comments.length);
}, [comments.length]);

  const isLight = variant === 'light';

  if (loading)
    return <div className={isLight ? 'py-2 text-sm text-slate-500 dark:text-slate-400' : 'py-2 text-sm text-slate-400'}>Carregando comentários...</div>;

  return (
    <div className="flex flex-col gap-1">
      <AnimatePresence>
{comments.map((comment) => {
  const commentPlayerId = comment.linkedPlayerId || authorPlayerByUserId[comment.userId] || null;
  const isPlayerClickable = Boolean(commentPlayerId && onOpenPlayer);

  return (
  <motion.div
    key={comment.id}
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -5 }}
    transition={{ duration: 0.2 }}
    className={isLight ? 'relative flex items-start gap-2 border-b border-slate-200/80 py-2 dark:border-slate-700/80' : 'relative flex items-start gap-2 border-b border-white/10 py-2'}
  >
    <button
      type="button"
      onClick={() => {
        if (commentPlayerId) onOpenPlayer?.(commentPlayerId);
      }}
      disabled={!isPlayerClickable}
      className="rounded-full"
    >
      <img
        src={
          comment.userPhoto ||
          `https://ui-avatars.com/api/?name=${comment.userName}`
        }
        className="mt-0.5 h-8 w-8 rounded-full object-cover"
      />
    </button>
    <div className="flex flex-1 flex-col pr-8">
      <button
        type="button"
        onClick={() => {
          if (commentPlayerId) onOpenPlayer?.(commentPlayerId);
        }}
        className={
          isPlayerClickable
            ? isLight
              ? 'w-fit text-left text-slate-800 text-sm font-semibold hover:underline dark:text-slate-100'
              : 'w-fit text-left text-white text-sm font-semibold hover:underline'
            : isLight
              ? 'w-fit text-left text-slate-800 text-sm font-semibold cursor-default dark:text-slate-100'
              : 'w-fit text-left text-white text-sm font-semibold cursor-default'
        }
        disabled={!isPlayerClickable}
      >
        {comment.userName}
      </button>
      {editingCommentId === comment.id ? (
        <div className="mt-1 flex items-center gap-2">
          <input
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            className={
              isLight
                ? 'flex-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100'
                : 'flex-1 rounded-full border border-white/20 bg-[#0c1e3a] px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500'
            }
          />
          <button
            onClick={() => saveEditedComment(comment)}
            className={isLight ? 'text-xs text-emerald-600 hover:text-emerald-500' : 'text-xs text-green-400 hover:text-green-300'}
          >
            Salvar
          </button>
          <button
            onClick={() => { setEditingCommentId(null); setEditingText(''); }}
            className={isLight ? 'text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300' : 'text-xs text-slate-400 hover:text-slate-300'}
          >
            Cancelar
          </button>
        </div>
      ) : (
        <div className="mt-0.5">
          <span className={isLight ? 'text-slate-700 text-sm dark:text-slate-300' : 'text-slate-300 text-sm'}>{comment.text}</span>
          <div className="mt-1">
            <CommentLikeButton
              postId={postId}
              commentId={comment.id}
              userId={user?.uid}
              variant={variant}
            />
          </div>
        </div>
      )}
    </div>

    {canManageComment(comment) && (
      <div className="absolute right-1 top-1">
        <button
          type="button"
          onClick={() => setMenuOpenId((prev) => (prev === comment.id ? null : comment.id))}
          className={isLight ? 'rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white' : 'rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white'}
        >
          <LucideEllipsisVertical size={16} />
        </button>

        {menuOpenId === comment.id && (
          <div className={isLight ? 'absolute right-0 mt-1 w-28 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#101a2d]' : 'absolute right-0 mt-1 w-28 overflow-hidden rounded-lg border border-white/10 bg-[#101a2d] shadow-xl'}>
            <button
              type="button"
              onClick={() => startEditComment(comment)}
              className={isLight ? 'block w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10' : 'block w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-white/10'}
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => handleDeleteComment(comment)}
              className="block w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-white/10"
            >
              Apagar
            </button>
          </div>
        )}
      </div>
    )}
  </motion.div>
  );
})}
      </AnimatePresence>

      {/* Barra de novo comentário */}
      {user && (
        <div className="mt-2 flex items-center gap-2 pr-1">
          <img
            src={
              user.foto ||
              `https://ui-avatars.com/api/?name=${user.apelido || user.nome || 'Usuario'}`
            }
            alt="Sua foto"
            className="h-8 w-8 rounded-full object-cover"
          />
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escreva um comentário..."
            className={
              isLight
                ? 'flex-1 bg-white border border-slate-300 rounded-full px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 transition dark:bg-slate-900 dark:border-white/20 dark:text-white'
                : 'flex-1 bg-[#0c1e3a] border border-white/20 rounded-full px-4 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition'
            }
          />
<button
  onClick={handleSend}
  className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-500 hover:bg-blue-500 text-white transition"
>
  <FaPaperPlane size={16} className="inline-block align-middle" />
</button>
        </div>
      )}
    </div>
  );
};