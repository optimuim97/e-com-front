import axios from 'axios';

const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL ?? 'http://localhost:7000',
  withCredentials: true,
  headers: {
    'Accept':          'application/json',
    'Content-Type':    'application/json',
    'X-Requested-With':'XMLHttpRequest',
  },
});

// Injecter le token Bearer sur chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Rediriger vers /login si 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export default api;
