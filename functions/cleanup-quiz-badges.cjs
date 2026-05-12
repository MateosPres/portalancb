const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function removeQuizBasedBadges() {
  console.log('\n🔍 INICIANDO LIMPEZA DE CONQUISTAS BASEADAS EM QUIZ...\n');

  try {
    console.log('📋 PASSO 1: Deletando regras de conquista baseadas em quiz do Firestore...');
    console.log('─'.repeat(70));

    const regrasSnap = await db.collection('conquistas_regras').get();
    const rulesToDelete = [];
    const quizRuleIds = [];
    const legacyQuizTokens = new Set([
      'muralha',
      'sniper',
      'garcom',
      'flash',
      'lider',
      'guerreiro',
      'avenida',
      'fominha',
      'tijoleiro',
      'cone',
    ]);

    const isLegacyQuizBadge = (badge) => {
      if (!badge || typeof badge !== 'object') return false;
      const id = String(badge.id || '').trim().toLowerCase();
      const nome = String(badge.nome || '').trim().toLowerCase();
      if (legacyQuizTokens.has(id) || legacyQuizTokens.has(nome)) {
        return true;
      }
      return [...legacyQuizTokens].some((token) => id.includes(token) || nome.includes(token));
    };

    if (regrasSnap.empty) {
      console.log('ℹ️  Nenhuma regra encontrada na colecao conquistas_regras');
    } else {
      for (const doc of regrasSnap.docs) {
        const regra = doc.data();
        let gatilho = regra.gatilho;
        if (typeof gatilho === 'string') {
          try {
            gatilho = JSON.parse(gatilho);
          } catch (e) {
            gatilho = {};
          }
        }

        const tipoGatilho = gatilho?.tipo || '';
        if (
          tipoGatilho === 'top_atributo_jogo' ||
          tipoGatilho === 'top_atributo_evento' ||
          tipoGatilho === 'top_atributo_temporada'
        ) {
          rulesToDelete.push({ id: doc.id, titulo: regra.titulo, tipo: tipoGatilho, tipoAvaliacao: regra.tipoAvaliacao });
          quizRuleIds.push(doc.id);
          await db.collection('conquistas_regras').doc(doc.id).delete();
          console.log(`  ✅ Deletado: "${regra.titulo}" (${tipoGatilho})`);
        }
      }
    }

    if (rulesToDelete.length === 0) {
      console.log('  ℹ️  Nenhuma regra baseada em quiz encontrada.');
    } else {
      console.log(`\n✅ ${rulesToDelete.length} regra(s) deletada(s) do Firestore`);
    }

    console.log('\n📋 PASSO 2: Removendo badges dos jogadores...');
    console.log('─'.repeat(70));

    const jogadoresSnap = await db.collection('jogadores').get();
    let totalBadgesRemovidas = 0;
    let jogadoresAfetados = 0;
    let jogadoresProcessados = 0;
    const detalhes = [];

    if (jogadoresSnap.empty) {
      console.log('ℹ️  Nenhum jogador encontrado na colecao jogadores');
    } else {
      for (const jogadorDoc of jogadoresSnap.docs) {
        jogadoresProcessados += 1;
        const jogador = jogadorDoc.data();
        const badges = Array.isArray(jogador.badges) ? jogador.badges : [];
        if (badges.length === 0) continue;

        const badgesFiltradas = badges.filter((badge) => {
          const ruleBased = badge?.regraId && quizRuleIds.includes(badge.regraId);
          const legacyQuizBadge = isLegacyQuizBadge(badge);
          return !ruleBased && !legacyQuizBadge;
        });
        if (badgesFiltradas.length < badges.length) {
          const qtdRemovidas = badges.length - badgesFiltradas.length;
          totalBadgesRemovidas += qtdRemovidas;
          jogadoresAfetados += 1;

          await db.collection('jogadores').doc(jogadorDoc.id).update({ badges: badgesFiltradas });
          const nomeJogador = jogador.nome || jogadorDoc.id;
          console.log(`  ✅ ${nomeJogador}: ${qtdRemovidas} badge(s) removida(s)`);
          detalhes.push(`${nomeJogador}: ${qtdRemovidas} badge(s)`);
        }
      }
    }

    console.log(`\n✅ Processados ${jogadoresProcessados} jogador(es)`);
    console.log(`✅ ${jogadoresAfetados} jogador(es) afetado(s)`);
    console.log(`✅ Total de ${totalBadgesRemovidas} badge(s) removida(s)`);

    console.log('\n' + '═'.repeat(70));
    console.log('✅ LIMPEZA CONCLUÍDA COM SUCESSO!');
    console.log('═'.repeat(70));

    console.log('\nRESULTADO:');
    console.log(JSON.stringify({ success: true, regrasRemovidas: rulesToDelete.length, detalhesRegrasRemovidas: rulesToDelete, jogadoresProcessados, jogadoresAfetados, badgesRemovidas: totalBadgesRemovidas, detalhesJogadores: detalhes }, null, 2));
    return true;
  } catch (error) {
    console.error('\n❌ ERRO DURANTE A LIMPEZA:', error);
    return false;
  }
}

removeQuizBasedBadges().then(() => process.exit(0));
