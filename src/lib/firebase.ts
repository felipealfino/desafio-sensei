// src/lib/firebase.ts
// Inicialização do Firebase para o projeto Desafio Sensei.
// Exporta auth e db para serem usados em todo o app.

import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCq6I1POW-MCPeV3ibgc8g0m0EyZtiYu4g",
  authDomain: "desafio-sensei.firebaseapp.com",
  projectId: "desafio-sensei",
  storageBucket: "desafio-sensei.firebasestorage.app",
  messagingSenderId: "251819023420",
  appId: "1:251819023420:web:3f26c3da336a90459f3739",
  measurementId: "G-9T8XTT66WP",
};

// Evita reinicializar o app em hot-reload do Next.js
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
