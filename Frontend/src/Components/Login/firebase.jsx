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
  apiKey: "AIzaSyBxquheZnWbH5JY053hFWXoU5FbaIENNrE",
  authDomain: "dragonfly-958be.firebaseapp.com",
  projectId: "dragonfly-958be",
  storageBucket: "dragonfly-958be.appspot.com",
  messagingSenderId: "1019451778562",
  appId: "1:1019451778562:web:b72c595f7d82026d4d291b",
  measurementId: "G-9ZH3LGW52G"
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
