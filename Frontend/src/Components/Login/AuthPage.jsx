import React, { useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  sendEmailVerification,
  fireDB,
} from './firebase';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AuthPage.css';
import { collection, addDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from || '/myaccount';

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);

  
  // Error states
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rePasswordError, setRePasswordError] = useState('');

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.emailVerified) {
        navigate(redirectPath, { replace: true });
      } else if (user && !user.emailVerified) {
        auth.signOut();
        toast.error('Please verify your email before logging in.');
      }
    });
    return () => unsubscribe();
  }, [navigate, redirectPath]);

  // Sign in with Google
  const handleSignInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user.emailVerified) {
        auth.signOut();
        toast.error('Please verify your Google email first.');
        return;
      }

      await saveUserToDB(user);
      toast.success('Successfully signed in with Google!');
      navigate(redirectPath, { replace: true });
    } catch (error) {
      toast.error('Error during Google sign-in.');
    }
  };

  // Handle sign-in
  const handleSignIn = async (e) => {
    e.preventDefault();
    resetErrors();

    if (!validateSignInFields()) return;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        auth.signOut();
        toast.error('Please verify your email before logging in.');
        return;
      }

      await saveUserToDB(user);
      toast.success('Logged in successfully.');
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setEmailError('Login failed. Please check your email and password.');
    }
  };

  // Handle sign-up
  const handleSignUp = async (e) => {
    e.preventDefault();
    resetErrors();

    if (!validateSignUpFields()) return;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);
      auth.signOut();
      toast.success('Verification email sent. Please verify before logging in.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setEmailError('Error signing up. Please try again.');
    }
  };

  // Handle password reset
  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!email) {
      setEmailError('Email is required.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
      setForgotPassword(false);
    } catch (error) {
      setEmailError('Error sending password reset email.');
    }
  };

  // Save user to Firestore
  const saveUserToDB = async (user, userName = name) => {
    const usersCollectionRef = collection(fireDB, 'users');
    const q = query(usersCollectionRef, where('uid', '==', user.uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      await addDoc(usersCollectionRef, {
        uid: user.uid,
        points_earned: 0,
        acc_created: new Date(),
        f_name: userName || user.displayName || '',  // Storing user's name (either from Google or entered)
        email: user.email,
        lastLogin: new Date(),
        membership_tier: 'Basic',
        firstLogin: true,
      });
    } else {
      await Promise.all(
        querySnapshot.docs.map((doc) =>
          updateDoc(doc.ref, { lastLogin: new Date() })
        )
      );
    }
  };

  // Validate sign-in fields
  const validateSignInFields = () => {
    if (!email) {
      setEmailError('Email is required.');
      return false;
    }
    if (!password) {
      setPasswordError('Password is required.');
      return false;
    }
    return true;
  };

  // Validate sign-up fields
  const validateSignUpFields = () => {
    if (!name) {
      setNameError('Name is required.');
      return false;
    }
    if (!email) {
      setEmailError('Email is required.');
      return false;
    }
    if (!password) {
      setPasswordError('Password is required.');
      return false;
    }
    if (password !== rePassword) {
      setRePasswordError('Passwords do not match.');
      return false;
    }
    return true;
  };

  // Reset error states
  const resetErrors = () => {
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setRePasswordError('');
  };

  return (
    <div className="auth-container">
      <ToastContainer />
      {!isSignUp && !forgotPassword && (
        <form className="auth-form column gp-1" onSubmit={handleSignIn}>
          <h4>Login</h4>
          <button type="button" className="secondary" onClick={handleSignInWithGoogle}>
            Sign in with Google
          </button>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {emailError && <small className="error">{emailError}</small>}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {passwordError && <small className="error">{passwordError}</small>}
          <button className="primary" type="submit">
            Continue
          </button>
          <small onClick={() => setForgotPassword(true)}>Forgot Password?</small>
          <small onClick={() => setIsSignUp(true)}>Create an account</small>
        </form>
      )}

      {isSignUp && !forgotPassword && (
        <form className="auth-form column gp-1" onSubmit={handleSignUp}>
          <h4>Sign Up</h4>
          <button type="button" className="secondary" onClick={handleSignInWithGoogle}>
            Sign up with Google
          </button>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {nameError && <small className="error">{nameError}</small>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {emailError && <small className="error">{emailError}</small>}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {passwordError && <small className="error">{passwordError}</small>}
          <input
            type="password"
            placeholder="Re-enter Password"
            value={rePassword}
            onChange={(e) => setRePassword(e.target.value)}
          />
          {rePasswordError && <small className="error">{rePasswordError}</small>}
          <button className="primary" type="submit">
            Create Account
          </button>
          <small onClick={() => setIsSignUp(false)}>Sign In</small>
        </form>
      )}

      {forgotPassword && (
        <form className="auth-form column gp-1" onSubmit={handlePasswordReset}>
          <h4>Reset Password</h4>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {emailError && <small className="error">{emailError}</small>}
          <button className="primary" type="submit">
            Send Reset Link
          </button>
          <small onClick={() => setForgotPassword(false)}>Back to Login</small>
        </form>
      )}
    </div>
  );
};

export default AuthPage;
