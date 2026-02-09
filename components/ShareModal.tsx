
import React, { useState, useRef, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { StoryRenderer, StoryType } from './StoryTemplates';
import { toPng } from 'html-to-image';
import { LucideDownload, LucideShare2, LucideLoader2 } from 'lucide-react';
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
        scorers?: { player: Player, points: number }[]; // Added scorers prop
        stats?: any;
    };
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, data }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const hiddenRef = useRef<HTMLDivElement>(null);

    // Function to generate image
    const generateImage = async () => {
        if (!hiddenRef.current) return;
        setLoading(true);
        try {
            // Need a small delay to ensure rendering, especially images
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const dataUrl = await toPng(hiddenRef.current, {
                cacheBust: true,
                quality: 0.95,
                pixelRatio: 1, // 1080x1920 is already high res, 1x is fine
            });
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
            setPreviewUrl(null); // Reset
            // Auto generate after a slight delay to ensure the hidden DOM is mounted
            setTimeout(generateImage, 500);
        }
    }, [isOpen]);

    const handleDownload = () => {
        if (!previewUrl) return;
        const link = document.createElement('a');
        link.download = `ancb-story-${Date.now()}.png`;
        link.href = previewUrl;
        link.click();
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Compartilhar Story">
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                    {loading ? (
                        <div className="text-center py-10">
                            <LucideLoader2 size={48} className="animate-spin text-ancb-orange mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">Gerando arte...</p>
                        </div>
                    ) : previewUrl ? (
                        <div className="w-full flex flex-col items-center animate-fadeIn">
                            <p className="text-xs text-gray-500 mb-4 text-center">Prévia (1080x1920px)</p>
                            <div className="relative w-full max-w-[250px] aspect-[9/16] rounded-xl overflow-hidden shadow-2xl border-4 border-gray-900 bg-gray-100 mb-6">
                                <img src={previewUrl} alt="Story Preview" className="w-full h-full object-contain" />
                            </div>
                            <Button onClick={handleDownload} className="w-full max-w-xs !bg-green-600 hover:!bg-green-700 text-white font-bold py-3 text-lg shadow-lg">
                                <LucideDownload size={20} /> Baixar Imagem
                            </Button>
                        </div>
                    ) : (
                        <p className="text-red-500">Erro ao carregar prévia.</p>
                    )}
                </div>
            </Modal>

            {/* HIDDEN RENDERER - Positioned way off-screen but rendered */}
            {isOpen && (
                <div style={{ position: 'fixed', top: 0, left: -9999, zIndex: -1, opacity: 1 }}>
                    <StoryRenderer 
                        ref={hiddenRef} 
                        type={data.type} 
                        event={data.event} 
                        game={data.game} 
                        players={data.players} 
                        teams={data.teams}
                        scorers={data.scorers} // Passed scorers here
                        stats={data.stats}
                    />
                </div>
            )}
        </>
    );
};
