import React, { useEffect, useRef, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Jogo, Cesta, Evento } from '../types';
import { Button } from '../components/Button';
import { LucideActivity, LucideTrophy, LucideCalendar, LucideArrowLeft } from 'lucide-react';
import { useLiveStream } from '../hooks/useLiveStream';
import { LiveYouTubePlayer } from '../components/LiveYouTubePlayer';

interface PublicGameViewProps {
    game: Jogo;
    eventId: string;
    onBack: () => void;
}

export const PublicGameView: React.FC<PublicGameViewProps> = ({ game, eventId, onBack }) => {
    const [liveGame, setLiveGame] = useState<Jogo>(game);
    const [liveScore, setLiveScore] = useState({ scoreA: 0, scoreB: 0 });
    const [feedItems, setFeedItems] = useState<Cesta[]>([]);
    const [eventData, setEventData] = useState<Evento | null>(null);
    const [showPlayer, setShowPlayer] = useState(true);
    const hasAutoOpenedPlayerRef = useRef(false);

    const { config: streamConfig, game: streamGame } = useLiveStream();

    const hasLiveStream = Boolean(streamConfig?.active && streamConfig.videoId && streamGame);

    // 1. Fetch Event Data
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

    useEffect(() => {
        if (!hasLiveStream) {
            setShowPlayer(false);
            hasAutoOpenedPlayerRef.current = false;
        }
    }, [hasLiveStream]);

    useEffect(() => {
        if (hasLiveStream && liveGame.status === 'andamento' && !hasAutoOpenedPlayerRef.current) {
            setShowPlayer(true);
            hasAutoOpenedPlayerRef.current = true;
        }
    }, [hasLiveStream, liveGame.status]);

    // 3. Real-time Feed
    useEffect(() => {
        const cestasRef = collection(db, "eventos", eventId, "jogos", game.id, "cestas");
        const q = query(cestasRef, orderBy("timestamp", "desc"), limit(20));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newItems = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Cesta));
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
        <div className="animate-fadeIn pb-10">
            {/* Header Navigation */}
            <div className="flex items-center gap-3 mb-6">
                <Button variant="secondary" size="sm" onClick={onBack} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                    <LucideArrowLeft size={18} />
                </Button>
                <h2 className="text-2xl font-bold text-ancb-black dark:text-white">Acompanhar Jogo</h2>
            </div>

            <div className="space-y-6">
                {hasLiveStream && streamConfig && streamGame && showPlayer && (
                    <LiveYouTubePlayer
                        videoId={streamConfig.videoId}
                        game={streamGame}
                        eventId={streamConfig.eventId}
                        delaySeconds={streamConfig.delaySeconds}
                        onClose={() => setShowPlayer(false)}
                    />
                )}

                {/* Header / Scoreboard */}
                <div
                    onClick={() => {
                        if (liveGame.status === 'andamento' && hasLiveStream) {
                            setShowPlayer(true);
                        }
                    }}
                    className={`bg-gradient-to-r from-[#062553] to-blue-900 rounded-2xl shadow-xl overflow-hidden relative border border-blue-800 p-6 md:p-12 text-center ${liveGame.status === 'andamento' && hasLiveStream ? 'cursor-pointer transition-all hover:shadow-2xl hover:scale-[1.01]' : ''}`}
                >
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                        <LucideTrophy size={300} className="transform rotate-12 -translate-y-10 translate-x-10 text-white" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            {liveGame.status === 'andamento' ? (
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600 text-white text-sm font-bold uppercase tracking-wider animate-pulse shadow-sm">
                                    <span className="w-2 h-2 bg-white rounded-full"></span>
                                    AO VIVO
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-700 text-gray-300 text-sm font-bold uppercase tracking-wider border border-gray-600">
                                    <LucideCalendar size={14} /> {liveGame.status === 'finalizado' ? 'FINALIZADO' : 'AGENDADO'}
                                </div>
                            )}
                            {eventData && <span className="text-blue-200 text-sm font-bold uppercase tracking-wide">{eventData.modalidade}</span>}
                        </div>

                        <h2 className="text-2xl md:text-4xl font-bold text-white mb-8 leading-tight opacity-90">
                            {eventData?.nome || 'Evento'}
                        </h2>

                        <div className="flex items-center justify-center gap-6 md:gap-16">
                            {/* Team A */}
                            <div className="flex flex-col items-center w-1/3">
                                <span className="text-6xl md:text-9xl font-black text-white leading-none mb-4 drop-shadow-lg">{liveScore.scoreA}</span>
                                <span className="text-sm md:text-xl font-bold uppercase text-blue-300 truncate w-full px-1">
                                    {isInternal(liveGame) ? liveGame.timeA_nome : 'ANCB'}
                                </span>
                            </div>

                            <div className="text-4xl md:text-6xl font-bold text-white/20">:</div>

                            {/* Team B */}
                            <div className="flex flex-col items-center w-1/3">
                                <span className="text-6xl md:text-9xl font-black text-white leading-none mb-4 drop-shadow-lg">{liveScore.scoreB}</span>
                                <span className="text-sm md:text-xl font-bold uppercase text-blue-300 truncate w-full px-1">
                                    {isInternal(liveGame) ? liveGame.timeB_nome : (liveGame.adversario || 'ADV')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Feed */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2">
                        <LucideActivity size={20} className="text-ancb-blue" />
                        <h3 className="font-bold text-gray-700 dark:text-gray-200 uppercase text-sm tracking-wider">Lances do Jogo</h3>
                    </div>
                    
                    <div className="p-0">
                        {feedItems.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 dark:text-gray-500 italic text-base">
                                Aguardando pontuação...
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                {feedItems.map((cesta, idx) => {
                                    const teamName = getTeamNameForFeed(cesta);
                                    const shotType = getShotDescription(Number(cesta.pontos));
                                    const isTeamA = cesta.timeId === liveGame.timeA_id || cesta.timeId === 'A';
                                    
                                    return (
                                        <div key={cesta.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors animate-fadeIn">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-3 h-3 rounded-full shrink-0 ${isTeamA ? 'bg-ancb-orange' : 'bg-gray-400'}`}></div>
                                                <div className="leading-tight">
                                                    <div className="font-bold text-gray-800 dark:text-gray-200 text-base">
                                                        {cesta.nomeJogador && cesta.nomeJogador !== 'Unknown' ? cesta.nomeJogador : teamName}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                                        fez {shotType} {cesta.nomeJogador && <span className="opacity-70">({teamName})</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`font-black text-2xl ${Number(cesta.pontos) === 3 ? 'text-ancb-orange' : 'text-ancb-blue dark:text-blue-400'}`}>
                                                +{cesta.pontos}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
