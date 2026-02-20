import React, { useState } from 'react';
import { Jogo } from '../types';
import { Button } from './Button';
import { LucideSave, LucideX } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface SimpleScorePanelProps {
    game: Jogo;
    eventId: string;
    onClose: () => void;
    onSave: () => void;
}

export const SimpleScorePanel: React.FC<SimpleScorePanelProps> = ({ game, eventId, onClose, onSave }) => {
    const [scoreA, setScoreA] = useState(game.placarTimeA_final || 0);
    const [scoreB, setScoreB] = useState(game.placarTimeB_final || 0);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateDoc(doc(db, "eventos", eventId, "jogos", game.id), {
                placarTimeA_final: Number(scoreA),
                placarTimeB_final: Number(scoreB),
                status: 'finalizado'
            });
            onSave();
            onClose();
        } catch (error) {
            console.error("Error saving score:", error);
            alert("Erro ao salvar placar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-600">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">Placar Rápido</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <LucideX size={24} />
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between gap-4">
                        {/* Team A */}
                        <div className="flex-1 flex flex-col items-center gap-2">
                            <span className="text-sm font-bold text-gray-500 uppercase text-center line-clamp-2 h-10 flex items-center justify-center">
                                {game.timeA_nome || 'Time A'}
                            </span>
                            <input 
                                type="number" 
                                min="0"
                                value={scoreA}
                                onChange={(e) => setScoreA(Number(e.target.value))}
                                className="w-20 h-20 text-center text-3xl font-black bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-ancb-blue outline-none transition-colors"
                            />
                        </div>

                        <span className="text-2xl font-black text-gray-300">X</span>

                        {/* Team B */}
                        <div className="flex-1 flex flex-col items-center gap-2">
                            <span className="text-sm font-bold text-gray-500 uppercase text-center line-clamp-2 h-10 flex items-center justify-center">
                                {game.timeB_nome || 'Time B'}
                            </span>
                            <input 
                                type="number" 
                                min="0"
                                value={scoreB}
                                onChange={(e) => setScoreB(Number(e.target.value))}
                                className="w-20 h-20 text-center text-3xl font-black bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-ancb-blue outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs text-blue-600 dark:text-blue-300 text-center">
                        Este jogo não envolve a ANCB diretamente, portanto não possui estatísticas detalhadas de jogadores.
                    </div>

                    <Button onClick={handleSave} disabled={loading} className="w-full h-12 text-lg">
                        {loading ? 'Salvando...' : 'Salvar e Encerrar'} <LucideSave size={20} className="ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
