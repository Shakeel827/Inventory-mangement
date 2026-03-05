import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD5ArVO8mhkCFoxx8sCshhORnOMb-e7e1A",
  authDomain: "inventory-f8f66.firebaseapp.com",
  projectId: "inventory-f8f66",
  storageBucket: "inventory-f8f66.firebasestorage.app",
  messagingSenderId: "31361110076",
  appId: "1:31361110076:web:01a72dde18ac85d885b339",
  measurementId: "G-BJ80YDN06X"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
