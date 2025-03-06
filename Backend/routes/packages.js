const express = require('express');
const router = express.Router();
const {
  getAllPackages,
  createPackage,
  getPackageById,
  updatePackageById,
  deletePackageById
} = require('../controllers/packageController');

// Get all packages
router.get('/', getAllPackages);

// Create a new package
router.post('/', createPackage);

// Get a package by ID
router.get('/:id', getPackageById);

// Update a package by ID
router.put('/:id', updatePackageById);

// Delete a package by ID
router.delete('/:id', deletePackageById);

module.exports = router;
