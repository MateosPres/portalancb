
import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Player, ReviewTagDefinition } from '../types';
import { LucideChevronRight, LucideCheckCircle2, LucideHelpCircle } from 'lucide-react';
import { db } from '../services/firebase';
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface PeerReviewQuizProps {
    isOpen: boolean;
    onClose: () => void;
    gameId: string;
    eventId: string;
    reviewerId: string;
    playersToReview: Player[]; // List of players (excluding self)
}

// --- DEFINIÇÃO DAS TAGS (ATUALIZADO PARA 5 ATRIBUTOS) ---
// Atributos: Ataque, Defesa, Força, Velocidade, Visão
const AVAILABLE_TAGS: ReviewTagDefinition[] = [
    { id: 'muralha', label: 'Muralha', emoji: '🧱', type: 'positive', description: 'Defesa intransponível', impact: { defesa: 3, forca: 2 } },
    { id: 'sniper', label: 'Sniper', emoji: '🎯', type: 'positive', description: 'Mão calibrada', impact: { ataque: 3 } },
    { id: 'garcom', label: 'Garçom', emoji: '🤝', type: 'positive', description: 'Visão de jogo e assistências', impact: { visao: 3 } },
    { id: 'flash', label: 'Flash', emoji: '⚡', type: 'positive', description: 'Velocidade e contra-ataque', impact: { velocidade: 3, ataque: 1 } },
    { id: 'lider', label: 'Líder', emoji: '🧠', type: 'positive', description: 'Organiza o time', impact: { visao: 2, defesa: 1 } },
    { id: 'guerreiro', label: 'Guerreiro', emoji: '🛡️', type: 'positive', description: 'Raça e rebotes', impact: { forca: 3, defesa: 1 } },
    // Negativas/Zueira
    { id: 'avenida', label: 'Avenida', emoji: '🛣️', type: 'negative', description: 'Defesa aberta', impact: { defesa: -2 } },
    { id: 'fominha', label: 'Fominha', emoji: '🍽️', type: 'negative', description: 'Não passa a bola', impact: { visao: -3 } },
    { id: 'tijoleiro', label: 'Pedreiro', emoji: '🏗️', type: 'negative', description: 'Errou muitos arremessos', impact: { ataque: -2 } },
    { id: 'cone', label: 'Cone', emoji: '⚠️', type: 'negative', description: 'Parado em quadra', impact: { velocidade: -2, defesa: -1 } }
];

export const PeerReviewQuiz: React.FC<PeerReviewQuizProps> = ({ isOpen, onClose, gameId, eventId, reviewerId, playersToReview }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Sort players to review randomly to avoid bias, or keeps original order
    const currentPlayer = playersToReview[currentIndex];
    const progress = ((currentIndex) / playersToReview.length) * 100;

    const toggleTag = (tagId: string) => {
        if (selectedTags.includes(tagId)) {
            setSelectedTags(prev => prev.filter(t => t !== tagId));
        } else {
            // Max 2 tags per player
            if (selectedTags.length < 2) {
                setSelectedTags(prev => [...prev, tagId]);
            }
        }
    };

    const handleNext = async () => {
        if (!currentPlayer) return;

        setIsSubmitting(true);
        try {
            // 1. Save Log (Audit Trail)
            await addDoc(collection(db, "avaliacoes_gamified"), {
                gameId,
                eventId,
                reviewerId,
                targetId: currentPlayer.id,
                tags: selectedTags,
                timestamp: serverTimestamp()
            });

            // 2. Aggregate Stats on Player Document (Optimized Write)
            if (selectedTags.length > 0) {
                const updates: any = {};
                selectedTags.forEach(tagId => {
                    // Increment tag counter: stats_tags.muralha = increment(1)
                    updates[`stats_tags.${tagId}`] = increment(1);
                });
                
                await updateDoc(doc(db, "jogadores", currentPlayer.id), updates);
            }

            // Move Next
            setSelectedTags([]);
            if (currentIndex < playersToReview.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                onClose(); // Finish
            }

        } catch (error) {
            console.error("Error submitting review:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !currentPlayer) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Avaliação Pós-Jogo">
            <div className="flex flex-col h-full max-h-[80vh]">
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mb-4 overflow-hidden">
                    <div className="bg-ancb-orange h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>

                <div className="flex flex-col items-center mb-6">
                    <div className="w-20 h-20 rounded-full border-4 border-ancb-blue bg-gray-200 dark:bg-gray-600 overflow-hidden mb-2 shadow-lg">
                        {currentPlayer.foto ? (
                            <img src={currentPlayer.foto} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">{currentPlayer.nome.charAt(0)}</div>
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">{currentPlayer.apelido || currentPlayer.nome.split(' ')[0]}</h3>
                    <p className="text-xs text-gray-500">O que define a atuação dele hoje?</p>
                </div>

                {/* Tags Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6 overflow-y-auto custom-scrollbar p-1">
                    {AVAILABLE_TAGS.map(tag => {
                        const isSelected = selectedTags.includes(tag.id);
                        return (
                            <button
                                key={tag.id}
                                onClick={() => toggleTag(tag.id)}
                                className={`
                                    relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200
                                    ${isSelected 
                                        ? 'border-ancb-blue bg-blue-50 dark:bg-blue-900/40 shadow-md scale-[1.02]' 
                                        : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-200'}
                                `}
                            >
                                <span className="text-2xl">{tag.emoji}</span>
                                <div className="text-left">
                                    <p className={`text-xs font-bold uppercase ${isSelected ? 'text-ancb-blue' : 'text-gray-600 dark:text-gray-300'}`}>
                                        {tag.label}
                                    </p>
                                    <p className="text-[9px] text-gray-400 leading-tight">{tag.description}</p>
                                </div>
                                {isSelected && <LucideCheckCircle2 className="absolute top-2 right-2 text-ancb-blue" size={14} />}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-auto">
                    <Button onClick={handleNext} disabled={isSubmitting} className="w-full h-12 text-lg">
                        {isSubmitting ? 'Salvando...' : (currentIndex === playersToReview.length - 1 ? 'Finalizar' : 'Próximo')} <LucideChevronRight />
                    </Button>
                    <button onClick={() => { setSelectedTags([]); handleNext(); }} className="w-full text-center text-xs text-gray-400 mt-3 py-2 hover:text-gray-600">
                        Pular / Sem opinião
                    </button>
                </div>
            </div>
        </Modal>
    );
};
