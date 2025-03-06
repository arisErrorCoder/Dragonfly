import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { fireDB } from '../Login/firebase';  // Assuming you have configured Firebase
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import './Bestsellers.css';

const Bestsellers = () => {
  const [bestsellers, setBestsellers] = useState([]);
  const navigate = useNavigate();  // Initialize the navigate function

  // Fetch top-rated packages from Firebase Firestore
  const fetchBestsellers = async () => {
    const q = query(
      collection(fireDB, 'stayPackages'), // Replace 'packages' with your Firestore collection
      where('ratings', '>=', 4),     // Filter by rating >= 4.0
      limit(4)                        // Limit to 4 results
    );

    const querySnapshot = await getDocs(q);
    const packagesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })); // Include doc.id
    setBestsellers(packagesData);
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchBestsellers();
  }, []);

  // Function to handle navigation to individual package page
  const handlePackageClick = (id) => {
    navigate(`/package-inner/${id}`);  // Redirect to the package detail page
  };

  return (
    <div>
      <div className="heading-container">
        <h2>OUR MOST LOVED AND HEARTED BESTSELLERS</h2>
      </div>
      <div className="containerr">
        {bestsellers.map((pkg) => (
          <div className="package-boxx" key={pkg.id} onClick={() => handlePackageClick(pkg.id)}>
            <img src={pkg.images} alt={pkg.name} className="package-image" />
            <div className="package-details">
              <h3 className="package-name">{pkg.name}</h3>
              <p className="package-price">{pkg.price}</p>
              <p className="package-rating">{pkg.ratings} Stars</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bestsellers;
