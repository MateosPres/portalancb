import React from 'react';
import { Time, Jogo } from '../types';
import { getGroupedStandings } from '../utils/standings';

interface GroupStandingsProps {
    timesParticipantes: Time[];
    games: Jogo[];
    format: 'chaveamento' | 'grupo_unico';
    qualifiersPerGroup?: number; // Quantos times avançam de cada grupo (padrão: 2)
}

export const GroupStandings: React.FC<GroupStandingsProps> = ({
    timesParticipantes,
    games,
    format,
    qualifiersPerGroup = 2
}) => {
    const { groups: groupsData, inconsistentGames } = getGroupedStandings(timesParticipantes, games, qualifiersPerGroup);
    const sortedGroupNames = groupsData.map((group) => group.name);

    if (sortedGroupNames.length === 0) {
        return (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">Nenhum time cadastrado.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {inconsistentGames.length > 0 && (
                <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                    Jogos finalizados com placar empatado foram ignorados na classificacao ate correcao manual.
                </div>
            )}

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
                    <div className="md:hidden space-y-2 p-2">
                        {group.standings.map((standing) => (
                            <div
                                key={standing.team.id}
                                className={`rounded-xl border px-2.5 py-2 shadow-sm ${
                                    standing.qualifies
                                        ? 'border-green-500/50 bg-green-50 dark:bg-green-900/10'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 text-center font-black text-lg text-ancb-orange">{standing.position}º</div>
                                    <div className="min-w-0 flex-1 flex items-center gap-2">
                                        {standing.team.logoUrl ? (
                                            <img
                                                src={standing.team.logoUrl}
                                                alt={standing.team.nomeTime}
                                                loading="lazy"
                                                decoding="async"
                                                className="w-9 h-9 object-contain shrink-0"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-ancb-blue dark:text-blue-300 font-bold text-sm shrink-0">
                                                {standing.team.nomeTime.charAt(0)}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm leading-tight text-gray-900 dark:text-gray-100 truncate">{standing.team.nomeTime}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-2 grid grid-cols-3 gap-1.5 text-xs">
                                    <div className="rounded-md bg-gray-100 dark:bg-gray-700/60 px-2 py-1.5 flex items-center justify-between gap-2">
                                        <p className="font-bold uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">J</p>
                                        <p className="font-black text-gray-900 dark:text-gray-100">{standing.gamesPlayed}</p>
                                    </div>
                                    <div className="rounded-md bg-gray-100 dark:bg-gray-700/60 px-2 py-1.5 flex items-center justify-between gap-2">
                                        <p className="font-bold uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">V</p>
                                        <p className="font-black text-green-600 dark:text-green-400">{standing.wins}</p>
                                    </div>
                                    <div className="rounded-md bg-gray-100 dark:bg-gray-700/60 px-2 py-1.5 flex items-center justify-between gap-2">
                                        <p className="font-bold uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">D</p>
                                        <p className="font-black text-red-600 dark:text-red-400">{standing.losses}</p>
                                    </div>
                                    <div className="col-span-2 rounded-md bg-gray-100 dark:bg-gray-700/60 px-2 py-1.5 flex items-center justify-between gap-2">
                                        <p className="font-bold uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">Saldo</p>
                                        <p className={`font-black ${standing.pointBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {standing.pointBalance >= 0 ? '+' : ''}
                                            {standing.pointBalance}
                                        </p>
                                    </div>
                                    <div className="rounded-md bg-ancb-blue/10 dark:bg-ancb-blue/20 px-2 py-1.5 flex items-center justify-between gap-2">
                                        <p className="font-bold uppercase tracking-[0.08em] text-ancb-blue dark:text-blue-300">Pts</p>
                                        <p className="font-black text-ancb-blue dark:text-blue-300">{standing.totalPoints}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <table className="hidden md:table w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 font-bold uppercase text-xs border-b border-gray-200 dark:border-gray-600">
                            <tr>
                                <th className="p-4">Pos</th>
                                <th className="p-4">Time</th>
                                <th className="p-4 text-center">J</th>
                                <th className="p-4 text-center">V</th>
                                <th className="p-4 text-center">D</th>
                                <th className="p-4 text-center">Saldo</th>
                                <th className="p-4 text-center font-black">Pts</th>
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
                                                loading="lazy"
                                                decoding="async"
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

                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>
            ))}

            {/* Qualified Teams Summary */}

        </div>
    );
};
