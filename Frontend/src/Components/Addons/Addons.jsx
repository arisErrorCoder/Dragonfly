import React, { useRef } from 'react';
import './Addons.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Import arrow icons
import image1 from '../../assets/addon 1.jpg'; // Import your images
import image2 from '../../assets/addon 2.jpg';
import image3 from '../../assets/addon 3.jpg';
import image4 from '../../assets/addon 4.jpg';
import image5 from '../../assets/addon 5.jpg';
import image6 from '../../assets/addon 6.jpg';
import image7 from '../../assets/addon 1.jpg';
import image8 from '../../assets/addon 2.jpg';
import image9 from '../../assets/addon 3.jpg';
import image10 from '../../assets/addon 4.jpg';
import image11 from '../../assets/addon 5.jpg';
import image12 from '../../assets/addon 6.jpg';

const Addons = () => {
  const scrollContainerRef = useRef(null);

  const images = [
    { src: image1, text: 'Smoke' },
    { src: image2, text: 'Bubble Machine' },
    { src: image3, text: 'Fireworks' },
    { src: image4, text: 'Rose Bouquet' },
    { src: image5, text: 'Ballons' },
    { src: image6, text: 'Teddy Bear' },
    { src: image7, text: 'Smoke' },
    { src: image8, text: 'Bubble Machine' },
    { src: image9, text: 'Fireworks' },
    { src: image10, text: 'Rose Bouquet' },
    { src: image11, text: 'Ballons' },
    { src: image12, text: 'Teddy Bear' },
  ];

  const scrollLeft = () => {
    scrollContainerRef.current.scrollBy({ left: -220, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollContainerRef.current.scrollBy({ left: 220, behavior: 'smooth' });
  };

  return (
    <div>
      <div className="heading-container">
        <h2>ADDONS TO MAKE IT EXTRA SPECIAL</h2>
      </div>
      <div className="scroll-wrapper">
        <button className="scroll-button left" onClick={scrollLeft}>
          <FaChevronLeft />
        </button>
        <div className="scroll-container" ref={scrollContainerRef}>
          {images.map((image, index) => (
            <div className="scroll-item" key={index}>
              <img src={image.src} alt={image.text} />
              <div className="image-text">{image.text}</div>
            </div>
          ))}
        </div>
        <button className="scroll-button right" onClick={scrollRight}>
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default Addons;
