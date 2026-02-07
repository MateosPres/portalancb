
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * 1. MONITOR DE CONVOCAÇÕES
 */
exports.sendRosterNotification = functions.firestore
    .document('eventos/{eventId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const oldData = change.before.data();

        if (!newData || !oldData) return null;

        const newRoster = newData.jogadoresEscalados || [];
        const oldRoster = oldData.jogadoresEscalados || [];

        const addedPlayers = newRoster.filter(playerId => !oldRoster.includes(playerId));

        if (addedPlayers.length === 0) return null;

        console.log(`Novos jogadores escalados no evento ${newData.nome}:`, addedPlayers);

        const promises = [];

        for (const playerId of addedPlayers) {
            const p = dbSearchUserByPlayerId(playerId, newData.nome, context.params.eventId);
            promises.push(p);
        }

        return Promise.all(promises);
    });

/**
 * 2. MONITOR DE NOTIFICAÇÕES DIRETAS
 */
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
                    headers: {
                        Urgency: "high"
                    },
                    fcm_options: {
                        link: "/"
                    }
                }
            };

            return admin.messaging().send(message);

        } catch (error) {
            console.error("Erro ao enviar notificação direta:", error);
            return null;
        }
    });

/**
 * 3. ADMIN RESET PASSWORD (Callable)
 * Permite que administradores resetem a senha de um usuário para 'ancb1234'
 */
exports.adminResetPassword = functions.https.onCall(async (data, context) => {
    // Verificar autenticação
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'O usuário deve estar logado.');
    }

    const callerUid = context.auth.uid;
    const targetUid = data.targetUid;

    // Verificar se quem chama é admin
    const callerDoc = await admin.firestore().collection('usuarios').doc(callerUid).get();
    if (!callerDoc.exists || callerDoc.data().role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem resetar senhas.');
    }

    try {
        await admin.auth().updateUser(targetUid, {
            password: 'ancb1234'
        });
        return { success: true, message: 'Senha resetada para "ancb1234"' };
    } catch (error) {
        console.error("Erro ao resetar senha:", error);
        throw new functions.https.HttpsError('internal', 'Erro ao resetar senha.', error);
    }
});

async function dbSearchUserByPlayerId(playerId, eventName, eventId) {
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
                headers: {
                    Urgency: "high"
                },
                fcm_options: {
                    link: "/"
                }
            }
        };

        await admin.messaging().send(message);
        console.log(`Notificação enviada para ${userData.nome}`);

    } catch (error) {
        console.error("Erro no processamento do player:", playerId, error);
    }
}
