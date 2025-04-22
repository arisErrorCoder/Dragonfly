import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import "./DiningInnerPage.css"
import { collection, getDocs, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { fireDB } from '../Firebase/Firebase'; // Import your firebase config file
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faComment } from '@fortawesome/free-solid-svg-icons';
import { getAuth } from 'firebase/auth'; // Import getAuth from Firebase

// Default images
import image1 from '../../assets/ImageGallery/image1.jpg';
import image2 from '../../assets/ImageGallery/image2.jpg';
import image3 from '../../assets/ImageGallery/image3.jpg';
import image4 from '../../assets/ImageGallery/image4.jpg';

import reviewerImage from '../../assets/profile-user.png';
import similarImage from '../../assets/Reviews/similar.jpg';
import { useCart} from '../Context/CartContext';

const DinningInnerPage = () => {
  const auth = getAuth(); // Ensure the auth is initialized here
  const [activeIndex, setActiveIndex] = useState(null);
  const [isCartVisible, setCartVisible] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [timesOpened, setTimesOpened] = useState(0); // State to track open count
  const [thankYouMessage, setThankYouMessage] = useState(''); // State for thank you message

    const location = useLocation();
    const navigate = useNavigate();
    const { pkg } = location.state || {};
    const { UpdateCart , cartData} = useCart();




    useEffect(() => {
      const fetchReviews = async () => {
        try {
          const packageRef = doc(fireDB, "Diningpackages", pkg.id);
          const reviewsSnapshot = await getDocs(collection(packageRef, "reviews"));
          const fetchedReviews = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          await updateDoc(packageRef, { times_opened: increment(1) }); // Increment the field by 1
        setTimesOpened(prev => prev + 1); // Update local state
          setReviews(fetchedReviews);
        } catch (error) {
          console.error("Error fetching reviews: ", error);
        }
      };
      fetchReviews();
    }, [pkg.id]);
    

  useEffect(() => {
    window.scrollTo(0, 0); // Scrolls to the top
}, []);

  const [mainImage, setMainImage] = useState(pkg.images || image1);
  const [images , SetImages]=useState(pkg.images)
  const cards = [
    {
      title: "What's Included",
      content: <ul>{pkg.inclusions.map((item, index) => <li  className='cardss-li' key={index}>{item}</li>)}</ul>,
    },
    {
      title: "What's Exclusion",
      content: <ul>{pkg.exclusions.map((item, index) => <li  className='cardss-li' key={index}>{item}</li>)}</ul>,
    },
    {
      title: "Good To Know",
      content: <ul>{pkg.good_to_know.map((item, index) => <li  className='cardss-li' key={index}>{item}</li>)}</ul>,
    },
    {
      title: "Cancellation and Refund Policy",
      content: <ul>{pkg.Cancellation_and_Refund_Policy.map((item, index) => <li  className='cardss-li' key={index}>{item}</li>)}</ul>,
    },
    {
      title: "Other Useful Info",
      content: <ul>{pkg.special_features.map((item, index) => <li className='cardss-li' key={index}>{item}</li>)}</ul>,
    },
  ];
  
  useEffect(() => {
    console.log(cartData)
  }, [])
  

  const [addons, setAddons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    rating: 2,
    comment: '',
  });

  const sliderRef = useRef(null);
  const sliderRef2 = useRef(null);

  useEffect(() => {
    const fetchAddons = async () => {
      try {
        const querySnapshot = await getDocs(collection(fireDB, 'addons'));
        const addonsArray = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAddons(addonsArray);
      } catch (error) {
        console.error('Failed to fetch addons:', error);
      }
    };

    fetchAddons();
  }, []);



  const scrollLeft = () => {
    sliderRef.current.scrollLeft -= 300; // Adjust the scroll amount as needed
  };

  const scrollRight = () => {
    sliderRef.current.scrollLeft += 300;
  };
  const scrollLeftt = () => {
    sliderRef2.current.scrollLeft -= 300; // Adjust the scroll amount as needed
  };

  const scrollRightt = () => {
    sliderRef2.current.scrollLeft += 300;
  };
  const handleToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const isUserLoggedIn = () => {
    if (!auth) {
      console.error('Firebase auth is not initialized');
      return false;
    }
    const user = auth.currentUser;
    return user ? true : false;
  };
  

const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Check if the user is logged in
    if (!isUserLoggedIn()) {
      navigate('/login' ); // Redirect to login if not authenticated
        return;
    }

    const today = new Date().toISOString().split("T")[0];
    const reviewToAdd = { ...newReview, date: today, imgSrc: "" };

    // Add the new review to the state
    setReviews([...reviews, reviewToAdd]);

    // Reset the new review form
    setNewReview({ name: "", rating: 3, comment: "" });
};
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview({
      ...newReview,
      [name]: name === "rating" ? Number(value) : value,
    });
  };

  // Determine reviews to display (limited to 3 unless 'showAll' is true)
  const reviewsToDisplay = showAll ? reviews : reviews.slice(0, 3);

  const handleBookingPage = () => {
    // Prepare the data to pass
    const packagePrice = Number(pkg.price) || 0; // Ensure packagePrice is a number
    const totalPrice = packagePrice + selectedAddons.reduce((sum, addon) => sum + Number(addon.price), 0);
  
    const bookingData = {
      packageName: pkg.name,
      image: mainImage,
      packageType: pkg.packageType,  // ✅ corrected key name here
      desc: pkg.description,
      price: packagePrice,
      rating: pkg.ratings,
      addons: selectedAddons,
      venue: pkg.venue,
    };
    
    console.log("Booking Data:", bookingData); // 🔍 Console the data here
    
    UpdateCart(bookingData);
    
    // Navigate to booking page and pass data
    navigate('/booking', { state: { bookingData } });
    
  };



  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviews.length).toFixed(1);
  };

  const averageRating = calculateAverageRating();
  // const reviewsToDisplay = showAllReviews ? reviews : reviews.slice(0, 3);







  const handleAddonChange = (addonId, checked) => {
    if (checked) {
      const selectedAddon = addons.find(addon => addon.id === addonId);
      setSelectedAddons([...selectedAddons, selectedAddon]);
      setCartVisible(true); // Open the cart when any addon is selected
    } else {
      setSelectedAddons(selectedAddons.filter(addon => addon.id !== addonId));
    }
  };

  const updateCart = () => {
    const packagePrice = Number(pkg.price) || 0; // Ensure packagePrice is a number
    let total = packagePrice;
    const items = [{ name: 'Package Price', price: packagePrice }, ...selectedAddons.map(addon => ({
      name: addon.name,
      price: Number(addon.price) // Ensure price is a number
    }))];
  
    setCartItems(items);
    
    // Ensure total is a number and calculate the total
    total += selectedAddons.reduce((sum, addon) => sum + Number(addon.price), 0);
  
    // Convert total to a number before calling toFixed()
    const formattedTotal = Number(total).toFixed(2);
    
    const cartItemsContainer = document.querySelector('.cart-items');
    if (cartItemsContainer) {
      cartItemsContainer.innerHTML = '';
      items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        itemElement.innerHTML = `
          <span>${item.name}</span>
          <span>₹${Number(item.price).toFixed(2)}</span>
        `;
        cartItemsContainer.appendChild(itemElement);
      });
      const cartTotalElement = document.getElementById('cart-total');
      if (cartTotalElement) {
        cartTotalElement.textContent = `₹${formattedTotal}`;
      }
    }
  };
  

  const toggleCart = () => {
    setCartVisible(prevState => !prevState);
  };

  useEffect(() => {
    updateCart();
  }, [selectedAddons, pkg.price]);


  return (
    <>
      <div className="gallery-wrapper">
      <div className="preview-section">
      <img src={mainImage} alt={pkg.name || 'Main View'} />
        </div>
        <div className="thumbnail-section">
        {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Thumbnail ${index}`}
              onClick={() => setMainImage(image)}
              className={mainImage === image ? 'thumbnail-active' : ''}
            />
          ))}
        </div>

        <div className="details-wrapper">
        <h1>{pkg.name}</h1>
        <h3>{pkg.venue}</h3>
        <div className="carousel-section">
        <Carousel showThumbs={false}>
              {images.map((image, index) => (
                <div key={index}>
                  <img src={image} alt={`Slide ${index}`} />
                </div>
              ))}
            </Carousel>
          </div>
          <h4>{pkg.description || 'Designed to be a haven for the senses and an oasis of luxury.'}</h4>
          <p className="product-pricee">₹{pkg.price}/-</p>
          <div className="rating-wrapper">
            <span>
              {[...Array(Math.round(averageRating))].map((_, i) => <i key={i} className="fa-solid fa-star"></i>)}
            </span>
            <span>{reviews.length} Reviews</span>
          </div>
          <div className="button-actions">
            <a href="tel:9944894722" className="call">
              <button>
                <FontAwesomeIcon icon={faPhone} /> Tap to call
              </button>
            </a>
            <a href="https://wa.me/9944894722" className="text">
              <button>
                <FontAwesomeIcon icon={faComment} /> Tap to text
              </button>
            </a>
          </div>
          <p className="product-description">
          {pkg.best_for}
          </p>
        </div>
      </div>
      <div className="br-scroll-note">
  <p className="br-scroll-text">Scroll down to choose preferred addons and start Booking</p>
  <div className="br-scroll-arrow">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 10L12 15L17 10" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
</div>
      {/* Additional Information Cards */}
      <div className="Additional-Information-card-container">
        {cards.map((card, index) => (
          <div key={index} className="card" onClick={() => handleToggle(index)}>
            <div className="card-header">
              <h2>{card.title}</h2>
              <span className="toggle-icon">{activeIndex === index ? '-' : '+'}</span>
            </div>
            {activeIndex === index && <p className="card-content">{card.content}</p>}
          </div>
        ))}
      </div>
          <div className="Addons-slider-container">
    <button className="prev-btn" onClick={scrollLeftt}>
        &#10094;
      </button>
      <div className="slider" ref={sliderRef2}>
        {addons.map((addon) => (
          <div className="product-cards" key={addon.id}>
            {/* Displaying the addon image, name, and price */}
            <img
              src={addon.image || 'https://via.placeholder.com/150'} // Use addon.image if available
              alt={addon.name}
              className="product-image"
            />
            <h3>{addon.name}</h3>
            <p>{`₹${addon.price}`}</p>
            <div className="booking-section">
              <input type="checkbox" onChange={(e) => handleAddonChange(addon.id, e.target.checked)} id={`booking-${addon.id}`} />
              <label htmlFor={`booking-${addon.id}`}>Add to Booking</label>
            </div>
          </div>
        ))}
      </div>
      <button className="next-btn" onClick={scrollRightt}>
        &#10095;
      </button>
    </div>

    <div style={{display:"flex",alignItems:"center",justifyContent:"center",margin:"10px 0px"}}>
  <button onClick={handleBookingPage} style={{padding:"10px 50px",fontSize:"17px",backgroundColor:"red"}}>
    Go to Booking Page
  </button>
</div>


      {/* Reviews */}
      <div className="reviews-container">
  <div className="reviews-section">
  {thankYouMessage && <div className="thank-you-message">{thankYouMessage}</div>}
    <h2>Reviews ({reviews.length})</h2>
    {reviewsToDisplay.map((review, index) => (
      <div key={index} className="review">
        <img src={review.imgSrc || reviewerImage} alt="reviewer" className="reviewer-img" />
        <div className="review-details">
          <h3>{review.name}</h3>
          <p className="rating">
            {Array(review.rating).fill().map((_, i) => (
              <i key={i} className={`fa-solid fa-star ${i < review.rating ? 'filled' : ''}`}></i>
            ))}
          </p>
          <p className="date">{review.date}</p>
          <p className="comment">{review.comment}</p>
        </div>
      </div>
    ))}
    {!showAll && reviews.length > 3 && (
      <button onClick={() => setShowAll(true)}>Show All Reviews</button>
    )}
    {showAll && (
      <button onClick={() => setShowAll(false)}>Show Less</button>
    )}
  </div>

  {/* Add Review Form */}
  <div className="review-form">
    <h2>Submit Your Review</h2>
    <form onSubmit={handleFormSubmit}>
      <div className="form-group">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={newReview.name}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="rating">Rating:</label>
        <select
          id="rating"
          name="rating"
          value={newReview.rating}
          onChange={handleInputChange}
          required
        >
          {[1, 2, 3, 4, 5].map(rating => (
            <option key={rating} value={rating}>{rating}</option>
          ))}
        </select>
        {/* Dynamically show stars based on the newReview.rating value */}
        <div className="rating-display">
          {Array(5).fill().map((_, i) => (
            <i key={i} className={`fa-solid fa-star ${i < newReview.rating ? 'filled' : ''}`}></i>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="comment">Comment:</label>
        <textarea
          id="comment"
          name="comment"
          value={newReview.comment}
          onChange={handleInputChange}
          required
        />
      </div>
      <button type="submit">Submit Review</button>
    </form>
  </div>
</div>



      {/* <div className="similar-section">
    <h2>Similar</h2>
    <img src={similarImage} alt="Similar" className="similar-img" />
  </div> */}
          {/* <h1 style={{ fontSize: "20px", padding: "10px" }}>
  Recommendation & Similar Packages:
</h1> */}
{/* <div className="addon-wrapper">
  <div className="Addons-slider-container">
    <button className="prev-btn" onClick={scrollLeft}>
      &#10094;
    </button>
    <div className="slider" ref={sliderRef}>
      {addons.map((addon) => (
        <div className="product-cards" key={addon.id}>
          <img
            src={addon.image || 'https://via.placeholder.com/150'}
            alt={addon.name}
            className="product-image"
          />
          <h3>Popular Package</h3>
          <p>{`₹${addon.price}`}</p>
          <div className="booking-section">
            <button>View More</button>
          </div>
        </div>
      ))}
    </div>
    <button className="next-btn" onClick={scrollRight}>
      &#10095;
    </button>
  </div>
  </div> */}

<div className={`price-cart ${isCartVisible ? '' : 'hidden'}`}>
        <div className="cart-header">
          <h2>Price Cart</h2>
        </div>
        <div className="cart-items">
        </div>
        <div className="cart-summary">
          <p>Total: <span id="cart-total">$0.00</span></p>
          <button id="checkout-button"onClick={handleBookingPage}>Checkout</button>
        </div>
      </div>
      <button id="toggle-cart" className="toggle-button" onClick={toggleCart}>
        <i className={`fa-solid ${isCartVisible ? 'fa-xmark' : 'fa-chevron-right'}`}></i>
      </button>
    </>
  );
};

export default DinningInnerPage;
