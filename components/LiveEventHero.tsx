
import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Evento, Jogo, Cesta } from '../types';
import { LucideMapPin, LucideCalendar, LucideChevronRight, LucideTrophy, LucideActivity, LucideClock } from 'lucide-react';

interface LiveEventHeroProps {
    event: Evento;
    onClick: () => void;
}

export const LiveEventHero: React.FC<LiveEventHeroProps> = ({ event, onClick }) => {
    const [activeGame, setActiveGame] = useState<Jogo | null>(null);
    const [latestFinishedGame, setLatestFinishedGame] = useState<Jogo | null>(null);
    const [nextGame, setNextGame] = useState<Jogo | null>(null);
    const [liveScore, setLiveScore] = useState({ scoreA: 0, scoreB: 0 });
    const [feedItems, setFeedItems] = useState<Cesta[]>([]);

    // 1. Fetch Games
    useEffect(() => {
        const gamesRef = collection(db, "eventos", event.id, "jogos");
        const q = query(gamesRef, orderBy("dataJogo", "desc"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const games = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Jogo));
                
                // Find priority: 1. Live, 2. Finished (for results), 3. Scheduled (for next)
                const live = games.find(g => g.status === 'andamento');
                const finished = games.filter(g => g.status === 'finalizado').sort((a,b) => (b.dataJogo || '').localeCompare(a.dataJogo || ''))[0];
                const next = games.filter(g => g.status !== 'finalizado' && g.status !== 'andamento').sort((a,b) => (a.dataJogo || '').localeCompare(b.dataJogo || ''))[0];

                setActiveGame(live || null);
                setLatestFinishedGame(finished || null);
                setNextGame(next || null);
            }
        });

        return () => unsubscribe();
    }, [event.id]);

    // 2. If Game is Live, Watch Cestas
    useEffect(() => {
        if (!activeGame) return;

        // Init score from doc
        setLiveScore({
            scoreA: activeGame.placarTimeA_final ?? activeGame.placarANCB_final ?? 0,
            scoreB: activeGame.placarTimeB_final ?? activeGame.placarAdversario_final ?? 0
        });

        const cestasRef = collection(db, "eventos", event.id, "jogos", activeGame.id, "cestas");
        const q = query(cestasRef, orderBy("timestamp", "desc"), limit(3));

        const unsubscribeCestas = onSnapshot(q, (snapshot) => {
            const newItems = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Cesta));
            setFeedItems(newItems);
        });

        return () => unsubscribeCestas();
    }, [activeGame, event.id]);

    // Update score if active game doc updates from outside
    useEffect(() => {
        if (activeGame) {
            setLiveScore({
                scoreA: activeGame.placarTimeA_final ?? activeGame.placarANCB_final ?? 0,
                scoreB: activeGame.placarTimeB_final ?? activeGame.placarAdversario_final ?? 0
            });
        }
    }, [activeGame]);

    const isInternal = (game: Jogo) => !!game.timeA_nome && game.timeA_nome !== 'ANCB';

    // Helpers for Feed Text
    const getShotDescription = (points: number) => {
        if (points === 3) return "cesta longa";
        if (points === 2) return "cesta curta";
        return "lance livre";
    };

    const getTeamNameForFeed = (cesta: Cesta) => {
        if (!activeGame) return 'Time';
        // Try mapping by ID
        if (cesta.timeId === activeGame.timeA_id || cesta.timeId === 'A') return activeGame.timeA_nome || 'ANCB';
        if (cesta.timeId === activeGame.timeB_id || cesta.timeId === 'B') return activeGame.timeB_nome || activeGame.adversario || 'Adversário';
        
        // Fallback logic if ID is missing but we have player name matching
        if (cesta.nomeJogador) {
            // Very basic heuristic could go here, but relying on timeId is safer
        }
        return 'Time';
    };

    // RENDER: SCENARIO 1 - GAME IS LIVE (BLUE SCOREBOARD)
    if (activeGame) {
        return (
            <div 
                onClick={onClick}
                className="w-full bg-gradient-to-r from-[#062553] to-blue-900 rounded-2xl shadow-xl overflow-hidden cursor-pointer relative group border border-blue-800 transition-all hover:shadow-2xl hover:scale-[1.01] mb-8"
            >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                    <LucideTrophy size={200} className="transform rotate-12 -translate-y-10 translate-x-10 text-white" />
                </div>

                <div className="p-6 md:p-8 relative z-10 flex flex-col lg:flex-row items-stretch justify-between gap-6">
                    {/* LEFT: Event & Scoreboard */}
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold uppercase tracking-wider animate-pulse shadow-sm">
                                <span className="w-2 h-2 bg-white rounded-full"></span>
                                AO VIVO AGORA
                            </div>
                            <span className="text-blue-200 text-xs font-bold uppercase tracking-wide">{event.modalidade}</span>
                        </div>

                        <h2 className="text-xl md:text-2xl font-bold text-white mb-6 leading-tight opacity-90 truncate">
                            {event.nome}
                        </h2>

                        <div className="flex items-center justify-between bg-black/20 rounded-xl p-4 border border-white/10 backdrop-blur-md">
                            <div className="text-center w-1/3">
                                <span className="block text-4xl md:text-6xl font-black text-white leading-none mb-1">{liveScore.scoreA}</span>
                                <span className="block text-[10px] md:text-xs font-bold uppercase text-blue-300 truncate px-1">
                                    {isInternal(activeGame) ? activeGame.timeA_nome : 'ANCB'}
                                </span>
                            </div>
                            <div className="text-2xl font-bold text-white/20">:</div>
                            <div className="text-center w-1/3">
                                <span className="block text-4xl md:text-6xl font-black text-white leading-none mb-1">{liveScore.scoreB}</span>
                                <span className="block text-[10px] md:text-xs font-bold uppercase text-blue-300 truncate px-1">
                                    {isInternal(activeGame) ? activeGame.timeB_nome : (activeGame.adversario || 'ADV')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Live Feed */}
                    <div className="lg:w-80 bg-white/5 border-l border-white/10 lg:-my-8 lg:py-8 lg:pl-6 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-3 text-blue-200/70 text-xs font-bold uppercase tracking-widest">
                            <LucideActivity size={14} /> Últimos Lances
                        </div>
                        
                        <div className="space-y-3">
                            {feedItems.length === 0 ? (
                                <p className="text-white/30 text-xs italic">Aguardando pontuação...</p>
                            ) : (
                                feedItems.map((cesta, idx) => {
                                    const teamName = getTeamNameForFeed(cesta);
                                    const shotType = getShotDescription(Number(cesta.pontos));
                                    
                                    return (
                                        <div key={cesta.id} className="flex items-start justify-between text-xs animate-slideDown" style={{animationDelay: `${idx * 100}ms`}}>
                                            <div className="flex items-start gap-2 overflow-hidden mr-2">
                                                <div className="w-1 h-1 rounded-full bg-ancb-orange shrink-0 mt-1.5"></div>
                                                <div className="font-medium text-white/90 leading-tight">
                                                    {cesta.nomeJogador && cesta.nomeJogador !== 'Unknown' ? (
                                                        <>
                                                            <span className="font-bold text-white">{cesta.nomeJogador}</span> 
                                                            <span className="text-blue-200 opacity-80 mx-1">({teamName})</span>
                                                        </>
                                                    ) : (
                                                        <span className="font-bold text-white">{teamName}</span>
                                                    )}
                                                    <span className="text-white/60 block">fez {shotType}</span>
                                                </div>
                                            </div>
                                            <span className={`font-bold text-sm whitespace-nowrap ${Number(cesta.pontos) === 3 ? 'text-ancb-orange' : 'text-blue-300'}`}>
                                                +{cesta.pontos}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-white/10 text-right">
                            <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider hover:text-white transition-colors flex items-center justify-end gap-1">
                                Acompanhar <LucideChevronRight size={12}/>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // RENDER: SCENARIO 2 - UPCOMING GAME (NOT LIVE)
    if (nextGame && !activeGame) {
        return (
            <div 
                onClick={onClick}
                className="w-full bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl shadow-xl overflow-hidden cursor-pointer relative group border border-slate-700 transition-all hover:shadow-2xl hover:scale-[1.01] mb-8"
            >
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                    <LucideClock size={200} className="transform rotate-12 -translate-y-10 translate-x-10 text-white" />
                </div>

                <div className="p-6 md:p-8 relative z-10 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/30 text-blue-200 text-xs font-bold uppercase tracking-wider border border-blue-500/30">
                            <LucideCalendar size={12}/> PRÓXIMO JOGO
                        </div>
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wide">{event.modalidade}</span>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2 leading-tight opacity-90 truncate">
                        {event.nome}
                    </h2>
                    
                    <div className="mt-6 flex items-center justify-between bg-white/5 rounded-xl p-6 border border-white/5">
                        <span className="text-xl font-black text-white w-1/3 text-right">
                            {isInternal(nextGame) ? nextGame.timeA_nome : 'ANCB'}
                        </span>
                        <div className="flex flex-col items-center px-4">
                            <span className="text-3xl font-black text-ancb-orange">VS</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">{nextGame.dataJogo ? nextGame.dataJogo.split('-').reverse().join('/') : 'EM BREVE'}</span>
                        </div>
                        <span className="text-xl font-black text-white w-1/3 text-left">
                            {isInternal(nextGame) ? nextGame.timeB_nome : (nextGame.adversario || 'ADV')}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // RENDER: SCENARIO 3 - GENERIC EVENT STATUS (FALLBACK)
    // Dynamic styling based on status
    const isLive = event.status === 'andamento';
    const isNext = event.status === 'proximo';
    
    // Blue for Live (ANCB Brand), Gray for Next
    const bgClass = isLive 
        ? "bg-gradient-to-r from-[#062553] to-blue-900 border-blue-800" 
        : "bg-gradient-to-r from-gray-900 to-gray-800 border-gray-700";

    const badgeClass = isLive 
        ? "bg-red-600 text-white animate-pulse border border-red-400"
        : "bg-blue-600/30 text-blue-200 border border-blue-500/30";

    const badgeText = isLive ? "EVENTO EM ANDAMENTO" : "PRÓXIMO EVENTO";

    return (
        <div 
            onClick={onClick}
            className={`w-full rounded-2xl shadow-xl overflow-hidden cursor-pointer relative group border transition-all hover:shadow-2xl hover:scale-[1.01] mb-8 ${bgClass}`}
        >
            <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                <LucideTrophy size={200} className="transform rotate-12 -translate-y-10 translate-x-10 text-white" />
            </div>

            <div className="p-6 md:p-8 relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${badgeClass}`}>
                        {isLive && <span className="w-2 h-2 bg-white rounded-full"></span>}
                        {badgeText}
                    </div>
                    <span className="text-gray-300 text-xs font-bold uppercase tracking-wide">{event.modalidade}</span>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 leading-tight opacity-90 truncate">
                    {event.nome}
                </h2>
                <p className="text-gray-300 text-sm mb-6">Acompanhe os resultados e próximos jogos.</p>

                {latestFinishedGame ? (
                    <div className="bg-black/20 rounded-xl p-3 border border-white/10 flex items-center justify-between">
                        <div className="text-xs uppercase font-bold text-green-400 mb-1">Último Resultado</div>
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-white">{isInternal(latestFinishedGame) ? latestFinishedGame.timeA_nome : 'ANCB'}</span>
                            <span className="bg-white/10 px-2 py-1 rounded text-lg font-black text-white">
                                {latestFinishedGame.placarTimeA_final || latestFinishedGame.placarANCB_final || 0} - {latestFinishedGame.placarTimeB_final || latestFinishedGame.placarAdversario_final || 0}
                            </span>
                            <span className="font-bold text-white">{isInternal(latestFinishedGame) ? latestFinishedGame.timeB_nome : (latestFinishedGame.adversario || 'ADV')}</span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-black/20 rounded-xl p-3 border border-white/10 text-center text-gray-400 text-sm italic">
                        Nenhum jogo finalizado ainda.
                    </div>
                )}
            </div>
        </div>
    );
};
