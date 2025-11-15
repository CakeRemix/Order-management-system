# GIU Food Truck Order Management System

## Overview
The **GIU Food Truck Order Management System** is a comprehensive web-based platform that revolutionizes campus dining by eliminating waiting lines and streamlining the ordering process.

Students and staff can browse menus from multiple food trucks, place orders with scheduled pickup times, and track order status in real-time. Food truck operators manage incoming orders, update menu items, and control their operational status through an intuitive vendor dashboard.

This project is developed as part of the **Software Engineering (CSEN 303)** course, WS 2025/26, following an **Agile Software Development** methodology with an evolving SRS document.

---

## ✨ Features

### For Customers
- 🔐 Secure registration and login (GIU email only)
- 🍔 Browse food trucks and their menus
- 🛒 Add items to cart with scheduling
- 📍 View truck locations and status (open/busy/closed)
- 📦 Track order status (received → preparing → ready)
- ⏰ Schedule pickup times
- 📱 Responsive web design for mobile/desktop

### For Vendors
- 📊 Vendor dashboard with order management
- 🍕 Add/edit/remove menu items
- ✅ Update order statuses
- 🚫 Activate "busy mode" to pause orders
- 📈 View order statistics and history

### For Administrators
- 👥 User management
- 🚚 Add/remove food trucks
- 📊 Platform-wide statistics

---

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL 13+
- **Authentication:** JWT (JSON Web Tokens) + bcrypt
- **API:** RESTful API
- **Development:** Nodemon, dotenv

---

## 📁 Project Structure

```
Order-management-system/
├── backend/
│   ├── config/
│   │   └── db.js              # Database connection pool
│   ├── controllers/
│   │   └── authController.js   # Authentication logic
│   ├── models/
│   │   └── userModel.js        # User data model
│   └── routes/
│       └── authRoutes.js       # API routes
├── database/
│   ├── schema.sql              # Complete database schema
│   ├── setup.ps1               # Automated setup script
│   ├── utilities.sql           # Maintenance queries
│   ├── api_queries.sql         # Query examples
│   ├── test-connection.js      # DB connection tester
│   ├── README.md               # Database documentation
│   ├── QUICKSTART.md           # Quick setup guide
│   ├── migrations/             # Future migrations
│   └── seeds/                  # Sample data
│       ├── seed_all.sql
│       ├── 01_seed_users.sql
│       ├── 02_seed_food_trucks.sql
│       ├── 03_seed_menu_items.sql
│       └── 04_seed_orders.sql
├── docs/
│   └── SRS.tex                 # Software Requirements Spec
├── frontend/
│   ├── public/
│   │   ├── css/
│   │   ├── js/
│   │   ├── index.html
│   │   ├── login.html
│   │   ├── signup.html
│   │   ├── dashboard.html
│   │   ├── restaurant.html
│   │   └── track.html
│   └── src/
├── middleware/
│   ├── authMiddleware.js       # JWT verification
│   ├── errorHandler.js         # Error handling
│   └── index.js
├── .env.example                # Environment template
├── package.json
├── server.js                   # Main server file
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 18.x ([Download](https://nodejs.org/))
- **PostgreSQL** >= 13 ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))

### Installation

1. **Clone the repository**
```powershell
git clone https://github.com/CakeRemix/Order-management-system.git
cd Order-management-system
```

2. **Install dependencies**
```powershell
npm install
```

3. **Configure environment**
```powershell
# Copy the example environment file
Copy-Item .env.example .env

# Edit .env with your database credentials
notepad .env
```

Update these required fields:
- `DB_PASSWORD` - Your PostgreSQL password
- `JWT_SECRET` - Random 32+ character string

4. **Setup database**
```powershell
cd database
.\setup.ps1
```

Choose "yes" when prompted to seed sample data.

5. **Test database connection**
```powershell
# From project root
node database/test-connection.js
```

6. **Start the server**
```powershell
npm start
# or for development with auto-reload:
npm run dev
```

7. **Open in browser**
```
http://localhost:5000
```

---

## 📊 Database

### Schema Overview
- **5 Core Tables:** users, food_trucks, menu_items, orders, order_items
- **3 Custom ENUMs:** user_role, order_status, truck_status
- **3 Views:** active_orders_view, menu_items_with_truck, vendor_stats
- **Triggers:** Auto-update timestamps, generate order numbers
- **Functions:** Order calculations, truck availability checks

### Quick Database Commands

```powershell
# Health check
psql -U postgres -d giu_food_truck_db -f database/utilities.sql

# View tables
psql -U postgres -d giu_food_truck_db -c "\dt"

# Reset database
cd database
.\setup.ps1  # Choose "yes" to drop and recreate
```

**Full Database Documentation:** [database/README.md](database/README.md)  
**Quick Setup Guide:** [database/QUICKSTART.md](database/QUICKSTART.md)

---

## 🧪 Test Accounts

All test accounts use password: **`Test123!`**

### Admin
- admin@giu-uni.de

### Vendors (one per truck)
- demeshq.vendor@giu-uni.de
- container.vendor@giu-uni.de
- essens.vendor@giu-uni.de
- ftarwasha.vendor@giu-uni.de
- loaded.vendor@giu-uni.de

### Students (Team Members)
- hassan.yousef@student.giu-uni.de
- sara.adel@student.giu-uni.de
- hana.yasser@student.giu-uni.de
- khaled.khaled@student.giu-uni.de
- (and more...)

---

## 📖 Documentation
- **[SRS Document](docs/SRS.tex)** - Complete requirements specification
- **[Database Docs](database/README.md)** - Full database documentation
- **[Quick Start](database/QUICKSTART.md)** - 5-minute setup guide
- **[API Queries](database/api_queries.sql)** - Example queries for development

---

## 🏗️ API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Health Check
- `GET /health` - Server and database status

*More endpoints coming soon: orders, trucks, menu items*

---

## 📱 Features Roadmap

### Current Sprint ✅
- [x] Database schema and setup
- [x] User authentication (signup/login)
- [x] Basic frontend pages
- [x] Seed data with 5 food trucks

### Next Sprint 🚧
- [ ] Order creation API
- [ ] Menu browsing functionality
- [ ] Order status tracking
- [ ] Vendor dashboard

### Future Enhancements 📋
- [ ] Payment integration
- [ ] Push notifications
- [ ] Mobile app (React Native)
- [ ] University SSO integration
- [ ] Rating and review system
- [ ] Advanced analytics
---

## 🧪 Development Workflow

### Running in Development Mode
```powershell
# Terminal 1: Start backend with auto-reload
npm run dev

# Terminal 2 (optional): Watch database logs
psql -U postgres -d giu_food_truck_db
```

### Testing API Endpoints
```powershell
# Using curl
curl http://localhost:5000/health

# Or use Postman, Thunder Client (VS Code), or similar
```

### Common Issues & Solutions

**Database connection fails:**
```powershell
# Check PostgreSQL is running
Get-Service postgresql*

# Test connection
node database/test-connection.js
```

**Port 5000 already in use:**
- Change `PORT` in `.env` file

**bcrypt installation issues:**
```powershell
npm install --build-from-source bcrypt
```

---

## 👥 Team: Sleepers

| Name | Student ID | Email |
|------|-----------|-------|
| Hassan Yousef | 13006567 | hassan.yousef@student.giu-uni.de |
| Sara Adel | 14003723 | sara.adel@student.giu-uni.de |
| Hana Yasser | 13003628 | hana.yasser@student.giu-uni.de |
| Mohamed Walid | 13006513 | mohamed.walid@student.giu-uni.de |
| Omar Hani | 13007515 | omar.hani@student.giu-uni.de |
| Abdelhamid ElSharnouby | 13006294 | abdelhamid.el@student.giu-uni.de |
| Hanin Mohamed | 13007010 | hanin.mohamed@student.giu-uni.de |
| Khaled Khaled | 14001048 | khaled.khaled@student.giu-uni.de |

---

## 🎓 Course Information

- **Course:** Software Engineering (CSEN 303)
- **Semester:** Winter Semester 2025/26
- **University:** German International University (GIU)
- **Supervisors:** 
  - Dr. Iman Awaad
  - Eng. Amir Haytham
  - Eng. Ahmad Sherif

---

## 📝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

---

## 📄 License

This project is submitted for academic evaluation under the Software Engineering course at GIU.  
**Do not reuse without permission from the team and instructors.**

---

## 🙏 Acknowledgments

- Dr. Iman Awaad for project guidance
- Engineering team for technical support
- GIU community for feedback and testing

---

## 📞 Support & Contact

For questions or issues:
- Open an issue on GitHub
- Contact team members via university email
- Check documentation in `/docs` and `/database`

---

**Last Updated:** November 13, 2025  
**Version:** 1.0.0  
**Status:** 🚧 Active Development
