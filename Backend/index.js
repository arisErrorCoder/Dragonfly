const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer'); // Import Nodemailer
const dotenv = require('dotenv');
const app = express();

app.use(express.json());
dotenv.config();
const allowedOrigins = [
    "https://hoteldragonfly.netlify.app",
    "https://hoteldragonfly.in",
    "http://localhost:5174"
  ];
  
  app.use(
    cors({
      origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        } else {
          return callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true, // if you're using cookies or HTTP auth
    })
  );
// Initialize Firebase Admin SDK with your credentials
const serviceAccount = require('./firebase-service-account');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASEURL
});


const MERCHANT_ID = process.env.MERCHANT_ID;
const MERCHANT_KEY = process.env.MERCHANT_KEY;
const MERCHANT_BASE_URL = process.env.MERCHANT_BASE_URL;
const MERCHANT_STATUS_URL = process.env.MERCHANT_STATUS_URL;

const redirectUrl = process.env.REDIRECT_URL;
const successUrl = process.env.SUCCESS_URL;
const failureUrl = process.env.FAILURE_URL;

// Set up Nodemailer transport
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com', // Official hostname (not IP)
    port: 465,
    secure: true, // Mandatory for port 465
    auth: {
      user: process.env.SMTP_USER, // Full email (user@yourdomain.com)
      pass: process.env.SMTP_PASS // Email account password
    },
    tls: {
      rejectUnauthorized: false // Bypass certificate validation (temporary)
    },
    connectionTimeout: 30000,
    socketTimeout: 30000
  });
  
  // Verify connection on startup
  transporter.verify((error, success) => {
    if (error) {
      console.error('SMTP Connection Error:', error);
    } else {
      console.log('SMTP Server is ready');
    }
  });

// POST route to create an order
app.post('/create-order', async (req, res) => {
    const { name, mobileNumber, amount, userId, productDetails, email } = req.body;
    const orderId = uuidv4();

    // Payment payload setup
    const paymentPayload = {
        merchantId: MERCHANT_ID,
        merchantUserId: name,
        mobileNumber: mobileNumber,
        amount: amount * 100,
        merchantTransactionId: orderId,
        redirectUrl: `${redirectUrl}/?id=${orderId}`,
        redirectMode: 'POST',
        paymentInstrument: {
            type: 'PAY_PAGE'
        }
    };

    const payload = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
    const keyIndex = 1;
    const string = payload + '/pg/v1/pay' + MERCHANT_KEY;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + '###' + keyIndex;

    const option = {
        method: 'POST',
        url: MERCHANT_BASE_URL,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum
        },
        data: {
            request: payload
        }
    };

    try {
        const response = await axios.request(option);
        const paymentUrl = response.data.data.instrumentResponse.redirectInfo.url;

        // Save order details to Firestore (in a pending state)
        const db = admin.firestore();
        await db.collection('orders').doc(orderId).set({
            name,
            mobileNumber,
            amount,
            userId,
            productDetails,
            email,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Send the orderId along with the payment URL
        res.status(200).json({ msg: "OK", url: paymentUrl, orderId: orderId });
    } catch (error) {
        console.log("Error in payment", error);
        res.status(500).json({ error: 'Failed to initiate payment' });
    }
});



// POST route to check payment status
app.post('/status', async (req, res) => {
    const merchantTransactionId = req.query.id;
    const keyIndex = 1;
    const string = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + MERCHANT_KEY;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + '###' + keyIndex;

    const option = {
        method: 'GET',
        url: `${MERCHANT_STATUS_URL}/${MERCHANT_ID}/${merchantTransactionId}`,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': MERCHANT_ID
        },
    };

    try {
        const response = await axios.request(option);
        const db = admin.firestore();
        const orderRef = db.collection('orders').doc(merchantTransactionId);
        const orderSnapshot = await orderRef.get();

        if (!orderSnapshot.exists) {
            throw new Error('Order not found');
        }

        const orderData = orderSnapshot.data();

        if (response.data.success === true) {
            await orderRef.update({
                status: 'success',
                paymentDetails: response.data,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        
            // Send success emails
            sendOrderEmails(orderData, true);
        
            return res.redirect(successUrl);
        } else {
            await orderRef.update({
                status: 'failed',
                paymentDetails: response.data,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        
            // Send failure emails
            sendOrderEmails(orderData, false);
        
            return res.redirect(failureUrl);
        }
        
    } catch (error) {
        console.error('Error fetching payment status:', error);
        return res.redirect(failureUrl);
    }
});

// Function to send emails
const sendOrderEmails = (orderData, isSuccess) => {
    const { name, email, mobileNumber, amount, productDetails } = orderData;

    const addonItems = productDetails.addons && Array.isArray(productDetails.addons)
        ? productDetails.addons.map(addon => `
            <li style="display: flex; align-items: center; margin-bottom: 8px;">
                <img src="${addon.image}" width="50" height="50" style="margin-right: 10px; border-radius: 5px;" />
                <span>${addon.name} - ₹${addon.price}</span>
            </li>
          `).join('')
        : '<p>No addons available</p>';

    const subject = isSuccess
        ? 'Order Confirmation - Your Purchase Details'
        : 'Payment Failed - Your Order Details';

    const userMailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                <h1 style="background-color: ${isSuccess ? '#4CAF50' : '#FF6347'}; color: white; padding: 10px; text-align: center;">
                    ${isSuccess ? 'Thank you for your order' : 'Payment Failed'}, ${name}!
                </h1>
                <h3>Order ID: ${productDetails.orderId}</h3>
                <h3>Total Amount: ₹${amount}</h3>
                <p>We have ${isSuccess ? 'received your payment' : 'failed to process your payment'}.</p>
                <h2>Package Details:</h2>
                <p><strong>Package Name:</strong> ${productDetails.packageName}</p>
                <img src="${productDetails.image}" alt="Product Image" width="80" height="80" />
                <ul>${addonItems}</ul>
            </div>
        `
    };

    const adminMailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: `Order ${isSuccess ? 'Successful' : 'Failed'} - Order ID: ${productDetails.orderId}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #333; color: white; padding: 15px; text-align: center;">
                    <h1>New Order Notification</h1>
                </div>
                <div style="padding: 20px;">
                    <h3 style="color: #555;">Order Overview:</h3>
                    <p style="margin: 5px 0;"><strong>Order ID:</strong> ${productDetails.orderId}</p>
                    <p style="margin: 5px 0;"><strong>Customer Name:</strong> ${name}</p>
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                    <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${amount}</p>
                    <p style="margin: 15px 0; color: ${isSuccess ? '#4CAF50' : '#FF6347'};">
                        ${isSuccess ? 'The payment was successfully processed.' : 'The payment failed.'}
                    </p>
                    <h3 style="margin-bottom: 10px;">Package Details:</h3>
                    <p style="margin: 5px 0;"><strong>Package Name:</strong> ${productDetails.packageName}</p>
                    <img src="${productDetails.image}" alt="Product Image" style="width: 100px; height: auto; margin: 10px 0; border-radius: 8px;"/>
                    <ul style="list-style-type: disc; padding-left: 20px; color: #555; margin: 10px 0;">${addonItems}</ul>
                    <h3 style="margin-top: 20px;">Action Required:</h3>
                    <p style="margin: 5px 0;">Please follow up with the customer if necessary.</p>
                    <div style="margin-top: 20px; text-align: center;">
                        <a href="https://admin.hoteldragonfly.in/" target="_blank" 
                           style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                            Go to Admin Panel
                        </a>
                    </div>
                </div>
            </div>
        `
    };
    

    transporter.sendMail(userMailOptions, (err) => {
        if (err) console.log('Error sending user email:', err);
    });

    transporter.sendMail(adminMailOptions, (err) => {
        if (err) console.log('Error sending admin email:', err);
    });
};



app.post('/api/send-verification', async (req, res) => {
  try {
    const { email, name, verificationLink } = req.body;

    // Send verification email
    await transporter.sendMail({
        from: `"HotelDragonFly" <${process.env.SMTP_FROM_EMAIL}>`,
        to: email,
        subject: 'Verify Your Email Address',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                text-align: center;
                padding: 20px 0;
                border-bottom: 1px solid #eaeaea;
              }
              .logo {
                max-width: 50px;
                height: auto;
              }
              .content {
                padding: 30px 20px;
              }
              h1 {
                color: #2c3e50;
                font-size: 24px;
                margin-bottom: 20px;
              }
              p {
                margin-bottom: 20px;
                font-size: 16px;
              }
              .button {
                display: inline-block;
                padding: 12px 24px;
                background-color: #4CAF50;
                color: white !important;
                text-decoration: none;
                border-radius: 4px;
                font-weight: bold;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                padding: 20px;
                font-size: 14px;
                color: #7f8c8d;
                border-top: 1px solid #eaeaea;
              }
              .social-links {
                margin: 20px 0;
                text-align: center;
              }
              .social-icon {
                margin: 0 10px;
                text-decoration: none;
              }
              @media only screen and (max-width: 600px) {
                .content {
                  padding: 20px 10px;
                }
                h1 {
                  font-size: 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <img src="https://hoteldragonfly.in/assets/logo-RpRHc0rZ.png" alt="Company Logo" class="logo">
            </div>
            
            <div class="content">
              <h1>Welcome to HotelDragonfly, ${name}!</h1>
              <p>Thank you for registering with us. To complete your registration, please verify your email address by clicking the button below:</p>
              
              <div style="text-align: center;">
                <a href="${verificationLink}" class="button">Verify Email Address</a>
              </div>
              
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #3498db;">${verificationLink}</p>
              
              <p>This verification link will expire in 24 hours.</p>
            </div>
            
            <div class="social-links">
              <a href="https://www.facebook.com/DragonflyHotel/" class="social-icon">Facebook</a>
              <a href="https://www.linkedin.com/authwall?trk=bf&trkInfo=AQH-oNLUxfK4DAAAAZYE6QQwC8HHHlTrehct3QXRTwYpoZ1AcaJMfm34LCr0OwXp9NFjB1y5CaW9s8Hc54PCl3XvncmVLnMUN2fXuM2o5z4G0eZ9LMjhwfZJ8NmPiKWh3ozLSIY=&original_referer=&sessionRedirect=https%3A%2F%2Fin.linkedin.com%2Fcompany%2Fhotel-dragonfly" class="social-icon">Linkedin</a>
              <a href="https://www.instagram.com/dragonfly_hotel/" class="social-icon">Instagram</a>
            </div>
            
            <div class="footer">
              <p>If you didn't request this, please ignore this email.</p>
              <p>&copy; ${new Date().getFullYear()} HotelDragonfly. All rights reserved.</p>
              <p>
                Your Company Address<br>
                City, State ZIP Code<br>
                <a href="mailto:surprises@hoteldragonfly.in">surprises@hoteldragonfly.in</a>
              </p>
            </div>
          </body>
          </html>
        `,
        // Optional: Add text version for email clients that don't support HTML
        text: `
          Welcome to Our App, ${name}!
      
          Please verify your email address by visiting this link:
          ${verificationLink}
      
          If you didn't request this, please ignore this email.
      
          © ${new Date().getFullYear()} Your Company Name. All rights reserved.
        `
      });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

app.get('/api/verify-email', async (req, res) => {
    try {
      const token = req.query.token;
      const userRecord = await admin.auth().getUser(token);
      
      if (!userRecord) {
        return res.status(400).json({ error: 'Invalid verification token' });
      }
      
      // Get the name from the query parameters
      const name = req.query.name || '';
      
      // Update user with email verification and display name
      await admin.auth().updateUser(token, {
        emailVerified: true,
        displayName: name // Set the display name
      });
      
      res.status(200).json({ 
        success: true,
        email: userRecord.email,
        name: name // Return the name
      });
      
    } catch (error) {
      console.error('Error verifying email:', error);
      res.status(500).json({ error: 'Failed to verify email' });
    }
  });

app.post('/api/send-reset-email', async (req, res) => {
  try {
    const { email, resetLink } = req.body;

    // Check if email exists in Firebase Auth
    try {
      await admin.auth().getUserByEmail(email);
    } catch (error) {
      // Don't reveal if email doesn't exist (security best practice)
      return res.status(200).json({ success: true });
    }

    // Send reset email
    await transporter.sendMail({
      from: `"Your App Name" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>We received a request to reset your password. Click the link below to reset it:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending reset email:', error);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

app.post('/api/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // Update password using Firebase Admin SDK
    await admin.auth().updateUser(userRecord.uid, {
      password: newPassword
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});


app.listen(4000, () => {
    console.log('Server is running on port 4000');
});
