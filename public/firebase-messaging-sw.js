
/* public/firebase-messaging-sw.js */
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCZ2yeJJ34VwYAmQnFCEv72Q1uDFFGKKjQ",
    authDomain: "ancb-painel-db.firebaseapp.com",
    projectId: "ancb-painel-db",
    storageBucket: "ancb-painel-db.appspot.com",
    messagingSenderId: "792900234002",
    appId: "1:792900234002:web:2a37004deb046cb8f261cb",
    measurementId: "G-VCMEKP1XP4"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Isso lida com notificações quando o app está FECHADO/BACKGROUND
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Mensagem em background:', payload);
  
  // Customização da notificação quando o app está fechado
  // O título e corpo vêm do payload 'notification' enviado pelo servidor (functions)
  const notificationTitle = payload.notification?.title || 'Portal ANCB';
  const notificationOptions = {
    body: payload.notification?.body || 'Nova atualização disponível.',
    icon: 'https://i.imgur.com/SE2jHsz.png', // Ícone da notificação
    badge: 'https://i.imgur.com/SE2jHsz.png', // Ícone pequeno na barra de status (Android)
    data: { 
        url: payload.webpush?.fcm_options?.link || payload.data?.url || '/' 
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Evento de clique na notificação (Fundamental para abrir o PWA corretamente)
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  // URL para abrir ao clicar
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // 1. Se o app já estiver aberto em alguma aba, foca nele
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // Verifica se é a nossa origem
        if ('focus' in client) {
          return client.focus().then(c => {
              // Opcional: Navegar para a página específica se suportado
              if ('navigate' in c) return c.navigate(urlToOpen);
          });
        }
      }
      // 2. Se não estiver aberto, abre uma nova janela/aba do PWA
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
