// خزمەتگوزاری API
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// دروستکردنی instance ی axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// زیادکردنی تۆکن بۆ هەر داواکاری
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// هەڵەڕەشەی وەڵامەکان
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // سڕینەوەی تۆکن و ناردنەوە بۆ لاپەڕەی چوونەژوورەوە
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Functions

// ---------------------- AUTH ----------------------
export const login = (credentials) => api.post('/auth/login', credentials);
export const getCurrentUser = () => api.get('/auth/me');
export const changePassword = (data) => api.post('/auth/change-password', data);

// ---------------------- INVENTORY ----------------------
export const getAllProducts = (params) => api.get('/inventory', { params });
export const getProductById = (id) => api.get(`/inventory/${id}`);
export const addProduct = (data) => api.post('/inventory', data);
export const updateProduct = (id, data) => api.put(`/inventory/${id}`, data);
export const deleteProduct = (id) => api.delete(`/inventory/${id}`);
export const getLowStockProducts = () => api.get('/inventory/alerts/low-stock');
export const getProductCategories = (language) => api.get('/inventory/meta/categories', { params: { language } });

// ---------------------- SALES ----------------------
export const createSale = (data) => api.post('/sales', data);
export const getAllSales = (params) => api.get('/sales', { params });
export const getSaleById = (id) => api.get(`/sales/${id}`);
export const deleteSale = (id) => api.delete(`/sales/${id}`);
export const getTodaySalesStats = () => api.get('/sales/stats/today');

// ---------------------- SERVICES ----------------------
export const getAllServices = (params) => api.get('/services', { params });
export const getServiceById = (id) => api.get(`/services/${id}`);
export const addService = (data) => api.post('/services', data);
export const updateService = (id, data) => api.put(`/services/${id}`, data);
export const deleteService = (id) => api.delete(`/services/${id}`);

// ---------------------- CUSTOMERS ----------------------
export const getAllCustomers = (params) => api.get('/customers', { params });
export const getCustomerById = (id) => api.get(`/customers/${id}`);
export const addCustomer = (data) => api.post('/customers', data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);
export const getTopCustomers = (limit) => api.get('/customers/stats/top', { params: { limit } });

// ---------------------- APPOINTMENTS ----------------------
export const getAllAppointments = (params) => api.get('/appointments', { params });
export const createAppointment = (data) => api.post('/appointments', data);
export const updateAppointmentStatus = (id, status) => api.patch(`/appointments/${id}/status`, { status });
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`);
export const getTodayAppointments = () => api.get('/appointments/today/list');

// ---------------------- EXPENSES ----------------------
export const getAllExpenses = (params) => api.get('/expenses', { params });
export const getExpenseById = (id) => api.get(`/expenses/${id}`);
export const addExpense = (data) => api.post('/expenses', data);
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);
export const getExpenseSummary = (params) => api.get('/expenses/stats/summary', { params });
export const getExpenseCategories = (language) => api.get('/expenses/meta/categories', { params: { language } });

// ---------------------- REPORTS ----------------------
export const getDashboardStats = () => api.get('/reports/dashboard');
export const getSalesReport = (params) => api.get('/reports/sales', { params });
export const getProfitLossReport = (params) => api.get('/reports/profit-loss', { params });
export const getTopSellingProducts = (params) => api.get('/reports/top-products', { params });
export const getTopServices = (params) => api.get('/reports/top-services', { params });
export const getCustomerReport = (params) => api.get('/reports/customers', { params });
export const getInventoryReport = () => api.get('/reports/inventory');

// ---------------------- USERS ----------------------
export const getAllUsers = () => api.get('/users');
export const addUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const resetUserPassword = (id, newPassword) => api.post(`/users/${id}/reset-password`, { newPassword });
export const deleteUser = (id) => api.delete(`/users/${id}`);

export default api;