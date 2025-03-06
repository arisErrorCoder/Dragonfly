import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar'; // Adjust the path as needed
import Dashboard from './components/Dashboard';
import AddStayPackage from './components/AddStayPackage';
import AddDiningPackage from './components/AddDiningPackage';
import GalleryMaintenance from './components/Image/GalleryMaintenance';
import BannerManagement from './components/BannerManagement';
import AddonsManagements from './components/AddonsManagement/AddonsManagements';
import SurprisePlanner from './components/SurprisePlanner/SurprisePlanner';
import Bookingpage from './components/Booking/Bookingpage';
import NotificationManager from './components/NotificationManager';
import UpdateCoupon from './components/UpdateCoupon/UpdateCoupon';
import AuthPage from './components/AuthPage/AuthPage';

const App = () => {
  // Track user authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeContent, setActiveContent] = useState('Dashboard');

  useEffect(() => {
    // Check if user is logged in via localStorage
    const authState = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(authState === 'true');
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true'); // Persist login state
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated'); // Clear login state
  };

  const handleMenuClick = (menu) => {
    setActiveContent(menu);
  };

  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<Navigate to="/auth" />} />
          <Route path="/auth" element={<AuthPage onLogin={handleLogin} />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar onMenuClick={handleMenuClick} onLogout={handleLogout} />
        <div className="main-content">
          {activeContent === 'Dashboard' && <Dashboard />}
          {activeContent === 'addstaypackages' && <AddStayPackage />}
          {activeContent === 'addDiningpackages' && <AddDiningPackage />}
          {activeContent === 'gallery' && <GalleryMaintenance />}
          {activeContent === 'roomimagegallery' && <BannerManagement />}
          {activeContent === 'addons' && <AddonsManagements />}
          {activeContent === 'suprise' && <SurprisePlanner />}
          {activeContent === 'booking' && <Bookingpage />}
          {activeContent === 'notification' && <NotificationManager />}
          {activeContent === 'coupon' && <UpdateCoupon />}
        </div>
      </div>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/auth" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
