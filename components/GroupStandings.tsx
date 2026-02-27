import React from 'react';
import { Time, Jogo } from '../types';
import { LucideChevronRight, LucideMedal } from 'lucide-react';

interface GroupStandingsProps {
    timesParticipantes: Time[];
    games: Jogo[];
    format: 'chaveamento' | 'grupo_unico';
    qualifiersPerGroup?: number; // Quantos times avançam de cada grupo (padrão: 2)
}

interface TeamStanding {
    team: Time;
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
    pointsFor: number;
    pointsAgainst: number;
    pointBalance: number;
    totalPoints: number;
    qualifies: boolean;
    position: number;
}

interface GroupData {
    name: string;
    standings: TeamStanding[];
}

export const GroupStandings: React.FC<GroupStandingsProps> = ({
    timesParticipantes,
    games,
    format,
    qualifiersPerGroup = 2
}) => {
    // Group teams by 'grupo' field
    const getGroupedTeams = () => {
        const grouped: Record<string, Time[]> = {};
        
        timesParticipantes.forEach(team => {
            const groupName = team.grupo || 'Sem Grupo';
            if (!grouped[groupName]) {
                grouped[groupName] = [];
            }
            grouped[groupName].push(team);
        });

        return grouped;
    };

    // Calculate standings for a group of teams
    const calculateGroupStandings = (groupTeams: Time[]): TeamStanding[] => {
        return groupTeams
            .map(team => {
                const teamGames = games.filter(
                    g => g.status === 'finalizado' && (g.timeA_id === team.id || g.timeB_id === team.id)
                );

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
                const totalPoints = wins * 2 + draws * 1;

                return {
                    team,
                    gamesPlayed: teamGames.length,
                    wins,
                    losses,
                    draws,
                    pointsFor,
                    pointsAgainst,
                    pointBalance,
                    totalPoints,
                    qualifies: false,
                    position: 0
                };
            })
            .sort((a, b) => {
                if (b.totalPoints !== a.totalPoints) {
                    return b.totalPoints - a.totalPoints;
                }
                return b.pointBalance - a.pointBalance;
            })
            .map((standing, idx) => ({
                ...standing,
                position: idx + 1,
                qualifies: idx < qualifiersPerGroup
            }));
    };

    const groupedTeams = getGroupedTeams();
    const sortedGroupNames = Object.keys(groupedTeams).sort();
    const groupsData: GroupData[] = sortedGroupNames.map(groupName => ({
        name: groupName,
        standings: calculateGroupStandings(groupedTeams[groupName])
    }));

    if (sortedGroupNames.length === 0) {
        return (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">Nenhum time cadastrado.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {groupsData.map((group) => (
                <div key={group.name} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Group Header */}
                    <div className="bg-gradient-to-r from-ancb-blue to-blue-600 text-white px-6 py-4 font-bold text-lg uppercase tracking-wider flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black">
                            {group.name.charAt(0)}
                        </div>
                        {group.name}
                        <span className="text-sm font-normal opacity-75 ml-auto">
                            ({group.standings.length} times)
                        </span>
                    </div>

                    {/* Table */}
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 font-bold uppercase text-xs border-b border-gray-200 dark:border-gray-600">
                            <tr>
                                <th className="p-4">Pos</th>
                                <th className="p-4">Time</th>
                                <th className="p-4 text-center">J</th>
                                <th className="p-4 text-center">V</th>
                                <th className="p-4 text-center">E</th>
                                <th className="p-4 text-center">D</th>
                                <th className="p-4 text-center">Saldo</th>
                                <th className="p-4 text-center font-black">Pts</th>
                                <th className="p-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {group.standings.map((standing) => (
                                <tr
                                    key={standing.team.id}
                                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                                        standing.qualifies
                                            ? 'bg-green-50 dark:bg-green-900/10 border-l-4 border-green-500'
                                            : ''
                                    }`}
                                >
                                    <td className="p-4 font-black text-center text-ancb-orange text-lg">
                                        {standing.position}º
                                    </td>
                                    <td className="p-4 font-bold text-gray-800 dark:text-gray-200 flex items-center gap-3">
                                        {standing.team.logoUrl ? (
                                            <img
                                                src={standing.team.logoUrl}
                                                alt={standing.team.nomeTime}
                                                className="w-8 h-8 object-contain"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-ancb-blue dark:text-blue-300 font-bold text-xs">
                                                {standing.team.nomeTime.charAt(0)}
                                            </div>
                                        )}
                                        <span className="truncate">{standing.team.nomeTime}</span>
                                    </td>
                                    <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                                        {standing.gamesPlayed}
                                    </td>
                                    <td className="p-4 text-center text-green-600 dark:text-green-400 font-bold">
                                        {standing.wins}
                                    </td>
                                    <td className="p-4 text-center text-yellow-600 dark:text-yellow-400 font-bold">
                                        {standing.draws}
                                    </td>
                                    <td className="p-4 text-center text-red-600 dark:text-red-400 font-bold">
                                        {standing.losses}
                                    </td>
                                    <td className="p-4 text-center font-semibold">
                                        <span
                                            className={
                                                standing.pointBalance >= 0
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-red-600 dark:text-red-400'
                                            }
                                        >
                                            {standing.pointBalance >= 0 ? '+' : ''}
                                            {standing.pointBalance}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center font-black text-ancb-blue text-lg">
                                        {standing.totalPoints}
                                    </td>
                                    <td className="p-4 text-center">
                                        {standing.qualifies ? (
                                            <div className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                <LucideChevronRight size={14} />
                                                Avança
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Qualifiers Info */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 flex items-center gap-2">
                        <LucideMedal size={14} className="text-green-500" />
                        <span>
                            Os <strong>{qualifiersPerGroup}</strong> primeiros colocados avançam para a próxima fase
                        </span>
                    </div>
                </div>
            ))}

            {/* Qualified Teams Summary */}

        </div>
    );
};
