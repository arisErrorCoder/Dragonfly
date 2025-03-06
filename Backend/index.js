const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer'); // Import Nodemailer

const app = express();

app.use(express.json());
app.use(cors());

// Initialize Firebase Admin SDK with your credentials
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://dragonfly-958be-default-rtdb.firebaseio.com'
});

const MERCHANT_KEY = "96434309-7796-489d-8924-ab56988a6076";
const MERCHANT_ID = "PGTESTPAYUAT86";
const MERCHANT_BASE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
const MERCHANT_STATUS_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status";

const redirectUrl = "https://dragonflybackend.onrender.com/status";
const successUrl = "https://hoteldragonfly.netlify.app/confirmation";
const failureUrl = "https://hoteldragonfly.netlify.app/payment-failure";

// Set up Nodemailer transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'lecotrus2019@gmail.com',
        pass: 'ubrv oyyg jqlm xoka'   // Replace with your email password or app-specific password
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
        from: 'lecotrus2019@gmail.com',
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
        from: 'lecotrus2019@gmail.com',
        to: 'arish6013@gmail.com',
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
                        <a href="https://dragonflyadmin.netlify.app/" target="_blank" 
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

app.listen(4000, () => {
    console.log('Server is running on port 4000');
});
