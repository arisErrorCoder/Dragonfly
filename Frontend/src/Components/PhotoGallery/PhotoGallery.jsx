import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { fireDB } from './firebase';
import './PhotoGallery.css';

const PhotoGallery = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const querySnapshot = await getDocs(collection(fireDB, 'gallery'));
                const imagesArray = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setImages(imagesArray);
            } catch (error) {
                console.error("Error fetching images:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchImages();
    }, []);

    const handleImageClick = (image) => {
        setSelectedImage(image);
        document.body.style.overflow = 'hidden';
    };

    const handleCloseClick = () => {
        setSelectedImage(null);
        document.body.style.overflow = 'auto';
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        document.body.style.overflow = isMenuOpen ? 'auto' : 'hidden';
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        document.body.style.overflow = 'auto';
    };

    const filteredImages = selectedCategory === 'All'
        ? images
        : images.filter(image => image.category === selectedCategory);

    return (
        <div className="galaxy-gallery-container">
            <header className="galaxy-gallery-header">
                <h2 className="galaxy-gallery-title">Our Visual Journey</h2>
                <button 
                    className={`galaxy-burger-btn ${isMenuOpen ? 'active' : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                    aria-expanded={isMenuOpen}
                >
                    <span className="galaxy-burger-line"></span>
                    <span className="galaxy-burger-line"></span>
                    <span className="galaxy-burger-line"></span>
                </button>
            </header>

            {isMenuOpen && (
                <div 
                    className="galaxy-menu-overlay"
                    onClick={closeMenu}
                ></div>
            )}

            <nav className={`galaxy-gallery-nav ${isMenuOpen ? 'show-nav' : ''}`}>
                <div className="galaxy-nav-header">
                    <h3>Categories</h3>
                    <button 
                        className="galaxy-close-nav-btn"
                        onClick={closeMenu}
                        aria-label="Close menu"
                    >
                        &times;
                    </button>
                </div>
                <ul className="galaxy-category-list">
                    {['All', 'Stays', 'Decorations', 'Rooftop', 'Dining'].map(category => (
                        <li 
                            key={category}
                            className={`galaxy-category-item ${selectedCategory === category ? 'active-category' : ''}`}
                            onClick={() => {
                                setSelectedCategory(category);
                                closeMenu();
                            }}
                        >
                            {category}
                        </li>
                    ))}
                </ul>
            </nav>

            {isLoading ? (
                <div className="galaxy-loader">
                    <div className="galaxy-spinner"></div>
                </div>
            ) : (
                <main className="galaxy-image-grid">
                    {filteredImages.length > 0 ? (
                        filteredImages.map((image) => (
                            <div 
                                className="galaxy-grid-item" 
                                key={image.id}
                                onClick={() => handleImageClick(image)}
                            >
                                <img 
                                    src={image.url} 
                                    alt={image.name || 'Gallery image'} 
                                    className="galaxy-grid-image"
                                    loading="lazy"
                                />
                                {image.name && (
                                    <div className="galaxy-image-overlay">
                                        <p className="galaxy-image-caption">{image.name}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="galaxy-empty-state">
                            <p className="galaxy-empty-message">No images found in this category</p>
                        </div>
                    )}
                </main>
            )}

            {selectedImage && (
                <div className="galaxy-lightbox" onClick={handleCloseClick}>
                    <div className="galaxy-lightbox-content">
                        <button 
                            className="galaxy-close-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCloseClick();
                            }}
                            aria-label="Close lightbox"
                        >
                            &times;
                        </button>
                        <img 
                            src={selectedImage.url} 
                            alt={selectedImage.name || 'Enlarged gallery image'} 
                            className="galaxy-lightbox-image"
                        />
                        {selectedImage.name && (
                            <p className="galaxy-lightbox-caption">{selectedImage.name}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhotoGallery;