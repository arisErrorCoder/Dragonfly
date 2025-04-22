
// AdminTimeSlotsEditor.js
import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc, collection, getDocs ,setDoc } from 'firebase/firestore';
import { fireDB } from '../firebase';
import "./AdminTimeSlotsEditor.css"

const AdminTimeSlotsEditor = () => {
  const [packageType, setPackageType] = useState('dining');
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [newSlot, setNewSlot] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch venues based on package type
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        const collectionName = packageType === 'dining' ? 'Diningpackages' : 'stayPackages';
        const querySnapshot = await getDocs(collection(fireDB, collectionName));
        
        const venuesList = querySnapshot.docs
          .map(doc => doc.data().name)
          .filter((name, index, self) => name && self.indexOf(name) === index);
        
        setVenues(venuesList);
        setSelectedVenue(venuesList.length > 0 ? venuesList[0] : '');
      } catch (error) {
        console.error('Error fetching venues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, [packageType]);

  // Load time slots when venue or package type changes
  useEffect(() => {
    if (!selectedVenue) {
      setTimeSlots([]);
      return;
    }

    const fetchTimeSlots = async () => {
      try {
        const docRef = doc(fireDB, 'timeSlotsConfig', packageType === 'dining' ? 'diningVenues' : 'stayVenues');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data()[selectedVenue]) {
          setTimeSlots(docSnap.data()[selectedVenue]);
        } else {
          setTimeSlots([]);
        }
      } catch (error) {
        console.error('Error fetching time slots:', error);
      }
    };

    fetchTimeSlots();
  }, [selectedVenue, packageType]);

  const handleAddSlot = () => {
    if (newSlot.trim()) {
      setTimeSlots(prev => [...prev, newSlot.trim()]);
      setNewSlot('');
    }
  };

  const removeSlot = (index) => {
    setTimeSlots(prev => prev.filter((_, i) => i !== index));
  };

  const saveChanges = async () => {
    if (!selectedVenue) return;

    try {
      const configName = packageType === 'dining' ? 'diningVenues' : 'stayVenues';
      const docRef = doc(fireDB, 'timeSlotsConfig', configName);
      
      // First get the current document if it exists
      const docSnap = await getDoc(docRef);
      const currentData = docSnap.exists() ? docSnap.data() : {};
      
      // Update the data with new time slots
      const updatedData = {
        ...currentData,
        [selectedVenue]: timeSlots
      };
      
      // Use setDoc with merge: true to create or update the document
      await setDoc(docRef, updatedData, { merge: true });
      
      alert('Time slots updated successfully!');
    } catch (error) {
      console.error('Error updating time slots:', error);
      alert('Failed to update time slots. Please try again.');
    }
  };

  if (loading) return <div className="loading">Loading venues...</div>;

  return (
    <div className="time-slots-admin">
      <h2>Manage Time Slots</h2>
      
      <div className="package-type-selector">
        <button
          className={`type-btn ${packageType === 'dining' ? 'active' : ''}`}
          onClick={() => setPackageType('dining')}
        >
          Dining Packages
        </button>
        <button
          className={`type-btn ${packageType === 'stay' ? 'active' : ''}`}
          onClick={() => setPackageType('stay')}
        >
          Stay Packages
        </button>
      </div>

      <div className="venue-selection">
        <label>Select Venue:</label>
        <select
          value={selectedVenue}
          onChange={(e) => setSelectedVenue(e.target.value)}
          disabled={venues.length === 0}
        >
          {venues.length > 0 ? (
            venues.map(venue => (
              <option key={venue} value={venue}>{venue}</option>
            ))
          ) : (
            <option value="">No venues found</option>
          )}
        </select>
      </div>

      {selectedVenue && (
        <div className="time-slots-editor">
          <h3>Time Slots for {selectedVenue}</h3>
          
          <div className="slots-list">
            {timeSlots.length > 0 ? (
              timeSlots.map((slot, index) => (
                <div key={index} className="slot-item">
                  <span>{slot}</span>
                  <button
                    className="remove-btn"
                    onClick={() => removeSlot(index)}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <div className="no-slots">No time slots configured yet</div>
            )}
          </div>

          <div className="add-slot">
            <input
              type="text"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              placeholder="Enter time slot (e.g., 12:00 PM - 06:00 PM)"
              onKeyPress={(e) => e.key === 'Enter' && handleAddSlot()}
            />
            <button
              className="add-btn"
              onClick={handleAddSlot}
              disabled={!newSlot.trim()}
            >
              Add Slot
            </button>
          </div>

          <button
            className="save-btn"
            onClick={saveChanges}
            disabled={!selectedVenue}
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminTimeSlotsEditor;