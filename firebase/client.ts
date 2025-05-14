import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA2_ZujiX5JpijpnzVGtwciwT56ZcTCGAA",
  authDomain: "preplens-470e3.firebaseapp.com",
  projectId: "preplens-470e3",
  storageBucket: "preplens-470e3.firebasestorage.app",
  messagingSenderId: "910522621876",
  appId: "1:910522621876:web:4b242da3c487a82fb29ce1",
  measurementId: "G-T4MX8EDVDQ"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);