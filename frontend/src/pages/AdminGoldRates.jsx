import React, { useState, useEffect } from 'react';
import { fetchGoldRates, updateGoldRates, syncLiveGoldRates } from '../services/api';
import { TrendingUp, Save, Clock, CheckCircle2, AlertCircle, RefreshCw, Zap } from 'lucide-react';

const AdminGoldRates = () => {
  const [rates, setRates] = useState([
    { purity: '24K', rate: 75500, unit: '10 grams' },
    { purity: '22K', rate: 69200, unit: '10 grams' },
    { purity: '18K', rate: 56600, unit: '10 grams' },
  ]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    setLoading(true);
    try {
      const res = await fetchGoldRates();
      if (res.data.success && res.data.rates?.length > 0) {
        setRates(res.data.rates);
        setLastUpdated(res.data.lastUpdated);
      }
    } catch (err) {
      console.warn('Error loading gold rates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncLive = async () => {
    setSyncing(true);
    setStatus(null);
    try {
      const res = await syncLiveGoldRates();
      if (res.data.success) {
        setRates(res.data.rates);
        setLastUpdated(res.data.lastUpdated);
        setStatus({ type: 'success', msg: 'Live market gold rates fetched and updated successfully!' });
      } else {
        setStatus({ type: 'error', msg: res.data.message || 'Failed to sync live rates.' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Failed to sync live market gold rates.' });
    } finally {
      setSyncing(false);
    }
  };

  const handleRateChange = (index, value) => {
    const updated = [...rates];
    updated[index].rate = value;
    setRates(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await updateGoldRates(rates);
      if (res.data.success) {
        setStatus({ type: 'success', msg: 'Gold rates updated successfully!' });
        setRates(res.data.rates);
        setLastUpdated(new Date());
      } else {
        setStatus({ type: 'error', msg: res.data.message || 'Failed to update rates.' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Failed to update gold rates.' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gold-400/20 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gold-gradient uppercase">GOLD RATE MANAGEMENT</h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time market rates and manual showroom gold rate controls.
          </p>
        </div>

        <button
          onClick={handleSyncLive}
          disabled={syncing}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-500 shadow transition-all"
        >
          <Zap className="w-4 h-4 text-emerald-200 fill-emerald-200" />
          <span>{syncing ? 'SYNCING LIVE RATES...' : 'SYNC LIVE MARKET RATES NOW'}</span>
        </button>
      </div>

      {status && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            status.type === 'success'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
              : 'bg-rose-950 text-rose-300 border border-rose-500/40'
          }`}
        >
          {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{status.msg}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-gray-400">Loading current gold rates...</div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-dark-800 p-8 rounded-3xl border border-gold-400/20 shadow-2xl space-y-8">
          
          <div className="flex items-center justify-between border-b border-gold-400/10 pb-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-gold-400" />
              <h2 className="font-serif text-xl font-bold text-white">Daily Gold Rates Setup</h2>
            </div>
            {lastUpdated && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gold-400" />
                Last Updated: {new Date(lastUpdated).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Rate Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rates.map((item, idx) => (
              <div key={item.purity} className="bg-dark-900 p-6 rounded-2xl border border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-lg font-bold text-gold-300">{item.purity} Gold</span>
                  <span className="text-[10px] text-gray-400 uppercase font-mono">Per {item.unit || '10 grams'}</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-400 uppercase block mb-1">
                    Rate in INR (₹)
                  </label>
                  <input
                    type="number"
                    required
                    step="1"
                    value={item.rate}
                    onChange={(e) => handleRateChange(idx, e.target.value)}
                    className="w-full bg-dark-800 text-gold-200 font-serif font-bold text-xl p-3 rounded-xl border border-gold-400/30 focus:outline-none focus:border-gold-400"
                  />
                </div>

                <p className="text-xs text-gray-400 text-center font-mono">
                  Preview: {formatPrice(item.rate)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 bg-gold-gradient text-dark-900 font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 shadow flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'UPDATING RATES...' : 'SAVE & PUBLISH GOLD RATES'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminGoldRates;
