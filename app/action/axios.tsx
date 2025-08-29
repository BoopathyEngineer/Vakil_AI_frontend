import axios from 'axios';
import Cookies from "js-cookie"; 

const API = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
    timeout: 10000, // 10 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

API.interceptors.request.use((req) => {
    const token = Cookies.get('authToken');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// Add response interceptor to handle errors
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout');
        } else if (!error.response) {
            console.error('Network error - make sure your API is running');
        } else {
            console.error('API error:', error.response.status, error.response.data);
        }
        return Promise.reject(error);
    }
);

export default API;
