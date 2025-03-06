const express = require('express');
const router = express.Router();
const {
  getAllAddons,
  createAddon,
  getAddonById,
  updateAddonById,
  deleteAddonById
} = require('../controllers/addonController');

// Get all addons
router.get('/', getAllAddons);

// Create a new addon
router.post('/', createAddon);

// Get an addon by ID
router.get('/:id', getAddonById);

// Update an addon by ID
router.put('/:id', updateAddonById);

// Delete an addon by ID
router.delete('/:id', deleteAddonById);

module.exports = router;
