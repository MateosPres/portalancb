
import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { Evento, Jogo, Player, UserProfile, Time, RosterEntry, Cesta, EscaladoInfo } from '../types';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { ShareModal } from '../components/ShareModal';
import { GameSummaryModal } from '../components/GameSummaryModal';
import { ImageCropperModal } from '../components/ImageCropperModal';
import { 
    LucideArrowLeft, LucideCalendar, LucideMapPin, LucideTrophy, 
    LucideUsers, LucideCheckCircle2, LucideXCircle, LucideClock, 
    LucidePlus, LucideTrash2, LucideGamepad2, LucidePlayCircle, LucideEdit, LucideCheckSquare, LucideSquare,
    LucideLoader2, LucideStar, LucideChevronRight, LucideEdit2, LucideChevronDown, LucideChevronUp, LucideShield, LucidePlay, LucideUpload, LucideSave, LucideSearch, LucideX, LucideShare2, LucideMoreVertical,
    LucideRotateCcw, LucideList, LucideNetwork, LucideMedal, LucideAward
} from 'lucide-react';
import { collection, doc, onSnapshot, updateDoc, setDoc, serverTimestamp, query, getDocs, addDoc, deleteDoc, where } from 'firebase/firestore';
import imageCompression from 'browser-image-compression';
import { SimpleScorePanel } from '../components/SimpleScorePanel';
import { GroupStandings } from '../components/GroupStandings';
import { ChaaveConfigurator } from '../components/ChaaveConfigurator';

interface EventoDetalheViewProps {
    eventId: string;
    onBack: () => void;
    userProfile?: UserProfile | null;
    onOpenGamePanel: (game: Jogo, eventId: string) => void;
    onOpenReview?: (gameId: string, eventId: string) => void;
    onSelectPlayer?: (playerId: string, teamId?: string) => void;
    initialTeamId?: string | null;
    onOpenTeamManager?: (eventId: string, teamId?: string) => void;
    initialTab?: 'jogos' | 'times' | 'classificacao';
}

export const EventoDetalheView: React.FC<EventoDetalheViewProps> = ({ eventId, onBack, userProfile, onOpenGamePanel, onOpenReview, onSelectPlayer, initialTeamId, onOpenTeamManager, initialTab = 'jogos' }) => {
    const [event, setEvent] = useState<Evento | null>(null);
    // ...
    
    // Effect to handle initialTeamId
    useEffect(() => {
        if (initialTeamId && event) {
            const team = (event.timesParticipantes || []).find(t => t.id === initialTeamId) || (event.times || []).find(t => t.id === initialTeamId);
            if (team) {
                if (team.isANCB && onOpenTeamManager) {
                    onOpenTeamManager(eventId, team.id);
                } else {
                    setViewingTeam(team);
                }
            }
        }
    }, [initialTeamId, event]);
    
    // ...
    const [games, setGames] = useState<Jogo[]>([]);
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [roster, setRoster] = useState<RosterEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddPlayer, setShowAddPlayer] = useState(false);
    const [playerSearch, setPlayerSearch] = useState('');
    
    // Image Cropper State
    const [showCropper, setShowCropper] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [cropAspect, setCropAspect] = useState(1); // 1:1 for logos

    // External Tournament State
    const [activeTab, setActiveTab] = useState<'jogos' | 'times' | 'classificacao'>(initialTab);
    const [showSimpleScorePanel, setShowSimpleScorePanel] = useState(false);
    const [selectedGameForSimpleScore, setSelectedGameForSimpleScore] = useState<Jogo | null>(null);
    
    // New Team Form
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamIsANCB, setNewTeamIsANCB] = useState(false);
    
    // Podium State
    const [showPodiumModal, setShowPodiumModal] = useState(false);
    const [podiumSelection, setPodiumSelection] = useState({ primeiro: '', segundo: '', terceiro: '' });
    
    // Internal Tournament State
    const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
    
    // Team Management State
    const [showTeamManager, setShowTeamManager] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Partial<Time> | null>(null);
    const [viewingTeam, setViewingTeam] = useState<Time | null>(null);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [teamRosterSearch, setTeamRosterSearch] = useState('');

    // Score Edit Modal State
    const [editScoreGame, setEditScoreGame] = useState<Jogo | null>(null);
    const [editScoreA, setEditScoreA] = useState<string>('');
    const [editScoreB, setEditScoreB] = useState<string>('');

    // Number Edit Modal State
    const [editNumberData, setEditNumberData] = useState<{player: Player, number: string} | null>(null);

    // Game Summary Modal State
    const [selectedGameForSummary, setSelectedGameForSummary] = useState<Jogo | null>(null);

    // Event Edit Modal State
    const [showEditEvent, setShowEditEvent] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDate, setEditDate] = useState('');
    const [editStatus, setEditStatus] = useState<Evento['status']>('proximo');
    const [editType, setEditType] = useState<Evento['type']>('amistoso');

    // Chave Configurator Modal State
    const [showChaaveConfigurator, setShowChaaveConfigurator] = useState(false);

    // Add Game Modal State
    const [showAddGame, setShowAddGame] = useState(false);
    const [newGameDate, setNewGameDate] = useState('');
    const [newGameHour, setNewGameHour] = useState('');
    const [newGameTimeA, setNewGameTimeA] = useState(''); // ID for internal, Name for External
    const [newGameTimeB, setNewGameTimeB] = useState('');
    const [newGameLocation, setNewGameLocation] = useState('');
    const [newGamePhase, setNewGamePhase] = useState<'fase_grupos' | 'oitavas' | 'quartas' | 'semi' | 'final'>('fase_grupos');

    // Edit Game Phase Modal State
    const [editPhaseGame, setEditPhaseGame] = useState<Jogo | null>(null);
    const [editPhaseValue, setEditPhaseValue] = useState<'fase_grupos' | 'oitavas' | 'quartas' | 'semi' | 'final'>('fase_grupos');

    // Share Modal
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareData, setShareData] = useState<any>(null);

    // Kebab Menu State
    const [activeMenuGameId, setActiveMenuGameId] = useState<string | null>(null);
    const [showHeaderAdminMenu, setShowHeaderAdminMenu] = useState(false);
    const [headerAdminMenuPos, setHeaderAdminMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

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
            setGames(gamesData);
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

        // Click outside to close menu
        const handleClickOutside = () => {
            setActiveMenuGameId(null);
            setShowHeaderAdminMenu(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => {
            unsubEvent(); unsubGames(); unsubRoster();
            document.removeEventListener('click', handleClickOutside);
        };
    }, [eventId]);

    // Helpers
    const handleAddPlayerToRoster = async (playerId: string) => { try { await setDoc(doc(db, "eventos", eventId, "roster", playerId), { playerId, status: 'pendente', updatedAt: serverTimestamp() }); if (event) { const currentLegacyRoster = event.jogadoresEscalados || []; if (!currentLegacyRoster.some(e => (typeof e === 'string' ? e === playerId : e.id === playerId))) { await updateDoc(doc(db, "eventos", eventId), { jogadoresEscalados: [...currentLegacyRoster, playerId] }); } } } catch (e) { console.error(e); } };
    const handleUpdateStatus = async (playerId: string, status: 'confirmado' | 'pendente' | 'recusado') => { if (!isAdmin) return; try { await updateDoc(doc(db, "eventos", eventId, "roster", playerId), { status, updatedAt: serverTimestamp() }); } catch (e) { console.error(e); } };
    const handleStartEvent = async () => { if (!isAdmin) return; if (!window.confirm("Iniciar este evento agora? Isso o destacará na página inicial.")) return; try { await updateDoc(doc(db, "eventos", eventId), { status: 'andamento' }); } catch (e) { alert("Erro ao iniciar evento"); } };
    const handleStartGame = async (game: Jogo) => { if (!isAdmin) return; try { await updateDoc(doc(db, "eventos", eventId, "jogos", game.id), { status: 'andamento' }); if (event?.status !== 'andamento') { await updateDoc(doc(db, "eventos", eventId), { status: 'andamento' }); } onOpenGamePanel({ ...game, status: 'andamento' }, eventId); } catch (e) { alert("Erro ao iniciar jogo"); } };
    const handleOpenScoreEdit = (game: Jogo) => { setEditScoreGame(game); setEditScoreA(String(resolveScore(game.placarTimeA_final, game.placarANCB_final))); setEditScoreB(String(resolveScore(game.placarTimeB_final, game.placarAdversario_final))); };
    const handleSaveScore = async () => { if (!editScoreGame) return; try { const sA = parseInt(editScoreA) || 0; const sB = parseInt(editScoreB) || 0; await updateDoc(doc(db, "eventos", eventId, "jogos", editScoreGame.id), { placarTimeA_final: sA, placarTimeB_final: sB, placarANCB_final: sA, placarAdversario_final: sB, status: 'finalizado' }); setEditScoreGame(null); } catch (e) { console.error(e); alert("Erro ao atualizar placar."); } };
    const handleSavePhase = async () => { if (!editPhaseGame) return; try { await updateDoc(doc(db, "eventos", eventId, "jogos", editPhaseGame.id), { fase: editPhaseValue }); setEditPhaseGame(null); } catch (e) { console.error(e); alert("Erro ao atualizar fase."); } };
    const resolveScore = (valNew?: number, valLegacy?: number) => { if (valNew && valNew > 0) return valNew; if (valLegacy && valLegacy > 0) return valLegacy; return valNew ?? valLegacy ?? 0; };
    
    // Corrected normalizePosition function
    const normalizePosition = (pos: string | undefined): string => { 
        if (!pos) return '-'; 
        const p = pos.toLowerCase(); 
        if (p.includes('1') || (p.includes('armador') && !p.includes('ala'))) return 'Armador (1)'; 
        if (p.includes('2') || (p.includes('ala/armador') || p.includes('ala-armador') || p.includes('sg'))) return 'Ala/Armador (2)'; 
        if (p.includes('3') || (p.includes('ala') && !p.includes('armador') && !p.includes('piv') && !p.includes('pivo')) || p.includes('sf')) return 'Ala (3)'; 
        if (p.includes('4') || (p.includes('ala/piv') || p.includes('ala-piv') || p.includes('pf'))) return 'Ala/Pivô (4)'; 
        if (p.includes('5') || (p.includes('piv') && !p.includes('ala')) || p.includes('c)') || p.trim().endsWith('(c)')) return 'Pivô (5)'; 
        return pos; 
    };
    
    const fileToBase64 = (file: File): Promise<string> => { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => resolve(reader.result as string); reader.onerror = error => reject(error); }); };

    // --- JERSEY NUMBER LOGIC ---
    const getEventJerseyNumber = (playerId: string) => {
        if (!event?.jogadoresEscalados) {
            // Fallback to profile
            const p = allPlayers.find(ap => ap.id === playerId);
            return p?.numero_uniforme;
        }
        
        const entry = event.jogadoresEscalados.find((e: string | EscaladoInfo) => 
            (typeof e === 'string' ? e === playerId : e.id === playerId)
        );

        if (entry && typeof entry !== 'string' && entry.numero !== undefined) {
            return entry.numero;
        }
        
        // Fallback to profile
        const p = allPlayers.find(ap => ap.id === playerId);
        return p?.numero_uniforme;
    };

    const handleSaveNumber = async () => {
        if (!event || !editNumberData) return;
        try {
            const currentList = event.jogadoresEscalados || [];
            let found = false;
            
            const newList = currentList.map((entry: string | EscaladoInfo) => {
                const id = typeof entry === 'string' ? entry : entry.id;
                if (id === editNumberData.player.id) {
                    found = true;
                    return { id, numero: Number(editNumberData.number) };
                }
                return entry; 
            });

            if (!found) {
                // If player is in roster subcollection but somehow not in this array, add them
                newList.push({ id: editNumberData.player.id, numero: Number(editNumberData.number) });
            }

            await updateDoc(doc(db, "eventos", eventId), { jogadoresEscalados: newList });
            setEditNumberData(null);
        } catch (e) {
            console.error(e);
            alert("Erro ao atualizar número.");
        }
    };

    // --- External Tournament Logic ---
    const handleSaveExternalTeam = async () => {
        if (!event || !editingTeam?.nomeTime) return;
        
        try {
            const currentTeams = event.timesParticipantes || [];
            let updatedTeams;
            let newPlayers: string[] = [];

            if (editingTeam.id) {
                // Edit existing
                const oldTeam = currentTeams.find(t => t.id === editingTeam.id);
                updatedTeams = currentTeams.map(t => t.id === editingTeam.id ? editingTeam as Time : t);
                
                // Calculate new players for notification
                if (editingTeam.isANCB && editingTeam.jogadores && oldTeam) {
                    const oldPlayers = oldTeam.jogadores || [];
                    newPlayers = editingTeam.jogadores.filter(pid => !oldPlayers.includes(pid));
                }
            } else {
                // Add new
                const newTeam: Time = {
                    id: Math.random().toString(36).substr(2, 9),
                    nomeTime: editingTeam.nomeTime,
                    isANCB: editingTeam.isANCB,
                    logoUrl: editingTeam.logoUrl || '',
                    jogadores: editingTeam.jogadores || []
                };
                updatedTeams = [...currentTeams, newTeam];
                
                if (newTeam.isANCB) {
                    newPlayers = newTeam.jogadores;
                }
            }
            
            await updateDoc(doc(db, "eventos", eventId), {
                timesParticipantes: updatedTeams
            });
            
            // Send Notifications
            if (newPlayers.length > 0) {
                // Using addDoc directly since writeBatch is not imported
                const notificationsPromises = newPlayers.map(playerId => {
                    const player = allPlayers.find(p => p.id === playerId);
                    if (player && player.userId) {
                        return addDoc(collection(db, "notifications"), {
                            targetUserId: player.userId,
                            title: "Convocação!",
                            message: `Você foi escalado para o time ${editingTeam.nomeTime} no evento ${event.nome}.`,
                            read: false,
                            timestamp: serverTimestamp(),
                            type: 'convocacao',
                            link: `/eventos/${eventId}`
                        });
                    }
                    return Promise.resolve();
                });
                
                await Promise.all(notificationsPromises);
            }
            
            setEditingTeam(null);
            alert("Time salvo com sucesso!");
        } catch (e) {
            console.error(e);
            alert("Erro ao salvar time.");
        }
    };

    const handleDeleteExternalTeam = async (teamId: string) => {
        if (!event || !window.confirm("Excluir este time?")) return;
        try {
            const currentTeams = event.timesParticipantes || [];
            const updatedTeams = currentTeams.filter(t => t.id !== teamId);
            await updateDoc(doc(db, "eventos", eventId), {
                timesParticipantes: updatedTeams
            });
        } catch (e) {
            alert("Erro ao excluir time.");
        }
    };

    const handleSavePodium = async () => {
        if (!event || !podiumSelection.primeiro || !podiumSelection.segundo || !podiumSelection.terceiro) {
            alert("Selecione os 3 primeiros colocados.");
            return;
        }
        
        try {
            await updateDoc(doc(db, "eventos", eventId), {
                podio: podiumSelection,
                status: 'finalizado'
            });
            setShowPodiumModal(false);
            alert("Torneio encerrado com sucesso!");
        } catch (e) {
            alert("Erro ao salvar pódio.");
        }
    };

    const handleOpenGame = (game: Jogo) => {
        // Check if it's an ANCB game
        const teamA = (event?.timesParticipantes || []).find(t => t.id === game.timeA_id);
        const teamB = (event?.timesParticipantes || []).find(t => t.id === game.timeB_id);
        
        const isANCBGame = teamA?.isANCB || teamB?.isANCB || game.timeA_nome?.toUpperCase().includes('ANCB') || game.timeB_nome?.toUpperCase().includes('ANCB');
        
        // If not admin, always open public panel (via onOpenGamePanel which handles logic in App.tsx)
        if (!isAdmin) {
            onOpenGamePanel(game, eventId);
            return;
        }

        if (isANCBGame || event?.type === 'torneio_interno' || event?.type === 'amistoso') {
            onOpenGamePanel(game, eventId);
        } else {
            setSelectedGameForSimpleScore(game);
            setShowSimpleScorePanel(true);
        }
    };

    // --- NEW: Add Game Logic ---
    const handleAddGame = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!event) return;

        try {
            const gameData: any = {
                dataJogo: newGameDate,
                horaJogo: newGameHour,
                status: 'agendado',
                placarTimeA_final: 0,
                placarTimeB_final: 0,
                placarANCB_final: 0, 
                placarAdversario_final: 0,
                localizacao: newGameLocation || 'Quadra Municipal'
            };

            // Add phase field for bracket tournaments
            if (event.formato === 'chaveamento') {
                gameData.fase = newGamePhase;
            }

            if (event.type === 'torneio_interno') {
                const teamA = event.times?.find(t => t.id === newGameTimeA);
                const teamB = event.times?.find(t => t.id === newGameTimeB);
                if (!teamA || !teamB) { alert("Selecione os times."); return; }
                
                gameData.timeA_id = teamA.id;
                gameData.timeA_nome = teamA.nomeTime;
                gameData.timeB_id = teamB.id;
                gameData.timeB_nome = teamB.nomeTime;
            } else if (event.type === 'torneio_externo') {
                const teamA = event.timesParticipantes?.find(t => t.id === newGameTimeA);
                const teamB = event.timesParticipantes?.find(t => t.id === newGameTimeB);
                
                if (!teamA || !teamB) { alert("Selecione os times."); return; }
                
                gameData.timeA_id = teamA.id;
                gameData.timeA_nome = teamA.nomeTime;
                gameData.timeB_id = teamB.id;
                gameData.timeB_nome = teamB.nomeTime;
                gameData.adversario = teamB.nomeTime; // Legacy support
            } else {
                // Friendly
                gameData.timeA_nome = 'ANCB'; // Default
                gameData.timeB_nome = newGameTimeB || 'Adversário';
                gameData.adversario = newGameTimeB || 'Adversário';
            }

            await addDoc(collection(db, "eventos", eventId, "jogos"), gameData);
            setShowAddGame(false);
            setNewGameHour('');
            setNewGameTimeA(''); setNewGameTimeB(''); setNewGameLocation('');
        } catch (e) {
            alert("Erro ao criar jogo.");
        }
    };

    const handleDeleteGame = async (gameId: string) => {
        if (!isAdmin) return;
        if (!window.confirm("ATENÇÃO: Excluir este jogo? Isso apagará também as estatísticas (cestas).")) return;
        try {
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
        setActiveMenuGameId(null);
        if (!event) return;

        if (game.status === 'finalizado') {
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
                        if (is3x3) {
                            if (points === 2) stats[data.jogadorId].longRangeShots += 1;
                        } else {
                            if (points === 3) stats[data.jogadorId].longRangeShots += 1;
                        }
                    }
                });

                let mvpId = '';
                let maxPoints = -1;
                Object.entries(stats).forEach(([id, s]) => {
                    if (s.points > maxPoints) { maxPoints = s.points; mvpId = id; }
                });

                let sniperId = '';
                let maxLongRange = -1;
                Object.entries(stats).forEach(([id, s]) => {
                    if (s.longRangeShots > maxLongRange) { maxLongRange = s.longRangeShots; sniperId = id; }
                });

                const scorersList = Object.entries(stats)
                    .map(([id, s]) => {
                        const player = allPlayers.find(p => p.id === id);
                        return player ? { player, points: s.points } : null;
                    })
                    .filter(s => s !== null && s.points > 0)
                    .sort((a, b) => b!.points - a!.points);

                const mvpPlayer = allPlayers.find(p => p.id === mvpId);
                const sniperPlayer = allPlayers.find(p => p.id === sniperId);

                setShareData({
                    type: 'post_game',
                    event,
                    game,
                    teams: event.times || [], 
                    scorers: scorersList,
                    stats: {
                        mvp: mvpPlayer ? { player: mvpPlayer, points: maxPoints } : undefined,
                        sniper: sniperPlayer && maxLongRange > 0 ? { player: sniperPlayer, count: maxLongRange } : undefined
                    }
                });
                setShowShareModal(true);

            } catch (err) {
                console.error(err);
                setShareData({ type: 'post_game', event, game, teams: event.times || [] });
                setShowShareModal(true);
            }
        } else {
            setShareData({
                type: 'pre_game',
                event,
                game
            });
            setShowShareModal(true);
        }
    };

    // ... (Team management logic) ...
    const handleSaveTeam = async () => { if (!event || !editingTeam || !editingTeam.nomeTime) return; try { let updatedTimes = [...(event.times || [])]; if (editingTeam.id) { updatedTimes = updatedTimes.map(t => t.id === editingTeam.id ? { ...t, ...editingTeam } as Time : t); } else { const newTeam: Time = { id: Math.random().toString(36).substr(2, 9), nomeTime: editingTeam.nomeTime, logoUrl: editingTeam.logoUrl || '', jogadores: editingTeam.jogadores || [] }; updatedTimes.push(newTeam); } await updateDoc(doc(db, "eventos", eventId), { times: updatedTimes }); setEditingTeam(null); } catch (e) { alert("Erro ao salvar time."); } };
    const handleDeleteTeam = async (teamId: string) => { if (!event || !window.confirm("Excluir time? Isso pode afetar jogos existentes.")) return; try { const updatedTimes = (event.times || []).filter(t => t.id !== teamId); await updateDoc(doc(db, "eventos", eventId), { times: updatedTimes }); } catch (e) { alert("Erro ao excluir time."); } };
    const handleTeamLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageToCrop(reader.result as string);
                setShowCropper(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = async (croppedImageBlob: Blob) => {
        setIsUploadingLogo(true);
        try {
            // Aggressive compression
            const file = new File([croppedImageBlob], "team_logo.jpg", { type: "image/jpeg" });
            const options = {
                maxSizeMB: 0.1, 
                maxWidthOrHeight: 256,
                useWebWorker: true,
                fileType: 'image/jpeg'
            };
            
            const compressedFile = await imageCompression(file, options);
            const base64 = await fileToBase64(compressedFile);
            
            setEditingTeam(prev => ({ ...prev, logoUrl: base64 }));
        } catch (error) {
            console.error(error);
            alert("Erro ao processar imagem.");
        } finally {
            setIsUploadingLogo(false);
            setShowCropper(false);
            setImageToCrop(null);
        }
    };

    const togglePlayerInTeam = (playerId: string) => { if (!editingTeam) return; const currentPlayers = editingTeam.jogadores || []; if (currentPlayers.includes(playerId)) { setEditingTeam({ ...editingTeam, jogadores: currentPlayers.filter(id => id !== playerId) }); } else { setEditingTeam({ ...editingTeam, jogadores: [...currentPlayers, playerId] }); } };

    const renderInternalTournamentRoster = () => {
        if (!event?.times || event.times.length === 0) {
            return (
                <div className="text-gray-500 text-sm italic text-center py-4">
                    Nenhum time cadastrado.
                    {isAdmin && <Button size="sm" className="mt-2 mx-auto" onClick={() => onOpenTeamManager && onOpenTeamManager(eventId)}>Criar Times</Button>}
                </div>
            );
        }
        return (
            <div className="space-y-3">
                {event.times.map((team) => (
                    <div key={team.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all">
                        <div className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => setExpandedTeamId(expandedTeamId === team.id ? null : team.id)} >
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
                            <div className="flex items-center gap-2">
                                {isAdmin && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onOpenTeamManager && onOpenTeamManager(eventId, team.id); }}
                                        className="p-1.5 text-gray-400 hover:text-ancb-blue bg-gray-50 dark:bg-gray-700 rounded"
                                    >
                                        <LucideEdit2 size={14}/>
                                    </button>
                                )}
                                {expandedTeamId === team.id ? <LucideChevronUp size={16} className="text-gray-400"/> : <LucideChevronDown size={16} className="text-gray-400"/>}
                            </div>
                        </div>
                        {expandedTeamId === team.id && (
                            <div className="bg-gray-50 dark:bg-black/20 border-t border-gray-100 dark:border-gray-700 p-2 space-y-1 animate-slideDown">
                                {team.jogadores.map(pid => {
                                    const p = allPlayers.find(pl => pl.id === pid);
                                    return (
                                        <div key={pid} className="flex items-center gap-3 p-2 rounded hover:bg-white dark:hover:bg-gray-700/50 cursor-pointer" onClick={() => onSelectPlayer && onSelectPlayer(pid, team.id)}>
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
            return ( <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700"> <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum jogador convocado.</p> </div> ); 
        }
        
        const confirmed = effectiveRoster.filter(r => r.status === 'confirmado'); 
        const pending = effectiveRoster.filter(r => r.status === 'pendente');
        const rejected = effectiveRoster.filter(r => r.status === 'recusado'); // Only show for admin
        
        const renderPlayerItem = (entry: RosterEntry) => { 
            const p = allPlayers.find(pl => pl.id === entry.playerId); 
            if (!p) return null; 
            const jerseyNum = getEventJerseyNumber(p.id);

            return ( 
                <div key={entry.playerId} className="flex flex-row items-center justify-between p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50 shadow-sm"> 
                    {/* Left: Avatar */}
                    <div className="w-12 h-12 flex-shrink-0 cursor-pointer" onClick={() => onSelectPlayer && onSelectPlayer(p.id)}>
                        <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center border border-gray-100 dark:border-gray-600">
                            {p.foto ? <img src={p.foto} className="w-full h-full object-cover"/> : <span className="text-sm font-bold text-gray-400">{p.nome.charAt(0)}</span>}
                        </div>
                    </div>

                    {/* Middle: Info */}
                    <div className="flex-grow px-3 min-w-0 cursor-pointer" onClick={() => onSelectPlayer && onSelectPlayer(p.id)}>
                        <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate leading-tight">{p.apelido || p.nome}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{normalizePosition(p.posicao).split(' ')[0]}</span>
                            <span 
                                className="text-[10px] font-bold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-0.5"
                                onClick={(e) => { e.stopPropagation(); if(isAdmin) setEditNumberData({player: p, number: String(jerseyNum || '')}); }}
                            >
                               #{jerseyNum || '?'} {isAdmin && <LucideEdit2 size={8} className="text-ancb-blue" />}
                            </span>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    {isAdmin ? ( 
                        <div className="flex items-center gap-2 flex-shrink-0"> 
                            <button 
                                onClick={() => handleUpdateStatus(p.id, 'confirmado')} 
                                className={`p-2 rounded-md transition-all ${entry.status === 'confirmado' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600'}`} 
                                title="Confirmar"
                            >
                                <LucideCheckSquare size={18}/>
                            </button> 
                            <button 
                                onClick={() => handleUpdateStatus(p.id, 'pendente')} 
                                className={`p-2 rounded-md transition-all ${entry.status === 'pendente' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600'}`} 
                                title="Pendente"
                            >
                                <LucideSquare size={18}/>
                            </button> 
                            <button 
                                onClick={() => handleUpdateStatus(p.id, 'recusado')} 
                                className={`p-2 rounded-md transition-all ${entry.status === 'recusado' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600'}`} 
                                title="Recusar"
                            >
                                <LucideXCircle size={18}/>
                            </button> 
                        </div> 
                    ) : ( 
                        <div className="pr-2 flex-shrink-0"> 
                            {entry.status === 'confirmado' && <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-1.5 rounded-full"><LucideCheckCircle2 size={20}/></div>} 
                            {entry.status === 'recusado' && <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-1.5 rounded-full"><LucideXCircle size={20}/></div>} 
                            {entry.status === 'pendente' && <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-1.5 rounded-full"><LucideClock size={20}/></div>} 
                        </div> 
                    )} 
                </div> 
            ); 
        };
        
        return ( 
            <div className="space-y-6"> 
                {confirmed.length > 0 && ( 
                    <div> 
                        <h4 className="text-xs font-bold text-green-600 dark:text-green-400 uppercase mb-3 flex items-center gap-1.5 tracking-wider"><LucideCheckCircle2 size={14}/> Confirmados ({confirmed.length})</h4> 
                        <div className="flex flex-col gap-3">{confirmed.map(renderPlayerItem)}</div> 
                    </div> 
                )} 
                {pending.length > 0 && ( 
                    <div> 
                        <h4 className="text-xs font-bold text-orange-500 uppercase mb-3 flex items-center gap-1.5 tracking-wider"><LucideClock size={14}/> Pendentes ({pending.length})</h4> 
                        <div className="flex flex-col gap-3">{pending.map(renderPlayerItem)}</div> 
                    </div> 
                )}
                {/* Admin Only: Show rejected/removed players to allow restore */}
                {isAdmin && rejected.length > 0 && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700"> 
                        <h4 className="text-xs font-bold text-red-500 uppercase mb-3 flex items-center gap-1.5 tracking-wider opacity-80"><LucideXCircle size={14}/> Recusados / Indisponíveis ({rejected.length})</h4> 
                        <div className="flex flex-col gap-3">{rejected.map(renderPlayerItem)}</div> 
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

        const scoreA = resolveScore(game.placarTimeA_final, game.placarANCB_final);
        const scoreB = resolveScore(game.placarTimeB_final, game.placarAdversario_final);

        const hasANCBInName = (name?: string) => (name || '').toUpperCase().includes('ANCB');

        const isTeamANCB = (teamId: string | undefined, teamName: string | undefined, side: 'A' | 'B') => {
            if (event.type === 'torneio_interno') return true;

            if (event.type === 'amistoso') {
                if (side === 'A') return true;
                return hasANCBInName(teamName);
            }

            const externalTeam = (event.timesParticipantes || []).find(t => t.id === teamId);
            if (externalTeam) return !!externalTeam.isANCB;

            return hasANCBInName(teamName);
        };

        const teamAIsANCB = isTeamANCB(game.timeA_id, game.timeA_nome, 'A');
        const teamBIsANCB = isTeamANCB(game.timeB_id, game.timeB_nome || game.adversario, 'B');

        if (teamAIsANCB && teamBIsANCB) return `${base} border-green-500 dark:border-green-500`;
        if (!teamAIsANCB && !teamBIsANCB) return `${base} border-gray-400 dark:border-gray-600`;

        if (teamAIsANCB) {
            if (scoreA > scoreB) return `${base} border-green-500 dark:border-green-500`;
            if (scoreA < scoreB) return `${base} border-red-500 dark:border-red-500`;
            return `${base} border-gray-400 dark:border-gray-600`;
        }

        if (teamBIsANCB) {
            if (scoreB > scoreA) return `${base} border-green-500 dark:border-green-500`;
            if (scoreB < scoreA) return `${base} border-red-500 dark:border-red-500`;
            return `${base} border-gray-400 dark:border-gray-600`;
        }

        return `${base} border-gray-400 dark:border-gray-600`;
    };

    const getEffectiveRoster = () => {
        const effective = [...roster];
        // Merge legacy array but prefer existing subcollection status
        if (event?.jogadoresEscalados) {
            event.jogadoresEscalados.forEach(pid => {
                const id = typeof pid === 'string' ? pid : pid.id;
                // Only add if not already in the subcollection map
                if (!effective.find(e => e.playerId === id)) {
                    // Default to 'pendente' instead of 'confirmado' for safety
                    effective.push({ playerId: id, status: 'pendente', updatedAt: null });
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

    const normalizeGameDate = (dateValue?: string) => {
        if (!dateValue) return '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;

        const brDate = dateValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (brDate) {
            return `${brDate[3]}-${brDate[2]}-${brDate[1]}`;
        }

        return dateValue;
    };

    const getGameSortKey = (game: Jogo) => {
        const normalizedDate = normalizeGameDate(game.dataJogo);
        const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(normalizedDate) ? normalizedDate : '9999-12-31';
        const safeTime = /^\d{2}:\d{2}$/.test(game.horaJogo || '') ? (game.horaJogo as string) : '99:99';
        return `${safeDate}T${safeTime}`;
    };

    const sortedGames = [...games].sort((a, b) => getGameSortKey(a).localeCompare(getGameSortKey(b)));

    const groupedGames = sortedGames.reduce((acc, game) => {
        const dateKey = normalizeGameDate(game.dataJogo) || 'Sem data';
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(game);
        return acc;
    }, {} as Record<string, Jogo[]>);

    const formatGroupDateLabel = (dateKey: string) => {
        if (dateKey === 'Sem data') return dateKey;
        const dateParts = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!dateParts) return dateKey;
        return `${dateParts[3]}/${dateParts[2]}/${dateParts[1]}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
            {/* HERO HEADER */}
            <div className={`relative z-30 w-full ${getGradient()} text-white p-4 pt-4 md:p-12 shadow-xl overflow-hidden`}>
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-10 -translate-y-10">
                    <LucideTrophy size={300} />
                </div>
                
                <div className="relative z-10 max-w-4xl mx-auto">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <Button variant="secondary" size="sm" onClick={onBack} className="!bg-white/10 !border-white/20 !text-white hover:!bg-white/20">
                            <LucideArrowLeft size={18} /> Voltar
                        </Button>
                        <div className="flex items-center gap-2 flex-wrap justify-end relative z-[130]">
                            <span className="inline-block px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm text-xs font-bold uppercase tracking-wider border border-white/10 whitespace-nowrap">
                                {event.type.replace('_', ' ')}
                            </span>
                            {isAdmin && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                                        setHeaderAdminMenuPos({ top: rect.bottom + 8, left: Math.max(12, rect.right - 224) });
                                        setShowHeaderAdminMenu(prev => !prev);
                                    }}
                                    className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors backdrop-blur-sm"
                                    title="Opções de Admin"
                                >
                                    <LucideMoreVertical size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black mb-3 leading-tight">{event.nome}</h1>
                    <div className="flex flex-wrap gap-6 text-sm md:text-base font-medium opacity-90">
                        <div className="flex items-center gap-2"><LucideCalendar className="opacity-70" /> {event.data.split('-').reverse().join('/')}</div>
                        <div className="flex items-center gap-2"><LucideMapPin className="opacity-70" /> {event.modalidade}</div>
                    </div>
                </div>
            </div>

            {isAdmin && showHeaderAdminMenu && (
                <div
                    className="fixed w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-white/20 dark:border-gray-700 z-[300] overflow-hidden"
                    style={{ top: headerAdminMenuPos.top, left: headerAdminMenuPos.left }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {event.status !== 'andamento' && event.status !== 'finalizado' && (
                        <button
                            onClick={() => {
                                handleStartEvent();
                                setShowHeaderAdminMenu(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-green-50 dark:hover:bg-green-900/20 text-sm flex items-center gap-2 text-green-700 dark:text-green-400"
                        >
                            <LucidePlayCircle size={16} /> Iniciar Evento
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setShowEditEvent(true);
                            setShowHeaderAdminMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300"
                    >
                        <LucideEdit size={16} /> Editar Evento
                    </button>
                    {event.type === 'torneio_externo' && (
                        <button
                            onClick={() => {
                                setShowChaaveConfigurator(true);
                                setShowHeaderAdminMenu(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-sm flex items-center gap-2 text-yellow-700 dark:text-yellow-400"
                        >
                            <LucideNetwork size={16} /> Configurar Chaves
                        </button>
                    )}
                    <button
                        onClick={() => {
                            handleDeleteEvent();
                            setShowHeaderAdminMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm flex items-center gap-2 text-red-600"
                    >
                        <LucideTrash2 size={16} /> Excluir Evento
                    </button>
                </div>
            )}

            <div className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
                
                {/* TABS FOR EXTERNAL TOURNAMENT */}
                {event.type === 'torneio_externo' && (
                    <div className="flex items-center gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                        <button 
                            onClick={() => setActiveTab('jogos')}
                            className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === 'jogos' ? 'text-ancb-blue border-b-2 border-ancb-blue' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        >
                            <LucideGamepad2 className="inline-block mr-1 mb-0.5" size={16}/> Jogos
                        </button>
                        <button 
                            onClick={() => setActiveTab('times')}
                            className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === 'times' ? 'text-ancb-blue border-b-2 border-ancb-blue' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        >
                            <LucideUsers className="inline-block mr-1 mb-0.5" size={16}/> Times
                        </button>
                        <button 
                            onClick={() => setActiveTab('classificacao')}
                            className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === 'classificacao' ? 'text-ancb-blue border-b-2 border-ancb-blue' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        >
                            {event.formato === 'chaveamento' ? <LucideNetwork className="inline-block mr-1 mb-0.5" size={16}/> : <LucideList className="inline-block mr-1 mb-0.5" size={16}/>} Classificação
                        </button>
                    </div>
                )}

                <div className={`grid gap-8 ${event.type === 'torneio_externo' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
                    
                    {/* LEFT COLUMN: GAMES / MAIN CONTENT */}
                    {(activeTab === 'jogos' || event.type !== 'torneio_externo') && (
                        <div className={`${event.type === 'torneio_externo' ? 'w-full' : 'lg:col-span-2'} space-y-6`}>
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
                                <div className="space-y-5">
                                    {Object.entries(groupedGames).map(([dateKey, dateGames]) => (
                                        <div key={dateKey} className="space-y-3">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                <LucideCalendar size={12} /> {formatGroupDateLabel(dateKey)}
                                            </div>

                                            <div className="space-y-4">
                                                {dateGames.map(game => {
                                                    const sA = resolveScore(game.placarTimeA_final, game.placarANCB_final);
                                                    const sB = resolveScore(game.placarTimeB_final, game.placarAdversario_final);
                                                    const isGameLive = game.status === 'andamento';
                                                    return (
                                                        <div 
                                                            key={game.id} 
                                                            onClick={() => event.type === 'torneio_externo' ? handleOpenGame(game) : setSelectedGameForSummary(game)}
                                                            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors relative ${getGameResultClass(game)}`}
                                                        >
                                                            <div className="flex-1 relative">
                                                                {game.horaJogo && (
                                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-gray-500 dark:text-gray-400 leading-none">
                                                                        {game.horaJogo}
                                                                    </div>
                                                                )}
                                                                <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                                                                    <span className="font-bold text-xs md:text-sm text-right leading-tight text-gray-900 dark:text-gray-100 break-words whitespace-normal line-clamp-2">
                                                                        {game.timeA_nome || 'ANCB'}
                                                                    </span>
                                                                    
                                                                    <div className="flex items-center justify-center">
                                                                        <div className={`px-2 py-1 rounded font-mono font-bold text-base md:text-lg whitespace-nowrap text-center min-w-[60px] ${isGameLive ? 'bg-red-100 text-red-600 animate-pulse border border-red-200' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                                                            {sA} - {sB}
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <span className="font-bold text-xs md:text-sm text-left leading-tight text-gray-900 dark:text-gray-100 break-words whitespace-normal line-clamp-2">
                                                                        {game.timeB_nome || game.adversario || 'ADV'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="ml-2 pl-2 border-l border-gray-200 dark:border-gray-700 flex items-center relative">
                                                                {isAdmin ? (
                                                                    <div 
                                                                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                                                                        onClick={(e) => { e.stopPropagation(); setActiveMenuGameId(activeMenuGameId === game.id ? null : game.id); }}
                                                                    >
                                                                        <LucideMoreVertical size={18} />
                                                                        {activeMenuGameId === game.id && (
                                                                            <div className="absolute right-0 top-8 z-50 bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-100 dark:border-gray-700 py-1 w-48 animate-slideDown overflow-hidden">
                                                                                <button 
                                                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm flex items-center gap-2 text-gray-700 dark:text-gray-200"
                                                                                    onClick={(e) => { e.stopPropagation(); handleShareGame(e, game); }}
                                                                                >
                                                                                    <LucideShare2 size={16} /> Compartilhar Card
                                                                                </button>
                                                                                <button 
                                                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm flex items-center gap-2 text-ancb-blue"
                                                                                    onClick={(e) => { e.stopPropagation(); handleOpenScoreEdit(game); }}
                                                                                >
                                                                                    <LucideEdit2 size={16} /> Editar Placar
                                                                                </button>
                                                                                {event?.formato === 'chaveamento' && (
                                                                                    <button 
                                                                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm flex items-center gap-2 text-amber-600 dark:text-amber-500"
                                                                                        onClick={(e) => { e.stopPropagation(); setEditPhaseGame(game); setEditPhaseValue((game as any).fase || 'fase_grupos'); setActiveMenuGameId(null); }}
                                                                                    >
                                                                                        <LucideEdit2 size={16} /> Editar Fase
                                                                                    </button>
                                                                                )}
                                                                                <button 
                                                                                    className="w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm flex items-center gap-2 text-red-600"
                                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteGame(game.id); }}
                                                                                >
                                                                                    <LucideTrash2 size={16} /> Excluir Jogo
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <button 
                                                                        onClick={(e) => handleShareGame(e, game)}
                                                                        className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                                    >
                                                                        <LucideShare2 size={16} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TEAMS TAB CONTENT */}
                    {activeTab === 'times' && event.type === 'torneio_externo' && (
                        <div className="lg:col-span-3 space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold flex items-center gap-2"><LucideUsers className="text-ancb-blue" /> Times Participantes</h3>
                                {isAdmin && (
                                    <Button size="sm" onClick={() => onOpenTeamManager && onOpenTeamManager(eventId)} className="!py-1 !px-3 text-xs">
                                        <LucidePlus size={14} /> Adicionar Time
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {event.timesParticipantes?.slice().sort((a, b) => {
                                    if (a.isANCB && !b.isANCB) return -1;
                                    if (!a.isANCB && b.isANCB) return 1;
                                    return a.nomeTime.localeCompare(b.nomeTime); // Organiza o restante em ordem alfabética
                                }).map(team => (
                                    <div 
                                        key={team.id} 
                                        onClick={() => {
                                            if (isAdmin || team.isANCB) {
                                                onOpenTeamManager && onOpenTeamManager(eventId, team.id);
                                            } else {
                                                setViewingTeam(team);
                                            }
                                        }}
                                        className={`${team.isANCB ? 'bg-ancb-blue border-blue-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'} p-4 rounded-xl shadow-sm border flex justify-between items-center group ${(isAdmin || team.isANCB) ? 'cursor-pointer hover:shadow-md transition-all' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden border-2 ${team.isANCB ? 'bg-blue-800 border-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 border-gray-100 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>
                                                {team.logoUrl ? (
                                                    <img src={team.logoUrl} alt={team.nomeTime} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{team.nomeTime.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className={`font-bold ${team.isANCB ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{team.nomeTime}</h4>
                                                {team.isANCB && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[10px] text-blue-200">({team.jogadores?.length || 0} atletas)</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {isAdmin && (
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e) => { e.stopPropagation(); onOpenTeamManager && onOpenTeamManager(eventId, team.id); }} className={`p-2 rounded-full transition-colors ${team.isANCB ? 'text-blue-200 hover:text-white hover:bg-blue-800' : 'text-gray-400 hover:text-ancb-blue bg-gray-50 dark:bg-gray-700'}`}>
                                                    <LucideEdit2 size={16} />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteExternalTeam(team.id); }} className={`p-2 rounded-full transition-colors ${team.isANCB ? 'text-blue-200 hover:text-red-400 hover:bg-blue-800' : 'text-gray-400 hover:text-red-500 bg-gray-50 dark:bg-gray-700'}`}>
                                                    <LucideTrash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {(!event.timesParticipantes || event.timesParticipantes.length === 0) && (
                                    <p className="col-span-full text-center text-gray-500 py-8">Nenhum time cadastrado.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STANDINGS TAB CONTENT */}
                    {activeTab === 'classificacao' && event.type === 'torneio_externo' && (
                        <div className="lg:col-span-3 space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    {event.formato === 'chaveamento' ? <LucideNetwork className="text-ancb-blue" /> : <LucideList className="text-ancb-blue" />}
                                    Classificação & Pódio
                                </h3>
                                {isAdmin && event.status !== 'finalizado' && (
                                    <Button size="sm" onClick={() => setShowPodiumModal(true)} className="bg-yellow-500 hover:bg-yellow-600 text-white border-none">
                                        <LucideMedal size={16} className="mr-1" /> Definir Pódio
                                    </Button>
                                )}
                            </div>

                            {event.podio && (
                                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-6 rounded-2xl border border-yellow-500/20 mb-6 text-center">
                                    <h4 className="text-lg font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-widest mb-6">Pódio Final</h4>
                                    <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8">
                                        {/* 2nd Place */}
                                        <div className="order-2 md:order-1 flex flex-col items-center">
                                            <div className="w-16 h-16 rounded-full bg-gray-300 border-4 border-white shadow-lg flex items-center justify-center text-2xl font-black text-gray-600 mb-2">2</div>
                                            <span className="font-bold text-gray-800 dark:text-white">{event.timesParticipantes?.find(t => t.id === event.podio?.segundo)?.nomeTime || 'Time'}</span>
                                        </div>
                                        {/* 1st Place */}
                                        <div className="order-1 md:order-2 flex flex-col items-center mb-4 md:mb-0">
                                            <LucideTrophy size={32} className="text-yellow-500 mb-2 animate-bounce" />
                                            <div className="w-24 h-24 rounded-full bg-yellow-400 border-4 border-white shadow-xl flex items-center justify-center text-4xl font-black text-yellow-800 mb-2">1</div>
                                            <span className="font-black text-xl text-gray-900 dark:text-white">{event.timesParticipantes?.find(t => t.id === event.podio?.primeiro)?.nomeTime || 'Campeão'}</span>
                                        </div>
                                        {/* 3rd Place */}
                                        <div className="order-3 flex flex-col items-center">
                                            <div className="w-16 h-16 rounded-full bg-orange-300 border-4 border-white shadow-lg flex items-center justify-center text-2xl font-black text-orange-800 mb-2">3</div>
                                            <span className="font-bold text-gray-800 dark:text-white">{event.timesParticipantes?.find(t => t.id === event.podio?.terceiro)?.nomeTime || 'Time'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Bracket or Table */}
                            {event.formato === 'chaveamento' ? (
                                <>
                                    {(() => {
                                        // Detect which phase the championship is in
                                        // Show a phase as soon as games are created for it, even if not finished
                                        const semiGames = games.filter(g => (g as any).fase === 'semi');
                                        const finalGames = games.filter(g => (g as any).fase === 'final');
                                        
                                        console.log('DEBUG: All games:', games.map(g => ({ id: g.id, fase: (g as any).fase, timeA: g.timeA_nome, timeB: g.timeB_nome })));
                                        console.log('DEBUG: Semi games found:', semiGames.length);
                                        console.log('DEBUG: Final games found:', finalGames.length);
                                        
                                        let currentPhase: 'grupos' | 'semis' | 'final' = 'grupos';
                                        if (semiGames.length > 0) currentPhase = 'semis';
                                        if (finalGames.length > 0) currentPhase = 'final';

                                        return (
                                            <div className="space-y-8">
                                                {/* FINAL - MOST PROMINENT */}
                                                {finalGames.length > 0 && currentPhase === 'final' && (
                                                    <div className="bg-gradient-to-br from-yellow-400/20 to-orange-400/20 border-2 border-yellow-400 dark:border-yellow-500 rounded-2xl p-8 shadow-lg">
                                                        <div className="flex items-center justify-center gap-3 mb-6">
                                                            <LucideTrophy className="text-yellow-500 animate-bounce" size={32} />
                                                            <h4 className="text-3xl font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-widest">Grande Final</h4>
                                                            <LucideTrophy className="text-yellow-500 animate-bounce" size={32} />
                                                        </div>
                                                        <div className="space-y-4">
                                                            {finalGames.map(game => (
                                                                <div key={game.id} className="bg-white dark:bg-gray-800 border-2 border-yellow-300 dark:border-yellow-600 rounded-xl p-6 shadow-md">
                                                                    <div className="flex justify-between items-center mb-3">
                                                                        <span className="text-lg font-black text-center flex-1">{game.timeA_nome}</span>
                                                                        <span className="font-mono font-black text-2xl text-yellow-600 mx-4">{game.placarTimeA_final || 0}</span>
                                                                        <span className="text-xs text-gray-400">x</span>
                                                                        <span className="font-mono font-black text-2xl text-yellow-600 mx-4">{game.placarTimeB_final || 0}</span>
                                                                        <span className="text-lg font-black text-center flex-1">{game.timeB_nome}</span>
                                                                    </div>
                                                                    {game.placarTimeA_final !== undefined && game.placarTimeB_final !== undefined && (
                                                                        <div className="text-center text-sm font-bold text-yellow-600 dark:text-yellow-400">
                                                                            {game.placarTimeA_final > game.placarTimeB_final
                                                                                ? `✓ ${game.timeA_nome} venceu!`
                                                                                : game.placarTimeB_final > game.placarTimeA_final
                                                                                ? `✓ ${game.timeB_nome} venceu!`
                                                                                : 'Empate'}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* SEMICADASTRO - SECONDARY HIGHLIGHT */}
                                                {semiGames.length > 0 && currentPhase !== 'grupos' && (
                                                    <div className="bg-gradient-to-br from-blue-400/20 to-cyan-400/20 border-2 border-blue-400 dark:border-blue-500 rounded-2xl p-8 shadow-lg">
                                                        <div className="flex items-center justify-center gap-3 mb-6">
                                                            <LucideAward className="text-blue-500" size={28} />
                                                            <h4 className="text-2xl font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Semi-Final</h4>
                                                            <LucideAward className="text-blue-500" size={28} />
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {semiGames.map(game => (
                                                                <div key={game.id} className="bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600 rounded-lg p-5 shadow-sm">
                                                                    <div className="flex justify-between items-end mb-2">
                                                                        <span className="text-sm font-bold truncate w-24">{game.timeA_nome}</span>
                                                                        <span className="font-mono font-bold text-lg text-blue-600 mx-2">{game.placarTimeA_final || 0}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-end mb-3">
                                                                        <span className="text-sm font-bold truncate w-24">{game.timeB_nome}</span>
                                                                        <span className="font-mono font-bold text-lg text-blue-600 mx-2">{game.placarTimeB_final || 0}</span>
                                                                    </div>
                                                                    {game.placarTimeA_final !== undefined && game.placarTimeB_final !== undefined && (
                                                                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 text-center">
                                                                            {game.placarTimeA_final > game.placarTimeB_final
                                                                                ? `✓ ${game.timeA_nome}`
                                                                                : game.placarTimeB_final > game.placarTimeA_final
                                                                                ? `✓ ${game.timeB_nome}`
                                                                                : 'Empate'}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* GROUP PHASE - ALWAYS SHOW */}
                                                <GroupStandings
                                                    timesParticipantes={event.timesParticipantes || []}
                                                    games={games}
                                                    format={event.formato || 'chaveamento'}
                                                    qualifiersPerGroup={2}
                                                />

                                                {/* QUARTERS - ONLY IF NO SEMIS */}
                                                {games.filter(g => (g as any).fase === 'quartas').length > 0 && semiGames.length === 0 && (
                                                    <div className="overflow-x-auto pb-4 border-t border-gray-200 dark:border-gray-700 pt-8">
                                                        <h5 className="text-center font-bold text-gray-500 uppercase text-sm mb-4">Quartas de Final</h5>
                                                        <div className="flex gap-4 min-w-max">
                                                            {games.filter(g => (g as any).fase === 'quartas').map(game => (
                                                                <div
                                                                    key={game.id}
                                                                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm flex-shrink-0 w-40"
                                                                >
                                                                    <div className="flex justify-between items-center mb-1">
                                                                        <span className="text-xs font-bold truncate">{game.timeA_nome}</span>
                                                                        <span className="font-mono font-bold">{game.placarTimeA_final || 0}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-xs font-bold truncate">{game.timeB_nome}</span>
                                                                        <span className="font-mono font-bold">{game.placarTimeB_final || 0}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </>
                    ) : (
                                /* Group Standings or Simple Table */
                                (() => {
                                    // Check if there are teams with groups defined
                                    const hasGroupsData = event.timesParticipantes?.some(t => t.grupo && t.grupo.trim());
                                    
                                    if (hasGroupsData) {
                                        return (
                                            <GroupStandings
                                                timesParticipantes={event.timesParticipantes || []}
                                                games={games}
                                                format={event.formato || 'grupo_unico'}
                                                qualifiersPerGroup={2}
                                            />
                                        );
                                    }
                                    
                                    // Fallback to simple standings table
                                    return (
                                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 font-bold uppercase text-xs">
                                                    <tr>
                                                        <th className="p-3">Pos</th>
                                                        <th className="p-3">Time</th>
                                                        <th className="p-3 text-center">J</th>
                                                        <th className="p-3 text-center">V</th>
                                                        <th className="p-3 text-center">D</th>
                                                        <th className="p-3 text-center">Saldo</th>
                                                        <th className="p-3 text-center font-black">Pts</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                    {event.timesParticipantes && event.timesParticipantes.length > 0 ? (
                                                        (() => {
                                                            // Calculate standings for all teams
                                                            const standings = event.timesParticipantes.map(team => {
                                                                const teamGames = games.filter(g => g.status === 'finalizado' && (g.timeA_id === team.id || g.timeB_id === team.id));
                                                                
                                                                let wins = 0;
                                                                let losses = 0;
                                                                let draws = 0;
                                                                let pointsFor = 0;
                                                                let pointsAgainst = 0;

                                                                teamGames.forEach(g => {
                                                                    const sA = g.placarTimeA_final || 0;
                                                                    const sB = g.placarTimeB_final || 0;

                                                                    if (g.timeA_id === team.id) {
                                                                        pointsFor += sA;
                                                                        pointsAgainst += sB;
                                                                        if (sA > sB) wins++;
                                                                        else if (sA < sB) losses++;
                                                                        else draws++;
                                                                    } else {
                                                                        pointsFor += sB;
                                                                        pointsAgainst += sA;
                                                                        if (sB > sA) wins++;
                                                                        else if (sB < sA) losses++;
                                                                        else draws++;
                                                                    }
                                                                });

                                                                const pointBalance = pointsFor - pointsAgainst;
                                                                // Points: Win = 2, Draw = 1, Loss = 0 (or configure as needed)
                                                                const totalPoints = wins * 2 + draws * 1;

                                                                return {
                                                                    team,
                                                                    gamesPlayed: teamGames.length,
                                                                    wins,
                                                                    losses,
                                                                    pointsFor,
                                                                    pointsAgainst,
                                                                    pointBalance,
                                                                    totalPoints
                                                                };
                                                            })
                                                            // Sort by: Total Points (desc) > Point Balance (desc)
                                                            .sort((a, b) => {
                                                                if (b.totalPoints !== a.totalPoints) {
                                                                    return b.totalPoints - a.totalPoints;
                                                                }
                                                                return b.pointBalance - a.pointBalance;
                                                            });

                                                            return standings.map((standing, idx) => (
                                                                <tr key={standing.team.id} className="hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                                                                    <td className="p-3 font-black text-center text-ancb-orange">{idx + 1}º</td>
                                                                    <td className="p-3 font-bold text-gray-800 dark:text-gray-200">{standing.team.nomeTime}</td>
                                                                    <td className="p-3 text-center">{standing.gamesPlayed}</td>
                                                                    <td className="p-3 text-center text-green-600 font-bold">{standing.wins}</td>
                                                                    <td className="p-3 text-center text-red-600 font-bold">{standing.losses}</td>
                                                                    <td className="p-3 text-center font-semibold">
                                                                        <span className={standing.pointBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                                            {standing.pointBalance >= 0 ? '+' : ''}{standing.pointBalance}
                                                                        </span>
                                                                    </td>
                                                                    <td className="p-3 text-center font-black text-ancb-blue">{standing.totalPoints}</td>
                                                                </tr>
                                                            ));
                                                        })()
                                                    ) : (
                                                        <tr><td colSpan={7} className="p-4 text-center text-gray-500">Sem dados.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    );
                                })()
                            )}
                        </div>
                    )}

                    {/* RIGHT COLUMN: ROSTER OR TEAMS (Only show if NOT in Teams/Standings tab for external) */}
                    {event.type !== 'torneio_externo' && (
                        <div className="space-y-6">
                            {/* ... (Roster header same) */}
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    {event.type === 'torneio_interno' ? <LucideShield className="text-ancb-orange" /> : <LucideUsers className="text-ancb-orange" />}
                                    {event.type === 'torneio_interno' ? 'Times' : 'Convocação'}
                                </h3>
                                {isAdmin && event.type === 'torneio_interno' && (
                                    <button onClick={() => { if (onOpenTeamManager) onOpenTeamManager(eventId); else { setShowTeamManager(true); setEditingTeam(null); } }} className="text-xs flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg shadow-sm font-bold text-gray-600 dark:text-gray-300 hover:text-ancb-blue transition-all">
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
                    )}
                </div>

                {/* Image Cropper Modal */}
                {showCropper && imageToCrop && (
                    <ImageCropperModal
                        isOpen={showCropper}
                        onClose={() => { setShowCropper(false); setImageToCrop(null); }}
                        imageSrc={imageToCrop}
                        onCropComplete={handleCropComplete}
                        aspect={cropAspect}
                    />
                )}

                {/* Simple Score Panel Modal */}
                {showSimpleScorePanel && selectedGameForSimpleScore && (
                    <SimpleScorePanel 
                        game={selectedGameForSimpleScore}
                        eventId={eventId}
                        onClose={() => setShowSimpleScorePanel(false)}
                        onSave={() => {
                            // Refresh logic if needed, snapshot handles it
                        }}
                    />
                )}

                {/* Chave Configurator Modal */}
                {event && (
                    <ChaaveConfigurator
                        isOpen={showChaaveConfigurator}
                        onClose={() => setShowChaaveConfigurator(false)}
                        event={event}
                        onSave={async (updatedEvent) => {
                            try {
                                await updateDoc(doc(db, "eventos", eventId), {
                                    formato: updatedEvent.formato,
                                    timesParticipantes: updatedEvent.timesParticipantes
                                });
                            } catch (error) {
                                console.error('Erro ao atualizar evento:', error);
                                throw error;
                            }
                        }}
                    />
                )}

                {/* Podium Modal */}
                <Modal isOpen={showPodiumModal} onClose={() => setShowPodiumModal(false)} title="Definir Pódio">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-yellow-500 uppercase mb-1">1º Lugar (Campeão)</label>
                            <select 
                                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                value={podiumSelection.primeiro}
                                onChange={e => setPodiumSelection({...podiumSelection, primeiro: e.target.value})}
                            >
                                <option value="">Selecione...</option>
                                {event.timesParticipantes?.map(t => <option key={t.id} value={t.id}>{t.nomeTime}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">2º Lugar</label>
                            <select 
                                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                value={podiumSelection.segundo}
                                onChange={e => setPodiumSelection({...podiumSelection, segundo: e.target.value})}
                            >
                                <option value="">Selecione...</option>
                                {event.timesParticipantes?.map(t => <option key={t.id} value={t.id}>{t.nomeTime}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-orange-500 uppercase mb-1">3º Lugar</label>
                            <select 
                                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                value={podiumSelection.terceiro}
                                onChange={e => setPodiumSelection({...podiumSelection, terceiro: e.target.value})}
                            >
                                <option value="">Selecione...</option>
                                {event.timesParticipantes?.map(t => <option key={t.id} value={t.id}>{t.nomeTime}</option>)}
                            </select>
                        </div>
                        <Button onClick={handleSavePodium} className="w-full mt-4">Salvar e Encerrar Torneio</Button>
                    </div>
                </Modal>

                {/* External Team Manager Modal REMOVED - Replaced by TeamManagerView */}

                {/* Viewing Team Roster Modal (Read-Only) */}
                {viewingTeam && (
                    <Modal isOpen={!!viewingTeam} onClose={() => setViewingTeam(null)} title={viewingTeam.nomeTime}>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 justify-center mb-6">
                                <div className={`w-24 h-24 rounded-full border-4 border-blue-100 dark:border-blue-900 flex items-center justify-center overflow-hidden ${viewingTeam.logoUrl ? 'bg-transparent' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                    {viewingTeam.logoUrl ? <img src={viewingTeam.logoUrl} className="w-full h-full object-contain"/> : <span className="text-2xl font-bold text-gray-400">{viewingTeam.nomeTime.charAt(0)}</span>}
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <label className="text-xs font-bold text-gray-500 uppercase mb-3 block flex justify-between items-center">
                                    <span>Elenco ({viewingTeam.jogadores?.length || 0})</span>
                                </label>
                                
                                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar border rounded-xl dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                    {viewingTeam.jogadores && viewingTeam.jogadores.length > 0 ? (
                                        allPlayers
                                            .filter(p => viewingTeam.jogadores?.includes(p.id))
                                            .map(p => (
                                                <div 
                                                    key={p.id} 
                                                    onClick={() => {
                                                        if (onSelectPlayer) {
                                                            onSelectPlayer(p.id, viewingTeam.id);
                                                            setViewingTeam(null);
                                                        }
                                                    }}
                                                    className="flex items-center gap-3 p-3 cursor-pointer border-b last:border-0 border-gray-100 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden flex items-center justify-center border border-gray-100 dark:border-gray-500">
                                                        {p.foto ? <img src={p.foto} className="w-full h-full object-cover"/> : <span className="text-xs font-bold text-gray-500">{p.nome.charAt(0)}</span>}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{p.apelido || p.nome}</p>
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">{normalizePosition(p.posicao)}</p>
                                                    </div>
                                                    <LucideChevronRight size={16} className="ml-auto text-gray-300" />
                                                </div>
                                            ))
                                    ) : (
                                        <div className="p-8 text-center text-gray-400 text-sm italic">
                                            Nenhum jogador escalado.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Modal>
                )}
            </div>


            {/* Game Summary Modal */}
            <GameSummaryModal
                isOpen={!!selectedGameForSummary}
                onClose={() => setSelectedGameForSummary(null)}
                game={selectedGameForSummary}
                eventId={eventId}
                isAdmin={isAdmin}
                onOpenAdminPanel={() => {
                    if (selectedGameForSummary) {
                        onOpenGamePanel(selectedGameForSummary, eventId);
                        setSelectedGameForSummary(null);
                    }
                }}
            />

            {/* Event Edit Modal ... (Existing) */}
            <Modal isOpen={showEditEvent} onClose={() => setShowEditEvent(false)} title="Editar Evento">
                {/* ... existing form content ... */}
                <form onSubmit={handleUpdateEvent} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1">Nome</label>
                        <input className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600" value={editName} onChange={e => setEditName(e.target.value)} required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1">Data</label>
                        <input type="date" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600" value={editDate} onChange={e => setEditDate(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label>
                            <select className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600" value={editType} onChange={e => setEditType(e.target.value as any)}>
                                <option value="amistoso">Amistoso</option>
                                <option value="torneio_interno">Torneio Interno</option>
                                <option value="torneio_externo">Torneio Externo</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                            <select className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600" value={editStatus} onChange={e => setEditStatus(e.target.value as any)}>
                                <option value="proximo">Próximo</option>
                                <option value="andamento">Em Andamento</option>
                                <option value="finalizado">Finalizado</option>
                            </select>
                        </div>
                    </div>
                    <Button type="submit" className="w-full mt-2">Salvar Alterações</Button>
                </form>
            </Modal>

            {/* Add Game Modal - REDESIGNED */}
            <Modal isOpen={showAddGame} onClose={() => setShowAddGame(false)} title="Agendar Jogo">
                <form onSubmit={handleAddGame} className="space-y-5">
                    {/* Date and Location stacked better on mobile */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data</label>
                            <input 
                                type="date" 
                                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-blue outline-none transition-all" 
                                value={newGameDate} 
                                onChange={e => setNewGameDate(e.target.value)} 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hora</label>
                            <input 
                                type="time"
                                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-blue outline-none transition-all"
                                value={newGameHour}
                                onChange={e => setNewGameHour(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Localização</label>
                            <input 
                                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-blue outline-none transition-all" 
                                placeholder="Ex: Quadra Municipal" 
                                value={newGameLocation} 
                                onChange={e => setNewGameLocation(e.target.value)} 
                            />
                        </div>
                    </div>

                    {event.formato === 'chaveamento' && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fase do Torneio</label>
                            <select 
                                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-blue outline-none"
                                value={newGamePhase}
                                onChange={e => setNewGamePhase(e.target.value as any)}
                            >
                                <option value="fase_grupos">Fase de Grupos</option>
                                <option value="oitavas">Oitavas de Final</option>
                                <option value="quartas">Quartas de Final</option>
                                <option value="semi">Semi-Final</option>
                                <option value="final">Final</option>
                            </select>
                        </div>
                    )}

                    {event.type === 'torneio_interno' ? (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time A (Mandante)</label>
                                <select className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-blue outline-none" value={newGameTimeA} onChange={e => setNewGameTimeA(e.target.value)} required>
                                    <option value="">Selecione...</option>
                                    {event.times?.map(t => <option key={t.id} value={t.id}>{t.nomeTime}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time B (Visitante)</label>
                                <select className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-blue outline-none" value={newGameTimeB} onChange={e => setNewGameTimeB(e.target.value)} required>
                                    <option value="">Selecione...</option>
                                    {event.times?.map(t => <option key={t.id} value={t.id}>{t.nomeTime}</option>)}
                                </select>
                            </div>
                        </>
                    ) : event.type === 'torneio_externo' ? (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time A</label>
                                <select className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-blue outline-none" value={newGameTimeA} onChange={e => setNewGameTimeA(e.target.value)} required>
                                    <option value="">Selecione...</option>
                                    {event.timesParticipantes?.map(t => <option key={t.id} value={t.id}>{t.nomeTime} {t.isANCB ? '(ANCB)' : ''}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time B</label>
                                <select className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-blue outline-none" value={newGameTimeB} onChange={e => setNewGameTimeB(e.target.value)} required>
                                    <option value="">Selecione...</option>
                                    {event.timesParticipantes?.map(t => <option key={t.id} value={t.id}>{t.nomeTime} {t.isANCB ? '(ANCB)' : ''}</option>)}
                                </select>
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Adversário</label>
                            <input 
                                type="text" 
                                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-blue outline-none" 
                                placeholder="Nome do time adversário"
                                value={newGameTimeB} 
                                onChange={e => setNewGameTimeB(e.target.value)} 
                                required 
                            />
                            <p className="text-[10px] text-gray-400 mt-1 pl-1">Seu time será listado automaticamente como ANCB.</p>
                        </div>
                    )}
                    <Button type="submit" className="w-full h-12 text-lg">Criar Jogo</Button>
                </form>
            </Modal>

            {/* Score Edit Modal ... */}
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

            {/* NEW: Edit Number Modal */}
            <Modal isOpen={!!editNumberData} onClose={() => setEditNumberData(null)} title="Editar Número">
                {editNumberData && (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Defina o número da camisa de <strong>{editNumberData.player.nome}</strong> para este evento.
                        </p>
                        <input 
                            type="number" 
                            className="w-full p-4 border rounded-xl text-3xl font-bold text-center dark:bg-gray-700 dark:text-white"
                            value={editNumberData.number}
                            onChange={(e) => setEditNumberData({...editNumberData, number: e.target.value})}
                            autoFocus
                        />
                        <Button className="w-full" onClick={handleSaveNumber}>Salvar</Button>
                    </div>
                )}
            </Modal>

            {/* Edit Game Phase Modal */}
            <Modal isOpen={!!editPhaseGame} onClose={() => setEditPhaseGame(null)} title="Editar Fase do Jogo">
                {editPhaseGame && (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            <strong>{editPhaseGame.timeA_nome}</strong> vs <strong>{editPhaseGame.timeB_nome || editPhaseGame.adversario}</strong>
                        </p>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Fase do Torneio</label>
                            <select 
                                className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-blue outline-none"
                                value={editPhaseValue}
                                onChange={(e) => setEditPhaseValue(e.target.value as any)}
                            >
                                <option value="fase_grupos">Fase de Grupos</option>
                                <option value="oitavas">Oitavas de Final</option>
                                <option value="quartas">Quartas de Final</option>
                                <option value="semi">Semi-Final</option>
                                <option value="final">Final</option>
                            </select>
                        </div>
                        <Button className="w-full mt-4" onClick={handleSavePhase}>
                            Salvar Fase
                        </Button>
                    </div>
                )}
            </Modal>

            {/* TEAM MANAGER MODAL REMOVED - Replaced by TeamManagerView */}
            
            {/* Share Modal */}

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
