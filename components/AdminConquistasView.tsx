import React, { useEffect, useMemo, useState } from 'react';
import firebase, { db, functions } from '../services/firebase';
import { ConquistaRegra, RaridadeConquista, TipoAvaliacaoConquista } from '../types';
import { Button } from './Button';
import { Modal } from './Modal';
import { uploadImageToImgBB } from '../utils/imgbb';
import { getRarityStyles } from '../utils/badges';
import {
    LucidePause,
    LucidePlay,
    LucidePencil,
    LucideTrash2,
    LucidePlus,
    LucideLoader2,
    LucideImage,
    LucideSmile,
    LucideSave,
    LucideTarget,
    LucideCopy,
    LucideSearch,
    LucideFilterX,
    LucideMoreVertical,
} from 'lucide-react';

type TriggerType =
    | 'pontos_partida'
    | 'bolas_de_tres'
    | 'cestinha_partida'
    | 'top_atributo_jogo'
    | 'participacao_evento'
    | 'podio_campeao'
    | 'podio_vice'
    | 'podio_terceiro'
    | 'cestinha_evento'
    | 'pontos_totais_evento'
    | 'pontos_unico_jogo_evento'
    | 'bolas_de_tres_evento'
    | 'top_atributo_evento'
    | 'campeao_torneio_interno'
    | 'medalhista_torneio_externo'
    | 'ranking_pontos_temporada'
    | 'ranking_bolas_de_tres_temporada'
    | 'participou_todos_eventos_temporada'
    | 'conquistas_evento_temporada'
    | 'top_atributo_temporada'
    | 'manual_admin';

type TriggerAtributo = 'ataque' | 'defesa' | 'velocidade' | 'forca' | 'visao';

interface ConquistaFormState {
    titulo: string;
    descricao: string;
    mensagemNotificacao: string;
    raridade: RaridadeConquista;
    tipoIcone: 'emoji' | 'imagem';
    iconeValor: string;
    tipoAvaliacao: TipoAvaliacaoConquista;
    triggerTipo: TriggerType;
    triggerMinimo: string;
    triggerAtributo: TriggerAtributo;
    ativo: boolean;
}

const DEFAULT_FORM: ConquistaFormState = {
    titulo: '',
    descricao: '',
    mensagemNotificacao: '',
    raridade: 'comum',
    tipoIcone: 'emoji',
    iconeValor: '🏅',
    tipoAvaliacao: 'pos_jogo',
    triggerTipo: 'pontos_partida',
    triggerMinimo: '10',
    triggerAtributo: 'ataque',
    ativo: true,
};

const triggerLabels: Record<TriggerType, string> = {
    pontos_partida: 'Pontos na partida (minimo)',
    bolas_de_tres: 'Bolas de 3 na partida (minimo)',
    cestinha_partida: 'Cestinha da partida',
    top_atributo_jogo: 'Topo de atributo no jogo (quiz)',
    participacao_evento: 'Participacao no evento',
    podio_campeao: 'Time campeao',
    podio_vice: 'Time vice-campeao',
    podio_terceiro: 'Time em 3 lugar',
    cestinha_evento: 'Cestinha do evento',
    pontos_totais_evento: 'Pontos feitos no evento (minimo)',
    pontos_unico_jogo_evento: 'Pontos em um unico jogo do evento (minimo)',
    bolas_de_tres_evento: 'Bolas de 3 no evento (minimo)',
    top_atributo_evento: 'Topo de atributo no evento (quiz)',
    campeao_torneio_interno: 'Campeao de torneio interno',
    medalhista_torneio_externo: 'Medalhista de torneio externo (podio)',
    ranking_pontos_temporada: 'Ranking de pontos da temporada (posicao)',
    ranking_bolas_de_tres_temporada: 'Ranking de bolas de 3 da temporada (posicao)',
    participou_todos_eventos_temporada: 'Participou de todos os eventos da temporada',
    conquistas_evento_temporada: 'Conquistas de evento na temporada (minimo)',
    top_atributo_temporada: 'Topo de atributo na temporada (quiz)',
    manual_admin: 'Conquista manual (somente admin)',
};

const tipoLabels: Record<TipoAvaliacaoConquista, string> = {
    pos_jogo: 'Pos-Jogo',
    pos_evento: 'Pos-Evento',
    ao_fechar_temporada: 'Ao fechar temporada',
    manual: 'Concedida manualmente',
};

const raridadeLabels: Record<RaridadeConquista, string> = {
    comum: 'Comum',
    rara: 'Rara',
    epica: 'Epica',
    lendaria: 'Lendaria',
};

const PLACEHOLDERS = ['{{eventName}}', '{{gameName}}', '{{seasonYear}}', '{{playerName}}', '{{value}}'] as const;

const triggerNeedsMinimo = (trigger: TriggerType) =>
    trigger === 'pontos_partida' ||
    trigger === 'bolas_de_tres' ||
    trigger === 'pontos_totais_evento' ||
    trigger === 'pontos_unico_jogo_evento' ||
    trigger === 'bolas_de_tres_evento' ||
    trigger === 'ranking_pontos_temporada' ||
    trigger === 'ranking_bolas_de_tres_temporada' ||
    trigger === 'conquistas_evento_temporada';

const triggerNeedsAtributo = (trigger: TriggerType) =>
    trigger === 'top_atributo_jogo' || trigger === 'top_atributo_evento' || trigger === 'top_atributo_temporada';

const availableTriggersByTipo: Record<TipoAvaliacaoConquista, TriggerType[]> = {
    pos_jogo: ['pontos_partida', 'bolas_de_tres', 'cestinha_partida', 'top_atributo_jogo'],
    pos_evento: [
        'participacao_evento',
        'podio_campeao',
        'podio_vice',
        'podio_terceiro',
        'cestinha_evento',
        'pontos_totais_evento',
        'pontos_unico_jogo_evento',
        'bolas_de_tres_evento',
        'top_atributo_evento',
        'campeao_torneio_interno',
        'medalhista_torneio_externo',
    ],
    ao_fechar_temporada: [
        'ranking_pontos_temporada',
        'ranking_bolas_de_tres_temporada',
        'participou_todos_eventos_temporada',
        'conquistas_evento_temporada',
        'top_atributo_temporada',
    ],
    manual: ['manual_admin'],
};

const parseTrigger = (gatilho: any): { tipo: TriggerType; minimo?: number; atributo?: TriggerAtributo } => {
    if (typeof gatilho === 'string') {
        const defaultTipo = (Object.keys(triggerLabels) as TriggerType[]).includes(gatilho as TriggerType)
            ? (gatilho as TriggerType)
            : 'pontos_partida';
        return { tipo: defaultTipo };
    }
    const tipo = (gatilho?.tipo || 'pontos_partida') as TriggerType;
    const minimo = typeof gatilho?.minimo === 'number' ? gatilho.minimo : undefined;
    const atributo = (gatilho?.atributo || undefined) as TriggerAtributo | undefined;
    return { tipo, minimo, atributo };
};

const formatTrigger = (gatilho: any): string => {
    const parsed = parseTrigger(gatilho);
    const label = triggerLabels[parsed.tipo] || parsed.tipo;
    const suffix: string[] = [];
    if (typeof parsed.minimo === 'number') suffix.push(String(parsed.minimo));
    if (parsed.atributo) suffix.push(parsed.atributo);
    if (suffix.length === 0) return label;
    return `${label}: ${suffix.join(' • ')}`;
};

const compactTriggerLabel = (gatilho: any): string => {
    const parsed = parseTrigger(gatilho);
    const min = typeof parsed.minimo === 'number' ? parsed.minimo : null;
    const attr = parsed.atributo ? ` (${parsed.atributo})` : '';

    switch (parsed.tipo) {
        case 'pontos_partida':
            return `Pontos na partida${min ? ` >= ${min}` : ''}`;
        case 'bolas_de_tres':
            return `Bolas de 3 na partida${min ? ` >= ${min}` : ''}`;
        case 'cestinha_partida':
            return 'Cestinha da partida';
        case 'top_atributo_jogo':
            return `Topo atributo no jogo${attr}`;
        case 'participacao_evento':
            return 'Participou do evento';
        case 'podio_campeao':
            return 'Time campeao';
        case 'podio_vice':
            return 'Time vice';
        case 'podio_terceiro':
            return 'Time em 3o';
        case 'cestinha_evento':
            return 'Cestinha do evento';
        case 'pontos_totais_evento':
            return `Pontos no evento${min ? ` >= ${min}` : ''}`;
        case 'pontos_unico_jogo_evento':
            return `Pontos em 1 jogo${min ? ` >= ${min}` : ''}`;
        case 'bolas_de_tres_evento':
            return `Bolas de 3 no evento${min ? ` >= ${min}` : ''}`;
        case 'top_atributo_evento':
            return `Topo atributo no evento${attr}`;
        case 'campeao_torneio_interno':
            return 'Campeao torneio interno';
        case 'medalhista_torneio_externo':
            return 'Medalhista torneio externo';
        case 'ranking_pontos_temporada':
            return `Ranking pontos: ${min || 1}o`;
        case 'ranking_bolas_de_tres_temporada':
            return `Ranking bolas de 3: ${min || 1}o`;
        case 'participou_todos_eventos_temporada':
            return 'Todos os eventos da temporada';
        case 'conquistas_evento_temporada':
            return `Conquistas de evento${min ? ` >= ${min}` : ''}`;
        case 'top_atributo_temporada':
            return `Topo atributo temporada${attr}`;
        case 'manual_admin':
            return 'Concedida manualmente';
        default:
            return formatTrigger(gatilho);
    }
};

export const AdminConquistasView: React.FC = () => {
    const [regras, setRegras] = useState<ConquistaRegra[]>([]);
    const [loadingRegras, setLoadingRegras] = useState(true);

    const [formOpen, setFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<ConquistaFormState>(DEFAULT_FORM);

    const [uploadingIcon, setUploadingIcon] = useState(false);
    const [savingRule, setSavingRule] = useState(false);
    const [busyRuleId, setBusyRuleId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTipoAvaliacao, setFilterTipoAvaliacao] = useState<'todas' | TipoAvaliacaoConquista>('todas');
    const [filterStatus, setFilterStatus] = useState<'todas' | 'ativas' | 'pausadas'>('todas');
    const [filterRaridade, setFilterRaridade] = useState<'todas' | RaridadeConquista>('todas');
    const [copiedPlaceholder, setCopiedPlaceholder] = useState('');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    useEffect(() => {
        const unsub = db.collection('conquistas_regras').onSnapshot((snap) => {
            const data = snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) } as ConquistaRegra));
            setRegras(data);
            setLoadingRegras(false);
        }, () => setLoadingRegras(false));

        return () => unsub();
    }, []);

    const regrasOrdenadas = useMemo(() => {
        return [...regras].sort((a, b) => {
            if (a.ativo !== b.ativo) return a.ativo ? -1 : 1;
            return a.titulo.localeCompare(b.titulo, 'pt-BR');
        });
    }, [regras]);

    const regrasFiltradas = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        return regrasOrdenadas.filter((regra) => {
            if (filterTipoAvaliacao !== 'todas' && regra.tipoAvaliacao !== filterTipoAvaliacao) {
                return false;
            }

            if (filterStatus === 'ativas' && regra.ativo === false) {
                return false;
            }

            if (filterStatus === 'pausadas' && regra.ativo !== false) {
                return false;
            }

            if (filterRaridade !== 'todas' && (regra.raridade || 'comum') !== filterRaridade) {
                return false;
            }

            if (!normalizedSearch) {
                return true;
            }

            const text = [
                regra.titulo,
                regra.descricao,
                regra.descricaoTemplate,
                regra.mensagemNotificacao,
                regra.mensagemNotificacaoTemplate,
                tipoLabels[regra.tipoAvaliacao],
                formatTrigger(regra.gatilho),
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return text.includes(normalizedSearch);
        });
    }, [regrasOrdenadas, searchTerm, filterTipoAvaliacao, filterStatus, filterRaridade]);

    const totalAtivas = useMemo(() => regrasOrdenadas.filter((regra) => regra.ativo !== false).length, [regrasOrdenadas]);

    const getPropagationErrorMessage = (error: unknown) => {
        const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: unknown }).code || '') : '';
        const message = typeof error === 'object' && error && 'message' in error ? String((error as { message?: unknown }).message || '') : '';
        const normalized = `${code} ${message}`.toLowerCase();

        if (normalized.includes('not-found') || normalized.includes('404') || normalized.includes('cors')) {
            return 'Conquista salva, mas a propagacao automatica falhou porque a Cloud Function "propagarEdicaoConquista" nao esta publicada no backend atual. Faça o deploy das functions para sincronizar as badges ja concedidas.';
        }

        return message || 'Conquista salva, mas houve falha ao propagar a edicao para badges ja concedidas.';
    };

    const resetForm = () => {
        setForm(DEFAULT_FORM);
        setEditingId(null);
        setFormOpen(false);
    };

    const openCreate = () => {
        setFeedback(null);
        setForm(DEFAULT_FORM);
        setEditingId(null);
        setFormOpen(true);
    };

    const openEdit = (regra: ConquistaRegra) => {
        const parsed = parseTrigger(regra.gatilho);
        setFeedback(null);
        setEditingId(regra.id);
        setForm({
            titulo: regra.titulo || '',
            descricao: regra.descricaoTemplate || regra.descricao || '',
            mensagemNotificacao: regra.mensagemNotificacaoTemplate || regra.mensagemNotificacao || `Nova conquista desbloqueada: ${regra.titulo}`,
            raridade: regra.raridade || 'comum',
            tipoIcone: regra.tipoIcone || 'emoji',
            iconeValor: regra.iconeValor || '🏅',
            tipoAvaliacao: regra.tipoAvaliacao || 'pos_jogo',
            triggerTipo: parsed.tipo,
            triggerMinimo: typeof parsed.minimo === 'number' ? String(parsed.minimo) : '',
            triggerAtributo: parsed.atributo || 'ataque',
            ativo: regra.ativo !== false,
        });
        setFormOpen(true);
    };

    const openDuplicate = (regra: ConquistaRegra) => {
        const parsed = parseTrigger(regra.gatilho);
        setFeedback(null);
        setEditingId(null);
        setForm({
            titulo: `${regra.titulo} (copia)`,
            descricao: regra.descricaoTemplate || regra.descricao || '',
            mensagemNotificacao: regra.mensagemNotificacaoTemplate || regra.mensagemNotificacao || `Nova conquista desbloqueada: ${regra.titulo}`,
            raridade: regra.raridade || 'comum',
            tipoIcone: regra.tipoIcone || 'emoji',
            iconeValor: regra.iconeValor || '🏅',
            tipoAvaliacao: regra.tipoAvaliacao || 'pos_jogo',
            triggerTipo: parsed.tipo,
            triggerMinimo: typeof parsed.minimo === 'number' ? String(parsed.minimo) : '',
            triggerAtributo: parsed.atributo || 'ataque',
            ativo: regra.ativo !== false,
        });
        setFormOpen(true);
    };

    const handleUploadIcon = async (file?: File | null) => {
        if (!file) return;
        setUploadingIcon(true);
        setFeedback(null);
        try {
            const { imageUrl } = await uploadImageToImgBB(file);
            setForm((prev) => ({ ...prev, tipoIcone: 'imagem', iconeValor: imageUrl }));
        } catch (error: any) {
            setFeedback({ type: 'error', text: error?.message || 'Falha ao enviar imagem para o ImgBB.' });
        } finally {
            setUploadingIcon(false);
        }
    };

    const handleSave = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!form.titulo.trim() || !form.descricao.trim() || !form.iconeValor.trim()) {
            setFeedback({ type: 'error', text: 'Preencha titulo, descricao e icone da conquista.' });
            return;
        }

        if (form.tipoIcone === 'imagem' && !form.iconeValor.startsWith('http')) {
            setFeedback({ type: 'error', text: 'Envie uma imagem valida para usar como icone.' });
            return;
        }

        const gatilho: any = { tipo: form.triggerTipo };
        if (triggerNeedsMinimo(form.triggerTipo)) {
            const minimo = Number(form.triggerMinimo);
            if (!Number.isFinite(minimo) || minimo <= 0) {
                setFeedback({ type: 'error', text: 'Informe um valor minimo valido para o gatilho.' });
                return;
            }
            gatilho.minimo = minimo;
        }
        if (triggerNeedsAtributo(form.triggerTipo)) {
            gatilho.atributo = form.triggerAtributo;
        }

        setSavingRule(true);
        setFeedback(null);

        const payload = {
            titulo: form.titulo.trim(),
            descricao: form.descricao.trim(),
            descricaoTemplate: form.descricao.trim(),
            raridade: form.raridade,
            mensagemNotificacao: form.mensagemNotificacao.trim() || `Nova conquista desbloqueada: ${form.titulo.trim()}`,
            mensagemNotificacaoTemplate: form.mensagemNotificacao.trim() || `Nova conquista desbloqueada: ${form.titulo.trim()}`,
            tipoIcone: form.tipoIcone,
            iconeValor: form.iconeValor.trim(),
            tipoAvaliacao: form.tipoAvaliacao,
            gatilho,
            ativo: form.ativo,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };

        try {
            if (editingId) {
                await db.collection('conquistas_regras').doc(editingId).set(payload, { merge: true });

                try {
                    const propagateRuleUpdate = functions.httpsCallable('propagarEdicaoConquista');
                    const response = await propagateRuleUpdate({ regraId: editingId });
                    const result = response?.data as { playersUpdated?: number; badgesUpdated?: number } | undefined;
                    const playersUpdated = Number(result?.playersUpdated || 0);
                    const badgesUpdated = Number(result?.badgesUpdated || 0);
                    setFeedback({
                        type: 'success',
                        text: playersUpdated > 0 || badgesUpdated > 0
                            ? `Conquista atualizada e propagada para ${badgesUpdated} badge(s) em ${playersUpdated} atleta(s).`
                            : 'Conquista atualizada com sucesso. Nenhuma badge vinculada precisou ser propagada.',
                    });
                } catch (error) {
                    console.error('Falha ao propagar edicao da conquista:', error);
                    setFeedback({
                        type: 'warning',
                        text: getPropagationErrorMessage(error),
                    });
                }
            } else {
                const ref = db.collection('conquistas_regras').doc();
                await ref.set({
                    id: ref.id,
                    ...payload,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                });
                setFeedback({ type: 'success', text: 'Conquista criada com sucesso.' });
            }
            resetForm();
        } catch {
            setFeedback({ type: 'error', text: 'Erro ao salvar conquista.' });
        } finally {
            setSavingRule(false);
        }
    };

    const handlePauseToggle = async (regra: ConquistaRegra) => {
        setBusyRuleId(regra.id);
        setFeedback(null);
        try {
            await db.collection('conquistas_regras').doc(regra.id).set({
                ativo: !(regra.ativo !== false),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
        } catch {
            setFeedback({ type: 'error', text: 'Erro ao alterar status da conquista.' });
        } finally {
            setBusyRuleId(null);
        }
    };

    const handleDelete = async (regra: ConquistaRegra) => {
        if (!window.confirm(`Excluir a regra "${regra.titulo}"? Esta acao remove apenas a regra e nao remove conquistas ja concedidas.`)) {
            return;
        }

        setBusyRuleId(regra.id);
        setFeedback(null);
        try {
            await db.collection('conquistas_regras').doc(regra.id).delete();
        } catch {
            setFeedback({ type: 'error', text: 'Erro ao excluir conquista.' });
        } finally {
            setBusyRuleId(null);
        }
    };

    const renderTemplate = (template: string) => {
        const triggerValue = triggerNeedsMinimo(form.triggerTipo) ? Number(form.triggerMinimo) : null;
        const safeValue = Number.isFinite(triggerValue) && triggerValue ? String(triggerValue) : '10';

        const previewContext: Record<string, string> = {
            eventName: 'Circuito ANCB 3x3',
            gameName: 'ANCB x Guaranta',
            seasonYear: String(new Date().getFullYear()),
            playerName: 'Atleta Exemplo',
            value: safeValue,
        };

        return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => previewContext[key] || `{{${key}}}`);
    };

    const handleCopyPlaceholder = async (placeholder: string) => {
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(placeholder);
            } else {
                const tempInput = document.createElement('textarea');
                tempInput.value = placeholder;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
            }

            setCopiedPlaceholder(placeholder);
            window.setTimeout(() => setCopiedPlaceholder(''), 1400);
        } catch {
            setFeedback({ type: 'error', text: 'Nao foi possivel copiar o placeholder.' });
        }
    };

    const renderRegraCard = (regra: ConquistaRegra) => {
        const paused = regra.ativo === false;
        const rarityStyle = getRarityStyles(regra.raridade || 'comum');
        const menuOpen = openMenuId === regra.id;
        const triggerText = compactTriggerLabel(regra.gatilho);
        return (
            <div
                key={regra.id}
                className={`group relative overflow-visible rounded-2xl border p-3 transition-all duration-200 ${
                    paused
                        ? 'bg-white/90 dark:bg-gray-800/90 border-gray-200 dark:border-gray-700'
                        : 'bg-gradient-to-b from-white to-slate-50/80 dark:from-gray-800 dark:to-gray-800/95 border-slate-200/80 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-[1px]'
                }`}
            >
                <div className="h-full flex flex-col">
                    <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700/80 flex items-center justify-center overflow-hidden shrink-0 ring-1 ring-slate-200/80 dark:ring-slate-600/60">
                            {regra.tipoIcone === 'imagem' ? (
                                <img src={regra.iconeValor} alt={regra.titulo} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xl leading-none">{regra.iconeValor || '🏅'}</span>
                            )}
                        </div>

                        <div className="min-w-0 flex-1 pr-16">
                            <div className="flex items-start justify-between gap-2 min-w-0">
                                <p className="font-extrabold text-[15px] leading-5 text-slate-900 dark:text-white break-words min-w-0">
                                    {regra.titulo}
                                </p>
                                <span className={`shrink-0 text-[10px] font-black px-1.5 py-1 rounded-full uppercase tracking-wide border ${rarityStyle.classes}`}>
                                    {rarityStyle.label}
                                </span>
                            </div>

                            <div className="mt-1 flex items-center gap-1.5 w-full text-[11px] leading-4">
                                <span className="shrink-0 font-semibold text-slate-700 dark:text-slate-200">
                                    {tipoLabels[regra.tipoAvaliacao]}
                                </span>
                                <span className="shrink-0 text-slate-400">•</span>
                                <span className="min-w-0 flex-1 text-cyan-700 dark:text-cyan-300 font-semibold break-words" title={formatTrigger(regra.gatilho)}>
                                    {triggerText}
                                </span>
                            </div>
                        </div>

                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 shrink-0 z-10">
                            <span className={`text-[10px] font-bold px-1.5 py-1 rounded-full ${paused ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/25 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>
                                {paused ? 'Pausada' : 'Ativa'}
                            </span>
                            <div className="relative">
                                <button
                                    onClick={() => setOpenMenuId(menuOpen ? null : regra.id)}
                                    disabled={busyRuleId === regra.id}
                                    aria-label="Abrir ações"
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
                                >
                                    {busyRuleId === regra.id
                                        ? <LucideLoader2 size={16} className="animate-spin" />
                                        : <LucideMoreVertical size={16} />}
                                </button>
                                {menuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                        <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1">
                                            <button
                                                onClick={() => { openEdit(regra); setOpenMenuId(null); }}
                                                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                <LucidePencil size={14} /> Editar
                                            </button>
                                            <button
                                                onClick={() => { openDuplicate(regra); setOpenMenuId(null); }}
                                                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                <LucideCopy size={14} /> Duplicar
                                            </button>
                                            <button
                                                onClick={() => { handlePauseToggle(regra); setOpenMenuId(null); }}
                                                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                {regra.ativo === false ? <LucidePlay size={14} /> : <LucidePause size={14} />}
                                                {regra.ativo === false ? 'Ativar' : 'Pausar'}
                                            </button>
                                            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                                            <button
                                                onClick={() => { handleDelete(regra); setOpenMenuId(null); }}
                                                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <LucideTrash2 size={14} /> Excluir
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-2 rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-slate-50/70 dark:bg-slate-900/30 p-2">
                        <p className="text-xs leading-5 text-slate-700 dark:text-slate-300 break-words">
                            {regra.descricaoTemplate || regra.descricao}
                        </p>
                    </div>

                    <p className="mt-1.5 pt-1.5 border-t border-slate-200/70 dark:border-slate-700/70 text-[10px] leading-4 text-slate-500 dark:text-slate-400 break-words">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Notificação:</span>{' '}
                        {regra.mensagemNotificacaoTemplate || regra.mensagemNotificacao || 'Nova conquista desbloqueada.'}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="animate-fadeIn space-y-4">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="min-w-0">
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <LucideTarget size={18} /> Gerenciador de Conquistas
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Regras em Firestore na colecao conquistas_regras. Evite regras duplicadas para a mesma familia de gatilho.
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                                Total: {regrasOrdenadas.length}
                            </span>
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                Ativas: {totalAtivas}
                            </span>
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                Pausadas: {regrasOrdenadas.length - totalAtivas}
                            </span>
                        </div>
                    </div>
                    <div className="w-full lg:w-auto grid grid-cols-1 gap-2 lg:min-w-[220px]">
                        <Button size="sm" className="w-full min-w-0 px-2 sm:px-3" onClick={openCreate}>
                            <LucidePlus size={16} />
                            <span className="hidden sm:inline">Nova Conquista</span>
                            <span className="sm:hidden">Nova</span>
                        </Button>
                    </div>
                </div>
            </div>

            {feedback && (
                <div className={`rounded-lg border px-4 py-3 text-sm font-semibold ${feedback.type === 'success'
                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                    : feedback.type === 'warning'
                        ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'
                        : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'}`}>
                    {feedback.text}
                </div>
            )}

            <Modal
                isOpen={formOpen}
                onClose={resetForm}
                title={editingId ? 'Editar Regra de Conquista' : 'Nova Regra de Conquista'}
                maxWidthClassName="max-w-4xl"
                bodyClassName="p-5"
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Titulo</label>
                            <input value={form.titulo} onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))} className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Tipo de avaliacao</label>
                            <select
                                value={form.tipoAvaliacao}
                                onChange={(e) => {
                                    const nextTipo = e.target.value as TipoAvaliacaoConquista;
                                    const firstTrigger = availableTriggersByTipo[nextTipo][0];
                                    setForm((prev) => ({
                                        ...prev,
                                        tipoAvaliacao: nextTipo,
                                        triggerTipo: firstTrigger,
                                        triggerMinimo: triggerNeedsMinimo(firstTrigger) ? '1' : '',
                                    }));
                                }}
                                className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="pos_jogo">Pos-Jogo</option>
                                <option value="pos_evento">Pos-Evento</option>
                                <option value="ao_fechar_temporada">Ao fechar temporada</option>
                                <option value="manual">Concedida manualmente</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Raridade</label>
                        <select
                            value={form.raridade}
                            onChange={(e) => setForm((prev) => ({ ...prev, raridade: e.target.value as RaridadeConquista }))}
                            className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        >
                            <option value="comum">Comum (verde)</option>
                            <option value="rara">Rara (azul)</option>
                            <option value="epica">Epica (roxa)</option>
                            <option value="lendaria">Lendaria (dourada)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Descricao</label>
                        <textarea value={form.descricao} onChange={(e) => setForm((prev) => ({ ...prev, descricao: e.target.value }))} className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows={2} required />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Mensagem de notificacao</label>
                        <input value={form.mensagemNotificacao} onChange={(e) => setForm((prev) => ({ ...prev, mensagemNotificacao: e.target.value }))} className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Placeholders (copie e cole)</label>
                        <div className="flex flex-wrap gap-2">
                            {PLACEHOLDERS.map((placeholder) => (
                                <button
                                    key={placeholder}
                                    type="button"
                                    onClick={() => handleCopyPlaceholder(placeholder)}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-colors ${copiedPlaceholder === placeholder
                                        ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700'
                                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-700/70 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <LucideCopy size={12} /> {placeholder}
                                </button>
                            ))}
                        </div>
                        <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Clique em qualquer placeholder para copiar automaticamente.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Gatilho</label>
                            <select
                                value={form.triggerTipo}
                                onChange={(e) => {
                                    const nextTrigger = e.target.value as TriggerType;
                                    setForm((prev) => ({ ...prev, triggerTipo: nextTrigger, triggerMinimo: triggerNeedsMinimo(nextTrigger) ? (prev.triggerMinimo || '1') : '' }));
                                }}
                                className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                {availableTriggersByTipo[form.tipoAvaliacao].map((trigger) => (
                                    <option key={trigger} value={trigger}>{triggerLabels[trigger]}</option>
                                ))}
                            </select>
                        </div>

                        {triggerNeedsMinimo(form.triggerTipo) && (
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Valor minimo</label>
                                <input type="number" min={1} value={form.triggerMinimo} onChange={(e) => setForm((prev) => ({ ...prev, triggerMinimo: e.target.value }))} className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                            </div>
                        )}

                        {triggerNeedsAtributo(form.triggerTipo) && (
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Atributo</label>
                                <select value={form.triggerAtributo} onChange={(e) => setForm((prev) => ({ ...prev, triggerAtributo: e.target.value as TriggerAtributo }))} className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    <option value="ataque">Ataque</option>
                                    <option value="defesa">Defesa</option>
                                    <option value="velocidade">Velocidade</option>
                                    <option value="forca">Forca</option>
                                    <option value="visao">Visao</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Tipo de icone</label>
                            <div className="flex gap-2">
                                <Button type="button" size="sm" variant={form.tipoIcone === 'emoji' ? 'primary' : 'secondary'} onClick={() => setForm((prev) => ({ ...prev, tipoIcone: 'emoji', iconeValor: prev.iconeValor || '🏅' }))}><LucideSmile size={14} /> Emoji</Button>
                                <Button type="button" size="sm" variant={form.tipoIcone === 'imagem' ? 'primary' : 'secondary'} onClick={() => setForm((prev) => ({ ...prev, tipoIcone: 'imagem', iconeValor: prev.tipoIcone === 'imagem' ? prev.iconeValor : '' }))}><LucideImage size={14} /> Imagem</Button>
                            </div>
                        </div>

                        <div className="flex items-end">
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <input type="checkbox" checked={form.ativo} onChange={(e) => setForm((prev) => ({ ...prev, ativo: e.target.checked }))} />
                                Regra ativa
                            </label>
                        </div>
                    </div>

                    {form.tipoIcone === 'emoji' ? (
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Emoji</label>
                            <input value={form.iconeValor} onChange={(e) => setForm((prev) => ({ ...prev, iconeValor: e.target.value }))} className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Imagem (PNG/JPG)</label>
                            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                                <input type="file" accept="image/png,image/jpeg,image/jpg" onChange={(e) => handleUploadIcon(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100" disabled={uploadingIcon} />
                                {uploadingIcon && <span className="inline-flex items-center gap-2 text-xs text-cyan-600 dark:text-cyan-300 font-bold"><LucideLoader2 size={14} className="animate-spin" /> Enviando...</span>}
                            </div>
                            {form.iconeValor && form.iconeValor.startsWith('http') && <img src={form.iconeValor} alt="Preview" className="w-14 h-14 mt-3 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />}
                        </div>
                    )}

                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/30 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Preview da Conquista</p>
                        <div className="flex items-start gap-3">
                            <div className="w-11 h-11 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                                {form.tipoIcone === 'imagem' && form.iconeValor.startsWith('http') ? (
                                    <img src={form.iconeValor} alt={renderTemplate(form.titulo || 'Conquista')} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xl leading-none">{form.iconeValor || '🏅'}</span>
                                )}
                            </div>
                            <div className="min-w-0 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-bold text-sm text-gray-900 dark:text-white">{renderTemplate(form.titulo || 'Conquista')}</p>
                                    <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wide border ${getRarityStyles(form.raridade).classes}`}>
                                        {getRarityStyles(form.raridade).label}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {tipoLabels[form.tipoAvaliacao]} • {formatTrigger({
                                        tipo: form.triggerTipo,
                                        ...(triggerNeedsMinimo(form.triggerTipo) ? { minimo: Number(form.triggerMinimo || 0) } : {}),
                                        ...(triggerNeedsAtributo(form.triggerTipo) ? { atributo: form.triggerAtributo } : {}),
                                    })}
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-200">{renderTemplate(form.descricao || 'Descreva a conquista...')}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Notificacao: {renderTemplate(form.mensagemNotificacao || `Nova conquista desbloqueada: ${form.titulo || 'Conquista'}`)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                        <Button type="button" variant="secondary" onClick={resetForm}>Cancelar</Button>
                        <Button type="submit" disabled={savingRule || uploadingIcon}>
                            {savingRule ? <LucideLoader2 size={16} className="animate-spin" /> : <LucideSave size={16} />}
                            {savingRule ? 'Salvando...' : (editingId ? 'Salvar alteracoes' : 'Criar conquista')}
                        </Button>
                    </div>
                </form>
            </Modal>

            {loadingRegras ? (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-100 dark:border-gray-700 text-center text-sm text-gray-500">
                    Carregando regras de conquistas...
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-gray-200">Todas as Conquistas ({regrasOrdenadas.length})</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{totalAtivas} ativas • {regrasOrdenadas.length - totalAtivas} pausadas</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <div className="relative">
                                <LucideSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar por titulo, gatilho, descricao..."
                                    className="pl-9 pr-3 py-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white w-64"
                                />
                            </div>
                            <select
                                value={filterTipoAvaliacao}
                                onChange={(e) => setFilterTipoAvaliacao(e.target.value as 'todas' | TipoAvaliacaoConquista)}
                                className="px-3 py-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="todas">Todos os tipos</option>
                                <option value="pos_jogo">Pos-Jogo</option>
                                <option value="pos_evento">Pos-Evento</option>
                                <option value="ao_fechar_temporada">Fechamento de temporada</option>
                                <option value="manual">Manual</option>
                            </select>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as 'todas' | 'ativas' | 'pausadas')}
                                className="px-3 py-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="todas">Ativas e pausadas</option>
                                <option value="ativas">Somente ativas</option>
                                <option value="pausadas">Somente pausadas</option>
                            </select>
                            <select
                                value={filterRaridade}
                                onChange={(e) => setFilterRaridade(e.target.value as 'todas' | RaridadeConquista)}
                                className="px-3 py-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="todas">Todas as raridades</option>
                                <option value="comum">Comum</option>
                                <option value="rara">Rara</option>
                                <option value="epica">Epica</option>
                                <option value="lendaria">Lendaria</option>
                            </select>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterTipoAvaliacao('todas');
                                    setFilterStatus('todas');
                                    setFilterRaridade('todas');
                                }}
                                disabled={!searchTerm && filterTipoAvaliacao === 'todas' && filterStatus === 'todas' && filterRaridade === 'todas'}
                            >
                                <LucideFilterX size={14} /> Limpar filtros
                            </Button>
                        </div>
                    </div>

                    {regrasFiltradas.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            Nenhuma conquista encontrada com os filtros atuais.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 items-stretch max-h-[65vh] overflow-y-auto custom-scrollbar pr-1">
                            {regrasFiltradas.map(renderRegraCard)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
