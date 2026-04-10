import { Evento } from '../types';
import { normalizeDateToIso } from './dateFormat';
import { warnSchemaFallback } from './devSchemaWarn';

const EVENT_TYPES: Evento['type'][] = ['amistoso', 'torneio_interno', 'torneio_externo'];
const EVENT_STATUS: Evento['status'][] = ['proximo', 'andamento', 'finalizado'];
const EVENT_MODES: Evento['modalidade'][] = ['3x3', '5x5'];
const EVENT_FORMATS: NonNullable<Evento['formato']>[] = ['chaveamento', 'grupo_unico'];

const asString = (value: unknown, fallback = '') => {
    if (typeof value !== 'string') return fallback;
    const trimmed = value.trim();
    return trimmed || fallback;
};

const asEventoType = (value: unknown, scope: string): Evento['type'] => {
    if (typeof value === 'string' && EVENT_TYPES.includes(value as Evento['type'])) {
        return value as Evento['type'];
    }
    if (value !== undefined) {
        warnSchemaFallback(scope, 'type', value, 'amistoso');
    }
    return 'amistoso';
};

const asEventoStatus = (value: unknown, scope: string): Evento['status'] => {
    if (typeof value === 'string' && EVENT_STATUS.includes(value as Evento['status'])) {
        return value as Evento['status'];
    }
    if (value !== undefined) {
        warnSchemaFallback(scope, 'status', value, 'proximo');
    }
    return 'proximo';
};

const asEventoMode = (value: unknown, scope: string): Evento['modalidade'] => {
    if (typeof value === 'string' && EVENT_MODES.includes(value as Evento['modalidade'])) {
        return value as Evento['modalidade'];
    }
    if (value !== undefined) {
        warnSchemaFallback(scope, 'modalidade', value, '5x5');
    }
    return '5x5';
};

const asEventoFormato = (value: unknown, scope: string): Evento['formato'] | undefined => {
    if (typeof value === 'string' && EVENT_FORMATS.includes(value as NonNullable<Evento['formato']>)) {
        return value as Evento['formato'];
    }
    if (value !== undefined && value !== null && value !== '') {
        warnSchemaFallback(scope, 'formato', value, 'undefined');
    }
    return undefined;
};

export const normalizeEvento = (id: string, raw: any): Evento => {
    const scope = `event.read.${id}`;
    const data = normalizeDateToIso(asString(raw?.data));
    const jogadoresEscalados = Array.isArray(raw?.jogadoresEscalados) ? raw.jogadoresEscalados : [];
    const times = Array.isArray(raw?.times) ? raw.times : undefined;
    const timesParticipantes = Array.isArray(raw?.timesParticipantes) ? raw.timesParticipantes : undefined;

    const podio = raw?.podio && typeof raw.podio === 'object'
        ? {
            primeiro: asString(raw.podio.primeiro),
            segundo: asString(raw.podio.segundo),
            terceiro: asString(raw.podio.terceiro),
        }
        : undefined;

    return {
        id,
        nome: asString(raw?.nome, 'Evento sem nome'),
        logoUrl: asString(raw?.logoUrl),
        data,
        modalidade: asEventoMode(raw?.modalidade, scope),
        type: asEventoType(raw?.type, scope),
        status: asEventoStatus(raw?.status, scope),
        jogadoresEscalados,
        adversario: asString(raw?.adversario),
        times,
        formato: asEventoFormato(raw?.formato, scope),
        podio,
        timesParticipantes,
    };
};

export const normalizeEventoWrite = (raw: any) => {
    const scope = 'event.write';
    const normalized = {
        nome: asString(raw?.nome, 'Evento sem nome'),
        logoUrl: asString(raw?.logoUrl),
        data: normalizeDateToIso(asString(raw?.data)),
        modalidade: asEventoMode(raw?.modalidade, scope),
        status: asEventoStatus(raw?.status, scope),
        type: asEventoType(raw?.type, scope),
        adversario: asString(raw?.adversario),
        formato: asEventoFormato(raw?.formato, scope),
    };

    return normalized;
};
