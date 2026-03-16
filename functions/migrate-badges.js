/**
 * migrate-badges.js
 *
 * Migra todas as badges existentes no Firestore:
 *   1. Formato do nome: "NOME — EVENTO" → "NOME (EVENTO)"
 *   2. Raridade antiga: as badges já salvas com raridade correta
 *      mas o campo "label" não fica no Firestore — só o campo "raridade".
 *      Então só precisamos corrigir o nome.
 *
 * SEGURO para rodar mais de uma vez — só altera badges que ainda
 * têm o formato antigo com " — ".
 *
 * USO:
 *   node migrate-badges.js
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

function fixBadgeName(nome) {
    // "Bola Quente — Copa Guarantã 2026" → "Bola Quente (Copa Guarantã 2026)"
    if (!nome || !nome.includes(' — ')) return nome;
    const parts = nome.split(' — ');
    const badgePart = parts[0].trim();
    const eventPart = parts.slice(1).join(' — ').trim(); // caso tenha mais de um " — "
    return `${badgePart} (${eventPart})`;
}

async function main() {
    console.log('🔄 Migrando badges...\n');

    const playersSnap = await db.collection('jogadores').get();
    let playersUpdated = 0;
    let badgesUpdated = 0;

    for (const playerDoc of playersSnap.docs) {
        const data = playerDoc.data();
        const badges = data.badges || [];

        const needsUpdate = badges.some(b => b.nome && b.nome.includes(' — '));
        if (!needsUpdate) continue;

        const updatedBadges = badges.map(b => {
            if (!b.nome || !b.nome.includes(' — ')) return b;
            return { ...b, nome: fixBadgeName(b.nome) };
        });

        await db.collection('jogadores').doc(playerDoc.id).update({ badges: updatedBadges });

        const count = badges.filter(b => b.nome?.includes(' — ')).length;
        badgesUpdated += count;
        playersUpdated++;

        console.log(`   ✅ ${data.nome || playerDoc.id}: ${count} badge(s) renomeada(s)`);
        updatedBadges
            .filter((b, i) => badges[i].nome !== b.nome)
            .forEach(b => console.log(`      "${badges.find(ob => ob.id === b.id)?.nome}" → "${b.nome}"`));
    }

    if (playersUpdated === 0) {
        console.log('   Nenhuma badge com formato antigo encontrada. Tudo já está atualizado.');
    }

    console.log(`\n✅ Concluído: ${badgesUpdated} badge(s) renomeada(s) em ${playersUpdated} jogador(es).\n`);
}

main().catch(err => { console.error('Erro:', err); process.exit(1); });
