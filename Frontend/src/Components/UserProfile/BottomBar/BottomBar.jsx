import React, { useState } from 'react';
import { FaHome, FaBell, FaCalendar, FaChartPie, FaUser, FaCog } from 'react-icons/fa';
import './BottomBar.css';
import Home from '../ProfileHomeMobile/ProfileHomeMobile'; // Example home component
import Notification from '../Notification-Mobile/Notification-Mobile'; // Example notification component
import Remainder from '../Remainder-Mobile/Remainder-Mobile'; // Example remainder component
import Transactions from '../Coupons/CouponPage'; // Example transactions component
import Profile from '../Profile/Profile'; // Example profile component
import { RiCoupon2Fill } from 'react-icons/ri';

const BottomBar = () => {
  const [activeComponent, setActiveComponent] = useState('home');
  const [activeIcon, setActiveIcon] = useState('home');

  const handleComponentClick = (component) => {
    setActiveComponent(component);
    setActiveIcon(component);
  };

  return (
    <div className="bottom-bar-container">
      {/* Dynamic content based on the active component */}
      <div className="bottom-bar-content">
        {activeComponent === 'home' && <Home />}
        {activeComponent === 'transactions' && <Transactions />}
        {activeComponent === 'notification' && <Notification />}
        {activeComponent === 'remainder' && <Remainder />}
        {activeComponent === 'profile' && <Profile />}
      </div>

      {/* Bottom bar with icons */}
      <div className="bottom-bar">
        <div
          className={`bar-item ${activeIcon === 'transactions' ? 'active' : ''}`}
          onClick={() => handleComponentClick('transactions')}
        >
           <RiCoupon2Fill className="icon" />
        </div>
        <div
          className={`bar-item ${activeIcon === 'notification' ? 'active' : ''}`}
          onClick={() => handleComponentClick('notification')}
        >
          <FaBell className="bar-icon" />
        </div>
        <div
          className={`bar-item ${activeIcon === 'home' ? 'active' : ''}`}
          onClick={() => handleComponentClick('home')}
        >
          <FaHome className="bar-icon" />
        </div>
        <div
          className={`bar-item ${activeIcon === 'remainder' ? 'active' : ''}`}
          onClick={() => handleComponentClick('remainder')}
        >
          <FaCalendar className="bar-icon" />
        </div>
        <div
          className={`bar-item ${activeIcon === 'profile' ? 'active' : ''}`}
          onClick={() => handleComponentClick('profile')}
        >
          <FaCog className="bar-icon" />
        </div>
      </div>
    </div>
  );
};

export default BottomBar;
