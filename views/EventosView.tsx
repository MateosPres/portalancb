
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import { Evento, Jogo, Player, UserProfile, Time, EscaladoInfo, RosterEntry, Cesta } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { ShareModal } from '../components/ShareModal';
import { GameSummaryModal } from '../components/GameSummaryModal';
import { LucideArrowLeft, LucideCalendarClock, LucideCheckCircle2, LucideGamepad2, LucideBarChart3, LucidePlus, LucideTrophy, LucideChevronRight, LucideSettings, LucideEdit, LucideUsers, LucideCheckSquare, LucideSquare, LucideTrash2, LucideStar, LucideMessageSquare, LucidePlayCircle, LucideShield, LucideCamera, LucideLoader2, LucideCalendar, LucideMapPin, LucideShare2, LucideSearch } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { collection, doc, getDocs, getDoc, writeBatch, updateDoc, addDoc, serverTimestamp, setDoc, query, where, limit } from 'firebase/firestore';

interface EventosViewProps {
    onBack: () => void;
    userProfile?: UserProfile | null;
    onSelectEvent: (eventId: string) => void;
    onOpenFriendlyAdminPanel?: (eventId: string, game: Jogo) => void;
    initialFriendlyEventId?: string | null;
    onFriendlySummaryOpened?: () => void;
}

export const EventosView: React.FC<EventosViewProps> = ({ onBack, userProfile, onSelectEvent, onOpenFriendlyAdminPanel, initialFriendlyEventId, onFriendlySummaryOpened }) => {
    const [events, setEvents] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'proximos' | 'finalizados'>('proximos');
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    
    // Share State
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareData, setShareData] = useState<any>(null);
    const [friendlyGamesMap, setFriendlyGamesMap] = useState<Record<string, Jogo>>({});
    const [selectedFriendlySummary, setSelectedFriendlySummary] = useState<{ eventId: string; game: Jogo } | null>(null);

    const [showFriendlyEditModal, setShowFriendlyEditModal] = useState(false);
    const [editingFriendlyEventId, setEditingFriendlyEventId] = useState<string | null>(null);
    const [editFriendlyName, setEditFriendlyName] = useState('');
    const [editFriendlyDate, setEditFriendlyDate] = useState('');
    const [editFriendlyHour, setEditFriendlyHour] = useState('');
    const [editFriendlyMode, setEditFriendlyMode] = useState<'3x3'|'5x5'>('5x5');
    const [editFriendlyStatus, setEditFriendlyStatus] = useState<'proximo'|'andamento'|'finalizado'>('proximo');
    const [editFriendlyOpponent, setEditFriendlyOpponent] = useState('');
    const [editFriendlyRosterMap, setEditFriendlyRosterMap] = useState<Record<string, number>>({});
    const [editFriendlyRosterSearch, setEditFriendlyRosterSearch] = useState('');
    
    // For admin creating events only
    const [showEventForm, setShowEventForm] = useState(false);
    const [formName, setFormName] = useState('');
    const [formDate, setFormDate] = useState('');
    const [formGameHour, setFormGameHour] = useState('');
    const [formMode, setFormMode] = useState<'3x3'|'5x5'>('5x5');
    const [formType, setFormType] = useState<'amistoso'|'torneio_interno'|'torneio_externo'>('amistoso');
    const [formStatus, setFormStatus] = useState<'proximo'|'andamento'|'finalizado'>('proximo');
    const [formOpponent, setFormOpponent] = useState(''); // Only for Amistoso
    
    // Roster Selection State
    const [selectedRosterMap, setSelectedRosterMap] = useState<Record<string, number>>({});
    const [rosterSearch, setRosterSearch] = useState('');

    useEffect(() => {
        const unsubscribe = db.collection("eventos").orderBy("data", "desc").onSnapshot((snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Evento));
            setEvents(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchPlayers = async () => {
            const snapshot = await db.collection("jogadores").orderBy("nome").get();
            setAllPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Player)));
        };
        fetchPlayers();
    }, []);

    useEffect(() => {
        const loadFriendlyGames = async () => {
            const friendlyEvents = events.filter(e => e.type === 'amistoso');
            if (friendlyEvents.length === 0) {
                setFriendlyGamesMap({});
                return;
            }

            const entries = await Promise.all(
                friendlyEvents.map(async (event) => {
                    const gamesSnap = await getDocs(collection(db, "eventos", event.id, "jogos"));
                    const games = gamesSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Jogo));
                    if (games.length === 0) return [event.id, null] as const;

                    const sorted = [...games].sort((a, b) => {
                        const keyA = `${a.dataJogo || ''}T${a.horaJogo || '00:00'}`;
                        const keyB = `${b.dataJogo || ''}T${b.horaJogo || '00:00'}`;
                        return keyA.localeCompare(keyB);
                    });

                    return [event.id, sorted[0]] as const;
                })
            );

            const gameMap: Record<string, Jogo> = {};
            entries.forEach(([eventId, game]) => {
                if (game) gameMap[eventId] = game;
            });
            setFriendlyGamesMap(gameMap);
        };

        loadFriendlyGames();
    }, [events]);

    useEffect(() => {
        if (!initialFriendlyEventId) return;
        const game = friendlyGamesMap[initialFriendlyEventId];
        if (!game) return;

        setSelectedFriendlySummary({ eventId: initialFriendlyEventId, game });
        if (onFriendlySummaryOpened) onFriendlySummaryOpened();
    }, [initialFriendlyEventId, friendlyGamesMap, onFriendlySummaryOpened]);

    const handleEventCardClick = (evento: Evento) => {
        if (evento.type === 'amistoso') {
            const game = friendlyGamesMap[evento.id];
            if (game) {
                setSelectedFriendlySummary({ eventId: evento.id, game });
                return;
            }
        }

        onSelectEvent(evento.id);
    };

    const toggleFriendlyEditRosterPlayer = (player: Player) => {
        setEditFriendlyRosterMap(prev => {
            const next = { ...prev };
            if (next[player.id] !== undefined) {
                delete next[player.id];
            } else {
                next[player.id] = player.numero_uniforme || 0;
            }
            return next;
        });
    };

    const updateFriendlyEditRosterNumber = (playerId: string, number: string) => {
        setEditFriendlyRosterMap(prev => ({
            ...prev,
            [playerId]: Number(number)
        }));
    };

    const handleOpenFriendlyEdit = (evento: Evento) => {
        const game = friendlyGamesMap[evento.id];
        setEditingFriendlyEventId(evento.id);
        setEditFriendlyName(evento.nome || '');
        setEditFriendlyDate(evento.data || '');
        setEditFriendlyMode(evento.modalidade || '5x5');
        setEditFriendlyStatus(evento.status || 'proximo');
        setEditFriendlyOpponent(game?.adversario || game?.timeB_nome || '');
        setEditFriendlyHour(game?.horaJogo || '');

        const rosterMap: Record<string, number> = {};
        (evento.jogadoresEscalados || []).forEach(entry => {
            if (typeof entry === 'string') {
                const player = allPlayers.find(p => p.id === entry);
                rosterMap[entry] = player?.numero_uniforme || 0;
            } else {
                rosterMap[entry.id] = Number(entry.numero || 0);
            }
        });

        setEditFriendlyRosterMap(rosterMap);
        setEditFriendlyRosterSearch('');
        setShowFriendlyEditModal(true);
    };

    const handleSaveFriendlyEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingFriendlyEventId) return;

        try {
            const rosterArray: EscaladoInfo[] = Object.entries(editFriendlyRosterMap).map(([id, num]) => ({
                id,
                numero: Number(num)
            }));

            await updateDoc(doc(db, "eventos", editingFriendlyEventId), {
                nome: editFriendlyName,
                data: editFriendlyDate,
                modalidade: editFriendlyMode,
                status: editFriendlyStatus,
                jogadoresEscalados: rosterArray
            });

            const existingGame = friendlyGamesMap[editingFriendlyEventId];
            if (existingGame?.id) {
                await updateDoc(doc(db, "eventos", editingFriendlyEventId, "jogos", existingGame.id), {
                    dataJogo: editFriendlyDate,
                    horaJogo: editFriendlyHour,
                    timeA_nome: 'ANCB',
                    timeB_nome: editFriendlyOpponent,
                    adversario: editFriendlyOpponent,
                });
            } else {
                await addDoc(collection(db, "eventos", editingFriendlyEventId, "jogos"), {
                    dataJogo: editFriendlyDate,
                    horaJogo: editFriendlyHour,
                    status: editFriendlyStatus === 'finalizado' ? 'finalizado' : 'agendado',
                    timeA_nome: 'ANCB',
                    timeB_nome: editFriendlyOpponent,
                    adversario: editFriendlyOpponent,
                    placarTimeA_final: 0,
                    placarTimeB_final: 0,
                    placarANCB_final: 0,
                    placarAdversario_final: 0
                });
            }

            const rosterSnap = await getDocs(collection(db, "eventos", editingFriendlyEventId, "roster"));
            const existingRosterMap: Record<string, any> = {};
            rosterSnap.forEach(d => {
                existingRosterMap[d.id] = d.data();
            });

            const desiredIds = Object.keys(editFriendlyRosterMap);
            const newInvitePlayerIds = desiredIds.filter(playerId => !existingRosterMap[playerId]);
            const batch = writeBatch(db);

            desiredIds.forEach(playerId => {
                const existingData = existingRosterMap[playerId] || {};
                batch.set(doc(db, "eventos", editingFriendlyEventId, "roster", playerId), {
                    playerId,
                    status: existingData.status || 'pendente',
                    updatedAt: serverTimestamp()
                }, { merge: true });
            });

            Object.keys(existingRosterMap)
                .filter(playerId => !desiredIds.includes(playerId))
                .forEach(playerId => {
                    batch.delete(doc(db, "eventos", editingFriendlyEventId, "roster", playerId));
                });

            await batch.commit();

            if (newInvitePlayerIds.length > 0) {
                await sendFriendlyRosterInvites(editingFriendlyEventId, editFriendlyName, newInvitePlayerIds);
            }

            setShowFriendlyEditModal(false);
            setEditingFriendlyEventId(null);
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar amistoso.");
        }
    };

    const handleDeleteFriendlyEvent = async () => {
        if (!editingFriendlyEventId) return;
        if (!window.confirm("Deseja excluir este evento amistoso? Esta ação não pode ser desfeita.")) return;

        try {
            const rosterSnap = await getDocs(collection(db, "eventos", editingFriendlyEventId, "roster"));
            const gamesSnap = await getDocs(collection(db, "eventos", editingFriendlyEventId, "jogos"));

            const batch = writeBatch(db);
            rosterSnap.forEach(d => batch.delete(d.ref));
            gamesSnap.forEach(d => batch.delete(d.ref));
            batch.delete(doc(db, "eventos", editingFriendlyEventId));
            await batch.commit();

            setShowFriendlyEditModal(false);
            setEditingFriendlyEventId(null);
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir evento amistoso.");
        }
    };

    const sendFriendlyRosterInvites = async (eventId: string, eventName: string, playerIds: string[]) => {
        const uniquePlayerIds = Array.from(new Set(playerIds.filter(Boolean)));
        for (const playerId of uniquePlayerIds) {
            try {
                const player = allPlayers.find(p => p.id === playerId);
                let targetUserId = player?.userId || '';

                if (!targetUserId) {
                    const userSnap = await getDocs(query(collection(db, 'usuarios'), where('linkedPlayerId', '==', playerId), limit(1)));
                    if (!userSnap.empty) {
                        targetUserId = userSnap.docs[0].id;
                    }
                }

                if (!targetUserId) continue;

                const notifId = `roster_invite_${targetUserId}_${eventId}_${playerId}`;
                await setDoc(doc(db, 'notifications', notifId), {
                    type: 'roster_invite',
                    title: 'Convocação!',
                    message: `Você foi convocado para o amistoso ${eventName}.`,
                    data: { eventId, playerId, inviteContext: 'friendly' },
                    playerId,
                    targetUserId,
                    read: false,
                    timestamp: serverTimestamp(),
                    status: 'pending'
                }, { merge: true });
            } catch (err) {
                console.error('Erro ao criar roster_invite de amistoso:', err);
            }
        }
    };

    const toggleRosterPlayer = (player: Player) => {
        setSelectedRosterMap(prev => {
            const newMap = { ...prev };
            if (newMap[player.id] !== undefined) {
                delete newMap[player.id];
            } else {
                newMap[player.id] = player.numero_uniforme || 0;
            }
            return newMap;
        });
    };

    const updateRosterNumber = (playerId: string, number: string) => {
        setSelectedRosterMap(prev => ({
            ...prev,
            [playerId]: Number(number)
        }));
    };

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Build new roster structure: Array of objects { id, numero }
            const rosterArray: EscaladoInfo[] = Object.entries(selectedRosterMap).map(([id, num]) => ({
                id,
                numero: Number(num)
            }));

            const eventDocRef = await db.collection("eventos").add({
                nome: formName,
                data: formDate,
                modalidade: formMode,
                type: formType,
                status: formStatus,
                jogadoresEscalados: rosterArray // Save specific jersey numbers for legacy/backup
            });

            // CRITICAL FIX: Write to subcollection immediately as 'pendente'
            if (rosterArray.length > 0) {
                const batch = writeBatch(db);
                rosterArray.forEach(p => {
                    const rosterRef = eventDocRef.collection('roster').doc(p.id) as any;
                    batch.set(rosterRef, { 
                        playerId: p.id, 
                        status: 'pendente', // Force pending on creation
                        updatedAt: new Date() 
                    });
                });
                await batch.commit();
            }

            if (formType === 'amistoso' && rosterArray.length > 0) {
                await sendFriendlyRosterInvites(eventDocRef.id, formName, rosterArray.map(p => p.id));
            }

            // If Amistoso, automatically create the single match
            if (formType === 'amistoso' && formOpponent) {
                await eventDocRef.collection('jogos').add({
                    dataJogo: formDate,
                    horaJogo: formGameHour,
                    status: 'agendado',
                    timeA_nome: 'ANCB',
                    timeB_nome: formOpponent,
                    adversario: formOpponent,
                    placarTimeA_final: 0,
                    placarTimeB_final: 0,
                    placarANCB_final: 0,
                    placarAdversario_final: 0
                });
            }

            setShowEventForm(false);
            // Reset form
            setFormName(''); setFormDate(''); setFormGameHour(''); setFormOpponent(''); setSelectedRosterMap({});
        } catch (e) { alert("Erro ao criar evento"); }
    };

    const handleShareEvent = async (e: React.MouseEvent, evento: Evento) => {
        e.stopPropagation();
        
        let type: 'roster' | 'internal_teams' = 'roster';
        let players: Player[] = [];
        let teams: Time[] = [];

        if (evento.type === 'torneio_interno') {
            type = 'internal_teams';
            teams = evento.times || [];
        } else {
            type = 'roster';
            
            try {
                // Fetch roster subcollection to check status
                const rosterSnap = await db.collection("eventos").doc(evento.id).collection("roster").get();
                let validIds: string[] = [];

                if (!rosterSnap.empty) {
                    rosterSnap.forEach(doc => {
                        const data = doc.data();
                        // Exclude 'recusado' players from the story
                        if (data.status !== 'recusado') {
                            validIds.push(doc.id); // doc.id is the playerId
                        }
                    });
                } else {
                    // Fallback to legacy array if subcollection is empty
                    // Check if it's string[] or object[]
                    if (evento.jogadoresEscalados && evento.jogadoresEscalados.length > 0) {
                        if (typeof evento.jogadoresEscalados[0] === 'string') {
                            validIds = evento.jogadoresEscalados as string[];
                        } else {
                            validIds = (evento.jogadoresEscalados as EscaladoInfo[]).map(e => e.id);
                        }
                    }
                }

                // Filter the global player list by valid IDs
                players = allPlayers.filter(p => validIds.includes(p.id));

            } catch (err) {
                console.error("Error fetching roster for share:", err);
            }
        }

        setShareData({
            type,
            event: evento,
            players,
            teams
        });
        setShowShareModal(true);
    };

    // Helper for Card Gradients based on Type
    const getCardStyle = (type: string) => {
        switch (type) {
            case 'amistoso': return 'bg-gradient-to-br from-blue-900 to-cyan-600 text-white border-none shadow-blue-900/20';
            case 'torneio_interno': return 'bg-gradient-to-br from-orange-700 to-yellow-500 text-white border-none shadow-orange-900/20';
            case 'torneio_externo': return 'bg-gradient-to-br from-red-900 to-orange-800 text-white border-none shadow-red-900/20';
            default: return 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-100 dark:border-gray-700';
        }
    };

    const getStatusBadgeStyle = (status: string, cardType: string) => {
        // On colored cards, use semi-transparent black or white
        if (status === 'andamento') return 'bg-amber-500 text-white animate-pulse border border-amber-400';
        return 'bg-black/30 text-white backdrop-blur-sm border border-white/10';
    };

    const filteredEvents = events.filter(e => tab === 'proximos' ? e.status !== 'finalizado' : e.status === 'finalizado');
    const displayEvents = tab === 'proximos' ? [...filteredEvents].reverse() : filteredEvents;

    const filteredRosterPlayers = allPlayers.filter(p => 
        (p.nome || '').toLowerCase().includes(rosterSearch.toLowerCase()) || 
        (p.apelido || '').toLowerCase().includes(rosterSearch.toLowerCase())
    );

    const filteredEditFriendlyRosterPlayers = allPlayers.filter(p => 
        (p.nome || '').toLowerCase().includes(editFriendlyRosterSearch.toLowerCase()) || 
        (p.apelido || '').toLowerCase().includes(editFriendlyRosterSearch.toLowerCase())
    );

    return (
        <div className="animate-fadeIn pb-10">
            <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <Button variant="secondary" size="sm" onClick={onBack} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                        <LucideArrowLeft size={18} />
                    </Button>
                    <h2 className="text-2xl font-bold text-ancb-black dark:text-white">Calendário</h2>
                </div>
                {(userProfile?.role === 'admin' || userProfile?.role === 'super-admin') && (
                    <Button size="sm" onClick={() => setShowEventForm(true)}>
                        <LucidePlus size={16} /> <span className="hidden sm:inline">Novo Evento</span>
                    </Button>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 inline-flex gap-1 mb-8 w-full md:w-auto">
                <button onClick={() => setTab('proximos')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'proximos' ? 'bg-ancb-blue text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    <div className="flex items-center justify-center gap-2"><LucideCalendarClock size={16} /> Próximos</div>
                </button>
                <button onClick={() => setTab('finalizados')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'finalizados' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    <div className="flex items-center justify-center gap-2"><LucideCheckCircle2 size={16} /> Finalizados</div>
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ancb-blue"></div></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                    {displayEvents.length > 0 ? displayEvents.map(evento => (
                        <Card 
                            key={evento.id} 
                            onClick={() => handleEventCardClick(evento)} 
                            className={`flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden ${getCardStyle(evento.type)}`}
                        >
                            {/* Decorative Background Icon */}
                            <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12 pointer-events-none">
                                <LucideTrophy size={140} fill="currentColor" />
                            </div>

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="bg-white/20 backdrop-blur-md rounded-lg p-2 text-center min-w-[60px] border border-white/30 text-white shadow-sm">
                                    <span className="block text-[10px] font-bold uppercase tracking-wider opacity-80">{evento.data.split('-')[1] || 'MÊS'}</span>
                                    <span className="block text-2xl font-black leading-none">{evento.data.split('-')[2] || 'DIA'}</span>
                                </div>
                                <div className="flex gap-2">
                                    {(userProfile?.role === 'admin' || userProfile?.role === 'super-admin') && evento.type === 'amistoso' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleOpenFriendlyEdit(evento); }}
                                            className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors backdrop-blur-md border border-white/10"
                                            title="Editar evento"
                                        >
                                            <LucideEdit size={16} />
                                        </button>
                                    )}
                                    <button 
                                        onClick={(e) => handleShareEvent(e, evento)}
                                        className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors backdrop-blur-md border border-white/10"
                                        title="Gerar Card para Instagram"
                                    >
                                        <LucideShare2 size={16} />
                                    </button>
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide flex items-center ${getStatusBadgeStyle(evento.status, evento.type)}`}>
                                        {evento.status === 'andamento' ? 'EM ANDAMENTO' : evento.status}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex-grow mb-4 relative z-10">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <h3 className="text-2xl font-bold leading-tight drop-shadow-sm">{evento.nome}</h3>
                                    {evento.type === 'amistoso' && friendlyGamesMap[evento.id]?.status === 'finalizado' && (
                                        <div className="shrink-0 rounded-md border border-white/20 bg-black/20 px-2.5 py-1.5 text-white text-sm font-extrabold leading-none tracking-tight whitespace-nowrap">
                                            <span className="text-white/90 text-[11px] mr-1">{friendlyGamesMap[evento.id].timeA_nome || 'ANCB'}</span>
                                            <span className="text-ancb-orange">{friendlyGamesMap[evento.id].placarTimeA_final ?? friendlyGamesMap[evento.id].placarANCB_final ?? 0}</span>
                                            <span className="text-white/80 px-1">x</span>
                                            <span className="text-ancb-orange">{friendlyGamesMap[evento.id].placarTimeB_final ?? friendlyGamesMap[evento.id].placarAdversario_final ?? 0}</span>
                                            <span className="text-white/90 text-[11px] ml-1">{friendlyGamesMap[evento.id].timeB_nome || friendlyGamesMap[evento.id].adversario || 'Adversário'}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1 text-white/80 text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                        <LucideTrophy size={14} className="opacity-70" />
                                        <span className="capitalize tracking-wide">{evento.type.replace('_', ' ')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/20 relative z-10">
                                <span className="text-xs font-bold px-3 py-1 rounded-md uppercase border border-white/30 bg-white/10 backdrop-blur-sm">
                                    {evento.modalidade}
                                </span>
                                <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors">
                                    Detalhes <LucideChevronRight size={14} />
                                </div>
                            </div>
                        </Card>
                    )) : (
                        <div className="col-span-full text-center py-16 bg-white/50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"><LucideCalendarClock size={48} className="mx-auto text-gray-300 mb-4" /><p className="text-gray-500 dark:text-gray-400 font-medium">Nenhum evento encontrado.</p></div>
                    )}
                </div>
            )}

            <Modal isOpen={showEventForm} onClose={() => setShowEventForm(false)} title="Novo Evento">
                <form onSubmit={handleCreateEvent} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Nome do Evento</label>
                            <input className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-blue outline-none transition-all" value={formName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormName(e.target.value)} required placeholder="Ex: Copa Garantã 2025" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Data</label>
                            <input type="date" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-blue outline-none transition-all" value={formDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormDate(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Status</label>
                            <select className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-blue outline-none transition-all" value={formStatus} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormStatus(e.target.value as any)}><option value="proximo">Próximo</option><option value="andamento">Em Andamento</option><option value="finalizado">Finalizado</option></select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Modalidade</label>
                            <select className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-blue outline-none transition-all" value={formMode} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormMode(e.target.value as any)}><option value="5x5">5x5</option><option value="3x3">3x3</option></select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Tipo</label>
                            <select className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-blue outline-none transition-all" value={formType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormType(e.target.value as any)}><option value="amistoso">Amistoso</option><option value="torneio_interno">Torneio Interno</option><option value="torneio_externo">Torneio Externo</option></select>
                        </div>
                        {formType === 'amistoso' && (
                            <div className="md:col-span-2 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                                <label className="block text-xs font-bold text-blue-700 dark:text-blue-300 uppercase mb-1">Adversário</label>
                                <input className="w-full p-3 border rounded-xl mt-1 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-400 outline-none transition-all" placeholder="Nome do time rival" value={formOpponent} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormOpponent(e.target.value)} required />
                                <label className="block text-xs font-bold text-blue-700 dark:text-blue-300 uppercase mt-3 mb-1">Hora do Jogo</label>
                                <input
                                    type="time"
                                    className="w-full p-3 border rounded-xl mt-1 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-400 outline-none transition-all"
                                    value={formGameHour}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormGameHour(e.target.value)}
                                    required
                                />
                                <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1"><LucideGamepad2 size={12} /> Isso criará automaticamente o jogo no sistema.</p>
                            </div>
                        )}
                        
                        {/* ROSTER SELECTION (Only for Amistoso) */}
                        {formType === 'amistoso' && (
                            <div className="md:col-span-2 mt-2 border-t pt-4 dark:border-gray-700">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
                                    Jogadores (Opcional)
                                </label>
                                <div className="relative mb-2">
                                    <LucideSearch className="absolute left-3 top-2.5 text-gray-400" size={14} />
                                    <input 
                                        className="w-full pl-9 p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600" 
                                        placeholder="Buscar para escalar..." 
                                        value={rosterSearch} 
                                        onChange={e => setRosterSearch(e.target.value)} 
                                    />
                                </div>
                                <div className="max-h-48 overflow-y-auto custom-scrollbar border rounded dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2">
                                    {filteredRosterPlayers.map(p => {
                                        const isSelected = selectedRosterMap[p.id] !== undefined;
                                        return (
                                            <div key={p.id} className={`flex items-center justify-between p-2 mb-1 rounded cursor-pointer ${isSelected ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                                <div className="flex items-center gap-2 flex-1" onClick={() => toggleRosterPlayer(p)}>
                                                    <div className={`w-4 h-4 border rounded flex items-center justify-center ${isSelected ? 'bg-ancb-orange border-ancb-orange' : 'border-gray-400'}`}>
                                                        {isSelected && <LucideCheckSquare size={10} className="text-white"/>}
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{p.nome}</span>
                                                </div>
                                                {isSelected && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[10px] text-gray-500 uppercase">Nº</span>
                                                        <input 
                                                            type="number" 
                                                            className="w-12 p-1 text-center border rounded text-xs font-bold dark:bg-gray-700 dark:text-white"
                                                            value={selectedRosterMap[p.id]}
                                                            onChange={(e) => updateRosterNumber(p.id, e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">
                                    {Object.keys(selectedRosterMap).length} jogadores selecionados. Os números podem ser editados especificamente para este evento.
                                </p>
                            </div>
                        )}
                    </div>
                    <Button type="submit" className="w-full h-12 text-lg">Criar Evento</Button>
                </form>
            </Modal>

            {/* Share Modal */}
            {shareData && (
                <ShareModal 
                    isOpen={showShareModal} 
                    onClose={() => setShowShareModal(false)} 
                    data={shareData}
                />
            )}

            <GameSummaryModal
                isOpen={!!selectedFriendlySummary}
                onClose={() => setSelectedFriendlySummary(null)}
                game={selectedFriendlySummary?.game || null}
                eventId={selectedFriendlySummary?.eventId || ''}
                isAdmin={userProfile?.role === 'admin' || userProfile?.role === 'super-admin'}
                onOpenAdminPanel={() => {
                    if (selectedFriendlySummary) {
                        if (onOpenFriendlyAdminPanel) {
                            onOpenFriendlyAdminPanel(selectedFriendlySummary.eventId, selectedFriendlySummary.game);
                        } else {
                            onSelectEvent(selectedFriendlySummary.eventId);
                        }
                        setSelectedFriendlySummary(null);
                    }
                }}
            />

            <Modal isOpen={showFriendlyEditModal} onClose={() => setShowFriendlyEditModal(false)} title="Editar Amistoso">
                <form onSubmit={handleSaveFriendlyEdit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Nome do Evento</label>
                            <input className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600" value={editFriendlyName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFriendlyName(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Data</label>
                            <input type="date" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600" value={editFriendlyDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFriendlyDate(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Hora</label>
                            <input type="time" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600" value={editFriendlyHour} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFriendlyHour(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Modalidade</label>
                            <select className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600" value={editFriendlyMode} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditFriendlyMode(e.target.value as any)}>
                                <option value="5x5">5x5</option>
                                <option value="3x3">3x3</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Status</label>
                            <select className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600" value={editFriendlyStatus} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditFriendlyStatus(e.target.value as any)}>
                                <option value="proximo">Próximo</option>
                                <option value="andamento">Em Andamento</option>
                                <option value="finalizado">Finalizado</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Adversário</label>
                            <input className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600" value={editFriendlyOpponent} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFriendlyOpponent(e.target.value)} required />
                        </div>

                        <div className="md:col-span-2 mt-2 border-t pt-4 dark:border-gray-700">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Escalação</label>
                            <div className="relative mb-2">
                                <LucideSearch className="absolute left-3 top-2.5 text-gray-400" size={14} />
                                <input 
                                    className="w-full pl-9 p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600" 
                                    placeholder="Buscar para escalar..." 
                                    value={editFriendlyRosterSearch} 
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFriendlyRosterSearch(e.target.value)} 
                                />
                            </div>
                            <div className="max-h-48 overflow-y-auto custom-scrollbar border rounded dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2">
                                {filteredEditFriendlyRosterPlayers.map(p => {
                                    const isSelected = editFriendlyRosterMap[p.id] !== undefined;
                                    return (
                                        <div key={p.id} className={`flex items-center justify-between p-2 mb-1 rounded cursor-pointer ${isSelected ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                            <div className="flex items-center gap-2 flex-1" onClick={() => toggleFriendlyEditRosterPlayer(p)}>
                                                <div className={`w-4 h-4 border rounded flex items-center justify-center ${isSelected ? 'bg-ancb-orange border-ancb-orange' : 'border-gray-400'}`}>
                                                    {isSelected && <LucideCheckSquare size={10} className="text-white"/>}
                                                </div>
                                                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{p.nome}</span>
                                            </div>
                                            {isSelected && (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] text-gray-500 uppercase">Nº</span>
                                                    <input 
                                                        type="number" 
                                                        className="w-12 p-1 text-center border rounded text-xs font-bold dark:bg-gray-700 dark:text-white"
                                                        value={editFriendlyRosterMap[p.id]}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFriendlyEditRosterNumber(p.id, e.target.value)}
                                                        onClick={(e: React.MouseEvent<HTMLInputElement>) => e.stopPropagation()}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button type="submit" className="flex-1">Salvar alterações</Button>
                        <Button type="button" variant="secondary" className="flex-1 !text-red-500 !border-red-200 hover:!bg-red-50 dark:hover:!bg-red-900/20" onClick={handleDeleteFriendlyEvent}>
                            <LucideTrash2 size={14} /> Excluir amistoso
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
