import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { fireDB } from '../firebase';
import './Bookingpage.css';
import Calendar from '../Calendar/Calendar';

const Bookingpage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refundStatus, setRefundStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      const querySnapshot = await getDocs(collection(fireDB, 'orders'));
      const ordersData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
    };
    fetchOrders();
  }, []);

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

  const filteredOrders = orders.filter((order) => {
    const orderId = order.productDetails?.orderId?.toLowerCase() || '';
    const packageName = order.productDetails?.packageName?.toLowerCase() || '';
    const checkInDate = order.productDetails?.checkInDate?.toLowerCase() || '';

    return (
      orderId.includes(searchTerm.toLowerCase()) ||
      packageName.includes(searchTerm.toLowerCase()) ||
      checkInDate.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="booking-page-container">
      <h1 className="booking-page-title">Order Details</h1>

      <div className="booking-page-search">
        <input
          type="text"
          placeholder="Search by Order ID, Package Name, or Check-In Date"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="booking-page-search-input"
        />
      </div>

      <table className="booking-page-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer Name</th>
            <th>Mobile Number</th>
            <th>Package Name</th>
            <th>Total Amount</th>
            <th>Payment Status</th>
            <th>Check In Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.id}>
              <td>{order.productDetails?.orderId}</td>
              <td>{order.name}</td>
              <td>{order.mobileNumber}</td>
              <td>{order.productDetails?.packageName}</td>
              <td>₹{order.productDetails?.totalPrice}</td>
              <td>{order.paymentDetails?.code === 'PAYMENT_SUCCESS' ? 'Paid' : 'Pending'}</td>
              <td>{order.productDetails?.checkInDate}</td>
              <td>
                <button className="booking-page-view-btn" onClick={() => handleViewDetails(order)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedOrder && (
        <div className="booking-page-modal-overlay">
          <div className="booking-page-modal">
            <button className="booking-page-close-btn" onClick={closeModal}>
              &times;
            </button>
            <h2 className="booking-page-modal-title">Order Details</h2>
            <p><strong>Order ID:</strong> {selectedOrder.productDetails?.orderId}</p>
            <p><strong>Customer Name:</strong> {selectedOrder.name}</p>
            <p><strong>Mobile Number:</strong> {selectedOrder.mobileNumber}</p>
            <p><strong>Package Name:</strong> {selectedOrder.productDetails?.packageName}</p>
            <p><strong>Total Amount:</strong> ₹{selectedOrder.productDetails?.totalPrice}</p>
            <p><strong>Payment Status:</strong> {selectedOrder.paymentDetails?.code === 'PAYMENT_SUCCESS' ? 'Paid' : 'Pending'}</p>
            <p><strong>Check In Date:</strong> {selectedOrder.productDetails?.checkInDate}</p>
            <p><strong>Time Slot:</strong> {selectedOrder.productDetails?.timeSlot}</p>
            <p><strong>Venue:</strong> {selectedOrder.productDetails?.venue}</p>
            <p><strong>Status:</strong> {selectedOrder.productDetails?.venue}</p>

            <h3 className="booking-page-guest-details-title">Guest Details</h3>
            {selectedOrder.productDetails?.guestDetails &&
              selectedOrder.productDetails?.guestDetails.map((guest) => (
                <p key={guest.id} className="booking-page-guest-info">
                  {guest.name} (Age: {guest.age})
                </p>
              ))}
            <h3 className="booking-page-special-request-title">Special Request</h3>
            <p>{selectedOrder.productDetails?.specialRequest}</p>
            <p><strong>Refund Status:</strong></p>
            <input
              type="text"
              value={refundStatus}
              onChange={handleRefundChange}
              className="booking-page-refund-input"
            />
            <button onClick={updateRefundStatus} className="booking-page-update-btn">
              Update Refund Status
            </button>
          </div>
          
        </div>
      )}
{/* <div class="checkout-box yellow">
  <p class="text"> Date Booked </p>
</div> */}
      {/* <Calendar bookedOrders={filteredOrders} /> */}
    </div>
  );
};

export default Bookingpage;
