import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  createProduct,
  updateProduct,
  fetchProductById,
  fetchCategories,
  deleteProductImage,
  setPrimaryImage,
} from '../services/api';
import ImageUploader from '../components/ImageUploader';
import { ArrowLeft, Save, Sparkles, AlertCircle } from 'lucide-react';

const AdminProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [form, setForm] = useState({
    name: '',
    product_code: '',
    category_id: '',
    price: '',
    purity: '22K',
    weight: '',
    description: '',
    availability: 'In Stock',
    featured: false,
    status: 'Published',
  });

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadProductData();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const res = await fetchCategories({ status: 'enabled' });
      if (res.data.success) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      console.warn('Failed to load categories:', err);
    }
  };

  const loadProductData = async () => {
    try {
      const res = await fetchProductById(id);
      if (res.data.success && res.data.product) {
        const p = res.data.product;
        setForm({
          name: p.name || '',
          product_code: p.product_code || '',
          category_id: p.category_id || '',
          price: p.price || '',
          purity: p.purity || '22K',
          weight: p.weight || '',
          description: p.description || '',
          availability: p.availability || 'In Stock',
          featured: p.featured === 1 || p.featured === true,
          status: p.status || 'Published',
        });
        setExistingImages(p.images || []);
      }
    } catch (err) {
      setError('Failed to load product data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExistingImage = async (imageId) => {
    if (!window.confirm('Delete this product image?')) return;
    try {
      const res = await deleteProductImage(imageId);
      if (res.data.success) {
        setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      }
    } catch (err) {
      alert('Failed to delete image.');
    }
  };

  const handleSetPrimaryImage = async (imageId) => {
    try {
      const res = await setPrimaryImage(imageId);
      if (res.data.success) {
        setExistingImages((prev) =>
          prev.map((img) => ({
            ...img,
            is_primary: img.id === imageId ? 1 : 0,
          }))
        );
      }
    } catch (err) {
      alert('Failed to set primary image.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('product_code', form.product_code);
    formData.append('category_id', form.category_id);
    formData.append('price', form.price);
    formData.append('purity', form.purity);
    formData.append('weight', form.weight);
    formData.append('description', form.description);
    formData.append('availability', form.availability);
    formData.append('featured', form.featured ? '1' : '0');
    formData.append('status', form.status);

    selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      let res;
      if (isEdit) {
        res = await updateProduct(id, formData);
      } else {
        res = await createProduct(formData);
      }

      if (res.data.success) {
        navigate('/admin/products');
      } else {
        setError(res.data.message || 'Operation failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-400">Loading form data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gold-400/20 pb-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/products" className="p-2 bg-dark-800 text-gray-300 hover:text-gold-400 rounded-xl border border-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-gold-gradient uppercase">
              {isEdit ? 'EDIT JEWELLERY PRODUCT' : 'ADD NEW JEWELLERY PRODUCT'}
            </h1>
            <p className="text-xs text-gray-400">Enter product details, pricing, gold purity and photos.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-dark-800 p-6 sm:p-8 rounded-3xl border border-gold-400/20 shadow-2xl space-y-6">
        
        {/* Basic Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Royal Heritage Gold Necklace"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none focus:border-gold-400 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">
              Product Code / SKU (Auto-generated if empty)
            </label>
            <input
              type="text"
              placeholder="e.g. DMD-NECK-1002"
              value={form.product_code}
              onChange={(e) => setForm({ ...form, product_code: e.target.value })}
              className="w-full bg-dark-900 text-gold-300 font-mono p-3 rounded-xl border border-gold-400/30 focus:outline-none focus:border-gold-400 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">
              Category
            </label>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">
              Estimated Price (₹)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 125000"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">
              Gold Purity *
            </label>
            <select
              value={form.purity}
              onChange={(e) => setForm({ ...form, purity: e.target.value })}
              className="w-full bg-dark-900 text-gold-300 font-bold p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm"
            >
              <option value="24K">24K Gold</option>
              <option value="22K">22K Gold</option>
              <option value="20K">20K Gold</option>
              <option value="18K">18K Gold</option>
              <option value="Silver">Silver</option>
              <option value="Diamond">Diamond</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">
              Gross Weight (Grams)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 18.5"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">
              Stock Availability
            </label>
            <select
              value={form.availability}
              onChange={(e) => setForm({ ...form, availability: e.target.value })}
              className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm"
            >
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Available on Request">Available on Request</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">
              Publishing Status
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm font-bold"
            >
              <option value="Published">Published (Visible on Customer Site)</option>
              <option value="Draft">Draft (Saved only in Admin)</option>
              <option value="Hidden">Hidden</option>
            </select>
          </div>
        </div>

        {/* Featured Toggle */}
        <div className="flex items-center gap-3 bg-dark-900 p-4 rounded-xl border border-gray-800">
          <input
            type="checkbox"
            id="featured"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            className="w-4 h-4 accent-gold-400 rounded cursor-pointer"
          />
          <label htmlFor="featured" className="text-xs font-semibold text-gold-300 uppercase cursor-pointer flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-gold-400" /> Mark as Featured Product (Display on Home Hero Collection)
          </label>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-gray-300 uppercase block mb-1.5">
            Product Description
          </label>
          <textarea
            rows={4}
            placeholder="Detailed description of design, craftsmanship, gemstone settings..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm"
          />
        </div>

        {/* Image Uploader Component */}
        <div className="border-t border-gold-400/20 pt-6">
          <label className="text-xs font-bold text-gold-400 uppercase tracking-widest block mb-3">
            Product Image Uploads
          </label>
          <ImageUploader
            existingImages={existingImages}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            onDeleteExisting={handleDeleteExistingImage}
            onSetPrimary={handleSetPrimaryImage}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gold-400/20">
          <Link
            to="/admin/products"
            className="px-6 py-3 bg-dark-900 text-gray-300 font-bold text-xs uppercase rounded-xl border border-gray-700 hover:bg-gray-800"
          >
            CANCEL
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 bg-gold-gradient text-dark-900 font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 shadow flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'SAVING...' : isEdit ? 'UPDATE PRODUCT' : 'ADD PRODUCT'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
