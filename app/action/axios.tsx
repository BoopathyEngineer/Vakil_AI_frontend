import axios from 'axios';
import Cookies from "js-cookie"; 

const API = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
});

API.interceptors.request.use((req) => {
    const token = Cookies.get('authToken');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    // Add content type header for POST requests
    if (req.method?.toLowerCase() === 'post') {
        req.headers['Content-Type'] = 'application/json';
    }
    return req;
});

export default API;
