import React from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import './Moments.css'; 

import moment1Image from '../../assets/moment 1.jpg';
import moment2Image from '../../assets/moment 2.jpg';
import moment3Image from '../../assets/moment 3.jpg';
import moment4Image from '../../assets/moment 4.jpg';
import moment5Image from '../../assets/moment 5.jpg';

import moment6Image from '../../assets/moment 6.jpg';
import moment8Image from '../../assets/moment 8.jpg';
import moment9Image from '../../assets/moment 9.jpg';
import { Link } from 'react-router-dom';

const Moment = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  const images = [
    moment1Image,
    moment2Image,
    moment3Image,
    moment4Image,
    moment5Image,
    moment6Image,
    moment8Image,
    moment9Image
  ];

  return (
    <div>
      <div className="heading-container">
        <h2>VIEW THE MOMENTS THAT WE CREATE</h2>
      </div>
      <div className="big-container">
        {/* Grid layout */}
        <div className="main-containerr">
          <div className="first-row">
            <div className="box box-1">
              <img src={moment1Image} alt="Moment 1" />
            </div>
            <div className="box box-2">
              <img src={moment2Image} alt="Moment 2" />
            </div>
            <div className="box box-3">
              <img src={moment3Image} alt="Moment 3" />
            </div>
          </div>
          <div className="second-row">
            <div className="box box-6">
              <img src={moment6Image} alt="Moment 6" />
            </div>
            <div className="box box-4">
              <img src={moment4Image} alt="Moment 4" />
            </div>
            <div className="box box-5">
              <img src={moment5Image} alt="Moment 5" />
            </div>
          </div>
          <div className="third-row">
            <div className="box box-7">
            <img src={moment9Image} alt="Moment 9" />
            </div>
            <div className="box box-8">
              <img src={moment8Image} alt="Moment 8" />
            </div>
            <Link style={{textDecoration:"none"}}to='/gallery'>
            <div className="box box-9">
            <button >View Gallery</button>
            </div>
            </Link>
          </div>
        </div>

        {/* Carousel for small screens */}
        <div className="carousell">
          <Slider  className='slider-container'{...settings}>
            {images.map((image, index) => (
              <div key={index} className="carousel-slide">
               <img src={image} alt={`Slide ${index + 1}`} />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default Moment;