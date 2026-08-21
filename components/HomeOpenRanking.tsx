import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { LucideTrophy } from 'lucide-react';
import { db } from '../services/firebase';
import { Cesta, Evento, Jogo, Player } from '../types';

interface RankedPlayer extends Player { totalPoints: number; gamesPlayed: number; }
interface Props { onOpenPlayer: (playerId: string) => void; }

const isInYear = (value: unknown, year: string) => {
    const date = String(value || '');
    return date.includes(year) || date.endsWith(`/${year.slice(2)}`) || date.endsWith(`-${year.slice(2)}`);
};

export const HomeOpenRanking: React.FC<Props> = ({ onOpenPlayer }) => {
    const year = new Date().getFullYear().toString();
    const [players, setPlayers] = useState<RankedPlayer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const [playerDocs, eventDocs] = await Promise.all([
                    getDocs(collection(db, 'jogadores')),
                    getDocs(collection(db, 'eventos')),
                ]);
                const playerMap = new Map<string, Player>();
                playerDocs.forEach((doc) => {
                    const player = { id: doc.id, ...doc.data() } as Player;
                    if (!player.status || player.status === 'active') playerMap.set(player.id, player);
                });

                const events: Evento[] = [];
                const contexts = new Set<string>();
                eventDocs.forEach((doc) => {
                    const event = { id: doc.id, ...doc.data() } as Evento;
                    if (!isInYear(event.data, year)) return;
                    events.push(event);
                    contexts.add(event.id);
                    event.times?.forEach((team) => team.id && contexts.add(team.id));
                });

                const points = new Map<string, number>();
                const games = new Map<string, Set<string>>();
                const processed = new Set<string>();
                playerMap.forEach((_, id) => games.set(id, new Set()));

                const addBasket = (basket: Cesta, contextId: string) => {
                    const action = (basket as Cesta & { acao?: string }).acao || 'pontos';
                    const value = Number(basket.pontos) || 0;
                    if (processed.has(basket.id) || action !== 'pontos' || value <= 0 || !basket.jogadorId || !playerMap.has(basket.jogadorId)) return;
                    processed.add(basket.id);
                    points.set(basket.jogadorId, (points.get(basket.jogadorId) || 0) + value);
                    games.get(basket.jogadorId)?.add(contextId);
                };

                await Promise.all(events.map(async (event) => {
                    const gameDocs = await getDocs(collection(db, 'eventos', event.id, 'jogos'));
                    await Promise.all(gameDocs.docs.map(async (gameDoc) => {
                        const game = { id: gameDoc.id, ...gameDoc.data() } as Jogo;
                        contexts.add(game.id);
                        game.jogadoresEscalados?.forEach((entry: any) => {
                            const playerId = typeof entry === 'string' ? entry : entry?.id;
                            if (playerId) games.get(playerId)?.add(game.id);
                        });
                        const basketDocs = await getDocs(collection(db, 'eventos', event.id, 'jogos', game.id, 'cestas'));
                        basketDocs.forEach((doc) => addBasket({ id: doc.id, ...doc.data() } as Cesta, game.id));
                    }));
                }));

                const legacyDocs = await getDocs(collection(db, 'cestas'));
                legacyDocs.forEach((doc) => {
                    const basket = { id: doc.id, ...doc.data() } as Cesta;
                    const contextId = basket.jogoId || basket.eventoId || basket.timeId;
                    if (contextId && contexts.has(contextId)) addBasket(basket, contextId);
                });

                const ranking = Array.from(playerMap.values())
                    .map((player) => ({ ...player, totalPoints: points.get(player.id) || 0, gamesPlayed: games.get(player.id)?.size || 0 }))
                    .filter((player) => player.totalPoints > 0)
                    .sort((a, b) => b.totalPoints - a.totalPoints || a.gamesPlayed - b.gamesPlayed)
                    .slice(0, 10);
                if (mounted) setPlayers(ranking);
            } catch (error) {
                console.error('Erro ao carregar ranking aberto da home:', error);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [year]);

    return (
        <section aria-labelledby="home-ranking-title">
            <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                    <div className="mb-1 flex items-center gap-2 text-ancb-orange"><LucideTrophy size={18} /><span className="text-xs font-bold uppercase">Temporada {year}</span></div>
                    <h2 id="home-ranking-title" className="text-xl font-black uppercase text-gray-800 dark:text-white">Ranking geral aberto</h2>
                </div>
                <span className="text-xs font-bold uppercase text-gray-400">Top 10 pontuadores</span>
            </div>
            {loading ? <div className="h-56 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" /> : players.length === 0 ? (
                <div className="rounded-lg border border-gray-200 px-4 py-10 text-center text-sm text-gray-500 dark:border-gray-700">Nenhuma pontuação registrada nesta temporada.</div>
            ) : <>
                <div className="mb-8 flex min-h-48 items-end justify-center gap-2 pt-8 sm:gap-8">
                    {[1, 0, 2].map((playerIndex) => {
                        const player = players[playerIndex];
                        if (!player) return null;
                        const isFirst = playerIndex === 0;
                        const border = isFirst ? 'border-yellow-400 ring-4 ring-yellow-100 dark:ring-yellow-900' : playerIndex === 1 ? 'border-gray-300' : 'border-orange-300';
                        const badge = isFirst ? 'bg-yellow-400' : playerIndex === 1 ? 'bg-gray-300' : 'bg-orange-300';
                        return <div key={player.id} className={`flex w-1/3 flex-col items-center ${isFirst ? 'self-start' : ''}`}>
                            <div className="relative mb-3">
                                {isFirst && <LucideTrophy className="absolute -right-3 -top-4 z-20 text-yellow-400 drop-shadow-md" size={36} />}
                                <button type="button" onClick={() => onOpenPlayer(player.id)} className={`${isFirst ? 'h-24 w-24 md:h-28 md:w-28' : 'h-16 w-16 md:h-20 md:w-20'} overflow-hidden rounded-full border-4 bg-gray-200 shadow-xl dark:bg-gray-700 ${border}`}>
                                    {player.foto ? <img src={player.foto} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-2xl font-bold text-gray-400">{player.nome.charAt(0)}</span>}
                                </button>
                                <span className={`absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold text-white shadow ${badge}`}>{playerIndex + 1}º</span>
                            </div>
                            <button type="button" onClick={() => onOpenPlayer(player.id)} className={`${isFirst ? 'text-base md:text-lg' : 'text-sm'} max-w-full truncate font-bold text-gray-800 hover:underline dark:text-white`}>{player.apelido || player.nome}</button>
                            <span className={`${isFirst ? 'text-xl' : 'text-sm'} font-bold text-ancb-orange`}>{player.totalPoints} pts</span>
                            <span className="text-xs text-gray-400">{player.gamesPlayed} jogos{isFirst && player.gamesPlayed > 0 ? ` · ${(player.totalPoints / player.gamesPlayed).toFixed(1)} PPG` : ''}</span>
                        </div>;
                    })}
                </div>

                {players.length > 3 && <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="grid grid-cols-12 bg-gray-50 p-3 text-xs font-bold uppercase text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                        <span className="col-span-2 text-center">Pos</span><span className="col-span-6">Atleta</span><span className="col-span-2 text-center">Jogos</span><span className="col-span-2 text-center">Pts</span>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">{players.slice(3, 10).map((player, index) => <button key={player.id} type="button" onClick={() => onOpenPlayer(player.id)} className="grid w-full grid-cols-12 items-center p-4 text-left transition hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <span className="col-span-2 text-center font-bold text-gray-400">{index + 4}º</span>
                        <span className="col-span-6 flex min-w-0 items-center gap-3">
                            <span className="hidden h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gray-200 sm:flex dark:bg-gray-700">{player.foto ? <img src={player.foto} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" /> : <span className="m-auto text-xs font-bold text-gray-400">{player.nome.charAt(0)}</span>}</span>
                            <span className="min-w-0"><strong className="block truncate text-sm text-gray-800 dark:text-gray-200">{player.apelido || player.nome}</strong><span className="block truncate text-[10px] uppercase text-gray-400">{player.posicao || 'Atleta'}</span></span>
                        </span>
                        <span className="col-span-2 text-center text-sm text-gray-500 dark:text-gray-400">{player.gamesPlayed}</span>
                        <strong className="col-span-2 text-center text-ancb-blue dark:text-blue-400">{player.totalPoints}</strong>
                    </button>)}</div>
                </div>}
            </>}
        </section>
    );
};
