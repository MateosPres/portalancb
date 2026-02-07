
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
    LucideTrendingUp
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

const TAG_META: Record<string, {label: string, emoji: string}> = {
    'muralha': { label: 'Muralha', emoji: '🧱' },
    'sniper': { label: 'Sniper', emoji: '🎯' },
    'garcom': { label: 'Garçom', emoji: '🤝' },
    'flash': { label: 'Flash', emoji: '⚡' },
    'lider': { label: 'Líder', emoji: '🧠' },
    'guerreiro': { label: 'Guerreiro', emoji: '🛡️' },
    'avenida': { label: 'Avenida', emoji: '🛣️' },
    'fominha': { label: 'Fominha', emoji: '🍽️' },
    'tijoleiro': { label: 'Pedreiro', emoji: '🏗️' },
    'cone': { label: 'Cone', emoji: '⚠️' }
};

export const JogadoresView: React.FC<JogadoresViewProps> = ({ onBack, userProfile }) => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [activeFilter, setActiveFilter] = useState('Todos');
    
    const [activeTab, setActiveTab] = useState<'matches' | 'info'>('info');
    const [matches, setMatches] = useState<MatchHistoryItem[]>([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

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

        if (activeTab === 'matches') {
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
        }

    }, [activeTab, selectedPlayer]);

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
        setActiveTab('info'); 
        setIsEditing(false);
        setEditFormData({});
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

    const radarStats = selectedPlayer 
        ? calculateStatsFromTags(selectedPlayer.stats_tags) 
        : { ataque: 50, defesa: 50, forca: 50, velocidade: 50, visao: 50 };
    
    const topTags = selectedPlayer?.stats_tags 
        ? Object.entries(selectedPlayer.stats_tags)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .slice(0, 3)
            .map(([key, count]) => ({ key, count: Number(count), ...TAG_META[key] }))
        : [];

    return (
        <div className="animate-fadeIn pb-20">
            {/* Same JSX structure, functionality relies on the updated fetch logic above */}
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                    />
                </div>
            </div>

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

                        <div className="flex border-b border-gray-100 dark:border-gray-700 mb-4 w-full">
                             <button 
                                onClick={() => setActiveTab('info')}
                                className={`flex-1 pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'info' ? 'border-ancb-blue text-ancb-blue dark:text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                Scouting
                            </button>
                            <button 
                                onClick={() => setActiveTab('matches')}
                                className={`flex-1 pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'matches' ? 'border-ancb-blue text-ancb-blue dark:text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                Partidas
                            </button>
                        </div>

                        <div className="w-full">
                            {activeTab === 'info' && (
                                <div className="space-y-4 animate-fadeIn">
                                    {selectedPlayer.badges && selectedPlayer.badges.length > 0 && (
                                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                                            <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
                                                <div className="flex items-center gap-2">
                                                    <LucideMedal className="text-yellow-500" size={18} />
                                                    <h3 className="font-bold text-gray-800 dark:text-white uppercase tracking-wider text-xs">Galeria de Troféus</h3>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                                                {selectedPlayer.badges.map((badge, idx) => {
                                                    const style = getRarityStyles(badge.raridade);
                                                    return (
                                                        <div 
                                                            key={idx} 
                                                            onClick={() => setSelectedBadge(badge)}
                                                            className={`p-2 rounded-lg border flex flex-col items-center text-center shadow-sm cursor-pointer hover:scale-105 transition-transform active:scale-95 ${style.classes}`}
                                                        >
                                                            <span className="text-xl mb-1 drop-shadow-md">{badge.emoji}</span>
                                                            <span className="text-[8px] font-bold leading-tight uppercase line-clamp-2">{badge.nome}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-2 mb-4">
                                            <LucideTrendingUp className="text-ancb-orange" size={18} />
                                            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Atributos (Peer Review)</h3>
                                        </div>
                                        
                                        <div className="mb-6">
                                            <RadarChart stats={radarStats} size={220} />
                                        </div>

                                        {topTags.filter(t => t.count > 0).length > 0 && (
                                            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                                                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 text-center">Principais Características</h4>
                                                <div className="flex justify-center gap-2">
                                                    {topTags.filter(t => t.count > 0).map(tag => (
                                                        <div key={tag.key} className="flex flex-col items-center bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm min-w-[70px]">
                                                            <span className="text-xl mb-1">{tag.emoji}</span>
                                                            <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase">{tag.label}</span>
                                                            <span className="text-[9px] text-ancb-blue font-bold">x{tag.count}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 w-full">
                                        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center">
                                            <LucideCalendarDays className="text-ancb-blue dark:text-blue-400 mb-1" size={20} />
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">Idade</span>
                                            <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                                {selectedPlayer.nascimento ? calculateAge(selectedPlayer.nascimento) : '-'}
                                            </span>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center justify-center">
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Nome</span>
                                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                                                {selectedPlayer.nome}
                                            </span>
                                        </div>
                                    </div>

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
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({...editFormData, nascimento: e.target.value})}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">CPF</label>
                                                        <input 
                                                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                                            value={editFormData.cpf || ''}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({...editFormData, cpf: e.target.value})}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Email Contato</label>
                                                        <input 
                                                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                                            value={editFormData.emailContato || ''}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({...editFormData, emailContato: e.target.value})}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">WhatsApp (Sem formato)</label>
                                                        <input 
                                                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                                            placeholder="5566999999999"
                                                            value={editFormData.telefone || ''}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({...editFormData, telefone: e.target.value})}
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
                                                        <div className="col-span-2">
                                                            <span className="block text-[10px] text-gray-400 uppercase">WhatsApp</span>
                                                            <span className="font-bold">{selectedPlayer.telefone || '-'}</span>
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
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
            
            <Modal isOpen={!!selectedBadge} onClose={() => setSelectedBadge(null)} title="Detalhes da Conquista">
                {selectedBadge && (
                    <div className="text-center p-4">
                        <div className="text-8xl mb-4 animate-bounce-slow drop-shadow-xl">{selectedBadge.emoji}</div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 uppercase tracking-wide">{selectedBadge.nome}</h3>
                        <div className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border ${getRarityStyles(selectedBadge.raridade).classes}`}>
                            {getRarityStyles(selectedBadge.raridade).label}
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600 mb-4">
                            <p className="text-gray-600 dark:text-gray-300 text-sm font-medium leading-relaxed">
                                {selectedBadge.descricao}
                            </p>
                        </div>
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">
                            Conquistado em: {formatDate(selectedBadge.data)}
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
};
