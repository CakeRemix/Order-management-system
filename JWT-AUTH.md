# JWT Authentication Implementation - Order Management System

## 📋 Overview

This document describes the complete JWT authentication system implemented for the Order Management System using Vanilla JS, HTML, CSS, Node.js, and Express (no React/frameworks).

## ✅ What Was Implemented

### Backend Implementation

#### 1. **Authentication Routes** (`backend/routes/authRoutes.js`)
- `POST /api/auth/login` - User login with email/password
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current authenticated user info

#### 2. **Authentication Controller** (`backend/controllers/authController.js`)
- **login()**: Validates credentials, hashes password check, generates JWT token
- **signup()**: Registers new user, validates input, hashes password, generates JWT token
- **getCurrentUser()**: Retrieves authenticated user data from database

#### 3. **JWT Middleware** (`middleware/authMiddleware.js`)
- **verifyToken()**: Extracts and validates JWT from Authorization header
- **verifyRole()**: Role-based access control
- **Specific role middlewares**: customerOnly, vendorOnly, adminOnly, etc.

#### 4. **Database** (`backend/config/`)
- PostgreSQL connection pool configuration
- User model with methods for CRUD operations
- Database schema with users table, indexes, and triggers

#### 5. **Error Handler** (`middleware/errorHandler.js`)
- Global error handling middleware
- PostgreSQL error code handling
- JWT error handling
- Environment-aware error responses

#### 6. **Environment Configuration** (`.env`)
- JWT_SECRET for token signing
- JWT_EXPIRATION for token validity period
- Database connection parameters
- Server port and environment settings

### Frontend Implementation

#### 1. **Login Page** (`frontend/public/login.html`)
- Clean, responsive login form
- Email and password validation
- Error message display
- Loading state management
- Redirect to dashboard on success

#### 2. **Sign Up Page** (`frontend/public/signup.html`)
- User registration form
- Password confirmation validation
- Real-time error feedback
- Loading state with spinner
- Link to login page

#### 3. **Dashboard** (`frontend/public/dashboard.html`)
- Protected page (requires authentication)
- Displays logged-in user email
- Logout functionality
- Redirect to login if not authenticated

#### 4. **Auth Utilities** (`frontend/public/js/auth.js`)
- **Token Management**: Store, retrieve, clear JWT tokens
- **User Info Management**: Store and retrieve user data
- **API Calls**: login(), signup(), logout(), checkAuth()
- **Validation Functions**: validateEmail(), validatePassword()
- **Protected Routes**: requireAuth() helper
- **Dynamic API URL Detection**: Handles both development and production

#### 5. **Styling** (`frontend/public/css/styles.css`)
- Modern, clean design
- Responsive layout
- Form styling with focus states
- Error and success alert styles
- Dashboard layout
- Loading spinner animation
- Color variables for theming

## 🔄 Authentication Flow

### 1. User Registration Flow

```
User submits signup form
    ↓
Frontend validates input (name, email, password)
    ↓
POST /api/auth/signup with credentials
    ↓
Backend validates all fields
    ↓
Check if user already exists
    ↓
Hash password with bcrypt
    ↓
Insert user into database
    ↓
Generate JWT token
    ↓
Return token + user info to frontend
    ↓
Frontend stores token in localStorage
    ↓
Redirect to dashboard
```

### 2. User Login Flow

```
User submits login form
    ↓
Frontend validates email and password
    ↓
POST /api/auth/login with credentials
    ↓
Backend queries database for user
    ↓
Verify password using bcrypt.compare()
    ↓
Generate JWT token
    ↓
Return token + user info
    ↓
Frontend stores token in localStorage
    ↓
Redirect to dashboard
```

### 3. Protected Route Access

```
User navigates to protected page
    ↓
Frontend checks localStorage for token
    ↓
If no token, redirect to login
    ↓
If token exists, verify with backend (GET /api/auth/me)
    ↓
Include token in Authorization header: "Bearer {token}"
    ↓
Backend verifies JWT signature
    ↓
If valid, return user data
    ↓
If invalid/expired, return 401 error
    ↓
Frontend redirects to login if needed
```

### 4. Token Validation Process

```
Request arrives at backend
    ↓
Middleware extracts token from "Authorization: Bearer {token}"
    ↓
jwt.verify() validates signature using JWT_SECRET
    ↓
If signature is invalid → 401 Unauthorized
    ↓
If signature is valid → extract user data (id, email, role, name)
    ↓
Attach user info to req.user
    ↓
Continue to route handler
```

## 🔐 Security Features

### 1. Password Security
- **Hashing**: Passwords are hashed using bcrypt with 10 salt rounds
- **Never stored in plain text**: Only hashed passwords in database
- **Comparison**: Uses bcrypt.compare() for secure comparison

### 2. JWT Security
- **Signed tokens**: Tokens are signed with JWT_SECRET
- **Expiration**: Tokens expire after 24 hours (configurable)
- **Header validation**: Requires "Bearer" prefix in Authorization header
- **Signature verification**: Backend verifies token hasn't been tampered with

### 3. Database Security
- **Unique email**: Email addresses are unique (enforced by database constraint)
- **Indexes**: Email column is indexed for fast lookups
- **Prepared statements**: Using parameterized queries to prevent SQL injection

### 4. Input Validation
- **Frontend validation**: Email format, password strength, required fields
- **Backend validation**: All inputs re-validated server-side
- **Email domain check**: GIU email domain validation (configurable)

## 📦 Database Schema

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);

-- Auto-update timestamp trigger
CREATE TRIGGER update_users_updated_at BEFORE UPDATE
    ON users FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## 🚀 Getting Started

### 1. Setup

```bash
# Install dependencies
npm install

# Configure environment
# Edit .env with your database credentials and JWT_SECRET
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb order_management_db

# Run schema migration
psql -U postgres -d order_management_db -f backend/config/schema.sql
```

### 3. Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### 4. Access Application

- **Sign Up**: http://localhost:5000/signup.html
- **Login**: http://localhost:5000/login.html
- **Dashboard**: http://localhost:5000/dashboard.html (requires authentication)

## 📡 API Endpoints

### Sign Up
```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "confirmPassword": "Password123"
}

Response (201):
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

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}

Response (200):
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

### Get Current User
```
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response (200):
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

## 🧪 Testing the API

### Using cURL

```bash
# Sign Up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123",
    "confirmPassword": "TestPass123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# Get Current User (replace TOKEN with your JWT)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### Using Postman

1. Create new requests for each endpoint
2. Set method (POST/GET)
3. Set URL (e.g., http://localhost:5000/api/auth/login)
4. For POST: Set Body to JSON and add credentials
5. For protected endpoints: Add Authorization header with Bearer token
6. Send and inspect response

## 📂 Project Structure

```
Order-management-system/
├── backend/
│   ├── config/
│   │   ├── db.js                    # PostgreSQL connection
│   │   └── schema.sql              # Database schema
│   ├── controllers/
│   │   └── authController.js       # Auth business logic
│   ├── models/
│   │   └── userModel.js            # User database model
│   └── routes/
│       └── authRoutes.js           # Auth API routes
├── frontend/
│   └── public/
│       ├── login.html              # Login page
│       ├── signup.html             # Registration page
│       ├── dashboard.html          # Protected dashboard
│       ├── css/
│       │   └── styles.css          # All styling
│       └── js/
│           └── auth.js             # Frontend utilities
├── middleware/
│   ├── authMiddleware.js           # JWT verification
│   ├── errorHandler.js             # Global error handling
│   └── index.js                    # Middleware exports
├── server.js                        # Express server entry point
├── package.json                     # Dependencies
├── .env                             # Environment variables
├── SETUP.md                         # Detailed setup guide
├── JWT-AUTH.md                      # This file
└── test-api.sh                      # API testing script
```

## 🔑 Key Technologies Used

- **Express.js** - Web framework
- **JWT (jsonwebtoken)** - Token generation and verification
- **Bcrypt** - Password hashing
- **PostgreSQL** - Relational database
- **CORS** - Cross-origin requests
- **dotenv** - Environment variables
- **Vanilla JavaScript** - Frontend (no frameworks)

## 🛠️ Configuration Files

### .env
```
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=order_management_db

JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRATION=24h

BCRYPT_ROUNDS=10
```

### package.json
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "pg": "^8.x.x"
  }
}
```

## 🔍 How Token Storage Works

### Frontend Storage
```javascript
// Token stored in localStorage (key: 'token')
localStorage.setItem('token', jwtToken);

// Retrieve for API calls
const token = localStorage.getItem('token');

// Remove on logout
localStorage.removeItem('token');
```

### Token Usage
```javascript
// Include in API requests
fetch('http://localhost:5000/api/auth/me', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
```

### Note on Security
- localStorage is vulnerable to XSS attacks
- For production, consider using httpOnly cookies
- However, localStorage works for this implementation

## ⚠️ Error Handling

### Common Error Responses

**Invalid Credentials (401)**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**User Already Exists (400)**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

**Token Expired (401)**
```json
{
  "success": false,
  "message": "Token expired. Please login again."
}
```

**Missing Required Fields (400)**
```json
{
  "success": false,
  "message": "All fields are required"
}
```

## 🚦 Validation Rules

### Email
- Must be valid format (xxx@yyy.zzz)
- Must be unique in database
- Optional domain check (currently GIU emails only)

### Password
- Frontend: Min 8 chars, uppercase, lowercase, numbers
- Backend: Min 6 chars (backend validation is less strict)
- Hashed with bcrypt before storage

### Name
- Required field
- Must not be empty string

## 📝 Logging and Debugging

### Server Logging
```javascript
// Database connections
✅ Connected to PostgreSQL database

// Server startup
🚀 Server running on port 5000

// Errors
❌ Error: message
```

### Frontend Debugging
```javascript
// Check localStorage
console.log(localStorage.getItem('token'));

// Check user info
console.log(JSON.parse(localStorage.getItem('userInfo')));
```

## 🎯 Next Steps to Extend

1. **Add Email Verification**: Send verification email before account activation
2. **Implement Refresh Tokens**: Allow token refresh without re-login
3. **Add Password Reset**: Email-based password reset flow
4. **OAuth Integration**: Google, GitHub login
5. **Two-Factor Authentication**: SMS or app-based 2FA
6. **Activity Logging**: Track user login/logout activities
7. **Role-based Permissions**: Implement permission-based access control
8. **API Documentation**: Generate Swagger/OpenAPI docs

## 📞 Support & Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify credentials in .env
- Check database exists: `psql -l | grep order_management_db`

### JWT Issues
- Verify JWT_SECRET is set and consistent
- Check token hasn't expired
- Ensure proper Bearer format in headers

### CORS Issues
- Check API URL in frontend matches backend server
- Verify CORS middleware is configured in Express

### Password Issues
- Bcrypt hashing can take time (10 rounds)
- Add password strength validation on frontend

## 📚 References

- [Express.js Documentation](https://expressjs.com/)
- [JWT.io](https://jwt.io/)
- [Bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [OWASP Security Guidelines](https://owasp.org/)

---

**Created**: November 11, 2025
**Status**: ✅ Complete Implementation
**Testing**: Ready for development/testing
