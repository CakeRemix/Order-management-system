const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../../middleware/authMiddleware');
const {
    getMyTruck,
    getMyMenuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getMyOrders,
    updateMyTruck,
    toggleBusyMode
} = require('../controllers/vendorController');

// All vendor routes require authentication and truckOwner role
router.use(verifyToken);
router.use(verifyRole('truckOwner'));

// Truck management
router.get('/my-truck', getMyTruck);
router.put('/my-truck', updateMyTruck);
router.put('/my-truck/busy-mode', toggleBusyMode);

// Menu management
router.get('/my-truck/menu', getMyMenuItems);
router.post('/my-truck/menu', addMenuItem);
router.patch('/my-truck/menu/:itemId', updateMenuItem);
router.delete('/my-truck/menu/:itemId', deleteMenuItem);

// Orders
router.get('/my-truck/orders', getMyOrders);

module.exports = router;
