// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase Project Configuration
// à¸„à¸¸à¸“à¹à¸¡à¹ˆ/à¸„à¸¸à¸“à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰à¸•à¹‰à¸­à¸‡à¸™à¸³à¸„à¹ˆà¸²à¹€à¸«à¸¥à¹ˆà¸²à¸™à¸µà¹‰à¸¡à¸²à¸ˆà¸²à¸ Firebase Console > Project Settings
const firebaseConfig = {
 apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCsUptC9WX1r4liXxH7VZr3mvNCoNmzCSA",
 authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "pregnancy-journal-162ba.firebaseapp.com",
 projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "pregnancy-journal-162ba",
 storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "pregnancy-journal-162ba.firebasestorage.app",
 messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1043423196908",
 appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1043423196908:web:8e931a62f6df4ba6fdd7c9",
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
const db = getFirestore(app);

export { app, db };
