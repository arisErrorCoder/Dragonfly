import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { fireDB } from '../Login/firebase'; // Import your Firebase configuration
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faComment } from '@fortawesome/free-solid-svg-icons';
import { Carousel } from 'react-responsive-carousel';
import "../Dining/DiningInnerPage.css"
import "./PackageInner.css"
import reviewerImage from '../../assets/profile-user.png';
import logooImage from '../../assets/Header/logo.png';
// import { auth } from '../Login/firebase'; // Import the Firebase auth instance
import { getAuth } from 'firebase/auth'; // Import getAuth from Firebase

const PackageInner = () => {
  const auth = getAuth(); // Ensure the auth is initialized here
    const { id } = useParams(); // Get the package ID from the URL
    const [packageData, setPackageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeIndex, setActiveIndex] = useState(null);
    const [isCartVisible, setCartVisible] = useState(false);
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [mainImage, setMainImage] = useState('');
    const [images, setImages] = useState([]);
    const [addons, setAddons] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [showAll, setShowAll] = useState(false);
    const [newReview, setNewReview] = useState({ name: '', rating: 2, comment: '' });
    const [timesOpened, setTimesOpened] = useState(0); // State to track open count
    const [thankYouMessage, setThankYouMessage] = useState(''); // State for thank you message
    const sliderRef = useRef(null);
    const sliderRef2 = useRef(null);
    const navigate = useNavigate();
    const [cards, setCards] = useState([
      {
        title: "What's Included",
        content: <ul></ul>,
      },
      {
        title: "What's Exclusion",
        content: <ul></ul>,
      },
      {
        title: "Cancellation and Refund Policy",
        content: <ul></ul>,
      },
      {
        title: "Other Useful Info",
        content: <ul></ul>,
      },
    ]);
    useEffect(() => {
      if (!packageData) return;
    
      const newCards = [
        {
          title: "What's Included",
          content: (
            <ul>
              {packageData.inclusions?.map((item, index) => (
                <li className='cardss-li' key={index}>{item || ""}</li>
              ))}
            </ul>
          ),
        },
        {
          title: "What's Exclusion",
          content: (
            <ul>
              {packageData.exclusions?.map((item, index) => (
                <li className='cardss-li' key={index}>{item || ""}</li>
              ))}
            </ul>
          ),
        },
        {
          title: "Cancellation and Refund Policy",
          content: (
            <ul>
              {packageData.Cancellation_and_Refund_Policy?.map((item, index) => (
                <li className='cardss-li' key={index}>{item || ""}</li>
              ))}
            </ul>
          ),
        },
        {
          title: "Other Useful Info",
          content: (
            <ul>
              {packageData.special_features?.map((item, index) => (
                <li className='cardss-li' key={index}>{item || ""}</li>
              ))}
            </ul>
          ),
        },
      ];
    
      setCards(newCards);
    }, [packageData]); // This effect runs whenever packageData changes    

    useEffect(() => {
      const fetchReviews = async () => {
        try {
          // Reference the specific package's reviews by packageId
          const reviewsCollectionRef = collection(fireDB, 'reviews');
          const reviewsSnapshot = await getDocs(reviewsCollectionRef);
          
          // Filter the reviews where the 'packageId' matches the current package ID
          const filteredReviews = reviewsSnapshot.docs
            .map(doc => doc.data())
            .filter(review => review.packageId === id); // Ensure packageId matches the current package
    
          setReviews(filteredReviews);
        } catch (error) {
          console.error('Error fetching reviews: ', error);
        }
      };
    
      fetchReviews();
    }, [id]); // Run this when 'id' (package ID) changes
    
    useEffect(() => {
        const fetchPackage = async () => {
            setLoading(true); // Start loading
            try {
                // Attempt to fetch from the Diningpackages collection
                const diningPackageRef = doc(fireDB, 'Diningpackages', id); // Ensure the path is correct
                const diningPackageDoc = await getDoc(diningPackageRef);
    
                // If the Dining Package exists, set the data
                if (diningPackageDoc.exists()) {
                    const data = diningPackageDoc.data();
                    setPackageData(data);
                    setMainImage(data.images?.[0] || ''); // Set the first image as the main image
                    setImages(data.images || []); // Set the images for the carousel
                } else {
                    // If Dining Package does not exist, check the stayPackages collection
                    const stayPackageRef = doc(fireDB, 'stayPackages', id); // Adjust collection name as necessary
                    const stayPackageDoc = await getDoc(stayPackageRef);
    
                    // If the Stay Package exists, set the data
                    if (stayPackageDoc.exists()) {
                        const stayData = stayPackageDoc.data();
                        setPackageData(stayData); // Replace data with stay data
                        setMainImage(stayData.images?.[0] || ''); // Set the first image as the main image
                        setImages(stayData.images || []); // Set the images for the carousel
                    } else {
                        setError('Package not found in both collections');
                    }
                }
            } catch (error) {
                console.error("Error fetching package data: ", error); // Log the error for debugging
                setError('Failed to fetch package data');
            } finally {
                setLoading(false); // Stop loading
            }
    
            // Prepare the card data and save it to the state
            const cardData = [
                {
                    title: "What's Included",
                    content: (
                        <ul>
                            {packageData.inclusions?.map((item, index) => (
                                <li className='cardss-li' key={index}>{item || ""}</li>
                            ))}
                        </ul>
                    ),
                },
                {
                    title: "What's Exclusion",
                    content: (
                        <ul>
                            {packageData.exclusions?.map((item, index) => (
                                <li className='cardss-li' key={index}>{item || ""}</li>
                            ))}
                        </ul>
                    ),
                },
                {
                    title: "Cancellation and Refund Policy",
                    content: (
                      <ul>
                          {packageData.Cancellation_and_Refund_Policy?.map((item, index) => (
                              <li className='cardss-li' key={index}>{item || ""}</li>
                          ))}
                      </ul>
                  ),
                },
                {
                    title: "Other Useful Info",
                    content: (
                        <ul>
                            {packageData.special_features?.map((item, index) => (
                                <li className='cardss-li' key={index}>{item || ""}</li>
                            ))}
                        </ul>
                    ),
                },
            ];
    
            // Save to state
            setCards(cardData);
        };
    
        fetchPackage();
    }, [id]);
    

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
            updateCart();
        };

        fetchAddons();
    }, [selectedAddons]);

    useEffect(() => {
        const fetchReviews = async () => {
            const fetchedReviews = [
                { name: 'John Doe', rating: 4, comment: 'Great food!', date: '2023-09-01' },
                { name: 'Jane Smith', rating: 5, comment: 'Amazing service!', date: '2023-08-25' },
                { name: 'Bob Johnson', rating: 3, comment: 'Good but could improve.', date: '2023-07-30' },
            ];
            setReviews(fetchedReviews);
        };

        fetchReviews();
    }, []);

    const handleToggle = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    useEffect(() => {
      
    }, []);
  
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
        navigate('/login', { state: { from: location.pathname } }); // Redirect to login if not authenticated
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

    const reviewsToDisplay = showAll ? reviews : reviews.slice(0, 3);

    const handleBookingPage = () => {
        const packagePrice = Number(packageData.price) || 0;
        const totalPrice = packagePrice + selectedAddons.reduce((sum, addon) => sum + Number(addon.price), 0);

        const bookingData = {
            packageName: packageData.name,
            image: mainImage,
            packageType: packageData.packageType,  
            desc: packageData.description,
            price: totalPrice,
            rating: packageData.ratings,
            addons: selectedAddons,
        };

        navigate('/booking', { state: { bookingData } });
    };

    const handleAddonChange = (addonId, checked) => {
        if (checked) {
            const selectedAddon = addons.find(addon => addon.id === addonId);
            setSelectedAddons([...selectedAddons, selectedAddon]);
            setCartVisible(true);
        } else {
            setSelectedAddons(selectedAddons.filter(addon => addon.id !== addonId));
        }
    };

    const toggleCart = () => {
        setCartVisible(prevState => !prevState);
    };

    useEffect(() => {
        window.scrollTo(0, 0); // Scrolls to the top
      }, []);
      

      if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner">
                    <img src={logooImage} alt="Loading..." className="spinner-image" />
                </div>
            </div>
        );
    }
    

    if (error) {
        return <p>{error}</p>;
    }

    if (!packageData) {
        return <p>No package data available</p>;
    }
    const scrollLeftt = () => {
        sliderRef2.current.scrollLeft -= 300; // Adjust the scroll amount as needed
      };
    
      const scrollRightt = () => {
        sliderRef2.current.scrollLeft += 300;
      };

        
      const updateCart = () => {
        const packagePrice = Number(packageData.price) || 0; // Ensure packagePrice is a number
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
          
      const calculateAverageRating = () => {
        if (reviews.length === 0) return 0;
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        return (totalRating / reviews.length).toFixed(1);
      };
    
      const averageRating = calculateAverageRating();
    


    return (
        <>
<div className="gallery-wrapper">
  <div className="preview-section">
    <img src={mainImage} alt={packageData.name || 'Main View'} />
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
    <h1>{packageData.name}</h1>
    <div className="carousel-section">
      <Carousel showThumbs={false}>
        {images.map((image, index) => (
          <div key={index}>
            <img src={image} alt={`Slide ${index}`} />
          </div>
        ))}
      </Carousel>
    </div>
    <h4>{packageData.description}</h4>
    <p className="product-pricee">₹{packageData.price}/-</p>
    <div className="rating-wrapper">
            <span>
              {[...Array(Math.round(averageRating))].map((_, i) => <i key={i} className="fa-solid fa-star"></i>)}
            </span>
            <span>{reviews.length} Reviews</span>
          </div>
    <div className="button-actions">
      <a href="tel:9944894722" className="call-button">
        <button>
          <FontAwesomeIcon icon={faPhone} /> Tap to call
        </button>
      </a>
      <a href="https://wa.me/9944894722" className="text-button">
        <button>
          <FontAwesomeIcon icon={faComment} /> Tap to text
        </button>
      </a>
    </div>
    {/* <p className="product-description">
      {packageData.description ||
        'High-quality furnishings with opulent, expensive touches, attention to aesthetic detail, a quiet room with fresh air...'}
    </p> */}
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
            {/* Review Section */}
            <div className="reviews-container">
  <div className="reviews-section">
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

export default PackageInner;
