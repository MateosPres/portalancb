import { AtributoKey, ReviewAttributeMap, ReviewQuizConfig, ReviewTagDefinition } from '../types';

export const REVIEW_QUIZ_CONFIG_COLLECTION = 'app_config';
export const REVIEW_QUIZ_CONFIG_DOC_ID = 'review_quiz';

export const ATTRIBUTE_KEYS: AtributoKey[] = ['ataque', 'defesa', 'velocidade', 'forca', 'visao'];

/**
 * DEPRECATED: Review quiz tags are no longer supported.
 * All badge/conquest definitions must be created exclusively through
 * the Firestore 'conquistas_regras' collection via the admin panel.
 * Legacy quiz-based badges (muralha, sniper, garcom, etc.) have been removed.
 */
export const DEFAULT_REVIEW_TAGS: ReviewTagDefinition[] = [];

export const DEFAULT_REVIEW_QUIZ_CONFIG: ReviewQuizConfig = {
    version: 1,
    maxSelections: 3,
    multipliers: { 1: 1.0, 2: 0.75, 3: 0.55 },
    tags: [],
};

export const createEmptyAttributeMap = (): Record<AtributoKey, number> => ({
    ataque: 0,
    defesa: 0,
    velocidade: 0,
    forca: 0,
    visao: 0,
});

const normalizeImpactMap = (impact?: ReviewAttributeMap | null): ReviewAttributeMap => {
    const nextImpact: ReviewAttributeMap = {};
    ATTRIBUTE_KEYS.forEach((attributeKey) => {
        const value = Number(impact?.[attributeKey] || 0);
        if (Number.isFinite(value) && value !== 0) {
            nextImpact[attributeKey] = value;
        }
    });
    return nextImpact;
};

const sanitizeTagDefinition = (tag: ReviewTagDefinition, fallbackIndex: number): ReviewTagDefinition => ({
    id: String(tag?.id || `tag_${fallbackIndex + 1}`).trim() || `tag_${fallbackIndex + 1}`,
    label: String(tag?.label || `Tag ${fallbackIndex + 1}`).trim() || `Tag ${fallbackIndex + 1}`,
    emoji: String(tag?.emoji || '🏀').trim() || '🏀',
    type: tag?.type === 'negative' ? 'negative' : 'positive',
    description: String(tag?.description || '').trim(),
    impact: normalizeImpactMap(tag?.impact),
});

export const normalizeReviewQuizConfig = (config?: Partial<ReviewQuizConfig> | null): ReviewQuizConfig => {
    const tagsSource = Array.isArray(config?.tags) && config?.tags.length > 0
        ? config!.tags
        : DEFAULT_REVIEW_QUIZ_CONFIG.tags;

    const normalizedTags = tagsSource.map((tag, index) => sanitizeTagDefinition(tag, index));
    const configuredLimit = Number(config?.maxSelections || DEFAULT_REVIEW_QUIZ_CONFIG.maxSelections);
    const maxSelections = Math.max(1, Math.min(5, Math.round(configuredLimit)));

    const multipliers: Record<number, number> = {};
    for (let index = 1; index <= maxSelections; index += 1) {
        const fallback = DEFAULT_REVIEW_QUIZ_CONFIG.multipliers[index] ?? Math.max(0.25, 1 - ((index - 1) * 0.2));
        const configured = Number(config?.multipliers?.[index]);
        multipliers[index] = Number.isFinite(configured) && configured > 0 ? configured : fallback;
    }

    return {
        version: Math.max(1, Math.round(Number(config?.version || DEFAULT_REVIEW_QUIZ_CONFIG.version))),
        maxSelections,
        multipliers,
        tags: normalizedTags,
        updatedAt: config?.updatedAt,
        updatedBy: config?.updatedBy,
    };
};

export const getReviewQuizTagMap = (config?: Partial<ReviewQuizConfig> | null) => {
    const normalizedConfig = normalizeReviewQuizConfig(config);
    return normalizedConfig.tags.reduce<Record<string, ReviewTagDefinition>>((accumulator, tag) => {
        accumulator[tag.id] = tag;
        return accumulator;
    }, {});
};

export const roundAttributeMap = (attributeMap: ReviewAttributeMap): Record<AtributoKey, number> => {
    const rounded = createEmptyAttributeMap();
    ATTRIBUTE_KEYS.forEach((attributeKey) => {
        rounded[attributeKey] = Math.round(Number(attributeMap?.[attributeKey] || 0) * 10) / 10;
    });
    return rounded;
};

export const hasAttributeMapValues = (attributeMap?: ReviewAttributeMap | null): boolean => {
    if (!attributeMap) return false;
    return ATTRIBUTE_KEYS.some((attributeKey) => {
        const value = Number(attributeMap[attributeKey] || 0);
        return Number.isFinite(value) && value !== 0;
    });
};

export const getReviewMultiplier = (selectedCount: number, config?: Partial<ReviewQuizConfig> | null): number => {
    const normalizedConfig = normalizeReviewQuizConfig(config);
    return normalizedConfig.multipliers[selectedCount] ?? 1;
};

export const calculateReviewAttributeDeltas = (
    tagIds: string[],
    config?: Partial<ReviewQuizConfig> | null,
): { multiplier: number; attributeDeltas: Record<AtributoKey, number> } => {
    const normalizedConfig = normalizeReviewQuizConfig(config);
    const tagMap = getReviewQuizTagMap(normalizedConfig);
    const multiplier = getReviewMultiplier(tagIds.length, normalizedConfig);
    const attributeDeltas = createEmptyAttributeMap();

    tagIds.forEach((tagId) => {
        const tag = tagMap[tagId];
        if (!tag) return;
        ATTRIBUTE_KEYS.forEach((attributeKey) => {
            attributeDeltas[attributeKey] += Number(tag.impact?.[attributeKey] || 0) * multiplier;
        });
    });

    return {
        multiplier,
        attributeDeltas: roundAttributeMap(attributeDeltas),
    };
};

export const resolveStoredReviewAttributeDeltas = (
    review: { tags?: string[]; attributeDeltas?: ReviewAttributeMap | null },
    config?: Partial<ReviewQuizConfig> | null,
): Record<AtributoKey, number> => {
    if (hasAttributeMapValues(review?.attributeDeltas)) {
        return roundAttributeMap(review.attributeDeltas || createEmptyAttributeMap());
    }
    return calculateReviewAttributeDeltas(Array.isArray(review?.tags) ? review.tags : [], config).attributeDeltas;
};

export const calculateAttributeDeltasFromTagCounts = (
    tagCounts?: Record<string, number> | null,
    config?: Partial<ReviewQuizConfig> | null,
): Record<AtributoKey, number> => {
    const normalizedConfig = normalizeReviewQuizConfig(config);
    const tagMap = getReviewQuizTagMap(normalizedConfig);
    const totals = createEmptyAttributeMap();

    Object.entries(tagCounts || {}).forEach(([tagId, count]) => {
        const tag = tagMap[tagId];
        const numericCount = Number(count || 0);
        if (!tag || !Number.isFinite(numericCount) || numericCount === 0) return;
        ATTRIBUTE_KEYS.forEach((attributeKey) => {
            totals[attributeKey] += Number(tag.impact?.[attributeKey] || 0) * numericCount;
        });
    });

    return roundAttributeMap(totals);
};