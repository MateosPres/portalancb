const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// ─────────────────────────────────────────────────────────────
// ÍNDICE FIRESTORE NECESSÁRIO:
// Para a query de deduplicação de notificações funcionar, crie
// um índice composto na coleção 'notifications' com os campos:
//   targetUserId (Ascending) + type (Ascending) + data.gameId (Ascending)
// O Firebase vai mostrar o link para criar automaticamente nos
// logs do Functions na primeira execução — clique nele!
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// HELPER: Extrai o ID de um item do roster (string ou objeto)
// ─────────────────────────────────────────────────────────────
function extractPlayerId(entry) {
    if (typeof entry === 'string') return entry;
    if (entry && typeof entry === 'object' && entry.id) return entry.id;
    return null;
}

// ─────────────────────────────────────────────────────────────
// 1. MONITOR DE CONVOCAÇÕES
//
// BUG CORRIGIDO: O roster do evento pode conter strings OU objetos
// {id, numero}. A comparação anterior com .includes() falhava quando
// os itens eram objetos, causando o reenvio da notificação a cada
// update no documento do evento (ex: ao iniciar o jogo).
// Agora extraímos sempre o ID antes de comparar.
// ─────────────────────────────────────────────────────────────
exports.sendRosterNotification = functions.firestore
    .document('eventos/{eventId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const oldData = change.before.data();

        if (!newData || !oldData) return null;

        // Normaliza ambos os rosters para arrays de IDs (string)
        const newRosterIds = (newData.jogadoresEscalados || [])
            .map(extractPlayerId)
            .filter(Boolean);

        const oldRosterIds = (oldData.jogadoresEscalados || [])
            .map(extractPlayerId)
            .filter(Boolean);

        // Apenas jogadores realmente novos (não existiam no roster anterior)
        const addedPlayerIds = newRosterIds.filter(id => !oldRosterIds.includes(id));

        if (addedPlayerIds.length === 0) return null;

        console.log(`Novos jogadores escalados no evento "${newData.nome}":`, addedPlayerIds);

        const promises = addedPlayerIds.map(playerId =>
            notifyPlayerConvocado(playerId, newData.nome, context.params.eventId)
        );

        return Promise.all(promises);
    });

// ─────────────────────────────────────────────────────────────
// 2. MONITOR DE FIM DE PARTIDA → Quiz de Avaliação
//
// ATUALIZADO: Novo sistema usa timesParticipantes com flag isANCB.
// O quiz só é enviado para jogadores do time ANCB — eles avaliam
// apenas os colegas do próprio time. Times adversários externos
// não têm jogadores cadastrados e são ignorados.
//
// PROTEÇÃO CONTRA DUPLICATAS: Usa um timestamp 'notificationSentAt'
// para garantir que notificações sejam enviadas apenas uma vez,
// mesmo que o documento seja atualizado múltiplas vezes.
// ─────────────────────────────────────────────────────────────
exports.onGameFinished = functions.firestore
    .document('eventos/{eventId}/jogos/{gameId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const oldData = change.before.data();

        if (!newData || !oldData) return null;

        // PROTEÇÃO: Se já foi enviada notificação, não reenviar
        // Verifica se o campo 'notificationSentAt' já existe
        if (newData.notificationSentAt) {
            console.log(`Notificações já foram enviadas para o jogo ${context.params.gameId}. Pulando.`);
            return null;
        }

        // Dispara APENAS na transição → finalizado
        const justFinished = oldData.status !== 'finalizado' && newData.status === 'finalizado';
        if (!justFinished) return null;

        const { eventId, gameId } = context.params;
        console.log(`Jogo ${gameId} finalizado no evento ${eventId}.`);

        const eventDoc = await admin.firestore().collection('eventos').doc(eventId).get();
        if (!eventDoc.exists) return null;
        const eventData = eventDoc.data();

        const scoreA = newData.placarTimeA_final ?? newData.placarANCB_final ?? 0;
        const scoreB = newData.placarTimeB_final ?? newData.placarAdversario_final ?? 0;
        const teamAName = newData.timeA_nome || 'ANCB';
        const teamBName = newData.timeB_nome || newData.adversario || 'Adversário';

        await upsertAutoGameFeedPost(eventId, gameId, eventData, newData, teamAName, scoreA, teamBName, scoreB);

        let ancbPlayerIds = [];
        const gameTeamIds = [newData.timeA_id, newData.timeB_id].filter(Boolean);

        // 1) Modelo novo (torneio_externo e internos evoluídos): timesParticipantes + isANCB
        if (eventData.timesParticipantes && eventData.timesParticipantes.length > 0) {
            const participantTeams = gameTeamIds.length > 0
                ? eventData.timesParticipantes.filter(t => gameTeamIds.includes(t.id))
                : eventData.timesParticipantes;

            // Mantém a regra atual do externo e habilita múltiplos times ANCB/parceiros
            // para interno quando aplicável.
            const ancbTeams = participantTeams.filter(t => t.isANCB);

            if (ancbTeams.length === 0) {
                console.log(`Jogo ${gameId} sem time ANCB participante. Quiz não enviado.`);
                return null;
            }

            ancbTeams.forEach(team => {
                ancbPlayerIds.push(...(team.jogadores || []));
            });

            console.log(`Modelo timesParticipantes: ${ancbTeams.length} time(s) ANCB, ${ancbPlayerIds.length} jogador(es).`);
        }
        // 2) Modelo legado interno: times
        else if (eventData.times && eventData.times.length > 0) {
            if (gameTeamIds.length > 0) {
                const participantTeams = eventData.times.filter(t => gameTeamIds.includes(t.id));
                participantTeams.forEach(team => ancbPlayerIds.push(...(team.jogadores || [])));
                console.log(`Torneio interno (times): ${ancbPlayerIds.length} jogador(es) dos times da partida.`);
            } else {
                // fallback seguro
                eventData.times.forEach(team => ancbPlayerIds.push(...(team.jogadores || [])));
                console.log(`Torneio interno (fallback): ${ancbPlayerIds.length} jogador(es).`);
            }
        }
        // 3) Modelo amistoso/legado: roster por jogo ou por evento
        else {
            const gameRoster = (newData.jogadoresEscalados || []).map(extractPlayerId).filter(Boolean);
            const eventRoster = (eventData.jogadoresEscalados || []).map(extractPlayerId).filter(Boolean);
            ancbPlayerIds = gameRoster.length > 0 ? gameRoster : eventRoster;

            // Fallback robusto: roster em subcoleção (com status) quando arrays legados estiverem vazios
            if (ancbPlayerIds.length === 0) {
                const rosterSnap = await admin.firestore().collection('eventos').doc(eventId).collection('roster').get();
                if (!rosterSnap.empty) {
                    ancbPlayerIds = rosterSnap.docs
                        .filter(d => {
                            const status = d.data()?.status;
                            return status !== 'recusado';
                        })
                        .map(d => d.id)
                        .filter(Boolean);
                }
            }

            console.log(`Amistoso/legado: ${ancbPlayerIds.length} jogador(es) no roster.`);
        }

        ancbPlayerIds = [...new Set(ancbPlayerIds.filter(Boolean))];

        if (ancbPlayerIds.length === 0) {
            console.log("Nenhum jogador ANCB encontrado. Verifique se o time está marcado como isANCB.");
            return null;
        }

        const eventName = eventData.nome || 'Evento';

        console.log(`Notificando ${ancbPlayerIds.length} jogadores ANCB sobre o quiz pós-jogo.`);

        const promises = ancbPlayerIds.map(playerId =>
            notifyPlayerQuizPosJogo(playerId, eventId, gameId, eventName, teamAName, scoreA, teamBName, scoreB)
        );

        await Promise.all(promises);

        // MARCA QUE NOTIFICAÇÕES FORAM ENVIADAS - Previne reenvios
        await admin.firestore().collection('eventos').doc(eventId).collection('jogos').doc(gameId)
            .update({ notificationSentAt: admin.firestore.FieldValue.serverTimestamp() });

        return null;
    });

// ─────────────────────────────────────────────────────────────
// 2.1 AUTO POST: RESULTADO DE EVENTO FINALIZADO
// ─────────────────────────────────────────────────────────────
exports.onEventFinishedCreatePost = functions.firestore
    .document('eventos/{eventId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const oldData = change.before.data();

        if (!newData || !oldData) return null;
        if (oldData.status === 'finalizado' || newData.status !== 'finalizado') return null;

        const eventId = context.params.eventId;
        const postId = `auto_event_${eventId}`;
        const eventTypeLabel = newData.type === 'torneio_interno'
            ? 'Torneio Interno'
            : (newData.type === 'torneio_externo' ? 'Torneio Externo' : 'Amistoso');

        let resumo = `${newData.nome || 'Evento'} foi finalizado.`;
        if (newData.podio && (newData.podio.primeiro || newData.podio.segundo || newData.podio.terceiro)) {
            resumo = [
                `🏁 ${newData.nome || 'Evento'} finalizado!`,
                `🥇 ${newData.podio.primeiro || '---'}`,
                `🥈 ${newData.podio.segundo || '---'}`,
                `🥉 ${newData.podio.terceiro || '---'}`
            ].join('\n');
        }

        await admin.firestore().collection('feed_posts').doc(postId).set({
            type: 'resultado_evento',
            source: 'auto_event_finalized',
            source_ref: `event:${eventId}`,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            author_id: 'system',
            image_url: null,
            content: {
                titulo: `Resultado do Evento: ${newData.nome || 'Evento'}`,
                resumo,
                eventId,
                resultado_label: eventTypeLabel,
                resultado_detalhes: `${newData.nome || 'Evento'} • ${newData.data || ''}`,
            }
        }, { merge: true });

        return null;
    });

// ─────────────────────────────────────────────────────────────
// 2.2 AVISOS: FAN-OUT OPCIONAL PARA JOGADORES
// ─────────────────────────────────────────────────────────────
exports.onAvisoPostCreated = functions.firestore
    .document('feed_posts/{postId}')
    .onCreate(async (snap, context) => {
        const data = snap.data() || {};
        if (data.type !== 'aviso' || !data.notifyPlayers) return null;

        const usuariosSnap = await admin.firestore().collection('usuarios')
            .where('role', '==', 'jogador')
            .where('status', '==', 'active')
            .get();

        if (usuariosSnap.empty) return null;

        const titulo = data?.content?.titulo || 'Novo Aviso';
        const resumo = data?.content?.resumo || 'Você recebeu um novo aviso no Portal ANCB.';
        const postId = context.params.postId;

        const writes = usuariosSnap.docs.map((userDoc) => {
            const notifId = `aviso_${postId}_${userDoc.id}`;
            return admin.firestore().collection('notifications').doc(notifId).set({
                targetUserId: userDoc.id,
                type: 'feed_alert',
                title: `📣 ${titulo}`,
                message: resumo,
                data: { postId, type: 'aviso' },
                read: false,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
        });

        await Promise.all(writes);
        return null;
    });

// ─────────────────────────────────────────────────────────────
// 3. MONITOR DE NOTIFICAÇÕES DIRETAS (sem alterações)
// ─────────────────────────────────────────────────────────────
exports.sendDirectNotification = functions.firestore
    .document('notifications/{notificationId}')
    .onCreate(async (snap, context) => {
        const data = snap.data();
        const targetUserId = data.targetUserId;

        if (!targetUserId) return null;

        try {
            const userDoc = await admin.firestore().collection('usuarios').doc(targetUserId).get();
            if (!userDoc.exists) return null;

            const userData = userDoc.data();
            const fcmToken = userData.fcmToken;

            if (!fcmToken) {
                console.log(`Usuário ${targetUserId} não tem token FCM cadastrado.`);
                return null;
            }

            const message = {
                token: fcmToken,
                notification: {
                    title: data.title || "Portal ANCB",
                    body: data.message || "Você tem uma nova notificação.",
                },
                data: {
                    type: data.type || "general",
                    eventId: data.eventId || "",
                    gameId: data.gameId || "",
                    url: "/"
                },
                android: {
                    priority: "high",
                    notification: {
                        priority: "max",
                        channelId: "ancb_alerts",
                        defaultSound: true,
                        defaultVibrateTimings: true,
                        icon: 'stock_ticker_update',
                        color: '#F27405'
                    }
                },
                webpush: {
                    headers: { Urgency: "high" },
                    fcm_options: { link: "/" }
                }
            };

            return admin.messaging().send(message);
        } catch (error) {
            console.error("Erro ao enviar notificação direta:", error);
            return null;
        }
    });

// ─────────────────────────────────────────────────────────────
// 4. ADMIN RESET PASSWORD (sem alterações)
// ─────────────────────────────────────────────────────────────
exports.adminResetPassword = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'O usuário deve estar logado.');
    }

    const callerUid = context.auth.uid;
    const targetUid = data.targetUid;

    const callerDoc = await admin.firestore().collection('usuarios').doc(callerUid).get();
    const callerRole = callerDoc.exists ? callerDoc.data().role : null;
    if (!callerDoc.exists || (callerRole !== 'admin' && callerRole !== 'super-admin')) {
        throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem resetar senhas.');
    }

    try {
        await admin.auth().updateUser(targetUid, { password: 'ancb1234' });
        return { success: true, message: 'Senha resetada para "ancb1234"' };
    } catch (error) {
        console.error("Erro ao resetar senha:", error);
        throw new functions.https.HttpsError('internal', 'Erro ao resetar senha.', error);
    }
});

// ─────────────────────────────────────────────────────────────
// 5. SISTEMA DE CONQUISTAS (BADGES)
//
// Disparado quando um evento é marcado como 'finalizado'.
// Calcula conquistas baseadas em performance real:
//   - Pódio (campeão, vice, 3º lugar)
//   - Participação no evento
//   - Artilheiro do evento
//   - Cestinha / Máquina de Pontos (por jogo)
//   - Cestas de 3 (acumulado no evento)
//
// IDs de badge são únicos por evento (ex: campiao_jogos_abertos_2025)
// para que o jogador possa acumular a mesma conquista em eventos diferentes.
//
// PROTEÇÃO: Campo 'badgesAwardedAt' previne reprocessamento.
// ─────────────────────────────────────────────────────────────

exports.onEventFinishedAwardBadges = functions.firestore
    .document('eventos/{eventId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const oldData = change.before.data();

        if (!newData || !oldData) return null;

        // Só dispara na transição → finalizado
        const justFinished = oldData.status !== 'finalizado' && newData.status === 'finalizado';
        if (!justFinished) return null;

        // Proteção contra reprocessamento
        if (newData.badgesAwardedAt) {
            console.log(`Badges já foram processadas para o evento ${context.params.eventId}. Pulando.`);
            return null;
        }

        const eventId = context.params.eventId;
        const eventName = newData.nome || 'Evento';
        const eventSlug = eventName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');

        console.log(`🏆 Iniciando distribuição de badges para evento: ${eventName} (${eventId})`);

        // ── 1. Resolve todos os jogadores ANCB do evento ─────────
        let allAncbPlayerIds = [];

        if (newData.timesParticipantes && newData.timesParticipantes.length > 0) {
            newData.timesParticipantes
                .filter(t => t.isANCB)
                .forEach(t => allAncbPlayerIds.push(...(t.jogadores || [])));
        } else if (newData.times && newData.times.length > 0) {
            newData.times.forEach(t => allAncbPlayerIds.push(...(t.jogadores || [])));
        } else {
            allAncbPlayerIds = (newData.jogadoresEscalados || []).map(extractPlayerId).filter(Boolean);
        }

        allAncbPlayerIds = [...new Set(allAncbPlayerIds.filter(Boolean))];

        if (allAncbPlayerIds.length === 0) {
            console.log('Nenhum jogador ANCB encontrado no evento. Encerrando.');
            return null;
        }

        console.log(`   ${allAncbPlayerIds.length} jogador(es) ANCB encontrados.`);

        // ── 2. Busca todos os jogos e cestas do evento ───────────
        const jogosSnap = await admin.firestore()
            .collection('eventos').doc(eventId).collection('jogos').get();

        // Mapas: playerId → totalPontos, totalPontos3pts, maxPontosJogo
        const pontosNoEvento = {};   // total de pontos no evento
        const cestas3NoEvento = {};  // total de cestas de 3 no evento
        const maxPontosJogo = {};    // maior pontuação em um único jogo

        for (const jogoDoc of jogosSnap.docs) {
            const cestasSnap = await admin.firestore()
                .collection('eventos').doc(eventId)
                .collection('jogos').doc(jogoDoc.id)
                .collection('cestas').get();

            // Pontos por jogador neste jogo
            const pontosNesteJogo = {};

            for (const cestaDoc of cestasSnap.docs) {
                const cesta = cestaDoc.data();
                const pid = cesta.jogadorId;
                if (!pid || !allAncbPlayerIds.includes(pid)) continue;

                const pts = Number(cesta.pontos) || 0;

                pontosNoEvento[pid]  = (pontosNoEvento[pid]  || 0) + pts;
                pontosNesteJogo[pid] = (pontosNesteJogo[pid] || 0) + pts;

                if (pts === 3) {
                    cestas3NoEvento[pid] = (cestas3NoEvento[pid] || 0) + 1;
                }
            }

            // Atualiza máximo por jogo
            for (const [pid, pts] of Object.entries(pontosNesteJogo)) {
                if (pts > (maxPontosJogo[pid] || 0)) {
                    maxPontosJogo[pid] = pts;
                }
            }
        }

        // ── 3. Determina artilheiro ───────────────────────────────
        let artilheiroId = null;
        let maxPontos = 0;
        for (const [pid, pts] of Object.entries(pontosNoEvento)) {
            if (pts > maxPontos) { maxPontos = pts; artilheiroId = pid; }
        }

        // ── 4. Resolve times do pódio ─────────────────────────────
        // podio: { primeiro: nomeTime, segundo: nomeTime, terceiro: nomeTime }
        const podio = newData.podio || {};

        const resolvePodioPLayerIds = (nomeTime) => {
            if (!nomeTime) return [];
            // Tenta casar pelo nome em timesParticipantes ou times
            const allTimes = newData.timesParticipantes || newData.times || [];
            const time = allTimes.find(t =>
                t.nomeTime?.toLowerCase().trim() === nomeTime.toLowerCase().trim()
            );
            return (time?.jogadores || []).filter(pid => allAncbPlayerIds.includes(pid));
        };

        const campeaoIds   = resolvePodioPLayerIds(podio.primeiro);
        const viceIds      = resolvePodioPLayerIds(podio.segundo);
        const terceiroIds  = resolvePodioPLayerIds(podio.terceiro);

        // ── 5. Monta badges para cada jogador ─────────────────────
        const today = new Date().toISOString().split('T')[0];

        const buildBadge = (id, nome, emoji, raridade, categoria, descricao) => ({
            id, nome, emoji, raridade, categoria, descricao, data: today,
        });

        // Mapa: playerId → Badge[]
        const badgesByPlayer = {};
        const add = (pid, badge) => {
            if (!badgesByPlayer[pid]) badgesByPlayer[pid] = [];
            badgesByPlayer[pid].push(badge);
        };

        for (const pid of allAncbPlayerIds) {
            // Estava Lá
            add(pid, buildBadge(
                `estava_la_${eventSlug}`,
                `Estava Lá (${eventName})`,
                '🏀', 'comum', 'partida',
                `Participou do evento ${eventName}.`
            ));

            // Pódio
            if (campeaoIds.includes(pid)) {
                add(pid, buildBadge(`campiao_${eventSlug}`,  `Campeão (${eventName})`, '🏆', 'epica', 'temporada', `Integrou o time campeão do evento ${eventName}.`));
            } else if (viceIds.includes(pid)) {
                add(pid, buildBadge(`vice_${eventSlug}`,     `Vice (${eventName})`,    '🥈', 'rara',  'temporada', `Integrou o time vice-campeão do evento ${eventName}.`));
            } else if (terceiroIds.includes(pid)) {
                add(pid, buildBadge(`podio_${eventSlug}`,    `Pódio (${eventName})`,   '🥉', 'rara',  'temporada', `Integrou o time que ficou em 3º lugar no evento ${eventName}.`));
            }

            // Cestinha (artilheiro do evento)
            if (pid === artilheiroId && maxPontos > 0) {
                add(pid, buildBadge(`cestinha_ev_${eventSlug}`, `Cestinha (${eventName})`, '👑', 'rara', 'partida', `Maior pontuador do evento ${eventName} com ${maxPontos} pontos.`));
            }

            // Bola Quente / Imparável (por jogo)
            const melhorJogo = maxPontosJogo[pid] || 0;
            if (melhorJogo >= 20) {
                add(pid, buildBadge(`imparavel_${eventSlug}`,   `Imparável (${eventName})`,   '☄️', 'rara',  'partida', `Marcou 20+ pontos em um único jogo no evento ${eventName}.`));
            } else if (melhorJogo >= 10) {
                add(pid, buildBadge(`bola_quente_${eventSlug}`, `Bola Quente (${eventName})`, '💥', 'comum', 'partida', `Marcou 10+ pontos em um único jogo no evento ${eventName}.`));
            }

            // Cestas de 3
            const total3 = cestas3NoEvento[pid] || 0;
            if (total3 >= 5) {
                add(pid, buildBadge(`atirador_elite_${eventSlug}`, `Mira Calibrada (${eventName})`,  '🎯', 'epica', 'partida', `Converteu 5+ cestas de 3 pontos no evento ${eventName}.`));
            } else if (total3 >= 3) {
                add(pid, buildBadge(`atirador_${eventSlug}`,       `Mão Quente (${eventName})`,      '👌', 'rara',  'partida', `Converteu 3+ cestas de 3 pontos no evento ${eventName}.`));
            } else if (total3 >= 1) {
                add(pid, buildBadge(`primeira_bomba_${eventSlug}`, `Tiro Certo (${eventName})`,      '🏹', 'comum', 'partida', `Converteu uma cesta de 3 pontos no evento ${eventName}.`));
            }
        }

        // ── 6. Salva badges e notifica cada jogador ───────────────
        let totalConcedidas = 0;

        for (const [pid, newBadges] of Object.entries(badgesByPlayer)) {
            if (!newBadges.length) continue;

            // Lê badges atuais para evitar duplicatas
            const playerSnap = await admin.firestore().collection('jogadores').doc(pid).get();
            if (!playerSnap.exists) continue;

            const existingIds = new Set((playerSnap.data().badges || []).map(b => b.id));
            const toAdd = newBadges.filter(b => !existingIds.has(b.id));
            if (!toAdd.length) continue;

            await admin.firestore().collection('jogadores').doc(pid).update({
                badges: admin.firestore.FieldValue.arrayUnion(...toAdd),
            });

            totalConcedidas += toAdd.length;
            console.log(`   ✅ ${playerSnap.data().nome || pid}: ${toAdd.map(b => b.emoji + b.nome).join(', ')}`);

            // Notifica o usuário vinculado
            const usersSnap = await admin.firestore().collection('usuarios')
                .where('linkedPlayerId', '==', pid).limit(1).get();

            if (!usersSnap.empty) {
                const targetUserId = usersSnap.docs[0].id;
                for (const badge of toAdd) {
                    const notifId = `badge_${targetUserId}_${badge.id}`;
                    await admin.firestore().collection('notifications').doc(notifId).set({
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

        // Marca como processado
        await admin.firestore().collection('eventos').doc(eventId)
            .update({ badgesAwardedAt: admin.firestore.FieldValue.serverTimestamp() });

        console.log(`\n🏆 ${totalConcedidas} badge(s) concedida(s) no evento ${eventName}.`);
        return null;
    });



// ─────────────────────────────────────────────────────────────
// HELPERS PRIVADOS
// ─────────────────────────────────────────────────────────────

/**
 * Envia notificação de convocação para um jogador.
 */
async function notifyPlayerConvocado(playerId, eventName, eventId) {
    try {
        const usersRef = admin.firestore().collection('usuarios');
        const querySnapshot = await usersRef.where('linkedPlayerId', '==', playerId).get();

        if (querySnapshot.empty) {
            console.log(`Nenhum usuário vinculado ao jogador ${playerId}`);
            return;
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const targetUserId = userDoc.id;
        const fcmToken = userData.fcmToken;

        const notifId = `roster_alert_${targetUserId}_${eventId}`;
        await admin.firestore().collection('notifications').doc(notifId).set({
            targetUserId,
            type: 'roster_alert',
            title: 'Você foi convocado! 🏀',
            message: `Sua presença é aguardada no evento: ${eventName}`,
            data: { eventId },
            read: false,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        if (!fcmToken) {
            console.log(`Jogador ${userData.nome} sem token FCM — convocação registrada no painel.`);
            return;
        }

        const message = {
            token: fcmToken,
            notification: {
                title: "Você foi convocado! 🏀",
                body: `Sua presença é aguardada no evento: ${eventName}`
            },
            data: {
                type: "roster_alert",
                eventId: eventId,
                url: "/"
            },
            android: {
                priority: "high",
                notification: {
                    priority: "max",
                    channelId: "ancb_alerts",
                    defaultSound: true,
                    color: '#F27405'
                }
            },
            webpush: {
                headers: { Urgency: "high" },
                fcm_options: { link: "/" }
            }
        };

        await admin.messaging().send(message);
        console.log(`✅ Notificação de convocação enviada para ${userData.nome}`);
    } catch (error) {
        console.error("Erro ao notificar jogador convocado:", playerId, error);
    }
}

/**
 * Envia notificação de quiz pós-jogo para um jogador.
 * Busca o usuário pelo linkedPlayerId e envia via FCM.
 */
async function notifyPlayerQuizPosJogo(playerId, eventId, gameId, eventName, teamAName, scoreA, teamBName, scoreB) {
    try {
        const usersRef = admin.firestore().collection('usuarios');
        const querySnapshot = await usersRef.where('linkedPlayerId', '==', playerId).get();

        if (querySnapshot.empty) {
            console.log(`Nenhum usuário vinculado ao jogador ${playerId} para quiz pós-jogo`);
            return;
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const targetUserId = userDoc.id;

        const notifTitle = "Avalie seus companheiros! 🏆";
        const notifBody = `${teamAName} ${scoreA} x ${scoreB} ${teamBName} — Partida de ${eventName} encerrada.`;

        // ─────────────────────────────────────────────────────────────
        // CORREÇÃO PRINCIPAL: Cria documento na coleção 'notifications'
        // Isso garante que a notificação aparece no painel do portal
        // independente de FCM, token ou estado do app.
        // ─────────────────────────────────────────────────────────────

        // Evita duplicatas: usa ID único em vez de query composta
        // Formato: pending_review_{userId}_{gameId}
        const deduplicationKey = `pending_review_${targetUserId}_${gameId}`;
        const notificationRef = admin.firestore().collection('notifications').doc(deduplicationKey);
        
        const existingDoc = await notificationRef.get();
        if (existingDoc.exists) {
            console.log(`Notificação de review já existe para jogador ${playerId} no jogo ${gameId}. Pulando.`);
            return;
        }

        await notificationRef.set({
            targetUserId: targetUserId,
            type: 'pending_review',
            title: notifTitle,
            message: notifBody,
            data: {
                eventId: eventId,
                gameId: gameId,
            },
            read: false,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            deduplicationKey: deduplicationKey
        });

        console.log(`✅ Notificação pending_review criada no Firestore para ${userData.nome}`);

        // Push FCM: envia push se o jogador tiver token (bônus — não é crítico)
        const fcmToken = userData.fcmToken;
        if (fcmToken) {
            const deepLinkUrl = `/?action=review&gameId=${gameId}&eventId=${eventId}`;
            const message = {
                token: fcmToken,
                notification: { title: notifTitle, body: notifBody },
                data: { type: "peer_review", eventId: eventId, gameId: gameId, url: deepLinkUrl },
                android: {
                    priority: "high",
                    notification: { priority: "max", channelId: "ancb_alerts", defaultSound: true, defaultVibrateTimings: true, color: '#F27405' }
                },
                webpush: { headers: { Urgency: "high" }, fcm_options: { link: deepLinkUrl } }
            };
            try {
                await admin.messaging().send(message);
                console.log(`✅ Push FCM enviado para ${userData.nome}`);
            } catch (fcmError) {
                console.warn(`⚠️ Push FCM falhou para ${userData.nome} (token expirado?):`, fcmError.message);
            }
        } else {
            console.log(`Jogador ${userData.nome} sem token FCM — notificação só no painel.`);
        }

    } catch (error) {
        console.error("Erro ao notificar jogador para quiz pós-jogo:", playerId, error);
    }
}

async function upsertAutoGameFeedPost(eventId, gameId, eventData, gameData, teamAName, scoreA, teamBName, scoreB) {
    try {
        const postId = `auto_game_${eventId}_${gameId}`;
        const eventName = eventData?.nome || 'Evento';
        const gameDate = gameData?.dataJogo || eventData?.data || '';

        await admin.firestore().collection('feed_posts').doc(postId).set({
            type: 'placar',
            source: 'auto_game_finalized',
            source_ref: `event:${eventId}:game:${gameId}`,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            author_id: 'system',
            image_url: null,
            content: {
                titulo: `${eventName} • ${teamAName} x ${teamBName}`,
                time_adv: teamBName,
                placar_ancb: Number(scoreA) || 0,
                placar_adv: Number(scoreB) || 0,
                eventId,
                gameId,
                teamAName,
                teamBName,
                resultado_detalhes: gameDate ? `${eventName} • ${gameDate}` : eventName,
            }
        }, { merge: true });
    } catch (error) {
        console.error(`Erro ao criar post automático de placar para jogo ${gameId}:`, error);
    }
}
