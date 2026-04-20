import React, { useEffect, useState } from 'react';
import { LucideLoader2, LucidePlus, LucideRefreshCw, LucideSave, LucideTrash2 } from 'lucide-react';
import { auth, db } from '../services/firebase';
import { AtributoKey, ReviewQuizConfig, ReviewTagDefinition } from '../types';
import { Button } from './Button';
import { TagEditModal } from './TagEditModal';
import { useReviewQuizConfig } from '../hooks/useReviewQuizConfig';
import {
    ATTRIBUTE_KEYS,
    DEFAULT_REVIEW_QUIZ_CONFIG,
    REVIEW_QUIZ_CONFIG_COLLECTION,
    REVIEW_QUIZ_CONFIG_DOC_ID,
    normalizeReviewQuizConfig,
} from '../utils/reviewQuiz';

const ATTRIBUTE_LABELS: Record<AtributoKey, string> = {
    ataque: 'ATQ',
    defesa: 'DEF',
    velocidade: 'VEL',
    forca: 'FOR',
    visao: 'VIS',
};

const createNewTag = (index: number): ReviewTagDefinition => ({
    id: `nova_tag_${index + 1}`,
    label: `Nova Tag ${index + 1}`,
    emoji: '🏀',
    type: 'positive',
    description: '',
    impact: {},
});

export const AdminReviewQuizView: React.FC = () => {
    const { config, loading } = useReviewQuizConfig();
    const [draftConfig, setDraftConfig] = useState<ReviewQuizConfig>(DEFAULT_REVIEW_QUIZ_CONFIG);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
    const editingTag = editingTagIndex !== null ? draftConfig.tags[editingTagIndex] ?? null : null;
    const groupedTags = [
        {
            key: 'positive',
            title: 'Tags positivas',
            description: 'Destaques e pontos fortes percebidos nas avaliacoes.',
            emptyLabel: 'Nenhuma tag positiva cadastrada.',
            accentClassName: 'text-green-600 dark:text-green-300',
            borderClassName: 'border-green-200/70 dark:border-green-900/40',
            tags: draftConfig.tags
                .map((tag, index) => ({ tag, index }))
                .filter(({ tag }) => tag.type === 'positive'),
        },
        {
            key: 'negative',
            title: 'Tags negativas',
            description: 'Pontos de atencao e comportamentos abaixo do esperado.',
            emptyLabel: 'Nenhuma tag negativa cadastrada.',
            accentClassName: 'text-red-600 dark:text-red-300',
            borderClassName: 'border-red-200/70 dark:border-red-900/40',
            tags: draftConfig.tags
                .map((tag, index) => ({ tag, index }))
                .filter(({ tag }) => tag.type === 'negative'),
        },
    ] as const;

    useEffect(() => {
        setDraftConfig(config);
    }, [config]);

    const handleMaxSelectionsChange = (value: string) => {
        const nextLimit = Math.max(1, Math.min(5, Number(value) || 1));
        setDraftConfig((previous) => {
            const nextMultipliers: Record<number, number> = { ...previous.multipliers };
            for (let index = 1; index <= nextLimit; index += 1) {
                if (typeof nextMultipliers[index] !== 'number') {
                    nextMultipliers[index] = Math.max(0.25, 1 - ((index - 1) * 0.2));
                }
            }
            Object.keys(nextMultipliers).forEach((key) => {
                const numericKey = Number(key);
                if (numericKey > nextLimit) delete nextMultipliers[numericKey];
            });

            return normalizeReviewQuizConfig({
                ...previous,
                maxSelections: nextLimit,
                multipliers: nextMultipliers,
            });
        });
    };

    const handleMultiplierChange = (selectionCount: number, value: string) => {
        const numericValue = Number(String(value).replace(',', '.'));
        setDraftConfig((previous) => normalizeReviewQuizConfig({
            ...previous,
            multipliers: {
                ...previous.multipliers,
                [selectionCount]: Number.isFinite(numericValue) ? numericValue : previous.multipliers[selectionCount],
            },
        }));
    };


    const handleTagSave = (index: number, updatedTag: ReviewTagDefinition) => {
        setDraftConfig((previous) => {
            const nextTags = [...previous.tags];
            nextTags[index] = updatedTag;
            return normalizeReviewQuizConfig({ ...previous, tags: nextTags });
        });
        setEditingTagIndex(null);
    };

    const handleAddTag = () => {
        setDraftConfig((previous) => normalizeReviewQuizConfig({
            ...previous,
            tags: [...previous.tags, createNewTag(previous.tags.length)],
        }));
    };

    const handleRemoveTag = (index: number) => {
        setDraftConfig((previous) => normalizeReviewQuizConfig({
            ...previous,
            tags: previous.tags.filter((_, currentIndex) => currentIndex !== index),
        }));
        if (editingTagIndex === index) setEditingTagIndex(null);
    };

    const handleResetDefaults = () => {
        setDraftConfig(DEFAULT_REVIEW_QUIZ_CONFIG);
        setFeedback('Configuracao restaurada para o padrao local. Salve para publicar.');
    };

    const handleSave = async () => {
        setSaving(true);
        setFeedback(null);
        try {
            const normalizedConfig = normalizeReviewQuizConfig({
                ...draftConfig,
                version: Number(config.version || 0) + 1,
                updatedAt: new Date().toISOString(),
                updatedBy: auth.currentUser?.uid || 'unknown',
            });

            await db.collection(REVIEW_QUIZ_CONFIG_COLLECTION).doc(REVIEW_QUIZ_CONFIG_DOC_ID).set(normalizedConfig, { merge: true });
            setFeedback('Configuracao do quiz salva e publicada com sucesso.');
        } catch (error) {
            console.error('Erro ao salvar configuracao do quiz:', error);
            setFeedback('Erro ao salvar configuracao do quiz.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">Quiz de Avaliacao</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie tags, impactos nos atributos, multiplicadores e limite de selecao.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={handleResetDefaults} disabled={saving || loading}>
                        <LucideRefreshCw size={14} /> Restaurar padrao
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving || loading}>
                        {saving ? <LucideLoader2 size={14} className="animate-spin" /> : <LucideSave size={14} />} Salvar configuracao
                    </Button>
                </div>
            </div>

            {feedback && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
                    {feedback}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
                    <label className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">Limite de selecao</label>
                    <input
                        type="number"
                        min="1"
                        max="5"
                        value={draftConfig.maxSelections}
                        onChange={(event) => handleMaxSelectionsChange(event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
                    <label className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">Versao publicada</label>
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                        v{config.version}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h4 className="mb-3 text-sm font-black uppercase tracking-wider text-gray-600 dark:text-gray-300">Multiplicadores por quantidade selecionada</h4>
                <div className="grid gap-3 md:grid-cols-3">
                    {Array.from({ length: draftConfig.maxSelections }, (_, index) => index + 1).map((selectionCount) => (
                        <div key={selectionCount} className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/80">
                            <label className="mb-1 block text-xs font-bold text-gray-500 dark:text-gray-400">{selectionCount} tag(s)</label>
                            <input
                                type="number"
                                step="0.05"
                                value={draftConfig.multipliers[selectionCount] ?? 1}
                                onChange={(event) => handleMultiplierChange(selectionCount, event.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-wider text-gray-600 dark:text-gray-300">Tags configuradas</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Cada alteracao afeta apenas novas avaliacoes. Reviews antigas mantem o delta salvo no momento da submissao.</p>
                    </div>
                    <Button size="sm" variant="secondary" onClick={handleAddTag} disabled={saving || loading}>
                        <LucidePlus size={14} /> Nova tag
                    </Button>
                </div>

                <div className="space-y-4">
                    {groupedTags.map((group) => (
                        <section key={group.key} className={`rounded-2xl border bg-white/50 p-3 dark:bg-gray-900/10 ${group.borderClassName}`}>
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                    <h5 className={`text-sm font-black uppercase tracking-wider ${group.accentClassName}`}>{group.title}</h5>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{group.description}</p>
                                </div>
                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                                    {group.tags.length}
                                </span>
                            </div>

                            {group.tags.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-gray-200 px-3 py-4 text-sm text-gray-400 dark:border-gray-700 dark:text-gray-500">
                                    {group.emptyLabel}
                                </div>
                            ) : (
                                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                    {group.tags.map(({ tag, index }) => (
                                        <div key={`${tag.id}-${index}`} className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition-colors hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600">
                                            <div className="mb-3 flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg dark:bg-gray-700/70">{tag.emoji}</span>
                                                        <div className="min-w-0">
                                                            <div className="truncate text-sm font-black text-gray-900 dark:text-white">{tag.label}</div>
                                                            <div className="truncate text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">{tag.id}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingTagIndex(index)}
                                                        className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-bold text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:text-white"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTag(index)}
                                                        disabled={draftConfig.tags.length <= 1 || saving}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:text-gray-300 dark:hover:border-red-500/50 dark:hover:text-red-300"
                                                    >
                                                        <LucideTrash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            <p className="mb-3 line-clamp-2 min-h-9 text-xs leading-5 text-gray-500 dark:text-gray-300">
                                                {tag.description || 'Sem descricao cadastrada.'}
                                            </p>

                                            <div className="grid grid-cols-5 gap-1.5">
                                                {ATTRIBUTE_KEYS.map((attributeKey) => {
                                                    const impactValue = tag.impact?.[attributeKey] ?? 0;
                                                    const isPositive = impactValue > 0;
                                                    const isNegative = impactValue < 0;

                                                    return (
                                                        <div key={attributeKey} className="rounded-xl border border-gray-200 bg-gray-50 px-2 py-2 text-center dark:border-gray-700 dark:bg-gray-900/40">
                                                            <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">{ATTRIBUTE_LABELS[attributeKey]}</div>
                                                            <div className={`mt-1 text-sm font-black ${isPositive ? 'text-emerald-600 dark:text-emerald-300' : isNegative ? 'text-rose-600 dark:text-rose-300' : 'text-gray-700 dark:text-gray-200'}`}>
                                                                {impactValue > 0 ? `+${impactValue}` : impactValue}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    ))}
                </div>

                {editingTag && editingTagIndex !== null && (
                    <TagEditModal
                        tag={editingTag}
                        open={editingTagIndex !== null}
                        onClose={() => setEditingTagIndex(null)}
                        onSave={(updatedTag) => handleTagSave(editingTagIndex, updatedTag)}
                    />
                )}
            </div>
        </div>
    );
};