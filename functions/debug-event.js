/**
 * debug-event.js
 *
 * Diagnóstico detalhado de um evento — mostra exatamente o que o
 * cleanup-and-backfill vê: jogadores, cestas, pódio e badges existentes.
 *
 * USO:
 *   node debug-event.js ID_DO_EVENTO
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

function extractPlayerId(entry) {
    if (typeof entry === 'string') return entry;
    if (entry && typeof entry === 'object' && entry.id) return entry.id;
    return null;
}

async function main() {
    const eventId = process.argv[2];
    if (!eventId) { console.error('Informe o ID do evento: node debug-event.js ID'); process.exit(1); }

    const eventDoc = await db.collection('eventos').doc(eventId).get();
    if (!eventDoc.exists) { console.error('Evento não encontrado.'); process.exit(1); }

    const ev = eventDoc.data();
    console.log('\n══════════════════════════════════════');
    console.log(`EVENTO: ${ev.nome} (${eventId})`);
    console.log(`Status: ${ev.status} | Tipo: ${ev.type} | Modalidade: ${ev.modalidade}`);
    console.log('══════════════════════════════════════\n');

    // ── Pódio ──
    console.log('📋 PÓDIO:');
    if (ev.podio) {
        console.log(`   1º: ${ev.podio.primeiro || '(vazio)'}`);
        console.log(`   2º: ${ev.podio.segundo  || '(vazio)'}`);
        console.log(`   3º: ${ev.podio.terceiro || '(vazio)'}`);
    } else {
        console.log('   ⚠️  Campo "podio" não encontrado no evento.');
        console.log('   → Conquistas de Campeão/Vice/Pódio não serão concedidas.');
    }

    // ── Jogadores ──
    console.log('\n👥 RESOLUÇÃO DE JOGADORES ANCB:');
    let ancbIds = [];
    if (ev.timesParticipantes?.length > 0) {
        const ancbTimes = ev.timesParticipantes.filter(t => t.isANCB);
        console.log(`   Modelo: timesParticipantes (${ev.timesParticipantes.length} times, ${ancbTimes.length} ANCB)`);
        ancbTimes.forEach(t => {
            console.log(`   Time ANCB: "${t.nomeTime}" — ${(t.jogadores||[]).length} jogador(es)`);
            ancbIds.push(...(t.jogadores || []));
        });
        if (ancbTimes.length === 0) {
            console.log('   ⚠️  Nenhum time com isANCB=true. Todos os times:');
            ev.timesParticipantes.forEach(t => console.log(`      "${t.nomeTime}" isANCB=${t.isANCB}`));
        }
    } else if (ev.times?.length > 0) {
        console.log(`   Modelo: times (torneio interno) — ${ev.times.length} time(s)`);
        ev.times.forEach(t => {
            console.log(`   Time: "${t.nomeTime}" — ${(t.jogadores||[]).length} jogador(es)`);
            ancbIds.push(...(t.jogadores || []));
        });
    } else {
        ancbIds = (ev.jogadoresEscalados || []).map(extractPlayerId).filter(Boolean);
        console.log(`   Modelo: jogadoresEscalados — ${ancbIds.length} jogador(es)`);
    }
    ancbIds = [...new Set(ancbIds.filter(Boolean))];
    console.log(`   Total ANCB: ${ancbIds.length} jogador(es)\n`);

    // ── Jogos e Cestas ──
    console.log('🏀 JOGOS E CESTAS:');
    const jogosSnap = await db.collection('eventos').doc(eventId).collection('jogos').get();
    console.log(`   ${jogosSnap.size} jogo(s) encontrado(s)\n`);

    const pontosNoEvento = {};
    const cestas3NoEvento = {};
    const maxPontosJogo = {};
    let totalCestas = 0, cestasComJogador = 0, cestasSemJogador = 0;

    for (const jogoDoc of jogosSnap.docs) {
        const jogo = jogoDoc.data();
        const cestasSnap = await db.collection('eventos').doc(eventId)
            .collection('jogos').doc(jogoDoc.id).collection('cestas').get();

        console.log(`   Jogo ${jogoDoc.id} (${jogo.status || 'sem status'}) — ${cestasSnap.size} cesta(s)`);

        const pontosNesteJogo = {};
        for (const cestaDoc of cestasSnap.docs) {
            const c = cestaDoc.data();
            totalCestas++;
            if (!c.jogadorId) {
                cestasSemJogador++;
                continue;
            }
            if (!ancbIds.includes(c.jogadorId)) continue;
            cestasComJogador++;
            const pts = Number(c.pontos) || 0;
            pontosNoEvento[c.jogadorId]  = (pontosNoEvento[c.jogadorId]  || 0) + pts;
            pontosNesteJogo[c.jogadorId] = (pontosNesteJogo[c.jogadorId] || 0) + pts;
            if (pts === 3) cestas3NoEvento[c.jogadorId] = (cestas3NoEvento[c.jogadorId] || 0) + 1;
        }
        for (const [pid, pts] of Object.entries(pontosNesteJogo)) {
            if (pts > (maxPontosJogo[pid] || 0)) maxPontosJogo[pid] = pts;
        }
    }

    console.log(`\n   Total de cestas: ${totalCestas}`);
    console.log(`   Com jogadorId (ANCB): ${cestasComJogador}`);
    console.log(`   Sem jogadorId: ${cestasSemJogador}`);
    if (cestasSemJogador > 0) {
        console.log('   ⚠️  Cestas sem jogadorId não são contabilizadas.');
        console.log('   → Conquistas de pontuação podem estar incorretas.');
    }

    // ── Resumo por jogador ──
    console.log('\n📊 PONTUAÇÃO POR JOGADOR:');
    if (Object.keys(pontosNoEvento).length === 0) {
        console.log('   ⚠️  Nenhuma cesta vinculada a jogadores ANCB encontrada.');
        console.log('   → Badges de pontuação (Cestinha, Bola Quente, etc.) não serão concedidas.');
    } else {
        const sorted = Object.entries(pontosNoEvento).sort((a,b) => b[1]-a[1]);
        for (const [pid, pts] of sorted) {
            const playerSnap = await db.collection('jogadores').doc(pid).get();
            const nome = playerSnap.exists ? playerSnap.data().nome : pid;
            console.log(`   ${nome}: ${pts} pts | melhor jogo: ${maxPontosJogo[pid]||0} pts | 3pts: ${cestas3NoEvento[pid]||0}`);
        }
    }

    // ── Badges existentes ──
    console.log('\n🏆 BADGES JÁ EXISTENTES (por jogador):');
    const eventSlug = (ev.nome||'').toLowerCase().replace(/[^a-z0-9]/g,'_').replace(/_+/g,'_');
    let alguemTemBadgeDoEvento = false;
    for (const pid of ancbIds) {
        const playerSnap = await db.collection('jogadores').doc(pid).get();
        if (!playerSnap.exists) continue;
        const badges = playerSnap.data().badges || [];
        const badgesDoEvento = badges.filter(b => b.id.includes(eventSlug));
        if (badgesDoEvento.length > 0) {
            alguemTemBadgeDoEvento = true;
            console.log(`   ${playerSnap.data().nome}: ${badgesDoEvento.map(b => b.nome).join(', ')}`);
        }
    }
    if (!alguemTemBadgeDoEvento) {
        console.log('   Nenhum jogador tem badges deste evento ainda.');
    }

    console.log('\n══════════════════════════════════════');
    console.log('Diagnóstico concluído.');
    console.log('══════════════════════════════════════\n');
}

main().catch(err => { console.error('Erro:', err); process.exit(1); });
