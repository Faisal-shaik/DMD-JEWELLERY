import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { submitEnquiry } from '../services/api';
import { getWhatsAppUrl } from '../utils/whatsapp';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2, Navigation } from 'lucide-react';

const Contact = () => {
  const { settings } = useSettings();

  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await submitEnquiry(form);
      if (res.data.success) {
        setStatus({ type: 'success', msg: 'Your enquiry has been submitted successfully.' });
        setForm({ customer_name: '', phone: '', email: '', message: '' });
      } else {
        setStatus({ type: 'error', msg: res.data.message || 'Failed to send enquiry.' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Unable to send enquiry. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const cleanPhone = settings.phone ? settings.phone.replace(/[^0-9+]/g, '') : '';
  const cleanWhatsApp = settings.whatsapp ? settings.whatsapp.replace(/[^0-9]/g, '') : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-2 border-b border-gold-400/20 pb-6">
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-gold-gradient uppercase tracking-tight">
          VISIT OUR STORE & CONTACT US
        </h1>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          We welcome your enquiries and look forward to assisting you at DMD JEWELLERY.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Store Information & Contact CTAs */}
        <div className="space-y-8 bg-dark-800 p-8 sm:p-10 rounded-3xl border border-gold-400/20 shadow-2xl flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-gold-400 uppercase tracking-widest block">
                Boutique Showroom • Owner: D MUDDASSIR
              </span>
              <h2 className="font-serif text-3xl font-bold text-white mt-1">
                {settings.business_name || 'DMD JEWELLERYS'}
              </h2>
            </div>

            {/* Address & Info List */}
            <div className="space-y-4 text-sm text-gray-300">
              {settings.address && (
                <div className="flex items-start gap-3 bg-dark-900 p-4 rounded-2xl border border-gray-800">
                  <MapPin className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-gold-300 block uppercase">Shop Address</span>
                    <p className="mt-1">
                      {settings.address}, {settings.city} {settings.state} - {settings.pincode}
                    </p>
                  </div>
                </div>
              )}

              {settings.phone && (
                <div className="flex items-start gap-3 bg-dark-900 p-4 rounded-2xl border border-gray-800">
                  <Phone className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-gold-300 block uppercase">Phone Number</span>
                    <a href={`tel:${cleanPhone}`} className="mt-1 hover:text-gold-400 font-semibold block font-mono">
                      {settings.phone}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 bg-dark-900 p-4 rounded-2xl border border-gray-800">
                <MessageSquare className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-gold-300 block uppercase">WhatsApp Direct Support</span>
                  <a
                    href={getWhatsAppUrl(settings.whatsapp, 'Hello D MUDDASSIR (DMD JEWELLERYS), I would like to inquire about your jewellery designs.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 hover:text-gold-400 font-semibold block font-mono"
                  >
                    +91 {settings.whatsapp || '9010322685'}
                  </a>
                </div>
              </div>

              {settings.email && (
                <div className="flex items-start gap-3 bg-dark-900 p-4 rounded-2xl border border-gray-800">
                  <Mail className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-gold-300 block uppercase">Email Address</span>
                    <a href={`mailto:${settings.email}`} className="mt-1 hover:text-gold-400 font-semibold block">
                      {settings.email}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 bg-dark-900 p-4 rounded-2xl border border-gray-800">
                <Clock className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-gold-300 block uppercase">Business Hours</span>
                  <p className="mt-1">
                    {settings.opening_time || '10:00 AM'} - {settings.closing_time || '08:30 PM'}
                  </p>
                  <p className="text-xs text-gold-400 font-semibold mt-0.5">
                    Weekly Holiday: {settings.holiday || 'Sunday'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gold-400/20">
            {settings.maps_url && (
              <a
                href={settings.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gold-gradient text-dark-900 font-bold text-xs uppercase tracking-wider shadow hover:brightness-110"
              >
                <Navigation className="w-4 h-4" />
                <span>GET DIRECTIONS</span>
              </a>
            )}

            {cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-dark-900 text-gold-300 border border-gold-400/40 hover:bg-gold-400 hover:text-dark-900 font-bold text-xs uppercase tracking-wider shadow"
              >
                <Phone className="w-4 h-4" />
                <span>CALL NOW</span>
              </a>
            )}
          </div>
        </div>

        {/* Right Column: Customer Enquiry Form */}
        <div className="bg-dark-800 p-8 sm:p-10 rounded-3xl border border-gold-400/20 shadow-2xl space-y-6">
          <div className="space-y-2 border-b border-gold-400/20 pb-4">
            <span className="text-xs font-semibold text-gold-400 uppercase tracking-widest block">
              Send a Message
            </span>
            <h2 className="font-serif text-3xl font-bold text-white">CUSTOMER ENQUIRY</h2>
            <p className="text-xs text-gray-400">
              Have questions about jewellery designs, purity, or custom orders? Send us an enquiry.
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
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{status.msg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Enter your full name"
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                className="w-full bg-dark-900 text-white p-3.5 rounded-xl border border-gold-400/30 focus:outline-none focus:border-gold-400 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="Enter contact number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-dark-900 text-white p-3.5 rounded-xl border border-gold-400/30 focus:outline-none focus:border-gold-400 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-dark-900 text-white p-3.5 rounded-xl border border-gold-400/30 focus:outline-none focus:border-gold-400 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">
                Message / Jewellery Requirement *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Specify design requirements, gold purity, weight preferences, or questions..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-dark-900 text-white p-3.5 rounded-xl border border-gold-400/30 focus:outline-none focus:border-gold-400 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gold-gradient text-dark-900 font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 shadow flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'SENDING ENQUIRY...' : 'SEND ENQUIRY'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
