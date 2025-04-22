import React, { useEffect, useState } from "react";
import "./ContactForm.css";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [formStatus, setFormStatus] = useState({
    name: "success",
    email: "",
    subject: "",
    message: "",
  });
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, required } = e.target;
    const isValid = value.trim() !== "" || !required;

    setFormData({
      ...formData,
      [name]: value,
    });

    setFormStatus({
      ...formStatus,
      [name]: isValid ? "success" : required ? "error" : "",
    });
  };

  const handleSubmit = async () => {
    // Validate all required fields
    const newFormStatus = {
      name: formData.name.trim() ? "success" : "error",
      email: formData.email.trim() && formData.email.includes('@') ? "success" : "error",
      subject: "success", // Optional field
      message: formData.message.trim() ? "success" : "error"
    };
  
    setFormStatus(newFormStatus);
  
    // Check if all required fields are valid
    if (newFormStatus.email === "error" || newFormStatus.message === "error") {
      return;
    }
  
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Reset form on success
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        alert('Thank you! Your message has been sent successfully.');
      } else {
        alert('Failed to send message. Please try again later.');
        console.error(data.errors);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="container-contactform">
      <form className="form-container-contactform">
        <div className="headline">
          <span>Contact me</span>
        </div>
        <div className={`form-line ${formStatus.name}`}>
          <input
            type="text"
            className="form-input"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
          />
          <label className={formData.name ? "top" : ""}>Name</label>
          <div className="check-label"></div>
        </div>
        <div className={`form-line ${formStatus.email}`}>
          <input
            type="text"
            className="form-input"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <label className={formData.email ? "top" : ""}>Your email *</label>
          {formStatus.email === "error" && (
            <div className="error-label">Field is required!</div>
          )}
          <div className="check-label"></div>
        </div>
        <div className={`form-line ${formStatus.subject}`}>
          <input
            type="text"
            className="form-input"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
          />
          <label className={formData.subject ? "top" : ""}>Subject</label>
          <div className="check-label"></div>
        </div>
        <div className={`form-line ${formStatus.message}`}>
          <textarea
            className="form-input"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            required
          ></textarea>
          <label className={formData.message ? "top" : ""}>Message</label>
          {formStatus.message === "error" && (
            <div className="error-label">Field is required!</div>
          )}
          <div className="check-label"></div>
        </div>
        <input
          type="button"
          className="form-button"
          value="Submit"
          onClick={handleSubmit}
        />
      </form>
    </div>
  );
};

export default ContactForm;
