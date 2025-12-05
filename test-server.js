const express = require('express');
const app = express();
const db = require('./milestoneBackend/config/db');

app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

app.post('/test-db', async (req, res) => {
  try {
    const result = await db.raw('SELECT NOW()');
    res.json({ 
      success: true, 
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.post('/test-signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    console.log('Attempting signup with:', { name, email });
    
    const [newUser] = await db('FoodTruck.Users')
      .insert({
        name,
        email,
        password,
        role: 'customer'
      })
      .returning(['userId as id', 'name', 'email', 'role']);
    
    res.json({ 
      success: true, 
      user: newUser 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      detail: error.detail
    });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
