
// Scripts for firebase messaging
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing the generated config
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

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://i.imgur.com/SE2jHsz.png', // ANCB Icon
    badge: 'https://i.imgur.com/SE2jHsz.png' // Small icon for notification bar
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
