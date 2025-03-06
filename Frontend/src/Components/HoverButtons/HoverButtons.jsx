import React from "react";
import "./HoverButtons.css";

const HoverButtons = () => {
  return (
    <div className="Hover-buttons">
      <a
        href="https://wa.me/9833001623"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-button"
      >
        <i class="fa-brands fa-whatsapp"></i> WhatsApp
      </a>
      <a href="tel:9833001623" className="Call-button">
        <i className="fa fa-phone"></i> Call
      </a>
    </div>
  );
};

export default HoverButtons;
