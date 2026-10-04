import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, MessageSquare, Instagram, Facebook, Youtube } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { getWhatsAppUrl } from '../utils/whatsapp';

const Footer = () => {
  const { settings } = useSettings();
  const cleanWhatsAppNumber = settings.whatsapp ? settings.whatsapp.replace(/[^0-9]/g, '') : '';

  return (
    <footer className="bg-dark-800 border-t border-gold-accent/40 text-gray-400 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={settings.logo_url || '/dmd_logo.jpg'}
                alt="DMD JEWELLERY"
                className="h-12 w-auto object-contain rounded border border-gold-400/30"
                onError={(e) => {
                  e.target.src = '/dmd_logo.jpg';
                }}
              />
              <div>
                <h3 className="font-serif text-xl font-bold text-gold-gradient tracking-wide">
                  DMD JEWELLERY
                </h3>
                <p className="text-[10px] tracking-[0.2em] text-gray-400 uppercase">Purity & Excellence</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {settings.about_text || 'Discover exquisite gold, diamond, and hallmark jewellery crafted for your most cherished moments.'}
            </p>
            {/* Social Icons (Only if provided) */}
            <div className="flex items-center gap-3 pt-2">
              {settings.social?.instagram && (
                <a
                  href={settings.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-dark-900 border border-gold-400/30 flex items-center justify-center text-gray-300 hover:text-gold-400 hover:border-gold-400 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.social?.facebook && (
                <a
                  href={settings.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-dark-900 border border-gold-400/30 flex items-center justify-center text-gray-300 hover:text-gold-400 hover:border-gold-400 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings.social?.youtube && (
                <a
                  href={settings.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-dark-900 border border-gold-400/30 flex items-center justify-center text-gray-300 hover:text-gold-400 hover:border-gold-400 transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-gold-300 mb-4 tracking-wider uppercase">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-gold-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/jewellery" className="hover:text-gold-400 transition-colors">
                  Jewellery Catalogue
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-gold-400 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gold-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-gold-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-gold-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-gold-300 mb-4 tracking-wider uppercase">
              Customer Support
            </h4>
            <ul className="space-y-3 text-sm">
              {settings.phone && (
                <li>
                  <a href={`tel:${settings.phone}`} className="flex items-center gap-2.5 hover:text-gold-400">
                    <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                    <span>{settings.phone}</span>
                  </a>
                </li>
              )}
              <li>
                <a
                  href={getWhatsAppUrl(settings.whatsapp, 'Hello DMD JEWELLERYS, I am contacting you from your website.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-gold-400"
                >
                  <MessageSquare className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>WhatsApp: {settings.whatsapp || '9010322685'}</span>
                </a>
              </li>
              {settings.email && (
                <li>
                  <a href={`mailto:${settings.email}`} className="flex items-center gap-2.5 hover:text-gold-400">
                    <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                    <span>{settings.email}</span>
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Store Location */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-gold-300 mb-4 tracking-wider uppercase">
              Visit Our Store
            </h4>
            <div className="space-y-3 text-sm">
              {settings.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-1" />
                  <span>
                    {settings.address}, {settings.city} {settings.state} {settings.pincode}
                  </span>
                </div>
              )}
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-gold-400 shrink-0 mt-1" />
                <div>
                  <p>
                    {settings.opening_time || '10:00 AM'} - {settings.closing_time || '08:30 PM'}
                  </p>
                  <p className="text-xs text-gold-400">Holiday: {settings.holiday || 'Sunday'}</p>
                </div>
              </div>
              {settings.maps_url && (
                <a
                  href={settings.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 px-4 py-2 bg-dark-900 border border-gold-400/40 text-gold-300 text-xs font-semibold rounded hover:bg-gold-400 hover:text-dark-900 transition-colors"
                >
                  Get Directions →
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-gold-400/20 my-8"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 DMD JEWELLERY. All Rights Reserved.</p>
          <p>Handcrafted Gold & Hallmark Certified Jewellery</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
