import React, { useState, useEffect, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useNavigate } from 'react-router-dom';  
import './Notification.css'; 
import { fireDB } from '../../Login/firebase'; // Firebase import
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // For getting current logged-in user

const NotificationItem = ({ notification, onDelete }) => {
  const handlers = useSwipeable({
    onSwipedLeft: () => onDelete(notification.id),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  return (
    <li className="notification-item" {...handlers}>
      {notification.message}
    </li>
  );
};

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate(); 
  const auth = getAuth();
  const user = auth.currentUser; // Get currently logged-in user

  useEffect(() => {
    if (!user) {
      // Redirect to login if no user is found
      navigate('/login');
      return;
    }

    // Fetch notifications for the current logged-in user using uid
    const fetchNotifications = async () => {
      const notificationsRef = collection(fireDB, 'notifications');
      const q = query(notificationsRef, where('uid', '==', user.uid)); // Use 'uid' instead of 'userId'
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notificationsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(notificationsList); // Set notifications in state
      });

      // Cleanup listener on unmount
      return () => unsubscribe();
    };

    fetchNotifications();
  }, [user, navigate]);

  const handleClearAll = useCallback(async () => {
    if (notifications.length > 0) {
      await Promise.all(notifications.map(async (notification) => {
        const notificationRef = doc(fireDB, 'notifications', notification.id); // Get reference to the notification
        await deleteDoc(notificationRef); // Delete the notification from Firestore
      }));
      setNotifications([]); // Clear local state after deletion
    }
  }, [notifications]);

  const handleDeleteNotification = useCallback(async (id) => {
    const notificationRef = doc(fireDB, 'notifications', id); // Get reference to the specific notification
    await deleteDoc(notificationRef); // Delete the notification from Firestore
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  }, []);

  return (
    <div className="notification-container">
      <h2 className="notification-title">Notifications</h2>
      {notifications.length === 0 ? (
        <p className="no-notifications">No notifications</p>
      ) : (
        <ul className="notification-list">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onDelete={handleDeleteNotification}
            />
          ))}
        </ul>
      )}
      {notifications.length > 0 && (
        <button className="clear-button" onClick={handleClearAll}>
          Clear All
        </button>
      )}
    </div>
  );
};

export default Notification;
