# Developer Reference Guide - JWT Authentication

## 🎓 Complete Developer Reference for JWT Authentication System

### Table of Contents
1. [Authentication Flow](#authentication-flow)
2. [Code Examples](#code-examples)
3. [Common Tasks](#common-tasks)
4. [Troubleshooting](#troubleshooting)
5. [API Reference](#api-reference)

---

## Authentication Flow

### 1. User Registration (Signup)

**Frontend (signup.html → js/auth.js)**
```javascript
// User submits form
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Frontend validation
    if (!validateEmail(email)) {
        showError('Invalid email format');
        return;
    }
    
    // Call signup function
    const response = await signup(name, email, password, confirmPassword);
    
    if (response.success) {
        // Token is automatically stored by signup()
        window.location.href = '/dashboard.html';
    }
});
```

**Frontend (js/auth.js - signup function)**
```javascript
const signup = async (name, email, password, confirmPassword) => {
    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                password,
                confirmPassword
            })
        });

        const data = await response.json();
        
        if (data.success && data.token) {
            // Store token and user info
            setToken(data.token);
            setUserInfo(data.user);
            return data;
        }
        
        throw new Error(data.message || 'Signup failed');
    } catch (error) {
        console.error('Signup error:', error);
        throw error;
    }
};
```

**Backend (authController.js - signup controller)**
```javascript
exports.signup = async (req, res, next) => {
    try {
        const { name, email, password, confirmPassword, role } = req.body;

        // 1. Validate input
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // 2. Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // 3. Password match validation
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // 4. Check user doesn't already exist
        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // 5. Hash password with bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 6. Insert user into database
        const result = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, hashedPassword, role || 'customer']
        );

        const newUser = result.rows[0];

        // 7. Generate JWT token
        const token = jwt.sign(
            {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
                name: newUser.name
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 8. Return response
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        next(error);
    }
};
```

### 2. User Login

**Frontend (login.html)**
```javascript
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await login(email, password);
        if (response.success) {
            // Token stored, redirect to dashboard
            window.location.href = '/dashboard.html';
        }
    } catch (error) {
        showError(error.message);
    }
});
```

**Frontend (js/auth.js - login function)**
```javascript
const login = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (data.success && data.token) {
            setToken(data.token);
            setUserInfo(data.user);
            return data;
        }
        
        throw new Error(data.message || 'Login failed');
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};
```

**Backend (authController.js - login controller)**
```javascript
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 1. Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // 2. Query database for user
        const result = await db.query(
            'SELECT id, email, password, name, role FROM users WHERE email = $1',
            [email]
        );

        const user = result.rows[0];

        // 3. User not found
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // 4. Verify password using bcrypt
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // 5. Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 6. Remove password from response
        delete user.password;

        // 7. Return response
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};
```

### 3. Protected Route Access

**Frontend (dashboard.html)**
```javascript
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is authenticated
    const isAuthenticated = await checkAuth();
    
    if (!isAuthenticated) {
        // Not authenticated, redirect to login
        window.location.href = '/login.html';
        return;
    }

    // User is authenticated
    const user = getUserInfo();
    document.getElementById('userEmail').textContent = user.email;

    // Handle logout button
    document.getElementById('logoutButton').addEventListener('click', () => {
        logout();
        window.location.href = '/login.html';
    });
});
```

**Frontend (js/auth.js - checkAuth function)**
```javascript
const checkAuth = async () => {
    const token = getToken();
    
    // No token stored
    if (!token) {
        return false;
    }

    try {
        // Verify token with backend
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (data.success) {
            // Update user info if returned
            if (data.user) {
                setUserInfo(data.user);
            }
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Auth check failed:', error);
        removeToken();
        removeUserInfo();
        return false;
    }
};
```

**Backend (middleware/authMiddleware.js - verifyToken)**
```javascript
const verifyToken = (req, res, next) => {
    try {
        // 1. Get authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false,
                message: 'Access denied. No token provided.' 
            });
        }

        // 2. Extract token
        const token = authHeader.split(' ')[1];
        
        // 3. Verify token signature
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Attach user info to request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            name: decoded.name
        };
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token expired. Please login again.' 
            });
        }
        
        return res.status(401).json({ 
            success: false,
            message: 'Invalid token.' 
        });
    }
};
```

**Backend (authController.js - getCurrentUser)**
```javascript
exports.getCurrentUser = async (req, res, next) => {
    try {
        // req.user already populated by verifyToken middleware
        const user = req.user;

        // Get fresh user data from database
        const result = await db.query(
            'SELECT id, name, email, role FROM users WHERE id = $1',
            [user.id]
        );

        if (!result.rows[0]) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};
```

---

## Code Examples

### Token Management

**Store Token**
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
localStorage.setItem('token', token);
```

**Retrieve Token**
```javascript
const token = localStorage.getItem('token');
if (token) {
    console.log('Token found:', token);
}
```

**Remove Token**
```javascript
localStorage.removeItem('token');
```

### Making Authenticated Requests

```javascript
// Get stored token
const token = localStorage.getItem('token');

// Make request with token
const response = await fetch('http://localhost:5000/api/auth/me', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});

const data = await response.json();
console.log(data);
```

### Adding New Protected Routes

**Frontend - Check Auth Before Loading**
```javascript
document.addEventListener('DOMContentLoaded', async () => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
        window.location.href = '/login.html';
        return;
    }
    
    // Load page content
    loadPageContent();
});
```

**Backend - Create Protected Route**
```javascript
const express = require('express');
const router = express.Router();
const { verifyToken, adminOnly } = require('../middleware');

// Protected by token verification
router.get('/user-data', verifyToken, (req, res) => {
    res.json({
        message: 'User data',
        userId: req.user.id
    });
});

// Protected by token + admin role
router.delete('/users/:id', verifyToken, adminOnly, (req, res) => {
    res.json({ message: 'User deleted' });
});

module.exports = router;
```

### Form Validation Examples

**Email Validation**
```javascript
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

console.log(validateEmail('user@example.com')); // true
console.log(validateEmail('invalid-email')); // false
```

**Password Validation**
```javascript
const validatePassword = (password) => {
    // Min 8 chars, uppercase, lowercase, numbers
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
};

console.log(validatePassword('Password123')); // true
console.log(validatePassword('weak')); // false
```

---

## Common Tasks

### Task 1: Add New User Role

**Backend - Add Role to Signup**
```javascript
// In authController.js signup()
const result = await db.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
    [name, email, hashedPassword, role || 'customer']
);
```

**Backend - Add Role Middleware**
```javascript
// In middleware/authMiddleware.js
const vendorOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            success: false,
            message: 'User not authenticated.' 
        });
    }

    if (req.user.role !== 'vendor') {
        return res.status(403).json({ 
            success: false,
            message: 'Access denied. Vendor role required.' 
        });
    }

    next();
};

module.exports = { vendorOnly };
```

### Task 2: Change Password (New Endpoint)

**Backend Route**
```javascript
// In authRoutes.js
router.post('/change-password', verifyToken, changePassword);

// In authController.js
exports.changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Get user from database
        const result = await db.query(
            'SELECT password FROM users WHERE id = $1',
            [userId]
        );

        const user = result.rows[0];

        // Verify old password
        const isValid = await bcrypt.compare(oldPassword, user.password);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Old password is incorrect'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await db.query(
            'UPDATE users SET password = $1 WHERE id = $2',
            [hashedPassword, userId]
        );

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        next(error);
    }
};
```

### Task 3: Add Refresh Token Logic

**Backend - Generate Refresh Token**
```javascript
// Install: npm install crypto

const crypto = require('crypto');

const generateRefreshToken = (userId) => {
    // Use longer-lived token or store in database
    return jwt.sign(
        { id: userId, type: 'refresh' },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );
};

const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};
```

### Task 4: Add Account Deletion

**Backend Route**
```javascript
// In authRoutes.js
router.delete('/account', verifyToken, deleteAccount);

// In authController.js
exports.deleteAccount = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Delete user from database
        const result = await db.query(
            'DELETE FROM users WHERE id = $1 RETURNING id',
            [userId]
        );

        if (!result.rows[0]) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
```

---

## Troubleshooting

### Problem: "Invalid credentials" error when password is correct

**Solution:**
```javascript
// Check database for user
SELECT * FROM users WHERE email = 'user@example.com';

// Verify bcrypt is working correctly
const bcrypt = require('bcrypt');
const password = 'TestPassword123';
const hash = '$2b$10$...'; // hash from database

bcrypt.compare(password, hash, (err, isMatch) => {
    console.log(isMatch); // Should be true
});
```

### Problem: Token not being sent to frontend

**Solution - Check response**:
```javascript
// In browser console
fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'user@example.com', password: 'password' })
})
.then(r => r.json())
.then(data => {
    console.log('Response:', data);
    if (data.token) {
        localStorage.setItem('token', data.token);
    }
});
```

### Problem: Protected route returns 401 Unauthorized

**Solution - Check Authorization header**:
```javascript
// Make sure token is included
const token = localStorage.getItem('token');
console.log('Token:', token);

fetch('http://localhost:5000/api/auth/me', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
.then(r => r.json())
.then(data => console.log(data));
```

### Problem: "Token expired" error

**Solution - Get new token**:
```javascript
// User must login again to get new token
const response = await login(email, password);
// Token is automatically stored and refreshed
```

### Problem: CORS error

**Solution - Check CORS configuration**:
```javascript
// In server.js, verify CORS is enabled
const cors = require('cors');
app.use(cors());

// For production, restrict to specific domains
app.use(cors({
    origin: 'https://yourdomain.com',
    credentials: true
}));
```

---

## API Reference

### POST /api/auth/signup

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "confirmPassword": "Password123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

**Error Responses:**
- 400: Missing fields, invalid email, password mismatch, user exists
- 500: Server error

---

### POST /api/auth/login

**Request:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

**Error Responses:**
- 400: Missing email or password
- 401: User not found or wrong password
- 500: Server error

---

### GET /api/auth/me

**Request:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

**Error Responses:**
- 401: No token, invalid token, or token expired
- 404: User not found
- 500: Server error

---

**Document Version**: 1.0
**Last Updated**: November 11, 2025
**Status**: ✅ Complete
