const { db } = require('../config/firebase');

// Get all addons
exports.getAllAddons = async (req, res) => {
  try {
    const snapshot = await db.collection('addons').get();
    const addons = [];
    snapshot.forEach((doc) => {
      addons.push({ id: doc.id, ...doc.data() });
    });
    res.json(addons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch addons' });
  }
};

// Create a new addon
exports.createAddon = async (req, res) => {
  try {
    const newAddon = req.body;
    const addonRef = await db.collection('addons').add(newAddon);
    res.json({ id: addonRef.id, ...newAddon });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create addon' });
  }
};

// Get an addon by ID
exports.getAddonById = async (req, res) => {
  try {
    const addonId = req.params.id;
    const addonRef = db.collection('addons').doc(addonId);
    const doc = await addonRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Addon not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch addon' });
  }
};

// Update an addon by ID
exports.updateAddonById = async (req, res) => {
  try {
    const addonId = req.params.id;
    const updateData = req.body;
    const addonRef = db.collection('addons').doc(addonId);
    await addonRef.update(updateData);
    res.json({ id: addonId, ...updateData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update addon' });
  }
};

// Delete an addon by ID
exports.deleteAddonById = async (req, res) => {
  try {
    const addonId = req.params.id;
    const addonRef = db.collection('addons').doc(addonId);
    await addonRef.delete();
    res.json({ message: 'Addon deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete addon' });
  }
};
