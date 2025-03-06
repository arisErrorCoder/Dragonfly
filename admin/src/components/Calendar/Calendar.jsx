import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, query, where, updateDoc, doc } from 'firebase/firestore';
import { fireDB } from '../firebase';
import './Calendar.css';

const Calendar = () => {
  const venues = ['Rooftop', 'Outdoor', 'Indoors'];
  const timeSlots = [
    '12:00 AM - 4:00 AM',
    '4:00 AM - 8:00 AM',
    '8:00 AM - 12:00 PM',
    '12:00 PM - 4:00 PM',
    '4:00 PM - 8:00 PM',
    '8:00 PM - 12:00 AM',
  ];

  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookedSlots, setBookedSlots] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [venueForBooking, setVenueForBooking] = useState('');
  const [timeSlotForBooking, setTimeSlotForBooking] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');

  const formatDate = (date) => date.toISOString().split('T')[0];

  const fetchBookedSlots = async () => {
    try {
      const querySnapshot = await getDocs(collection(fireDB, 'orders'));
      const fetchedSlots = {};

      querySnapshot.forEach((doc) => {
        const order = doc.data();
        const { checkInDate, venue, timeSlot } = order.productDetails || {};

        if (checkInDate && venue && timeSlot) {
          if (!fetchedSlots[checkInDate]) {
            fetchedSlots[checkInDate] = {};
          }

          if (!fetchedSlots[checkInDate][venue]) {
            fetchedSlots[checkInDate][venue] = [];
          }

          fetchedSlots[checkInDate][venue].push({
            timeSlot,
            isManual: order.isManual || false,
          });
        }
      });

      setBookedSlots(fetchedSlots);
    } catch (error) {
      console.error('Error fetching booked slots:', error);
    }
  };

  const bookSlot = async () => {
    if (!venueForBooking || !timeSlotForBooking || !userName || !userPhone) {
      alert('Please fill in all fields.');
      return;
    }

    const bookingData = {
      productDetails: {
        checkInDate: formatDate(currentDate),
        venue: venueForBooking,
        timeSlot: timeSlotForBooking,
      },
      isManual: true,
      name: userName,
      mobileNumber: userPhone,
    };

    try {
      await addDoc(collection(fireDB, 'orders'), bookingData);

      setBookedSlots((prevSlots) => {
        const updatedSlots = { ...prevSlots };
        if (!updatedSlots[formatDate(currentDate)]) {
          updatedSlots[formatDate(currentDate)] = {};
        }
        if (!updatedSlots[formatDate(currentDate)][venueForBooking]) {
          updatedSlots[formatDate(currentDate)][venueForBooking] = [];
        }
        updatedSlots[formatDate(currentDate)][venueForBooking].push({
          timeSlot: timeSlotForBooking,
          isManual: true,
        });
        return updatedSlots;
      });

      setSelectedSlot(null);
      setVenueForBooking('');
      setTimeSlotForBooking('');
      setUserName('');
      setUserPhone('');
    } catch (error) {
      console.error('Error booking slot:', error);
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
  const cancelManualBooking = (venue, slot) => {
    const confirmed = window.confirm(
      `Do you want to cancel the booking for ${venue} - ${slot}?`
    );

    if (confirmed) {
      // Remove the booking details from the local state
      setBookedSlots((prevSlots) => {
        const updatedSlots = { ...prevSlots };
        updatedSlots[formatDate(currentDate)][venue] = updatedSlots[formatDate(currentDate)][venue].filter(
          (s) => s.timeSlot !== slot
        );
        return updatedSlots;
      });

      // Remove booking details in Firebase
      const ordersRef = collection(fireDB, 'orders'); // Corrected to use collection function
      const q = query(
        ordersRef,
        where('productDetails.checkInDate', '==', formatDate(currentDate)),
        where('productDetails.venue', '==', venue),
        where('productDetails.timeSlot', '==', slot)
      );

      getDocs(q)
        .then((querySnapshot) => {
          querySnapshot.forEach((docSnapshot) => {
            const docRef = doc(fireDB, 'orders', docSnapshot.id);
            updateDoc(docRef, {
              'productDetails.checkInDate': null,
              'productDetails.venue': null,
              'productDetails.timeSlot': null,
            })
              .then(() => {
              })
              .catch((error) => {
                console.error('Error updating booking: ', error);
              });
          });
        })
        .catch((error) => {
          console.error('Error fetching booking details: ', error);
        });
    }
  };

  useEffect(() => {
    fetchBookedSlots();
  }, []);

  const formattedDate = formatDate(currentDate);
  const slotsForDate = bookedSlots[formattedDate] || {};

  return (
    <div className="calendar">
      {/* Navigation */}
      <div className="calendar-navigation">
        <span className="arrow" onClick={handlePreviousDay}>
          &larr;
        </span>
        <h4 className="current-date">{currentDate.toDateString()}</h4>
        <span className="arrow" onClick={handleNextDay}>
          &rarr;
        </span>
      </div>

      {/* Time Slots Header */}
      <div className="calendar-header">
        <div className="empty-space"></div>
        {timeSlots.map((slot, index) => (
          <div key={index} className="time-slot">
            {slot}
          </div>
        ))}
      </div>

      {/* Venue Rows */}
      <div className="calendar-body">
        {venues.map((venue, index) => (
          <div key={index} className="venue-row">
            <div className="venue-name">{venue}</div>
            {timeSlots.map((slot, slotIndex) => {
              const isBooked = slotsForDate[venue]?.some(
                (s) => s.timeSlot === slot
              );
              const isManual =
                slotsForDate[venue]?.find((s) => s.timeSlot === slot)
                  ?.isManual || false;

              return (
                <div
                  key={slotIndex}
                  className={`time-cell ${
                    isBooked ? (isManual ? 'manual-booked' : 'booked') : ''
                  }`}
                  onClick={() => {
                    if (isManual) {
                      cancelManualBooking(venue, slot);
                    } else if (!isBooked) {
                      setSelectedSlot(`${venue} - ${slot}`);
                      setVenueForBooking(venue);
                      setTimeSlotForBooking(slot);
                    }
                  }}
                >
                  {isBooked
                    ? isManual
                      ? 'Manual-Booked'
                      : 'Online-Booked'
                    : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Booking Section */}
      {selectedSlot && (
        <div className="booking-section">
          <span className="close-icon" onClick={() => setSelectedSlot(null)}>
            &times;
          </span>
          <h5>Book Slot: {selectedSlot}</h5>
          <input
            type="text"
            placeholder="Enter Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter Mobile Number"
            value={userPhone}
            onChange={(e) => setUserPhone(e.target.value)}
          />
          <button onClick={bookSlot}>Confirm Booking</button>
        </div>
      )}
    </div>
  );
};

export default Calendar;
