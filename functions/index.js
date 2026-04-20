const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// ─────────────────────────────────────────────────────────────
// ÍNDICE FIRESTORE NECESSÁRIO:
// Para a query de deduplicação de notificações funcionar, crie
// um índice composto na coleção 'notifications' com os campos:
//   targetUserId (Ascending) + type (Ascending) + data.gameId (Ascending)
// O Firebase vai mostrar o link para criar automaticamente nos
// logs do Functions na primeira execução — clique nele!
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// HELPER: Extrai o ID de um item do roster (string ou objeto)
// ─────────────────────────────────────────────────────────────
function extractPlayerId(entry) {
    if (typeof entry === 'string') return entry;
    if (entry && typeof entry === 'object' && entry.id) return entry.id;
    return null;
}

function normalizeGatilho(gatilho) {
    if (!gatilho) return { tipo: '' };
    if (typeof gatilho === 'string') return { tipo: gatilho };
    if (typeof gatilho === 'object') return gatilho;
    return { tipo: '' };
}

const ALLOWED_RARIDADES = new Set(['comum', 'rara', 'epica', 'lendaria']);

function resolveRegraRaridade(regra) {
    const raw = String(regra?.raridade || '').trim().toLowerCase();
    return ALLOWED_RARIDADES.has(raw) ? raw : 'comum';
}

const REVIEW_TAG_MULTIPLIERS = {
    1: 1.0,
    2: 0.75,
    3: 0.55,
};

const REVIEW_TAG_IMPACTS = {
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

const ATTR_KEYS = ['ataque', 'defesa', 'velocidade', 'forca', 'visao'];

function normalizeStoredAttributeDeltas(review) {
    const normalized = { ataque: 0, defesa: 0, velocidade: 0, forca: 0, visao: 0 };
    const source = review?.attributeDeltas;
    if (!source || typeof source !== 'object') return normalized;

    ATTR_KEYS.forEach((key) => {
        const value = Number(source[key] || 0);
        if (Number.isFinite(value)) {
            normalized[key] = Math.round(value * 10) / 10;
        }
    });

    return normalized;
}

function buildHierarchyKey(gatilho) {
    const tipo = String(gatilho?.tipo || '');
    if (!tipo) return '';
    if (gatilho?.atributo) return `${tipo}:${gatilho.atributo}`;
    return tipo;
}

function dominanceScore(gatilho) {
    if (!gatilho || typeof gatilho !== 'object') return 0;
    if (typeof gatilho.minimo === 'number') {
        if (String(gatilho.tipo).startsWith('ranking_')) {
            return 1000 - Number(gatilho.minimo);
        }
        return Number(gatilho.minimo);
    }
    return 1;
}

function selectDominantMatchedRules(matchedRules) {
    const byFamily = new Map();
    for (const regra of matchedRules) {
        const gatilho = normalizeGatilho(regra.gatilho);
        const family = buildHierarchyKey(gatilho);
        if (!family) {
            byFamily.set(`rule:${regra.id}`, regra);
            continue;
        }
        const current = byFamily.get(family);
        if (!current) {
            byFamily.set(family, regra);
            continue;
        }
        const currentScore = dominanceScore(normalizeGatilho(current.gatilho));
        const nextScore = dominanceScore(gatilho);
        if (nextScore > currentScore) {
            byFamily.set(family, regra);
        }
    }
    return Array.from(byFamily.values());
}

function aggregateAttributeScoresFromReviews(reviewDocs) {
    const scoresByPlayer = {};
    for (const reviewDoc of reviewDocs) {
        const review = reviewDoc.data ? reviewDoc.data() : reviewDoc;
        const targetId = review?.targetId;
        if (!targetId) continue;

        if (!scoresByPlayer[targetId]) {
            scoresByPlayer[targetId] = { ataque: 0, defesa: 0, velocidade: 0, forca: 0, visao: 0 };
        }

        const storedAttributeDeltas = normalizeStoredAttributeDeltas(review);
        const hasStoredAttributeDeltas = ATTR_KEYS.some((key) => storedAttributeDeltas[key] !== 0);

        if (hasStoredAttributeDeltas) {
            ATTR_KEYS.forEach((key) => {
                scoresByPlayer[targetId][key] += Number(storedAttributeDeltas[key] || 0);
            });
            continue;
        }

        const tags = Array.isArray(review?.tags) ? review.tags : [];
        const multiplier = REVIEW_TAG_MULTIPLIERS[tags.length] || 1.0;

        tags.forEach((tag) => {
            const impact = REVIEW_TAG_IMPACTS[tag];
            if (!impact) return;
            ATTR_KEYS.forEach((key) => {
                scoresByPlayer[targetId][key] += Number(impact[key] || 0) * multiplier;
            });
        });
    }
    return scoresByPlayer;
}

function buildTopByAttribute(scoresByPlayer) {
    const leaders = {};
    ATTR_KEYS.forEach((attr) => {
        let maxScore = Number.NEGATIVE_INFINITY;
        Object.values(scoresByPlayer).forEach((scores) => {
            const val = Number(scores[attr] || 0);
            if (val > maxScore) maxScore = val;
        });

        if (!Number.isFinite(maxScore)) {
            leaders[attr] = [];
            return;
        }

        leaders[attr] = Object.entries(scoresByPlayer)
            .filter(([_, scores]) => Number(scores[attr] || 0) === maxScore)
            .map(([playerId]) => playerId);
    });
    return leaders;
}

function resolveAncbPlayersForGame(eventData, gameData) {
    const gameTeamIds = [gameData?.timeA_id, gameData?.timeB_id].filter(Boolean);
    let ancbPlayerIds = [];

    if (eventData?.timesParticipantes && eventData.timesParticipantes.length > 0) {
        const participantTeams = gameTeamIds.length > 0
            ? eventData.timesParticipantes.filter((t) => gameTeamIds.includes(t.id))
            : eventData.timesParticipantes;

        participantTeams
            .filter((t) => t.isANCB)
            .forEach((t) => ancbPlayerIds.push(...(t.jogadores || [])));
    } else if (eventData?.times && eventData.times.length > 0) {
        const teams = gameTeamIds.length > 0
            ? eventData.times.filter((t) => gameTeamIds.includes(t.id))
            : eventData.times;
        teams.forEach((t) => ancbPlayerIds.push(...(t.jogadores || [])));
    } else {
        const gameRoster = (gameData?.jogadoresEscalados || []).map(extractPlayerId).filter(Boolean);
        const eventRoster = (eventData?.jogadoresEscalados || []).map(extractPlayerId).filter(Boolean);
        ancbPlayerIds = gameRoster.length > 0 ? gameRoster : eventRoster;
    }

    return [...new Set(ancbPlayerIds.filter(Boolean))];
}

function resolveAncbTeamPlayersForGame(eventData, gameData) {
    const gameTeamIds = [gameData?.timeA_id, gameData?.timeB_id].filter(Boolean);
    const teamPlayersMap = {};
    const playerTeamMap = {};

    const addTeamPlayers = (teamId, jogadores) => {
        const normalizedTeamId = String(teamId || '').trim();
        if (!normalizedTeamId) return;
        if (!Array.isArray(teamPlayersMap[normalizedTeamId])) teamPlayersMap[normalizedTeamId] = [];
        for (const pid of jogadores || []) {
            const playerId = String(pid || '').trim();
            if (!playerId) continue;
            if (!teamPlayersMap[normalizedTeamId].includes(playerId)) {
                teamPlayersMap[normalizedTeamId].push(playerId);
            }
            if (!playerTeamMap[playerId]) {
                playerTeamMap[playerId] = normalizedTeamId;
            }
        }
    };

    if (eventData?.timesParticipantes && eventData.timesParticipantes.length > 0) {
        const participantTeams = gameTeamIds.length > 0
            ? eventData.timesParticipantes.filter((t) => gameTeamIds.includes(t.id))
            : eventData.timesParticipantes;

        participantTeams
            .filter((t) => t.isANCB)
            .forEach((t) => addTeamPlayers(t.id || t.nomeTime, t.jogadores || []));
    } else if (eventData?.times && eventData.times.length > 0) {
        const teams = gameTeamIds.length > 0
            ? eventData.times.filter((t) => gameTeamIds.includes(t.id))
            : eventData.times;

        teams.forEach((t) => addTeamPlayers(t.id || t.nomeTime, t.jogadores || []));
    } else {
        // Legado/amistoso sem estrutura de times: mantem um contexto unico ANCB.
        const roster = (gameData?.jogadoresEscalados || eventData?.jogadoresEscalados || [])
            .map(extractPlayerId)
            .filter(Boolean);
        addTeamPlayers('ancb_default', roster);
    }

    const playerIds = Object.keys(playerTeamMap);
    return { playerIds, playerTeamMap, teamPlayersMap };
}

function evaluateRuleForPlayer(gatilho, stats, playerId, teamId) {
    switch (gatilho.tipo) {
        case 'pontos_partida':
            return (stats.pontosByPlayer[playerId] || 0) >= (Number(gatilho.minimo) || 0);
        case 'bolas_de_tres':
            return (stats.bolas3ByPlayer[playerId] || 0) >= (Number(gatilho.minimo) || 0);
        case 'cestinha_partida':
            return Array.isArray(stats.topScorersByTeam?.[teamId]) && stats.topScorersByTeam[teamId].includes(playerId);
        case 'top_atributo_jogo': {
            const attr = String(gatilho.atributo || '');
            return Boolean(
                attr &&
                Array.isArray(stats.topByAttributeByTeam?.[teamId]?.[attr]) &&
                stats.topByAttributeByTeam[teamId][attr].includes(playerId)
            );
        }
        default:
            return false;
    }
}

function resolveAncbPlayersForEvent(eventData) {
    let allAncbPlayerIds = [];

    if (eventData?.timesParticipantes && eventData.timesParticipantes.length > 0) {
        eventData.timesParticipantes
            .filter((t) => t.isANCB)
            .forEach((t) => allAncbPlayerIds.push(...(t.jogadores || [])));
    } else if (eventData?.times && eventData.times.length > 0) {
        eventData.times.forEach((t) => allAncbPlayerIds.push(...(t.jogadores || [])));
    } else {
        allAncbPlayerIds = (eventData?.jogadoresEscalados || []).map(extractPlayerId).filter(Boolean);
    }

    return [...new Set(allAncbPlayerIds.filter(Boolean))];
}

function resolveAncbTeamPlayersForEvent(eventData) {
    const teamPlayersMap = {};
    const playerTeamMap = {};

    const addTeamPlayers = (teamId, jogadores) => {
        const normalizedTeamId = String(teamId || '').trim();
        if (!normalizedTeamId) return;
        if (!Array.isArray(teamPlayersMap[normalizedTeamId])) teamPlayersMap[normalizedTeamId] = [];
        for (const pid of jogadores || []) {
            const playerId = String(pid || '').trim();
            if (!playerId) continue;
            if (!teamPlayersMap[normalizedTeamId].includes(playerId)) {
                teamPlayersMap[normalizedTeamId].push(playerId);
            }
            if (!playerTeamMap[playerId]) {
                playerTeamMap[playerId] = normalizedTeamId;
            }
        }
    };

    if (eventData?.timesParticipantes && eventData.timesParticipantes.length > 0) {
        eventData.timesParticipantes
            .filter((t) => t.isANCB)
            .forEach((t) => addTeamPlayers(t.id || t.nomeTime, t.jogadores || []));
    } else if (eventData?.times && eventData.times.length > 0) {
        eventData.times.forEach((t) => addTeamPlayers(t.id || t.nomeTime, t.jogadores || []));
    } else {
        const roster = (eventData?.jogadoresEscalados || []).map(extractPlayerId).filter(Boolean);
        addTeamPlayers('ancb_default', roster);
    }

    const playerIds = Object.keys(playerTeamMap);
    return { playerIds, playerTeamMap, teamPlayersMap };
}

function evaluateSeasonRuleForPlayer(gatilho, seasonStats, playerId) {
    switch (gatilho.tipo) {
        case 'participacao_evento':
            return (seasonStats.eventosParticipados[playerId] || 0) > 0;
        case 'podio_campeao':
            return seasonStats.campeoes.has(playerId);
        case 'podio_vice':
            return seasonStats.vices.has(playerId);
        case 'podio_terceiro':
            return seasonStats.terceiros.has(playerId);
        case 'cestinha_evento':
            return seasonStats.cestinhas.has(playerId);
        case 'pontos_unico_jogo_evento':
            return (seasonStats.maxPontosJogo[playerId] || 0) >= (Number(gatilho.minimo) || 0);
        case 'bolas_de_tres_evento':
            return (seasonStats.bolas3NoAno[playerId] || 0) >= (Number(gatilho.minimo) || 0);
        case 'ranking_pontos_temporada': {
            const posicao = Number(gatilho.minimo) || 1;
            return (seasonStats.rankPontos[playerId] || 9999) === posicao;
        }
        case 'ranking_bolas_de_tres_temporada': {
            const posicao = Number(gatilho.minimo) || 1;
            return (seasonStats.rankBolas3[playerId] || 9999) === posicao;
        }
        case 'participou_todos_eventos_temporada':
            return (seasonStats.eventosParticipados[playerId] || 0) >= seasonStats.totalEventos && seasonStats.totalEventos > 0;
        case 'conquistas_evento_temporada':
            return (seasonStats.eventBadgesByPlayer[playerId] || 0) >= (Number(gatilho.minimo) || 0);
        case 'top_atributo_temporada': {
            const attr = String(gatilho.atributo || '');
            return Boolean(attr && Array.isArray(seasonStats.topByAttribute?.[attr]) && seasonStats.topByAttribute[attr].includes(playerId));
        }
        case 'manual_admin':
            return false;
        default:
            return false;
    }
}

function evaluateEventRuleForPlayer(gatilho, eventStats, playerId, teamId) {
    switch (gatilho.tipo) {
        case 'participacao_evento':
            return (eventStats.playerIds || []).includes(playerId);
        case 'podio_campeao':
            return eventStats.campeoes.has(playerId);
        case 'podio_vice':
            return eventStats.vices.has(playerId);
        case 'podio_terceiro':
            return eventStats.terceiros.has(playerId);
        case 'cestinha_evento':
            return Boolean(eventStats.cestinhasByTeam?.[teamId]?.has(playerId));
        case 'pontos_totais_evento':
            return (eventStats.pontosNoEvento[playerId] || 0) >= (Number(gatilho.minimo) || 0);
        case 'pontos_unico_jogo_evento':
            return (eventStats.maxPontosJogo[playerId] || 0) >= (Number(gatilho.minimo) || 0);
        case 'bolas_de_tres_evento':
            return (eventStats.bolas3NoEvento[playerId] || 0) >= (Number(gatilho.minimo) || 0);
        case 'top_atributo_evento': {
            const attr = String(gatilho.atributo || '');
            return Boolean(
                attr &&
                Array.isArray(eventStats.topByAttributeByTeam?.[teamId]?.[attr]) &&
                eventStats.topByAttributeByTeam[teamId][attr].includes(playerId)
            );
        }
        case 'campeao_torneio_interno':
            return eventStats.eventType === 'torneio_interno' && eventStats.campeoes.has(playerId);
        case 'medalhista_torneio_externo':
            return eventStats.eventType === 'torneio_externo' && eventStats.medalhistas.has(playerId);
        default:
            return false;
    }
}

function countEventBadgesInSeason(existingBadges, seasonYear) {
    if (!Array.isArray(existingBadges)) return 0;
    const eventBadgePrefixes = [
        'estava_la_',
        'campiao_',
        'vice_',
        'podio_',
        'cestinha_ev_',
        'bola_quente_',
        'imparavel_',
        'primeira_bomba_',
        'atirador_',
        'atirador_elite_',
    ];

    return existingBadges.reduce((count, badge) => {
        if (!badge || typeof badge !== 'object') return count;

        if (badge.tipoAvaliacao === 'pos_evento') {
            const occurrences = Array.isArray(badge.ocorrencias) && badge.ocorrencias.length > 0
                ? badge.ocorrencias
                : [{ data: badge.data, seasonYear: badge.seasonYear }];

            return count + occurrences.filter((occurrence) => {
                const occurrenceSeason = String(occurrence?.seasonYear || '').trim();
                const occurrenceDate = String(occurrence?.data || '').trim();
                return occurrenceSeason === seasonYear || occurrenceDate.includes(seasonYear);
            }).length;
        }

        const badgeId = String(badge.id || '');
        const badgeDate = String(badge.data || '');
        if (!badgeDate.includes(seasonYear)) return count;
        return count + (eventBadgePrefixes.some((prefix) => badgeId.startsWith(prefix)) ? 1 : 0);
    }, 0);
}

function renderTemplate(template, context) {
    const source = String(template || '').trim();
    if (!source) return '';

    return source.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
        const value = context?.[key];
        if (value === undefined || value === null) return '';
        return String(value);
    }).replace(/\s{2,}/g, ' ').trim();
}

function buildRenderedTexts(regra, context) {
    const baseTitulo = regra?.titulo || 'Conquista';
    const baseDescricao = regra?.descricaoTemplate || regra?.descricao || 'Conquista desbloqueada.';
    const baseMensagem = regra?.mensagemNotificacaoTemplate || regra?.mensagemNotificacao || `Voce ganhou a conquista "${regra?.titulo || 'Conquista'}".`;

    const titulo = renderTemplate(baseTitulo, context) || 'Conquista';
    const descricao = renderTemplate(baseDescricao, context) || 'Conquista desbloqueada.';
    const mensagem = renderTemplate(baseMensagem, context) || `Voce ganhou a conquista "${regra?.titulo || 'Conquista'}".`;

    return { titulo, descricao, mensagem };
}

function compareOccurrenceDates(left, right) {
    return String(left || '').localeCompare(String(right || ''));
}

function normalizeStoredBadgeOccurrences(badge) {
    if (Array.isArray(badge?.ocorrencias) && badge.ocorrencias.length > 0) {
        return [...badge.ocorrencias].sort((a, b) => {
            const dateDiff = compareOccurrenceDates(a?.data, b?.data);
            if (dateDiff !== 0) return dateDiff;
            return String(a?.id || '').localeCompare(String(b?.id || ''));
        });
    }

    if (!badge || typeof badge !== 'object') return [];

    return [{
        id: String(badge.latestOccurrenceId || `${badge.id || 'badge'}:legacy`),
        descricao: String(badge.descricao || 'Conquista desbloqueada.'),
        data: String(badge.data || ''),
        gameId: badge.gameId,
        eventId: badge.eventId,
        seasonYear: badge.seasonYear,
        teamId: badge.teamId,
        teamNome: badge.teamNome,
        renderContext: badge.renderContext || undefined,
    }];
}

function buildBadgeOccurrence(params) {
    return {
        id: String(params.id),
        descricao: String(params.descricao || 'Conquista desbloqueada.'),
        data: String(params.data || ''),
        gameId: params.gameId,
        eventId: params.eventId,
        seasonYear: params.seasonYear,
        teamId: params.teamId,
        teamNome: params.teamNome,
        contextLabel: params.contextLabel,
        renderContext: params.renderContext || undefined,
    };
}

function shouldAggregateBadgeByRule(badge) {
    return String(badge?.tipoAvaliacao || '') !== 'ao_fechar_temporada';
}

function buildRuleBasedBadgeId(regraId, options = {}) {
    const normalizedRuleId = String(regraId || '').trim();
    const seasonYear = String(options.seasonYear || '').trim();

    if (String(options.tipoAvaliacao || '') === 'ao_fechar_temporada' && seasonYear) {
        return `regra_${normalizedRuleId}_temporada_${seasonYear}`;
    }

    return `regra_${normalizedRuleId}`;
}

function buildStackedBadgeFromRule(regra, rendered, options) {
    const occurrence = buildBadgeOccurrence(options.occurrence);
    return {
        id: buildRuleBasedBadgeId(regra.id, {
            tipoAvaliacao: regra.tipoAvaliacao || options.tipoAvaliacao,
            seasonYear: occurrence.seasonYear,
        }),
        nome: rendered.titulo,
        emoji: regra.tipoIcone === 'emoji' ? (regra.iconeValor || '🏅') : '🏅',
        categoria: options.categoria,
        origem: 'regra',
        raridade: resolveRegraRaridade(regra),
        descricao: occurrence.descricao,
        data: occurrence.data,
        gameId: occurrence.gameId,
        eventId: occurrence.eventId,
        seasonYear: occurrence.seasonYear,
        teamId: occurrence.teamId,
        teamNome: occurrence.teamNome,
        regraId: regra.id,
        tipoAvaliacao: regra.tipoAvaliacao || options.tipoAvaliacao,
        tipoIcone: regra.tipoIcone || 'emoji',
        iconeValor: regra.iconeValor || '🏅',
        stackCount: 1,
        latestOccurrenceId: occurrence.id,
        ocorrencias: [occurrence],
    };
}

function upsertStackedBadgeList(existingBadges, incomingBadge) {
    const nextBadges = Array.isArray(existingBadges) ? [...existingBadges] : [];
    const badgeIndex = nextBadges.findIndex((badge) => {
        if (incomingBadge.regraId && badge?.regraId && shouldAggregateBadgeByRule(incomingBadge) && shouldAggregateBadgeByRule(badge)) {
            return String(badge.regraId) === String(incomingBadge.regraId);
        }
        return String(badge?.id || '') === String(incomingBadge.id || '');
    });

    const incomingOccurrences = normalizeStoredBadgeOccurrences(incomingBadge);
    if (badgeIndex === -1) {
        const latestOccurrence = incomingOccurrences[incomingOccurrences.length - 1] || null;
        const normalizedBadge = {
            ...incomingBadge,
            origem: incomingBadge.origem || 'regra',
            descricao: latestOccurrence?.descricao || incomingBadge.descricao,
            data: latestOccurrence?.data || incomingBadge.data,
            stackCount: incomingOccurrences.length,
            latestOccurrenceId: latestOccurrence?.id,
            ocorrencias: incomingOccurrences,
        };
        nextBadges.push(normalizedBadge);
        return { badges: nextBadges, badge: normalizedBadge, occurrenceAdded: true };
    }

    const currentBadge = nextBadges[badgeIndex];
    const mergedOccurrences = normalizeStoredBadgeOccurrences(currentBadge);
    const knownIds = new Set(mergedOccurrences.map((occurrence) => String(occurrence?.id || '')));
    let occurrenceAdded = false;

    for (const occurrence of incomingOccurrences) {
        const occurrenceId = String(occurrence?.id || '');
        if (!occurrenceId || knownIds.has(occurrenceId)) continue;
        mergedOccurrences.push(occurrence);
        knownIds.add(occurrenceId);
        occurrenceAdded = true;
    }

    mergedOccurrences.sort((a, b) => {
        const dateDiff = compareOccurrenceDates(a?.data, b?.data);
        if (dateDiff !== 0) return dateDiff;
        return String(a?.id || '').localeCompare(String(b?.id || ''));
    });

    const latestOccurrence = mergedOccurrences[mergedOccurrences.length - 1] || null;
    const mergedBadge = {
        ...currentBadge,
        ...incomingBadge,
        origem: incomingBadge.origem || currentBadge.origem || 'regra',
        descricao: latestOccurrence?.descricao || incomingBadge.descricao || currentBadge.descricao,
        data: latestOccurrence?.data || incomingBadge.data || currentBadge.data,
        gameId: latestOccurrence?.gameId || incomingBadge.gameId || currentBadge.gameId,
        eventId: latestOccurrence?.eventId || incomingBadge.eventId || currentBadge.eventId,
        seasonYear: latestOccurrence?.seasonYear || incomingBadge.seasonYear || currentBadge.seasonYear,
        teamId: latestOccurrence?.teamId || incomingBadge.teamId || currentBadge.teamId,
        teamNome: latestOccurrence?.teamNome || incomingBadge.teamNome || currentBadge.teamNome,
        stackCount: mergedOccurrences.length,
        latestOccurrenceId: latestOccurrence?.id,
        ocorrencias: mergedOccurrences,
    };

    nextBadges[badgeIndex] = mergedBadge;
    return { badges: nextBadges, badge: mergedBadge, occurrenceAdded };
}

function applyRulePresentationToBadge(badge, regra, playerName) {
    const occurrences = normalizeStoredBadgeOccurrences(badge).map((occurrence) => {
        const renderContext = {
            ...(occurrence?.renderContext || {}),
            playerName: playerName || occurrence?.renderContext?.playerName || '',
        };
        const rendered = buildRenderedTexts(regra, renderContext);
        return {
            ...occurrence,
            descricao: rendered.descricao,
            renderContext,
        };
    });

    const latestOccurrence = occurrences[occurrences.length - 1] || null;
    const rendered = buildRenderedTexts(regra, latestOccurrence?.renderContext || { playerName: playerName || '' });

    return {
        ...badge,
        nome: rendered.titulo,
        emoji: regra.tipoIcone === 'emoji' ? (regra.iconeValor || '🏅') : '🏅',
        raridade: resolveRegraRaridade(regra),
        descricao: latestOccurrence?.descricao || rendered.descricao,
        data: latestOccurrence?.data || badge.data,
        gameId: latestOccurrence?.gameId || badge.gameId,
        eventId: latestOccurrence?.eventId || badge.eventId,
        seasonYear: latestOccurrence?.seasonYear || badge.seasonYear,
        teamId: latestOccurrence?.teamId || badge.teamId,
        teamNome: latestOccurrence?.teamNome || badge.teamNome,
        tipoAvaliacao: regra.tipoAvaliacao || badge.tipoAvaliacao,
        tipoIcone: regra.tipoIcone || 'emoji',
        iconeValor: regra.iconeValor || '🏅',
        stackCount: occurrences.length,
        latestOccurrenceId: latestOccurrence?.id || badge.latestOccurrenceId,
        ocorrencias: occurrences,
    };
}

function resolveGameNameForTemplate(gameData) {
    const teamA = String(gameData?.timeA_nome || 'ANCB').trim() || 'ANCB';
    const teamB = String(gameData?.timeB_nome || gameData?.adversario || 'Adversario').trim() || 'Adversario';
    return `${teamA} x ${teamB}`;
}

function resolveTeamNameFromEvent(eventData, teamId) {
    const targetId = String(teamId || '').trim();
    if (!targetId) return '';

    const allTeams = [
        ...(Array.isArray(eventData?.timesParticipantes) ? eventData.timesParticipantes : []),
        ...(Array.isArray(eventData?.times) ? eventData.times : []),
    ];

    const found = allTeams.find((team) => String(team?.id || '').trim() === targetId);
    return String(found?.nomeTime || '').trim();
}

// ─────────────────────────────────────────────────────────────
// 1. MONITOR DE CONVOCAÇÕES
//
// BUG CORRIGIDO: O roster do evento pode conter strings OU objetos
// {id, numero}. A comparação anterior com .includes() falhava quando
// os itens eram objetos, causando o reenvio da notificação a cada
// update no documento do evento (ex: ao iniciar o jogo).
// Agora extraímos sempre o ID antes de comparar.
// ─────────────────────────────────────────────────────────────
exports.sendRosterNotification = functions.firestore
    .document('eventos/{eventId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const oldData = change.before.data();

        if (!newData || !oldData) return null;

        // Normaliza ambos os rosters para arrays de IDs (string)
        const newRosterIds = (newData.jogadoresEscalados || [])
            .map(extractPlayerId)
            .filter(Boolean);

        const oldRosterIds = (oldData.jogadoresEscalados || [])
            .map(extractPlayerId)
            .filter(Boolean);

        // Apenas jogadores realmente novos (não existiam no roster anterior)
        const addedPlayerIds = newRosterIds.filter(id => !oldRosterIds.includes(id));

        if (addedPlayerIds.length === 0) return null;

        console.log(`Novos jogadores escalados no evento "${newData.nome}":`, addedPlayerIds);

        const promises = addedPlayerIds.map(playerId =>
            notifyPlayerConvocado(playerId, newData.nome, context.params.eventId)
        );

        return Promise.all(promises);
    });

// ─────────────────────────────────────────────────────────────
// 2. MONITOR DE FIM DE PARTIDA → Quiz de Avaliação
//
// ATUALIZADO: Novo sistema usa timesParticipantes com flag isANCB.
// O quiz só é enviado para jogadores do time ANCB — eles avaliam
// apenas os colegas do próprio time. Times adversários externos
// não têm jogadores cadastrados e são ignorados.
//
// PROTEÇÃO CONTRA DUPLICATAS: Usa um timestamp 'notificationSentAt'
// para garantir que notificações sejam enviadas apenas uma vez,
// mesmo que o documento seja atualizado múltiplas vezes.
// ─────────────────────────────────────────────────────────────
exports.onGameFinished = functions.firestore
    .document('eventos/{eventId}/jogos/{gameId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const oldData = change.before.data();

        if (!newData || !oldData) return null;

        // PROTEÇÃO: Se já foi enviada notificação, não reenviar
        // Verifica se o campo 'notificationSentAt' já existe
        if (newData.notificationSentAt) {
            console.log(`Notificações já foram enviadas para o jogo ${context.params.gameId}. Pulando.`);
            return null;
        }

        // Dispara APENAS na transição → finalizado
        const justFinished = oldData.status !== 'finalizado' && newData.status === 'finalizado';
        if (!justFinished) return null;

        const { eventId, gameId } = context.params;
        console.log(`Jogo ${gameId} finalizado no evento ${eventId}.`);

        const eventDoc = await admin.firestore().collection('eventos').doc(eventId).get();
        if (!eventDoc.exists) return null;
        const eventData = eventDoc.data();

        const scoreA = newData.placarTimeA_final ?? newData.placarANCB_final ?? 0;
        const scoreB = newData.placarTimeB_final ?? newData.placarAdversario_final ?? 0;
        const teamAName = newData.timeA_nome || 'ANCB';
        const teamBName = newData.timeB_nome || newData.adversario || 'Adversário';

        await upsertAutoGameFeedPost(eventId, gameId, eventData, newData, teamAName, scoreA, teamBName, scoreB);

        let ancbPlayerIds = [];
        let teamNotifications = [];
        const gameTeamIds = [newData.timeA_id, newData.timeB_id].filter(Boolean);

        // 1) Modelo novo (torneio_externo e internos evoluídos): timesParticipantes + isANCB
        if (eventData.timesParticipantes && eventData.timesParticipantes.length > 0) {
            const participantTeams = gameTeamIds.length > 0
                ? eventData.timesParticipantes.filter(t => gameTeamIds.includes(t.id))
                : eventData.timesParticipantes;

            // Mantém a regra atual do externo e habilita múltiplos times ANCB/parceiros
            // para interno quando aplicável.
            const ancbTeams = participantTeams.filter(t => t.isANCB);

            if (ancbTeams.length === 0) {
                console.log(`Jogo ${gameId} sem time ANCB participante. Quiz não enviado.`);
                return null;
            }

            ancbTeams.forEach(team => {
                const ids = (team.jogadores || []).filter(Boolean);
                ancbPlayerIds.push(...ids);
                teamNotifications.push({ teamId: team.id, playerIds: ids });
            });

            console.log(`Modelo timesParticipantes: ${ancbTeams.length} time(s) ANCB, ${ancbPlayerIds.length} jogador(es).`);
        }
        // 2) Modelo legado interno: times
        else if (eventData.times && eventData.times.length > 0) {
            if (gameTeamIds.length > 0) {
                const participantTeams = eventData.times.filter(t => gameTeamIds.includes(t.id));
                participantTeams.forEach(team => {
                    const ids = (team.jogadores || []).filter(Boolean);
                    ancbPlayerIds.push(...ids);
                    teamNotifications.push({ teamId: team.id, playerIds: ids });
                });
                console.log(`Torneio interno (times): ${ancbPlayerIds.length} jogador(es) dos times da partida.`);
            } else {
                // fallback seguro
                eventData.times.forEach(team => {
                    const ids = (team.jogadores || []).filter(Boolean);
                    ancbPlayerIds.push(...ids);
                    teamNotifications.push({ teamId: team.id, playerIds: ids });
                });
                console.log(`Torneio interno (fallback): ${ancbPlayerIds.length} jogador(es).`);
            }
        }
        // 3) Modelo amistoso/legado: roster por jogo ou por evento
        else {
            const gameRoster = (newData.jogadoresEscalados || []).map(extractPlayerId).filter(Boolean);
            const eventRoster = (eventData.jogadoresEscalados || []).map(extractPlayerId).filter(Boolean);
            ancbPlayerIds = gameRoster.length > 0 ? gameRoster : eventRoster;

            // Fallback robusto: roster em subcoleção (com status) quando arrays legados estiverem vazios
            if (ancbPlayerIds.length === 0) {
                const rosterSnap = await admin.firestore().collection('eventos').doc(eventId).collection('roster').get();
                if (!rosterSnap.empty) {
                    ancbPlayerIds = rosterSnap.docs
                        .filter(d => {
                            const status = d.data()?.status;
                            return status !== 'recusado';
                        })
                        .map(d => d.id)
                        .filter(Boolean);
                }
            }

            if (ancbPlayerIds.length > 0) {
                teamNotifications.push({ teamId: null, playerIds: ancbPlayerIds });
            }

            console.log(`Amistoso/legado: ${ancbPlayerIds.length} jogador(es) no roster.`);
        }

        ancbPlayerIds = [...new Set(ancbPlayerIds.filter(Boolean))];

        if (ancbPlayerIds.length === 0) {
            console.log("Nenhum jogador ANCB encontrado. Verifique se o time está marcado como isANCB.");
            return null;
        }

        const eventName = eventData.nome || 'Evento';

        console.log(`Notificando ${ancbPlayerIds.length} jogadores ANCB sobre o quiz pós-jogo.`);

        const teamByPlayer = new Map();
        teamNotifications.forEach((bucket) => {
            (bucket.playerIds || []).forEach((playerId) => {
                if (!teamByPlayer.has(playerId)) {
                    teamByPlayer.set(playerId, bucket.teamId || null);
                }
            });
        });

        const promises = ancbPlayerIds.map(playerId =>
            notifyPlayerQuizPosJogo(
                playerId,
                eventId,
                gameId,
                eventName,
                teamAName,
                scoreA,
                teamBName,
                scoreB,
                teamByPlayer.get(playerId) || null
            )
        );

        await Promise.all(promises);

        // MARCA QUE NOTIFICAÇÕES FORAM ENVIADAS - Previne reenvios
        await admin.firestore().collection('eventos').doc(eventId).collection('jogos').doc(gameId)
            .update({ notificationSentAt: admin.firestore.FieldValue.serverTimestamp() });

        return null;
    });

// ─────────────────────────────────────────────────────────────
// 2.1 AUTO POST: RESULTADO DE EVENTO FINALIZADO
// ─────────────────────────────────────────────────────────────
exports.onEventFinishedCreatePost = functions.firestore
    .document('eventos/{eventId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const oldData = change.before.data();

        if (!newData || !oldData) return null;
        if (oldData.status === 'finalizado' || newData.status !== 'finalizado') return null;

        const configDoc = await admin.firestore().collection('configuracoes').doc('auto_posts').get();
        const config = configDoc.exists ? configDoc.data() : {};

        if (config.event_post_enabled === false) {
            console.log(`Posts automáticos de evento desabilitados. Pulando post para evento ${context.params.eventId}.`);
            return null;
        }

        const eventId = context.params.eventId;
        const postId = `auto_event_${eventId}`;
        const eventTypeLabel = newData.type === 'torneio_interno'
            ? 'Torneio Interno'
            : (newData.type === 'torneio_externo' ? 'Torneio Externo' : 'Amistoso');

        const primeiro = newData.podio?.primeiro || '';
        const segundo  = newData.podio?.segundo  || '';
        const terceiro = newData.podio?.terceiro  || '';

        let defaultResumo = `${newData.nome || 'Evento'} foi finalizado.`;
        if (primeiro || segundo || terceiro) {
            defaultResumo = [
                `🏁 ${newData.nome || 'Evento'} finalizado!`,
                `🥇 ${primeiro || '---'}`,
                `🥈 ${segundo  || '---'}`,
                `🥉 ${terceiro || '---'}`,
            ].join('\n');
        }

        const vars = {
            '{eventName}': newData.nome || 'Evento',
            '{eventDate}': newData.data || '',
            '{eventType}': eventTypeLabel,
            '{primeiro}':  primeiro || '---',
            '{segundo}':   segundo  || '---',
            '{terceiro}':  terceiro || '---',
        };
        const applyTpl = (tpl) => tpl.replace(/\{eventName\}|\{eventDate\}|\{eventType\}|\{primeiro\}|\{segundo\}|\{terceiro\}/g, (m) => vars[m] ?? m);

        const titulo = config.event_post_titulo_template
            ? applyTpl(config.event_post_titulo_template)
            : `Resultado do Evento: ${newData.nome || 'Evento'}`;

        const resumo = config.event_post_resumo_template
            ? applyTpl(config.event_post_resumo_template)
            : defaultResumo;

        await admin.firestore().collection('feed_posts').doc(postId).set({
            type: 'resultado_evento',
            source: 'auto_event_finalized',
            source_ref: `event:${eventId}`,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            author_id: 'system',
            image_url: null,
            content: {
                titulo,
                resumo,
                eventId,
                resultado_label: eventTypeLabel,
                resultado_detalhes: `${newData.nome || 'Evento'} • ${newData.data || ''}`,
            }
        }, { merge: true });

        return null;
    });

// ─────────────────────────────────────────────────────────────
// 2.2 AVISOS: FAN-OUT OPCIONAL PARA JOGADORES
// ─────────────────────────────────────────────────────────────
exports.onAvisoPostCreated = functions.firestore
    .document('feed_posts/{postId}')
    .onCreate(async (snap, context) => {
        const data = snap.data() || {};
        if (data.type !== 'aviso' || !data.notifyPlayers) return null;

        const usuariosSnap = await admin.firestore().collection('usuarios')
            .where('role', '==', 'jogador')
            .where('status', '==', 'active')
            .get();

        if (usuariosSnap.empty) return null;

        const titulo = data?.content?.titulo || 'Novo Aviso';
        const resumo = data?.content?.resumo || 'Você recebeu um novo aviso no Portal ANCB.';
        const postId = context.params.postId;

        const writes = usuariosSnap.docs.map((userDoc) => {
            const notifId = `aviso_${postId}_${userDoc.id}`;
            return admin.firestore().collection('notifications').doc(notifId).set({
                targetUserId: userDoc.id,
                type: 'feed_alert',
                title: `📣 ${titulo}`,
                message: resumo,
                data: { postId, type: 'aviso' },
                read: false,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
        });

        await Promise.all(writes);
        return null;
    });

// ─────────────────────────────────────────────────────────────
// 2.3 NOVO CADASTRO: ALERTA AUTOMÁTICO PARA ADMINS
// ─────────────────────────────────────────────────────────────
exports.notifyAdminsOnNewUserRegistration = functions.firestore
    .document('usuarios/{userId}')
    .onCreate(async (snap, context) => {
        const userData = snap.data() || {};
        const newUserId = context.params.userId;

        if (userData.status !== 'pending') return null;

        const userName = String(userData.nome || 'Novo usuário').trim();
        const userEmail = String(userData.email || userData.emailContato || '').trim();

        try {
            const adminsSnap = await admin.firestore().collection('usuarios')
                .where('role', 'in', ['admin', 'super-admin'])
                .get();

            if (adminsSnap.empty) {
                console.log(`Nenhum admin encontrado para ser notificado sobre o cadastro ${newUserId}.`);
                return null;
            }

            const writes = adminsSnap.docs
                .filter((adminDoc) => adminDoc.id !== newUserId)
                .map((adminDoc) => {
                    const notifId = `new_user_pending_${newUserId}_${adminDoc.id}`;
                    return admin.firestore().collection('notifications').doc(notifId).set({
                        targetUserId: adminDoc.id,
                        type: 'new_user_pending_approval',
                        title: 'Novo usuário aguardando aprovação 👤',
                        message: userEmail
                            ? `${userName} acabou de se cadastrar (${userEmail}).`
                            : `${userName} acabou de se cadastrar no portal.`,
                        data: {
                            source: 'new_user_registration',
                            newUserId,
                            userName,
                            userEmail,
                            status: 'pending',
                        },
                        read: false,
                        timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    }, { merge: true });
                });

            await Promise.all(writes);
            console.log(`✅ ${writes.length} admin(s) notificados sobre o novo cadastro de ${userName}.`);
        } catch (error) {
            console.error('Erro ao notificar admins sobre novo cadastro:', error);
        }

        return null;
    });

// ─────────────────────────────────────────────────────────────
// 3. MONITOR DE NOTIFICAÇÕES DIRETAS (sem alterações)
// ─────────────────────────────────────────────────────────────
exports.sendDirectNotification = functions.firestore
    .document('notifications/{notificationId}')
    .onCreate(async (snap, context) => {
        const data = snap.data();
        const targetUserId = data.targetUserId;

        if (!targetUserId) return null;

        try {
            const userDoc = await admin.firestore().collection('usuarios').doc(targetUserId).get();
            if (!userDoc.exists) return null;

            const userData = userDoc.data();
            const fcmToken = userData.fcmToken;

            if (!fcmToken) {
                console.log(`Usuário ${targetUserId} não tem token FCM cadastrado.`);
                return null;
            }

            const message = {
                token: fcmToken,
                notification: {
                    title: data.title || "Portal ANCB",
                    body: data.message || "Você tem uma nova notificação.",
                },
                data: {
                    type: data.type || "general",
                    eventId: data.eventId || "",
                    gameId: data.gameId || "",
                    url: "/"
                },
                android: {
                    priority: "high",
                    notification: {
                        priority: "max",
                        channelId: "ancb_alerts",
                        defaultSound: true,
                        defaultVibrateTimings: true,
                        icon: 'stock_ticker_update',
                        color: '#F27405'
                    }
                },
                webpush: {
                    headers: { Urgency: "high" },
                    fcm_options: { link: "/" }
                }
            };

            return admin.messaging().send(message);
        } catch (error) {
            console.error("Erro ao enviar notificação direta:", error);
            return null;
        }
    });

// ─────────────────────────────────────────────────────────────
// 4. ADMIN RESET PASSWORD (sem alterações)
// ─────────────────────────────────────────────────────────────
exports.adminResetPassword = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'O usuário deve estar logado.');
    }

    const callerUid = context.auth.uid;
    const targetUid = data.targetUid;

    const callerDoc = await admin.firestore().collection('usuarios').doc(callerUid).get();
    const callerRole = callerDoc.exists ? callerDoc.data().role : null;
    if (!callerDoc.exists || (callerRole !== 'admin' && callerRole !== 'super-admin')) {
        throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem resetar senhas.');
    }

    try {
        await admin.auth().updateUser(targetUid, { password: 'ancb1234' });
        return { success: true, message: 'Senha resetada para "ancb1234"' };
    } catch (error) {
        console.error("Erro ao resetar senha:", error);
        throw new functions.https.HttpsError('internal', 'Erro ao resetar senha.', error);
    }
});

// ─────────────────────────────────────────────────────────────
// 4.1 MOTOR DE CONQUISTAS POS-JOGO (CALLABLE)
//
// Chamada manual no fluxo de "Finalizar Jogo".
// IMPORTANTE: sempre usa arrayUnion e nunca substitui badges existentes.
// ─────────────────────────────────────────────────────────────
exports.avaliarConquistasPartida = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Usuario precisa estar autenticado.');
    }

    const callerUid = context.auth.uid;
    const callerDoc = await admin.firestore().collection('usuarios').doc(callerUid).get();
    const callerRole = callerDoc.exists ? callerDoc.data().role : null;
    if (!callerDoc.exists || (callerRole !== 'admin' && callerRole !== 'super-admin')) {
        throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem avaliar conquistas.');
    }

    const jogoId = String(data?.jogoId || '').trim();
    const eventoId = String(data?.eventoId || '').trim();
    if (!jogoId || !eventoId) {
        throw new functions.https.HttpsError('invalid-argument', 'Informe jogoId e eventoId.');
    }

    const eventRef = admin.firestore().collection('eventos').doc(eventoId);
    const gameRef = eventRef.collection('jogos').doc(jogoId);

    const [eventSnap, gameSnap, rulesSnap] = await Promise.all([
        eventRef.get(),
        gameRef.get(),
        admin.firestore().collection('conquistas_regras')
            .where('ativo', '==', true)
            .where('tipoAvaliacao', '==', 'pos_jogo')
            .get(),
    ]);

    if (!eventSnap.exists) {
        throw new functions.https.HttpsError('not-found', `Evento ${eventoId} nao encontrado.`);
    }
    if (!gameSnap.exists) {
        throw new functions.https.HttpsError('not-found', `Jogo ${jogoId} nao encontrado.`);
    }

    const eventData = eventSnap.data() || {};
    const gameData = gameSnap.data() || {};

    const regras = rulesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    if (!regras.length) {
        return {
            success: true,
            regrasAvaliadas: 0,
            jogadoresProcessados: 0,
            conquistasConcedidas: 0,
            detalhes: ['Nenhuma regra ativa pos_jogo encontrada.'],
        };
    }

    const gameTeamContext = resolveAncbTeamPlayersForGame(eventData, gameData);
    const playerIds = gameTeamContext.playerIds;
    const playerTeamMap = { ...gameTeamContext.playerTeamMap };
    const teamPlayersMap = { ...gameTeamContext.teamPlayersMap };
    if (!playerIds.length) {
        return {
            success: true,
            regrasAvaliadas: regras.length,
            jogadoresProcessados: 0,
            conquistasConcedidas: 0,
            detalhes: ['Nenhum jogador ANCB elegivel no jogo.'],
        };
    }

    const cestasSnap = await gameRef.collection('cestas').get();
    const reviewsSnap = await admin.firestore().collection('avaliacoes_gamified')
        .where('eventId', '==', eventoId)
        .where('gameId', '==', jogoId)
        .get();
    const pontosByPlayer = {};
    const bolas3ByPlayer = {};

    cestasSnap.docs.forEach((doc) => {
        const cesta = doc.data();
        const pid = cesta?.jogadorId;
        if (!pid || !playerIds.includes(pid)) return;
        const pts = Number(cesta?.pontos) || 0;

        const observedTeamId = String(cesta?.timeId || '').trim();
        if (observedTeamId) {
            if (!Array.isArray(teamPlayersMap[observedTeamId])) teamPlayersMap[observedTeamId] = [];
            if (!teamPlayersMap[observedTeamId].includes(pid)) teamPlayersMap[observedTeamId].push(pid);
            if (!playerTeamMap[pid] || playerTeamMap[pid] === 'ancb_default') playerTeamMap[pid] = observedTeamId;
        }

        pontosByPlayer[pid] = (pontosByPlayer[pid] || 0) + pts;
        if (pts === 3) {
            bolas3ByPlayer[pid] = (bolas3ByPlayer[pid] || 0) + 1;
        }
    });

    const topScorersByTeam = {};
    for (const [teamId, teamPlayers] of Object.entries(teamPlayersMap)) {
        let maxPontosTeam = 0;
        for (const pid of teamPlayers) {
            const total = Number(pontosByPlayer[pid] || 0);
            if (total > maxPontosTeam) maxPontosTeam = total;
        }
        topScorersByTeam[teamId] = maxPontosTeam > 0
            ? teamPlayers.filter((pid) => Number(pontosByPlayer[pid] || 0) === maxPontosTeam)
            : [];
    }

    const scoresByPlayer = aggregateAttributeScoresFromReviews(reviewsSnap.docs);
    const topByAttributeByTeam = {};
    for (const [teamId, teamPlayers] of Object.entries(teamPlayersMap)) {
        const teamScores = {};
        for (const pid of teamPlayers) {
            if (scoresByPlayer[pid]) {
                teamScores[pid] = scoresByPlayer[pid];
            }
        }
        topByAttributeByTeam[teamId] = buildTopByAttribute(teamScores);
    }

    const stats = { pontosByPlayer, bolas3ByPlayer, topScorersByTeam, topByAttributeByTeam };
    const today = new Date().toISOString().split('T')[0];
    let conquistasConcedidas = 0;
    const detalhes = [];
    const seasonYear = String(eventData?.data || '').slice(-4);

    for (const playerId of playerIds) {
        const playerRef = admin.firestore().collection('jogadores').doc(playerId);
        const playerSnap = await playerRef.get();
        if (!playerSnap.exists) continue;

        const playerData = playerSnap.data() || {};
        const existingBadges = Array.isArray(playerData.badges) ? playerData.badges : [];
        const matchedRules = [];
        const teamId = String(playerTeamMap[playerId] || 'ancb_default');
        const teamName = resolveTeamNameFromEvent(eventData, teamId) || (teamId === 'ancb_default' ? 'ANCB' : teamId);

        for (const regra of regras) {
            const gatilho = normalizeGatilho(regra.gatilho);
            if (!evaluateRuleForPlayer(gatilho, stats, playerId, teamId)) continue;

            matchedRules.push(regra);
        }

        const dominantRules = selectDominantMatchedRules(matchedRules);
        let nextBadges = [...existingBadges];
        const awardedBadges = [];

        for (const regra of dominantRules) {
            const gatilho = normalizeGatilho(regra.gatilho);
            const renderContext = {
                eventName: eventData?.nome || 'Evento',
                gameName: resolveGameNameForTemplate(gameData),
                seasonYear,
                playerName: playerData?.nome || playerId,
                value: typeof gatilho?.minimo === 'number' ? gatilho.minimo : '',
            };
            const rendered = buildRenderedTexts(regra, renderContext);
            const incomingBadge = buildStackedBadgeFromRule(regra, rendered, {
                categoria: 'partida',
                tipoAvaliacao: 'pos_jogo',
                occurrence: {
                    id: `jogo_${jogoId}`,
                    descricao: rendered.descricao,
                    data: today,
                    gameId: jogoId,
                    eventId: eventoId,
                    seasonYear,
                    teamId,
                    teamNome: teamName,
                    contextLabel: renderContext.gameName,
                    renderContext,
                },
            });

            const result = upsertStackedBadgeList(nextBadges, incomingBadge);
            nextBadges = result.badges;
            if (!result.occurrenceAdded) continue;

            awardedBadges.push({
                badge: result.badge,
                occurrenceId: `jogo_${jogoId}`,
                message: rendered.mensagem,
            });
        }

        if (!awardedBadges.length) continue;

        await playerRef.update({
            badges: nextBadges,
        });

        conquistasConcedidas += awardedBadges.length;
        detalhes.push(`${playerData.nome || playerId} [${teamName}]: ${awardedBadges.length} conquista(s)`);
        console.log(`Conquistas pos-jogo -> jogador=${playerData.nome || playerId} team=${teamId} (${teamName}) qtd=${awardedBadges.length}`);

        const usersSnap = await admin.firestore().collection('usuarios')
            .where('linkedPlayerId', '==', playerId)
            .limit(1)
            .get();

        if (!usersSnap.empty) {
            const targetUserId = usersSnap.docs[0].id;
            for (const awarded of awardedBadges) {
                const badge = awarded.badge;
                const regraId = badge.regraId;
                const message = awarded.message || `Voce ganhou a conquista "${badge.nome}".`;
                const notifId = `badge_${targetUserId}_${badge.id}_${awarded.occurrenceId}`;

                await admin.firestore().collection('notifications').doc(notifId).set({
                    targetUserId,
                    type: 'evaluation',
                    title: `Nova conquista desbloqueada! ${badge.emoji}`,
                    message,
                    data: {
                        badgeId: badge.id,
                        occurrenceId: awarded.occurrenceId,
                        regraId,
                        eventoId,
                        jogoId,
                        teamId,
                        teamNome: teamName,
                    },
                    read: false,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                }, { merge: true });
            }
        }
    }

    return {
        success: true,
        regrasAvaliadas: regras.length,
        jogadoresProcessados: playerIds.length,
        conquistasConcedidas,
        detalhes,
    };
});

// ─────────────────────────────────────────────────────────────
// 4.2 MOTOR DE CONQUISTAS NO FECHAMENTO DE TEMPORADA (CALLABLE)
//
// Avalia regras ativas tipoAvaliacao='ao_fechar_temporada' usando todos os
// eventos finalizados do ano informado.
// ─────────────────────────────────────────────────────────────
exports.avaliarConquistasFechamentoTemporada = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Usuario precisa estar autenticado.');
    }

    const callerUid = context.auth.uid;
    const callerDoc = await admin.firestore().collection('usuarios').doc(callerUid).get();
    const callerRole = callerDoc.exists ? callerDoc.data().role : null;
    if (!callerDoc.exists || (callerRole !== 'admin' && callerRole !== 'super-admin')) {
        throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem fechar temporada de conquistas.');
    }

    const seasonYear = String(data?.seasonYear || '').trim();
    if (!seasonYear) {
        throw new functions.https.HttpsError('invalid-argument', 'Informe seasonYear.');
    }

    const [eventosSnap, rulesSnap] = await Promise.all([
        admin.firestore().collection('eventos').where('status', '==', 'finalizado').get(),
        admin.firestore().collection('conquistas_regras')
            .where('ativo', '==', true)
            .where('tipoAvaliacao', '==', 'ao_fechar_temporada')
            .get(),
    ]);

    const eventosDoAno = eventosSnap.docs.filter((doc) => {
        const rawDate = String(doc.data()?.data || '');
        return rawDate.includes(seasonYear) || rawDate.endsWith('/' + seasonYear.slice(2));
    });

    if (!eventosDoAno.length) {
        return {
            success: true,
            regrasAvaliadas: 0,
            jogadoresProcessados: 0,
            conquistasConcedidas: 0,
            detalhes: [`Nenhum evento finalizado encontrado em ${seasonYear}.`],
        };
    }

    const regras = rulesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    if (!regras.length) {
        return {
            success: true,
            regrasAvaliadas: 0,
            jogadoresProcessados: 0,
            conquistasConcedidas: 0,
            detalhes: ['Nenhuma regra ativa ao_fechar_temporada encontrada.'],
        };
    }

    const eventosParticipados = {};
    const pontosNoAno = {};
    const bolas3NoAno = {};
    const maxPontosJogo = {};
    const eventBadgesByPlayer = {};
    const campeoes = new Set();
    const vices = new Set();
    const terceiros = new Set();
    const cestinhas = new Set();
    const allPlayers = new Set();
    const seasonReviews = [];

    for (const eventDoc of eventosDoAno) {
        const eventId = eventDoc.id;
        const eventData = eventDoc.data() || {};
        const playerIds = resolveAncbPlayersForEvent(eventData);

        playerIds.forEach((pid) => {
            allPlayers.add(pid);
            eventosParticipados[pid] = (eventosParticipados[pid] || 0) + 1;
        });

        const allTimes = eventData.timesParticipantes || eventData.times || [];
        const podio = eventData.podio || {};
        const resolvePodioPlayers = (teamName) => {
            if (!teamName) return [];
            const team = allTimes.find((t) => String(t?.nomeTime || '').toLowerCase().trim() === String(teamName).toLowerCase().trim());
            return (team?.jogadores || []).filter((pid) => playerIds.includes(pid));
        };

        resolvePodioPlayers(podio.primeiro).forEach((pid) => campeoes.add(pid));
        resolvePodioPlayers(podio.segundo).forEach((pid) => vices.add(pid));
        resolvePodioPlayers(podio.terceiro).forEach((pid) => terceiros.add(pid));

        const jogosSnap = await admin.firestore().collection('eventos').doc(eventId).collection('jogos').get();
        const reviewsSnap = await admin.firestore().collection('avaliacoes_gamified')
            .where('eventId', '==', eventId)
            .get();
        seasonReviews.push(...reviewsSnap.docs);
        const pontosNoEvento = {};

        for (const jogoDoc of jogosSnap.docs) {
            const cestasSnap = await admin.firestore().collection('eventos').doc(eventId)
                .collection('jogos').doc(jogoDoc.id).collection('cestas').get();

            const pontosNesteJogo = {};
            for (const cestaDoc of cestasSnap.docs) {
                const cesta = cestaDoc.data() || {};
                const pid = cesta.jogadorId;
                if (!pid || !playerIds.includes(pid)) continue;

                const pts = Number(cesta.pontos) || 0;
                pontosNoEvento[pid] = (pontosNoEvento[pid] || 0) + pts;
                pontosNesteJogo[pid] = (pontosNesteJogo[pid] || 0) + pts;
                pontosNoAno[pid] = (pontosNoAno[pid] || 0) + pts;

                if (pts === 3) {
                    bolas3NoAno[pid] = (bolas3NoAno[pid] || 0) + 1;
                }
            }

            Object.entries(pontosNesteJogo).forEach(([pid, pts]) => {
                if ((maxPontosJogo[pid] || 0) < pts) {
                    maxPontosJogo[pid] = pts;
                }
            });
        }

        let maxPontosEvento = 0;
        Object.values(pontosNoEvento).forEach((pts) => {
            if (pts > maxPontosEvento) maxPontosEvento = pts;
        });
        if (maxPontosEvento > 0) {
            Object.entries(pontosNoEvento).forEach(([pid, pts]) => {
                if (pts === maxPontosEvento) cestinhas.add(pid);
            });
        }
    }

    const seasonStats = {
        eventosParticipados,
        pontosNoAno,
        bolas3NoAno,
        maxPontosJogo,
        campeoes,
        vices,
        terceiros,
        cestinhas,
        rankPontos: {},
        rankBolas3: {},
        totalEventos: eventosDoAno.length,
        eventBadgesByPlayer,
        topByAttribute: {},
    };

    const seasonScoresByPlayer = aggregateAttributeScoresFromReviews(seasonReviews);
    seasonStats.topByAttribute = buildTopByAttribute(seasonScoresByPlayer);

    const rankPontosIds = Object.entries(pontosNoAno).sort((a, b) => Number(b[1]) - Number(a[1])).map(([pid]) => pid);
    rankPontosIds.forEach((pid, index) => {
        seasonStats.rankPontos[pid] = index + 1;
    });

    const rankBolas3Ids = Object.entries(bolas3NoAno).sort((a, b) => Number(b[1]) - Number(a[1])).map(([pid]) => pid);
    rankBolas3Ids.forEach((pid, index) => {
        seasonStats.rankBolas3[pid] = index + 1;
    });

    const today = new Date().toISOString().split('T')[0];
    let conquistasConcedidas = 0;
    const detalhes = [];
    const allPlayerIds = Array.from(allPlayers);

    for (const playerId of allPlayerIds) {
        const playerRef = admin.firestore().collection('jogadores').doc(playerId);
        const playerSnap = await playerRef.get();
        if (!playerSnap.exists) continue;

        const playerData = playerSnap.data() || {};
        const existingBadges = Array.isArray(playerData.badges) ? playerData.badges : [];
        seasonStats.eventBadgesByPlayer[playerId] = countEventBadgesInSeason(existingBadges, seasonYear);
        const matchedRules = [];

        for (const regra of regras) {
            const gatilho = normalizeGatilho(regra.gatilho);
            if (!evaluateSeasonRuleForPlayer(gatilho, seasonStats, playerId)) continue;

            matchedRules.push(regra);
        }

        const dominantRules = selectDominantMatchedRules(matchedRules);
        let nextBadges = [...existingBadges];
        const awardedBadges = [];

        for (const regra of dominantRules) {
            const gatilho = normalizeGatilho(regra.gatilho);
            const renderContext = {
                eventName: '',
                gameName: '',
                seasonYear,
                playerName: playerData?.nome || playerId,
                value: typeof gatilho?.minimo === 'number' ? gatilho.minimo : '',
            };
            const rendered = buildRenderedTexts(regra, renderContext);
            const incomingBadge = buildStackedBadgeFromRule(regra, rendered, {
                categoria: 'temporada',
                tipoAvaliacao: 'ao_fechar_temporada',
                occurrence: {
                    id: `temporada_${seasonYear}`,
                    descricao: rendered.descricao,
                    data: today,
                    seasonYear,
                    contextLabel: seasonYear,
                    renderContext,
                },
            });

            const result = upsertStackedBadgeList(nextBadges, incomingBadge);
            nextBadges = result.badges;
            if (!result.occurrenceAdded) continue;

            awardedBadges.push({
                badge: result.badge,
                occurrenceId: `temporada_${seasonYear}`,
                message: rendered.mensagem,
            });
        }

        if (!awardedBadges.length) continue;

        await playerRef.update({
            badges: nextBadges,
        });

        conquistasConcedidas += awardedBadges.length;
        detalhes.push(`${playerData.nome || playerId}: ${awardedBadges.length} conquista(s)`);

        const usersSnap = await admin.firestore().collection('usuarios')
            .where('linkedPlayerId', '==', playerId)
            .limit(1)
            .get();

        if (!usersSnap.empty) {
            const targetUserId = usersSnap.docs[0].id;
            for (const awarded of awardedBadges) {
                const badge = awarded.badge;
                const regraId = badge.regraId;
                const message = awarded.message || `Voce ganhou a conquista "${badge.nome}".`;
                const notifId = `badge_${targetUserId}_${badge.id}_${awarded.occurrenceId}`;

                await admin.firestore().collection('notifications').doc(notifId).set({
                    targetUserId,
                    type: 'evaluation',
                    title: `Nova conquista desbloqueada! ${badge.emoji}`,
                    message,
                    data: {
                        badgeId: badge.id,
                        occurrenceId: awarded.occurrenceId,
                        regraId,
                        seasonYear,
                    },
                    read: false,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                }, { merge: true });
            }
        }
    }

    return {
        success: true,
        regrasAvaliadas: regras.length,
        jogadoresProcessados: allPlayerIds.length,
        conquistasConcedidas,
        detalhes,
    };
});

async function executarConquistasPosEvento(eventId, forcedEventData = null) {
    const eventRef = admin.firestore().collection('eventos').doc(eventId);
    const [eventSnap, rulesSnap] = await Promise.all([
        forcedEventData ? null : eventRef.get(),
        admin.firestore().collection('conquistas_regras')
            .where('ativo', '==', true)
            .where('tipoAvaliacao', '==', 'pos_evento')
            .get(),
    ]);

    const eventData = forcedEventData || (eventSnap && eventSnap.exists ? eventSnap.data() : null);
    if (!eventData) {
        throw new functions.https.HttpsError('not-found', `Evento ${eventId} nao encontrado.`);
    }

    const regras = rulesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    if (!regras.length) {
        return {
            success: true,
            regrasAvaliadas: 0,
            jogadoresProcessados: 0,
            conquistasConcedidas: 0,
            detalhes: ['Nenhuma regra ativa pos_evento encontrada.'],
        };
    }

    const eventTeamContext = resolveAncbTeamPlayersForEvent(eventData);
    const playerIds = eventTeamContext.playerIds;
    const playerTeamMap = { ...eventTeamContext.playerTeamMap };
    const teamPlayersMap = { ...eventTeamContext.teamPlayersMap };
    if (!playerIds.length) {
        return {
            success: true,
            regrasAvaliadas: regras.length,
            jogadoresProcessados: 0,
            conquistasConcedidas: 0,
            detalhes: ['Nenhum jogador ANCB elegivel no evento.'],
        };
    }

    const jogosSnap = await eventRef.collection('jogos').get();
    const pontosNoEvento = {};
    const bolas3NoEvento = {};
    const maxPontosJogo = {};

    for (const jogoDoc of jogosSnap.docs) {
        const cestasSnap = await eventRef.collection('jogos').doc(jogoDoc.id).collection('cestas').get();
        const pontosNesteJogo = {};

        for (const cestaDoc of cestasSnap.docs) {
            const cesta = cestaDoc.data() || {};
            const pid = cesta.jogadorId;
            if (!pid || !playerIds.includes(pid)) continue;

            const observedTeamId = String(cesta?.timeId || '').trim();
            if (observedTeamId) {
                if (!Array.isArray(teamPlayersMap[observedTeamId])) teamPlayersMap[observedTeamId] = [];
                if (!teamPlayersMap[observedTeamId].includes(pid)) teamPlayersMap[observedTeamId].push(pid);
                if (!playerTeamMap[pid] || playerTeamMap[pid] === 'ancb_default') playerTeamMap[pid] = observedTeamId;
            }

            const pts = Number(cesta.pontos) || 0;
            pontosNoEvento[pid] = (pontosNoEvento[pid] || 0) + pts;
            pontosNesteJogo[pid] = (pontosNesteJogo[pid] || 0) + pts;
            if (pts === 3) {
                bolas3NoEvento[pid] = (bolas3NoEvento[pid] || 0) + 1;
            }
        }

        Object.entries(pontosNesteJogo).forEach(([pid, pts]) => {
            if ((maxPontosJogo[pid] || 0) < pts) {
                maxPontosJogo[pid] = pts;
            }
        });
    }

    const podio = eventData.podio || {};
    const allTimes = eventData.timesParticipantes || eventData.times || [];
    const resolvePodioPlayers = (teamName) => {
        if (!teamName) return [];
        const team = allTimes.find((t) => String(t?.nomeTime || '').toLowerCase().trim() === String(teamName).toLowerCase().trim());
        return (team?.jogadores || []).filter((pid) => playerIds.includes(pid));
    };

    const campeoes = new Set(resolvePodioPlayers(podio.primeiro));
    const vices = new Set(resolvePodioPlayers(podio.segundo));
    const terceiros = new Set(resolvePodioPlayers(podio.terceiro));
    const medalhistas = new Set([...campeoes, ...vices, ...terceiros]);

    const cestinhasByTeam = {};
    for (const [teamId, teamPlayers] of Object.entries(teamPlayersMap)) {
        let maxPontosTeam = 0;
        for (const pid of teamPlayers) {
            const pts = Number(pontosNoEvento[pid] || 0);
            if (pts > maxPontosTeam) maxPontosTeam = pts;
        }
        cestinhasByTeam[teamId] = new Set(
            maxPontosTeam > 0
                ? teamPlayers.filter((pid) => Number(pontosNoEvento[pid] || 0) === maxPontosTeam)
                : []
        );
    }

    const reviewsSnap = await admin.firestore().collection('avaliacoes_gamified')
        .where('eventId', '==', eventId)
        .get();
    const scoresByPlayer = aggregateAttributeScoresFromReviews(reviewsSnap.docs);
    const topByAttributeByTeam = {};
    for (const [teamId, teamPlayers] of Object.entries(teamPlayersMap)) {
        const teamScores = {};
        for (const pid of teamPlayers) {
            if (scoresByPlayer[pid]) {
                teamScores[pid] = scoresByPlayer[pid];
            }
        }
        topByAttributeByTeam[teamId] = buildTopByAttribute(teamScores);
    }

    const eventStats = {
        playerIds,
        eventType: String(eventData?.type || ''),
        pontosNoEvento,
        bolas3NoEvento,
        maxPontosJogo,
        campeoes,
        vices,
        terceiros,
        medalhistas,
        cestinhasByTeam,
        topByAttributeByTeam,
    };

    const today = new Date().toISOString().split('T')[0];
    let conquistasConcedidas = 0;
    const detalhes = [];

    for (const playerId of playerIds) {
        const playerRef = admin.firestore().collection('jogadores').doc(playerId);
        const playerSnap = await playerRef.get();
        if (!playerSnap.exists) continue;

        const playerData = playerSnap.data() || {};
        const existingBadges = Array.isArray(playerData.badges) ? playerData.badges : [];
        const teamId = String(playerTeamMap[playerId] || 'ancb_default');
        const teamName = resolveTeamNameFromEvent(eventData, teamId) || (teamId === 'ancb_default' ? 'ANCB' : teamId);

        const matchedRules = [];
        for (const regra of regras) {
            const gatilho = normalizeGatilho(regra.gatilho);
            if (!evaluateEventRuleForPlayer(gatilho, eventStats, playerId, teamId)) continue;
            matchedRules.push(regra);
        }

        const dominantRules = selectDominantMatchedRules(matchedRules);
        let nextBadges = [...existingBadges];
        const awardedBadges = [];

        for (const regra of dominantRules) {
            const gatilho = normalizeGatilho(regra.gatilho);
            const renderContext = {
                eventName: eventData?.nome || 'Evento',
                gameName: '',
                seasonYear: String(eventData?.data || '').slice(-4),
                playerName: playerData?.nome || playerId,
                value: typeof gatilho?.minimo === 'number' ? gatilho.minimo : '',
            };
            const rendered = buildRenderedTexts(regra, renderContext);
            const incomingBadge = buildStackedBadgeFromRule(regra, rendered, {
                categoria: 'partida',
                tipoAvaliacao: 'pos_evento',
                occurrence: {
                    id: `evento_${eventId}`,
                    descricao: rendered.descricao,
                    data: today,
                    eventId,
                    seasonYear: renderContext.seasonYear,
                    teamId,
                    teamNome: teamName,
                    contextLabel: renderContext.eventName,
                    renderContext,
                },
            });

            const result = upsertStackedBadgeList(nextBadges, incomingBadge);
            nextBadges = result.badges;
            if (!result.occurrenceAdded) continue;

            awardedBadges.push({
                badge: result.badge,
                occurrenceId: `evento_${eventId}`,
                message: rendered.mensagem,
            });
        }

        if (!awardedBadges.length) continue;

        await playerRef.update({
            badges: nextBadges,
        });

        conquistasConcedidas += awardedBadges.length;
        detalhes.push(`${playerData.nome || playerId} [${teamName}]: ${awardedBadges.length} conquista(s)`);
        console.log(`Conquistas pos-evento -> jogador=${playerData.nome || playerId} team=${teamId} (${teamName}) qtd=${awardedBadges.length}`);

        const usersSnap = await admin.firestore().collection('usuarios')
            .where('linkedPlayerId', '==', playerId)
            .limit(1)
            .get();

        if (!usersSnap.empty) {
            const targetUserId = usersSnap.docs[0].id;
            for (const awarded of awardedBadges) {
                const badge = awarded.badge;
                const regraId = badge.regraId;
                const message = awarded.message || `Voce ganhou a conquista "${badge.nome}".`;
                const notifId = `badge_${targetUserId}_${badge.id}_${awarded.occurrenceId}`;

                await admin.firestore().collection('notifications').doc(notifId).set({
                    targetUserId,
                    type: 'evaluation',
                    title: `Nova conquista desbloqueada! ${badge.emoji}`,
                    message,
                    data: {
                        badgeId: badge.id,
                        occurrenceId: awarded.occurrenceId,
                        regraId,
                        eventoId: eventId,
                        teamId,
                        teamNome: teamName,
                    },
                    read: false,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                }, { merge: true });
            }
        }
    }

    return {
        success: true,
        regrasAvaliadas: regras.length,
        jogadoresProcessados: playerIds.length,
        conquistasConcedidas,
        detalhes,
    };
}

exports.avaliarConquistasEventoFinalizado = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Usuario precisa estar autenticado.');
    }

    const callerUid = context.auth.uid;
    const callerDoc = await admin.firestore().collection('usuarios').doc(callerUid).get();
    const callerRole = callerDoc.exists ? callerDoc.data().role : null;
    if (!callerDoc.exists || (callerRole !== 'admin' && callerRole !== 'super-admin')) {
        throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem avaliar conquistas de evento.');
    }

    const eventoId = String(data?.eventoId || '').trim();
    if (!eventoId) {
        throw new functions.https.HttpsError('invalid-argument', 'Informe eventoId.');
    }

    return executarConquistasPosEvento(eventoId);
});

exports.propagarEdicaoConquista = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Usuario precisa estar autenticado.');
    }

    const callerUid = context.auth.uid;
    const callerDoc = await admin.firestore().collection('usuarios').doc(callerUid).get();
    const callerRole = callerDoc.exists ? callerDoc.data().role : null;
    if (!callerDoc.exists || (callerRole !== 'admin' && callerRole !== 'super-admin')) {
        throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem propagar alteracoes de conquistas.');
    }

    const regraId = String(data?.regraId || '').trim();
    if (!regraId) {
        throw new functions.https.HttpsError('invalid-argument', 'Informe regraId.');
    }

    const regraSnap = await admin.firestore().collection('conquistas_regras').doc(regraId).get();
    if (!regraSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Regra nao encontrada.');
    }

    const regra = { id: regraSnap.id, ...regraSnap.data() };
    let playersUpdated = 0;
    let badgesUpdated = 0;
    let batchesProcessed = 0;
    const batchSize = Math.min(Math.max(Number(data?.batchSize) || 250, 50), 500);
    let lastDoc = null;

    while (true) {
        let query = admin.firestore().collection('jogadores').orderBy(admin.firestore.FieldPath.documentId()).limit(batchSize);
        if (lastDoc) {
            query = query.startAfter(lastDoc);
        }

        const playersSnap = await query.get();
        if (playersSnap.empty) break;

        batchesProcessed += 1;
        console.log(`propagarEdicaoConquista: lote ${batchesProcessed} com ${playersSnap.size} jogador(es)`);

        for (const playerDoc of playersSnap.docs) {
            const playerData = playerDoc.data() || {};
            const currentBadges = Array.isArray(playerData.badges) ? playerData.badges : [];
            let changed = false;

            const nextBadges = currentBadges.map((badge) => {
                if (String(badge?.regraId || '').trim() !== regraId) return badge;
                changed = true;
                badgesUpdated += 1;
                return applyRulePresentationToBadge(badge, regra, playerData?.nome || '');
            });

            if (!changed) continue;

            await playerDoc.ref.update({ badges: nextBadges });
            playersUpdated += 1;
        }

        lastDoc = playersSnap.docs[playersSnap.docs.length - 1];
    }

    return {
        success: true,
        regraId,
        playersUpdated,
        badgesUpdated,
        batchesProcessed,
    };
});

// ─────────────────────────────────────────────────────────────
// 5. SISTEMA DE CONQUISTAS (BADGES)
//
// Disparado quando um evento é marcado como 'finalizado'.
// Calcula conquistas baseadas em performance real:
//   - Pódio (campeão, vice, 3º lugar)
//   - Participação no evento
//   - Artilheiro do evento
//   - Cestinha / Máquina de Pontos (por jogo)
//   - Cestas de 3 (acumulado no evento)
//
// IDs de badge são únicos por evento (ex: campiao_jogos_abertos_2025)
// para que o jogador possa acumular a mesma conquista em eventos diferentes.
//
// PROTEÇÃO: Campo 'badgesAwardedAt' previne reprocessamento.
// ─────────────────────────────────────────────────────────────

exports.onEventFinishedAwardBadges = functions.firestore
    .document('eventos/{eventId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const oldData = change.before.data();

        if (!newData || !oldData) return null;

        // Só dispara na transição → finalizado
        const justFinished = oldData.status !== 'finalizado' && newData.status === 'finalizado';
        if (!justFinished) return null;

        // Proteção contra reprocessamento
        if (newData.badgesAwardedAt) {
            console.log(`Badges já foram processadas para o evento ${context.params.eventId}. Pulando.`);
            return null;
        }

        const eventId = context.params.eventId;
        const eventName = newData.nome || 'Evento';
        console.log(`🏆 Iniciando distribuição de conquistas por regras para evento: ${eventName} (${eventId})`);

        try {
            const dynamicResult = await executarConquistasPosEvento(eventId, newData);
            console.log(`⚙️ Regras dinamicas pos_evento: ${dynamicResult?.conquistasConcedidas || 0} conquista(s).`);

            await admin.firestore().collection('eventos').doc(eventId)
                .update({ badgesAwardedAt: admin.firestore.FieldValue.serverTimestamp() });

            console.log(`🏆 ${dynamicResult?.conquistasConcedidas || 0} conquista(s) processada(s) no evento ${eventName}.`);
            return null;
        } catch (dynamicError) {
            console.warn(`Falha ao executar regras dinamicas pos_evento no evento ${eventId}:`, dynamicError?.message || dynamicError);
            throw dynamicError;
        }
    });



// ─────────────────────────────────────────────────────────────
// HELPERS PRIVADOS
// ─────────────────────────────────────────────────────────────

/**
 * Envia notificação de convocação para um jogador.
 */
async function notifyPlayerConvocado(playerId, eventName, eventId) {
    try {
        const usersRef = admin.firestore().collection('usuarios');
        const querySnapshot = await usersRef.where('linkedPlayerId', '==', playerId).get();

        if (querySnapshot.empty) {
            console.log(`Nenhum usuário vinculado ao jogador ${playerId}`);
            return;
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const targetUserId = userDoc.id;
        const fcmToken = userData.fcmToken;

        const notifId = `roster_alert_${targetUserId}_${eventId}`;
        await admin.firestore().collection('notifications').doc(notifId).set({
            targetUserId,
            type: 'roster_alert',
            title: 'Você foi convocado! 🏀',
            message: `Sua presença é aguardada no evento: ${eventName}`,
            data: { eventId },
            read: false,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        if (!fcmToken) {
            console.log(`Jogador ${userData.nome} sem token FCM — convocação registrada no painel.`);
            return;
        }

        const message = {
            token: fcmToken,
            notification: {
                title: "Você foi convocado! 🏀",
                body: `Sua presença é aguardada no evento: ${eventName}`
            },
            data: {
                type: "roster_alert",
                eventId: eventId,
                url: "/"
            },
            android: {
                priority: "high",
                notification: {
                    priority: "max",
                    channelId: "ancb_alerts",
                    defaultSound: true,
                    color: '#F27405'
                }
            },
            webpush: {
                headers: { Urgency: "high" },
                fcm_options: { link: "/" }
            }
        };

        await admin.messaging().send(message);
        console.log(`✅ Notificação de convocação enviada para ${userData.nome}`);
    } catch (error) {
        console.error("Erro ao notificar jogador convocado:", playerId, error);
    }
}

/**
 * Envia notificação de quiz pós-jogo para um jogador.
 * Busca o usuário pelo linkedPlayerId e envia via FCM.
 */
async function notifyPlayerQuizPosJogo(playerId, eventId, gameId, eventName, teamAName, scoreA, teamBName, scoreB, reviewerTeamId) {
    try {
        const usersRef = admin.firestore().collection('usuarios');
        const querySnapshot = await usersRef.where('linkedPlayerId', '==', playerId).get();

        if (querySnapshot.empty) {
            console.log(`Nenhum usuário vinculado ao jogador ${playerId} para quiz pós-jogo`);
            return;
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const targetUserId = userDoc.id;

        const notifTitle = "Avalie seus companheiros! 🏆";
        const notifBody = `${teamAName} ${scoreA} x ${scoreB} ${teamBName} — Partida de ${eventName} encerrada.`;

        // ─────────────────────────────────────────────────────────────
        // CORREÇÃO PRINCIPAL: Cria documento na coleção 'notifications'
        // Isso garante que a notificação aparece no painel do portal
        // independente de FCM, token ou estado do app.
        // ─────────────────────────────────────────────────────────────

        // Evita duplicatas: usa ID único em vez de query composta
        // Formato: pending_review_{userId}_{gameId}
        const deduplicationKey = `pending_review_${targetUserId}_${gameId}`;
        const notificationRef = admin.firestore().collection('notifications').doc(deduplicationKey);
        
        const existingDoc = await notificationRef.get();
        if (existingDoc.exists) {
            console.log(`Notificação de review já existe para jogador ${playerId} no jogo ${gameId}. Pulando.`);
            return;
        }

        await notificationRef.set({
            targetUserId: targetUserId,
            type: 'pending_review',
            title: notifTitle,
            message: notifBody,
            data: {
                eventId: eventId,
                gameId: gameId,
                teamId: reviewerTeamId || null,
            },
            read: false,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            deduplicationKey: deduplicationKey
        });

        console.log(`✅ Notificação pending_review criada no Firestore para ${userData.nome}`);

        // Push FCM: envia push se o jogador tiver token (bônus — não é crítico)
        const fcmToken = userData.fcmToken;
        if (fcmToken) {
            const deepLinkUrl = `/?action=review&gameId=${gameId}&eventId=${eventId}`;
            const message = {
                token: fcmToken,
                notification: { title: notifTitle, body: notifBody },
                data: { type: "peer_review", eventId: eventId, gameId: gameId, url: deepLinkUrl },
                android: {
                    priority: "high",
                    notification: { priority: "max", channelId: "ancb_alerts", defaultSound: true, defaultVibrateTimings: true, color: '#F27405' }
                },
                webpush: { headers: { Urgency: "high" }, fcm_options: { link: deepLinkUrl } }
            };
            try {
                await admin.messaging().send(message);
                console.log(`✅ Push FCM enviado para ${userData.nome}`);
            } catch (fcmError) {
                console.warn(`⚠️ Push FCM falhou para ${userData.nome} (token expirado?):`, fcmError.message);
            }
        } else {
            console.log(`Jogador ${userData.nome} sem token FCM — notificação só no painel.`);
        }

    } catch (error) {
        console.error("Erro ao notificar jogador para quiz pós-jogo:", playerId, error);
    }
}

async function upsertAutoGameFeedPost(eventId, gameId, eventData, gameData, teamAName, scoreA, teamBName, scoreB) {
    try {
        const configDoc = await admin.firestore().collection('configuracoes').doc('auto_posts').get();
        const config = configDoc.exists ? configDoc.data() : {};

        if (config.game_post_enabled === false) {
            console.log(`Posts automáticos de jogo desabilitados. Pulando post para jogo ${gameId}.`);
            return;
        }

        const postId = `auto_game_${eventId}_${gameId}`;
        const eventName = eventData?.nome || 'Evento';
        const gameDate = gameData?.dataJogo || eventData?.data || '';

        const vars = {
            '{eventName}': eventName,
            '{teamA}': teamAName,
            '{teamB}': teamBName,
            '{scoreA}': String(scoreA),
            '{scoreB}': String(scoreB),
            '{gameDate}': gameDate,
        };
        const applyTpl = (tpl) => tpl.replace(/\{eventName\}|\{teamA\}|\{teamB\}|\{scoreA\}|\{scoreB\}|\{gameDate\}/g, (m) => vars[m] ?? m);

        const titulo = config.game_post_titulo_template
            ? applyTpl(config.game_post_titulo_template)
            : `${eventName} • ${teamAName} x ${teamBName}`;

        const resumo = config.game_post_resumo_template
            ? applyTpl(config.game_post_resumo_template)
            : '';

        await admin.firestore().collection('feed_posts').doc(postId).set({
            type: 'placar',
            source: 'auto_game_finalized',
            source_ref: `event:${eventId}:game:${gameId}`,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            author_id: 'system',
            image_url: null,
            content: {
                titulo,
                ...(resumo ? { resumo } : {}),
                time_adv: teamBName,
                placar_ancb: Number(scoreA) || 0,
                placar_adv: Number(scoreB) || 0,
                eventId,
                gameId,
                teamAName,
                teamBName,
                resultado_detalhes: gameDate ? `${eventName} • ${gameDate}` : eventName,
            }
        }, { merge: true });
    } catch (error) {
        console.error(`Erro ao criar post automático de placar para jogo ${gameId}:`, error);
    }
}
