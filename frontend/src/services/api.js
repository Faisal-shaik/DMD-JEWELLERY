import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const API = axios.create({
  baseURL: apiBase,
  withCredentials: true,
});

// Interceptor to attach JWT auth token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('dmd_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Products API
export const fetchProducts = (params) => API.get('/products', { params });
export const fetchProductById = (id) => API.get(`/products/${id}`);
export const createProduct = (formData) => API.post('/products', formData);
export const updateProduct = (id, formData) => API.put(`/products/${id}`, formData);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const clearAllProducts = () => API.delete('/products/clear/all');
export const deleteProductImage = (imageId) => API.delete(`/products/images/${imageId}`);
export const setPrimaryImage = (imageId) => API.put(`/products/images/${imageId}/primary`);

// Categories API
export const fetchCategories = (params) => API.get('/categories', { params });
export const createCategory = (data) => API.post('/categories', data);
export const updateCategory = (id, data) => API.put(`/categories/${id}`, data);
export const deleteCategory = (id) => API.delete(`/categories/${id}`);

// Gold Rates API
export const fetchGoldRates = (params) => API.get('/gold-rates', { params });
export const updateGoldRates = (rates) => API.put('/gold-rates', { rates });
export const syncLiveGoldRates = () => API.post('/gold-rates/sync');

// Enquiries API
export const submitEnquiry = (data) => API.post('/enquiries', data);
export const fetchEnquiries = (params) => API.get('/enquiries', { params });
export const updateEnquiryStatus = (id, status) => API.put(`/enquiries/${id}`, { status });
export const deleteEnquiry = (id) => API.delete(`/enquiries/${id}`);

// Settings API
export const fetchSettings = () => API.get('/settings');
export const updateSettings = (formData) => API.put('/settings', formData);

// Auth API
export const loginAdmin = (data) => API.post('/auth/login', data);
export const logoutAdmin = () => API.post('/auth/logout');
export const changeAdminPassword = (data) => API.post('/auth/change-password', data);
export const fetchMe = () => API.get('/auth/me');

// Analytics API
export const logPWAInstall = (data) => API.post('/analytics/pwa-install', data);
export const fetchPWAStats = () => API.get('/analytics/pwa-stats');

export default API;
