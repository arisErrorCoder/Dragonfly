import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChooseForMeBanner.css';
import { fireDB } from '../Login/firebase'; // Firebase configuration
import { collection, getDocs } from 'firebase/firestore'; // Firestore methods
import projectingImage from '../../assets/image2.jpg'; // Ensure correct image path

const ChooseForMeBanner = () => {
  const [packages, setPackages] = useState([]); // Store packages fetched from Firestore
  const navigate = useNavigate(); // React Router hook for navigation

  // Fetch packages from Firestore
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        console.log('Fetching packages from Firestore...');
        const querySnapshot = await getDocs(collection(fireDB, 'Diningpackages')); // Fetch documents from 'Diningpackages' collection
        const packagesArray = [];
        querySnapshot.forEach((doc) => {
          packagesArray.push({
            id: doc.id, // Firestore document ID
            ...doc.data(), // Document data
          });
        });

        console.log('Packages fetched from Firestore:', packagesArray);
        setPackages(packagesArray); // Update state with fetched packages
      } catch (error) {
        console.error('Error fetching packages:', error);
      }
    };

    fetchPackages();
  }, []);

  // Handle random package selection
  const chooseRandomPackage = () => {
    console.log('Current packages:', packages);

    if (packages.length > 0) {
      const randomIndex = Math.floor(Math.random() * packages.length);
      const randomPackage = packages[randomIndex];
      console.log('Redirecting to:', `/package-inner/${randomPackage.id}`);
      navigate(`/package-inner/${randomPackage.id}`);
    } else {
      console.log('No packages available, redirecting to default package ID.');
    }
  };

  return (
    <div className="banner-wrapper">
      {/* Text Section */}
      <div className="text-container">
        <h2 className="heading">Want Us To Choose?</h2>
        <p className="subtext">Let Us Choose a Package for your special day</p>
      </div>

      {/* Image Section */}
      <div className="image-container">
        <img src={projectingImage} alt="Projecting Graphic" />
      </div>

      {/* Button to Choose a Random Package */}
      <button className="button" onClick={chooseRandomPackage}>
        Choose for me
      </button>
    </div>
  );
};

export default ChooseForMeBanner;
