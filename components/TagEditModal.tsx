import React from 'react';
import { ReviewTagDefinition, AtributoKey } from '../types';
import { ATTRIBUTE_KEYS } from '../utils/reviewQuiz';
import { Button } from './Button';

interface TagEditModalProps {
  tag: ReviewTagDefinition;
  open: boolean;
  onClose: () => void;
  onSave: (tag: ReviewTagDefinition) => void;
}

export const TagEditModal: React.FC<TagEditModalProps> = ({ tag, open, onClose, onSave }) => {
  const [draft, setDraft] = React.useState<ReviewTagDefinition>(tag);

  React.useEffect(() => {
    setDraft(tag);
  }, [tag]);

  if (!open) return null;

  const handleChange = (field: keyof ReviewTagDefinition, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleImpactChange = (attributeKey: AtributoKey, value: string) => {
    setDraft((prev) => ({
      ...prev,
      impact: { ...prev.impact, [attributeKey]: Number(value) },
    }));
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white">
          ×
        </button>
        <h2 className="text-lg font-black mb-4">Editar Tag</h2>
        <div className="grid gap-3 grid-cols-2 mb-4">
          <input
            value={draft.id}
            onChange={(e) => handleChange('id', e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="id"
          />
          <input
            value={draft.label}
            onChange={(e) => handleChange('label', e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="Nome"
          />
          <input
            value={draft.emoji}
            onChange={(e) => handleChange('emoji', e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="Emoji"
          />
          <select
            value={draft.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="positive">Positiva</option>
            <option value="negative">Negativa</option>
          </select>
        </div>
        <textarea
          value={draft.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={2}
          className="mb-4 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="Descricao da tag"
        />
        <div className="grid gap-3 grid-cols-5 mb-4">
          {ATTRIBUTE_KEYS.map((attributeKey) => (
            <div key={attributeKey} className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/70">
              <label className="mb-1 block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">{attributeKey.toUpperCase()}</label>
              <input
                type="number"
                step="0.5"
                value={draft.impact?.[attributeKey] ?? 0}
                onChange={(e) => handleImpactChange(attributeKey, e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={() => onSave(draft)}>Salvar</Button>
        </div>
      </div>
    </div>
  );
};
