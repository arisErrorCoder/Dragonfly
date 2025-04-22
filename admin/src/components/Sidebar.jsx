import React, { useState } from 'react';

const Sidebar = ({ onMenuClick, onLogout }) => {
  const [isActive, setIsActive] = useState(false);
  const [activeMenu, setActiveMenu] = useState('');

  const toggleSidebar = () => {
    setIsActive(!isActive);
  };

  const handleMenuItemClick = (menu) => {
    if (menu === 'Dashboard') {
      setActiveMenu('Dashboard');
      onMenuClick('Dashboard');
    } else if (menu === 'viewers') {
      setActiveMenu('viewers');
    } else if (menu === 'agenda') {
      setActiveMenu('agenda');
    } else if (menu === 'user') {
      setActiveMenu('user');
    } else {
      setActiveMenu(menu === activeMenu ? '' : menu);
      onMenuClick(menu);
    }
  };

  return (
    <div className={`sidebar ${isActive ? 'active' : ''}`}>
      <div className="menu-btn" onClick={toggleSidebar}>
        <i className={`ph-bold ${isActive ? 'ph-caret-right' : 'ph-caret-left'}`}></i>
      </div>
      <div className="head">
        <div className="user-img">
          <img src="https://static.vecteezy.com/system/resources/previews/019/879/186/large_2x/user-icon-on-transparent-background-free-png.png" alt="" />
        </div>
        <div className="user-details">
          <p className="title">DragonFly</p>
          <p className="name">Admin</p>
        </div>
      </div>
      <div className="nav">
        <div className="menu">
          <p className="title">Main</p>
          <ul>
            <li className={activeMenu === 'Dashboard' ? 'active' : ''}>
              <a href="#" onClick={() => handleMenuItemClick('Dashboard')}>
                <i className="icon ph-bold ph-house-simple"></i>
                <span className="text">Dashboard</span>
              </a>
            </li>
            <li className={activeMenu === 'viewers' ? 'active' : ''}>
              <a href="#" onClick={() => handleMenuItemClick('viewers')}>
                <i className="icon ph-bold ph-user"></i>
                <span className="text">Catalog</span>
                <i className="arrow ph-bold ph-caret-down"></i>
              </a>
              <ul className="sub-menu" style={{ display: activeMenu === 'viewers' ? 'block' : 'none' }}>
                <li className={activeMenu === 'addstaypackages' ? 'active' : ''}>
                  <a href="#" onClick={() => handleMenuItemClick('addstaypackages')}>
                    <span className="text">Stay Packages</span>
                  </a>
                </li>
                <li className={activeMenu === 'addons' ? 'active' : ''}>
                  <a href="#" onClick={() => handleMenuItemClick('addDiningpackages')}>
                    <span className="text">Dining Packages</span>
                  </a>
                </li>
                <li className={activeMenu === 'time' ? 'active' : ''}>
                  <a href="#" onClick={() => handleMenuItemClick('time')}>
                    <span className="text">Time Slot and Room Availability</span>
                  </a>
                </li>
                <li className={activeMenu === 'addons' ? 'active' : ''}>
                  <a href="#" onClick={() => handleMenuItemClick('addons')}>
                    <span className="text">Addons</span>
                  </a>
                </li>
                <li className={activeMenu === 'suprise' ? 'active' : ''}>
                  <a href="#" onClick={() => handleMenuItemClick('suprise')}>
                    <span className="text">Surpise Planner</span>
                  </a>
                </li>
              </ul>
            </li>
            <li className={activeMenu === 'agenda' ? 'active' : ''}>
              <a href="#" onClick={() => handleMenuItemClick('agenda')}>
                <i className="icon ph-bold ph-calendar-blank"></i>
                <span className="text">Images</span>
                <i className="arrow ph-bold ph-caret-down"></i>
              </a>
              <ul className="sub-menu" style={{ display: activeMenu === 'agenda' ? 'block' : 'none' }}>
                <li className={activeMenu === 'gallery' ? 'active' : ''}>
                  <a href="#" onClick={() => handleMenuItemClick('gallery')}>
                    <span className="text">Gallery Images</span>
                  </a>
                </li>
                <li className={activeMenu === 'roomimagegallery' ? 'active' : ''}>
                  <a href="#" onClick={() => handleMenuItemClick('roomimagegallery')}>
                    <span className="text"> Offer Banner Images</span>
                  </a>
                </li>
              </ul>
            </li>
            <li className={activeMenu === 'booking' ? 'active' : ''}>
              <a href="#" onClick={() => handleMenuItemClick('booking')}>
                <i className="icon ph-bold ph-chart-bar"></i>
                <span className="text">Orders</span>
                <i className="arrow ph-bold ph-caret-down"></i>
              </a>
              <ul className="sub-menu" style={{ display: activeMenu === 'booking' ? 'block' : 'none' }}>
              <li className={activeMenu === 'booking' ? 'active' : ''}>
                  <a href="#" onClick={() => handleMenuItemClick('booking')}>
                    <span className="text">Order List</span>
                  </a>
                </li>
              </ul>
            </li>
            <li className={activeMenu === 'user' ? 'active' : ''}>
              <a href="#" onClick={() => handleMenuItemClick('user')}>
                <i className="icon ph-bold ph-file-text"></i>
                <span className="text">Users</span>
              </a>
              <ul className="sub-menu" style={{ display: activeMenu === 'user' ? 'block' : 'none' }}>
              <li className={activeMenu === 'notification' ? 'active' : ''}>
                  <a href="#" onClick={() => handleMenuItemClick('notification')}>
                    <span className="text">Notifaction Management </span>
                  </a>
                </li>
                <li className={activeMenu === 'coupon' ? 'active' : ''}>
                  <a href="#" onClick={() => handleMenuItemClick('coupon')}>
                    <span className="text">Coupon Management </span>
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
        {/* <div className="menu">
          <p className="title">Settings</p>
          <ul>
            <li className={activeMenu === 'settings' ? 'active' : ''}>
              <a href="#" onClick={() => handleMenuItemClick('settings')}>
                <i className="icon ph-bold ph-gear"></i>
                <span className="text">Settings</span>
              </a>
            </li>
          </ul>
        </div> */}
        <div className="menu">
          <p className="title">Account</p>
          <ul>
            <li className={activeMenu === 'faq' ? 'active' : ''}>
              <a href="#" onClick={() => handleMenuItemClick('faq')}>
                <i className="icon ph-bold ph-info"></i>
                <span className="text">FAQ</span>
              </a>
            </li>
            <li className={activeMenu === 'logout' ? 'active' : ''}>
              <a
                href="#"
                onClick={() => {
                  handleMenuItemClick('logout');
                  onLogout(); // Call the onLogout function when clicked
                }}
              >
                <i className="icon ph-bold ph-sign-out"></i>
                <span className="text">Logout</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
