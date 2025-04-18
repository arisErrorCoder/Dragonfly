const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const dotenv = require('dotenv');
dotenv.config();

// Configure transporter
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

// Email templates
const userEmailTemplate = (name) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { margin-top: 20px; padding: 20px; text-align: center; font-size: 12px; color: #777; }
        .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Thank You for Contacting Us</h2>
    </div>
    <div class="content">
        <p>Dear ${name},</p>
        <p>We've received your message and our team will get back to you within 24-48 hours.</p>
        <p>Here's a summary of your inquiry:</p>
        <p><strong>Subject:</strong> {{subject}}</p>
        <p><strong>Message:</strong> {{message}}</p>
        <p>If you have any urgent questions, please don't hesitate to reply to this email.</p>
        <p>Best regards,</p>
        <p>The Support Team</p>
    </div>
    <div class="footer">
        <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
    </div>
</body>
</html>
`;

const adminEmailTemplate = (formData) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { margin-top: 20px; padding: 20px; text-align: center; font-size: 12px; color: #777; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="header">
        <h2>New Contact Form Submission</h2>
    </div>
    <div class="content">
        <p>You've received a new contact form submission with the following details:</p>
        
        <table>
            <tr>
                <th>Field</th>
                <th>Value</th>
            </tr>
            <tr>
                <td>Name</td>
                <td>${formData.name}</td>
            </tr>
            <tr>
                <td>Email</td>
                <td>${formData.email}</td>
            </tr>
            <tr>
                <td>Subject</td>
                <td>${formData.subject || 'Not specified'}</td>
            </tr>
            <tr>
                <td>Message</td>
                <td>${formData.message}</td>
            </tr>
            <tr>
                <td>Submitted At</td>
                <td>${new Date().toLocaleString()}</td>
            </tr>
        </table>
        
        <p>Please respond to the inquiry within 24 hours.</p>
    </div>
    <div class="footer">
        <p>This is an automated message. Please do not reply directly to this email.</p>
    </div>
</body>
</html>
`;

// Contact form route
router.post('/contact', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, subject, message } = req.body;

  try {
    // Send email to user
    const userMailOptions = {
      from: `"Hotel Dragonfly" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Thank You for Contacting Us',
      html: userEmailTemplate(name)
        .replace('{{subject}}', subject || 'No subject provided')
        .replace('{{message}}', message)
    };

    // Send email to admin
    const adminMailOptions = {
      from: `"Contact Form" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Form Submission: ${subject || 'No Subject'}`,
      html: adminEmailTemplate({ name, email, subject, message })
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(userMailOptions),
      transporter.sendMail(adminMailOptions)
    ]);

    res.status(200).json({ message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ error: 'Failed to send emails' });
  }
});

module.exports = router;