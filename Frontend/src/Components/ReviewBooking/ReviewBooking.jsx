import React, { useEffect, useState } from "react";
import "./ReviewBooking.css";
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Firebase imports
import { useLocation, useNavigate } from "react-router-dom";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore"; // Firestore functions

const BookingReview = ({ isGuest, setIsGuest }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingData } = location.state || {};
  const [totalGuests, setTotalGuests] = useState(0);
  const [guestList, setGuestList] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [request, setRequest] = useState(""); // Special requests
  const [guestLimitAlert, setGuestLimitAlert] = useState(""); // Guest limit alert
  const [paymentOption, setPaymentOption] = useState("50%"); // Payment option
  const [finalTotal, setFinalTotal] = useState(bookingData?.price || 0); // Final total after discount
  const [orderDetails, setOrderDetails] = useState(null); // Confirmed order details
  const [checkInDate, setCheckInDate] = useState(""); // State for check-in date
  const [billingName, setBillingName] = useState(""); // Billing Name
  const [billingPhone, setBillingPhone] = useState(""); // Billing Phone Number
  const [recommendedCoupons, setRecommendedCoupons] = useState([]); // Recommended coupons
  const roomPrice = bookingData?.price || 0; // Get room price from bookingData
  const addonsPrice = bookingData?.addons?.reduce((total, addon) => total + Number(addon.price), 0) || 0; // Addons price
  const totalRoomPrice = roomPrice + addonsPrice - discount; // Total room price after discount
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [timeSlot, setTimeSlot] = useState("");
  const [errorMessage, setErrorMessage] = useState("");  // Error state
  const [successMessage, setSuccessMessage] = useState("");  // Success state
  const [loading, setLoading] = useState(false);  // Loader state
  const [paymentStatus, setPaymentStatus] = useState(); // Payment status
  const [bookingDetails, setBookingDetails] = useState({
    checkInDate: "",
    timeSlot: "",
    guestDetails: "",
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState); // Toggle the dropdown state
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setEmail(user.email); // Set user email
      } else {
        setIsAuthenticated(false);
      }
    });

   // Cleanup the subscription when the component unmounts
    return () => unsubscribeAuth();
  }, []);

  const timeSlots = [
    "12:00 AM - 4:00 AM",
    "4:00 AM - 8:00 AM",
    "8:00 AM - 12:00 PM",
    "12:00 PM - 4:00 PM",
    "4:00 PM - 8:00 PM",
    "8:00 PM - 12:00 AM",
  ];

  // Add guest logic with limit check
  const addGuest = () => {
    if (totalGuests >= 2) {
      setGuestLimitAlert("You can only add up to 2 guests (Additional Guest Charge Rs:1000 contact: +91 9930216903)");
    } else {
      setTotalGuests(totalGuests + 1);
      setGuestList([...guestList, { name: "", age: "", id: totalGuests + 1 }]);
      setGuestLimitAlert(""); // Clear alert on successful guest addition
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
    return true; // All validations passed
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

  const checkSlotAvailability = async () => {
    setLoading(true); // Start the loader
    setErrorMessage(""); // Clear previous error message
    setSuccessMessage(""); // Clear previous success message

    const db = getFirestore();
    const bookingRef = collection(db, "orders");
    
    try {
      // Example query for checking availability
      const q = query(
        bookingRef,
        where("productDetails.checkInDate", "==", "2024-11-21"),
        where("productDetails.timeSlot", "==", timeSlot)
      );

      const querySnapshot = await getDocs(q);

      // Check if the slot is available or already booked
      if (!querySnapshot.empty) {
        setErrorMessage("This time slot is already booked. Please choose another.");
      } else {
        setSuccessMessage("This time slot is available!");
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      setErrorMessage("An error occurred while checking availability.");
    } finally {
      setLoading(false); // Stop the loader
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedDetails = { ...bookingDetails, [name]: value };
    setBookingDetails(updatedDetails);
    localStorage.setItem("bookingDetails", JSON.stringify(updatedDetails));
  };

  const handleProceedToCheckout = async () => {
    // Run the validation checks first
    if (!validateFields()) {
      return; // Stop if validation fails
    }
  
    // Check if the time slot is available
    if (errorMessage === "This time slot is already booked. Please choose another.") {
      alert("This time slot is already booked. Please select a different time slot.");
      return; // Stop if slot is unavailable
    }
  
    const orderDetailsToSubmit = {
      ...bookingData,
      guestDetails: guestList,
      checkInDate, // Include check-in date
      paymentOption,
      totalPrice: finalTotal,
      specialRequest: request,
      billingName, // Include billing name
      billingPhone, // Include billing phone
      addons: bookingData?.addons || [], // Include addons details
      timeSlot // Include selected time slot
    };
  
    // Save order details and navigate to checkout if available
    localStorage.setItem("bookingOrderDetails", JSON.stringify(orderDetailsToSubmit));
    setOrderDetails(orderDetailsToSubmit); // Store order details for display
  
    navigate("/checkout", {
      state: {
        bookingData,
        guestList,
        paymentOption,
        finalTotal,
        request,
        checkInDate,
        billingName,
        billingPhone,
        timeSlot,
        orderDetails: orderDetailsToSubmit,
      }
    });
  };
  
  useEffect(() => {
    const savedData = localStorage.getItem("bookingDetails");
    if (savedData) {
      setBookingDetails(JSON.parse(savedData));
    }
  }, []);

  // Remove guest logic
  const removeGuest = (id) => {
    setGuestList(guestList.filter((guest) => guest.id !== id));
    setTotalGuests(totalGuests - 1);
    setGuestLimitAlert(""); // Clear alert when guest is removed
  };

  // Handle guest info change
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
            alert(`Coupon applied!`);
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
    setIsGuest(e.target.checked); // Update guest login state when checkbox is toggled
  };

  return (
    <div className="booking-container">
<header>
        <h1>Review Your Booking</h1>
</header>

<div className="booking-content">
<div className="left-section">
        <div className="booking-input"> 
          <label htmlFor="checkInDate">Check-in Date</label>             
          <input type="date" id="checkInDate" name="checkInDate"  value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} required /> 
          </div> 
          <div className="form-containerr">
      <label className="time-slot-label">Time Slot:
        <select className="time-slot-dropdown" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
          <option value="">Select a time slot</option>
          {timeSlots.map((slot) => (
            <option key={slot} value={slot}>{slot}</option>
          ))}
        </select>
      </label>
      <button className="check-availability-button" onClick={checkSlotAvailability} disabled={loading}>
        {loading ? <div className="timeslot-loader"></div> : "Check Availability"}
      </button>
      
      {/* Display messages */}
    </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

          <div className="guest-details">
            <h3>Guest Details</h3>
            <div id="guestList">
              {guestList.map((guest) => (
                <div key={guest.id} className="guest-entry">
                  <label htmlFor={`guestName${guest.id}`}>
                    Guest {guest.id} Name:
                  </label>
                  <input
                    type="text"
                    id={`guestName${guest.id}`}
                    placeholder="name"
                    value={guest.name}
                    onChange={(e) =>
                      handleGuestChange(guest.id, "name", e.target.value)
                    }
                    required
                  />
                  <label htmlFor={`guestAge${guest.id}`}>Age:</label>
                  <input
                    type="number"
                    id={`guestAge${guest.id}`}
                    min="1"
                    placeholder="age"
                    value={guest.age}
                    onChange={(e) =>
                      handleGuestChange(guest.id, "age", e.target.value)
                    }
                    required
                  />
                  <button
                    type="button"
                    className="remove-guest-btn"
                    onClick={() => removeGuest(guest.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Guest limit alert */}
            {guestLimitAlert && (
              <div className="guest-limit-alert">
                <p>{guestLimitAlert}</p>
              </div>
            )}

            <div className="booking-input">
              <label htmlFor="totalGuests">Total Guests: {totalGuests}</label>
            </div>

            <button type="button" className="add-guest-btn" onClick={addGuest}>
              Add Guest
            </button>

            <button
              type="button"
              className="clear-guest-btn"
              onClick={() => {
                setGuestList([]);
                setTotalGuests(0); // Reset total guests to 0
                setGuestLimitAlert(""); // Clear alert
              }}
            >
              Clear All Guests
            </button>
          </div>

          <div className="booking-input coupon-input">
            <label htmlFor="couponCode">Coupon Code</label>
            <input
              type="text"
              id="couponCode"
              name="couponCode"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <button type="button" className="apply-btn" onClick={() => applyCoupon()}>
              Apply
            </button>
          </div>
          {/* Special request input text area */}
          <div className="request-input">
            <label htmlFor="specialRequest">Special Request</label>
            <textarea
              id="specialRequest"
              name="specialRequest"
              placeholder="Enter any special requests"
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              rows="4"
            />
          </div>

          <div className="payment-options">
            <h3>Payment Options</h3>
            <label>
              <input
                type="radio"
                name="paymentOption"
                value="50%"
                checked={paymentOption === "50%"}
                onChange={() => setPaymentOption("50%")}
              />
              Pay 50%
            </label>
            <label>
              <input
                type="radio"
                name="paymentOption"
                value="100%"
                checked={paymentOption === "100%"}
                onChange={() => setPaymentOption("100%")}
              />
              Pay 100%
            </label>
          </div>
                    {/* Billing Details */}
                    <div className="booking-input">
            <label htmlFor="billingName">Billing Name</label>
            <input
              type="text"
              id="billingName"
              name="billingName"
              value={billingName}
              onChange={(e) => setBillingName(e.target.value)} // Capture billing name
              required
            />
          </div>
          <div className="booking-input">
            <label htmlFor="billingPhone">Billing Phone Number</label>
            <input
              type="tel"
              id="billingPhone"
              name="billingPhone"
              value={billingPhone}
              onChange={(e) => setBillingPhone(e.target.value)} // Capture billing phone
              required
            />
          </div>
</div>

<div className="right-section">
<div className="room-card">
            <h3>Room Details</h3>
            <img src={bookingData.image || '.jpg'} alt="Room Image" className="room-image" />
            <div className="room-info">
              <h4>{bookingData.packageName}</h4>
              <p>{bookingData.desc}</p>
              <span className="rating">★ {bookingData.rating}/5</span>
            </div>

            <div className="addons">
              <h4>Add-ons</h4>
              {bookingData.addons.map((addon) => (
                <div className="addon-item" key={addon.id}>
                  <img src={addon.image} alt="Addon Image" className="addon-image" />
                  <span>{addon.name} - ₹{addon.price}</span>
                </div>
              ))}
            </div>
</div>

<div className="price-card">
<h3>Price Breakdown</h3>
<ul>
              <li>Room: ₹{roomPrice}</li>
              <li>
                <ul>
                  {bookingData.addons.map((addon) => (
                    <li key={addon.id}>{addon.name} - ₹{addon.price}</li>
                  ))}
                </ul>
              </li>
              <li>Coupon: - ₹{discount}</li>
              <li>
                <strong>Total: ₹{totalRoomPrice.toFixed(2)}</strong>
              </li>
              <li>
                <strong>Final Amount: ₹{getFinalAmount(paymentOption)}</strong>
              </li>
</ul>
{paymentStatus === "successful" && <p>Payment was successful!</p>}
{paymentStatus === "failed" && <p>Payment failed. Please try again.</p>}
<button className="proceed-btn" onClick={handleProceedToCheckout}>Proceed to Checkout</button>
<div className="guest-login-toggle">
{isAuthenticated ? (
<p>You are logged in as {email}</p>
) : (
<>
<input 
type="checkbox" 
id="guestLogin" 
onChange={handleGuestLoginChange} 
/>
<label htmlFor="guestLogin">Login as Guest</label>
</>
)}
{!isAuthenticated && !isGuest && (
<div className="guest-login-message">
<p>You must be logged in to proceed, or use guest login.</p>
</div>
)}
</div>
</div>

{orderDetails && (
<div className="order-summary">
<h3>Your Order Details</h3>
<p>Package Name: {orderDetails.packageName}</p>
<p>Check-in Date: {orderDetails.checkInDate}</p>
<p>Guests:</p>
<ul>
{orderDetails.guestDetails.map((guest, index) => (
<li key={index}>{`${guest.name}, Age: ${guest.age}`}</li>
))}
</ul>
<p>Coupon Used: {orderDetails.couponUsed}</p>
<p>Payment Option: {orderDetails.paymentOption}</p>
<p>Total Price: ₹{orderDetails.totalPrice}</p>
{orderDetails.specialRequest && (
<p>Special Request: {orderDetails.specialRequest}</p>
)}
</div>
)}
</div>
</div>
</div>
  );
};

export default BookingReview;