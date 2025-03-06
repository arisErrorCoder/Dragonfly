// src/components/BestSellerFeature.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Megapackage.css';
import { fireDB } from '../Login/firebase'; // Adjust the path as necessary
import { collection, getDocs } from 'firebase/firestore';

const BestSellerFeature = () => {
  const [packageData, setPackageData] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchPackageData = async () => {
      try {
        const querySnapshot = await getDocs(collection(fireDB, 'stayPackages')); // 'stayPackages' is the name of your Firestore collection
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Check if the package is best for group
          if (data.best_for === 'group') {
            setPackageData({ id: doc.id, ...data });
          }
        });
      } catch (error) {
        console.error('Error fetching package data:', error);
      }
    };

    fetchPackageData();
  }, []);

  const handleCardClick = () => {
    if (packageData) {
      // Redirect to the inner page with package data
      navigate(`/package-inner/${packageData.id}`, { state: { package: packageData } });
    }
  };

  if (!packageData) {
    return <p>Loading...</p>; // Display loading message while fetching data
  }

  return (
    <div className="bestseller__feature" onClick={handleCardClick}> {/* Add onClick handler */}
      <div className="bestseller__feature-image">
        <img src={packageData.images[0]} alt={packageData.name} /> {/* Assuming images is an array */}
      </div>
      <div className="bestseller__feature-info">
        <h3 style={{ fontSize: '1.5rem' }}>{packageData.name}</h3>
        <p style={{ fontSize: '1.2rem' }}>Rs {packageData.price} Onwards</p>
        <p style={{ fontSize: '1.2rem' }}>{packageData.ratings} Stars</p>
      </div>
    </div>
  );
};

export default BestSellerFeature;
