interface ImgBBUploadResponse {
  data?: {
    url?: string;
    delete_url?: string;
    id?: string;
  };
  success?: boolean;
  status?: number;
  error?: {
    message?: string;
  };
}

const IMGBB_WORKER_URL =
  import.meta.env.VITE_IMGBB_WORKER_URL?.trim() ||
  'https://proxy-imgbb-ancb.mateospres.workers.dev';

export interface ImgBBUploadResult {
  imageUrl: string;
  deleteUrl?: string;
}

export const uploadImageToImgBB = async (file: File): Promise<ImgBBUploadResult> => {
  if (!IMGBB_WORKER_URL || IMGBB_WORKER_URL.includes('seu-usuario.workers.dev')) {
    throw new Error('URL do Worker ImgBB nao configurada corretamente.');
  }

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(IMGBB_WORKER_URL, {
    method: 'POST',
    body: formData,
  });

  const result: ImgBBUploadResponse = await response.json();

  if (!response.ok || !result?.success || !result?.data?.url) {
    throw new Error(result?.error?.message || 'Falha ao enviar imagem para o ImgBB.');
  }

  return {
    imageUrl: result.data.url,
    deleteUrl: result.data.delete_url,
  };
};
