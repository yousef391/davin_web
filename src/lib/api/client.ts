/**
 * API Client Configuration
 * 
 * This file sets up axios (HTTP client) to communicate with our backend API.
 * Think of it as a messenger that sends requests to your server.
 */

import axios from 'axios';

// Base URL of your backend API
// Change this to your server's address when deploying
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Create axios instance with default configuration
 * This is like creating a template for all API requests
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds max for requests
});

/**
 * Request Interceptor
 * This runs BEFORE every request is sent
 * We use it to automatically attach the auth token to requests
 */
apiClient.interceptors.request.use(
  (config) => {
    // Get the access token from localStorage
    const token = localStorage.getItem('access_token');
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * This runs AFTER every response is received
 * We use it to handle errors globally
 */
apiClient.interceptors.response.use(
  (response) => {
    // If request was successful, just return the data
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 (Unauthorized) and we have a refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (refreshToken) {
          // Try to refresh the session
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-tokens`, {
            refreshToken,
          });

          const { session } = response.data.data;
          
          // Save new tokens
          localStorage.setItem('access_token', session.access_token);
          localStorage.setItem('refresh_token', session.refresh_token);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
