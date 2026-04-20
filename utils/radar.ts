import { Player, ReviewAttributeMap, ReviewQuizConfig } from '../types';
import {
    ATTRIBUTE_KEYS,
    calculateAttributeDeltasFromTagCounts,
    createEmptyAttributeMap,
    hasAttributeMapValues,
    roundAttributeMap,
} from './reviewQuiz';

export interface RadarStats {
    ataque: number;
    defesa: number;
    velocidade: number;
    forca: number;
    visao: number;
}

interface RadarComputationOptions {
    attributeDeltas?: ReviewAttributeMap | null;
    legacyTagCounts?: Record<string, number> | null;
    populationPlayers?: Array<Pick<Player, 'stats_atributos' | 'stats_tags'>>;
    quizConfig?: Partial<ReviewQuizConfig> | null;
}

const MIN_VISUAL_STAT = 18;
const MAX_VISUAL_STAT = 96;
const EMPTY_RADAR_STATS: RadarStats = { ataque: 50, defesa: 50, velocidade: 50, forca: 50, visao: 50 };

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const quantile = (values: number[], percentile: number): number => {
    if (values.length === 0) return 0;
    if (values.length === 1) return values[0];
    const position = (values.length - 1) * percentile;
    const base = Math.floor(position);
    const rest = position - base;
    const lower = values[base];
    const upper = values[base + 1] ?? lower;
    return lower + ((upper - lower) * rest);
};

export const resolvePlayerAttributeTotals = (
    attributeDeltas?: ReviewAttributeMap | null,
    legacyTagCounts?: Record<string, number> | null,
    quizConfig?: Partial<ReviewQuizConfig> | null,
) => {
    if (hasAttributeMapValues(attributeDeltas)) {
        return roundAttributeMap(attributeDeltas || createEmptyAttributeMap());
    }
    return calculateAttributeDeltasFromTagCounts(legacyTagCounts, quizConfig);
};

export const calculateRelativeRadarStats = ({
    attributeDeltas,
    legacyTagCounts,
    populationPlayers = [],
    quizConfig,
}: RadarComputationOptions): RadarStats => {
    const currentTotals = resolvePlayerAttributeTotals(attributeDeltas, legacyTagCounts, quizConfig);
    const populationTotals = populationPlayers.map((player) => resolvePlayerAttributeTotals(player.stats_atributos, player.stats_tags, quizConfig));

    if (!populationTotals.length) {
        return EMPTY_RADAR_STATS;
    }

    const nextStats = { ...EMPTY_RADAR_STATS };

    ATTRIBUTE_KEYS.forEach((attributeKey) => {
        const distribution = populationTotals
            .map((totals) => Number(totals[attributeKey] || 0))
            .filter((value) => Number.isFinite(value))
            .sort((left, right) => left - right);

        if (!distribution.length) {
            nextStats[attributeKey] = 50;
            return;
        }

        const currentValue = Number(currentTotals[attributeKey] || 0);
        const minValue = Math.min(quantile(distribution, 0.1), currentValue, 0);
        const maxValue = Math.max(quantile(distribution, 0.9), currentValue, 1);

        if (maxValue === minValue) {
            nextStats[attributeKey] = 50;
            return;
        }

        const normalized = ((currentValue - minValue) / (maxValue - minValue)) * 100;
        nextStats[attributeKey] = Math.round(clamp(normalized, MIN_VISUAL_STAT, MAX_VISUAL_STAT));
    });

    return nextStats;
};

export const hasRadarSourceData = (
    attributeDeltas?: ReviewAttributeMap | null,
    legacyTagCounts?: Record<string, number> | null,
    quizConfig?: Partial<ReviewQuizConfig> | null,
): boolean => hasAttributeMapValues(resolvePlayerAttributeTotals(attributeDeltas, legacyTagCounts, quizConfig));