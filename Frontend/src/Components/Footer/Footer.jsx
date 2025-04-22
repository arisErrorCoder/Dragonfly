import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faFacebook, faLinkedin, faYoutube, faPinterest } from '@fortawesome/free-brands-svg-icons';
import './Footer.css';

const Footer = () => {
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const toggleSection = (setOpen, isOpen) => {
    setOpen(!isOpen);
  };

  const handleSubscribe = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
  
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setEmail(''); // Clear the input
        alert('Thank you for subscribing! You will receive a confirmation email shortly.');
      } else {
        alert(data.error || 'Subscription failed. Please try again later.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  const handleLocationClick = () => {
    const googleMapsUrl = `https://maps.app.goo.gl/jHW8wUuNnmZYgKYLA`;
    window.open(googleMapsUrl, '_blank');
  };

  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
    setLocation(address);
    setAddressSuggestions([]); // Clear suggestions after selection
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="section-header" onClick={() => toggleSection(setIsCompanyOpen, isCompanyOpen)}>
            <h4>THE HOTEL</h4>
            <FontAwesomeIcon icon={isCompanyOpen ? faChevronUp : faChevronRight} className="toggle-icon" />
          </div>
          <ul className={`company ${isCompanyOpen ? '' : 'open'}`}>
            <Link to="/about-us"><li>ABOUT US</li></Link>
            <Link to="/RomanticStays"><li>ROMANTIC STAYS</li></Link>
            <Link to="/Dining"><li>ROMANTIC DINING</li></Link>
            <Link to="/supriseplanner"><li>SURPRISE PLANNER</li></Link>
          </ul>
        </div>

        <div className="footer-section">
          <div className="section-header" onClick={() => toggleSection(setIsHelpOpen, isHelpOpen)}>
            <h4>NEED HELP</h4>
            <FontAwesomeIcon icon={isHelpOpen ? faChevronUp : faChevronRight} className="toggle-icon" />
          </div>
          <ul className={`help-links ${isHelpOpen ? '' : 'open'}`}>
            <Link to="/contact-us"><li>CONTACT US</li></Link>
            <Link to="/faqs"><li>FAQ'S</li></Link>
          </ul>
        </div>

        <div className="footer-section">
          <div className="section-header" onClick={() => toggleSection(setIsLegalOpen, isLegalOpen)}>
            <h4>LEGAL</h4>
            <FontAwesomeIcon icon={isLegalOpen ? faChevronUp : faChevronRight} className="toggle-icon" />
          </div>
          <ul className={`discover-links ${isLegalOpen ? '' : 'open'}`}>
            <Link to="/privacy-cookies"><li>PRIVACY & COOKIES</li></Link>
            <Link to="/terms-and-conditions"><li>TERMS AND CONDITIONS</li></Link>
          </ul>
        </div>

        <div className="footer-newsletter">
          <h4>LETTERBOX</h4>
          <div className="newsletter-box">
            <input
              type="email"
              placeholder="Enter your email"
              className="email-input"
              style={{ backgroundColor: '#333333', color: '#ffffff', border: '1px solid #ffffff' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className="email-button"
              style={{ backgroundColor: '#000000', color: '#ffffff', border: '1px solid #ffffff' }}
              onClick={handleSubscribe}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>

        <div className="footer-location">
          <h4>LOCATION</h4>
          <div className="dropdown-content1">
            <p>Click below to view location:</p>
            <div>
              <p className="address">Cts no - 69 & 72, New Chakala Link Road, Near JB Nagar, Chakala Opposite Solitaire Corporate Park, Andheri East, Mumbai, Maharashtra 400093</p>
            </div>
            <button onClick={handleLocationClick} className="map-button">
              View on Google Maps
            </button>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="social-icons">
          <a href="https://www.instagram.com/dragonfly_hotel/" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faInstagram} style={{ color: '#ffffff' }} /></a>
          <a href="https://www.facebook.com/DragonflyHotel/" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faFacebook} style={{ color: '#ffffff' }} /></a>
          <a href="https://in.linkedin.com/company/hotel-dragonfly" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faLinkedin} style={{ color: '#ffffff' }} /></a>
          <a href="https://www.youtube.com/channel/UChlcTHUtdtxZbRH8JbKJVRw" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faYoutube} style={{ color: '#ffffff' }} /></a>
        </div>
        <p style={{ color: '#cccccc', fontSize: 'small' }}>Dragonfly All Rights Reserved Developed and Maintained By <a href="https://yatratechs.com/">YatraTechs</a></p>
      </div>
    </footer>
  );
};

export default Footer;
