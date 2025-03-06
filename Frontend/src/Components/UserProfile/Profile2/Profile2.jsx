// import React, { useState } from 'react';
// import { FaBell } from 'react-icons/fa';
// import './EditProfile.css';
// import profileImage1 from '../../../assets/profile.png';

// const statesAndCities = {
//   "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool"],
//     "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro", "Bomdila", "Pasighat"],
//     "Assam": ["Guwahati", "Dibrugarh", "Jorhat", "Silchar", "Tezpur"],
//     "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga"],
//     "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"],
//     "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
//     "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
//     "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Yamunanagar"],
//     "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Solan", "Mandi"],
//     "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar"],
//     "Karnataka": ["Bangalore", "Mysore", "Mangalore", "Hubli", "Belgaum"],
//     "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
//     "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain"],
//     "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
//     "Manipur": ["Imphal", "Churachandpur", "Thoubal", "Kakching", "Bishnupur"],
//     "Meghalaya": ["Shillong", "Tura", "Nongstoin", "Jowai", "Baghmara"],
//     "Mizoram": ["Aizawl", "Lunglei", "Serchhip", "Champhai", "Kolasib"],
//     "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Wokha", "Zunheboto"],
//     "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Sambalpur", "Berhampur"],
//     "Punjab": ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala"],
//     "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
//     "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan", "Rangpo"],
//     "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
//     "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar"],
//     "Tripura": ["Agartala", "Udaipur", "Kailashahar", "Dharmanagar", "Belonia"],
//     "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi"],
//     "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Nainital", "Haldwani"],
//     "West Bengal": ["Kolkata", "Darjeeling", "Siliguri", "Asansol", "Durgapur"],
// };

// const EditProfile = () => {
//     const [selectedState, setSelectedState] = useState("");
//     const [cities, setCities] = useState([]);
//     const [selectedCity, setSelectedCity] = useState("");
//     const [profileImage, setProfileImage] = useState(profileImage1);

//     const handleStateChange = (e) => {
//         const state = e.target.value;
//         setSelectedState(state);
//         setCities(statesAndCities[state] || []);
//         setSelectedCity("");
//     };

//     const handleCityChange = (e) => {
//         setSelectedCity(e.target.value);
//     };

//     const handleImageChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setProfileImage(reader.result);
//             };
//             reader.readAsDataURL(file);
//         }
//     };

//     return (
//         <div className="edit-profile">
//             <div className="edit-profile-header">
//                 <h1>Edit Profile</h1>
//                 <label htmlFor="profileImageInput">
//                     <img src={profileImage} alt="Profile" className="profile-picc" />
//                 </label>
//                 <input
//                     id="profileImageInput"
//                     type="file"
//                     accept="image/*"
//                     onChange={handleImageChange}
//                     className="image-input"
//                     style={{ display: 'none' }}
//                 />
//                 <div className="notification-section">
//                     <FaBell className="bell-icon" />
//                     <img src={profileImage} alt="Profile" className="profile-pic-bell" />
//                 </div>
//             </div>
//             <form>
//                 <div className="form-row">
//                     <div className="form-group first-name">
//                         <label>First Name</label>
//                         <input type="text"/>
//                     </div>
//                     <div className="form-group last-name">
//                         <label>Last Name</label>
//                         <input type="text"/>
//                     </div>
//                 </div>
//                 <div className="form-group email">
//                     <label>Email</label>
//                     <input type="email"/>
//                 </div>
//                 <div className="form-group address">
//                     <label>Address</label>
//                     <input type="text"/>
//                 </div>
//                 <div className="form-group contact-number">
//                     <label>Contact Number</label>
//                     <input type="text"/>
//                 </div>
//                 <div className="form-row">
//                     <div className="form-group state">
//                         <label>State</label>
//                         <select onChange={handleStateChange} value={selectedState}>
//                             <option value="" disabled>Select State</option>
//                             {Object.keys(statesAndCities).map(state => (
//                                 <option key={state} value={state}>{state}</option>
//                             ))}
//                         </select>
//                     </div>
//                     <div className="form-group city">
//                         <label>City</label>
//                         <select onChange={handleCityChange} value={selectedCity} disabled={!selectedState}>
//                             <option value="" disabled>Select City</option>
//                             {cities.map(city => (
//                                 <option key={city} value={city}>{city}</option>
//                             ))}
//                         </select>
//                     </div>
//                 </div>
//                 <div className="form-group password">
//                     <label>Password</label>
//                     <input type="password"/>
//                 </div>
//                 <div className="form-buttons">
//                     <button type="button" className="cancel-btn">Cancel</button>
//                     <button type="submit" className="save-btn">Save</button>
//                 </div>
//             </form>
//         </div>
//     );
// }

// export default EditProfile;



// import React, { useState, useEffect } from 'react';
// import { FaBell } from 'react-icons/fa';
// import './EditProfile.css';
// import profileImage1 from '../../../assets/profile.png';
// import { fireDB } from '../../Login/firebase'; // Import your firebase config
// import { doc, updateDoc, getDoc } from "firebase/firestore"; // Firestore functions
// import { getAuth } from "firebase/auth"; // For authentication

// const statesAndCities = {
//     "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool"],
//       "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro", "Bomdila", "Pasighat"],
//       "Assam": ["Guwahati", "Dibrugarh", "Jorhat", "Silchar", "Tezpur"],
//       "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga"],
//       "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"],
//       "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
//       "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
//       "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Yamunanagar"],
//       "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Solan", "Mandi"],
//       "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar"],
//       "Karnataka": ["Bangalore", "Mysore", "Mangalore", "Hubli", "Belgaum"],
//       "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
//       "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain"],
//       "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
//       "Manipur": ["Imphal", "Churachandpur", "Thoubal", "Kakching", "Bishnupur"],
//       "Meghalaya": ["Shillong", "Tura", "Nongstoin", "Jowai", "Baghmara"],
//       "Mizoram": ["Aizawl", "Lunglei", "Serchhip", "Champhai", "Kolasib"],
//       "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Wokha", "Zunheboto"],
//       "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Sambalpur", "Berhampur"],
//       "Punjab": ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala"],
//       "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
//       "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan", "Rangpo"],
//       "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
//       "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar"],
//       "Tripura": ["Agartala", "Udaipur", "Kailashahar", "Dharmanagar", "Belonia"],
//       "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi"],
//       "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Nainital", "Haldwani"],
//       "West Bengal": ["Kolkata", "Darjeeling", "Siliguri", "Asansol", "Durgapur"],
//   };

// const EditProfile = () => {
//     const auth = getAuth(); // Get the authentication instance
//     const user = auth.currentUser; // Get the current user

//     const [selectedState, setSelectedState] = useState("");
//     const [cities, setCities] = useState([]);
//     const [selectedCity, setSelectedCity] = useState("");
//     const [profileImage, setProfileImage] = useState(profileImage1);
//     const [dob, setDob] = useState("");
//     const [gender, setGender] = useState("");

//     // Fetch existing user data (optional, if you want to pre-fill the form)
//     useEffect(() => {
//         const fetchUserData = async () => {
//             if (user) {
//                 const userDoc = doc(fireDB, "users", user.uid); // Use UID here
//                 const docSnapshot = await getDoc(userDoc);
//                 if (docSnapshot.exists()) {
//                     const data = docSnapshot.data();
//                     setDob(data.dateOfBirth || "");
//                     setGender(data.gender || "");
//                     setSelectedState(data.state || "");
//                     setSelectedCity(data.city || "");
//                     // If you need to load the profile image, add that logic here
//                 }
//             }
//         };

//         fetchUserData();
//     }, [user]);

//     const handleStateChange = (e) => {
//         const state = e.target.value;
//         setSelectedState(state);
//         setCities(statesAndCities[state] || []);
//         setSelectedCity("");
//     };

//     const handleCityChange = (e) => {
//         setSelectedCity(e.target.value);
//     };

//     const handleImageChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setProfileImage(reader.result);
//             };
//             reader.readAsDataURL(file);
//         }
//     };

//     const handleDobChange = (e) => {
//         setDob(e.target.value);
//     };

//     const handleGenderChange = (e) => {
//         setGender(e.target.value);
//     };

//     const handleUpdateProfile = async (e) => {
//         e.preventDefault();
//         if (user) {
//             const userDoc = doc(fireDB, "users", user.uid); // Use UID here
//             try {
//                 await updateDoc(userDoc, {
//                     dateOfBirth: dob,
//                     gender: gender,
//                     state: selectedState,
//                     city: selectedCity,
//                     profileImage: profileImage // Optionally update the profile image
//                 });
//                 alert("Profile updated successfully!");
//             } catch (error) {
//                 console.error("Error updating profile: ", error);
//                 alert("Failed to update profile. Please try again.");
//             }
//         } else {
//             alert("User not authenticated.");
//         }
//     };

//     return (
//         <div className="edit-profile">
//             <div className="edit-profile-header">
//                 <h1>Edit Profile</h1>
//                 <label htmlFor="profileImageInput">
//                     <img src={profileImage} alt="Profile" className="profile-picc" />
//                 </label>
//                 <input
//                     id="profileImageInput"
//                     type="file"
//                     accept="image/*"
//                     onChange={handleImageChange}
//                     className="image-input"
//                     style={{ display: 'none' }}
//                 />
//                 <div className="notification-section">
//                     <FaBell className="bell-icon" />
//                     <img src={profileImage} alt="Profile" className="profile-pic-bell" />
//                 </div>
//             </div>
//             <form onSubmit={handleUpdateProfile}>
//                 <div className="form-row">
//                     <div className="form-group first-name">
//                         <label>First Name</label>
//                         <input type="text"   />
//                     </div>
//                     <div className="form-group last-name">
//                         <label>Last Name</label>
//                         <input type="text"   />
//                     </div>
//                 </div>
//                 <div className="form-group email">
//                     <label>Email</label>
//                     <input type="email"   />
//                 </div>
//                 <div className="form-group address">
//                     <label>Address</label>
//                     <input type="text"   />
//                 </div>
//                 <div className="form-group contact-number">
//                     <label>Contact Number</label>
//                     <input type="text"   />
//                 </div>
//                 {/* DOB Selection */}
//                 <div className="form-group dob">
//                     <label>Date of Birth</label>
//                     <input 
//                         type="date" 
//                         value={dob} 
//                         onChange={handleDobChange} 
//                           
//                     />
//                 </div>
//                 {/* Gender Selection */}
//                 <div className="form-group gender">
//                     <label>Gender</label>
//                     <select value={gender} onChange={handleGenderChange}  >
//                         <option value="" disabled>Select Gender</option>
//                         <option value="male">Male</option>
//                         <option value="female">Female</option>
//                         <option value="other">Other</option>
//                     </select>
//                 </div>
//                 <div className="form-row">
//                     <div className="form-group state">
//                         <label>State</label>
//                         <select onChange={handleStateChange} value={selectedState}  >
//                             <option value="" disabled>Select State</option>
//                             {Object.keys(statesAndCities).map(state => (
//                                 <option key={state} value={state}>{state}</option>
//                             ))}
//                         </select>
//                     </div>
//                     <div className="form-group city">
//                         <label>City</label>
//                         <select onChange={handleCityChange} value={selectedCity} disabled={!selectedState}  >
//                             <option value="" disabled>Select City</option>
//                             {cities.map(city => (
//                                 <option key={city} value={city}>{city}</option>
//                             ))}
//                         </select>
//                     </div>
//                 </div>
//                 <div className="form-buttons">
//                     <button type="button" className="cancel-btn">Cancel</button>
//                     <button type="submit" className="save-btn">Save</button>
//                 </div>
//             </form>
//         </div>
//     );
// }

// export default EditProfile;



import React, { useState, useEffect } from 'react';
import { auth, fireDB, storage } from '../../Login/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

const EditPage = () => {
  const user = auth.currentUser;
  const [name, setName] = useState(user.displayName || '');
  const [email, setEmail] = useState(user.email || '');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState(user.photoURL || '');
  const [documentId, setDocumentId] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [profilePicError, setProfilePicError] = useState('');

  useEffect(() => {
    const fetchUserDocumentId = async () => {
      if (user) {
        try {
          const q = query(collection(fireDB, 'users'), where('uid', '==', user.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const docData = querySnapshot.docs[0];
            setDocumentId(docData.id);
            const data = docData.data();
            setName(data.f_name || '' );
            setDob(data.dob || '');
            setPhone(data.phone || '');
            setAddress(data.address || '');
            setCity(data.city || '');
            setState(data.state || '');
            setPincode(data.pincode || '');
            setGender(data.gender || '');
            setProfilePicUrl(data.profilePic || user.photoURL); // Ensure to set the initial URL
          }
        } catch (error) {
          console.error('Error fetching user document:', error);
        }
      }
    };

    fetchUserDocumentId();
  }, [user]);

  const validate = () => {
    let isValid = true;
    if (!profilePic && !profilePicUrl) {
      setProfilePicError('Please upload a profile picture');
      isValid = false;
    } else {
      setProfilePicError('');
    }
    return isValid;
  };

  const handleProfilePicUpload = () => {
    if (!profilePic) return Promise.resolve(profilePicUrl); // Return current URL if no new picture

    const storageRef = ref(storage, `profile_pictures/${user.uid}`);
    const uploadTask = uploadBytesResumable(storageRef, profilePic);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Optional: Handle progress
        },
        (error) => {
          console.error('Error uploading profile picture:', error);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setProfilePicUrl(downloadURL);
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    let downloadURL = await handleProfilePicUpload();

    try {
      await updateProfile(user, {
        displayName: name,
        photoURL: downloadURL,
      });

      if (documentId) {
        const userRef = doc(fireDB, 'users', documentId);
        await updateDoc(userRef, {
          email: email,
          dob: dob,
          f_name:name,
          phone: phone,
          address: address,
          city: city,
          state: state,
          pincode: pincode,
          gender: gender,
          profilePic: downloadURL,
        });

        setSuccessMessage('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className='edit-profile-containerr'>
      <h4>Edit Profile</h4>
      {successMessage && <p className='success-message'>{successMessage}</p>}
      <div className='form-group'>
        <label>Profile Picture</label>
        <img src={profilePicUrl} alt='Profile Pic' className='profile-image-preview' />
        <input
          type='file'
          accept='image/*'
          onChange={(e) => setProfilePic(e.target.files[0])}
        />
        {profilePicError && <small className='error-message'>{profilePicError}</small>}
      </div>
      <form className='profile-edit-form' onSubmit={handleUpdate}>
        <div className='form-group'>
          <label>Full Name</label>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className='form-group'>
          <label>Email</label>
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)} readOnly
          />
        </div>
        <div className='form-group'>
          <label>Date of Birth</label>
          <input
            type='date'
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </div>
        <div className='form-group'>
          <label>Phone Number</label>
          <input
            type='tel'
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={10}
          />
        </div>
        <div className='form-group'>
          <label>Address</label>
          <input
            type='text'
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div className='form-group'>
          <label>City</label>
          <input
            type='text'
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <div className='form-group'>
          <label>State</label>
          <input
            type='text'
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
        </div>
        <div className='form-group'>
          <label>Pincode</label>
          <input
            type='text'
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            maxLength={6}
          />
        </div>
        <div className='form-group'>
          <label>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value=''>Select Gender</option>
            <option value='Male'>Male</option>
            <option value='Female'>Female</option>
            <option value='Other'>Other</option>
          </select>
        </div>
        <div className='form-group'>
          <label>New Password (leave empty to keep current)</label>
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className='form-group'>
          <label>Confirm New Password</label>
          <input
            type='password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <button type='submit'>Update Profile</button>
      </form>
    </div>
  );
};

export default EditPage;
