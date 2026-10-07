-- DMD JEWELLERY POSTGRESQL DATABASE SCHEMA (SUPABASE / NEON / CLOUD COMPATIBLE)

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  status VARCHAR(20) DEFAULT 'enabled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  product_code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  purity VARCHAR(50) NOT NULL,
  weight NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  description TEXT,
  availability VARCHAR(50) DEFAULT 'In Stock',
  featured INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Published',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_product_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_product_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_product_status ON products(status);

CREATE TABLE IF NOT EXISTS product_images (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary INT DEFAULT 0,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gold_rates (
  id SERIAL PRIMARY KEY,
  purity VARCHAR(20) NOT NULL UNIQUE,
  rate NUMERIC(12, 2) NOT NULL,
  unit VARCHAR(20) DEFAULT '10 grams',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enquiries (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(150),
  product_id INT REFERENCES products(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'New',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shop_settings (
  id INT PRIMARY KEY DEFAULT 1,
  business_name VARCHAR(150) DEFAULT 'DMD JEWELLERY',
  phone VARCHAR(30) DEFAULT '',
  whatsapp VARCHAR(30) DEFAULT '',
  email VARCHAR(150) DEFAULT '',
  address TEXT,
  city VARCHAR(100) DEFAULT '',
  state VARCHAR(100) DEFAULT '',
  pincode VARCHAR(20) DEFAULT '',
  maps_url TEXT,
  latitude NUMERIC(10, 8) DEFAULT NULL,
  longitude NUMERIC(11, 8) DEFAULT NULL,
  opening_time VARCHAR(50) DEFAULT '10:00 AM',
  closing_time VARCHAR(50) DEFAULT '08:30 PM',
  holiday VARCHAR(50) DEFAULT 'Sunday',
  about_text TEXT,
  logo_url VARCHAR(500) DEFAULT '/dmd_logo.jpg',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS social_links (
  id SERIAL PRIMARY KEY,
  platform VARCHAR(50) NOT NULL UNIQUE,
  url VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'enabled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pwa_installations (
  id SERIAL PRIMARY KEY,
  installation_id VARCHAR(100) NOT NULL UNIQUE,
  platform VARCHAR(50) DEFAULT 'web',
  installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DEFAULT SEED DATA
INSERT INTO categories (id, name, description, status) VALUES
(1, 'Rings', 'Exquisite gold and diamond rings', 'enabled'),
(2, 'Necklaces', 'Timeless gold necklaces and chokers', 'enabled'),
(3, 'Chains', 'Crafted gold chains for men and women', 'enabled'),
(4, 'Bangles', 'Traditional and contemporary bangles', 'enabled'),
(5, 'Earrings', 'Stunning studs, hoops and drop earrings', 'enabled'),
(6, 'Pendants', 'Elegant pendants and lockets', 'enabled'),
(7, 'Bridal Jewellery', 'Grand wedding collections', 'enabled'),
(8, 'Antique Jewellery', 'Heritage handcrafted jewellery', 'enabled')
ON CONFLICT (name) DO NOTHING;

INSERT INTO gold_rates (id, purity, rate, unit) VALUES
(1, '24K', 75500.00, '10 grams'),
(2, '22K', 69200.00, '10 grams'),
(3, '18K', 56600.00, '10 grams')
ON CONFLICT (purity) DO NOTHING;

INSERT INTO shop_settings (id, business_name, phone, whatsapp, email, address, city, state, pincode, maps_url, opening_time, closing_time, holiday, about_text, logo_url)
VALUES (1, 'DMD JEWELLERY', '+91 9010322685', '9010322685', 'info@dmdjewellery.com', 'SHARAF BAZAR YEMMIGANUR, KURNOOL DIST', 'Yemmiganur', 'Andhra Pradesh', '518360', 'https://www.google.com/maps/search/?api=1&query=SHARAF+BAZAR+YEMMIGANUR+518360+KURNOOL+DIST', '10:00 AM', '08:30 PM', 'Saturday (Half Day)', 'DMD JEWELLERYS, owned by D MUDDASSIR, offers timeless elegance with beautifully crafted gold, diamond, and silver jewellery. Built on purity, craftsmanship, and customer trust.', '/dmd_logo.jpg')
ON CONFLICT (id) DO NOTHING;
