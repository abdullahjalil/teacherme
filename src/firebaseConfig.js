// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Import Firebase Authentication

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-BrrAGmo-DxC6hk7o9fcvogKnGtghY9w",
  authDomain: "teacherme-8a198.firebaseapp.com",
  projectId: "teacherme-8a198",
  storageBucket: "teacherme-8a198.firebasestorage.app",
  messagingSenderId: "360961247213",
  appId: "1:360961247213:web:a0ce5725d6fd024b1649e4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Firestore instance
const auth = getAuth(app); // Authentication instance

// Export Firestore and Authentication
export { db, auth };
