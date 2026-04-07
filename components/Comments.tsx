import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane } from 'react-icons/fa';

export interface CommentType {
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

    const commentData: CommentType = {
      text: newComment,
      userId: user.uid,
      userName: user.apelido || user.nome || 'Usuário',
      createdAt: new Date(),
      userPhoto: user.foto || null,
    };

    try {
      await db
        .collection('feed_posts')
        .doc(postId)
        .collection('comments')
        .add(commentData);

      setComments(prev => [...prev, commentData]);
      setNewComment('');
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
    }
  };

useEffect(() => {
  getComments();
}, [postId]);

useEffect(() => {
  if (onChangeCount) onChangeCount(comments.length);
}, [comments, onChangeCount]);

  if (loading)
    return <div className="text-slate-400 text-sm py-2">Carregando comentários...</div>;

  return (
    <div className="flex flex-col gap-1">
      <AnimatePresence>
{comments.map((comment, index) => (
  <motion.div
    key={index}
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -5 }}
    transition={{ duration: 0.2 }}
    className="flex items-start gap-2 py-2 border-b border-white/10 relative"
  >
    <img
      src={
        comment.userPhoto ||
        `https://ui-avatars.com/api/?name=${comment.userName}`
      }
      className="w-8 h-8 rounded-full object-cover mt-1"
    />
    <div className="flex flex-col flex-1">
      <span className="text-white text-sm font-semibold">{comment.userName}</span>
      <span className="text-slate-300 text-sm">{comment.text}</span>
    </div>

    {/* Botão apagar comentário visível só para admin / super-admin */}
{user && (user.role === 'admin' || user.role === 'super-admin') && (
  <button
    onClick={async () => {
      const confirmDelete = window.confirm("Tem certeza que deseja apagar este comentário?");
      if (!confirmDelete) return;

      try {
        const snapshot = await db
          .collection('feed_posts')
          .doc(postId)
          .collection('comments')
          .where('createdAt', '==', comment.createdAt)
          .get();
        
        snapshot.forEach((doc) => doc.ref.delete());
        setComments(prev => prev.filter(c => c !== comment));
      } catch (error) {
        console.error('Erro ao apagar comentário:', error);
      }
    }}
    className="absolute top-2 right-2 text-red-500 hover:text-red-400 text-xs"
  >
    ✕
  </button>
)}
  </motion.div>
))}
      </AnimatePresence>

      {/* Barra de novo comentário */}
      {user && (
        <div className="flex items-center gap-2 mt-2">
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