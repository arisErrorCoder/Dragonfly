import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { fireDB } from '../Login/firebase'; // Import your Firestore config
import Categories from '../Categories/Categories';
import Products from '../Products/Products';
import './SuprisePlannerHome.css';
import logooImage from '../../assets/Header/logo.png';

const SuprisePlannerHome = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // State for categories
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 50000]); // Default price range for filtering products
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      setLoading(true);
      
      // Fetch products 
      const productsSnapshot = await getDocs(collection(fireDB, "surpriseplannerpackages"));
      const productsList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsList);
      
      // Fetch categories
      const categoriesSnapshot = await getDocs(collection(fireDB, "categories")); // Adjust the collection name as needed
      const categoriesList = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(categoriesList);
      
      setLoading(false);
    };

    fetchProductsAndCategories();
  }, []);

  // Filter products based on the selected category and price range
  const filteredProducts = products.filter(product => {
    const isInCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const isInPriceRange = product.price >= priceRange[0] && product.price <= priceRange[1];
    return isInCategory && isInPriceRange; // Combine category and price filters
  });

  return (
    <div className="app-container">
      <Categories 
        categories={categories} // Pass the fetched categories
        onSelectCategory={setSelectedCategory} // Pass the correct function to change selected category
        onPriceChange={setPriceRange} // Pass the price range change function
        />
        {loading ? (
          <div className="loading-container">
                  <div className="spinner">
                      <img src={logooImage} alt="Loading..." className="spinner-image" />
                  </div>
              </div>
        ) : (
        <Products products={filteredProducts} />
      )}
    </div>
  );
};

export default SuprisePlannerHome;
