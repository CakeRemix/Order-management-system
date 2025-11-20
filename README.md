<div align="center">

# 🍔 Order Management System

### *Revolutionizing Campus Food Service Through Digital Innovation*

[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Academic-blue?style=flat)](#license)
[![Status](https://img.shields.io/badge/Status-Active%20Development-success?style=flat)]()

[Overview](#-overview) • [Features](#-features) • [Tech Stack](#-technology-stack) • [Getting Started](#-getting-started) • [Documentation](#-documentation) • [Team](#-team)

</div>

---

## 📋 Overview

The **GIU Order Management System** is a web-based application that streamlines food ordering on campus. It allows students and staff to place and schedule orders, reducing long waiting times during class breaks. Food-truck operators benefit from an intuitive interface to manage and update orders in real-time.

> **Academic Context:** Developed as part of the **Software Engineering (CSEN 303)** course, WS 2025/26.  
> **Methodology:** Agile Software Development with an evolving **SRS document** as the development backbone.

---

## ✨ Features

<table>
<tr>
<td width="50%">

### For Customers
- 🔐 **User Authentication** — Secure registration and login
- 📋 **Menu Browsing** — Explore food truck offerings
- 🛒 **Smart Cart** — Add items and customize orders
- ⏰ **Time Slot Selection** — Choose preferred pick-up times
- 📊 **Order Tracking** — Real-time status updates

</td>
<td width="50%">

### For Providers
- 📦 **Order Management** — View and update order statuses
- 🍕 **Menu Control** — Add, edit, and remove items
- 📈 **Inventory Tracking** — Monitor stock levels
- ⚡ **Real-Time Updates** — Instant order notifications
- 📱 **Intuitive Interface** — Streamlined workflow

</td>
</tr>
</table>

---

## 🛠 Technology Stack

<table>
<tr>
<td align="center" width="25%">
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg" width="48" height="48" alt="HTML5" />
<br><strong>HTML5</strong>
</td>
<td align="center" width="25%">
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original.svg" width="48" height="48" alt="CSS3" />
<br><strong>CSS3</strong>
</td>
<td align="center" width="25%">
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" width="48" height="48" alt="JavaScript" />
<br><strong>JavaScript</strong>
</td>
<td align="center" width="25%">
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" width="48" height="48" alt="Node.js" />
<br><strong>Node.js</strong>
</td>
</tr>
<tr>
<td align="center" width="25%">
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg" width="48" height="48" alt="PostgreSQL" />
<br><strong>PostgreSQL</strong>
</td>
<td align="center" width="25%">
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/git/git-original.svg" width="48" height="48" alt="Git" />
<br><strong>Git</strong>
</td>
<td align="center" width="25%">
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg" width="48" height="48" alt="Docker" />
<br><strong>Docker</strong>
</td>
<td align="center" width="25%">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" width="48" height="48" alt="GitHub" />
<br><strong>GitHub Actions</strong>
</td>
</tr>
</table>

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│              HTML5 • CSS3 • JavaScript • jQuery              │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST API
┌─────────────────────▼───────────────────────────────────────┐
│                        Backend Layer                         │
│                    Node.js RESTful API                       │
└─────────────────────┬───────────────────────────────────────┘
                      │ SQL Queries
┌─────────────────────▼───────────────────────────────────────┐
│                       Database Layer                         │
│              PostgreSQL (Relational Database)                │
└─────────────────────────────────────────────────────────────┘
```

**Infrastructure:**
- **Authentication:** Email/password authentication (OAuth integration planned)
- **Payment:** Offline transactions (gateway integration in roadmap)
- **Hosting:** TBD — Currently local deployment, cloud migration planned

---

## 📁 Repository Structure

```
Order-management-system/
│
├── 📂 docs/                    # Documentation (SRS, diagrams, etc.)
│   ├── SRS.pdf
│   └── architecture/
│
├── 📂 frontend/                # Frontend application
│   ├── public/
│   │   ├── dashboard.html
│   │   ├── login.html
│   │   └── css/
│   └── src/
│       ├── contexts/
│       ├── pages/
│       └── utils/
│
├── 📂 backend/                 # Backend API server
│   ├── config/
│   ├── controllers/
│   ├── models/
│   └── routes/
│
├── 📂 middleware/              # Express middleware
│   ├── authMiddleware.js
│   └── errorHandler.js
│
├── 📄 package.json             # Project dependencies
├── 📄 server.js                # Application entry point
└── 📄 README.md                # Project overview
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** `>= 18.x` — [Download](https://nodejs.org/)
- **PostgreSQL** `>= 14.x` — [Download](https://www.postgresql.org/)
- **Git** — [Download](https://git-scm.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/CakeRemix/Order-management-system.git

# Navigate to project directory
cd Order-management-system

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Configure database connection in .env
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=your_username
# DB_PASSWORD=your_password
# DB_NAME=order_management

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

### Development Workflow

```bash
# Start backend server
npm run server

# Start frontend (if separate)
npm run client

# Run tests
npm test

# Run linter
npm run lint

# Build for production
npm run build
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [📄 SRS Document](docs/SRS.pdf) | Complete Software Requirements Specification |
| 🎨 UML Diagrams | Architecture and design diagrams in `/docs` |
| 🔧 API Reference | RESTful API endpoint documentation (coming soon) |
| 🧪 Test Coverage | Unit and integration test reports (coming soon) |

---

## 👥 Team

<div align="center">

### **Team Sleepers** 🌙

</div>

<table>
<tr>
<td align="center" width="25%">
<br><strong>Hassan Yousef</strong><br>
<sub>Full Stack Developer</sub>
</td>
<td align="center" width="25%">
<br><strong>Sara Adel</strong><br>
<sub>Full Stack Developer</sub>
</td>
<td align="center" width="25%">
<br><strong>Hana Yasser</strong><br>
<sub>Full Stack Developer</sub>
</td>
<td align="center" width="25%">
<br><strong>Mohamed Walid</strong><br>
<sub>Full Stack Developer</sub>
</td>
</tr>
<tr>
<td align="center" width="25%">
<br><strong>Omar Hani</strong><br>
<sub>Full Stack Developer</sub>
</td>
<td align="center" width="25%">
<br><strong>Abdelhamid ElSharnouby</strong><br>
<sub>Full Stack Developer</sub>
</td>
<td align="center" width="25%">
<br><strong>Hanin Mohamed</strong><br>
<sub>Full Stack Developer</sub>
</td>
<td align="center" width="25%">
<br><strong>Khaled Khaled</strong><br>
<sub>Full Stack Developer</sub>
</td>
</tr>
</table>

---

## 🔮 Roadmap

### Phase 1: Core Functionality ✅
- [x] User authentication system
- [x] Basic order management
- [x] Menu browsing and cart

### Phase 2: Enhancement (In Progress) 🚧
- [ ] Real-time order tracking
- [ ] Inventory management
- [ ] Advanced analytics dashboard

### Phase 3: Future Scope 🎯
- 🔐 Integration with university authentication system
- 💳 Payment gateway support (Stripe/PayPal)
- 📱 Push notifications for order updates
- 📲 Native mobile application (iOS/Android)
- ⭐ Rating and review system
- 📊 Advanced business intelligence dashboard

---

## 📄 License

```
Copyright © 2025 Team Sleepers - German International University

This project is submitted for academic evaluation under the 
Software Engineering (CSEN 303) course. 

Do not reuse without permission.
```

---

<div align="center">

### ⭐ If you found this project interesting, please consider giving it a star!

**Made with ❤️ by Team Sleepers**

*German International University • Software Engineering • WS 2025/26*

</div>
