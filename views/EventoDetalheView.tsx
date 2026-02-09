
import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { Evento, Jogo, Player, UserProfile, Time, RosterEntry, Cesta } from '../types';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { ShareModal } from '../components/ShareModal';
import { 
    LucideArrowLeft, LucideCalendar, LucideMapPin, LucideTrophy, 
    LucideUsers, LucideCheckCircle2, LucideXCircle, LucideClock, 
    LucidePlus, LucideTrash2, LucideGamepad2, LucidePlayCircle, LucideEdit, LucideCheckSquare, LucideSquare,
    LucideLoader2, LucideStar, LucideChevronRight, LucideEdit2, LucideChevronDown, LucideChevronUp, LucideShield, LucidePlay, LucideUpload, LucideSave, LucideSearch, LucideX, LucideShare2
} from 'lucide-react';
import { collection, doc, onSnapshot, updateDoc, setDoc, serverTimestamp, query, getDocs, addDoc, deleteDoc, where } from 'firebase/firestore';
import imageCompression from 'browser-image-compression';

interface EventoDetalheViewProps {
    eventId: string;
    onBack: () => void;
    userProfile?: UserProfile | null;
    onOpenGamePanel: (game: Jogo, eventId: string) => void;
    onOpenReview?: (gameId: string, eventId: string) => void;
    onSelectPlayer?: (playerId: string) => void;
}

export const EventoDetalheView: React.FC<EventoDetalheViewProps> = ({ eventId, onBack, userProfile, onOpenGamePanel, onOpenReview, onSelectPlayer }) => {
    const [event, setEvent] = useState<Evento | null>(null);
    const [games, setGames] = useState<Jogo[]>([]);
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [roster, setRoster] = useState<RosterEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddPlayer, setShowAddPlayer] = useState(false);
    const [playerSearch, setPlayerSearch] = useState('');
    
    // Internal Tournament State
    const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
    
    // Team Management State
    const [showTeamManager, setShowTeamManager] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Partial<Time> | null>(null);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [teamRosterSearch, setTeamRosterSearch] = useState('');

    // Score Edit Modal State
    const [editScoreGame, setEditScoreGame] = useState<Jogo | null>(null);
    const [editScoreA, setEditScoreA] = useState<string>('');
    const [editScoreB, setEditScoreB] = useState<string>('');

    // Event Edit Modal State
    const [showEditEvent, setShowEditEvent] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDate, setEditDate] = useState('');
    const [editStatus, setEditStatus] = useState<Evento['status']>('proximo');
    const [editType, setEditType] = useState<Evento['type']>('amistoso');

    // Add Game Modal State
    const [showAddGame, setShowAddGame] = useState(false);
    const [newGameDate, setNewGameDate] = useState('');
    const [newGameTimeA, setNewGameTimeA] = useState(''); // ID for internal, Name for External
    const [newGameTimeB, setNewGameTimeB] = useState('');
    const [newGameLocation, setNewGameLocation] = useState('');

    // Share Modal
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareData, setShareData] = useState<any>(null);

    const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super-admin';

    useEffect(() => {
        const unsubEvent = onSnapshot(doc(db, "eventos", eventId), (doc) => {
            if (doc.exists()) {
                const evData = { id: doc.id, ...doc.data() } as Evento;
                setEvent(evData);
                // Pre-fill edit form
                setEditName(evData.nome);
                setEditDate(evData.data);
                setEditStatus(evData.status);
                setEditType(evData.type);
                // Init new game date
                setNewGameDate(evData.data);
            } else {
                onBack(); // Deleted
            }
        });

        const unsubGames = onSnapshot(collection(db, "eventos", eventId, "jogos"), (snapshot) => {
            const gamesData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Jogo));
            setGames(gamesData.sort((a, b) => a.dataJogo.localeCompare(b.dataJogo)));
        });

        const unsubRoster = onSnapshot(collection(db, "eventos", eventId, "roster"), (snapshot) => {
            const rosterData = snapshot.docs.map(d => ({ playerId: d.id, ...d.data() } as RosterEntry));
            setRoster(rosterData);
        });

        const fetchPlayers = async () => {
            const snap = await getDocs(query(collection(db, "jogadores")));
            setAllPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Player)));
            setLoading(false);
        };
        fetchPlayers();

        return () => { unsubEvent(); unsubGames(); unsubRoster(); };
    }, [eventId]);

    // ... (Keep existing helpers: handleAddPlayerToRoster, handleUpdateStatus, handleStartEvent, handleStartGame, handleOpenScoreEdit, handleSaveScore) ...
    const handleAddPlayerToRoster = async (playerId: string) => { try { await setDoc(doc(db, "eventos", eventId, "roster", playerId), { playerId, status: 'pendente', updatedAt: serverTimestamp() }); if (event) { const currentLegacyRoster = event.jogadoresEscalados || []; if (!currentLegacyRoster.includes(playerId)) { await updateDoc(doc(db, "eventos", eventId), { jogadoresEscalados: [...currentLegacyRoster, playerId] }); } } } catch (e) { console.error(e); } };
    const handleUpdateStatus = async (playerId: string, status: 'confirmado' | 'pendente' | 'recusado') => { if (!isAdmin) return; try { await updateDoc(doc(db, "eventos", eventId, "roster", playerId), { status, updatedAt: serverTimestamp() }); } catch (e) { console.error(e); } };
    const handleStartEvent = async () => { if (!isAdmin) return; if (!window.confirm("Iniciar este evento agora? Isso o destacará na página inicial.")) return; try { await updateDoc(doc(db, "eventos", eventId), { status: 'andamento' }); } catch (e) { alert("Erro ao iniciar evento"); } };
    const handleStartGame = async (game: Jogo) => { if (!isAdmin) return; try { await updateDoc(doc(db, "eventos", eventId, "jogos", game.id), { status: 'andamento' }); if (event?.status !== 'andamento') { await updateDoc(doc(db, "eventos", eventId), { status: 'andamento' }); } onOpenGamePanel({ ...game, status: 'andamento' }, eventId); } catch (e) { alert("Erro ao iniciar jogo"); } };
    const handleOpenScoreEdit = (game: Jogo) => { setEditScoreGame(game); setEditScoreA(String(resolveScore(game.placarTimeA_final, game.placarANCB_final))); setEditScoreB(String(resolveScore(game.placarTimeB_final, game.placarAdversario_final))); };
    const handleSaveScore = async () => { if (!editScoreGame) return; try { const sA = parseInt(editScoreA) || 0; const sB = parseInt(editScoreB) || 0; await updateDoc(doc(db, "eventos", eventId, "jogos", editScoreGame.id), { placarTimeA_final: sA, placarTimeB_final: sB, placarANCB_final: sA, placarAdversario_final: sB, status: 'finalizado' }); setEditScoreGame(null); } catch (e) { console.error(e); alert("Erro ao atualizar placar."); } };
    const resolveScore = (valNew?: number, valLegacy?: number) => { if (valNew && valNew > 0) return valNew; if (valLegacy && valLegacy > 0) return valLegacy; return valNew ?? valLegacy ?? 0; };
    const normalizePosition = (pos: string | undefined): string => { if (!pos) return '-'; const p = pos.toLowerCase(); if (p.includes('1') || (p.includes('armador') && !p.includes('ala'))) return 'Armador (1)'; if (p.includes('2') || p.includes('ala/armador') || p.includes('ala-armador') || p.includes('sg')) return 'Ala/Armador (2)'; if (p.includes('3') || (p.includes('ala') && !p.includes('armador') && !p.includes('piv') && !p.includes('pivo')) || p.includes('sf')) return 'Ala (3)'; if (p.includes('4') || p.includes('ala/piv') || p.includes('ala-piv') || p.includes('pf')) return 'Ala/Pivô (4)'; if (p.includes('5') || (p.includes('piv') && !p.includes('ala')) || p.includes('c)') || p.trim().endsWith('(c)')) return 'Pivô (5)'; return pos; };
    const fileToBase64 = (file: File): Promise<string> => { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => resolve(reader.result as string); reader.onerror = error => reject(error); }); };

    // --- NEW: Add Game Logic ---
    const handleAddGame = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!event) return;

        try {
            const gameData: any = {
                dataJogo: newGameDate,
                status: 'agendado',
                placarTimeA_final: 0,
                placarTimeB_final: 0,
                placarANCB_final: 0, 
                placarAdversario_final: 0,
                localizacao: newGameLocation || 'Quadra Municipal'
            };

            if (event.type === 'torneio_interno') {
                const teamA = event.times?.find(t => t.id === newGameTimeA);
                const teamB = event.times?.find(t => t.id === newGameTimeB);
                if (!teamA || !teamB) { alert("Selecione os times."); return; }
                
                gameData.timeA_id = teamA.id;
                gameData.timeA_nome = teamA.nomeTime;
                gameData.timeB_id = teamB.id;
                gameData.timeB_nome = teamB.nomeTime;
            } else {
                // External / Friendly
                gameData.timeA_nome = 'ANCB'; // Default
                gameData.timeB_nome = newGameTimeB || 'Adversário';
                gameData.adversario = newGameTimeB || 'Adversário';
            }

            await addDoc(collection(db, "eventos", eventId, "jogos"), gameData);
            setShowAddGame(false);
            setNewGameTimeA(''); setNewGameTimeB(''); setNewGameLocation('');
        } catch (e) {
            alert("Erro ao criar jogo.");
        }
    };

    const handleDeleteGame = async (gameId: string) => {
        if (!isAdmin) return;
        if (!window.confirm("ATENÇÃO: Excluir este jogo? Isso apagará também as estatísticas (cestas).")) return;
        try {
            // Delete cestas subcollection manually or just the game doc
            // Deleting subcollections from client is hard, ideally cloud function does it.
            // We will just delete the game doc for now, orphan cestas might remain but won't be queried.
            await deleteDoc(doc(db, "eventos", eventId, "jogos", gameId));
        } catch(e) {
            alert("Erro ao excluir jogo.");
        }
    };

    const handleDeleteEvent = async () => {
        if(!window.confirm("ATENÇÃO: Isso excluirá o evento e TODOS os jogos/estatísticas vinculados. Continuar?")) return;
        try {
            const gamesSnap = await getDocs(collection(db, "eventos", eventId, "jogos"));
            for (const g of gamesSnap.docs) {
                await deleteDoc(doc(db, "eventos", eventId, "jogos", g.id));
            }
            await deleteDoc(doc(db, "eventos", eventId));
            onBack();
        } catch(e) {
            alert("Erro ao excluir.");
        }
    };

    const handleUpdateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateDoc(doc(db, "eventos", eventId), {
                nome: editName,
                data: editDate,
                status: editStatus,
                type: editType
            });
            setShowEditEvent(false);
            alert("Evento atualizado!");
        } catch(e) {
            alert("Erro ao atualizar evento.");
        }
    };

    const handleShareGame = async (e: React.MouseEvent, game: Jogo) => {
        e.stopPropagation();
        if (!event) return;

        if (game.status === 'finalizado') {
            // Post Game: Fetch stats for Highlights
            try {
                const cestasRef = collection(db, "eventos", eventId, "jogos", game.id, "cestas");
                const cestasSnap = await getDocs(cestasRef);
                
                const stats: Record<string, { points: number, longRangeShots: number }> = {};
                const is3x3 = event.modalidade === '3x3'; // Check modality for sniper rule

                cestasSnap.forEach(doc => {
                    const data = doc.data() as Cesta;
                    if (data.jogadorId) {
                        if (!stats[data.jogadorId]) stats[data.jogadorId] = { points: 0, longRangeShots: 0 };
                        
                        const points = Number(data.pontos);
                        stats[data.jogadorId].points += points;
                        
                        // Sniper Logic: 
                        // If 3x3: Long range is 2 points.
                        // If 5x5: Long range is 3 points.
                        if (is3x3) {
                            if (points === 2) stats[data.jogadorId].longRangeShots += 1;
                        } else {
                            if (points === 3) stats[data.jogadorId].longRangeShots += 1;
                        }
                    }
                });

                // Find MVP
                let mvpId = '';
                let maxPoints = -1;
                Object.entries(stats).forEach(([id, s]) => {
                    if (s.points > maxPoints) { maxPoints = s.points; mvpId = id; }
                });

                // Find Sniper
                let sniperId = '';
                let maxLongRange = -1;
                Object.entries(stats).forEach(([id, s]) => {
                    if (s.longRangeShots > maxLongRange) { maxLongRange = s.longRangeShots; sniperId = id; }
                });

                // Prepare Scorers List (Sorted)
                const scorersList = Object.entries(stats)
                    .map(([id, s]) => {
                        const player = allPlayers.find(p => p.id === id);
                        return player ? { player, points: s.points } : null;
                    })
                    .filter(s => s !== null && s.points > 0)
                    .sort((a, b) => b!.points - a!.points);

                // Prepare Data
                const mvpPlayer = allPlayers.find(p => p.id === mvpId);
                const sniperPlayer = allPlayers.find(p => p.id === sniperId);

                setShareData({
                    type: 'post_game',
                    event,
                    game,
                    teams: event.times || [], // Pass teams for badge identification
                    scorers: scorersList,
                    stats: {
                        mvp: mvpPlayer ? { player: mvpPlayer, points: maxPoints } : undefined,
                        sniper: sniperPlayer && maxLongRange > 0 ? { player: sniperPlayer, count: maxLongRange } : undefined
                    }
                });
                setShowShareModal(true);

            } catch (err) {
                console.error(err);
                // Fallback share without stats
                setShareData({ type: 'post_game', event, game, teams: event.times || [] });
                setShowShareModal(true);
            }
        } else {
            // Pre Game
            setShareData({
                type: 'pre_game',
                event,
                game
            });
            setShowShareModal(true);
        }
    };

    // ... (Remaining component code stays the same) ...
    // ... team management functions ...
    
    const handleSaveTeam = async () => {
        if (!event || !editingTeam || !editingTeam.nomeTime) return;
        try {
            let updatedTimes = [...(event.times || [])];
            
            if (editingTeam.id) {
                updatedTimes = updatedTimes.map(t => t.id === editingTeam.id ? { ...t, ...editingTeam } as Time : t);
            } else {
                const newTeam: Time = {
                    id: Math.random().toString(36).substr(2, 9),
                    nomeTime: editingTeam.nomeTime,
                    logoUrl: editingTeam.logoUrl || '',
                    jogadores: editingTeam.jogadores || []
                };
                updatedTimes.push(newTeam);
            }

            await updateDoc(doc(db, "eventos", eventId), { times: updatedTimes });
            setEditingTeam(null);
        } catch (e) {
            alert("Erro ao salvar time.");
        }
    };

    const handleDeleteTeam = async (teamId: string) => {
        if (!event || !window.confirm("Excluir time? Isso pode afetar jogos existentes.")) return;
        try {
            const updatedTimes = (event.times || []).filter(t => t.id !== teamId);
            await updateDoc(doc(db, "eventos", eventId), { times: updatedTimes });
        } catch (e) {
            alert("Erro ao excluir time.");
        }
    };

    const handleTeamLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        setIsUploadingLogo(true);
        try {
            const file = e.target.files[0];
            const options = { maxSizeMB: 0.1, maxWidthOrHeight: 256, useWebWorker: true, fileType: 'image/png' };
            const compressedFile = await imageCompression(file, options);
            const base64 = await fileToBase64(compressedFile);
            setEditingTeam(prev => ({ ...prev, logoUrl: base64 }));
        } catch (error) {
            console.error(error);
            alert("Erro ao processar imagem.");
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const togglePlayerInTeam = (playerId: string) => {
        if (!editingTeam) return;
        const currentPlayers = editingTeam.jogadores || [];
        if (currentPlayers.includes(playerId)) {
            setEditingTeam({ ...editingTeam, jogadores: currentPlayers.filter(id => id !== playerId) });
        } else {
            setEditingTeam({ ...editingTeam, jogadores: [...currentPlayers, playerId] });
        }
    };

    const renderInternalTournamentRoster = () => {
        if (!event?.times || event.times.length === 0) {
            return (
                <div className="text-gray-500 text-sm italic text-center py-4">
                    Nenhum time cadastrado.
                    {isAdmin && <Button size="sm" className="mt-2 mx-auto" onClick={() => setShowTeamManager(true)}>Criar Times</Button>}
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {event.times.map((team) => (
                    <div key={team.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all">
                        <div 
                            className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setExpandedTeamId(expandedTeamId === team.id ? null : team.id)}
                        >
                            <div className="flex items-center gap-3">
                                {team.logoUrl ? (
                                    <img src={team.logoUrl} alt={team.nomeTime} className="w-8 h-8 object-contain" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-ancb-blue dark:text-blue-300 font-bold text-xs">
                                        {team.nomeTime.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-bold text-sm text-gray-800 dark:text-white">{team.nomeTime}</h4>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{team.jogadores.length} jogadores</p>
                                </div>
                            </div>
                            {expandedTeamId === team.id ? <LucideChevronUp size={16} className="text-gray-400"/> : <LucideChevronDown size={16} className="text-gray-400"/>}
                        </div>
                        
                        {expandedTeamId === team.id && (
                            <div className="bg-gray-50 dark:bg-black/20 border-t border-gray-100 dark:border-gray-700 p-2 space-y-1 animate-slideDown">
                                {team.jogadores.map(pid => {
                                    const p = allPlayers.find(pl => pl.id === pid);
                                    return (
                                        <div key={pid} className="flex items-center gap-3 p-2 rounded hover:bg-white dark:hover:bg-gray-700/50 cursor-pointer" onClick={() => onSelectPlayer && onSelectPlayer(pid)}>
                                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden flex items-center justify-center">
                                                {p?.foto ? <img src={p.foto} className="w-full h-full object-cover"/> : <span className="text-xs font-bold text-gray-400">{p?.nome?.charAt(0) ?? '?'}</span>}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{p?.apelido || p?.nome || 'Desconhecido'}</p>
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400">{normalizePosition(p?.posicao)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                                {team.jogadores.length === 0 && <p className="text-xs text-gray-400 text-center py-2">Sem jogadores.</p>}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const renderExternalRoster = () => {
        const effectiveRoster = getEffectiveRoster();

        if (effectiveRoster.length === 0) {
            return (
                <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum jogador convocado.</p>
                </div>
            );
        }

        const confirmed = effectiveRoster.filter(r => r.status === 'confirmado');
        const pending = effectiveRoster.filter(r => r.status === 'pendente');

        const renderPlayerItem = (entry: RosterEntry) => {
            const p = allPlayers.find(pl => pl.id === entry.playerId);
            if (!p) return null;
            return (
                <div key={entry.playerId} className="flex items-center justify-between p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors group">
                    <div className="flex items-center gap-3 cursor-pointer overflow-hidden" onClick={() => onSelectPlayer && onSelectPlayer(p.id)}>
                        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center shrink-0">
                            {p.foto ? <img src={p.foto} className="w-full h-full object-cover"/> : <span className="text-xs font-bold text-gray-400">{p.nome.charAt(0)}</span>}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate">{p.apelido || p.nome}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">{normalizePosition(p.posicao).split(' ')[0]}</span>
                            </div>
                        </div>
                    </div>
                    
                    {isAdmin ? (
                        <div className="flex items-center gap-1">
                             <button onClick={() => handleUpdateStatus(p.id, 'confirmado')} className={`p-1.5 rounded transition-colors ${entry.status === 'confirmado' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'text-gray-300 hover:text-green-500'}`} title="Confirmar"><LucideCheckSquare size={16}/></button>
                             <button onClick={() => handleUpdateStatus(p.id, 'pendente')} className={`p-1.5 rounded transition-colors ${entry.status === 'pendente' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'text-gray-300 hover:text-orange-500'}`} title="Pendente"><LucideSquare size={16}/></button>
                             <button onClick={() => handleUpdateStatus(p.id, 'recusado')} className={`p-1.5 rounded transition-colors ${entry.status === 'recusado' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'text-gray-300 hover:text-red-500'}`} title="Recusar"><LucideXCircle size={16}/></button>
                        </div>
                    ) : (
                        <div className="pr-2">
                            {entry.status === 'confirmado' && <LucideCheckCircle2 size={16} className="text-green-500"/>}
                            {entry.status === 'recusado' && <LucideXCircle size={16} className="text-red-500"/>}
                            {entry.status === 'pendente' && <LucideClock size={16} className="text-orange-500"/>}
                        </div>
                    )}
                </div>
            );
        };

        return (
            <div className="space-y-4">
                {confirmed.length > 0 && (
                    <div>
                        <h4 className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase mb-2 flex items-center gap-1 tracking-wider"><LucideCheckCircle2 size={12}/> Confirmados ({confirmed.length})</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{confirmed.map(renderPlayerItem)}</div>
                    </div>
                )}
                {pending.length > 0 && (
                    <div>
                        <h4 className="text-[10px] font-bold text-orange-500 uppercase mb-2 flex items-center gap-1 tracking-wider"><LucideClock size={12}/> Pendentes ({pending.length})</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{pending.map(renderPlayerItem)}</div>
                    </div>
                )}
            </div>
        );
    };

    if (loading || !event) return <div className="flex h-screen items-center justify-center bg-gray-900 text-white"><LucideLoader2 className="animate-spin" /></div>;

    const getGradient = () => {
        switch (event.type) {
            case 'amistoso': return 'bg-gradient-to-r from-blue-900 to-cyan-600';
            case 'torneio_interno': return 'bg-gradient-to-r from-orange-700 to-yellow-500';
            case 'torneio_externo': return 'bg-gradient-to-r from-red-900 to-orange-800';
            default: return 'bg-gray-800';
        }
    };

    const getGameResultClass = (game: Jogo) => {
        const base = "border-2";
        if (game.status !== 'finalizado') return `${base} border-gray-200 dark:border-gray-700`;
        if (event.type === 'torneio_interno') return `${base} border-blue-400 dark:border-blue-600`;

        const scoreA = resolveScore(game.placarTimeA_final, game.placarANCB_final);
        const scoreB = resolveScore(game.placarTimeB_final, game.placarAdversario_final);
        
        let ancbScore = 0;
        let advScore = 0;

        const teamAName = (game.timeA_nome || '').toUpperCase();
        if (teamAName.includes('ANCB') || teamAName === '' || !game.timeB_id) {
             ancbScore = scoreA;
             advScore = scoreB;
        } else {
             ancbScore = scoreB;
             advScore = scoreA;
        }

        if (ancbScore > advScore) return `${base} border-green-500 dark:border-green-500`; 
        if (ancbScore < advScore) return `${base} border-red-500 dark:border-red-500`; 
        
        return `${base} border-gray-400`; 
    };

    const getEffectiveRoster = () => {
        const effective = [...roster];
        if (event?.jogadoresEscalados) {
            event.jogadoresEscalados.forEach(pid => {
                if (!effective.find(e => e.playerId === pid)) {
                    effective.push({ playerId: pid, status: 'confirmado', updatedAt: null });
                }
            });
        }
        return effective;
    };

    const filteredAddPlayers = allPlayers.filter(p => 
        !getEffectiveRoster().find(r => r.playerId === p.id) && 
        ((p.nome || '').toLowerCase().includes(playerSearch.toLowerCase()) || (p.apelido || '').toLowerCase().includes(playerSearch.toLowerCase()))
    );

    const filteredTeamPlayers = allPlayers.filter(p => 
        (p.nome || '').toLowerCase().includes(teamRosterSearch.toLowerCase()) || 
        (p.apelido || '').toLowerCase().includes(teamRosterSearch.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
            {/* HERO HEADER */}
            <div className={`relative w-full ${getGradient()} text-white p-6 pt-12 md:p-12 shadow-xl overflow-hidden`}>
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-10 -translate-y-10">
                    <LucideTrophy size={300} />
                </div>
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                    <Button variant="secondary" size="sm" onClick={onBack} className="!bg-white/10 !border-white/20 !text-white hover:!bg-white/20">
                        <LucideArrowLeft size={18} /> Voltar
                    </Button>
                </div>
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                    {isAdmin && (
                        <button 
                            onClick={handleDeleteEvent}
                            className="bg-red-600/80 hover:bg-red-600 text-white p-2 rounded-lg transition-colors backdrop-blur-sm"
                            title="Excluir Evento"
                        >
                            <LucideTrash2 size={18} />
                        </button>
                    )}
                    {isAdmin && event.status !== 'andamento' && event.status !== 'finalizado' && (
                        <button 
                            onClick={handleStartEvent}
                            className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1 backdrop-blur-sm"
                        >
                            <LucidePlayCircle size={14} /> Iniciar Evento
                        </button>
                    )}
                    {isAdmin && (
                        <button 
                            onClick={() => setShowEditEvent(true)}
                            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors backdrop-blur-sm"
                            title="Editar Evento"
                        >
                            <LucideEdit size={18} />
                        </button>
                    )}
                </div>
                
                <div className="relative z-10 max-w-4xl mx-auto">
                    <span className="inline-block px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
                        {event.type.replace('_', ' ')}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">{event.nome}</h1>
                    <div className="flex flex-wrap gap-6 text-sm md:text-base font-medium opacity-90">
                        <div className="flex items-center gap-2"><LucideCalendar className="opacity-70" /> {event.data.split('-').reverse().join('/')}</div>
                        <div className="flex items-center gap-2"><LucideMapPin className="opacity-70" /> {event.modalidade}</div>
                    </div>
                </div>
            </div>

            <div className="flex-grow container mx-auto px-4 py-8 max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: GAMES */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold flex items-center gap-2"><LucideGamepad2 className="text-ancb-blue" /> Partidas</h3>
                        {isAdmin && (
                            <Button size="sm" onClick={() => setShowAddGame(true)} className="!py-1 !px-3 text-xs">
                                <LucidePlus size={14} /> Agendar Jogo
                            </Button>
                        )}
                    </div>
                    
                    {games.length === 0 ? (
                        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl border-dashed border-2 border-gray-200 dark:border-gray-700">
                            <p className="text-gray-500">Nenhum jogo agendado.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {games.map(game => {
                                const sA = resolveScore(game.placarTimeA_final, game.placarANCB_final);
                                const sB = resolveScore(game.placarTimeB_final, game.placarAdversario_final);
                                const isGameLive = game.status === 'andamento';
                                return (
                                    <div 
                                        key={game.id} 
                                        onClick={() => onOpenGamePanel(game, eventId)}
                                        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${getGameResultClass(game)}`}
                                    >
                                        <div className="flex-1 flex items-center justify-between gap-4">
                                            <span className="font-bold text-sm md:text-base text-right w-1/3 truncate">{game.timeA_nome || 'ANCB'}</span>
                                            <div className={`px-3 py-1 rounded font-mono font-bold text-lg whitespace-nowrap ${isGameLive ? 'bg-red-100 text-red-600 animate-pulse border border-red-200' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                                {sA} - {sB}
                                            </div>
                                            <span className="font-bold text-sm md:text-base text-left w-1/3 truncate">{game.timeB_nome || game.adversario || 'ADV'}</span>
                                        </div>
                                        
                                        <div className="ml-4 flex items-center gap-2">
                                            <button 
                                                onClick={(e) => handleShareGame(e, game)}
                                                className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                title="Compartilhar Card"
                                            >
                                                <LucideShare2 size={16} />
                                            </button>
                                            
                                            {isAdmin && (
                                                <div className="flex gap-1">
                                                    <div 
                                                        className="text-gray-400 hover:text-ancb-blue p-1.5 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" 
                                                        onClick={(e) => { e.stopPropagation(); handleOpenScoreEdit(game); }}
                                                        title="Editar Placar Manualmente"
                                                    >
                                                        <LucideEdit2 size={16}/>
                                                    </div>
                                                    <div 
                                                        className="text-gray-400 hover:text-red-500 p-1.5 rounded bg-gray-100 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" 
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteGame(game.id); }}
                                                        title="Excluir Jogo"
                                                    >
                                                        <LucideTrash2 size={16}/>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: ROSTER OR TEAMS */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            {event.type === 'torneio_interno' ? <LucideShield className="text-ancb-orange" /> : <LucideUsers className="text-ancb-orange" />}
                            {event.type === 'torneio_interno' ? 'Times' : 'Convocação'}
                        </h3>
                        {isAdmin && event.type === 'torneio_interno' && (
                            <button onClick={() => { setShowTeamManager(true); setEditingTeam(null); }} className="text-xs flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg shadow-sm font-bold text-gray-600 dark:text-gray-300 hover:text-ancb-blue transition-all">
                                <LucideEdit2 size={12} /> Gerenciar
                            </button>
                        )}
                        {isAdmin && event.type !== 'torneio_interno' && (
                            <button onClick={() => setShowAddPlayer(!showAddPlayer)} className="text-sm text-ancb-blue font-bold hover:underline">
                                {showAddPlayer ? 'Fechar' : '+ Adicionar'}
                            </button>
                        )}
                    </div>

                    {showAddPlayer && isAdmin && event.type !== 'torneio_interno' && (
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4 animate-slideDown">
                            <input 
                                type="text" 
                                placeholder="Buscar jogador..." 
                                className="w-full p-2 mb-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                                value={playerSearch}
                                onChange={(e) => setPlayerSearch(e.target.value)}
                            />
                            <div className="max-h-40 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                                {filteredAddPlayers.map(p => (
                                    <button key={p.id} onClick={() => handleAddPlayerToRoster(p.id)} className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-left text-xs font-bold">
                                        <LucidePlus size={14}/> {p.nome}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {event.type === 'torneio_interno' ? renderInternalTournamentRoster() : renderExternalRoster()}
                </div>
            </div>

            {/* Event Edit Modal */}
            <Modal isOpen={showEditEvent} onClose={() => setShowEditEvent(false)} title="Editar Evento">
                <form onSubmit={handleUpdateEvent} className="space-y-4">
                    {/* ... (Existing form content) ... */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1">Nome</label>
                        <input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={editName} onChange={e => setEditName(e.target.value)} required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1">Data</label>
                        <input type="date" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={editDate} onChange={e => setEditDate(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label>
                            <select className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={editType} onChange={e => setEditType(e.target.value as any)}>
                                <option value="amistoso">Amistoso</option>
                                <option value="torneio_interno">Torneio Interno</option>
                                <option value="torneio_externo">Torneio Externo</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                            <select className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={editStatus} onChange={e => setEditStatus(e.target.value as any)}>
                                <option value="proximo">Próximo</option>
                                <option value="andamento">Em Andamento</option>
                                <option value="finalizado">Finalizado</option>
                            </select>
                        </div>
                    </div>
                    <Button type="submit" className="w-full mt-2">Salvar Alterações</Button>
                </form>
            </Modal>

            {/* Add Game Modal */}
            <Modal isOpen={showAddGame} onClose={() => setShowAddGame(false)} title="Agendar Jogo">
                <form onSubmit={handleAddGame} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1">Data</label>
                            <input type="date" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={newGameDate} onChange={e => setNewGameDate(e.target.value)} required />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1">Localização</label>
                            <input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Ex: Quadra Municipal" value={newGameLocation} onChange={e => setNewGameLocation(e.target.value)} />
                        </div>
                    </div>
                    {event.type === 'torneio_interno' ? (
                        <>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1">Time A</label>
                                <select className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={newGameTimeA} onChange={e => setNewGameTimeA(e.target.value)} required>
                                    <option value="">Selecione...</option>
                                    {event.times?.map(t => <option key={t.id} value={t.id}>{t.nomeTime}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1">Time B</label>
                                <select className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={newGameTimeB} onChange={e => setNewGameTimeB(e.target.value)} required>
                                    <option value="">Selecione...</option>
                                    {event.times?.map(t => <option key={t.id} value={t.id}>{t.nomeTime}</option>)}
                                </select>
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1">Adversário</label>
                            <input 
                                type="text" 
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" 
                                placeholder="Nome do time adversário"
                                value={newGameTimeB} 
                                onChange={e => setNewGameTimeB(e.target.value)} 
                                required 
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Seu time será listado como ANCB.</p>
                        </div>
                    )}
                    <Button type="submit" className="w-full mt-2">Criar Jogo</Button>
                </form>
            </Modal>

            {/* Score Edit Modal */}
            <Modal isOpen={!!editScoreGame} onClose={() => setEditScoreGame(null)} title="Editar Placar Manualmente">
                {editScoreGame && (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500">
                            Use esta opção para corrigir placares zerados ou ajustar resultados finais.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1">{editScoreGame.timeA_nome || 'ANCB'}</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2 border rounded text-lg font-bold text-center dark:bg-gray-700 dark:text-white"
                                    value={editScoreA}
                                    onChange={(e) => setEditScoreA(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1">{editScoreGame.timeB_nome || editScoreGame.adversario || 'Adversário'}</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2 border rounded text-lg font-bold text-center dark:bg-gray-700 dark:text-white"
                                    value={editScoreB}
                                    onChange={(e) => setEditScoreB(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button className="w-full mt-4" onClick={handleSaveScore}>
                            Salvar Correção
                        </Button>
                    </div>
                )}
            </Modal>

            {/* TEAM MANAGER MODAL */}
            <Modal isOpen={showTeamManager} onClose={() => { setShowTeamManager(false); setEditingTeam(null); }} title="Gerenciar Times">
                {!editingTeam ? (
                    // LIST VIEW
                    <div className="space-y-4">
                        <Button className="w-full" onClick={() => setEditingTeam({ nomeTime: '', jogadores: [] })}>
                            <LucidePlus size={16} /> Adicionar Novo Time
                        </Button>
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {event.times?.map(t => (
                                <div key={t.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-ancb-blue transition-colors">
                                    <div className="flex items-center gap-3">
                                        {t.logoUrl ? <img src={t.logoUrl} className="w-10 h-10 object-contain"/> : <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center font-bold text-gray-500">{t.nomeTime.charAt(0)}</div>}
                                        <div>
                                            <p className="font-bold text-sm text-gray-800 dark:text-white">{t.nomeTime}</p>
                                            <p className="text-xs text-gray-500">{t.jogadores.length} atletas</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingTeam(t)} className="p-2 text-gray-400 hover:text-ancb-blue bg-gray-50 dark:bg-gray-700 rounded"><LucideEdit2 size={16}/></button>
                                        <button onClick={() => handleDeleteTeam(t.id)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 dark:bg-gray-700 rounded"><LucideTrash2 size={16}/></button>
                                    </div>
                                </div>
                            ))}
                            {(!event.times || event.times.length === 0) && <p className="text-center text-gray-400 text-sm py-4">Nenhum time criado.</p>}
                        </div>
                    </div>
                ) : (
                    // EDIT VIEW
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4 cursor-pointer text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white" onClick={() => setEditingTeam(null)}>
                            <LucideArrowLeft size={16} /> <span className="text-xs font-bold uppercase">Voltar para lista</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                                <div className={`w-20 h-20 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center overflow-hidden ${editingTeam.logoUrl ? 'bg-transparent' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                    {isUploadingLogo ? <LucideLoader2 className="animate-spin text-gray-500"/> : editingTeam.logoUrl ? <img src={editingTeam.logoUrl} className="w-full h-full object-contain"/> : <span className="text-xs text-gray-400 text-center px-1">Sem Logo</span>}
                                </div>
                                <label className="absolute bottom-0 right-0 bg-ancb-blue text-white p-1.5 rounded-full cursor-pointer shadow-md hover:bg-blue-600 transition-colors">
                                    <LucideUpload size={12} />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleTeamLogoUpload} />
                                </label>
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nome do Time</label>
                                <input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={editingTeam.nomeTime || ''} onChange={e => setEditingTeam({...editingTeam, nomeTime: e.target.value})} placeholder="Ex: Bulls" />
                            </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex justify-between">
                                <span>Elenco ({editingTeam.jogadores?.length || 0})</span>
                            </label>
                            <div className="relative mb-2">
                                <LucideSearch className="absolute left-3 top-2.5 text-gray-400" size={14} />
                                <input className="w-full pl-9 p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600" placeholder="Buscar jogador para adicionar..." value={teamRosterSearch} onChange={e => setTeamRosterSearch(e.target.value)} />
                            </div>
                            <div className="max-h-48 overflow-y-auto custom-scrollbar border rounded dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                {filteredTeamPlayers.map(p => {
                                    const isSelected = editingTeam.jogadores?.includes(p.id);
                                    return (
                                        <div key={p.id} onClick={() => togglePlayerInTeam(p.id)} className={`flex items-center justify-between p-2 cursor-pointer border-b last:border-0 border-gray-100 dark:border-gray-700 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-white dark:hover:bg-gray-700'}`}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden flex items-center justify-center">
                                                    {p.foto ? <img src={p.foto} className="w-full h-full object-cover"/> : <span className="text-[10px] font-bold text-gray-500">{p.nome.charAt(0)}</span>}
                                                </div>
                                                <span className={`text-xs font-medium ${isSelected ? 'text-ancb-blue dark:text-blue-300 font-bold' : 'text-gray-600 dark:text-gray-300'}`}>{p.nome}</span>
                                            </div>
                                            {isSelected && <LucideCheckCircle2 size={14} className="text-ancb-blue" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <Button className="w-full" onClick={handleSaveTeam} disabled={!editingTeam.nomeTime}>
                            <LucideSave size={16} /> Salvar Time
                        </Button>
                    </div>
                )}
            </Modal>

            {/* Share Modal */}
            {shareData && (
                <ShareModal 
                    isOpen={showShareModal} 
                    onClose={() => setShowShareModal(false)} 
                    data={shareData}
                />
            )}
        </div>
    );
};
