# Quick Start Guide - Order Management System

## ⚡ 5-Minute Setup

### Prerequisites
- Node.js v14+
- PostgreSQL v12+
- npm

### Step 1: Install Dependencies (1 min)
```bash
npm install
```

### Step 2: Configure Database (2 min)

1. Create PostgreSQL database:
```bash
# Windows PowerShell
psql -U postgres -c "CREATE DATABASE order_management_db;"
```

2. Apply schema:
```bash
psql -U postgres -d order_management_db -f backend/config/schema.sql
```

### Step 3: Configure Environment (1 min)

Edit `.env` file:
```
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=order_management_db

JWT_SECRET=your_secret_key_min_32_chars_long_with_mixed_case_numbers
JWT_EXPIRATION=24h

BCRYPT_ROUNDS=10
```

### Step 4: Start Server (1 min)

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Or production mode:**
```bash
npm start
```

Server runs on: http://localhost:5000

## 🎯 Test the System

### In Browser
1. Go to http://localhost:5000/signup.html
2. Create account with:
   - Name: Your Name
   - Email: your@email.com
   - Password: Password123
3. After signup, you'll see dashboard
4. Try logging out and logging back in

### In Terminal (cURL)

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

## 📋 File Locations

| File | Purpose |
|------|---------|
| `server.js` | Main Express server |
| `backend/controllers/authController.js` | Login/signup logic |
| `backend/routes/authRoutes.js` | API endpoints |
| `middleware/authMiddleware.js` | JWT verification |
| `frontend/public/login.html` | Login page |
| `frontend/public/signup.html` | Registration page |
| `frontend/public/dashboard.html` | Protected dashboard |
| `frontend/public/js/auth.js` | Frontend utilities |
| `.env` | Configuration |

## 🔑 Key Features

✅ **JWT Authentication** - Secure token-based auth
✅ **Password Hashing** - Bcrypt with 10 rounds
✅ **Protected Routes** - Middleware to verify tokens
✅ **Form Validation** - Frontend and backend
✅ **Error Handling** - Global error middleware
✅ **Responsive UI** - Works on all devices
✅ **Session Management** - localStorage token storage

## ❓ Troubleshooting

**Can't connect to database?**
- Ensure PostgreSQL is running
- Check credentials in `.env`
- Verify database exists: `psql -l`

**Server won't start?**
- Check if port 5000 is in use: `netstat -ano | findstr :5000`
- Verify Node.js is installed: `node -v`

**Login not working?**
- Check browser console for errors (F12)
- Verify API is running: http://localhost:5000/health
- Check network requests in DevTools

**Token issues?**
- Clear localStorage: Open DevTools → Application → Storage → Clear All
- Login again to get new token

## 📚 Detailed Documentation

- **Full Setup Guide**: See `SETUP.md`
- **JWT Implementation Details**: See `JWT-AUTH.md`
- **Original README**: See `README.md`

## 🚀 Next Steps

1. ✅ Test authentication flow
2. Add order management API
3. Implement order routes
4. Add order dashboard UI
5. Deploy to production

## 💡 Tips

- Use `npm run dev` during development (auto-reloads on file changes)
- Test API endpoints with Postman for easier debugging
- Check `console.log()` in browser DevTools to see errors
- Use cURL commands in PowerShell for API testing

## 🔒 Security Notes

- Change `JWT_SECRET` before production
- Use HTTPS in production
- Set `NODE_ENV=production` before deployment
- Use environment variables for all secrets
- Regularly rotate JWT_SECRET

---

**Status**: ✅ Ready to use
**Last Updated**: November 11, 2025
