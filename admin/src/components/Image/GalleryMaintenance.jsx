import React, { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { fireDB, storage } from '../firebase';
import './GalleryMaintenance.css';
import { ToastContainer } from 'react-toastify';

const GalleryMaintenance = () => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [category, setCategory] = useState('All'); // Add state for category
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchImages = async () => {
      const querySnapshot = await getDocs(collection(fireDB, 'gallery'));
      const imagesArray = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setImages(imagesArray);
    };

    fetchImages();
  }, []);

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (!selectedFiles) return;

    setUploading(true);

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const storageRef = ref(storage, `gallery/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(fireDB, 'gallery'), {
        name: file.name,
        url: url,
        category: category, // Include category in the document
      });
    }

    setUploading(false);
    setSelectedFiles(null);

    // Refresh the images list
    const querySnapshot = await getDocs(collection(fireDB, 'gallery'));
    const imagesArray = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setImages(imagesArray);
  };

  const handleDelete = async (imageId, imageName) => {
    const imageRef = ref(storage, `gallery/${imageName}`);
    await deleteObject(imageRef);
    await deleteDoc(doc(fireDB, 'gallery', imageId));

    setImages(images.filter(image => image.id !== imageId));
  };

  const filteredImages = selectedCategory === 'All'
    ? images
    : images.filter(image => image.category === selectedCategory);

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2>Gallery Maintenance</h2>
        <div className="upload-section">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Stays">Stays</option>
            <option value="Decorations">Decorations</option>
            <option value="Rooftop">Rooftop</option>
            <option value="Dining">Dining</option>
          </select>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="upload-files"
          />
          <label htmlFor="upload-files" className="upload-button">
            {uploading ? 'Uploading...' : 'Add Images'}
          </label>
          <button onClick={handleUpload} disabled={uploading || !selectedFiles} className="upload-button">
            Add
          </button>
        </div>
      </div>
      <div className="category-filter">
          {/* Add Category Filter Buttons */}
          <button onClick={() => setSelectedCategory('All')} className={selectedCategory === 'All' ? 'active' : ''}>All</button>
          <button onClick={() => setSelectedCategory('Stays')} className={selectedCategory === 'Stays' ? 'active' : ''}>Stays</button>
          <button onClick={() => setSelectedCategory('Decorations')} className={selectedCategory === 'Decorations' ? 'active' : ''}>Decorations</button>
          <button onClick={() => setSelectedCategory('Rooftop')} className={selectedCategory === 'Rooftop' ? 'active' : ''}>Rooftop</button>
          <button onClick={() => setSelectedCategory('Dining')} className={selectedCategory === 'Dining' ? 'active' : ''}>Dining</button>
        </div>
      <div className="gallery-grid">
        {filteredImages.length > 0 ? (
          filteredImages.map(image => (
            <div key={image.id} className="gallery-item">
              <img src={image.url} alt={image.name} />
              <div className="edit-overlay">
                <button
                  className="delete-button"
                  onClick={() => handleDelete(image.id, image.name)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-images">No images uploaded yet.</p>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default GalleryMaintenance;
