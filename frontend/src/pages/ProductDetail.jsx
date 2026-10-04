import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductById, fetchProducts, submitEnquiry } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { getWhatsAppUrl } from '../utils/whatsapp';
import ProductCard from '../components/ProductCard';
import {
  Phone,
  MessageSquare,
  Mail,
  Send,
  Award,
  Weight,
  CheckCircle,
  ShieldCheck,
  Tag,
  ArrowLeft,
  X,
  Sparkles,
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const { settings } = useSettings();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Enquiry Modal Form State
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({
    customer_name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [enquiryStatus, setEnquiryStatus] = useState(null);

  useEffect(() => {
    loadProductDetail();
  }, [id]);

  const loadProductDetail = async () => {
    setLoading(true);
    try {
      const res = await fetchProductById(id);
      if (res.data.success && res.data.product) {
        const prod = res.data.product;
        setProduct(prod);

        // Set primary image or first available image
        const prim = prod.images.find((i) => i.is_primary === 1)?.image_url || prod.images[0]?.image_url || '/dmd_logo.jpg';
        setSelectedImage(prim);

        // Pre-fill enquiry message
        setEnquiryForm((prev) => ({
          ...prev,
          message: `Hello DMD Jewellery, I am interested in ${prod.name} (Code: ${prod.product_code}). Please share more details and final pricing.`,
        }));

        // Load Related Products from same category
        if (prod.category_id) {
          const relRes = await fetchProducts({ category: prod.category_id, limit: 4 });
          if (relRes.data.success) {
            setRelatedProducts(relRes.data.products.filter((p) => p.id !== prod.id));
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load product detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    setSubmittingEnquiry(true);
    setEnquiryStatus(null);
    try {
      const res = await submitEnquiry({
        ...enquiryForm,
        product_id: product.id,
      });

      if (res.data.success) {
        setEnquiryStatus({ type: 'success', msg: 'Your enquiry has been submitted successfully.' });
        setTimeout(() => {
          setShowEnquiryModal(false);
          setEnquiryStatus(null);
        }, 2500);
      } else {
        setEnquiryStatus({ type: 'error', msg: res.data.message || 'Failed to submit enquiry.' });
      }
    } catch (err) {
      setEnquiryStatus({ type: 'error', msg: 'Unable to send enquiry. Please try again.' });
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const cleanPhone = settings.phone ? settings.phone.replace(/[^0-9+]/g, '') : '';
  const cleanWhatsApp = settings.whatsapp ? settings.whatsapp.replace(/[^0-9]/g, '') : '';

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto my-16 p-12 bg-dark-800 border border-gold-400/30 rounded-3xl text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-gold-300">Product Not Found</h2>
        <p className="text-gray-400">The product you are looking for is unavailable or has been removed.</p>
        <Link
          to="/jewellery"
          className="inline-block px-6 py-3 bg-gold-gradient text-dark-900 font-bold text-xs uppercase rounded-xl"
        >
          Back to Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Back Button */}
      <Link
        to="/jewellery"
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-gold-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalogue
      </Link>

      {/* Main Amazon-Style Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-dark-800 p-6 sm:p-10 rounded-3xl border border-gold-400/20 shadow-2xl">
        
        {/* Left Column: Image Viewer Gallery */}
        <div className="space-y-4">
          {/* Main Selected Image */}
          <div className="aspect-square bg-dark-900 rounded-2xl border border-gold-400/30 overflow-hidden flex items-center justify-center p-4 relative group">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-contain max-h-[500px] transform group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.src = '/dmd_logo.jpg';
              }}
            />
            {/* Purity Overlay Badge */}
            {product.purity && (
              <span className="absolute top-4 left-4 bg-dark-900/90 border border-gold-400/40 text-gold-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow">
                <Award className="w-3.5 h-3.5 text-gold-400" /> {product.purity} Hallmark Gold
              </span>
            )}
          </div>

          {/* Thumbnails Gallery */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`w-20 h-20 rounded-xl overflow-hidden bg-dark-900 border shrink-0 transition-all ${
                    selectedImage === img.image_url
                      ? 'border-gold-400 ring-2 ring-gold-400/40 scale-105'
                      : 'border-gray-700 hover:border-gold-400/50'
                  }`}
                >
                  <img src={img.image_url} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Specifications & Contact CTAs */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* SKU Code & Category Badge */}
            <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
              <span className="bg-dark-900 px-3 py-1 rounded border border-gray-700 text-gold-400">
                Code: {product.product_code}
              </span>
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-gold-400" /> {product.category_name || 'Jewellery'}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
              {product.name}
            </h1>

            {/* Price Tag */}
            <div className="py-2 border-y border-gold-400/20 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider block">Estimated Price</span>
                <span className="font-serif text-3xl font-bold text-gold-gradient">
                  {product.price > 0 ? formatPrice(product.price) : 'Price Available on Request'}
                </span>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${
                  product.availability === 'In Stock'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    : product.availability === 'Out of Stock'
                    ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                    : 'bg-amber-950 text-amber-300 border-amber-500/40'
                }`}
              >
                {product.availability}
              </span>
            </div>

            {/* Key Specs Pills */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-900 p-3.5 rounded-xl border border-gray-800 flex items-center gap-3">
                <Award className="w-5 h-5 text-gold-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block font-sans">Gold Purity</span>
                  <span className="text-sm font-bold text-gold-200">{product.purity} Gold</span>
                </div>
              </div>

              <div className="bg-dark-900 p-3.5 rounded-xl border border-gray-800 flex items-center gap-3">
                <Weight className="w-5 h-5 text-gold-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block font-sans">Gross Weight</span>
                  <span className="text-sm font-bold text-gold-200">{product.weight} grams</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Product Description</h3>
                <p className="text-sm text-gray-300 leading-relaxed font-sans bg-dark-900/60 p-4 rounded-xl border border-gray-800">
                  {product.description}
                </p>
              </div>
            )}
          </div>

          {/* CUSTOMER CONTACT ACTION BUTTONS (NO CART/CHECKOUT!) */}
          <div className="space-y-3 pt-6 border-t border-gold-400/20">
            <h3 className="text-xs font-bold text-gold-400 uppercase tracking-widest text-center">
              Direct Shop Contact & Enquiries
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* CALL NOW BUTTON */}
              {cleanPhone ? (
                <a
                  href={`tel:${cleanPhone}`}
                  className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gold-gradient text-dark-900 font-bold text-xs uppercase tracking-wider shadow hover:brightness-110 transition-all"
                >
                  <Phone className="w-4 h-4 fill-dark-900" />
                  <span>CALL NOW</span>
                </a>
              ) : null}

              {/* WHATSAPP BUTTON */}
              <a
                href={getWhatsAppUrl(
                  settings.whatsapp,
                  `Hello DMD JEWELLERYS, I am interested in ${product.name} (Code: ${product.product_code}). Please provide more details about this product.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider shadow hover:bg-emerald-500 transition-all"
              >
                <MessageSquare className="w-4 h-4 fill-white text-emerald-600" />
                <span>ASK ON WHATSAPP</span>
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* ENQUIRE BY EMAIL */}
              {settings.email ? (
                <a
                  href={`mailto:${settings.email}?subject=${encodeURIComponent(
                    `Enquiry about ${product.name}`
                  )}&body=${encodeURIComponent(
                    `Hello DMD Jewellery,\n\nI am interested in ${product.name} (Product Code: ${product.product_code}).\nPlease provide more information.`
                  )}`}
                  className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-dark-900 text-gray-200 border border-gold-400/40 font-bold text-xs uppercase tracking-wider hover:bg-gold-400 hover:text-dark-900 transition-all"
                >
                  <Mail className="w-4 h-4" />
                  <span>ENQUIRE BY EMAIL</span>
                </a>
              ) : null}

              {/* SEND ENQUIRY FORM MODAL BUTTON */}
              <button
                onClick={() => setShowEnquiryModal(true)}
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-dark-900 text-gold-300 border border-gold-400/50 font-bold text-xs uppercase tracking-wider hover:bg-gold-400 hover:text-dark-900 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>SEND ENQUIRY FORM</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-8">
          <div className="flex items-center justify-between border-b border-gold-400/20 pb-4">
            <h2 className="font-serif text-2xl font-bold text-white">SIMILAR JEWELLERY DESIGNS</h2>
            <Link to="/jewellery" className="text-xs text-gold-400 font-semibold hover:underline">
              View All Catalogue →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ENQUIRY FORM MODAL */}
      {showEnquiryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-gold-400/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowEnquiryModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-gold-400 uppercase tracking-widest block">
                Direct Enquiry
              </span>
              <h3 className="font-serif text-2xl font-bold text-white">
                Enquire for {product.name}
              </h3>
            </div>

            {enquiryStatus && (
              <div
                className={`p-4 rounded-xl text-xs font-semibold ${
                  enquiryStatus.type === 'success'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                }`}
              >
                {enquiryStatus.msg}
              </div>
            )}

            <form onSubmit={handleEnquirySubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 uppercase block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={enquiryForm.customer_name}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, customer_name: e.target.value })}
                  className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none focus:border-gold-400 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 uppercase block mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Enter contact number"
                  value={enquiryForm.phone}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                  className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none focus:border-gold-400 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 uppercase block mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={enquiryForm.email}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                  className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none focus:border-gold-400 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 uppercase block mb-1">
                  Message / Requirements *
                </label>
                <textarea
                  required
                  rows={3}
                  value={enquiryForm.message}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                  className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none focus:border-gold-400 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submittingEnquiry}
                className="w-full py-3.5 bg-gold-gradient text-dark-900 font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 shadow"
              >
                {submittingEnquiry ? 'SUBMITTING ENQUIRY...' : 'SEND ENQUIRY NOW'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
