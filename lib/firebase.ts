import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  type Auth,
  onAuthStateChanged
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Log config (without sensitive values)
console.log('Firebase Config Status:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  hasStorageBucket: !!firebaseConfig.storageBucket,
  hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
  hasAppId: !!firebaseConfig.appId,
  hasMeasurementId: !!firebaseConfig.measurementId,
});

// Validate Firebase config
const requiredFields = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
] as const;

const missingFields = requiredFields.filter(
  (field) => !firebaseConfig[field]
);

if (missingFields.length > 0) {
  console.error(
    'Missing required Firebase configuration fields:',
    missingFields.join(', ')
  );
}

// Initialize Firebase
let app;
let db;
let auth: Auth | null;
let provider;
let storage;
let analytics;

try {
  // Initialize Firebase app
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  console.log('Firebase app initialized:', app.name);
  
  // Initialize Firebase services
  db = getFirestore(app);
  console.log('Firestore initialized');
  
  auth = getAuth(app);
  console.log('Firebase Auth initialized');
  
  provider = new GoogleAuthProvider();
  console.log('Google Auth Provider initialized');

  storage = getStorage(app);
  console.log('Firebase Storage initialized');

  // Initialize Analytics if supported
  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log('Firebase Analytics initialized');
      } else {
        console.log('Firebase Analytics not supported in this environment');
      }
    });
  }

  // Set persistence (so user stays logged in even after refresh)
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('Firebase Auth persistence set to LOCAL');
    })
    .catch((error) => {
      console.error("Firebase Auth Persistence Error:", error);
    });

  // Check initial auth state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('User is signed in:', user.uid);
    } else {
      console.log('No user is signed in');
    }
  });

  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Initialize with empty objects to prevent undefined errors
  app = null;
  db = null;
  auth = null;
  provider = null;
  storage = null;
  analytics = null;
}

export { db, auth, provider, storage, analytics };
