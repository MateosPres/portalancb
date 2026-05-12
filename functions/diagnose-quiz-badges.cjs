const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function main() {
  console.log('🔍 Diagnóstico de regras e badges de quiz');

  const regrasSnap = await db.collection('conquistas_regras').get();
  const rules = [];
  for (const doc of regrasSnap.docs) {
    const regra = doc.data();
    let gatilho = regra.gatilho;
    if (typeof gatilho === 'string') {
      try { gatilho = JSON.parse(gatilho); } catch (e) { }
    }
    const tipo = gatilho?.tipo || '';    
    if (String(tipo).includes('top_atributo') || String(regra.titulo || '').toLowerCase().includes('top') || String(regra.titulo || '').toLowerCase().includes('atributo')) {
      rules.push({ id: doc.id, titulo: regra.titulo, tipo, tipoAvaliacao: regra.tipoAvaliacao, gatilho });
    }
  }

  console.log(`
📄 Regras encontradas em conquistas_regras com top_atributo ou títulos suspeitos: ${rules.length}`);
  console.log(JSON.stringify(rules, null, 2));

  const playerSnap = await db.collection('jogadores').get();
  const suspiciousBadges = [];
  for (const doc of playerSnap.docs) {
    const jogador = doc.data();
    const badges = Array.isArray(jogador.badges) ? jogador.badges : [];
    for (const badge of badges) {
      const name = String(badge.nome || '').toLowerCase();
      const ruleId = String(badge.regraId || '');
      if (['sniper','muralha','lider'].includes(name) || name.includes('atributo') || name.includes('quiz') || ruleId.includes('top_atributo')) {
        suspiciousBadges.push({ playerId: doc.id, playerNome: jogador.nome, badge });
      }
    }
  }

  console.log(`\n🏷️ Badges suspeitos encontrados: ${suspiciousBadges.length}`);
  if (suspiciousBadges.length > 0) {
    console.log(JSON.stringify(suspiciousBadges.slice(0, 50), null, 2));
  }

  const ruleIdsInBadges = new Set();
  suspiciousBadges.forEach((entry) => { if (entry.badge.regraId) ruleIdsInBadges.add(entry.badge.regraId); });
  console.log(`\nIDs de regra suspeitos em badges: ${[...ruleIdsInBadges].join(', ')}`);

  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });