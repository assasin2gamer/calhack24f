import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth"; // Import required functions
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Firebase project configuration object
const firebaseConfig = {
  apiKey: "AIzaSyBCDNqSl7Xuq_fBp6_HrXFCf9wKyrrlj_4",
  authDomain: "calhack-85b6f.firebaseapp.com",
  projectId: "calhack-85b6f",
  storageBucket: "calhack-85b6f.appspot.com",
  messagingSenderId: "736183828050",
  appId: "1:736183828050:web:730e3da5b06a1ba719e98b",
  measurementId: "G-B1DT52V9Y2"
};

// Initialize Firebase app (check if it has already been initialized)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
// Initialize Firebase Authentication and set persistence
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence) // Set persistence to local
  .then(() => {
    // Successfully set persistence
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });
  
const db = getFirestore(app);
const database = getDatabase(app);

// Export the Firebase services for use in other parts of your app
export { auth, db, database };
