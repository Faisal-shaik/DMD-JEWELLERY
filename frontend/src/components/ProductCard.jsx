import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Award, Weight } from 'lucide-react';

const ProductCard = ({ product }) => {
  if (!product) return null;

  const primaryImage = product.primary_image || (product.images && product.images[0]?.image_url) || '/dmd_logo.jpg';

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="group bg-dark-800 rounded-xl overflow-hidden border border-gold-400/20 hover:border-gold-400/70 shadow-lg hover:shadow-gold-400/10 transition-all duration-300 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-dark-900 flex items-center justify-center p-3">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = '/dmd_logo.jpg';
          }}
        />

        {/* Purity Badge */}
        {product.purity && (
          <div className="absolute top-3 left-3 bg-dark-900/90 backdrop-blur border border-gold-400/40 text-gold-300 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
            <Award className="w-3 h-3 text-gold-400" />
            <span>{product.purity} Gold</span>
          </div>
        )}

        {/* Availability Badge */}
        {product.availability && (
          <div
            className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded shadow uppercase tracking-wider ${
              product.availability === 'In Stock'
                ? 'bg-emerald-900/90 text-emerald-300 border border-emerald-500/40'
                : product.availability === 'Out of Stock'
                ? 'bg-rose-900/90 text-rose-300 border border-rose-500/40'
                : 'bg-amber-900/90 text-amber-300 border border-amber-500/40'
            }`}
          >
            {product.availability}
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-5 flex flex-col flex-1 justify-between space-y-3">
        <div>
          {/* Category & Code */}
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1 font-mono">
            <span>{product.category_name || 'Jewellery'}</span>
            <span>{product.product_code}</span>
          </div>

          {/* Title */}
          <h3 className="font-serif text-lg font-semibold text-gray-100 group-hover:text-gold-300 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Specifications (Purity + Weight) */}
          <div className="flex items-center gap-4 text-xs text-gray-300 mt-2">
            {product.weight > 0 && (
              <span className="flex items-center gap-1 bg-dark-900 px-2 py-1 rounded border border-gray-700">
                <Weight className="w-3 h-3 text-gold-400" />
                {product.weight} grams
              </span>
            )}
          </div>
        </div>

        {/* Footer Price & CTA */}
        <div className="pt-3 border-t border-gold-400/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Estimated Price</span>
            <span className="font-serif text-xl font-bold text-gold-gradient">
              {product.price > 0 ? formatPrice(product.price) : 'Price on Request'}
            </span>
          </div>

          <Link
            to={`/product/${product.id}`}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gold-gradient text-dark-900 font-bold text-xs rounded-lg uppercase tracking-wider hover:brightness-110 shadow transition-all duration-300 shrink-0"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
