import sqlite3 from 'sqlite3';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// Database Connection Instances
let pgPool = null;
let sqliteDb = null;
let localFallbackDb = null;
let activeDbType = 'sqlite'; // 'postgres' | 'sqlite' | 'file'

const dbFilePath = path.resolve(
  process.cwd(),
  process.env.SQLITE_DB_PATH || process.env.DB_FILE || './database/dmd_jewellery.sqlite'
);

// Pure JS File Database fallback (Zero Native Dependencies)
class LocalFileDB {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = {
      users: [],
      categories: [],
      products: [],
      product_images: [],
      gold_rates: [],
      enquiries: [],
      shop_settings: [],
      social_links: [],
      pwa_installations: [],
      counters: { users: 0, categories: 0, products: 0, product_images: 0, gold_rates: 0, enquiries: 0, shop_settings: 0, social_links: 0, pwa_installations: 0 }
    };
    this.init();
  }

  init() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        const parsed = JSON.parse(raw);
        this.data = { ...this.data, ...parsed };
      } catch (e) {
        console.warn('Initializing new local database file...');
      }
    }
    this.seedDefaults();
    this.save();
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.warn('LocalFileDB save warning:', err.message);
    }
  }

  seedDefaults() {
    if (this.data.is_seeded) return;

    if (this.data.gold_rates.length === 0) {
      this.data.gold_rates = [
        { id: 1, purity: '24K', rate: 75500.0, unit: '10 grams', updated_at: new Date().toISOString() },
        { id: 2, purity: '22K', rate: 69200.0, unit: '10 grams', updated_at: new Date().toISOString() },
        { id: 3, purity: '18K', rate: 56600.0, unit: '10 grams', updated_at: new Date().toISOString() },
      ];
      this.data.counters.gold_rates = 3;
    }

    if (this.data.categories.length === 0) {
      const cats = ['Rings', 'Necklaces', 'Chains', 'Bangles', 'Earrings', 'Pendants', 'Bridal Jewellery', 'Antique Jewellery'];
      this.data.categories = cats.map((name, index) => ({
        id: index + 1,
        name,
        description: `Exquisite gold and hallmark ${name.toLowerCase()}`,
        status: 'enabled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      this.data.counters.categories = cats.length;
    }

    if (this.data.shop_settings.length === 0) {
      this.data.shop_settings = [
        {
          id: 1,
          business_name: 'DMD JEWELLERY',
          phone: '+91 9010322685',
          whatsapp: '9010322685',
          email: 'info@dmdjewellery.com',
          address: 'SHARAF BAZAR YEMMIGANUR, KURNOOL DIST',
          city: 'Yemmiganur',
          state: 'Andhra Pradesh',
          pincode: '518360',
          maps_url: 'https://www.google.com/maps/search/?api=1&query=SHARAF+BAZAR+YEMMIGANUR+518360+KURNOOL+DIST',
          opening_time: '10:00 AM',
          closing_time: '08:30 PM',
          holiday: 'Saturday (Half Day)',
          about_text: 'DMD JEWELLERYS, owned by D MUDDASSIR, offers timeless elegance with beautifully crafted gold, diamond, and silver jewellery. Built on purity, craftsmanship, and customer trust.',
          logo_url: '/dmd_logo.jpg',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      this.data.counters.shop_settings = 1;
    }

    if (!this.data.products) this.data.products = [];
    if (!this.data.pwa_installations) this.data.pwa_installations = [];

    this.data.is_seeded = true;
  }

  async execute(sql, params = []) {
    const trimmed = sql.trim();
    const lower = trimmed.toLowerCase();

    // PWA Analytics queries
    if (lower.startsWith('select count(*) as count from pwa_installations') || lower.startsWith('select count(*) as total from pwa_installations')) {
      return [{ count: this.data.pwa_installations.length, total: this.data.pwa_installations.length }];
    }
    if (lower.includes('from pwa_installations')) {
      if (lower.includes('where installation_id = ?')) {
        const item = this.data.pwa_installations.find((p) => p.installation_id === params[0]);
        return item ? [item] : [];
      }
      return this.data.pwa_installations;
    }
    if (lower.startsWith('insert into pwa_installations')) {
      this.data.counters.pwa_installations = (this.data.counters.pwa_installations || 0) + 1;
      const newInst = {
        id: this.data.counters.pwa_installations,
        installation_id: params[0],
        platform: params[1] || 'web',
        installed_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
      };
      this.data.pwa_installations.push(newInst);
      this.save();
      return { insertId: newInst.id, affectedRows: 1 };
    }
    if (lower.startsWith('update pwa_installations')) {
      const inst = this.data.pwa_installations.find((p) => p.installation_id === params[0]);
      if (inst) {
        inst.last_seen_at = new Date().toISOString();
        this.save();
        return { affectedRows: 1 };
      }
    }

    if (lower.startsWith('select count(*) as count from products') || lower.startsWith('select count(*) as total from products')) {
      return [{ count: this.data.products.length, total: this.data.products.length }];
    }
    if (lower.startsWith('select count(*) as total from product_images')) {
      const pid = params[0];
      const count = this.data.product_images.filter((i) => i.product_id === Number(pid)).length;
      return [{ total: count }];
    }

    if (lower.startsWith('select') && lower.includes('from users')) {
      if (lower.includes('where email = ?') || lower.includes('where lower(email) = ?')) {
        const user = this.data.users.find((u) => u.email.toLowerCase() === String(params[0]).toLowerCase());
        return user ? [user] : [];
      }
      if (lower.includes('where id = ?')) {
        const user = this.data.users.find((u) => u.id === Number(params[0]));
        return user ? [user] : [];
      }
      return this.data.users;
    }

    if (lower.startsWith('insert into users')) {
      this.data.counters.users += 1;
      const newUser = {
        id: this.data.counters.users,
        name: params[0],
        email: params[1],
        password_hash: params[2],
        role: params[3] || 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.data.users.push(newUser);
      this.save();
      return { insertId: newUser.id, affectedRows: 1 };
    }

    if (lower.startsWith('update users')) {
      if (lower.includes('password_hash = ?')) {
        const id = params[params.length - 1];
        const user = this.data.users.find((u) => u.id === Number(id));
        if (user) {
          if (params.length === 3) {
            user.name = params[0];
            user.password_hash = params[1];
          } else {
            user.password_hash = params[0];
          }
          user.updated_at = new Date().toISOString();
          this.save();
          return { affectedRows: 1 };
        }
      }
    }

    if (lower.startsWith('select') && lower.includes('from products')) {
      let list = [...this.data.products];

      list = list.map((p) => {
        const cat = this.data.categories.find((c) => c.id === p.category_id);
        const images = this.data.product_images.filter((img) => img.product_id === p.id);
        const primaryImg = images.find((i) => i.is_primary === 1)?.image_url || images[0]?.image_url || null;
        return {
          ...p,
          category_name: cat ? cat.name : null,
          primary_image: primaryImg,
        };
      });

      if (lower.includes('where p.id = ?') || lower.includes('where id = ?')) {
        const item = list.find((p) => p.id === Number(params[0]));
        return item ? [item] : [];
      }

      if (lower.includes('where p.product_code = ?') || lower.includes('where product_code = ?')) {
        const item = list.find((p) => String(p.product_code).toLowerCase() === String(params[0]).toLowerCase());
        return item ? [item] : [];
      }

      if (lower.includes("p.status = 'published'") || lower.includes("status = 'published'")) {
        list = list.filter((p) => p.status === 'Published');
      }

      return list;
    }

    if (lower.startsWith('insert into products')) {
      this.data.counters.products += 1;
      const newProd = {
        id: this.data.counters.products,
        product_code: params[0],
        name: params[1],
        category_id: params[2] ? Number(params[2]) : null,
        price: Number(params[3]) || 0,
        purity: params[4],
        weight: Number(params[5]) || 0,
        description: params[6] || '',
        availability: params[7] || 'In Stock',
        featured: params[8] === 1 || params[8] === true ? 1 : 0,
        status: params[9] || 'Published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.data.products.push(newProd);
      this.save();
      return { insertId: newProd.id, affectedRows: 1 };
    }

    if (lower.startsWith('update products')) {
      const id = params[params.length - 1];
      const prod = this.data.products.find((p) => p.id === Number(id));
      if (prod) {
        prod.product_code = params[0];
        prod.name = params[1];
        prod.category_id = params[2] ? Number(params[2]) : null;
        prod.price = Number(params[3]) || 0;
        prod.purity = params[4];
        prod.weight = Number(params[5]) || 0;
        prod.description = params[6] || '';
        prod.availability = params[7] || 'In Stock';
        prod.featured = params[8] === 1 || params[8] === true ? 1 : 0;
        prod.status = params[9] || 'Published';
        prod.updated_at = new Date().toISOString();
        this.save();
        return { affectedRows: 1 };
      }
    }

    if (lower.startsWith('delete from products')) {
      const id = params[0];
      if (id !== undefined) {
        this.data.products = this.data.products.filter((p) => p.id !== Number(id));
        this.data.product_images = this.data.product_images.filter((img) => img.product_id !== Number(id));
        this.save();
      }
      return { affectedRows: 1 };
    }

    if (lower.startsWith('select') && lower.includes('from product_images')) {
      if (lower.includes('where product_id = ?')) {
        return this.data.product_images.filter((i) => i.product_id === Number(params[0]));
      }
      if (lower.includes('where id = ?')) {
        const img = this.data.product_images.find((i) => i.id === Number(params[0]));
        return img ? [img] : [];
      }
      return this.data.product_images;
    }

    if (lower.startsWith('insert into product_images')) {
      this.data.counters.product_images += 1;
      const newImg = {
        id: this.data.counters.product_images,
        product_id: Number(params[0]),
        image_url: params[1],
        is_primary: params[2] ? 1 : 0,
        display_order: params[3] || 0,
        created_at: new Date().toISOString(),
      };
      this.data.product_images.push(newImg);
      this.save();
      return { insertId: newImg.id, affectedRows: 1 };
    }

    if (lower.startsWith('delete from product_images')) {
      const id = params[0];
      if (lower.includes('where product_id')) {
        this.data.product_images = this.data.product_images.filter((i) => i.product_id !== Number(id));
      } else {
        this.data.product_images = this.data.product_images.filter((i) => i.id !== Number(id));
      }
      this.save();
      return { affectedRows: 1 };
    }

    if (lower.startsWith('select') && lower.includes('from categories')) {
      return this.data.categories.map((c) => ({
        ...c,
        product_count: this.data.products.filter((p) => p.category_id === c.id && p.status === 'Published').length,
      }));
    }

    if (lower.startsWith('select') && lower.includes('from gold_rates')) {
      return this.data.gold_rates;
    }

    if (lower.startsWith('select') && lower.includes('from enquiries')) {
      return this.data.enquiries;
    }

    if (lower.startsWith('select') && lower.includes('from shop_settings')) {
      return this.data.shop_settings;
    }

    if (lower.startsWith('select') && lower.includes('from social_links')) {
      return this.data.social_links.filter((s) => s.status === 'enabled');
    }

    return [];
  }
}

const initFallbackJsonDb = () => {
  if (!localFallbackDb) {
    const jsonDbPath = path.resolve(__dirname, '../../database/dmd_jewellery.json');
    localFallbackDb = new LocalFileDB(jsonDbPath);
    activeDbType = 'file';
  }
};

// Convert SQLite '?' parameters to PostgreSQL '$1', '$2', '$3'
const convertSqlToPostgres = (sql) => {
  let paramIndex = 1;
  let pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
  
  // Replace SQLite specific functions with PostgreSQL equivalents if needed
  pgSql = pgSql.replace(/DATETIME/gi, 'TIMESTAMP');
  
  // For INSERT queries without RETURNING, append RETURNING id to get inserted ID
  const trimmedLower = pgSql.trim().toLowerCase();
  if (trimmedLower.startsWith('insert into') && !trimmedLower.includes('returning')) {
    pgSql += ' RETURNING id';
  }

  return pgSql;
};

// Initialize Database Connection
export const initDb = async () => {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL;
  const dbTypeEnv = (process.env.DB_TYPE || '').toLowerCase();

  // Mode A: PostgreSQL (Production Cloud Database: Supabase / Neon / Render Postgres)
  if (dbUrl || dbTypeEnv === 'postgres' || dbTypeEnv === 'postgresql') {
    try {
      console.log('Connecting to Production PostgreSQL Database...');
      pgPool = new Pool({
        connectionString: dbUrl,
        ssl: dbUrl && dbUrl.includes('localhost') ? false : { rejectUnauthorized: false },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      pgPool.on('error', (err) => {
        console.error('Unexpected PostgreSQL Pool Error:', err.message);
      });

      // Test Connection & Initialize PostgreSQL Schema
      const client = await pgPool.connect();
      try {
        console.log('PostgreSQL Connection Established Successfully.');
        activeDbType = 'postgres';

        // Load & Run PostgreSQL Schema
        const schemaPath = path.resolve(__dirname, '../../database/schema.postgres.sql');
        if (fs.existsSync(schemaPath)) {
          const schemaSql = fs.readFileSync(schemaPath, 'utf8');
          await client.query(schemaSql);
          console.log('PostgreSQL Database Schema Initialized Successfully.');
        }

        return true;
      } finally {
        client.release();
      }
    } catch (pgError) {
      console.error('PostgreSQL Connection Notice:', pgError.message);
      console.warn('Falling back to SQLite / File Database...');
    }
  }

  // Mode B: SQLite Database File
  try {
    const dir = path.dirname(dbFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    return new Promise((resolve) => {
      sqliteDb = new sqlite3.Database(dbFilePath, (err) => {
        if (err) {
          console.warn('SQLite initialization notice, using local JSON file database:', err.message);
          initFallbackJsonDb();
          resolve(false);
        } else {
          console.log(`SQLite Database connected at ${dbFilePath}`);
          activeDbType = 'sqlite';

          const schemaPath = path.resolve(__dirname, '../../database/schema.sqlite.sql');
          if (fs.existsSync(schemaPath)) {
            try {
              const schemaSql = fs.readFileSync(schemaPath, 'utf8');
              sqliteDb.exec(schemaSql, (execErr) => {
                if (execErr) {
                  console.warn('SQLite schema notice:', execErr.message);
                } else {
                  console.log('SQLite Schema Initialized Successfully.');
                }
                resolve(true);
              });
            } catch (readErr) {
              resolve(true);
            }
          } else {
            resolve(true);
          }
        }
      });
    });
  } catch (globalErr) {
    console.warn('SQLite init exception, using local JSON file database:', globalErr.message);
    initFallbackJsonDb();
    return false;
  }
};

// Generic Database Query Runner (Handles PostgreSQL, SQLite, and File DB)
export const query = async (sql, params = []) => {
  if (!pgPool && !sqliteDb && !localFallbackDb) {
    await initDb();
  }

  // Handle PostgreSQL Queries
  if (pgPool && activeDbType === 'postgres') {
    try {
      const pgSql = convertSqlToPostgres(sql);
      const res = await pgPool.query(pgSql, params);

      const trimmedLower = sql.trim().toLowerCase();
      if (trimmedLower.startsWith('select') || trimmedLower.startsWith('with')) {
        return res.rows || [];
      } else if (trimmedLower.startsWith('insert')) {
        const insertedId = res.rows && res.rows[0] ? Number(res.rows[0].id) : 0;
        return { insertId: insertedId, affectedRows: res.rowCount || 0 };
      } else {
        return { insertId: 0, affectedRows: res.rowCount || 0 };
      }
    } catch (pgErr) {
      console.error('PostgreSQL Query Error:', pgErr.message, 'SQL:', sql);
      throw pgErr;
    }
  }

  // Handle SQLite Queries
  if (sqliteDb && activeDbType === 'sqlite') {
    return new Promise((resolve, reject) => {
      const trimmed = sql.trim().toLowerCase();
      if (trimmed.startsWith('select') || trimmed.startsWith('pragma') || trimmed.startsWith('with')) {
        sqliteDb.all(sql, params, (err, rows) => {
          if (err) {
            console.warn('SQLite query warning:', err.message);
            resolve([]);
          } else {
            resolve(rows || []);
          }
        });
      } else {
        sqliteDb.run(sql, params, function (err) {
          if (err) {
            console.warn('SQLite execute warning:', err.message);
            resolve({ insertId: 0, affectedRows: 0 });
          } else {
            resolve({ insertId: this ? this.lastID : 0, affectedRows: this ? this.changes : 0 });
          }
        });
      }
    });
  }

  // Handle Local File DB Fallback
  if (localFallbackDb) {
    return await localFallbackDb.execute(sql, params);
  }

  return [];
};

export const queryOne = async (sql, params = []) => {
  const res = await query(sql, params);
  if (Array.isArray(res)) {
    return res[0] || null;
  }
  return res || null;
};

export const getActiveDbType = () => activeDbType;

export const testDbConnection = async () => {
  try {
    const res = await query('SELECT 1 as test');
    return {
      connected: true,
      type: activeDbType,
      isPersistent: activeDbType === 'postgres',
    };
  } catch (err) {
    return {
      connected: false,
      type: activeDbType,
      error: err.message,
    };
  }
};

export default { query, queryOne, initDb, getActiveDbType, testDbConnection };
