// Importamos las funciones necesarias de los paquetes que instalaste
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- AQUÍ PEGAS TUS CREDENCIALES ---
// (Cópialas de la consola de Firebase que tienes abierta)
const firebaseConfig = {
  apiKey: "AIzaSyCdX1Kv-keUPAMM3UIKZ9aKFjJquWuEDIM",
  authDomain: "gastro-link-pro.firebaseapp.com",
  projectId: "gastro-link-pro",
  storageBucket: "gastro-link-pro.firebasestorage.app",
  messagingSenderId: "140163963348",
  appId: "1:140163963348:web:3214fa8863f001e6da1e41"
};

// Inicializamos la conexión
const app = initializeApp(firebaseConfig);

// Exportamos las herramientas para usarlas en App.jsx
export const auth = getAuth(app);
export const db = getFirestore(app);