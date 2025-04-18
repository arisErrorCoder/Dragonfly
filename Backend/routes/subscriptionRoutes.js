const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const dotenv = require('dotenv');
dotenv.config();

// Configure transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 30000,
  socketTimeout: 30000
});

// Email templates
const userSubscriptionTemplate = (email) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f5f5f5; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { padding: 30px; background-color: #fff; border-radius: 0 0 5px 5px; }
        .footer { margin-top: 20px; padding-top: 20px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; }
        .logo { max-width: 150px; margin-bottom: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <img src="https://yourhotel.com/logo.png" alt="Dragonfly Hotel Logo" class="logo">
        <h2>Thank You for Subscribing!</h2>
    </div>
    <div class="content">
        <p>Dear Subscriber,</p>
        <p>We're thrilled to welcome you to the Dragonfly Hotel family! You've successfully subscribed to our newsletter with the email:</p>
        <p style="text-align: center; font-weight: bold; font-size: 18px;">${email}</p>
        <p>As a subscriber, you'll be the first to know about:</p>
        <ul>
            <li>Exclusive offers and promotions</li>
            <li>Upcoming events and packages</li>
            <li>Seasonal specials and romantic getaway ideas</li>
            <li>Dining experiences and spa deals</li>
        </ul>
        <p style="text-align: center; margin: 30px 0;">
            <a href="https://yourhotel.com" class="button">Visit Our Website</a>
        </p>
        <p>If you didn't request this subscription, please ignore this email or contact our support team.</p>
    </div>
    <div class="footer">
        <p>© ${new Date().getFullYear()} Dragonfly Hotel. All rights reserved.</p>
        <p>CTS no - 69 & 72, New Chakala Link Road, Andheri East, Mumbai, Maharashtra 400093</p>
    </div>
</body>
</html>
`;

const adminSubscriptionTemplate = (email) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f5f5f5; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { padding: 30px; background-color: #fff; border-radius: 0 0 5px 5px; }
        .footer { margin-top: 20px; padding-top: 20px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; }
        .alert { background-color: #f8f9fa; padding: 15px; border-left: 4px solid #000; margin-bottom: 20px; }
        .details { margin: 20px 0; }
        .detail-row { margin-bottom: 10px; }
        .label { font-weight: bold; display: inline-block; width: 100px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>New Newsletter Subscription</h2>
    </div>
    <div class="content">
        <div class="alert">
            A new subscriber has joined your mailing list.
        </div>
        
        <div class="details">
            <div class="detail-row">
                <span class="label">Email:</span>
                <span>${email}</span>
            </div>
            <div class="detail-row">
                <span class="label">Date:</span>
                <span>${new Date().toLocaleString()}</span>
            </div>
        </div>
        
        <p>This subscriber will now receive your newsletter and promotional emails. You can manage subscriptions through your mailing list platform.</p>
    </div>
    <div class="footer">
        <p>© ${new Date().getFullYear()} Dragonfly Hotel Admin</p>
    </div>
</body>
</html>
`;

// Subscription route
router.post('/subscribe', [
  body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    // Send email to subscriber
    const userMailOptions = {
      from: `"Dragonfly Hotel" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Thank You for Subscribing to Dragonfly Hotel',
      html: userSubscriptionTemplate(email)
    };

    // Send email to admin
    const adminMailOptions = {
      from: `"Dragonfly Hotel Subscriptions" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Newsletter Subscription: ${email}`,
      html: adminSubscriptionTemplate(email)
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(userMailOptions),
      transporter.sendMail(adminMailOptions)
    ]);

    res.status(200).json({ message: 'Subscription successful' });
  } catch (error) {
    console.error('Error sending subscription emails:', error);
    res.status(500).json({ error: 'Failed to process subscription' });
  }
});

module.exports = router;