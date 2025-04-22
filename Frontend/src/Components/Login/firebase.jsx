import { 
    initializeApp 
  } from 'firebase/app';
  import { 
    getFirestore 
  } from 'firebase/firestore';
  import { 
    getAuth, 
    GoogleAuthProvider, 
    RecaptchaVerifier, 
    signInWithPhoneNumber, 
    signInWithPopup, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail,
    sendEmailVerification // Import sendEmailVerification
  } from 'firebase/auth';
  import { 
    getStorage 
  } from 'firebase/storage';
  
  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };
  
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  
  // Initialize Firestore, Auth, and Storage instances
  const fireDB = getFirestore(app);
  const auth = getAuth(app);
  const storage = getStorage(app);
  
  // Initialize Google Auth Provider
  const googleProvider = new GoogleAuthProvider();
  
  // Initialize RecaptchaVerifier for phone authentication
  const initializeRecaptcha = (containerId) => {
    if (!auth.currentUser) {
      return new RecaptchaVerifier(containerId, {}, auth);
    }
    console.warn("ReCAPTCHA verifier can only be initialized before a user is signed in.");
  };
  
  // Export the initialized instances and functions
  export { 
    auth, 
    fireDB, 
    storage, 
    googleProvider, 
    signInWithPhoneNumber, 
    signInWithPopup, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail, 
    sendEmailVerification, // Export sendEmailVerification
    initializeRecaptcha 
  };