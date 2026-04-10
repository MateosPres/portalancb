import { Jogo, RosterEntry } from '../types';
import { normalizeDateToIso } from './dateFormat';
import { warnSchemaFallback } from './devSchemaWarn';

const GAME_STATUS: NonNullable<Jogo['status']>[] = ['agendado', 'andamento', 'finalizado'];
const GAME_PHASES: NonNullable<Jogo['fase']>[] = ['fase_grupos', 'oitavas', 'quartas', 'semi', 'final'];
const OPPONENT_MODES: NonNullable<Jogo['opponentMode']>[] = ['external_string', 'internal_team'];
const ROSTER_STATUS: RosterEntry['status'][] = ['pendente', 'confirmado', 'recusado'];

const asString = (value: unknown, fallback = '') => {
    if (typeof value !== 'string') return fallback;
    const trimmed = value.trim();
    return trimmed || fallback;
};

const asNumber = (value: unknown, fallback = 0) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
};

const asGameStatus = (value: unknown, scope: string): NonNullable<Jogo['status']> => {
    if (typeof value === 'string' && GAME_STATUS.includes(value as NonNullable<Jogo['status']>)) {
        return value as NonNullable<Jogo['status']>;
    }
    if (value !== undefined) {
        warnSchemaFallback(scope, 'status', value, 'agendado');
    }
    return 'agendado';
};

const asGamePhase = (value: unknown, scope: string): Jogo['fase'] | undefined => {
    if (typeof value === 'string' && GAME_PHASES.includes(value as NonNullable<Jogo['fase']>)) {
        return value as Jogo['fase'];
    }
    if (value !== undefined && value !== null && value !== '') {
        warnSchemaFallback(scope, 'fase', value, 'undefined');
    }
    return undefined;
};

const asOpponentMode = (value: unknown, scope: string): Jogo['opponentMode'] | undefined => {
    if (typeof value === 'string' && OPPONENT_MODES.includes(value as NonNullable<Jogo['opponentMode']>)) {
        return value as Jogo['opponentMode'];
    }
    if (value !== undefined && value !== null && value !== '') {
        warnSchemaFallback(scope, 'opponentMode', value, 'undefined');
    }
    return undefined;
};

export const normalizeJogo = (id: string, raw: any): Jogo => {
    const scope = `game.read.${id}`;
    return {
        id,
        dataJogo: normalizeDateToIso(asString(raw?.dataJogo)),
        horaJogo: asString(raw?.horaJogo),
        status: asGameStatus(raw?.status, scope),
        adversario: asString(raw?.adversario),
        localizacao: asString(raw?.localizacao),
        jogadoresEscalados: Array.isArray(raw?.jogadoresEscalados) ? raw.jogadoresEscalados : [],
        fase: asGamePhase(raw?.fase, scope),
        placarANCB_final: asNumber(raw?.placarANCB_final),
        placarAdversario_final: asNumber(raw?.placarAdversario_final),
        timeA_id: asString(raw?.timeA_id),
        timeA_nome: asString(raw?.timeA_nome),
        timeB_id: asString(raw?.timeB_id),
        timeB_nome: asString(raw?.timeB_nome),
        opponentMode: asOpponentMode(raw?.opponentMode, scope),
        placarTimeA_final: asNumber(raw?.placarTimeA_final),
        placarTimeB_final: asNumber(raw?.placarTimeB_final),
    };
};

export const normalizeRosterEntry = (docId: string, raw: any): RosterEntry => {
    const statusRaw = typeof raw?.status === 'string' ? raw.status : '';
    const status = ROSTER_STATUS.includes(statusRaw as RosterEntry['status'])
        ? (statusRaw as RosterEntry['status'])
        : 'pendente';

    if (statusRaw && !ROSTER_STATUS.includes(statusRaw as RosterEntry['status'])) {
        warnSchemaFallback(`roster.read.${docId}`, 'status', statusRaw, 'pendente');
    }

    const playerId = asString(raw?.playerId, docId);

    return {
        playerId,
        status,
        updatedAt: raw?.updatedAt ?? null,
    };
};

export const normalizeJogoWrite = (raw: any) => {
    const scope = 'game.write';
    return {
        dataJogo: normalizeDateToIso(asString(raw?.dataJogo)),
        horaJogo: asString(raw?.horaJogo),
        status: asGameStatus(raw?.status, scope),
        adversario: asString(raw?.adversario),
        localizacao: asString(raw?.localizacao),
        fase: asGamePhase(raw?.fase, scope),
        placarANCB_final: asNumber(raw?.placarANCB_final),
        placarAdversario_final: asNumber(raw?.placarAdversario_final),
        timeA_id: asString(raw?.timeA_id),
        timeA_nome: asString(raw?.timeA_nome),
        timeB_id: asString(raw?.timeB_id),
        timeB_nome: asString(raw?.timeB_nome),
        opponentMode: asOpponentMode(raw?.opponentMode, scope),
        placarTimeA_final: asNumber(raw?.placarTimeA_final),
        placarTimeB_final: asNumber(raw?.placarTimeB_final),
    };
};
