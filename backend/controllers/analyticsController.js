import { query, queryOne, getActiveDbType } from '../config/db.js';

// POST /api/analytics/pwa-install (Anonymous PWA installation tracking)
export const logPWAInstallation = async (req, res) => {
  try {
    const { installation_id, platform } = req.body;

    if (!installation_id || typeof installation_id !== 'string') {
      return res.status(400).json({ success: false, message: 'installation_id is required.' });
    }

    const cleanId = installation_id.trim();
    const cleanPlatform = platform ? String(platform).trim().toLowerCase().slice(0, 50) : 'web';

    const existing = await queryOne('SELECT id FROM pwa_installations WHERE installation_id = ?', [cleanId]);

    if (existing) {
      await query('UPDATE pwa_installations SET last_seen_at = CURRENT_TIMESTAMP WHERE installation_id = ?', [cleanId]);
      return res.json({ success: true, message: 'PWA installation heartbeat updated.' });
    } else {
      await query('INSERT INTO pwa_installations (installation_id, platform) VALUES (?, ?)', [
        cleanId,
        cleanPlatform,
      ]);
      return res.status(201).json({ success: true, message: 'PWA installation recorded successfully.' });
    }
  } catch (error) {
    console.error('Log PWA Installation Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record PWA installation.' });
  }
};

// GET /api/analytics/pwa-stats (Admin dashboard statistics)
export const getPWAInstallStats = async (req, res) => {
  try {
    const dbType = getActiveDbType();

    let totalRes = 0;
    let todayRes = 0;
    let weekRes = 0;
    let monthRes = 0;

    const totalObj = await queryOne('SELECT COUNT(*) as total FROM pwa_installations');
    totalRes = Number(totalObj?.total || totalObj?.count || 0);

    if (dbType === 'postgres') {
      const todayObj = await queryOne("SELECT COUNT(*) as count FROM pwa_installations WHERE installed_at >= CURRENT_DATE");
      const weekObj = await queryOne("SELECT COUNT(*) as count FROM pwa_installations WHERE installed_at >= (CURRENT_DATE - INTERVAL '7 days')");
      const monthObj = await queryOne("SELECT COUNT(*) as count FROM pwa_installations WHERE installed_at >= (CURRENT_DATE - INTERVAL '30 days')");
      
      todayRes = Number(todayObj?.count || 0);
      weekRes = Number(weekObj?.count || 0);
      monthRes = Number(monthObj?.count || 0);
    } else {
      const todayObj = await queryOne("SELECT COUNT(*) as count FROM pwa_installations WHERE date(installed_at) = date('now')");
      const weekObj = await queryOne("SELECT COUNT(*) as count FROM pwa_installations WHERE installed_at >= datetime('now', '-7 days')");
      const monthObj = await queryOne("SELECT COUNT(*) as count FROM pwa_installations WHERE installed_at >= datetime('now', '-30 days')");

      todayRes = Number(todayObj?.count || 0);
      weekRes = Number(weekObj?.count || 0);
      monthRes = Number(monthObj?.count || 0);
    }

    return res.json({
      success: true,
      stats: {
        totalInstallations: totalRes,
        todayInstallations: todayRes,
        thisWeekInstallations: weekRes,
        thisMonthInstallations: monthRes,
      },
    });
  } catch (error) {
    console.error('Get PWA Stats Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve PWA installation statistics.' });
  }
};

export default { logPWAInstallation, getPWAInstallStats };
