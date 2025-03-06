import React, { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage, fireDB } from './firebase'; // Firebase setup file
import {collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import './AddStayPackage.css';
import 'react-toastify/dist/ReactToastify.css';
import {toast, ToastContainer } from 'react-toastify';

const AddStayPackage = () => {
  const [packages, setPackages] = useState([]);
  const [newPackage, setNewPackage] = useState({
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
    special_features: [],
    images: [],
    ratings: '0',
    isActive: true
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editPackageId, setEditPackageId] = useState(null);
  const [currentItem, setCurrentItem] = useState('');
  const [currentField, setCurrentField] = useState('');
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [loading, setLoading] = useState(false); // New loading state

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const querySnapshot = await getDocs(collection( fireDB, 'stayPackages'));
        const packagesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPackages(packagesData);
      } catch (error) {
        console.error('Error fetching packages:', error);
      }
    };

    fetchPackages();

    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ fireDB]);

  const handleAddPackage = async () => {
    setLoading(true); // Start loading
    try {
      const docRef = await addDoc(collection(fireDB, 'stayPackages'), newPackage);
      setPackages([...packages, { id: docRef.id, ...newPackage }]);
      toast.success('Package added successfully!');
      resetForm();
    } catch (error) {
      console.error('Error adding package:', error);
      toast.error('Failed to add package. Please try again.');
    } finally {
      setLoading(false); // Stop loading
    }
  };
  
  const handleEditPackage = async () => {
    setLoading(true); // Start loading
    try {
      const packageRef = doc(fireDB, 'stayPackages', editPackageId);
      await updateDoc(packageRef, newPackage);
      const updatedPackages = packages.map(pkg =>
        pkg.id === editPackageId ? { ...newPackage, id: editPackageId } : pkg
      );
      setPackages(updatedPackages);
      toast.success('Package updated successfully!');
      setIsEditing(false);
      resetForm();
    } catch (error) {
      console.error('Error updating package:', error);
      toast.error('Failed to update package. Please try again.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleDeletePackage = async (id) => {
    try {
      const packageRef = doc( fireDB, 'stayPackages', id);
      await deleteDoc(packageRef);
      setPackages(packages.filter(pkg => pkg.id !== id));
    } catch (error) {
      console.error('Error deleting package:', error);
    }
  };

  const handleActivateDeactivatePackage = async (id, isActive) => {
    try {
      const packageRef = doc( fireDB, 'stayPackages', id);
      await updateDoc(packageRef, { isActive: !isActive });
      const updatedPackages = packages.map(pkg =>
        pkg.id === id ? { ...pkg, isActive: !isActive } : pkg
      );
      setPackages(updatedPackages);
    } catch (error) {
      console.error('Error updating package status:', error);
    }
  };

  const handleSetEditPackage = (pkg) => {
    setIsEditing(true);
    setEditPackageId(pkg.id);
    setNewPackage({ ...pkg });
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

  const handleItemChange = (e) => setCurrentItem(e.target.value);
  const handleFieldChange = (e) => setCurrentField(e.target.value);

  const resetForm = () => {
    setNewPackage({
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
      special_features: [],
      images: [],
      ratings: '0',
      isActive: true
    });
    setIsEditing(false);
    setEditPackageId(null);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedImageUrls = [];

    for (const file of files) {
      const storageRef = ref(storage, `Staypackages/${file.name}`);
      try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        uploadedImageUrls.push(downloadURL);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }

    setNewPackage(prev => ({
      ...prev,
      images: [...(prev.images || []), ...uploadedImageUrls] // Store the URLs
    }));
  };

  const handleDeleteImage = async (index) => {
    const imageToDelete = newPackage.images[index];

    try {
      // Remove image from Firebase storage
      const imageRef = ref(storage, imageToDelete);
      await deleteObject(imageRef);

      // Remove the image URL from the package's state
      setNewPackage(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="package-container">
      <h1>Admin Panel - Stay Manage Packages</h1>
      <br />
      <div className="form-container">
        <h2>{isEditing ? 'Edit Package' : 'Add New Package'}</h2>
        <input
          type="text"
          placeholder="Name"
          value={newPackage.name}
          onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
        />
        <div className="form-group">
          <label htmlFor="images">Upload Images:</label>
          <input type="file" multiple accept="image/*" onChange={handleImageUpload} />
        </div>

        {/* Image Preview Section */}
        <div className="image-preview">
          {newPackage.images.map((image, index) => (
            <div className="image-item" key={index}>
              <img src={image} alt={`Preview ${index + 1}`} />
              <button className="delete-image-btn" onClick={() => handleDeleteImage(index)}>Delete</button>
            </div>
          ))}
        </div>

        <input
          type="text"
          placeholder="Venue"
          value={newPackage.venue}
          onChange={(e) => setNewPackage({ ...newPackage, venue: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          value={newPackage.description}
          onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
        />
        <input
          type="text"
          placeholder="Best For"
          value={newPackage.best_for}
          onChange={(e) => setNewPackage({ ...newPackage, best_for: e.target.value })}
        />
        <input
          type="text"
          placeholder="Food"
          value={newPackage.food}
          onChange={(e) => setNewPackage({ ...newPackage, food: e.target.value })}
        />
        <input
          type="text"
          placeholder="Duration"
          value={newPackage.duration}
          onChange={(e) => setNewPackage({ ...newPackage, duration: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          value={newPackage.price}
          onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
        />
        <input
          type="text"
          placeholder="Discount"
          value={newPackage.discount}
          onChange={(e) => setNewPackage({ ...newPackage, discount: e.target.value })}
        />
        <input
          type="text"
          placeholder="Extra Guest Charges"
          value={newPackage.extra_guest_charges}
          onChange={(e) => setNewPackage({ ...newPackage, extra_guest_charges: e.target.value })}
        />


        <h3>Manage Inclusions, Exclusions, Good to Know, Additional Info, Special Features:</h3>
        <div className="item-input">

          <select value={currentField} onChange={handleFieldChange}>
            <option value="">Select Field</option>
            <option value="inclusions">Inclusions</option>
            <option value="exclusions">Exclusions</option>
            <option value="good_to_know">Good to Know</option>
            <option value="additional_info">Additional Info</option>
            <option value="special_features">Special Features</option>
          </select>
          <input
            type="text"
            value={currentItem}
            onChange={handleItemChange}
            placeholder="Add Item"
          />
          <button onClick={handleAddItem}>Add</button>
        </div>

        {['inclusions', 'exclusions', 'good_to_know', 'additional_info', 'special_features'].map(field => (
          <div key={field}>
            <h4>{field.replace(/_/g, ' ').toUpperCase()}</h4>
            <ul>
              {newPackage[field].map((item, index) => (
                <li key={index}>
                  {item}
                  <button onClick={() => handleDeleteItem(field, index)}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <button
  onClick={isEditing ? handleEditPackage : handleAddPackage}
  disabled={loading} // Disable button when loading
>
  {loading ? 'Processing...' : isEditing ? 'Update Package' : 'Add Package'}
</button>

      <h2>All Packages</h2>
      <ul>
        {packages.map(pkg => (
          <li key={pkg.id}>
            {pkg.name} - {pkg.isActive ? 'Active' : 'Inactive'}
            <button onClick={() => handleSetEditPackage(pkg)}>Edit</button>
            <button onClick={() => handleDeletePackage(pkg.id)}>Delete</button>
            <button onClick={() => handleActivateDeactivatePackage(pkg.id, pkg.isActive)}>
              {pkg.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </li>
        ))}
      </ul>

      {showScrollToTop && (
        <button className="scroll-to-top" onClick={scrollToTop}>Scroll to Top</button>
      )}
<ToastContainer />
    </div>

  );
};

export default AddStayPackage;
