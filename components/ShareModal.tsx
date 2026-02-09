
import React, { useState, useRef, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { StoryRenderer, StoryType } from './StoryTemplates';
import { toPng } from 'html-to-image';
import { LucideDownload, LucideShare2, LucideLoader2, LucideSave } from 'lucide-react';
import { Evento, Jogo, Player, Time } from '../types';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        type: StoryType;
        event?: Evento;
        game?: Jogo;
        players?: Player[];
        teams?: Time[];
        scorers?: { player: Player, points: number }[];
        stats?: any;
    };
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, data }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const hiddenRef = useRef<HTMLDivElement>(null);

    // Helper: Convert DataURI to Blob for Web Share API
    const dataURItoBlob = (dataURI: string) => {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    };

    // Helper: Preload images to ensure they are ready for Canvas
    const preloadImages = async (element: HTMLElement) => {
        const images = Array.from(element.querySelectorAll('img'));
        const promises = images.map((img) => {
            if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
            return new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve; // Resolve anyway to avoid blocking
            });
        });
        await Promise.all(promises);
    };

    // Function to generate image
    const generateImage = async () => {
        if (!hiddenRef.current) return;
        setLoading(true);
        
        try {
            // 1. Wait for DOM to settle
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 2. Explicitly wait for all images inside the template to load
            await preloadImages(hiddenRef.current);

            const config = {
                cacheBust: true,
                skipAutoScale: true,
                pixelRatio: 1,
                width: 1080,
                height: 1920,
                style: {
                    transform: 'none', 
                    transformOrigin: 'top left'
                }
            };

            // 3. WARM UP RENDER (Critical for Safari/iOS)
            // The first call forces the browser to decode images and layout the canvas layer.
            // We discard this result as it often has missing assets on mobile.
            try {
                await toPng(hiddenRef.current, config);
            } catch (e) {
                console.warn("Warmup render failed (expected on some devices), proceeding to final render...");
            }

            // 4. Short buffer after warmup
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 5. Final Render
            const dataUrl = await toPng(hiddenRef.current, config);
            setPreviewUrl(dataUrl);

        } catch (error) {
            console.error("Error generating image:", error);
            alert("Erro ao gerar imagem. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setPreviewUrl(null); 
            // Trigger generation sequence
            setTimeout(generateImage, 100);
        }
    }, [isOpen]);

    const handleShareOrDownload = async () => {
        if (!previewUrl) return;

        try {
            // 1. Try Native Web Share API (Best for iOS/Android to Save to Gallery)
            if (navigator.canShare && navigator.share) {
                const blob = dataURItoBlob(previewUrl);
                const file = new File([blob], `ancb-story-${Date.now()}.png`, { type: 'image/png' });
                
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'Story ANCB',
                        text: 'Confira este resultado no Portal ANCB!'
                    });
                    return; // Success
                }
            }

            // 2. Fallback: Classic Download Link (PC)
            const link = document.createElement('a');
            link.download = `ancb-story-${Date.now()}.png`;
            link.href = previewUrl;
            link.click();

        } catch (error: any) {
            console.error("Share failed:", error);
            // If user cancelled share, do nothing. If error, try download fallback.
            if (error.name !== 'AbortError') {
                const link = document.createElement('a');
                link.download = `ancb-story-${Date.now()}.png`;
                link.href = previewUrl;
                link.click();
            }
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Compartilhar Story">
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                    {loading ? (
                        <div className="text-center py-10">
                            <LucideLoader2 size={48} className="animate-spin text-ancb-orange mx-auto mb-4" />
                            <p className="text-gray-500 font-medium animate-pulse">Gerando arte em alta definição...</p>
                            <p className="text-xs text-gray-400 mt-2">Aguarde, estamos renderizando os detalhes...</p>
                        </div>
                    ) : previewUrl ? (
                        <div className="w-full flex flex-col items-center animate-fadeIn">
                            <p className="text-xs text-gray-500 mb-4 text-center">Prévia (1080x1920px)</p>
                            <div className="relative w-full max-w-[200px] aspect-[9/16] rounded-xl overflow-hidden shadow-2xl border-4 border-gray-900 bg-gray-100 mb-6">
                                <img src={previewUrl} alt="Story Preview" className="w-full h-full object-contain" />
                            </div>
                            
                            <div className="flex flex-col gap-3 w-full max-w-xs">
                                <Button onClick={handleShareOrDownload} className="w-full !bg-green-600 hover:!bg-green-700 text-white font-bold py-3 text-lg shadow-lg flex items-center justify-center gap-2">
                                    <LucideShare2 size={20} /> Salvar / Compartilhar
                                </Button>
                                <p className="text-[10px] text-gray-400 text-center leading-tight px-4">
                                    No iPhone, selecione <strong>"Salvar Imagem"</strong> nas opções de compartilhamento.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-red-500">Erro ao carregar prévia.</p>
                    )}
                </div>
            </Modal>

            {/* HIDDEN RENDERER - Positioned off-screen but rigidly defined size */}
            {isOpen && (
                <div 
                    style={{ 
                        position: 'fixed', 
                        top: 0, 
                        left: 0, // Using 0,0 with z-index ensures it's in the viewport "area" but behind everything
                        zIndex: -50, 
                        opacity: 0, // Visibility: hidden sometimes prevents rendering in some browsers, opacity 0 is safer
                        pointerEvents: 'none',
                        width: '1080px',
                        height: '1920px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start'
                    }}
                >
                    <div style={{ width: '1080px', height: '1920px', flexShrink: 0 }}>
                        <StoryRenderer 
                            ref={hiddenRef} 
                            type={data.type} 
                            event={data.event} 
                            game={data.game} 
                            players={data.players} 
                            teams={data.teams}
                            scorers={data.scorers} 
                            stats={data.stats}
                        />
                    </div>
                </div>
            )}
        </>
    );
};
