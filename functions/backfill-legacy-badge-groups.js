/**
 * backfill-legacy-badge-groups.js
 *
 * Persiste campos canonicos para badges legadas agrupaveis:
 * - origem='legado' quando a badge for candidata legacy sem origem definida
 * - legacyBaseTitle
 * - legacyGroupKey
 *
 * Nao altera nome, emoji, raridade nem descricao da badge original.
 * Script idempotente: so grava quando houver diferenca.
 *
 * Uso:
 *   npm run backfill:legacy-badge-groups
 *   node backfill-legacy-badge-groups.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'ancb-painel-db';

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

function normalizeLegacyTitleToken(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function buildLegacyGroupKeyFromBaseTitle(baseTitle, category) {
    return ['legacy', normalizeLegacyTitleToken(baseTitle), String(category || '')].join('|');
}

function isLegacyCandidate(badge) {
    if (!badge || typeof badge !== 'object') return false;
    if (badge.regraId) return false;
    if (badge.origem && badge.origem !== 'legado') return false;
    return true;
}

function extractLegacyBaseTitle(badge) {
    if (!isLegacyCandidate(badge)) return null;

    if (badge.legacyBaseTitle) {
        const storedBaseTitle = normalizeLegacyTitleToken(badge.legacyBaseTitle);
        return LEGACY_STACKABLE_TITLES.has(storedBaseTitle) ? storedBaseTitle : null;
    }

    const normalizedTitle = normalizeLegacyTitleToken(badge.nome);
    if (!normalizedTitle) return null;

    const titleMatch = normalizedTitle.match(/^(.+?)\s*\((.+)\)$/);
    const candidateTitle = titleMatch ? titleMatch[1].trim() : normalizedTitle;
    return LEGACY_STACKABLE_TITLES.has(candidateTitle) ? candidateTitle : null;
}

function resolveCanonicalLegacyFields(badge) {
    const legacyBaseTitle = extractLegacyBaseTitle(badge);
    if (!legacyBaseTitle) return null;

    return {
        origem: 'legado',
        legacyBaseTitle,
        legacyGroupKey: buildLegacyGroupKeyFromBaseTitle(legacyBaseTitle, badge.categoria),
    };
}

async function main() {
    console.log('ANCB - Backfill de grupos canonicos de badges legadas');
    console.log('======================================================');

    const jogadoresSnap = await db.collection('jogadores').get();
    console.log(`Jogadores encontrados: ${jogadoresSnap.size}`);

    let jogadoresAtualizados = 0;
    let badgesProcessadas = 0;
    let badgesAtualizadas = 0;

    for (const jogadorDoc of jogadoresSnap.docs) {
        const data = jogadorDoc.data() || {};
        const badges = Array.isArray(data.badges) ? data.badges : [];
        if (!badges.length) continue;

        let changed = false;
        const nextBadges = badges.map((badge) => {
            badgesProcessadas += 1;

            if (!badge || typeof badge !== 'object') return badge;

            const canonicalFields = resolveCanonicalLegacyFields(badge);
            if (!canonicalFields) return badge;

            const nextBadge = {
                ...badge,
                origem: canonicalFields.origem,
                legacyBaseTitle: canonicalFields.legacyBaseTitle,
                legacyGroupKey: canonicalFields.legacyGroupKey,
            };

            const isDifferent = nextBadge.origem !== badge.origem
                || nextBadge.legacyBaseTitle !== badge.legacyBaseTitle
                || nextBadge.legacyGroupKey !== badge.legacyGroupKey;

            if (!isDifferent) return badge;

            changed = true;
            badgesAtualizadas += 1;
            return nextBadge;
        });

        if (!changed) continue;

        await db.collection('jogadores').doc(jogadorDoc.id).update({ badges: nextBadges });
        jogadoresAtualizados += 1;
    }

    console.log('======================================================');
    console.log('Backfill concluido');
    console.log(`Jogadores atualizados: ${jogadoresAtualizados}`);
    console.log(`Badges processadas: ${badgesProcessadas}`);
    console.log(`Badges atualizadas: ${badgesAtualizadas}`);
    console.log('======================================================');
}

main().catch((error) => {
    const missingCredentials = String(error?.message || '').includes('Could not load the default credentials');

    if (missingCredentials) {
        console.error('Erro fatal no backfill de grupos legados: nenhuma credencial valida encontrada.');
        console.error('Tente uma destas opcoes:');
        console.error('1. Definir GOOGLE_APPLICATION_CREDENTIALS para uma chave de servico valida.');
        console.error('2. Colocar serviceAccountKey.json dentro da pasta functions/.');
        console.error('3. Executar em um ambiente ja autenticado com ADC configurado.');
        process.exit(1);
    }

    console.error('Erro fatal no backfill de grupos legados:', error);
    process.exit(1);
});