/**
 * TypeScript Types for Authentication
 * 
 * These interfaces define the shape of data we receive from the backend.
 * TypeScript uses these to help catch errors before they happen!
 */

// ==================== API RESPONSES ====================

/**
 * User object returned from backend
 */
export interface User {
  id: string;
  email: string;
  user_metadata: {
    first_name: string;
    last_name: string;
  };
}

/**
 * Session object from Supabase (contains auth tokens)
 */
export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: User;
}

/**
 * Profile object (user can have multiple profiles - like Netflix profiles)
 */
export interface Profile {
  id: string;
  user_id: string;
  profile_name: string;
  avatar_url?: string;
  pin_hash?: string;
  is_child: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Login response from backend
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    session: Session;
    user: User;
    profiles: Profile[];
    profileCount: number;
  };
}

/**
 * Register response from backend
 */
export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    requiresVerification: boolean;
  };
}

/**
 * Error response from backend
 */
export interface ApiError {
  success: false;
  message: string;
  error?: any;
}

// ==================== REQUEST BODIES ====================

/**
 * Data sent to login endpoint
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Data sent to register endpoint
 */
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
