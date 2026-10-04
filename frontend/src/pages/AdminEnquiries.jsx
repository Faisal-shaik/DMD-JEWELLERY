import React, { useState, useEffect } from 'react';
import { fetchEnquiries, updateEnquiryStatus, deleteEnquiry } from '../services/api';
import { MessageSquare, Trash2, Phone, Mail, Calendar, CheckCircle } from 'lucide-react';

const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadEnquiries();
  }, [statusFilter]);

  const loadEnquiries = async () => {
    setLoading(true);
    try {
      const res = await fetchEnquiries({ status: statusFilter });
      if (res.data.success) {
        setEnquiries(res.data.enquiries || []);
      }
    } catch (err) {
      console.warn('Failed to load enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateEnquiryStatus(id, newStatus);
      loadEnquiries();
    } catch (err) {
      alert('Failed to update enquiry status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer enquiry?')) return;
    try {
      await deleteEnquiry(id);
      loadEnquiries();
    } catch (err) {
      alert('Failed to delete enquiry.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gold-400/20 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gold-gradient uppercase">CUSTOMER ENQUIRIES</h1>
          <p className="text-xs text-gray-400 mt-1">Review enquiries submitted by website customers.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-semibold">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-dark-900 text-gold-300 text-xs py-2 px-3 rounded-xl border border-gold-400/30 focus:outline-none"
          >
            <option value="all">All Enquiries</option>
            <option value="New">New Enquiries Only</option>
            <option value="Contacted">Contacted Only</option>
            <option value="Closed">Closed Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-dark-800 rounded-3xl border border-gold-400/20 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading customer enquiries...</div>
        ) : enquiries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-dark-900 text-gold-300 uppercase tracking-wider text-[11px] border-b border-gold-400/20">
                <tr>
                  <th className="p-4">Customer Info</th>
                  <th className="p-4">Enquired Product</th>
                  <th className="p-4">Message / Note</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {enquiries.map((e) => (
                  <tr key={e.id} className="hover:bg-dark-700/50 transition-colors">
                    <td className="p-4 space-y-1">
                      <div className="font-serif font-bold text-sm text-gray-100">{e.customer_name}</div>
                      <div className="flex items-center gap-1.5 text-gold-400 font-mono">
                        <Phone className="w-3 h-3" /> <a href={`tel:${e.phone}`}>{e.phone}</a>
                      </div>
                      {e.email && (
                        <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                          <Mail className="w-3 h-3" /> <a href={`mailto:${e.email}`}>{e.email}</a>
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      {e.product_name ? (
                        <div>
                          <span className="font-semibold text-gray-200 block">{e.product_name}</span>
                          <span className="font-mono text-[10px] text-gold-400">{e.product_code}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">General Showroom Enquiry</span>
                      )}
                    </td>

                    <td className="p-4 max-w-xs">
                      <p className="bg-dark-900/60 p-2.5 rounded-lg border border-gray-800 text-gray-300 whitespace-pre-wrap">
                        {e.message}
                      </p>
                    </td>

                    <td className="p-4 font-mono text-[11px] text-gray-400 whitespace-nowrap">
                      {new Date(e.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="p-4">
                      <select
                        value={e.status}
                        onChange={(evt) => handleStatusChange(e.id, evt.target.value)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none uppercase ${
                          e.status === 'New'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : e.status === 'Contacted'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="p-1.5 bg-rose-950 text-rose-300 hover:bg-rose-600 hover:text-white rounded border border-rose-800"
                        title="Delete Enquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-gray-400">
            No customer enquiries yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEnquiries;
