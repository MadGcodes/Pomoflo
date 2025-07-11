// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAUDMB6iSzvVPwWF-p9XVenKyK25nfHwWY",
  authDomain: "pomofloapp.firebaseapp.com",
  projectId: "pomofloapp",
  storageBucket: "pomofloapp.firebasestorage.app",
  messagingSenderId: "215036742837",
  appId: "1:215036742837:web:799eb9aaefb93a34d182fc",
  measurementId: "G-5829F4FTHL"
};

// Initialize Firebaexport se
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB= getFirestore(FIREBASE_APP);
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);
