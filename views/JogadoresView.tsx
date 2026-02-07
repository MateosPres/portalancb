
import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { Player, UserProfile, Evento, Jogo, PlayerReview, Cesta, Badge } from '../types';
import { PlayerCard } from '../components/PlayerCard';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { RadarChart } from '../components/RadarChart'; 
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
    LucideUsers,
    LucideHexagon,
    LucideMedal,
    LucideInfo,
    LucideTrendingUp,
    LucideTrophy,
    LucideMapPin,
    LucideGrid,
    LucideEdit2
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
    individualPoints: number;
    cesta1: number;
    cesta2: number;
    cesta3: number;
}

const calculateStatsFromTags = (tags?: Record<string, number>) => {
    let stats = { ataque: 50, defesa: 50, forca: 50, velocidade: 50, visao: 50 };
    if (!tags) return stats;

    const WEIGHTS: Record<string, any> = {
        'sniper': { ataque: 3 },
        'muralha': { defesa: 3 },
        'lider': { visao: 2 },
        'garcom': { visao: 2 },
        'flash': { velocidade: 1 },
        'guerreiro': { forca: 1 },
        'fominha': { visao: -1 },
        'tijoleiro': { ataque: -2 },
        'avenida': { defesa: -2 },
        'cone': { velocidade: -3 }
    };

    Object.entries(tags).forEach(([tag, count]) => {
        const impact = WEIGHTS[tag];
        if (impact) {
            if (impact.ataque) stats.ataque += (impact.ataque * count);
            if (impact.defesa) stats.defesa += (impact.defesa * count);
            if (impact.forca) stats.forca += (impact.forca * count);
            if (impact.velocidade) stats.velocidade += (impact.velocidade * count);
            if (impact.visao) stats.visao += (impact.visao * count);
        }
    });

    const clamp = (n: number) => Math.max(20, Math.min(n, 99));
    
    return {
        ataque: clamp(stats.ataque),
        defesa: clamp(stats.defesa),
        forca: clamp(stats.forca),
        velocidade: clamp(stats.velocidade),
        visao: clamp(stats.visao)
    };
};

export const JogadoresView: React.FC<JogadoresViewProps> = ({ onBack, userProfile }) => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [activeFilter, setActiveFilter] = useState('Todos');
    
    const [matches, setMatches] = useState<MatchHistoryItem[]>([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
    const [showAllBadges, setShowAllBadges] = useState(false); // For modal gallery

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
                const snapshot = await db.collection("jogadores").orderBy("nome").get();
                const allPlayers = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Player));
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

    useEffect(() => {
        if (!selectedPlayer) return;

        const fetchMatches = async () => {
            setLoadingMatches(true);
            const historyList: MatchHistoryItem[] = [];
            const scoredGamesMap = new Map<string, string | undefined>(); 
            try {
                const snapCestas = await db.collectionGroup('cestas').where('jogadorId', '==', selectedPlayer.id).get();
                snapCestas.forEach(d => {
                    const data = d.data() as any;
                    let gId = data.jogoId;
                    if (!gId && d.ref.parent && d.ref.parent.parent) {
                        gId = d.ref.parent.parent.id;
                    }
                    if (gId) {
                        if (!scoredGamesMap.has(gId) || data.timeId) {
                            scoredGamesMap.set(gId, data.timeId);
                        }
                    }
                });
            } catch (e) {}

            try {
                const eventsSnap = await db.collection("eventos").where("status", "==", "finalizado").get();
                
                for (const eventDoc of eventsSnap.docs) {
                    const eventData = eventDoc.data() as Evento;
                    const gamesSnap = await db.collection("eventos").doc(eventDoc.id).collection("jogos").get();
                    
                    for (const gameDoc of gamesSnap.docs) {
                        const gameData = gameDoc.data() as Jogo;
                        let played = false;
                        let isTeamA = true;

                        const isExternal = eventData.type !== 'torneio_interno';

                        if (isExternal) {
                            if (scoredGamesMap.has(gameDoc.id) || 
                                gameData.jogadoresEscalados?.includes(selectedPlayer.id) || 
                                eventData.jogadoresEscalados?.includes(selectedPlayer.id)) {
                                played = true;
                                isTeamA = true;
                            }
                        } else {
                            const playerTeam = eventData.times?.find(t => t.jogadores?.includes(selectedPlayer.id));
                            const normalize = (s: string) => s ? s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

                            if (playerTeam) {
                                const pTeamId = playerTeam.id;
                                const pTeamName = normalize(playerTeam.nomeTime);
                                const gTeamAId = gameData.timeA_id;
                                const gTeamAName = normalize(gameData.timeA_nome || '');
                                const gTeamBId = gameData.timeB_id;
                                const gTeamBName = normalize(gameData.timeB_nome || '');
                                
                                if ((gTeamAId && gTeamAId === pTeamId) || (gTeamAName === pTeamName)) {
                                    played = true;
                                    isTeamA = true;
                                }
                                else if ((gTeamBId && gTeamBId === pTeamId) || (gTeamBName === pTeamName)) {
                                    played = true;
                                    isTeamA = false;
                                }
                            }

                            if (!played && scoredGamesMap.has(gameDoc.id)) {
                                played = true;
                                const scoredSide = scoredGamesMap.get(gameDoc.id);
                                if (scoredSide === 'B') isTeamA = false;
                                else isTeamA = true;
                            }
                        }

                        if (played) {
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
                            try {
                                const subCestas = await db.collection("eventos").doc(eventDoc.id).collection("jogos").doc(gameDoc.id).collection("cestas").get();
                                subCestas.forEach(d => countCesta({id: d.id, ...(d.data() as any)} as Cesta));
                            } catch(e) {}
                            try {
                                const rootCestas = await db.collection("cestas").where("jogoId", "==", gameDoc.id).where("jogadorId", "==", selectedPlayer.id).get();
                                rootCestas.forEach(d => countCesta({id: d.id, ...(d.data() as any)} as Cesta));
                            } catch (e) {}

                            const sA = gameData.placarTimeA_final ?? gameData.placarANCB_final ?? 0;
                            const sB = gameData.placarTimeB_final ?? gameData.placarAdversario_final ?? 0;

                            if (!isExternal && points > 0) {
                                if (isTeamA && points > sA) isTeamA = false;
                                else if (!isTeamA && points > sB) isTeamA = true;
                            }

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
                                reviewed: false, 
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

    }, [selectedPlayer]);

    const normalizePosition = (pos: string | undefined): string => {
        if (!pos) return '-';
        const p = pos.toLowerCase();
        if (p.includes('1') || (p.includes('armador') && !p.includes('ala'))) return 'Armador (1)';
        if (p.includes('2') || p.includes('ala/armador') || p.includes('ala-armador') || p.includes('sg')) return 'Ala/Armador (2)';
        if (p.includes('3') || (p.includes('ala') && !p.includes('armador') && !p.includes('piv') && !p.includes('pivo')) || p.includes('sf')) return 'Ala (3)';
        if (p.includes('4') || p.includes('ala/piv') || p.includes('ala-piv') || p.includes('pf')) return 'Ala/Pivô (4)';
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
    
    const handlePlayerClick = (player: Player) => {
        setSelectedPlayer(player);
        setIsEditing(false);
        setEditFormData({});
        window.scrollTo(0, 0); 
    };

    const handleStartEdit = () => {
        if (!selectedPlayer) return;
        setEditFormData({
            nascimento: selectedPlayer.nascimento,
            cpf: selectedPlayer.cpf,
            emailContato: selectedPlayer.emailContato,
            telefone: selectedPlayer.telefone
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
            await db.collection("jogadores").doc(selectedPlayer.id).update(editFormData);
            const updatedPlayer = { ...selectedPlayer, ...editFormData };
            setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
            setSelectedPlayer(updatedPlayer);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating player:", error);
            alert("Erro ao atualizar dados.");
        }
    };

    const getRarityStyles = (rarity: Badge['raridade']) => {
        switch(rarity) {
            case 'lendaria': 
                return { label: 'Lendária', classes: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400' };
            case 'epica': 
                return { label: 'Ouro', classes: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-300' };
            case 'rara': 
                return { label: 'Prata', classes: 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 border-gray-200' };
            default: 
                return { label: 'Bronze', classes: 'bg-gradient-to-r from-orange-700 to-orange-800 text-white border-orange-900' };
        }
    };

    const getBadgeWeight = (rarity: Badge['raridade']) => {
        switch(rarity) {
            case 'lendaria': return 4;
            case 'epica': return 3;
            case 'rara': return 2;
            default: return 1;
        }
    };

    const radarStats = selectedPlayer 
        ? calculateStatsFromTags(selectedPlayer.stats_tags) 
        : { ataque: 50, defesa: 50, forca: 50, velocidade: 50, visao: 50 };
    
    // BADGE DISPLAY LOGIC
    let displayBadges: Badge[] = [];
    if (selectedPlayer?.badges) {
        const allBadges = selectedPlayer.badges;
        const pinnedIds = selectedPlayer.pinnedBadgeIds || [];
        
        if (pinnedIds.length > 0) {
            displayBadges = allBadges.filter(b => pinnedIds.includes(b.id));
        } else {
            displayBadges = [...allBadges].sort((a, b) => {
                const weightA = getBadgeWeight(a.raridade);
                const weightB = getBadgeWeight(b.raridade);
                if (weightA !== weightB) return weightB - weightA;
                return b.data.localeCompare(a.data);
            }).slice(0, 3);
        }
    }

    if (selectedPlayer) {
        return (
            <div className="animate-fadeIn pb-20">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Button variant="secondary" size="sm" onClick={() => setSelectedPlayer(null)} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                            <LucideArrowLeft size={18} />
                        </Button>
                        <h2 className="text-2xl font-bold text-ancb-black dark:text-white">Ficha do Atleta</h2>
                    </div>
                </div>

                <div className="flex flex-col h-full">
                    
                    {/* UPDATED HERO CARD (SYNCED WITH PROFILE VIEW) */}
                    <div className="relative w-full rounded-3xl overflow-hidden shadow-xl mb-6 bg-[#062553] text-white border border-blue-900 p-6 md:p-8">
                        {/* Background Watermark - Top Right Tilted */}
                        <div className="absolute top-0 right-0 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4 rotate-12">
                            <LucideTrophy size={450} className="text-white" />
                        </div>

                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            {/* LEFT COLUMN: Avatar + Info */}
                            {/* Added md:pl-8 lg:pl-12 for negative space/centering */}
                            <div className="flex flex-col md:flex-row items-center gap-6 w-full md:pl-8 lg:pl-12">
                                <div className="relative shrink-0">
                                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white/10 bg-gray-700 shadow-xl overflow-hidden flex items-center justify-center">
                                        {selectedPlayer.foto ? <img src={selectedPlayer.foto} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-4xl font-bold text-white/50">{selectedPlayer.nome.charAt(0)}</span>}
                                    </div>
                                    <div className="absolute bottom-1 right-0 bg-ancb-orange text-white text-sm md:text-base font-bold px-3 py-1 rounded-lg shadow-md border border-white/20">
                                        #{selectedPlayer.numero_uniforme}
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-center md:items-start text-center md:text-left w-full">
                                    <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-1">{selectedPlayer.apelido || selectedPlayer.nome}</h1>
                                    <span className="text-xs text-blue-200 font-normal mb-3 block">{selectedPlayer.nome}</span>
                                    
                                    <div className="flex items-center justify-center md:justify-start gap-2 text-gray-300 text-sm font-medium mb-4">
                                        <LucideMapPin size={16} className="text-ancb-orange" />
                                        <span>{normalizePosition(selectedPlayer.posicao)}</span>
                                    </div>

                                    {/* ADMIN EDIT BUTTON (IF ADMIN) */}
                                    {isAdmin && (
                                        <button 
                                            onClick={handleStartEdit}
                                            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-wider text-white mb-6"
                                        >
                                            <LucideEdit2 size={14} /> Editar Dados
                                        </button>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 w-full max-w-[240px] mx-auto md:mx-0">
                                        <div className="bg-[#092b5e] rounded-xl p-3 text-center border border-white/5 shadow-inner">
                                            <span className="block text-2xl font-bold text-white">{selectedPlayer.nascimento ? calculateAge(selectedPlayer.nascimento) : '-'}</span>
                                            <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Idade</span>
                                        </div>
                                        <div className="bg-[#092b5e] rounded-xl p-3 text-center border border-white/5 shadow-inner">
                                            <span className="block text-2xl font-bold text-white">{matches.length}</span>
                                            <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Jogos</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Radar Chart */}
                            <div className="flex flex-col items-center justify-center h-full">
                                <div className="relative mb-2">
                                    <div className="flex items-center justify-center gap-2 mb-2 text-blue-100/50">
                                        <LucideTrendingUp size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Atributos</span>
                                    </div>
                                    <RadarChart stats={radarStats} size={240} className="text-white/70" />
                                </div>
                            </div>
                        </div>

                        {/* INTEGRATED BADGES ROW */}
                        {displayBadges.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-white/10">
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <span className="text-xs font-bold text-blue-200 uppercase tracking-wider flex items-center gap-2">
                                        <LucideTrophy size={14} className="text-ancb-orange" /> Principais Conquistas
                                    </span>
                                    {selectedPlayer.badges && selectedPlayer.badges.length > 3 && (
                                        <button onClick={() => setShowAllBadges(true)} className="text-[10px] text-white/60 hover:text-white flex items-center gap-1 transition-colors">
                                            Ver todas <LucideGrid size={10} />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-3 gap-3 md:gap-4">
                                    {displayBadges.map((badge, idx) => {
                                        const style = getRarityStyles(badge.raridade);
                                        return (
                                            <div 
                                                key={idx} 
                                                onClick={() => setSelectedBadge(badge)}
                                                className={`rounded-lg p-2 md:p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-lg border relative overflow-hidden ${style.classes}`}
                                            >
                                                <div className="text-2xl md:text-3xl mb-1 drop-shadow-md z-10">{badge.emoji}</div>
                                                <div className="z-10 w-full">
                                                    <span className="block text-[8px] md:text-[9px] font-bold uppercase leading-tight line-clamp-2 min-h-[2em] flex items-center justify-center">
                                                        {badge.nome}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* MATCH HISTORY (DIRECTLY BELOW, NO TABS, CONTINUOUS SCROLL) */}
                    <div className="w-full animate-fadeIn">
                        <div className="mb-4 flex items-center gap-2">
                            <LucideHistory size={20} className="text-gray-500 dark:text-gray-400" />
                            <h3 className="font-bold text-gray-700 dark:text-gray-200 uppercase text-sm">Histórico de Partidas</h3>
                        </div>

                        {loadingMatches ? (
                            <div className="flex justify-center py-10"><LucideLoader2 className="animate-spin text-ancb-blue" /></div>
                        ) : matches.length > 0 ? (
                            <div className="space-y-3 pb-8">
                                {matches.map((match) => {
                                    const isWin = match.scoreMyTeam > match.scoreOpponent;
                                    const isLoss = match.scoreMyTeam < match.scoreOpponent;
                                    const borderClass = isWin ? 'border-green-500 dark:border-green-500' : isLoss ? 'border-red-500 dark:border-red-500' : 'border-gray-100 dark:border-gray-700';
                                    return (
                                        <div key={match.gameId} className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${borderClass} p-3`}>
                                            <div className="text-[10px] text-gray-400 mb-2 flex justify-between uppercase font-bold tracking-wider">
                                                <span className="flex items-center gap-1">{formatDate(match.date)}<span className="bg-gray-100 dark:bg-gray-700 px-1.5 rounded text-[9px] text-gray-500">{match.eventType}</span></span>
                                                <span className="text-ancb-blue truncate max-w-[120px]">{match.eventName}</span>
                                            </div>
                                            <div className="flex justify-between items-center mb-2 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                                <span className="font-bold text-xs text-gray-800 dark:text-gray-200 truncate w-1/3">{match.myTeam}</span>
                                                <span className="font-mono font-bold bg-white dark:bg-gray-600 px-2 py-0.5 rounded text-xs border border-gray-200 dark:border-gray-500">{match.scoreMyTeam} x {match.scoreOpponent}</span>
                                                <span className="font-bold text-xs text-gray-800 dark:text-gray-200 truncate w-1/3 text-right">{match.opponent}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 items-center justify-center border-t border-gray-100 dark:border-gray-700 pt-2">
                                                <div className="flex items-center gap-1 bg-ancb-blue/10 dark:bg-blue-900/30 px-2 py-1 rounded text-ancb-blue dark:text-blue-300 font-bold text-xs"><span>{match.individualPoints} Pts</span></div>
                                                <div className="text-[10px] text-gray-500 dark:text-gray-400 flex gap-2"><span title="Bolas de 3 Pontos">3PT: <b>{match.cesta3}</b></span><span className="text-gray-300 dark:text-gray-600">|</span><span title="Bolas de 2 Pontos">2PT: <b>{match.cesta2}</b></span><span className="text-gray-300 dark:text-gray-600">|</span><span title="Lances Livres">1PT: <b>{match.cesta1}</b></span></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-700"><p className="text-gray-500 text-sm">Nenhum jogo finalizado.</p></div>
                        )}
                    </div>

                    {/* ADMIN EDIT MODAL (Shown only if isEditing is true, triggered by button in Hero) */}
                    {isEditing && (
                        <Modal isOpen={isEditing} onClose={handleCancelEdit} title="Editar Dados Administrativos">
                            <div className="space-y-4">
                                <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Data Nascimento</label><input type="date" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={editFormData.nascimento || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({...editFormData, nascimento: e.target.value})} /></div>
                                <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">CPF</label><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={editFormData.cpf || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({...editFormData, cpf: e.target.value})} /></div>
                                <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Email Contato</label><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={editFormData.emailContato || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({...editFormData, emailContato: e.target.value})} /></div>
                                <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">WhatsApp (Sem formato)</label><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="5566999999999" value={editFormData.telefone || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({...editFormData, telefone: e.target.value})} /></div>
                                <div className="flex gap-2 mt-4"><Button className="flex-1" onClick={handleSavePlayer}><LucideSave size={14} /> Salvar</Button><Button variant="secondary" className="flex-1" onClick={handleCancelEdit}><LucideX size={14} /> Cancelar</Button></div>
                            </div>
                        </Modal>
                    )}
                </div>

                {/* DETAIL MODAL (Single Badge) */}
                <Modal isOpen={!!selectedBadge} onClose={() => setSelectedBadge(null)} title="Detalhes da Conquista">
                    {selectedBadge && (
                        <div className="text-center p-4">
                            <div className="text-8xl mb-4 animate-bounce-slow drop-shadow-xl">{selectedBadge.emoji}</div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 uppercase tracking-wide">{selectedBadge.nome}</h3>
                            <div className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border ${getRarityStyles(selectedBadge.raridade).classes}`}>
                                {getRarityStyles(selectedBadge.raridade).label}
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600 mb-4">
                                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium leading-relaxed">{selectedBadge.descricao}</p>
                            </div>
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Conquistado em: {formatDate(selectedBadge.data)}</p>
                        </div>
                    )}
                </Modal>

                {/* GALLERY MODAL (All Badges for Viewing in Player Modal) */}
                <Modal isOpen={showAllBadges} onClose={() => setShowAllBadges(false)} title="Galeria de Troféus">
                    <div className="p-2">
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
                            {selectedPlayer?.badges && selectedPlayer.badges.length > 0 ? (
                                [...selectedPlayer.badges].reverse().map((badge, idx) => {
                                    const style = getRarityStyles(badge.raridade);
                                    return (
                                        <div key={idx} onClick={() => setSelectedBadge(badge)} className={`rounded-xl p-2 flex flex-col items-center justify-center text-center cursor-pointer hover:scale-105 transition-transform shadow-sm border ${style.classes}`}>
                                            <div className="text-2xl mb-1 filter drop-shadow-sm">{badge.emoji}</div>
                                            <span className="text-[9px] font-bold uppercase leading-tight line-clamp-2">{badge.nome}</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="col-span-full text-center text-gray-500 py-10">Nenhuma conquista ainda.</p>
                            )}
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn pb-20">
            {/* ... (Search and Grid JSX same as before) ... */}
            <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <Button variant="secondary" size="sm" onClick={onBack} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                        <LucideArrowLeft size={18} />
                    </Button>
                    <h2 className="text-2xl font-bold text-ancb-black dark:text-white">Elenco</h2>
                </div>
                <div className="relative">
                    <LucideSearch className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input type="text" placeholder="Buscar atleta..." className="pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-ancb-blue outline-none w-40 md:w-auto" value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} />
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 mb-2 custom-scrollbar">
                {FILTERS.map(filter => (
                    <button key={filter} onClick={() => setActiveFilter(filter)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeFilter === filter ? 'bg-ancb-blue text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>{filter}</button>
                ))}
            </div>

            {loading ? <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ancb-blue"></div></div> : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredPlayers.map(player => (
                        <PlayerCard key={player.id} player={player} onClick={() => handlePlayerClick(player)} />
                    ))}
                    {filteredPlayers.length === 0 && <div className="col-span-full text-center py-10 text-gray-400">Nenhum jogador encontrado.</div>}
                </div>
            )}
        </div>
    );
};
