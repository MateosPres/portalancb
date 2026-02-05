import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs, where, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Evento, Jogo, Cesta, Player, UserProfile, PlayerReview, Time } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { ReviewModal } from '../components/ReviewModal';
import { LucideArrowLeft, LucideCalendarClock, LucideCheckCircle2, LucideGamepad2, LucideBarChart3, LucidePlus, LucideTrophy, LucideChevronRight, LucideSettings, LucideEdit, LucideUsers, LucideCheckSquare, LucideSquare, LucideTrash2, LucideStar, LucideMessageSquare, LucidePlayCircle, LucideShield, LucideCamera, LucideLoader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface EventosViewProps {
    onBack: () => void;
    userProfile?: UserProfile | null;
    onOpenGamePanel?: (game: Jogo, eventId: string) => void;
}

interface GameStats {
    player: Player;
    points: number;
    cesta1: number;
    cesta2: number;
    cesta3: number;
    emojis: Record<string, number>;
    reviewCount: number;
}

interface TeamStanding {
    teamId: string;
    teamName: string;
    logo?: string;
    wins: number;
    losses: number;
    pointsFor: number;
    pointsAgainst: number;
    diff: number;
    games: number;
}

export const EventosView: React.FC<EventosViewProps> = ({ onBack, userProfile, onOpenGamePanel }) => {
    const [events, setEvents] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'proximos' | 'finalizados'>('proximos');
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    
    // Event Detail State
    const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
    const [eventDetailTab, setEventDetailTab] = useState<'jogos' | 'times'>('jogos'); // Internal Tournament Tabs
    
    // Games State
    const [eventGames, setEventGames] = useState<Jogo[]>([]);
    const [loadingGames, setLoadingGames] = useState(false);

    // Specific Game Details (Súmula)
    const [selectedGame, setSelectedGame] = useState<Jogo | null>(null);
    const [gameStats, setGameStats] = useState<GameStats[]>([]);
    const [loadingStats, setLoadingStats] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);

    // Admin: Add Game State
    const [showAddGame, setShowAddGame] = useState(false);
    const [newGameTimeA, setNewGameTimeA] = useState(''); // Stores Name OR TeamID
    const [newGameTimeB, setNewGameTimeB] = useState(''); // Stores Name OR TeamID

    // Admin: Create/Edit Event State
    const [showEventForm, setShowEventForm] = useState(false);
    const [isEditingEvent, setIsEditingEvent] = useState(false);
    const [formEventId, setFormEventId] = useState<string | null>(null);
    const [formName, setFormName] = useState('');
    const [formDate, setFormDate] = useState('');
    const [formMode, setFormMode] = useState<'3x3'|'5x5'>('5x5');
    const [formType, setFormType] = useState<'amistoso'|'torneio_interno'|'torneio_externo'>('amistoso');
    const [formStatus, setFormStatus] = useState<'proximo'|'andamento'|'finalizado'>('proximo');
    const [formRoster, setFormRoster] = useState<string[]>([]); 

    // Admin: Create Team State (Internal Tournament)
    const [showTeamForm, setShowTeamForm] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamLogo, setNewTeamLogo] = useState<string>('');
    const [newTeamRoster, setNewTeamRoster] = useState<string[]>([]);
    const [isProcessingTeam, setIsProcessingTeam] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const q = query(collection(db, "eventos"), orderBy("data", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Evento));
            setEvents(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchPlayers = async () => {
            const q = query(collection(db, "jogadores"), orderBy("nome"));
            const snapshot = await getDocs(q);
            setAllPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player)));
        };
        fetchPlayers();
    }, []);

    useEffect(() => {
        const fetchGames = async () => {
            if (!selectedEvent) return;
            setLoadingGames(true);
            setEventGames([]);
            try {
                const gamesRef = collection(db, "eventos", selectedEvent.id, "jogos");
                const q = query(gamesRef, orderBy("dataJogo", "asc"));
                const snapshot = await getDocs(q);
                setEventGames(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Jogo)));
            } catch (error) {
                console.error("Error fetching games:", error);
            } finally {
                setLoadingGames(false);
            }
        };
        fetchGames();
    }, [selectedEvent]);

    // --- INTERNAL TOURNAMENT: STANDINGS CALCULATION ---
    const calculateStandings = (): TeamStanding[] => {
        if (!selectedEvent || !selectedEvent.times) return [];

        const standings: Record<string, TeamStanding> = {};

        // Initialize
        selectedEvent.times.forEach(t => {
            standings[t.id] = {
                teamId: t.id,
                teamName: t.nomeTime,
                logo: t.logoUrl,
                wins: 0,
                losses: 0,
                pointsFor: 0,
                pointsAgainst: 0,
                diff: 0,
                games: 0
            };
        });

        // Process Games
        eventGames.forEach(game => {
            if (game.status === 'finalizado' && game.timeA_id && game.timeB_id) {
                const scoreA = game.placarTimeA_final || 0;
                const scoreB = game.placarTimeB_final || 0;
                
                const teamA = standings[game.timeA_id];
                const teamB = standings[game.timeB_id];

                if (teamA && teamB) {
                    teamA.games++;
                    teamB.games++;
                    teamA.pointsFor += scoreA;
                    teamA.pointsAgainst += scoreB;
                    teamB.pointsFor += scoreB;
                    teamB.pointsAgainst += scoreA;

                    if (scoreA > scoreB) {
                        teamA.wins++;
                        teamB.losses++;
                    } else if (scoreB > scoreA) {
                        teamB.wins++;
                        teamA.losses++;
                    }
                }
            }
        });

        // Calculate Diff & Sort
        return Object.values(standings).map(s => ({
            ...s,
            diff: s.pointsFor - s.pointsAgainst
        })).sort((a, b) => {
            if (b.wins !== a.wins) return b.wins - a.wins;
            if (b.diff !== a.diff) return b.diff - a.diff;
            return b.pointsFor - a.pointsFor;
        });
    };

    // --- TEAM CREATION LOGIC ---
    const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const compressed = await imageCompression(file, { maxSizeMB: 0.1, maxWidthOrHeight: 300, useWebWorker: true });
                const reader = new FileReader();
                reader.readAsDataURL(compressed);
                reader.onload = () => setNewTeamLogo(reader.result as string);
            } catch (err) {
                console.error("Error processing logo", err);
            }
        }
    };

    const togglePlayerInTeam = (playerId: string) => {
        setNewTeamRoster(prev => prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]);
    };

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEvent) return;
        setIsProcessingTeam(true);

        try {
            const newTeam: Time = {
                id: `team_${Date.now()}`,
                nomeTime: newTeamName,
                logoUrl: newTeamLogo,
                jogadores: newTeamRoster
            };

            const updatedTeams = selectedEvent.times ? [...selectedEvent.times, newTeam] : [newTeam];
            
            // Also add these players to the event roster if not already there
            const currentEventRoster = selectedEvent.jogadoresEscalados || [];
            const updatedEventRoster = Array.from(new Set([...currentEventRoster, ...newTeamRoster]));

            await updateDoc(doc(db, "eventos", selectedEvent.id), {
                times: updatedTeams,
                jogadoresEscalados: updatedEventRoster
            });

            // Update local state
            setSelectedEvent({
                ...selectedEvent,
                times: updatedTeams,
                jogadoresEscalados: updatedEventRoster
            });

            setShowTeamForm(false);
            setNewTeamName('');
            setNewTeamLogo('');
            setNewTeamRoster([]);
        } catch (error) {
            console.error("Error creating team:", error);
            alert("Erro ao criar time.");
        } finally {
            setIsProcessingTeam(false);
        }
    };

    const handleDeleteTeam = async (teamId: string) => {
        if (!selectedEvent || !window.confirm("Excluir time?")) return;
        try {
            const updatedTeams = selectedEvent.times?.filter(t => t.id !== teamId) || [];
            await updateDoc(doc(db, "eventos", selectedEvent.id), { times: updatedTeams });
            setSelectedEvent({ ...selectedEvent, times: updatedTeams });
        } catch (e) {
            console.error(e);
        }
    };

    // --- GAME CREATION LOGIC ---
    const handleCreateGame = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEvent) return;

        try {
            const isInternal = selectedEvent.type === 'torneio_interno';
            let teamA_Name = 'ANCB';
            let teamB_Name = newGameTimeB; // Default for External (Adversary Name)
            let teamA_Id = '';
            let teamB_Id = '';
            let gameRoster: string[] = [];

            if (isInternal) {
                // In Internal, values are Team IDs
                const teamA = selectedEvent.times?.find(t => t.id === newGameTimeA);
                const teamB = selectedEvent.times?.find(t => t.id === newGameTimeB);
                
                if (teamA && teamB) {
                    teamA_Name = teamA.nomeTime;
                    teamB_Name = teamB.nomeTime;
                    teamA_Id = teamA.id;
                    teamB_Id = teamB.id;
                    // Merge rosters
                    gameRoster = Array.from(new Set([...teamA.jogadores, ...teamB.jogadores]));
                }
            }

            await addDoc(collection(db, "eventos", selectedEvent.id, "jogos"), {
                dataJogo: selectedEvent.data,
                timeA_nome: teamA_Name,
                timeA_id: teamA_Id,
                timeB_nome: teamB_Name,
                timeB_id: teamB_Id,
                adversario: isInternal ? '' : teamB_Name,
                placarTimeA_final: 0,
                placarTimeB_final: 0,
                jogadoresEscalados: gameRoster,
                status: 'agendado'
            });

            setShowAddGame(false);
            setNewGameTimeA('');
            setNewGameTimeB('');
            
            // Refresh games
            const gamesRef = collection(db, "eventos", selectedEvent.id, "jogos");
            const q = query(gamesRef, orderBy("dataJogo", "asc"));
            const snap = await getDocs(q);
            setEventGames(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Jogo)));

        } catch (error) {
            console.error(error);
            alert("Erro ao criar jogo");
        }
    };

    // --- FETCH STATS (SÚMULA) ---
    useEffect(() => {
        const fetchGameData = async () => {
            if (!selectedGame || !selectedEvent) return;
            setLoadingStats(true);
            setGameStats([]);

            try {
                // Priority: Game specific roster > Event roster > Empty
                const rosterIds = selectedGame.jogadoresEscalados?.length 
                    ? selectedGame.jogadoresEscalados 
                    : (selectedEvent.jogadoresEscalados || []);

                const rosterPlayers = allPlayers.filter(p => rosterIds.includes(p.id));
                const statsMap: Record<string, GameStats> = {};
                
                rosterPlayers.forEach(p => {
                    statsMap[p.id] = { player: p, points: 0, cesta1: 0, cesta2: 0, cesta3: 0, emojis: {}, reviewCount: 0 };
                });

                // Fetch Points
                const processedCestaIds = new Set<string>();
                const processCesta = (cesta: Cesta) => {
                    if (processedCestaIds.has(cesta.id)) return;
                    if (cesta.jogadorId && !statsMap[cesta.jogadorId]) {
                        const unknownPlayer = allPlayers.find(p => p.id === cesta.jogadorId) || { id: cesta.jogadorId, nome: 'Desconhecido', numero_uniforme: 0, posicao: '-' } as Player;
                        statsMap[cesta.jogadorId] = { player: unknownPlayer, points: 0, cesta1: 0, cesta2: 0, cesta3: 0, emojis: {}, reviewCount: 0 };
                    }
                    if (cesta.jogadorId && statsMap[cesta.jogadorId]) {
                        const current = statsMap[cesta.jogadorId];
                        const p = Number(cesta.pontos);
                        current.points += p;
                        if (p === 1) current.cesta1++;
                        if (p === 2) current.cesta2++;
                        if (p === 3) current.cesta3++;
                        processedCestaIds.add(cesta.id);
                    }
                };

                // Subcollection
                try {
                    const subColRef = collection(db, "eventos", selectedEvent.id, "jogos", selectedGame.id, "cestas");
                    const subSnap = await getDocs(subColRef);
                    subSnap.forEach(doc => processCesta({ id: doc.id, ...doc.data() } as Cesta));
                } catch (e) {}

                // Root collection
                try {
                    const cestasRef = collection(db, "cestas");
                    const qGame = query(cestasRef, where("jogoId", "==", selectedGame.id));
                    const snapGame = await getDocs(qGame);
                    snapGame.forEach(doc => processCesta({ id: doc.id, ...doc.data() } as Cesta));
                } catch (e) {}

                // Reviews
                try {
                    const reviewsRef = collection(db, "avaliacoes");
                    const qReviews = query(reviewsRef, where("gameId", "==", selectedGame.id));
                    const snapReviews = await getDocs(qReviews);
                    snapReviews.forEach(doc => {
                        const review = doc.data() as PlayerReview;
                        if (review.revieweeId && statsMap[review.revieweeId]) {
                            const target = statsMap[review.revieweeId];
                            target.reviewCount++;
                            target.emojis[review.emojiTag] = (target.emojis[review.emojiTag] || 0) + 1;
                        }
                    });
                } catch (e) {}

                setGameStats(Object.values(statsMap).sort((a, b) => b.points - a.points));
            } catch (error) {
                console.error("Critical error fetching game data:", error);
            } finally {
                setLoadingStats(false);
            }
        };
        fetchGameData();
    }, [selectedGame, selectedEvent, allPlayers, showReviewModal]);

    // Helpers
    const handleDeleteEvent = async () => { if (!selectedEvent || !window.confirm("Excluir evento e jogos?")) return; try { await deleteDoc(doc(db, "eventos", selectedEvent.id)); setSelectedEvent(null); } catch (e) { alert("Erro ao excluir"); } };
    const handleDeleteGame = async (gameId: string) => { if (!selectedEvent || !window.confirm("Excluir jogo?")) return; try { await deleteDoc(doc(db, "eventos", selectedEvent.id, "jogos", gameId)); setEventGames(prev => prev.filter(g => g.id !== gameId)); } catch (e) { alert("Erro ao excluir"); } };
    const openNewEventForm = () => { setIsEditingEvent(false); setFormEventId(null); setFormName(''); setFormDate(new Date().toISOString().split('T')[0]); setFormMode('5x5'); setFormType('amistoso'); setFormStatus('proximo'); setFormRoster([]); setShowEventForm(true); };
    const openEditEventForm = (event: Evento) => { setIsEditingEvent(true); setFormEventId(event.id); setFormName(event.nome); setFormDate(event.data); setFormMode(event.modalidade); setFormType(event.type); setFormStatus(event.status); setFormRoster(event.jogadoresEscalados || []); setShowEventForm(true); };
    const handleSaveEvent = async (e: React.FormEvent) => { e.preventDefault(); try { const eventData = { nome: formName, data: formDate, modalidade: formMode, type: formType, status: formStatus, jogadoresEscalados: formRoster }; if (isEditingEvent && formEventId) { await updateDoc(doc(db, "eventos", formEventId), eventData); if (selectedEvent?.id === formEventId) setSelectedEvent({ ...selectedEvent, ...eventData, id: formEventId }); } else { await addDoc(collection(db, "eventos"), eventData); } setShowEventForm(false); } catch (e) { alert("Erro ao salvar"); } };
    const togglePlayerInRoster = (playerId: string) => { setFormRoster(prev => prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]); };
    const handleSubmitReview = async (data: any) => { if(!userProfile?.linkedPlayerId || !selectedGame) return; try { await addDoc(collection(db, "avaliacoes"), { gameId: selectedGame.id, eventId: selectedEvent!.id, reviewerId: userProfile.linkedPlayerId, userId: userProfile.uid, reviewerName: userProfile.nome, revieweeId: data.revieweeId, rating: data.rating, emojiTag: data.emojiTag, comment: data.comment, timestamp: serverTimestamp() }); alert("Enviado!"); } catch(e){ alert("Erro"); } };
    const canReview = () => { if (!userProfile?.linkedPlayerId || !selectedGame) return false; const roster = selectedGame.jogadoresEscalados || selectedEvent?.jogadoresEscalados || []; return roster.includes(userProfile.linkedPlayerId); };
    const getTeammatesForReview = () => gameStats.map(stat => stat.player).filter(p => p.id !== userProfile?.linkedPlayerId);
    const formatDate = (dateStr?: string) => dateStr ? dateStr.split('-').reverse().join('/') : 'N/A';
    const getStatusColor = (s: string) => s === 'andamento' ? 'bg-red-100 text-red-600 animate-pulse' : s === 'finalizado' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-600';
    const getModalityColor = (m: string) => m === '3x3' ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700';

    const filteredEvents = events.filter(e => tab === 'proximos' ? e.status !== 'finalizado' : e.status === 'finalizado');
    const displayEvents = tab === 'proximos' ? [...filteredEvents].reverse() : filteredEvents;

    return (
        <div className="animate-fadeIn pb-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <Button variant="secondary" size="sm" onClick={onBack} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                        <LucideArrowLeft size={18} />
                    </Button>
                    <h2 className="text-2xl font-bold text-ancb-black dark:text-white">Calendário</h2>
                </div>
                {userProfile?.role === 'admin' && (
                    <Button size="sm" onClick={openNewEventForm}>
                        <LucidePlus size={16} /> <span className="hidden sm:inline">Novo Evento</span>
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 inline-flex gap-1 mb-8 w-full md:w-auto">
                <button onClick={() => setTab('proximos')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'proximos' ? 'bg-ancb-blue text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    <div className="flex items-center justify-center gap-2"><LucideCalendarClock size={16} /> Próximos</div>
                </button>
                <button onClick={() => setTab('finalizados')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'finalizados' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    <div className="flex items-center justify-center gap-2"><LucideCheckCircle2 size={16} /> Finalizados</div>
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ancb-blue"></div></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayEvents.length > 0 ? displayEvents.map(evento => (
                        <Card key={evento.id} onClick={() => setSelectedEvent(evento)} className="flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-t-4 border-t-ancb-blue dark:border-t-blue-500 cursor-pointer group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center min-w-[60px] border border-gray-100 dark:border-gray-600">
                                    <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">{evento.data.split('-')[1] || 'MÊS'}</span>
                                    <span className="block text-xl font-bold text-gray-800 dark:text-white">{evento.data.split('-')[2] || 'DIA'}</span>
                                </div>
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${getStatusColor(evento.status)}`}>{evento.status === 'andamento' ? 'AO VIVO' : evento.status}</span>
                            </div>
                            <div className="flex-grow mb-4">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white leading-tight mb-1 group-hover:text-ancb-blue transition-colors">{evento.nome}</h3>
                                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm"><LucideTrophy size={14} className="text-ancb-orange" /><span className="capitalize">{evento.type.replace('_', ' ')}</span></div>
                            </div>
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                                <span className={`text-xs font-bold px-3 py-1 rounded-md uppercase border ${getModalityColor(evento.modalidade)}`}>{evento.modalidade}</span>
                                <div className="flex items-center gap-2 text-ancb-blue dark:text-blue-400 text-sm font-bold">
                                    {userProfile?.role === 'admin' ? <><LucideSettings size={14} /> <span className="text-xs uppercase">Gerenciar</span></> : <><span className="text-xs uppercase">Detalhes</span> <LucideChevronRight size={14} /></>}
                                </div>
                            </div>
                        </Card>
                    )) : (
                        <div className="col-span-full text-center py-16 bg-white/50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"><LucideCalendarClock size={48} className="mx-auto text-gray-300 mb-4" /><p className="text-gray-500 dark:text-gray-400 font-medium">Nenhum evento encontrado.</p></div>
                    )}
                </div>
            )}

            {/* EVENT DETAILS MODAL */}
            <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Detalhes do Evento">
                {selectedEvent && (
                    <div>
                        {/* Header Info */}
                        <div className="mb-4 border-b border-gray-100 dark:border-gray-700 pb-4 flex flex-col gap-3">
                            <div><h2 className="text-xl font-bold text-ancb-blue dark:text-blue-400 mb-1">{selectedEvent.nome}</h2><p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{selectedEvent.type.replace('_', ' ')} • {formatDate(selectedEvent.data)}</p></div>
                            {userProfile?.role === 'admin' && (<div className="flex gap-2"><Button size="sm" variant="secondary" onClick={() => { setSelectedEvent(null); openEditEventForm(selectedEvent); }} className="flex-1 dark:text-white dark:border-gray-600"><LucideEdit size={16} /> Editar</Button><Button size="sm" variant="secondary" onClick={handleDeleteEvent} className="flex-1 !text-red-500 !border-red-200 hover:!bg-red-50 dark:hover:!bg-red-900/20"><LucideTrash2 size={16} /> Excluir Evento</Button></div>)}
                        </div>

                        {/* SUB-TABS for Internal Tournament */}
                        {selectedEvent.type === 'torneio_interno' && (
                            <div className="flex border-b border-gray-100 dark:border-gray-700 mb-4">
                                <button onClick={() => setEventDetailTab('jogos')} className={`flex-1 pb-2 text-sm font-bold border-b-2 ${eventDetailTab === 'jogos' ? 'border-ancb-blue text-ancb-blue' : 'border-transparent text-gray-400'}`}>Jogos</button>
                                <button onClick={() => setEventDetailTab('times')} className={`flex-1 pb-2 text-sm font-bold border-b-2 ${eventDetailTab === 'times' ? 'border-ancb-blue text-ancb-blue' : 'border-transparent text-gray-400'}`}>Classificação & Times</button>
                            </div>
                        )}

                        {/* TAB: JOGOS */}
                        {(eventDetailTab === 'jogos' || selectedEvent.type !== 'torneio_interno') && (
                            <div className="space-y-6">
                                {/* Games List Container */}
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                                            <LucideGamepad2 size={18} className="text-ancb-orange" /> Cronograma
                                        </h4>
                                        {userProfile?.role === 'admin' && (
                                            <Button size="sm" onClick={() => setShowAddGame(true)}>
                                                <LucidePlus size={14} /> Jogo
                                            </Button>
                                        )}
                                    </div>
                                    
                                    {loadingGames ? (
                                        <div className="py-8 flex justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                                        </div>
                                    ) : eventGames.length > 0 ? (
                                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                            {eventGames.map(game => {
                                                const sA = game.placarTimeA_final ?? game.placarANCB_final ?? 0;
                                                const sB = game.placarTimeB_final ?? game.placarAdversario_final ?? 0;
                                                const isInternal = !!game.timeA_nome && game.timeA_nome !== 'ANCB';
                                                
                                                return (
                                                    <div 
                                                        key={game.id} 
                                                        className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-3 shadow-sm mb-2 cursor-pointer hover:border-ancb-blue transition-all" 
                                                        onClick={() => setSelectedGame(game)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-bold text-xs w-1/3 text-center dark:text-gray-200 truncate">{isInternal ? game.timeA_nome : 'ANCB'}</span>
                                                            <div className="font-bold text-ancb-blue whitespace-nowrap">
                                                                {sA} <span className="text-gray-400 mx-1">x</span> {sB}
                                                            </div>
                                                            <span className="font-bold text-xs w-1/3 text-center dark:text-gray-200 truncate">{isInternal ? game.timeB_nome : (game.adversario || 'Adv')}</span>
                                                        </div>
                                                        {userProfile?.role === 'admin' && (
                                                            <div className="flex justify-center gap-2 mt-2 pt-2 border-t dark:border-gray-700">
                                                                <Button size="sm" className="!py-0.5 !px-2 text-[10px]" onClick={(e) => { e.stopPropagation(); onOpenGamePanel && onOpenGamePanel(game, selectedEvent.id); }}>Painel</Button>
                                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteGame(game.id); }} className="text-red-400 hover:text-red-600 text-[10px]">Excluir</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-gray-400 dark:text-gray-400 text-sm">
                                            <p>Nenhum jogo cadastrado.</p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* General Roster Section */}
                                {selectedEvent.type !== 'torneio_interno' && (
                                    <div>
                                        <h4 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-3">
                                            <LucideUsers size={18} className="text-ancb-blue dark:text-blue-400" /> 
                                            Elenco Geral ({selectedEvent.jogadoresEscalados?.length || 0})
                                        </h4>
                                        {selectedEvent.jogadoresEscalados && selectedEvent.jogadoresEscalados.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {allPlayers
                                                    .filter(p => selectedEvent.jogadoresEscalados?.includes(p.id))
                                                    .map(p => (
                                                        <span key={p.id} className="text-xs bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded text-gray-700 dark:text-gray-200">
                                                            {p.apelido || p.nome}
                                                        </span>
                                                    ))
                                                }
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">Nenhum jogador escalado.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB: TIMES & CLASSIFICAÇÃO (Internal Only) */}
                        {selectedEvent.type === 'torneio_interno' && eventDetailTab === 'times' && (
                            <div className="space-y-6">
                                {/* Standings */}
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                                    <table className="w-full text-xs md:text-sm">
                                        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                            <tr>
                                                <th className="p-2 text-left">Time</th>
                                                <th className="p-2 text-center">V</th>
                                                <th className="p-2 text-center">D</th>
                                                <th className="p-2 text-center hidden sm:table-cell">Saldo</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {calculateStandings().map((team, idx) => (
                                                <tr key={team.teamId} className="dark:text-gray-200">
                                                    <td className="p-2 flex items-center gap-2">
                                                        <span className="font-bold text-gray-400 w-4">{idx + 1}º</span>
                                                        {team.logo && <img src={team.logo} className="w-6 h-6 rounded-full object-cover" />}
                                                        <span className="font-bold truncate max-w-[100px]">{team.teamName}</span>
                                                    </td>
                                                    <td className="p-2 text-center font-bold text-green-600">{team.wins}</td>
                                                    <td className="p-2 text-center text-red-500">{team.losses}</td>
                                                    <td className="p-2 text-center hidden sm:table-cell text-gray-500">{team.diff > 0 ? `+${team.diff}` : team.diff}</td>
                                                </tr>
                                            ))}
                                            {(!selectedEvent.times || selectedEvent.times.length === 0) && (
                                                <tr><td colSpan={4} className="p-4 text-center text-gray-400">Nenhum time cadastrado.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Teams List */}
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                                            <LucideShield size={18} className="text-ancb-blue" /> Equipes ({selectedEvent.times?.length || 0})
                                        </h4>
                                        {userProfile?.role === 'admin' && (
                                            <Button size="sm" onClick={() => setShowTeamForm(true)} className="!py-1">
                                                <LucidePlus size={14} /> Novo Time
                                            </Button>
                                        )}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        {selectedEvent.times?.map(time => (
                                            <div key={time.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600 relative group">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-600 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-500">
                                                        {time.logoUrl ? <img src={time.logoUrl} className="w-full h-full object-cover" /> : <LucideShield size={16} className="text-gray-400" />}
                                                    </div>
                                                    <span className="font-bold text-sm dark:text-white truncate">{time.nomeTime}</span>
                                                </div>
                                                <div className="text-[10px] text-gray-500 dark:text-gray-400 flex flex-wrap gap-1">
                                                    {time.jogadores.map(pid => {
                                                        const p = allPlayers.find(pl => pl.id === pid);
                                                        return p ? <span key={pid} className="bg-white dark:bg-gray-600 px-1 rounded shadow-sm">{p.apelido || p.nome.split(' ')[0]}</span> : null;
                                                    })}
                                                </div>
                                                {userProfile?.role === 'admin' && (
                                                    <button onClick={() => handleDeleteTeam(time.id)} className="absolute top-2 right-2 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <LucideTrash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
            
            {/* GAME DETAILS MODAL (SÚMULA) - SAME AS BEFORE */}
            <Modal isOpen={!!selectedGame} onClose={() => setSelectedGame(null)} title="Súmula da Partida">
                {selectedGame && (
                    <div className="animate-fadeIn">
                        <div className="bg-ancb-black text-white p-6 rounded-xl mb-6 shadow-lg relative overflow-hidden">
                            <div className="relative z-10 flex justify-between items-center">
                                <div className="text-center w-1/3"><span className="block font-bold text-lg leading-tight">{selectedGame.timeA_nome || "ANCB"}</span></div>
                                <div className="text-center w-1/3"><span className="text-3xl font-bold text-ancb-orange">{selectedGame.placarTimeA_final ?? selectedGame.placarANCB_final ?? 0}</span><span className="text-gray-500 mx-2">x</span><span className="text-3xl font-bold text-white">{selectedGame.placarTimeB_final ?? selectedGame.placarAdversario_final ?? 0}</span></div>
                                <div className="text-center w-1/3"><span className="block font-bold text-lg leading-tight">{selectedGame.timeB_nome || selectedGame.adversario || "ADV"}</span></div>
                            </div>
                        </div>
                        {canReview() && <div className="mb-4"><Button className="w-full !bg-gradient-to-r from-ancb-orange to-red-500 shadow-lg" onClick={() => setShowReviewModal(true)}><LucideStar className="mr-2" size={18} fill="white" /> Avaliar Companheiros</Button></div>}
                        <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2"><LucideBarChart3 size={18} className="text-ancb-blue dark:text-blue-400" /> Estatísticas & Destaques</h4>
                        {loadingStats ? <div className="py-8 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div></div> : gameStats.length > 0 ? <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden"><table className="w-full text-sm"><thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700"><tr><th className="px-4 py-3 text-left font-bold">Jogador</th><th className="px-2 py-3 text-center text-xs font-bold text-gray-400 dark:text-gray-500">1PT</th><th className="px-2 py-3 text-center text-xs font-bold text-gray-400 dark:text-gray-500">2PT</th><th className="px-2 py-3 text-center text-xs font-bold text-gray-400 dark:text-gray-500">3PT</th><th className="px-4 py-3 text-right font-bold text-gray-700 dark:text-gray-300">Total</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-700">{gameStats.map((stat) => (<tr key={stat.player.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"><td className="px-4 py-3 flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0 flex items-center justify-center">{stat.player.foto ? <img src={stat.player.foto} className="w-full h-full object-cover"/> : <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{stat.player.nome.charAt(0)}</span>}</div><div className="flex flex-col"><span className="font-bold text-gray-800 dark:text-gray-200 text-sm leading-tight flex items-center gap-1">{stat.player.apelido || stat.player.nome}{Object.keys(stat.emojis).length > 0 && (<span className="text-base ml-1" title="Destaque da Torcida">{Object.entries(stat.emojis).sort((a,b) => (b[1] as number) - (a[1] as number))[0][0]}</span>)}</span></div></td><td className="px-2 py-3 text-center"><span className={`px-2 py-0.5 rounded text-xs font-bold ${stat.cesta1 > 0 ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' : 'text-gray-300 dark:text-gray-600'}`}>{stat.cesta1}</span></td><td className="px-2 py-3 text-center"><span className={`px-2 py-0.5 rounded text-xs font-bold ${stat.cesta2 > 0 ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' : 'text-gray-300 dark:text-gray-600'}`}>{stat.cesta2}</span></td><td className="px-2 py-3 text-center"><span className={`px-2 py-0.5 rounded text-xs font-bold ${stat.cesta3 > 0 ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' : 'text-gray-300 dark:text-gray-600'}`}>{stat.cesta3}</span></td><td className="px-4 py-3 text-right font-bold text-ancb-black dark:text-white text-base">{stat.points} Pts</td></tr>))}</tbody></table></div> : <div className="text-center py-10 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-dashed border-gray-200 dark:border-gray-600"><p className="text-gray-400 text-sm mb-1">Nenhum jogador escalado ou estatística encontrada.</p></div>}
                    </div>
                )}
            </Modal>

            <ReviewModal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} teammates={getTeammatesForReview()} onSubmit={handleSubmitReview} />

            {/* ADMIN MODALS */}
            <Modal isOpen={showAddGame} onClose={() => setShowAddGame(false)} title="Adicionar Jogo">
                <form onSubmit={handleCreateGame} className="space-y-4">
                    {selectedEvent && selectedEvent.type === 'torneio_interno' ? (
                        <>
                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Time A (Mandante)</label>
                                <select className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={newGameTimeA} onChange={e => setNewGameTimeA(e.target.value)} required>
                                    <option value="">Selecione um time</option>
                                    {selectedEvent.times?.map(t => <option key={t.id} value={t.id}>{t.nomeTime}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Time B (Visitante)</label>
                                <select className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={newGameTimeB} onChange={e => setNewGameTimeB(e.target.value)} required>
                                    <option value="">Selecione um time</option>
                                    {selectedEvent.times?.map(t => <option key={t.id} value={t.id}>{t.nomeTime}</option>)}
                                </select>
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Nome Adversário</label>
                            <input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Nome do time rival" value={newGameTimeB} onChange={e => setNewGameTimeB(e.target.value)} required />
                            <p className="text-xs text-gray-400 mt-1">O Time A será automaticamente definido como "ANCB".</p>
                        </div>
                    )}
                    <Button type="submit" className="w-full">Criar Jogo</Button>
                </form>
            </Modal>

            {/* Create Team Modal */}
            <Modal isOpen={showTeamForm} onClose={() => setShowTeamForm(false)} title="Cadastrar Time">
                <form onSubmit={handleCreateTeam} className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
                    {/* Logo Upload */}
                    <div className="flex flex-col items-center">
                        <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleLogoSelect} />
                        <div 
                            className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-400 flex items-center justify-center overflow-hidden cursor-pointer relative"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {newTeamLogo ? <img src={newTeamLogo} className="w-full h-full object-cover" /> : <LucideCamera className="text-gray-400" />}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Logo do Time</p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Nome do Time</label>
                        <input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} required placeholder="Ex: Bulls" />
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 flex justify-between">
                            <span>Selecionar Elenco</span>
                            <span className="text-xs font-normal bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">{newTeamRoster.length} atletas</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar bg-gray-50 dark:bg-gray-700/30 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                            {allPlayers.map(player => {
                                const isSelected = newTeamRoster.includes(player.id);
                                return (
                                    <div key={player.id} onClick={() => togglePlayerInTeam(player.id)} className={`flex items-center gap-2 p-2 rounded-md cursor-pointer border ${isSelected ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-300' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-600'}`}>
                                        <div className={`text-ancb-blue dark:text-blue-400 ${isSelected ? 'opacity-100' : 'opacity-30'}`}>
                                            {isSelected ? <LucideCheckSquare size={18} /> : <LucideSquare size={18} />}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className={`text-xs font-bold truncate ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{player.apelido || player.nome}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isProcessingTeam}>
                        {isProcessingTeam ? <LucideLoader2 className="animate-spin" /> : 'Salvar Time'}
                    </Button>
                </form>
            </Modal>

            <Modal isOpen={showEventForm} onClose={() => setShowEventForm(false)} title={isEditingEvent ? "Editar Evento" : "Novo Evento"}>
                <form onSubmit={handleSaveEvent} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2"><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Nome</label><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={formName} onChange={e => setFormName(e.target.value)} required /></div>
                        <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Data</label><input type="date" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={formDate} onChange={e => setFormDate(e.target.value)} required /></div>
                        <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Status</label><select className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={formStatus} onChange={(e:any) => setFormStatus(e.target.value)}><option value="proximo">Próximo</option><option value="andamento">Em Andamento</option><option value="finalizado">Finalizado</option></select></div>
                        <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Modalidade</label><select className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={formMode} onChange={(e:any) => setFormMode(e.target.value)}><option value="5x5">5x5</option><option value="3x3">3x3</option></select></div>
                        <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Tipo</label><select className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={formType} onChange={(e:any) => setFormType(e.target.value)}><option value="amistoso">Amistoso</option><option value="torneio_interno">Torneio Interno</option><option value="torneio_externo">Torneio Externo</option></select></div>
                    </div>
                    {/* Only show Roster Selection for External/Friendly. Internal uses Teams. */}
                    {formType !== 'torneio_interno' && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 flex justify-between"><span>Escalar Jogadores</span><span className="text-xs font-normal bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">{formRoster.length} selecionados</span></label>
                            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar bg-gray-50 dark:bg-gray-700/30 p-2 rounded-lg border border-gray-200 dark:border-gray-700">{allPlayers.map(player => { const isSelected = formRoster.includes(player.id); return (<div key={player.id} onClick={() => togglePlayerInRoster(player.id)} className={`flex items-center gap-2 p-2 rounded-md cursor-pointer border ${isSelected ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-300' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-600'}`}><div className={`text-ancb-blue dark:text-blue-400 ${isSelected ? 'opacity-100' : 'opacity-30'}`}>{isSelected ? <LucideCheckSquare size={18} /> : <LucideSquare size={18} />}</div><div className="overflow-hidden"><p className={`text-xs font-bold truncate ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{player.apelido || player.nome}</p></div></div>); })}</div>
                        </div>
                    )}
                    <Button type="submit" className="w-full">{isEditingEvent ? "Salvar" : "Criar"}</Button>
                </form>
            </Modal>
        </div>
    );
};