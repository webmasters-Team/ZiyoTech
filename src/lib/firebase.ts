import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;
const missingConfigKeys = requiredConfigKeys.filter((key) => !firebaseConfig[key]);
const expectedAuthDomains = firebaseConfig.projectId
  ? [`${firebaseConfig.projectId}.firebaseapp.com`, `${firebaseConfig.projectId}.web.app`]
  : [];
const isFirebaseDefaultAuthDomain = /\.(?:firebaseapp\.com|web\.app)$/.test(firebaseConfig.authDomain || '');
const authDomainMismatch = Boolean(isFirebaseDefaultAuthDomain && expectedAuthDomains.length && !expectedAuthDomains.includes(firebaseConfig.authDomain));

export const isFirebaseConfigured = missingConfigKeys.length === 0 && !authDomainMismatch;
export const firebaseConfigIssue = missingConfigKeys.length
  ? `Missing Vite Firebase setting${missingConfigKeys.length === 1 ? '' : 's'}: ${missingConfigKeys.map((key) => `VITE_FIREBASE_${key.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase()}`).join(', ')}.`
  : authDomainMismatch
    ? 'VITE_FIREBASE_AUTH_DOMAIN does not match VITE_FIREBASE_PROJECT_ID. Copy the Web app configuration from the intended Firebase project.'
    : '';

export const firebaseApp: FirebaseApp | null = isFirebaseConfigured
  ? getApps().length
    ? getApps()[0]
    : initializeApp(firebaseConfig)
  : null;

export const db: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null;
export const auth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
