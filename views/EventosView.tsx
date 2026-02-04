import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs, where, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Evento, Jogo, Cesta, Player, UserProfile } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { LucideArrowLeft, LucideCalendarClock, LucideCheckCircle2, LucideGamepad2, LucideBarChart3, LucidePlus, LucideTrophy, LucideChevronRight, LucideSettings, LucideEdit, LucideUsers, LucideCheckSquare, LucideSquare, LucidePlayCircle, LucideTrash2 } from 'lucide-react';

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
}

export const EventosView: React.FC<EventosViewProps> = ({ onBack, userProfile, onOpenGamePanel }) => {
    const [events, setEvents] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'proximos' | 'finalizados'>('proximos');
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    
    // Selection & Games State
    const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
    const [eventGames, setEventGames] = useState<Jogo[]>([]);
    const [loadingGames, setLoadingGames] = useState(false);

    // Specific Game Details
    const [selectedGame, setSelectedGame] = useState<Jogo | null>(null);
    const [gameStats, setGameStats] = useState<GameStats[]>([]);
    const [loadingStats, setLoadingStats] = useState(false);

    // Admin State for adding games inside event modal
    const [showAddGame, setShowAddGame] = useState(false);
    const [newGameTimeA, setNewGameTimeA] = useState('');
    const [newGameTimeB, setNewGameTimeB] = useState('');

    // Admin State for Create/Edit EVENT
    const [showEventForm, setShowEventForm] = useState(false);
    const [isEditingEvent, setIsEditingEvent] = useState(false);
    const [formEventId, setFormEventId] = useState<string | null>(null);
    
    const [formName, setFormName] = useState('');
    const [formDate, setFormDate] = useState('');
    const [formMode, setFormMode] = useState<'3x3'|'5x5'>('5x5');
    const [formType, setFormType] = useState<'amistoso'|'torneio_interno'|'torneio_externo'>('amistoso');
    const [formStatus, setFormStatus] = useState<'proximo'|'andamento'|'finalizado'>('proximo');
    const [formRoster, setFormRoster] = useState<string[]>([]); // Array of player IDs

    useEffect(() => {
        const q = query(collection(db, "eventos"), orderBy("data", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Evento));
            setEvents(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Fetch all players for the Roster Selection
    useEffect(() => {
        const fetchPlayers = async () => {
            const q = query(collection(db, "jogadores"), orderBy("nome"));
            const snapshot = await getDocs(q);
            setAllPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player)));
        };
        fetchPlayers();
    }, []);

    // Fetch games when an event is selected
    useEffect(() => {
        const fetchGames = async () => {
            if (!selectedEvent) return;
            
            setLoadingGames(true);
            setEventGames([]);
            try {
                const gamesRef = collection(db, "eventos", selectedEvent.id, "jogos");
                const q = query(gamesRef, orderBy("dataJogo", "asc"));
                const snapshot = await getDocs(q);
                
                const gamesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Jogo));
                setEventGames(gamesList);
            } catch (error) {
                console.error("Error fetching games for event:", error);
            } finally {
                setLoadingGames(false);
            }
        };

        fetchGames();
    }, [selectedEvent]);

    // Fetch stats when a game is selected
    useEffect(() => {
        const fetchGameStats = async () => {
            if (!selectedGame || !selectedEvent) return;

            setLoadingStats(true);
            setGameStats([]);

            try {
                // 1. Fetch all players for caching names
                const playersSnapshot = await getDocs(collection(db, "jogadores"));
                const playersMap: Record<string, Player> = {};
                playersSnapshot.forEach(doc => {
                    playersMap[doc.id] = { id: doc.id, ...doc.data() } as Player;
                });

                // Stats Accumulator
                const statsMap: Record<string, { points: number, c1: number, c2: number, c3: number }> = {};
                const processedCestaIds = new Set<string>();

                // Helper to process a cesta doc
                const processCesta = (cesta: Cesta) => {
                    if (processedCestaIds.has(cesta.id)) return;
                    
                    if (cesta.jogadorId && cesta.pontos) {
                        const current = statsMap[cesta.jogadorId] || { points: 0, c1: 0, c2: 0, c3: 0 };
                        const p = Number(cesta.pontos);
                        
                        current.points += p;
                        if (p === 1) current.c1++;
                        if (p === 2) current.c2++;
                        if (p === 3) current.c3++;

                        statsMap[cesta.jogadorId] = current;
                        processedCestaIds.add(cesta.id);
                    }
                };

                // STRATEGY 1: Sub-collection Query (Based on user screenshot)
                try {
                    const subColRef = collection(db, "eventos", selectedEvent.id, "jogos", selectedGame.id, "cestas");
                    const subSnap = await getDocs(subColRef);
                    if (!subSnap.empty) {
                        subSnap.forEach(doc => processCesta({ id: doc.id, ...doc.data() } as Cesta));
                    }
                } catch (err) {
                    // Ignore
                }

                // STRATEGY 2: Top-level Collection Query
                const cestasRef = collection(db, "cestas");
                const qGame = query(cestasRef, where("jogoId", "==", selectedGame.id));
                const snapGame = await getDocs(qGame);
                snapGame.forEach(doc => processCesta({ id: doc.id, ...doc.data() } as Cesta));

                if (selectedEvent.id) {
                    const qEvent = query(cestasRef, where("eventoId", "==", selectedEvent.id));
                    const snapEvent = await getDocs(qEvent);
                    
                    snapEvent.forEach(doc => {
                        const cesta = { id: doc.id, ...doc.data() } as Cesta;
                        if (processedCestaIds.has(cesta.id)) return;
                        if (cesta.jogoId && cesta.jogoId !== selectedGame.id) return;
                        if (!cesta.jogoId && cesta.timestamp && selectedGame.dataJogo) {
                             // Date logic omitted for brevity, keeping simple match
                             processCesta(cesta);
                        }
                    });
                }

                // 3. Convert to array
                const statsArray: GameStats[] = Object.entries(statsMap).map(([playerId, stats]) => ({
                    player: playersMap[playerId] || { id: playerId, nome: 'Desconhecido', posicao: '-', numero_uniforme: 0 },
                    points: stats.points,
                    cesta1: stats.c1,
                    cesta2: stats.c2,
                    cesta3: stats.c3
                }));

                setGameStats(statsArray.sort((a, b) => b.points - a.points));

            } catch (error) {
                console.error("Error fetching game stats:", error);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchGameStats();
    }, [selectedGame, selectedEvent]);

    const handleCreateGame = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEvent) return;

        try {
            await addDoc(collection(db, "eventos", selectedEvent.id, "jogos"), {
                dataJogo: selectedEvent.data,
                timeA_nome: newGameTimeA,
                timeB_nome: newGameTimeB,
                placarTimeA_final: 0,
                placarTimeB_final: 0,
                jogadoresEscalados: []
            });
            setShowAddGame(false);
            setNewGameTimeA('');
            setNewGameTimeB('');
            // Refresh games
            const gamesRef = collection(db, "eventos", selectedEvent.id, "jogos");
            const q = query(gamesRef, orderBy("dataJogo", "asc"));
            const snapshot = await getDocs(q);
            setEventGames(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Jogo)));

        } catch (error) {
            console.error(error);
            alert("Erro ao criar jogo");
        }
    };

    // DEEP DELETE EVENT
    const handleDeleteEvent = async () => {
        if (!selectedEvent) return;
        if (!window.confirm("ATENÇÃO: Você está prestes a excluir este evento e TODOS os jogos/pontos associados.\n\nEssa ação limpará os pontos dos atletas no Ranking.\n\nTem certeza?")) return;
        
        setLoading(true); // Show global loading or just close modal
        try {
            const eventId = selectedEvent.id;
            
            // 1. Get Games
            const gamesRef = collection(db, "eventos", eventId, "jogos");
            const gamesSnap = await getDocs(gamesRef);

            // 2. Delete Games & Cestas
            for (const gDoc of gamesSnap.docs) {
                 const cestasRef = collection(db, "eventos", eventId, "jogos", gDoc.id, "cestas");
                 const cestasSnap = await getDocs(cestasRef);
                 // Delete all cestas first
                 const deleteCestas = cestasSnap.docs.map(c => deleteDoc(c.ref));
                 await Promise.all(deleteCestas);
                 // Delete game
                 await deleteDoc(gDoc.ref);
            }

            // 3. Delete Event
            await deleteDoc(doc(db, "eventos", eventId));
            
            setSelectedEvent(null);
            alert("Evento excluído com sucesso.");
        } catch (e) {
            console.error("Error deleting event", e);
            alert("Erro ao excluir evento.");
        } finally {
            setLoading(false);
        }
    };

    // DEEP DELETE GAME
    const handleDeleteGame = async (gameId: string) => {
        if (!selectedEvent) return;
        if (!window.confirm("Excluir este jogo e os pontos dos atletas?")) return;

        try {
             const cestasRef = collection(db, "eventos", selectedEvent.id, "jogos", gameId, "cestas");
             const cestasSnap = await getDocs(cestasRef);
             const deleteCestas = cestasSnap.docs.map(c => deleteDoc(c.ref));
             await Promise.all(deleteCestas);

             await deleteDoc(doc(db, "eventos", selectedEvent.id, "jogos", gameId));
             
             // Refresh list locally
             setEventGames(prev => prev.filter(g => g.id !== gameId));
        } catch (e) {
            console.error("Error deleting game", e);
            alert("Erro ao excluir jogo.");
        }
    };

    // Open Form for NEW Event
    const openNewEventForm = () => {
        setIsEditingEvent(false);
        setFormEventId(null);
        setFormName('');
        setFormDate(new Date().toISOString().split('T')[0]);
        setFormMode('5x5');
        setFormType('amistoso');
        setFormStatus('proximo');
        setFormRoster([]);
        setShowEventForm(true);
    };

    // Open Form for EDIT Event
    const openEditEventForm = (event: Evento) => {
        setIsEditingEvent(true);
        setFormEventId(event.id);
        setFormName(event.nome);
        setFormDate(event.data);
        setFormMode(event.modalidade);
        setFormType(event.type);
        setFormStatus(event.status);
        setFormRoster(event.jogadoresEscalados || []);
        setShowEventForm(true);
    };

    const handleSaveEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const eventData = {
                nome: formName,
                data: formDate,
                modalidade: formMode,
                type: formType,
                status: formStatus,
                jogadoresEscalados: formRoster
            };

            if (isEditingEvent && formEventId) {
                // Update
                await updateDoc(doc(db, "eventos", formEventId), eventData);
                // Update local selection if needed
                if (selectedEvent?.id === formEventId) {
                    setSelectedEvent({ ...selectedEvent, ...eventData, id: formEventId });
                }
            } else {
                // Create
                await addDoc(collection(db, "eventos"), eventData);
            }
            
            setShowEventForm(false);
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar evento");
        }
    };

    const togglePlayerInRoster = (playerId: string) => {
        setFormRoster(prev => {
            if (prev.includes(playerId)) {
                return prev.filter(id => id !== playerId);
            } else {
                return [...prev, playerId];
            }
        });
    };

    const filteredEvents = events.filter(e => {
        if (tab === 'proximos') return e.status === 'proximo' || e.status === 'andamento';
        return e.status === 'finalizado';
    });
    
    const displayEvents = tab === 'proximos' ? [...filteredEvents].reverse() : filteredEvents;

    const renderGameItem = (jogo: Jogo) => {
        const isInternal = !!jogo.timeA_nome;
        const sA = jogo.placarTimeA_final ?? jogo.placarANCB_final ?? 0;
        const sB = jogo.placarTimeB_final ?? jogo.placarAdversario_final ?? 0;
        
        return (
            <div 
                key={jogo.id} 
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-4 shadow-sm mb-3 cursor-pointer hover:border-ancb-blue transition-all group relative"
                onClick={() => setSelectedGame(jogo)}
            >
                <div className="text-xs text-gray-400 text-center mb-2 border-b border-gray-50 dark:border-gray-700 pb-1 group-hover:text-ancb-blue">
                    {jogo.dataJogo ? `Partida: ${jogo.dataJogo}` : 'Resultado Final'} • Clique para detalhes
                </div>
                
                <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col items-center w-1/3">
                        <span className="font-bold text-gray-800 dark:text-gray-200 text-sm md:text-base text-center leading-tight">
                            {isInternal ? jogo.timeA_nome : "ANCB"}
                        </span>
                    </div>

                    <div className="flex items-center justify-center gap-2 w-1/3">
                        <span className="text-2xl font-bold text-ancb-blue dark:text-blue-400">{sA}</span>
                        <span className="text-xs text-gray-300">x</span>
                        <span className="text-2xl font-bold text-ancb-red dark:text-red-400">{sB}</span>
                    </div>

                    <div className="flex flex-col items-center w-1/3">
                        <span className="font-bold text-gray-800 dark:text-gray-200 text-sm md:text-base text-center leading-tight">
                            {isInternal ? jogo.timeB_nome : (jogo.adversario || "Adversário")}
                        </span>
                    </div>
                </div>

                {userProfile?.role === 'admin' && selectedEvent && (
                    <div className="flex justify-center mt-2 border-t border-gray-100 dark:border-gray-700 pt-2 gap-2">
                        {onOpenGamePanel && (
                            <Button 
                                size="sm" 
                                variant="secondary"
                                className="!py-1 text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenGamePanel(jogo, selectedEvent.id);
                                }}
                            >
                                <LucidePlayCircle size={14} /> Painel
                            </Button>
                        )}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteGame(jogo.id);
                            }}
                            className="p-1 px-2 rounded bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 flex items-center gap-1 text-xs font-bold"
                            title="Excluir Jogo"
                        >
                            <LucideTrash2 size={14} /> Excluir
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'andamento': return 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300 border-red-200 animate-pulse';
            case 'finalizado': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200';
            default: return 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200';
        }
    };

    const getModalityColor = (mod: string) => {
        return mod === '3x3' 
            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200'
            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200';
    };

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
                
                {/* Admin Shortcut: New Event */}
                {userProfile?.role === 'admin' && (
                    <Button size="sm" onClick={openNewEventForm}>
                        <LucidePlus size={16} /> <span className="hidden sm:inline">Novo Evento</span>
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 inline-flex gap-1 mb-8 w-full md:w-auto">
                <button
                    onClick={() => setTab('proximos')}
                    className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                        tab === 'proximos' 
                        ? 'bg-ancb-blue text-white shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <LucideCalendarClock size={16} /> Próximos
                    </div>
                </button>
                <button
                    onClick={() => setTab('finalizados')}
                    className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                        tab === 'finalizados' 
                        ? 'bg-green-600 text-white shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <LucideCheckCircle2 size={16} /> Finalizados
                    </div>
                </button>
            </div>

            {/* List (Grid View) */}
            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ancb-blue"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayEvents.length > 0 ? displayEvents.map(evento => (
                        <Card 
                            key={evento.id} 
                            onClick={() => setSelectedEvent(evento)}
                            className="flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-t-4 border-t-ancb-blue dark:border-t-blue-500 cursor-pointer group"
                        >
                            {/* Header: Date and Status */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center min-w-[60px] border border-gray-100 dark:border-gray-600">
                                    <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">{evento.data.split('-')[1] || 'MÊS'}</span>
                                    <span className="block text-xl font-bold text-gray-800 dark:text-white">{evento.data.split('-')[2] || 'DIA'}</span>
                                </div>
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${getStatusColor(evento.status)}`}>
                                    {evento.status === 'andamento' ? 'AO VIVO' : evento.status}
                                </span>
                            </div>

                            {/* Body: Title and Type */}
                            <div className="flex-grow mb-4">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white leading-tight mb-1 group-hover:text-ancb-blue transition-colors">{evento.nome}</h3>
                                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
                                    <LucideTrophy size={14} className="text-ancb-orange" />
                                    <span className="capitalize">{evento.type.replace('_', ' ')}</span>
                                </div>
                            </div>

                            {/* Footer: Modality and Actions */}
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                                <span className={`text-xs font-bold px-3 py-1 rounded-md uppercase border ${getModalityColor(evento.modalidade)}`}>
                                    {evento.modalidade}
                                </span>

                                <div className="flex items-center gap-2 text-ancb-blue dark:text-blue-400 text-sm font-bold">
                                    {userProfile?.role === 'admin' ? (
                                        <>
                                            <LucideSettings size={14} /> <span className="text-xs uppercase">Gerenciar</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-xs uppercase">Detalhes</span> <LucideChevronRight size={14} />
                                        </>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )) : (
                        <div className="col-span-full text-center py-16 bg-white/50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <LucideCalendarClock size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Nenhum evento encontrado nesta categoria.</p>
                        </div>
                    )}
                </div>
            )}

            {/* EVENT Details Modal */}
            <Modal
                isOpen={!!selectedEvent}
                onClose={() => setSelectedEvent(null)}
                title="Detalhes do Evento"
            >
                {selectedEvent && (
                    <div>
                        <div className="mb-6 border-b border-gray-100 dark:border-gray-700 pb-4 flex flex-col gap-3">
                            <div>
                                <h2 className="text-xl font-bold text-ancb-blue dark:text-blue-400 mb-1">{selectedEvent.nome}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{selectedEvent.type.replace('_', ' ')} • {selectedEvent.data}</p>
                            </div>
                            
                            {userProfile?.role === 'admin' && (
                                <div className="flex gap-2">
                                    <Button 
                                        size="sm" 
                                        variant="secondary" 
                                        onClick={() => { setSelectedEvent(null); openEditEventForm(selectedEvent); }}
                                        className="flex-1 dark:text-white dark:border-gray-600"
                                    >
                                        <LucideEdit size={16} /> Editar
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="secondary" 
                                        onClick={handleDeleteEvent}
                                        className="flex-1 !text-red-500 !border-red-200 hover:!bg-red-50 dark:hover:!bg-red-900/20"
                                    >
                                        <LucideTrash2 size={16} /> Excluir Evento
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                                    <LucideGamepad2 size={18} className="text-ancb-orange" /> 
                                    Jogos / Cronograma
                                </h4>
                                {/* ADMIN SHORTCUT: Add Game */}
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
                                <div>
                                    {eventGames.map(game => renderGameItem(game))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-400 dark:text-gray-400 text-sm">
                                    <p>Nenhum jogo cadastrado ainda.</p>
                                    {userProfile?.role === 'admin' && <p className="text-xs mt-1">Adicione um jogo para configurar a escalação.</p>}
                                </div>
                            )}
                        </div>

                        {/* Roster Preview (Escalação) */}
                        <div className="mt-6">
                            <h4 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-3">
                                <LucideUsers size={18} className="text-ancb-blue dark:text-blue-400" />
                                Elenco Escalado ({selectedEvent.jogadoresEscalados?.length || 0})
                            </h4>
                            {selectedEvent.jogadoresEscalados && selectedEvent.jogadoresEscalados.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {allPlayers.filter(p => selectedEvent.jogadoresEscalados?.includes(p.id)).map(p => (
                                        <span key={p.id} className="text-xs bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded text-gray-700 dark:text-gray-200">
                                            {p.apelido || p.nome}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic">Nenhum jogador escalado.</p>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
            
            {/* ADMIN MODAL: Add Game inside Event */}
            <Modal isOpen={showAddGame} onClose={() => setShowAddGame(false)} title="Adicionar Jogo">
                <form onSubmit={handleCreateGame} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Time A (Nome)</label>
                        <input className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ancb-blue" placeholder="Ex: Bulls" value={newGameTimeA} onChange={e => setNewGameTimeA(e.target.value)} required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Time B (Nome)</label>
                        <input className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ancb-blue" placeholder="Ex: Lakers" value={newGameTimeB} onChange={e => setNewGameTimeB(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full">Criar Jogo</Button>
                </form>
            </Modal>

            {/* ADMIN MODAL: New / Edit Event & Roster */}
            <Modal isOpen={showEventForm} onClose={() => setShowEventForm(false)} title={isEditingEvent ? "Editar Evento" : "Novo Evento"}>
                <form onSubmit={handleSaveEvent} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Nome do Evento</label>
                            <input className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ancb-blue" placeholder="Nome do Evento" value={formName} onChange={e => setFormName(e.target.value)} required />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Data</label>
                            <input type="date" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ancb-blue" value={formDate} onChange={e => setFormDate(e.target.value)} required />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Status</label>
                            <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ancb-blue" value={formStatus} onChange={(e:any) => setFormStatus(e.target.value)}>
                                <option value="proximo">Próximo</option>
                                <option value="andamento">Em Andamento</option>
                                <option value="finalizado">Finalizado</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Modalidade</label>
                            <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ancb-blue" value={formMode} onChange={(e:any) => setFormMode(e.target.value)}>
                                <option value="5x5">5x5</option>
                                <option value="3x3">3x3</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Tipo</label>
                            <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ancb-blue" value={formType} onChange={(e:any) => setFormType(e.target.value)}>
                                <option value="amistoso">Amistoso</option>
                                <option value="torneio_interno">Torneio Interno</option>
                                <option value="torneio_externo">Torneio Externo</option>
                            </select>
                        </div>
                    </div>

                    {/* Roster Selection */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 flex items-center justify-between">
                            <span>Escalar Jogadores</span>
                            <span className="text-xs font-normal text-ancb-blue dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">{formRoster.length} selecionados</span>
                        </label>
                        
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar bg-gray-50 dark:bg-gray-700/30 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                            {allPlayers.map(player => {
                                const isSelected = formRoster.includes(player.id);
                                return (
                                    <div 
                                        key={player.id}
                                        onClick={() => togglePlayerInRoster(player.id)}
                                        className={`
                                            flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all border
                                            ${isSelected 
                                                ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-500' 
                                                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-600 hover:border-gray-300'}
                                        `}
                                    >
                                        <div className={`text-ancb-blue dark:text-blue-400 ${isSelected ? 'opacity-100' : 'opacity-30'}`}>
                                            {isSelected ? <LucideCheckSquare size={18} /> : <LucideSquare size={18} />}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className={`text-xs font-bold truncate ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {player.apelido || player.nome}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <Button type="submit" className="w-full">{isEditingEvent ? "Salvar Alterações" : "Criar Evento"}</Button>
                </form>
            </Modal>

            {/* GAME Stats Modal */}
            <Modal
                isOpen={!!selectedGame}
                onClose={() => setSelectedGame(null)}
                title="Súmula da Partida"
            >
                {selectedGame && (
                    <div className="animate-fadeIn">
                        {/* Score Header */}
                        <div className="bg-ancb-black text-white p-6 rounded-xl mb-6 shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <LucideBarChart3 size={100} />
                            </div>
                            <div className="relative z-10 flex justify-between items-center">
                                <div className="text-center w-1/3">
                                    <span className="block font-bold text-lg leading-tight">{selectedGame.timeA_nome || "ANCB"}</span>
                                </div>
                                <div className="text-center w-1/3">
                                    <span className="text-3xl font-bold text-ancb-orange">
                                        {selectedGame.placarTimeA_final ?? selectedGame.placarANCB_final ?? 0}
                                    </span>
                                    <span className="text-gray-500 mx-2">x</span>
                                    <span className="text-3xl font-bold text-white">
                                        {selectedGame.placarTimeB_final ?? selectedGame.placarAdversario_final ?? 0}
                                    </span>
                                </div>
                                <div className="text-center w-1/3">
                                    <span className="block font-bold text-lg leading-tight">{selectedGame.timeB_nome || selectedGame.adversario || "ADV"}</span>
                                </div>
                            </div>
                        </div>

                        <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                            <LucideBarChart3 size={18} className="text-ancb-blue dark:text-blue-400" />
                            Estatísticas dos Jogadores
                        </h4>

                        {loadingStats ? (
                             <div className="py-8 flex justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                            </div>
                        ) : gameStats.length > 0 ? (
                            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-bold">Jogador</th>
                                                <th className="px-2 py-3 text-center text-xs font-bold text-gray-400 dark:text-gray-500">1PT</th>
                                                <th className="px-2 py-3 text-center text-xs font-bold text-gray-400 dark:text-gray-500">2PT</th>
                                                <th className="px-2 py-3 text-center text-xs font-bold text-gray-400 dark:text-gray-500">3PT</th>
                                                <th className="px-4 py-3 text-right font-bold text-gray-700 dark:text-gray-300">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {gameStats.map((stat) => (
                                                <tr key={stat.player.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                    <td className="px-4 py-3 flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                            {stat.player.foto ? (
                                                                <img src={stat.player.foto} className="w-full h-full object-cover"/>
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{stat.player.nome.charAt(0)}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-800 dark:text-gray-200 text-sm leading-tight">{stat.player.apelido || stat.player.nome}</span>
                                                            {stat.player.apelido && <span className="text-[10px] text-gray-400 hidden sm:inline">{stat.player.nome}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-2 py-3 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${stat.cesta1 > 0 ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' : 'text-gray-300 dark:text-gray-600'}`}>
                                                            {stat.cesta1}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 py-3 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${stat.cesta2 > 0 ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' : 'text-gray-300 dark:text-gray-600'}`}>
                                                            {stat.cesta2}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 py-3 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${stat.cesta3 > 0 ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' : 'text-gray-300 dark:text-gray-600'}`}>
                                                            {stat.cesta3}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-ancb-black dark:text-white text-base">
                                                        {stat.points} Pts
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                             <div className="text-center py-10 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-dashed border-gray-200 dark:border-gray-600">
                                <p className="text-gray-400 text-sm mb-1">Nenhuma estatística individual encontrada.</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};