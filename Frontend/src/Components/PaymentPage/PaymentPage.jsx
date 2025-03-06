import axios from 'axios';
import React, { useState } from 'react';

const PaymentPage = () => {
  const [loading2, setLoading2] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const data = {
    name: "sivaranjani",
    amount: 1,
    mobileNumber: "9994207892",
    // transactionId: 'T' + Date.now(),
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading2(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(`http://localhost:4000/create-order`, { ...data });

      // Use the URL from the response data to redirect
      const paymentUrl = response.data.url;
      if (paymentUrl) {
        window.location.href = paymentUrl; // Redirect to the payment gateway
        setSuccess('Redirecting to payment gateway...');
      } else {
        setError('Could not retrieve payment link. Please try again.');
      }
    } catch (error) {
      setError('Payment failed. Please try again.');
      console.error(error);
    } finally {
      setLoading2(false);
    }
  };

  return (
    <>
      <div>
        <button onClick={handlePayment} disabled={loading2}>
          {loading2 ? 'Processing...' : 'Pay Now'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
      </div>
    </>
  );
};

export default PaymentPage;
