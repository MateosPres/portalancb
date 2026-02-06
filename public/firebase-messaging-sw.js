
// Scripts for firebase messaging
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

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

// Handler para quando o app está em background/fechado
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensagem recebida em background:', payload);
  
  // Se o payload já tiver "notification", o navegador exibe automaticamente.
  // Se tiver apenas "data" ou se quisermos forçar/customizar:
  if (!payload.notification) {
      const notificationTitle = payload.data?.title || 'Portal ANCB';
      const notificationOptions = {
        body: payload.data?.body || payload.data?.message || 'Nova notificação',
        icon: 'https://i.imgur.com/SE2jHsz.png',
        badge: 'https://i.imgur.com/SE2jHsz.png',
        data: payload.data // Passa os dados para o evento de clique
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
  }
});

// Handler para o clique na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Tenta abrir a URL específica ou a raiz
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se já houver uma aba aberta, foca nela
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus().then(c => {
              if (c && 'navigate' in c) return c.navigate(urlToOpen);
          });
        }
      }
      // Se não, abre uma nova
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
