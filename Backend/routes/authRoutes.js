const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

const db = admin.firestore();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const generateToken = () => crypto.randomBytes(32).toString('hex');

// Email Verification Endpoints
router.post('/send-verification', async (req, res) => {
    try {
      const { email, name, password } = req.body;
      const token = generateToken();
      
      // Create temporary user record in Firestore
      const userRef = db.collection('temp_users').doc(); // Use temp_users collection
      await userRef.set({
        email,
        name,
        password, // Store temporarily (encrypt in production)
        verificationToken: token,
        verificationTokenCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
  
      const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}&userId=${userRef.id}&password=${encodeURIComponent(password)}`;
  
      await transporter.sendMail({
        from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Verify Your Email Address',
        html: `...verification email template... ${verificationLink}`
      });
  
      res.json({ success: true });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  });
  router.get('/verify-email', async (req, res) => {
    try {
      const { token, userId, password } = req.query;
  
      if (!token || !userId) {
        return res.status(400).json({
          success: false,
          message: 'Missing verification parameters'
        });
      }
  
      // Check in both collections (temp_users first, then users)
      let userRef = db.collection('temp_users').doc(userId);
      let userDoc = await userRef.get();
      let isTempUser = true;
  
      if (!userDoc.exists) {
        userRef = db.collection('users').doc(userId);
        userDoc = await userRef.get();
        isTempUser = false;
        
        if (!userDoc.exists) {
          return res.status(400).json({
            success: false,
            message: 'Invalid verification link - account not found'
          });
        }
      }
  
      const userData = userDoc.data();
  
      // Verify token
      if (!userData.verificationToken || userData.verificationToken !== token) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification token'
        });
      }
  
      // Check token expiration (24 hours)
      if (userData.verificationTokenCreatedAt) {
        const tokenExpired = Date.now() - userData.verificationTokenCreatedAt.toDate() > 86400000;
        if (tokenExpired) {
          await userRef.update({
            verificationToken: null,
            verificationTokenCreatedAt: null
          });
          return res.status(400).json({
            success: false,
            message: 'Verification link has expired'
          });
        }
      }
  
      // Handle Firebase Auth user
      try {
        const authUser = await admin.auth().getUser(userId);
        
        if (!authUser.emailVerified) {
          await admin.auth().updateUser(userId, {
            emailVerified: true
          });
        }
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          await admin.auth().createUser({
            uid: userId,
            email: userData.email,
            emailVerified: true,
            password: password,
            displayName: userData.name || ''
          });
        } else {
          throw error;
        }
      }
  
      // If this was a temp user, move to permanent collection
      if (isTempUser) {
        await db.collection('users').doc(userId).set({
          ...userData,
          emailVerified: true,
          verificationToken: null,
          verificationTokenCreatedAt: null,
          lastVerifiedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Delete from temp collection
        await userRef.delete();
      } else {
        await userRef.update({
          emailVerified: true,
          verificationToken: null,
          verificationTokenCreatedAt: null,
          lastVerifiedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
  
      res.json({ 
        success: true,
        message: 'Email verified successfully! You can now log in.'
      });
  
    } catch (error) {
      console.error('Verify email error:', error);
      
      let errorMessage = 'Email verification failed. Please try again.';
      if (error.code === 'auth/uid-already-exists') {
        errorMessage = 'This account is already verified. Please log in.';
      }
  
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  });

// Password Reset Endpoints
router.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    const snapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      // Return generic success message even if user doesn't exist
      return res.json({ 
        success: true,
        message: 'If an account exists with this email, a reset link has been sent'
      });
    }

    const userDoc = snapshot.docs[0];
    const token = generateToken();
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}&userId=${userDoc.id}`;

    await userDoc.ref.set({
      resetToken: token,
      resetTokenExpiresAt: new Date(Date.now() + 3600000) // 1 hour expiry
    }, { merge: true });

    await transporter.sendMail({
      from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>Click below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>Link expires in 1 hour</p>
      `
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process reset request',
      error: error.message 
    });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, userId, newPassword } = req.body;
    
    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request - user not found' 
      });
    }

    const userData = userDoc.data();
    
    // Check if token exists and matches
    if (!userData.resetToken || userData.resetToken !== token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid reset token' 
      });
    }

    // Check if token is expired
    if (new Date() > userData.resetTokenExpiresAt.toDate()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Reset link has expired' 
      });
    }

    // Update password in Firebase Auth
    await admin.auth().updateUser(userId, { password: newPassword });
    
    // Clear reset token
    await userRef.update({ 
      resetToken: null,
      resetTokenExpiresAt: null 
    });

    res.json({ 
      success: true,
      message: 'Password reset successfully' 
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Password reset failed',
      error: error.message 
    });
  }
});

module.exports = router;