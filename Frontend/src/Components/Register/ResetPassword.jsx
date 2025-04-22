import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from './firebase';
import { useForm } from 'react-hook-form';
import { FaKey, FaCheckCircle, FaArrowRight, FaExclamationTriangle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('token');
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validLink, setValidLink] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      setError('Invalid reset link');
      return;
    }
    setValidLink(true);
  }, [email]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: decodeURIComponent(email),
          newPassword: data.password
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }

      setSuccess('Password reset successfully! Redirecting to login...');
      setError('');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
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
        {!validLink ? (
          <div style={{ padding: '20px 0' }}>
            <FaExclamationTriangle style={{ fontSize: '50px', color: '#f44336', marginBottom: '20px' }} />
            <h2 style={{ color: '#333', marginBottom: '10px' }}>{error || 'Validating reset link...'}</h2>
            {error && (
              <button
                onClick={() => navigate('/forgot-password')}
                style={{
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '12px 25px',
                  borderRadius: '30px',
                  marginTop: '20px',
                  cursor: 'pointer'
                }}
              >
                Request New Link
              </button>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <FaKey style={{ fontSize: '50px', color: '#4CAF50', marginBottom: '20px' }} />
            <h1 style={{ 
              color: '#333',
              marginBottom: '30px',
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              fontWeight: '600'
            }}>
              Reset Your Password
            </h1>
            
            {error && (
              <div style={{
                background: '#ffebee',
                color: '#d32f2f',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '0.9rem'
              }}>
                {error}
              </div>
            )}
            
            {success && (
              <div style={{
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
              }}>
                <FaCheckCircle /> {success}
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} style={{ marginBottom: '30px' }}>
              <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                <label style={{ 
                  display: 'block',
                  marginBottom: '8px',
                  color: '#555',
                  fontWeight: '500'
                }}>
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
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
                    transition: 'all 0.3s'
                  }}
                  placeholder="Enter new password"
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
              
              <div style={{ marginBottom: '25px', textAlign: 'left' }}>
                <label style={{ 
                  display: 'block',
                  marginBottom: '8px',
                  color: '#555',
                  fontWeight: '500'
                }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => 
                      value === document.getElementById('password').value || 'Passwords do not match'
                  })}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    border: `1px solid ${errors.confirmPassword ? '#f44336' : '#ddd'}`,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'all 0.3s'
                  }}
                  placeholder="Confirm new password"
                />
                {errors.confirmPassword && (
                  <span style={{ 
                    color: '#f44336',
                    fontSize: '0.8rem',
                    marginTop: '5px',
                    display: 'block'
                  }}>
                    {errors.confirmPassword.message}
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
                    Reset Password <FaArrowRight />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </motion.div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 480px) {
          .reset-container {
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

export default ResetPassword;