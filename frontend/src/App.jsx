import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';

// Customer Components & Pages
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingContactButtons from './components/FloatingContactButtons';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Categories from './pages/Categories';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import InstallPWAPrompt from './components/InstallPWAPrompt';
import PWAUpdateToast from './components/PWAUpdateToast';

// Admin Components & Pages
import AdminSidebar from './components/AdminSidebar';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminProductForm from './pages/AdminProductForm';
import AdminCategories from './pages/AdminCategories';
import AdminGoldRates from './pages/AdminGoldRates';
import AdminEnquiries from './pages/AdminEnquiries';
import AdminSettings from './pages/AdminSettings';
import AdminPassword from './pages/AdminPassword';

import { Menu } from 'lucide-react';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen bg-dark-900 text-gray-400 flex items-center justify-center">Authenticating...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// Admin Layout Shell
const AdminLayout = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-900 text-gray-100 flex font-sans">
      <AdminSidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-dark-800 border-b border-gold-400/20 px-6 flex items-center justify-between sticky top-0 z-30 lg:hidden">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 text-gold-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-serif text-lg font-bold text-gold-gradient">DMD ADMIN</span>
        </header>

        <main className="p-4 sm:p-8 flex-1 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

// Customer Layout Shell
const CustomerLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-dark-900 text-gray-100 font-sans">
      <Navbar />
      <main className="flex-1">{children}</main>
      <FloatingContactButtons />
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <InstallPWAPrompt />
        <PWAUpdateToast />
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Navigate to="/admin/dashboard" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminProducts />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/add"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminProductForm />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/edit/:id"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminProductForm />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminCategories />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/gold-rates"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminGoldRates />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/enquiries"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminEnquiries />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminSettings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/password"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminPassword />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Customer Facing Public Routes */}
          <Route
            path="*"
            element={
              <CustomerLayout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/jewellery" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                </Routes>
              </CustomerLayout>
            }
          />
        </Routes>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
