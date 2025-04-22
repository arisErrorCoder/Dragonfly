import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FaEnvelope, FaArrowRight, FaSignInAlt, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/send-reset-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          resetLink: `${import.meta.env.VITE_BACKEND_URL}/api/reset-password?token=${encodeURIComponent(data.email)}`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reset email');
      }

      setSuccess('Password reset link sent to your email!');
      setError('');
      
    } catch (err) {
      setError(err.message);
      setSuccess('');
    } finally {
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
          borderRadius: '16px',
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
            Reset Your Password
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
          
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#e8f5e9',
                color: '#2e7d32',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <FaCheckCircle /> {success}
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
                  Send Reset Link <FaArrowRight />
                </>
              )}
            </button>
          </form>
          
          <div style={{ 
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#666'
          }}>
            Remember your password?{' '}
            <Link to="/login" style={{
              color: '#4CAF50',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <FaSignInAlt /> Login
            </Link>
          </div>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 480px) {
          .forgot-container {
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

export default ForgotPassword;