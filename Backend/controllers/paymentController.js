const axios = require('axios');
const { API_URL, API_KEY, API_SECRET } = require('../config/airpay');

// Function to initiate payment
exports.createPayment = async (req, res) => {
  try {
    const { amount, currency, orderId, callbackUrl } = req.body;

    const response = await axios.post(`${API_URL}/create_payment`, {
      amount,
      currency,
      orderId,
      callbackUrl
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Function to handle payment verification
exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.body;

    const response = await axios.get(`${API_URL}/verify_payment/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
