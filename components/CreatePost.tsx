import React, { useEffect, useMemo, useState } from 'react';
import imageCompression from 'browser-image-compression';
import firebase, { db } from '../services/firebase';
import { Button } from './Button';
import { Modal } from './Modal';
import { LucideUpload, LucideLoader2, LucideTrash2, LucideLink2 } from 'lucide-react';
import { UserProfile } from '../types';
import { FeedPost } from '../types';

interface CreatePostProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onPostCreated?: (post: FeedPost) => void;
}

interface ImgBBUploadResponse {
  data: {
    url: string;
    delete_url?: string;
    id?: string;
  };
  success: boolean;
  status: number;
}

// URL do Worker já funcionando como no ApoiadoresView
const IMGBB_WORKER_URL =
  import.meta.env.VITE_IMGBB_WORKER_URL?.trim() ||
  'https://proxy-imgbb-ancb.mateospres.workers.dev';

export const CreatePost: React.FC<CreatePostProps> = ({
  isOpen,
  onClose,
  userProfile,
  onPostCreated,
}) => {
  const [text, setText] = useState('');
  const [linkVideo, setLinkVideo] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showVideoInput, setShowVideoInput] = useState(false);

  const canPost = useMemo(
    () => userProfile?.role === 'admin' || userProfile?.role === 'super-admin',
    [userProfile]
  );

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  const uploadImageToImgBB = async (file: File): Promise<{ imageUrl: string; deleteUrl?: string }> => {
    if (!IMGBB_WORKER_URL || IMGBB_WORKER_URL.includes('seu-usuario.workers.dev')) {
      throw new Error('URL do Worker não configurada corretamente.');
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(IMGBB_WORKER_URL, {
      method: 'POST',
      body: formData,
    });

    const result: ImgBBUploadResponse = await response.json();

    if (!response.ok || !result.success || !result.data?.url) {
      throw new Error('Falha ao enviar imagem para o ImgBB.');
    }

    return {
      imageUrl: result.data.url,
      deleteUrl: result.data.delete_url,
    };
  };

  const isValidYoutubeUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace('www.', '').toLowerCase();
      return host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be';
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!userProfile) return alert('Usuário não autenticado.');
    if (!canPost) return alert('Somente admins e super-admins podem postar.');
    if (!text.trim()) return alert('Digite o texto do post.');
    if (linkVideo.trim() && !isValidYoutubeUrl(linkVideo.trim())) {
      return alert('Use um link válido do YouTube (youtube.com ou youtu.be).');
    }

    setIsUploading(true);
    try {
      const uploadedImages: string[] = [];
      const trimmedVideoLink = linkVideo.trim();

      if (imageFiles.length) {
        const uploads = imageFiles.map(async (imageFile) => {
          const compressedFile = await imageCompression(imageFile, {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          });
          const { imageUrl } = await uploadImageToImgBB(compressedFile);
          return imageUrl;
        });
        uploadedImages.push(...(await Promise.all(uploads)));
      }

      const contentPayload: FeedPost['content'] = {
        text: text.trim(),
        resumo: text.trim(),
      };

      if (trimmedVideoLink) {
        contentPayload.link_video = trimmedVideoLink;
      }

      const postData: Partial<FeedPost> = {
        author_id: userProfile.uid,
        source: 'manual',
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        image_url: uploadedImages[0] || null,
        images: uploadedImages,
        content: contentPayload,
      };

      const docRef = await db.collection('feed_posts').add(postData);
      const newPost: FeedPost = { id: docRef.id, ...postData } as FeedPost;

      onPostCreated?.(newPost);
      onClose();
      setText('');
      setLinkVideo('');
      setShowVideoInput(false);
      setImageFiles([]);
      setImagePreviews([]);
    } catch (error: any) {
      alert(error?.message || 'Erro ao criar post.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      const selected = Array.from(files);
      setImageFiles(selected);
      setImagePreviews(selected.map((file) => URL.createObjectURL(file)));
    }
  };

  const removeSelectedImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo post"
      maxWidthClassName="max-w-xl"
    >
      <div className="space-y-4">
        {!canPost && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Somente admins e super-admins podem criar posts.
          </div>
        )}

        <div className="flex items-start gap-3">
          <img
            src={userProfile?.foto || `https://ui-avatars.com/api/?name=${userProfile?.apelido || userProfile?.nome || 'ANCB'}`}
            alt="Avatar"
            className="mt-1 h-10 w-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <textarea
              placeholder="O que esta acontecendo?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[130px] w-full resize-none rounded-xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-base text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {showVideoInput && (
          <input
            type="text"
            placeholder="Cole o link do YouTube"
            value={linkVideo}
            onChange={(e) => setLinkVideo(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-[#111827] px-4 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        )}

        <div className="flex items-center justify-between border-t border-slate-700 pt-3">
          <div className="flex items-center gap-2">
            <label className="inline-flex cursor-pointer items-center justify-center rounded-full p-2 text-sky-400 transition hover:bg-sky-500/10 hover:text-sky-300" title="Adicionar imagens">
              <LucideUpload size={18} />
              <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
            </label>

            <button
              type="button"
              onClick={() => setShowVideoInput((prev) => !prev)}
              className={`inline-flex items-center justify-center rounded-full p-2 transition ${showVideoInput ? 'bg-sky-500/20 text-sky-300' : 'text-sky-400 hover:bg-sky-500/10 hover:text-sky-300'}`}
              title="Adicionar link do YouTube"
            >
              <LucideLink2 size={18} />
            </button>

            {imageFiles.length > 0 && (
              <span className="text-xs text-slate-300">
                {imageFiles.length} imagem(ns)
              </span>
            )}
          </div>

          <Button onClick={handleSubmit} disabled={isUploading || !canPost} className="flex items-center gap-2 rounded-full !bg-slate-100 !px-5 !py-2 !text-black hover:!bg-white disabled:!opacity-50">
            {isUploading && <LucideLoader2 className="animate-spin" size={16} />}
            {isUploading ? 'Enviando...' : 'Postar'}
          </Button>
        </div>

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {imagePreviews.map((preview, index) => (
              <div key={`${preview}-${index}`} className="relative overflow-hidden rounded-lg border border-slate-700 bg-black/30">
                <img src={preview} alt={`Preview ${index + 1}`} className="h-28 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeSelectedImage(index)}
                  className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white"
                >
                  <LucideTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};