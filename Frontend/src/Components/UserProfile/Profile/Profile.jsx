import React, { useEffect, useState } from 'react';
import './Profile.css';

import profileImageDefault from '../../../assets/profile.png';
import businessProfileLine from '../../../assets/vectors/vector_15_x2.svg';
import notificationLine1 from '../../../assets/vectors/vector_17_x2.svg';
import editorTranslateLine from '../../../assets/vectors/vector_33_x2.svg';
import projectorLine from '../../../assets/vectors/vector_1_x2.svg';
import mentalHealthLine from '../../../assets/vectors/vector_5_x2.svg';
import contactsLine from '../../../assets/vectors/vector_11_x2.svg';
import chatQuoteLine from '../../../assets/vectors/vector_2_x2.svg';
import lockLine from '../../../assets/vectors/vector_34_x2.svg';

import Profile2 from '../Profile2/Profile2'; 
import CalendarPageMobile from '../Remainder-Mobile/Remainder-Mobile';
import NotificationsPageMobile from '../Notification-Mobile/Notification-Mobile';
import { auth, fireDB } from '../../Firebase/Firebase'; // Firebase config
import { collection, query, where, getDocs } from 'firebase/firestore'; // Firestore functions
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Ensure you have toast imported

const Profile = () => {
    const [profileImage, setProfileImage] = useState(profileImageDefault);
    const [notificationStatus, setNotificationStatus] = useState('ON');
    const [languageStatus, setLanguageStatus] = useState('English');
    const [themeStatus, setThemeStatus] = useState('Light mode');
    const [showProfile2, setShowProfile2] = useState(false);
    const [currentPage, setCurrentPage] = useState('profile'); 

    const [userData, setUserData] = useState(null); // State to store user data
    const [loading, setLoading] = useState(true); // Loading state
    const navigate = useNavigate(); // Navigation function 

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleNotificationStatus = () => {
        setNotificationStatus((prevStatus) => (prevStatus === 'ON' ? 'OFF' : 'ON'));
    };

    const toggleLanguageStatus = () => {
        setLanguageStatus((prevStatus) => (prevStatus === 'English' ? 'Hindi' : 'English'));
    };

    const toggleThemeStatus = () => {
        setThemeStatus((prevStatus) => (prevStatus === 'Light mode' ? 'Dark mode' : 'Light mode'));
        document.body.classList.toggle('dark-mode', themeStatus === 'Light mode');
    };

    const handleEditProfileClick = () => {
        setShowProfile2(true); 
    };

    const fetchUserData = async (email) => {
        try {
            const usersCollection = collection(fireDB, 'users'); // Reference to the 'users' collection
            const q = query(usersCollection, where('email', '==', email)); // Query for matching email
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0]; // Get the first document (assuming email is unique)
                setUserData(userDoc.data()); // Set user data in state
            } else {
                toast.error('No user data found');
            }
        } catch (error) {
            toast.error('Error fetching user data');
        } finally {
            setLoading(false); // Stop loading once done
        }
    };

    // Fetch current user info from Firebase Auth and then fetch their Firestore data
    useEffect(() => {
        const currentUser = auth.currentUser; // Get the currently logged-in user from Firebase Auth
        if (currentUser) {
            fetchUserData(currentUser.email); // Fetch data based on user email
        } else {
            navigate('/login'); // If no user is logged in, redirect to login page
        }
    }, [navigate]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    // Conditional rendering based on showProfile2 state
    if (showProfile2) {
        return <Profile2 />;
    }

    return (
        <div className="profile-0">
            <div className="container">
                <div className="profile-info">
                    <div className="avatar">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                            id="fileInput"
                        />
                        <label htmlFor="fileInput" className="avatar-label">
                            <div
                                className="profile-image"
                                style={{ backgroundImage: `url(${userData.profilePic || profileImage})` }}
                            >
                                <span className="edit-icon">✏️</span>
                            </div>
                        </label>
                    </div>
                    <div className="user-info">
                        <div className="user-name">{userData.f_name}</div>
                        <div className="user-email-phone">{userData.email} | {userData.phone}</div>
                    </div>
                </div>
                <div className="settings">
                    {/* Group 1: Edit Profile Information, Notifications, Language */}
                    <div className="setting-group">
                        <div className="setting-group1">
                            <div className="setting-item" onClick={handleEditProfileClick}>
                                <div className="icons-container">
                                    <img className="icons" src={businessProfileLine} alt="Business Profile Line" />
                                </div>
                                <div className="setting-text">Edit profile information</div>
                            </div>
                            <div className="setting-item" onClick={toggleNotificationStatus}>
                                <div className="icons-container">
                                    <img className="icons" src={notificationLine1} alt="Notification Line" />
                                </div>
                                <div className="setting-text">Notifications</div>
                                <div className="setting-status">{notificationStatus}</div>
                            </div>
                            <div className="setting-item" onClick={toggleLanguageStatus}>
                                <div className="icons-container">
                                    <img className="icons" src={editorTranslateLine} alt="Editor Translate Line" />
                                </div>
                                <div className="setting-text">Language</div>
                                <div className="setting-status">{languageStatus}</div>
                            </div>
                        </div>
                    </div>

                    {/* Group 2: Security, Theme */}
                    <div className="setting-group">
                        <div className="setting-group2">
                            <div className="setting-item">
                                <div className="icons-container">
                                    <img className="icons" src={projectorLine} alt="Business Projector Line" />
                                </div>
                                <div className="setting-text">Security</div>
                            </div>
                            <div className="setting-item" onClick={toggleThemeStatus}>
                                <div className="icons-container">
                                    <img className="icons" src={mentalHealthLine} alt="Mental Health Line" />
                                </div>
                                <div className="setting-text">Theme</div>
                                <div className="setting-status">{themeStatus}</div>
                            </div>
                        </div>
                    </div>

                    {/* Group 3: Help & Support, Contact us, Privacy policy */}
                    <div className="setting-group">
                        <div className="setting-group3">
                            <div className="setting-item">
                                <div className="icons-container">
                                    <img className="icons" src={contactsLine} alt="Contacts Line" />
                                </div>
                                <div className="setting-text">Help & Support</div>
                            </div>
                            <div className="setting-item">
                                <div className="icons-container">
                                    <img className="icons" src={chatQuoteLine} alt="Chat Quote Line" />
                                </div>
                                <div className="setting-text">Contact us</div>
                            </div>
                            <div className="setting-item">
                                <div className="icons-container">
                                    <img className="icons" src={lockLine} alt="Lock Line" />
                                </div>
                                <div className="setting-text">Privacy policy</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
