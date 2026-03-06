import React, { useEffect, useRef, useState } from 'react';
import { db } from '../services/firebase';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { LucideArrowLeft, LucideHeart, LucideUsers, LucideImages, LucideUpload, LucideLoader2, LucideTrash2 } from 'lucide-react';
import { UserProfile } from '../types';

interface Apoiador {
    id: string;
    nome: string;
    logoBase64: string;
    site?: string;
    descricao?: string;
    destaque?: boolean;
    ordem?: number;
}

interface ApoiadoresViewProps {
    onBack: () => void;
    userProfile?: UserProfile | null;
}

interface GaleriaItem {
    id: string;
    imageUrl: string;
    deleteUrl?: string;
    createdAt?: any;
    createdBy?: string;
}

interface ImgBBUploadResponse {
    data: {
        url: string;
        display_url?: string;
        delete_url?: string;
        id?: string;
    };
    success: boolean;
    status: number;
}

const IMGBB_WORKER_URL = ((import.meta as any).env?.VITE_IMGBB_WORKER_URL as string | undefined)?.trim() || 'https://proxy-imgbb-ancb.mateospres.workers.dev';

interface InstagramGalleryItemProps {
    item: GaleriaItem;
    isAdmin: boolean;
    onOpen: (imageUrl: string) => void;
    onDelete: (item: GaleriaItem) => void;
}

const InstagramGalleryItem: React.FC<InstagramGalleryItemProps> = ({ item, isAdmin, onOpen, onDelete }) => {
    return (
        <div className="group relative aspect-square overflow-hidden rounded-[4px] bg-slate-200 dark:bg-slate-800">
            <button
                onClick={() => onOpen(item.imageUrl)}
                className="block h-full w-full p-0 m-0 border-0 bg-transparent"
                title="Abrir imagem"
            >
                <img
                    src={item.imageUrl}
                    alt="Foto da galeria"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </button>

            {isAdmin && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item);
                    }}
                    className="absolute top-1 right-1 z-10 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
                    title="Excluir foto"
                >
                    <LucideTrash2 size={12} />
                </button>
            )}
        </div>
    );
};

export const ApoiadoresView: React.FC<ApoiadoresViewProps> = ({ onBack, userProfile }) => {
    const [apoiadores, setApoiadores] = useState<Apoiador[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDark, setIsDark] = useState(false);
    const [galeria, setGaleria] = useState<GaleriaItem[]>([]);
    const [loadingGaleria, setLoadingGaleria] = useState(true);
    const [isUploadingImagem, setIsUploadingImagem] = useState(false);
    const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);
    const [galleryViewportHeight, setGalleryViewportHeight] = useState<number | null>(null);
    const galleryGridRef = useRef<HTMLDivElement | null>(null);

    const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super-admin';

    useEffect(() => {
        const checkDark = () => setIsDark(document.documentElement.classList.contains('dark'));
        checkDark();
        const observer = new MutationObserver(checkDark);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const unsub = db.collection('apoiadores').orderBy('ordem', 'asc').onSnapshot(snap => {
            setApoiadores(snap.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data(),
                ordem: doc.data().ordem ?? 999
            } as Apoiador)));
            setLoading(false);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        const unsubGaleria = db.collection('historia_galeria').orderBy('createdAt', 'desc').onSnapshot(snap => {
            setGaleria(snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as GaleriaItem)));
            setLoadingGaleria(false);
        }, () => {
            setLoadingGaleria(false);
        });
        return () => unsubGaleria();
    }, []);

    useEffect(() => {
        const node = galleryGridRef.current;
        if (!node || typeof window === 'undefined') return;

        const updateViewportHeight = () => {
            const width = node.clientWidth;
            if (!width) return;

            const isDesktop = window.innerWidth >= 768;
            const rows = isDesktop ? 2 : 3;
            const gap = isDesktop ? 8 : 4; // gap-2 desktop | gap-1 mobile
            const cellSize = (width - (gap * 2)) / 3;
            const maxHeight = Math.floor((rows * cellSize) + ((rows - 1) * gap));
            setGalleryViewportHeight(maxHeight);
        };

        updateViewportHeight();

        const observer = new ResizeObserver(updateViewportHeight);
        observer.observe(node);
        window.addEventListener('resize', updateViewportHeight);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateViewportHeight);
        };
    }, [galeria.length]);

    const uploadImageToImgBB = async (file: File): Promise<{ imageUrl: string; deleteUrl?: string }> => {
        if (!IMGBB_WORKER_URL || IMGBB_WORKER_URL.includes('seu-usuario.workers.dev')) {
            throw new Error('URL do Worker não configurada. Defina VITE_IMGBB_WORKER_URL com sua URL real do Cloudflare Worker.');
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

    const handleUploadGaleria = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isAdmin) return;
        if (!e.target.files || !e.target.files[0]) return;

        const file = e.target.files[0];
        setIsUploadingImagem(true);
        try {
            const { imageUrl, deleteUrl } = await uploadImageToImgBB(file);
            setGaleria(prev => prev.some(item => item.imageUrl === imageUrl) ? prev : [{ id: `temp-${Date.now()}`, imageUrl, deleteUrl, createdBy: userProfile?.uid }, ...prev]);

            await db.collection('historia_galeria').add({
                imageUrl,
                deleteUrl: deleteUrl || null,
                createdBy: userProfile?.uid || null,
                createdAt: new Date(),
            });
        } catch (error: any) {
            alert(error?.message || 'Erro ao enviar imagem da galeria.');
        } finally {
            setIsUploadingImagem(false);
            e.target.value = '';
        }
    };

    const handleDeleteGaleriaItem = async (item: GaleriaItem) => {
        if (!isAdmin) return;
        if (!window.confirm('Deseja excluir esta foto da galeria?')) return;

        const previous = galeria;
        setGaleria(prev => prev.filter(photo => photo.id !== item.id));

        try {
            if (item.id && !item.id.startsWith('temp-')) {
                await db.collection('historia_galeria').doc(item.id).delete();
            }

            if (item.deleteUrl) {
                try {
                    await fetch(item.deleteUrl);
                } catch {
                    // silently ignore external delete failures
                }
            }
        } catch {
            setGaleria(previous);
            alert('Erro ao excluir foto da galeria.');
        }
    };

    // Modo escuro: logo branca | Modo claro: logo azul-escuro
    const logoStyle = isDark
        ? { filter: 'brightness(0) invert(1)' }
        : { filter: 'brightness(0) saturate(100%) invert(17%) sepia(60%) saturate(600%) hue-rotate(195deg) brightness(80%)' };

    const logoOpacity = isDark ? '0.65' : '0.6';

    // Manter a lógica de destacados, mas já ordenado por 'ordem'
    const destacados = apoiadores.filter(a => a.destaque);
    const demais = apoiadores.filter(a => !a.destaque);
    const todosParaExibir = [...destacados, ...demais];
    return (
        <div className="animate-fadeIn pb-16">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Button variant="secondary" size="sm" onClick={onBack} className="dark:text-gray-300 dark:border-gray-600">
                    <LucideArrowLeft size={18} />
                </Button>
                <h2 className="text-2xl font-bold text-ancb-black dark:text-white">Nossa História</h2>
            </div>

            {/* Hero — Nossa História */}
            <div className="rounded-2xl overflow-hidden mb-8 shadow-xl bg-[#062553]">
                {/* Foto em cima, totalmente visível */}
                <img
                    src="https://i.imgur.com/myenXDV.jpeg"
                    alt="Time ANCB-MT"
                    className="w-full h-56 object-cover object-center"
                />

                {/* Texto abaixo da foto */}
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <LucideHeart size={13} className="text-ancb-orange" fill="currentColor" />
                        <span className="text-[10px] font-black text-ancb-orange uppercase tracking-[0.15em]">Nossa História</span>
                    </div>
                    <h3 className="text-xl font-black text-white mb-3 leading-tight">
                        Basquete de Nova Canaã do Norte com paixão e comunidade
                    </h3>
                    <p className="text-white/75 text-sm leading-relaxed mb-3">
                        A ANCB (Associação Nova Canaã de Basquetebol) existe por uma razão: a paixão 
                        do técnico José Roberto Cardoso nosso eterno Professor Zé. Foi ele quem trouxe o esporte para nós, quem 
                        ensinou os fundamentos e nos fez gostar de estar em quadra. Quando ele faleceu em 2017, 
                        o basquete de Nova Canaã do Norte quase acabou junto com ele. Ficou um vazio e as 
                        atividades pararam. Mas nós, os alunos que aprenderam com o Zé, decidimos que essa 
                        história não podia terminar ali. Nos unimos com um objetivo claro: reerguer a associação.
                        Hoje, nosso trabalho é manter o esporte vivo na cidade e dar continuidade ao que ele começou.
                        Cada treino e cada jogo são a nossa forma de honrar quem nos ensinou a jogar.
                    </p>
                    <p className="text-white/65 text-sm leading-relaxed mb-5">
                        Cada quadra disputada, cada treino compartilhado, cada amizade construída é parte de 
                        uma história maior — a de transformar vidas através do esporte. E essa jornada só é 
                        possível graças ao apoio de pessoas e empresas que acreditam no nosso projeto.
                    </p>

                    <div className="pt-4 mt-5 border-t border-white/10">
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-2">
                                <LucideImages size={16} className="text-ancb-orange" />
                                <span className="text-xs font-black text-white uppercase tracking-wider">Galeria</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {isAdmin && (
                                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ancb-orange text-white text-xs font-bold cursor-pointer hover:brightness-110 transition-all">
                                        {isUploadingImagem ? <LucideLoader2 size={13} className="animate-spin" /> : <LucideUpload size={13} />}
                                        {isUploadingImagem ? 'Enviando...' : 'Upload'}
                                        <input type="file" accept="image/*" onChange={handleUploadGaleria} className="hidden" disabled={isUploadingImagem} />
                                    </label>
                                )}
                            </div>
                        </div>

                        {loadingGaleria ? (
                            <div className="flex justify-center py-6">
                                <LucideLoader2 className="animate-spin text-white/70" size={24} />
                            </div>
                        ) : galeria.length > 0 ? (
                            <div className="rounded-xl border border-white/15 bg-white/5 dark:bg-black/20 p-1.5 sm:p-2">
                                <div
                                    className="overflow-y-auto custom-scrollbar"
                                    style={galleryViewportHeight ? { maxHeight: `${galleryViewportHeight}px` } : undefined}
                                >
                                    <div ref={galleryGridRef} className="grid grid-cols-3 gap-1 md:gap-2">
                                        {galeria.map((item) => (
                                        <InstagramGalleryItem
                                            key={item.id}
                                            item={item}
                                            isAdmin={isAdmin}
                                            onOpen={setExpandedImageUrl}
                                            onDelete={handleDeleteGaleriaItem}
                                        />
                                    ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-white/60 py-4">Nenhuma foto na galeria ainda.</p>
                        )}
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                        <div className="text-center">
                            <span className="block text-xl font-black text-white">{apoiadores.length}</span>
                            <span className="text-[10px] text-white/50 uppercase font-bold tracking-wide">Apoiadores</span>
                        </div>
                        <div className="w-px h-7 bg-white/15" />
                        <div className="flex items-center gap-2">
                            <LucideUsers size={18} className="text-ancb-orange" />
                            <span className="text-[10px] text-white/50 uppercase font-bold tracking-wide">Comunidade</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid de apoiadores responsivo */}
            {!loading && todosParaExibir.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-6 md:mb-8">
                        <LucideHeart size={14} className="text-ancb-orange" fill="currentColor" />
                        <h3 className="text-sm font-black text-ancb-black dark:text-white uppercase tracking-[0.12em]">
                            Nossos Apoiadores
                        </h3>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 auto-rows-fr gap-x-2 gap-y-4 sm:gap-x-3 sm:gap-y-5 md:gap-4">
                        {todosParaExibir.map(apoiador => (
                            <div
                                key={apoiador.id}
                                onClick={apoiador.site ? () => window.open(apoiador.site, '_blank') : undefined}
                                className={`w-full h-full px-1.5 sm:px-2 py-1 flex items-center justify-center text-center group ${apoiador.site ? 'cursor-pointer' : ''}`}
                            >
                                <div className="w-[112px] sm:w-[124px] h-[70px] sm:h-[72px] flex items-center justify-center">
                                    <img
                                        src={apoiador.logoBase64}
                                        alt={apoiador.nome}
                                        className="w-full h-full object-contain transition-all duration-300 group-hover:scale-105"
                                        style={{ ...logoStyle, opacity: logoOpacity }}
                                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                        onMouseLeave={e => (e.currentTarget.style.opacity = logoOpacity)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {loading && (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ancb-blue" />
                </div>
            )}

            {/* CTA */}
            <div className="mt-6 rounded-2xl bg-gradient-to-br from-ancb-orange to-orange-600 p-6 text-white shadow-lg shadow-orange-500/20">
                <LucideHeart size={26} className="mb-3" fill="white" />
                <h3 className="text-lg font-black mb-2">Seja um Apoiador!</h3>
                <p className="text-sm text-white/85 leading-relaxed mb-4">
                    Ajude a manter o basquete vivo em Nova Canaã do Norte. Sua empresa ou apoio individual 
                    faz diferença real na vida dos atletas e na nossa comunidade.
                </p>
                <a
                    href="https://wa.me/5566996355365?text=Olá! Tenho interesse em apoiar a ANCB-MT."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-ancb-orange font-black text-sm px-5 py-3 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all"
                >
                    <LucideHeart size={15} fill="currentColor" />
                    Quero Apoiar
                </a>
            </div>

            <Modal
                isOpen={!!expandedImageUrl}
                onClose={() => setExpandedImageUrl(null)}
                title="Visualizar Foto"
                zIndex={120}
                maxWidthClassName="max-w-7xl"
                bodyClassName="p-2 md:p-3 flex justify-center"
                maxHeightClassName="max-h-[96vh]"
                scrollable={false}
            >
                {expandedImageUrl && (
                    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-transparent flex justify-center">
                        <img src={expandedImageUrl} alt="Foto ampliada" className="max-w-full max-h-[calc(96vh-7.5rem)] h-auto w-auto object-contain" />
                    </div>
                )}
            </Modal>

        </div>
    );
};
