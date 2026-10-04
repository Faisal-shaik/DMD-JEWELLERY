import { query, queryOne } from '../config/db.js';
import { getOrSyncGoldRates, fetchLiveGoldRatesFromAPI } from '../services/goldRateService.js';

// GET /api/gold-rates
export const getGoldRates = async (req, res) => {
  try {
    const forceSync = req.query.sync === 'true';
    const data = await getOrSyncGoldRates(forceSync);

    return res.json({
      success: true,
      rates: data.rates,
      lastUpdated: data.lastUpdated,
      isLive: true,
    });
  } catch (error) {
    console.error('Get Gold Rates Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch gold rates.' });
  }
};

// POST /api/gold-rates/sync (Manual Trigger Live Sync)
export const syncLiveGoldRates = async (req, res) => {
  try {
    const result = await fetchLiveGoldRatesFromAPI();
    if (result.success) {
      return res.json({
        success: true,
        message: 'Live market gold rates updated successfully!',
        rates: result.rates,
        lastUpdated: result.lastUpdated,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: `Unable to sync live gold rates: ${result.error}`,
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to sync live gold rates.' });
  }
};

// PUT /api/gold-rates (Admin Manual Override)
export const updateGoldRates = async (req, res) => {
  try {
    const { rates } = req.body;

    if (!Array.isArray(rates) || rates.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid payload. Expecting array of rates.' });
    }

    for (const item of rates) {
      const { purity, rate, unit } = item;
      if (!purity || rate === undefined) continue;

      const existing = await queryOne('SELECT id FROM gold_rates WHERE purity = ?', [purity]);
      if (existing) {
        await query(
          'UPDATE gold_rates SET rate = ?, unit = ?, updated_at = CURRENT_TIMESTAMP WHERE purity = ?',
          [parseFloat(rate), unit || '10 grams', purity]
        );
      } else {
        await query('INSERT INTO gold_rates (purity, rate, unit) VALUES (?, ?, ?)', [
          purity,
          parseFloat(rate),
          unit || '10 grams',
        ]);
      }
    }

    const updatedRates = await query('SELECT * FROM gold_rates ORDER BY purity DESC');
    return res.json({
      success: true,
      message: 'Gold rates updated successfully.',
      rates: updatedRates,
    });
  } catch (error) {
    console.error('Update Gold Rates Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update gold rates.' });
  }
};
