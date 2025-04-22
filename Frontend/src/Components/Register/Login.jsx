import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { auth, signInWithEmailAndPassword, signInWithPopup, googleProvider, db, doc, setDoc } from './firebase';
import { useForm } from 'react-hook-form';
import { FcGoogle } from 'react-icons/fc';
import { FaSignInAlt, FaEnvelope, FaLock, FaUserPlus, FaQuestionCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/myaccount';
  const bookingData = location.state?.bookingData;  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      if (!userCredential.user.emailVerified) {
        setError('Please verify your email before logging in');
        await auth.signOut();
        setIsLoading(false);
        return;
      }
      
      // Redirect to the original path (checkout) after login
      navigate(from, { state: { bookingData } });
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        f_name: user.displayName || '',
        acc_created: new Date(),
        lastLogin: new Date(),
        points_earned: 0,
        membership_tier: 'Basic'
      }, { merge: true });
      
      // Redirect to the original path (checkout) after login
      navigate(from, { state: { bookingData } });
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: '500px',
          background: 'white',
          borderRadius: '5px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          padding: '40px',
          textAlign: 'center'
        }}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 style={{ 
            color: '#333',
            marginBottom: '30px',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: '600'
          }}>
            Welcome Back
          </h1>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#ffebee',
                color: '#d32f2f',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '0.9rem'
              }}
            >
              {error}
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} style={{ marginBottom: '30px' }}>
            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <label style={{ 
                display: 'block',
                marginBottom: '8px',
                color: '#555',
                fontWeight: '500'
              }}>
                <FaEnvelope style={{ marginRight: '8px' }} />
                Email Address
              </label>
              <input
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: `1px solid ${errors.email ? '#f44336' : '#ddd'}`,
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.3s',
                  ':focus': {
                    borderColor: '#4CAF50',
                    boxShadow: '0 0 0 2px rgba(76, 175, 80, 0.2)'
                  }
                }}
                placeholder="your@email.com"
              />
              {errors.email && (
                <span style={{ 
                  color: '#f44336',
                  fontSize: '0.8rem',
                  marginTop: '5px',
                  display: 'block'
                }}>
                  {errors.email.message}
                </span>
              )}
            </div>
            
            <div style={{ marginBottom: '25px', textAlign: 'left' }}>
              <label style={{ 
                display: 'block',
                marginBottom: '8px',
                color: '#555',
                fontWeight: '500'
              }}>
                <FaLock style={{ marginRight: '8px' }} />
                Password
              </label>
              <input
                type="password"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: `1px solid ${errors.password ? '#f44336' : '#ddd'}`,
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.3s',
                  ':focus': {
                    borderColor: '#4CAF50',
                    boxShadow: '0 0 0 2px rgba(76, 175, 80, 0.2)'
                  }
                }}
                placeholder="••••••••"
              />
              {errors.password && (
                <span style={{ 
                  color: '#f44336',
                  fontSize: '0.8rem',
                  marginTop: '5px',
                  display: 'block'
                }}>
                  {errors.password.message}
                </span>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.3s',
                opacity: isLoading ? 0.7 : 1,
                ':hover': {
                  background: '#3e8e41',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {isLoading ? (
                <div style={{
                  display: 'inline-block',
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              ) : (
                <>
                  <FaSignInAlt /> Login
                </>
              )}
            </button>
          </form>
          
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '25px',
            fontSize: '0.9rem'
          }}>
            <Link to="/forgot-password" style={{
              color: '#666',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              ':hover': {
                color: '#4CAF50'
              }
            }}>
              <FaQuestionCircle /> Forgot Password?
            </Link>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '25px'
          }}>
            <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
            <span style={{ 
              padding: '0 15px', 
              color: '#999',
              fontSize: '0.9rem'
            }}>
              OR
            </span>
            <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
          </div>
          
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            style={{
              width: '100%',
              background: 'white',
              color: '#333',
              border: '1px solid #ddd',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s',
              marginBottom: '20px',
              ':hover': {
                borderColor: '#4285F4',
                transform: 'translateY(-2px)'
              }
            }}
          >
            <FcGoogle size={20} /> Continue with Google
          </button>
          
          <div style={{ 
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#666'
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{
              color: '#4CAF50',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <FaUserPlus /> Register
            </Link>
          </div>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 480px) {
          .login-container {
            padding: 30px 20px;
          }
          button, input {
            padding: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;