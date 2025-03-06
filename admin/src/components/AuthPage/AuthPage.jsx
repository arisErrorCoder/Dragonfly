import React, { useState } from 'react';
import "./AuthPage.css"
const AuthPage = ({ onLogin }) => {
  // State to handle form inputs and error messages
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Sample credentials for validation
  const SAMPLE_USER = import.meta.env.VITE_ADMIN_USER;
  const SAMPLE_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

  const handleLogin = () => {
    // Validate username and password
    if (username === SAMPLE_USER && password === SAMPLE_PASSWORD) {
      setError('');
      onLogin(); // Call the onLogin function to proceed
    } else {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="login-container">
        <div className="auth-page">
      <h2>Login</h2>
      <div style={{ marginBottom: '10px' }}>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            style={{ display: 'block', width: '100%', marginBottom: '10px' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            style={{ display: 'block', width: '100%', marginBottom: '10px' }}
          />
        </label>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button
        onClick={handleLogin}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '10px 15px',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '5px',
        }}
      >
        Login
      </button>
    </div>
    </div>

  );
};

export default AuthPage;
