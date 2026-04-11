/**
 * utils/badges.ts
 *
 * Fonte única de verdade para o sistema de conquistas da ANCB.
 * Importe daqui em: ProfileView, JogadoresView, AdminView e Cloud Functions (via cópia/shared).
 */

import { Badge } from '../types';

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
// CATÁLOGO DE BADGES
//
// BADGES DE EVENTO: concedidas automaticamente ao finalizar um evento.
// IDs são dinâmicos — levam o slug do evento (ex: campiao_jogos_abertos_2025).
//
// BADGES DE TEMPORADA: concedidas pelo admin ao fechar a temporada.
// IDs levam o ano (ex: rei_quadra_2025).
//
// As entradas abaixo são os TEMPLATES para exibição no Admin.
// ─────────────────────────────────────────────────────────────
export interface BadgeDefinition {
    id: string;
    nome: string;
    emoji: string;
    descricao: string;
    categoria: Badge['categoria'];
    raridade: Badge['raridade'];
    tipo: 'evento' | 'temporada' | 'manual';
    criterio?: {
        tipo: 'tag_count';
        tag: string;
        minCount: number;
    } | {
        tipo: 'all_around';
    };
}

export const BADGE_CATALOG: BadgeDefinition[] = [
    // ── POR EVENTO ───────────────────────────────────────────
    { tipo: 'evento',    id: 'estava_la',       nome: 'Estava Lá',          emoji: '🏀', categoria: 'partida',   raridade: 'comum',    descricao: 'Participou do evento.' },
    { tipo: 'evento',    id: 'campiao',         nome: 'Campeão',            emoji: '🏆', categoria: 'temporada', raridade: 'epica',    descricao: 'Integrou o time campeão do evento.' },
    { tipo: 'evento',    id: 'vice',            nome: 'Vice',               emoji: '🥈', categoria: 'temporada', raridade: 'rara',     descricao: 'Integrou o time vice-campeão do evento.' },
    { tipo: 'evento',    id: 'podio',           nome: 'Pódio',              emoji: '🥉', categoria: 'temporada', raridade: 'rara',     descricao: 'Integrou o time que ficou em 3º lugar.' },
    { tipo: 'evento',    id: 'cestinha',        nome: 'Cestinha',           emoji: '👑', categoria: 'partida',   raridade: 'rara',     descricao: 'Maior pontuador do evento.' },
    { tipo: 'evento',    id: 'bola_quente',     nome: 'Bola Quente',        emoji: '💥', categoria: 'partida',   raridade: 'comum',    descricao: 'Marcou 10+ pontos em um único jogo.' },
    { tipo: 'evento',    id: 'imparavel',       nome: 'Imparável',          emoji: '☄️', categoria: 'partida',   raridade: 'rara',     descricao: 'Marcou 20+ pontos em um único jogo.' },
    { tipo: 'evento',    id: 'primeira_bomba',  nome: 'Tiro Certo',         emoji: '🏹', categoria: 'partida',   raridade: 'comum',    descricao: 'Converteu pelo menos 1 cesta de 3 pontos.' },
    { tipo: 'evento',    id: 'atirador',        nome: 'Mão Quente',         emoji: '👌', categoria: 'partida',   raridade: 'rara',     descricao: 'Converteu 3+ cestas de 3 pontos.' },
    { tipo: 'evento',    id: 'atirador_elite',  nome: 'Mira Calibrada',     emoji: '🎯', categoria: 'partida',   raridade: 'epica',    descricao: 'Converteu 5+ cestas de 3 pontos.' },

    // ── POR TEMPORADA ────────────────────────────────────────
    { tipo: 'temporada', id: 'rei_quadra',      nome: 'Rei da Quadra',      emoji: '👑', categoria: 'temporada', raridade: 'lendaria', descricao: 'Maior pontuador da temporada.' },
    { tipo: 'temporada', id: 'chama_viva',      nome: 'Chama Viva',         emoji: '🔥', categoria: 'temporada', raridade: 'epica',    descricao: '2º maior pontuador da temporada.' },
    { tipo: 'temporada', id: 'forca_bruta',     nome: 'Força Bruta',        emoji: '⚡', categoria: 'temporada', raridade: 'epica',    descricao: '3º maior pontuador da temporada.' },
    { tipo: 'temporada', id: 'mao_ouro',        nome: 'Sniper de Elite',    emoji: '🏹', categoria: 'temporada', raridade: 'lendaria', descricao: 'O melhor da liga em bolas de 3 na temporada.' },
    { tipo: 'temporada', id: 'mao_prata',       nome: 'Sniper',             emoji: '🎯', categoria: 'temporada', raridade: 'epica',    descricao: '2º lugar em cestas de 3 da temporada. Sempre perigoso.' },
    { tipo: 'temporada', id: 'mao_bronze',      nome: 'Mão Calibrada',      emoji: '🪃', categoria: 'temporada', raridade: 'epica',    descricao: '3º lugar em cestas de 3 da temporada. Precisão técnica.' },
    { tipo: 'temporada', id: 'guerreiro',       nome: 'Guerreiro da Temporada', emoji: '🗓️', categoria: 'temporada', raridade: 'rara', descricao: 'Participou de todos os eventos da temporada.' },
    { tipo: 'temporada', id: 'colecionador',    nome: 'Colecionador',       emoji: '🏅', categoria: 'temporada', raridade: 'rara',     descricao: 'Acumulou 5+ conquistas de evento na temporada.' },

    // ── MANUAL (admin concede) ───────────────────────────────
    { tipo: 'manual',    id: 'mvp_temporada',   nome: 'MVP da Temporada',   emoji: '🏆', categoria: 'temporada', raridade: 'lendaria', descricao: 'Eleito o jogador mais valioso da temporada.' },
    { tipo: 'manual',    id: 'veterano',        nome: 'Veterano',           emoji: '🎖️', categoria: 'temporada', raridade: 'rara',     descricao: 'Mais de 20 jogos disputados pela ANCB.' },
];


// ─────────────────────────────────────────────────────────────
// HELPERS DE EXIBIÇÃO
// Era: copiados em ProfileView.tsx e JogadoresView.tsx.
// Agora: fonte única.
// ─────────────────────────────────────────────────────────────
export interface RarityStyle {
    label: string;
    classes: string;
}

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
    if (pinnedIds.length > 0) {
        return allBadges.filter(b => pinnedIds.includes(b.id));
    }
    return [...allBadges]
        .sort((a, b) => {
            const diff = getBadgeWeight(b.raridade) - getBadgeWeight(a.raridade);
            return diff !== 0 ? diff : b.data.localeCompare(a.data);
        })
        .slice(0, maxDisplay);
};

// ─────────────────────────────────────────────────────────────
// LÓGICA DE CONCESSÃO (usada pela Cloud Function e pelo Admin)
// ─────────────────────────────────────────────────────────────

/**
 * Avalia quais badges um jogador deve receber com base na contagem
 * atual de tags e atributos. Retorna apenas as NOVAS badges que
 * ainda não foram concedidas.
 *
 * Pode ser chamada no frontend (admin manual) e replicada nas
 * Cloud Functions (onReviewSubmitted).
 */
export const evaluateNewBadges = (
    currentBadges: Badge[],
    statsTags: Record<string, number>,
    statsAtributos: { ataque?: number; defesa?: number; velocidade?: number; forca?: number; visao?: number },
): BadgeDefinition[] => {
    const existingIds = new Set(currentBadges.map(b => b.id));
    const newBadges: BadgeDefinition[] = [];

    for (const def of BADGE_CATALOG) {
        if (existingIds.has(def.id)) continue;    // já tem
        if (!def.criterio) continue;               // manual — pula
        if (def.criterio.tipo !== 'tag_count') continue;

        const count = statsTags[def.criterio.tag] ?? 0;
        if (count >= def.criterio.minCount) {
            newBadges.push(def);
        }
    }

    // Critério all_around: todos os atributos >= 50
    if (!existingIds.has('all_around')) {
        const attrs = Object.values(statsAtributos);
        if (attrs.length === 5 && attrs.every(v => (v ?? 0) >= 50)) {
            const def = BADGE_CATALOG.find(b => b.id === 'all_around');
            if (def) newBadges.push(def);
        }
    }

    return newBadges;
};

/**
 * Cria um objeto Badge pronto para salvar no Firestore.
 */
export const buildBadge = (def: BadgeDefinition, gameId?: string): Badge => ({
    id: def.id,
    nome: def.nome,
    emoji: def.emoji,
    categoria: def.categoria,
    raridade: def.raridade,
    descricao: def.descricao,
    data: new Date().toISOString().split('T')[0],
    ...(gameId ? { gameId } : {}),
});
