import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { fireDB } from '../firebase';
import './Bookingpage.css';
import { FiSearch, FiX, FiCalendar, FiUser, FiPhone, FiDollarSign, FiCheckCircle, FiClock, FiMapPin, FiEdit2 } from 'react-icons/fi';

const Bookingpage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refundStatus, setRefundStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'checkInDate', direction: 'asc' });

  useEffect(() => {
    const fetchOrders = async () => {
      const querySnapshot = await getDocs(collection(fireDB, 'orders'));
      const ordersData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(sortOrders(ordersData, sortConfig)); // Corrected function name
    };
    fetchOrders();
  }, [sortConfig]);
  

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setRefundStatus(order.refundStatus || '');
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  const handleRefundChange = (e) => {
    setRefundStatus(e.target.value);
  };

  const updateRefundStatus = async () => {
    if (selectedOrder) {
      try {
        const orderRef = doc(fireDB, 'orders', selectedOrder.id);
        await updateDoc(orderRef, {
          refundStatus: refundStatus,
        });
        alert('Refund status updated!');
        closeModal();
      } catch (error) {
        console.error('Error updating refund status: ', error);
        alert('Failed to update refund status.');
      }
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortOrders = (orders, { key, direction }) => {
    return [...orders].sort((a, b) => {
      // Handle nested properties
      const aValue = key.includes('.') ? 
        key.split('.').reduce((o, i) => o[i], a) : 
        a[key] || a.productDetails?.[key];
      const bValue = key.includes('.') ? 
        key.split('.').reduce((o, i) => o[i], b) : 
        b[key] || b.productDetails?.[key];

      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const filteredOrders = sortOrders(orders.filter((order) => {
    const orderId = order.productDetails?.orderId?.toLowerCase() || '';
    const packageName = order.productDetails?.packageName?.toLowerCase() || '';
    const checkInDate = order.productDetails?.checkInDate?.toLowerCase() || '';
    const customerName = order.name?.toLowerCase() || '';
    const mobileNumber = order.mobileNumber?.toLowerCase() || '';

    return (
      orderId.includes(searchTerm.toLowerCase()) ||
      packageName.includes(searchTerm.toLowerCase()) ||
      checkInDate.includes(searchTerm.toLowerCase()) ||
      customerName.includes(searchTerm.toLowerCase()) ||
      mobileNumber.includes(searchTerm.toLowerCase())
    );
  }), sortConfig);

  const SortIndicator = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="bliss-booking-container">
      <div className="bliss-booking-header">
        <h1 className="bliss-booking-title">Booking Management</h1>
        <div className="bliss-booking-search">
          <FiSearch className="bliss-search-icon" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bliss-search-input"
          />
        </div>
      </div>

      <div className="bliss-booking-table-container">
        <table className="bliss-booking-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('productDetails.orderId')}>
                Order ID <SortIndicator columnKey="productDetails.orderId" />
              </th>
              <th onClick={() => handleSort('name')}>
                Customer <SortIndicator columnKey="name" />
              </th>
              <th onClick={() => handleSort('mobileNumber')}>
                Mobile <SortIndicator columnKey="mobileNumber" />
              </th>
              <th onClick={() => handleSort('productDetails.packageName')}>
                Package <SortIndicator columnKey="productDetails.packageName" />
              </th>
              <th onClick={() => handleSort('productDetails.totalPrice')}>
                Amount <SortIndicator columnKey="productDetails.totalPrice" />
              </th>
              <th>
                Payment 
              </th>
              <th onClick={() => handleSort('productDetails.checkInDate')}>
                Date <SortIndicator columnKey="productDetails.checkInDate" />
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="bliss-booking-row">
                  <td className="bliss-order-id">{order.productDetails?.orderId}</td>
                  <td className="bliss-customer-name">{order.name}</td>
                  <td className="bliss-mobile-number">{order.mobileNumber}</td>
                  <td className="bliss-package-name">{order.productDetails?.packageName}</td>
                  <td className="bliss-amount">₹{order.productDetails?.totalPrice}</td>
                  <td className={`bliss-payment-status ${order.paymentDetails?.code === 'PAYMENT_SUCCESS' ? 'bliss-paid' : 'bliss-pending'}`}>
                    {order.paymentDetails?.code === 'PAYMENT_SUCCESS' ? 'Paid' : 'Pending'}
                  </td>
                  <td className="bliss-checkin-date">{order.productDetails?.checkInDate}</td>
                  <td className="bliss-actions">
                    <button 
                      className="bliss-view-btn" 
                      onClick={() => handleViewDetails(order)}
                    >
                      <FiEdit2 size={14} /> Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="bliss-no-results">
                <td colSpan="8">No bookings found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="bliss-modal-overlay">
          <div className="bliss-modal">
            <button className="bliss-modal-close" onClick={closeModal}>
              <FiX size={24} />
            </button>
            
            <div className="bliss-modal-header">
              <h2 className="bliss-modal-title">Booking Details</h2>
              <div className="bliss-order-id-label">Order #{selectedOrder.productDetails?.orderId}</div>
            </div>

            <div className="bliss-modal-grid">
              <div className="bliss-modal-section">
                <h3 className="bliss-section-title">
                  <FiUser className="bliss-section-icon" /> Customer Information
                </h3>
                <div className="bliss-info-row">
                  <span className="bliss-info-label">Name:</span>
                  <span className="bliss-info-value">{selectedOrder.name}</span>
                </div>
                <div className="bliss-info-row">
                  <span className="bliss-info-label">Mobile:</span>
                  <span className="bliss-info-value">{selectedOrder.mobileNumber}</span>
                </div>
              </div>

              <div className="bliss-modal-section">
                <h3 className="bliss-section-title">
                  <FiDollarSign className="bliss-section-icon" /> Payment Details
                </h3>
                <div className="bliss-info-row">
                  <span className="bliss-info-label">Amount:</span>
                  <span className="bliss-info-value">₹{selectedOrder.productDetails?.totalPrice}</span>
                </div>
                <div className="bliss-info-row">
                  <span className="bliss-info-label">Status:</span>
                  <span className={`bliss-info-value ${selectedOrder.paymentDetails?.code === 'PAYMENT_SUCCESS' ? 'bliss-paid' : 'bliss-pending'}`}>
                    {selectedOrder.paymentDetails?.code === 'PAYMENT_SUCCESS' ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="bliss-modal-section">
                <h3 className="bliss-section-title">
                  <FiCalendar className="bliss-section-icon" /> Booking Details
                </h3>
                <div className="bliss-info-row">
                  <span className="bliss-info-label">Package:</span>
                  <span className="bliss-info-value">{selectedOrder.productDetails?.packageName}</span>
                </div>
                <div className="bliss-info-row">
                  <span className="bliss-info-label">Date:</span>
                  <span className="bliss-info-value">{selectedOrder.productDetails?.checkInDate}</span>
                </div>
                <div className="bliss-info-row">
                  <span className="bliss-info-label">
                    <FiClock className="bliss-inline-icon" /> Time:
                  </span>
                  <span className="bliss-info-value">{selectedOrder.productDetails?.timeSlot}</span>
                </div>
                <div className="bliss-info-row">
                  <span className="bliss-info-label">
                    <FiMapPin className="bliss-inline-icon" /> Venue:
                  </span>
                  <span className="bliss-info-value">{selectedOrder.productDetails?.venue}</span>
                </div>
              </div>

              {selectedOrder.productDetails?.guestDetails && (
                <div className="bliss-modal-section">
                  <h3 className="bliss-section-title">Guest Information</h3>
                  <div className="bliss-guest-list">
                    {selectedOrder.productDetails.guestDetails.map((guest, index) => (
                      <div key={index} className="bliss-guest-item">
                        <span className="bliss-guest-name">{guest.name}</span>
                        <span className="bliss-guest-age">Age: {guest.age}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedOrder.productDetails?.specialRequest && (
                <div className="bliss-modal-section">
                  <h3 className="bliss-section-title">Special Requests</h3>
                  <p className="bliss-special-request">{selectedOrder.productDetails.specialRequest}</p>
                </div>
              )}

              <div className="bliss-modal-section bliss-refund-section">
                <h3 className="bliss-section-title">Refund Status</h3>
                <div className="bliss-refund-controls">
                  <input
                    type="text"
                    value={refundStatus}
                    onChange={handleRefundChange}
                    className="bliss-refund-input"
                    placeholder="Enter refund status"
                  />
                  <button 
                    onClick={updateRefundStatus} 
                    className="bliss-update-btn"
                    disabled={!refundStatus.trim()}
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookingpage;