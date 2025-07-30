import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithCustomToken } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Authentication function
export async function initializeAuth() {
  try {
    // Check if Firebase is properly configured
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID || !import.meta.env.VITE_FIREBASE_API_KEY) {
      throw new Error("Firebase configuration is missing. Please check your environment variables.");
    }

    // Check if custom token is available (from environment)
    const customToken = (window as any).__initial_auth_token;
    
    if (customToken) {
      await signInWithCustomToken(auth, customToken);
    } else {
      // Sign in anonymously for demo purposes
      await signInAnonymously(auth);
    }
    
    return auth.currentUser;
  } catch (error) {
    console.error("Authentication failed:", error);
    
    // For demo purposes, create a mock user if Firebase auth fails
    if ((error as any).code === 'auth/configuration-not-found' || 
        (error as any).code === 'auth/project-not-found') {
      console.warn("Firebase project not properly configured. Running in demo mode.");
      // Return a mock user for demo purposes
      return {
        uid: `demo-user-${Date.now()}`,
        isAnonymous: true,
        displayName: null,
        email: null
      };
    }
    
    throw error;
  }
}

export default app;
