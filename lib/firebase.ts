import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDaOgdPUJ_kCh20ftL6Y2miGHF8635D5S4",
  authDomain: "fabricated-fabrics.firebaseapp.com",
  projectId: "fabricated-fabrics",
  storageBucket: "fabricated-fabrics.firebasestorage.app",
  messagingSenderId: "125223154941",
  appId: "1:125223154941:web:2485c0a78e8ec53dee7a94",
  measurementId: "G-GYW7J4T4KW"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };