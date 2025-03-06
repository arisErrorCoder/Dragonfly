const { db } = require('../config/firebase');

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const snapshot = await db.collection('orders').get();
    const orders = [];
    snapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const newOrder = req.body;
    const orderRef = await db.collection('orders').add(newOrder);
    res.json({ id: orderRef.id, ...newOrder });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Get an order by ID
exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const orderRef = db.collection('orders').doc(orderId);
    const doc = await orderRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// Update an order by ID
exports.updateOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const updateData = req.body;
    const orderRef = db.collection('orders').doc(orderId);
    await orderRef.update(updateData);
    res.json({ id: orderId, ...updateData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
};

// Delete an order by ID
exports.deleteOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const orderRef = db.collection('orders').doc(orderId);
    await orderRef.delete();
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
};
