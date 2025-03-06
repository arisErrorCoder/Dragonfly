import React, { useState, useEffect } from 'react';
import './BookingForm.css';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';  // useNavigate for programmatic navigation

const BookingForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    mail: '',
    address: '',
    bookingDate: '',
    bookingSlot: '',
    message: '',
    price: '',
    advance: '',
    remainingAmount: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [bookingSlots, setBookingSlots] = useState(['10 to 11', '12 to 3', '4 to 6']);
  const navigate = useNavigate();  // Hook for navigation

  const handleChange = (e) => {
    const { name, value } = e.target;

    const newFormData = {
      ...formData,
      [name]: value
    };

    if (name === 'price' || name === 'advance') {
      newFormData.remainingAmount = calculateRemainingAmount(newFormData.price, newFormData.advance);
    }

    setFormData(newFormData);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!formData.mail) newErrors.mail = "Email is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.bookingDate) newErrors.bookingDate = "Booking Date is required";
    if (!formData.bookingSlot) newErrors.bookingSlot = "Booking Slot is required";
    if (!formData.message) newErrors.message = "Message is required";
    if (!formData.price || formData.price <= 0) newErrors.price = "Price must be a positive number";
    if (!formData.advance || formData.advance <= 0) newErrors.advance = "Advance must be a positive number";
    if (!formData.remainingAmount || formData.remainingAmount < 0) newErrors.remainingAmount = "Remaining Amount must be a non-negative number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateRemainingAmount = (price = 0, advance = 0) => {
    price = parseFloat(price) || 0;
    advance = parseFloat(advance) || 0;
    return price - advance;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitted(true);
      toast.success("Booking confirmed!");
      console.log(formData);

      // Redirect to payment page with formData
      navigate('/payment', { state: { formData, dummyUserId: '12345' } });

      setFormData({
        name: '',
        phone: '',
        mail: '',
        address: '',
        bookingDate: '',
        bookingSlot: '',
        message: '',
        price: '',
        advance: '',
        remainingAmount: '',
      });
      setErrors({});
      setSubmitted(false);
    }
  };

  useEffect(() => {
    const remainingAmount = calculateRemainingAmount(formData.price, formData.advance);
    setFormData(prev => ({ ...prev, remainingAmount }));
  }, [formData.price, formData.advance]);

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <h1>Booking Form</h1>
        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-row">
            <div className="form-group">
              <label>Name:</label>
              <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required />
              {errors.name && <p className="error">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label>Phone:</label>
              <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} required />
              {errors.phone && <p className="error">{errors.phone}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email:</label>
              <input type="email" name="mail" value={formData.mail || ''} onChange={handleChange} required />
              {errors.mail && <p className="error">{errors.mail}</p>}
            </div>

            <div className="form-group">
              <label>Address:</label>
              <input type="text" name="address" value={formData.address || ''} onChange={handleChange} required />
              {errors.address && <p className="error">{errors.address}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Booking Date:</label>
              <input type="date" name="bookingDate" value={formData.bookingDate || ''} onChange={handleChange} required />
              {errors.bookingDate && <p className="error">{errors.bookingDate}</p>}
            </div>

            <div className="form-group">
              <label>Booking Slot:</label>
              <select name="bookingSlot" value={formData.bookingSlot || ''} onChange={handleChange} required>
                <option value="">Select</option>
                {bookingSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
              {errors.bookingSlot && <p className="error">{errors.bookingSlot}</p>}
            </div>
          </div>

          <div className="form-group">
            <label>Message:</label>
            <textarea name="message" value={formData.message || ''} onChange={handleChange} required />
            {errors.message && <p className="error">{errors.message}</p>}
          </div>

          <div className="form-group">
            <label>Price:</label>
            <input type="number" name="price" value={formData.price || ''} onChange={handleChange} required />
            {errors.price && <p className="error">{errors.price}</p>}
          </div>

          <div className="form-group">
            <label>Advance:</label>
            <input type="number" name="advance" value={formData.advance || ''} onChange={handleChange} required />
            {errors.advance && <p className="error">{errors.advance}</p>}
          </div>

          <div className="form-group">
            <label>Remaining Amount:</label>
            <input type="number" name="remainingAmount" value={formData.remainingAmount || ''} readOnly />
            {errors.remainingAmount && <p className="error">{errors.remainingAmount}</p>}
          </div>

          <div className="button-container">
            <button type="submit">Book Now</button>
          </div>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default BookingForm;
