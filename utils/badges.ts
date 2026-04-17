/**
 * utils/badges.ts
 *
 * Fonte única de verdade para o sistema de conquistas da ANCB.
 * Importe daqui em: ProfileView, JogadoresView, AdminView e Cloud Functions (via cópia/shared).
 */

import { Badge, BadgeOccurrence, ConquistaRegra } from '../types';

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

const compareBadgeDates = (left?: string, right?: string): number => {
    return String(left || '').localeCompare(String(right || ''));
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
    const validPinned = pinnedIds.filter(id => id && id.length > 0);
    if (validPinned.length > 0) {
        // preserve pinnedIds order so slot position = display position
        return validPinned
            .map(id => allBadges.find(b => b.id === id))
            .filter(Boolean) as Badge[];
    }
    return [...allBadges]
        .sort((a, b) => {
            const diff = getBadgeWeight(b.raridade) - getBadgeWeight(a.raridade);
            return diff !== 0 ? diff : getBadgeDisplayDate(b).localeCompare(getBadgeDisplayDate(a));
        })
        .slice(0, maxDisplay);
};

