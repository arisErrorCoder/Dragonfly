import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const VenueAvailability = ({ venueName, checkInDate, timeSlot, onAvailabilityChange }) => {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVenueAvailable, setIsVenueAvailable] = useState(true);
  const [globalAvailability, setGlobalAvailability] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!venueName || !checkInDate || !timeSlot) {
        setAvailability(null);
        setLoading(false);
        return;
      }

      const db = getFirestore();
      
      try {
        // First check global availability
        const globalConfigRef = doc(db, 'config', 'availability');
        const globalConfigSnap = await getDoc(globalConfigRef);
        
        if (globalConfigSnap.exists()) {
          setGlobalAvailability(globalConfigSnap.data().globalAvailability !== false);
        } else {
          setGlobalAvailability(true); // Default to available if no config exists
        }

        // Then check venue-specific availability
        const venueRef = doc(db, 'venues', venueName);
        const venueSnap = await getDoc(venueRef);
        
        if (venueSnap.exists()) {
          const venueData = venueSnap.data();
          setIsVenueAvailable(venueData.isAvailable !== false); // Default to true if not set
          
          // If either global or venue is unavailable, return 0 availability
          if (!globalAvailability || !venueData.isAvailable) {
            setAvailability(0);
            if (onAvailabilityChange) onAvailabilityChange(0);
            setLoading(false);
            return;
          }

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

  // If either global or venue is unavailable, show paused message
  if (!globalAvailability || !isVenueAvailable) {
    return (
      <div className="br-availability-info">
        <p className="br-availability-error">
          This venue is currently paused for bookings. Please check back later.
        </p>
      </div>
    );
  }

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