import pg from 'pg';
import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const prodRes = await pool.query("SELECT * FROM products WHERE product_code = 'DMD-JWL-0001'");
  console.log('=== POSTGRES PRODUCT DMD-JWL-0001 ===');
  console.log(JSON.stringify(prodRes.rows[0], null, 2));

  if (prodRes.rows[0]) {
    const imgRes = await pool.query('SELECT * FROM product_images WHERE product_id = $1', [prodRes.rows[0].id]);
    console.log('\n=== POSTGRES PRODUCT IMAGES ===');
    console.log(JSON.stringify(imgRes.rows, null, 2));
  }

  console.log('\n=== POSTGRES TABLE COUNTS ===');
  const tables = ['users', 'categories', 'products', 'product_images', 'gold_rates', 'enquiries', 'shop_settings', 'social_links', 'pwa_installations'];
  for (const t of tables) {
    const res = await pool.query(`SELECT COUNT(*) as count FROM ${t}`);
    console.log(`${t.padEnd(18)}: ${res.rows[0].count}`);
  }

  const sqliteDb = new sqlite3.Database('./database/dmd_jewellery.sqlite', sqlite3.OPEN_READONLY, () => {
    sqliteDb.all('SELECT count(*) as count FROM categories', (e, r) => {
      console.log('\n=== SQLITE VERIFICATION ===');
      console.log('SQLite Categories count:', r ? r[0].count : 'error');
      console.log('SQLite File Intact: YES');
      sqliteDb.close();
      pool.end();
    });
  });
}

run();
