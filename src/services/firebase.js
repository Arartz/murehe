import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAJ-IrYXx9tt9YVviERe4zCRBH42MF9LbY",
  authDomain: "jsms-d310a.firebaseapp.com",
  projectId: "jsms-d310a",
  storageBucket: "jsms-d310a.firebasestorage.app",
  messagingSenderId: "876157415063",
  appId: "1:876157415063:web:9af4b5d369770695afc3d2",
  measurementId: "G-8M0H0J2VMB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, firebaseConfig };
