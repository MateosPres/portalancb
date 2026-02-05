
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc, where, collectionGroup } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Player, UserProfile, Evento, Jogo, PlayerReview, Cesta } from '../types';
import { PlayerCard } from '../components/PlayerCard';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { 
    CalendarDays as LucideCalendarDays, 
    AlertCircle as LucideAlertCircle, 
    Save as LucideSave, 
    X as LucideX, 
    Search as LucideSearch, 
    ArrowLeft as LucideArrowLeft,
    Edit as LucideEdit,
    LucideHistory,
    LucideMessageSquare,
    LucideStar,
    LucideLoader2,
    LucideCheckCircle2,
    LucideCrosshair,
    LucideUsers
} from 'lucide-react';

interface JogadoresViewProps {
    onBack: () => void;
    userProfile?: UserProfile | null;
}

interface MatchHistoryItem {
    eventId: string;
    gameId: string;
    eventName: string;
    eventType: string; // '3x3' or '5x5'
    date: string;
    opponent: string;
    myTeam: string;
    scoreMyTeam: number;
    scoreOpponent: number;
    reviewed: boolean;
    // Stats Individuais
    individualPoints: number;
    cesta1: number;
    cesta2: number;
    cesta3: number;
}

export const JogadoresView: React.FC<JogadoresViewProps> = ({ onBack, userProfile }) => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [activeFilter, setActiveFilter] = useState('Todos');
    
    // Tab State for Modal
    const [activeTab, setActiveTab] = useState<'matches' | 'info'>('matches');
    const [matches, setMatches] = useState<MatchHistoryItem[]>([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    const [testimonials, setTestimonials] = useState<PlayerReview[]>([]);
    const [loadingTestimonials, setLoadingTestimonials] = useState(false);
    
    // Admin Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<Player>>({});

    const isAdmin = userProfile?.role === 'admin';

    const FILTERS = [
        "Todos",
        "Armador (1)",
        "Ala/Armador (2)",
        "Ala (3)",
        "Ala/Pivô (4)",
        "Pivô (5)"
    ];

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const q = query(collection(db, "jogadores"), orderBy("nome"));
                const snapshot = await getDocs(q);
                // Filter: show active or if undefined (legacy). 
                const allPlayers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
                const visiblePlayers = allPlayers.filter(p => p.status === 'active' || !p.status);
                setPlayers(visiblePlayers);
            } catch (error) {
                console.error("Error fetching players:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayers();
    }, []);

    // Fetch details when tab changes
    useEffect(() => {
        if (!selectedPlayer) return;

        if (activeTab === 'matches') {
            // Fetch Matches
            const fetchMatches = async () => {
                setLoadingMatches(true);
                const historyList: MatchHistoryItem[] = [];
                
                // PRE-FETCH: Get all games where player scored (Definitive Proof of Participation)
                // Map stores: GameID -> Side ('A' | 'B' | undefined)
                const scoredGamesMap = new Map<string, string | undefined>(); 
                try {
                    const qCestas = query(collectionGroup(db, 'cestas'), where('jogadorId', '==', selectedPlayer.id));
                    const snapCestas = await getDocs(qCestas);
                    snapCestas.forEach(d => {
                        const data = d.data();
                        let gId = data.jogoId;
                        // Handle Subcollection Path: eventos/ID/jogos/GAME_ID/cestas/ID
                        if (!gId && d.ref.parent && d.ref.parent.parent) {
                            gId = d.ref.parent.parent.id;
                        }
                        if (gId) {
                            // Only set if not already set, or prioritize explicit side if available
                            if (!scoredGamesMap.has(gId) || data.timeId) {
                                scoredGamesMap.set(gId, data.timeId);
                            }
                        }
                    });
                } catch (e) {
                    console.warn("Error fetching player cestas history:", e);
                }

                try {
                    const eventsQ = query(collection(db, "eventos"), where("status", "==", "finalizado"));
                    const eventsSnap = await getDocs(eventsQ);
                    
                    for (const eventDoc of eventsSnap.docs) {
                        const eventData = eventDoc.data() as Evento;
                        const gamesSnap = await getDocs(collection(db, "eventos", eventDoc.id, "jogos"));
                        
                        for (const gameDoc of gamesSnap.docs) {
                            const gameData = gameDoc.data() as Jogo;
                            let played = false;
                            let isTeamA = true; // Default to Team A (Home/ANCB)

                            const isExternal = eventData.type !== 'torneio_interno';

                            if (isExternal) {
                                // --- EXTERNAL GAMES (5x5 / Amistoso) ---
                                // Player is ALWAYS on Team A (ANCB).
                                
                                // Check participation:
                                if (scoredGamesMap.has(gameDoc.id) || 
                                    gameData.jogadoresEscalados?.includes(selectedPlayer.id) || 
                                    eventData.jogadoresEscalados?.includes(selectedPlayer.id)) {
                                    played = true;
                                    isTeamA = true; // Force Team A for external
                                }
                            } else {
                                // --- INTERNAL GAMES (3x3 / Internal Tournament) ---
                                // Player can be Team A or Team B. Side determination is critical.

                                const scoredSide = scoredGamesMap.get(gameDoc.id); // 'A' | 'B' | undefined
                                
                                // Find player's team definition in event
                                const playerTeam = eventData.times?.find(t => t.jogadores?.includes(selectedPlayer.id));
                                
                                // Helper to match game team to player team with normalization and accent removal
                                const normalizeTeamName = (name: string | undefined) => 
                                    (name || '').trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                                
                                const isTeamMatch = (side: 'A' | 'B') => {
                                    if (!playerTeam) return false;
                                    const gId = side === 'A' ? gameData.timeA_id : gameData.timeB_id;
                                    const gName = side === 'A' ? gameData.timeA_nome : gameData.timeB_nome;
                                    
                                    // 1. Strict ID Match
                                    if (gId && gId === playerTeam.id) return true;
                                    
                                    // 2. Fuzzy Name Match
                                    const normGameName = normalizeTeamName(gName);
                                    const normPlayerTeamName = normalizeTeamName(playerTeam.nomeTime);
                                    
                                    if (!normGameName || !normPlayerTeamName) return false;
                                    
                                    // Bidirectional inclusion
                                    return normGameName === normPlayerTeamName || 
                                           (normGameName.length > 3 && normPlayerTeamName.length > 3 && 
                                           (normGameName.includes(normPlayerTeamName) || normPlayerTeamName.includes(normGameName)));
                                };

                                if (scoredGamesMap.has(gameDoc.id)) {
                                    played = true; // They scored, so they played.
                                    
                                    if (scoredSide) {
                                        // Trust the recorded side in the stats
                                        isTeamA = (scoredSide === 'A');
                                    } else {
                                        // Legacy Data (No side in Cesta): Deduce from Team Definition
                                        // CRITICAL: Check Team B match FIRST to avoid defaulting to A mistakenly
                                        if (isTeamMatch('B')) isTeamA = false;
                                        else if (isTeamMatch('A')) isTeamA = true;
                                        else isTeamA = true; // Fallback default
                                    }
                                } else {
                                    // Didn't score, check rosters/team matching
                                    if (isTeamMatch('B')) { 
                                        played = true; 
                                        isTeamA = false; 
                                    } else if (isTeamMatch('A')) { 
                                        played = true; 
                                        isTeamA = true; 
                                    }
                                    
                                    // Fallback: Direct roster check (if ad-hoc)
                                    if (!played && gameData.jogadoresEscalados?.includes(selectedPlayer.id)) {
                                        played = true;
                                        isTeamA = true; // Default A
                                    }
                                }
                            }

                            if (played) {
                                // --- FETCH INDIVIDUAL STATS FOR THIS GAME ---
                                let points = 0;
                                let c1 = 0;
                                let c2 = 0;
                                let c3 = 0;
                                const processedCestaIds = new Set<string>();

                                const countCesta = (cesta: Cesta) => {
                                    if (processedCestaIds.has(cesta.id)) return;
                                    if (cesta.jogadorId === selectedPlayer.id) {
                                        const p = Number(cesta.pontos);
                                        points += p;
                                        if (p === 1) c1++;
                                        if (p === 2) c2++;
                                        if (p === 3) c3++;
                                        processedCestaIds.add(cesta.id);
                                    }
                                };

                                // 1. Subcollection
                                try {
                                    const subCestas = await getDocs(collection(db, "eventos", eventDoc.id, "jogos", gameDoc.id, "cestas"));
                                    subCestas.forEach(d => countCesta({id: d.id, ...d.data()} as Cesta));
                                } catch(e) {}

                                // 2. Root Collection (Legacy)
                                try {
                                    const rootCestasQuery = query(collection(db, "cestas"), where("jogoId", "==", gameDoc.id), where("jogadorId", "==", selectedPlayer.id));
                                    const rootCestas = await getDocs(rootCestasQuery);
                                    rootCestas.forEach(d => countCesta({id: d.id, ...d.data()} as Cesta));
                                } catch (e) {}

                                // Score Logic
                                const sA = gameData.placarTimeA_final ?? gameData.placarANCB_final ?? 0;
                                const sB = gameData.placarTimeB_final ?? gameData.placarAdversario_final ?? 0;

                                // --- HEURISTIC CHECK FOR SIDE CORRECTION ---
                                // If player points > Team A Score, they CANNOT be Team A.
                                // If player points > Team B Score, they CANNOT be Team B.
                                if (!isExternal && points > 0) {
                                    if (isTeamA && points > sA) {
                                        isTeamA = false; // Must be B
                                    } else if (!isTeamA && points > sB) {
                                        isTeamA = true; // Must be A
                                    }
                                }

                                // Check review status
                                const reviewQ = query(
                                    collection(db, "avaliacoes"), 
                                    where("gameId", "==", gameDoc.id),
                                    where("reviewerId", "==", selectedPlayer.id)
                                );
                                const reviewSnap = await getDocs(reviewQ);

                                historyList.push({
                                    eventId: eventDoc.id,
                                    gameId: gameDoc.id,
                                    eventName: eventData.nome,
                                    eventType: eventData.modalidade || '5x5',
                                    date: gameData.dataJogo || eventData.data,
                                    opponent: isTeamA ? (gameData.adversario || gameData.timeB_nome || 'Adversário') : (gameData.timeA_nome || 'ANCB'),
                                    myTeam: isTeamA ? (gameData.timeA_nome || 'ANCB') : (gameData.timeB_nome || 'Meu Time'),
                                    scoreMyTeam: isTeamA ? sA : sB,
                                    scoreOpponent: isTeamA ? sB : sA,
                                    reviewed: !reviewSnap.empty,
                                    individualPoints: points,
                                    cesta1: c1,
                                    cesta2: c2,
                                    cesta3: c3
                                });
                            }
                        }
                    }
                    historyList.sort((a, b) => b.date.localeCompare(a.date));
                    setMatches(historyList);
                } catch (e) {
                    console.error("Error fetching matches", e);
                } finally {
                    setLoadingMatches(false);
                }
            };
            fetchMatches();

            // Fetch Testimonials (unchanged)
            const fetchTestimonials = async () => {
                setLoadingTestimonials(true);
                try {
                    const q = query(collection(db, "avaliacoes"), where("revieweeId", "==", selectedPlayer.id), orderBy("timestamp", "desc"));
                    const snap = await getDocs(q);
                    setTestimonials(snap.docs.map(d => ({id: d.id, ...d.data()} as PlayerReview)));
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoadingTestimonials(false);
                }
            };
            fetchTestimonials();
        }

    }, [activeTab, selectedPlayer]);

    // Helper to normalize mixed DB data to new standard
    const normalizePosition = (pos: string | undefined): string => {
        if (!pos) return '-';
        const p = pos.toLowerCase();
        
        // 1 - Armador
        if (p.includes('1') || (p.includes('armador') && !p.includes('ala'))) return 'Armador (1)';
        // 2 - Ala/Armador
        if (p.includes('2') || p.includes('ala/armador') || p.includes('ala-armador') || p.includes('sg')) return 'Ala/Armador (2)';
        // 3 - Ala
        if (p.includes('3') || (p.includes('ala') && !p.includes('armador') && !p.includes('piv') && !p.includes('pivo')) || p.includes('sf')) return 'Ala (3)';
        // 4 - Ala/Pivô
        if (p.includes('4') || p.includes('ala/piv') || p.includes('ala-piv') || p.includes('pf')) return 'Ala/Pivô (4)';
        // 5 - Pivô
        if (p.includes('5') || (p.includes('piv') && !p.includes('ala')) || p.includes('c)') || p.trim().endsWith('(c)')) return 'Pivô (5)';
        
        return pos;
    };

    const filteredPlayers = players.filter(p => {
        const matchesSearch = (p.nome || '').toLowerCase().includes(search.toLowerCase()) || 
                              (p.apelido || '').toLowerCase().includes(search.toLowerCase());
        
        let matchesFilter = true;
        if (activeFilter !== 'Todos') {
            matchesFilter = normalizePosition(p.posicao) === activeFilter;
        }

        return matchesSearch && matchesFilter;
    });

    const calculateAge = (dateString?: string) => {
        if (!dateString) return '-';
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        return dateStr.split('-').reverse().join('/');
    };
    
    const formatReviewDate = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date);
    };

    const handlePlayerClick = (player: Player) => {
        setSelectedPlayer(player);
        setActiveTab('matches'); // Default to Matches
        setIsEditing(false);
        setEditFormData({});
    };

    const handleStartEdit = () => {
        if (!selectedPlayer) return;
        setEditFormData({
            nascimento: selectedPlayer.nascimento,
            cpf: selectedPlayer.cpf,
            emailContato: selectedPlayer.emailContato
        });
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditFormData({});
    };

    const handleSavePlayer = async () => {
        if (!selectedPlayer) return;
        try {
            await updateDoc(doc(db, "jogadores", selectedPlayer.id), editFormData);
            
            // Update local state
            const updatedPlayer = { ...selectedPlayer, ...editFormData };
            setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
            setSelectedPlayer(updatedPlayer);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating player:", error);
            alert("Erro ao atualizar dados.");
        }
    };

    return (
        <div className="animate-fadeIn pb-20">
            <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <Button variant="secondary" size="sm" onClick={onBack} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                        <LucideArrowLeft size={18} />
                    </Button>
                    <h2 className="text-2xl font-bold text-ancb-black dark:text-white">Elenco</h2>
                </div>
                
                <div className="relative">
                    <LucideSearch className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar atleta..." 
                        className="pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-ancb-blue outline-none w-40 md:w-auto"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Position Filters */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-2 custom-scrollbar">
                {FILTERS.map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`
                            px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors
                            ${activeFilter === filter 
                                ? 'bg-ancb-blue text-white shadow-md' 
                                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}
                        `}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ancb-blue"></div>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredPlayers.map(player => (
                        <PlayerCard 
                            key={player.id} 
                            player={player} 
                            onClick={() => handlePlayerClick(player)} 
                        />
                    ))}
                    {filteredPlayers.length === 0 && (
                        <div className="col-span-full text-center py-10 text-gray-400">
                            Nenhum jogador encontrado.
                        </div>
                    )}
                </div>
            )}

            <Modal isOpen={!!selectedPlayer} onClose={() => setSelectedPlayer(null)} title="Ficha do Atleta">
                {selectedPlayer && (
                    <div className="flex flex-col h-full">
                        {/* HEADER - Always visible */}
                        <div className="flex flex-col items-center mb-4">
                            <div className="w-24 h-24 rounded-full border-4 border-gray-100 dark:border-gray-700 mb-2 overflow-hidden shadow-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                {selectedPlayer.foto ? (
                                    <img src={selectedPlayer.foto} alt={selectedPlayer.nome} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-gray-400">{selectedPlayer.nome.substring(0, 1)}</span>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{selectedPlayer.apelido || selectedPlayer.nome}</h2>
                            <span className="bg-ancb-orange text-white px-3 py-0.5 rounded-full text-xs font-bold">
                                #{selectedPlayer.numero_uniforme} • {normalizePosition(selectedPlayer.posicao)}
                            </span>
                        </div>

                        {/* TABS - SIMPLIFIED */}
                        <div className="flex border-b border-gray-100 dark:border-gray-700 mb-4 w-full">
                            <button 
                                onClick={() => setActiveTab('matches')}
                                className={`flex-1 pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'matches' ? 'border-ancb-blue text-ancb-blue dark:text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                Partidas
                            </button>
                             <button 
                                onClick={() => setActiveTab('info')}
                                className={`flex-1 pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'info' ? 'border-ancb-blue text-ancb-blue dark:text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                Dados
                            </button>
                        </div>

                        {/* TAB CONTENT */}
                        <div className="w-full">
                            {activeTab === 'info' && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="grid grid-cols-2 gap-3 w-full">
                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center">
                                            <LucideCalendarDays className="text-ancb-blue dark:text-blue-400 mb-1" size={20} />
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">Idade</span>
                                            <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                                {selectedPlayer.nascimento ? calculateAge(selectedPlayer.nascimento) : '-'}
                                            </span>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center justify-center">
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Nome Completo</span>
                                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                                                {selectedPlayer.nome}
                                            </span>
                                        </div>
                                    </div>

                                    {/* ADMIN ONLY: Sensitive Data & Actions */}
                                    {isAdmin && (
                                        <div className="w-full mt-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4">
                                            <div className="flex justify-between items-center mb-3">
                                                <h3 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase flex items-center gap-2">
                                                    <LucideAlertCircle size={14} /> Dados Administrativos
                                                </h3>
                                                {!isEditing && (
                                                    <button onClick={handleStartEdit} className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                                                        <LucideEdit size={12} /> Editar
                                                    </button>
                                                )}
                                            </div>
                                            
                                            {isEditing ? (
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Data Nascimento</label>
                                                        <input 
                                                            type="date"
                                                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                                            value={editFormData.nascimento || ''}
                                                            onChange={e => setEditFormData({...editFormData, nascimento: e.target.value})}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">CPF</label>
                                                        <input 
                                                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                                            value={editFormData.cpf || ''}
                                                            onChange={e => setEditFormData({...editFormData, cpf: e.target.value})}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Email Contato</label>
                                                        <input 
                                                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                                            value={editFormData.emailContato || ''}
                                                            onChange={e => setEditFormData({...editFormData, emailContato: e.target.value})}
                                                        />
                                                    </div>
                                                    
                                                    <div className="flex gap-2 mt-4 pt-2 border-t border-red-200 dark:border-red-900/30">
                                                        <Button size="sm" onClick={handleSavePlayer} className="flex-1 !bg-green-600">
                                                            <LucideSave size={14} /> Salvar
                                                        </Button>
                                                        <Button size="sm" onClick={handleCancelEdit} variant="secondary" className="flex-1">
                                                            <LucideX size={14} /> Cancelar
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
                                                        <div>
                                                            <span className="block text-[10px] text-gray-400 uppercase">Nascimento</span>
                                                            <span className="font-bold">{formatDate(selectedPlayer.nascimento || '')}</span>
                                                        </div>
                                                        <div>
                                                            <span className="block text-[10px] text-gray-400 uppercase">CPF</span>
                                                            <span className="font-bold">{selectedPlayer.cpf || '-'}</span>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <span className="block text-[10px] text-gray-400 uppercase">Email</span>
                                                            <span className="font-bold">{selectedPlayer.emailContato || '-'}</span>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'matches' && (
                                <div className="animate-fadeIn space-y-6">
                                    {/* Matches List */}
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1">
                                            <LucideHistory size={14} /> Histórico de Jogos
                                        </h4>
                                        {loadingMatches ? (
                                            <div className="flex justify-center py-10">
                                                <LucideLoader2 className="animate-spin text-ancb-blue" />
                                            </div>
                                        ) : matches.length > 0 ? (
                                            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                                {matches.map((match) => {
                                                    const isWin = match.scoreMyTeam > match.scoreOpponent;
                                                    const isLoss = match.scoreMyTeam < match.scoreOpponent;
                                                    const borderClass = isWin ? 'border-green-500 dark:border-green-500' : isLoss ? 'border-red-500 dark:border-red-500' : 'border-gray-100 dark:border-gray-700';

                                                    return (
                                                        <div key={match.gameId} className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${borderClass} p-3`}>
                                                            <div className="text-[10px] text-gray-400 mb-2 flex justify-between uppercase font-bold tracking-wider">
                                                                <span className="flex items-center gap-1">
                                                                    {formatDate(match.date)}
                                                                    <span className="bg-gray-100 dark:bg-gray-700 px-1.5 rounded text-[9px] text-gray-500">{match.eventType}</span>
                                                                </span>
                                                                <span className="text-ancb-blue truncate max-w-[120px]">{match.eventName}</span>
                                                            </div>
                                                            
                                                            <div className="flex justify-between items-center mb-2 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                                                <span className="font-bold text-xs text-gray-800 dark:text-gray-200 truncate w-1/3">{match.myTeam}</span>
                                                                <span className="font-mono font-bold bg-white dark:bg-gray-600 px-2 py-0.5 rounded text-xs border border-gray-200 dark:border-gray-500">
                                                                    {match.scoreMyTeam} x {match.scoreOpponent}
                                                                </span>
                                                                <span className="font-bold text-xs text-gray-800 dark:text-gray-200 truncate w-1/3 text-right">{match.opponent}</span>
                                                            </div>

                                                            {/* INDIVIDUAL STATS BADGE */}
                                                            <div className="flex flex-wrap gap-2 items-center justify-center border-t border-gray-100 dark:border-gray-700 pt-2">
                                                                <div className="flex items-center gap-1 bg-ancb-blue/10 dark:bg-blue-900/30 px-2 py-1 rounded text-ancb-blue dark:text-blue-300 font-bold text-xs">
                                                                    <span>{match.individualPoints} Pts</span>
                                                                </div>
                                                                <div className="text-[10px] text-gray-500 dark:text-gray-400 flex gap-2">
                                                                    <span title="Bolas de 3 Pontos">3PT: <b>{match.cesta3}</b></span>
                                                                    <span className="text-gray-300 dark:text-gray-600">|</span>
                                                                    <span title="Bolas de 2 Pontos">2PT: <b>{match.cesta2}</b></span>
                                                                    <span className="text-gray-300 dark:text-gray-600">|</span>
                                                                    <span title="Lances Livres">1PT: <b>{match.cesta1}</b></span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                                <p className="text-gray-500 text-xs">Nenhum jogo finalizado.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Testimonials List (Now inside Matches tab) */}
                                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1">
                                            <LucideMessageSquare size={14} /> Depoimentos
                                        </h4>
                                        {loadingTestimonials ? (
                                            <div className="flex justify-center py-4">
                                                <LucideLoader2 className="animate-spin text-ancb-blue" size={16} />
                                            </div>
                                        ) : testimonials.length > 0 ? (
                                            <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar">
                                                {testimonials.map(review => (
                                                    <div key={review.id} className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                                                                    {review.reviewerPhoto ? (
                                                                        <img src={review.reviewerPhoto} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-gray-500">{review.reviewerName.charAt(0)}</div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold text-gray-800 dark:text-white">{review.reviewerName}</p>
                                                                    <p className="text-[9px] text-gray-400 uppercase">{formatReviewDate(review.timestamp)}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <div className="flex text-yellow-400">
                                                                    {[...Array(review.rating)].map((_, i) => <LucideStar key={i} size={10} fill="currentColor" />)}
                                                                </div>
                                                                <span className="text-lg" title="Tag">{review.emojiTag}</span>
                                                            </div>
                                                        </div>
                                                        {review.comment && (
                                                            <div className="bg-white dark:bg-gray-800 p-2 rounded-lg text-xs text-gray-600 dark:text-gray-300 italic relative">
                                                                "{review.comment}"
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <p className="text-gray-400 text-xs italic">Nenhum depoimento ainda.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
