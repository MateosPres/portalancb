import React, { useState, useEffect } from 'react';
import { Time, Evento } from '../types';
import { Modal } from './Modal';
import { Button } from './Button';
import {
    LucidePlus, LucideTrash2, LucideGripVertical, LucideChevronRight,
    LucideNetwork, LucideList, LucideX, LucideCheck, LucideChevronDown,
    LucideChevronUp
} from 'lucide-react';

interface ChaaveConfiguratorProps {
    isOpen: boolean;
    onClose: () => void;
    event: Evento;
    onSave: (updatedEvent: Evento) => Promise<void>;
}

interface ChaveState {
    nome: string;
    times: Time[];
}

export const ChaaveConfigurator: React.FC<ChaaveConfiguratorProps> = ({
    isOpen,
    onClose,
    event,
    onSave
}) => {
    const [formato, setFormato] = useState<'grupo_unico' | 'chaveamento'>(event.formato || 'grupo_unico');
    const [chaves, setChaves] = useState<ChaveState[]>([]);
    const [timesDisponiveis, setTimesDisponiveis] = useState<Time[]>([]);
    const [novaChave, setNovaChave] = useState('');
    const [draggedTime, setDraggedTime] = useState<{ timeId: string; source: 'disponivel' | string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [expandedChave, setExpandedChave] = useState<string | null>(null);

    // Initialize state
    useEffect(() => {
        if (!isOpen) return;

        setFormato(event.formato || 'grupo_unico');

        if (event.timesParticipantes) {
            // Group times by "grupo"
            const grouped: Record<string, Time[]> = {};
            const sem_grupo: Time[] = [];

            event.timesParticipantes.forEach(time => {
                if (time.grupo && time.grupo.trim()) {
                    if (!grouped[time.grupo]) {
                        grouped[time.grupo] = [];
                    }
                    grouped[time.grupo].push(time);
                } else {
                    sem_grupo.push(time);
                }
            });

            const chavasArray: ChaveState[] = Object.entries(grouped).map(([nome, times]) => ({
                nome,
                times
            }));

            setChaves(chavasArray);
            setTimesDisponiveis(sem_grupo);

            // Auto-expand first chave
            if (chavasArray.length > 0) {
                setExpandedChave(chavasArray[0].nome);
            }
        } else {
            setChaves([]);
            setTimesDisponiveis(event.timesParticipantes || []);
        }
    }, [isOpen, event]);

    const adicionarChave = () => {
        if (!novaChave.trim()) {
            alert('Digite um nome para a chave');
            return;
        }

        if (chaves.some(c => c.nome === novaChave)) {
            alert('Essa chave já existe');
            return;
        }

        setChaves([...chaves, { nome: novaChave.trim(), times: [] }]);
        setNovaChave('');
        setExpandedChave(novaChave.trim());
    };

    const removerChave = (chaveNome: string) => {
        const chave = chaves.find(c => c.nome === chaveNome);
        if (!chave) return;

        if (chave.times.length > 0) {
            const confirma = window.confirm(
                `A chave "${chaveNome}" tem ${chave.times.length} time(s). Eles voltarão para disponíveis. Continuar?`
            );
            if (!confirma) return;

            // Move times back to available
            setTimesDisponiveis([...timesDisponiveis, ...chave.times]);
        }

        setChaves(chaves.filter(c => c.nome !== chaveNome));
        if (expandedChave === chaveNome) {
            setExpandedChave(chaves.find(c => c.nome !== chaveNome)?.nome || null);
        }
    };

    // keep a ref for the currently dragged item so we don't rely solely on state
    // updating state during a drag start can cause React to recreate the DOM node and
    // cancel the operation, which is why items "não arrastam".
    const draggedTimeRef = React.useRef<{ timeId: string; source: 'disponivel' | string } | null>(null);

    const handleDragStart = (
        timeId: string,
        source: 'disponivel' | string,
        e: React.DragEvent<HTMLDivElement>
    ) => {
        // store information in ref immediately
        draggedTimeRef.current = { timeId, source };

        // set some data on dataTransfer so browser knows it's a move
        try {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', timeId);
            // use the node itself as drag image so user sees what they're dragging
            if (e.dataTransfer.setDragImage) {
                e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
            }
        } catch (err) {
            // some browsers are strict about setData, ignore failures
        }

        // update state after the browser has begun the drag, using setTimeout
        // this avoids the dragcancelation bug described above
        setTimeout(() => {
            setDraggedTime(draggedTimeRef.current);
        }, 0);
    };

    const handleDropToChave = (chaveNome: string) => {
        const current = draggedTimeRef.current || draggedTime; // prefer ref
        if (!current) return;

        const time = current.source === 'disponivel'
            ? timesDisponiveis.find(t => t.id === current.timeId)
            : chaves.find(c => c.nome === current.source)?.times.find(t => t.id === current.timeId);

        if (!time) return;

        // Remove from source
        if (current.source === 'disponivel') {
            setTimesDisponiveis(timesDisponiveis.filter(t => t.id !== current.timeId));
        } else {
            setChaves(chaves.map(c =>
                c.nome === current.source
                    ? { ...c, times: c.times.filter(t => t.id !== current.timeId) }
                    : c
            ));
        }

        // Add to new chave
        setChaves(chaves.map(c =>
            c.nome === chaveNome
                ? { ...c, times: [...c.times, time] }
                : c
        ));

        draggedTimeRef.current = null;
        setDraggedTime(null);
    };

    const handleDropToDisponiveis = () => {
        const current = draggedTimeRef.current || draggedTime;
        if (!current || current.source === 'disponivel') return;

        const time = chaves.find(c => c.nome === current.source)?.times.find(t => t.id === current.timeId);
        if (!time) return;

        // Remove from chave
        setChaves(chaves.map(c =>
            c.nome === current.source
                ? { ...c, times: c.times.filter(t => t.id !== current.timeId) }
                : c
        ));

        // Add to disponivel
        setTimesDisponiveis([...timesDisponiveis, time]);
        draggedTimeRef.current = null;
        setDraggedTime(null);
    };

    const handleSave = async () => {
        try {
            setLoading(true);

            if (formato === 'grupo_unico') {
                // Remove grupo from all times
                const updatedTimes = (event.timesParticipantes || []).map(t => ({
                    ...t,
                    grupo: undefined
                }));

                const updated: Evento = {
                    ...event,
                    formato: 'grupo_unico',
                    timesParticipantes: updatedTimes
                };

                await onSave(updated);
            } else {
                // Apply grupos from chaves
                const allTimes = [...timesDisponiveis];
                chaves.forEach(chave => {
                    allTimes.push(...chave.times);
                });

                const updatedTimes = allTimes.map(t => {
                    const chave = chaves.find(c => c.times.some(ct => ct.id === t.id));
                    return {
                        ...t,
                        grupo: chave ? chave.nome : undefined
                    };
                });

                const updated: Evento = {
                    ...event,
                    formato: 'chaveamento',
                    timesParticipantes: updatedTimes
                };

                await onSave(updated);
            }

            onClose();
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar configuração');
        } finally {
            setLoading(false);
        }
    };

    const TimeItem: React.FC<{ time: Time; source: 'disponivel' | string }> = ({ time, source }) => (
        <div
            draggable
            onDragStart={(e) => handleDragStart(time.id, source, e)}
            onDragEnd={() => {
                // clear any drag state when operation ends (success or cancel)
                draggedTimeRef.current = null;
                setDraggedTime(null);
            }}
            className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 cursor-move hover:shadow-md transition-shadow flex items-center gap-2 group"
        >
            <LucideGripVertical size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            {time.logoUrl ? (
                <img src={time.logoUrl} alt={time.nomeTime} className="w-6 h-6 object-contain" />
            ) : (
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-ancb-blue dark:text-blue-300 font-bold text-xs">
                    {time.nomeTime.charAt(0)}
                </div>
            )}
            <span className="font-bold text-sm text-gray-800 dark:text-gray-200 truncate flex-1">
                {time.nomeTime}
            </span>
            <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                {time.jogadores.length}
            </span>
        </div>
    );

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? '' : 'hidden'}`}
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 dark:bg-black/70" />

            {/* Modal Container */}
            <div
                className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Configurar Formato do Campeonato
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <LucideX size={24} className="text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <div className="space-y-6">
                        {/* Formato Selection */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">Selecione o Formato</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Grupo Único */}
                                <button
                                    onClick={() => setFormato('grupo_unico')}
                                    className={`p-5 rounded-xl border-2 transition-all text-center ${
                                        formato === 'grupo_unico'
                                            ? 'border-ancb-blue bg-ancb-blue/10 dark:bg-ancb-blue/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-ancb-blue hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                    }`}
                                >
                                    <LucideList className="mx-auto mb-3 text-ancb-blue" size={28} />
                                    <p className="font-bold text-base text-gray-800 dark:text-white">Grupo Único</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Todos no mesmo ranking</p>
                                </button>

                                {/* Chaveamento */}
                                <button
                                    onClick={() => setFormato('chaveamento')}
                                    className={`p-5 rounded-xl border-2 transition-all text-center ${
                                        formato === 'chaveamento'
                                            ? 'border-ancb-orange bg-ancb-orange/10 dark:bg-ancb-orange/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-ancb-orange hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                    }`}
                                >
                                    <LucideNetwork className="mx-auto mb-3 text-ancb-orange" size={28} />
                                    <p className="font-bold text-base text-gray-800 dark:text-white">Chaveamento</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Dividir em grupos</p>
                                </button>
                            </div>
                        </div>

                        {/* Chaveamento Configuration */}
                        {formato === 'chaveamento' && (
                            <div className="space-y-6">
                                {/* Add Chave */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 block uppercase tracking-wider">Criar Nova Chave</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Ex: Chave A, Grupo 1, Piscina A"
                                            value={novaChave}
                                            onChange={(e) => setNovaChave(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && adicionarChave()}
                                            className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-ancb-orange"
                                        />
                                        <Button size="sm" onClick={adicionarChave} className="bg-ancb-orange hover:bg-ancb-orange/90 px-6">
                                            <LucidePlus size={18} />
                                        </Button>
                                    </div>
                                </div>

                                {/* Chaves Layout */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                    {/* Chaves */}
                                    <div className="space-y-3">
                                        {chaves.length === 0 ? (
                                            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                                                <LucideNetwork size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Nenhuma chave criada ainda</p>
                                            </div>
                                        ) : (
                                            chaves.map((chave) => (
                                                <div
                                                    key={chave.nome}
                                                    className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 rounded-lg border border-orange-200 dark:border-orange-700 overflow-hidden shadow-sm"
                                                >
                                                    {/* Chave Header */}
                                                    <button
                                                        onClick={() => setExpandedChave(expandedChave === chave.nome ? null : chave.nome)}
                                                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-orange-100/50 dark:hover:bg-orange-900/20 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <span className="font-bold text-base text-ancb-orange">{chave.nome}</span>
                                                            <span className="bg-orange-200 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                                                                {chave.times.length} {chave.times.length === 1 ? 'time' : 'times'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 ml-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removerChave(chave.nome);
                                                                }}
                                                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors flex-shrink-0"
                                                                title="Remover chave"
                                                            >
                                                                <LucideTrash2 size={16} />
                                                            </button>
                                                            {expandedChave === chave.nome ? (
                                                                <LucideChevronUp size={20} className="text-orange-600 flex-shrink-0" />
                                                            ) : (
                                                                <LucideChevronDown size={20} className="text-orange-600 flex-shrink-0" />
                                                            )}
                                                        </div>
                                                    </button>

                                                    {/* Drop Zone */}
                                                    {expandedChave === chave.nome && (
                                                        <div
                                                            onDragOver={(e) => {
                                                                e.preventDefault();
                                                                if (draggedTimeRef.current) {
                                                                    setDraggedTime(draggedTimeRef.current);
                                                                }
                                                            }}
                                                            onDragLeave={() => setDraggedTime(null)}
                                                            onDrop={() => handleDropToChave(chave.nome)}
                                                            className={`px-5 py-4 space-y-2 border-t border-orange-200 dark:border-orange-700 min-h-[180px] transition-colors ${
                                                                draggedTime
                                                                    ? 'bg-orange-100/50 dark:bg-orange-900/40'
                                                                    : 'bg-white/50 dark:bg-gray-800/50'
                                                            }`}
                                                        >
                                                            {chave.times.length === 0 ? (
                                                                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
                                                                    <p>Arraste times aqui</p>
                                                                </div>
                                                            ) : (
                                                                chave.times.map((time) => (
                                                                    <TimeItem key={time.id} time={time} source={chave.nome} />
                                                                ))
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Times Disponíveis */}
                                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-700 p-5 shadow-sm">
                                        <p className="font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2 uppercase tracking-wider text-sm">
                                            <span>Times Disponíveis</span>
                                            <span className="bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-bold px-2.5 py-1 rounded-full">
                                                {timesDisponiveis.length}
                                            </span>
                                        </p>
                                        <div
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                if (draggedTimeRef.current) {
                                                    setDraggedTime(draggedTimeRef.current);
                                                }
                                            }}
                                            onDragLeave={() => setDraggedTime(null)}
                                            onDrop={handleDropToDisponiveis}
                                            className={`space-y-2 min-h-[180px] transition-colors p-4 rounded-lg border-2 border-dashed ${
                                                draggedTime
                                                    ? 'border-blue-400 bg-blue-100/50 dark:bg-blue-900/40'
                                                    : 'border-blue-200 dark:border-blue-700 bg-white/50 dark:bg-gray-800/50'
                                            }`}
                                        >
                                            {timesDisponiveis.length === 0 ? (
                                                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
                                                    <p>✓ Todos os times foram distribuídos</p>
                                                </div>
                                            ) : (
                                                timesDisponiveis.map((time) => (
                                                    <TimeItem key={time.id} time={time} source="disponivel" />
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-lg p-5 border border-green-200 dark:border-green-700">
                                    <p className="text-sm font-bold text-green-900 dark:text-green-300 mb-3 uppercase tracking-wider">Resumo</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="bg-white dark:bg-gray-800 rounded p-3 border border-green-100 dark:border-green-900/30">
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Chaves</p>
                                            <p className="text-xl font-bold text-green-700 dark:text-green-300">{chaves.length}</p>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 rounded p-3 border border-green-100 dark:border-green-900/30">
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Distribuídos</p>
                                            <p className="text-xl font-bold text-green-700 dark:text-green-300">{chaves.reduce((acc, c) => acc + c.times.length, 0)}</p>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 rounded p-3 border border-green-100 dark:border-green-900/30">
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Disponíveis</p>
                                            <p className="text-xl font-bold text-green-700 dark:text-green-300">{timesDisponiveis.length}</p>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 rounded p-3 border border-green-100 dark:border-green-900/30">
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                                            <p className="text-xl font-bold text-green-700 dark:text-green-300">{chaves.reduce((acc, c) => acc + c.times.length, 0) + timesDisponiveis.length}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Grupo Único Info */}
                        {formato === 'grupo_unico' && (
                            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
                                <div className="flex items-start gap-3">
                                    <LucideCheck className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={24} />
                                    <div>
                                        <p className="font-bold text-blue-900 dark:text-blue-300 mb-1">Configuração: Grupo Único</p>
                                        <p className="text-sm text-blue-800 dark:text-blue-300">
                                            Todos os {event.timesParticipantes?.length || 0} times competirão em um único ranking
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50/50 dark:bg-gray-800/50">
                    <Button 
                        variant="secondary" 
                        onClick={onClose} 
                        className="flex-1"
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="inline-block animate-spin">⌛</span>
                                Salvando...
                            </span>
                        ) : (
                            'Salvar Configuração'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
