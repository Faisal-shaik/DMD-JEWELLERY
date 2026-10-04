import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Lock, Mail, ShieldCheck, AlertCircle } from 'lucide-react';

const AdminLogin = () => {
  const { login } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid admin credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-dark-800 border border-gold-400/30 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Branding Header */}
        <div className="text-center space-y-3">
          <img
            src={settings.logo_url || '/dmd_logo.jpg'}
            alt="DMD Logo"
            className="h-16 w-auto mx-auto object-contain rounded border border-gold-400/40 p-1"
            onError={(e) => {
              e.target.src = '/dmd_logo.jpg';
            }}
          />
          <h1 className="font-serif text-2xl font-bold text-gold-gradient tracking-wide uppercase">
            DMD JEWELLERY
          </h1>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            SECURE ADMIN PANEL LOGIN
          </p>
        </div>

        {error && (
          <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-3.5 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">
              Admin Email / Username
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="admin@dmdjewellery.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-900 text-white pl-10 pr-4 py-3 rounded-xl border border-gold-400/30 focus:outline-none focus:border-gold-400 text-sm"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-900 text-white pl-10 pr-4 py-3 rounded-xl border border-gold-400/30 focus:outline-none focus:border-gold-400 text-sm"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-gold-gradient text-dark-900 font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 shadow flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{submitting ? 'AUTHENTICATING...' : 'LOGIN TO ADMIN'}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gold-400/10">
          <p className="text-[11px] text-gray-500">
            Protected area. Unauthorized access is monitored and logged.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
