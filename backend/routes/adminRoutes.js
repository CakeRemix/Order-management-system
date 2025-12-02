const express = require('express');
const router = express.Router();
const { verifyToken, adminOnly } = require('../../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// Protect all admin routes
router.use(verifyToken, adminOnly);

// User management
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/toggle-active', adminController.toggleUserActive);

// Food truck management
router.get('/trucks', adminController.getAllTrucksAdmin);
router.post('/trucks', adminController.createTruckWithVendor);
router.delete('/trucks/:id', adminController.deleteTruck);

// System statistics
router.get('/stats', adminController.getSystemStats);

module.exports = router;
