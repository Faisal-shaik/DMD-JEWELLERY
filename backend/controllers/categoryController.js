import { query, queryOne } from '../config/db.js';

// GET /api/categories
export const getCategories = async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'Published'
    `;

    if (status && status !== 'all') {
      sql += ` WHERE c.status = ?`;
      sql += ` GROUP BY c.id ORDER BY c.name ASC`;
      const categories = await query(sql, [status]);
      return res.json({ success: true, categories });
    } else {
      sql += ` GROUP BY c.id ORDER BY c.name ASC`;
      const categories = await query(sql);
      return res.json({ success: true, categories });
    }
  } catch (error) {
    console.error('Get Categories Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
};

// POST /api/categories
export const createCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category Name is required.' });
    }

    const existing = await queryOne('SELECT id FROM categories WHERE LOWER(name) = LOWER(?)', [name.trim()]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'A category with this name already exists.' });
    }

    const result = await query('INSERT INTO categories (name, description, status) VALUES (?, ?, ?)', [
      name.trim(),
      description ? description.trim() : '',
      status || 'enabled',
    ]);

    const created = await queryOne('SELECT * FROM categories WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category: created,
    });
  } catch (error) {
    console.error('Create Category Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
};

// PUT /api/categories/:id
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const existing = await queryOne('SELECT * FROM categories WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    if (name && name.trim().toLowerCase() !== existing.name.toLowerCase()) {
      const duplicate = await queryOne('SELECT id FROM categories WHERE LOWER(name) = LOWER(?) AND id != ?', [
        name.trim(),
        id,
      ]);
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'Another category with this name already exists.' });
      }
    }

    await query(
      'UPDATE categories SET name = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [
        name ? name.trim() : existing.name,
        description !== undefined ? description.trim() : existing.description,
        status || existing.status,
        id,
      ]
    );

    const updated = await queryOne('SELECT * FROM categories WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Category updated successfully.', category: updated });
  } catch (error) {
    console.error('Update Category Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
};

// DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await queryOne('SELECT * FROM categories WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    // Set category_id to NULL on attached products before deleting
    await query('UPDATE products SET category_id = NULL WHERE category_id = ?', [id]);
    await query('DELETE FROM categories WHERE id = ?', [id]);

    return res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    console.error('Delete Category Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
};
