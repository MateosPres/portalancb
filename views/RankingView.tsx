import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Player, Cesta, Evento, Jogo } from '../types';
import { Button } from '../components/Button';
import { LucideArrowLeft, LucideTrophy, LucideCalendarRange, LucideFilter } from 'lucide-react';

interface RankingViewProps {
    onBack: () => void;
}

interface PlayerStats extends Player {
    totalPoints: number;
    ppg: number;
    gamesPlayed: number;
}

export const RankingView: React.FC<RankingViewProps> = ({ onBack }) => {
    const [stats, setStats] = useState<PlayerStats[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    // Default to current year, but ensure it's at least 2025
    const currentYear = new Date().getFullYear().toString();
    const defaultYear = parseInt(currentYear) < 2025 ? "2025" : currentYear;
    
    const [selectedYear, setSelectedYear] = useState<string>(defaultYear);
    const [selectedMode, setSelectedMode] = useState<'3x3' | '5x5'>('5x5');

    useEffect(() => {
        const fetchRankingData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Players
                const playersSnapshot = await getDocs(collection(db, "jogadores"));
                const playersMap: Record<string, Player> = {};
                playersSnapshot.forEach(doc => {
                    playersMap[doc.id] = { id: doc.id, ...doc.data() } as Player;
                });

                // 2. Prepare Data Structures
                const validContextIds = new Set<string>(); 
                const processedCestaIds = new Set<string>();
                
                // Track unique game IDs per player to calculate games played correctly
                const playerGamesMap: Record<string, Set<string>> = {};

                const pointsMap: Record<string, number> = {};

                // Initialize player sets
                Object.keys(playersMap).forEach(pid => {
                    playerGamesMap[pid] = new Set();
                });

                // 3. Fetch Events (Filtered by Year and Mode)
                const eventosSnapshot = await getDocs(collection(db, "eventos"));
                const filteredEvents: Evento[] = [];

                eventosSnapshot.forEach(doc => {
                    const evento = doc.data() as Evento;
                    const eventId = doc.id;
                    
                    // --- ROBUST DATE PARSING ---
                    const rawDate = String(evento.data || '');
                    let isYearMatch = false;

                    if (rawDate.includes(selectedYear)) {
                        isYearMatch = true;
                    } else if (selectedYear.length === 4) {
                        const shortYear = selectedYear.slice(2);
                        if (rawDate.endsWith('/' + shortYear) || rawDate.endsWith('-' + shortYear)) {
                            isYearMatch = true;
                        }
                    }

                    if (!isYearMatch) return;
                    if (evento.modalidade !== selectedMode) return;
                    
                    const status = evento.status ? evento.status.toLowerCase() : '';
                    if (status !== 'finalizado') return;

                    filteredEvents.push({ ...evento, id: eventId });
                    
                    // Add basic Context IDs
                    validContextIds.add(eventId);
                    if (evento.times && Array.isArray(evento.times)) {
                        evento.times.forEach(time => {
                            if (time.id) validContextIds.add(time.id);
                        });
                    }
                });

                // 4. Process Games (Jogos) & Sub-collections
                await Promise.all(filteredEvents.map(async (evento) => {
                    try {
                        const gamesRef = collection(db, "eventos", evento.id, "jogos");
                        const gamesSnap = await getDocs(gamesRef);
                        
                        if (!gamesSnap.empty) {
                            // Process valid games
                            const gamePromises = gamesSnap.docs.map(async (gDoc) => {
                                const game = gDoc.data() as Jogo;
                                const gameId = gDoc.id;
                                validContextIds.add(gameId); 

                                // Count Participation from Game Roster
                                if (game.jogadoresEscalados && Array.isArray(game.jogadoresEscalados)) {
                                    game.jogadoresEscalados.forEach(pid => {
                                        if (playerGamesMap[pid]) {
                                            playerGamesMap[pid].add(gameId);
                                        }
                                    });
                                }

                                // FETCH SUB-COLLECTION CESTAS
                                try {
                                    const subCestasRef = collection(db, "eventos", evento.id, "jogos", gameId, "cestas");
                                    const subCestasSnap = await getDocs(subCestasRef);
                                    subCestasSnap.forEach(cDoc => {
                                        const cesta = { id: cDoc.id, ...cDoc.data() } as Cesta;
                                        if (processedCestaIds.has(cesta.id)) return;

                                        if (cesta.jogadorId && cesta.pontos) {
                                            pointsMap[cesta.jogadorId] = (pointsMap[cesta.jogadorId] || 0) + Number(cesta.pontos);
                                            // If player scored, they played this game
                                            if (playerGamesMap[cesta.jogadorId]) {
                                                playerGamesMap[cesta.jogadorId].add(gameId);
                                            }
                                            processedCestaIds.add(cesta.id);
                                        }
                                    });
                                } catch (err) {
                                    // Ignore
                                }
                            });
                            await Promise.all(gamePromises);
                        } else {
                            // Legacy Event Participation (no games collection)
                            // Treat the event ID as the game ID for counting purposes
                            if (evento.jogadoresEscalados && Array.isArray(evento.jogadoresEscalados)) {
                                evento.jogadoresEscalados.forEach(pid => {
                                    if (playerGamesMap[pid]) {
                                        playerGamesMap[pid].add(evento.id);
                                    }
                                });
                            }
                        }
                    } catch (e) {
                        console.warn(`Could not fetch games for event ${evento.id}`, e);
                    }
                }));

                // 5. Fetch Cestas from ROOT collection (Legacy)
                const cestasSnapshot = await getDocs(collection(db, "cestas"));
                
                cestasSnapshot.forEach(doc => {
                    const cesta = { id: doc.id, ...doc.data() } as Cesta;
                    if (processedCestaIds.has(cesta.id)) return;

                    const isLinkedToTeam = cesta.timeId && validContextIds.has(cesta.timeId);
                    const isLinkedToGame = cesta.jogoId && validContextIds.has(cesta.jogoId);
                    const isLinkedToEvent = cesta.eventoId && validContextIds.has(cesta.eventoId);

                    if (cesta.jogadorId && cesta.pontos && (isLinkedToTeam || isLinkedToGame || isLinkedToEvent)) {
                        pointsMap[cesta.jogadorId] = (pointsMap[cesta.jogadorId] || 0) + Number(cesta.pontos);
                        
                        // Count game participation for legacy baskets
                        if (playerGamesMap[cesta.jogadorId]) {
                            const contextId = cesta.jogoId || cesta.eventoId || 'unknown';
                            if (contextId !== 'unknown') {
                                playerGamesMap[cesta.jogadorId].add(contextId);
                            }
                        }
                        processedCestaIds.add(cesta.id);
                    }
                });

                // 6. Merge & Calculate
                const rankingList: PlayerStats[] = Object.values(playersMap).map(player => {
                    const totalPoints = pointsMap[player.id] || 0;
                    // Count unique games found in the Set
                    const gamesPlayed = playerGamesMap[player.id] ? playerGamesMap[player.id].size : 0; 
                    const ppg = gamesPlayed > 0 ? Number((totalPoints / gamesPlayed).toFixed(1)) : 0;

                    return {
                        ...player,
                        totalPoints,
                        gamesPlayed,
                        ppg
                    };
                });

                // 7. Sort
                const sorted = rankingList.sort((a, b) => {
                    if (b.totalPoints !== a.totalPoints) {
                        return b.totalPoints - a.totalPoints;
                    }
                    return a.gamesPlayed - b.gamesPlayed;
                });
                
                setStats(sorted);

            } catch (error) {
                console.error("Error fetching ranking:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRankingData();
    }, [selectedYear, selectedMode]);

    return (
        <div className="animate-fadeIn pb-20">
            {/* Header & Controls */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 sticky top-[70px] z-30 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Button variant="secondary" size="sm" onClick={onBack} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                            <LucideArrowLeft size={18} />
                        </Button>
                        <h2 className="text-xl font-bold text-ancb-blue dark:text-blue-400">Ranking</h2>
                    </div>
                    
                    {/* Season Selector */}
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600">
                        <LucideCalendarRange size={16} className="text-gray-400 dark:text-gray-300"/>
                        <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="bg-transparent text-sm font-bold text-gray-700 dark:text-white focus:outline-none cursor-pointer"
                        >
                            <option value="2025" className="text-black">2025</option>
                            <option value="2026" className="text-black">2026</option>
                        </select>
                    </div>
                </div>

                {/* Mode Toggles */}
                <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <button
                        onClick={() => setSelectedMode('5x5')}
                        className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${
                            selectedMode === '5x5' 
                            ? 'bg-ancb-orange text-white shadow-sm' 
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                    >
                        Basquete 5x5
                    </button>
                    <button
                        onClick={() => setSelectedMode('3x3')}
                        className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${
                            selectedMode === '3x3' 
                            ? 'bg-ancb-orange text-white shadow-sm' 
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                    >
                        FIBA 3x3
                    </button>
                </div>
                
                <div className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400 bg-blue-50/50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-center justify-center gap-1 font-bold text-ancb-blue dark:text-blue-400 mb-1">
                        <LucideFilter size={12} />
                        Regras de Pontuação ({selectedMode})
                    </div>
                    {selectedMode === '3x3' 
                        ? 'Lance Livre (1pt) • Dentro (1pt) • Fora (2pts)' 
                        : 'Lance Livre (1pt) • Dentro (2pts) • Fora (3pts)'}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ancb-orange"></div>
                </div>
            ) : stats.length === 0 || stats[0]?.totalPoints === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mx-4">
                    <LucideTrophy className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">Ranking indisponível</h3>
                    <p className="text-gray-500 dark:text-gray-400 px-6">Nenhum dado encontrado para {selectedMode} em {selectedYear}.</p>
                </div>
            ) : (
                <>
                    {/* PODIUM SECTION */}
                    {/* Increased margin top from mt-8 to mt-14 to avoid clipping with the header */}
                    <div className="flex justify-center items-end gap-2 md:gap-6 mb-12 px-2 mt-14">
                        {/* 2nd Place */}
                        {stats[1] && stats[1].totalPoints > 0 && (
                            <div className="flex flex-col items-center w-1/3 md:w-32 order-1">
                                <div className="relative mb-2">
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-4 border-gray-300 shadow-lg bg-gray-200 dark:bg-gray-700">
                                        {stats[1].foto ? (
                                            <img src={stats[1].foto} alt="" className="w-full h-full object-cover"/>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-400">
                                                {stats[1].nome.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-300 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
                                        2º
                                    </div>
                                </div>
                                <h4 className="font-bold text-gray-700 dark:text-gray-200 text-sm text-center line-clamp-1">{stats[1].apelido || stats[1].nome}</h4>
                                <p className="text-ancb-orange font-bold text-sm">{stats[1].totalPoints} pts</p>
                            </div>
                        )}

                        {/* 1st Place */}
                        {stats[0] && stats[0].totalPoints > 0 && (
                            <div className="flex flex-col items-center w-1/3 md:w-40 order-2 -mt-6">
                                <div className="relative mb-3">
                                    {/* UPDATED TROPHY POSITION: Right and Lower - Outline Style */}
                                    <LucideTrophy 
                                        className="absolute -top-3 -right-2 text-yellow-400 drop-shadow-md animate-bounce z-20" 
                                        size={36}
                                    />
                                    
                                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-yellow-400 shadow-xl ring-4 ring-yellow-100 dark:ring-yellow-900 bg-gray-200 dark:bg-gray-700 relative z-10">
                                        {stats[0].foto ? (
                                            <img src={stats[0].foto} alt="" className="w-full h-full object-cover"/>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
                                                {stats[0].nome.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md z-20">
                                        1º
                                    </div>
                                </div>
                                <h4 className="font-bold text-gray-800 dark:text-white text-lg text-center line-clamp-1">{stats[0].apelido || stats[0].nome}</h4>
                                <p className="text-ancb-orange font-bold text-xl">{stats[0].totalPoints} pts</p>
                                <p className="text-gray-400 dark:text-gray-500 text-xs font-medium">{stats[0].ppg} PPG</p>
                            </div>
                        )}

                        {/* 3rd Place */}
                        {stats[2] && stats[2].totalPoints > 0 && (
                            <div className="flex flex-col items-center w-1/3 md:w-32 order-3">
                                <div className="relative mb-2">
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-4 border-orange-300 shadow-lg bg-gray-200 dark:bg-gray-700">
                                        {stats[2].foto ? (
                                            <img src={stats[2].foto} alt="" className="w-full h-full object-cover"/>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-400">
                                                {stats[2].nome.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-300 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
                                        3º
                                    </div>
                                </div>
                                <h4 className="font-bold text-gray-700 dark:text-gray-200 text-sm text-center line-clamp-1">{stats[2].apelido || stats[2].nome}</h4>
                                <p className="text-ancb-orange font-bold text-sm">{stats[2].totalPoints} pts</p>
                            </div>
                        )}
                    </div>

                    {/* REST OF THE LIST */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mx-2 md:mx-0 transition-colors">
                        <div className="grid grid-cols-12 bg-gray-50 dark:bg-gray-700 p-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            <div className="col-span-2 text-center">Pos</div>
                            <div className="col-span-6">Atleta</div>
                            <div className="col-span-2 text-center">Jogos</div>
                            <div className="col-span-2 text-center">Pts</div>
                        </div>
                        
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {stats.slice(3).map((player, index) => (
                                player.totalPoints > 0 && (
                                    <div key={player.id} className="grid grid-cols-12 p-4 items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <div className="col-span-2 text-center font-bold text-gray-400">
                                            {index + 4}º
                                        </div>
                                        <div className="col-span-6 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden hidden sm:flex items-center justify-center">
                                                {player.foto ? (
                                                    <img src={player.foto} className="w-full h-full object-cover"/>
                                                ) : (
                                                    <span className="text-xs font-bold text-gray-400">{player.nome.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{player.apelido || player.nome}</p>
                                                <p className="text-[10px] text-gray-400 uppercase">{player.posicao}</p>
                                            </div>
                                        </div>
                                        <div className="col-span-2 text-center text-sm text-gray-500 dark:text-gray-400">
                                            {player.gamesPlayed}
                                        </div>
                                        <div className="col-span-2 text-center font-bold text-ancb-blue dark:text-blue-400">
                                            {player.totalPoints}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};