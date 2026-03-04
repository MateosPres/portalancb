import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { LucideArrowLeft, LucideHeart, LucideExternalLink, LucideStar, LucideUsers, LucideImages, LucideUpload, LucideLoader2, LucideChevronLeft, LucideChevronRight, LucideTrash2 } from 'lucide-react';
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

export const ApoiadoresView: React.FC<ApoiadoresViewProps> = ({ onBack, userProfile }) => {
    const GALERIA_MAX_ITENS_VISIVEIS = 3;

    const [apoiadores, setApoiadores] = useState<Apoiador[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDark, setIsDark] = useState(false);
    const [galeria, setGaleria] = useState<GaleriaItem[]>([]);
    const [loadingGaleria, setLoadingGaleria] = useState(true);
    const [showGaleriaModal, setShowGaleriaModal] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isSlideAnimating, setIsSlideAnimating] = useState(true);
    const [galeriaItensVisiveis, setGaleriaItensVisiveis] = useState(() => {
        if (typeof window === 'undefined') return GALERIA_MAX_ITENS_VISIVEIS;
        if (window.innerWidth < 640) return 1;
        if (window.innerWidth < 1024) return 2;
        return GALERIA_MAX_ITENS_VISIVEIS;
    });
    const [isUploadingImagem, setIsUploadingImagem] = useState(false);
    const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);

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
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setGaleriaItensVisiveis(1);
                return;
            }
            if (window.innerWidth < 1024) {
                setGaleriaItensVisiveis(2);
                return;
            }
            setGaleriaItensVisiveis(GALERIA_MAX_ITENS_VISIVEIS);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const canSlideGaleria = galeria.length > galeriaItensVisiveis;

    useEffect(() => {
        if (!canSlideGaleria) {
            setCurrentSlide(0);
            setIsSlideAnimating(false);
            return;
        }

        setIsSlideAnimating(true);

        if (currentSlide > galeria.length) {
            setCurrentSlide(0);
        }
        if (currentSlide < -1) {
            setCurrentSlide(galeria.length - 1);
        }
    }, [canSlideGaleria, galeria.length, currentSlide]);

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
            setCurrentSlide(0);

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

    const goToNextSlide = () => {
        if (!canSlideGaleria) return;
        setIsSlideAnimating(true);
        setCurrentSlide(prev => prev + 1);
    };

    const goToPrevSlide = () => {
        if (!canSlideGaleria) return;
        setIsSlideAnimating(true);
        setCurrentSlide(prev => prev - 1);
    };

    useEffect(() => {
        if (!canSlideGaleria) return;

        const interval = window.setInterval(() => {
            setIsSlideAnimating(true);
            setCurrentSlide(prev => prev + 1);
        }, 4500);

        return () => window.clearInterval(interval);
    }, [canSlideGaleria]);

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
    const galeriaTrack = canSlideGaleria
        ? [galeria[galeria.length - 1], ...galeria, galeria[0]]
        : galeria;

    const slideTrackIndex = canSlideGaleria ? currentSlide + 1 : 0;
    const larguraItemPercentual = 100 / Math.max(1, Math.min(galeriaItensVisiveis, GALERIA_MAX_ITENS_VISIVEIS));

    const handleSlideTransitionEnd = () => {
        if (!canSlideGaleria) return;

        if (currentSlide >= galeria.length) {
            setIsSlideAnimating(false);
            setCurrentSlide(0);
            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => setIsSlideAnimating(true));
            });
            return;
        }

        if (currentSlide < 0) {
            setIsSlideAnimating(false);
            setCurrentSlide(galeria.length - 1);
            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => setIsSlideAnimating(true));
            });
        }
    };

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
                                <Button size="sm" variant="secondary" onClick={() => setShowGaleriaModal(true)} className="!text-xs !py-1.5 !px-3">
                                    Ver tudo
                                </Button>
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
                            <div className="relative rounded-xl border border-white/15 bg-black/20 p-3 md:p-4">
                                <div className="flex items-center gap-2 md:gap-3">
                                    {canSlideGaleria && (
                                        <button
                                            onClick={goToPrevSlide}
                                            className="shrink-0 p-2 rounded-full bg-black/45 text-white hover:bg-black/65 transition-colors"
                                            title="Miniaturas anteriores"
                                        >
                                            <LucideChevronLeft size={18} />
                                        </button>
                                    )}

                                    <div className="flex-1 overflow-hidden">
                                        <div
                                            className={`flex ${isSlideAnimating ? 'transition-transform duration-500 ease-in-out' : ''}`}
                                            style={{ transform: `translateX(-${slideTrackIndex * larguraItemPercentual}%)` }}
                                            onTransitionEnd={handleSlideTransitionEnd}
                                        >
                                            {galeriaTrack.map((item, trackIndex) => (
                                                <div
                                                    key={`${item.id}-${trackIndex}`}
                                                    className="shrink-0 box-border px-1.5 md:px-2"
                                                    style={{ width: `${larguraItemPercentual}%` }}
                                                >
                                                    <div className="relative group rounded-lg overflow-hidden border border-white/20 bg-black/30 hover:border-ancb-orange transition-all">
                                                        <button
                                                            onClick={() => setExpandedImageUrl(item.imageUrl)}
                                                            className="w-full block leading-none p-0 m-0 border-0 bg-transparent align-top"
                                                            title="Clique para ampliar"
                                                        >
                                                            <img
                                                                src={item.imageUrl}
                                                                alt="Miniatura da galeria"
                                                                className="block w-full h-32 md:h-40 lg:h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                        </button>
                                                        {isAdmin && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteGaleriaItem(item);
                                                                }}
                                                                className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
                                                                title="Excluir foto"
                                                            >
                                                                <LucideTrash2 size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {canSlideGaleria && (
                                        <button
                                            onClick={goToNextSlide}
                                            className="shrink-0 p-2 rounded-full bg-black/45 text-white hover:bg-black/65 transition-colors"
                                            title="Próximas miniaturas"
                                        >
                                            <LucideChevronRight size={18} />
                                        </button>
                                    )}
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

            {/* Wall de logos — sem caixinhas */}
            {!loading && todosParaExibir.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-8">
                        <LucideHeart size={14} className="text-ancb-orange" fill="currentColor" />
                        <h3 className="text-sm font-black text-ancb-black dark:text-white uppercase tracking-[0.12em]">
                            Nossos Apoiadores
                        </h3>
                    </div>

                    <div className="flex flex-wrap gap-x-12 gap-y-10 items-center justify-start">
                        {todosParaExibir.map(apoiador => (
                            <div
                                key={apoiador.id}
                                onClick={apoiador.site ? () => window.open(apoiador.site, '_blank') : undefined}
                                className={`flex flex-col items-center gap-2.5 group ${apoiador.site ? 'cursor-pointer' : ''}`}
                            >
                                {apoiador.destaque && (
                                    <span className="text-[8px] font-black text-yellow-500 uppercase tracking-widest flex items-center gap-0.5">
                                        <LucideStar size={8} fill="currentColor" /> destaque
                                    </span>
                                )}

                                <img
                                    src={apoiador.logoBase64}
                                    alt={apoiador.nome}
                                    className={`object-contain transition-all duration-300 group-hover:scale-105 ${apoiador.destaque ? 'h-16' : 'h-12'}`}
                                    style={{ ...logoStyle, opacity: logoOpacity }}
                                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                    onMouseLeave={e => (e.currentTarget.style.opacity = logoOpacity)}
                                />

                                <span className={`font-semibold uppercase tracking-wider text-center leading-tight max-w-[90px] ${apoiador.destaque ? 'text-[10px]' : 'text-[9px]'} text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors`}>
                                    {apoiador.nome}
                                </span>

                                {apoiador.site && (
                                    <span className="text-[8px] font-bold text-ancb-blue dark:text-blue-400 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity -mt-1">
                                        <LucideExternalLink size={8} /> visitar
                                    </span>
                                )}
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
                isOpen={showGaleriaModal}
                onClose={() => setShowGaleriaModal(false)}
                title="Galeria Completa"
                maxWidthClassName="max-w-6xl"
            >
                {loadingGaleria ? (
                    <div className="flex justify-center py-10"><LucideLoader2 className="animate-spin text-ancb-blue" /></div>
                ) : galeria.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-10">Nenhuma foto cadastrada ainda.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                        {galeria.map((item) => (
                            <div
                                key={item.id}
                                className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40 hover:border-ancb-orange transition-colors text-left"
                            >
                                <button onClick={() => setExpandedImageUrl(item.imageUrl)} className="w-full text-left block leading-none p-0 m-0 border-0 bg-transparent align-top">
                                    <img src={item.imageUrl} alt="Foto da galeria" className="w-full h-48 md:h-52 object-cover" />
                                </button>
                                {isAdmin && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteGaleriaItem(item);
                                        }}
                                        className="absolute top-2 right-2 p-2 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
                                        title="Excluir foto"
                                    >
                                        <LucideTrash2 size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Modal>

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
