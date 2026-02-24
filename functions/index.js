const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

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
// BUG CORRIGIDO: Não existia nenhuma função que escutasse o status
// dos jogos. O handleFinishGame atualiza eventos/{eventId}/jogos/{gameId},
// mas nenhuma Cloud Function respondia a essa mudança.
// Esta função detecta a transição para 'finalizado' e envia a
// notificação do quiz de avaliação para todos os jogadores escalados.
// ─────────────────────────────────────────────────────────────
exports.onGameFinished = functions.firestore
    .document('eventos/{eventId}/jogos/{gameId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const oldData = change.before.data();

        if (!newData || !oldData) return null;

        // Dispara APENAS na transição andamento → finalizado
        const justFinished = oldData.status !== 'finalizado' && newData.status === 'finalizado';
        if (!justFinished) return null;

        const { eventId, gameId } = context.params;

        console.log(`Jogo ${gameId} finalizado no evento ${eventId}. Buscando jogadores para notificar...`);

        // Busca o documento do evento para obter os times
        const eventDoc = await admin.firestore().collection('eventos').doc(eventId).get();
        if (!eventDoc.exists) return null;
        const eventData = eventDoc.data();

        // Monta a lista de IDs dos jogadores participantes da partida
        // Considera torneios internos (times com jogadores) e eventos simples
        let playerIds = [];

        if (newData.timeA_id && newData.timeB_id && eventData.times) {
            // Torneio interno: pega jogadores dos dois times
            const allTimes = eventData.times || [];
            const timeA = allTimes.find(t => t.id === newData.timeA_id);
            const timeB = allTimes.find(t => t.id === newData.timeB_id);
            if (timeA) playerIds.push(...(timeA.jogadores || []));
            if (timeB) playerIds.push(...(timeB.jogadores || []));
        } else if (eventData.type === 'torneio_externo' && eventData.timesParticipantes) {
            // Torneio externo
            const allTimes = eventData.timesParticipantes || [];
            const timeA = allTimes.find(t => t.id === newData.timeA_id);
            const timeB = allTimes.find(t => t.id === newData.timeB_id);
            if (timeA) playerIds.push(...(timeA.jogadores || []));
            if (timeB) playerIds.push(...(timeB.jogadores || []));
        } else {
            // Evento simples / amistoso: usa jogadoresEscalados do evento
            playerIds = (eventData.jogadoresEscalados || [])
                .map(extractPlayerId)
                .filter(Boolean);
        }

        // Remove duplicatas
        playerIds = [...new Set(playerIds)];

        if (playerIds.length === 0) {
            console.log("Nenhum jogador encontrado para notificar.");
            return null;
        }

        const eventName = eventData.nome || 'Evento';
        const scoreA = newData.placarTimeA_final ?? newData.placarANCB_final ?? 0;
        const scoreB = newData.placarTimeB_final ?? newData.placarAdversario_final ?? 0;
        const teamAName = newData.timeA_nome || 'Time A';
        const teamBName = newData.timeB_nome || newData.adversario || 'Time B';

        console.log(`Notificando ${playerIds.length} jogadores sobre o quiz pós-jogo.`);

        const promises = playerIds.map(playerId =>
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
        const fcmToken = userData.fcmToken;
        if (!fcmToken) return;

        const message = {
            token: fcmToken,
            notification: {
                title: "Partida encerrada! Avalie seus companheiros 🏆",
                body: `${teamAName} ${scoreA} x ${scoreB} ${teamBName} — Abra o app para avaliar o time!`
            },
            data: {
                type: "peer_review",
                eventId: eventId,
                gameId: gameId,
                url: "/"
            },
            android: {
                priority: "high",
                notification: {
                    priority: "max",
                    channelId: "ancb_alerts",
                    defaultSound: true,
                    defaultVibrateTimings: true,
                    color: '#F27405'
                }
            },
            webpush: {
                headers: { Urgency: "high" },
                fcm_options: { link: "/" }
            }
        };

        await admin.messaging().send(message);
        console.log(`✅ Notificação de quiz pós-jogo enviada para ${userData.nome}`);
    } catch (error) {
        console.error("Erro ao notificar jogador para quiz pós-jogo:", playerId, error);
    }
}
