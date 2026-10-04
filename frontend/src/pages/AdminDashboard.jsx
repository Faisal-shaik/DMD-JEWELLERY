import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, fetchCategories, fetchEnquiries, updateEnquiryStatus } from '../services/api';
import { Package, FolderTree, MessageSquare, CheckCircle, AlertTriangle, Plus, Eye, ArrowRight } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    publishedProducts: 0,
    outOfStockProducts: 0,
    totalCategories: 0,
    totalEnquiries: 0,
    newEnquiries: 0,
  });

  const [recentProducts, setRecentProducts] = useState([]);
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, enqRes] = await Promise.all([
        fetchProducts({ isAdmin: 'true' }),
        fetchCategories({ status: 'all' }),
        fetchEnquiries({ status: 'all' }),
      ]);

      if (prodRes.data.success) {
        const prods = prodRes.data.products || [];
        setRecentProducts(prods.slice(0, 5));
        setStats((prev) => ({
          ...prev,
          totalProducts: prods.length,
          publishedProducts: prods.filter((p) => p.status === 'Published').length,
          outOfStockProducts: prods.filter((p) => p.availability === 'Out of Stock').length,
        }));
      }

      if (catRes.data.success) {
        const cats = catRes.data.categories || [];
        setStats((prev) => ({ ...prev, totalCategories: cats.length }));
      }

      if (enqRes.data.success) {
        const enqs = enqRes.data.enquiries || [];
        setRecentEnquiries(enqs.slice(0, 5));
        setStats((prev) => ({
          ...prev,
          totalEnquiries: enqs.length,
          newEnquiries: enqs.filter((e) => e.status === 'New').length,
        }));
      }
    } catch (err) {
      console.warn('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnquiryStatus = async (id, status) => {
    try {
      await updateEnquiryStatus(id, status);
      loadDashboardData();
    } catch (err) {
      alert('Failed to update enquiry status');
    }
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading admin dashboard statistics...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gold-400/20 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gold-gradient uppercase">ADMIN DASHBOARD</h1>
          <p className="text-xs text-gray-400 mt-1">Overview of catalogue products, inventory, and customer enquiries.</p>
        </div>

        <Link
          to="/admin/products/add"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gold-gradient text-dark-900 font-bold text-xs uppercase tracking-wider shadow hover:brightness-110"
        >
          <Plus className="w-4 h-4" />
          <span>ADD NEW PRODUCT</span>
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* TOTAL PRODUCTS */}
        <div className="bg-dark-800 p-5 rounded-2xl border border-gold-400/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Products</span>
            <Package className="w-5 h-5 text-gold-400" />
          </div>
          <p className="font-serif text-3xl font-bold text-white">{stats.totalProducts}</p>
          <span className="text-[10px] text-gold-400">Catalogue Database</span>
        </div>

        {/* PUBLISHED PRODUCTS */}
        <div className="bg-dark-800 p-5 rounded-2xl border border-gold-400/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Published</span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="font-serif text-3xl font-bold text-emerald-400">{stats.publishedProducts}</p>
          <span className="text-[10px] text-gray-400">Live on Customer Website</span>
        </div>

        {/* OUT OF STOCK */}
        <div className="bg-dark-800 p-5 rounded-2xl border border-gold-400/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Out of Stock</span>
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <p className="font-serif text-3xl font-bold text-rose-400">{stats.outOfStockProducts}</p>
          <span className="text-[10px] text-gray-400">Requires Stock Update</span>
        </div>

        {/* CATEGORIES */}
        <div className="bg-dark-800 p-5 rounded-2xl border border-gold-400/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Categories</span>
            <FolderTree className="w-5 h-5 text-gold-400" />
          </div>
          <p className="font-serif text-3xl font-bold text-white">{stats.totalCategories}</p>
          <span className="text-[10px] text-gold-400">Jewellery Sections</span>
        </div>

        {/* TOTAL ENQUIRIES */}
        <div className="bg-dark-800 p-5 rounded-2xl border border-gold-400/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Enquiries</span>
            <MessageSquare className="w-5 h-5 text-amber-400" />
          </div>
          <p className="font-serif text-3xl font-bold text-amber-400">{stats.totalEnquiries}</p>
          <span className="text-[10px] text-amber-300 font-semibold">{stats.newEnquiries} New Messages</span>
        </div>
      </div>

      {/* Two Column Section: Recent Products & Recent Customer Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Products */}
        <div className="bg-dark-800 p-6 rounded-3xl border border-gold-400/20 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-gold-400/10 pb-3">
            <h2 className="font-serif text-lg font-bold text-gold-300">RECENT PRODUCTS</h2>
            <Link to="/admin/products" className="text-xs text-gold-400 hover:underline flex items-center gap-1">
              <span>Manage All</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentProducts.length > 0 ? (
            <div className="space-y-3">
              {recentProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-dark-900 rounded-xl border border-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={p.primary_image || '/dmd_logo.jpg'}
                      alt={p.name}
                      className="w-12 h-12 rounded-lg object-cover bg-dark-800 border border-gray-700"
                      onError={(e) => {
                        e.target.src = '/dmd_logo.jpg';
                      }}
                    />
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-gray-200 line-clamp-1">{p.name}</h4>
                      <p className="text-[11px] text-gray-400 font-mono">
                        {p.product_code} • {p.purity} Gold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gold-300 block">
                      {p.price > 0 ? formatPrice(p.price) : 'Request'}
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                        p.status === 'Published'
                          ? 'bg-emerald-950 text-emerald-300'
                          : 'bg-amber-950 text-amber-300'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-gray-400">No products added yet in database.</div>
          )}
        </div>

        {/* Recent Customer Enquiries */}
        <div className="bg-dark-800 p-6 rounded-3xl border border-gold-400/20 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-gold-400/10 pb-3">
            <h2 className="font-serif text-lg font-bold text-gold-300">RECENT ENQUIRIES</h2>
            <Link to="/admin/enquiries" className="text-xs text-gold-400 hover:underline flex items-center gap-1">
              <span>View All</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentEnquiries.length > 0 ? (
            <div className="space-y-3">
              {recentEnquiries.map((e) => (
                <div key={e.id} className="p-3 bg-dark-900 rounded-xl border border-gray-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gold-200">{e.customer_name}</span>
                    <span className="text-gray-400">{e.phone}</span>
                  </div>
                  <p className="text-xs text-gray-300 line-clamp-2 italic">"{e.message}"</p>
                  <div className="flex items-center justify-between pt-1 border-t border-gray-800">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        e.status === 'New'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : e.status === 'Contacted'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {e.status}
                    </span>
                    {e.status === 'New' && (
                      <button
                        onClick={() => handleEnquiryStatus(e.id, 'Contacted')}
                        className="text-[10px] text-gold-400 hover:underline font-semibold"
                      >
                        Mark Contacted
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-gray-400">No customer enquiries received yet.</div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
