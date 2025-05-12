import React, { useEffect, useState } from "react";
import "./ReviewBooking.css";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../Register/firebase'; // Your Firebase initialization
import { useLocation, useNavigate } from "react-router-dom";
import { getFirestore, collection, addDoc, getDoc, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { FaUserPlus, FaTrash, FaTimes, FaCheck, FaCalendarAlt, FaClock, FaInfoCircle } from "react-icons/fa";
import VenueAvailability from "./VenueAvailability";

const BookingReview = ({ isGuest, setIsGuest }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingData } = location.state || {};
  const [totalGuests, setTotalGuests] = useState(0);
  const [guestList, setGuestList] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [request, setRequest] = useState("");
  const [guestLimitAlert, setGuestLimitAlert] = useState("");
  const [paymentOption, setPaymentOption] = useState("50%");
  const [finalTotal, setFinalTotal] = useState(bookingData?.price || 0);
  const [orderDetails, setOrderDetails] = useState(null);
  const [checkInDate, setCheckInDate] = useState("");
  const [billingName, setBillingName] = useState("");
  const [billingPhone, setBillingPhone] = useState("");
  const [recommendedCoupons, setRecommendedCoupons] = useState([]);
  const [timeSlot, setTimeSlot] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [showCouponTooltip, setShowCouponTooltip] = useState(false);
  const [roomsAvailable, setRoomsAvailable] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);

  const roomPrice = bookingData?.price || 0;
  const addonsPrice = bookingData?.addons?.reduce((total, addon) => total + Number(addon.price), 0) || 0;
  const totalRoomPrice = roomPrice + addonsPrice - discount;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setEmail(user.email);
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const formatVenueText = (venue) => {
    if (!venue) return '';
    return venue.toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };


  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        console.log('Starting to fetch time slots...');
        console.log('Full bookingData:', bookingData); // Log entire bookingData
        
        const venueName = formatVenueText(bookingData?.packageName);
        console.log('Formatted venue name:', venueName);
        
        if (!venueName) {
          console.log('No venue name found, setting empty slots');
          setTimeSlots([]);
          return;
        }
  
        // Determine which collection to query based on package type
        const packageType = bookingData.packageType;
        console.log('Determined package type:', packageType);
        const collectionName = 
        packageType === 'stayVenues' ? 'stayVenues' : 
        packageType === 'diningVenues' ? 'diningVenues' : null;
              console.log('Using collection:', collectionName);
        const configRef = doc(db, 'timeSlotsConfig', collectionName);
        console.log('Firestore reference:', configRef.path);
        
        const docSnap = await getDoc(configRef);
        console.log('Document snapshot exists:', docSnap.exists());
        
        if (docSnap.exists()) {
          const venueData = docSnap.data();
          console.log('Full document data:', venueData);
          
          // Check for both formatted and original venue name
          const slots = venueData[venueName] || 
                       venueData[bookingData?.packageName] ||
                       [];
          
          console.log('Found time slots:', slots);
          
          if (Array.isArray(slots)) {
            setTimeSlots(slots);
          } else {
            // Handle case where slots might be an object with day/night properties
            const packageTime = bookingData?.packageName?.toLowerCase();
            let finalSlots = [];
            
            if (typeof slots === 'object') {
              if (packageTime?.includes('day') && slots.day) {
                finalSlots = Array.isArray(slots.day) ? slots.day : [slots.day];
              } else if (packageTime?.includes('night') && slots.night) {
                finalSlots = Array.isArray(slots.night) ? slots.night : [slots.night];
              } else if (slots.default) {
                finalSlots = Array.isArray(slots.default) ? slots.default : [slots.default];
              }
            }
            
            console.log('Processed time slots:', finalSlots);
            setTimeSlots(finalSlots);
          }
        } else {
          console.log('Document does not exist in Firestore');
          setTimeSlots([]);
        }
      } catch (error) {
        console.error("Error fetching time slots:", error);
        setTimeSlots([]);
      }
    };
  
    if (bookingData?.packageName) {
      fetchTimeSlots();
    } else {
      setTimeSlots([]);
    }
  }, [bookingData?.packageName, bookingData?.packageType]);

  const addGuest = () => {
    if (totalGuests >= 2) {
      setGuestLimitAlert("You can only add up to 2 guests (Additional Guest Charge Rs:1000 contact: +91 9930216903)");
    } else {
      setTotalGuests(totalGuests + 1);
      setGuestList([...guestList, { name: "", age: "", id: totalGuests + 1 }]);
      setGuestLimitAlert("");
    }
  };

  const validateFields = () => {
    if (!checkInDate) {
      alert("Please select a check-in date.");
      return false;
    }
    if (!timeSlot) {
      alert("Please select a Time Slot.");
      return false;
    }
    if (guestList.length === 0) {
      alert("Please add at least one guest.");
      return false;
    }
    for (const guest of guestList) {
      if (!guest.name || !guest.age) {
        alert("Please fill out all guest details.");
        return false;
      }
    }
    if (!billingName) {
      alert("Please enter the billing name.");
      return false;
    }
    if (!billingPhone) {
      alert("Please enter the billing phone number.");
      return false;
    }
    if (roomsAvailable === null) {
      alert("Please check availability for your selected time slot.");
      return false;
    }
    if (roomsAvailable <= 0) {
      alert("No rooms available for selected time slot. Please choose another.");
      return false;
    }
    return true;
  };

  useEffect(() => {
    const calculateFinalTotal = () => {
      if (paymentOption === "50%") {
        setFinalTotal(totalRoomPrice / 2);
      } else {
        setFinalTotal(totalRoomPrice);
      }
    };
  
    calculateFinalTotal();
    fetchRecommendedCoupons();
  }, [paymentOption, discount, totalRoomPrice]);
  
  const fetchRecommendedCoupons = async () => {
    const db = getFirestore();
    const couponRef = collection(db, "coupons");
    try {
      const couponSnapshot = await getDocs(couponRef);
      const coupons = couponSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecommendedCoupons(coupons);
    } catch (error) {
      console.error("Error fetching coupons: ", error);
    }
  };

  // const checkSlotAvailability = async () => {
  //   const venue = formatVenueText(bookingData?.packageName);
    
  //   if (!checkInDate) {
  //     setErrorMessage("Please select a date");
  //     return;
  //   }
    
  //   if (!timeSlot) {
  //     setErrorMessage("Please select a time slot");
  //     return;
  //   }
  
  //   if (!venue) {
  //     setErrorMessage("Venue information is missing");
  //     setLoading(false);
  //     return;
  //   }
    
  //   setLoading(true);
  //   setErrorMessage("");
  //   setSuccessMessage("");
    
  //   try {
  //     // First check if we already have availability data
  //     if (roomsAvailable !== null) {
  //       if (roomsAvailable <= 0) {
  //         setErrorMessage("No rooms available for this time slot. Please choose another.");
  //       } else {
  //         setSuccessMessage("Time slot available!");
  //       }
  //       return;
  //     }
  
  //     // If we don't have availability data yet, fetch it
  //     const availabilityRef = doc(db, 'venueAvailability', venue);
  //     const docSnap = await getDoc(availabilityRef);
      
  //     if (docSnap.exists()) {
  //       const availabilityData = docSnap.data();
  //       const dateKey = checkInDate; // or format the date if needed
        
  //       if (availabilityData[dateKey] && availabilityData[dateKey][timeSlot]) {
  //         const availableRooms = availabilityData[dateKey][timeSlot].available;
  //         setRoomsAvailable(availableRooms);
          
  //         if (availableRooms <= 0) {
  //           setErrorMessage("No rooms available for this time slot. Please choose another.");
  //         } else {
  //           setSuccessMessage("Time slot available!");
  //         }
  //       } else {
  //         setErrorMessage("Availability data not found for selected date/time");
  //       }
  //     } else {
  //       setErrorMessage("Venue availability data not found");
  //     }
  //   } catch (error) {
  //     console.error("Error checking availability:", error);
  //     setErrorMessage("An error occurred while checking availability.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleProceedToCheckout = async () => {
    if (!validateFields()) {
      return;
    }

    if (roomsAvailable !== null && roomsAvailable <= 0) {
      alert("No rooms available for selected time slot.");
      return;
    }

    const orderDetailsToSubmit = {
      ...bookingData,
      guestDetails: guestList,
      checkInDate,
      paymentOption,
      totalPrice: finalTotal,
      totalBeforePaymentOption: totalRoomPrice, // Add this line
      specialRequest: request,
      billingName,
      billingPhone,
      addons: bookingData?.addons || [],
      timeSlot,
      roomsAvailable
    };

    localStorage.setItem("bookingOrderDetails", JSON.stringify(orderDetailsToSubmit));
    setOrderDetails(orderDetailsToSubmit);

    if (!isAuthenticated) {
      navigate("/login", {
        state: { 
          from: "/checkout",
          bookingData: orderDetailsToSubmit 
        }
      });
    } else {
      navigate("/checkout", {
        state: {
          bookingData: orderDetailsToSubmit,
          guestList,
          paymentOption,
          finalTotal,
          totalBeforePaymentOption: totalRoomPrice, // Add this line
          request,
          checkInDate,
          billingName,
          billingPhone,
          timeSlot,
          orderDetails: orderDetailsToSubmit,
        }
      });
    }
  };

  const removeGuest = (id) => {
    setGuestList(guestList.filter((guest) => guest.id !== id));
    setTotalGuests(totalGuests - 1);
    setGuestLimitAlert("");
  };

  const handleGuestChange = (id, field, value) => {
    setGuestList(
      guestList.map((guest) =>
        guest.id === id ? { ...guest, [field]: value } : guest
      )
    );
  };

  const applyCoupon = async (selectedCouponCode = couponCode) => {
    const db = getFirestore();
    const couponRef = collection(db, "coupons");
    const q = query(couponRef, where("code", "==", selectedCouponCode));
  
    try {
      const couponSnapshot = await getDocs(q);
      if (!couponSnapshot.empty) {
        couponSnapshot.forEach((doc) => {
          const couponData = doc.data();
          if (couponData && couponData.discount) {
            const discountValue = parseInt(couponData.discount, 10);
            setDiscount(discountValue);
            setFinalTotal(totalRoomPrice - discountValue);
            alert(`Coupon applied! Discount: ₹${discountValue}`);
          }
        });
      } else {
        setDiscount(0);
        alert("Invalid coupon code. Please try again.");
      }
    } catch (error) {
      console.error("Error applying coupon: ", error);
      alert("An error occurred while applying the coupon.");
    }
  };

  const getFinalAmount = (paymentOption) => {
    return paymentOption === "50%" ? totalRoomPrice / 2 : totalRoomPrice;
  };
  
  const handleGuestLoginChange = (e) => {
    setIsGuest(e.target.checked);
  };

  const handleAvailabilityChange = (newAvailability) => {
    setRoomsAvailable(newAvailability);
  };

  return (
    <div className="br-container">
      <div className="br-header">
        <h1 className="br-title">Review Your Booking</h1>
        <p className="br-subtitle">Please review your details before proceeding to payment</p>
      </div>

      <div className="br-content">
        <div className="br-form-section">
          {/* Date and Time Section */}
          <div className="br-form-card">
            <h2 className="br-card-title">
              <FaCalendarAlt className="br-card-icon" /> Date & Time
            </h2>
            <div className="br-form-row">
              <div className="br-form-group">
                <label className="br-label">Check-in Date</label>
                <input 
                  className="br-input"
                  type="date" 
                  value={checkInDate} 
                  onChange={(e) => setCheckInDate(e.target.value)} 
                  min={new Date().toISOString().split('T')[0]}
                  required 
                />
              </div>
              
              <div className="br-form-group">
                <label className="br-label">Time Slot</label>
                <div className="br-time-slot-container">
                <select 
  className="br-select"
  value={timeSlot} 
  onChange={(e) => setTimeSlot(e.target.value)}
  disabled={!bookingData?.packageName || timeSlots.length === 0}
>
  <option value="">Select a time slot</option>
  {timeSlots.map((slot, index) => (
    <option key={index} value={slot}>{slot}</option>
  ))}
</select>
                  {/* <button 
                    className="br-availability-btn"
                    onClick={checkSlotAvailability}
                    disabled={!checkInDate || !timeSlot}
                  >
                    {loading ? (
                      <div className="br-spinner"></div>
                    ) : (
                      <>
                        <FaClock /> Check Availability
                      </>
                    )}
                  </button> */}
                </div>
                {errorMessage && <div className="br-error-message"><FaTimes /> {errorMessage}</div>}
                {successMessage && <div className="br-success-message"><FaCheck /> {successMessage}</div>}
                
                {checkInDate && timeSlot && bookingData?.packageName && (
                  <VenueAvailability 
                    venueName={formatVenueText(bookingData.packageName)}
                    checkInDate={checkInDate}
                    timeSlot={timeSlot}
                    onAvailabilityChange={handleAvailabilityChange}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Guest Details Section */}
          <div className="br-form-card">
            <h2 className="br-card-title">
              <FaUserPlus className="br-card-icon" /> Guest Details
            </h2>
            
            <div className="br-guest-list">
              {guestList.map((guest) => (
                <div key={guest.id} className="br-guest-entry">
                  <div className="br-guest-input-group">
                    <input
                      className="br-guest-input"
                      type="text"
                      placeholder="Guest Name"
                      value={guest.name}
                      onChange={(e) => handleGuestChange(guest.id, "name", e.target.value)}
                      required
                    />
                    <input
                      className="br-guest-input"
                      type="number"
                      placeholder="Age"
                      min="1"
                      value={guest.age}
                      onChange={(e) => handleGuestChange(guest.id, "age", e.target.value)}
                      required
                    />
                    <button
                      className="br-remove-guest-btn"
                      onClick={() => removeGuest(guest.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalGuests >= 2 && (
              <div className="br-additional-guest-info">
                <div className="br-additional-guest-notice">
                  <FaInfoCircle /> Maximum 2 guests included in base price.
                </div>
                <div className="br-additional-guest-pricing">
                  <p>Additional guests: ₹1000 per person</p>
                  <p>Contact after booking: +91 9930216903</p>
                </div>
              </div>
            )}

            {guestLimitAlert && (
              <div className="br-guest-limit-alert">
                <FaInfoCircle /> {guestLimitAlert}
              </div>
            )}

            <div className="br-guest-controls">
              <button 
                className="br-add-guest-btn"
                onClick={addGuest}
                disabled={totalGuests >= 2}
              >
                <FaUserPlus /> Add Guest ({totalGuests}/2)
              </button>
              
              {guestList.length > 0 && (
                <button
                  className="br-clear-guests-btn"
                  onClick={() => {
                    setGuestList([]);
                    setTotalGuests(0);
                  }}
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Billing Information Section */}
          <div className="br-form-card">
            <h2 className="br-card-title">Billing Information</h2>
            
            <div className="br-form-group">
              <label className="br-label">Billing Name</label>
              <input
                className="br-input"
                type="text"
                value={billingName}
                onChange={(e) => setBillingName(e.target.value)}
                required
              />
            </div>
            
            <div className="br-form-group">
              <label className="br-label">Billing Phone Number</label>
              <input
                className="br-input"
                type="tel"
                value={billingPhone}
                onChange={(e) => setBillingPhone(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Coupon Section */}
          <div className="br-form-card">
            <h2 className="br-card-title">Coupons & Offers</h2>
            
            <div className="br-coupon-input-group">
              <input
                className="br-coupon-input"
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button 
                className="br-apply-coupon-btn"
                onClick={() => applyCoupon()}
              >
                Apply
              </button>
            </div>
            
            {discount > 0 && (
              <div className="br-coupon-applied">
                <FaCheck /> Coupon applied! You saved ₹{discount}
              </div>
            )}
          </div>

          {/* Special Requests Section */}
          <div className="br-form-card">
            <h2 className="br-card-title">Special Requests</h2>
            <textarea
              className="br-textarea"
              placeholder="Any special requests or notes for your booking..."
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              rows="4"
            />
          </div>

          {/* Payment Options Section */}
          <div className="br-form-card">
            <h2 className="br-card-title">Payment Options</h2>
            
            <div className="br-payment-options">
              <label className={`br-payment-option ${paymentOption === "50%" ? "br-payment-active" : ""}`}>
                <input
                  type="radio"
                  name="paymentOption"
                  value="50%"
                  checked={paymentOption === "50%"}
                  onChange={() => setPaymentOption("50%")}
                />
                <div className="br-option-content">
                  <span className="br-option-title">Pay 50% Now</span>
                  <span className="br-option-amount">₹{(totalRoomPrice / 2).toFixed(2)}</span>
                </div>
              </label>
              
              <label className={`br-payment-option ${paymentOption === "100%" ? "br-payment-active" : ""}`}>
                <input
                  type="radio"
                  name="paymentOption"
                  value="100%"
                  checked={paymentOption === "100%"}
                  onChange={() => setPaymentOption("100%")}
                />
                <div className="br-option-content">
                  <span className="br-option-title">Pay Full Amount</span>
                  <span className="br-option-amount">₹{totalRoomPrice.toFixed(2)}</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="br-summary-section">
          <div className="br-summary-card">
            <h2 className="br-summary-title">Order Summary</h2>
            
            <div className="br-room-summary">
              <div className="br-room-image-container">
                <img src={bookingData?.image || 'default-room.jpg'} alt="Room" className="br-room-image" />
              </div>
              <div className="br-room-details">
                <h3 className="br-room-name">{bookingData?.packageName}</h3>
                <p className="br-room-description">{bookingData?.desc}</p>
                <div className="br-room-rating">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`br-star ${i < Math.floor(bookingData?.rating || 0) ? "br-star-filled" : ""}`}>★</span>
                  ))}
                  <span>({bookingData?.rating || 0}/5)</span>
                </div>
              </div>
            </div>
            
            {bookingData?.addons?.length > 0 && (
              <div className="br-addons-summary">
                <h4 className="br-addons-title">Add-ons</h4>
                <ul className="br-addons-list">
                  {bookingData.addons.map((addon) => (
                    <li key={addon.id} className="br-addon-item">
                      <img src={addon.image} alt={addon.name} className="br-addon-image" />
                      <span className="br-addon-name">{addon.name}</span>
                      <span className="br-addon-price">₹{addon.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="br-price-breakdown">
              <h4 className="br-price-title">Price Breakdown</h4>
              <div className="br-price-row">
                <span className="br-price-label">Room Price</span>
                <span className="br-price-value">₹{roomPrice.toFixed(2)}</span>
              </div>
              
              {bookingData?.addons?.length > 0 && (
                <div className="br-price-row">
                  <span className="br-price-label">Add-ons</span>
                  <span className="br-price-value">₹{addonsPrice.toFixed(2)}</span>
                </div>
              )}
              
              {discount > 0 && (
                <div className="br-price-row br-price-discount">
                  <span className="br-price-label">Discount</span>
                  <span className="br-price-value">- ₹{discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="br-price-row br-price-total">
                <span className="br-price-label">Subtotal</span>
                <span className="br-price-value">₹{totalRoomPrice.toFixed(2)}</span>
              </div>
              
              <div className="br-price-row br-price-final">
                <span className="br-price-label">Amount to Pay</span>
                <span className="br-price-value">₹{getFinalAmount(paymentOption).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="br-auth-notice">
              {isAuthenticated ? (
                <div className="br-logged-in-notice">
                  <FaCheck /> Logged in as {email}
                </div>
              ) : (
                <div className="br-guest-login-toggle">
                  <input 
                    type="checkbox" 
                    id="guestLogin" 
                    className="br-guest-checkbox"
                    onChange={handleGuestLoginChange} 
                  />
                  <label htmlFor="guestLogin" className="br-guest-label">Continue as Guest</label>
                  {!isGuest && (
                    <p className="br-login-reminder">You'll need to create an account after booking</p>
                  )}
                </div>
              )}
            </div>
            
            <button 
              className="br-checkout-btn"
              onClick={handleProceedToCheckout}
              disabled={roomsAvailable !== null && roomsAvailable <= 0}
            >
              Proceed to Checkout
            </button>
            
            {paymentStatus === "successful" && (
              <div className="br-payment-success">
                <FaCheck /> Payment was successful!
              </div>
            )}
            {paymentStatus === "failed" && (
              <div className="br-payment-error">
                <FaTimes /> Payment failed. Please try again.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingReview;