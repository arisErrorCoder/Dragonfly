import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { fireDB } from './firebase'; // Ensure you import your firebase configuration
import './PhotoGallery.css';

const PhotoGallery = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    }, [images]);

    // Function to handle image click
    const handleImageClick = (src) => {
        setSelectedImage(src);
    };

    // Function to close the larger image view
    const handleCloseClick = () => {
        setSelectedImage(null);
    };

    // Function to handle menu toggle
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Filter images based on the selected category
    const filteredImages = selectedCategory === 'All'
        ? images
        : images.filter(image => image.category === selectedCategory);

    return (
        <div className="photo-gallery-container">
            <h2>Gallery Page</h2>
            <div className="burger-menu" onClick={toggleMenu}>
                <div></div>
                <div></div>
                <div></div>
            </div>

            <div className={`photo-gallery-nav ${isMenuOpen ? 'show-menu' : 'hide-menu'}`}>
                <ul>
                    <li className={selectedCategory === 'All' ? 'active' : ''} onClick={() => setSelectedCategory('All')}>All</li>
                    <li className={selectedCategory === 'Stays' ? 'active' : ''} onClick={() => setSelectedCategory('Stays')}>Stays</li>
                    <li className={selectedCategory === 'Decorations' ? 'active' : ''} onClick={() => setSelectedCategory('Decorations')}>Decorations</li>
                    <li className={selectedCategory === 'Rooftop' ? 'active' : ''} onClick={() => setSelectedCategory('Rooftop')}>Rooftop</li>
                    <li className={selectedCategory === 'Dining' ? 'active' : ''} onClick={() => setSelectedCategory('Dining')}>Dining</li>
                </ul>
            </div>

            <div className="photo-gallery">
                {filteredImages.length > 0 ? (
                    filteredImages.map((image, index) => (
                        <div className="photo-gallery-item" key={index} onClick={() => handleImageClick(image.url)}>
                            <img src={image.url} alt={image.name} />
                        </div>
                    ))
                ) : (
                    <p>No images available for this category.</p>
                )}
            </div>

            {selectedImage && (
                <div className="photo-gallery-modal" onClick={handleCloseClick}>
                    <div className="photo-gallery-modal-content">
                        <img src={selectedImage} alt="Enlarged Gallery" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhotoGallery;
