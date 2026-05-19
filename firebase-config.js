// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Deine Firebase Konfiguration
const firebaseConfig = {
    apiKey: "AIzaSyCbmujSc6VCM8Mwv_LPuRrqHx4l0dECwKo",
    authDomain: "waifuranking.firebaseapp.com",
    projectId: "waifuranking",
    storageBucket: "waifuranking.firebasestorage.app",
    messagingSenderId: "202367937537",
    appId: "1:202367937537:web:7765277d6b9dc71e112400"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);

// Datenbank exportieren, damit auth.js und admin.js darauf zugreifen können
export const db = getFirestore(app);