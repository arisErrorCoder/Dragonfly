const nodemailer = require('nodemailer');
const path = require('path');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});


// Email templates
const verificationTemplate = (name, verificationLink) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4a6fa5; padding: 20px; text-align: center; }
        .header img { max-width: 150px; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 10px 20px; background-color: #4a6fa5; color: white !important; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <img src="cid:logo" alt="Company Logo">
    </div>
    <div class="content">
        <h2>Hi ${name},</h2>
        <p>Welcome to our platform! To complete your registration, please verify your email address by clicking the button below:</p>
        <p style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" class="button">Verify Email Address</a>
        </p>
        <p>If you didn't create an account with us, please ignore this email.</p>
    </div>
    <div class="footer">
        <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
        <p>If you're having trouble with the button above, copy and paste this link into your browser:</p>
        <p>${verificationLink}</p>
    </div>
</body>
</html>
`;

const resetTemplate = (name, resetLink) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4a6fa5; padding: 20px; text-align: center; }
        .header img { max-width: 150px; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 10px 20px; background-color: #4a6fa5; color: white !important; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
        .warning { color: #d32f2f; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <img src="cid:logo" alt="Company Logo">
    </div>
    <div class="content">
        <h2>Hi ${name},</h2>
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        <p style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" class="button">Reset Password</a>
        </p>
        <p class="warning">This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
    </div>
    <div class="footer">
        <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
        <p>If you're having trouble with the button above, copy and paste this link into your browser:</p>
        <p>${resetLink}</p>
    </div>
</body>
</html>
`;

// Controller methods
exports.sendVerificationEmail = async (req, res) => {
  try {
    const { to, name, verificationLink } = req.body;

    const mailOptions = {
      from: `"Your Company" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject: 'Verify Your Email Address',
      html: verificationTemplate(name, verificationLink),
      attachments: [{
        filename: 'logo.png',
        path: path.join(__dirname, '../public', 'logo.png'),
        cid: 'logo'
      }]
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
};

exports.sendPasswordResetEmail = async (req, res) => {
  try {
    const { to, resetLink } = req.body;
    const userName = 'User'; // Replace with actual name lookup if needed

    const mailOptions = {
      from: `"Your Company" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject: 'Password Reset Request',
      html: resetTemplate(userName, resetLink),
      attachments: [{
        filename: 'logo.png',
        path: path.join(__dirname, '../public', 'logo.png'),
        cid: 'logo'
      }]
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending reset email:', error);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
};