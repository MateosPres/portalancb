import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { Heart } from "lucide-react";

interface LikeButtonProps {
    postId: string;
    userId?: string;
}

export const LikeButton: React.FC<LikeButtonProps> = ({ postId, userId }) => {
    const [liked, setLiked] = useState(false);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!userId) return;

        const ref = db
            .collection("feed_posts")
            .doc(postId)
            .collection("likes");

        const unsubscribe = ref.onSnapshot((snap) => {
            setCount(snap.size);
            setLiked(snap.docs.some(doc => doc.id === userId));
        });

        return () => unsubscribe();
    }, [postId, userId]);

    const toggleLike = async () => {
        if (!userId) return;

        const ref = db
            .collection("feed_posts")
            .doc(postId)
            .collection("likes")
            .doc(userId);

        if (liked) {
            await ref.delete();
        } else {
            await ref.set({
                userId,
                createdAt: new Date()
            });
        }
    };

    return (
        <button onClick={toggleLike} className="flex items-center gap-1">
            <Heart
                size={22}
                className={liked ? "text-red-500" : "text-slate-300"}
                fill={liked ? "currentColor" : "none"}
            />
            <span className="text-xs text-slate-400">{count}</span>
        </button>
    );
};