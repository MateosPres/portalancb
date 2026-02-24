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
// ─────────────────────────────────────────────────────────────
exports.onGameFinished = functions.firestore
    .document('eventos/{eventId}/jogos/{gameId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const oldData = change.before.data();

        if (!newData || !oldData) return null;

        // Dispara APENAS na transição → finalizado
        const justFinished = oldData.status !== 'finalizado' && newData.status === 'finalizado';
        if (!justFinished) return null;

        const { eventId, gameId } = context.params;
        console.log(`Jogo ${gameId} finalizado no evento ${eventId}.`);

        const eventDoc = await admin.firestore().collection('eventos').doc(eventId).get();
        if (!eventDoc.exists) return null;
        const eventData = eventDoc.data();

        let ancbPlayerIds = [];

        // ── NOVO SISTEMA: timesParticipantes com flag isANCB ─────────────
        // Só notifica jogadores do time ANCB — eles avaliam os próprios colegas.
        // Times adversários não têm jogadores cadastrados no sistema.
        if (eventData.timesParticipantes && eventData.timesParticipantes.length > 0) {
            // Se o jogo tem IDs de times, filtra apenas o time ANCB que participou
            if (newData.timeA_id || newData.timeB_id) {
                const gameTeamIds = [newData.timeA_id, newData.timeB_id].filter(Boolean);
                const ancbTeam = eventData.timesParticipantes.find(t =>
                    t.isANCB && gameTeamIds.includes(t.id)
                );
                if (ancbTeam) {
                    ancbPlayerIds = ancbTeam.jogadores || [];
                    console.log(`Torneio externo (novo sistema): time ANCB "${ancbTeam.nomeTime}" com ${ancbPlayerIds.length} jogadores.`);
                } else {
                    console.log(`Jogo ${gameId} não envolve time ANCB. Quiz não enviado.`);
                    return null;
                }
            } else {
                // Sem ID de time no jogo — pega o único time ANCB do evento
                const ancbTeam = eventData.timesParticipantes.find(t => t.isANCB);
                if (ancbTeam) {
                    ancbPlayerIds = ancbTeam.jogadores || [];
                    console.log(`Time ANCB (fallback): ${ancbPlayerIds.length} jogadores.`);
                }
            }
        }
        // ── SISTEMA LEGADO: torneio interno com 'times' ──────────────────
        else if (eventData.times && eventData.times.length > 0 && newData.timeA_id && newData.timeB_id) {
            const timeA = eventData.times.find(t => t.id === newData.timeA_id);
            const timeB = eventData.times.find(t => t.id === newData.timeB_id);
            if (timeA) ancbPlayerIds.push(...(timeA.jogadores || []));
            if (timeB) ancbPlayerIds.push(...(timeB.jogadores || []));
            console.log(`Torneio interno (legado): ${ancbPlayerIds.length} jogadores dos dois times.`);
        }
        // ── SISTEMA LEGADO: amistoso com jogadoresEscalados ──────────────
        else {
            const gameRoster = (newData.jogadoresEscalados || []).map(extractPlayerId).filter(Boolean);
            const eventRoster = (eventData.jogadoresEscalados || []).map(extractPlayerId).filter(Boolean);
            ancbPlayerIds = gameRoster.length > 0 ? gameRoster : eventRoster;
            console.log(`Amistoso (legado): ${ancbPlayerIds.length} jogadores.`);
        }

        ancbPlayerIds = [...new Set(ancbPlayerIds.filter(Boolean))];

        if (ancbPlayerIds.length === 0) {
            console.log("Nenhum jogador ANCB encontrado. Verifique se o time está marcado como isANCB.");
            return null;
        }

        const eventName = eventData.nome || 'Evento';
        const scoreA = newData.placarTimeA_final ?? newData.placarANCB_final ?? 0;
        const scoreB = newData.placarTimeB_final ?? newData.placarAdversario_final ?? 0;
        const teamAName = newData.timeA_nome || 'ANCB';
        const teamBName = newData.timeB_nome || newData.adversario || 'Adversário';

        console.log(`Notificando ${ancbPlayerIds.length} jogadores ANCB sobre o quiz pós-jogo.`);

        const promises = ancbPlayerIds.map(playerId =>
            notifyPlayerQuizPosJogo(playerId, eventId, gameId, eventName, teamAName, scoreA, teamBName, scoreB)
        );

        return Promise.all(promises);
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
        const fcmToken = userData.fcmToken;
        if (!fcmToken) return;

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

        // Evita duplicatas: só cria se não existir notificação para este jogo
        const existingQuery = await admin.firestore().collection('notifications')
            .where('targetUserId', '==', targetUserId)
            .where('type', '==', 'pending_review')
            .where('data.gameId', '==', gameId)
            .get();

        if (!existingQuery.empty) {
            console.log(`Notificação de review já existe para jogador ${playerId} no jogo ${gameId}. Pulando.`);
            return;
        }

        await admin.firestore().collection('notifications').add({
            targetUserId: targetUserId,
            type: 'pending_review',
            title: notifTitle,
            message: notifBody,
            data: {
                eventId: eventId,
                gameId: gameId,
            },
            read: false,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
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
