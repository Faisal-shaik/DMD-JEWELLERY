import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, deleteProduct, clearAllProducts } from '../services/api';
import { Plus, Search, Edit3, Trash2, Eye, AlertTriangle, X, Trash } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null });
  const [clearAllModal, setClearAllModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [statusFilter]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetchProducts({ isAdmin: 'true', status: statusFilter, search });
      if (res.data.success) {
        setProducts(res.data.products || []);
      }
    } catch (err) {
      console.warn('Error loading admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProducts();
  };

  const confirmDelete = async () => {
    if (!deleteModal.product) return;
    setDeleting(true);
    try {
      const res = await deleteProduct(deleteModal.product.id);
      if (res.data.success) {
        setProducts((prev) => prev.filter((p) => String(p.id) !== String(deleteModal.product.id)));
        setDeleteModal({ open: false, product: null });
      }
    } catch (err) {
      alert('Failed to delete product.');
    } finally {
      setDeleting(false);
    }
  };

  const confirmClearAll = async () => {
    setDeleting(true);
    try {
      const res = await clearAllProducts();
      if (res.data.success) {
        setProducts([]);
        setClearAllModal(false);
      }
    } catch (err) {
      alert('Failed to clear all products.');
    } finally {
      setDeleting(false);
    }
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gold-400/20 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gold-gradient uppercase">PRODUCT MANAGEMENT</h1>
          <p className="text-xs text-gray-400 mt-1">Manage jewellery products, edit pricing, purity and photos.</p>
        </div>

        <div className="flex items-center gap-3">
          {products.length > 0 && (
            <button
              onClick={() => setClearAllModal(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-950 text-rose-300 border border-rose-800 font-bold text-xs uppercase tracking-wider hover:bg-rose-900 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>CLEAR ALL PRODUCTS</span>
            </button>
          )}

          <Link
            to="/admin/products/add"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gold-gradient text-dark-900 font-bold text-xs uppercase tracking-wider shadow hover:brightness-110"
          >
            <Plus className="w-4 h-4" />
            <span>ADD NEW PRODUCT</span>
          </Link>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-dark-800 p-4 rounded-2xl border border-gold-400/20">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-900 text-white pl-9 pr-4 py-2 rounded-xl border border-gold-400/30 focus:outline-none focus:border-gold-400 text-xs"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-gray-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-dark-900 text-gold-300 text-xs py-2 px-3 rounded-xl border border-gold-400/30 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Published">Published Only</option>
            <option value="Draft">Draft Only</option>
            <option value="Hidden">Hidden Only</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-dark-800 rounded-3xl border border-gold-400/20 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading product list...</div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-dark-900 text-gold-300 uppercase tracking-wider text-[11px] border-b border-gold-400/20">
                <tr>
                  <th className="p-4">Image</th>
                  <th className="p-4">Product Name & SKU</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Purity & Weight</th>
                  <th className="p-4">Availability</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-dark-700/50 transition-colors">
                    <td className="p-4">
                      <img
                        src={p.primary_image || '/dmd_logo.jpg'}
                        alt={p.name}
                        className="w-12 h-12 rounded-lg object-cover bg-dark-900 border border-gray-700"
                        onError={(e) => {
                          e.target.src = '/dmd_logo.jpg';
                        }}
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-serif font-bold text-sm text-gray-100">{p.name}</div>
                      <div className="font-mono text-[11px] text-gold-400">{p.product_code}</div>
                    </td>
                    <td className="p-4">{p.category_name || 'Jewellery'}</td>
                    <td className="p-4 font-bold text-gold-300">
                      {p.price > 0 ? formatPrice(p.price) : 'Request'}
                    </td>
                    <td className="p-4">
                      <div>{p.purity} Gold</div>
                      <div className="text-[10px] text-gray-400">{p.weight} grams</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.availability === 'In Stock'
                            ? 'bg-emerald-950 text-emerald-300'
                            : 'bg-rose-950 text-rose-300'
                        }`}
                      >
                        {p.availability}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.status === 'Published'
                            ? 'bg-emerald-900/80 text-emerald-200'
                            : p.status === 'Draft'
                            ? 'bg-amber-900/80 text-amber-200'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/product/${p.id}`}
                          target="_blank"
                          className="p-1.5 bg-dark-900 text-gray-300 hover:text-gold-400 rounded border border-gray-700"
                          title="View on Customer Site"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/admin/products/edit/${p.id}`}
                          className="p-1.5 bg-gold-400/20 text-gold-300 hover:bg-gold-400 hover:text-dark-900 rounded border border-gold-400/40"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteModal({ open: true, product: p })}
                          className="p-1.5 bg-rose-950 text-rose-300 hover:bg-rose-600 hover:text-white rounded border border-rose-800"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center space-y-4">
            <p className="text-gold-300 font-serif text-xl font-bold">OUR COLLECTION IS COMING SOON</p>
            <p className="text-gray-400 text-sm">No products in database yet. Click below to add the first jewellery product.</p>
            <Link
              to="/admin/products/add"
              className="inline-block px-6 py-3 bg-gold-gradient text-dark-900 font-bold text-xs uppercase rounded-xl"
            >
              Add First Product
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-gold-400/40 rounded-3xl p-6 max-w-md w-full space-y-6 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-rose-950 text-rose-400 border border-rose-800 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-xl font-bold text-white">Delete Jewellery Product?</h3>
              <p className="text-xs text-gray-300">
                Are you sure you want to delete <strong className="text-gold-300">{deleteModal.product?.name}</strong> ({deleteModal.product?.product_code})?
              </p>
              <p className="text-[11px] text-rose-400">This action cannot be undone and will remove the product from the customer website.</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, product: null })}
                className="w-1/2 py-3 bg-dark-900 text-gray-300 font-bold text-xs uppercase rounded-xl border border-gray-700"
              >
                CANCEL
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="w-1/2 py-3 bg-rose-600 text-white font-bold text-xs uppercase rounded-xl hover:bg-rose-500 shadow"
              >
                {deleting ? 'DELETING...' : 'DELETE PRODUCT'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {clearAllModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-rose-600/50 rounded-3xl p-6 max-w-md w-full space-y-6 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-rose-950 text-rose-500 border border-rose-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-xl font-bold text-white">Clear Entire Collection?</h3>
              <p className="text-xs text-gray-300">
                Are you sure you want to delete <strong className="text-rose-400">ALL {products.length} products</strong> in the database?
              </p>
              <p className="text-[11px] text-rose-400 font-semibold">
                This will wipe all jewellery products and photos. The website will display: "OUR COLLECTION IS COMING SOON".
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setClearAllModal(false)}
                className="w-1/2 py-3 bg-dark-900 text-gray-300 font-bold text-xs uppercase rounded-xl border border-gray-700"
              >
                CANCEL
              </button>
              <button
                onClick={confirmClearAll}
                disabled={deleting}
                className="w-1/2 py-3 bg-rose-600 text-white font-bold text-xs uppercase rounded-xl hover:bg-rose-500 shadow"
              >
                {deleting ? 'CLEARING...' : 'DELETE ALL PRODUCTS'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
