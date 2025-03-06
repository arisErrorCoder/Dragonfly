import React, { useState } from 'react';
import { FaHome, FaBell, FaCalendar, FaCog } from 'react-icons/fa';
import { FaBoxOpen } from "react-icons/fa6";
import { RiCoupon2Fill } from 'react-icons/ri';
import './Sidebar.css';
import ProfilePic from '../../../assets/logoo.png';
import Sidebar2 from '../Sidebar2/Sidebar2';
import Remainder from '../Remainder/Remainder';
import Notification from '../Notification/Notification';
import CouponsPage from '../Coupons/CouponPage'; 
import ProfileHome from '../ProfileHome/ProfileHome';
import OrderHistory from '../OrderHistory/OrderHistory';
import EditPage from '../EditProfile/EditProfile';

const Sidebar = () => {
  const [activeComponent, setActiveComponent] = useState('home');
  const [activeIcon, setActiveIcon] = useState('home');

  const handleComponentClick = (component) => {
    setActiveComponent(component);
    setActiveIcon(component);
  };

  const handleBackClick = () => {
    setActiveComponent(null);
  };

  const handleEditProfileClick = () => {
    setActiveComponent('settings');
    setActiveIcon('settings');
  };

  const handleGoToCoupons = () => {
    setActiveComponent('coupon');
    setActiveIcon('coupon');
  };

  const handleCreateReminder = () => {
    setActiveComponent('remainder');
    setActiveIcon('remainder');
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar">
        <div className="profile-section">
          <img src={ProfilePic} alt="Profile" className="profile-pic" />
        </div>
        <div className="menu-items">
  <div
    className={`menu-item ${activeIcon === 'home' ? 'active' : ''}`}
    onClick={() => handleComponentClick('home')}
    data-tooltip="Home"
  >
    <FaHome className="icon" />
  </div>
  <div
    className={`menu-item ${activeIcon === 'notification' ? 'active' : ''}`}
    onClick={() => handleComponentClick('notification')}
    data-tooltip="Notifications"
  >
    <FaBell className="icon" />
  </div>
  <div
    className={`menu-item ${activeIcon === 'remainder' ? 'active' : ''}`}
    onClick={() => handleComponentClick('remainder')}
    data-tooltip="Reminders"
  >
    <FaCalendar className="icon" />
  </div>
  <div
    className={`menu-item ${activeIcon === 'coupon' ? 'active' : ''}`}
    onClick={() => handleComponentClick('coupon')}
    data-tooltip="Coupons"
  >
    <RiCoupon2Fill className="icon" />
  </div>
  <div
    className={`menu-item ${activeIcon === 'order-history' ? 'active' : ''}`}
    onClick={() => handleComponentClick('order-history')}
    data-tooltip="Order History"
  >
    <FaBoxOpen className="icon" />
  </div>
</div>
<div className="settings-section">
  <FaCog
    className={`settings-icon ${activeIcon === 'settings' ? 'active' : ''}`}
    onClick={() => handleComponentClick('settings')}
    data-tooltip="Settings"
  />
</div>

      </div>

      {/* Conditional rendering of components */}
      {activeComponent === 'settings' && <EditPage />}
      {activeComponent === 'remainder' && <Remainder />}
      {activeComponent === 'notification' && <Notification />}
      {activeComponent === 'coupon' && <CouponsPage />}
      {activeComponent === 'home' && <ProfileHome onEditProfileClick={handleEditProfileClick} onGoToCoupons={handleGoToCoupons} onCreateReminder={handleCreateReminder} />}
      {activeComponent === 'order-history' && <OrderHistory />}
    </div>
  );
};

export default Sidebar;
