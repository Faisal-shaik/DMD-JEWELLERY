import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories } from '../services/api';
import { Gem, ArrowRight } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await fetchCategories({ status: 'enabled' });
      if (res.data.success) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      console.warn('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-2 border-b border-gold-400/20 pb-6">
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-gold-gradient uppercase tracking-tight">
          JEWELLERY CATEGORIES
        </h1>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Explore our handcrafted gold, diamond, and silver jewellery categorized for every occasion.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading categories...</div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/jewellery?category=${encodeURIComponent(cat.id)}`}
              className="group bg-dark-800 border border-gold-400/20 hover:border-gold-400 p-8 rounded-3xl shadow-xl hover:shadow-gold-400/10 transition-all duration-300 flex flex-col justify-between space-y-6"
            >
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gold-400/10 group-hover:bg-gold-gradient flex items-center justify-center text-gold-400 group-hover:text-dark-900 transition-colors">
                  <Gem className="w-7 h-7" />
                </div>
                <span className="text-xs font-mono text-gold-400 bg-dark-900 px-3 py-1 rounded-full border border-gold-400/30">
                  {cat.product_count || 0} Items
                </span>
              </div>

              <div>
                <h3 className="font-serif text-2xl font-bold text-white group-hover:text-gold-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                  {cat.description || `Browse exquisite ${cat.name.toLowerCase()} crafted with hallmark purity.`}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-gold-400 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                <span>EXPLORE COLLECTION</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-dark-800 rounded-3xl border border-gold-400/20 p-8 space-y-3">
          <p className="text-gold-300 font-serif text-xl font-bold">Categories Will Appear Here</p>
          <p className="text-gray-400 text-sm">Categories will appear here once added by the administrator.</p>
        </div>
      )}
    </div>
  );
};

export default Categories;
