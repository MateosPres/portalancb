import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane } from 'react-icons/fa';
import { LucideEllipsisVertical } from 'lucide-react';

export interface CommentType {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: any;
  userPhoto?: string | null;
}

interface CommentsProps {
  postId: string;
  user: UserProfile | null;
  onChangeCount?: (count: number) => void; // <--- aqui
}

export const Comments: React.FC<CommentsProps> = ({ postId, user, onChangeCount }) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const getComments = async () => {
    try {
      const snapshot = await db
        .collection('feed_posts')
        .doc(postId)
        .collection('comments')
        .orderBy('createdAt', 'asc')
        .get();

      const commentsData: CommentType[] = snapshot.docs.map(doc => {
        const data = doc.data() as CommentType;
        return {
          id: doc.id,
          text: data.text,
          userId: data.userId,
          userName: data.userName,
          createdAt: data.createdAt,
          userPhoto: data.userPhoto || null,
        };
      });

      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newComment.trim() || !user) return;

    const commentData: Omit<CommentType, 'id'> = {
      text: newComment,
      userId: user.uid,
      userName: user.apelido || user.nome || 'Usuário',
      createdAt: new Date(),
      userPhoto: user.foto || null,
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
  getComments();
}, [postId]);

useEffect(() => {
  if (onChangeCount) onChangeCount(comments.length);
}, [comments, onChangeCount]);

  if (loading)
    return <div className="py-2 text-sm text-slate-400">Carregando comentários...</div>;

  return (
    <div className="flex flex-col gap-1">
      <AnimatePresence>
{comments.map((comment) => (
  <motion.div
    key={comment.id}
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -5 }}
    transition={{ duration: 0.2 }}
    className="relative flex items-start gap-2 border-b border-white/10 py-2"
  >
    <img
      src={
        comment.userPhoto ||
        `https://ui-avatars.com/api/?name=${comment.userName}`
      }
      className="mt-0.5 h-8 w-8 rounded-full object-cover"
    />
    <div className="flex flex-1 flex-col pr-8">
      <span className="text-white text-sm font-semibold">{comment.userName}</span>
      {editingCommentId === comment.id ? (
        <div className="mt-1 flex items-center gap-2">
          <input
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            className="flex-1 rounded-full border border-white/20 bg-[#0c1e3a] px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={() => saveEditedComment(comment)}
            className="text-xs text-green-400 hover:text-green-300"
          >
            Salvar
          </button>
          <button
            onClick={() => { setEditingCommentId(null); setEditingText(''); }}
            className="text-xs text-slate-400 hover:text-slate-300"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <span className="text-slate-300 text-sm">{comment.text}</span>
      )}
    </div>

    {canManageComment(comment) && (
      <div className="absolute right-1 top-1">
        <button
          type="button"
          onClick={() => setMenuOpenId((prev) => (prev === comment.id ? null : comment.id))}
          className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <LucideEllipsisVertical size={16} />
        </button>

        {menuOpenId === comment.id && (
          <div className="absolute right-0 mt-1 w-28 overflow-hidden rounded-lg border border-white/10 bg-[#101a2d] shadow-xl">
            <button
              type="button"
              onClick={() => startEditComment(comment)}
              className="block w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-white/10"
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
))}
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
            className="flex-1 bg-[#0c1e3a] border border-white/20 rounded-full px-4 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition"
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