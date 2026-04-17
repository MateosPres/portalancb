/**
 * backfill-badge-rule-link.js
 *
 * Backfill seguro para enriquecer badges existentes com `regraId` e `origem`.
 *
 * Regras de seguranca:
 * - So vincula quando a correspondencia com a regra e confiavel.
 * - Nao recalcula conquistas.
 * - Nao remove badges legadas.
 * - Badges sem correspondencia confiavel ficam marcadas como `origem: 'legado'`.
 *
 * Correspondencias confiaveis atualmente:
 * - `badge.regraId` ja preenchido e regra existente.
 * - `badge.id` no formato `regra_<regraId>`.
 * - `badge.id` no formato `regra_<regraId>_temporada_<ano>`.
 *
 * Uso:
 *   node backfill-badge-rule-link.js
 */

const admin = require('firebase-admin');

const PROJECT_ID = 'ancb-painel-db';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: PROJECT_ID,
    });
}

const db = admin.firestore();

function buildRuleBasedBadgeId(regraId, options = {}) {
    const normalizedRuleId = String(regraId || '').trim();
    const seasonYear = String(options.seasonYear || '').trim();

    if (String(options.tipoAvaliacao || '') === 'ao_fechar_temporada' && seasonYear) {
        return `regra_${normalizedRuleId}_temporada_${seasonYear}`;
    }

    return `regra_${normalizedRuleId}`;
}

function normalizeOccurrences(badge) {
    if (Array.isArray(badge?.ocorrencias) && badge.ocorrencias.length > 0) {
        return badge.ocorrencias;
    }

    return [{
        id: String(badge?.latestOccurrenceId || `${badge?.id || 'badge'}:legacy`),
        descricao: String(badge?.descricao || 'Conquista desbloqueada.'),
        data: String(badge?.data || ''),
        gameId: badge?.gameId,
        eventId: badge?.eventId,
        seasonYear: badge?.seasonYear,
        teamId: badge?.teamId,
        teamNome: badge?.teamNome,
        contextLabel: badge?.contextLabel,
        renderContext: badge?.renderContext || undefined,
    }];
}

function extractSeasonYearFromBadge(badge) {
    if (badge?.seasonYear) return String(badge.seasonYear);
    const occurrences = normalizeOccurrences(badge);
    const latest = occurrences[occurrences.length - 1];
    return String(latest?.seasonYear || '');
}

function inferRuleIdFromBadgeId(badgeId) {
    const raw = String(badgeId || '').trim();
    if (!raw.startsWith('regra_')) return null;

    const seasonMatch = raw.match(/^regra_(.+)_temporada_(\d{4})$/);
    if (seasonMatch) {
        return { regraId: seasonMatch[1], seasonYear: seasonMatch[2] };
    }

    return { regraId: raw.slice('regra_'.length), seasonYear: '' };
}

async function loadRuleMap() {
    const snap = await db.collection('conquistas_regras').get();
    const map = new Map();

    for (const doc of snap.docs) {
        map.set(doc.id, { id: doc.id, ...doc.data() });
    }

    return map;
}

function resolveTrustedRule(ruleMap, badge) {
    const explicitRuleId = String(badge?.regraId || '').trim();
    if (explicitRuleId && ruleMap.has(explicitRuleId)) {
        return { regraId: explicitRuleId, seasonYear: extractSeasonYearFromBadge(badge) };
    }

    const inferred = inferRuleIdFromBadgeId(badge?.id);
    if (inferred?.regraId && ruleMap.has(inferred.regraId)) {
        return {
            regraId: inferred.regraId,
            seasonYear: inferred.seasonYear || extractSeasonYearFromBadge(badge),
        };
    }

    return null;
}

async function main() {
    console.log('ANCB - Backfill seguro de vinculo badge -> regra');
    console.log('================================================');

    const ruleMap = await loadRuleMap();
    console.log(`Regras carregadas: ${ruleMap.size}`);

    const jogadoresSnap = await db.collection('jogadores').get();
    console.log(`Jogadores encontrados: ${jogadoresSnap.size}`);

    let jogadoresAtualizados = 0;
    let badgesProcessadas = 0;
    let badgesVinculadas = 0;
    let badgesLegadoMarcadas = 0;

    for (const jogadorDoc of jogadoresSnap.docs) {
        const data = jogadorDoc.data() || {};
        const badges = Array.isArray(data.badges) ? data.badges : [];
        if (!badges.length) continue;

        let changed = false;
        const nextBadges = badges.map((badge) => {
            badgesProcessadas += 1;

            if (!badge || typeof badge !== 'object') {
                return badge;
            }

            const trustedRule = resolveTrustedRule(ruleMap, badge);
            if (trustedRule) {
                const regra = ruleMap.get(trustedRule.regraId);
                const tipoAvaliacao = String(badge.tipoAvaliacao || regra?.tipoAvaliacao || '').trim();
                const normalizedId = buildRuleBasedBadgeId(trustedRule.regraId, {
                    tipoAvaliacao,
                    seasonYear: trustedRule.seasonYear,
                });

                const nextBadge = {
                    ...badge,
                    id: normalizedId,
                    regraId: trustedRule.regraId,
                    origem: 'regra',
                };

                if (
                    nextBadge.id !== badge.id ||
                    nextBadge.regraId !== badge.regraId ||
                    nextBadge.origem !== badge.origem
                ) {
                    changed = true;
                    badgesVinculadas += 1;
                }

                return nextBadge;
            }

            if (badge.origem !== 'legado') {
                changed = true;
                badgesLegadoMarcadas += 1;
                return { ...badge, origem: 'legado' };
            }

            return badge;
        });

        if (!changed) continue;

        await jogadorDoc.ref.update({ badges: nextBadges });
        jogadoresAtualizados += 1;
    }

    console.log('================================================');
    console.log(`Jogadores atualizados: ${jogadoresAtualizados}`);
    console.log(`Badges processadas: ${badgesProcessadas}`);
    console.log(`Badges vinculadas com seguranca: ${badgesVinculadas}`);
    console.log(`Badges marcadas como legado: ${badgesLegadoMarcadas}`);
    console.log('================================================');
}

main().catch((error) => {
    console.error('Erro fatal no backfill de vinculo badge -> regra:', error);
    process.exit(1);
});