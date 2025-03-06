import React, { useEffect } from "react";
import "./AboutUs.css";

const AboutUs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
<div class="we-are-block">

<div id="about-us-section">

  <div class="about-us-image">

    <img src="https://res.cloudinary.com/simplotel/image/upload/x_341,y_0,w_3100,h_1744,c_crop,q_80,fl_progressive/w_900,h_506,f_auto,c_fit/dragonfly-hotels-service-apartments-andheri-mumbai/Dragonfly_Facade_1_ybdwrv" width="808" height="458" alt="Lobby Image"/>

  </div>

  <div class="about-us-info">

    <h2>Welcome to Dragonfly</h2>

    <p>Welcome to Dragonfly Surprises, where every celebration is a masterpiece crafted with care
and creativity. Located in the bustling heart of Mumbai, our event planning services and
boutique hotel packages are designed to transform ordinary moments into extraordinary
memories.
</p>

    {/* <a href="#" title="About Us Button"style={{textDecoration:"none"}}>ABOUT US</a> */}

  </div>

</div>

<div id="history-section">

  <div class="history-image">

    <img src="https://cf.bstatic.com/xdata/images/hotel/max1024x768/265851149.jpg?k=a553ee85925cecf8b0367b3de72687336270b70187d94c4da9009f44e4022efe&o=&hp=1" width="951" height="471" alt="Building Pic"/>

  </div>

  <div class="history-info">
    <p>Inspired by the resilience and transformation of the dragonfly, we embody the essence of
change, beauty, and self-discovery. At Dragonfly Surprises, we believe in the art of
personalization. Whether it’s a 3-hour or 4-hour event, we offer tailor-made experiences that
reflect your unique style and story. From breathtaking decorations to curated entertainment and
gourmet meals, we ensure every detail aligns perfectly with your vision.</p>
  </div>

</div>

{/* <div id="about-us-section">

  <div class="about-us-image">

    <img src="https://res.cloudinary.com/simplotel/image/upload/x_341,y_0,w_3100,h_1744,c_crop,q_80,fl_progressive/w_900,h_506,f_auto,c_fit/dragonfly-hotels-service-apartments-andheri-mumbai/Dragonfly_Facade_1_ybdwrv" width="808" height="458" alt="Lobby Image"/>

  </div>

  <div class="about-us-info">

    <h2>Our Vision</h2>

    <p>We draw inspiration from the principles of mindfulness and creativity, striving to make every
event not just a celebration but a journey of joy and connection. Our team is passionate about
creating immersive environments where you can embrace the present and celebrate life’s most
cherished moments.

</p>

    <a href="#" title="About Us Button" style={{textDecoration:"none"}}>Our Vision</a>

  </div>

</div> */}

{/* <div id="history-section">

  <div class="history-image">

    <img src="https://cf.bstatic.com/xdata/images/hotel/max1024x768/488058026.jpg?k=e72691fab991f2731e0acf817ff5f8c9a5b4f0d1b077a02b0041c7af71f46083&o=&hp=1" width="951" height="471" alt="Building Pic"/>
  </div>

  <div class="history-info">
    <h3 style={{fontSize:"25px", textTransform:"uppercase", fontWeight:"800"}}>Why Choose Us?</h3>
    <p>Dragonfly Surprises is more than an event planner—it’s a gateway to unforgettable experiences.
Our boutique hotel, nestled in Andheri East, showcases modern design infused with the delicate
beauty of the dragonfly. Each event is crafted to immerse you in luxury, art, and impeccable
hospitality, all under one roof.
Join us in crafting memories that flutter in your heart, just like the dragonfly—delicate, beautiful,
and enduring.
Experience the art of celebration with Dragonfly Surprises!
.</p>
  </div>

</div> */}

</div>
<div class="we-are-block">

<div id="about-us-section">

  <div class="about-us-image">

    <img src="https://res.cloudinary.com/simplotel/image/upload/x_341,y_0,w_3100,h_1744,c_crop,q_80,fl_progressive/w_900,h_506,f_auto,c_fit/dragonfly-hotels-service-apartments-andheri-mumbai/Dragonfly_Facade_1_ybdwrv" width="808" height="458" alt="Lobby Image"/>

  </div>

  <div class="about-us-info">

    <h2>Our Vision</h2>

    <p>We draw inspiration from the principles of mindfulness and creativity, striving to make every
event not just a celebration but a journey of joy and connection. Our team is passionate about
creating immersive environments where you can embrace the present and celebrate life’s most
cherished moments.
{/* Why Choose Us? */}

</p>

    {/* <a href="#" title="About Us Button"style={{textDecoration:"none"}}>Our Vision</a> */}

  </div>

</div>

<div id="history-section">

  <div class="history-image">

    <img src="https://cf.bstatic.com/xdata/images/hotel/max1024x768/265851149.jpg?k=a553ee85925cecf8b0367b3de72687336270b70187d94c4da9009f44e4022efe&o=&hp=1" width="951" height="471" alt="Building Pic"/>

  </div>

  <div class="history-info">
    <p>Dragonfly Surprises is more than an event planner—it’s a gateway to unforgettable experiences.
Our boutique hotel, nestled in Andheri East, showcases modern design infused with the delicate
beauty of the dragonfly. Each event is crafted to immerse you in luxury, art, and impeccable
hospitality, all under one roof.
Join us in crafting memories that flutter in your heart, just like the dragonfly—delicate, beautiful,
and enduring.
Experience the art of celebration with Dragonfly Surprises!</p>
  </div>

</div>


</div>

</>
  );
};

export default AboutUs;
