/**
 * backfill-badge-rarity.js
 *
 * Preenche o campo `raridade` em badges antigas que nao possuem esse campo.
 *
 * Regras de preenchimento (ordem):
 * 1) Se badge.regraId existir e a regra em `conquistas_regras` tiver raridade valida, usa ela.
 * 2) Senao, tenta inferir por id/prefixo legado.
 * 3) Senao, usa `comum`.
 *
 * Script idempotente:
 * - So atualiza badges sem raridade valida.
 * - Rodar novamente nao altera badges ja corretas.
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

const ALLOWED_RARIDADES = new Set(['comum', 'rara', 'epica', 'lendaria']);

const LEGACY_EXACT_RARITY = {
    estava_la: 'comum',
    campiao: 'epica',
    vice: 'rara',
    podio: 'rara',
    cestinha: 'rara',
    cestinha_ev: 'rara',
    bola_quente: 'comum',
    imparavel: 'rara',
    primeira_bomba: 'comum',
    atirador: 'rara',
    atirador_elite: 'epica',
    rei_quadra: 'lendaria',
    chama_viva: 'epica',
    forca_bruta: 'epica',
    mao_ouro: 'lendaria',
    mao_prata: 'epica',
    mao_bronze: 'epica',
    guerreiro: 'rara',
    colecionador: 'rara',
    mvp_temporada: 'lendaria',
    veterano: 'rara',
};

const LEGACY_PREFIX_RARITY = [
    { prefix: 'estava_la_', raridade: 'comum' },
    { prefix: 'campiao_', raridade: 'epica' },
    { prefix: 'vice_', raridade: 'rara' },
    { prefix: 'podio_', raridade: 'rara' },
    { prefix: 'cestinha_', raridade: 'rara' },
    { prefix: 'cestinha_ev_', raridade: 'rara' },
    { prefix: 'bola_quente_', raridade: 'comum' },
    { prefix: 'imparavel_', raridade: 'rara' },
    { prefix: 'primeira_bomba_', raridade: 'comum' },
    { prefix: 'atirador_', raridade: 'rara' },
    { prefix: 'atirador_elite_', raridade: 'epica' },
    { prefix: 'rei_quadra_', raridade: 'lendaria' },
    { prefix: 'chama_viva_', raridade: 'epica' },
    { prefix: 'forca_bruta_', raridade: 'epica' },
    { prefix: 'mao_ouro_', raridade: 'lendaria' },
    { prefix: 'mao_prata_', raridade: 'epica' },
    { prefix: 'mao_bronze_', raridade: 'epica' },
    { prefix: 'guerreiro_', raridade: 'rara' },
    { prefix: 'colecionador_', raridade: 'rara' },
    { prefix: 'mvp_temporada_', raridade: 'lendaria' },
    { prefix: 'veterano_', raridade: 'rara' },
    { prefix: 'regra_', raridade: 'comum' },
];

const normalizeRarity = (value) => {
    const raw = String(value || '').trim().toLowerCase();
    return ALLOWED_RARIDADES.has(raw) ? raw : null;
};

const inferLegacyRarity = (badgeId) => {
    const id = String(badgeId || '').trim().toLowerCase();
    if (!id) return null;

    if (LEGACY_EXACT_RARITY[id]) {
        return LEGACY_EXACT_RARITY[id];
    }

    for (const item of LEGACY_PREFIX_RARITY) {
        if (id.startsWith(item.prefix)) {
            return item.raridade;
        }
    }

    return null;
};

async function loadRuleRarityMap() {
    const snap = await db.collection('conquistas_regras').get();
    const map = new Map();

    for (const doc of snap.docs) {
        const data = doc.data() || {};
        const rarity = normalizeRarity(data.raridade);
        if (rarity) {
            map.set(doc.id, rarity);
        }
    }

    return map;
}

async function main() {
    console.log('ANCB - Backfill de raridade das badges');
    console.log('=======================================');

    const regraRarityMap = await loadRuleRarityMap();
    console.log(`Regras com raridade valida carregadas: ${regraRarityMap.size}`);

    const jogadoresSnap = await db.collection('jogadores').get();
    console.log(`Jogadores encontrados: ${jogadoresSnap.size}`);

    let jogadoresAtualizados = 0;
    let badgesProcessadas = 0;
    let badgesAtualizadas = 0;
    let badgesJaOk = 0;
    let badgesComFallback = 0;

    for (const jogadorDoc of jogadoresSnap.docs) {
        const data = jogadorDoc.data() || {};
        const badges = Array.isArray(data.badges) ? data.badges : [];

        if (!badges.length) {
            continue;
        }

        let changed = false;
        const nextBadges = badges.map((badge) => {
            badgesProcessadas += 1;

            if (!badge || typeof badge !== 'object') {
                return badge;
            }

            const currentRarity = normalizeRarity(badge.raridade);
            if (currentRarity) {
                badgesJaOk += 1;
                return badge;
            }

            let resolved = null;

            const regraId = String(badge.regraId || '').trim();
            if (regraId && regraRarityMap.has(regraId)) {
                resolved = regraRarityMap.get(regraId);
            }

            if (!resolved) {
                resolved = inferLegacyRarity(badge.id);
            }

            if (!resolved) {
                resolved = 'comum';
                badgesComFallback += 1;
            }

            changed = true;
            badgesAtualizadas += 1;
            return { ...badge, raridade: resolved };
        });

        if (!changed) {
            continue;
        }

        await db.collection('jogadores').doc(jogadorDoc.id).update({
            badges: nextBadges,
        });

        jogadoresAtualizados += 1;
    }

    console.log('=======================================');
    console.log('Backfill concluido');
    console.log(`Jogadores atualizados: ${jogadoresAtualizados}`);
    console.log(`Badges processadas: ${badgesProcessadas}`);
    console.log(`Badges atualizadas: ${badgesAtualizadas}`);
    console.log(`Badges ja ok: ${badgesJaOk}`);
    console.log(`Badges com fallback comum: ${badgesComFallback}`);
    console.log('=======================================');
}

main().catch((error) => {
    console.error('Erro fatal no backfill de raridade:', error);
    process.exit(1);
});
