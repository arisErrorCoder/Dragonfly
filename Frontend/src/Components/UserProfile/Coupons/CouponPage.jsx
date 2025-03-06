import React, { useState, useEffect } from 'react';
import logooImage from '../../../assets/Header/logo.png';
import { fireDB } from '../../Login/firebase'; // Adjust this path to your firebase config
import { collection, getDocs } from 'firebase/firestore';
import './CouponPage.css';

const CouponsPage = () => {
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    const fetchCoupons = async () => {
      const couponsCollection = collection(fireDB, 'coupons');
      const couponsSnapshot = await getDocs(couponsCollection);
      const couponsList = couponsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCoupons(couponsList);
    };

    fetchCoupons();
  }, []);

  return (
    <div className="coupons-page">
      <h2>Exclusive Coupons</h2>
      <div className="coupons-grid">
        {coupons.map((coupon, index) => (
          <div key={coupon.id} className={`coupon-card ${getGradientClass(index)}`}>
            <div className="coupon-left">
              <div className="coupon-icon">🎁</div>
              <div className="coupon-discount">
                <span className="discount-percentage">{coupon.discount}</span>₹ OFF
              </div>
            </div>
            <div className="coupon-right">
              <div className="gift-code">{coupon.code}</div>
              <img className="qr-code" src={logooImage} alt={`QR Code ${index + 1}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const getGradientClass = (index) => {
  const gradients = [
    'blue-gradient', 'green-gradient', 'red-gradient',
    'yellow-gradient', 'purple-gradient', 'pink-gradient',
    'orange-gradient', 'sky-blue-gradient', 'golden-gradient'
  ];
  return gradients[index % gradients.length];
};

export default CouponsPage;
