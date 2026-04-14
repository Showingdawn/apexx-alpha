import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAD3E_gkicJpwIcdFMjTg8BX-3_rCSZYDU",
  authDomain: "apexalpha-8a183.firebaseapp.com",
  projectId: "apexalpha-8a183",
  storageBucket: "apexalpha-8a183.firebasestorage.app",
  messagingSenderId: "1026491521140",
  appId: "1:1026491521140:web:5a76a8f83278fe642a1921",
  measurementId: "G-EKE9H4EW6N"
};

// Initialize Firebase securely for Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
