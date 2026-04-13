import React, { useEffect, useMemo, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { LucideAward, LucideLoader2, LucideMedal, LucideTrophy, LucideUsers } from 'lucide-react';
import { db } from '../services/firebase';
import { Cesta, Evento, Jogo, Player, RosterEntry } from '../types';

interface EventScorersTabProps {
    event: Evento;
    eventId: string;
    games: Jogo[];
    allPlayers: Player[];
    roster: RosterEntry[];
    onOpenPlayer?: (playerId: string) => void;
}

interface ScorerRow {
    playerId: string;
    playerName: string;
    playerPhoto?: string;
    totalPoints: number;
    c1: number;
    c2: number;
    c3: number;
    gamesPlayed: number;
}

interface ScorerAgg {
    playerId: string;
    playerName: string;
    totalPoints: number;
    c1: number;
    c2: number;
    c3: number;
    games: Set<string>;
}

export const EventScorersTab: React.FC<EventScorersTabProps> = ({ event, eventId, games, allPlayers, roster, onOpenPlayer }) => {
    const [loading, setLoading] = useState(true);
    const [scorers, setScorers] = useState<ScorerRow[]>([]);

    const playerById = useMemo(() => {
        const map = new Map<string, Player>();
        allPlayers.forEach(player => map.set(player.id, player));
        return map;
    }, [allPlayers]);

    const ancbPlayerIds = useMemo(() => {
        if (event.type === 'torneio_externo') {
            const teams = event.timesParticipantes || [];
            const ancbTeams = teams.filter(team => team.isANCB || (team.nomeTime || '').toUpperCase().includes('ANCB'));
            const sourceTeams = ancbTeams.length > 0 ? ancbTeams : teams;
            return new Set(sourceTeams.flatMap(team => team.jogadores || []));
        }

        if (event.type === 'torneio_interno') {
            return new Set((event.times || []).flatMap(team => team.jogadores || []));
        }

        const rosterIds = roster.filter(entry => entry.status !== 'recusado').map(entry => entry.playerId);
        if (rosterIds.length > 0) {
            return new Set(rosterIds);
        }

        const legacyIds = (event.jogadoresEscalados || [])
            .map(entry => (typeof entry === 'string' ? entry : entry?.id))
            .filter((id): id is string => !!id);
        return new Set(legacyIds);
    }, [event, roster]);

    useEffect(() => {
        const fetchScorers = async () => {
            setLoading(true);
            try {
                const playableGames = games.filter(game => game.status !== 'agendado');
                if (playableGames.length === 0) {
                    setScorers([]);
                    return;
                }

                const acc = new Map<string, ScorerAgg>();

                for (const game of playableGames) {
                    const cestasSnap = await getDocs(collection(db, 'eventos', eventId, 'jogos', game.id, 'cestas'));
                    cestasSnap.forEach(docSnap => {
                        const basket = docSnap.data() as Cesta;
                        const playerId = basket.jogadorId || undefined;
                        if (!playerId) return;

                        if (ancbPlayerIds.size > 0 && !ancbPlayerIds.has(playerId)) return;

                        const points = Number(basket.pontos) || 0;
                        if (!acc.has(playerId)) {
                            acc.set(playerId, {
                                playerId,
                                playerName: basket.nomeJogador || 'Jogador',
                                totalPoints: 0,
                                c1: 0,
                                c2: 0,
                                c3: 0,
                                games: new Set<string>()
                            });
                        }

                        const current = acc.get(playerId)!;
                        current.totalPoints += points;
                        current.games.add(game.id);
                        if (points === 1) current.c1 += 1;
                        if (points === 2) current.c2 += 1;
                        if (points === 3) current.c3 += 1;

                        const player = playerById.get(playerId);
                        if (player) {
                            current.playerName = player.apelido || player.nome || current.playerName;
                        } else if (basket.nomeJogador) {
                            current.playerName = basket.nomeJogador;
                        }
                    });
                }

                const rows = Array.from(acc.values())
                    .map(item => {
                        const player = playerById.get(item.playerId);
                        return {
                            playerId: item.playerId,
                            playerName: player?.apelido || player?.nome || item.playerName,
                            playerPhoto: player?.foto,
                            totalPoints: item.totalPoints,
                            c1: item.c1,
                            c2: item.c2,
                            c3: item.c3,
                            gamesPlayed: item.games.size
                        };
                    })
                    .sort((a, b) => {
                        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
                        if (a.gamesPlayed !== b.gamesPlayed) return a.gamesPlayed - b.gamesPlayed;
                        return a.playerName.localeCompare(b.playerName);
                    });

                setScorers(rows);
            } catch (error) {
                console.error('Erro ao carregar pontuadores do evento:', error);
                setScorers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchScorers();
    }, [games, eventId, ancbPlayerIds, playerById]);

    const top3 = scorers.slice(0, 3);
    const tableScorers = scorers.slice(3);

    return (
        <div className="space-y-6">
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <LucideLoader2 className="animate-spin text-ancb-orange" />
                </div>
            ) : scorers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 py-12 text-center text-gray-500">
                    Nenhum pontuador ANCB encontrado neste evento ainda.
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {top3.map((item, index) => {
                            const rank = index + 1;
                            const rankStyles =
                                rank === 1
                                    ? 'from-yellow-500/20 to-yellow-300/10 border-yellow-400/40'
                                    : rank === 2
                                    ? 'from-gray-300/20 to-gray-100/10 border-gray-400/30'
                                    : 'from-orange-500/20 to-orange-300/10 border-orange-400/30';

                            return (
                                <button
                                    type="button"
                                    key={item.playerId}
                                    onClick={() => onOpenPlayer?.(item.playerId)}
                                    className={`w-full text-left rounded-2xl border bg-gradient-to-br ${rankStyles} p-4 ${onOpenPlayer ? 'cursor-pointer hover:brightness-110 transition' : 'cursor-default'}`}
                                    disabled={!onOpenPlayer}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs uppercase tracking-widest font-bold text-gray-500">#{rank}</span>
                                        {rank === 1 && <LucideTrophy size={18} className="text-yellow-500" />}
                                        {rank === 2 && <LucideMedal size={18} className="text-gray-500" />}
                                        {rank === 3 && <LucideAward size={18} className="text-orange-500" />}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                                            {item.playerPhoto ? (
                                                <img src={item.playerPhoto} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-bold text-sm text-gray-500">{item.playerName.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{item.playerName}</p>
                                            <p className="text-xs text-gray-500">{item.gamesPlayed} jogos</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-right">
                                        <span className="text-3xl font-black text-ancb-orange">{item.totalPoints}</span>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">pontos</p>
                                    </div>
                                    <div className="mt-2 flex items-center justify-end gap-2 text-[10px] font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        <span>3PT: {item.c3}</span>
                                        <span>2PT: {item.c2}</span>
                                        <span>1PT: {item.c1}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                            <LucideUsers size={16} className="text-ancb-blue" />
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Ranking Completo</h4>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="p-3">Pos</th>
                                        <th className="p-3">Jogador</th>
                                        <th className="p-3 text-center">Pts</th>
                                        <th className="p-3 text-center">J</th>
                                        <th className="p-3 text-center">3PT</th>
                                        <th className="p-3 text-center">2PT</th>
                                        <th className="p-3 text-center">1PT</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {tableScorers.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-4 text-center text-gray-500 dark:text-gray-400">
                                                Sem outros pontuadores alem do podio.
                                            </td>
                                        </tr>
                                    ) : tableScorers.map((item, index) => (
                                        <tr key={item.playerId} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                                            <td className="p-3 font-black text-ancb-orange">{index + 4}</td>
                                            <td className="p-3 font-bold text-gray-800 dark:text-gray-200">
                                                {onOpenPlayer ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => onOpenPlayer(item.playerId)}
                                                        className="hover:underline"
                                                    >
                                                        {item.playerName}
                                                    </button>
                                                ) : (
                                                    item.playerName
                                                )}
                                            </td>
                                            <td className="p-3 text-center font-black text-ancb-blue">{item.totalPoints}</td>
                                            <td className="p-3 text-center">{item.gamesPlayed}</td>
                                            <td className="p-3 text-center">{item.c3}</td>
                                            <td className="p-3 text-center">{item.c2}</td>
                                            <td className="p-3 text-center">{item.c1}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
