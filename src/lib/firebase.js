// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Optional: only try analytics in the browser
let getAnalyticsSafe = null;
try {
    // dynamic import so it won't break on SSR/build
    // @ts-ignore
    getAnalyticsSafe = (await import("firebase/analytics")).getAnalytics;
}
catch { /* ignore */ }
// Read from env (Vite requires VITE_* keys)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    // optional
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};
// Basic validation in dev
for (const [k, v] of Object.entries(firebaseConfig)) {
    if (!v)
        console.warn(`[firebase] Missing env ${k}`);
}
// Initialize once (prevents duplicate init on HMR)
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
// Core SDKs
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
// Optional analytics, guarded
if (typeof window !== "undefined" && getAnalyticsSafe) {
    try {
        getAnalyticsSafe(app);
    }
    catch { /* ignore */ }
}
