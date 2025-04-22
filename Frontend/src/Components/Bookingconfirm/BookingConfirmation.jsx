import React from 'react';
import { Link } from 'react-router-dom';
import './BookingConfirmation.css';

const BookingConfirmation = () => {
  return (
    <div className="df-confirmation-container">
      <div className="df-confirmation-card">
        <div className="df-confirmation-header">
          <svg className="df-confirmation-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" />
          </svg>
          <h2 className="df-confirmation-title">Your Booking is Confirmed!</h2>
          <p className="df-confirmation-subtitle">We're excited to host your event</p>
        </div>

        <div className="df-confirmation-timeline">
          <div className="df-timeline-item">
            <div className="df-timeline-badge"></div>
            <div className="df-timeline-content">
              <h3>Before Your Event</h3>
              <p>Kindly give us a call 1 day prior to confirm your booking</p>
            </div>
          </div>
          <div className="df-timeline-item">
            <div className="df-timeline-badge"></div>
            <div className="df-timeline-content">
              <h3>On Arrival</h3>
              <p><strong>Note:</strong> 15 minutes waiting period applies upon arrival</p>
            </div>
          </div>
        </div>

        <div className="df-contact-section">
          <h3 className="df-section-title">Event Day Contacts</h3>
          <div className="df-contact-grid">
            <div className="df-contact-card">
              <svg className="df-contact-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z" />
              </svg>
              <div>
                <p className="df-contact-role">Event Coordinator</p>
                <p className="df-contact-number">9930216903</p>
              </div>
            </div>
            <div className="df-contact-card">
              <svg className="df-contact-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
              </svg>
              <div>
                <p className="df-contact-role">Decor Team</p>
                <p className="df-contact-number">8291819216</p>
              </div>
            </div>
            <div className="df-contact-card">
              <svg className="df-contact-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,3A4,4 0 0,0 8,7H16A4,4 0 0,0 12,3M19,7A2,2 0 0,1 21,9V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V9A2,2 0 0,1 5,7H7A5,5 0 0,1 12,2A5,5 0 0,1 17,7H19M9,9V10H12.5V9H9M7,11V12H10V11H7M13,11V12H16V11H13M7,13V14H10V13H7M13,13V14H16V13H13M7,15V16H10V15H7M13,15V16H16V15H13M9,17V18H12.5V17H9Z" />
              </svg>
              <div>
                <p className="df-contact-role">Restaurant/Food</p>
                <p className="df-contact-number">022 61321105</p>
              </div>
            </div>
          </div>
        </div>

        <div className="df-location-section">
          <h3 className="df-section-title">Venue Location</h3>
          <div className="df-location-card">
            <svg className="df-location-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z" />
            </svg>
            <div>
              <p className="df-venue-name">Dragonfly Hotel - The Art Hotel</p>
              <p className="df-venue-address">Near J B Nagar Metro Station, Andheri East, Mumbai</p>
              <a href="https://maps.app.goo.gl/UWgaerNnagbsjc9KA" className="df-map-link" target="_blank" rel="noopener noreferrer">
                Open in Google Maps
                <svg className="df-external-icon" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="df-actions">
          <Link to="/" className="df-home-button">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;