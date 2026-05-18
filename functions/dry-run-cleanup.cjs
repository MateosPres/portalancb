/**
 * dry-run-cleanup.cjs
 * 
 * DRY RUN: Mostra exatamente o que será removido SEM fazer alterações
 * Útil para validar antes de executar a limpeza real
 */

const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const LEGACY_QUIZ_TOKENS = new Set([
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
  if (LEGACY_QUIZ_TOKENS.has(id) || LEGACY_QUIZ_TOKENS.has(nome)) {
    return true;
  }
  return [...LEGACY_QUIZ_TOKENS].some((token) => 
    id.includes(token) || nome.includes(token)
  );
};

async function dryRunCleanup() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║           DRY RUN: Limpeza de Badges de Quiz           ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    // ===== REGRAS DE QUIZ EM FIREBASE =====
    console.log('📋 PASSO 1: Analisando Regras de Quiz em conquistas_regras...\n');
    
    const regrasSnap = await db.collection('conquistas_regras').get();
    const quizRulesToDelete = [];
    const allRegras = [];

    for (const doc of regrasSnap.docs) {
      const regra = doc.data();
      let gatilho = regra.gatilho;
      
      if (typeof gatilho === 'string') {
        try { gatilho = JSON.parse(gatilho); } catch (e) {}
      }
      
      const tipoGatilho = gatilho?.tipo || '';
      const isQuizRule = 
        tipoGatilho === 'top_atributo_jogo' ||
        tipoGatilho === 'top_atributo_evento' ||
        tipoGatilho === 'top_atributo_temporada' ||
        String(regra.titulo || '').toLowerCase().includes('top_atributo');
      
      allRegras.push({
        id: doc.id,
        titulo: regra.titulo || '[SEM TÍTULO]',
        tipo: tipoGatilho,
        ativo: regra.ativo ?? true,
        isQuiz: isQuizRule
      });

      if (isQuizRule) {
        quizRulesToDelete.push({ docId: doc.id, titulo: regra.titulo, tipo: tipoGatilho });
      }
    }

    console.log(`Total de regras em conquistas_regras: ${allRegras.length}`);
    console.log(`Regras de QUIZ encontradas: ${quizRulesToDelete.length}\n`);

    if (quizRulesToDelete.length > 0) {
      console.log('❌ Regras de Quiz que SERIAM DELETADAS:');
      quizRulesToDelete.forEach((rule, idx) => {
        console.log(`   ${idx + 1}. [${rule.docId}] "${rule.titulo}" (tipo: ${rule.tipo})`);
      });
    } else {
      console.log('✅ Nenhuma regra de quiz encontrada (BOM!)');
    }

    // ===== BADGES DOS USUÁRIOS =====
    console.log('\n\n📌 PASSO 2: Analisando Badges dos Usuários...\n');

    const jogadoresSnap = await db.collection('jogadores').get();
    const playersWithQuizBadges = [];
    const badgesPerPlayer = {};
    let totalBadgesQRemove = 0;
    let totalPlayersAffected = 0;

    for (const doc of jogadoresSnap.docs) {
      const jogador = doc.data();
      const badges = Array.isArray(jogador.badges) ? jogador.badges : [];
      const quizBadgesToRemove = badges.filter(isLegacyQuizBadge);

      if (quizBadgesToRemove.length > 0) {
        totalPlayersAffected++;
        totalBadgesQRemove += quizBadgesToRemove.length;
        playersWithQuizBadges.push({
          playerId: doc.id,
          playerNome: jogador.nome || '[SEM NOME]',
          totalBadges: badges.length,
          quizBadges: quizBadgesToRemove,
          badgesAfterCleanup: badges.length - quizBadgesToRemove.length
        });
        badgesPerPlayer[doc.id] = {
          nome: jogador.nome,
          quizBadgeCount: quizBadgesToRemove.length
        };
      }
    }

    console.log(`Total de jogadores: ${jogadoresSnap.size}`);
    console.log(`Jogadores COM badges de quiz: ${totalPlayersAffected}`);
    console.log(`Total de badges de quiz para REMOVER: ${totalBadgesQRemove}\n`);

    if (playersWithQuizBadges.length > 0) {
      console.log('📊 Detalhamento de Badges por Jogador:');
      console.log('─'.repeat(120));
      playersWithQuizBadges.forEach((player, idx) => {
        console.log(`\n${idx + 1}. ${player.playerNome} (ID: ${player.playerId})`);
        console.log(`   Badges totais: ${player.totalBadges} → ${player.badgesAfterCleanup} (remover ${player.quizBadges.length})`);
        player.quizBadges.forEach((badge) => {
          const badgeInfo = `${badge.nome || '[SEM NOME]'} (${badge.id || '[SEM ID]'})`;
          const date = badge.data ? ` - ${badge.data}` : '';
          console.log(`      ❌ ${badgeInfo}${date}`);
        });
      });
    } else {
      console.log('✅ Nenhum jogador com badges de quiz (PERFEITO!)');
    }

    // ===== ARQUIVO DE CÓDIGO =====
    console.log('\n\n🔧 PASSO 3: Arquivos de Código que SERÃO MODIFICADOS:\n');

    const filesToModify = [
      { file: 'utils/badges.ts', action: 'REMOVER', item: 'REVIEW_TAG_IMPACTS (10 badges hardcoded)' },
      { file: 'utils/reviewQuiz.ts', action: 'REMOVER', item: 'REVIEW_TAGS array inteiro' },
      { file: 'types.ts', action: 'REMOVER ou ATUALIZAR', item: 'Campo stats_tags em Jogador' },
      { file: 'functions/index.js', action: 'REMOVER', item: 'Lógica top_atributo em evaluateRuleForPlayer(), evaluateEventRuleForPlayer(), evaluateSeasonRuleForPlayer()' }
    ];

    filesToModify.forEach((file, idx) => {
      console.log(`${idx + 1}. [${file.action}] ${file.file}`);
      console.log(`   └─ ${file.item}\n`);
    });

    // ===== RESUMO FINAL =====
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                    RESUMO DO DRY RUN                    ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log(`✅ ESTADO ATUAL:`);
    console.log(`   • Regras de quiz em Firebase: ${quizRulesToDelete.length}`);
    console.log(`   • Jogadores com badges de quiz: ${totalPlayersAffected}`);
    console.log(`   • Badges de quiz nos usuários: ${totalBadgesQRemove}`);
    console.log(`   • Arquivos com código hardcoded: ${filesToModify.length}`);

    console.log(`\n📋 PRÓXIMOS PASSOS:`);
    console.log(`   1. Deletar ${quizRulesToDelete.length} regras de quiz em Firestore`);
    console.log(`   2. Remover ${totalBadgesQRemove} badges de quiz de ${totalPlayersAffected} jogadores`);
    console.log(`   3. Remover REVIEW_TAG_IMPACTS de utils/badges.ts`);
    console.log(`   4. Remover REVIEW_TAGS de utils/reviewQuiz.ts`);
    console.log(`   5. Limpar lógica em functions/index.js`);
    console.log(`   6. Implementar validação de badge aprovado`);
    console.log(`   7. Deploy de Cloud Functions`);

    console.log(`\n⚠️  IMPACTOS:`);
    console.log(`   • ${totalPlayersAffected} jogadores perderão ${totalBadgesQRemove} badges`);
    console.log(`   • Sistema não mais permitirá criar/editar regras de quiz via admin panel`);
    console.log(`   • 100% das conquistas virão de painel administrativo`);

    console.log('\n✨ Para executar a limpeza real, rode: node cleanup-quiz-badges.cjs\n');

  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

dryRunCleanup();
