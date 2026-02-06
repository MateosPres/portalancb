
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * 1. MONITOR DE CONVOCAÇÕES
 * Dispara quando um documento na coleção 'eventos' é atualizado.
 * Verifica se novos jogadores foram adicionados ao array 'jogadoresEscalados'.
 */
exports.sendRosterNotification = functions.firestore
    .document('eventos/{eventId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const oldData = change.before.data();

        const newRoster = newData.jogadoresEscalados || [];
        const oldRoster = oldData.jogadoresEscalados || [];

        // Filtra apenas os IDs que não estavam na lista anterior
        const addedPlayers = newRoster.filter(playerId => !oldRoster.includes(playerId));

        if (addedPlayers.length === 0) return null;

        console.log(`Novos jogadores escalados no evento ${newData.nome}:`, addedPlayers);

        const promises = [];

        // Para cada jogador adicionado, buscamos o usuário vinculado para pegar o Token FCM
        for (const playerId of addedPlayers) {
            const p = dbSearchUserByPlayerId(playerId, newData.nome, context.params.eventId);
            promises.push(p);
        }

        return Promise.all(promises);
    });

/**
 * 2. MONITOR DE NOTIFICAÇÕES DIRETAS
 * Dispara quando um documento é criado na coleção 'notifications'.
 * Usado para avisos de fim de jogo, avaliações pendentes, etc.
 */
exports.sendDirectNotification = functions.firestore
    .document('notifications/{notificationId}')
    .onCreate(async (snap, context) => {
        const data = snap.data();
        const targetUserId = data.targetUserId;

        if (!targetUserId) return null;

        try {
            // Busca o token do usuário alvo
            const userDoc = await admin.firestore().collection('usuarios').doc(targetUserId).get();
            
            if (!userDoc.exists) return null;
            
            const userData = userDoc.data();
            const fcmToken = userData.fcmToken;

            if (!fcmToken) {
                console.log(`Usuário ${targetUserId} não tem token FCM cadastrado.`);
                return null;
            }

            // Payload da notificação
            const payload = {
                notification: {
                    title: data.title || "Portal ANCB",
                    body: data.message || "Você tem uma nova notificação.",
                    // O ícone deve ser uma URL pública (HTTPS)
                    icon: 'https://i.imgur.com/SE2jHsz.png' 
                },
                data: {
                    type: data.type || "general",
                    eventId: data.eventId || "",
                    gameId: data.gameId || "",
                    url: "/" // PWA abre na home e o frontend trata o resto
                },
                token: fcmToken
            };

            return admin.messaging().send(payload);

        } catch (error) {
            console.error("Erro ao enviar notificação direta:", error);
            return null;
        }
    });

// --- FUNÇÕES AUXILIARES ---

async function dbSearchUserByPlayerId(playerId, eventName, eventId) {
    try {
        // Procura na coleção 'usuarios' quem tem o linkedPlayerId igual ao playerId escalado
        const usersRef = admin.firestore().collection('usuarios');
        const querySnapshot = await usersRef.where('linkedPlayerId', '==', playerId).get();

        if (querySnapshot.empty) {
            console.log(`Nenhum usuário vinculado ao jogador ${playerId}`);
            return;
        }

        // Pode haver inconsistência de dados, mas assumimos 1 usuário por player
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const fcmToken = userData.fcmToken;

        if (!fcmToken) return;

        const payload = {
            notification: {
                title: "Você foi convocado! 🏀",
                body: `Sua presença é aguardada no evento: ${eventName}`,
                icon: 'https://i.imgur.com/SE2jHsz.png'
            },
            data: {
                type: "roster_alert",
                eventId: eventId,
                click_action: "FLUTTER_NOTIFICATION_CLICK" // Padrão para web/pwa
            },
            token: fcmToken
        };

        await admin.messaging().send(payload);
        console.log(`Notificação enviada para ${userData.nome}`);

    } catch (error) {
        console.error("Erro no processamento do player:", playerId, error);
    }
}
