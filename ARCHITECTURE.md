# System Architecture Diagram

## 🏗️ Complete System Architecture

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    ORDER MANAGEMENT SYSTEM - JWT AUTH                     ║
╚═══════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLIENT SIDE (Browser)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │   login.html     │  │  signup.html     │  │ dashboard.html   │         │
│  │  ┌────────────┐  │  │  ┌────────────┐  │  │  ┌────────────┐  │         │
│  │  │Email Field │  │  │  │Name Field  │  │  │  │User Email  │  │         │
│  │  │Password    │  │  │  │Email Field │  │  │  │Logout Btn  │  │         │
│  │  │Submit Btn  │  │  │  │Password    │  │  │  │Dashboard   │  │         │
│  │  └────────────┘  │  │  │Submit Btn  │  │  │  │Content     │  │         │
│  └──────────────────┘  │  └────────────┘  │  │  └────────────┘  │         │
│                        └──────────────────┘  └──────────────────┘         │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │                   js/auth.js - Utilities                         │     │
│  ├──────────────────────────────────────────────────────────────────┤     │
│  │ • Token Management:                                             │     │
│  │   - getToken() / setToken() / removeToken()                    │     │
│  │ • User Info Management:                                         │     │
│  │   - setUserInfo() / getUserInfo() / removeUserInfo()           │     │
│  │ • API Calls:                                                    │     │
│  │   - login() / signup() / logout() / checkAuth()                │     │
│  │ • Validation:                                                   │     │
│  │   - validateEmail() / validatePassword()                       │     │
│  │ • Dynamic API URL:                                              │     │
│  │   - getAPIUrl() - for dev/prod environments                    │     │
│  └──────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │               localStorage                                       │     │
│  ├──────────────────────────────────────────────────────────────────┤     │
│  │ • token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."             │     │
│  │ • userInfo: {id, name, email, role}                            │     │
│  └──────────────────────────────────────────────────────────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/JSON
                                    │ Including Bearer Token
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SERVER SIDE (Node.js + Express)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │                     Express Server                              │     │
│  ├──────────────────────────────────────────────────────────────────┤     │
│  │                                                                 │     │
│  │  POST /api/auth/signup                                         │     │
│  │  ├─ Validate Input                                            │     │
│  │  ├─ Check Email Unique                                        │     │
│  │  ├─ Hash Password (Bcrypt)                                    │     │
│  │  ├─ Insert User (Database)                                    │     │
│  │  ├─ Generate JWT Token                                        │     │
│  │  └─ Return {token, user}                                      │     │
│  │                                                                 │     │
│  │  POST /api/auth/login                                          │     │
│  │  ├─ Validate Input                                            │     │
│  │  ├─ Query User by Email                                       │     │
│  │  ├─ Verify Password (bcrypt.compare)                          │     │
│  │  ├─ Generate JWT Token                                        │     │
│  │  └─ Return {token, user}                                      │     │
│  │                                                                 │     │
│  │  GET /api/auth/me (Protected)                                  │     │
│  │  ├─ Verify JWT Token                                          │     │
│  │  ├─ Extract User ID from Token                                │     │
│  │  ├─ Query User from Database                                  │     │
│  │  └─ Return {user}                                             │     │
│  │                                                                 │     │
│  └──────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │                    Middleware Stack                             │     │
│  ├──────────────────────────────────────────────────────────────────┤     │
│  │                                                                 │     │
│  │  1. CORS Middleware                                            │     │
│  │     └─ Allow cross-origin requests                            │     │
│  │                                                                 │     │
│  │  2. Body Parser                                                │     │
│  │     └─ Parse JSON request body                                │     │
│  │                                                                 │     │
│  │  3. verifyToken (For Protected Routes)                         │     │
│  │     ├─ Extract token from Authorization header                │     │
│  │     ├─ Verify JWT signature with JWT_SECRET                  │     │
│  │     ├─ Check token expiration                                 │     │
│  │     └─ Attach user data to req.user                           │     │
│  │                                                                 │     │
│  │  4. verifyRole (For Role-Based Routes)                         │     │
│  │     ├─ Check if user exists                                   │     │
│  │     └─ Verify user role matches allowed roles                │     │
│  │                                                                 │     │
│  │  5. errorHandler (Global Error Handling)                       │     │
│  │     ├─ Catch all errors                                       │     │
│  │     ├─ Format error response                                  │     │
│  │     └─ Return appropriate status code                         │     │
│  │                                                                 │     │
│  └──────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │            JWT Token Structure (Signed)                         │     │
│  ├──────────────────────────────────────────────────────────────────┤     │
│  │                                                                 │     │
│  │  Header:                                                        │     │
│  │  {                                                              │     │
│  │    "alg": "HS256",                                             │     │
│  │    "typ": "JWT"                                                │     │
│  │  }                                                              │     │
│  │                                                                 │     │
│  │  Payload:                                                       │     │
│  │  {                                                              │     │
│  │    "id": 1,                                                    │     │
│  │    "email": "user@example.com",                                │     │
│  │    "role": "customer",                                         │     │
│  │    "name": "John Doe",                                         │     │
│  │    "iat": 1631234567,      ← Issued at                        │     │
│  │    "exp": 1631320967       ← Expires (24h later)              │     │
│  │  }                                                              │     │
│  │                                                                 │     │
│  │  Signature:                                                     │     │
│  │  HMACSHA256(header.payload, JWT_SECRET)                       │     │
│  │                                                                 │     │
│  └──────────────────────────────────────────────────────────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ SQL Queries
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE (PostgreSQL)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │              USERS TABLE                                        │     │
│  ├────┬──────────┬─────────────────────┬──────────┬──────┬─────────┤     │
│  │ id │   name   │      email          │ password │ role │ timestamps     │
│  ├────┼──────────┼─────────────────────┼──────────┼──────┼─────────┤     │
│  │ 1  │ John Doe │ john@example.com    │ $2b$10.. │cust..│ 2025-11-11    │
│  │ 2  │ Jane Doe │ jane@example.com    │ $2b$10.. │cust..│ 2025-11-11    │
│  │ 3  │ Admin    │ admin@example.com   │ $2b$10.. │admin │ 2025-11-11    │
│  ├────┴──────────┴─────────────────────┴──────────┴──────┴─────────┤     │
│  │ • id: PRIMARY KEY                                              │     │
│  │ • email: UNIQUE, INDEXED for fast lookups                      │     │
│  │ • password: Bcrypt hashed (never plain text)                   │     │
│  │ • role: customer | vendor | admin                             │     │
│  │ • created_at, updated_at: Timestamps                          │     │
│  └──────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │            Connection Pool (pg)                                │     │
│  ├──────────────────────────────────────────────────────────────────┤     │
│  │ • Max 20 concurrent connections                               │     │
│  │ • Prepared statements (SQL injection prevention)              │     │
│  │ • Connection timeout: 2s                                      │     │
│  │ • Idle timeout: 30s                                           │     │
│  └──────────────────────────────────────────────────────────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Request/Response Flow - Login

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. User enters email & password
       │    clicks "Sign In"
       ↓
┌──────────────────────────────────────┐
│  login.html - Form Handler           │
│  • Get email and password            │
│  • Validate email format             │
│  • Show loading spinner              │
└──────┬───────────────────────────────┘
       │
       │ 2. POST /api/auth/login
       │    {email, password}
       ↓
┌──────────────────────────────────────┐
│  Express Server - POST Handler       │
│  • Validate input                    │
│  • Query: SELECT FROM users...       │
└──────┬───────────────────────────────┘
       │
       │ 3. Check if user exists
       ↓
   ┌──┴──┐
   │     │
  YES   NO
   │     │
   ↓     └─→ Return 401 "Invalid credentials"
┌──────────────────────────────────────┐
│  Verify Password                     │
│  bcrypt.compare(password, hash)      │
└──────┬───────────────────────────────┘
       │
   ┌──┴──┐
   │     │
 MATCH MISMATCH
   │     │
   ↓     └─→ Return 401 "Invalid credentials"
┌──────────────────────────────────────┐
│  Generate JWT Token                  │
│  jwt.sign({id, email, role},         │
│           JWT_SECRET,                │
│           {expiresIn: '24h'})         │
└──────┬───────────────────────────────┘
       │
       │ 4. Return Response
       │    {
       │      token: "eyJ...",
       │      user: {id, name, email, role}
       │    }
       ↓
┌──────────────────────────────────────┐
│  Frontend - Response Handler         │
│  • Parse JSON response               │
│  • localStorage.setItem('token')     │
│  • localStorage.setItem('userInfo')  │
│  • Hide spinner                      │
│  • Redirect to dashboard             │
└──────┬───────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────┐
│  Browser Storage                    │
│  localStorage = {                   │
│    token: "eyJhbGc...",            │
│    userInfo: {...}                  │
│  }                                  │
└─────────────────────────────────────┘
```

## 🔐 Protected Route Access Flow

```
┌──────────────────────────────────┐
│  Browser - Protected Page        │
│  dashboard.html loads            │
└──────┬───────────────────────────┘
       │
       │ 1. Page load event
       ↓
┌──────────────────────────────────┐
│  checkAuth() Function            │
│  • Get token from localStorage   │
│  • Check if token exists         │
└──────┬───────────────────────────┘
       │
    ┌──┴──────┐
   NO         YES
    │          │
    ↓          └─→ Proceed to validate
    │
    └─→ Redirect to login.html
              │
              ↓
        ┌──────────────────────────────────┐
        │ GET /api/auth/me                 │
        │ Headers: {                       │
        │   Authorization:                 │
        │   "Bearer eyJhbGc..."            │
        │ }                                │
        └──────┬───────────────────────────┘
               │
               ↓
        ┌──────────────────────────────────┐
        │  Middleware: verifyToken()       │
        │  • Extract token from header     │
        │  • jwt.verify(token, SECRET)     │
        └──────┬───────────────────────────┘
               │
            ┌──┴──────┐
         VALID       INVALID
            │          │
            ↓          └─→ Return 401 "Invalid token"
                             └─→ Browser redirects
                                 to login.html
        ┌──────────────────────────────────┐
        │ Controller: getCurrentUser()     │
        │ • req.user attached by middleware│
        │ • Query user from database       │
        │ • Return user data               │
        └──────┬───────────────────────────┘
               │
               │ {success: true, user: {...}}
               ↓
        ┌──────────────────────────────────┐
        │ Frontend - Display Dashboard     │
        │ • Show user email                │
        │ • Display dashboard content      │
        │ • Enable logout button           │
        └──────────────────────────────────┘
```

## 🔑 Password Security Pipeline

```
┌─────────────────────────┐
│  User enters password   │
│  "MyPassword123"        │
└────────┬────────────────┘
         │
         │ SIGNUP/REGISTRATION
         ↓
┌─────────────────────────────────────┐
│  bcrypt.genSalt(10)                 │
│  → Generate random salt             │
│  → Salt = "$2b$10$..."              │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  bcrypt.hash(password, salt)        │
│  → Hash password with salt          │
│  → Hash = "$2b$10$XyZ..."           │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  Store hash in database             │
│  users.password = "$2b$10$XyZ..."   │
│  (Never store plain password!)      │
└─────────────────────────────────────┘

         │
         │ LOGIN/AUTHENTICATION
         ↓
┌─────────────────────────────────────┐
│  User enters password               │
│  "MyPassword123"                    │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  Retrieve hash from database        │
│  hash = "$2b$10$XyZ..."             │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  bcrypt.compare(password, hash)     │
│  → Compare entered password         │
│  → With stored hash                 │
└────────┬────────────────────────────┘
         │
      ┌──┴──┐
    MATCH   MISMATCH
      │      │
      ↓      └─→ Return false
             └─→ Login fails
   ┌──────────────────────┐
   │ Return true          │
   │ Generate JWT token   │
   │ Login succeeds       │
   └──────────────────────┘
```

## 📊 Architecture Summary

```
┌──────────────────────────────────────────────────────────────────┐
│                    3-TIER ARCHITECTURE                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  PRESENTATION LAYER (Frontend)                         │   │
│  │  • HTML forms (login, signup)                         │   │
│  │  • CSS styling                                        │   │
│  │  • Vanilla JavaScript (auth.js)                       │   │
│  │  • localStorage for token management                 │   │
│  └────────────────────────────────────────────────────────┘   │
│                           ↕                                     │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  APPLICATION LAYER (Backend)                          │   │
│  │  • Express.js server                                 │   │
│  │  • Authentication controllers                         │   │
│  │  • JWT middleware (token verification)               │   │
│  │  • RBAC middleware (role-based access)               │   │
│  │  • Error handling middleware                         │   │
│  │  • Input validation & sanitization                   │   │
│  └────────────────────────────────────────────────────────┘   │
│                           ↕                                     │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  DATA LAYER (Database)                                │   │
│  │  • PostgreSQL server                                 │   │
│  │  • Users table                                       │   │
│  │  • Connection pooling                                │   │
│  │  • Prepared statements                               │   │
│  │  • Indexes for performance                           │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└──────────────────────────────────────────────────────────────────┘
```

---

**Architecture Version**: 1.0
**Last Updated**: November 11, 2025
**Status**: ✅ Complete
