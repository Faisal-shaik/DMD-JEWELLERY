import { query, queryOne } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to format uploaded image URLs
const getImageUrl = (filename) => {
  if (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('/')) {
    return filename;
  }
  return `/uploads/${filename}`;
};

// GET /api/products (Public Catalogue & Admin Listing)
export const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      purity,
      minPrice,
      maxPrice,
      availability,
      featured,
      status,
      sort,
      isAdmin,
    } = req.query;

    let sql = `
      SELECT p.*, c.name as category_name, 
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, display_order ASC, id ASC LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by Status (Public catalogue ONLY shows Published products)
    if (isAdmin === 'true' && status) {
      if (status !== 'all') {
        sql += ` AND p.status = ?`;
        params.push(status);
      }
    } else if (!isAdmin || isAdmin !== 'true') {
      sql += ` AND p.status = 'Published'`;
    }

    // Filter by Search Query (Name, Product Code, Description, Category Name)
    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      sql += ` AND (p.name LIKE ? OR p.product_code LIKE ? OR p.description LIKE ? OR c.name LIKE ?)`;
      params.push(term, term, term, term);
    }

    // Filter by Category
    if (category) {
      if (!isNaN(category)) {
        sql += ` AND p.category_id = ?`;
        params.push(Number(category));
      } else {
        sql += ` AND c.name = ?`;
        params.push(category);
      }
    }

    // Filter by Gold Purity
    if (purity) {
      sql += ` AND p.purity = ?`;
      params.push(purity);
    }

    // Filter by Price Range
    if (minPrice && !isNaN(minPrice)) {
      sql += ` AND p.price >= ?`;
      params.push(Number(minPrice));
    }
    if (maxPrice && !isNaN(maxPrice)) {
      sql += ` AND p.price <= ?`;
      params.push(Number(maxPrice));
    }

    // Filter by Availability
    if (availability) {
      sql += ` AND p.availability = ?`;
      params.push(availability);
    }

    // Filter by Featured
    if (featured === '1' || featured === 'true') {
      sql += ` AND p.featured = 1`;
    }

    // Sorting
    switch (sort) {
      case 'price-asc':
        sql += ` ORDER BY p.price ASC`;
        break;
      case 'price-desc':
        sql += ` ORDER BY p.price DESC`;
        break;
      case 'name-asc':
        sql += ` ORDER BY p.name ASC`;
        break;
      case 'name-desc':
        sql += ` ORDER BY p.name DESC`;
        break;
      case 'oldest':
        sql += ` ORDER BY p.created_at ASC`;
        break;
      case 'latest':
      default:
        sql += ` ORDER BY p.created_at DESC`;
        break;
    }

    const products = await query(sql, params);

    // Attach all images array to each product for frontend flexibility
    const productIds = products.map((p) => p.id);
    let allImagesMap = {};

    if (productIds.length > 0) {
      const placeholders = productIds.map(() => '?').join(',');
      const images = await query(
        `SELECT * FROM product_images WHERE product_id IN (${placeholders}) ORDER BY display_order ASC, id ASC`,
        productIds
      );
      images.forEach((img) => {
        if (!allImagesMap[img.product_id]) allImagesMap[img.product_id] = [];
        allImagesMap[img.product_id].push(img);
      });
    }

    const formattedProducts = products.map((prod) => ({
      ...prod,
      images: allImagesMap[prod.id] || [],
      primary_image: prod.primary_image || (allImagesMap[prod.id]?.[0]?.image_url ?? null),
    }));

    return res.json({
      success: true,
      count: formattedProducts.length,
      products: formattedProducts,
    });
  } catch (error) {
    console.error('Get Products Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve products from database.' });
  }
};

// GET /api/products/:id (Single Product Details)
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    let product = null;
    if (!isNaN(id)) {
      product = await queryOne(
        `SELECT p.*, c.name as category_name 
         FROM products p 
         LEFT JOIN categories c ON p.category_id = c.id 
         WHERE p.id = ?`,
        [Number(id)]
      );
    } else {
      product = await queryOne(
        `SELECT p.*, c.name as category_name 
         FROM products p 
         LEFT JOIN categories c ON p.category_id = c.id 
         WHERE p.product_code = ?`,
        [id]
      );
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const images = await query(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC, id ASC',
      [product.id]
    );

    return res.json({
      success: true,
      product: {
        ...product,
        images: images,
        primary_image: images.find((i) => i.is_primary === 1)?.image_url || images[0]?.image_url || null,
      },
    });
  } catch (error) {
    console.error('Get Product Detail Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve product details.' });
  }
};

// POST /api/products (Admin Create Product)
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      category_id,
      price,
      purity,
      weight,
      description,
      availability,
      featured,
      status,
      product_code,
    } = req.body;

    if (!name || !purity) {
      return res.status(400).json({ success: false, message: 'Product Name and Gold Purity are required.' });
    }

    // Auto-generate Product Code if empty
    let code = product_code ? product_code.trim().toUpperCase() : '';
    if (!code) {
      const countRes = await queryOne('SELECT COUNT(*) as total FROM products');
      const nextNum = (countRes?.total || 0) + 1;
      code = `DMD-JWL-${String(nextNum).padStart(4, '0')}`;
    }

    // Check duplicate code
    const existing = await queryOne('SELECT id FROM products WHERE product_code = ?', [code]);
    if (existing) {
      code = `${code}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const result = await query(
      `INSERT INTO products 
      (product_code, name, category_id, price, purity, weight, description, availability, featured, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code,
        name.trim(),
        category_id ? Number(category_id) : null,
        price ? parseFloat(price) : 0.0,
        purity.trim(),
        weight ? parseFloat(weight) : 0.0,
        description ? description.trim() : '',
        availability || 'In Stock',
        featured === 'true' || featured === '1' || featured === true ? 1 : 0,
        status || 'Published',
      ]
    );

    const productId = result.insertId;

    // Handle Uploaded Image Files (from multer multi-upload)
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageUrl = `/uploads/${file.filename}`;
        const isPrimary = i === 0 ? 1 : 0;
        await query(
          'INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)',
          [productId, imageUrl, isPrimary, i]
        );
      }
    }

    const createdProduct = await queryOne('SELECT * FROM products WHERE id = ?', [productId]);
    const images = await query('SELECT * FROM product_images WHERE product_id = ?', [productId]);

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product: { ...createdProduct, images },
    });
  } catch (error) {
    console.error('Create Product Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
};

// PUT /api/products/:id (Admin Edit Product)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category_id,
      price,
      purity,
      weight,
      description,
      availability,
      featured,
      status,
      product_code,
    } = req.body;

    const existing = await queryOne('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await query(
      `UPDATE products SET 
        product_code = ?,
        name = ?,
        category_id = ?,
        price = ?,
        purity = ?,
        weight = ?,
        description = ?,
        availability = ?,
        featured = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        product_code ? product_code.trim().toUpperCase() : existing.product_code,
        name ? name.trim() : existing.name,
        category_id !== undefined ? (category_id ? Number(category_id) : null) : existing.category_id,
        price !== undefined ? parseFloat(price) : existing.price,
        purity ? purity.trim() : existing.purity,
        weight !== undefined ? parseFloat(weight) : existing.weight,
        description !== undefined ? description.trim() : existing.description,
        availability || existing.availability,
        featured !== undefined ? (featured === 'true' || featured === '1' || featured === true ? 1 : 0) : existing.featured,
        status || existing.status,
        id,
      ]
    );

    // Handle Uploaded Images if any new images were uploaded during edit
    if (req.files && req.files.length > 0) {
      const existingImagesCount = await queryOne('SELECT COUNT(*) as total FROM product_images WHERE product_id = ?', [id]);
      const hasPrimary = existingImagesCount?.total > 0;

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageUrl = `/uploads/${file.filename}`;
        const isPrimary = !hasPrimary && i === 0 ? 1 : 0;
        await query(
          'INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)',
          [id, imageUrl, isPrimary, (existingImagesCount?.total || 0) + i]
        );
      }
    }

    const updatedProduct = await queryOne('SELECT * FROM products WHERE id = ?', [id]);
    const images = await query('SELECT * FROM product_images WHERE product_id = ?', [id]);

    return res.json({
      success: true,
      message: 'Product updated successfully.',
      product: { ...updatedProduct, images },
    });
  } catch (error) {
    console.error('Update Product Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
};

// DELETE /api/products/:id (Admin Delete Product)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await queryOne('SELECT * FROM products WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Get images to cleanup local upload files
    const images = await query('SELECT * FROM product_images WHERE product_id = ?', [id]);
    for (const img of images) {
      if (img.image_url.startsWith('/uploads/')) {
        const localPath = path.resolve(__dirname, '../../', img.image_url.substring(1));
        if (fs.existsSync(localPath)) {
          try {
            fs.unlinkSync(localPath);
          } catch (e) {
            console.warn('Failed to delete image file:', localPath);
          }
        }
      }
    }

    // Delete product (Cascade deletes product_images)
    await query('DELETE FROM product_images WHERE product_id = ?', [id]);
    await query('DELETE FROM products WHERE id = ?', [id]);

    return res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Delete Product Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
};

// DELETE /api/products/clear/all (Admin Clear All Products)
export const clearAllProducts = async (req, res) => {
  try {
    const products = await query('SELECT * FROM products');
    for (const prod of products) {
      const images = await query('SELECT * FROM product_images WHERE product_id = ?', [prod.id]);
      for (const img of images) {
        if (img.image_url && img.image_url.startsWith('/uploads/')) {
          const localPath = path.resolve(__dirname, '../../', img.image_url.substring(1));
          if (fs.existsSync(localPath)) {
            try {
              fs.unlinkSync(localPath);
            } catch (e) {
              console.warn('Failed to delete image file:', localPath);
            }
          }
        }
      }
    }

    await query('DELETE FROM product_images');
    await query('DELETE FROM products');

    return res.json({ success: true, message: 'All products cleared successfully.' });
  } catch (error) {
    console.error('Clear All Products Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to clear products.' });
  }
};

// POST /api/products/:id/images (Upload additional images)
export const uploadProductImages = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No image files uploaded.' });
    }

    const existingImages = await query('SELECT * FROM product_images WHERE product_id = ?', [id]);
    const hasPrimary = existingImages.some((i) => i.is_primary === 1);

    const inserted = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const imageUrl = `/uploads/${file.filename}`;
      const isPrimary = !hasPrimary && i === 0 ? 1 : 0;
      const resVal = await query(
        'INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)',
        [id, imageUrl, isPrimary, existingImages.length + i]
      );
      inserted.push({ id: resVal.insertId, product_id: id, image_url: imageUrl, is_primary: isPrimary });
    }

    return res.json({ success: true, message: 'Images uploaded successfully.', images: inserted });
  } catch (error) {
    console.error('Image Upload Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload images.' });
  }
};

// DELETE /api/images/:id (Delete Image)
export const deleteProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await queryOne('SELECT * FROM product_images WHERE id = ?', [id]);

    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found.' });
    }

    if (image.image_url.startsWith('/uploads/')) {
      const localPath = path.resolve(__dirname, '../../', image.image_url.substring(1));
      if (fs.existsSync(localPath)) {
        try {
          fs.unlinkSync(localPath);
        } catch (e) {
          console.warn('Failed to delete file:', localPath);
        }
      }
    }

    await query('DELETE FROM product_images WHERE id = ?', [id]);

    // If deleted image was primary, set another as primary
    if (image.is_primary === 1) {
      const remaining = await queryOne('SELECT id FROM product_images WHERE product_id = ? LIMIT 1', [image.product_id]);
      if (remaining) {
        await query('UPDATE product_images SET is_primary = 1 WHERE id = ?', [remaining.id]);
      }
    }

    return res.json({ success: true, message: 'Image deleted successfully.' });
  } catch (error) {
    console.error('Delete Image Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete image.' });
  }
};

// PUT /api/images/:id/primary (Set Primary Image)
export const setPrimaryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await queryOne('SELECT * FROM product_images WHERE id = ?', [id]);

    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found.' });
    }

    await query('UPDATE product_images SET is_primary = 0 WHERE product_id = ?', [image.product_id]);
    await query('UPDATE product_images SET is_primary = 1 WHERE id = ?', [id]);

    return res.json({ success: true, message: 'Primary image updated.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to set primary image.' });
  }
};
