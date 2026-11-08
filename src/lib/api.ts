import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT token if available
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('bazaar_auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with RFC 7807 ProblemDetails parsing & error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const data = error.response.data;
      const status = error.response.status;

      // RFC 7807 problem details
      const errorMessage = data?.detail || data?.title || error.message || 'An error occurred';
      console.warn(`[API Error ${status}]: ${errorMessage}`, data);

      return Promise.reject({
        status,
        message: errorMessage,
        errors: data?.errors,
        data,
      });
    }

    // Network or timeout errors
    console.warn('[API Network Error]:', error.message);
    return Promise.reject({
      status: 0,
      message: 'Unable to connect to Bazaar API. Fallback data may be utilized.',
      error,
    });
  }
);

export default apiClient;

