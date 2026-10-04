import React, { useState } from 'react';
import { changeAdminPassword } from '../services/api';
import { KeyRound, CheckCircle2, AlertCircle, Save } from 'lucide-react';

const AdminPassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', msg: 'New password and confirm password do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setStatus({ type: 'error', msg: 'New password must be at least 6 characters long.' });
      return;
    }

    setSubmitting(true);
    setStatus(null);
    try {
      const res = await changeAdminPassword({ currentPassword, newPassword });
      if (res.data.success) {
        setStatus({ type: 'success', msg: 'Admin password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setStatus({ type: 'error', msg: res.data.message || 'Failed to update password.' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Current password is incorrect.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="border-b border-gold-400/20 pb-6">
        <h1 className="font-serif text-3xl font-bold text-gold-gradient uppercase">CHANGE ADMIN PASSWORD</h1>
        <p className="text-xs text-gray-400 mt-1">Update your secure login password for the admin panel.</p>
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

      <form onSubmit={handleSubmit} className="bg-dark-800 p-8 rounded-3xl border border-gold-400/20 shadow-2xl space-y-6">
        <div>
          <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">
            Current Password *
          </label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">
            New Password (Min 6 chars) *
          </label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">
            Confirm New Password *
          </label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-gold-gradient text-dark-900 font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 shadow flex items-center justify-center gap-2"
        >
          <KeyRound className="w-4 h-4" />
          <span>{submitting ? 'UPDATING...' : 'UPDATE PASSWORD NOW'}</span>
        </button>
      </form>
    </div>
  );
};

export default AdminPassword;
