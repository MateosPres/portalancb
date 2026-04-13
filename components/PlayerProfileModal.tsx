import React, { useEffect, useMemo, useState } from 'react';
import { LucideLoader2, LucideMapPin, LucideStar, LucideTrophy } from 'lucide-react';
import { Modal } from './Modal';
import { RadarChart } from './RadarChart';
import { Badge, Player, UserProfile } from '../types';
import { db } from '../services/firebase';
import { getRarityStyles } from '../utils/badges';

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

const calculateRadarStats = (
    tags?: Record<string, number>,
    attributeDeltas?: Partial<Record<'ataque' | 'defesa' | 'forca' | 'velocidade' | 'visao', number>>
) => {
    const BASE_STAT = 20;
    const DELTA_DISPLAY_GAIN = 4.0;
    const CONTRAST_GAIN = 1.8;
    let stats = { ataque: BASE_STAT, defesa: BASE_STAT, forca: BASE_STAT, velocidade: BASE_STAT, visao: BASE_STAT };

    const hasAttributeDeltas = !!attributeDeltas && Object.values(attributeDeltas).some(v => typeof v === 'number' && !Number.isNaN(v) && v !== 0);
    if (hasAttributeDeltas && attributeDeltas) {
        stats.ataque += Number(attributeDeltas.ataque || 0) * DELTA_DISPLAY_GAIN;
        stats.defesa += Number(attributeDeltas.defesa || 0) * DELTA_DISPLAY_GAIN;
        stats.forca += Number(attributeDeltas.forca || 0) * DELTA_DISPLAY_GAIN;
        stats.velocidade += Number(attributeDeltas.velocidade || 0) * DELTA_DISPLAY_GAIN;
        stats.visao += Number(attributeDeltas.visao || 0) * DELTA_DISPLAY_GAIN;
    } else if (tags) {
        const LEGACY_WEIGHTS: Record<string, Partial<Record<'ataque' | 'defesa' | 'forca' | 'velocidade' | 'visao', number>>> = {
            sniper: { ataque: 3, visao: 1 },
            muralha: { defesa: 3, forca: 1 },
            lider: { visao: 3, defesa: 1, forca: 1 },
            garcom: { visao: 3, ataque: 1 },
            flash: { velocidade: 3, ataque: 1 },
            guerreiro: { forca: 3, defesa: 1 },
            fominha: { visao: -1, ataque: -0.5 },
            tijoleiro: { ataque: -1, visao: -0.5 },
            avenida: { defesa: -1, velocidade: -0.5 },
            cone: { velocidade: -1, forca: -0.5 },
        };

        Object.entries(tags).forEach(([tag, count]) => {
            const impact = LEGACY_WEIGHTS[tag];
            if (!impact) return;
            if (impact.ataque) stats.ataque += impact.ataque * count;
            if (impact.defesa) stats.defesa += impact.defesa * count;
            if (impact.forca) stats.forca += impact.forca * count;
            if (impact.velocidade) stats.velocidade += impact.velocidade * count;
            if (impact.visao) stats.visao += impact.visao * count;
        });
    }

    const values = [stats.ataque, stats.defesa, stats.forca, stats.velocidade, stats.visao];
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    const enhance = (value: number) => average + ((value - average) * CONTRAST_GAIN);
    const clamp = (n: number) => Math.max(5, Math.min(n, 99));

    return {
        ataque: clamp(enhance(stats.ataque)),
        defesa: clamp(enhance(stats.defesa)),
        forca: clamp(enhance(stats.forca)),
        velocidade: clamp(enhance(stats.velocidade)),
        visao: clamp(enhance(stats.visao)),
    };
};

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({ isOpen, playerId, userProfile: _userProfile, onClose }) => {
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
        return calculateRadarStats(player.stats_tags, player.stats_atributos);
    }, [player]);

    const hasRadarData = useMemo(() => {
        if (!player) return false;
        return Object.values(player.stats_atributos || {}).some(value => Number(value) !== 0) || Object.values(player.stats_tags || {}).some(value => Number(value) > 0);
    }, [player]);

    const featuredBadges = useMemo(() => {
        if (!player?.badges?.length || !player.pinnedBadgeIds?.length) return [] as Badge[];
        const pinned = player.pinnedBadgeIds
            .map((id) => player.badges?.find((badge) => badge.id === id))
            .filter((badge): badge is Badge => !!badge)
            .slice(0, 3);
        return pinned;
    }, [player]);

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
                                        return (
                                            <button
                                                type="button"
                                                key={`featured-${badge.id}`}
                                                onClick={() => setSelectedBadge(badge)}
                                                className={`rounded-lg border px-2 py-2 text-center transition-transform hover:scale-[1.02] ${style.classes}`}
                                            >
                                                <p className="text-lg leading-none">{badge.emoji}</p>
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
                            <p className="text-2xl font-black text-ancb-blue">{player.badges?.length || 0}</p>
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
                        {!player.badges || player.badges.length === 0 ? (
                            <p className="text-sm text-gray-500">Este atleta ainda nao possui conquistas registradas.</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                                {[...player.badges].reverse().map((badge) => {
                                    const style = getRarityStyles(badge.raridade);
                                    return (
                                        <button
                                            type="button"
                                            key={badge.id}
                                            onClick={() => setSelectedBadge(badge)}
                                            className={`rounded-lg border px-2 py-2 text-center transition-transform hover:scale-[1.02] ${style.classes}`}
                                        >
                                            <p className="text-xl leading-none">{badge.emoji}</p>
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
                                <p className="text-5xl">{selectedBadge.emoji}</p>
                                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">{selectedBadge.nome}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{selectedBadge.descricao || 'Sem descricao cadastrada.'}</p>
                            </div>
                        )}
                    </Modal>
                </div>
            )}
        </Modal>
    );
};
