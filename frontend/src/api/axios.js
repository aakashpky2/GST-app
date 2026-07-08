import axios from 'axios';

let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
// Ensure the apiUrl ends with /api if it's a domain
if (apiUrl && !apiUrl.endsWith('/api') && !apiUrl.endsWith('/api/')) {
    apiUrl = `${apiUrl.replace(/\/$/, '')}/api`;
}
// Axios requires the baseURL to end with a slash to properly append paths
if (apiUrl && !apiUrl.endsWith('/')) {
    apiUrl += '/';
}

const api = axios.create({
    baseURL: apiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to fix leading slashes and include the auth token
api.interceptors.request.use(
    (config) => {
        // Strip leading slash from config.url so Axios doesn't drop the /api from baseURL
        if (config.url && config.url.startsWith('/')) {
            config.url = config.url.substring(1);
        }
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
