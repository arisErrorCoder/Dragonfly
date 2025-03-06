import React from 'react';
import './BookingConfirmation.css';
import { Link } from 'react-router-dom';

const BookingConfirmation = () => {
  return (
    <div className="booking-container">
      <h2 className="booking-title">Your Booking is Confirmed !!</h2>
      <p className="booking-note">
        Kindly Give us a Call, 1 day prior to your event 
      </p>
      <p className="booking-important">
        <strong>Note -</strong> Once you arrive at the venue, 15 mins will be the waiting period for the entry.
      </p>
     
      
      <h3>ON THE DAY OF THE EVENT -</h3>
      <p className="booking-followup">
        Any Follow-up if Needed, Connect On:
      </p>
      
      <div className="contact-info">
        <p>9930216903 - <strong>Event Coordinator</strong></p>
        <p>8291819216 - <strong>Decor Guy</strong></p>
        <p>022 61321105 - <strong>Restaurant / Food Ordering</strong></p>
      </div>
      
      <div className="location-info">
        <h3>Location -</h3>
        <p>Dragonfly Hotel - The Art Hotel</p>
        <p>Near J B Nagar Metro Station Andheri East, Mumbai</p>
        <a href="https://maps.app.goo.gl/UWgaerNnagbsjc9KA" className="location-link" target="_blank" rel="noopener noreferrer">
          View on Google Maps
        </a>
      </div>
    </div>
  );
};

export default BookingConfirmation;
