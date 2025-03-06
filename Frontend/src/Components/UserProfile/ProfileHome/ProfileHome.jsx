import React, { useState, useEffect } from 'react';
import './ProfileHome.css';
import { auth, fireDB } from '../../Login/firebase'; 
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import profildummy from "../../../assets/profie_dumy.png"

const ProfileHome = ({ onEditProfileClick, onGoToCoupons, onCreateReminder }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remindersCount, setRemindersCount] = useState(0);
  const [couponsCount, setCouponsCount] = useState(0);
  const [coupons, setCoupons] = useState([]);

  const navigate = useNavigate();
  const fetchCoupons = async () => {
    try {
      const couponsCollection = collection(fireDB, 'coupons');
      const querySnapshot = await getDocs(couponsCollection);
      const allCoupons = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCoupons(allCoupons);
      setCouponsCount(allCoupons.length); // Set the count of coupons
    } catch (error) {
      toast.error('Error fetching coupons');
    }
  };
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
      fetchRemindersCount(currentUser.uid); // Fetch reminders count
      fetchCoupons(); // Fetch all coupons
    } else {
      navigate('/login');
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }


  return (
    <div className="profile-home-container">
      <div className="profile-Section">
        <div className="profile-header">
          <img 
            src={userData?.profilePic || profildummy }
            alt="Profile" 
            className="profile-img"
          />
          <div className="profile-info">
            <h2>{userData?.f_name}</h2>
            <a href="#" onClick={onEditProfileClick}>Edit My profile</a>
          </div>
        </div>
        <div className="profile-stats">
          <div className="stat-item">
            <span>{remindersCount}</span>
            <p>Reminders</p>
          </div>
          {/* <div className="stat-item">
            <span>{userData?.favorites?.length || 0}</span>
            <p>Favorites</p>
          </div> */}
          <div className="stat-item">
            <span>{couponsCount}</span>
            <p>My Coupons</p>
          </div>
        </div>
      </div>

      <div className="main-section">
        <div className="card">
          <h3>Go to Coupons <span className="badge">Offers</span></h3>
          <p>Unlock your moments by saving big with our exclusive coupons!</p>
          <button className="btn" onClick={onGoToCoupons}>Explore Coupons</button>
        </div>
        <div className="card">
          <h3>Set Your Reminder <span className="badge">Reminder</span></h3>
          <p>Stay organized and never miss an important moment. Set reminders now!</p>
          <button className="btn" onClick={onCreateReminder}>Create Reminder</button>
        </div>
      </div>


      <div className="orders-section">
  <h3>HELP/FAQs</h3>
  <div className="faq-section">
    <div className="Faq-category">
      <h4>General Questions</h4>
      <ul>
        <li>
          <strong>What types of accommodations do you offer?</strong>
          <p>We offer a variety of accommodations, including standard rooms, suites, and luxury options.</p>
        </li>
        <li>
          <strong>What amenities are included in my stay?</strong>
          <p>Amenities vary by room type but may include free Wi-Fi, breakfast, access to the pool and gym, and more.</p>
        </li>
      </ul>
    </div>

    <div className="Faq-category">
      <h4>Payments and Fees</h4>
      <ul>
        <li>
          <strong>What payment methods do you accept?</strong>
          <p>We accept major credit cards, UPI, and bank transfers.
          </p>
        </li>
            <br />

        <li>
          <strong>Are there any additional fees?</strong>
          <p>Additional fees may apply, such as resort fees, taxes, and fees for extra services.</p>
        </li>
      </ul>
    </div>
  </div>
</div>

    </div>
  );
};

export default ProfileHome;
