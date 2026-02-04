import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Player, Evento, Jogo, Cesta } from '../types';
import { PlayerCard } from '../components/PlayerCard';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { LucideSearch, LucideArrowLeft, LucideUsers, LucideRuler, LucideCalendarDays, LucideShirt, LucideChevronDown, LucideChevronUp, LucideGamepad2 } from 'lucide-react';

interface JogadoresViewProps {
    onBack: () => void;
}

interface GameDetail {
    id: string;
    date: string;
    eventName: string;
    opponent: string;
    points: number;
}

interface PlayerYearStats {
    year: string;
    points: number;
    games: number;
    ppg: string;
    matches: GameDetail[];
}

export const JogadoresView: React.FC<JogadoresViewProps> = ({ onBack }) => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPos, setFilterPos] = useState<string>('todos');
    
    // State for Modal
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [playerStats, setPlayerStats] = useState<PlayerYearStats[]>([]);
    const [loadingStats, setLoadingStats] = useState(false);
    const [expandedYear, setExpandedYear] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, "jogadores"), orderBy("nome"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
            setPlayers(data);
            setFilteredPlayers(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let result = players;

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(p => 
                p.nome.toLowerCase().includes(lowerTerm) || 
                (p.apelido && p.apelido.toLowerCase().includes(lowerTerm)) ||
                p.numero_uniforme.toString() === lowerTerm
            );
        }

        if (filterPos !== 'todos') {
            result = result.filter(p => p.posicao.toLowerCase().includes(filterPos));
        }

        setFilteredPlayers(result);
    }, [searchTerm, filterPos, players]);

    // FETCH PLAYER STATS WHEN SELECTED
    useEffect(() => {
        const fetchStats = async () => {
            if (!selectedPlayer) return;
            setLoadingStats(true);
            setPlayerStats([]);
            setExpandedYear(null);

            try {
                // Data buckets by year
                const yearData: Record<string, { points: number, games: number, matches: GameDetail[] }> = {
                    '2025': { points: 0, games: 0, matches: [] },
                    '2026': { points: 0, games: 0, matches: [] }
                };

                const processedCestaIds = new Set<string>();

                // 1. Fetch ALL Events to map dates and get games
                const eventsSnap = await getDocs(collection(db, "eventos"));
                
                // We use a classic for loop to handle async properly and sequentially if needed
                for (const doc of eventsSnap.docs) {
                    const evento = doc.data() as Evento;
                    const eventId = doc.id;
                    const eventDate = evento.data || "";
                    
                    let year = eventDate.split('-')[0]; // Assuming YYYY-MM-DD
                    if (!year || year.length !== 4) year = "2025"; // Fallback
                    
                    // Skip if not in our tracking range
                    if (!yearData[year]) continue;

                    // Fetch Games for this Event
                    const gamesRef = collection(db, "eventos", eventId, "jogos");
                    const gamesSnap = await getDocs(gamesRef);

                    // Iterate Games in this Event
                    for (const gDoc of gamesSnap.docs) {
                        const game = gDoc.data() as Jogo;
                        const gameId = gDoc.id;
                        let gamePoints = 0;

                        // A. Fetch Sub-collection Cestas
                        const subCestasRef = collection(db, "eventos", eventId, "jogos", gameId, "cestas");
                        const qSub = query(subCestasRef, where("jogadorId", "==", selectedPlayer.id));
                        const subSnap = await getDocs(qSub);
                        
                        subSnap.forEach(cDoc => {
                            const cesta = cDoc.data() as Cesta;
                            if (!processedCestaIds.has(cDoc.id)) {
                                gamePoints += Number(cesta.pontos || 0);
                                processedCestaIds.add(cDoc.id);
                            }
                        });

                        // B. Fetch Root Cestas (Legacy/Migrated linked to this game)
                        const qRoot = query(collection(db, "cestas"), where("jogoId", "==", gameId), where("jogadorId", "==", selectedPlayer.id));
                        const rootSnap = await getDocs(qRoot);
                        
                        rootSnap.forEach(cDoc => {
                            const cesta = cDoc.data() as Cesta;
                            if (!processedCestaIds.has(cDoc.id)) {
                                gamePoints += Number(cesta.pontos || 0);
                                processedCestaIds.add(cDoc.id);
                            }
                        });

                        // CHECK PARTICIPATION
                        // Player played if: explicitly in roster OR scored points
                        const isInRoster = game.jogadoresEscalados?.includes(selectedPlayer.id);
                        const hasPoints = gamePoints > 0;

                        if (isInRoster || hasPoints) {
                            yearData[year].games += 1;
                            yearData[year].points += gamePoints;
                            
                            // Determine opponent name
                            let opponentName = "Adversário";
                            if (game.timeA_nome && game.timeB_nome) {
                                // Internal Game
                                opponentName = `${game.timeA_nome} vs ${game.timeB_nome}`;
                            } else {
                                opponentName = game.adversario || "Adversário";
                            }

                            yearData[year].matches.push({
                                id: gameId,
                                date: game.dataJogo || evento.data,
                                eventName: evento.nome,
                                opponent: opponentName,
                                points: gamePoints
                            });
                        }
                    }
                }

                // 2. Transform to Array and Sort Matches
                const statsArray: PlayerYearStats[] = Object.entries(yearData)
                    .map(([year, data]) => ({
                        year,
                        points: data.points,
                        games: data.games,
                        ppg: data.games > 0 ? (data.points / data.games).toFixed(1) : "0.0",
                        matches: data.matches.sort((a, b) => b.date.localeCompare(a.date)) // Newest games first
                    }))
                    .sort((a, b) => Number(b.year) - Number(a.year)); // Newest year first

                setPlayerStats(statsArray);

            } catch (err) {
                console.error("Error fetching player stats:", err);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchStats();
    }, [selectedPlayer]);

    const toggleYear = (year: string) => {
        if (expandedYear === year) {
            setExpandedYear(null);
        } else {
            setExpandedYear(year);
        }
    };

    return (
        <div className="animate-fadeIn pb-20">
            {/* Header / Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 sticky top-[70px] z-30 border border-gray-100 dark:border-gray-700 transition-colors">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button variant="secondary" size="sm" onClick={onBack} className="!px-3 text-gray-500 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <LucideArrowLeft size={18} />
                        </Button>
                        <h2 className="text-2xl font-bold text-ancb-blue dark:text-blue-400">Elenco</h2>
                    </div>
                    
                    <div className="relative w-full md:w-64">
                        <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar atleta..." 
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ancb-blueLight/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {['todos', 'armador', 'ala', 'pivô'].map(pos => (
                        <button
                            key={pos}
                            onClick={() => setFilterPos(pos)}
                            className={`
                                px-4 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors
                                ${filterPos === pos 
                                    ? 'bg-ancb-blue text-white shadow-md' 
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
                            `}
                        >
                            {pos}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ancb-blue"></div>
                </div>
            ) : filteredPlayers.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredPlayers.map(player => (
                        <PlayerCard 
                            key={player.id} 
                            player={player} 
                            onClick={() => setSelectedPlayer(player)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-gray-400 dark:text-gray-500">
                    <div className="mb-3 flex justify-center"><LucideUsers size={48} className="opacity-20" /></div>
                    <p>Nenhum jogador encontrado.</p>
                </div>
            )}

            {/* Player Details Modal */}
            <Modal 
                isOpen={!!selectedPlayer} 
                onClose={() => setSelectedPlayer(null)}
                title="Ficha do Atleta"
            >
                {selectedPlayer && (
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full border-4 border-ancb-orange shadow-lg overflow-hidden mb-4 bg-gray-200 dark:bg-gray-700">
                            {selectedPlayer.foto ? (
                                <img src={selectedPlayer.foto} alt={selectedPlayer.nome} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400 dark:text-gray-500">
                                    {selectedPlayer.nome.charAt(0)}
                                </div>
                            )}
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {selectedPlayer.apelido || selectedPlayer.nome}
                        </h2>
                        <span className="bg-ancb-blue text-white px-3 py-1 rounded-full text-sm font-bold uppercase mb-6">
                            {selectedPlayer.posicao}
                        </span>

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center">
                                <LucideShirt className="text-ancb-orange mb-2" size={24} />
                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Número</span>
                                <span className="text-xl font-bold text-gray-800 dark:text-gray-200">#{selectedPlayer.numero_uniforme}</span>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center">
                                <LucideCalendarDays className="text-ancb-blue dark:text-blue-400 mb-2" size={24} />
                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Idade</span>
                                <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                    {selectedPlayer.nascimento ? 
                                        new Date().getFullYear() - new Date(selectedPlayer.nascimento).getFullYear() : 
                                        '-'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 w-full bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/40">
                            <h4 className="text-ancb-blue dark:text-blue-400 font-bold mb-4 text-sm uppercase flex items-center gap-2">
                                <LucideRuler size={16} /> Estatísticas por Temporada
                            </h4>
                            
                            {loadingStats ? (
                                <div className="flex justify-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-ancb-blue"></div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {playerStats.map((stat) => (
                                        <div key={stat.year} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-blue-100 dark:border-gray-700 overflow-hidden transition-colors">
                                            {/* Accordion Header */}
                                            <div 
                                                className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                onClick={() => toggleYear(stat.year)}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500">TEMPORADA</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg font-bold text-ancb-blue dark:text-blue-400">{stat.year}</span>
                                                        {expandedYear === stat.year ? <LucideChevronUp size={16} className="text-gray-400"/> : <LucideChevronDown size={16} className="text-gray-400"/>}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex gap-4 md:gap-6">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase">Jogos</span>
                                                        <span className="font-bold text-gray-800 dark:text-white">{stat.games}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase">Pontos</span>
                                                        <span className="font-bold text-gray-800 dark:text-white">{stat.points}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase">Média</span>
                                                        <span className="font-bold text-ancb-orange">{stat.ppg}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Accordion Content (Matches List) */}
                                            {expandedYear === stat.year && (
                                                <div className="bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 p-2 md:p-3 animate-slideDown">
                                                    {stat.matches.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {stat.matches.map((match) => (
                                                                <div key={match.id} className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm">
                                                                    <div className="flex flex-col overflow-hidden">
                                                                        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                                                                            <span>{match.date.split('-').reverse().slice(0, 2).join('/')}</span>
                                                                            <span>•</span>
                                                                            <span className="truncate max-w-[100px]">{match.eventName}</span>
                                                                        </div>
                                                                        <span className="font-medium text-gray-700 dark:text-gray-200 truncate">{match.opponent}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 pl-2">
                                                                         <span className="font-bold text-ancb-blue dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded text-xs whitespace-nowrap">
                                                                            {match.points} pts
                                                                         </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-2 text-gray-400 text-xs">
                                                            Detalhes não disponíveis.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    
                                    {playerStats.every(s => s.games === 0) && (
                                        <div className="text-center text-xs text-gray-400 py-2">
                                            Nenhum registro encontrado nas temporadas ativas.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};