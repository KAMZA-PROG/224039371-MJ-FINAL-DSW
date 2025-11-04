// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGTa_eOsbpQfW09FryWlZ7QIrPZncv6W8",
  authDomain: "elbookingapp.firebaseapp.com",
  projectId: "elbookingapp",
  storageBucket: "elbookingapp.appspot.com", // ✅ Corrected
  messagingSenderId: "297705419931",
  appId: "1:297705419931:web:e474bfc4e3982aaa0e023e"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app); // For Authentication
export const db = getFirestore(app); // For Firestore database
