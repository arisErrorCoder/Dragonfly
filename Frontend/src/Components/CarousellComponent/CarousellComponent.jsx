import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './CarousellComponent.css'; // Make sure this CSS file exists and contains necessary styles

// Import images
import image1 from '../../assets/desk1.jpg';
import image2 from '../../assets/desk2.jpg';
import image3 from '../../assets/desk3.jpg';
import image4 from '../../assets/desk4.jpg';

const ImageSlider = () => {
  // Slider settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="slider-container">
      <Slider {...settings}>
        <div className="slide">
          <img src={image1} alt="Slide 1" className="slide-image" />
        </div>
        <div className="slide">
          <img src={image2} alt="Slide 2" className="slide-image" />
        </div>
        <div className="slide">
          <img src={image3} alt="Slide 3" className="slide-image" />
        </div>
        <div className="slide">
          <img src={image4} alt="Slide 4" className="slide-image" />
        </div>
      </Slider>
    </div>
  );
};

export default ImageSlider;
