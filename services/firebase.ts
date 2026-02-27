import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
// @ts-ignore - getReactNativePersistence is available in firebase/auth in newer versions for RN
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Replacment with Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDNr4gKWo9T5DVDt_K1kqvGLLZ2pGwDuig",
  authDomain: "thundergo-5595e.firebaseapp.com",
  projectId: "thundergo-5595e",
  storageBucket: "thundergo-5595e.firebasestorage.app",
  messagingSenderId: "146144405406",
  appId: "1:146144405406:web:69d7a5d2373da8892b188f",
  measurementId: "G-DZ26P8GHJL"
};

// Initialize Firebase safely for React Native Fast Refresh
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with AsyncStorage persistence to avoid the React Native warning
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);
