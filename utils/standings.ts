import { Jogo, Time } from '../types';

export interface TeamStanding {
    team: Time;
    gamesPlayed: number;
    wins: number;
    losses: number;
    pointsFor: number;
    pointsAgainst: number;
    pointBalance: number;
    totalPoints: number;
    qualifies: boolean;
    position: number;
}

export interface InconsistentStandingsGame {
    id: string;
    timeA: string;
    timeB: string;
}

export interface GroupStandingsData {
    name: string;
    standings: TeamStanding[];
}

interface StandingsResult {
    standings: TeamStanding[];
    inconsistentGames: InconsistentStandingsGame[];
}

const getFinalScores = (game: Jogo) => {
    if (typeof game.placarTimeA_final !== 'number' || typeof game.placarTimeB_final !== 'number') {
        return null;
    }

    return {
        teamA: game.placarTimeA_final,
        teamB: game.placarTimeB_final,
    };
};

const compareStandings = (a: TeamStanding, b: TeamStanding) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return b.pointBalance - a.pointBalance;
};

export const getInconsistentFinalizedGames = (games: Jogo[]): InconsistentStandingsGame[] => {
    return games
        .filter((game) => game.status === 'finalizado')
        .filter((game) => {
            const scores = getFinalScores(game);
            return scores ? scores.teamA === scores.teamB : false;
        })
        .map((game) => ({
            id: game.id,
            timeA: game.timeA_nome || 'Time A',
            timeB: game.timeB_nome || game.adversario || 'Time B',
        }));
};

export const calculateStandings = (
    teams: Time[],
    games: Jogo[],
    qualifiersPerGroup = 0,
): StandingsResult => {
    const inconsistentGames = getInconsistentFinalizedGames(games);
    const inconsistentGameIds = new Set(inconsistentGames.map((game) => game.id));

    const standings = teams
        .map((team) => {
            const teamGames = games.filter(
                (game) =>
                    game.status === 'finalizado' &&
                    !inconsistentGameIds.has(game.id) &&
                    (game.timeA_id === team.id || game.timeB_id === team.id),
            );

            let wins = 0;
            let losses = 0;
            let pointsFor = 0;
            let pointsAgainst = 0;

            teamGames.forEach((game) => {
                const scores = getFinalScores(game);
                if (!scores) return;

                if (game.timeA_id === team.id) {
                    pointsFor += scores.teamA;
                    pointsAgainst += scores.teamB;
                    if (scores.teamA > scores.teamB) wins++;
                    else if (scores.teamA < scores.teamB) losses++;
                } else {
                    pointsFor += scores.teamB;
                    pointsAgainst += scores.teamA;
                    if (scores.teamB > scores.teamA) wins++;
                    else if (scores.teamB < scores.teamA) losses++;
                }
            });

            return {
                team,
                gamesPlayed: teamGames.length,
                wins,
                losses,
                pointsFor,
                pointsAgainst,
                pointBalance: pointsFor - pointsAgainst,
                totalPoints: wins * 2,
                qualifies: false,
                position: 0,
            };
        })
        .sort(compareStandings)
        .map((standing, index) => ({
            ...standing,
            position: index + 1,
            qualifies: index < qualifiersPerGroup,
        }));

    return {
        standings,
        inconsistentGames,
    };
};

export const getGroupedStandings = (
    teams: Time[],
    games: Jogo[],
    qualifiersPerGroup = 0,
): { groups: GroupStandingsData[]; inconsistentGames: InconsistentStandingsGame[] } => {
    const groupedTeams = teams.reduce<Record<string, Time[]>>((acc, team) => {
        const groupName = team.grupo || 'Sem Grupo';
        if (!acc[groupName]) acc[groupName] = [];
        acc[groupName].push(team);
        return acc;
    }, {});

    const inconsistentGames = getInconsistentFinalizedGames(games);
    const groups = Object.keys(groupedTeams)
        .sort()
        .map((groupName) => ({
            name: groupName,
            standings: calculateStandings(groupedTeams[groupName], games, qualifiersPerGroup).standings,
        }));

    return {
        groups,
        inconsistentGames,
    };
};