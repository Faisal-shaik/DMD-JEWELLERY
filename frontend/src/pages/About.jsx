import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { ShieldCheck, Award, HeartHandshake, Sparkles, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  const { settings } = useSettings();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto border-b border-gold-400/20 pb-8">
        <div className="inline-block p-1.5 rounded-xl bg-gold-400/10 border border-gold-400/30">
          <img
            src={settings.logo_url || '/dmd_logo.jpg'}
            alt="DMD Logo"
            className="h-16 w-auto mx-auto object-contain"
            onError={(e) => {
              e.target.src = '/dmd_logo.jpg';
            }}
          />
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-gold-gradient uppercase tracking-tight">
          ABOUT DMD JEWELLERY
        </h1>
        <p className="font-serif text-lg text-gold-200 italic">
          "Timeless Elegance. Beautifully Crafted."
        </p>
      </div>

      {/* Main Story & Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-dark-800 p-8 sm:p-12 rounded-3xl border border-gold-400/20 shadow-2xl">
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gold-400 uppercase tracking-widest block">
              Our Legacy & Commitment
            </span>
            <h2 className="font-serif text-3xl font-bold text-white leading-tight">
              PURE GOLD & EXTRAORDINARY ARTISTRY
            </h2>
          </div>

          <p className="text-gray-300 text-sm leading-relaxed font-sans">
            {settings.about_text ||
              'DMD JEWELLERY offers timeless elegance with beautifully crafted gold, diamond, and silver jewellery. Built on purity, craftsmanship, and customer trust.'}
          </p>

          <p className="text-gray-400 text-sm leading-relaxed font-sans">
            Every piece in our catalogue is curated to reflect traditional Indian heritage blended with contemporary elegance. We strictly adhere to hallmark standards to guarantee pure 22K, 24K, and 18K gold purity in every ornament.
          </p>

          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-gradient text-dark-900 font-bold text-xs uppercase tracking-wider shadow hover:brightness-110"
            >
              <MapPin className="w-4 h-4" />
              <span>VISIT OUR BOUTIQUE SHOWROOM</span>
            </Link>
          </div>
        </div>

        {/* Feature Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-dark-900 p-6 rounded-2xl border border-gold-400/20 space-y-3">
            <ShieldCheck className="w-8 h-8 text-gold-400" />
            <h3 className="font-serif text-lg font-bold text-gold-200">100% BIS Hallmark</h3>
            <p className="text-xs text-gray-400">
              Guaranteed purity certified by official Indian hallmark standards.
            </p>
          </div>

          <div className="bg-dark-900 p-6 rounded-2xl border border-gold-400/20 space-y-3">
            <Award className="w-8 h-8 text-gold-400" />
            <h3 className="font-serif text-lg font-bold text-gold-200">Master Craftsmen</h3>
            <p className="text-xs text-gray-400">
              Hand-carved designs with intricate detail and immaculate finish.
            </p>
          </div>

          <div className="bg-dark-900 p-6 rounded-2xl border border-gold-400/20 space-y-3">
            <HeartHandshake className="w-8 h-8 text-gold-400" />
            <h3 className="font-serif text-lg font-bold text-gold-200">Customer First</h3>
            <p className="text-xs text-gray-400">
              Transparent pricing, personal attention, and lifelong customer support.
            </p>
          </div>

          <div className="bg-dark-900 p-6 rounded-2xl border border-gold-400/20 space-y-3">
            <Sparkles className="w-8 h-8 text-gold-400" />
            <h3 className="font-serif text-lg font-bold text-gold-200">Custom Designs</h3>
            <p className="text-xs text-gray-400">
              Tailor-made bridal and family heirloom jewellery customized for you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
