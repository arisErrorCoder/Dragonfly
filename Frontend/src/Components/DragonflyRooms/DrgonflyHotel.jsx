import React, { useState } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import './DrgonflyHotel.css'; // Corrected filename
import Slider from 'rc-slider';
import { useNavigate } from 'react-router-dom';
import 'rc-slider/assets/index.css';

const DragonflyHotel = () => {
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [timeInterval, setTimeInterval] = useState('any');
  const [venue, setVenue] = useState('any');
  const [rating, setRating] = useState('any');
  const [priceRange, setPriceRange] = useState([0, 40000]);
  const [numGuests, setNumGuests] = useState(1);
  const [filteredDiningPackages, setFilteredDiningPackages] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state

  const diningPackages = [
    {
      id: 1,
      roomType: 'Deluxe Suite',
      description: 'A luxurious suite with a king-sized bed, ocean view, and private balcony.',
      pricePerNight: 2500,
      rating: 4.7,
      reviews: 120,
      maxGuests: 2,
      amenities: ['King-sized bed', 'Ocean view', 'Private balcony', 'Mini bar'],
      imageUrls: 'https://lh3.googleusercontent.com/p/AF1QipOUysyQnL6WEahG4zeOfstU0IIv3nN9nyI7Z-20=s1360-w1360-h1020'
    },
    {
      id: 2,
      roomType: 'Executive Room',
      description: 'A spacious room with modern amenities and a comfortable work area.',
      pricePerNight: 1800,
      rating: 4.5,
      reviews: 85,
      maxGuests: 2,
      amenities: ['King-sized bed', 'Desk', 'Free Wi-Fi', 'Coffee maker'],
      imageUrls: 'https://lh3.googleusercontent.com/p/AF1QipNzw_3IaMJw0I8s6JNujzerdNLKsTQiW3_ANZKr=s1360-w1360-h102'
    },
    {
      id: 3,
      roomType: 'Standard Room',
      description: 'A cozy room perfect for a short stay with essential amenities.',
      pricePerNight: 1200,
      rating: 4.2,
      reviews: 60,
      maxGuests: 2,
      amenities: ['Queen-sized bed', 'Flat-screen TV', 'Mini fridge'],
      imageUrls: 'https://lh3.googleusercontent.com/p/AF1QipOwLTSnnFoucJhdYNyZOxa3-orvvbjVRHvpppOT=s1360-w1360-h1020'
    },
    {
      id: 4,
      roomType: 'Presidential Suite',
      description: 'An opulent suite with a private dining area, jacuzzi, and stunning views.',
      pricePerNight: 5000,
      rating: 5.0,
      reviews: 15,
      maxGuests: 4,
      amenities: ['King-sized bed', 'Jacuzzi', 'Private dining area', 'Panoramic views'],
      imageUrls: 'https://lh3.googleusercontent.com/p/AF1QipMCTdjNFqlWWpsJF_g6JiRHQ4A5jI91SevKeO_A=s1360-w1360-h1020'
    },
    {
      id: 5,
      roomType: 'Family Suite',
      description: 'A spacious suite designed for families with multiple bedrooms and a living area.',
      pricePerNight: 3500,
      rating: 4.6,
      reviews: 30,
      maxGuests: 4,
      amenities: ['Two bedrooms', 'Living area', 'Kitchenette', 'Children’s amenities'],
      imageUrls: 'https://lh3.googleusercontent.com/p/AF1QipO_CyGO336Ox-agnQ1azfKSHpYlUzcLX7CV6Pd4=s1360-w1360-h1020'
    },
    {
      id: 6,
      roomType: 'Honeymoon Suite',
      description: 'A romantic suite with a private balcony, jacuzzi, and special honeymoon package.',
      pricePerNight: 3000,
      rating: 4.8,
      reviews: 40,
      maxGuests: 2,
      amenities: ['Jacuzzi', 'Private balcony', 'Romantic decor', 'Complimentary champagne'],
      imageUrls: 'https://lh3.googleusercontent.com/p/AF1QipOAoPor2hUkiuEN05mYboRYtSWxmYwcchvZk5UC=s1360-w1360-h1020'
    },
    {
      id: 7,
      roomType: 'Business Suite',
      description: 'A well-equipped suite for business travelers with a conference table and high-speed internet.',
      pricePerNight: 2200,
      rating: 4.4,
      reviews: 50,
      maxGuests: 2,
      amenities: ['Conference table', 'High-speed internet', 'Business center access'],
      imageUrls: 'https://lh3.googleusercontent.com/p/AF1QipPo2sPnUcVIYaB0iLyekMJJKlB4yDccWDPp2Evl=s1360-w1360-h1020'
    },
    {
      id: 8,
      roomType: 'Garden View Room',
      description: 'A peaceful room overlooking the hotel’s lush garden with private balcony.',
      pricePerNight: 1500,
      rating: 4.3,
      reviews: 75,
      maxGuests: 2,
      amenities: ['Garden view', 'Private balcony', 'Coffee maker'],
      imageUrls: 'https://lh3.googleusercontent.com/p/AF1QipMzPKjwAD6yf2XlC10xqt6ASOUhW7m_PZV7vFPQ=s1360-w1360-h1020'
    },
    {
      id: 9,
      roomType: 'Ocean View Room',
      description: 'A room with breathtaking views of the ocean, featuring a spacious balcony.',
      pricePerNight: 2000,
      rating: 4.6,
      reviews: 90,
      maxGuests: 2,
      amenities: ['Ocean view', 'Spacious balcony', 'Mini bar'],
      imageUrls: 'https://lh3.googleusercontent.com/p/AF1QipPZ_LnUS89s6zWhAO_EO3eg_YPQzh1f0rpz6dAD=s1360-w1360-h1020'
    },
    {
      id: 10,
      roomType: 'Luxury Suite',
      description: 'A top-tier suite with elegant furnishings, a large living area, and luxurious amenities.',
      pricePerNight: 4000,
      rating: 4.9,
      reviews: 20,
      maxGuests: 3,
      amenities: ['Large living area', 'Luxury furnishings', 'Private balcony'],
      imageUrls: 'https://lh3.googleusercontent.com/p/AF1QipPZoO3ezeHXuxVpddx1etmi0l_ZjmTWQku_3cpY=s1360-w1360-h1020'
    },
    {
      id: 11,
      roomType: 'Penthouse Suite',
      description: 'The ultimate luxury suite with panoramic city views, a private terrace, and butler service.',
      pricePerNight: 6000,
      rating: 5.0,
      reviews: 10,
      maxGuests: 4,
      amenities: ['Panoramic city views', 'Private terrace', 'Butler service'],
      imageUrls: 'https://lh3.googleusercontent.com/p/AF1QipOAoPor2hUkiuEN05mYboRYtSWxmYwcchvZk5UC=s1360-w1360-h1020'
    }
  ];
  
  const navigate = useNavigate();

  const handleSearch = () => {
    setLoading(true); // Show loading spinner

    setTimeout(() => { // Simulate loading time
      const results = diningPackages.filter((pkg) => {
        const matchesVenue = venue === 'any' || (pkg.venue && pkg.venue.toLowerCase() === venue.toLowerCase());
        const matchesPrice = pkg.pricePerNight >= priceRange[0] && pkg.pricePerNight <= priceRange[1];
        const matchesCapacity = pkg.maxGuests >= numGuests;
        const matchesRating = rating === 'any' || pkg.rating >= parseFloat(rating);

        return matchesVenue && matchesPrice && matchesCapacity && matchesRating;
      }).sort((a, b) => a.pricePerNight - b.pricePerNight);

      setFilteredDiningPackages(results);
      setLoading(false); // Hide loading spinner
    }, 1000); // Simulated delay
  };

  const handleCardClick = (pkg) => {
    navigate('/product-details', { state: { pkg } });
  };

  const handlePriceRangeChange = (range) => {
    setPriceRange(range);
  };

  const handleResetFilters = () => {
    setTimeInterval('any');
    setVenue('any');
    setRating('any');
    setPriceRange([0, 40000]);
    setNumGuests(1);
    setFilteredDiningPackages([]);
  };

  const handleSortChange = (order) => {
    const sortedPackages = [...filteredDiningPackages].sort((a, b) => {
      if (order === 'ascending') return a.pricePerNight - b.pricePerNight;
      if (order === 'descending') return b.pricePerNight - a.pricePerNight;
      return 0;
    });
    setFilteredDiningPackages(sortedPackages);
  };

  return (
    <>
      <div className="hotel-container">
        <div className="drgonfly-hotel-container">
          <img src="https://lh3.googleusercontent.com/p/AF1QipO4tljjoDGE_T7w4gZm3cB6QLzygwGbhKMCJs17=s1360-w1360-h1020" alt="Dragonfly Hotel" />
        </div>
        <div className="search-bar">
          <div className="date-input">
            <label htmlFor="check-in">Check-In</label>
            <Flatpickr
              id="check-in"
              options={{ dateFormat: 'Y-m-d', minDate: 'today' }}
              value={checkInDate}
              onChange={([date]) => setCheckInDate(date)}
              placeholder="Select Check-In Date"
            />
          </div>

          <div className="date-input">
            <label htmlFor="check-out">Check-Out</label>
            <Flatpickr
              id="check-out"
              options={{ dateFormat: 'Y-m-d', minDate: checkInDate || 'today' }}
              value={checkOutDate}
              onChange={([date]) => setCheckOutDate(date)}
              placeholder="Select Check-Out Date"
            />
          </div>

          <div className="room-guests">
            <label htmlFor="guests">Guests</label>
            <select
              id="guests"
              value={numGuests}
              onChange={(e) => setNumGuests(Number(e.target.value))}
            >
              <option value={1}>1 Adult</option>
              <option value={2}>2 Adults</option>
              <option value={3}>3 Adults</option>
              <option value={4}>4 Adults</option>
              <option value={5}>5 Adults</option>
            </select>
          </div>

          <button className="book-now" onClick={handleSearch}>Search</button>
        </div>
      </div>
      <div className="Dining-container">
        <aside className="Sidebar">
          <h2>Filter Options</h2>
          <div className="filter-options">
            <div className="filter-section">
              <label htmlFor="time-interval">Room Type:</label>
              <select
                id="time-interval"
                value={timeInterval}
                onChange={(e) => setTimeInterval(e.target.value)}
              >
                <option value="any">Any</option>
                <option value="Room">Room</option>
                <option value="Smart Room">Smart Room</option>
              </select>
            </div>

            <div className="filter-section">
              <label htmlFor="rating">Rating:</label>
              <select
                id="rating"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              >
                <option value="any">Any</option>
                <option value="4">4 Stars and up</option>
                <option value="4.5">4.5 Stars and up</option>
                <option value="5">5 Stars only</option>
              </select>
            </div>

            <div className="sort-buttons filter-section">
              <button onClick={() => handleSortChange('ascending')}>Sort by Price: Low to High</button>
              <button onClick={() => handleSortChange('descending')}>Sort by Price: High to Low</button>
            </div>

            {/* <div className="filter-section">
              <label>Price Range:</label>
              <Slider
                range
                min={0}
                max={40000}
                value={priceRange}
                onChange={handlePriceRangeChange}
                marks={{ 0: '₹0', 40000: '₹40,000' }}
              />
            </div> */}
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
          </div>
          <button onClick={handleResetFilters}>Reset Filters</button>
        </aside>
        <main className="restaurant-list">
          <h1>Dragonfly Hotel Booking</h1>
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          ) : (
            <div className="cards-container">
              {filteredDiningPackages.map((pkg) => (
                <div className="Card" key={pkg.id} onClick={() => handleCardClick(pkg)}>
                  <img className="card-image" src={pkg.imageUrls} alt={pkg.roomType} />
                  <div className="card-content">
                    <h3 className="card-title">{pkg.roomType}</h3>
                    <p className="card-price">Price: ₹{pkg.pricePerNight}</p>
                    <p className="card-description">{pkg.description || "No description available"}</p>
                    <p className="card-rating">Rating: {pkg.rating || "No ratings"}</p>
                    <button className="card-button">Book Now</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default DragonflyHotel;



