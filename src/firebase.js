// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: "sentiment-analysis-b7bdb.firebaseapp.com",
    projectId: "sentiment-analysis-b7bdb",
    storageBucket: "sentiment-analysis-b7bdb.firebasestorage.app",
    messagingSenderId: "112422031450",
    appId: "1:112422031450:web:1040c7a2a141dcb9c7c863",
    measurementId: "G-34K3T4ZNSX"
  };

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };
