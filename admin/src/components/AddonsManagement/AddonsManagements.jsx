// src/components/AddonsManagements.js
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { fireDB } from '../firebase';
import { toast, ToastContainer } from 'react-toastify';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import 'react-toastify/dist/ReactToastify.css';
import './AddonsManagements.css';

const AddonsManagements = () => {
  const [addons, setAddons] = useState([]);
  const [newAddon, setNewAddon] = useState({
    name: '',
    price: '',
    description: '',
    image: null, // New field for image
  });
  const [editingAddon, setEditingAddon] = useState(null);
  const [imageFile, setImageFile] = useState(null); // State for image file

  useEffect(() => {
    const fetchAddons = async () => {
      try {
        const querySnapshot = await getDocs(collection(fireDB, 'addons'));
        const addonsArray = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAddons(addonsArray);
      } catch (error) {
        toast.error('Failed to fetch addons.');
      }
    };

    fetchAddons();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddon({
      ...newAddon,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleAddAddon = async () => {
    try {
      let imageUrl = '';
      if (imageFile) {
        const storage = getStorage();
        const storageRef = ref(storage, `addons/${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      if (editingAddon) {
        await updateDoc(doc(fireDB, 'addons', editingAddon.id), {
          ...newAddon,
          image: imageUrl || editingAddon.image // Use existing image if not updated
        });
        toast.success('Addon updated successfully!');
        setEditingAddon(null);
      } else {
        await addDoc(collection(fireDB, 'addons'), {
          ...newAddon,
          image: imageUrl,
        });
        toast.success('Addon added successfully!');
      }
      
      setNewAddon({ name: '', price: '', description: '', image: null });
      setImageFile(null); // Reset image file
      refreshAddons();
    } catch (error) {
      toast.error('Failed to add or update addon.');
    }
  };

  const handleEdit = (addon) => {
    setNewAddon({
      name: addon.name,
      price: addon.price,
      description: addon.description,
      image: addon.image // Load existing image URL
    });
    setEditingAddon(addon);
  };

  const handleDeleteAddon = async (addonId) => {
    try {
      await deleteDoc(doc(fireDB, 'addons', addonId));
      toast.success('Addon deleted successfully!');
      setAddons(addons.filter(addon => addon.id !== addonId));
    } catch (error) {
      toast.error('Failed to delete addon.');
    }
  };

  const refreshAddons = async () => {
    try {
      const querySnapshot = await getDocs(collection(fireDB, 'addons'));
      const addonsArray = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAddons(addonsArray);
    } catch (error) {
      toast.error('Failed to refresh addons.');
    }
  };

  return (
    <div className="addons-management-container">
      <h2>Addons Management</h2>

      <div className="addon-form">
        <input
          type="text"
          name="name"
          placeholder="Addon Name"
          value={newAddon.name}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="price"
          placeholder="Addon Price"
          value={newAddon.price}
          onChange={handleInputChange}
        />
        <textarea
          name="description"
          placeholder="Addon Description"
          value={newAddon.description}
          onChange={handleInputChange}
        ></textarea>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        <div className="button-grid">
          <button onClick={handleAddAddon}>
            {editingAddon ? 'Update Addon' : 'Add Addon'}
          </button>
          {editingAddon && (
            <button onClick={() => setEditingAddon(null)} className="cancel-button">
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="addons-grid">
        {addons.map(addon => (
          <div key={addon.id} className="addon-item">
            <h3>{addon.name}</h3>
            {addon.image && <img src={addon.image} alt={addon.name} className="addon-image" />}
            <p>{addon.description}</p>
            <p className="addon-price">₹{addon.price}</p>
            <div className="addon-actions">
              <button onClick={() => handleEdit(addon)}>Edit</button>
              <button onClick={() => handleDeleteAddon(addon.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default AddonsManagements;
