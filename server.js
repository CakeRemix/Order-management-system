const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database
const db = require('./backend/config/db');

// Import middleware
const { errorHandler } = require('./middleware');

// Import routes
const authRoutes = require('./backend/routes/authRoutes');
// const orderRoutes = require('./backend/routes/orderRoutes');
// const productRoutes = require('./backend/routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Order managment system',
    status:  'Best project😮‍💨😮‍💨'
  });
});

// Health check route
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT NOW()');
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
// app.use('/api/orders', orderRoutes);
// app.use('/api/products', productRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});

module.exports = app;
