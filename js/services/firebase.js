// js/services/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

const firebaseConfig = { 
    apiKey: "AIzaSyCZ2yeJJ34VwYAmQnFCEv72Q1uDFFGKKjQ", 
    authDomain: "ancb-painel-db.firebaseapp.com", 
    projectId: "ancb-painel-db", 
    storageBucket: "ancb-painel-db.appspot.com", 
    messagingSenderId: "792900234002", 
    appId: "1:792900234002:web:2a37004deb046cb8f261cb", 
    measurementId: "G-VCMEKP1XP4" 
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);