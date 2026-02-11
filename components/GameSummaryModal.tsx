
import React, { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Jogo, Cesta, Player } from '../types';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { LucideTrophy, LucideUsers, LucideGamepad2, LucideLoader2, LucideCalendar, LucideMapPin } from 'lucide-react';

interface GameSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    game: Jogo | null;
    eventId: string;
    isAdmin: boolean;
    onOpenAdminPanel: () => void;
}

interface ScorerStats {
    id: string;
    name: string;
    points: number;
    c1: number;
    c2: number;
    c3: number;
}

export const GameSummaryModal: React.FC<GameSummaryModalProps> = ({ 
    isOpen, 
    onClose, 
    game, 
    eventId, 
    isAdmin, 
    onOpenAdminPanel 
}) => {
    const [loading, setLoading] = useState(false);
    const [scorers, setScorers] = useState<ScorerStats[]>([]);

    useEffect(() => {
        if (isOpen && game && eventId) {
            fetchStats();
        }
    }, [isOpen, game, eventId]);

    const fetchStats = async () => {
        if (!game) return;
        setLoading(true);
        try {
            const cestasRef = collection(db, "eventos", eventId, "jogos", game.id, "cestas");
            const q = query(cestasRef, orderBy("timestamp", "asc")); // Order to reconstruct history if needed
            const snapshot = await getDocs(q);

            const statsMap: Record<string, ScorerStats> = {};

            snapshot.docs.forEach(doc => {
                const data = doc.data() as Cesta;
                if (data.jogadorId && data.nomeJogador) {
                    if (!statsMap[data.jogadorId]) {
                        statsMap[data.jogadorId] = {
                            id: data.jogadorId,
                            name: data.nomeJogador,
                            points: 0,
                            c1: 0, c2: 0, c3: 0
                        };
                    }
                    const pts = Number(data.pontos);
                    statsMap[data.jogadorId].points += pts;
                    if (pts === 1) statsMap[data.jogadorId].c1++;
                    if (pts === 2) statsMap[data.jogadorId].c2++;
                    if (pts === 3) statsMap[data.jogadorId].c3++;
                }
            });

            const sortedScorers = Object.values(statsMap).sort((a, b) => b.points - a.points);
            setScorers(sortedScorers);
        } catch (error) {
            console.error("Error fetching game stats", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !game) return null;

    const scoreA = game.placarTimeA_final ?? game.placarANCB_final ?? 0;
    const scoreB = game.placarTimeB_final ?? game.placarAdversario_final ?? 0;
    const teamAName = game.timeA_nome || 'ANCB';
    const teamBName = game.timeB_nome || game.adversario || 'Adversário';

    // Formatar data
    const dateStr = game.dataJogo ? game.dataJogo.split('-').reverse().join('/') : '';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Resumo da Partida">
            <div className="space-y-6">
                
                {/* Header Info */}
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">
                    {dateStr && <span className="flex items-center gap-1"><LucideCalendar size={12}/> {dateStr}</span>}
                    {game.localizacao && <span className="flex items-center gap-1"><LucideMapPin size={12}/> {game.localizacao}</span>}
                </div>

                {/* Scoreboard */}
                <div className="bg-gray-100 dark:bg-gray-700/50 rounded-2xl p-6 flex items-center justify-between shadow-inner relative overflow-hidden">
                    <div className="flex-1 flex flex-col items-center text-center z-10">
                        <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1 line-clamp-1 w-full">{teamAName}</span>
                        <span className={`text-5xl font-black ${scoreA > scoreB ? 'text-ancb-orange' : 'text-gray-800 dark:text-white'}`}>{scoreA}</span>
                    </div>
                    
                    <div className="px-4 z-10">
                        <span className="text-2xl font-black text-gray-300 dark:text-gray-600">X</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center text-center z-10">
                        <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1 line-clamp-1 w-full">{teamBName}</span>
                        <span className={`text-5xl font-black ${scoreB > scoreA ? 'text-ancb-orange' : 'text-gray-800 dark:text-white'}`}>{scoreB}</span>
                    </div>

                    {/* Background Trophy Decoration */}
                    {(scoreA > scoreB || scoreB > scoreA) && (
                        <LucideTrophy className={`absolute top-1/2 -translate-y-1/2 ${scoreA > scoreB ? 'left-4' : 'right-4'} text-yellow-500/10 w-32 h-32 pointer-events-none`} />
                    )}
                </div>

                {/* Game Status Badge */}
                <div className="flex justify-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${game.status === 'andamento' ? 'bg-red-100 text-red-600 animate-pulse' : game.status === 'finalizado' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {game.status === 'andamento' ? '🔴 Ao Vivo' : game.status === 'finalizado' ? 'Finalizado' : 'Agendado'}
                    </span>
                </div>

                {/* Scorers List */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <LucideUsers size={16} className="text-ancb-blue"/> Pontuadores
                    </h4>
                    
                    {loading ? (
                        <div className="flex justify-center py-6"><LucideLoader2 className="animate-spin text-ancb-orange"/></div>
                    ) : scorers.length === 0 ? (
                        <div className="text-center py-6 text-gray-400 text-xs italic bg-gray-50 dark:bg-gray-800 rounded-lg">
                            Nenhum ponto registrado individualmente.
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                            {scorers.map((player, idx) => (
                                <div key={player.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="w-5 text-center text-gray-400 font-bold text-xs">{idx + 1}</span>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">{player.name}</p>
                                            <div className="flex gap-2 text-[9px] text-gray-400 mt-0.5">
                                                {player.c3 > 0 && <span title="Bolas de 3">3PT: <b>{player.c3}</b></span>}
                                                {player.c2 > 0 && <span title="Bolas de 2">2PT: <b>{player.c2}</b></span>}
                                                {player.c1 > 0 && <span title="Lances Livres">1PT: <b>{player.c1}</b></span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-black text-ancb-orange">{player.points}</span>
                                        <span className="text-[9px] text-gray-400 font-bold uppercase block -mt-1">Pts</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Admin Actions */}
                {isAdmin && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button onClick={onOpenAdminPanel} className="w-full !bg-gray-800 hover:!bg-gray-900 text-white flex items-center justify-center gap-2">
                            <LucideGamepad2 size={18} /> Painel de Controle (Admin)
                        </Button>
                        <p className="text-[10px] text-center text-gray-400 mt-2">
                            Apenas administradores podem alterar o placar.
                        </p>
                    </div>
                )}
            </div>
        </Modal>
    );
};
