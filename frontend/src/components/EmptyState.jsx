import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MessageSquare, PhoneCall } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { getWhatsAppUrl } from '../utils/whatsapp';

const EmptyState = ({ title, description }) => {
  const { settings } = useSettings();
  const waUrl = getWhatsAppUrl(settings.whatsapp, 'Hello DMD JEWELLERYS, I would like to inquire about your upcoming jewellery collections.');

  return (
    <div className="max-w-3xl mx-auto my-12 px-6 py-16 bg-gradient-to-b from-dark-800 to-dark-900 border border-gold-400/30 rounded-3xl text-center shadow-2xl relative overflow-hidden">
      {/* Decorative Gold Glow Accent */}
      <div className="absolute inset-0 bg-gold-400/5 blur-3xl pointer-events-none" />

      {/* Luxury Icon / Logo Emblem */}
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gold-gradient p-0.5 shadow-xl flex items-center justify-center">
        <div className="w-full h-full bg-dark-900 rounded-[14px] flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-gold-400 animate-pulse" />
        </div>
      </div>

      {/* Main Empty Heading */}
      <h2 className="font-serif text-2xl sm:text-4xl font-bold text-gold-gradient tracking-wide mb-4 uppercase">
        {title || 'OUR COLLECTION IS COMING SOON'}
      </h2>

      {/* Description */}
      <p className="text-gray-300 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-8">
        {description || 'New jewellery collections will be added soon. Please check back for our latest designs.'}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/contact"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gold-gradient text-dark-900 font-bold text-sm tracking-wider uppercase shadow-lg hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <PhoneCall className="w-4 h-4" />
          <span>CONTACT US</span>
        </Link>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-dark-900 text-gold-300 border border-gold-400/50 hover:bg-gold-400 hover:text-dark-900 font-bold text-sm tracking-wider uppercase shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          <span>WHATSAPP US</span>
        </a>
      </div>
    </div>
  );
};

export default EmptyState;
