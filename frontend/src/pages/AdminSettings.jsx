import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { updateSettings } from '../services/api';
import { Store, Save, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

const AdminSettings = () => {
  const { settings, reloadSettings } = useSettings();

  const [form, setForm] = useState({
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
    about_text: '',
    logo_url: '/dmd_logo.jpg',
    instagram: '',
    facebook: '',
    youtube: '',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (settings) {
      setForm({
        business_name: settings.business_name || 'DMD JEWELLERY',
        phone: settings.phone || '',
        whatsapp: settings.whatsapp || '',
        email: settings.email || '',
        address: settings.address || '',
        city: settings.city || '',
        state: settings.state || '',
        pincode: settings.pincode || '',
        maps_url: settings.maps_url || '',
        opening_time: settings.opening_time || '10:00 AM',
        closing_time: settings.closing_time || '08:30 PM',
        holiday: settings.holiday || 'Sunday',
        about_text: settings.about_text || '',
        logo_url: settings.logo_url || '/dmd_logo.jpg',
        instagram: settings.social?.instagram || '',
        facebook: settings.social?.facebook || '',
        youtube: settings.social?.youtube || '',
      });
      setLogoPreview(settings.logo_url || '/dmd_logo.jpg');
    }
  }, [settings]);

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    if (logoFile) {
      formData.append('logo', logoFile);
    }

    try {
      const res = await updateSettings(formData);
      if (res.data.success) {
        setStatus({ type: 'success', msg: 'Shop information updated successfully!' });
        await reloadSettings();
      } else {
        setStatus({ type: 'error', msg: res.data.message || 'Failed to save settings.' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Failed to update shop settings.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-gold-400/20 pb-6">
        <h1 className="font-serif text-3xl font-bold text-gold-gradient uppercase">SHOP INFORMATION & SETTINGS</h1>
        <p className="text-xs text-gray-400 mt-1">
          Manage shop contact details, WhatsApp, showroom address, logo and social links.
        </p>
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

      <form onSubmit={handleSubmit} className="bg-dark-800 p-8 rounded-3xl border border-gold-400/20 shadow-2xl space-y-8">
        
        {/* Brand & Logo */}
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-bold text-gold-300 border-b border-gold-400/10 pb-2">
            Brand & Logo Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">
                Business Name *
              </label>
              <input
                type="text"
                required
                value={form.business_name}
                onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm font-serif font-bold"
              />
            </div>

            {/* Logo Preview & Upload */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-dark-900 rounded-xl border border-gold-400/40 p-2 flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={logoPreview}
                  alt="Logo Preview"
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.target.src = '/dmd_logo.jpg';
                  }}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 uppercase block mb-1">
                  Upload Official Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="text-xs text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gold-gradient file:text-dark-900 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Numbers */}
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-bold text-gold-300 border-b border-gold-400/10 pb-2">
            Customer Contact Channels
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">
                Phone Number (Dialer)
              </label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">
                WhatsApp Number
              </label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="info@dmdjewellery.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Address & Google Maps */}
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-bold text-gold-300 border-b border-gold-400/10 pb-2">
            Showroom Location & Google Maps
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">
                Street Address
              </label>
              <input
                type="text"
                placeholder="e.g. Main Market, Jewellery Street"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">City</label>
              <input
                type="text"
                placeholder="e.g. Mumbai"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">State & Pincode</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="State"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-2/3 bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm"
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  className="w-1/3 bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">
                Google Maps Directions URL
              </label>
              <input
                type="url"
                placeholder="https://maps.google.com/..."
                value={form.maps_url}
                onChange={(e) => setForm({ ...form, maps_url: e.target.value })}
                className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-bold text-gold-300 border-b border-gold-400/10 pb-2">
            Showroom Hours & Weekly Holiday
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">Opening Time</label>
              <input
                type="text"
                placeholder="10:00 AM"
                value={form.opening_time}
                onChange={(e) => setForm({ ...form, opening_time: e.target.value })}
                className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">Closing Time</label>
              <input
                type="text"
                placeholder="08:30 PM"
                value={form.closing_time}
                onChange={(e) => setForm({ ...form, closing_time: e.target.value })}
                className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">Weekly Holiday</label>
              <input
                type="text"
                placeholder="Sunday"
                value={form.holiday}
                onChange={(e) => setForm({ ...form, holiday: e.target.value })}
                className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* About Us Text */}
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-bold text-gold-300 border-b border-gold-400/10 pb-2">
            About Us Story Text
          </h2>
          <textarea
            rows={4}
            value={form.about_text}
            onChange={(e) => setForm({ ...form, about_text: e.target.value })}
            className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm"
          />
        </div>

        {/* Social Media Links */}
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-bold text-gold-300 border-b border-gold-400/10 pb-2">
            Social Media Links (Only displayed if provided)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">Instagram URL</label>
              <input
                type="url"
                placeholder="https://instagram.com/dmdjewellery"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">Facebook URL</label>
              <input
                type="url"
                placeholder="https://facebook.com/dmdjewellery"
                value={form.facebook}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">YouTube URL</label>
              <input
                type="url"
                placeholder="https://youtube.com/..."
                value={form.youtube}
                onChange={(e) => setForm({ ...form, youtube: e.target.value })}
                className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gold-400/20">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 bg-gold-gradient text-dark-900 font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 shadow flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'SAVING SETTINGS...' : 'SAVE SHOP SETTINGS'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
