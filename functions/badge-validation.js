/**
 * badge-validation.js
 * 
 * Camada de proteção para garantir que APENAS badges aprovadas
 * (com regraId válido em conquistas_regras ativo=true) possam ser adicionadas.
 * 
 * Exporta funções para:
 * 1. Validar badge antes de salvar (validarBadgeAprovado)
 * 2. Cleanup agendado que remove badges órfãs (cleanupBadgesOrfas)
 * 3. Auditoria de operações (logAuditoriaBadge)
 */

const admin = require('firebase-admin');
const db = admin.firestore();

/**
 * Valida se um badge pode ser adicionado a um jogador
 * 
 * @param {Object} badge - Badge a ser validado
 * @param {string} playerId - ID do jogador
 * @returns {Promise<{ valid: boolean, reason?: string }>}
 */
async function validarBadgeAprovado(badge) {
  // Validações básicas
  if (!badge || typeof badge !== 'object') {
    return { valid: false, reason: 'Badge inválido ou não é objeto' };
  }

  const regraId = badge.regraId;
  if (!regraId || typeof regraId !== 'string') {
    return { valid: false, reason: 'Badge sem regraId válido' };
  }

  // Verificar se regraId existe em conquistas_regras e está ativo
  try {
    const regraDoc = await db.collection('conquistas_regras').doc(regraId).get();
    
    if (!regraDoc.exists) {
      console.warn(`[BADGE VALIDATION] Tentativa de adicionar badge com regraId inválido: ${regraId}`);
      return { valid: false, reason: `Regra ${regraId} não existe em conquistas_regras` };
    }

    const regraData = regraDoc.data();
    
    // Verificar se regra está ativa
    if (regraData.ativo === false) {
      console.warn(`[BADGE VALIDATION] Tentativa de adicionar badge de regra desativada: ${regraId}`);
      return { valid: false, reason: `Regra ${regraId} está desativada (ativo: false)` };
    }

    return { valid: true };
  } catch (error) {
    console.error(`[BADGE VALIDATION] Erro ao validar badge:`, error);
    return { valid: false, reason: `Erro ao validar regra: ${error.message}` };
  }
}

/**
 * Remove badges órfãos (cuja regraId não existe mais ou está inativa)
 * Deve rodar semanalmente como Cloud Function agendada
 * 
 * @returns {Promise<{ playersProcessed: number, badgesRemoved: number, logs: string[] }>}
 */
async function cleanupBadgesOrfas() {
  console.log('\n🧹 CLEANUP: Iniciando limpeza de badges órfãs...\n');
  
  const logs = [];
  let playersProcessed = 0;
  let badgesRemoved = 0;

  try {
    // Passo 1: Coletar todas as regras ativas
    const regrasSnapshot = await db.collection('conquistas_regras')
      .where('ativo', '==', true)
      .get();
    
    const activaRuleIds = new Set(regrasSnapshot.docs.map(doc => doc.id));
    logs.push(`📋 Regras ATIVAS encontradas: ${activaRuleIds.size}`);

    // Passo 2: Iterar por cada jogador
    const jogadoresSnapshot = await db.collection('jogadores').get();
    logs.push(`👥 Jogadores para processar: ${jogadoresSnapshot.size}`);

    for (const jogadorDoc of jogadoresSnapshot.docs) {
      const jogador = jogadorDoc.data();
      const badges = Array.isArray(jogador.badges) ? jogador.badges : [];
      
      if (badges.length === 0) continue;

      // Filtrar badges órfãs
      const badgesToKeep = [];
      const badgesToRemove = [];

      for (const badge of badges) {
        const regraId = badge.regraId;
        
        // Se badge não tem regraId ou regra não está ativa, marcar para remover
        if (!regraId || !activaRuleIds.has(regraId)) {
          badgesToRemove.push({
            id: badge.id,
            nome: badge.nome,
            regraId: regraId,
            razao: !regraId ? 'sem regraId' : 'regra inativa'
          });
        } else {
          badgesToKeep.push(badge);
        }
      }

      // Se há badges a remover, atualizar documento
      if (badgesToRemove.length > 0) {
        playersProcessed++;
        badgesRemoved += badgesToRemove.length;

        await jogadorDoc.ref.update({ badges: badgesToKeep });
        
        const playerLog = `✅ ${jogador.nome}: ${badgesToRemove.length} badges removidas`;
        logs.push(playerLog);
        
        // Log de auditoria
        await logAuditoriaBadge({
          tipo: 'cleanup',
          jogadorId: jogadorDoc.id,
          jogadorNome: jogador.nome,
          badgesRemovidas: badgesToRemove,
          timestamp: new Date().toISOString()
        });
      }
    }

    logs.push(`\n✅ CLEANUP CONCLUÍDO`);
    logs.push(`📊 Jogadores processados: ${playersProcessed}`);
    logs.push(`🗑️  Badges removidas: ${badgesRemoved}`);

    console.log(logs.join('\n'));

    return {
      success: true,
      playersProcessed,
      badgesRemoved,
      logs
    };

  } catch (error) {
    const errorLog = `❌ Erro durante cleanup: ${error.message}`;
    logs.push(errorLog);
    console.error(errorLog);
    
    return {
      success: false,
      error: error.message,
      logs
    };
  }
}

/**
 * Registra operações de badges em auditoria
 * 
 * @param {Object} entry - Entrada de auditoria
 * @returns {Promise<void>}
 */
async function logAuditoriaBadge(entry) {
  try {
    const auditLog = {
      timestamp: entry.timestamp || new Date().toISOString(),
      tipo: entry.tipo, // 'awarded', 'removed', 'rejected', 'cleanup'
      jogadorId: entry.jogadorId,
      jogadorNome: entry.jogadorNome,
      badgeId: entry.badgeId,
      badgeNome: entry.badgeNome,
      regraId: entry.regraId,
      motivo: entry.motivo,
      badgesRemovidas: entry.badgesRemovidas,
      userId: entry.userId // Admin que executou a ação
    };

    await db.collection('badge_audit_log').add(auditLog);
  } catch (error) {
    console.error('[AUDIT LOG] Erro ao registrar operação:', error);
  }
}

/**
 * Wrapper para validação antes de adicionar badge
 * Deve ser chamado em handleAwardBadgeToPlayer
 * 
 * @param {Object} badge - Badge a ser adicionado
 * @param {string} playerId - ID do jogador
 * @param {string} adminId - ID do admin que está concedendo
 * @returns {Promise<{ success: boolean, message: string }>}
 */
async function awardBadgeComValidacao(badge, playerId, adminId) {
  // Validar badge
  const validacao = await validarBadgeAprovado(badge);
  
  if (!validacao.valid) {
    // Log de rejeição
    await logAuditoriaBadge({
      tipo: 'rejected',
      jogadorId: playerId,
      badgeId: badge.id,
      badgeNome: badge.nome,
      regraId: badge.regraId,
      motivo: validacao.reason,
      userId: adminId
    });
    
    return {
      success: false,
      message: `❌ Badge rejeitado: ${validacao.reason}`
    };
  }

  // Se válido, prosseguir com adição
  await logAuditoriaBadge({
    tipo: 'awarded',
    jogadorId: playerId,
    badgeId: badge.id,
    badgeNome: badge.nome,
    regraId: badge.regraId,
    userId: adminId
  });

  return {
    success: true,
    message: `✅ Badge adicionado com sucesso`
  };
}

module.exports = {
  validarBadgeAprovado,
  cleanupBadgesOrfas,
  logAuditoriaBadge,
  awardBadgeComValidacao
};
