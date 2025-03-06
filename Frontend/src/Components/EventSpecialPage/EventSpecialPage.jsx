import React, { useState, useEffect } from 'react';
import { FaHeart } from 'react-icons/fa'; 
import { fireDB } from '../Login/firebase';  // Firebase configuration
import { collection, getDocs } from 'firebase/firestore';  // Firestore methods
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './EventSpecialPage.css';

// Component for rendering a section of packages
const PackagesSection = ({ title, packages }) => {
  const [viewAll, setViewAll] = useState(false);
  const [liked, setLiked] = useState(Array(packages.length).fill(false));
  const navigate = useNavigate(); // Initialize useNavigate for redirection

  const toggleLike = (index) => {
    setLiked(liked.map((like, i) => (i === index ? !like : like)));
  };

  // Handle redirection to individual package pages
  const handlePackageClick = (pkg) => {
    navigate(`/package-inner/${pkg.id}`, { state: { package: pkg } });
  };

  return (
    <div className="packages-section">
      <div className="packages-header">
        <h3 className="section-title">{title}</h3>
        <button className="view-all-button" onClick={() => setViewAll(!viewAll)}>
          {viewAll ? 'View Less' : 'View All'}
        </button>
      </div>
      <div className="packages-grid">
        {packages.slice(0, viewAll ? packages.length : 4).map((pkg, index) => (
          <div className="package-card" key={index} onClick={() => handlePackageClick(pkg)}>
            {/* <FaHeart
              className={`heart-icon ${liked[index] ? 'liked' : ''}`}
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering navigation when liking a package
                toggleLike(index);
              }}
            /> */}
            <img src={pkg.images} alt={`Package ${index + 1}`} className="package-imagee" />
            <div className="package-info">
              <div className="package-name">{pkg.name}</div>
              <div className="package-price">Rs {pkg.price}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main EventSpecialPage component
const EventSpecialPage = () => {
  const [romanticPackages, setRomanticPackages] = useState([]);
  const [candleDinnerPackages, setCandleDinnerPackages] = useState([]);

  // Fetch romantic getaway packages from Firebase
  const fetchRomanticPackages = async () => {
    const querySnapshot = await getDocs(collection(fireDB, 'stayPackages'));
    const packages = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })); // Include ID for redirection
    setRomanticPackages(packages);
  };

  // Fetch candle dinner packages from Firebase
  const fetchCandleDinnerPackages = async () => {
    const querySnapshot = await getDocs(collection(fireDB, 'Diningpackages'));
    const packages = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })); // Include ID for redirection
    setCandleDinnerPackages(packages);
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchRomanticPackages();
    fetchCandleDinnerPackages();
  }, []);

  return (
    <>
      <div className="heading-container">
        <h2 className="page-title">OUR WELL CRAFTED ROMANTIC GATEWAYS</h2>
      </div>
      <div className="event-special-page">
        <div className="packages-container">
          <PackagesSection title="Romantic Stays" packages={romanticPackages} />
          <PackagesSection title="Romantic Dining" packages={candleDinnerPackages} />
        </div>
      </div>
    </>
  );
};

export default EventSpecialPage;
