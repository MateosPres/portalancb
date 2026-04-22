import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Jogo, Cesta, Evento } from '../types';
import { Modal } from './Modal';
import { LucideActivity, LucideTrophy, LucideCalendar } from 'lucide-react';

interface PublicGameModalProps {
    game: Jogo;
    eventId: string;
    onClose: () => void;
}

export const PublicGameModal: React.FC<PublicGameModalProps> = ({ game, eventId, onClose }) => {
    const [liveGame, setLiveGame] = useState<Jogo>(game);
    const [liveScore, setLiveScore] = useState({ scoreA: 0, scoreB: 0 });
    const [feedItems, setFeedItems] = useState<Cesta[]>([]);
    const [eventData, setEventData] = useState<Evento | null>(null);

    // 1. Fetch Event Data (for modality, name, etc.)
    useEffect(() => {
        const fetchEvent = async () => {
            const eventDoc = await doc(db, "eventos", eventId);
            const unsubscribe = onSnapshot(eventDoc, (docSnap) => {
                if (docSnap.exists()) {
                    setEventData({ id: docSnap.id, ...docSnap.data() } as Evento);
                }
            });
            return unsubscribe;
        };
        const unsub = fetchEvent();
        return () => { unsub.then(fn => fn && fn()); };
    }, [eventId]);

    // 2. Real-time Game Updates
    useEffect(() => {
        const gameRef = doc(db, "eventos", eventId, "jogos", game.id);
        const unsubscribe = onSnapshot(gameRef, (docSnap) => {
            if (docSnap.exists()) {
                const updatedGame = { id: docSnap.id, ...docSnap.data() } as Jogo;
                setLiveGame(updatedGame);
                setLiveScore({
                    scoreA: updatedGame.placarTimeA_final ?? updatedGame.placarANCB_final ?? 0,
                    scoreB: updatedGame.placarTimeB_final ?? updatedGame.placarAdversario_final ?? 0
                });
            }
        });
        return () => unsubscribe();
    }, [game.id, eventId]);

    // 3. Real-time Feed
    useEffect(() => {
        const cestasRef = collection(db, "eventos", eventId, "jogos", game.id, "cestas");
        const q = query(cestasRef, orderBy("timestamp", "desc"), limit(10)); // Show more items in modal

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newItems = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() } as Cesta))
                .filter(item => (item.acao || 'pontos') === 'pontos');
            setFeedItems(newItems);
        });

        return () => unsubscribe();
    }, [game.id, eventId]);

    const isInternal = (g: Jogo) => !!g.timeA_nome && g.timeA_nome !== 'ANCB';

    const getShotDescription = (points: number) => {
        if (points === 3) return "cesta longa";
        if (points === 2) return "cesta curta";
        return "lance livre";
    };

    const getTeamNameForFeed = (cesta: Cesta) => {
        if (cesta.timeId === liveGame.timeA_id || cesta.timeId === 'A') return liveGame.timeA_nome || 'ANCB';
        if (cesta.timeId === liveGame.timeB_id || cesta.timeId === 'B') return liveGame.timeB_nome || liveGame.adversario || 'Adversário';
        return 'Time';
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Acompanhar Jogo" maxWidth="max-w-4xl">
            <div className="space-y-6">
                {/* Header / Scoreboard */}
                <div className="bg-gradient-to-r from-[#062553] to-blue-900 rounded-2xl shadow-xl overflow-hidden relative border border-blue-800 p-6 md:p-8 text-center">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                        <LucideTrophy size={200} className="transform rotate-12 -translate-y-10 translate-x-10 text-white" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            {liveGame.status === 'andamento' ? (
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold uppercase tracking-wider animate-pulse shadow-sm">
                                    <span className="w-2 h-2 bg-white rounded-full"></span>
                                    AO VIVO
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-700 text-gray-300 text-xs font-bold uppercase tracking-wider border border-gray-600">
                                    <LucideCalendar size={12} /> {liveGame.status === 'finalizado' ? 'FINALIZADO' : 'AGENDADO'}
                                </div>
                            )}
                            {eventData && <span className="text-blue-200 text-xs font-bold uppercase tracking-wide">{eventData.modalidade}</span>}
                        </div>

                        <h2 className="text-xl md:text-2xl font-bold text-white mb-6 leading-tight opacity-90">
                            {eventData?.nome || 'Evento'}
                        </h2>

                        <div className="flex items-center justify-center gap-4 md:gap-12">
                            {/* Team A */}
                            <div className="flex flex-col items-center w-1/3">
                                <span className="text-4xl md:text-7xl font-black text-white leading-none mb-2">{liveScore.scoreA}</span>
                                <span className="text-xs md:text-sm font-bold uppercase text-blue-300 truncate w-full px-1">
                                    {isInternal(liveGame) ? liveGame.timeA_nome : 'ANCB'}
                                </span>
                            </div>

                            <div className="text-2xl md:text-4xl font-bold text-white/20">:</div>

                            {/* Team B */}
                            <div className="flex flex-col items-center w-1/3">
                                <span className="text-4xl md:text-7xl font-black text-white leading-none mb-2">{liveScore.scoreB}</span>
                                <span className="text-xs md:text-sm font-bold uppercase text-blue-300 truncate w-full px-1">
                                    {isInternal(liveGame) ? liveGame.timeB_nome : (liveGame.adversario || 'ADV')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Feed */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2">
                        <LucideActivity size={18} className="text-ancb-blue" />
                        <h3 className="font-bold text-gray-700 dark:text-gray-200 uppercase text-xs tracking-wider">Lances do Jogo</h3>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto custom-scrollbar p-4 space-y-3">
                        {feedItems.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 dark:text-gray-500 italic text-sm">
                                Aguardando pontuação...
                            </div>
                        ) : (
                            feedItems.map((cesta, idx) => {
                                const teamName = getTeamNameForFeed(cesta);
                                const shotType = getShotDescription(Number(cesta.pontos));
                                const isTeamA = cesta.timeId === liveGame.timeA_id || cesta.timeId === 'A';
                                
                                return (
                                    <div key={cesta.id} className="flex items-center justify-between text-sm animate-fadeIn border-b border-gray-100 dark:border-gray-700/50 last:border-0 pb-2 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full shrink-0 ${isTeamA ? 'bg-ancb-orange' : 'bg-gray-400'}`}></div>
                                            <div className="leading-tight">
                                                <div className="font-bold text-gray-800 dark:text-gray-200">
                                                    {cesta.nomeJogador && cesta.nomeJogador !== 'Unknown' ? cesta.nomeJogador : teamName}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    fez {shotType} {cesta.nomeJogador && <span className="opacity-70">({teamName})</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`font-black text-lg ${Number(cesta.pontos) === 3 ? 'text-ancb-orange' : 'text-ancb-blue dark:text-blue-400'}`}>
                                            +{cesta.pontos}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};
