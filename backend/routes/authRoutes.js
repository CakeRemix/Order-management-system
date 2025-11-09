const express = require('express');
const router = express.Router();
const { login, signup, getCurrentUser } = require('../controllers/authController');
const { verifyToken } = require('../../middleware');

// Public routes
router.post('/login', login);
router.post('/signup', signup);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);

module.exports = router;