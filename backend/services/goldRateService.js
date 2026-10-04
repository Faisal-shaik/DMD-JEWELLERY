import { query, queryOne } from '../config/db.js';

// Cache live rates for 15 minutes
let lastFetchTime = 0;
const CACHE_DURATION = 15 * 60 * 1000;

export const fetchLiveGoldRatesFromAPI = async () => {
  try {
    // 1. Fetch live gold spot price in USD per troy ounce
    const goldRes = await fetch('https://api.gold-api.com/price/XAU');
    if (!goldRes.ok) throw new Error(`Gold API HTTP ${goldRes.status}`);
    const goldData = await goldRes.json();
    const goldPriceUSD = goldData.price; // price per troy oz in USD

    // 2. Fetch live USD to INR exchange rate
    const inrRes = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!inrRes.ok) throw new Error(`Exchange Rate API HTTP ${inrRes.status}`);
    const inrData = await inrRes.json();
    const usdToInr = inrData.rates?.INR || 83.9;

    // 3. Convert 1 troy oz (31.1034768 grams) -> 10 grams in INR
    // Include Indian import duty, agriculture cess & GST (~15% total duty/tax margin)
    const baseRawPrice10gINR = (goldPriceUSD / 31.1034768) * 10 * usdToInr;
    const indianMarketMultiplier = 1.15; // standard Indian bullion market duty/tax factor

    const rate24k = Math.round((baseRawPrice10gINR * indianMarketMultiplier) / 10) * 10;
    const rate22k = Math.round((rate24k * (22 / 24)) / 10) * 10;
    const rate18k = Math.round((rate24k * (18 / 24)) / 10) * 10;

    const nowISO = new Date().toISOString();

    const liveRates = [
      { purity: '24K', rate: rate24k, unit: '10 grams', updated_at: nowISO, is_live: 1 },
      { purity: '22K', rate: rate22k, unit: '10 grams', updated_at: nowISO, is_live: 1 },
      { purity: '18K', rate: rate18k, unit: '10 grams', updated_at: nowISO, is_live: 1 },
    ];

    // Update database
    for (const item of liveRates) {
      const existing = await queryOne('SELECT id FROM gold_rates WHERE purity = ?', [item.purity]);
      if (existing) {
        await query(
          'UPDATE gold_rates SET rate = ?, unit = ?, updated_at = CURRENT_TIMESTAMP WHERE purity = ?',
          [item.rate, item.unit, item.purity]
        );
      } else {
        await query('INSERT INTO gold_rates (purity, rate, unit) VALUES (?, ?, ?)', [
          item.purity,
          item.rate,
          item.unit,
        ]);
      }
    }

    lastFetchTime = Date.now();
    console.log(`Live Gold Rates Refreshed: 24K=₹${rate24k}, 22K=₹${rate22k}, 18K=₹${rate18k} per 10g`);
    return { success: true, rates: liveRates, lastUpdated: nowISO };
  } catch (error) {
    console.warn('Live Gold Rate API Fetch Warning:', error.message);
    return { success: false, error: error.message };
  }
};

export const getOrSyncGoldRates = async (forceSync = false) => {
  const now = Date.now();
  if (forceSync || now - lastFetchTime > CACHE_DURATION) {
    await fetchLiveGoldRatesFromAPI();
  }
  const rates = await query('SELECT * FROM gold_rates ORDER BY purity DESC');
  const lastUpdated = rates.length > 0 ? rates[0].updated_at : new Date();
  return { rates, lastUpdated, isLive: true };
};
