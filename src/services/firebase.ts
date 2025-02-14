// Import the functions you need from the SDKs you need
import { getApps, getApp, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDCSymC60Ee0MIl0mDvO7eLyi3yQFknAuY",
  authDomain: "givemelove-9d9d2.firebaseapp.com",
  projectId: "givemelove-9d9d2",
  storageBucket: "givemelove-9d9d2.appspot.com",
  messagingSenderId: "766275632568",
  appId: "1:766275632568:web:1cd0a46243e9f9b65ee34d",
  measurementId: "G-P4WZBWWNPQ",
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
