const { db } = require('../config/firebase');

// Get all packages
exports.getAllPackages = async (req, res) => {
  try {
    const snapshot = await db.collection('packages').get();
    const packages = [];
    snapshot.forEach((doc) => {
      packages.push({ id: doc.id, ...doc.data() });
    });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
};

// Create a new package
exports.createPackage = async (req, res) => {
  try {
    const newPackage = req.body;
    const packageRef = await db.collection('packages').add(newPackage);
    res.json({ id: packageRef.id, ...newPackage });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create package' });
  }
};

// Get a package by ID
exports.getPackageById = async (req, res) => {
  try {
    const packageId = req.params.id;
    const packageRef = db.collection('packages').doc(packageId);
    const doc = await packageRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Package not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch package' });
  }
};

// Update a package by ID
exports.updatePackageById = async (req, res) => {
  try {
    const packageId = req.params.id;
    const updateData = req.body;
    const packageRef = db.collection('packages').doc(packageId);
    await packageRef.update(updateData);
    res.json({ id: packageId, ...updateData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update package' });
  }
};

// Delete a package by ID
exports.deletePackageById = async (req, res) => {
  try {
    const packageId = req.params.id;
    const packageRef = db.collection('packages').doc(packageId);
    await packageRef.delete();
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete package' });
  }
};
