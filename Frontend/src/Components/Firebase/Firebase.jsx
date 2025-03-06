// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxquheZnWbH5JY053hFWXoU5FbaIENNrE",
  authDomain: "dragonfly-958be.firebaseapp.com",
  projectId: "dragonfly-958be",
  storageBucket: "dragonfly-958be.appspot.com",
  messagingSenderId: "1019451778562",
  appId: "1:1019451778562:web:b72c595f7d82026d4d291b",
  measurementId: "G-9ZH3LGW52G"
};

// // Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firestore, Auth, and Storage instances
const fireDB = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Initialize RecaptchaVerifier for phone authentication
const initializeRecaptcha = (containerId) => {
  return new RecaptchaVerifier(containerId, {}, auth);
};

export { auth, fireDB, storage, googleProvider, signInWithPhoneNumber, initializeRecaptcha };