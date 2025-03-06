// AdminCouponsManager.js
import React, { useState, useEffect } from 'react';
import { fireDB } from '../firebase'; // Adjust this path to your firebase config
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import "./UpdateCoupon.css"
const UpdateCoupon = () => {
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({ discount: '', code: '' });

  useEffect(() => {
    const fetchCoupons = async () => {
      const couponsCollection = collection(fireDB, 'coupons');
      const couponsSnapshot = await getDocs(couponsCollection);
      const couponsList = couponsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCoupons(couponsList);
    };

    fetchCoupons();
  }, []);

  const handleAddCoupon = async () => {
    const docRef = await addDoc(collection(fireDB, 'coupons'), newCoupon);
    setCoupons([...coupons, { id: docRef.id, ...newCoupon }]);
    setNewCoupon({ discount: '', code: '' });
  };

  const handleDeleteCoupon = async (id) => {
    await deleteDoc(doc(fireDB, 'coupons', id));
    setCoupons(coupons.filter(coupon => coupon.id !== id));
  };

  return (
    <div className='admin-coupons-manager'>
      <h2>Manage Coupons</h2>
      <div className='coupon-form '>
        <input
          type="text"
          placeholder="Discount"
          value={newCoupon.discount}
          onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
        />
        <input
          type="text"
          placeholder="Gift Code"
          value={newCoupon.code}
          onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
        />
        <button onClick={handleAddCoupon}>Add Coupon</button>
      </div>

      <ul>
        {coupons.map((coupon) => (
          <li key={coupon.id}>
            {coupon.discount} ₹ OFF - {coupon.code}
            <button onClick={() => handleDeleteCoupon(coupon.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UpdateCoupon;
