import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, getDoc, query, where } from 'firebase/firestore';
import { fireDB } from '../firebase';
import { FiChevronLeft, FiChevronRight, FiX, FiInfo, FiCalendar, FiClock, FiUser, FiPhone } from 'react-icons/fi';
import './Calendar.css';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookedRooms, setBookedRooms] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [venueForBooking, setVenueForBooking] = useState('');
  const [timeSlotForBooking, setTimeSlotForBooking] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [availableVenues, setAvailableVenues] = useState([]);
  const [venueConfig, setVenueConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [showBookingDetails, setShowBookingDetails] = useState(null);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState(new Date());
  const [packageDetails, setPackageDetails] = useState(null);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch venues configuration
        const venuesSnapshot = await getDocs(collection(fireDB, 'venues'));
        const venuesData = {};
        
        // Fetch time slots configuration
        const [diningSlotsDoc, staySlotsDoc] = await Promise.all([
          getDoc(doc(fireDB, 'timeSlotsConfig', 'diningVenues')),
          getDoc(doc(fireDB, 'timeSlotsConfig', 'stayVenues'))
        ]);
        
        const diningSlots = diningSlotsDoc.exists() ? diningSlotsDoc.data() : {};
        const staySlots = staySlotsDoc.exists() ? staySlotsDoc.data() : {};
        
        // Process venues data
        venuesSnapshot.forEach(doc => {
          const venueName = doc.id;
          const venueData = doc.data();
          
          // Determine time slots - prioritize venue-specific slots, fall back to config
          let timeSlots = [];
          let packageType = 'stayVenues'; // Default to stay venues
          
          if (venueData.timeSlots && venueData.timeSlots.length > 0) {
            timeSlots = venueData.timeSlots;
          } else if (diningSlots[venueName]) {
            timeSlots = diningSlots[venueName];
            packageType = 'diningVenues';
          } else if (staySlots[venueName]) {
            timeSlots = staySlots[venueName];
          }
          
          venuesData[venueName] = {
            name: venueName,
            totalRooms: venueData.totalRooms || 1,
            timeSlots: timeSlots,
            packageType: packageType
          };
        });
        
        setVenueConfig(venuesData);
        setAvailableVenues(Object.keys(venuesData));
        await fetchBookedRooms();
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load calendar data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentDate]);

  const fetchBookedRooms = async () => {
    try {
      const querySnapshot = await getDocs(collection(fireDB, 'orders'));
      const fetchedBookings = {};
  
      querySnapshot.forEach((doc) => {
        const order = doc.data();
        const { checkInDate, venue, timeSlot } = order.productDetails || {};
  
        if (checkInDate && venue && timeSlot) {
          const formattedDate = checkInDate.split('T')[0];
          
          if (!fetchedBookings[formattedDate]) {
            fetchedBookings[formattedDate] = {};
          }
  
          if (!fetchedBookings[formattedDate][venue]) {
            fetchedBookings[formattedDate][venue] = {};
          }
  
          if (!fetchedBookings[formattedDate][venue][timeSlot]) {
            fetchedBookings[formattedDate][venue][timeSlot] = {
              count: 0,
              bookings: []
            };
          }
  
          fetchedBookings[formattedDate][venue][timeSlot].count++;
          fetchedBookings[formattedDate][venue][timeSlot].bookings.push({
            id: doc.id,
            isManual: order.isManual || false,
            name: order.name,
            mobileNumber: order.mobileNumber,
            bookingDate: order.bookingDate || null,
            productDetails: order.productDetails || null
          });
        }
      });
  
      setBookedRooms(fetchedBookings);
    } catch (error) {
      console.error('Error fetching booked rooms:', error);
      setError('Failed to load booking data. Please refresh the page.');
    }
  };

  const checkExistingBooking = async (phone, date, venue, timeSlot) => {
    try {
      const ordersRef = collection(fireDB, 'orders');
      const q = query(
        ordersRef,
        where('mobileNumber', '==', phone),
        where('productDetails.checkInDate', '==', date),
        where('productDetails.venue', '==', venue),
        where('productDetails.timeSlot', '==', timeSlot)
      );
      
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking existing booking:', error);
      return false;
    }
  };

  const bookSlot = async () => {
    try {
      setError('');
      
      if (!venueForBooking || !timeSlotForBooking || !userName || !userPhone) {
        throw new Error('Please fill in all fields.');
      }

      if (!/^\d{10}$/.test(userPhone)) {
        throw new Error('Please enter a valid 10-digit phone number.');
      }

      const dateKey = formatDate(currentDate);
      const maxRooms = venueConfig[venueForBooking]?.totalRooms || 0;
      
      const alreadyBooked = await checkExistingBooking(
        userPhone,
        dateKey,
        venueForBooking,
        timeSlotForBooking
      );
      
      if (alreadyBooked) {
        throw new Error('This phone number already has a booking for this slot.');
      }

      const currentBookings = bookedRooms[dateKey]?.[venueForBooking]?.[timeSlotForBooking]?.count || 0;
      
      if (currentBookings >= maxRooms) {
        throw new Error('All rooms for this time slot are already booked!');
      }

      const bookingData = {
        productDetails: {
          checkInDate: dateKey,
          venue: venueForBooking,
          timeSlot: timeSlotForBooking,
          packageName: `${venueForBooking} - ${timeSlotForBooking}`,
          price: 0,
          totalPrice: 0
        },
        isManual: true,
        name: userName,
        mobileNumber: userPhone,
        bookingDate: new Date().toISOString(),
        status: 'success',
        paymentDetails: {
          code: "PAYMENT_SUCCESS"
        }
      };

      await addDoc(collection(fireDB, 'orders'), bookingData);
      
      const venueRef = doc(fireDB, 'venues', venueForBooking);
      const venueDoc = await getDoc(venueRef);
      
      if (venueDoc.exists()) {
        const currentBookedRooms = venueDoc.data().bookedRooms || {};
        const dateBookings = currentBookedRooms[dateKey] || {};
        const slotBookings = dateBookings[timeSlotForBooking] || 0;
        
        await updateDoc(venueRef, {
          bookedRooms: {
            ...currentBookedRooms,
            [dateKey]: {
              ...dateBookings,
              [timeSlotForBooking]: slotBookings + 1
            }
          }
        });
      }
      
      await fetchBookedRooms();
      
      setSelectedSlot(null);
      setVenueForBooking('');
      setTimeSlotForBooking('');
      setUserName('');
      setUserPhone('');
      
      alert('Booking successful!');
    } catch (error) {
      console.error('Error booking slot:', error);
      setError(error.message);
    }
  };

  const cancelBooking = async (booking) => {
    try {
      setCancelling(true);
      setError('');

      if (!booking) {
        throw new Error('No booking selected for cancellation');
      }

      const venue = booking.productDetails?.venue;
      const timeSlot = booking.productDetails?.timeSlot;

      if (!venue || !timeSlot) {
        throw new Error('Could not determine venue and time slot from booking');
      }

      const isManual = booking.isManual;
      const bookingType = isManual ? 'manual booking' : 'online booking';
      
      const confirmed = window.confirm(
        `Do you want to cancel this ${bookingType} for ${venue} - ${timeSlot}?\n\n` +
        `Name: ${booking.name}\n` +
        `Phone: ${booking.mobileNumber}\n` +
        `${booking.bookingDate ? `Booked on: ${new Date(booking.bookingDate).toLocaleString()}` : ''}`
      );

      if (!confirmed) {
        setCancelling(false);
        return;
      }

      const dateKey = formatDate(currentDate);
      
      if (isManual) {
        await updateDoc(doc(fireDB, 'orders', booking.id), {
          'productDetails.checkInDate': null,
          'productDetails.venue': null,
          'productDetails.timeSlot': null,
          'productDetails.packageName': null,
          status: 'cancelled'
        });
      } else {
        await deleteDoc(doc(fireDB, 'orders', booking.id));
      }

      const venueRef = doc(fireDB, 'venues', venue);
      const venueDoc = await getDoc(venueRef);
      
      if (venueDoc.exists()) {
        const currentBookedRooms = venueDoc.data().bookedRooms || {};
        const dateBookings = currentBookedRooms[dateKey] || {};
        const slotBookings = dateBookings[timeSlot] || 0;
        
        if (slotBookings > 0) {
          await updateDoc(venueRef, {
            bookedRooms: {
              ...currentBookedRooms,
              [dateKey]: {
                ...dateBookings,
                [timeSlot]: slotBookings - 1
              }
            }
          });
        }
      }

      await fetchBookedRooms();
      
      alert('Booking cancelled successfully.');
      setShowBookingDetails(null);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setError(`Failed to cancel booking: ${error.message}`);
    } finally {
      setCancelling(false);
    }
  };

  const handlePreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const handleDateSelect = (date) => {
    // Create a new date object without time components to avoid timezone issues
    const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    setCurrentDate(selectedDate);
    setShowDatePicker(false);
  };

  const renderDatePicker = () => {
    const daysInMonth = new Date(
      tempSelectedDate.getFullYear(),
      tempSelectedDate.getMonth() + 1,
      0
    ).getDate();
    
    const firstDayOfMonth = new Date(
      tempSelectedDate.getFullYear(),
      tempSelectedDate.getMonth(),
      1
    ).getDay();
    
    const days = [];
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="luxury-date-picker-empty-cell"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        tempSelectedDate.getFullYear(),
        tempSelectedDate.getMonth(),
        day
      );
      
      const isCurrentDate = date.toDateString() === currentDate.toDateString();
      const hasBookings = bookedRooms[formatDate(date)] !== undefined;
      
      days.push(
        <div
          key={`day-${day}`}
          className={`luxury-date-picker-day 
            ${isCurrentDate ? 'luxury-date-picker-day-selected' : ''}
            ${hasBookings ? 'luxury-date-picker-day-has-bookings' : ''}`}
          onClick={() => handleDateSelect(date)}
        >
          {day}
          {hasBookings && <div className="luxury-date-picker-booking-dot"></div>}
        </div>
      );
    }
    
    return (
      <div className="luxury-date-picker-container">
        <div className="luxury-date-picker-header">
          <button
            className="luxury-date-picker-nav"
            onClick={() => {
              const newDate = new Date(tempSelectedDate);
              newDate.setMonth(newDate.getMonth() - 1);
              setTempSelectedDate(newDate);
            }}
          >
            &lt;
          </button>
          <div className="luxury-date-picker-month">
            {tempSelectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          <button
            className="luxury-date-picker-nav"
            onClick={() => {
              const newDate = new Date(tempSelectedDate);
              newDate.setMonth(newDate.getMonth() + 1);
              setTempSelectedDate(newDate);
            }}
          >
            &gt;
          </button>
        </div>
        <div className="luxury-date-picker-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="luxury-date-picker-weekday">{day}</div>
          ))}
        </div>
        <div className="luxury-date-picker-grid">
          {days}
        </div>
      </div>
    );
  };

  const renderVenueCards = () => {
    return availableVenues.map((venue) => {
      const venueInfo = venueConfig[venue] || {};
      const venueBookings = bookedRooms[formatDate(currentDate)]?.[venue] || {};
      
      // Calculate availability
      const totalSlots = venueInfo.timeSlots?.length || 0;
      const bookedSlots = Object.keys(venueBookings).length;
      const availabilityPercentage = totalSlots > 0 
        ? Math.round(((totalSlots - bookedSlots) / totalSlots) * 100)
        : 0;
      
      return (
        <div
          key={venue}
          className={`luxury-venue-card ${venueForBooking === venue ? 'luxury-venue-card-active' : ''}`}
          onClick={() => {
            setVenueForBooking(venue);
            setTimeSlotForBooking('');
          }}
        >
          <h4>{venue}</h4>
          <div className="luxury-venue-meta">
            <span className="luxury-venue-type">
              {venueInfo.packageType === 'diningVenues' ? 'Dining' : 'Stay'} Package
            </span>
            <span className="luxury-venue-rooms">
              {venueInfo.totalRooms} {venueInfo.totalRooms > 1 ? 'rooms' : 'room'} available
            </span>
          </div>
          <div className="luxury-venue-availability">
            <div className="luxury-availability-bar">
              <div 
                className="luxury-availability-fill"
                style={{ width: `${availabilityPercentage}%` }}
              ></div>
            </div>
            <span className="luxury-availability-text">
              {totalSlots - bookedSlots} of {totalSlots} slots available
            </span>
          </div>
        </div>
      );
    });
  };

  const renderTimeSlots = () => {
    if (!venueForBooking || !venueConfig[venueForBooking]) return null;
    
    const venueInfo = venueConfig[venueForBooking];
    const formattedDate = formatDate(currentDate);
    const bookingsForVenue = bookedRooms[formattedDate]?.[venueForBooking] || {};
    
    return (
      <div className="luxury-calendar-main">
        <div className="luxury-time-slots-header">
          <div className="luxury-venue-label">{venueForBooking}</div>
          {venueInfo.timeSlots?.map((slot, index) => (
            <div key={index} className="luxury-time-slot-header">
              <FiClock className="luxury-time-icon" />
              {slot}
            </div>
          ))}
        </div>

        <div className="luxury-availability-grid">
          <div className="luxury-availability-row">
            <div className="luxury-venue-label"></div>
            {venueInfo.timeSlots?.map((slot, slotIndex) => {
              const slotBookings = bookingsForVenue[slot] || {};
              const bookedCount = slotBookings.count || 0;
              const totalRooms = venueInfo.totalRooms || 1;
              const isFullyBooked = bookedCount >= totalRooms;
              const bookingList = slotBookings.bookings || [];
              
              return (
                <div
                  key={slotIndex}
                  className={`luxury-time-slot ${isFullyBooked ? 'luxury-time-slot-booked' : ''} ${
                    bookedCount > 0 ? 'luxury-time-slot-partial' : 'luxury-time-slot-available'
                  }`}
                  onClick={() => {
                    if (!isFullyBooked) {
                      setSelectedSlot(`${venueForBooking} - ${slot}`);
                      setTimeSlotForBooking(slot);
                    }
                  }}
                >
                  <div className="luxury-slot-content">
                    <div className="luxury-slot-status">
                      {isFullyBooked ? (
                        <span className="luxury-slot-badge luxury-slot-badge-full">FULL</span>
                      ) : bookedCount > 0 ? (
                        <div className="luxury-slot-count">
                          {bookedCount}/{totalRooms} booked
                        </div>
                      ) : (
                        <span className="luxury-slot-badge luxury-slot-badge-available">AVAILABLE</span>
                      )}
                    </div>

                    {bookingList.length > 0 && (
                      <div className="luxury-booking-list">
                        {bookingList.map((booking, i) => (
                          <div
                            key={i}
                            className={`luxury-booking-item ${booking.isManual ? 'luxury-booking-manual' : 'luxury-booking-online'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowBookingDetails(booking);
                            }}
                          >
                            <span className="luxury-booking-name">{booking.name}</span>
                            <FiInfo className="luxury-booking-info-icon" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="luxury-calendar-loading">
        <div className="luxury-spinner"></div>
        <p>Loading calendar data...</p>
      </div>
    );
  }

  return (
    <div className="luxury-calendar-container">
      {error && (
        <div className="luxury-error-message">
          {error}
          <button onClick={() => setError('')} className="luxury-error-close">
            &times;
          </button>
        </div>
      )}

      <div className="luxury-calendar-header">
        <div className="luxury-date-navigation">
          <button className="luxury-nav-button" onClick={handlePreviousDay}>
            <FiChevronLeft size={24} />
          </button>
          
          <div className="luxury-date-display-container">
            <h2 
              className="luxury-current-date"
              onClick={() => {
                setTempSelectedDate(currentDate);
                setShowDatePicker(!showDatePicker);
              }}
            >
              <FiCalendar className="luxury-date-icon" />
              {currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h2>
            {showDatePicker && (
              <div className="luxury-date-picker-popup">
                {renderDatePicker()}
              </div>
            )}
          </div>
          
          <button className="luxury-nav-button" onClick={handleNextDay}>
            <FiChevronRight size={24} />
          </button>
        </div>

        <div className="luxury-venue-selection">
          <h3 className="luxury-section-title">Select Package</h3>
          <div className="luxury-venue-grid">
            {renderVenueCards()}
          </div>
        </div>
      </div>

      {renderTimeSlots()}

      {selectedSlot && (
        <div className="luxury-booking-modal">
          <div className="luxury-booking-form">
            <button className="luxury-close-button" onClick={() => setSelectedSlot(null)}>
              <FiX size={24} />
            </button>
            <h3 className="luxury-booking-title">
              <FiCalendar className="luxury-form-icon" />
              Book Slot
            </h3>
            <div className="luxury-booking-slot-info">
              <div className="luxury-booking-slot">{selectedSlot}</div>
              <div className="luxury-booking-date">{formatDate(currentDate)}</div>
            </div>
            
            <div className="luxury-form-group">
              <label className="luxury-input-label">
                <FiUser className="luxury-input-icon" />
                Guest Name
              </label>
              <input
                type="text"
                className="luxury-form-input"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter guest name"
                required
              />
            </div>
            
            <div className="luxury-form-group">
              <label className="luxury-input-label">
                <FiPhone className="luxury-input-icon" />
                Mobile Number
              </label>
              <input
                type="tel"
                className="luxury-form-input"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                pattern="[0-9]{10}"
                required
              />
            </div>
            
            {error && <div className="luxury-form-error">{error}</div>}
            
            <div className="luxury-form-actions">
              <button 
                className="luxury-confirm-button" 
                onClick={bookSlot}
              >
                Confirm Booking
              </button>
              <button 
                className="luxury-cancel-form-button"
                onClick={() => setSelectedSlot(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showBookingDetails && (
        <div className="luxury-booking-details-modal">
          <div className="luxury-booking-details-content">
            <button className="luxury-close-button" onClick={() => setShowBookingDetails(null)}>
              <FiX size={24} />
            </button>
            <h3 className="luxury-details-title">Booking Details</h3>
            
            <div className="luxury-details-grid">
              <div className="luxury-details-row">
                <span className="luxury-details-label">Name:</span>
                <span className="luxury-details-value">{showBookingDetails.name}</span>
              </div>
              <div className="luxury-details-row">
                <span className="luxury-details-label">Phone:</span>
                <span className="luxury-details-value">{showBookingDetails.mobileNumber}</span>
              </div>
              <div className="luxury-details-row">
                <span className="luxury-details-label">Venue:</span>
                <span className="luxury-details-value">
                  {showBookingDetails.productDetails?.venue || 'N/A'}
                </span>
              </div>
              <div className="luxury-details-row">
                <span className="luxury-details-label">Time Slot:</span>
                <span className="luxury-details-value">
                  {showBookingDetails.productDetails?.timeSlot || 'N/A'}
                </span>
              </div>
              <div className="luxury-details-row">
                <span className="luxury-details-label">Type:</span>
                <span className={`luxury-details-value ${showBookingDetails.isManual ? 'luxury-type-manual' : 'luxury-type-online'}`}>
                  {showBookingDetails.isManual ? 'Manual Booking' : 'Online Booking'}
                </span>
              </div>
              {showBookingDetails.bookingDate && (
                <div className="luxury-details-row">
                  <span className="luxury-details-label">Booked On:</span>
                  <span className="luxury-details-value">
                    {new Date(showBookingDetails.bookingDate).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="luxury-details-actions">
              <button 
                className="luxury-cancel-button"
                onClick={() => cancelBooking(showBookingDetails)}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
              <button 
                className="luxury-close-details-button"
                onClick={() => setShowBookingDetails(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;