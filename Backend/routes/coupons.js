const express = require('express');
const router = express.Router();
const {
  getAllCoupons,
  createCoupon,
  getCouponById,
  updateCouponById,
  deleteCouponById
} = require('../controllers/couponController');

// Get all coupons
router.get('/', getAllCoupons);

// Create a new coupon
router.post('/', createCoupon);

// Get a coupon by ID
router.get('/:id', getCouponById);

// Update a coupon by ID
router.put('/:id', updateCouponById);

// Delete a coupon by ID
router.delete('/:id', deleteCouponById);

module.exports = router;
