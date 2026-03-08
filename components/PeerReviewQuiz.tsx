import React, { useState, useEffect } from 'react';
import { Player, ReviewTagDefinition } from '../types';
import { LucideChevronRight, LucideCheckCircle2, LucideX, LucideStar } from 'lucide-react';
import { db } from '../services/firebase';
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface PeerReviewQuizProps {
    isOpen: boolean;
    onClose: () => void;
    gameId: string;
    eventId: string;
    reviewerId: string;
    playersToReview: Player[];
}

// ── SISTEMA DE TAGS COM PESOS BALANCEADOS ────────────────────────────────────
// Positivas: atributo principal +3, secundário(s) +1
// Negativas: assimétrico — principal -1, secundário -0.5
// Negativas nunca cancelam completamente um positivo (precisaria de 3x a mesma tag)
const AVAILABLE_TAGS: ReviewTagDefinition[] = [
    // DESTAQUES
    { id: 'muralha',   label: 'Muralha',   emoji: '🧱', type: 'positive', description: 'Defesa intransponível',       impact: { defesa: 3, forca: 1 } },
    { id: 'sniper',    label: 'Sniper',    emoji: '🎯', type: 'positive', description: 'Mão calibrada',               impact: { ataque: 3, visao: 1 } },
    { id: 'garcom',    label: 'Garçom',    emoji: '🤝', type: 'positive', description: 'Visão de jogo e assistências', impact: { visao: 3, ataque: 1 } },
    { id: 'flash',     label: 'Flash',     emoji: '⚡', type: 'positive', description: 'Velocidade e contra-ataque',  impact: { velocidade: 3, ataque: 1 } },
    { id: 'lider',     label: 'Líder',     emoji: '🧠', type: 'positive', description: 'Organiza o time',             impact: { visao: 3, defesa: 1, forca: 1 } },
    { id: 'guerreiro', label: 'Guerreiro', emoji: '🛡️', type: 'positive', description: 'Raça e rebotes',              impact: { forca: 3, defesa: 1 } },
    // VACILOS (assimétrico: -1 principal, -0.5 secundário)
    { id: 'avenida',   label: 'Avenida',   emoji: '🛣️', type: 'negative', description: 'Defesa aberta',               impact: { defesa: -1, velocidade: -0.5 } },
    { id: 'fominha',   label: 'Fominha',   emoji: '🍽️', type: 'negative', description: 'Não passa a bola',            impact: { visao: -1, ataque: -0.5 } },
    { id: 'tijoleiro', label: 'Pedreiro',  emoji: '🏗️', type: 'negative', description: 'Errou muitos arremessos',     impact: { ataque: -1, visao: -0.5 } },
    { id: 'cone',      label: 'Cone',      emoji: '⚠️', type: 'negative', description: 'Parado em quadra',            impact: { velocidade: -1, forca: -0.5 } },
];

// Multiplicadores por número de tags (1→1.0x, 2→0.75x, 3→0.55x)
const TAG_MULTIPLIERS: Record<number, number> = { 1: 1.0, 2: 0.75, 3: 0.55 };

const POSITIVE_TAGS = AVAILABLE_TAGS.filter(t => t.type === 'positive');
const NEGATIVE_TAGS = AVAILABLE_TAGS.filter(t => t.type === 'negative');

export const PeerReviewQuiz: React.FC<PeerReviewQuizProps> = ({
    isOpen, onClose, gameId, eventId, reviewerId, playersToReview
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showFinish, setShowFinish] = useState(false);
    const [animating, setAnimating] = useState(false);

    const currentPlayer = playersToReview[currentIndex];
    const isLast = currentIndex === playersToReview.length - 1;

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(0);
            setSelectedTags([]);
            setShowFinish(false);
            setAnimating(false);
        }
    }, [isOpen]);

    const toggleTag = (tagId: string) => {
        if (selectedTags.includes(tagId)) {
            setSelectedTags(prev => prev.filter(t => t !== tagId));
        } else if (selectedTags.length < 3) { // ✅ Máximo 3 tags
            setSelectedTags(prev => [...prev, tagId]);
        }
    };

    const handleNext = async (skip = false) => {
        if (!currentPlayer || isSubmitting) return;
        setIsSubmitting(true);

        try {
            const tags = skip ? [] : selectedTags;

            // Salva log da avaliação
            await addDoc(collection(db, "avaliacoes_gamified"), {
                gameId, eventId, reviewerId,
                targetId: currentPlayer.id,
                tags,
                timestamp: serverTimestamp()
            });

            // Aplica impacto nos atributos com multiplicador por número de tags
            if (tags.length > 0) {
                const multiplier = TAG_MULTIPLIERS[tags.length] ?? 1.0;
                const attrDeltas: Record<string, number> = {};

                tags.forEach(tagId => {
                    const tag = AVAILABLE_TAGS.find(t => t.id === tagId);
                    if (!tag) return;
                    Object.entries(tag.impact).forEach(([attr, value]) => {
                        attrDeltas[attr] = (attrDeltas[attr] || 0) + value * multiplier;
                    });
                });

                // Arredonda e só salva atributos com delta != 0
                const updates: any = {};
                Object.entries(attrDeltas).forEach(([attr, delta]) => {
                    const rounded = Math.round(delta * 10) / 10; // 1 casa decimal
                    if (rounded !== 0) {
                        updates[`stats_atributos.${attr}`] = increment(rounded);
                    }
                });

                // Também incrementa contagem de tags (para histórico/ranking)
                tags.forEach(tagId => {
                    updates[`stats_tags.${tagId}`] = increment(1);
                });

                if (Object.keys(updates).length > 0) {
                    await updateDoc(doc(db, "jogadores", currentPlayer.id), updates);
                }
            }

            setSelectedTags([]);
            setAnimating(true);
            setTimeout(() => {
                if (isLast) {
                    setShowFinish(true);
                } else {
                    setCurrentIndex(prev => prev + 1);
                }
                setAnimating(false);
            }, 300);

        } catch (error) {
            console.error("Error submitting review:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    // ── TELA FINAL ────────────────────────────────────────────────────────────
    if (showFinish) {
        return (
            <div className="fixed inset-0 z-[200] bg-[#040d1a] flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-pulse"
                            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`, animationDuration: `${2 + Math.random() * 3}s` }} />
                    ))}
                </div>
                <div className="relative z-10 flex flex-col items-center text-center px-8">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F27405] to-yellow-400 flex items-center justify-center mb-6 shadow-2xl shadow-orange-500/40">
                        <span className="text-5xl">🏆</span>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Avaliações enviadas!</h2>
                    <p className="text-gray-400 text-base mb-10 max-w-xs leading-relaxed">
                        Obrigado por avaliar seus companheiros. O time fica mais forte com seu feedback!
                    </p>
                    <div className="flex gap-2 mb-10">
                        {[...Array(5)].map((_, i) => (
                            <LucideStar key={i} size={28} className="text-[#F27405]" fill="#F27405" />
                        ))}
                    </div>
                    <button onClick={onClose}
                        className="w-full max-w-xs bg-[#F27405] hover:bg-orange-500 text-white font-black text-lg py-4 rounded-2xl transition-all active:scale-95 shadow-xl shadow-orange-500/30">
                        Fechar
                    </button>
                </div>
            </div>
        );
    }

    if (!currentPlayer) return null;

    const playerName = currentPlayer.apelido || currentPlayer.nome.split(' ')[0];
    const playerInitial = currentPlayer.nome.charAt(0).toUpperCase();
    const selectedCount = selectedTags.length;
    const maxReached = selectedCount >= 3;

    // ── TELA PRINCIPAL ────────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-[200] bg-[#040d1a] flex flex-col overflow-hidden">

            {/* Background atmosférico */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#062553] opacity-60 blur-3xl" />
                <svg className="absolute bottom-0 left-0 w-full opacity-5" viewBox="0 0 400 200" preserveAspectRatio="none">
                    <ellipse cx="200" cy="200" rx="180" ry="80" fill="none" stroke="white" strokeWidth="1"/>
                    <line x1="200" y1="120" x2="200" y2="200" stroke="white" strokeWidth="1"/>
                    <rect x="120" y="140" width="160" height="60" fill="none" stroke="white" strokeWidth="1"/>
                </svg>
            </div>

            {/* ── HEADER ── */}
            <div className="relative z-10 px-5 pt-12 pb-4 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        {currentIndex + 1} de {playersToReview.length}
                    </span>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all">
                        <LucideX size={16} />
                    </button>
                </div>
                {/* Progress segmentado */}
                <div className="flex gap-1">
                    {playersToReview.map((_, i) => (
                        <div key={i} className="h-1 flex-1 rounded-full overflow-hidden bg-white/10">
                            <div className="h-full rounded-full bg-[#F27405] transition-all duration-500"
                                style={{ width: i < currentIndex ? '100%' : i === currentIndex ? '50%' : '0%' }} />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── PLAYER CARD ── */}
            <div className={`relative z-10 flex flex-col items-center pt-6 pb-5 shrink-0 transition-all duration-300 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                <div className="relative mb-3">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-[#F27405] shadow-2xl shadow-orange-500/30">
                        {currentPlayer.foto ? (
                            <img src={currentPlayer.foto} loading="lazy" decoding="async" className="w-full h-full object-cover" alt={playerName} />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#062553] to-[#0a3a7a] flex items-center justify-center">
                                <span className="text-3xl font-black text-white">{playerInitial}</span>
                            </div>
                        )}
                    </div>
                    <div className="absolute inset-0 rounded-full ring-4 ring-[#F27405]/20 scale-110" />
                </div>

                <h2 className="text-2xl font-black text-white tracking-tight mb-1">{playerName}</h2>
                <p className="text-sm text-gray-400 font-medium">
                    Escolha até <span className="text-[#F27405] font-bold">3 tags</span> que definem a atuação dele
                </p>

                {/* Tags selecionadas — verde para destaques, vermelho para vacilos */}
                {selectedCount > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mt-3 px-4">
                        {selectedTags.map(tagId => {
                            const tag = AVAILABLE_TAGS.find(t => t.id === tagId);
                            if (!tag) return null;
                            const isPos = tag.type === 'positive';
                            return (
                                <span key={tagId}
                                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border
                                        ${isPos
                                            ? 'bg-green-500/20 text-green-400 border-green-500/40'
                                            : 'bg-red-500/20 text-red-400 border-red-500/40'
                                        }`}>
                                    {tag.emoji} {tag.label}
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── TAGS SCROLLABLE ── */}
            <div className={`relative z-10 flex-1 overflow-y-auto px-4 pb-2 transition-all duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}>

                {/* DESTAQUES */}
                <div className="mb-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400/70 mb-2 px-1">✦ Destaques</p>
                    <div className="grid grid-cols-2 gap-2">
                        {POSITIVE_TAGS.map(tag => {
                            const isSelected = selectedTags.includes(tag.id);
                            const isDisabled = !isSelected && maxReached;
                            return (
                                <button key={tag.id} onClick={() => toggleTag(tag.id)} disabled={isDisabled}
                                    className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left
                                        ${isSelected
                                            ? 'border-green-500 bg-green-500/15 shadow-lg shadow-green-500/20'
                                            : isDisabled
                                                ? 'border-white/5 bg-white/3 opacity-30 cursor-not-allowed'
                                                : 'border-white/10 bg-white/5 hover:border-green-500/30 hover:bg-green-500/5 active:scale-95'
                                        }`}>
                                    <span className="text-xl shrink-0">{tag.emoji}</span>
                                    <div className="min-w-0">
                                        <p className={`text-xs font-black uppercase tracking-wide truncate ${isSelected ? 'text-green-400' : 'text-white'}`}>
                                            {tag.label}
                                        </p>
                                        <p className="text-[10px] text-gray-500 leading-tight truncate">{tag.description}</p>
                                    </div>
                                    {isSelected && <LucideCheckCircle2 className="absolute top-2 right-2 text-green-400 shrink-0" size={14} />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* VACILOS */}
                <div className="mb-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400/70 mb-2 px-1">✦ Vacilos</p>
                    <div className="grid grid-cols-2 gap-2">
                        {NEGATIVE_TAGS.map(tag => {
                            const isSelected = selectedTags.includes(tag.id);
                            const isDisabled = !isSelected && maxReached;
                            return (
                                <button key={tag.id} onClick={() => toggleTag(tag.id)} disabled={isDisabled}
                                    className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left
                                        ${isSelected
                                            ? 'border-red-500 bg-red-500/15 shadow-lg shadow-red-500/20'
                                            : isDisabled
                                                ? 'border-white/5 bg-white/3 opacity-30 cursor-not-allowed'
                                                : 'border-white/10 bg-white/5 hover:border-red-500/30 hover:bg-red-500/5 active:scale-95'
                                        }`}>
                                    <span className="text-xl shrink-0">{tag.emoji}</span>
                                    <div className="min-w-0">
                                        <p className={`text-xs font-black uppercase tracking-wide truncate ${isSelected ? 'text-red-400' : 'text-white'}`}>
                                            {tag.label}
                                        </p>
                                        <p className="text-[10px] text-gray-500 leading-tight truncate">{tag.description}</p>
                                    </div>
                                    {isSelected && <LucideCheckCircle2 className="absolute top-2 right-2 text-red-400 shrink-0" size={14} />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── FOOTER ── */}
            <div className="relative z-10 px-4 pt-3 pb-8 shrink-0 border-t border-white/5 bg-[#040d1a]">
                <button onClick={() => handleNext(false)} disabled={isSubmitting || selectedCount === 0}
                    className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all active:scale-95
                        ${selectedCount > 0
                            ? 'bg-[#F27405] hover:bg-orange-500 text-white shadow-xl shadow-orange-500/30'
                            : 'bg-white/10 text-white/50 cursor-not-allowed'
                        } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Salvando...
                        </span>
                    ) : (
                        <>{isLast ? 'Finalizar' : 'Próximo'}<LucideChevronRight size={20} /></>
                    )}
                </button>
                <button onClick={() => handleNext(true)} disabled={isSubmitting}
                    className="w-full text-center text-xs text-gray-600 hover:text-gray-400 mt-3 py-2 transition-colors">
                    Pular / Sem opinião
                </button>
            </div>
        </div>
    );
};
