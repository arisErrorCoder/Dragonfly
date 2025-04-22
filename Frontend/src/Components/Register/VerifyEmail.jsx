import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth, db, doc, setDoc } from './firebase';
import { FaCheckCircle, FaExclamationTriangle, FaArrowRight, FaRedo } from 'react-icons/fa';
import { motion } from 'framer-motion';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying your email...');
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const name = searchParams.get('name') || '';
        const response = await fetch(`https://api.hoteldragonfly.in/api/verify-email?token=${token}&name=${encodeURIComponent(name)}`);
        
        if (!response.ok) throw new Error('Invalid or expired verification link');
        
        const userData = await response.json();
        
        await setDoc(doc(db, 'users', token), {
          uid: token,
          email: userData.email,
          f_name: userData.name || '', // Now this will have the actual name
          acc_created: new Date(),
          lastLogin: new Date(),
          emailVerified: true,
          points_earned: 0,
          membership_tier: 'Basic'
        });
        
        setStatus('Email successfully verified!');
        setIsVerified(true);
        
        setTimeout(() => navigate('/login', { state: { verified: true } }), 3000);
        
      } catch (err) {
        setError(err.message);
        setStatus('');
      }
    };

    if (token) verifyEmail();
    else setError('No verification token provided');
  }, [token, navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f8f9fa'
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
        {status && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {!isVerified ? (
              <div style={{ padding: '30px 0' }}>
                <div style={{
                  display: 'inline-block',
                  width: '80px',
                  height: '80px',
                  border: '3px solid rgba(0,0,0,0.1)',
                  borderLeftColor: '#4CAF50',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '20px'
                }} />
                <h2 style={{ 
                  color: '#333',
                  marginBottom: '10px',
                  fontSize: 'clamp(1.2rem, 4vw, 1.5rem)'
                }}>
                  {status}
                </h2>
                <p style={{ color: '#666', fontSize: '1rem' }}>
                  Please wait while we verify your email address...
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <FaCheckCircle 
                  style={{ 
                    fontSize: '80px', 
                    color: '#4CAF50',
                    marginBottom: '20px'
                  }} 
                />
                <h2 style={{ 
                  color: '#333',
                  marginBottom: '15px',
                  fontSize: 'clamp(1.3rem, 4vw, 1.8rem)'
                }}>
                  All Set!
                </h2>
                <p style={{ 
                  color: '#666', 
                  marginBottom: '30px',
                  fontSize: '1rem'
                }}>
                  Your email has been successfully verified.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '12px 30px',
                    borderRadius: '30px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s',
                    ':hover': {
                      background: '#3e8e41',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Go to Login <FaArrowRight />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <FaExclamationTriangle 
              style={{ 
                fontSize: '80px', 
                color: '#f44336',
                marginBottom: '20px'
              }} 
            />
            <h2 style={{ 
              color: '#333',
              marginBottom: '10px',
              fontSize: 'clamp(1.3rem, 4vw, 1.8rem)'
            }}>
              Verification Failed
            </h2>
            <div style={{ 
              background: '#ffebee',
              color: '#d32f2f',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '25px',
              textAlign: 'left'
            }}>
              {error}
            </div>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '12px 25px',
                  borderRadius: '30px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Return to Login <FaArrowRight />
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: 'white',
                  color: '#333',
                  border: '1px solid #ddd',
                  padding: '12px 25px',
                  borderRadius: '30px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Try Again <FaRedo />
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 600px) {
          .card-container {
            padding: 30px 20px;
          }
          button {
            padding: 10px 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default VerifyEmail;