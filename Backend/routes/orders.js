const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  createOrder,
  getOrderById,
  updateOrderById,
  deleteOrderById
} = require('../controllers/orderController');

// Get all orders
router.get('/', getAllOrders);

// Create a new order
router.post('/', createOrder);

// Get an order by ID
router.get('/:id', getOrderById);

// Update an order by ID
router.put('/:id', updateOrderById);

// Delete an order by ID
router.delete('/:id', deleteOrderById);

module.exports = router;
