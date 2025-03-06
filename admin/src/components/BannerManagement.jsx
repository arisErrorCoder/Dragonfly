// src/components/BannerManagement.js
import React, { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { fireDB, storage } from '../components/firebase';
import './BannerManagement.css';

const BannerManagement = ({ type }) => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      const querySnapshot = await getDocs(collection(fireDB, type));
      const imagesArray = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setImages(imagesArray);
    };

    fetchImages();
  }, [type]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);

    const storageRef = ref(storage, `${type}/${selectedFile.name}`);
    await uploadBytes(storageRef, selectedFile);
    const url = await getDownloadURL(storageRef);

    await addDoc(collection(fireDB, type), {
      name: selectedFile.name,
      url: url,
    });

    setUploading(false);
    setSelectedFile(null);

    // Refresh the images list
    const querySnapshot = await getDocs(collection(fireDB, type));
    const imagesArray = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setImages(imagesArray);
  };

  const handleDelete = async (imageId, imageName) => {
    const imageRef = ref(storage, `${type}/${imageName}`);
    await deleteObject(imageRef);
    await deleteDoc(doc(fireDB, type, imageId));

    setImages(images.filter(image => image.id !== imageId));
  };

  return (
    <div className="banner-container">
      <div className="banner-header">
        <h2>{type === 'banners' ? 'Banner Management' : 'Offer Banner Management'}</h2>
        <div>
          <input
            type="file"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="upload-banner-file"
          />
          <label htmlFor="upload-banner-file" className="upload-button">
            {uploading ? 'Uploading...' : 'Add Banner Image'}
          </label>
          <button onClick={handleUpload} disabled={uploading || !selectedFile} className="upload-button">
            Add
          </button>
        </div>
      </div>

      <div className="banner-grid">
        {images.length > 0 ? (
          images.map(image => (
            <div key={image.id} className="banner-item">
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
    </div>
  );
};

export default BannerManagement;
