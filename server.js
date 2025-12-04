const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import database
const db = require('./backend/config/db');

// Import middleware
const { errorHandler } = require('./middleware');

// Import routes
const authRoutes = require('./backend/routes/authRoutes');
const trucksRoutes = require('./backend/routes/trucksRoutes');
const adminRoutes = require('./backend/routes/adminRoutes');
const vendorRoutes = require('./backend/routes/vendorRoutes');
const orderRoutes = require('./backend/routes/orderRoutes');
const cartRoutes = require('./backend/routes/cartRoutes');
const v1Routes = require('./backend/routes/v1');
// const productRoutes = require('./backend/routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Homepage route - MUST be before static middleware
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/public', 'homepage.html'));
});

// Serve static files from frontend/public
app.use(express.static(path.join(__dirname, 'frontend/public')));

// Serve images from frontend/public/images
app.use('/images', express.static(path.join(__dirname, 'frontend/public/images')));

// Health check route
app.get('/health', async (req, res) => {
  try {
    await db.raw('SELECT NOW()');
    res.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/trucks', trucksRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/v1', v1Routes);
// app.use('/api/products', productRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});

module.exports = app;
