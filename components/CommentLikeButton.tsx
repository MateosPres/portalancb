import React, { useEffect, useState } from 'react';
import firebase, { db } from '../services/firebase';
import { Heart } from 'lucide-react';

interface CommentLikeButtonProps {
    postId: string;
    commentId: string;
    userId?: string;
    variant?: 'dark' | 'light';
}

export const CommentLikeButton: React.FC<CommentLikeButtonProps> = ({ postId, commentId, userId, variant = 'dark' }) => {
    const [liked, setLiked] = useState(false);
    const [count, setCount] = useState(0);

    useEffect(() => {
        const commentRef = db
            .collection('feed_posts')
            .doc(postId)
            .collection('comments')
            .doc(commentId);

        const unsubscribe = commentRef.onSnapshot((snap) => {
            const data = snap.data() as { likesCount?: number } | undefined;
            const nextCount = Number(data?.likesCount || 0);
            setCount(nextCount);
        });

        return () => unsubscribe();
    }, [postId, commentId]);

    useEffect(() => {
        if (!userId) {
            setLiked(false);
            return;
        }

        const likeRef = db
            .collection('feed_posts')
            .doc(postId)
            .collection('comments')
            .doc(commentId)
            .collection('likes')
            .doc(userId);

        const unsubscribe = likeRef.onSnapshot((snap) => {
            setLiked(snap.exists);
        });

        return () => unsubscribe();
    }, [postId, commentId, userId]);

    const toggleLike = async () => {
        if (!userId) return;

        const commentRef = db
            .collection('feed_posts')
            .doc(postId)
            .collection('comments')
            .doc(commentId);

        const likeRef = commentRef.collection('likes').doc(userId);

        await db.runTransaction(async (transaction) => {
            const likeDoc = await transaction.get(likeRef);
            if (likeDoc.exists) {
                transaction.delete(likeRef);
                transaction.update(commentRef, {
                    likesCount: firebase.firestore.FieldValue.increment(-1),
                });
                return;
            }

            transaction.set(likeRef, {
                userId,
                createdAt: new Date(),
            });
            transaction.update(commentRef, {
                likesCount: firebase.firestore.FieldValue.increment(1),
            });
        });
    };

    return (
        <button
            onClick={toggleLike}
            className={
                variant === 'light'
                    ? 'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
                    : 'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-slate-300 transition hover:bg-white/5'
            }
            title="Curtir comentário"
        >
            <Heart
                size={15}
                className={liked ? 'text-red-500' : variant === 'light' ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400'}
                fill={liked ? 'currentColor' : 'none'}
            />
            <span className={variant === 'light' ? 'text-xs text-slate-600 dark:text-slate-300' : 'text-xs text-slate-300'}>{count}</span>
        </button>
    );
};