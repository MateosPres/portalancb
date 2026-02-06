
import React, { useState, useEffect } from 'react';
import firebase, { db } from '../services/firebase';
import { Jogo, Player, Evento, UserProfile, Cesta } from '../types';
import { Button } from '../components/Button';
import { LucideArrowLeft, LucideSearch, LucideCheckCircle2, LucideLock, LucideEdit, LucideSend } from 'lucide-react';

interface PainelJogoViewProps {
    game: Jogo;
    eventId: string;
    onBack: () => void;
    userProfile?: UserProfile | null;
    isEditable?: boolean; 
}

export const PainelJogoView: React.FC<PainelJogoViewProps> = ({ game, eventId, onBack, userProfile, isEditable = false }) => {
    const [liveGame, setLiveGame] = useState<Jogo>(game);
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [finishing, setFinishing] = useState(false);
    
    const [isInternal, setIsInternal] = useState(false);
    const [teamAPlayers, setTeamAPlayers] = useState<Player[]>([]);
    const [teamBPlayers, setTeamBPlayers] = useState<Player[]>([]);
    
    const [ancbPlayers, setAncbPlayers] = useState<Player[]>([]);
    const [searchPlayer, setSearchPlayer] = useState('');
    const [mobileTab, setMobileTab] = useState<'left' | 'right'>('left');

    const isAdmin = userProfile?.role === 'admin';

    useEffect(() => {
        const unsubGame = db.collection("eventos").doc(eventId).collection("jogos").doc(game.id).onSnapshot((docSnap) => {
            if (docSnap.exists) {
                const updatedGame = { id: docSnap.id, ...(docSnap.data() as any) } as Jogo;
                setLiveGame(updatedGame);
                const _isInternal = !!updatedGame.timeA_id && !!updatedGame.timeB_id;
                setIsInternal(_isInternal);
            }
        });

        const initData = async () => {
            try {
                const pSnap = await db.collection("jogadores").orderBy("nome").get();
                const players = pSnap.docs.map(d => {
                    const data = d.data() as any;
                    return { id: d.id, ...data, nome: data.nome || 'Unknown' } as Player;
                });
                setAllPlayers(players);

                const eventDoc = await db.collection("eventos").doc(eventId).get();
                if (eventDoc.exists) {
                    const eventData = eventDoc.data() as Evento;
                    
                    if (game.timeA_id && game.timeB_id && eventData.times) {
                        const teamA = eventData.times.find(t => t.id === game.timeA_id);
                        const teamB = eventData.times.find(t => t.id === game.timeB_id);

                        if (teamA) {
                            setTeamAPlayers(players.filter(p => teamA.jogadores.includes(p.id)));
                        }
                        if (teamB) {
                            setTeamBPlayers(players.filter(p => teamB.jogadores.includes(p.id)));
                        }
                    } else {
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
        
        await db.collection("eventos").doc(eventId).collection("jogos").doc(game.id).collection("cestas").add({
            pontos: points,
            jogadorId: player.id,
            nomeJogador: player.nome || 'Unknown',
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            timeId: teamSide
        });

        const fieldToUpdate = teamSide === 'A' ? 'placarTimeA_final' : 'placarTimeB_final';
        const currentScore = teamSide === 'A' ? (liveGame.placarTimeA_final || 0) : (liveGame.placarTimeB_final || 0);
        
        const currentGameRoster = liveGame.jogadoresEscalados || [];
        const newGameRoster = currentGameRoster.includes(player.id) ? currentGameRoster : [...currentGameRoster, player.id];

        await db.collection("eventos").doc(eventId).collection("jogos").doc(game.id).update({
            [fieldToUpdate]: currentScore + points,
            jogadoresEscalados: newGameRoster
        });
    };

    const handleFinishGame = async () => {
        if (!isAdmin) return;
        if (!window.confirm("ATENÇÃO: Finalizar a partida notificará os jogadores para avaliação. Continuar?")) return;
        
        setFinishing(true);
        try {
            let gameRosterIds: string[] = [];
            
            if (isInternal) {
                const teamAIds = teamAPlayers.map(p => p.id);
                const teamBIds = teamBPlayers.map(p => p.id);
                gameRosterIds = [...teamAIds, ...teamBIds];
            } else {
                gameRosterIds = ancbPlayers.map(p => p.id);
            }
            gameRosterIds = Array.from(new Set(gameRosterIds));

            await db.collection("eventos").doc(eventId).collection("jogos").doc(game.id).update({ 
                status: 'finalizado',
                jogadoresEscalados: gameRosterIds
            });

            const batch = db.batch();
            let notificationCount = 0;

            gameRosterIds.forEach(playerId => {
                const player = allPlayers.find(p => p.id === playerId);
                if (player && player.userId) {
                    const notifRef = db.collection("notifications").doc();
                    batch.set(notifRef, {
                        targetUserId: player.userId,
                        type: 'pending_review',
                        title: 'Partida Finalizada!',
                        message: `Avalie seus companheiros do jogo ${liveGame.timeA_nome || 'ANCB'} vs ${liveGame.timeB_nome || liveGame.adversario || 'ADV'}.`,
                        gameId: game.id,
                        eventId: eventId,
                        read: false,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    notificationCount++;
                }
            });

            await batch.commit();
            alert(`Partida finalizada! ${notificationCount} notificações enviadas.`);
            onBack();
        } catch (e) {
            console.error(e);
            alert("Erro ao finalizar partida.");
        } finally {
            setFinishing(false);
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

    if (liveGame.status === 'finalizado' && !isEditable) {
        return (
            <div className="fixed inset-0 bg-slate-900 z-[200] flex flex-col items-center justify-center text-white font-sans p-6 text-center animate-fadeIn">
                <LucideLock className="text-gray-500 mb-4" size={64} />
                <h2 className="text-2xl font-bold mb-2">Partida Finalizada</h2>
                <p className="text-gray-400 mb-6">Esta partida já foi encerrada e contabilizada. O painel de pontuação está bloqueado.</p>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={onBack} className="!border-gray-600 !text-gray-300 hover:!bg-gray-800">
                        Voltar
                    </Button>
                </div>
                <p className="mt-8 text-xs text-gray-600">Administradores podem corrigir a súmula através do botão "Editar" no Painel Administrativo.</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900 z-[200] flex flex-col text-white font-sans">
            <div className={`h-14 px-4 flex items-center justify-between border-b border-slate-800 z-20 ${isEditable ? 'bg-orange-900/20 border-orange-800' : 'bg-slate-900'}`}>
                <Button variant="secondary" size="sm" onClick={onBack} className="!text-gray-400 !border-gray-700 hover:!bg-slate-800 hover:!text-white"><LucideArrowLeft size={18} /></Button>
                {isEditable && <span className="text-xs font-bold text-orange-500 uppercase flex items-center gap-1"><LucideEdit size={14}/> Modo de Edição</span>}
                {isAdmin && !isEditable && (
                    <Button size="sm" onClick={handleFinishGame} disabled={finishing} className="bg-green-600 hover:bg-green-500 text-white border-none shadow-green-900/20 shadow-lg">
                        {finishing ? <LucideSend className="animate-spin" size={16} /> : <><LucideCheckCircle2 size={16} /> Fim</>}
                    </Button>
                )}
            </div>
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
            <div className="px-4 pt-2">
                <div className="relative">
                    <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input 
                        type="text" placeholder="Filtrar..." 
                        className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-ancb-blue text-sm"
                        value={searchPlayer} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchPlayer(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex-1 overflow-hidden relative flex flex-col">
                {isInternal ? (
                    <>
                        <div className="md:hidden flex border-b border-slate-800 mt-2">
                            <button 
                                onClick={() => setMobileTab('left')}
                                className={`flex-1 py-2 text-sm font-bold uppercase transition-colors ${mobileTab === 'left' ? 'text-ancb-blue border-b-2 border-ancb-blue bg-slate-800/50' : 'text-gray-500'}`}
                            >
                                {liveGame.timeA_nome}
                            </button>
                            <button 
                                onClick={() => setMobileTab('right')}
                                className={`flex-1 py-2 text-sm font-bold uppercase transition-colors ${mobileTab === 'right' ? 'text-ancb-blue border-b-2 border-ancb-blue bg-slate-800/50' : 'text-gray-500'}`}
                            >
                                {liveGame.timeB_nome}
                            </button>
                        </div>
                        <div className="flex-1 flex overflow-hidden">
                            <div className={`flex-1 flex flex-col ${mobileTab === 'left' ? 'block' : 'hidden md:flex'} border-r border-slate-800`}>
                                <PlayerList players={teamAPlayers} teamSide="A" />
                            </div>
                            <div className={`flex-1 flex flex-col ${mobileTab === 'right' ? 'block' : 'hidden md:flex'}`}>
                                <PlayerList players={teamBPlayers} teamSide="B" />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col">
                        <PlayerList players={ancbPlayers} teamSide="A" />
                    </div>
                )}
            </div>
        </div>
    );
};
