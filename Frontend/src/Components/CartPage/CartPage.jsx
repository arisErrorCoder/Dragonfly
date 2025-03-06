import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CartPage.css'; // Link to the new CSS file

const CartPage = () => {
  const navigate = useNavigate();
  
  // Load booking details from local storage
  const storedOrderDetails = JSON.parse(localStorage.getItem("bookingOrderDetails"));
  
  if (!storedOrderDetails) {
    return <div className="cart-empty-message">No booking details found. Please proceed with your booking.</div>;
  }

  const {
    guestDetails,
    checkInDate,
    paymentOption,
    totalPrice,
    specialRequest,
    billingName,
    billingPhone,
    addons,
    timeSlot,
  } = storedOrderDetails;

  const guestDetailsDisplay = Array.isArray(guestDetails)
    ? guestDetails.map((guest, index) => (
        <div key={index} className="guest-details-item">
          <p><strong>Name:</strong> {guest.name}</p>
        </div>
      ))
    : <p>{guestDetails.name}</p>; // For a single guest object

  const handleProceedToCheckout = () => {
    navigate("/checkout", {
      state: { orderDetails: storedOrderDetails },
    });
  };

  return (
    <div className="cart-page-wrapper">
      <h1 className="cart-page-title">Your Cart</h1>
      
      <div className="order-summary-section">
        <h2 className="order-summary-title">Booking Details</h2>
        
        <div className="guest-details-section">
          <strong>Guest Details:</strong>
          {guestDetailsDisplay}
        
        <p><strong>Check-in Date:</strong> {checkInDate}</p>
        <p><strong>Payment Option:</strong> {paymentOption}</p>
        <p><strong>Total Price:</strong> ₹{totalPrice}</p>
        <p><strong>Special Request:</strong> {specialRequest || "None"}</p>
        <p><strong>Billing Name:</strong> {billingName}</p>
        <p><strong>Billing Phone:</strong> {billingPhone}</p>
        <p><strong>Time Slot:</strong> {timeSlot}</p>
        </div>

        <div className="addons-section">
          <strong>Addons:</strong>
          <ul className="addons-list">
            {addons.length > 0 ? (
              addons.map((addon) => (
                <li key={addon.id} className="addon-item">
                  <p><strong>{addon.name}</strong> - ₹{addon.price}</p>
                  <p>{addon.description}</p>
                  <img src={addon.image} alt={addon.name} className="addon-item-image" />
                </li>
              ))
            ) : (
              <li>No addons selected</li>
            )}
          </ul>
        </div>
      </div>

      <div className="checkout-button-container">
        <button onClick={handleProceedToCheckout} className="checkout-button">Proceed to Checkout</button>
      </div>
    </div>
  );
};

export default CartPage;
