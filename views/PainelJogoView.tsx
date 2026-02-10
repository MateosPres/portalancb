
import React, { useState, useEffect } from 'react';
import firebase, { db } from '../services/firebase';
import { Jogo, Player, Evento, Cesta } from '../types';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { 
    LucideArrowLeft, LucideRotateCcw, LucideCheckCircle2, LucideUsers, 
    LucideTrophy, LucideActivity, LucideUser, LucidePlayCircle, LucideCalendarClock
} from 'lucide-react';
import { collection, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, increment, onSnapshot } from 'firebase/firestore';

interface PainelJogoViewProps {
    game: Jogo;
    eventId: string;
    onBack: () => void;
    userProfile?: any;
    isEditable?: boolean; 
}

// History item for Undo functionality
interface ScoreAction {
    cestaId: string;
    gameId: string;
    points: number;
    teamSide: 'A' | 'B';
    playerId?: string | null;
}

interface PlayerButtonProps {
    player: Player;
    onClick: () => void;
}

const PlayerButton: React.FC<PlayerButtonProps> = ({ player, onClick }) => (
    <button 
        onClick={onClick}
        className="flex flex-col items-center p-2 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/5 transition-all"
    >
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-700 overflow-hidden mb-2 border-2 border-white/10 relative">
            {player.foto ? <img src={player.foto} className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center font-bold text-white/50">{player.nome.charAt(0)}</span>}
            <div className="absolute bottom-0 right-0 bg-ancb-orange text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-gray-900">
                {player.numero_uniforme}
            </div>
        </div>
        <span className="text-xs font-bold text-white text-center leading-tight line-clamp-1 w-full">
            {player.apelido || player.nome.split(' ')[0]}
        </span>
    </button>
);

export const PainelJogoView: React.FC<PainelJogoViewProps> = ({ game, eventId, onBack, userProfile }) => {
    // Game State
    const [liveGame, setLiveGame] = useState<Jogo>(game);
    const [teamAPlayers, setTeamAPlayers] = useState<Player[]>([]);
    const [teamBPlayers, setTeamBPlayers] = useState<Player[]>([]);
    
    // UI State
    const [selectedPlayerForScoring, setSelectedPlayerForScoring] = useState<{player: Player, teamSide: 'A'|'B'} | null>(null);
    const [actionHistory, setActionHistory] = useState<ScoreAction[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super-admin';

    // 1. Initialize Data (Game & Rosters)
    useEffect(() => {
        // Real-time Game Updates
        const unsubGame = onSnapshot(doc(db, "eventos", eventId, "jogos", game.id), (docSnap) => {
            if (docSnap.exists) {
                setLiveGame({ id: docSnap.id, ...(docSnap.data() as any) } as Jogo);
            }
        });

        // Load Players & Teams Logic
        const loadRosters = async () => {
            const pSnap = await db.collection("jogadores").orderBy("nome").get();
            const allPlayers = pSnap.docs.map(d => ({ id: d.id, ...d.data(), nome: d.data().nome || 'Atleta' } as Player));
            
            const eventDoc = await db.collection("eventos").doc(eventId).get();
            if (eventDoc.exists) {
                const eventData = eventDoc.data() as Evento;
                
                // Logic: Internal Tournament vs External/Friendly
                if (game.timeA_id && game.timeB_id && eventData.times) {
                    // Internal
                    const teamA = eventData.times.find(t => t.id === game.timeA_id);
                    const teamB = eventData.times.find(t => t.id === game.timeB_id);
                    if (teamA) setTeamAPlayers(allPlayers.filter(p => teamA.jogadores.includes(p.id)));
                    if (teamB) setTeamBPlayers(allPlayers.filter(p => teamB.jogadores.includes(p.id)));
                } else {
                    // External: Team A is usually ANCB (Roster), Team B is Opponent (No Roster)
                    // Check if game has specific roster, else use event roster
                    const rosterIds = eventData.jogadoresEscalados || [];
                    const ancbParams = allPlayers.filter(p => rosterIds.includes(p.id));
                    
                    // Assume Team A is ANCB if name contains ANCB or is empty/default
                    const nameA = (game.timeA_nome || '').toUpperCase();
                    if (nameA.includes('ANCB') || !game.timeB_id) {
                        setTeamAPlayers(ancbParams);
                        setTeamBPlayers([]); // External opponents usually don't have registered players in DB
                    } else {
                        // Rare case where ANCB is Team B
                        setTeamBPlayers(ancbParams);
                        setTeamAPlayers([]);
                    }
                }
            }
        };
        loadRosters();

        return () => unsubGame();
    }, [game.id, eventId]);

    // 2. Score Logic
    const handleAddPoint = async (points: 1 | 2 | 3, teamSide: 'A' | 'B', player?: Player) => {
        if (!isAdmin || isProcessing) return;
        setIsProcessing(true);
        if (selectedPlayerForScoring) setSelectedPlayerForScoring(null); // Close modal

        try {
            // 1. Add Cesta Document
            const cestaData = {
                pontos: points,
                jogadorId: player ? player.id : null,
                nomeJogador: player ? (player.apelido || player.nome) : null,
                timestamp: serverTimestamp(),
                timeId: teamSide === 'A' ? (liveGame.timeA_id || 'A') : (liveGame.timeB_id || 'B'),
                jogoId: game.id,
                eventoId: eventId
            };
            
            const docRef = await addDoc(collection(db, "eventos", eventId, "jogos", game.id, "cestas"), cestaData);

            // 2. Update Game Totals (Atomic Increment)
            const fieldToUpdate = teamSide === 'A' ? 'placarTimeA_final' : 'placarTimeB_final';
            const legacyField = teamSide === 'A' ? 'placarANCB_final' : 'placarAdversario_final';
            
            const updates: any = {
                [fieldToUpdate]: increment(points),
                [legacyField]: increment(points),
                status: 'andamento' // Ensure active if scoring happens
            };

            // Add player to game roster for stats tracking if not present
            if (player) {
                const currentRoster = liveGame.jogadoresEscalados || [];
                if (!currentRoster.includes(player.id)) {
                    updates.jogadoresEscalados = [...currentRoster, player.id];
                }
            }

            await updateDoc(doc(db, "eventos", eventId, "jogos", game.id), updates);

            // 3. Push to Local History for Undo
            const newAction: ScoreAction = {
                cestaId: docRef.id,
                gameId: game.id,
                points: points,
                teamSide: teamSide,
                playerId: player?.id
            };
            setActionHistory(prev => [...prev, newAction]);

        } catch (e) {
            console.error("Error scoring", e);
            alert("Erro ao registrar ponto.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUndo = async () => {
        if (actionHistory.length === 0 || isProcessing) return;
        setIsProcessing(true);

        const lastAction = actionHistory[actionHistory.length - 1];

        try {
            // 1. Delete Cesta Doc
            await deleteDoc(doc(db, "eventos", eventId, "jogos", game.id, "cestas", lastAction.cestaId));

            // 2. Decrement Game Score
            const fieldToUpdate = lastAction.teamSide === 'A' ? 'placarTimeA_final' : 'placarTimeB_final';
            const legacyField = lastAction.teamSide === 'A' ? 'placarANCB_final' : 'placarAdversario_final';

            await updateDoc(doc(db, "eventos", eventId, "jogos", game.id), {
                [fieldToUpdate]: increment(-lastAction.points),
                [legacyField]: increment(-lastAction.points)
            });

            // 3. Pop from History
            setActionHistory(prev => prev.slice(0, -1));

        } catch (e) {
            console.error("Error undoing", e);
            alert("Erro ao desfazer.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleStartGame = async () => {
        if (!isAdmin) return;
        if (!window.confirm("Iniciar a partida oficialmente? Isso enviará uma notificação de jogo ao vivo.")) return;
        try {
            setIsProcessing(true);
            await updateDoc(doc(db, "eventos", eventId, "jogos", game.id), { status: 'andamento' });
            // Also update event status if not active
            await updateDoc(doc(db, "eventos", eventId), { status: 'andamento' });
        } catch (e) {
            alert("Erro ao iniciar jogo.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFinishGame = async () => {
        if (!isAdmin) return;
        if (!window.confirm("Confirmar placar final e encerrar partida?")) return;
        try {
            await updateDoc(doc(db, "eventos", eventId, "jogos", game.id), { status: 'finalizado' });
            onBack();
        } catch (e) { alert("Erro ao finalizar."); }
    };

    // --- UI COMPONENTS ---

    const ScoreButton = ({ points, onClick, colorClass }: { points: number, onClick: () => void, colorClass: string }) => (
        <button 
            onClick={onClick}
            disabled={isProcessing}
            className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all ${colorClass} disabled:opacity-50`}
        >
            <span className="text-4xl font-black mb-1">+{points}</span>
            <span className="text-[10px] uppercase font-bold opacity-80">
                {points === 1 ? 'Livre' : points === 2 ? 'Curta' : 'Longa'}
            </span>
        </button>
    );

    const TeamPanel = ({ 
        name, 
        players, 
        score, 
        side, 
        colorClass 
    }: { 
        name: string, 
        players: Player[], 
        score: number, 
        side: 'A' | 'B', 
        colorClass: string 
    }) => {
        return (
            <div className={`flex-1 flex flex-col h-full relative ${colorClass} overflow-hidden`}>
                {/* Score Header */}
                <div className="flex flex-col items-center justify-center py-6 border-b border-white/10 bg-black/10 shrink-0">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/60 mb-1 px-4 text-center truncate w-full">{name}</h3>
                    <span className="text-8xl font-black text-white leading-none tracking-tighter drop-shadow-xl">{score}</span>
                </div>

                {/* Controls Area */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {players.length > 0 ? (
                        /* Scenario A: Roster Exists */
                        <div className="grid grid-cols-3 gap-3 content-start pb-4">
                            {players.map(p => (
                                <PlayerButton 
                                    key={p.id} 
                                    player={p} 
                                    onClick={() => setSelectedPlayerForScoring({ player: p, teamSide: side })} 
                                />
                            ))}
                        </div>
                    ) : (
                        /* Scenario B: No Roster (Direct Team Score) */
                        <div className="h-full flex flex-col justify-center gap-4 max-w-xs mx-auto">
                            <p className="text-center text-white/30 text-xs uppercase font-bold mb-2">Pontuação de Time</p>
                            <div className="grid grid-cols-3 gap-4">
                                <ScoreButton points={1} onClick={() => handleAddPoint(1, side)} colorClass="bg-green-600 hover:bg-green-500 text-white" />
                                <ScoreButton points={2} onClick={() => handleAddPoint(2, side)} colorClass="bg-blue-600 hover:bg-blue-500 text-white" />
                                <ScoreButton points={3} onClick={() => handleAddPoint(3, side)} colorClass="bg-orange-600 hover:bg-orange-500 text-white" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Calculate Scores Safely
    const scoreA = liveGame.placarTimeA_final ?? liveGame.placarANCB_final ?? 0;
    const scoreB = liveGame.placarTimeB_final ?? liveGame.placarAdversario_final ?? 0;
    const isLive = liveGame.status === 'andamento';

    return (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col text-white font-sans overflow-hidden">
            
            {/* 1. TOP HEADER (Control Bar) */}
            <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 shrink-0 z-20 shadow-xl">
                <Button variant="secondary" size="sm" onClick={onBack} className="!text-gray-400 !border-gray-700 hover:!bg-gray-800 hover:!text-white !p-2 rounded-full">
                    <LucideArrowLeft size={20} />
                </Button>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Painel de Jogo</span>
                        {isLive ? (
                            <div className="flex items-center gap-2 text-xs font-bold text-red-500 animate-pulse">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div> AO VIVO
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-xs font-bold text-yellow-500">
                                <LucideCalendarClock size={12} /> PRÉ-JOGO
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {!isLive && isAdmin && (
                        <button 
                            onClick={handleStartGame}
                            disabled={isProcessing}
                            className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg shadow-lg border border-green-500 flex items-center gap-1 text-xs font-bold uppercase tracking-wider animate-pulse transition-all"
                        >
                            <LucidePlayCircle size={16} /> INICIAR
                        </button>
                    )}
                    
                    <button 
                        onClick={handleUndo} 
                        disabled={actionHistory.length === 0}
                        className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-30 transition-all border border-gray-700"
                        title="Desfazer último ponto"
                    >
                        <LucideRotateCcw size={20} />
                    </button>
                    
                    {isAdmin && isLive && (
                        <button 
                            onClick={handleFinishGame}
                            className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full shadow-lg border border-gray-600 flex items-center gap-1 px-3 text-xs font-bold uppercase tracking-wider transition-all"
                        >
                            <LucideCheckCircle2 size={16} /> Fim
                        </button>
                    )}
                </div>
            </div>

            {/* 2. SPLIT VIEW AREA */}
            <div className="flex-1 flex flex-col md:flex-row relative">
                {/* Team A Panel (Left/Top) - Usually Home/ANCB */}
                <TeamPanel 
                    name={liveGame.timeA_nome || 'ANCB'} 
                    players={teamAPlayers} 
                    score={scoreA} 
                    side="A" 
                    colorClass="bg-[#0f172a]" // Slate-900
                />

                {/* Divider (Visual) */}
                <div className="h-1 w-full md:w-1 md:h-full bg-gray-800 z-10"></div>

                {/* Team B Panel (Right/Bottom) - Usually Visitor */}
                <TeamPanel 
                    name={liveGame.timeB_nome || liveGame.adversario || 'Adversário'} 
                    players={teamBPlayers} 
                    score={scoreB} 
                    side="B" 
                    colorClass="bg-[#1e293b]" // Slate-800
                />
            </div>

            {/* 3. PLAYER SCORING MODAL (Bottom Sheet style) */}
            {selectedPlayerForScoring && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center animate-fadeIn">
                    <div className="bg-white dark:bg-gray-900 w-full md:w-96 rounded-t-2xl md:rounded-2xl p-6 shadow-2xl border-t md:border border-gray-800 animate-slideUp">
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-gray-700 border-4 border-ancb-orange overflow-hidden mb-3 shadow-lg">
                                {selectedPlayerForScoring.player.foto ? 
                                    <img src={selectedPlayerForScoring.player.foto} className="w-full h-full object-cover" /> : 
                                    <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-gray-400">{selectedPlayerForScoring.player.nome.charAt(0)}</div>
                                }
                            </div>
                            <h3 className="text-xl font-bold text-white text-center leading-tight">
                                {selectedPlayerForScoring.player.apelido || selectedPlayerForScoring.player.nome}
                            </h3>
                            <p className="text-gray-400 text-xs font-bold uppercase">
                                {selectedPlayerForScoring.teamSide === 'A' ? (liveGame.timeA_nome || 'ANCB') : (liveGame.timeB_nome || 'Visitante')}
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <ScoreButton points={1} onClick={() => handleAddPoint(1, selectedPlayerForScoring.teamSide, selectedPlayerForScoring.player)} colorClass="bg-green-600 hover:bg-green-500 text-white" />
                            <ScoreButton points={2} onClick={() => handleAddPoint(2, selectedPlayerForScoring.teamSide, selectedPlayerForScoring.player)} colorClass="bg-blue-600 hover:bg-blue-500 text-white" />
                            <ScoreButton points={3} onClick={() => handleAddPoint(3, selectedPlayerForScoring.teamSide, selectedPlayerForScoring.player)} colorClass="bg-orange-600 hover:bg-orange-500 text-white" />
                        </div>

                        <button 
                            onClick={() => setSelectedPlayerForScoring(null)}
                            className="w-full py-4 text-center text-gray-500 font-bold uppercase text-sm hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
