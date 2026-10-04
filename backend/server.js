import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import { initDb, query } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import goldRateRoutes from './routes/goldRateRoutes.js';
import enquiryRoutes from './routes/enquiryRoutes.js';
import settingRoutes from './routes/settingRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Disable API Caching so deleted/updated products reflect instantly on refresh
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Serve Static Uploads
const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Serve Root Logo Asset
const rootLogoPath = path.resolve(__dirname, '../dmd_logo.jpg');
if (fs.existsSync(rootLogoPath)) {
  app.use('/dmd_logo.jpg', express.static(rootLogoPath));
}

// SEO: Dynamic Robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(
    `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${req.protocol}://${req.get('host')}/sitemap.xml`
  );
});

// SEO: Dynamic Sitemap.xml
app.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const products = await query('SELECT id, updated_at FROM products WHERE status = "Published"');
    const categories = await query('SELECT name FROM categories WHERE status = "enabled"');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const staticPages = ['', '/jewellery', '/categories', '/about', '/contact', '/privacy', '/terms'];
    staticPages.forEach((page) => {
      xml += `  <url>\n    <loc>${baseUrl}${page}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
    });

    categories.forEach((cat) => {
      const slug = encodeURIComponent(cat.name.toLowerCase());
      xml += `  <url>\n    <loc>${baseUrl}/jewellery?category=${slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    products.forEach((prod) => {
      xml += `  <url>\n    <loc>${baseUrl}/product/${prod.id}</loc>\n    <lastmod>${new Date(prod.updated_at).toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).end();
  }
});

// Cloud Hosting Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/gold-rates', goldRateRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/settings', settingRoutes);

// Serve Frontend Build in Production
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    }
  });
}

// Global 404 Handler for API
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API Endpoint Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
  });
});

import os from 'os';
import { fetchLiveGoldRatesFromAPI } from './services/goldRateService.js';

const getLocalIpAddress = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
};

// Start Server & Initialize Database
const startServer = async () => {
  try {
    await initDb();
    
    // Initial live gold rate sync
    fetchLiveGoldRatesFromAPI().catch((err) => console.warn('Initial gold sync warning:', err));

    // Refresh live gold rates every 15 minutes
    setInterval(() => {
      fetchLiveGoldRatesFromAPI().catch((err) => console.warn('Periodic gold sync warning:', err));
    }, 15 * 60 * 1000);

    const localIp = getLocalIpAddress();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`==================================================`);
      console.log(`DMD JEWELLERYS SERVER RUNNING (MOBILE & NETWORK ENABLED)`);
      console.log(`Local Access:   http://localhost:${PORT}`);
      console.log(`Mobile Access:  http://${localIp}:${PORT}`);
      console.log(`Admin Panel:    http://${localIp}:${PORT}/admin`);
      console.log(`Environment:    ${process.env.NODE_ENV || 'development'}`);
      console.log(`Database Type:  ${process.env.DB_TYPE || 'sqlite'}`);
      console.log(`Live Gold Rate: ENABLED`);
      console.log(`==================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
