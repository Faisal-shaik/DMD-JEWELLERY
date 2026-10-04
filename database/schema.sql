-- DMD JEWELLERY MYSQL DATABASE SCHEMA

CREATE DATABASE IF NOT EXISTS `dmd_jewellery` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `dmd_jewellery`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) DEFAULT 'admin',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `status` ENUM('enabled', 'disabled') DEFAULT 'enabled',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Products Table
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(200) NOT NULL,
  `category_id` INT,
  `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `purity` VARCHAR(50) NOT NULL,
  `weight` DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
  `description` TEXT,
  `availability` ENUM('In Stock', 'Out of Stock', 'Available on Request') DEFAULT 'In Stock',
  `featured` TINYINT(1) DEFAULT 0,
  `status` ENUM('Published', 'Draft', 'Hidden') DEFAULT 'Published',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
  INDEX `idx_product_name` (`name`),
  INDEX `idx_product_code` (`product_code`),
  INDEX `idx_category` (`category_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Product Images Table
CREATE TABLE IF NOT EXISTS `product_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `is_primary` TINYINT(1) DEFAULT 0,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Gold Rates Table
CREATE TABLE IF NOT EXISTS `gold_rates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `purity` VARCHAR(20) NOT NULL UNIQUE,
  `rate` DECIMAL(10, 2) NOT NULL,
  `unit` VARCHAR(20) DEFAULT '10 grams',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Customer Enquiries Table
CREATE TABLE IF NOT EXISTS `enquiries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `email` VARCHAR(150),
  `product_id` INT DEFAULT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('New', 'Contacted', 'Closed') DEFAULT 'New',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Shop Settings Table
CREATE TABLE IF NOT EXISTS `shop_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `business_name` VARCHAR(150) DEFAULT 'DMD JEWELLERY',
  `phone` VARCHAR(30) DEFAULT '',
  `whatsapp` VARCHAR(30) DEFAULT '',
  `email` VARCHAR(150) DEFAULT '',
  `address` TEXT,
  `city` VARCHAR(100) DEFAULT '',
  `state` VARCHAR(100) DEFAULT '',
  `pincode` VARCHAR(20) DEFAULT '',
  `maps_url` TEXT,
  `latitude` DECIMAL(10, 8) DEFAULT NULL,
  `longitude` DECIMAL(11, 8) DEFAULT NULL,
  `opening_time` VARCHAR(50) DEFAULT '10:00 AM',
  `closing_time` VARCHAR(50) DEFAULT '08:30 PM',
  `holiday` VARCHAR(50) DEFAULT 'Sunday',
  `about_text` TEXT,
  `logo_url` VARCHAR(500) DEFAULT '/dmd_logo.jpg',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Social Links Table
CREATE TABLE IF NOT EXISTS `social_links` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `platform` VARCHAR(50) NOT NULL UNIQUE,
  `url` VARCHAR(255) NOT NULL,
  `status` ENUM('enabled', 'disabled') DEFAULT 'enabled',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- DEFAULT SEED DATA (NO PRODUCTS)
INSERT INTO `gold_rates` (`purity`, `rate`, `unit`) VALUES
('24K', 75500.00, '10 grams'),
('22K', 69200.00, '10 grams'),
('18K', 56600.00, '10 grams')
ON DUPLICATE KEY UPDATE `rate` = VALUES(`rate`);

INSERT INTO `categories` (`name`, `description`, `status`) VALUES
('Rings', 'Exquisite gold and diamond rings', 'enabled'),
('Necklaces', 'Timeless gold necklaces and chokers', 'enabled'),
('Chains', 'Crafted gold chains for men and women', 'enabled'),
('Bangles', 'Traditional and contemporary bangles', 'enabled'),
('Earrings', 'Stunning studs, hoops and drop earrings', 'enabled'),
('Pendants', 'Elegant pendants and lockets', 'enabled'),
('Bridal Jewellery', 'Grand wedding collections', 'enabled'),
('Antique Jewellery', 'Heritage handcrafted jewellery', 'enabled')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `shop_settings` (`id`, `business_name`, `phone`, `whatsapp`, `email`, `address`, `city`, `state`, `pincode`, `maps_url`, `opening_time`, `closing_time`, `holiday`, `about_text`, `logo_url`)
VALUES (1, 'DMD JEWELLERY', '+91 98765 43210', '+91 98765 43210', 'info@dmdjewellery.com', 'Main Market, Jewellery Hub', 'Mumbai', 'Maharashtra', '400001', 'https://maps.google.com', '10:00 AM', '08:30 PM', 'Sunday', 'DMD JEWELLERY offers timeless elegance with beautifully crafted gold, diamond, and silver jewellery. Built on purity, craftsmanship, and customer trust.', '/dmd_logo.jpg')
ON DUPLICATE KEY UPDATE `business_name` = VALUES(`business_name`);
