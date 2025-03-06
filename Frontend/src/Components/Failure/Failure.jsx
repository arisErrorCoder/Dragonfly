import React from 'react'
import { useNavigate } from 'react-router-dom';
import "./Failure.css"
const Failure = () => {
    const navigate = useNavigate();

    const handleRetry = () => {
      navigate("/payment"); // Redirect to payment page
    };
  
    const handleContactSupport = () => {
      navigate("/contact-us"); // Redirect to contact support page
    };
  return (
    <div className="payment-failure-container">
    <div className="payment-failure-card">
      <i className="fa-solid fa-circle-xmark failure-icon"></i>
      <h1>Payment Failed</h1>
      <p>
        We're sorry, but your payment could not be processed. Please try again
        or contact support for assistance.
      </p>
      <div className="payment-failure-buttons">
        {/* <button className="retry-button" onClick={handleRetry}>
          Retry Payment
        </button> */}
        <button className="support-button" onClick={handleContactSupport}>
          Contact Support
        </button>
      </div>
    </div>
  </div>
);
};

export default Failure