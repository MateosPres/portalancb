import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { LucideArrowUp, LucideArrowDown, LucideTrash2, LucideGripVertical, LucidePlus, LucideHeart } from 'lucide-react';
import { Button } from './Button';

interface Apoiador {
    id: string;
    nome: string;
    logoBase64: string;
    site?: string;
    descricao?: string;
    destaque?: boolean;
    ordem?: number;
}

interface ApoiadoresManagerProps {
    isSavingApoiador: boolean;
    showApoiadorForm: boolean;
    apoiadorNome: string;
    apoiadorSite: string;
    apoiadorDescricao: string;
    apoiadorDestaque: boolean;
    apoiadorLogoPreview: string | null;
    onSetShowForm: (show: boolean) => void;
    onSetNome: (nome: string) => void;
    onSetSite: (site: string) => void;
    onSetDescricao: (desc: string) => void;
    onSetDestaque: (destaque: boolean) => void;
    onSetLogoPreview: (preview: string | null) => void;
    onHandleLogoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onHandleSalvar: (e: React.FormEvent) => Promise<void>;
    apoiadores: Apoiador[];
    onDeleteApoiador: (id: string, nome: string) => Promise<void>;
    onToggleDestaque: (id: string, atual: boolean) => Promise<void>;
}

export const ApoiadoresManager: React.FC<ApoiadoresManagerProps> = ({
    isSavingApoiador,
    showApoiadorForm,
    apoiadorNome,
    apoiadorSite,
    apoiadorDescricao,
    apoiadorDestaque,
    apoiadorLogoPreview,
    onSetShowForm,
    onSetNome,
    onSetSite,
    onSetDescricao,
    onSetDestaque,
    onSetLogoPreview,
    onHandleLogoSelect,
    onHandleSalvar,
    apoiadores,
    onDeleteApoiador,
    onToggleDestaque,
}) => {
    const [draggedItem, setDraggedItem] = useState<string | null>(null);

    const moveUp = async (index: number) => {
        if (index === 0) return;
        
        const newList = [...apoiadores];
        [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
        
        await Promise.all([
            db.collection('apoiadores').doc(newList[index].id).update({ ordem: index }),
            db.collection('apoiadores').doc(newList[index - 1].id).update({ ordem: index - 1 })
        ]);
    };

    const moveDown = async (index: number) => {
        if (index === apoiadores.length - 1) return;
        
        const newList = [...apoiadores];
        [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
        
        await Promise.all([
            db.collection('apoiadores').doc(newList[index].id).update({ ordem: index }),
            db.collection('apoiadores').doc(newList[index + 1].id).update({ ordem: index + 1 })
        ]);
    };

    const handleDragStart = (id: string) => {
        setDraggedItem(id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (targetIndex: number) => {
        if (!draggedItem) return;

        const draggedIndex = apoiadores.findIndex(a => a.id === draggedItem);
        if (draggedIndex === targetIndex) return;

        const newList = [...apoiadores];
        const [draggedApoiador] = newList.splice(draggedIndex, 1);
        newList.splice(targetIndex, 0, draggedApoiador);

        const updates = newList.map((apoiador, newIndex) => 
            db.collection('apoiadores').doc(apoiador.id).update({ ordem: newIndex })
        );
        
        await Promise.all(updates);
        setDraggedItem(null);
    };

    return (
        <div className="animate-fadeIn space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">Apoiadores</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{apoiadores.length} cadastrado(s)</p>
                </div>
                <button
                    onClick={() => onSetShowForm(true)}
                    className="flex items-center gap-1.5 bg-ancb-orange text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-sm shadow-orange-200 dark:shadow-none"
                >
                    <LucidePlus size={16} /> Novo Apoiador
                </button>
            </div>

            {/* Lista com Drag & Drop */}
            <div className="space-y-2">
                {apoiadores.length === 0 && (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <LucideHeart size={36} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-400 text-sm font-medium">Nenhum apoiador cadastrado ainda.</p>
                        <p className="text-gray-400 text-xs mt-1">Clique em "Novo Apoiador" para começar.</p>
                    </div>
                )}
                {apoiadores.map((a: Apoiador, index: number) => (
                    <div
                        key={a.id}
                        draggable
                        onDragStart={() => handleDragStart(a.id)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(index)}
                        className={`flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-all ${
                            draggedItem === a.id ? 'opacity-50 scale-95' : ''
                        }`}
                    >
                        <LucideGripVertical 
                            size={20} 
                            className="text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0"
                        />

                        <div className="w-14 h-14 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-600">
                            <img src={a.logoBase64} alt={a.nome} className="w-12 h-12 object-contain" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="font-bold text-sm text-gray-900 dark:text-white">{a.nome}</p>
                                {a.destaque && (
                                    <span className="text-[9px] font-black bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                                        ⭐ Destaque
                                    </span>
                                )}
                            </div>
                            {a.site && <p className="text-[11px] text-ancb-blue dark:text-blue-400 truncate">{a.site}</p>}
                            {a.descricao && <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{a.descricao}</p>}
                        </div>

                        <div className="flex gap-1 flex-shrink-0">
                            <button
                                onClick={() => moveUp(index)}
                                disabled={index === 0}
                                className="p-2 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Mover para cima"
                            >
                                <LucideArrowUp size={18} className="text-gray-700 dark:text-gray-300" />
                            </button>

                            <button
                                onClick={() => moveDown(index)}
                                disabled={index === apoiadores.length - 1}
                                className="p-2 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Mover para baixo"
                            >
                                <LucideArrowDown size={18} className="text-gray-700 dark:text-gray-300" />
                            </button>

                            <button
                                onClick={() => onToggleDestaque(a.id, a.destaque || false)}
                                title={a.destaque ? 'Remover destaque' : 'Marcar como destaque'}
                                className={`p-2 rounded-lg text-sm transition-all ${a.destaque ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-yellow-500'}`}
                            >
                                ⭐
                            </button>

                            <button
                                onClick={() => onDeleteApoiador(a.id, a.nome)}
                                className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-all"
                            >
                                <LucideTrash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Novo Apoiador */}
            {showApoiadorForm && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <LucideHeart size={18} className="text-ancb-orange" fill="currentColor" />
                                <h4 className="font-black text-gray-900 dark:text-white">Novo Apoiador</h4>
                            </div>
                            <button onClick={() => onSetShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-xl font-bold">×</button>
                        </div>
                        <form onSubmit={onHandleSalvar} className="p-5 space-y-4">
                            {/* Upload Logo */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
                                    Logo do Apoiador *
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800 flex-shrink-0">
                                        {apoiadorLogoPreview
                                            ? <img src={apoiadorLogoPreview} alt="preview" className="w-18 h-18 object-contain p-1" />
                                            : <span className="text-3xl">🏢</span>
                                        }
                                    </div>
                                    <div className="flex-1">
                                        <label className="cursor-pointer inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-bold px-3 py-2.5 rounded-lg transition-all">
                                            📁 Escolher Logo
                                            <input type="file" accept="image/*" onChange={onHandleLogoSelect} className="hidden" />
                                        </label>
                                        <p className="text-[10px] text-gray-400 mt-1.5 leading-tight">
                                            PNG, JPG ou WebP.<br />
                                            Comprimida automaticamente para &lt;50KB em WebP.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Nome */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Nome *</label>
                                <input
                                    required
                                    className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:text-white dark:border-gray-600 text-sm focus:ring-2 focus:ring-ancb-orange outline-none transition-all"
                                    placeholder="Ex: Farmácia Central"
                                    value={apoiadorNome}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSetNome(e.target.value)}
                                />
                            </div>

                            {/* Site */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Site / Link (opcional)</label>
                                <input
                                    className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:text-white dark:border-gray-600 text-sm focus:ring-2 focus:ring-ancb-orange outline-none transition-all"
                                    placeholder="https://..."
                                    value={apoiadorSite}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSetSite(e.target.value)}
                                />
                            </div>

                            {/* Descrição */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Descrição (opcional)</label>
                                <textarea
                                    className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:text-white dark:border-gray-600 text-sm focus:ring-2 focus:ring-ancb-orange outline-none resize-none transition-all"
                                    placeholder="Uma frase curta sobre este apoiador..."
                                    rows={2}
                                    value={apoiadorDescricao}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onSetDescricao(e.target.value)}
                                />
                            </div>

                            {/* Destaque */}
                            <label className="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 border border-yellow-200 dark:border-yellow-800 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={apoiadorDestaque}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSetDestaque(e.target.checked)}
                                    className="w-4 h-4 accent-yellow-500"
                                />
                                <div>
                                    <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400">⭐ Marcar como Destaque</span>
                                    <p className="text-[10px] text-yellow-600 dark:text-yellow-500">Aparece com card grande na página de apoiadores</p>
                                </div>
                            </label>

                            <button
                                type="submit"
                                disabled={isSavingApoiador}
                                className="w-full py-3.5 bg-ancb-orange text-white font-black rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-orange-200 dark:shadow-none"
                            >
                                {isSavingApoiador ? (
                                    <><span className="animate-spin inline-block">⏳</span> Comprimindo e salvando...</>
                                ) : (
                                    <><LucideHeart size={16} fill="white" /> Salvar Apoiador</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};