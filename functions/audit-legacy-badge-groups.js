/**
 * audit-legacy-badge-groups.js
 *
 * Audita badges legadas que podem ser agrupadas por familia canonica,
 * sem escrever nada no Firestore.
 *
 * O relatorio destaca:
 * - grupos detectados por familia legado
 * - quantidade de ocorrencias por jogador e global
 * - conflitos de raridade, emoji e icone
 * - badge representante sugerida pela regra atual
 *   (maior raridade vence; em empate, a mais recente)
 *
 * Uso:
 *   npm run audit:legacy-badges
 *   node audit-legacy-badge-groups.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'ancb-painel-db';

function resolveFirebaseCredential() {
    const localServiceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        return admin.credential.applicationDefault();
    }

    if (fs.existsSync(localServiceAccountPath)) {
        const serviceAccount = require(localServiceAccountPath);
        return admin.credential.cert(serviceAccount);
    }

    return admin.credential.applicationDefault();
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: resolveFirebaseCredential(),
        projectId: PROJECT_ID,
    });
}

const db = admin.firestore();

const LEGACY_STACKABLE_TITLES = new Set([
    'Estava La',
    'Cestinha',
    'Imparavel',
    'Bola Quente',
    'Mao Quente',
    'Tiro Certo',
    'Mira Calibrada',
    'Campeao',
    'Vice',
    'Podio',
    'Vice-Cestinha',
    'Mestre 3pts',
    'Bronze',
    'Prata',
    'Ouro',
    'Contribuiu!',
]);

const CANONICAL_LEGACY_NAME_BY_TITLE = {
    'Estava La': 'Estava Lá',
    'Cestinha': 'Cestinha',
    'Imparavel': 'Imparável',
    'Bola Quente': 'Bola Quente',
    'Mao Quente': 'Mão Quente',
    'Tiro Certo': 'Tiro Certo',
    'Mira Calibrada': 'Mira Calibrada',
    'Campeao': 'Campeão',
    'Vice': 'Vice',
    'Podio': 'Pódio',
    'Vice-Cestinha': 'Vice-Cestinha',
    'Mestre 3pts': 'Mestre 3pts',
    'Bronze': 'Bronze',
    'Prata': 'Prata',
    'Ouro': 'Ouro',
    'Contribuiu!': 'Contribuiu!',
};

function normalizeLegacyTitleToken(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function parseDateValue(value) {
    const normalized = String(value || '').trim();
    if (!normalized) return 0;

    if (/^\d{4}-\d{2}-\d{2}/.test(normalized)) {
        const timestamp = Date.parse(normalized);
        return Number.isNaN(timestamp) ? 0 : timestamp;
    }

    const brDateMatch = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (brDateMatch) {
        const [, day, month, year] = brDateMatch;
        const timestamp = Date.parse(`${year}-${month}-${day}`);
        return Number.isNaN(timestamp) ? 0 : timestamp;
    }

    const timestamp = Date.parse(normalized);
    return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getBadgeWeight(rarity) {
    switch (String(rarity || 'comum')) {
        case 'lendaria': return 4;
        case 'epica': return 3;
        case 'rara': return 2;
        default: return 1;
    }
}

function isLegacyCandidate(badge) {
    if (!badge || typeof badge !== 'object') return false;
    if (badge.regraId) return false;
    if (badge.origem && badge.origem !== 'legado') return false;
    return true;
}

function extractLegacyBaseTitle(badge) {
    if (!isLegacyCandidate(badge)) return null;

    const normalizedTitle = normalizeLegacyTitleToken(badge.nome);
    if (!normalizedTitle) return null;

    const titleMatch = normalizedTitle.match(/^(.+?)\s*\((.+)\)$/);
    const candidateTitle = titleMatch ? titleMatch[1].trim() : normalizedTitle;
    return LEGACY_STACKABLE_TITLES.has(candidateTitle) ? candidateTitle : null;
}

function getCanonicalLegacyName(badge) {
    const baseTitle = extractLegacyBaseTitle(badge);
    if (!baseTitle) return null;
    return CANONICAL_LEGACY_NAME_BY_TITLE[baseTitle] || badge.nome || null;
}

function getLatestOccurrenceDate(badge) {
    if (Array.isArray(badge.ocorrencias) && badge.ocorrencias.length > 0) {
        return badge.ocorrencias
            .map((occurrence) => String(occurrence?.data || ''))
            .sort((left, right) => left.localeCompare(right))
            .at(-1) || String(badge.data || '');
    }

    return String(badge.data || '');
}

function getRepresentativeBadge(left, right) {
    const rarityDiff = getBadgeWeight(right.raridade) - getBadgeWeight(left.raridade);
    if (rarityDiff !== 0) {
        return rarityDiff > 0 ? right : left;
    }

    const dateDiff = parseDateValue(getLatestOccurrenceDate(right)) - parseDateValue(getLatestOccurrenceDate(left));
    if (dateDiff !== 0) {
        return dateDiff > 0 ? right : left;
    }

    return right;
}

function getConflictSummary(badges) {
    const rarities = [...new Set(badges.map((badge) => String(badge.raridade || 'comum')))];
    const emojis = [...new Set(badges.map((badge) => String(badge.emoji || '')))];
    const iconKinds = [...new Set(badges.map((badge) => `${String(badge.tipoIcone || 'emoji')}:${String(badge.iconeValor || badge.emoji || '')}`))];

    return {
        hasRarityConflict: rarities.length > 1,
        hasEmojiConflict: emojis.length > 1,
        hasIconConflict: iconKinds.length > 1,
        rarities,
        emojis,
        iconKinds,
    };
}

function formatPlayerLabel(playerDoc) {
    const data = playerDoc.data() || {};
    const mainName = String(data.apelido || data.nome || playerDoc.id).trim();
    const fullName = String(data.nome || '').trim();
    return fullName && fullName !== mainName ? `${mainName} (${fullName})` : mainName;
}

async function main() {
    console.log('ANCB - Auditoria de agrupamento legado de conquistas');
    console.log('====================================================');

    const jogadoresSnap = await db.collection('jogadores').get();
    console.log(`Jogadores encontrados: ${jogadoresSnap.size}`);

    const globalGroups = new Map();
    const playerReports = [];
    let totalLegacyCandidates = 0;
    let totalGroupedCandidates = 0;

    for (const jogadorDoc of jogadoresSnap.docs) {
        const data = jogadorDoc.data() || {};
        const badges = Array.isArray(data.badges) ? data.badges : [];
        const playerGroups = new Map();

        badges.forEach((badge) => {
            if (!isLegacyCandidate(badge)) return;
            totalLegacyCandidates += 1;

            const canonicalName = getCanonicalLegacyName(badge);
            if (!canonicalName) return;

            totalGroupedCandidates += 1;
            const groupKey = canonicalName;
            const currentPlayerGroup = playerGroups.get(groupKey) || [];
            currentPlayerGroup.push(badge);
            playerGroups.set(groupKey, currentPlayerGroup);

            const currentGlobalGroup = globalGroups.get(groupKey) || [];
            currentGlobalGroup.push({ playerId: jogadorDoc.id, playerName: formatPlayerLabel(jogadorDoc), badge });
            globalGroups.set(groupKey, currentGlobalGroup);
        });

        const groupedEntries = Array.from(playerGroups.entries())
            .filter(([, groupedBadges]) => groupedBadges.length > 1)
            .map(([groupKey, groupedBadges]) => {
                const representative = groupedBadges.reduce((winner, current) => getRepresentativeBadge(winner, current));
                return {
                    groupKey,
                    canonicalName: groupKey,
                    count: groupedBadges.length,
                    representative,
                    conflicts: getConflictSummary(groupedBadges),
                    names: [...new Set(groupedBadges.map((badge) => String(badge.nome || '')))],
                    ids: [...new Set(groupedBadges.map((badge) => String(badge.id || '')))],
                };
            })
            .sort((left, right) => right.count - left.count || left.groupKey.localeCompare(right.groupKey));

        if (groupedEntries.length > 0) {
            playerReports.push({
                playerId: jogadorDoc.id,
                playerName: formatPlayerLabel(jogadorDoc),
                groups: groupedEntries,
            });
        }
    }

    const globalReport = Array.from(globalGroups.entries())
        .map(([groupKey, entries]) => {
            const groupedBadges = entries.map((entry) => entry.badge);
            const representative = groupedBadges.reduce((winner, current) => getRepresentativeBadge(winner, current));
            const playerNames = [...new Set(entries.map((entry) => entry.playerName))];

            return {
                groupKey,
                canonicalName: groupKey,
                totalOccurrences: groupedBadges.length,
                affectedPlayers: playerNames.length,
                representative,
                conflicts: getConflictSummary(groupedBadges),
                sampleNames: [...new Set(groupedBadges.map((badge) => String(badge.nome || '')))].slice(0, 8),
                samplePlayers: playerNames.slice(0, 8),
            };
        })
        .filter((group) => group.totalOccurrences > 1)
        .sort((left, right) => right.totalOccurrences - left.totalOccurrences || left.groupKey.localeCompare(right.groupKey));

    console.log('');
    console.log('Resumo geral');
    console.log('------------');
    console.log(`Badges legadas candidatas avaliadas: ${totalLegacyCandidates}`);
    console.log(`Badges legadas enquadradas em familias agrupaveis: ${totalGroupedCandidates}`);
    console.log(`Familias com mais de uma ocorrencia: ${globalReport.length}`);
    console.log(`Jogadores com stacks legados detectados: ${playerReports.length}`);

    console.log('');
    console.log('Familias globais');
    console.log('----------------');
    globalReport.forEach((group) => {
        const conflictLabels = [];
        if (group.conflicts.hasRarityConflict) conflictLabels.push(`raridades=${group.conflicts.rarities.join('/')}`);
        if (group.conflicts.hasEmojiConflict) conflictLabels.push(`emojis=${group.conflicts.emojis.join(' | ')}`);
        if (group.conflicts.hasIconConflict) conflictLabels.push('icone-diferente');
        const conflictText = conflictLabels.length > 0 ? ` | conflitos: ${conflictLabels.join(', ')}` : '';

        console.log(
            `- ${group.canonicalName}: ${group.totalOccurrences} ocorrencia(s), ${group.affectedPlayers} jogador(es), ` +
            `padrao sugerido=${String(group.representative.raridade || 'comum')}/${String(group.representative.emoji || '')}${conflictText}`
        );
        console.log(`  Nomes exemplo: ${group.sampleNames.join(' | ')}`);
        console.log(`  Jogadores exemplo: ${group.samplePlayers.join(' | ')}`);
    });

    console.log('');
    console.log('Jogadores com stacks');
    console.log('--------------------');
    playerReports.slice(0, 80).forEach((playerReport) => {
        console.log(`- ${playerReport.playerName} [${playerReport.playerId}]`);
        playerReport.groups.forEach((group) => {
            const conflictLabels = [];
            if (group.conflicts.hasRarityConflict) conflictLabels.push(`raridades=${group.conflicts.rarities.join('/')}`);
            if (group.conflicts.hasEmojiConflict) conflictLabels.push(`emojis=${group.conflicts.emojis.join(' | ')}`);
            if (group.conflicts.hasIconConflict) conflictLabels.push('icone-diferente');
            const conflictText = conflictLabels.length > 0 ? ` | conflitos: ${conflictLabels.join(', ')}` : '';

            console.log(
                `  • ${group.canonicalName}: ${group.count} item(ns), ` +
                `padrao sugerido=${String(group.representative.raridade || 'comum')}/${String(group.representative.emoji || '')}${conflictText}`
            );
            console.log(`    nomes: ${group.names.join(' | ')}`);
            console.log(`    ids: ${group.ids.join(' | ')}`);
        });
    });

    if (playerReports.length > 80) {
        console.log(`... ${playerReports.length - 80} jogador(es) adicional(is) omitido(s) do detalhamento.`);
    }

    console.log('');
    console.log('Auditoria concluida sem alteracoes no banco.');
    console.log('====================================================');
}

main().catch((error) => {
    const missingCredentials = String(error?.message || '').includes('Could not load the default credentials');

    if (missingCredentials) {
        console.error('Erro fatal na auditoria de badges legadas: nenhuma credencial valida encontrada.');
        console.error('Tente uma destas opcoes:');
        console.error('1. Definir GOOGLE_APPLICATION_CREDENTIALS para uma chave de servico valida.');
        console.error('2. Colocar serviceAccountKey.json dentro da pasta functions/.');
        console.error('3. Executar em um ambiente ja autenticado com ADC configurado.');
        process.exit(1);
    }

    console.error('Erro fatal na auditoria de badges legadas:', error);
    process.exit(1);
});