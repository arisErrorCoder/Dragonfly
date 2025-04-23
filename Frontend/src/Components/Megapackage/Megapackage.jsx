// src/components/BestSellerFeature.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Megapackage.css';
import { fireDB } from '../Login/firebase';
import { collection, getDocs } from 'firebase/firestore';

const BestSellerFeature = () => {
  const [packageData, setPackageData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPackageData = async () => {
      try {
        const querySnapshot = await getDocs(collection(fireDB, 'Diningpackages'));
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.best_for === 'Group') {
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
      navigate(`/package-inner/${packageData.id}`, { state: { package: packageData } });
    }
  };

  if (!packageData) {
    return <div className="bestseller__loading">Loading...</div>;
  }

  return (
    <div className="bestseller__feature" onClick={handleCardClick}>
      <div className="bestseller__feature-image-container">
        <img 
          src={packageData.images[0]} 
          alt={packageData.name}
          className="bestseller__feature-image"
        />
      </div>
      <div className="bestseller__feature-info">
        <h3>{packageData.name}</h3>
        <p>Rs {packageData.price} Onwards</p>
        <p>{packageData.ratings} Stars</p>
      </div>
    </div>
  );
};

export default BestSellerFeature;