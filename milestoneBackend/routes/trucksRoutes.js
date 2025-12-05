const express = require('express');
const router = express.Router();
const {
  getAllTrucks,
  getTruckById,
  getTruckByName,
  getMenuItemsByTruckId,
  getMenuItemsByTruckName
} = require('../controllers/trucksController');

// Get all food trucks
router.get('/', getAllTrucks);

// Get specific truck by ID
router.get('/:id', getTruckById);

// Get truck by name (must come before /:id/menu to avoid conflicts)
router.get('/name/:name', getTruckByName);

// Get menu items for a truck by ID
router.get('/:id/menu', getMenuItemsByTruckId);

// Get menu items for a truck by name
router.get('/name/:name/menu', getMenuItemsByTruckName);

module.exports = router;
