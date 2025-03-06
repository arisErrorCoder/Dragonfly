import React, { useState, useEffect } from 'react';
import { fireDB, auth } from '../../Login/firebase'; // Assuming fireDB and auth are initialized in firebase.js
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import './OrderHistory.css';
import order3 from '../../../assets/order3.jpeg'; // Default image

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
    const user = auth.currentUser; // Get the logged-in user
    if (user) {
      try {
        const ordersCollection = collection(fireDB, 'orders'); // Replace 'orders' with your Firestore collection name
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
    const userConfirmed = window.confirm("Are you sure you want to cancel this order?.");
    
    if (userConfirmed) {
      try {
        const orderDocRef = doc(fireDB, 'orders', orderId); // Reference to the specific order
  
        // Update the order document in Firestore to mark cancellation and reset product details
        await updateDoc(orderDocRef, {
          status: 'cancellation_requested',  // Mark the status as cancellation requested
          'productDetails.checkInDate': null,  // Remove check-in date
          'productDetails.timeSlot': null,     // Remove time slot
          'productDetails.venue': null,        // Remove venue
          // Keep other fields as is
        });
  
        fetchOrders(); // Refresh orders after update
        alert("Cancellation request has been sent for this order.");
      } catch (error) {
        console.error("Error requesting cancellation:", error);
      }
    } else {
      console.log("Cancellation not confirmed.");
    }
  };
  

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="order-history">
      <h2 className="title">Order History</h2>
      {['successful', 'cancelled'].map((status) => (
        <div key={status} className={`order-section ${status}`}>
          <h3 className="section-title">
            {status.charAt(0).toUpperCase() + status.slice(1)} Orders
          </h3>
          <p className="click-to-view" onClick={() => openOverlay(status)}>
            Click to view details
          </p>
        </div>
      ))}
      
      {isOpen && (
        <div className="overlay">
          <div className="overlay-content">
            <h3>{selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Orders</h3>
            <button className="close-button" onClick={closeOverlay}>Close</button>
            {orders
              .filter((order) => 
                (selectedStatus === 'successful' && order.status === 'success') || 
                (selectedStatus === 'cancelled' && order.status === 'cancellation_requested'))
              .map((order) => (
                <div key={order.id} className="order-item">
                  <h6 className="package-name">Order Id: {order.productDetails?.orderId || "N/A"}</h6>
                  <h4 className="package-name">{order.productDetails?.packageName || "N/A"}</h4>
                  <img src={order.productDetails?.image || order3} alt={`Package ${order.productDetails?.packageName || "N/A"}`} className="order-image" />
                  <p className="order-price">Price: <span>₹{order.productDetails?.price || "N/A"}</span></p>
                  <p className="amount-paid">Amount Paid: <span>₹{order.productDetails?.totalPrice || "N/A"}</span></p>
                  <p className="special-request">Special Request: <span>{order.productDetails?.specialRequest || "None"}</span></p>
                  <p className="status">Status: <span>{order.status || "N/A"}</span></p>

                  {/* Add Refund Status if the order is cancelled */}
                  {selectedStatus === 'cancelled' && order.refundStatus && (
                    <p className="refund-status">
                      Refund Status: <span>{order.refundStatus || "N/A"}</span>
                    </p>
                  )}

                  <div className="guest-details">
                    <h5>Guest Details:</h5>
                    {order.productDetails?.guestDetails?.length ? (
                      order.productDetails.guestDetails.map((guest, index) => (
                        <div key={index} className="guest-item">
                          <p>Name: <span>{guest.name || "N/A"}</span></p>
                          <p>Age: <span>{guest.age || "N/A"}</span></p>
                        </div>
                      ))
                    ) : (
                      <p>No guest details available.</p>
                    )}
                  </div>
                  {/* Add "Request for Cancellation" button */}
                  {order.status === 'success' && (
                    <button 
                      className="cancel-button"
                      onClick={() => requestCancellation(order.id, order.productDetails)}
                    >
                      Request for Cancellation
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
