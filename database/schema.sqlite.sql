-- DMD JEWELLERY SQLITE SCHEMA

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT DEFAULT 'enabled',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category_id INTEGER,
  price REAL NOT NULL DEFAULT 0.00,
  purity TEXT NOT NULL,
  weight REAL NOT NULL DEFAULT 0.00,
  description TEXT,
  availability TEXT DEFAULT 'In Stock',
  featured INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Published',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_product_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_product_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_status ON products(status);

CREATE TABLE IF NOT EXISTS product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  is_primary INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS gold_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  purity TEXT NOT NULL UNIQUE,
  rate REAL NOT NULL,
  unit TEXT DEFAULT '10 grams',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  product_id INTEGER DEFAULT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'New',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS shop_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_name TEXT DEFAULT 'DMD JEWELLERY',
  phone TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT,
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  pincode TEXT DEFAULT '',
  maps_url TEXT,
  latitude REAL DEFAULT NULL,
  longitude REAL DEFAULT NULL,
  opening_time TEXT DEFAULT '10:00 AM',
  closing_time TEXT DEFAULT '08:30 PM',
  holiday TEXT DEFAULT 'Sunday',
  about_text TEXT,
  logo_url TEXT DEFAULT '/dmd_logo.jpg',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS social_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  status TEXT DEFAULT 'enabled',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pwa_installations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  installation_id TEXT NOT NULL UNIQUE,
  platform TEXT DEFAULT 'web',
  installed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- DEFAULT SEED DATA (ZERO PRODUCTS)
INSERT OR IGNORE INTO categories (id, name, description, status) VALUES
(1, 'Rings', 'Exquisite gold and diamond rings', 'enabled'),
(2, 'Necklaces', 'Timeless gold necklaces and chokers', 'enabled'),
(3, 'Chains', 'Crafted gold chains for men and women', 'enabled'),
(4, 'Bangles', 'Traditional and contemporary bangles', 'enabled'),
(5, 'Earrings', 'Stunning studs, hoops and drop earrings', 'enabled'),
(6, 'Pendants', 'Elegant pendants and lockets', 'enabled'),
(7, 'Bridal Jewellery', 'Grand wedding collections', 'enabled'),
(8, 'Antique Jewellery', 'Heritage handcrafted jewellery', 'enabled');

INSERT OR IGNORE INTO gold_rates (id, purity, rate, unit) VALUES
(1, '24K', 75500.00, '10 grams'),
(2, '22K', 69200.00, '10 grams'),
(3, '18K', 56600.00, '10 grams');

INSERT OR IGNORE INTO shop_settings (id, business_name, phone, whatsapp, email, address, city, state, pincode, maps_url, opening_time, closing_time, holiday, about_text, logo_url)
VALUES (1, 'DMD JEWELLERY', '+91 9010322685', '9010322685', 'info@dmdjewellery.com', 'SHARAF BAZAR YEMMIGANUR, KURNOOL DIST', 'Yemmiganur', 'Andhra Pradesh', '518360', 'https://www.google.com/maps/search/?api=1&query=SHARAF+BAZAR+YEMMIGANUR+518360+KURNOOL+DIST', '10:00 AM', '08:30 PM', 'Saturday (Half Day)', 'DMD JEWELLERYS, owned by D MUDDASSIR, offers timeless elegance with beautifully crafted gold, diamond, and silver jewellery. Built on purity, craftsmanship, and customer trust.', '/dmd_logo.jpg');
