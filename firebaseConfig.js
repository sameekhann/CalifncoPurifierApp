
import { initializeApp, getApp, getApps } from "firebase/app";
import { initializeAuth, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
    apiKey: "AIzaSyCMMKlSWixlM6PVxgWGPIU3piU3lTv8GPQ",
    authDomain: "califnco-8858e.firebaseapp.com",
  projectId: "califnco-8858e",
  storageBucket: "califnco-8858e.firebasestorage.app",
  messagingSenderId: "520203085264",
  appId: "1:520203085264:web:070631550ca5b7599905d5",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };
