import axios from 'axios';

let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
// Ensure the apiUrl ends with /api if it's a domain
if (apiUrl && !apiUrl.endsWith('/api')) {
    apiUrl = `${apiUrl.replace(/\/$/, '')}/api`;
}

const api = axios.create({
    baseURL: apiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the auth token if available
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

export default api;
