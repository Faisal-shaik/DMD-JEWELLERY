import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FolderTree,
  TrendingUp,
  MessageSquare,
  Store,
  Settings,
  KeyRound,
  LogOut,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const AdminSidebar = ({ mobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { settings } = useSettings();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Add Product', path: '/admin/products/add', icon: PlusCircle },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Gold Rates', path: '/admin/gold-rates', icon: TrendingUp },
    { name: 'Enquiries', path: '/admin/enquiries', icon: MessageSquare },
    { name: 'Shop Info & Settings', path: '/admin/settings', icon: Store },
    { name: 'Change Password', path: '/admin/password', icon: KeyRound },
  ];

  return (
    <>
      {/* Sidebar Content */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark-800 border-r border-gold-400/20 flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header Branding */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-gold-400/20">
            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <img
                src={settings.logo_url || '/dmd_logo.jpg'}
                alt="Admin DMD"
                className="h-10 w-auto object-contain rounded border border-gold-400/40"
                onError={(e) => {
                  e.target.src = '/dmd_logo.jpg';
                }}
              />
              <div>
                <span className="font-serif text-lg font-bold text-gold-gradient block leading-tight">
                  DMD ADMIN
                </span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-sans">
                  Management Panel
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Logged User Info */}
          <div className="px-6 py-4 bg-dark-900/60 border-b border-gold-400/10">
            <p className="text-xs text-gray-400">Logged in as:</p>
            <p className="text-sm font-semibold text-gold-300 truncate">{user?.name || 'Administrator'}</p>
            <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 py-6 space-y-1.5 overflow-y-auto max-h-[calc(100vh-250px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gold-gradient text-dark-900 font-bold shadow-md'
                      : 'text-gray-300 hover:bg-dark-700 hover:text-gold-300'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gold-400/20 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg bg-dark-900 text-xs font-semibold text-gold-300 border border-gold-400/30 hover:bg-gold-400 hover:text-dark-900 transition-colors"
          >
            <span>View Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg bg-rose-950/40 text-rose-300 border border-rose-800/40 hover:bg-rose-900/60 font-semibold text-xs transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  );
};

export default AdminSidebar;
