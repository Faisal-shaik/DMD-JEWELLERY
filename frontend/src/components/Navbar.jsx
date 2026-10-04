import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Search, Phone, MessageSquare, Download } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { getWhatsAppUrl } from '../utils/whatsapp';

const Navbar = () => {
  const { settings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jewellery?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchModal(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'JEWELLERY', path: '/jewellery' },
    { name: 'CATEGORIES', path: '/categories' },
    { name: 'ABOUT US', path: '/about' },
    { name: 'CONTACT', path: '/contact' },
  ];

  const waUrl = getWhatsAppUrl(settings.whatsapp, 'Hello DMD JEWELLERYS, I am browsing your website and have an enquiry.');

  return (
    <header className="sticky top-0 z-40 bg-dark-900/95 backdrop-blur-md border-b border-gold-accent shadow-lg transition-all duration-300">
      {/* Top Bar Gold Rate Ticker Announcement */}
      <div className="bg-gradient-to-r from-dark-800 via-gold-900/40 to-dark-800 py-1.5 px-4 text-xs text-gold-200 border-b border-gold-400/20 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span>✨ Pure Gold & Hallmark Jewellery</span>
            <span>📍 Visit Our Showroom: {settings.city || 'Yemmiganur'}</span>
          </div>
          <div className="flex items-center gap-4">
            {settings.phone && (
              <a href={`tel:${settings.phone}`} className="hover:text-gold-400 flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3 text-gold-400" /> {settings.phone}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={settings.logo_url || '/dmd_logo.jpg'}
              alt="DMD JEWELLERYS"
              className="h-12 w-auto object-contain rounded border border-gold-400/30 group-hover:border-gold-400 transition-colors duration-300"
              onError={(e) => {
                e.target.src = '/dmd_logo.jpg';
              }}
            />
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-gold-gradient">
                {settings.business_name || 'DMD JEWELLERYS'}
              </span>
              <span className="text-[10px] tracking-[0.25em] text-gray-400 uppercase -mt-1 font-sans">
                Luxury Collection
              </span>
            </div>
          </Link>

          {/* Center: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm tracking-widest font-medium transition-all duration-300 py-1 relative ${
                    isActive ? 'text-gold-400 font-semibold' : 'text-gray-300 hover:text-gold-300'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gold-400 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gold-400/50 text-gold-300 hover:bg-gold-400/10 font-semibold text-xs tracking-wider uppercase transition-all"
                title="Install DMD App on your phone/PC"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            )}

            {/* Search Icon */}
            <button
              onClick={() => setShowSearchModal(!showSearchModal)}
              className="p-2 text-gray-300 hover:text-gold-400 transition-colors"
              aria-label="Search Jewellery"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* WhatsApp Quick CTA Button */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gold-gradient text-dark-900 font-semibold text-xs tracking-wider uppercase shadow-md hover:brightness-110 transition-all duration-300"
            >
              <MessageSquare className="w-4 h-4 fill-dark-900" />
              <span>WhatsApp Us</span>
            </a>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setShowSearchModal(!showSearchModal)}
              className="p-2 text-gray-300 hover:text-gold-400"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-gold-400"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Search Modal/Bar Dropdown */}
      {showSearchModal && (
        <div className="bg-dark-800 border-b border-gold-400/30 p-4 transition-all">
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex gap-2">
            <input
              type="text"
              placeholder="Search rings, necklaces, 22K gold, product code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-dark-900 text-white px-4 py-2.5 rounded-lg border border-gold-400/40 focus:outline-none focus:border-gold-400 placeholder-gray-500 text-sm"
              autoFocus
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-gold-gradient text-dark-900 font-bold rounded-lg text-sm hover:brightness-110"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-dark-900/98 border-b border-gold-400/30 px-6 py-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block text-base tracking-widest font-medium py-2 ${
                location.pathname === link.path ? 'text-gold-400 font-bold' : 'text-gray-300'
              }`}
            >
              {link.name}
            </Link>
          ))}

          {deferredPrompt && (
            <button
              onClick={() => {
                handleInstallClick();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-gold-400 text-gold-300 font-bold text-xs tracking-wider uppercase"
            >
              <Download className="w-4 h-4" />
              <span>📱 Install DMD App</span>
            </button>
          )}

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-gold-gradient text-dark-900 font-bold text-sm tracking-wider uppercase"
          >
            <MessageSquare className="w-4 h-4 fill-dark-900" />
            <span>WhatsApp Us</span>
          </a>
        </div>
      )}
    </header>
  );
};

export default Navbar;
