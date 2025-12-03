# JWT Authentication Setup Guide

## Overview
This guide will help you set up JWT-based authentication for your Order Management System. The system uses:
- **Backend**: Node.js + Express
- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: Bcrypt

## Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Step 1: Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web framework
- `cors` - Cross-Origin Resource Sharing
- `dotenv` - Environment variable management
- `jsonwebtoken` - JWT token generation and verification
- `bcrypt` - Password hashing
- `pg` - PostgreSQL client

## Step 2: Configure Environment Variables

Edit the `.env` file in the project root with your database credentials:

```
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=order_management_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_at_least_32_characters_long
JWT_EXPIRATION=24h

BCRYPT_ROUNDS=10
```

**Important:** In production, use a strong JWT_SECRET (at least 32 characters with mixed case, numbers, and symbols).

## Step 3: Create Database

1. Create PostgreSQL database:
```sql
CREATE DATABASE order_management_db;
```

2. Connect to the database and run the schema:
```bash
psql -U postgres -d order_management_db -f backend/config/schema.sql
```

Or manually run the SQL commands from `backend/config/schema.sql`.

## Step 4: Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication Routes

#### 1. **Sign Up (Register)**
- **URL**: `POST /api/auth/signup`
- **Description**: Create a new user account
- **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "confirmPassword": "Password123"
}
```
- **Response**:
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

#### 2. **Login**
- **URL**: `POST /api/auth/login`
- **Description**: Authenticate user and receive JWT token
- **Request Body**:
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```
- **Response**:
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

#### 3. **Get Current User Info**
- **URL**: `GET /api/auth/me`
- **Description**: Retrieve current authenticated user's information
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
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

## Frontend Integration

The frontend (`frontend/public/`) includes:

### Files
- `login.html` - Login page
- `signup.html` - Registration page
- `dashboard.html` - Protected dashboard
- `js/auth.js` - Authentication utilities
- `css/styles.css` - Styling

### JavaScript Functions

#### Token Management
```javascript
// Get stored token
const token = getToken();

// Set token in localStorage
setToken(token);

// Remove token
removeToken();
```

#### API Calls
```javascript
// Login
const response = await login(email, password);

// Sign Up
const response = await signup(name, email, password, confirmPassword);

// Logout
logout();

// Check authentication status
const isAuth = await checkAuth();
```

#### Form Validation
```javascript
// Validate email format
validateEmail(email);

// Validate password strength
validatePassword(password);
```

## How JWT Authentication Works

1. **User Registration/Login**
   - User submits credentials to `/api/auth/login` or `/api/auth/signup`
   - Backend verifies credentials and generates JWT token
   - Token is sent to frontend

2. **Token Storage**
   - Frontend stores JWT in localStorage
   - Token format: `Bearer {token}`

3. **Authenticated Requests**
   - For protected routes, include token in Authorization header
   - Example: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

4. **Token Verification**
   - Backend verifies token signature using JWT_SECRET
   - If valid, user information is extracted from token
   - If invalid or expired, request is rejected

5. **Token Expiration**
   - Tokens expire after the duration specified in `JWT_EXPIRATION`
   - Default: 24 hours
   - After expiration, user must login again

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `201` - Created (signup success)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid credentials, expired token)
- `403` - Forbidden (insufficient permissions)
- `500` - Internal Server Error

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` file to version control
   - Use different secrets for development and production

2. **Password Requirements**
   - Frontend validates: min 8 chars, uppercase, lowercase, numbers
   - Backend hashes passwords with bcrypt (10 rounds)

3. **Token Security**
   - Tokens are stored in localStorage (consider using httpOnly cookies for production)
   - Always use HTTPS in production
   - Set appropriate JWT expiration times

4. **CORS Configuration**
   - Currently allows all origins (for development)
   - In production, restrict to specific domains

## Testing the API

### Using cURL

**Sign Up:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "confirmPassword": "Password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

**Get User Info:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer {your_token_here}"
```

### Using Browser

1. Navigate to `http://localhost:5000/signup.html` to create an account
2. Navigate to `http://localhost:5000/login.html` to login
3. After login, you'll be redirected to `http://localhost:5000/dashboard.html`

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check `.env` database credentials
- Ensure database `order_management_db` exists

### JWT_SECRET Error
- Make sure `JWT_SECRET` is set in `.env`
- Ensure it's a strong, unique value

### CORS Errors
- Check that API URLs match your server configuration
- Verify CORS is properly configured in `server.js`

### Token Expired
- Clear localStorage and login again
- Increase `JWT_EXPIRATION` if needed

## Project Structure

```
Order-management-system/
├── backend/
│   ├── config/
│   │   ├── db.js           # Database configuration
│   │   └── schema.sql      # Database schema
│   ├── controllers/
│   │   └── authController.js # Auth logic
│   ├── models/
│   │   └── userModel.js    # User model
│   └── routes/
│       └── authRoutes.js   # Auth routes
├── frontend/
│   └── public/
│       ├── login.html      # Login page
│       ├── signup.html     # Sign up page
│       ├── dashboard.html  # Protected dashboard
│       ├── js/
│       │   └── auth.js     # Auth utilities
│       └── css/
│           └── styles.css  # Styling
├── middleware/
│   ├── authMiddleware.js   # JWT verification
│   ├── errorHandler.js     # Error handling
│   └── index.js            # Middleware exports
├── server.js               # Main server file
├── package.json
└── .env                    # Environment variables
```

## Next Steps

1. Set up your PostgreSQL database
2. Configure `.env` with your credentials
3. Run `npm install` to install dependencies
4. Start the server with `npm run dev`
5. Test the API with login/signup endpoints
6. Access the frontend at `http://localhost:5000`

## Support

For issues or questions, refer to:
- Express.js: https://expressjs.com/
- PostgreSQL: https://www.postgresql.org/
- JWT: https://jwt.io/
- Bcrypt: https://github.com/kelektiv/node.bcrypt.js
