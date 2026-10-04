import React, { useState, useEffect } from 'react';
import { fetchGoldRates } from '../services/api';
import { TrendingUp, Clock, Sparkles, RefreshCw } from 'lucide-react';

const GoldRateCard = () => {
  const [rates, setRates] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadRates = async (forceSync = false) => {
    if (forceSync) setSyncing(true);
    try {
      const res = await fetchGoldRates(forceSync ? { sync: 'true' } : {});
      if (res.data.success) {
        setRates(res.data.rates || []);
        setLastUpdated(res.data.lastUpdated);
      }
    } catch (err) {
      console.warn('Failed to load gold rates:', err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadRates();
  }, []);

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && rates.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-dark-800 via-dark-700 to-dark-800 rounded-3xl border border-gold-400/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
        {/* Title Header */}
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-gold-gradient p-0.5 shadow-xl flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-dark-900 rounded-[14px] flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-gold-400" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="font-serif text-2xl font-bold text-gold-gradient uppercase tracking-wide">
                TODAY'S GOLD RATE IN INDIA
              </h3>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE MARKET DATA</span>
              </span>
            </div>

            <p className="text-xs text-gray-400 flex items-center justify-center sm:justify-start gap-1.5 font-sans">
              <Clock className="w-3.5 h-3.5 text-gold-400" />
              <span>Real-Time Rates • Updated: {formatDate(lastUpdated)}</span>
              <button
                onClick={() => loadRates(true)}
                disabled={syncing}
                className="ml-2 text-gold-400 hover:text-white transition-colors"
                title="Refresh Live Rates"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              </button>
            </p>
          </div>
        </div>

        {/* Rates Display Grid */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full lg:w-auto">
          {rates.map((item) => (
            <div
              key={item.purity}
              className="bg-dark-900/90 border border-gold-400/30 hover:border-gold-400/80 rounded-2xl p-4 sm:p-5 text-center shadow-lg transition-all duration-300"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block font-mono">
                {item.purity} Gold
              </span>
              <span className="font-serif text-lg sm:text-2xl font-bold text-gold-gradient block my-1">
                {formatPrice(item.rate)}
              </span>
              <span className="text-[10px] text-gold-400/80 uppercase font-sans block">
                per {item.unit || '10 grams'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GoldRateCard;
