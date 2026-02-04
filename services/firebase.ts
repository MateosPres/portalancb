import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Using the config provided in your original JS file
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
export const storage = getStorage(app);