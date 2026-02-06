
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

const firebaseConfig = { 
    apiKey: "AIzaSyCZ2yeJJ34VwYAmQnFCEv72Q1uDFFGKKjQ", 
    authDomain: "ancb-painel-db.firebaseapp.com", 
    projectId: "ancb-painel-db", 
    storageBucket: "ancb-painel-db.appspot.com", 
    messagingSenderId: "792900234002", 
    appId: "1:792900234002:web:2a37004deb046cb8f261cb", 
    measurementId: "G-VCMEKP1XP4" 
};

const app = firebase.initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = app.auth();
export const storage = getStorage(app);

// --- MESSAGING SETUP ---
let messaging: Messaging | null = null;

try {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        messaging = getMessaging(app);
    }
} catch (error) {
    console.warn("Firebase Messaging not supported in this environment", error);
}

export const requestFCMToken = async (vapidKey: string): Promise<string | null> => {
    if (!messaging) return null;
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            // Tenta obter o registro do Service Worker ativo (gerado pelo Vite PWA)
            // Isso evita o erro 404 ao tentar buscar 'firebase-messaging-sw.js' se ele não estiver na pasta public/dist
            const serviceWorkerRegistration = await navigator.serviceWorker.ready;
            
            const token = await getToken(messaging, { 
                vapidKey,
                serviceWorkerRegistration
            });
            return token;
        } else {
            console.log("Notification permission denied");
            return null;
        }
    } catch (error: any) {
        // Se falhar o Push nativo, o app ainda funcionará com notificações internas
        if (error.name === 'AbortError' || error.message?.includes('push service error')) {
            console.warn("Navegador bloqueou o serviço de push nativo. Usando notificações in-app apenas.");
        } else {
            console.error("Erro ao recuperar token FCM:", error);
        }
        return null;
    }
};

/**
 * Listener para mensagens em primeiro plano (App aberto)
 * @param callback Função executada ao receber uma mensagem
 */
export const onMessageListener = (callback: (payload: any) => void) => {
    if (!messaging) return () => {};
    return onMessage(messaging, (payload) => {
        callback(payload);
    });
};

export { messaging };
