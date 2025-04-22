import React, { useState, useEffect } from 'react';
import { fireDB, auth } from '../../Login/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import './OrderHistory.css';
import order3 from '../../../assets/order3.jpeg';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  const openOverlay = (status) => {
    setSelectedStatus(status);
    setIsOpen(true);
  };

  const closeOverlay = () => {
    setIsOpen(false);
  };

  const fetchOrders = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const ordersCollection = collection(fireDB, 'orders');
        const q = query(ordersCollection, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        const fetchedOrders = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedOrders.push({ id: doc.id, ...data });
        });

        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    } else {
      console.log("No user logged in");
    }
  };

  const requestCancellation = async (orderId) => {
    const userConfirmed = window.confirm("Are you sure you want to cancel this order?");
    
    if (userConfirmed) {
      try {
        const orderDocRef = doc(fireDB, 'orders', orderId);
        await updateDoc(orderDocRef, {
          status: 'cancellation_requested',
          'productDetails.checkInDate': null,
          'productDetails.timeSlot': null,
          'productDetails.venue': null,
        });
  
        fetchOrders();
        alert("Cancellation request has been sent for this order.");
      } catch (error) {
        console.error("Error requesting cancellation:", error);
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="oh-container">
      <h2 className="oh-main-title">Your Order Journey</h2>
      
      <div className="oh-status-cards">
        {['successful', 'cancelled'].map((status) => (
          <div 
            key={status} 
            className={`oh-status-card oh-${status}-card`}
            onClick={() => openOverlay(status)}
          >
            <h3 className="oh-status-title">
              {status.charAt(0).toUpperCase() + status.slice(1)} Orders
            </h3>
            <p className="oh-view-link">View details →</p>
          </div>
        ))}
      </div>
      
      {isOpen && (
        <div className="oh-overlay">
          <div className="oh-overlay-container">
            <div className="oh-overlay-header">
              <h3>{selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Orders</h3>
              <button className="oh-close-btn" onClick={closeOverlay}>
                &times;
              </button>
            </div>
            
            <div className="oh-orders-grid">
              {orders
                .filter((order) => 
                  (selectedStatus === 'successful' && order.status === 'success') || 
                  (selectedStatus === 'cancelled' && order.status === 'cancellation_requested'))
                .map((order) => (
                  <div key={order.id} className="oh-order-card">
                    <div className="oh-order-header">
                      <span className="oh-order-id">Order #: {order.productDetails?.orderId || "N/A"}</span>
                      <span className={`oh-order-status oh-status-${order.status}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="oh-order-image-container">
                      <img 
                        src={order.productDetails?.image || order3} 
                        alt={order.productDetails?.packageName || "Package"} 
                        className="oh-order-image" 
                      />
                    </div>
                    
                    <div className="oh-order-details">
                      <h4 className="oh-package-name">{order.productDetails?.packageName || "N/A"}</h4>
                      
                      <div className="oh-price-row">
                        <div>
                          <span className="oh-price-label">Price:</span>
                          <span className="oh-price-value">₹{order.productDetails?.price || "N/A"}</span>
                        </div>
                        <div>
                          <span className="oh-price-label">Paid:</span>
                          <span className="oh-price-value">₹{order.productDetails?.totalPrice || "N/A"}</span>
                        </div>
                      </div>
                      
                      {order.productDetails?.specialRequest && (
                        <div className="oh-special-request">
                          <span className="oh-request-label">Special Request:</span>
                          <p className="oh-request-text">{order.productDetails.specialRequest}</p>
                        </div>
                      )}
                      
                      {selectedStatus === 'cancelled' && order.refundStatus && (
                        <div className="oh-refund-status">
                          <span className="oh-refund-label">Refund:</span>
                          <span className={`oh-refund-value oh-refund-${order.refundStatus.toLowerCase()}`}>
                            {order.refundStatus}
                          </span>
                        </div>
                      )}
                      
                      {order.productDetails?.guestDetails?.length > 0 && (
                        <div className="oh-guests-section">
                          <h5 className="oh-guests-title">Guest Details</h5>
                          <div className="oh-guests-grid">
                            {order.productDetails.guestDetails.map((guest, index) => (
                              <div key={index} className="oh-guest-item">
                                <span className="oh-guest-name">{guest.name || "N/A"}</span>
                                <span className="oh-guest-age">Age: {guest.age || "N/A"}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {order.status === 'success' && (
                      <button 
                        className="oh-cancel-btn"
                        onClick={() => requestCancellation(order.id)}
                      >
                        Request Cancellation
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;