# 💎 DMD JEWELLERY — Full-Stack Web Application & Secure Admin Panel

A production-ready, modern, responsive full-stack website for **DMD JEWELLERY**. 

This system consists of two seamlessly connected modules:
1. **Customer-Facing Catalogue Website** — A luxury Indian jewellery catalogue featuring Hallmark Gold, Diamond, and Silver designs. Designed for customer engagement via **Call**, **WhatsApp**, **Email**, **Enquiry Form**, and **Google Maps Directions** (no shopping cart/checkout required).
2. **Secure Admin Panel (`/admin`)** — Complete administrative control over products, multi-image uploads, prices, gold purity, categories, gold rates, customer enquiries, and shop settings.

---

## 🌟 Key Architectural Features

- **Strict Zero-Product Initial State**: On fresh installation, the database starts with **ZERO products**. The customer website automatically displays an elegant empty state:
  > **"OUR COLLECTION IS COMING SOON"**  
  > *"New jewellery collections will be added soon. Please check back for our latest designs."*  
  > Buttons: **[ CONTACT US ]** **[ WHATSAPP US ]**
- **100% Dynamic Catalogue**: Products, images, gold rates, categories, and shop contact information come dynamically from the database.
- **Dual Database Support**: 
  - **SQLite / Local Pure-JS Database Engine**: Zero-configuration, zero native C++ compiler setup required out of the box.
  - **MySQL Support**: Production-grade database compatibility with complete schema SQL (`database/schema.sql`).
- **Amazon-Style Product Details**: Multi-image viewer gallery with thumbnail selector, gold purity & weight badges, price in ₹, detailed specifications table, and direct contact buttons (**Call Now**, **WhatsApp**, **Email**, **Send Enquiry Form**).
- **SEO & Google Search Console Ready**: Includes dynamic `sitemap.xml`, `robots.txt`, Schema.org structured data, Open Graph meta tags, and clean URLs.

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Installation
Clone or navigate to the project root directory:
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Create Admin Account
Execute the secure admin initialization command:
```bash
npm run create-admin
```
Follow the interactive prompts or supply environment variables to configure your admin email and password.

### 4. Run Locally
Run both backend server and frontend development server concurrently:
```bash
npm run dev
```
- **Customer Website**: `http://localhost:3000`
- **Admin Panel**: `http://localhost:3000/admin`
- **Backend API**: `http://localhost:5000/api`

---

## 🔐 Initial Admin Credentials

Default Admin created via seed script:
- **Admin URL**: `http://localhost:3000/admin`
- **Email**: `admin@dmdjewellery.com`
- **Password**: `admin123456`

*(Note: Change password after first login via Admin Panel -> Change Password).*

---

## 🛠️ Configuration & Environment Variables (`.env`)

Create a `.env` file in the project root (see `.env.example`):

```env
# Server Settings
PORT=5000
NODE_ENV=development

# Database Configuration
# Set DB_TYPE to 'sqlite' for local run or 'mysql' for production MySQL database
DB_TYPE=sqlite
DB_FILE=./database/dmd_jewellery.sqlite

# MySQL Database Settings (when DB_TYPE=mysql)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=dmd_jewellery
DB_USER=root
DB_PASSWORD=your_mysql_password

# Authentication
JWT_SECRET=dmd_jewellery_jwt_secret_key_change_in_production_2026

# Admin Configuration
ADMIN_EMAIL=admin@dmdjewellery.com

# Optional Cloud Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 📂 Project Directory Structure

```
DMD/
├── backend/
│   ├── config/
│   │   └── db.js                 # Unified Database Adapter (SQLite & MySQL)
│   ├── controllers/
│   │   ├── authController.js     # Admin JWT Login, Logout, Password Change
│   │   ├── productController.js  # Product CRUD, Multi-Image Upload, Filters, Search
│   │   ├── categoryController.js # Category CRUD
│   │   ├── goldRateController.js # Daily Gold Rate Update
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
│   │   └── create-admin.js       # Admin Seeding Script
│   └── server.js                 # Express Application Entry Point & SEO routes
├── database/
│   ├── schema.sql                # Production MySQL Database Schema
│   └── schema.sqlite.sql         # SQLite Database Schema
├── frontend/
│   ├── public/
│   │   ├── dmd_logo.jpg          # Official Brand Logo Asset
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Responsive Navigation Bar with WhatsApp CTA
│   │   │   ├── Footer.jsx        # Footer with Quick Links & Store Details
│   │   │   ├── ProductCard.jsx   # Luxury Amazon-Style Product Card
│   │   │   ├── GoldRateCard.jsx  # Daily 24K, 22K, 18K Gold Rate Widget
│   │   │   ├── FloatingContactButtons.jsx # Sticky Call & WhatsApp Buttons
│   │   │   ├── EmptyState.jsx    # Mandatory "OUR COLLECTION IS COMING SOON" Component
│   │   │   ├── AdminSidebar.jsx  # Admin Navigation Drawer
│   │   │   └── ImageUploader.jsx # Drag-and-Drop Multi-Image Upload Component
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Authentication State Provider
│   │   │   └── SettingsContext.jsx# Dynamic Shop Settings Provider
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Products.jsx      # Catalogue with Search, Filters & Sorting
│   │   │   ├── ProductDetail.jsx # Product Details & Enquiry Modal
│   │   │   ├── Categories.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Contact.jsx       # Visit Store & Enquiry Form
│   │   │   ├── Privacy.jsx
│   │   │   ├── Terms.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminProducts.jsx
│   │   │   ├── AdminProductForm.jsx
│   │   │   ├── AdminCategories.jsx
│   │   │   ├── AdminGoldRates.jsx
│   │   │   ├── AdminEnquiries.jsx
│   │   │   ├── AdminSettings.jsx
│   │   │   └── AdminPassword.jsx
│   │   ├── services/
│   │   │   └── api.js            # Axios API Client Service
│   │   ├── App.jsx               # Application Router & Layout Shells
│   │   ├── index.css             # Tailwind & Luxury Design System Styles
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
├── dmd_logo.jpg                  # Official Branding Logo
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

---

## 🌐 Customer Product Workflow

1. **Browse Catalogue**: Customers visit the home page or `/jewellery` catalogue.
2. **Search & Filter**: Customers search by product name/SKU, filter by category, purity (24K, 22K, 18K), stock availability, or price range.
3. **View Product Details**: Clicking **[ DETAILS ]** opens an Amazon-style page showing high-res images, purity, weight (grams), price, and description.
4. **Direct Shop Contact**:
   - **Call Now**: Opens mobile phone dialer (`tel:+91...`).
   - **Ask on WhatsApp**: Opens WhatsApp with pre-filled message:
     `"Hello DMD Jewellery, I am interested in [PRODUCT NAME] (Code: DMD-JWL-1001). Please provide more details about this product."`
   - **Enquire by Email**: Opens mail app with pre-filled subject and body.
   - **Send Enquiry Form**: Opens interactive modal form. Data is saved directly to the database and appears under `/admin/enquiries`.
5. **Get Store Directions**: Clicking **[ GET DIRECTIONS ]** opens Google Maps with the shop location configured in Admin Settings.

---

## 🚀 Production Deployment Instructions

### Option 1: Deploying on Full-Stack Hosting (Render / Railway / VPS)

1. **Build Frontend Bundle**:
   ```bash
   npm run build
   ```
   This generates compiled production assets into `frontend/dist`. Express will serve these static files automatically.

2. **Configure Production Database (MySQL)**:
   - Create a MySQL database on your cloud provider (e.g. PlanetScale, Aiven, AWS RDS, DigitalOcean).
   - Import `database/schema.sql`.
   - Update `.env`:
     ```env
     NODE_ENV=production
     DB_TYPE=mysql
     DB_HOST=your-mysql-host
     DB_NAME=dmd_jewellery
     DB_USER=your-db-user
     DB_PASSWORD=your-db-password
     ```

3. **Deploy Backend**:
   - Set Build Command: `npm install && npm run build`
   - Set Start Command: `npm start`
   - Configure environment variables in host control panel.

### Option 2: Custom Domain & Google Search Console Setup

1. **Custom Domain (www.dmdjewellery.com)**:
   - Add custom domain CNAME / A records pointing to your hosting IP/CNAME.
   - Enable SSL / HTTPS certificate (Let's Encrypt / Cloudflare).

2. **Google Search Console Indexing**:
   - Register site on [Google Search Console](https://search.google.com/search-console).
   - Submit sitemap URL: `https://www.dmdjewellery.com/sitemap.xml`.
   - Request indexing for homepage and key product pages.

---

## 📄 License

This software is crafted for **DMD JEWELLERY**. All rights reserved.
