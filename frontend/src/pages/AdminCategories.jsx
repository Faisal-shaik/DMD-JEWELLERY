import React, { useState, useEffect } from 'react';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../services/api';
import { Plus, Edit3, Trash2, FolderTree, AlertCircle, X, Check, Power } from 'lucide-react';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', status: 'enabled' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetchCategories({ status: 'all' });
      if (res.data.success) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      setError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setForm({ name: '', description: '', status: 'enabled' });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setForm({ name: cat.name, description: cat.description || '', status: cat.status || 'enabled' });
    setModalOpen(true);
  };

  const handleToggleStatus = async (cat) => {
    const newStatus = cat.status === 'enabled' ? 'disabled' : 'enabled';
    try {
      await updateCategory(cat.id, { status: newStatus });
      loadCategories();
    } catch (err) {
      alert('Failed to update category status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? Attached products will be un-categorized.')) return;
    try {
      await deleteCategory(id);
      loadCategories();
    } catch (err) {
      alert('Failed to delete category.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, form);
      } else {
        await createCategory(form);
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gold-400/20 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gold-gradient uppercase">CATEGORY MANAGEMENT</h1>
          <p className="text-xs text-gray-400 mt-1">Manage jewellery collection sections (Rings, Necklaces, Bangles, etc.).</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gold-gradient text-dark-900 font-bold text-xs uppercase tracking-wider shadow hover:brightness-110"
        >
          <Plus className="w-4 h-4" />
          <span>ADD CATEGORY</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-dark-800 rounded-3xl border border-gold-400/20 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading categories...</div>
        ) : categories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-dark-900 text-gold-300 uppercase tracking-wider text-[11px] border-b border-gold-400/20">
                <tr>
                  <th className="p-4">Category Name</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Products</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-dark-700/50 transition-colors">
                    <td className="p-4 font-serif font-bold text-sm text-gray-100">{cat.name}</td>
                    <td className="p-4 text-gray-400 max-w-xs truncate">{cat.description || '-'}</td>
                    <td className="p-4 font-bold text-gold-400">{cat.product_count || 0}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(cat)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 border ${
                          cat.status === 'enabled'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-950 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{cat.status}</span>
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 bg-gold-400/20 text-gold-300 hover:bg-gold-400 hover:text-dark-900 rounded border border-gold-400/40"
                          title="Edit Category"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 bg-rose-950 text-rose-300 hover:bg-rose-600 hover:text-white rounded border border-rose-800"
                          title="Delete Category"
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
          <div className="p-12 text-center text-gray-400">
            Categories will appear here once added by the administrator.
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-gold-400/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-1">
              <h3 className="font-serif text-2xl font-bold text-white">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <p className="text-xs text-gray-400">Configure jewellery category details.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 uppercase block mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bridal Jewellery"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 uppercase block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Short summary of this jewellery collection..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 uppercase block mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-dark-900 text-white p-3 rounded-xl border border-gold-400/30 focus:outline-none text-sm"
                >
                  <option value="enabled">Enabled (Visible in navigation)</option>
                  <option value="disabled">Disabled (Hidden)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/2 py-3 bg-dark-900 text-gray-300 font-bold text-xs uppercase rounded-xl border border-gray-700"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-3 bg-gold-gradient text-dark-900 font-bold text-xs uppercase rounded-xl hover:brightness-110 shadow"
                >
                  {submitting ? 'SAVING...' : 'SAVE CATEGORY'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
