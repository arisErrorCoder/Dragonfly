const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Route to create a payment
router.post('/create', paymentController.createPayment);

// Route to verify a payment
router.post('/verify', paymentController.verifyPayment);

module.exports = router;
