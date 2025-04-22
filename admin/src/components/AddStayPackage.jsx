import React, { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage, fireDB } from './firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AddStayPackage.css';

const AddStayPackage = () => {
  // State management
  const [packages, setPackages] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editPackageId, setEditPackageId] = useState(null);
  const [currentItem, setCurrentItem] = useState('');
  const [currentField, setCurrentField] = useState('');
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('form');
  const [searchTerm, setSearchTerm] = useState('');

  // Initial package state
  const initialPackageState = {
    name: '',
    venue: '',
    description: '',
    best_for: '',
    food: '',
    duration: '',
    price: '',
    discount: '',
    extra_guest_charges: '',
    times_hearted: '',
    times_opened: '0',
    times_booked: '0',
    duration_viewed: '0',
    services_offered: '',
    inclusions: [],
    exclusions: [],
    good_to_know: [],
    additional_info: [],
    Cancellation_and_Refund_Policy: [],
    special_features: [],
    images: [],
    ratings: '0',
    packageType:'stayVenues',
    isActive: true
  };

  const [newPackage, setNewPackage] = useState(initialPackageState);

  // Fetch packages from Firestore
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const querySnapshot = await getDocs(collection(fireDB, 'stayPackages'));
        const packagesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPackages(packagesData);
      } catch (error) {
        console.error('Error fetching packages:', error);
        toast.error('Failed to load packages');
      }
    };

    fetchPackages();

    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fireDB]);

  // Filter packages based on search term
  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.venue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Package CRUD operations
  const handleAddPackage = async () => {
    setIsProcessing(true);
    try {
      const docRef = await addDoc(collection(fireDB, 'stayPackages'), newPackage);
      setPackages([...packages, { id: docRef.id, ...newPackage }]);
      toast.success('Package added successfully!');
      resetForm();
      setActiveTab('list');
    } catch (error) {
      console.error('Error adding package:', error);
      toast.error('Failed to add package');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleEditPackage = async () => {
    setIsProcessing(true);
    try {
      const packageRef = doc(fireDB, 'stayPackages', editPackageId);
      await updateDoc(packageRef, newPackage);
      setPackages(packages.map(pkg => 
        pkg.id === editPackageId ? { ...newPackage, id: editPackageId } : pkg
      ));
      toast.success('Package updated successfully!');
      resetForm();
      setActiveTab('list');
    } catch (error) {
      console.error('Error updating package:', error);
      toast.error('Failed to update package');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePackage = async (id) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      setIsProcessing(true);
      try {
        await deleteDoc(doc(fireDB, 'stayPackages', id));
        setPackages(packages.filter(pkg => pkg.id !== id));
        toast.success('Package deleted successfully!');
      } catch (error) {
        console.error('Error deleting package:', error);
        toast.error('Failed to delete package');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleTogglePackageStatus = async (id, isActive) => {
    setIsProcessing(true);
    try {
      await updateDoc(doc(fireDB, 'stayPackages', id), { isActive: !isActive });
      setPackages(packages.map(pkg =>
        pkg.id === id ? { ...pkg, isActive: !isActive } : pkg
      ));
      toast.success(`Package ${!isActive ? 'activated' : 'deactivated'}!`);
    } catch (error) {
      console.error('Error updating package status:', error);
      toast.error('Failed to update package status');
    } finally {
      setIsProcessing(false);
    }
  };

  // Form handling
  const handleSetEditPackage = (pkg) => {
    setIsEditing(true);
    setEditPackageId(pkg.id);
    setNewPackage({ 
      ...initialPackageState,
      ...pkg
    });
    setActiveTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddItem = () => {
    if (currentItem.trim() && currentField) {
      setNewPackage(prev => ({
        ...prev,
        [currentField]: [...prev[currentField], currentItem.trim()]
      }));
      setCurrentItem('');
    }
  };

  const handleDeleteItem = (field, index) => {
    setNewPackage(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setNewPackage(initialPackageState);
    setIsEditing(false);
    setEditPackageId(null);
  };

  // Image handling
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsProcessing(true);
    const uploadedImageUrls = [];

    try {
      for (const file of files) {
        const storageRef = ref(storage, `Staypackages/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        uploadedImageUrls.push(downloadURL);
      }

      setNewPackage(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImageUrls]
      }));
      toast.success('Images uploaded successfully!');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload some images');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteImage = async (index) => {
    const imageToDelete = newPackage.images[index];
    
    try {
      const imageRef = ref(storage, imageToDelete);
      await deleteObject(imageRef);
      
      setNewPackage(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
      toast.success('Image deleted successfully!');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  // UI helpers
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fieldLabels = {
    inclusions: 'Inclusions',
    exclusions: 'Exclusions',
    good_to_know: 'Good to Know',
    special_features: 'Special Features',
    Cancellation_and_Refund_Policy: 'Cancellation Policy'
  };

  return (
    <div className="sp-admin-container">
      <header className="sp-admin-header">
        <h1>Stay Package Management</h1>
        <div className="sp-admin-tabs">
          <button 
            className={`sp-tab-btn ${activeTab === 'form' ? 'active' : ''}`}
            onClick={() => setActiveTab('form')}
          >
            {isEditing ? 'Edit Package' : 'Add Package'}
          </button>
          <button 
            className={`sp-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            View Packages
          </button>
        </div>
      </header>

      <main className="sp-admin-main">
        {activeTab === 'form' && (
          <div className="sp-form-container">
            <div className="sp-form-section sp-basic-info">
              <h2>Basic Information</h2>
              <div className="sp-form-grid">
                <div className="sp-form-group">
                  <label>Package Name</label>
                  <input
                    type="text"
                    value={newPackage.name}
                    onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                    placeholder="e.g., Luxury Weekend Getaway"
                  />
                </div>

                <div className="sp-form-group">
                  <label>Venue/Hotel</label>
                  <input
                    type="text"
                    value={newPackage.venue}
                    onChange={(e) => setNewPackage({ ...newPackage, venue: e.target.value })}
                    placeholder="e.g., Mountain View Resort"
                  />
                </div>

                <div className="sp-form-group">
                  <label>Description</label>
                  <textarea
                    value={newPackage.description}
                    onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                    placeholder="Detailed description of the stay experience"
                    rows="3"
                  />
                </div>

                <div className="sp-form-group">
                  <label>Best For</label>
                  <input
                    type="text"
                    value={newPackage.best_for}
                    onChange={(e) => setNewPackage({ ...newPackage, best_for: e.target.value })}
                    placeholder="e.g., Couples, Family vacations"
                  />
                </div>

                <div className="sp-form-group">
                  <label>Meal Plan</label>
                  <input
                    type="text"
                    value={newPackage.food}
                    onChange={(e) => setNewPackage({ ...newPackage, food: e.target.value })}
                    placeholder="e.g., Breakfast included, All meals"
                  />
                </div>

                <div className="sp-form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    value={newPackage.duration}
                    onChange={(e) => setNewPackage({ ...newPackage, duration: e.target.value })}
                    placeholder="e.g., 2 nights, Weekend package"
                  />
                </div>

                <div className="sp-form-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    value={newPackage.price}
                    onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
                    placeholder="e.g., 12000"
                  />
                </div>

                <div className="sp-form-group">
                  <label>Discount</label>
                  <input
                    type="text"
                    value={newPackage.discount}
                    onChange={(e) => setNewPackage({ ...newPackage, discount: e.target.value })}
                    placeholder="e.g., 20% off"
                  />
                </div>

                <div className="sp-form-group">
                  <label>Extra Guest Charges</label>
                  <input
                    type="text"
                    value={newPackage.extra_guest_charges}
                    onChange={(e) => setNewPackage({ ...newPackage, extra_guest_charges: e.target.value })}
                    placeholder="e.g., ₹1000 per extra person"
                  />
                </div>
              </div>
            </div>

            <div className="sp-form-section sp-image-upload">
              <h2>Package Images</h2>
              <div className="sp-image-uploader">
                <label className="sp-upload-btn">
                  Choose Images
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    disabled={isProcessing}
                  />
                </label>
                <p className="sp-upload-hint">Upload high-quality images of the stay experience (max 5)</p>
                
                <div className="sp-image-preview-grid">
                  {newPackage.images.map((image, index) => (
                    <div className="sp-image-preview-item" key={index}>
                      <img src={image} alt={`Stay preview ${index + 1}`} />
                      <button 
                        className="sp-image-delete-btn"
                        onClick={() => handleDeleteImage(index)}
                        disabled={isProcessing}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="sp-form-section sp-features">
              <h2>Package Features</h2>
              <div className="sp-feature-controls">
                <div className="sp-feature-selector">
                  <select 
                    value={currentField} 
                    onChange={(e) => setCurrentField(e.target.value)}
                    className="sp-feature-dropdown"
                  >
                    <option value="">Select Feature Category</option>
                    {Object.keys(fieldLabels).map(key => (
                      <option key={key} value={key}>{fieldLabels[key]}</option>
                    ))}
                  </select>
                </div>
                
                <div className="sp-feature-input">
                  <input
                    type="text"
                    value={currentItem}
                    onChange={(e) => setCurrentItem(e.target.value)}
                    placeholder="Enter feature item"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                  />
                  <button 
                    onClick={handleAddItem}
                    disabled={!currentField || !currentItem.trim()}
                    className="sp-add-feature-btn"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="sp-feature-lists">
                {Object.keys(fieldLabels).map(field => (
                  newPackage[field].length > 0 && (
                    <div key={field} className="sp-feature-list">
                      <h3>{fieldLabels[field]}</h3>
                      <ul>
                        {newPackage[field].map((item, index) => (
                          <li key={index}>
                            <span>{item}</span>
                            <button 
                              onClick={() => handleDeleteItem(field, index)}
                              className="sp-delete-feature-btn"
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                ))}
              </div>
            </div>

            <div className="sp-form-actions">
              <button 
                onClick={isEditing ? handleEditPackage : handleAddPackage}
                disabled={isProcessing || !newPackage.name || !newPackage.venue}
                className={`sp-submit-btn ${isEditing ? 'sp-edit-mode' : ''}`}
              >
                {isProcessing ? (
                  <span className="sp-spinner">Processing...</span>
                ) : isEditing ? (
                  'Update Package'
                ) : (
                  'Add Package'
                )}
              </button>
              
              <button 
                onClick={resetForm}
                disabled={isProcessing}
                className="sp-cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {activeTab === 'list' && (
          <div className="sp-list-container">
            <div className="sp-list-controls">
              <div className="sp-search-box">
                <input
                  type="text"
                  placeholder="Search stay packages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="sp-search-icon">🔍</span>
              </div>
            </div>

            <div className="sp-package-grid">
              {filteredPackages.length > 0 ? (
                filteredPackages.map(pkg => (
                  <div key={pkg.id} className={`sp-package-card ${!pkg.isActive ? 'inactive' : ''}`}>
                    <div className="sp-card-header">
                      <h3>{pkg.name}</h3>
                      <span className={`sp-status-badge ${pkg.isActive ? 'active' : 'inactive'}`}>
                        {pkg.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="sp-card-body">
                      <p className="sp-card-venue">{pkg.venue}</p>
                      <p className="sp-card-price">₹{pkg.price} {pkg.discount && <span className="sp-discount">{pkg.discount}% Off</span>}</p>
                      <p className="sp-card-duration">{pkg.duration}</p>
                      {pkg.images.length > 0 && (
                        <div className="sp-card-thumbnail">
                          <img src={pkg.images[0]} alt={pkg.name} />
                        </div>
                      )}
                    </div>
                    
                    <div className="sp-card-footer">
                      <button 
                        onClick={() => handleSetEditPackage(pkg)}
                        className="sp-card-btn edit"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleTogglePackageStatus(pkg.id, pkg.isActive)}
                        className={`sp-card-btn ${pkg.isActive ? 'deactivate' : 'activate'}`}
                        disabled={isProcessing}
                      >
                        {pkg.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="sp-card-btn delete"
                        disabled={isProcessing}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="sp-no-results">
                  {searchTerm ? 'No stay packages match your search' : 'No stay packages available'}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {showScrollToTop && (
        <button className="sp-scroll-top" onClick={scrollToTop}>
          ↑
        </button>
      )}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default AddStayPackage;