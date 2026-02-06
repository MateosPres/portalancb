
import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Player } from '../types';
import { LucideStar, LucideMessageSquare } from 'lucide-react';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    teammates: Player[];
    onSubmit: (reviewData: { revieweeId: string; rating: number; emojiTag: string; comment: string }) => void;
}

const EMOJI_TAGS = [
    { emoji: '🏀', label: 'MVP', desc: 'Melhor do Jogo' },
    { emoji: '🤝', label: 'Garçom', desc: 'Muitas Assistências' },
    { emoji: '🛡️', label: 'Paredão', desc: 'Defesa Sólida' },
    { emoji: '⚡', label: 'Flash', desc: 'Rápido/Energético' },
    { emoji: '🎯', label: 'Sniper', desc: 'Mão Calibrada' },
    { emoji: '🧠', label: 'Coach', desc: 'Inteligente' },
    { emoji: '😡', label: 'Fominha', desc: 'Não passa a bola' },
];

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, teammates, onSubmit }) => {
    const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
    const [rating, setRating] = useState<number>(0);
    const [selectedEmoji, setSelectedEmoji] = useState<string>('');
    const [comment, setComment] = useState<string>('');

    const handleSubmit = () => {
        if (!selectedPlayerId || rating === 0 || !selectedEmoji) {
            alert("Selecione um jogador, dê uma nota e escolha uma tag.");
            return;
        }
        onSubmit({
            revieweeId: selectedPlayerId,
            rating,
            emojiTag: selectedEmoji,
            comment
        });
        // Reset form partially to allow voting on next player easily
        setSelectedPlayerId('');
        setRating(0);
        setSelectedEmoji('');
        setComment('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Avaliar Desempenho">
            <div className="space-y-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Avalie seus companheiros de time nesta partida. Seja justo e construtivo!
                </p>

                {/* 1. Select Player */}
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Quem você quer avaliar?</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {teammates.map(player => (
                            <div 
                                key={player.id}
                                onClick={() => setSelectedPlayerId(player.id)}
                                className={`
                                    flex flex-col items-center min-w-[80px] p-2 rounded-lg cursor-pointer border-2 transition-all
                                    ${selectedPlayerId === player.id 
                                        ? 'border-ancb-blue bg-blue-50 dark:bg-blue-900/30' 
                                        : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700'}
                                `}
                            >
                                <div className="w-12 h-12 rounded-full overflow-hidden mb-1 bg-gray-200">
                                    {player.foto ? (
                                        <img src={player.foto} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">{player.nome.charAt(0)}</div>
                                    )}
                                </div>
                                <span className="text-xs font-bold text-center truncate w-full dark:text-gray-200">
                                    {player.apelido || player.nome.split(' ')[0]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedPlayerId && (
                    <div className="animate-fadeIn space-y-6 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                        {/* 2. Star Rating */}
                        <div className="flex flex-col items-center">
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Nota Geral</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                                    >
                                        <LucideStar size={32} fill={rating >= star ? "currentColor" : "none"} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Emoji Tags */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Tag de Estilo</label>
                            <div className="grid grid-cols-4 gap-2">
                                {EMOJI_TAGS.map((tag) => (
                                    <button
                                        key={tag.emoji}
                                        onClick={() => setSelectedEmoji(tag.emoji)}
                                        className={`
                                            flex flex-col items-center justify-center p-2 rounded-lg border transition-all
                                            ${selectedEmoji === tag.emoji 
                                                ? 'bg-white dark:bg-gray-600 border-ancb-orange shadow-md scale-105' 
                                                : 'border-transparent hover:bg-white dark:hover:bg-gray-600'}
                                        `}
                                        title={tag.desc}
                                    >
                                        <span className="text-2xl mb-1">{tag.emoji}</span>
                                        <span className="text-[9px] uppercase font-bold text-gray-500 dark:text-gray-300">{tag.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 4. Comment */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2 flex items-center gap-2">
                                <LucideMessageSquare size={14} /> Comentário (Opcional)
                            </label>
                            <textarea
                                className="w-full p-3 text-sm border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-ancb-blue"
                                rows={3}
                                placeholder="Dê um feedback construtivo..."
                                value={comment}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                            />
                        </div>

                        <Button onClick={handleSubmit} className="w-full">
                            Enviar Avaliação
                        </Button>
                    </div>
                )}
            </div>
        </Modal>
    );
};
