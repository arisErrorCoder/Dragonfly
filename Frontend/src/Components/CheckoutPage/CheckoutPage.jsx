import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CheckoutPage.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import logooImage from '../../assets/Header/logo.png';

const CheckoutPage = ({ isGuest, setIsGuest }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [productDetails, setProductDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [email, setEmail] = useState('');
  const [timeLeft, setTimeLeft] = useState(1800); // Timer state in seconds (30 minutes)
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false); // New state to track authentication

  const clearCart = () => {
    localStorage.removeItem('bookingOrderDetails');
    setOrderDetails(null);
    setProductDetails({});
    setError('Cart has expired. Please start again.');
  };

  useEffect(() => {
    // Scroll to top when this page is rendered
    window.scrollTo(0, 0);

    const auth = getAuth();

    // Check login or guest checkout status
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setEmail(user.email);
        setIsAuthenticated(true);
      } else if (!isGuest) {
        // If not logged in and not a guest, redirect to login
        navigate('/login', { state: { from: location.pathname } });
      } else {
        setIsAuthenticated(true); // Allow access for guest checkout
      }
    });

    // Validate order details from localStorage
    const storedOrderDetails = JSON.parse(localStorage.getItem('bookingOrderDetails'));
    if (storedOrderDetails) {
      setOrderDetails(storedOrderDetails);
      setProductDetails(storedOrderDetails);

      // Start countdown timer
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            clearCart();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer); // Cleanup on unmount
    } else {
      navigate('/'); // Redirect to home if no order details found
    }

    return () => {
      unsubscribeAuth();
    };
  }, [isGuest, navigate, location]);

  const handlePayment = async () => {
    if (!orderDetails) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/create-order`, {
        name: orderDetails.billingName,
        mobileNumber: orderDetails.billingPhone,
        amount: orderDetails.totalPrice,
        productDetails,
        userId,
        email,
      });
    
      if (response.data.url) {
        localStorage.removeItem('bookingOrderDetails');
        window.location.href = response.data.url;
      }
    } catch (error) {
      setError('Failed to initiate payment');
      setLoading(false);
    }
    
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // If not authenticated, show loading or redirect logic
  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner">
          <img src={logooImage} alt="Loading..." className="spinner-image" />
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {orderDetails ? (
        <div className="order-details">
          <h2 className="order-details__header">Order Details</h2>

          <div className="section">
            <h3 className="section__header">Order ID: {orderDetails?.orderId}</h3>
            <p className="section__content">Package: {productDetails?.packageName}</p>
            <p className="section__content">Check-in Date: {productDetails?.checkInDate}</p>
            <p className="section__content">Time Slot: {productDetails?.timeSlot}</p>
            <p className="section__content">Rating: {productDetails?.rating} Stars</p>
          </div>

          <div className="section">
            <h3 className="section__header">Guest Details</h3>
            {productDetails?.guestDetails?.length > 0 ? (
              <ul className="guest-list">
                {productDetails.guestDetails.map((guest, index) => (
                  <li key={guest.id} className="guest-item">
                    <p>Name: {guest.name}</p>
                    <p>Age: {guest.age}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No guest details available</p>
            )}
          </div>

          <div className="section">
            <h3 className="section__header">Special Request</h3>
            <p className="section__content">{productDetails?.specialRequest}</p>
          </div>

          <div className="section">
            <h3 className="section__header">Payment Option</h3>
            <p className="section__content">{productDetails?.paymentOption}</p>
          </div>

          {productDetails?.addons && productDetails.addons.length > 0 && (
            <div className="section">
              <h3 className="section__header">Addons</h3>
              <ul className="addons-list">
                {productDetails.addons.map((addon, index) => (
                  <li key={index} className="addon-item">{addon.name}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="section">
            <h3 className="section__header">Total Price: ₹{productDetails?.totalPrice}</h3>
          </div>

          <div className="timer-section">
            <h3 className="timer-header">Time Left to Complete Payment:</h3>
            <p className="timer-content">{formatTime(timeLeft)}</p>
          </div>

          <div className="payment-button">
            <button className="payment-button__btn" onClick={handlePayment} disabled={loading}>
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </div>
      ) : (
        <div>Loading order details...</div>
      )}
    </div>
  );
};

export default CheckoutPage;
