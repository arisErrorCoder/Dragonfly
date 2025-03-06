import React, { useState, useEffect } from 'react';
import { auth, fireDB, storage } from '../../Login/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import './EditProfile.css';

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
            onChange={(e) => setEmail(e.target.value)}
            readOnly
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
