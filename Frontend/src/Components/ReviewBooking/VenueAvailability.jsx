import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const VenueAvailability = ({ venueName, checkInDate, timeSlot, onAvailabilityChange }) => {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!venueName || !checkInDate || !timeSlot) {
        setAvailability(null);
        setLoading(false);
        return;
      }

      const db = getFirestore();
      const venueRef = doc(db, 'venues', venueName);
      
      try {
        const docSnap = await getDoc(venueRef);
        
        if (docSnap.exists()) {
          const venueData = docSnap.data();
          const dateStr = checkInDate;
          
          if (venueData.bookedRooms && venueData.bookedRooms[dateStr] && venueData.bookedRooms[dateStr][timeSlot] !== undefined) {
            const booked = venueData.bookedRooms[dateStr][timeSlot];
            const available = venueData.totalRooms - booked;
            setAvailability(available);
            if (onAvailabilityChange) onAvailabilityChange(available);
          } else {
            // If date/slot doesn't exist, assume all rooms are available
            setAvailability(venueData.totalRooms);
            if (onAvailabilityChange) onAvailabilityChange(venueData.totalRooms);
          }
        } else {
          // If venue doesn't exist, assume no availability
          setAvailability(0);
          if (onAvailabilityChange) onAvailabilityChange(0);
        }
      } catch (error) {
        console.error("Error fetching venue availability:", error);
        setAvailability(null);
        if (onAvailabilityChange) onAvailabilityChange(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [venueName, checkInDate, timeSlot, onAvailabilityChange]);

  if (loading) return <div>Checking availability...</div>;
  if (availability === null) return <div>Availability data not found</div>;

  return (
    <div className="br-availability-info">
      {availability > 0 ? (
        <p className="br-availability-success">
          <strong>{availability} room(s) available</strong>
        </p>
      ) : (
        <p className="br-availability-error">
          No rooms available for this time slot. Please choose another.
        </p>
      )}
    </div>
  );
};

export default VenueAvailability;