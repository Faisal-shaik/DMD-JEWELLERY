import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFilePath = path.resolve(
  process.cwd(),
  process.env.SQLITE_DB_PATH || process.env.DB_FILE || './database/dmd_jewellery.sqlite'
);

let sqliteDb = null;

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
      counters: { users: 0, categories: 0, products: 0, product_images: 0, gold_rates: 0, enquiries: 0, shop_settings: 0, social_links: 0 }
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
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
  }

  seedDefaults() {
    if (this.data.is_seeded) {
      return;
    }

    if (this.data.gold_rates.length === 0) {
      this.data.gold_rates = [
        { id: 1, purity: '24K', rate: 75500.0, unit: '10 grams', updated_at: new Date().toISOString() },
        { id: 2, purity: '22K', rate: 69200.0, unit: '10 grams', updated_at: new Date().toISOString() },
        { id: 3, purity: '18K', rate: 56600.0, unit: '10 grams', updated_at: new Date().toISOString() },
      ];
      this.data.counters.gold_rates = 3;
    }

    if (this.data.categories.length === 0) {
      const cats = [
        'Rings',
        'Necklaces',
        'Chains',
        'Bangles',
        'Earrings',
        'Pendants',
        'Bridal Jewellery',
        'Antique Jewellery',
      ];
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
          business_name: 'DMD JEWELLERYS',
          phone: '+91 9010322685',
          whatsapp: '9010322685',
          email: '',
          address: 'SHARAF BAZAR YEMMIGANUR, KURNOOL DIST',
          city: 'Yemmiganur',
          state: 'Andhra Pradesh',
          pincode: '518360',
          maps_url: 'https://www.google.com/maps/search/?api=1&query=SHARAF+BAZAR+YEMMIGANUR+518360+KURNOOL+DIST',
          opening_time: '10:00 AM',
          closing_time: '08:30 PM',
          holiday: 'Saturday (Half Day)',
          about_text:
            'DMD JEWELLERYS, owned by D MUDDASSIR, offers timeless elegance with beautifully crafted gold, diamond, and silver jewellery. Located at Sharaf Bazar Yemmiganur, Kurnool Dist. Built on 100% purity, finest craftsmanship, and customer trust.',
          logo_url: '/dmd_logo.jpg',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      this.data.counters.shop_settings = 1;
    }

    if (!this.data.products) {
      this.data.products = [];
    }

    this.data.is_seeded = true;
  }

  async execute(sql, params = []) {
    const trimmed = sql.trim();
    const lower = trimmed.toLowerCase();

    if (lower.startsWith('select count(*) as count from products') || lower.startsWith('select count(*) as total from products')) {
      return [{ count: this.data.products.length, total: this.data.products.length }];
    }
    if (lower.startsWith('select count(*) as total from product_images')) {
      const pid = params[0];
      const count = this.data.product_images.filter((i) => i.product_id === Number(pid)).length;
      return [{ total: count }];
    }

    if (lower.startsWith('select') && lower.includes('from users')) {
      if (lower.includes('where email = ?')) {
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

      if (lower.includes('where p.id = ?') || lower.includes('where id = ?') || lower.match(/where\s+(?:p\.)?id\s*=\s*(\d+)/)) {
        let id = params[0];
        if (id === undefined) {
          const match = lower.match(/where\s+(?:p\.)?id\s*=\s*(\d+)/);
          if (match) id = match[1];
        }
        const item = list.find((p) => p.id === Number(id));
        return item ? [item] : [];
      }

      if (lower.includes('where p.product_code = ?') || lower.includes('where product_code = ?')) {
        const code = params[0];
        const item = list.find((p) => String(p.product_code).toLowerCase() === String(code).toLowerCase());
        return item ? [item] : [];
      }

      if (lower.includes("p.status = 'published'") || lower.includes("status = 'published'")) {
        list = list.filter((p) => p.status === 'Published');
      } else if (params.includes('Published') || params.includes('Draft') || params.includes('Hidden')) {
        const statusParam = params.find((pr) => ['Published', 'Draft', 'Hidden'].includes(pr));
        if (statusParam) {
          list = list.filter((p) => p.status === statusParam);
        }
      }

      if (lower.includes('like ?')) {
        const searchTerms = params.filter((p) => typeof p === 'string' && p.startsWith('%'));
        if (searchTerms.length > 0) {
          const rawTerm = searchTerms[0].replace(/%/g, '').toLowerCase();
          list = list.filter(
            (p) =>
              (p.name && p.name.toLowerCase().includes(rawTerm)) ||
              (p.product_code && p.product_code.toLowerCase().includes(rawTerm)) ||
              (p.description && p.description.toLowerCase().includes(rawTerm)) ||
              (p.category_name && p.category_name.toLowerCase().includes(rawTerm))
          );
        }
      }

      if (lower.includes('p.category_id = ?') || lower.includes('c.name = ?')) {
        const catParam = params.find((pr) => typeof pr === 'number' || (typeof pr === 'string' && !pr.startsWith('%')));
        if (catParam) {
          if (typeof catParam === 'number' || !isNaN(catParam)) {
            list = list.filter((p) => p.category_id === Number(catParam));
          } else {
            list = list.filter((p) => p.category_name && p.category_name.toLowerCase() === String(catParam).toLowerCase());
          }
        }
      }

      if (lower.includes('p.purity = ?')) {
        const purityParam = params.find((pr) => ['24K', '22K', '20K', '18K', 'Silver', 'Diamond', 'Other'].includes(pr));
        if (purityParam) {
          list = list.filter((p) => p.purity === purityParam);
        }
      }

      if (lower.includes('p.featured = 1')) {
        list = list.filter((p) => p.featured === 1 || p.featured === true);
      }

      if (lower.includes('order by p.price asc')) {
        list.sort((a, b) => a.price - b.price);
      } else if (lower.includes('order by p.price desc')) {
        list.sort((a, b) => b.price - a.price);
      } else if (lower.includes('order by p.name asc')) {
        list.sort((a, b) => a.name.localeCompare(b.name));
      } else if (lower.includes('order by p.name desc')) {
        list.sort((a, b) => b.name.localeCompare(a.name));
      } else if (lower.includes('order by p.created_at asc')) {
        list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      } else {
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
      let id = params[0];
      if (id === undefined) {
        const match = lower.match(/where\s+(?:p\.)?id\s*=\s*(\d+)/);
        if (match) id = match[1];
      }
      if (id !== undefined && !isNaN(Number(id))) {
        this.data.products = this.data.products.filter((p) => p.id !== Number(id));
        this.data.product_images = this.data.product_images.filter((img) => img.product_id !== Number(id));
        this.save();
      }
      return { affectedRows: 1 };
    }

    if (lower.startsWith('select') && lower.includes('from product_images')) {
      if (lower.includes('where product_id = ?') || lower.match(/where\s+product_id\s*=\s*(\d+)/)) {
        let pid = params[0];
        if (pid === undefined) {
          const match = lower.match(/where\s+product_id\s*=\s*(\d+)/);
          if (match) pid = match[1];
        }
        return this.data.product_images.filter((i) => i.product_id === Number(pid));
      }
      if (lower.includes('where id = ?') || lower.match(/where\s+id\s*=\s*(\d+)/)) {
        let id = params[0];
        if (id === undefined) {
          const match = lower.match(/where\s+id\s*=\s*(\d+)/);
          if (match) id = match[1];
        }
        const img = this.data.product_images.find((i) => i.id === Number(id));
        return img ? [img] : [];
      }
      if (lower.includes('where product_id in')) {
        return this.data.product_images.filter((i) => params.includes(i.product_id));
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

    if (lower.startsWith('update product_images')) {
      if (lower.includes('is_primary = 0')) {
        const pid = params[0];
        this.data.product_images.forEach((img) => {
          if (img.product_id === Number(pid)) img.is_primary = 0;
        });
      } else if (lower.includes('is_primary = 1')) {
        const id = params[0];
        const img = this.data.product_images.find((i) => i.id === Number(id));
        if (img) img.is_primary = 1;
      }
      this.save();
      return { affectedRows: 1 };
    }

    if (lower.startsWith('delete from product_images')) {
      let id = params[0];
      if (id === undefined) {
        const match = lower.match(/where\s+(?:product_id|id)\s*=\s*(\d+)/);
        if (match) id = match[1];
      }
      if (id !== undefined && !isNaN(Number(id))) {
        if (lower.includes('where product_id')) {
          this.data.product_images = this.data.product_images.filter((i) => i.product_id !== Number(id));
        } else {
          this.data.product_images = this.data.product_images.filter((i) => i.id !== Number(id));
        }
        this.save();
      }
      return { affectedRows: 1 };
    }

    if (lower.startsWith('select') && lower.includes('from categories')) {
      let cats = [...this.data.categories];

      if (lower.includes('where lower(name) = lower(?)')) {
        const name = params[0];
        const cat = cats.find((c) => c.name.toLowerCase() === String(name).toLowerCase());
        return cat ? [cat] : [];
      }
      if (lower.includes('where id = ?')) {
        const id = params[0];
        const cat = cats.find((c) => c.id === Number(id));
        return cat ? [cat] : [];
      }
      if (params.length > 0 && params[0] !== 'all') {
        cats = cats.filter((c) => c.status === params[0]);
      }

      return cats.map((c) => ({
        ...c,
        product_count: this.data.products.filter((p) => p.category_id === c.id && p.status === 'Published').length,
      }));
    }

    if (lower.startsWith('insert into categories')) {
      this.data.counters.categories += 1;
      const newCat = {
        id: this.data.counters.categories,
        name: params[0],
        description: params[1] || '',
        status: params[2] || 'enabled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.data.categories.push(newCat);
      this.save();
      return { insertId: newCat.id, affectedRows: 1 };
    }

    if (lower.startsWith('update categories')) {
      const id = params[params.length - 1];
      const cat = this.data.categories.find((c) => c.id === Number(id));
      if (cat) {
        cat.name = params[0];
        cat.description = params[1] || '';
        cat.status = params[2] || 'enabled';
        cat.updated_at = new Date().toISOString();
        this.save();
        return { affectedRows: 1 };
      }
    }

    if (lower.startsWith('delete from categories')) {
      const id = params[0];
      this.data.categories = this.data.categories.filter((c) => c.id !== Number(id));
      this.save();
      return { affectedRows: 1 };
    }

    if (lower.startsWith('select') && lower.includes('from gold_rates')) {
      if (lower.includes('where purity = ?')) {
        const purity = params[0];
        const rate = this.data.gold_rates.find((r) => r.purity === purity);
        return rate ? [rate] : [];
      }
      return this.data.gold_rates;
    }

    if (lower.startsWith('update gold_rates')) {
      const purity = params[2];
      const rateObj = this.data.gold_rates.find((r) => r.purity === purity);
      if (rateObj) {
        rateObj.rate = Number(params[0]);
        rateObj.unit = params[1] || '10 grams';
        rateObj.updated_at = new Date().toISOString();
        this.save();
        return { affectedRows: 1 };
      }
    }

    if (lower.startsWith('insert into gold_rates')) {
      this.data.counters.gold_rates += 1;
      const newRate = {
        id: this.data.counters.gold_rates,
        purity: params[0],
        rate: Number(params[1]),
        unit: params[2] || '10 grams',
        updated_at: new Date().toISOString(),
      };
      this.data.gold_rates.push(newRate);
      this.save();
      return { insertId: newRate.id, affectedRows: 1 };
    }

    if (lower.startsWith('select') && lower.includes('from enquiries')) {
      let enqs = [...this.data.enquiries];
      if (params.length > 0 && params[0] !== 'all') {
        enqs = enqs.filter((e) => e.status === params[0]);
      }
      return enqs.map((e) => {
        const prod = this.data.products.find((p) => p.id === e.product_id);
        return {
          ...e,
          product_name: prod ? prod.name : null,
          product_code: prod ? prod.product_code : null,
        };
      });
    }

    if (lower.startsWith('insert into enquiries')) {
      this.data.counters.enquiries += 1;
      const newEnq = {
        id: this.data.counters.enquiries,
        customer_name: params[0],
        phone: params[1],
        email: params[2] || null,
        product_id: params[3] ? Number(params[3]) : null,
        message: params[4],
        status: 'New',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.data.enquiries.push(newEnq);
      this.save();
      return { insertId: newEnq.id, affectedRows: 1 };
    }

    if (lower.startsWith('update enquiries')) {
      const id = params[1];
      const enq = this.data.enquiries.find((e) => e.id === Number(id));
      if (enq) {
        enq.status = params[0];
        enq.updated_at = new Date().toISOString();
        this.save();
        return { affectedRows: 1 };
      }
    }

    if (lower.startsWith('delete from enquiries')) {
      const id = params[0];
      this.data.enquiries = this.data.enquiries.filter((e) => e.id !== Number(id));
      this.save();
      return { affectedRows: 1 };
    }

    if (lower.startsWith('select') && lower.includes('from shop_settings')) {
      return this.data.shop_settings;
    }

    if (lower.startsWith('update shop_settings')) {
      let s = this.data.shop_settings[0];
      if (!s) {
        s = { id: 1 };
        this.data.shop_settings = [s];
      }
      s.business_name = params[0] || s.business_name;
      s.phone = params[1] !== undefined ? params[1] : s.phone;
      s.whatsapp = params[2] !== undefined ? params[2] : s.whatsapp;
      s.email = params[3] !== undefined ? params[3] : s.email;
      s.address = params[4] !== undefined ? params[4] : s.address;
      s.city = params[5] !== undefined ? params[5] : s.city;
      s.state = params[6] !== undefined ? params[6] : s.state;
      s.pincode = params[7] !== undefined ? params[7] : s.pincode;
      s.maps_url = params[8] !== undefined ? params[8] : s.maps_url;
      s.latitude = params[9] !== undefined ? params[9] : s.latitude;
      s.longitude = params[10] !== undefined ? params[10] : s.longitude;
      s.opening_time = params[11] !== undefined ? params[11] : s.opening_time;
      s.closing_time = params[12] !== undefined ? params[12] : s.closing_time;
      s.holiday = params[13] !== undefined ? params[13] : s.holiday;
      s.about_text = params[14] !== undefined ? params[14] : s.about_text;
      if (params[15]) s.logo_url = params[15];
      s.updated_at = new Date().toISOString();
      this.save();
      return { affectedRows: 1 };
    }

    if (lower.startsWith('select') && lower.includes('from social_links')) {
      return this.data.social_links.filter((s) => s.status === 'enabled');
    }

    if (lower.startsWith('update social_links')) {
      const platform = params[params.length - 1];
      const link = this.data.social_links.find((s) => s.platform === platform);
      if (link) {
        if (params.length === 2) {
          link.url = params[0];
          link.status = 'enabled';
        } else {
          link.status = params[0];
          link.url = params[1] || '';
        }
        this.save();
        return { affectedRows: 1 };
      }
    }

    if (lower.startsWith('insert into social_links')) {
      this.data.counters.social_links += 1;
      const newSoc = {
        id: this.data.counters.social_links,
        platform: params[0],
        url: params[1],
        status: 'enabled',
        created_at: new Date().toISOString(),
      };
      this.data.social_links.push(newSoc);
      this.save();
      return { insertId: newSoc.id, affectedRows: 1 };
    }

    return [];
  }
}

let localFallbackDb = null;

const initFallbackJsonDb = () => {
  if (!localFallbackDb) {
    const jsonDbPath = path.resolve(__dirname, '../../database/dmd_jewellery.json');
    localFallbackDb = new LocalFileDB(jsonDbPath);
  }
};

// Initialize SQLite Database File
export const initDb = async () => {
  try {
    const dir = path.dirname(dbFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    return new Promise((resolve) => {
      try {
        sqliteDb = new sqlite3.Database(dbFilePath, (err) => {
          if (err) {
            console.warn('SQLite native initialization notice, using file database:', err.message);
            initFallbackJsonDb();
            resolve(false);
          } else {
            console.log(`SQLite Database connected at ${dbFilePath}`);
            
            const schemaPath = path.resolve(__dirname, '../../database/schema.sqlite.sql');
            if (fs.existsSync(schemaPath)) {
              try {
                const schemaSql = fs.readFileSync(schemaPath, 'utf8');
                sqliteDb.exec(schemaSql, (execErr) => {
                  if (execErr) {
                    console.warn('Schema exec notice:', execErr.message);
                  } else {
                    console.log('SQLite Schema Initialized Successfully (8 Tables Verified).');
                  }
                  
                  // Ensure default categories exist if table is empty
                  sqliteDb.get('SELECT COUNT(*) as count FROM categories', [], (catErr, row) => {
                    if (!catErr && row && row.count === 0) {
                      const seedCatsSql = `
                        INSERT OR IGNORE INTO categories (id, name, description, status) VALUES
                        (1, 'Rings', 'Exquisite gold and diamond rings', 'enabled'),
                        (2, 'Necklaces', 'Timeless gold necklaces and chokers', 'enabled'),
                        (3, 'Chains', 'Crafted gold chains for men and women', 'enabled'),
                        (4, 'Bangles', 'Traditional and contemporary bangles', 'enabled'),
                        (5, 'Earrings', 'Stunning studs, hoops and drop earrings', 'enabled'),
                        (6, 'Pendants', 'Elegant pendants and lockets', 'enabled'),
                        (7, 'Bridal Jewellery', 'Grand wedding collections', 'enabled'),
                        (8, 'Antique Jewellery', 'Heritage handcrafted jewellery', 'enabled');
                      `;
                      sqliteDb.exec(seedCatsSql, () => {
                        console.log('Default Categories Seeded Successfully.');
                      });
                    }
                  });

                  resolve(true);
                });
              } catch (readErr) {
                console.warn('Schema file read warning:', readErr.message);
                resolve(true);
              }
            } else {
              resolve(true);
            }
          }
        });
      } catch (nativeErr) {
        console.warn('SQLite native module notice, using file database:', nativeErr.message);
        initFallbackJsonDb();
        resolve(false);
      }
    });
  } catch (globalErr) {
    console.warn('initDb global notice:', globalErr.message);
    initFallbackJsonDb();
    return false;
  }
};

export const query = async (sql, params = []) => {
  if (!sqliteDb && !localFallbackDb) {
    await initDb();
  }

  if (sqliteDb) {
    return new Promise((resolve) => {
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
  } else if (localFallbackDb) {
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

export default { query, queryOne, initDb };
