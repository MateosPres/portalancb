/**
 * cleanup-and-backfill.js
 *
 * Faz duas coisas em sequência:
 *   1. Remove badges antigas vindas do sistema de reviews de todos os jogadores
 *   2. Processa um evento específico e distribui as novas conquistas
 *
 * COMO USAR:
 *   No PowerShell, dentro da pasta functions/:
 *
 *     $env:GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"
 *     node cleanup-and-backfill.js ID_DO_EVENTO
 *
 *   O ID do evento você encontra no Firebase Console:
 *     Firestore Database → eventos → clique no evento → copie o ID do documento
 *
 * SEGURO para rodar mais de uma vez — nunca duplica badges novas.
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

// ─── BADGES ANTIGAS A REMOVER ────────────────────────────────
// Todas as que vieram do sistema de reviews (IDs fixos)
const STALE_BADGE_IDS = new Set([
    'sniper_bronze',
    'sniper_prata',
    'muralha_bronze',
    'muralha_prata',
    'flash_bronze',
    'garcom_bronze',
    'lider_bronze',
    'lider_epico',
    'guerreiro_bronze',
    'primeiro_jogo',
    'estreante',
]);

// ─── HELPERS ─────────────────────────────────────────────────

function extractPlayerId(entry) {
    if (typeof entry === 'string') return entry;
    if (entry && typeof entry === 'object' && entry.id) return entry.id;
    return null;
}

function buildBadge(id, nome, emoji, raridade, categoria, descricao) {
    return { id, nome, emoji, raridade, categoria, descricao, data: new Date().toISOString().split('T')[0] };
}

function resolveAncbPlayerIds(eventData) {
    let ids = [];
    if (eventData.timesParticipantes?.length > 0) {
        eventData.timesParticipantes.filter(t => t.isANCB).forEach(t => ids.push(...(t.jogadores || [])));
    } else if (eventData.times?.length > 0) {
        eventData.times.forEach(t => ids.push(...(t.jogadores || [])));
    } else {
        ids = (eventData.jogadoresEscalados || []).map(extractPlayerId).filter(Boolean);
    }
    return [...new Set(ids.filter(Boolean))];
}

function resolvePodioPLayerIds(nomeTime, eventData, ancbPlayerIds) {
    if (!nomeTime) return [];
    const allTimes = eventData.timesParticipantes || eventData.times || [];
    const time = allTimes.find(t =>
        t.nomeTime?.toLowerCase().trim() === nomeTime.toLowerCase().trim()
    );
    return (time?.jogadores || []).filter(pid => ancbPlayerIds.includes(pid));
}

// ─── ETAPA 1: LIMPEZA ────────────────────────────────────────

async function cleanupStaleBadges() {
    console.log('🧹 ETAPA 1 — Removendo badges antigas de reviews...\n');

    const playersSnap = await db.collection('jogadores').get();
    let playersUpdated = 0;
    let badgesRemoved = 0;

    for (const playerDoc of playersSnap.docs) {
        const data = playerDoc.data();
        const badges = data.badges || [];

        const staleBadges = badges.filter(b => STALE_BADGE_IDS.has(b.id));
        if (staleBadges.length === 0) continue;

        const cleanBadges = badges.filter(b => !STALE_BADGE_IDS.has(b.id));

        await db.collection('jogadores').doc(playerDoc.id).update({ badges: cleanBadges });

        console.log(`   🗑️  ${data.nome || playerDoc.id}: removidas ${staleBadges.length} badge(s) — ${staleBadges.map(b => b.id).join(', ')}`);
        badgesRemoved += staleBadges.length;
        playersUpdated++;
    }

    if (playersUpdated === 0) {
        console.log('   ✓  Nenhuma badge antiga encontrada. Tudo limpo.');
    }

    console.log(`\n   Resultado: ${badgesRemoved} badge(s) removida(s) de ${playersUpdated} jogador(es).\n`);
}

// ─── ETAPA 2: BACKFILL DO EVENTO ─────────────────────────────

async function processEvent(eventId) {
    console.log(`🏀 ETAPA 2 — Processando evento: ${eventId}\n`);

    const eventDoc = await db.collection('eventos').doc(eventId).get();
    if (!eventDoc.exists) {
        console.error(`   ❌ Evento "${eventId}" não encontrado no Firestore.`);
        console.error(`   Verifique o ID em: Firebase Console → Firestore → eventos`);
        return;
    }

    const eventData = eventDoc.data();
    const eventName = eventData.nome || 'Evento';
    const eventSlug = eventName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');

    console.log(`   Nome: ${eventName}`);
    console.log(`   Status: ${eventData.status}`);

    if (eventData.status !== 'finalizado') {
        console.warn(`   ⚠️  Evento não está finalizado (status: "${eventData.status}"). Continuando mesmo assim...`);
    }

    const ancbPlayerIds = resolveAncbPlayerIds(eventData);
    if (ancbPlayerIds.length === 0) {
        console.error('   ❌ Nenhum jogador ANCB encontrado no evento.');
        console.error('   Verifique se os times têm isANCB=true ou se jogadoresEscalados está preenchido.');
        return;
    }
    console.log(`   👥 ${ancbPlayerIds.length} jogador(es) ANCB.\n`);

    // Busca jogos e cestas
    const jogosSnap = await db.collection('eventos').doc(eventId).collection('jogos').get();
    const pontosNoEvento = {};
    const cestas3NoEvento = {};
    const maxPontosJogo = {};

    for (const jogoDoc of jogosSnap.docs) {
        const cestasSnap = await db
            .collection('eventos').doc(eventId)
            .collection('jogos').doc(jogoDoc.id)
            .collection('cestas').get();

        const pontosNesteJogo = {};
        for (const cestaDoc of cestasSnap.docs) {
            const cesta = cestaDoc.data();
            const pid = cesta.jogadorId;
            if (!pid || !ancbPlayerIds.includes(pid)) continue;
            const pts = Number(cesta.pontos) || 0;
            pontosNoEvento[pid]  = (pontosNoEvento[pid]  || 0) + pts;
            pontosNesteJogo[pid] = (pontosNesteJogo[pid] || 0) + pts;
            if (pts === 3) cestas3NoEvento[pid] = (cestas3NoEvento[pid] || 0) + 1;
        }
        for (const [pid, pts] of Object.entries(pontosNesteJogo)) {
            if (pts > (maxPontosJogo[pid] || 0)) maxPontosJogo[pid] = pts;
        }
    }

    // Artilheiro
    let artilheiroId = null, maxPontos = 0;
    for (const [pid, pts] of Object.entries(pontosNoEvento)) {
        if (pts > maxPontos) { maxPontos = pts; artilheiroId = pid; }
    }

    // Pódio
    const podio = eventData.podio || {};
    const campeaoIds  = resolvePodioPLayerIds(podio.primeiro, eventData, ancbPlayerIds);
    const viceIds     = resolvePodioPLayerIds(podio.segundo,  eventData, ancbPlayerIds);
    const terceiroIds = resolvePodioPLayerIds(podio.terceiro, eventData, ancbPlayerIds);

    if (campeaoIds.length === 0 && podio.primeiro) {
        console.warn(`   ⚠️  Pódio definido mas nenhum jogador ANCB encontrado no time "${podio.primeiro}".`);
        console.warn(`       Verifique se o nome do time no pódio bate exatamente com o nomeTime no evento.`);
    }

    // Monta badges por jogador
    const badgesByPlayer = {};
    const add = (pid, badge) => {
        if (!badgesByPlayer[pid]) badgesByPlayer[pid] = [];
        badgesByPlayer[pid].push(badge);
    };

    for (const pid of ancbPlayerIds) {
        add(pid, buildBadge(`estava_la_${eventSlug}`, `Estava Lá (${eventName})`, '🏀', 'comum', 'partida', `Participou do evento ${eventName}.`));

        if (campeaoIds.includes(pid))       add(pid, buildBadge(`campiao_${eventSlug}`, `Campeão (${eventName})`,  '🏆', 'epica', 'temporada', `Integrou o time campeão do evento ${eventName}.`));
        else if (viceIds.includes(pid))     add(pid, buildBadge(`vice_${eventSlug}`,    `Vice (${eventName})`,     '🥈', 'rara',  'temporada', `Integrou o time vice-campeão do evento ${eventName}.`));
        else if (terceiroIds.includes(pid)) add(pid, buildBadge(`podio_${eventSlug}`,   `Pódio (${eventName})`,    '🥉', 'rara',  'temporada', `Integrou o time em 3º lugar no evento ${eventName}.`));

        if (pid === artilheiroId && maxPontos > 0)
            add(pid, buildBadge(`cestinha_ev_${eventSlug}`, `Cestinha (${eventName})`, '👑', 'rara', 'partida', `Maior pontuador do evento ${eventName} com ${maxPontos} pts.`));

        const melhorJogo = maxPontosJogo[pid] || 0;
        if (melhorJogo >= 20)      add(pid, buildBadge(`imparavel_${eventSlug}`,   `Imparável (${eventName})`,  '☄️', 'rara',  'partida', `Marcou 20+ pontos em um único jogo no evento ${eventName}.`));
        else if (melhorJogo >= 10) add(pid, buildBadge(`bola_quente_${eventSlug}`, `Bola Quente (${eventName})`, '💥', 'comum', 'partida', `Marcou 10+ pontos em um único jogo no evento ${eventName}.`));

        const total3 = cestas3NoEvento[pid] || 0;
        if (total3 >= 5)      add(pid, buildBadge(`atirador_elite_${eventSlug}`, `Mira Calibrada (${eventName})`, '🎯', 'epica', 'partida', `Converteu 5+ cestas de 3 pontos no evento ${eventName}.`));
        else if (total3 >= 3) add(pid, buildBadge(`atirador_${eventSlug}`,       `Mão Quente (${eventName})`,     '👌', 'rara',  'partida', `Converteu 3+ cestas de 3 pontos no evento ${eventName}.`));
        else if (total3 >= 1) add(pid, buildBadge(`primeira_bomba_${eventSlug}`, `Tiro Certo (${eventName})`,     '🏹', 'comum', 'partida', `Converteu uma cesta de 3 pontos no evento ${eventName}.`));
    }

    // Salva e notifica
    let totalConcedidas = 0;

    for (const [pid, newBadges] of Object.entries(badgesByPlayer)) {
        if (!newBadges.length) continue;

        const playerSnap = await db.collection('jogadores').doc(pid).get();
        if (!playerSnap.exists) { console.warn(`   ⚠️  Jogador ${pid} não encontrado.`); continue; }

        const existingIds = new Set((playerSnap.data().badges || []).map(b => b.id));
        const toAdd = newBadges.filter(b => !existingIds.has(b.id));

        if (!toAdd.length) {
            console.log(`   ✓  ${playerSnap.data().nome}: nenhuma badge nova.`);
            continue;
        }

        await db.collection('jogadores').doc(pid).update({
            badges: admin.firestore.FieldValue.arrayUnion(...toAdd),
        });

        console.log(`   🏆 ${playerSnap.data().nome}: ${toAdd.map(b => b.emoji + ' ' + b.nome).join('  ')}`);
        totalConcedidas += toAdd.length;

        // Notificação in-app
        const usersSnap = await db.collection('usuarios').where('linkedPlayerId', '==', pid).limit(1).get();
        if (!usersSnap.empty) {
            const targetUserId = usersSnap.docs[0].id;
            for (const badge of toAdd) {
                await db.collection('notifications').doc(`badge_${targetUserId}_${badge.id}`).set({
                    targetUserId,
                    type: 'evaluation',
                    title: `Nova conquista desbloqueada! ${badge.emoji}`,
                    message: `Você ganhou "${badge.nome}": ${badge.descricao}`,
                    data: { badgeId: badge.id },
                    read: false,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                }, { merge: true });
            }
        }
    }

    // Remove proteção de reprocessamento para permitir o backfill
    await db.collection('eventos').doc(eventId).update({
        badgesAwardedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`\n   Resultado: ${totalConcedidas} badge(s) concedida(s).\n`);
}

// ─── MAIN ─────────────────────────────────────────────────────

async function main() {
    const eventId = process.argv[2];

    console.log('================================================');
    console.log('  ANCB — Limpeza + Backfill de Conquistas');
    console.log('================================================\n');

    if (!eventId) {
        console.error('❌ Informe o ID do evento como argumento.');
        console.error('   Exemplo:');
        console.error('   node cleanup-and-backfill.js SEU_EVENT_ID\n');
        console.error('   Para encontrar o ID:');
        console.error('   Firebase Console → Firestore → eventos → clique no evento → copie o ID\n');
        process.exit(1);
    }

    await cleanupStaleBadges();
    await processEvent(eventId);

    console.log('================================================');
    console.log('  Concluído!');
    console.log('================================================\n');
}

main().catch(err => {
    console.error('\n❌ Erro fatal:', err);
    process.exit(1);
});
