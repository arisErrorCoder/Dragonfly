const express = require('express');
const router = express.Router();
const {
  getAllGuests,
  createGuest,
  getGuestById,
  updateGuestById,
  deleteGuestById
} = require('../controllers/guestController');

// Get all guests
router.get('/', getAllGuests);

// Create a new guest
router.post('/', createGuest);

// Get a guest by ID
router.get('/:id', getGuestById);

// Update a guest by ID
router.put('/:id', updateGuestById);

// Delete a guest by ID
router.delete('/:id', deleteGuestById);

module.exports = router;
