/**
 * Authentication Service
 * 
 * This file contains all functions that communicate with the backend auth API.
 * Each function is like a specific action (login, logout, etc.)
 */

import apiClient from './client';
import type { 
  LoginCredentials, 
  LoginResponse, 
  RegisterData, 
  RegisterResponse,
  Session,
  User,
  Profile
} from '../types/auth';

/**
 * Login with email and password
 * 
 * How it works:
 * 1. Send email/password to backend
 * 2. Backend checks credentials with Supabase
 * 3. If valid, backend returns session tokens + user profiles
 * 4. We save tokens to localStorage for future requests
 * 
 * @param credentials - Email and password
 * @returns User data, session, and profiles
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    // POST request to /api/auth/login
    const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials);
    
    // Save session data to browser localStorage
    // This persists even if user closes the tab
    if (response.data.success && response.data.data.session) {
      const { session, user, profiles } = response.data.data;
      
      // Store auth tokens
      localStorage.setItem('access_token', session.access_token);
      localStorage.setItem('refresh_token', session.refresh_token);
      
      // Store user info
      localStorage.setItem('user', JSON.stringify(user));
      
      // Store profiles
      localStorage.setItem('profiles', JSON.stringify(profiles));
      
      console.log('✅ Login successful, tokens saved');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Login error:', error);
    
    // Extract error message from backend response
    const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
    
    throw new Error(errorMessage);
  }
};

/**
 * Register a new user account
 * 
 * How it works:
 * 1. Send registration data to backend
 * 2. Backend creates account in Supabase
 * 3. Backend sends verification email
 * 4. User must verify email before logging in
 * 
 * @param data - Registration information
 * @returns Registration response
 */
export const register = async (data: RegisterData): Promise<RegisterResponse> => {
  try {
    const response = await apiClient.post<RegisterResponse>('/api/auth/register', data);
    
    console.log('✅ Registration successful');
    return response.data;
  } catch (error: any) {
    console.error('❌ Registration error:', error);
    
    const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
    throw new Error(errorMessage);
  }
};

/**
 * Logout current user
 * 
 * How it works:
 * 1. Call logout endpoint on backend
 * 2. Backend invalidates session with Supabase
 * 3. Clear all stored data from browser
 * 
 * @returns Success response
 */
export const logout = async (): Promise<void> => {
  try {
    // Call backend logout endpoint
    await apiClient.post('/api/auth/logout');
    
    // Clear all auth data from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('profiles');
    
    console.log('✅ Logout successful');
  } catch (error: any) {
    console.error('❌ Logout error:', error);
    
    // Even if backend call fails, clear local data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('profiles');
  }
};

/**
 * Get current user from localStorage
 * 
 * This doesn't call the API - it just reads from browser storage
 * 
 * @returns User object or null if not logged in
 */
export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Get user's profiles from localStorage
 * 
 * @returns Array of profiles or empty array
 */
export const getProfiles = (): Profile[] => {
  try {
    const profilesStr = localStorage.getItem('profiles');
    if (profilesStr) {
      return JSON.parse(profilesStr);
    }
    return [];
  } catch (error) {
    console.error('Error getting profiles:', error);
    return [];
  }
};

/**
 * Check if user is currently logged in
 * 
 * @returns true if user has valid access token
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('access_token');
  const user = getCurrentUser();
  
  return !!(token && user);
};

/**
 * Google OAuth login
 * Opens Google login in a new window
 * 
 * Note: For admin dashboard, you might want to handle this differently
 * than the mobile app since we need to handle the callback
 */
export const loginWithGoogle = () => {
  // Get the Google OAuth URL from your backend
  const googleAuthUrl = `${apiClient.defaults.baseURL}/api/auth/google`;
  
  // Open Google login in popup window
  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  
  window.open(
    googleAuthUrl,
    'Google Login',
    `width=${width},height=${height},left=${left},top=${top}`
  );
};

// Export all functions as a single object (alternative way to import)
export default {
  login,
  register,
  logout,
  getCurrentUser,
  getProfiles,
  isAuthenticated,
  loginWithGoogle,
};
