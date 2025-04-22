import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import { fireDB } from '../firebase';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import "./VenueManagement.css";

const VenueManagementSystem = () => {
  // Common state
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('venues');
  
  // Venue management state
  const [venues, setVenues] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', totalRooms: 5 });
  const [newVenue, setNewVenue] = useState({ name: '', totalRooms: 5 });
  const [availableVenues, setAvailableVenues] = useState([]);

  // Time slots management state
  const [packageType, setPackageType] = useState('dining');
  const [timeSlotVenues, setTimeSlotVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [newSlot, setNewSlot] = useState('');

  useEffect(() => {
    const fetchAllVenues = async () => {
      try {
        setLoading(true);
        
        // Fetch existing managed venues
        const venuesSnapshot = await getDocs(collection(fireDB, 'venues'));
        const venuesList = venuesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setVenues(venuesList);

        // Fetch venues from packages
        const diningSnapshot = await getDocs(collection(fireDB, 'Diningpackages'));
        const staySnapshot = await getDocs(collection(fireDB, 'stayPackages'));
        
        const diningVenues = diningSnapshot.docs
          .map(doc => doc.data().name)
          .filter((name, index, self) => name && self.indexOf(name) === index);
        
        const stayVenues = staySnapshot.docs
          .map(doc => doc.data().name)
          .filter((name, index, self) => name && self.indexOf(name) === index);

        // Combine and dedupe all available venues from packages
        const allPackageVenues = [...new Set([...diningVenues, ...stayVenues])];
        setAvailableVenues(allPackageVenues);

        // Set for time slots management
        setTimeSlotVenues({
          dining: diningVenues,
          stay: stayVenues
        });

        if (diningVenues.length > 0) {
          setSelectedVenue(diningVenues[0]);
        }

      } catch (error) {
        console.error('Error fetching venues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllVenues();
  }, []);

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

  // Venue management handlers
  const handleEditClick = (venue) => {
    setEditingId(venue.id);
    setEditForm({ name: venue.name, totalRooms: venue.totalRooms });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'totalRooms' ? parseInt(value) || 0 : value
    }));
  };

  const handleSaveVenue = async (id) => {
    try {
      const venueRef = doc(fireDB, 'venues', id);
      await updateDoc(venueRef, {
        name: editForm.name,
        totalRooms: editForm.totalRooms
      });
      
      // Update local state
      setVenues(venues.map(v => 
        v.id === id ? { 
          ...v, 
          name: editForm.name, 
          totalRooms: editForm.totalRooms 
        } : v
      ));
      
      setEditingId(null);
    } catch (error) {
      console.error('Error updating venue:', error);
      alert('Failed to update venue. Please try again.');
    }
  };

  const handleAddVenue = async () => {
    if (!newVenue.name.trim()) return;
    
    try {
      // Check if venue already exists
      const venueExists = venues.some(v => v.name === newVenue.name);
      if (venueExists) {
        alert('This venue is already managed!');
        return;
      }

      const newId = newVenue.name;
      const venueRef = doc(fireDB, 'venues', newId);
      await setDoc(venueRef, {
        name: newVenue.name,
        totalRooms: newVenue.totalRooms,
        bookedRooms: {}
      });
      
      setVenues([...venues, { id: newId, ...newVenue }]);
      setNewVenue({ name: '', totalRooms: 5 });
    } catch (error) {
      console.error('Error adding venue:', error);
    }
  };


  // Time slots handlers
  const handleAddSlot = () => {
    if (newSlot.trim()) {
      setTimeSlots(prev => [...prev, newSlot.trim()]);
      setNewSlot('');
    }
  };

  const removeSlot = (index) => {
    setTimeSlots(prev => prev.filter((_, i) => i !== index));
  };

  const saveTimeSlots = async () => {
    if (!selectedVenue) return;

    try {
      const configName = packageType === 'dining' ? 'diningVenues' : 'stayVenues';
      const docRef = doc(fireDB, 'timeSlotsConfig', configName);
      
      const docSnap = await getDoc(docRef);
      const currentData = docSnap.exists() ? docSnap.data() : {};
      
      const updatedData = {
        ...currentData,
        [selectedVenue]: timeSlots
      };
      
      await setDoc(docRef, updatedData, { merge: true });
      
      alert('Time slots updated successfully!');
    } catch (error) {
      console.error('Error updating time slots:', error);
      alert('Failed to update time slots. Please try again.');
    }
  };

  if (loading) return <div className="vms-loading">Loading data...</div>;

  return (
    <div className="vms-container">
      <h1 className="vms-title">Venue Management System</h1>
      
      <div className="vms-tabs">
        <button 
          className={`vms-tab-btn ${activeTab === 'venues' ? 'active' : ''}`}
          onClick={() => setActiveTab('venues')}
        >
          Venue Management
        </button>
        <button 
          className={`vms-tab-btn ${activeTab === 'timeSlots' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeSlots')}
        >
          Time Slots Management
        </button>
      </div>
      
      {activeTab === 'venues' ? (
        <div className="vms-venue-management">
          <div className="vms-add-venue">
            <h2 className="vms-subtitle">Add New Venue</h2>
            <div className="vms-add-form">
              <select
                className="vms-input vms-venue-select"
                value={newVenue.name}
                onChange={(e) => setNewVenue({...newVenue, name: e.target.value})}
              >
                <option value="">Select a venue</option>
                {availableVenues.map(venue => (
                  <option key={venue} value={venue}>{venue}</option>
                ))}
              </select>
              <input
                type="number"
                className="vms-input vms-rooms-input"
                min="1"
                value={newVenue.totalRooms}
                onChange={(e) => setNewVenue({...newVenue, totalRooms: parseInt(e.target.value) || 1})}
              />
              <button 
                className="vms-add-button"
                onClick={handleAddVenue}
                disabled={!newVenue.name}
              >
                Add Venue
              </button>
            </div>
          </div>

          <div className="vms-venues-list">
            <h2 className="vms-subtitle">Existing Venues</h2>
            <div className="vms-table-header">
              <span className="vms-header-name">Venue Name</span>
              <span className="vms-header-rooms">Total Rooms</span>
              <span className="vms-header-actions">Actions</span>
            </div>
            
            {venues.length === 0 ? (
              <div className="vms-no-venues">No venues found</div>
            ) : (
              venues.map(venue => (
                <div key={venue.id} className="vms-venue-item">
                  {editingId === venue.id ? (
                    <>
                      <input
                        type="text"
                        className="vms-edit-input vms-edit-name"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                      />
                      <input
                        type="number"
                        className="vms-edit-input vms-edit-rooms"
                        name="totalRooms"
                        min="1"
                        value={editForm.totalRooms}
                        onChange={handleEditChange}
                      />
                      <div className="vms-edit-actions">
                        <button 
                          className="vms-save-button"
                          onClick={() => handleSaveVenue(venue.id)}
                        >
                          <FaSave /> Save
                        </button>
                        <button 
                          className="vms-cancel-button"
                          onClick={() => setEditingId(null)}
                        >
                          <FaTimes /> Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="vms-venue-name">{venue.name}</span>
                      <span className="vms-venue-rooms">{venue.totalRooms}</span>
                      <div className="vms-venue-actions">
                        <button 
                          className="vms-edit-button"
                          onClick={() => handleEditClick(venue)}
                        >
                          <FaEdit /> Edit
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="vms-time-slots-management">
          <div className="vms-package-type-selector">
            <button
              className={`vms-type-btn ${packageType === 'dining' ? 'active' : ''}`}
              onClick={() => setPackageType('dining')}
            >
              Dining Packages
            </button>
            <button
              className={`vms-type-btn ${packageType === 'stay' ? 'active' : ''}`}
              onClick={() => setPackageType('stay')}
            >
              Stay Packages
            </button>
          </div>

          <div className="vms-venue-selection">
            <label>Select Venue:</label>
            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              disabled={timeSlotVenues[packageType]?.length === 0}
            >
              {timeSlotVenues[packageType]?.length > 0 ? (
                timeSlotVenues[packageType].map(venue => (
                  <option key={venue} value={venue}>{venue}</option>
                ))
              ) : (
                <option value="">No venues found</option>
              )}
            </select>
          </div>

          {selectedVenue && (
            <div className="vms-time-slots-editor">
              <h3>Time Slots for {selectedVenue}</h3>
              
              <div className="vms-slots-list">
                {timeSlots.length > 0 ? (
                  timeSlots.map((slot, index) => (
                    <div key={index} className="vms-slot-item">
                      <span>{slot}</span>
                      <button
                        className="vms-remove-btn"
                        onClick={() => removeSlot(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="vms-no-slots">No time slots configured yet</div>
                )}
              </div>

              <div className="vms-add-slot">
                <input
                  type="text"
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  placeholder="Enter time slot (e.g., 12:00 PM - 06:00 PM)"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSlot()}
                />
                <button
                  className="vms-add-btn"
                  onClick={handleAddSlot}
                  disabled={!newSlot.trim()}
                >
                  Add Slot
                </button>
              </div>

              <button
                className="vms-save-btn"
                onClick={saveTimeSlots}
                disabled={!selectedVenue}
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VenueManagementSystem;