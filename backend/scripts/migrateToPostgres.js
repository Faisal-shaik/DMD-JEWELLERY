import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL;

if (!dbUrl) {
  console.error('ERROR: DATABASE_URL environment variable is missing.');
  console.error('Please set DATABASE_URL=postgres://user:password@host:port/dbname in your .env file or environment.');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: dbUrl,
  ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false },
});

const sqlitePath = path.resolve(__dirname, '../../database/dmd_jewellery.sqlite');
const jsonPath = path.resolve(__dirname, '../../database/dmd_jewellery.json');

const getSqliteData = () => {
  return new Promise((resolve) => {
    if (!fs.existsSync(sqlitePath)) return resolve({});
    const db = new sqlite3.Database(sqlitePath, sqlite3.OPEN_READONLY, (err) => {
      if (err) return resolve({});
      const result = {};
      const tables = [
        'users',
        'categories',
        'products',
        'product_images',
        'gold_rates',
        'enquiries',
        'shop_settings',
        'social_links',
        'pwa_installations',
      ];
      let pending = tables.length;

      tables.forEach((t) => {
        db.all(`SELECT * FROM ${t}`, [], (e, rows) => {
          result[t] = e ? [] : rows;
          pending--;
          if (pending === 0) {
            db.close();
            resolve(result);
          }
        });
      });
    });
  });
};

const getJsonData = () => {
  if (fs.existsSync(jsonPath)) {
    try {
      const raw = fs.readFileSync(jsonPath, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      return {};
    }
  }
  return {};
};

const runMigration = async () => {
  console.log('==================================================');
  console.log('STARTING DMD JEWELLERY POSTGRESQL MIGRATION');
  console.log('==================================================');

  const sqliteData = await getSqliteData();
  const jsonData = getJsonData();

  console.log('\n--- SOURCE DATA COUNTS (SQLITE / JSON) ---');
  console.log('users          :', Math.max(sqliteData.users?.length || 0, jsonData.users?.length || 0));
  console.log('categories     :', Math.max(sqliteData.categories?.length || 0, jsonData.categories?.length || 0));
  console.log('products       :', Math.max(sqliteData.products?.length || 0, jsonData.products?.length || 0));
  console.log('product_images :', Math.max(sqliteData.product_images?.length || 0, jsonData.product_images?.length || 0));
  console.log('gold_rates     :', Math.max(sqliteData.gold_rates?.length || 0, jsonData.gold_rates?.length || 0));
  console.log('enquiries      :', Math.max(sqliteData.enquiries?.length || 0, jsonData.enquiries?.length || 0));
  console.log('shop_settings  :', Math.max(sqliteData.shop_settings?.length || 0, jsonData.shop_settings?.length || 0));
  console.log('social_links   :', Math.max(sqliteData.social_links?.length || 0, jsonData.social_links?.length || 0));
  console.log('pwa_install    :', Math.max(sqliteData.pwa_installations?.length || 0, jsonData.pwa_installations?.length || 0));

  const client = await pool.connect();
  try {
    // 1. Ensure PostgreSQL Schema Exists
    const schemaPath = path.resolve(__dirname, '../../database/schema.postgres.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schemaSql);
      console.log('\nPostgreSQL Database Schema Verified & Initialized.');
    }

    // 2. Begin Atomic Transaction
    await client.query('BEGIN');
    console.log('Transaction started (BEGIN)...');

    // 3. Migrate Users
    const usersMap = new Map();
    (jsonData.users || []).concat(sqliteData.users || []).forEach((u) => {
      if (u.email) usersMap.set(u.email.toLowerCase(), u);
    });

    for (const u of usersMap.values()) {
      await client.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
        [u.name, u.email, u.password_hash, u.role || 'admin']
      );
    }
    await client.query(`SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));`);

    // 4. Migrate Categories
    const catMap = new Map();
    (jsonData.categories || []).concat(sqliteData.categories || []).forEach((c) => {
      if (c.name) catMap.set(c.name.toLowerCase(), c);
    });

    for (const c of catMap.values()) {
      await client.query(
        `INSERT INTO categories (id, name, description, status)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description`,
        [c.id, c.name, c.description || '', c.status || 'enabled']
      );
    }
    await client.query(`SELECT setval('categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM categories));`);

    // 5. Migrate Products (Includes DMD-JWL-0001)
    const prodMap = new Map();
    (jsonData.products || []).concat(sqliteData.products || []).forEach((p) => {
      if (p.product_code) prodMap.set(p.product_code, p);
    });

    for (const p of prodMap.values()) {
      await client.query(
        `INSERT INTO products (id, product_code, name, category_id, price, purity, weight, description, availability, featured, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (product_code) DO UPDATE SET 
           name = EXCLUDED.name,
           price = EXCLUDED.price,
           purity = EXCLUDED.purity,
           weight = EXCLUDED.weight,
           description = EXCLUDED.description`,
        [
          p.id,
          p.product_code,
          p.name,
          p.category_id || null,
          p.price || 0,
          p.purity,
          p.weight || 0,
          p.description || '',
          p.availability || 'In Stock',
          p.featured ? 1 : 0,
          p.status || 'Published',
        ]
      );
    }
    await client.query(`SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 1) FROM products));`);

    // 6. Migrate Product Images
    const imgList = (jsonData.product_images || []).concat(sqliteData.product_images || []);
    for (const img of imgList) {
      await client.query(
        `INSERT INTO product_images (id, product_id, image_url, is_primary, display_order)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET image_url = EXCLUDED.image_url`,
        [img.id, img.product_id, img.image_url, img.is_primary ? 1 : 0, img.display_order || 0]
      );
    }
    await client.query(`SELECT setval('product_images_id_seq', (SELECT COALESCE(MAX(id), 1) FROM product_images));`);

    // 7. Migrate Gold Rates
    const goldList = (jsonData.gold_rates || []).concat(sqliteData.gold_rates || []);
    for (const g of goldList) {
      if (g.purity) {
        await client.query(
          `INSERT INTO gold_rates (purity, rate, unit)
           VALUES ($1, $2, $3)
           ON CONFLICT (purity) DO UPDATE SET rate = EXCLUDED.rate`,
          [g.purity, g.rate, g.unit || '10 grams']
        );
      }
    }
    await client.query(`SELECT setval('gold_rates_id_seq', (SELECT COALESCE(MAX(id), 1) FROM gold_rates));`);

    // 8. Migrate Enquiries
    const validProductIds = new Set(Array.from(prodMap.values()).map((p) => Number(p.id)));
    const enqList = (jsonData.enquiries || []).concat(sqliteData.enquiries || []);
    for (const e of enqList) {
      const targetProductId = (e.product_id && validProductIds.has(Number(e.product_id))) ? Number(e.product_id) : null;
      await client.query(
        `INSERT INTO enquiries (id, customer_name, phone, email, product_id, message, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [e.id, e.customer_name, e.phone, e.email || null, targetProductId, e.message, e.status || 'New']
      );
    }
    await client.query(`SELECT setval('enquiries_id_seq', (SELECT COALESCE(MAX(id), 1) FROM enquiries));`);

    // 9. Migrate Shop Settings
    const settingsObj = (jsonData.shop_settings || [])[0] || (sqliteData.shop_settings || [])[0];
    if (settingsObj) {
      await client.query(
        `INSERT INTO shop_settings (id, business_name, phone, whatsapp, email, address, city, state, pincode, maps_url, opening_time, closing_time, holiday, about_text, logo_url)
         VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (id) DO UPDATE SET 
           business_name = EXCLUDED.business_name,
           phone = EXCLUDED.phone,
           whatsapp = EXCLUDED.whatsapp,
           about_text = EXCLUDED.about_text`,
        [
          settingsObj.business_name || 'DMD JEWELLERY',
          settingsObj.phone || '',
          settingsObj.whatsapp || '',
          settingsObj.email || '',
          settingsObj.address || '',
          settingsObj.city || '',
          settingsObj.state || '',
          settingsObj.pincode || '',
          settingsObj.maps_url || '',
          settingsObj.opening_time || '10:00 AM',
          settingsObj.closing_time || '08:30 PM',
          settingsObj.holiday || 'Saturday (Half Day)',
          settingsObj.about_text || '',
          settingsObj.logo_url || '/dmd_logo.jpg',
        ]
      );
    }

    // 10. Migrate Social Links
    const socialList = (jsonData.social_links || []).concat(sqliteData.social_links || []);
    for (const s of socialList) {
      if (s.platform && s.url) {
        await client.query(
          `INSERT INTO social_links (platform, url, status)
           VALUES ($1, $2, $3)
           ON CONFLICT (platform) DO UPDATE SET url = EXCLUDED.url, status = EXCLUDED.status`,
          [s.platform, s.url, s.status || 'enabled']
        );
      }
    }
    await client.query(`SELECT setval('social_links_id_seq', (SELECT COALESCE(MAX(id), 1) FROM social_links));`);

    // 11. Migrate PWA Installations
    const pwaList = (jsonData.pwa_installations || []).concat(sqliteData.pwa_installations || []);
    for (const p of pwaList) {
      if (p.installation_id) {
        await client.query(
          `INSERT INTO pwa_installations (installation_id, platform)
           VALUES ($1, $2)
           ON CONFLICT (installation_id) DO NOTHING`,
          [p.installation_id, p.platform || 'web']
        );
      }
    }
    await client.query(`SELECT setval('pwa_installations_id_seq', (SELECT COALESCE(MAX(id), 1) FROM pwa_installations));`);

    // Commit Transaction
    await client.query('COMMIT');
    console.log('Transaction committed (COMMIT)...');

    // Report Post-migration Counts
    console.log('\n--- NEW PRODUCTION POSTGRESQL RECORD COUNTS ---');
    const tables = [
      'users',
      'categories',
      'products',
      'product_images',
      'gold_rates',
      'enquiries',
      'shop_settings',
      'social_links',
      'pwa_installations',
    ];
    for (const t of tables) {
      const res = await client.query(`SELECT COUNT(*) as count FROM ${t}`);
      console.log(`${t.padEnd(18)}: ${res.rows[0].count}`);
    }

    console.log('\n==================================================');
    console.log('MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('==================================================');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration Error (Transaction Rolled Back):', err);
  } finally {
    client.release();
    await pool.end();
  }
};

runMigration();
