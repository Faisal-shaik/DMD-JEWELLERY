import { query, queryOne } from '../config/db.js';

// GET /api/settings (Public & Admin)
export const getSettings = async (req, res) => {
  try {
    let settings = await queryOne('SELECT * FROM shop_settings WHERE id = 1');
    if (!settings) {
      settings = {
        business_name: 'DMD JEWELLERY',
        phone: '',
        whatsapp: '',
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        maps_url: '',
        opening_time: '10:00 AM',
        closing_time: '08:30 PM',
        holiday: 'Sunday',
        about_text: 'DMD JEWELLERY offers timeless elegance with beautifully crafted gold, diamond, and silver jewellery.',
        logo_url: '/dmd_logo.jpg',
      };
    }

    const social = await query('SELECT * FROM social_links WHERE status = "enabled"');
    const socialMap = {};
    social.forEach((item) => {
      socialMap[item.platform.toLowerCase()] = item.url;
    });

    return res.json({
      success: true,
      settings: {
        ...settings,
        social: socialMap,
      },
    });
  } catch (error) {
    console.error('Get Settings Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve settings.' });
  }
};

// PUT /api/settings (Admin Update)
export const updateSettings = async (req, res) => {
  try {
    const {
      business_name,
      phone,
      whatsapp,
      email,
      address,
      city,
      state,
      pincode,
      maps_url,
      latitude,
      longitude,
      opening_time,
      closing_time,
      holiday,
      about_text,
      logo_url,
      instagram,
      facebook,
      youtube,
    } = req.body;

    // Handle logo image upload if uploaded via form data
    let logoPath = logo_url;
    if (req.file) {
      logoPath = `/uploads/${req.file.filename}`;
    }

    const existing = await queryOne('SELECT id FROM shop_settings WHERE id = 1');

    if (existing) {
      await query(
        `UPDATE shop_settings SET 
          business_name = ?,
          phone = ?,
          whatsapp = ?,
          email = ?,
          address = ?,
          city = ?,
          state = ?,
          pincode = ?,
          maps_url = ?,
          latitude = ?,
          longitude = ?,
          opening_time = ?,
          closing_time = ?,
          holiday = ?,
          about_text = ?,
          logo_url = COALESCE(?, logo_url),
          updated_at = CURRENT_TIMESTAMP
         WHERE id = 1`,
        [
          business_name || 'DMD JEWELLERY',
          phone !== undefined ? phone.trim() : '',
          whatsapp !== undefined ? whatsapp.trim() : '',
          email !== undefined ? email.trim() : '',
          address !== undefined ? address.trim() : '',
          city !== undefined ? city.trim() : '',
          state !== undefined ? state.trim() : '',
          pincode !== undefined ? pincode.trim() : '',
          maps_url !== undefined ? maps_url.trim() : '',
          latitude ? parseFloat(latitude) : null,
          longitude ? parseFloat(longitude) : null,
          opening_time !== undefined ? opening_time.trim() : '10:00 AM',
          closing_time !== undefined ? closing_time.trim() : '08:30 PM',
          holiday !== undefined ? holiday.trim() : 'Sunday',
          about_text !== undefined ? about_text.trim() : '',
          logoPath || null,
        ]
      );
    } else {
      await query(
        `INSERT INTO shop_settings 
        (id, business_name, phone, whatsapp, email, address, city, state, pincode, maps_url, latitude, longitude, opening_time, closing_time, holiday, about_text, logo_url)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          business_name || 'DMD JEWELLERY',
          phone ? phone.trim() : '',
          whatsapp ? whatsapp.trim() : '',
          email ? email.trim() : '',
          address ? address.trim() : '',
          city ? city.trim() : '',
          state ? state.trim() : '',
          pincode ? pincode.trim() : '',
          maps_url ? maps_url.trim() : '',
          latitude ? parseFloat(latitude) : null,
          longitude ? parseFloat(longitude) : null,
          opening_time ? opening_time.trim() : '10:00 AM',
          closing_time ? closing_time.trim() : '08:30 PM',
          holiday ? holiday.trim() : 'Sunday',
          about_text ? about_text.trim() : '',
          logoPath || '/dmd_logo.jpg',
        ]
      );
    }

    // Update Social Links
    const socials = [
      { platform: 'instagram', url: instagram },
      { platform: 'facebook', url: facebook },
      { platform: 'youtube', url: youtube },
    ];

    for (const item of socials) {
      if (item.url !== undefined) {
        const cleanUrl = item.url.trim();
        const found = await queryOne('SELECT id FROM social_links WHERE platform = ?', [item.platform]);
        if (cleanUrl === '') {
          if (found) {
            await query('UPDATE social_links SET status = "disabled", url = "" WHERE platform = ?', [item.platform]);
          }
        } else {
          if (found) {
            await query('UPDATE social_links SET url = ?, status = "enabled" WHERE platform = ?', [cleanUrl, item.platform]);
          } else {
            await query('INSERT INTO social_links (platform, url, status) VALUES (?, ?, "enabled")', [item.platform, cleanUrl]);
          }
        }
      }
    }

    const updatedSettings = await queryOne('SELECT * FROM shop_settings WHERE id = 1');
    const updatedSocial = await query('SELECT * FROM social_links WHERE status = "enabled"');
    const socialMap = {};
    updatedSocial.forEach((i) => {
      socialMap[i.platform.toLowerCase()] = i.url;
    });

    return res.json({
      success: true,
      message: 'Shop information updated successfully.',
      settings: { ...updatedSettings, social: socialMap },
    });
  } catch (error) {
    console.error('Update Settings Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update shop settings.' });
  }
};
