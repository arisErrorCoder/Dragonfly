import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { fireDB } from '../Login/firebase'; // Assuming firebase is set up in a separate file
import './DiningBooking.css';
import '../SuprisePlannerHome/SuprisePlannerHome.css';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import logooImage from '../../assets/Header/logo.png';

const DiningBooking = () => {
  const [timeInterval, setTimeInterval] = useState('any');
  const [venue, setVenue] = useState('any');
  const [bestFor, setBestFor] = useState('any'); // New filter for "Best for"
  const [diningPackages, setDiningPackages] = useState([]); // Stores dining packages fetched from Firestore
  const [sortOrder, setSortOrder] = useState('ascending');
  const [priceRange, setPriceRange] = useState([0, 40000]); // Default price range
  const [loading, setLoading] = useState(true); // Loading state
  

    const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getDocs(collection(fireDB, 'Diningpackages'));
      setDiningPackages(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      setLoading(false);
    };
    fetchData();

      
    // Check for the venue and best for passed through navigation state and set them
        if (location.state && location.state.venue) {
          setVenue(location.state.venue); // Set the venue based on navigation state
          setBestFor(location.state.bestFor); // Set the best for based on navigation state
        }
      }, [location.state]);
    
      const filterRestaurants = () => {
        return diningPackages
          .filter((pkg) => {
            // Check venue
            const matchesVenue = venue === 'any' || pkg.venue.toLowerCase() === venue.toLowerCase();
            
            // Check price
            const price = pkg.price || 0;
            const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
            
            // Check duration
            const matchesDuration = timeInterval === 'any' || pkg.duration === timeInterval;
      
            // Check "Best for" with partial matching
            const matchesBestFor = 
              bestFor === 'any' || 
              (pkg.best_for && pkg.best_for.toLowerCase().includes(bestFor.toLowerCase()));
      
            return matchesVenue && matchesPrice && matchesDuration && matchesBestFor;
          })
          .sort((a, b) => {
            if (sortOrder === 'ascending') {
              return a.price - b.price;
            } else {
              return b.price - a.price;
            }
          });
      };
      

  const handleCardClick = (pkg) => {
    navigate('/dining-inner', { state: { pkg } });
  };
  // Handle sort change
  const handleSortChange = (order) => {
    setSortOrder(order);
  };

  // Handle price range change
  const handlePriceRangeChange = (range) => {
    setPriceRange(range);
  };

  // Handle "Best for" filter change
  const handleBestForChange = (e) => {
    setBestFor(e.target.value);
  };

      // Reset filters to default values
      const resetFilters = () => {
        setTimeInterval('any');
        setVenue('any');
        setBestFor('any');
        setPriceRange([0, 40000]);
      };

  if (loading) {
    return (
        <div className="loading-container">
            <div className="spinner">
                <img src={logooImage} alt="Loading..." className="spinner-image" />
            </div>
        </div>
    );
}

  return (
    <div className="Dining-container">
      <aside className="Sidebar">
        <h2>Filter Options</h2>
        <div className="filter-options">
          <label htmlFor="time-interval">Duration:</label>
          <select
            id="time-interval"
            value={timeInterval}
            onChange={(e) => setTimeInterval(e.target.value)}
          >
            <option value="any">Any</option>
            <option value="3 HOURS">3 hours</option>
            <option value="4 HOURS">4 hours</option>
          </select>
  
          <label htmlFor="venue">Venue Type:</label>
          <select
            id="venue"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
          >
            <option value="any">Any</option>
            <option value="room">Room</option>
            <option value="restaurant">Restaurant</option>
            <option value="rooftop">Rooftop</option>
            <option value="outdoor">Outdoor</option>
          </select>
  
          <label htmlFor="best-for">Best For:</label>
          <select
            id="best-for"
            value={bestFor}
            onChange={(e) => setBestFor(e.target.value)}
          >
            <option value="any">Any</option>
            <option value="birthday">Birthday</option>
            <option value="anniversary">Anniversary</option>
            <option value="proposal">Proposal</option>
            <option value="moviedate">Movie Date</option>
            <option value="group">Group</option>
          </select>
  
          <div className="sort-buttons">
            <button onClick={() => handleSortChange('ascending')}>Sort by Price: Low to High</button>
            <button onClick={() => handleSortChange('descending')}>Sort by Price: High to Low</button>
          </div>
  
          {/* Price range slider */}
          <div className="price-slider">
            <h3>Price Range</h3>
            <Slider
              range
              min={0}
              max={40000}
              value={priceRange}
              onChange={handlePriceRangeChange}
              marks={{
                0: '₹0',
                40000: '₹40000'
              }}
            />
            <div className="price-range-values">
              <span>Min Price: ₹{priceRange[0]}</span>
              <span>Max Price: ₹{priceRange[1]}</span>
            </div>
          </div>
          {/* Reset Filter Button */}
          <div className="reset-button">
            <button onClick={resetFilters}>Reset Filters</button>
          </div>
        </div>
      </aside>
  
      <main className="restaurant-list">
        <h1>Romantic Dining</h1>
        <div className="cards-container">
          {filterRestaurants().length > 0 ? (
            filterRestaurants().map((pkg) => (
              <div className="Card" key={pkg.id} onClick={() => handleCardClick(pkg)}>
                <img src={pkg.images[0]} alt={pkg.packageName} />
                <h3>{pkg.name}</h3>
                <p>Venue: {pkg.venue.charAt(0).toUpperCase() + pkg.venue.slice(1)}</p>
                <p>Best For: {pkg.best_for}</p>
                <p>Starting @ ₹{pkg.price}</p>
                <button>Book Now</button>
              </div>
            ))
          ) : (
            <p style={{textAlign:"center", width:"100%"}}>No dining packages found for the selected filters.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default DiningBooking;



// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { collection, getDocs } from 'firebase/firestore';
// import { fireDB } from '../Login/firebase'; // Assuming firebase is set up in a separate file
// import './DiningBooking.css';
// import Slider from 'rc-slider';
// import 'rc-slider/assets/index.css';

// const DiningBooking = () => {
//   const [timeInterval, setTimeInterval] = useState('any');
//   const [venue, setVenue] = useState('any');
//   const [bestFor, setBestFor] = useState('any');
//   const [diningPackages, setDiningPackages] = useState([]);
//   const [sortOrder, setSortOrder] = useState('ascending');
//   const [priceRange, setPriceRange] = useState([0, 40000]);
//   const [loading, setLoading] = useState(true);

//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       const data = await getDocs(collection(fireDB, 'Diningpackages'));
//       setDiningPackages(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
//       setLoading(false);
//     };
//     fetchData();

//     // Check for the venue passed through navigation state and set it
//     if (location.state && location.state.venue) {
//       setVenue(location.state.venue); // Set the venue based on navigation state
//     }
//   }, [location.state]);

//   const filterRestaurants = () => {
//     return diningPackages.filter((pkg) => {
//       const matchesVenue = venue === 'any' || pkg.venue.toLowerCase() === venue.toLowerCase();
//       const price = pkg.price || 0;
//       const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
//       const matchesDuration = timeInterval === 'any' || pkg.duration === timeInterval;
//       const matchesBestFor = bestFor === 'any' || pkg.best_for?.toLowerCase() === bestFor.toLowerCase();

//       return matchesVenue && matchesPrice && matchesDuration && matchesBestFor;
//     }).sort((a, b) => {
//       if (sortOrder === 'ascending') {
//         return a.price - b.price;
//       } else {
//         return b.price - a.price;
//       }
//     });
//   };

//   const handleCardClick = (pkg) => {
//     navigate('/dining-inner', { state: { pkg } });
//   };

//   const handleSortChange = (order) => {
//     setSortOrder(order);
//   };

//   const handlePriceRangeChange = (range) => {
//     setPriceRange(range);
//   };

//   const handleBestForChange = (e) => {
//     setBestFor(e.target.value);
//   };

//   const resetFilters = () => {
//     setTimeInterval('any');
//     setVenue('any');
//     setBestFor('any');
//     setPriceRange([0, 40000]);
//   };

//   if (loading) {
//     return (
//       <div className="loading-container">
//         <div className="spinner">
//           <img src={logooImage} alt="Loading..." className="spinner-image" />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="Dining-container">
//       <aside className="Sidebar">
//         <h2>Filter Options</h2>
//         <div className="filter-options">
//           <label htmlFor="time-interval">Duration:</label>
//           <select
//             id="time-interval"
//             value={timeInterval}
//             onChange={(e) => setTimeInterval(e.target.value)}
//           >
//             <option value="any">Any</option>
//             <option value="3 HOURS">3 hours</option>
//             <option value="4 HOURS">4 hours</option>
//           </select>

//           <label htmlFor="venue">Venue Type:</label>
//           <select
//             id="venue"
//             value={venue}
//             onChange={(e) => setVenue(e.target.value)}
//           >
//             <option value="any">Any</option>
//             <option value="room">Room</option>
//             <option value="restaurant">Restaurant</option>
//             <option value="rooftop">Rooftop</option>
//             <option value="outdoor">Outdoor</option>
//           </select>

//           <label htmlFor="best-for">Best For:</label>
//           <select
//             id="best-for"
//             value={bestFor}
//             onChange={handleBestForChange}
//           >
//             <option value="any">Any</option>
//             <option value="couples">Couples</option>
//             <option value="family">Family</option>
//             <option value="group">Group</option>
//           </select>

//           <h4>Price Range</h4>
//           <Slider
//             range
//             value={priceRange}
//             min={0}
//             max={40000}
//             onChange={handlePriceRangeChange}
//           />
//           <div>
//             <span>Min: {priceRange[0]} </span>
//             <span>Max: {priceRange[1]} </span>
//           </div>

//           <button onClick={resetFilters}>Reset Filters</button>
//         </div>
//       </aside>

//       <div className="packages-container">
//         <h1>Dining Packages</h1>
//         <div className="sort-options">
//           <button onClick={() => handleSortChange('ascending')}>Sort by Price (Low to High)</button>
//           <button onClick={() => handleSortChange('descending')}>Sort by Price (High to Low)</button>
//         </div>

//         <div className="packages">
//           {filterRestaurants().map((pkg) => (
//             <div key={pkg.id} className="package-card" onClick={() => handleCardClick(pkg)}>
//               <img src={pkg.images[0]} alt={pkg.name} />
//               <h3>{pkg.name}</h3>
//               <p>Price: {pkg.price}</p>
//               <p>Best For: {pkg.best_for}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DiningBooking;
