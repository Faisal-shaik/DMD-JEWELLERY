import React from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { getWhatsAppUrl } from '../utils/whatsapp';

const FloatingContactButtons = () => {
  const { settings } = useSettings();
  const cleanPhone = settings.phone ? settings.phone.replace(/[^0-9+]/g, '') : '';
  const waUrl = getWhatsAppUrl(settings.whatsapp, 'Hello DMD JEWELLERYS, I would like to inquire about your jewellery designs.');

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Phone Call Button */}
      {cleanPhone && (
        <a
          href={`tel:${cleanPhone}`}
          className="group w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-dark-800 text-gold-400 border border-gold-400/40 hover:border-gold-400 flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 relative"
          title="Call Shop Now"
          aria-label="Call DMD JEWELLERYS"
        >
          <Phone className="w-6 h-6 text-gold-400 group-hover:animate-bounce" />
          <span className="absolute right-16 bg-dark-800 text-gold-300 border border-gold-400/40 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden sm:block">
            Call Us Now
          </span>
        </a>
      )}

      {/* WhatsApp Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xl hover:bg-emerald-500 hover:scale-110 transition-all duration-300 relative"
        title="Chat on WhatsApp"
        aria-label="Chat on WhatsApp"
      >
        <MessageSquare className="w-6 h-6 fill-white text-emerald-600" />
        <span className="absolute right-16 bg-dark-800 text-emerald-400 border border-emerald-500/40 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden sm:block">
          WhatsApp Support
        </span>
      </a>
    </div>
  );
};

export default FloatingContactButtons;
