import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { UserProfile } from "../types";

interface CommentType {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userPhoto?: string | null;
  createdAt: any;
}

interface CommentsProps {
  postId: string;
  user: UserProfile | null;
}

export const Comments: React.FC<CommentsProps> = ({ postId, user }) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [visibleCount, setVisibleCount] = useState(3);
  const [expanded, setExpanded] = useState(false);

  // Carrega comentários em tempo real
  useEffect(() => {
    const unsubscribe = db
      .collection("feed_posts")
      .doc(postId)
      .collection("comments")
      .orderBy("createdAt", "asc")
      .onSnapshot(snapshot => {
        const data: CommentType[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as CommentType));
        setComments(data);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [postId]);

  // Adicionar comentário
  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      await db
        .collection("feed_posts")
        .doc(postId)
        .collection("comments")
        .add({
          text: newComment.trim(),
          userId: user.uid,
          userName: user.apelido || user.nome || "Usuário",
          userPhoto: user.foto || null,
          createdAt: new Date(),
        });
      setNewComment("");
    } catch (err) {
      console.error("Erro ao adicionar comentário", err);
    }
  };

  // Apagar comentário
  const handleDelete = async (comment: CommentType) => {
    const canDelete =
      comment.userId === user?.uid || user?.role === "admin" || user?.role === "super-admin";

    if (!canDelete) return;

    const confirmDelete = window.confirm("Tem certeza que deseja apagar este comentário?");
    if (!confirmDelete) return;

    try {
      await db
        .collection("feed_posts")
        .doc(postId)
        .collection("comments")
        .doc(comment.id)
        .delete();
    } catch (err) {
      console.error("Erro ao deletar comentário", err);
    }
  };

  if (loading) return <p className="text-sm text-slate-400">Carregando comentários...</p>;

  const displayedComments = expanded ? comments : comments.slice(0, visibleCount);

  return (
    <div className="px-3 pb-3 space-y-3">
      {displayedComments.map(comment => {
        const canDelete =
          comment.userId === user?.uid || user?.role === "admin" || user?.role === "super-admin";

        return (
          <div key={comment.id} className="flex items-start gap-3">
            <img
              src={comment.userPhoto || "/default.png"}
              alt={comment.userName}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-sm">{comment.userName}</span>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(comment)}
                    className="text-xs text-red-500 hover:text-red-700 ml-2"
                  >
                    Apagar
                  </button>
                )}
              </div>
              <p className="text-sm text-slate-200">{comment.text}</p>
            </div>
          </div>
        );
      })}

      {/* Botão ver mais / mostrar menos */}
      {comments.length > visibleCount && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-slate-400 hover:text-white"
        >
          {expanded
            ? "Mostrar menos"
            : `Ver mais comentários (${comments.length - visibleCount} restantes)`}
        </button>
      )}

      {/* Caixa de texto */}
      {user && (
        <div className="flex items-center gap-2 mt-2">
          <input
            type="text"
            className="flex-1 px-2 py-1 rounded bg-[#0b2447] text-white text-sm"
            placeholder="Adicione um comentário..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAddComment()}
          />
          <button
            onClick={handleAddComment}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
          >
            Enviar
          </button>
        </div>
      )}
    </div>
  );
};