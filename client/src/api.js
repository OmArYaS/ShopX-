import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5062';
export const USER_ID = import.meta.env.VITE_USER_ID || 'demo-user';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Products
export const productApi = {
  getAll: () => api.get('/api/products'),
  getById: (id) => api.get(`/api/products/${id}`),
  create: (data) => api.post('/api/products', data),
  update: (id, data) => api.put(`/api/products/${id}`, data),
  delete: (id) => api.delete(`/api/products/${id}`),
};

// Cart  (cart is scoped per userId; demo user = "demo-user")
export const cartApi = {
  get: (userId = USER_ID) => api.get(`/api/cart/${userId}`),
  add: (data) => api.post('/api/cart', data),
  updateQuantity: (id, userId = USER_ID, quantity) =>
    api.put(`/api/cart/${id}`, { quantity }, { params: { userId } }),
  remove: (id, userId = USER_ID) => api.delete(`/api/cart/${id}`, { params: { userId } }),
  clear: (userId = USER_ID) => api.delete(`/api/cart/clear/${userId}`),
};

// Orders
export const orderApi = {
  getAll: () => api.get('/api/orders'),
  getById: (id) => api.get(`/api/orders/${id}`),
  getByUser: (userId = USER_ID) => api.get(`/api/orders/user/${userId}`),
  place: (userId) => api.post('/api/orders', { userId }),
  updateStatus: (id, status) => api.patch(`/api/orders/${id}/status`, { status }),
};

export default api;
