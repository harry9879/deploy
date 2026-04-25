import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? `${window.location.origin.replace(/\/+$/, '')}/api` : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Don't attach auth token for public endpoints
    const publicPaths = ['/auth/verify-email', '/auth/login', '/auth/register'];
    const isPublic = publicPaths.some(path => config.url?.includes(path));
    
    if (!isPublic) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect to login for public endpoints or verify-email
    const requestUrl = error.config?.url || '';
    const publicPaths = ['/auth/verify-email', '/auth/login', '/auth/register'];
    const isPublic = publicPaths.some(path => requestUrl.includes(path));
    
    if (error.response?.status === 401 && !isPublic) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
