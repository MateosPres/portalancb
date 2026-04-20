/**
 * utils/badges.ts
 *
 * Fonte única de verdade para o sistema de conquistas da ANCB.
 * Importe daqui em: ProfileView, JogadoresView, AdminView e Cloud Functions (via cópia/shared).
 */

import { Badge, BadgeOccurrence, ConquistaRegra } from '../types';

export type BadgeGallerySortOption = 'recentes' | 'raras';

export const BADGE_GALLERY_SORT_OPTIONS: Array<{ value: BadgeGallerySortOption; label: string }> = [
    { value: 'recentes', label: 'Mais recentes' },
    { value: 'raras', label: 'Mais raras' },
];

// ─────────────────────────────────────────────────────────────
// IMPACTOS DE TAGS DE AVALIAÇÃO NOS ATRIBUTOS
// Era: duplicado em AdminView.tsx (linha 13) e hardcoded em Cloud Functions.
// Agora: fonte única. AdminView e Functions devem importar / copiar daqui.
// ─────────────────────────────────────────────────────────────
export type AtributoKey = 'ataque' | 'defesa' | 'forca' | 'velocidade' | 'visao';

export const REVIEW_TAG_MULTIPLIERS: Record<number, number> = {
    1: 1.0,
    2: 0.75,
    3: 0.55,
};

export const REVIEW_TAG_IMPACTS: Record<string, Partial<Record<AtributoKey, number>>> = {
    muralha:   { defesa: 3, forca: 1 },
    sniper:    { ataque: 3, visao: 1 },
    garcom:    { visao: 3, ataque: 1 },
    flash:     { velocidade: 3, ataque: 1 },
    lider:     { visao: 3, defesa: 1, forca: 1 },
    guerreiro: { forca: 3, defesa: 1 },
    avenida:   { defesa: -1, velocidade: -0.5 },
    fominha:   { visao: -1, ataque: -0.5 },
    tijoleiro: { ataque: -1, visao: -0.5 },
    cone:      { velocidade: -1, forca: -0.5 },
};

// ─────────────────────────────────────────────────────────────
// HELPERS DE EXIBIÇÃO
// Era: copiados em ProfileView.tsx e JogadoresView.tsx.
// Agora: fonte única.
// ─────────────────────────────────────────────────────────────
export interface RarityStyle {
    label: string;
    classes: string;
}

export interface BadgeDisplayGroup {
    key: string;
    badge: Badge;
    members: Badge[];
}

const LEGACY_STACKABLE_TITLES = new Set([
    'Estava La',
    'Cestinha',
    'Imparavel',
    'Bola Quente',
    'Mao Quente',
    'Tiro Certo',
    'Mira Calibrada',
    'Campeao',
    'Vice',
    'Podio',
    'Vice-Cestinha',
    'Mestre 3pts',
    'Bronze',
    'Prata',
    'Ouro',
    'Contribuiu!',
]);

const compareBadgeDates = (left?: string, right?: string): number => {
    return String(left || '').localeCompare(String(right || ''));
};

const parseBadgeDateValue = (value?: string): number => {
    const normalized = String(value || '').trim();
    if (!normalized) return 0;

    if (/^\d{4}-\d{2}-\d{2}/.test(normalized)) {
        const timestamp = Date.parse(normalized);
        return Number.isNaN(timestamp) ? 0 : timestamp;
    }

    const brDateMatch = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (brDateMatch) {
        const [, day, month, year] = brDateMatch;
        const timestamp = Date.parse(`${year}-${month}-${day}`);
        return Number.isNaN(timestamp) ? 0 : timestamp;
    }

    const timestamp = Date.parse(normalized);
    return Number.isNaN(timestamp) ? 0 : timestamp;
};

const normalizeLegacyTitleToken = (value?: string): string => {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

const buildLegacyGroupKeyFromBaseTitle = (baseTitle: string, category?: Badge['categoria'] | null): string => {
    return ['legacy', normalizeLegacyTitleToken(baseTitle), String(category || '')].join('|');
};

const extractLegacyBaseTitle = (badge: Badge): string | null => {
    if (badge.origem && badge.origem !== 'legado') return null;

    if (badge.legacyBaseTitle) {
        const storedBaseTitle = normalizeLegacyTitleToken(badge.legacyBaseTitle);
        return LEGACY_STACKABLE_TITLES.has(storedBaseTitle) ? storedBaseTitle : null;
    }

    const normalizedTitle = normalizeLegacyTitleToken(badge.nome);
    if (!normalizedTitle) return null;

    const titleMatch = normalizedTitle.match(/^(.+?)\s*\((.+)\)$/);
    const candidateTitle = titleMatch ? titleMatch[1].trim() : normalizedTitle;

    if (!LEGACY_STACKABLE_TITLES.has(candidateTitle)) {
        return null;
    }

    return candidateTitle;
};

const getCanonicalLegacyBadgeName = (badge: Badge): string | null => {
    const legacyBaseTitle = extractLegacyBaseTitle(badge);
    if (!legacyBaseTitle) return null;

    const baseNameByTitle: Record<string, string> = {
        'Estava La': 'Estava Lá',
        'Cestinha': 'Cestinha',
        'Imparavel': 'Imparável',
        'Bola Quente': 'Bola Quente',
        'Mao Quente': 'Mão Quente',
        'Tiro Certo': 'Tiro Certo',
        'Mira Calibrada': 'Mira Calibrada',
        'Campeao': 'Campeão',
        'Vice': 'Vice',
        'Podio': 'Pódio',
        'Vice-Cestinha': 'Vice-Cestinha',
        'Mestre 3pts': 'Mestre 3pts',
        'Bronze': 'Bronze',
        'Prata': 'Prata',
        'Ouro': 'Ouro',
        'Contribuiu!': 'Contribuiu!',
    };

    return baseNameByTitle[legacyBaseTitle] || badge.nome;
};

const getCanonicalLegacyGroupKey = (badge: Badge): string | null => {
    if (badge.legacyGroupKey) {
        return String(badge.legacyGroupKey).trim() || null;
    }

    const legacyBaseTitle = extractLegacyBaseTitle(badge);
    if (!legacyBaseTitle) return null;
    return buildLegacyGroupKeyFromBaseTitle(legacyBaseTitle, badge.categoria);
};

const getPreferredBadgeForGroup = (left: Badge, right: Badge): Badge => {
    const rarityDiff = getBadgeWeight(right.raridade) - getBadgeWeight(left.raridade);
    if (rarityDiff !== 0) {
        return rarityDiff > 0 ? right : left;
    }

    const dateDiff = parseBadgeDateValue(getBadgeDisplayDate(right)) - parseBadgeDateValue(getBadgeDisplayDate(left));
    if (dateDiff !== 0) {
        return dateDiff > 0 ? right : left;
    }

    return right;
};

const buildLegacyOccurrence = (badge: Badge): BadgeOccurrence => ({
    id: badge.latestOccurrenceId || `${badge.id}:legacy`,
    descricao: badge.descricao || 'Conquista desbloqueada.',
    data: badge.data || '',
    gameId: badge.gameId,
    eventId: badge.eventId,
    seasonYear: badge.seasonYear,
    teamId: badge.teamId,
    teamNome: badge.teamNome,
});

export const getBadgeOccurrences = (badge: Badge): BadgeOccurrence[] => {
    if (Array.isArray(badge.ocorrencias) && badge.ocorrencias.length > 0) {
        return [...badge.ocorrencias].sort((a, b) => {
            const dateDiff = compareBadgeDates(a.data, b.data);
            if (dateDiff !== 0) return dateDiff;
            return String(a.id || '').localeCompare(String(b.id || ''));
        });
    }

    return [buildLegacyOccurrence(badge)];
};

export const getBadgeOccurrencesNewestFirst = (badge: Badge): BadgeOccurrence[] => {
    return [...getBadgeOccurrences(badge)].reverse();
};

export const getBadgeStackCount = (badge: Badge): number => {
    if (typeof badge.stackCount === 'number' && badge.stackCount > 0) {
        return badge.stackCount;
    }
    return getBadgeOccurrences(badge).length;
};

export const getLatestBadgeOccurrence = (badge: Badge): BadgeOccurrence => {
    const occurrences = getBadgeOccurrences(badge);
    return occurrences[occurrences.length - 1] || buildLegacyOccurrence(badge);
};

export const getBadgeDisplayDate = (badge: Badge): string => {
    return getLatestBadgeOccurrence(badge).data || badge.data || '';
};

export const getBadgeDisplayDescription = (badge: Badge): string => {
    return getLatestBadgeOccurrence(badge).descricao || badge.descricao || 'Conquista desbloqueada.';
};

export const renderConquistaTemplate = (
    template: string | undefined,
    context: Record<string, string | number | undefined | null>,
): string => {
    const source = String(template || '').trim();
    if (!source) return '';

    return source.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
        const value = context[key];
        if (value === undefined || value === null) return '';
        return String(value);
    }).replace(/\s{2,}/g, ' ').trim();
};

export const renderConquistaTexts = (
    regra: Pick<ConquistaRegra, 'titulo' | 'descricao' | 'descricaoTemplate' | 'mensagemNotificacao' | 'mensagemNotificacaoTemplate'>,
    context: Record<string, string | number | undefined | null>,
) => {
    const tituloBase = regra.titulo || 'Conquista';
    const descricaoBase = regra.descricaoTemplate || regra.descricao || 'Conquista desbloqueada.';
    const mensagemBase = regra.mensagemNotificacaoTemplate || regra.mensagemNotificacao || `Voce ganhou a conquista "${regra.titulo || 'Conquista'}".`;

    return {
        titulo: renderConquistaTemplate(tituloBase, context) || 'Conquista',
        descricao: renderConquistaTemplate(descricaoBase, context) || 'Conquista desbloqueada.',
        mensagem: renderConquistaTemplate(mensagemBase, context) || `Voce ganhou a conquista "${regra.titulo || 'Conquista'}".`,
    };
};

export const getBadgeEffectClasses = (rarity?: Badge['raridade'] | null): string => {
    switch (rarity || 'comum') {
        case 'lendaria':
            return 'badge-rarity badge-rarity-lendaria';
        case 'epica':
            return 'badge-rarity badge-rarity-epica';
        case 'rara':
            return 'badge-rarity badge-rarity-rara';
        default:
            return 'badge-rarity';
    }
};

export const isImageBadge = (badge?: Pick<Badge, 'tipoIcone' | 'iconeValor'> | null): boolean => {
    return badge?.tipoIcone === 'imagem' && String(badge?.iconeValor || '').startsWith('http');
};

export const shouldAggregateBadgeByRule = (badge: Pick<Badge, 'tipoAvaliacao'>): boolean => {
    return badge.tipoAvaliacao !== 'ao_fechar_temporada';
};

export const buildRuleBasedBadgeId = (
    regraId: string,
    options?: { tipoAvaliacao?: Badge['tipoAvaliacao']; seasonYear?: string },
): string => {
    const normalizedRuleId = String(regraId || '').trim();
    const seasonYear = String(options?.seasonYear || '').trim();

    if (options?.tipoAvaliacao === 'ao_fechar_temporada' && seasonYear) {
        return `regra_${normalizedRuleId}_temporada_${seasonYear}`;
    }

    return `regra_${normalizedRuleId}`;
};

export const upsertStackedBadge = (allBadges: Badge[], incomingBadge: Badge) => {
    const nextBadges = [...allBadges];
    const badgeIndex = nextBadges.findIndex((badge) => {
        if (incomingBadge.regraId && badge.regraId && shouldAggregateBadgeByRule(incomingBadge) && shouldAggregateBadgeByRule(badge)) {
            return badge.regraId === incomingBadge.regraId;
        }
        return badge.id === incomingBadge.id;
    });

    const incomingOccurrences = getBadgeOccurrences(incomingBadge);

    if (badgeIndex === -1) {
        const latestOccurrence = incomingOccurrences[incomingOccurrences.length - 1];
        const normalizedBadge: Badge = {
            ...incomingBadge,
            origem: incomingBadge.origem || 'regra',
            descricao: latestOccurrence?.descricao || incomingBadge.descricao,
            data: latestOccurrence?.data || incomingBadge.data,
            stackCount: incomingOccurrences.length,
            latestOccurrenceId: latestOccurrence?.id,
            ocorrencias: incomingOccurrences,
        };
        nextBadges.push(normalizedBadge);
        return { badges: nextBadges, badge: normalizedBadge, occurrenceAdded: true };
    }

    const currentBadge = nextBadges[badgeIndex];
    const currentOccurrences = getBadgeOccurrences(currentBadge);
    const knownIds = new Set(currentOccurrences.map((occurrence) => occurrence.id));
    let occurrenceAdded = false;

    for (const occurrence of incomingOccurrences) {
        if (knownIds.has(occurrence.id)) continue;
        currentOccurrences.push(occurrence);
        knownIds.add(occurrence.id);
        occurrenceAdded = true;
    }

    currentOccurrences.sort((a, b) => {
        const dateDiff = compareBadgeDates(a.data, b.data);
        if (dateDiff !== 0) return dateDiff;
        return String(a.id || '').localeCompare(String(b.id || ''));
    });

    const latestOccurrence = currentOccurrences[currentOccurrences.length - 1] || buildLegacyOccurrence(currentBadge);
    const mergedBadge: Badge = {
        ...currentBadge,
        ...incomingBadge,
        origem: incomingBadge.origem || currentBadge.origem || 'regra',
        descricao: latestOccurrence.descricao || incomingBadge.descricao || currentBadge.descricao,
        data: latestOccurrence.data || incomingBadge.data || currentBadge.data,
        gameId: latestOccurrence.gameId || incomingBadge.gameId || currentBadge.gameId,
        eventId: latestOccurrence.eventId || incomingBadge.eventId || currentBadge.eventId,
        seasonYear: latestOccurrence.seasonYear || incomingBadge.seasonYear || currentBadge.seasonYear,
        teamId: latestOccurrence.teamId || incomingBadge.teamId || currentBadge.teamId,
        teamNome: latestOccurrence.teamNome || incomingBadge.teamNome || currentBadge.teamNome,
        stackCount: currentOccurrences.length,
        latestOccurrenceId: latestOccurrence.id,
        ocorrencias: currentOccurrences,
    };

    nextBadges[badgeIndex] = mergedBadge;
    return { badges: nextBadges, badge: mergedBadge, occurrenceAdded };
};

export const getRarityStyles = (rarity?: Badge['raridade'] | null): RarityStyle => {
    switch (rarity || 'comum') {
        case 'lendaria':
            return {
                label: 'Lendária',
                classes: 'bg-gradient-to-r from-orange-900 to-yellow-700 text-yellow-200 border-2 border-yellow-500',
            };
        case 'epica':
            return {
                label: 'Épica',
                classes: 'bg-purple-700 text-white border-purple-500',
            };
        case 'rara':
            return {
                label: 'Rara',
                classes: 'bg-blue-600 text-white border-blue-400',
            };
        default:
            return {
                label: 'Comum',
                classes: 'bg-green-600 text-white border-green-400',
            };
    }
};

export const getBadgeWeight = (rarity?: Badge['raridade'] | null): number => {
    switch (rarity || 'comum') {
        case 'lendaria': return 4;
        case 'epica':    return 3;
        case 'rara':     return 2;
        default:         return 1;
    }
};

/**
 * Retorna as badges para exibição no perfil/card do jogador.
 * Respeita a ordem de pins; se não houver pins, mostra as 3 de maior raridade.
 */
export const getDisplayBadges = (
    allBadges: Badge[],
    pinnedIds: string[],
    maxDisplay = 3,
): Badge[] => {
    const mergedBadges = getMergedBadgesForDisplay(allBadges);
    const validPinned = pinnedIds.filter(id => id && id.length > 0);
    if (validPinned.length > 0) {
        // preserve pinnedIds order so slot position = display position
        return validPinned
            .map(id => mergedBadges.find(b => b.id === id) || allBadges.find(b => b.id === id))
            .filter(Boolean) as Badge[];
    }
    return [...mergedBadges]
        .sort((a, b) => {
            const diff = getBadgeWeight(b.raridade) - getBadgeWeight(a.raridade);
            return diff !== 0 ? diff : getBadgeDisplayDate(b).localeCompare(getBadgeDisplayDate(a));
        })
        .slice(0, maxDisplay);
};

const buildBadgeDisplayKey = (badge: Badge): string => {
    if (badge.regraId) return `regra:${badge.regraId}`;

    const canonicalLegacyGroupKey = getCanonicalLegacyGroupKey(badge);
    if (canonicalLegacyGroupKey) {
        return canonicalLegacyGroupKey;
    }

    return [
        'visual',
        badge.nome || '',
        badge.emoji || '',
        badge.raridade || '',
        badge.categoria || '',
        badge.tipoIcone || '',
        badge.iconeValor || '',
    ].join('|');
};

export const getGroupedBadgesForDisplay = (allBadges: Badge[]): BadgeDisplayGroup[] => {
    const grouped = new Map<string, BadgeDisplayGroup>();

    allBadges.forEach((badge) => {
        const key = buildBadgeDisplayKey(badge);
        const existing = grouped.get(key);
        if (!existing) {
            const canonicalLegacyName = getCanonicalLegacyBadgeName(badge);
            const canonicalLegacyGroupKey = getCanonicalLegacyGroupKey(badge);
            const legacyBaseTitle = extractLegacyBaseTitle(badge);
            grouped.set(key, {
                key,
                members: [badge],
                badge: {
                    ...badge,
                    nome: canonicalLegacyName || badge.nome,
                    legacyGroupKey: canonicalLegacyGroupKey || badge.legacyGroupKey,
                    legacyBaseTitle: legacyBaseTitle || badge.legacyBaseTitle,
                    ocorrencias: getBadgeOccurrences(badge),
                    stackCount: getBadgeStackCount(badge),
                    latestOccurrenceId: getLatestBadgeOccurrence(badge).id,
                    data: getBadgeDisplayDate(badge),
                    descricao: getBadgeDisplayDescription(badge),
                },
            });
            return;
        }

        const mergedOccurrences = [...getBadgeOccurrences(existing.badge)];
        const knownIds = new Set(mergedOccurrences.map((occurrence) => occurrence.id));

        getBadgeOccurrences(badge).forEach((occurrence) => {
            if (knownIds.has(occurrence.id)) return;
            mergedOccurrences.push(occurrence);
            knownIds.add(occurrence.id);
        });

        mergedOccurrences.sort((left, right) => {
            const dateDiff = compareBadgeDates(left.data, right.data);
            if (dateDiff !== 0) return dateDiff;
            return String(left.id || '').localeCompare(String(right.id || ''));
        });

        const latestOccurrence = mergedOccurrences[mergedOccurrences.length - 1] || getLatestBadgeOccurrence(existing.badge);
        const canonicalLegacyName = getCanonicalLegacyBadgeName(existing.badge) || getCanonicalLegacyBadgeName(badge);
        const canonicalLegacyGroupKey = getCanonicalLegacyGroupKey(existing.badge) || getCanonicalLegacyGroupKey(badge);
        const legacyBaseTitle = extractLegacyBaseTitle(existing.badge) || extractLegacyBaseTitle(badge);
        const preferredBadge = getPreferredBadgeForGroup(existing.badge, badge);
        grouped.set(key, {
            key,
            members: [...existing.members, badge],
            badge: {
                ...preferredBadge,
                nome: canonicalLegacyName || existing.badge.nome,
            legacyGroupKey: canonicalLegacyGroupKey || preferredBadge.legacyGroupKey,
            legacyBaseTitle: legacyBaseTitle || preferredBadge.legacyBaseTitle,
                descricao: latestOccurrence.descricao || preferredBadge.descricao,
                data: latestOccurrence.data || preferredBadge.data,
                latestOccurrenceId: latestOccurrence.id,
                ocorrencias: mergedOccurrences,
                stackCount: mergedOccurrences.length,
            },
        });
    });

    return Array.from(grouped.values()).sort((left, right) => {
        const diff = getBadgeWeight(right.badge.raridade) - getBadgeWeight(left.badge.raridade);
        if (diff !== 0) return diff;
        return getBadgeDisplayDate(right.badge).localeCompare(getBadgeDisplayDate(left.badge));
    });
};

export const getMergedBadgesForDisplay = (allBadges: Badge[]): Badge[] => {
    return getGroupedBadgesForDisplay(allBadges).map((group) => group.badge);
};

export const sortBadgesForGallery = (
    badges: Badge[],
    sortBy: BadgeGallerySortOption = 'recentes',
): Badge[] => {
    return [...badges].sort((left, right) => {
        if (sortBy === 'raras') {
            const rarityDiff = getBadgeWeight(right.raridade) - getBadgeWeight(left.raridade);
            if (rarityDiff !== 0) return rarityDiff;
        }

        const dateDiff = parseBadgeDateValue(getBadgeDisplayDate(right)) - parseBadgeDateValue(getBadgeDisplayDate(left));
        if (dateDiff !== 0) return dateDiff;

        if (sortBy === 'recentes') {
            const rarityDiff = getBadgeWeight(right.raridade) - getBadgeWeight(left.raridade);
            if (rarityDiff !== 0) return rarityDiff;
        }

        return String(right.nome || '').localeCompare(String(left.nome || ''));
    });
};

export const canRemoveBadgeDirectly = (badge: Badge): boolean => {
    return getBadgeStackCount(badge) <= 1;
};

export const resolveLegacyBadgeCanonicalFields = (badge: Badge): Pick<Badge, 'legacyGroupKey' | 'legacyBaseTitle'> | null => {
    const legacyBaseTitle = extractLegacyBaseTitle(badge);
    if (!legacyBaseTitle) return null;

    return {
        legacyBaseTitle,
        legacyGroupKey: buildLegacyGroupKeyFromBaseTitle(legacyBaseTitle, badge.categoria),
    };
};

