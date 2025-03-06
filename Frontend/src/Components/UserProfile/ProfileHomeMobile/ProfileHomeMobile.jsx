import React, { useEffect, useState } from 'react';
import "./ProfileHomeMobile.css";
import profile from '../../../assets/profile.jpeg';
import { auth, fireDB } from '../../Firebase/Firebase'; // Firebase config
import { collection, query, where, getDocs } from 'firebase/firestore'; // Firestore functions
import MyOrders from '../OrderHistory/OrderHistory'; // Import MyOrders component
import { toast } from 'react-toastify'; // Toast notifications
import profildummy from "../../../assets/profie_dumy.png"

const ProfileHomeMobile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOrders, setShowOrders] = useState(false);
  const [remindersCount, setRemindersCount] = useState(0);

  const fetchUserData = async (email) => {
    try {
      const usersCollection = collection(fireDB, 'users');
      const q = query(usersCollection, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        setUserData(userDoc.data());
      } else {
        toast.error('No user data found');
      }
    } catch (error) {
      toast.error('Error fetching user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRemindersCount = async (uid) => {
    try {
      const remindersCollection = collection(fireDB, 'reminders');
      const q = query(remindersCollection, where('uid', '==', uid));
      const querySnapshot = await getDocs(q);

      setRemindersCount(querySnapshot.size);
    } catch (error) {
      toast.error('Error fetching reminders count');
    }
  };

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      fetchUserData(currentUser.email);
    } else {
      toast.error('User not logged in');
    }
  }, []);

  useEffect(() => {
    if (userData) {
      fetchRemindersCount(userData.uid);
    }
  }, [userData]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  const handleMyOrdersClick = () => {
    setShowOrders(true);
  };

  const handleBackClick = () => {
    setShowOrders(false);
  };

  const handleGoToCouponsClick = () => {
    handleComponentClick('transactions'); // Set the active component to 'transactions'
  };

  if (showOrders) {
    return (
      <div>
        <MyOrders />
      </div>
    );
  }

  return (
    <div className="profileHomeContainer-mobile">
      <button className="orders-button-mobile" onClick={handleMyOrdersClick}>
        My Orders
      </button>

      <div className="profile-section-mobile">
        <img
          src={userData?.profilePic || profildummy}
          alt="Profile"
          className="profile-img-mobile"
        />
        <div className="profile-info-mobile">
          <h2>{userData.f_name}</h2>
          <a href="#">My profile</a>
        </div>
        <div className="profile-stats-mobile">
          <div>{remindersCount}<br />Reminders</div>
          <div>0<br />Favorites</div>
          <div>0<br />My coupons</div>
        </div>
      </div>

      <div className="main-section-mobile">
        <div className="card-mobile">
          <h3>
            Go to Coupons <span className="badge-mobile">Offers</span>
          </h3>
          <p>Unlock your moments by saving big with our exclusive coupons!</p>
          <button className="btn-mobile" onClick={handleGoToCouponsClick}>
            Explore Coupons
          </button>
        </div>

        <div className="card-mobile">
          <h3>
            Set Your Reminder <span className="badge-mobile">Reminder</span>
          </h3>
          <p>Stay organized and never miss an important moment. Set reminders now!</p>
          <button className="btn-mobile">Create Reminder</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHomeMobile;

