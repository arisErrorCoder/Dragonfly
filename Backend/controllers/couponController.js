const { db } = require('../config/firebase');

// Get all coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const snapshot = await db.collection('coupons').get();
    const coupons = [];
    snapshot.forEach((doc) => {
      coupons.push({ id: doc.id, ...doc.data() });
    });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
};

// Create a new coupon
exports.createCoupon = async (req, res) => {
  try {
    const newCoupon = req.body;
    const couponRef = await db.collection('coupons').add(newCoupon);
    res.json({ id: couponRef.id, ...newCoupon });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create coupon' });
  }
};

// Get a coupon by ID
exports.getCouponById = async (req, res) => {
  try {
    const couponId = req.params.id;
    const couponRef = db.collection('coupons').doc(couponId);
    const doc = await couponRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch coupon' });
  }
};

// Update a coupon by ID
exports.updateCouponById = async (req, res) => {
  try {
    const couponId = req.params.id;
    const updateData = req.body;
    const couponRef = db.collection('coupons').doc(couponId);
    await couponRef.update(updateData);
    res.json({ id: couponId, ...updateData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update coupon' });
  }
};

// Delete a coupon by ID
exports.deleteCouponById = async (req, res) => {
  try {
    const couponId = req.params.id;
    const couponRef = db.collection('coupons').doc(couponId);
    await couponRef.delete();
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
};
