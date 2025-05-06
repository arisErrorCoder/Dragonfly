const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer'); // Import Nodemailer
const dotenv = require('dotenv');
const app = express();
const emailRoutes = require('./routes/emailRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');

app.use(express.json());
dotenv.config();
const allowedOrigins = [
    "https://hoteldragonfly.netlify.app",
    "https://hoteldragonfly.in",
    "http://localhost:5173",
    "http://localhost:4000",
    "https://dragonflybackend.onrender.com"
  ];
  
  app.use(cors());
  

  app.use('/api', emailRoutes);
  app.use('/api', subscriptionRoutes);

// Initialize Firebase Admin SDK with your credentials
const serviceAccount = require('./firebase-service-account');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASEURL
});
const db = admin.firestore();


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

  function generateOrderId() {
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
    return `HDF-${randomNum}`;
  }

  // POST route to create an order
  app.post('/create-order', async (req, res) => {
    const { name, mobileNumber, amount, userId, productDetails, email } = req.body;
    const orderId = generateOrderId();  
    try {
        // First check room availability before proceeding
        if (productDetails.venue && productDetails.checkInDate && productDetails.timeSlot) {
            const venueRef = db.collection('venues').doc(productDetails.venue);
            const venueDoc = await venueRef.get();
            
            if (!venueDoc.exists) {
                return res.status(400).json({ error: 'Venue not found' });
            }
    
            const venueData = venueDoc.data();
            const dateStr = productDetails.checkInDate;
            const timeSlot = productDetails.timeSlot;
            
            // Check if rooms are available
            const bookedRooms = venueData.bookedRooms?.[dateStr]?.[timeSlot] || 0;
            const availableRooms = venueData.totalRooms - bookedRooms;
            
            if (availableRooms <= 0) {
                return res.status(400).json({ 
                    error: 'No rooms available for selected date and time slot',
                    code: 'ROOMS_UNAVAILABLE'
                });
            }
    
            // Only mark the pending booking in the order document
            // Don't update the venue document yet - wait for successful payment
        }

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

        const response = await axios.request(option);
        const paymentUrl = response.data.data.instrumentResponse.redirectInfo.url;

        // Save order details to Firestore (in a pending state)
        await db.collection('orders').doc(orderId).set({
            name,
            mobileNumber,
            amount,
            userId,
            productDetails: {
                ...productDetails,
                orderId: orderId
            },
            email,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            venue: productDetails.venue || null,
            checkInDate: productDetails.checkInDate || null,
            timeSlot: productDetails.timeSlot || null
        });

        res.status(200).json({ 
            msg: "OK", 
            url: paymentUrl, 
            orderId: orderId 
        });

    } catch (error) {
        console.error("Error in payment processing:", error);
        
        // No need to rollback venue changes since we didn't make any
        res.status(500).json({ 
            error: error.response?.data?.message || 'Failed to initiate payment',
            code: error.response?.data?.code || 'PAYMENT_ERROR'
        });
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
        const orderRef = db.collection('orders').doc(merchantTransactionId);
        const orderSnapshot = await orderRef.get();

        if (!orderSnapshot.exists) {
            throw new Error('Order not found');
        }

        const orderData = orderSnapshot.data();

        if (response.data.success === true) {
            // Payment succeeded - now update the venue document
            if (orderData.venue && orderData.checkInDate && orderData.timeSlot) {
                const venueRef = db.collection('venues').doc(orderData.venue);
                
                // Use transaction to ensure atomic update
                await db.runTransaction(async (transaction) => {
                    // Re-read the document in the transaction
                    const freshVenueDoc = await transaction.get(venueRef);
                    const freshVenueData = freshVenueDoc.data();
                    
                    const freshBooked = freshVenueData.bookedRooms?.[orderData.checkInDate]?.[orderData.timeSlot] || 0;
                    const freshAvailable = freshVenueData.totalRooms - freshBooked;
                    
                    if (freshAvailable <= 0) {
                        throw new Error('No availability left');
                    }

                    // Perform the update
                    transaction.update(venueRef, {
                        [`bookedRooms.${orderData.checkInDate}.${orderData.timeSlot}`]: admin.firestore.FieldValue.increment(1)
                    });
                });
            }

            await orderRef.update({
                status: 'success',
                paymentDetails: response.data,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // Send success emails
            await sendOrderEmails(orderData, true);
            
            return res.redirect(successUrl);
        } else {
            // Payment failed - no need to update venue document since we didn't reserve earlier
            await orderRef.update({
                status: 'failed',
                paymentDetails: response.data,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // Send failure emails
            await sendOrderEmails(orderData, false);
            
            return res.redirect(failureUrl);
        }
        
    } catch (error) {
        console.error('Error fetching payment status:', error);
        
        // If we can't verify payment status, mark as failed to be safe
        try {
            const orderRef = db.collection('orders').doc(merchantTransactionId);
            await orderRef.update({
                status: 'failed',
                error: error.message,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        } catch (dbError) {
            console.error('Failed to update order status:', dbError);
        }
        
        return res.redirect(failureUrl);
    }
});
  
  // Additional endpoint to handle expired pending bookings
  app.post('/cleanup-pending-bookings', async (req, res) => {
      try {
          // Find all pending bookings older than 30 minutes
          const cutoffTime = new Date(Date.now() - 30 * 60 * 1000);
          const pendingOrders = await db.collection('orders')
              .where('status', '==', 'pending')
              .where('createdAt', '<', cutoffTime)
              .get();
  
          const batch = db.batch();
          const venueUpdates = {};
  
          pendingOrders.forEach(doc => {
              const orderData = doc.data();
              batch.update(doc.ref, { 
                  status: 'expired',
                  updatedAt: admin.firestore.FieldValue.serverTimestamp() 
              });
  
              // Track venue updates needed
              if (orderData.venue && orderData.checkInDate && orderData.timeSlot) {
                  const venueKey = orderData.venue;
                  if (!venueUpdates[venueKey]) {
                      venueUpdates[venueKey] = {
                          [`bookedRooms.${orderData.checkInDate}.${orderData.timeSlot}`]: 
                              admin.firestore.FieldValue.increment(-1),
                          [`pendingBookings.${doc.id}`]: admin.firestore.FieldValue.delete()
                      };
                  } else {
                      venueUpdates[venueKey][`bookedRooms.${orderData.checkInDate}.${orderData.timeSlot}`] = 
                          admin.firestore.FieldValue.increment(-1);
                      venueUpdates[venueKey][`pendingBookings.${doc.id}`] = 
                          admin.firestore.FieldValue.delete();
                  }
              }
          });
  
          // Apply all venue updates
          for (const [venueId, updates] of Object.entries(venueUpdates)) {
              const venueRef = db.collection('venues').doc(venueId);
              batch.update(venueRef, updates);
          }
  
          await batch.commit();
          res.status(200).json({ message: `Cleaned up ${pendingOrders.size} expired bookings` });
      } catch (error) {
          console.error('Error cleaning up pending bookings:', error);
          res.status(500).json({ error: 'Failed to clean up pending bookings' });
      }
  });
// Function to send emails
const sendOrderEmails = (orderData, isSuccess) => {
  const { 
      name, 
      email, 
      mobileNumber, 
      amount, 
      productDetails, 
      paymentDetails, 
      checkInDate, 
      createdAt, 
      updatedAt 
  } = orderData;
  
  // Improved date formatting
  const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      
      try {
          const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
          if (isNaN(date)) return 'Invalid Date';
          
          return date.toLocaleString('en-IN', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
          });
      } catch (e) {
          return 'Invalid Date';
      }
  };

  // Currency formatting
  const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 2
      }).format(amount);
  };

  // Prepare addons list
  const addonItems = productDetails.addons && Array.isArray(productDetails.addons)
      ? productDetails.addons.map(addon => `
          <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; vertical-align: top;">
                  <img src="${addon.image}" width="50" height="50" style="border-radius: 5px; margin-right: 10px;" alt="${addon.name}">
              </td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; vertical-align: top;">
                  <strong>${addon.name}</strong><br>
                  <span>${addon.description || 'No description'}</span>
              </td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; vertical-align: top;">
                  ${formatCurrency(addon.price)}
              </td>
          </tr>
      `).join('')
      : '<tr><td colspan="3" style="padding: 8px; text-align: center;">No addons selected</td></tr>';

  // Prepare guest details
  const guestList = productDetails.guestDetails && Array.isArray(productDetails.guestDetails)
      ? productDetails.guestDetails.map(guest => `
          <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${guest.name}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${guest.age} years</td>
          </tr>
      `).join('')
      : '<tr><td colspan="2" style="padding: 8px; text-align: center;">No guest details provided</td></tr>';

  const subject = isSuccess
      ? `Booking Confirmation - ${productDetails.packageName} (${productDetails.orderId})`
      : `Payment Failed - ${productDetails.packageName} (${productDetails.orderId})`;

  // Payment method mapping
  const getPaymentMethod = () => {
      if (!paymentDetails?.data?.paymentInstrument) return 'N/A';
      
      const instrument = paymentDetails.data.paymentInstrument;
      if (instrument.type === 'CARD') {
          return `${instrument.cardType || 'Card'} (${instrument.type})`;
      }
      return instrument.type || 'N/A';
  };

  // User Email Template
  const userMailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: email,
      subject,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #333;">
          <div style="background-color: ${isSuccess ? '#4CAF50' : '#FF6347'}; padding: 20px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 24px;">${isSuccess ? 'Booking Confirmed!' : 'Payment Failed'}</h1>
              <p style="margin: 5px 0 0; font-size: 16px;">Order ID: ${productDetails.orderId}</p>
          </div>
          
          <div style="padding: 20px; border-bottom: 1px solid #eee;">
              <h2 style="color: #2c3e50; margin-top: 0;">Hello ${name},</h2>
              <p style="margin-bottom: 20px;">${
                  isSuccess ? 
                  'Thank you for booking with Dragonfly Hotel. Your payment has been successfully processed.' : 
                  paymentDetails?.message || 'We were unable to process your payment. Please try again or contact support.'
              }</p>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                  <h3 style="margin-top: 0; color: #2c3e50;">Booking Summary</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                          <td style="padding: 8px 0; width: 40%;"><strong>Package:</strong></td>
                          <td style="padding: 8px 0;">${productDetails.packageName}</td>
                      </tr>
                      <tr>
                          <td style="padding: 8px 0;"><strong>Venue:</strong></td>
                          <td style="padding: 8px 0;">${productDetails.venue}</td>
                      </tr>
                      <tr>
                          <td style="padding: 8px 0;"><strong>Check-in Date:</strong></td>
                          <td style="padding: 8px 0;">${formatDate(checkInDate)}</td>
                      </tr>
                      <tr>
                          <td style="padding: 8px 0;"><strong>Time Slot:</strong></td>
                          <td style="padding: 8px 0;">${productDetails.timeSlot}</td>
                      </tr>
                      <tr>
                          <td style="padding: 8px 0;"><strong>Total Amount:</strong></td>
                          <td style="padding: 8px 0;">${formatCurrency(amount)}</td>
                      </tr>
                      <tr>
                        //   <td style="padding: 8px 0;"><strong>Payment Status:</strong></td>
                        //   <td style="padding: 8px 0; color: ${isSuccess ? '#4CAF50' : '#FF6347'}; font-weight: bold;">
                        //       ${paymentDetails?.message || 'N/A'}
                        //   </td>
                      </tr>
                  </table>
              </div>
              
              ${productDetails.guestDetails?.length ? `
              <h3 style="color: #2c3e50;">Guest Details</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                  <thead>
                      <tr style="background-color: #f5f5f5;">
                          <th style="padding: 10px; text-align: left;">Name</th>
                          <th style="padding: 10px; text-align: left;">Age</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${guestList}
                  </tbody>
              </table>
              ` : ''}
              
              ${productDetails.addons?.length ? `
              <h3 style="color: #2c3e50;">Add-ons Selected</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                  <thead>
                      <tr style="background-color: #f5f5f5;">
                          <th style="padding: 10px; text-align: left;">Item</th>
                          <th style="padding: 10px; text-align: left;">Description</th>
                          <th style="padding: 10px; text-align: right;">Price</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${addonItems}
                  </tbody>
              </table>
              ` : ''}
              
              <div style="background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                  <h3 style="margin-top: 0; color: #2c3e50;">Important Information</h3>
                  <ul style="padding-left: 20px;">
                      <li>Please arrive 15 minutes before your scheduled time</li>
                      <li>Carry a valid ID proof for verification</li>
                      <li>For any changes, please contact us at least 24 hours in advance</li>
                      ${productDetails.specialRequest ? `<li>Special Request: ${productDetails.specialRequest}</li>` : ''}
                  </ul>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                  <a href="https://hoteldragonfly.in" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Visit Our Website</a>
              </div>
          </div>
          
          <div style="padding: 20px; text-align: center; color: #777; font-size: 14px;">
              <p>If you have any questions, please contact us at support@hoteldragonfly.in or call +91 9930216903</p>
              <p>© ${new Date().getFullYear()} Dragonfly Hotel. All rights reserved.</p>
          </div>
      </div>
      `
  };

  // Admin Email Template
  const adminMailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: process.env.SMTP_FROM_EMAIL,
      subject: `[${isSuccess ? 'SUCCESS' : 'FAILED'}] New Booking - ${productDetails.orderId}`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; color: #333;">
          <div style="background-color: ${isSuccess ? '#4CAF50' : '#FF6347'}; padding: 20px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 24px;">${isSuccess ? 'New Booking Received' : 'Payment Failed'}</h1>
              <p style="margin: 5px 0 0; font-size: 16px;">Order ID: ${productDetails.orderId}</p>
              <p style="margin: 5px 0 0; font-size: 14px;">Status: ${paymentDetails?.code || 'N/A'}</p>
          </div>
          
          <div style="padding: 20px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                  <div style="flex: 1; margin-right: 20px;">
                      <h3 style="color: #2c3e50; margin-top: 0;">Customer Details</h3>
                      <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                              <td style="padding: 8px 0; width: 40%;"><strong>Name:</strong></td>
                              <td style="padding: 8px 0;">${name}</td>
                          </tr>
                          <tr>
                              <td style="padding: 8px 0;"><strong>Email:</strong></td>
                              <td style="padding: 8px 0;">${email}</td>
                          </tr>
                          <tr>
                              <td style="padding: 8px 0;"><strong>Phone:</strong></td>
                              <td style="padding: 8px 0;">${mobileNumber}</td>
                          </tr>
                             <tr>
                              <td style="padding: 8px 0;"><strong>Booking Status:</strong></td>
                              <td style="padding: 8px 0; color: ${isSuccess ? '#4CAF50' : '#FF6347'}; font-weight: bold;">
                                  ${isSuccess ? 'Confirmed' : 'Payment Failed'}
                              </td>
                          </tr>
                      </table>
                  </div>
                  
                  <div style="flex: 1;">
                      <h3 style="color: #2c3e50; margin-top: 0;">Payment Details</h3>
                      <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                              <td style="padding: 8px 0; width: 40%;"><strong>Amount:</strong></td>
                              <td style="padding: 8px 0;">${formatCurrency(amount)}</td>
                          </tr>
                          <tr>
                    <td style="padding: 8px 0;"><strong>Transaction ID:</strong></td>
<td style="padding: 8px 0;">${
            paymentDetails?.transactionId || 
            paymentDetails?.data?.transactionId || 
            paymentDetails?.response?.transactionId || 
            'N/A'
        }</td>                          </tr>
                          <tr>
                    <td style="padding: 8px 0;"><strong>Payment Method:</strong></td>
<td style="padding: 8px 0;">${
            paymentDetails?.paymentInstrument?.type || 
            paymentDetails?.data?.paymentInstrument?.type || 
            paymentDetails?.response?.paymentInstrument?.type || 
            'N/A'
        }</td>                          </tr>
                          <tr>
                    <td style="padding: 8px 0;"><strong>Payment Status:</strong></td>
                     <td style="padding: 8px 0; color: ${isSuccess ? '#4CAF50' : '#FF6347'}; font-weight: bold;">
            ${
                (paymentDetails?.code || 
                paymentDetails?.status || 
                paymentDetails?.response?.code || 
                'N/A')
            } - ${
                (paymentDetails?.message || 
                paymentDetails?.statusMessage || 
                paymentDetails?.response?.message || 
                'N/A')
            }
        </td>
                          </tr>
                      </table>
                  </div>
              </div>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                  <h3 style="margin-top: 0; color: #2c3e50;">Booking Details</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                          <td style="padding: 8px 0; width: 30%;"><strong>Package:</strong></td>
                          <td style="padding: 8px 0;">${productDetails.packageName}</td>
                      </tr>
                      <tr>
                          <td style="padding: 8px 0;"><strong>Venue:</strong></td>
                          <td style="padding: 8px 0;">${productDetails.venue}</td>
                      </tr>
                      <tr>
                          <td style="padding: 8px 0;"><strong>Check-in Date:</strong></td>
                          <td style="padding: 8px 0;">${formatDate(checkInDate)}</td>
                      </tr>
                      <tr>
                          <td style="padding: 8px 0;"><strong>Time Slot:</strong></td>
                          <td style="padding: 8px 0;">${productDetails.timeSlot}</td>
                      </tr>
                      <tr>
                          <td style="padding: 8px 0;"><strong>Special Request:</strong></td>
                          <td style="padding: 8px 0;">${productDetails.specialRequest || 'None'}</td>
                      </tr>
                  </table>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                  ${productDetails.guestDetails?.length ? `
                  <div style="flex: 1; margin-right: 20px;">
                      <h3 style="color: #2c3e50; margin-top: 0;">Guest Details</h3>
                      <table style="width: 100%; border-collapse: collapse;">
                          <thead>
                              <tr style="background-color: #f5f5f5;">
                                  <th style="padding: 10px; text-align: left;">Name</th>
                                  <th style="padding: 10px; text-align: left;">Age</th>
                              </tr>
                          </thead>
                          <tbody>
                              ${guestList}
                          </tbody>
                      </table>
                  </div>
                  ` : ''}
                  
                  ${productDetails.addons?.length ? `
                  <div style="flex: 1;">
                      <h3 style="color: #2c3e50; margin-top: 0;">Add-ons</h3>
                      <table style="width: 100%; border-collapse: collapse;">
                          <thead>
                              <tr style="background-color: #f5f5f5;">
                                  <th style="padding: 10px; text-align: left;">Item</th>
                                  <th style="padding: 10px; text-align: right;">Price</th>
                              </tr>
                          </thead>
                          <tbody>
                              ${productDetails.addons.map(addon => `
                              <tr>
                                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${addon.name}</td>
                                  <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(addon.price)}</td>
                              </tr>
                              `).join('')}
                          </tbody>
                          <tfoot>
                              <tr>
                                  <td style="padding: 8px; text-align: right; font-weight: bold;">Total:</td>
                                  <td style="padding: 8px; text-align: right; font-weight: bold;">${formatCurrency(amount)}</td>
                              </tr>
                          </tfoot>
                      </table>
                  </div>
                  ` : ''}
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                  <a href="https://admin.hoteldragonfly.in" style="display: inline-block; padding: 12px 24px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin-right: 10px;">View in Admin Panel</a>
                  <a href="tel:${mobileNumber}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Call Customer</a>
              </div>
          </div>
          
          <div style="padding: 20px; text-align: center; color: #777; font-size: 14px; border-top: 1px solid #eee;">
              <p>© ${new Date().getFullYear()} Dragonfly Hotel Admin</p>
          </div>
      </div>
      `
  };

  // Send emails
  transporter.sendMail(userMailOptions, (err) => {
      if (err) console.error('Error sending user email:', err);
      else console.log('User email sent for order:', productDetails.orderId);
  });

  transporter.sendMail(adminMailOptions, (err) => {
      if (err) console.error('Error sending admin email:', err);
      else console.log('Admin email sent for order:', productDetails.orderId);
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
