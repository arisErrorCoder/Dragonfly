import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, updateDoc, increment } from 'firebase/firestore';
import { FiClock, FiUser, FiPhone, FiCalendar, FiPackage, FiDollarSign, FiCheckCircle } from 'react-icons/fi';
import logooImage from '../../assets/Header/logo.png';
import './CheckoutPage.css';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  const clearCart = () => {
    localStorage.removeItem('bookingOrderDetails');
    setOrderDetails(null);
    setProductDetails({});
    setError('Cart has expired. Please start again.');
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    const auth = getAuth();
    const db = getFirestore();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setEmail(user.email);
        setIsAuthenticated(true);
      } else if (!isGuest) {
        navigate('/login', { state: { from: location.pathname } });
      } else {
        setIsAuthenticated(true);
      }
    });

    const storedOrderDetails = JSON.parse(localStorage.getItem('bookingOrderDetails'));
    if (storedOrderDetails) {
      setOrderDetails(storedOrderDetails);
      setProductDetails(storedOrderDetails);

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

      return () => clearInterval(timer);
    } else {
      navigate('/');
    }

    return () => {
      unsubscribeAuth();
    };
  }, [isGuest, navigate, location]);

  const updateVenueAvailability = async (venueName, checkInDate, timeSlot) => {
    const db = getFirestore();
    const venueRef = doc(db, 'venues', venueName);
    
    try {
      await updateDoc(venueRef, {
        [`bookedRooms.${checkInDate}.${timeSlot}`]: increment(0)
      });
      return true;
    } catch (error) {
      console.error("Error updating venue availability:", error);
      return false;
    }
  };

  const handlePayment = async () => {
    if (!orderDetails || paymentInitiated) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    setPaymentInitiated(true);

    try {
      // First update venue availability
      const venueUpdated = await updateVenueAvailability(
        orderDetails.packageName,
        orderDetails.checkInDate,
        orderDetails.timeSlot
      );

      if (!venueUpdated) {
        throw new Error("Failed to update venue availability");
      }

      // Then proceed with payment
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/create-order`, {
        name: orderDetails.billingName,
        mobileNumber: orderDetails.billingPhone,
        amount: orderDetails.totalPrice,
        productDetails: {
          ...orderDetails,
          venue: orderDetails.packageName,
          checkInDate: orderDetails.checkInDate,
          timeSlot: orderDetails.timeSlot,
          roomsBooked: 1 // Track how many rooms were booked
        },
        userId,
        email,
      });
    
      if (response.data.url) {
        localStorage.removeItem('bookingOrderDetails');
        window.location.href = response.data.url;
      }
    } catch (error) {
      setPaymentInitiated(false);
      setError(error.message || 'Failed to initiate payment');
      setLoading(false);
      
      // If payment failed but venue was updated, we need to revert
      if (error.message.includes("venue availability")) {
        // In a real app, you'd want to implement a transaction or revert mechanism
        console.error("Payment failed after venue was updated - need to revert");
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

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
<div className="df-checkout-container">
      {orderDetails ? (
        <div className="df-checkout-card">
          {/* Header Section */}
          <div className="df-checkout-header">
            <h2 className="df-checkout-title">Complete Your Booking</h2>
            <div className="df-checkout-timer">
              <FiClock className="df-timer-icon" />
              <span>Time remaining: {formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="df-summary-section">
            <h3 className="df-section-title">
              <FiCalendar className="df-section-icon" />
              Booking Summary
            </h3>
            <div className="df-summary-grid">
              <div className="df-summary-item">
                <span className="df-summary-label">Venue:</span>
                <span className="df-summary-value">{orderDetails.venue}</span>
              </div>
              <div className="df-summary-item">
                <span className="df-summary-label">Date:</span>
                <span className="df-summary-value">{orderDetails.checkInDate}</span>
              </div>
              <div className="df-summary-item">
                <span className="df-summary-label">Time Slot:</span>
                <span className="df-summary-value">{orderDetails.timeSlot}</span>
              </div>
              <div className="df-summary-item">
                <span className="df-summary-label">Package:</span>
                <span className="df-summary-value">{orderDetails.packageName}</span>
              </div>
            </div>
          </div>

          {/* Guest Information */}
          <div className="df-guest-section">
            <h3 className="df-section-title">
              <FiUser className="df-section-icon" />
              Guest Information
            </h3>
            {orderDetails.guestDetails?.length > 0 ? (
              <div className="df-guest-grid">
                {orderDetails.guestDetails.map((guest) => (
                  <div key={guest.id} className="df-guest-card">
                    <div className="df-guest-name">{guest.name}</div>
                    <div className="df-guest-age">{guest.age} years</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="df-no-guests">No guest details available</p>
            )}
          </div>

          {/* Addons Section */}
          {orderDetails.addons?.length > 0 && (
            <div className="df-addons-section">
              <h3 className="df-section-title">Selected Addons</h3>
              <div className="df-addons-list">
                {orderDetails.addons.map((addon) => (
                  <div key={addon.id} className="df-addon-item">
                    <span className="df-addon-name">{addon.name}</span>
                    <span className="df-addon-price">₹{addon.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="df-payment-section">
            <h3 className="df-section-title">
              <FiDollarSign className="df-section-icon" />
              Payment Summary
            </h3>
            <div className="df-payment-details">
              <div className="df-payment-row">
                <span>Subtotal:</span>
                <span>₹{orderDetails.totalPrice}</span>
              </div>
              <div className="df-payment-row">
                <span>Payment Option:</span>
                <span>{orderDetails.paymentOption}</span>
              </div>
              <div className="df-payment-total">
                <span>Total Amount:</span>
                <span className="df-total-amount">₹{orderDetails.totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <div className="df-payment-actions">
            <button 
              className={`df-pay-button ${loading || paymentInitiated ? 'df-pay-button-disabled' : ''}`}
              onClick={handlePayment}
              disabled={loading || paymentInitiated}
            >
              {loading ? (
                <span className="df-spinner"></span>
              ) : (
                <>
                  <FiCheckCircle className="df-pay-icon" />
                  {paymentInitiated ? 'Processing...' : 'Proceed to Payment'}
                </>
              )}
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="df-message df-error-message">
              {error}
              {error.includes("venue") && (
                <button 
                  className="df-retry-button"
                  onClick={() => navigate('/booking')}
                >
                  Try Different Dates
                </button>
              )}
            </div>
          )}
          {success && <div className="df-message df-success-message">{success}</div>}
        </div>
      ) : (
        <div className="df-empty-state">
          <img src={logooImage} alt="Empty Cart" className="df-empty-image" />
          <h3 className="df-empty-title">No Booking Found</h3>
          <p className="df-empty-text">Your booking details couldn't be loaded</p>
          <button 
            className="df-empty-button"
            onClick={() => navigate('/')}
          >
            Return to Home
          </button>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;