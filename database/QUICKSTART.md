# Database Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Install PostgreSQL
If you don't have PostgreSQL installed:
- Download from: https://www.postgresql.org/download/windows/
- Run installer and remember the password you set for the `postgres` user

### Step 2: Configure Environment
```powershell
# Copy the example environment file
Copy-Item .env.example .env

# Edit .env with your database password
notepad .env
```

Update these required fields in `.env`:
- `DB_PASSWORD` - Your PostgreSQL password
- `JWT_SECRET` - Any random 32+ character string

### Step 3: Run Database Setup
```powershell
# Navigate to database directory
cd database

# Run the automated setup script
.\setup.ps1
```

The script will:
1. ✅ Create the database
2. ✅ Create all tables, indexes, and relationships
3. ✅ Set up triggers and functions
4. ✅ Optionally seed with test data

### Step 4: Verify Installation
```powershell
# Test database connection
psql -U postgres -d giu_food_truck_db -c "SELECT COUNT(*) FROM users;"
```

You should see user count if everything is set up correctly.

---

## 📊 What Gets Created

### Tables (5)
- ✅ `users` - All system users
- ✅ `food_trucks` - Food truck information
- ✅ `menu_items` - Menu items for each truck
- ✅ `orders` - Customer orders
- ✅ `order_items` - Items in each order

### Sample Data (if seeded)
- 👥 23 users (2 admins, 5 vendors, 16 customers)
- 🚚 5 food trucks
- 🍔 47 menu items
- 📦 10 sample orders

### Test Accounts
All test accounts use password: `Test123!`

**Admin:**
- admin@giu-uni.de

**Vendors:**
- demeshq.vendor@giu-uni.de
- container.vendor@giu-uni.de
- essens.vendor@giu-uni.de
- ftarwasha.vendor@giu-uni.de
- loaded.vendor@giu-uni.de

**Students (Team Members):**
- hassan.yousef@student.giu-uni.de
- sara.adel@student.giu-uni.de
- hana.yasser@student.giu-uni.de
- khaled.khaled@student.giu-uni.de
- (and more...)

---

## 🧪 Testing the Database

### Test Queries
```sql
-- Check all users
SELECT id, name, email, role FROM users;

-- Check food trucks and their status
SELECT name, status, is_busy, location FROM food_trucks;

-- Check menu items
SELECT ft.name AS truck, mi.name AS item, mi.price 
FROM menu_items mi 
JOIN food_trucks ft ON mi.food_truck_id = ft.id;

-- Check active orders
SELECT * FROM active_orders_view;
```

### Using psql
```powershell
# Connect to database
psql -U postgres -d giu_food_truck_db

# Run queries
\dt  # List all tables
\d users  # Describe users table
\dv  # List all views
SELECT * FROM vendor_stats;  # View vendor statistics
\q  # Quit
```

---

## 🛠️ Common Commands

### Restart from Scratch
```powershell
# Drop and recreate everything
cd database
.\setup.ps1
# Choose "yes" when asked to drop existing database
```

### Backup Database
```powershell
# Create backup
pg_dump -U postgres -d giu_food_truck_db -F c -f backup.dump

# Restore from backup
pg_restore -U postgres -d giu_food_truck_db -c backup.dump
```

### Connect from Node.js
The `backend/config/db.js` is already configured. Just run:
```powershell
npm install
npm start
```

---

## 🔍 Troubleshooting

### "psql: command not found"
Add PostgreSQL to your PATH:
```powershell
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"
```

### "Connection refused"
- Ensure PostgreSQL service is running
- Check Windows Services (services.msc) for "postgresql-x64-16"

### "Password authentication failed"
- Double-check password in `.env` file
- Try resetting PostgreSQL password

### "Database already exists"
Run setup script and choose "yes" to drop and recreate

---

## 📖 Next Steps

1. ✅ Database is set up
2. ▶️ Start the backend server: `npm start`
3. 🌐 Open browser: http://localhost:5000
4. 🔐 Test login with any test account

---

## 💡 Pro Tips

### VS Code PostgreSQL Extension
Install "PostgreSQL" extension in VS Code for GUI database management.

### pgAdmin 4
Use pgAdmin 4 (installed with PostgreSQL) for visual database management:
- Open pgAdmin
- Add server: localhost:5432
- Connect with postgres user

### Database Viewer
```powershell
# Install table-plus or dbeaver for better visualization
winget install TablePlus.TablePlus
```

---

## 📚 Additional Resources

- **Full Documentation**: See `database/README.md`
- **Schema File**: `database/schema.sql`
- **Seed Data**: `database/seeds/`
- **SRS Document**: `docs/SRS.tex`

---

**Need Help?** 
Check the main README.md or contact the Team Sleepers! 🎯
