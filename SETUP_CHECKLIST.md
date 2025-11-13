# 🚀 Complete Setup Checklist

Use this checklist to ensure everything is set up correctly.

---

## ✅ Pre-Setup Checklist

### Software Installation
- [ ] Node.js 18+ installed
  - Test: `node --version`
- [ ] PostgreSQL 13+ installed
  - Test: `psql --version`
- [ ] Git installed
  - Test: `git --version`
- [ ] Code editor (VS Code recommended)

### PostgreSQL Service
- [ ] PostgreSQL service is running
  - Check: Windows Services → postgresql-x64-XX
  - Or run: `Get-Service postgresql*`
- [ ] Know your postgres user password

---

## ✅ Repository Setup

- [ ] Clone repository
  ```powershell
  git clone https://github.com/CakeRemix/Order-management-system.git
  cd Order-management-system
  ```

- [ ] Install Node.js dependencies
  ```powershell
  npm install
  ```

- [ ] Verify package.json scripts exist
  - [ ] `npm start`
  - [ ] `npm run dev`

---

## ✅ Environment Configuration

- [ ] Copy `.env.example` to `.env`
  ```powershell
  Copy-Item .env.example .env
  ```

- [ ] Edit `.env` file with your values:
  - [ ] `DB_PASSWORD` - Your PostgreSQL password
  - [ ] `JWT_SECRET` - Random 32+ character string
  - [ ] `DB_NAME` - giu_food_truck_db (or custom)
  - [ ] `PORT` - 5000 (or custom)

- [ ] Verify all required variables are set:
  ```
  DB_HOST=localhost
  DB_PORT=5432
  DB_USER=postgres
  DB_PASSWORD=your_password_here
  DB_NAME=giu_food_truck_db
  JWT_SECRET=your_secret_key
  JWT_EXPIRATION=24h
  BCRYPT_ROUNDS=10
  PORT=5000
  ```

---

## ✅ Database Setup

### Option A: Automated Setup (Recommended)

- [ ] Navigate to database directory
  ```powershell
  cd database
  ```

- [ ] Run setup script
  ```powershell
  .\setup.ps1
  ```

- [ ] When prompted:
  - [ ] Enter PostgreSQL password
  - [ ] Choose "yes" to seed sample data

- [ ] Verify success message appears

### Option B: Manual Setup

- [ ] Create database
  ```powershell
  psql -U postgres -c "CREATE DATABASE giu_food_truck_db;"
  ```

- [ ] Run schema
  ```powershell
  psql -U postgres -d giu_food_truck_db -f schema.sql
  ```

- [ ] Run seeds (optional)
  ```powershell
  cd seeds
  psql -U postgres -d giu_food_truck_db -f seed_all.sql
  ```

---

## ✅ Database Verification

- [ ] Test database connection
  ```powershell
  # From project root
  node database/test-connection.js
  ```

- [ ] Verify all tests pass:
  - [ ] ✓ Successfully connected to PostgreSQL
  - [ ] ✓ Connected to database: giu_food_truck_db
  - [ ] ✓ All tables exist (users, food_trucks, menu_items, orders, order_items)
  - [ ] ✓ Database contains data (if seeded)
  - [ ] ✓ Sample query executed successfully

- [ ] Check record counts:
  ```sql
  psql -U postgres -d giu_food_truck_db -c "
    SELECT 
      (SELECT COUNT(*) FROM users) as users,
      (SELECT COUNT(*) FROM food_trucks) as trucks,
      (SELECT COUNT(*) FROM menu_items) as items,
      (SELECT COUNT(*) FROM orders) as orders;
  "
  ```

  Expected (if seeded):
  - [ ] Users: 23
  - [ ] Food Trucks: 5
  - [ ] Menu Items: 47
  - [ ] Orders: 10

---

## ✅ Server Setup

- [ ] Return to project root
  ```powershell
  cd ..
  ```

- [ ] Start the server
  ```powershell
  npm start
  ```

- [ ] Verify server starts without errors:
  - [ ] See: "🚀 Server running on port 5000"
  - [ ] See: "✅ Connected to PostgreSQL database"

- [ ] Test health endpoint
  ```powershell
  # In a new terminal
  curl http://localhost:5000/health
  ```

  Expected response:
  ```json
  {
    "status": "healthy",
    "database": "connected",
    "timestamp": "2025-11-13T..."
  }
  ```

---

## ✅ Frontend Verification

- [ ] Open browser to http://localhost:5000
- [ ] Verify homepage loads
- [ ] Check pages exist:
  - [ ] Login page: http://localhost:5000/login.html
  - [ ] Signup page: http://localhost:5000/signup.html
  - [ ] Dashboard: http://localhost:5000/dashboard.html

---

## ✅ Test Authentication

### Signup Test
- [ ] Go to signup page
- [ ] Try registering with:
  - Email: test@student.giu-uni.de
  - Password: Test123!
  - Name: Test User
- [ ] Verify account creation

### Login Test
- [ ] Go to login page
- [ ] Login with existing account:
  - Email: hassan.yousef@student.giu-uni.de
  - Password: Test123!
- [ ] Verify successful login
- [ ] Check JWT token in localStorage (DevTools → Application → Local Storage)

---

## ✅ Test Sample Data

### View Food Trucks
- [ ] Query database:
  ```sql
  SELECT name, status, location FROM food_trucks;
  ```
- [ ] Verify 5 trucks appear

### View Menu Items
- [ ] Query database:
  ```sql
  SELECT ft.name AS truck, mi.name AS item, mi.price 
  FROM menu_items mi 
  JOIN food_trucks ft ON mi.food_truck_id = ft.id 
  LIMIT 10;
  ```
- [ ] Verify items with prices appear

### View Orders
- [ ] Query database:
  ```sql
  SELECT * FROM active_orders_view LIMIT 5;
  ```
- [ ] Verify orders with customer names appear

---

## ✅ Development Tools Setup (Optional)

### VS Code Extensions
- [ ] PostgreSQL (ms-ossdata.vscode-postgresql)
- [ ] REST Client (humao.rest-client)
- [ ] ESLint (dbaeumer.vscode-eslint)
- [ ] Prettier (esbenp.prettier-vscode)

### Database GUI Tools
- [ ] pgAdmin 4 (installed with PostgreSQL)
  - Connect to: localhost:5432
  - Database: giu_food_truck_db

- [ ] Or install alternative:
  - TablePlus: `winget install TablePlus.TablePlus`
  - DBeaver: `winget install dbeaver.dbeaver`

### API Testing Tools
- [ ] Postman installed
- [ ] Or Thunder Client (VS Code extension)
- [ ] Or use curl in PowerShell

---

## ✅ Documentation Review

- [ ] Read main README.md
- [ ] Review database/README.md
- [ ] Check database/QUICKSTART.md
- [ ] Look at database/api_queries.sql for examples
- [ ] Review docs/SRS.tex (optional)

---

## ✅ Troubleshooting Common Issues

### If "psql: command not found"
- [ ] Add PostgreSQL to PATH:
  ```powershell
  $env:Path += ";C:\Program Files\PostgreSQL\16\bin"
  ```

### If "Connection refused"
- [ ] Check PostgreSQL service is running
- [ ] Verify port 5432 is not blocked

### If "Password authentication failed"
- [ ] Double-check password in .env
- [ ] Try connecting manually: `psql -U postgres`

### If "Port 5000 already in use"
- [ ] Change PORT in .env to 5001 or higher
- [ ] Or stop other application using port 5000

### If "Database already exists"
- [ ] Run setup.ps1 again
- [ ] Choose "yes" to drop and recreate

### If bcrypt installation fails
- [ ] Install build tools:
  ```powershell
  npm install --global windows-build-tools
  npm install --build-from-source bcrypt
  ```

---

## ✅ Final Verification

Run this complete test sequence:

```powershell
# 1. Test database connection
node database/test-connection.js

# 2. Start server
npm start

# 3. In new terminal - Test health endpoint
curl http://localhost:5000/health

# 4. Open browser
start http://localhost:5000

# 5. Test signup
# Go to /signup.html and create account

# 6. Test login  
# Go to /login.html and sign in

# 7. View database
psql -U postgres -d giu_food_truck_db
\dt  # List tables
SELECT * FROM users LIMIT 5;
\q  # Quit
```

All steps should complete without errors.

---

## ✅ You're Ready! 🎉

If all checkboxes are checked, your development environment is fully set up!

### Next Steps:
1. Start developing features
2. Review API endpoints in backend/routes
3. Add new controllers in backend/controllers
4. Create models in backend/models
5. Test with sample data

### Quick Reference Commands:
```powershell
# Start server
npm start

# Development mode (auto-reload)
npm run dev

# Test database
node database/test-connection.js

# Connect to database
psql -U postgres -d giu_food_truck_db

# View logs
# (Server logs appear in terminal where npm start was run)

# Reset database
cd database
.\setup.ps1
```

---

## 📝 Setup Notes

**Completed:** ____________________  
**By:** ____________________  
**Issues Encountered:** ____________________  
**Time Taken:** ____________________

---

**Need Help?**
- Check database/QUICKSTART.md
- Review main README.md
- Contact team members
- Review error logs

**Happy Coding! 💻🚀**
