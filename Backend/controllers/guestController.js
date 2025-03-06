const { db } = require('../config/firebase');

// Get all guests
exports.getAllGuests = async (req, res) => {
  try {
    const snapshot = await db.collection('guests').get();
    const guests = [];
    snapshot.forEach((doc) => {
      guests.push({ id: doc.id, ...doc.data() });
    });
    res.json(guests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch guests' });
  }
};

// Create a new guest
exports.createGuest = async (req, res) => {
  try {
    const newGuest = req.body;
    const guestRef = await db.collection('guests').add(newGuest);
    res.json({ id: guestRef.id, ...newGuest });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create guest' });
  }
};

// Get a guest by ID
exports.getGuestById = async (req, res) => {
  try {
    const guestId = req.params.id;
    const guestRef = db.collection('guests').doc(guestId);
    const doc = await guestRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Guest not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch guest' });
  }
};

// Update a guest by ID
exports.updateGuestById = async (req, res) => {
  try {
    const guestId = req.params.id;
    const updateData = req.body;
    const guestRef = db.collection('guests').doc(guestId);
    await guestRef.update(updateData);
    res.json({ id: guestId, ...updateData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update guest' });
  }
};

// Delete a guest by ID
exports.deleteGuestById = async (req, res) => {
  try {
    const guestId = req.params.id;
    const guestRef = db.collection('guests').doc(guestId);
    await guestRef.delete();
    res.json({ message: 'Guest deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete guest' });
  }
};
