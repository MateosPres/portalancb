import React, { useEffect, useMemo, useState } from 'react';
import { LucideLoader2, LucideMapPin, LucideStar, LucideTrophy } from 'lucide-react';
import { Modal } from './Modal';
import { RadarChart } from './RadarChart';
import { Badge, Player, UserProfile } from '../types';
import { db } from '../services/firebase';
import { useRadarPopulation } from '../hooks/useRadarPopulation';
import { useReviewQuizConfig } from '../hooks/useReviewQuizConfig';
import {
    getBadgeEffectClasses,
    getBadgeOccurrences,
    getBadgeStackCount,
    getMergedBadgesForDisplay,
    getRarityStyles,
    isImageBadge,
} from '../utils/badges';
import { calculateRelativeRadarStats, hasRadarSourceData } from '../utils/radar';

interface PlayerProfileModalProps {
    isOpen: boolean;
    playerId: string | null;
    userProfile?: UserProfile | null;
    onClose: () => void;
}

const normalizePosition = (pos: string | undefined): string => {
    if (!pos) return '-';
    const p = pos.toLowerCase();
    if (p.includes('1') || (p.includes('armador') && !p.includes('ala'))) return 'Armador (1)';
    if (p.includes('2') || p.includes('ala/armador') || p.includes('ala-armador') || p.includes('sg')) return 'Ala/Armador (2)';
    if (p.includes('3') || (p.includes('ala') && !p.includes('armador') && !p.includes('piv') && !p.includes('pivo')) || p.includes('sf')) return 'Ala (3)';
    if (p.includes('4') || p.includes('ala/piv') || p.includes('ala-piv') || p.includes('pf')) return 'Ala/Pivo (4)';
    if (p.includes('5') || (p.includes('piv') && !p.includes('ala')) || p.includes('c)') || p.trim().endsWith('(c)')) return 'Pivo (5)';
    return pos;
};

const calculateAge = (dateString?: string) => {
    if (!dateString) return '-';
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return String(age);
};

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({ isOpen, playerId, userProfile: _userProfile, onClose }) => {
    const radarPopulation = useRadarPopulation();
    const { config: reviewQuizConfig } = useReviewQuizConfig();
    const [loading, setLoading] = useState(false);
    const [player, setPlayer] = useState<Player | null>(null);
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

    useEffect(() => {
        if (!isOpen || !playerId) return;

        let cancelled = false;
        const fetchPlayer = async () => {
            setLoading(true);
            try {
                const snap = await db.collection('jogadores').doc(playerId).get();
                if (!cancelled) {
                    if (snap.exists) {
                        setPlayer({ id: snap.id, ...(snap.data() as any) } as Player);
                    } else {
                        setPlayer(null);
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar ficha do jogador:', error);
                if (!cancelled) setPlayer(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchPlayer();
        return () => {
            cancelled = true;
        };
    }, [isOpen, playerId]);

    const radarStats = useMemo(() => {
        if (!player) {
            return { ataque: 50, defesa: 50, forca: 50, velocidade: 50, visao: 50 };
        }
        return calculateRelativeRadarStats({
            attributeDeltas: player.stats_atributos,
            legacyTagCounts: player.stats_tags,
            populationPlayers: radarPopulation,
            quizConfig: reviewQuizConfig,
        });
    }, [player, radarPopulation, reviewQuizConfig]);

    const hasRadarData = useMemo(() => {
        if (!player) return false;
        return hasRadarSourceData(player.stats_atributos, player.stats_tags, reviewQuizConfig);
    }, [player, reviewQuizConfig]);

    const featuredBadges = useMemo(() => {
        if (!player?.badges?.length || !player.pinnedBadgeIds?.length) return [] as Badge[];
        const pinned = player.pinnedBadgeIds
            .map((id) => player.badges?.find((badge) => badge.id === id))
            .filter((badge): badge is Badge => !!badge)
            .slice(0, 3);
        return pinned;
    }, [player]);

    const mergedBadges = useMemo(() => getMergedBadgesForDisplay(player?.badges || []), [player]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Ficha do Atleta">
            {loading ? (
                <div className="py-12 flex items-center justify-center">
                    <LucideLoader2 className="animate-spin text-ancb-orange" />
                </div>
            ) : !player ? (
                <div className="py-12 text-center text-gray-500">Atleta nao encontrado.</div>
            ) : (
                <div className="space-y-6">
                    <div className="rounded-2xl bg-[#062553] text-white p-4 md:p-5 border border-blue-900">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700 border-2 border-white/10 flex items-center justify-center">
                                    {player.foto ? (
                                        <img src={player.foto} alt={player.nome} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xl font-bold text-white/60">{(player.apelido || player.nome || '?').charAt(0)}</span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-2xl font-bold truncate">{player.apelido || player.nome}</p>
                                    <p className="text-xs text-blue-200 truncate">{player.nome}</p>
                                    <p className="text-sm mt-1 flex items-center gap-1 text-gray-200">
                                        <LucideMapPin size={13} className="text-ancb-orange" /> {normalizePosition(player.posicao)}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-ancb-orange text-white text-sm font-bold">
                                    #{player.numero_uniforme}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/10">
                            <p className="text-[10px] uppercase tracking-wider font-bold text-blue-200 mb-2">Conquistas em Destaque</p>
                            {featuredBadges.length === 0 ? (
                                <p className="text-xs text-blue-200/80">Sem conquistas fixadas para destaque.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    {featuredBadges.map((badge) => {
                                        const style = getRarityStyles(badge.raridade);
                                        const stackCount = getBadgeStackCount(badge);
                                        return (
                                            <button
                                                type="button"
                                                key={`featured-${badge.id}`}
                                                onClick={() => setSelectedBadge(badge)}
                                                className={`rounded-lg border px-2 py-2 text-center transition-transform hover:scale-[1.02] relative ${style.classes} ${getBadgeEffectClasses(badge.raridade)}`}
                                            >
                                                {stackCount > 1 && (
                                                    <span className="absolute right-1 top-1 rounded-full bg-black/35 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm">
                                                        x{stackCount}
                                                    </span>
                                                )}
                                                {isImageBadge(badge) ? (
                                                    <img src={badge.iconeValor} alt={badge.nome} className="mx-auto h-10 w-10 rounded-xl object-cover border border-white/20" />
                                                ) : (
                                                    <p className="text-lg leading-none">{badge.emoji}</p>
                                                )}
                                                <p className="text-[9px] font-bold uppercase mt-1 line-clamp-2">{badge.nome}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
                            <p className="text-2xl font-black text-ancb-blue">{calculateAge(player.nascimento)}</p>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Idade</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
                            <p className="text-2xl font-black text-ancb-blue">{mergedBadges.length}</p>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Conquistas</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
                            <p className="text-2xl font-black text-ancb-blue">{player.numero_uniforme ?? '-'}</p>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Numero</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center gap-2 mb-3 text-gray-700 dark:text-gray-200">
                            <LucideStar size={16} className="text-ancb-orange" />
                            <h4 className="font-bold text-sm uppercase tracking-wider">Atributos</h4>
                        </div>
                        <div className="flex justify-center">
                            <RadarChart stats={radarStats} hasData={hasRadarData} size={220} />
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center gap-2 mb-3 text-gray-700 dark:text-gray-200">
                            <LucideTrophy size={16} className="text-ancb-orange" />
                            <h4 className="font-bold text-sm uppercase tracking-wider">Conquistas</h4>
                        </div>
                        {mergedBadges.length === 0 ? (
                            <p className="text-sm text-gray-500">Este atleta ainda nao possui conquistas registradas.</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                                {[...mergedBadges].reverse().map((badge) => {
                                    const style = getRarityStyles(badge.raridade);
                                    const stackCount = getBadgeStackCount(badge);
                                    return (
                                        <button
                                            type="button"
                                            key={badge.id}
                                            onClick={() => setSelectedBadge(badge)}
                                            className={`rounded-lg border px-2 py-2 text-center transition-transform hover:scale-[1.02] relative ${style.classes} ${getBadgeEffectClasses(badge.raridade)}`}
                                        >
                                            {stackCount > 1 && (
                                                <span className="absolute right-1 top-1 rounded-full bg-black/35 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm">
                                                    x{stackCount}
                                                </span>
                                            )}
                                            {isImageBadge(badge) ? (
                                                <img src={badge.iconeValor} alt={badge.nome} className="mx-auto h-10 w-10 rounded-xl object-cover border border-white/20" />
                                            ) : (
                                                <p className="text-xl leading-none">{badge.emoji}</p>
                                            )}
                                            <p className="text-[10px] font-bold uppercase mt-1 line-clamp-2">{badge.nome}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <Modal isOpen={!!selectedBadge} onClose={() => setSelectedBadge(null)} title="Detalhe da Conquista">
                        {selectedBadge && (
                            <div className="text-center space-y-3">
                                <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] ${getBadgeEffectClasses(selectedBadge.raridade)}`}>
                                    {isImageBadge(selectedBadge) ? (
                                        <img src={selectedBadge.iconeValor} alt={selectedBadge.nome} className="h-16 w-16 rounded-[1rem] object-cover" />
                                    ) : (
                                        <p className="text-5xl">{selectedBadge.emoji}</p>
                                    )}
                                </div>
                                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">{selectedBadge.nome}</h4>
                                {getBadgeStackCount(selectedBadge) > 1 && (
                                    <p className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">Stack x{getBadgeStackCount(selectedBadge)}</p>
                                )}
                                <div className="space-y-2 text-left">
                                    {getBadgeOccurrences(selectedBadge).map((occurrence) => (
                                        <div key={occurrence.id} className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/70">
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{occurrence.descricao || 'Sem descricao cadastrada.'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Modal>
                </div>
            )}
        </Modal>
    );
};
