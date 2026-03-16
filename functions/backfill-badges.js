/**
 * backfill-badges.js
 *
 * Script de uso único para processar todas as avaliações existentes
 * em 'avaliacoes_gamified' e conceder as badges retroativamente.
 *
 * COMO USAR:
 *   1. Coloque este arquivo em functions/ (junto com o index.js)
 *   2. Certifique-se que o arquivo de credenciais do Firebase Admin está disponível.
 *      Se estiver rodando localmente com firebase-admin já configurado pelo CLI, basta:
 *        export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"
 *      Ou baixe a chave em: Firebase Console → Configurações do projeto → Contas de serviço
 *   3. Execute:
 *        node backfill-badges.js
 *
 * O script é SEGURO para rodar mais de uma vez:
 *   - Não duplica badges (checa se o jogador já possui antes de adicionar)
 *   - Não recalcula stats_tags/stats_atributos (eles já estão corretos no Firestore)
 *   - Apenas avalia se alguma badge deveria ter sido concedida e ainda não foi
 */

const admin = require('firebase-admin');

// ─── CONFIGURAÇÃO ────────────────────────────────────────────
// Troque pelo ID do seu projeto Firebase se necessário.
// Se GOOGLE_APPLICATION_CREDENTIALS estiver configurado, isso é suficiente.
const PROJECT_ID = 'ancb-painel-db'; // <-- confirme o ID do seu projeto

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: PROJECT_ID,
    });
}

const db = admin.firestore();

// ─── ESPELHO DAS CONSTANTES DE utils/badges.ts ───────────────
// (mesmas do index.js — não importa diretamente para evitar
//  dependência de TypeScript aqui)

const REVIEW_TAG_MULTIPLIERS = { 1: 1.0, 2: 0.75, 3: 0.55 };

const REVIEW_TAG_IMPACTS = {
    muralha:   { defesa: 3, forca: 1 },
    sniper:    { ataque: 3, visao: 1 },
    garcom:    { visao: 3, ataque: 1 },
    flash:     { velocidade: 3, ataque: 1 },
    lider:     { visao: 3, defesa: 1, forca: 1 },
    guerreiro: { forca: 3, defesa: 1 },
    avenida:   { defesa: -1, velocidade: -0.5 },
    fominha:   { visao: -1, ataque: -0.5 },
    tijoleiro: { ataque: -1, visao: -0.5 },
    cone:      { velocidade: -1, forca: -0.5 },
};

const BADGE_CATALOG = [
    { id: 'sniper_bronze',    nome: 'Sniper',           emoji: '🎯', categoria: 'partida',   raridade: 'comum',  descricao: 'Reconhecido como atirador de elite por 3 companheiros.',   criterio: { tipo: 'tag_count', tag: 'sniper',    minCount: 3  } },
    { id: 'sniper_prata',     nome: 'Sniper de Elite',  emoji: '🎯', categoria: 'partida',   raridade: 'rara',   descricao: 'Reconhecido como atirador de elite por 10 companheiros.',  criterio: { tipo: 'tag_count', tag: 'sniper',    minCount: 10 } },
    { id: 'muralha_bronze',   nome: 'Muralha',          emoji: '🛡️', categoria: 'partida',   raridade: 'comum',  descricao: 'Reconhecido como defensor sólido por 3 companheiros.',     criterio: { tipo: 'tag_count', tag: 'muralha',   minCount: 3  } },
    { id: 'muralha_prata',    nome: 'Muralha de Ferro', emoji: '🛡️', categoria: 'partida',   raridade: 'rara',   descricao: 'Reconhecido como defensor sólido por 10 companheiros.',    criterio: { tipo: 'tag_count', tag: 'muralha',   minCount: 10 } },
    { id: 'garcom_bronze',    nome: 'Garçom',           emoji: '🤲', categoria: 'partida',   raridade: 'comum',  descricao: 'Reconhecido pela visão de jogo por 3 companheiros.',       criterio: { tipo: 'tag_count', tag: 'garcom',    minCount: 3  } },
    { id: 'flash_bronze',     nome: 'Flash',            emoji: '⚡', categoria: 'partida',   raridade: 'comum',  descricao: 'Reconhecido pela velocidade por 3 companheiros.',          criterio: { tipo: 'tag_count', tag: 'flash',     minCount: 3  } },
    { id: 'lider_bronze',     nome: 'Líder',            emoji: '👑', categoria: 'partida',   raridade: 'comum',  descricao: 'Reconhecido como líder por 3 companheiros.',               criterio: { tipo: 'tag_count', tag: 'lider',     minCount: 3  } },
    { id: 'lider_epico',      nome: 'Capitão',          emoji: '👑', categoria: 'temporada', raridade: 'epica',  descricao: 'Reconhecido como líder por 15 companheiros.',              criterio: { tipo: 'tag_count', tag: 'lider',     minCount: 15 } },
    { id: 'guerreiro_bronze', nome: 'Guerreiro',        emoji: '💪', categoria: 'partida',   raridade: 'comum',  descricao: 'Reconhecido pela força e garra por 3 companheiros.',       criterio: { tipo: 'tag_count', tag: 'guerreiro', minCount: 3  } },
];

// ─── LÓGICA DE AVALIAÇÃO ─────────────────────────────────────

function evaluateNewBadges(currentBadges, statsTags, statsAtributos) {
    const existingIds = new Set((currentBadges || []).map(b => b.id));
    const newBadges = [];

    for (const def of BADGE_CATALOG) {
        if (existingIds.has(def.id)) continue;
        if (!def.criterio || def.criterio.tipo !== 'tag_count') continue;
        const count = (statsTags || {})[def.criterio.tag] ?? 0;
        if (count >= def.criterio.minCount) {
            newBadges.push(def);
        }
    }

    // Critério all_around
    if (!existingIds.has('all_around')) {
        const attrs = statsAtributos || {};
        const values = ['ataque', 'defesa', 'velocidade', 'forca', 'visao'].map(k => attrs[k] ?? 0);
        if (values.length === 5 && values.every(v => v >= 50)) {
            newBadges.push({
                id: 'all_around', nome: 'All-Around', emoji: '⭐',
                categoria: 'atributo', raridade: 'epica',
                descricao: 'Todos os atributos acima de 50 pontos.',
            });
        }
    }

    return newBadges;
}

// ─── RECALCULA STATS A PARTIR DO ZERO ────────────────────────
// Garante que stats_tags e stats_atributos estejam corretos
// antes de avaliar as badges, evitando falsos negativos.

function recalcStatsFromReviews(reviews) {
    const statsTags = {};
    const statsAtributos = { ataque: 0, defesa: 0, velocidade: 0, forca: 0, visao: 0 };

    for (const review of reviews) {
        const tags = Array.isArray(review.tags) ? review.tags : [];
        const multiplier = REVIEW_TAG_MULTIPLIERS[tags.length] ?? 1.0;

        for (const tagId of tags) {
            statsTags[tagId] = (statsTags[tagId] || 0) + 1;
            const impact = REVIEW_TAG_IMPACTS[tagId];
            if (impact) {
                for (const [attr, value] of Object.entries(impact)) {
                    const delta = Math.round(value * multiplier * 10) / 10;
                    statsAtributos[attr] = (statsAtributos[attr] || 0) + delta;
                }
            }
        }
    }

    return { statsTags, statsAtributos };
}

// ─── MAIN ────────────────────────────────────────────────────

async function main() {
    console.log('🏀 ANCB — Backfill de Badges');
    console.log('================================\n');

    // 1. Busca todas as avaliações
    console.log('📥 Buscando avaliações em avaliacoes_gamified...');
    const reviewsSnap = await db.collection('avaliacoes_gamified').get();

    if (reviewsSnap.empty) {
        console.log('⚠️  Nenhuma avaliação encontrada. Encerrando.');
        return;
    }

    console.log(`   ${reviewsSnap.size} avaliações encontradas.\n`);

    // 2. Agrupa avaliações por jogador avaliado (targetId)
    const reviewsByTarget = {};
    for (const doc of reviewsSnap.docs) {
        const data = doc.data();
        const targetId = data.targetId;
        if (!targetId) continue;
        if (!reviewsByTarget[targetId]) reviewsByTarget[targetId] = [];
        reviewsByTarget[targetId].push(data);
    }

    const playerIds = Object.keys(reviewsByTarget);
    console.log(`👥 ${playerIds.length} jogador(es) com avaliações para processar.\n`);

    // 3. Processa cada jogador
    let totalBadgesAwarded = 0;
    let playersUpdated = 0;

    for (const playerId of playerIds) {
        const playerRef = db.collection('jogadores').doc(playerId);
        const playerSnap = await playerRef.get();

        if (!playerSnap.exists) {
            console.log(`   ⚠️  Jogador ${playerId} não encontrado no Firestore. Pulando.`);
            continue;
        }

        const playerData = playerSnap.data();
        const playerName = playerData.nome || playerId;
        const reviews = reviewsByTarget[playerId];

        // Recalcula stats do zero para garantir consistência
        const { statsTags, statsAtributos } = recalcStatsFromReviews(reviews);
        const currentBadges = playerData.badges || [];

        // Avalia novas badges
        const newBadgeDefs = evaluateNewBadges(currentBadges, statsTags, statsAtributos);

        if (newBadgeDefs.length === 0) {
            console.log(`   ✓  ${playerName}: nenhuma badge nova.`);
            continue;
        }

        const today = new Date().toISOString().split('T')[0];
        const newBadges = newBadgeDefs.map(def => ({
            id:        def.id,
            nome:      def.nome,
            emoji:     def.emoji,
            categoria: def.categoria,
            raridade:  def.raridade,
            descricao: def.descricao,
            data:      today,
        }));

        // Atualiza stats + adiciona badges em uma única operação
        await playerRef.update({
            stats_tags:       statsTags,
            stats_atributos:  statsAtributos,
            badges: admin.firestore.FieldValue.arrayUnion(...newBadges),
        });

        console.log(`   🏆 ${playerName}: ${newBadges.length} badge(s) concedida(s):`);
        for (const b of newBadges) {
            console.log(`      ${b.emoji}  ${b.nome} (${b.raridade})`);
        }

        // Notifica o jogador vinculado no app
        const usersSnap = await db.collection('usuarios')
            .where('linkedPlayerId', '==', playerId)
            .limit(1)
            .get();

        if (!usersSnap.empty) {
            const targetUserId = usersSnap.docs[0].id;
            for (const badge of newBadges) {
                const notifId = `badge_${targetUserId}_${badge.id}`;
                await db.collection('notifications').doc(notifId).set({
                    targetUserId,
                    type: 'evaluation',
                    title: `Nova conquista desbloqueada! ${badge.emoji}`,
                    message: `Você ganhou a conquista "${badge.nome}": ${badge.descricao}`,
                    data: { badgeId: badge.id },
                    read: false,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                }, { merge: true });
            }
            console.log(`      📲 Notificações enviadas para ${usersSnap.docs[0].data().nome || targetUserId}`);
        }

        totalBadgesAwarded += newBadges.length;
        playersUpdated++;
    }

    // 4. Resumo final
    console.log('\n================================');
    console.log(`✅ Backfill concluído!`);
    console.log(`   Jogadores atualizados : ${playersUpdated}`);
    console.log(`   Badges concedidas     : ${totalBadgesAwarded}`);
    console.log('================================\n');
}

main().catch(err => {
    console.error('\n❌ Erro fatal durante o backfill:', err);
    process.exit(1);
});
