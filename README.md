# 💎 DMD JEWELLERY — Full-Stack PWA & Admin Management System

> **Timeless Elegance. Beautifully Crafted.**

A production-ready, full-stack Progressive Web App (PWA) and luxury catalogue application built for **DMD JEWELLERY**. 

This system consists of two seamlessly connected modules:
1. **Customer-Facing PWA Website** — A luxury Indian jewellery catalogue featuring Hallmark Gold, Diamond, and Silver designs. Fully responsive, offline-capable, and installable on Android, iPhone, and Desktop directly from the browser.
2. **Secure Admin Panel (`/admin`)** — Complete administrative control over products, multi-image uploads, prices, gold purity, categories, gold rates, customer enquiries, and shop settings.

---

## 🌟 Architectural Overview & PWA Capabilities

- **Installable PWA**: Configured with Web App Manifest (`manifest.json`), service worker (`sw.js`), logo icons (`192x192`, `512x512`, `apple-touch-icon`), and non-intrusive install prompt.
- **Offline Browsing & Fallback**: App shell & static assets pre-cached by Service Worker. Displays a branded gold/black offline page (`/offline.html`) when network connectivity is lost.
- **Dynamic Database Architecture**: Products, prices, gold rates, categories, and shop contact information come dynamically from the database. Zero fake hardcoded data.
- **Dual Database Adapter (SQLite / MySQL)**:
  - **Local Pure-JS File DB**: Zero-configuration, zero native compiler setup required for local development.
  - **Production MySQL**: Production-grade database compatibility with schema SQL (`database/schema.sql`).
- **Amazon-Style Product Showcase**: Multi-image gallery viewer, gold purity badges, price in ₹, detailed specs table, and direct contact buttons (**Call Now**, **WhatsApp**, **Email**, **Send Enquiry Form**).
- **SEO & Search Console Ready**: Includes dynamic `sitemap.xml`, `robots.txt`, Schema.org structured data, Open Graph meta tags, and clean URLs.

---

## 📂 Project Directory Structure

```
DMD/
├── backend/
│   ├── config/
│   │   └── db.js                 # Unified Database Adapter (SQLite & MySQL)
│   ├── controllers/
│   │   ├── authController.js     # Admin JWT Login, Logout, Password Change
│   │   ├── productController.js  # Product CRUD, Multi-Image Upload, Bulk Clear
│   │   ├── categoryController.js # Category CRUD
│   │   ├── goldRateController.js # Daily Gold Rate Update & Live Sync
│   │   ├── enquiryController.js  # Customer Enquiry Submissions & Management
│   │   └── settingController.js  # Shop Info, Phone, WhatsApp, Maps, Social Links
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Protection Middleware
│   │   └── uploadMiddleware.js   # Multer Multi-Image Upload & Sanitization
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── goldRateRoutes.js
│   │   ├── enquiryRoutes.js
│   │   └── settingRoutes.js
│   ├── scripts/
│   │   └── create-admin.js       # Secure Admin Seeding Script
│   └── server.js                 # Express Application Entry Point & SEO routes
├── database/
│   ├── schema.sql                # Production MySQL Database Schema
│   └── schema.sqlite.sql         # SQLite Database Schema
├── frontend/
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── manifest.json         # PWA Web App Manifest
│   │   ├── offline.html          # Branded Offline Fallback Page
│   │   ├── robots.txt
│   │   ├── sw.js                 # Production Service Worker
│   │   ├── dmd_logo.jpg          # Official Brand Logo Asset
│   │   └── icons/
│   │       ├── icon-192.png      # 192x192 PWA Icon
│   │       ├── icon-512.png      # 512x512 PWA Icon
│   │       ├── apple-touch-icon.png # 180x180 iOS Icon
│   │       └── favicon-32.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation Bar with WhatsApp CTA
│   │   │   ├── Footer.jsx        # Footer with Quick Links & Store Details
│   │   │   ├── ProductCard.jsx   # Luxury Product Card
│   │   │   ├── GoldRateCard.jsx  # Daily 24K, 22K, 18K Gold Rate Widget
│   │   │   ├── FloatingContactButtons.jsx # Sticky Call & WhatsApp Buttons
│   │   │   ├── InstallPWAPrompt.jsx # PWA Install Prompt Banner
│   │   │   ├── PWAUpdateToast.jsx # PWA Auto-Update Toast
│   │   │   ├── EmptyState.jsx    # Mandatory Empty State Component
│   │   │   ├── AdminSidebar.jsx  # Admin Navigation Drawer
│   │   │   └── ImageUploader.jsx # Drag-and-Drop Image Uploader
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Authentication State Provider
│   │   │   └── SettingsContext.jsx# Dynamic Shop Settings Provider
│   │   ├── pages/                # Customer & Admin View Pages
│   │   ├── serviceWorkerRegistration.js # PWA SW Lifecycle Handler
│   │   ├── services/
│   │   │   └── api.js            # Axios API Client Service
│   │   ├── App.jsx               # Application Router & Layout Shells
│   │   ├── index.css             # Tailwind & PWA Animations
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
├── dmd_logo.jpg                  # Official Branding Logo
├── .env.example                  # Environment Configuration Template
├── .gitignore                    # Production Git Exclusion Rules
├── README.md
└── package.json                  # Root Workspace Package Configuration
```

---

## 🛠️ Development & Local Run

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Environment Configuration
Create a `.env` file in the project root (copied from `.env.example`):
```env
PORT=5000
NODE_ENV=development
DB_TYPE=sqlite
JWT_SECRET=your_secure_random_jwt_secret_key
ADMIN_EMAIL=admin@dmdjewellery.com
```

### 3. Run Locally
Run backend server and frontend development server concurrently:
```bash
npm run dev
```
- **Customer Website**: `http://localhost:3000`
- **Admin Panel**: `http://localhost:3000/admin`
- **Backend API**: `http://localhost:5000/api`

---

## 🚀 Production Build & Deployment

### Production Build Command
Compile frontend assets into `frontend/dist`:
```bash
npm run build
```

### Production Start Command
Start Express server serving production static bundle & API:
```bash
npm start
```

### Single Full-Stack Cloud Host (Render / Railway / VPS)
1. Set Build Command: `npm run build`
2. Set Start Command: `npm start`
3. Set Environment Variable: `NODE_ENV=production`

### Decoupled Deployment (Vercel Frontend + Render Backend)
- **Frontend (Vercel)**: Build Command `npm run build --prefix frontend`, Output `frontend/dist`. Set `VITE_API_URL=https://your-backend.onrender.com/api`.
- **Backend (Render)**: Start Command `npm start`.

---

## 🔐 Initial Admin Credentials

Default Admin created via seed script (`npm run create-admin`):
- **Admin URL**: `http://localhost:5000/admin` *(or `/admin` on live URL)*
- **Email**: `admin@dmdjewellery.com`
- **Password**: `admin123456`

*(Change password after first login via Admin Panel ➔ Change Password).*

---

## 🔒 Security Guidelines

- `.env` files, JWT secrets, database credentials, local database files (`database/*.json`, `*.sqlite`), and local uploaded media (`uploads/`) are excluded from Git repository via `.gitignore`.
- Service Worker bypasses `/api/*` and `/admin/*` routes to ensure private authentication tokens and admin session data are never cached on public devices.

---

## 📄 License

This software is crafted for **DMD JEWELLERY**. All rights reserved.
