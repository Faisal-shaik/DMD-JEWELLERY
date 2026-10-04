import { query, queryOne } from '../config/db.js';

// POST /api/enquiries (Customer Submit)
export const createEnquiry = async (req, res) => {
  try {
    const { customer_name, phone, email, product_id, message } = req.body;

    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your full name.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your phone number.' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter a message or enquiry details.' });
    }

    const result = await query(
      `INSERT INTO enquiries (customer_name, phone, email, product_id, message, status) VALUES (?, ?, ?, ?, ?, 'New')`,
      [
        customer_name.trim(),
        phone.trim(),
        email ? email.trim() : null,
        product_id ? Number(product_id) : null,
        message.trim(),
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Your enquiry has been submitted successfully. Our team will contact you shortly.',
      enquiryId: result.insertId,
    });
  } catch (error) {
    console.error('Create Enquiry Error:', error);
    return res.status(500).json({ success: false, message: 'Unable to send enquiry. Please try again.' });
  }
};

// GET /api/enquiries (Admin List)
export const getEnquiries = async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT e.*, p.name as product_name, p.product_code 
      FROM enquiries e
      LEFT JOIN products p ON e.product_id = p.id
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ` WHERE e.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY e.created_at DESC`;

    const enquiries = await query(sql, params);
    return res.json({ success: true, count: enquiries.length, enquiries });
  } catch (error) {
    console.error('Get Enquiries Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve enquiries.' });
  }
};

// PUT /api/enquiries/:id (Admin Update Status)
export const updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['New', 'Contacted', 'Closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value. Must be New, Contacted, or Closed.' });
    }

    const existing = await queryOne('SELECT id FROM enquiries WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }

    await query('UPDATE enquiries SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);

    return res.json({ success: true, message: `Enquiry marked as ${status}.` });
  } catch (error) {
    console.error('Update Enquiry Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update enquiry status.' });
  }
};

// DELETE /api/enquiries/:id (Admin Delete)
export const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await queryOne('SELECT id FROM enquiries WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }

    await query('DELETE FROM enquiries WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Enquiry deleted successfully.' });
  } catch (error) {
    console.error('Delete Enquiry Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete enquiry.' });
  }
};
