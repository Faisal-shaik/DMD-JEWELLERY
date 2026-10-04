import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { getWhatsAppUrl } from '../utils/whatsapp';
import ProductCard from '../components/ProductCard';
import GoldRateCard from '../components/GoldRateCard';
import EmptyState from '../components/EmptyState';
import { Sparkles, MessageSquare, ArrowRight, ShieldCheck, Award, Gem, MapPin, Clock, Phone } from 'lucide-react';

const Home = () => {
  const { settings } = useSettings();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetchProducts({ featured: 1, limit: 8 }),
          fetchCategories({ status: 'enabled' }),
        ]);

        if (prodRes.data.success) {
          setFeaturedProducts(prodRes.data.products || []);
        }
        if (catRes.data.success) {
          setCategories(catRes.data.categories || []);
        }
      } catch (err) {
        console.warn('Error loading home data:', err);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadHomeData();
  }, []);

  const cleanWhatsAppNumber = settings.whatsapp ? settings.whatsapp.replace(/[^0-9]/g, '') : '';

  return (
    <div className="space-y-16 pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 border-b border-gold-400/20 overflow-hidden px-4">
        {/* Background Ambient Glow & Patterns */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-400/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8 py-12">
          {/* Logo Emblem */}
          <div className="inline-block p-2 rounded-2xl bg-gradient-to-tr from-gold-400/20 via-gold-400/5 to-transparent border border-gold-400/30 mb-2">
            <img
              src={settings.logo_url || '/dmd_logo.jpg'}
              alt="DMD JEWELLERY Emblem"
              className="h-24 sm:h-32 w-auto mx-auto object-contain drop-shadow-[0_0_25px_rgba(212,175,55,0.4)]"
              onError={(e) => {
                e.target.src = '/dmd_logo.jpg';
              }}
            />
          </div>

          <div className="space-y-4">
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-gold-gradient uppercase">
              {settings.business_name || 'DMD JEWELLERYS'}
            </h1>
            <p className="font-serif text-xl sm:text-3xl text-gold-200 italic">
              "Timeless Elegance. Beautifully Crafted."
            </p>
            <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto font-sans leading-relaxed">
              Discover jewellery designed for your most special moments. Handcrafted gold, diamond, and silver masterpieces crafted with 100% hallmark purity by D MUDDASSIR at Sharaf Bazar Yemmiganur.
            </p>
          </div>

          {/* Hero Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/jewellery"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gold-gradient text-dark-900 font-bold text-sm tracking-widest uppercase shadow-xl hover:brightness-110 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>EXPLORE JEWELLERY</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={getWhatsAppUrl(settings.whatsapp, 'Hello DMD JEWELLERYS, I am interested in exploring your jewellery designs.')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-dark-900 text-gold-300 border border-gold-400/50 hover:bg-gold-400 hover:text-dark-900 font-bold text-sm tracking-widest uppercase shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WHATSAPP US</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. GOLD RATE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GoldRateCard />
      </section>

      {/* 3. CATEGORIES SECTION */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">Our Specialties</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">JEWELLERY CATEGORIES</h2>
            <div className="w-24 h-0.5 bg-gold-gradient mx-auto rounded-full mt-2" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                to={`/jewellery?category=${encodeURIComponent(cat.id)}`}
                className="group bg-dark-800 border border-gold-400/20 hover:border-gold-400 p-6 rounded-2xl text-center shadow hover:shadow-gold-400/10 transition-all duration-300 flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-gold-400/10 group-hover:bg-gold-gradient flex items-center justify-center text-gold-400 group-hover:text-dark-900 transition-colors">
                  <Gem className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-base sm:text-lg font-semibold text-gray-100 group-hover:text-gold-300 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-gray-400 font-sans">
                  {cat.product_count || 0} Products
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. FEATURED PRODUCTS COLLECTION / EMPTY STATE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">Exclusive Selection</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">FEATURED COLLECTION</h2>
          <div className="w-24 h-0.5 bg-gold-gradient mx-auto rounded-full mt-2" />
        </div>

        {loadingProducts ? (
          <div className="text-center py-12 text-gray-400">Loading jewellery collection...</div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* MANDATORY EMPTY STATE WHEN ZERO PRODUCTS EXIST IN DATABASE */
          <EmptyState
            title="OUR COLLECTION IS COMING SOON"
            description="New jewellery collections will be added soon. Please check back for our latest designs."
          />
        )}
      </section>

      {/* 5. WHY CHOOSE DMD JEWELLERY */}
      <section className="bg-dark-800 border-y border-gold-400/20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">Our Guarantee</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">WHY CHOOSE DMD JEWELLERY</h2>
            <div className="w-24 h-0.5 bg-gold-gradient mx-auto rounded-full mt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-dark-900 p-8 rounded-2xl border border-gold-400/20 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-xl bg-gold-400/10 flex items-center justify-center text-gold-400">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-gold-200">Certified Purity</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                100% BIS Hallmark certified gold jewellery assuring purity, trust, and complete transparency.
              </p>
            </div>

            <div className="bg-dark-900 p-8 rounded-2xl border border-gold-400/20 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-xl bg-gold-400/10 flex items-center justify-center text-gold-400">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-gold-200">Finest Craftsmanship</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Expertly handcrafted by master artisans combining traditional heritage artistry with modern elegance.
              </p>
            </div>

            <div className="bg-dark-900 p-8 rounded-2xl border border-gold-400/20 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-xl bg-gold-400/10 flex items-center justify-center text-gold-400">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-gold-200">Personalized Service</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Dedicated customer assistance for custom designs, bridal consultations, and personal store visits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. VISIT OUR STORE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-dark-800 via-dark-700 to-dark-800 rounded-3xl border border-gold-400/30 p-8 sm:p-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">Showroom Visit</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">VISIT OUR SHOWROOM</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Experience the luxury in person. Browse our full jewellery collection and consult with our gold specialists at our boutique showroom.
            </p>
            <div className="space-y-2 text-xs text-gray-400 pt-2">
              {settings.address && (
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gold-400" />
                  <span>{settings.address}, {settings.city} {settings.state}</span>
                </p>
              )}
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-400" />
                <span>Hours: {settings.opening_time || '10:00 AM'} - {settings.closing_time || '08:30 PM'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            {settings.maps_url && (
              <a
                href={settings.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gold-gradient text-dark-900 font-bold text-sm tracking-wider uppercase text-center shadow-lg hover:brightness-110"
              >
                GET DIRECTIONS
              </a>
            )}
            <Link
              to="/contact"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-dark-900 text-gold-300 border border-gold-400/40 hover:bg-gold-400 hover:text-dark-900 font-bold text-sm tracking-wider uppercase text-center shadow-lg"
            >
              CONTACT STORE
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
