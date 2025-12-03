const express = require('express');
const router = express.Router();

// Import v1 route modules
const menuItemRoutes = require('./menuItemRoutes');
const trucksRoutes = require('./trucksRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');

// Mount routes
router.use('/menuItem', menuItemRoutes);
router.use('/trucks', trucksRoutes);
router.use('/cart', cartRoutes);
router.use('/order', orderRoutes);

module.exports = router;
