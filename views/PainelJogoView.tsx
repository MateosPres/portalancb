
import React, { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, updateDoc, addDoc, serverTimestamp, getDocs, query, orderBy, getDoc, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Jogo, Player, Evento, PlayerReview, UserProfile, Time } from '../types';
import { Button } from '../components/Button';
import { LucideArrowLeft, LucideSearch, LucideCheckCircle2, LucideUsers, LucideShield } from 'lucide-react';

interface PainelJogoViewProps {
    game: Jogo;
    eventId: string;
    onBack: () => void;
    userProfile?: UserProfile | null;
}

export const PainelJogoView: React.FC<PainelJogoViewProps> = ({ game, eventId, onBack, userProfile }) => {
    const [liveGame, setLiveGame] = useState<Jogo>(game);
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    
    // Internal Tournament State
    const [isInternal, setIsInternal] = useState(false);
    const [teamAPlayers, setTeamAPlayers] = useState<Player[]>([]);
    const [teamBPlayers, setTeamBPlayers] = useState<Player[]>([]);
    
    // External Tournament State
    const [ancbPlayers, setAncbPlayers] = useState<Player[]>([]);

    const [searchPlayer, setSearchPlayer] = useState('');
    
    // UI State for Mobile Toggle
    const [mobileTab, setMobileTab] = useState<'left' | 'right'>('left');

    const isAdmin = userProfile?.role === 'admin';

    useEffect(() => {
        // 1. Real-time game updates
        const unsubGame = onSnapshot(doc(db, "eventos", eventId, "jogos", game.id), (doc) => {
            if (doc.exists()) {
                const updatedGame = { id: doc.id, ...doc.data() } as Jogo;
                setLiveGame(updatedGame);
                
                // Check internal status
                const _isInternal = !!updatedGame.timeA_id && !!updatedGame.timeB_id;
                setIsInternal(_isInternal);
            }
        });

        // 2. Fetch Players & Event Teams
        const initData = async () => {
            try {
                // Fetch All Players
                const pSnap = await getDocs(query(collection(db, "jogadores"), orderBy("nome")));
                const players = pSnap.docs.map(d => ({ id: d.id, ...d.data(), nome: d.data().nome || 'Unknown' } as Player));
                setAllPlayers(players);

                // Fetch Event Data to get Teams
                const eventDoc = await getDoc(doc(db, "eventos", eventId));
                if (eventDoc.exists()) {
                    const eventData = eventDoc.data() as Evento;
                    
                    if (game.timeA_id && game.timeB_id && eventData.times) {
                        // Internal Tournament Logic
                        const teamA = eventData.times.find(t => t.id === game.timeA_id);
                        const teamB = eventData.times.find(t => t.id === game.timeB_id);

                        if (teamA) {
                            setTeamAPlayers(players.filter(p => teamA.jogadores.includes(p.id)));
                        }
                        if (teamB) {
                            setTeamBPlayers(players.filter(p => teamB.jogadores.includes(p.id)));
                        }
                    } else {
                        // External Logic (Default ANCB Roster)
                        const rosterIds = eventData.jogadoresEscalados || [];
                        setAncbPlayers(players.filter(p => rosterIds.includes(p.id)));
                    }
                }
            } catch (e) {
                console.error("Error initializing game panel", e);
            }
        };

        initData();

        return () => unsubGame();
    }, [game.id, eventId]);

    const handleAddPoint = async (player: Player, points: 1 | 2 | 3, teamSide: 'A' | 'B') => {
        if (!isAdmin) return;
        
        // 1. Add Cesta Document
        await addDoc(collection(db, "eventos", eventId, "jogos", game.id, "cestas"), {
            pontos: points,
            jogadorId: player.id,
            nomeJogador: player.nome || 'Unknown',
            timestamp: serverTimestamp(),
            timeId: teamSide // 'A' or 'B'
        });

        // 2. Update Game Score
        const fieldToUpdate = teamSide === 'A' ? 'placarTimeA_final' : 'placarTimeB_final';
        const currentScore = teamSide === 'A' ? (liveGame.placarTimeA_final || 0) : (liveGame.placarTimeB_final || 0);
        
        // 3. Update Game Roster History (ensure player is marked as played)
        const currentGameRoster = liveGame.jogadoresEscalados || [];
        const newGameRoster = currentGameRoster.includes(player.id) ? currentGameRoster : [...currentGameRoster, player.id];

        await updateDoc(doc(db, "eventos", eventId, "jogos", game.id), {
            [fieldToUpdate]: currentScore + points,
            jogadoresEscalados: newGameRoster
        });
    };

    const handleAddGeneralPoint = async (points: 1 | 2 | 3) => {
        if (!isAdmin) return;
        const currentScore = liveGame.placarTimeB_final || 0;
        await updateDoc(doc(db, "eventos", eventId, "jogos", game.id), {
            placarTimeB_final: currentScore + points
        });
    };

    const handleFinishGame = async () => {
        if (!isAdmin) return;
        if (!window.confirm("Finalizar partida?")) return;
        try {
            await updateDoc(doc(db, "eventos", eventId, "jogos", game.id), { status: 'finalizado' });
            alert("Partida finalizada!");
            onBack();
        } catch (e) {
            console.error(e);
            alert("Erro ao finalizar partida.");
        }
    };

    const PlayerList = ({ players, teamSide }: { players: Player[], teamSide: 'A' | 'B' }) => {
        const filtered = players.filter(p => 
            (p.nome || '').toLowerCase().includes(searchPlayer.toLowerCase()) || 
            (p.apelido || '').toLowerCase().includes(searchPlayer.toLowerCase())
        );

        return (
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 p-4">
                {filtered.map(player => (
                    <div key={player.id} className="bg-slate-800 p-2 rounded-xl flex items-center justify-between border border-slate-700 hover:border-slate-600 transition-all">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center border-2 border-slate-600">
                                {player.foto ? <img src={player.foto} className="w-full h-full object-cover" /> : <span className="text-gray-400 font-bold">{player.nome.charAt(0)}</span>}
                            </div>
                            <div>
                                <p className="font-bold text-white text-sm leading-tight max-w-[100px] truncate">{player.apelido || player.nome.split(' ')[0]}</p>
                                <span className="text-[10px] text-gray-400 bg-slate-900 px-1 py-0.5 rounded">#{player.numero_uniforme}</span>
                            </div>
                        </div>
                        {isAdmin && (
                            <div className="flex gap-1">
                                <button onClick={() => handleAddPoint(player, 1, teamSide)} className="w-8 h-8 rounded-lg bg-slate-700 text-white font-bold hover:bg-ancb-blue transition-colors border border-slate-600 active:scale-95 text-xs">+1</button>
                                <button onClick={() => handleAddPoint(player, 2, teamSide)} className="w-8 h-8 rounded-lg bg-slate-700 text-white font-bold hover:bg-ancb-blue transition-colors border border-slate-600 active:scale-95 text-xs">+2</button>
                                <button onClick={() => handleAddPoint(player, 3, teamSide)} className="w-8 h-8 rounded-lg bg-slate-700 text-white font-bold hover:bg-ancb-blue transition-colors border border-slate-600 active:scale-95 text-xs">+3</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-slate-900 z-[200] flex flex-col text-white font-sans">
            {/* 1. HEADER */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800 bg-slate-900 z-20">
                <Button variant="secondary" size="sm" onClick={onBack} className="!text-gray-400 !border-gray-700 hover:!bg-slate-800 hover:!text-white"><LucideArrowLeft size={18} /></Button>
                {isAdmin && <Button size="sm" onClick={handleFinishGame} className="bg-green-600 hover:bg-green-500 text-white border-none shadow-green-900/20 shadow-lg"><LucideCheckCircle2 size={16} /> Fim</Button>}
            </div>

            {/* 2. SCOREBOARD */}
            <div className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10 shadow-2xl">
                <div className="flex justify-between items-center max-w-4xl mx-auto">
                    <div className="flex-1 text-center">
                        <h2 className="text-xs md:text-sm font-bold text-ancb-blue uppercase tracking-widest mb-1 truncate px-2">{liveGame.timeA_nome || 'ANCB'}</h2>
                        <span className="text-5xl md:text-6xl font-bold text-white tabular-nums leading-none tracking-tighter">{liveGame.placarTimeA_final || 0}</span>
                    </div>
                    <div className="px-4 text-slate-700 font-black text-2xl select-none">:</div>
                    <div className="flex-1 text-center">
                        <h2 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-1 truncate px-2">{liveGame.timeB_nome || liveGame.adversario || 'ADV'}</h2>
                        <span className="text-5xl md:text-6xl font-bold text-gray-300 tabular-nums leading-none tracking-tighter">{liveGame.placarTimeB_final || 0}</span>
                    </div>
                </div>
            </div>

            {/* 3. SEARCH BAR (Common) */}
            <div className="px-4 pt-2">
                <div className="relative">
                    <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input 
                        type="text" placeholder="Filtrar..." 
                        className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-ancb-blue text-sm"
                        value={searchPlayer} onChange={(e) => setSearchPlayer(e.target.value)}
                    />
                </div>
            </div>

            {/* 4. CONTENT AREA */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
                {/* MOBILE TABS */}
                <div className="md:hidden flex border-b border-slate-800 mt-2">
                    <button 
                        onClick={() => setMobileTab('left')}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${mobileTab === 'left' ? 'text-ancb-blue border-b-2 border-ancb-blue bg-slate-800/50' : 'text-gray-500'}`}
                    >
                        {liveGame.timeA_nome || 'ANCB'}
                    </button>
                    <button 
                        onClick={() => setMobileTab('right')}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${mobileTab === 'right' ? 'text-white border-b-2 border-white bg-slate-800/50' : 'text-gray-500'}`}
                    >
                        {liveGame.timeB_nome || liveGame.adversario || 'ADV'}
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* LEFT COLUMN (Team A / ANCB) */}
                    <div className={`flex-1 border-r border-slate-800 flex flex-col ${mobileTab === 'right' ? 'hidden md:flex' : ''}`}>
                        {isInternal ? (
                            <PlayerList players={teamAPlayers} teamSide="A" />
                        ) : (
                            <PlayerList players={ancbPlayers} teamSide="A" />
                        )}
                    </div>

                    {/* RIGHT COLUMN (Team B / Opponent) */}
                    <div className={`flex-1 flex flex-col ${mobileTab === 'left' ? 'hidden md:flex' : ''}`}>
                        {isInternal ? (
                            <PlayerList players={teamBPlayers} teamSide="B" />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-900/50">
                                <h3 className="text-gray-400 font-bold uppercase tracking-widest mb-8 text-sm">Pontuar Adversário</h3>
                                <div className="flex flex-col gap-3 w-full max-w-xs">
                                    {isAdmin ? (
                                        <>
                                            <button onClick={() => handleAddGeneralPoint(1)} className="py-4 rounded-xl bg-slate-800 border border-slate-700 text-white hover:border-red-500 active:scale-95 flex items-center justify-center gap-3 shadow-lg"><span className="text-2xl font-bold">+1</span><span className="text-xs uppercase text-gray-500">Livre</span></button>
                                            <button onClick={() => handleAddGeneralPoint(2)} className="py-4 rounded-xl bg-slate-800 border border-slate-700 text-white hover:border-red-500 active:scale-95 flex items-center justify-center gap-3 shadow-lg"><span className="text-2xl font-bold">+2</span><span className="text-xs uppercase text-gray-500">Pontos</span></button>
                                            <button onClick={() => handleAddGeneralPoint(3)} className="py-4 rounded-xl bg-slate-800 border border-slate-700 text-white hover:border-red-500 active:scale-95 flex items-center justify-center gap-3 shadow-lg"><span className="text-2xl font-bold">+3</span><span className="text-xs uppercase text-gray-500">Longa</span></button>
                                        </>
                                    ) : (
                                        <p className="text-center text-gray-500 text-xs">Apenas admins.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
