/**
 * Users API Service
 * 
 * Dedicated service for user management operations.
 * Follows Single Responsibility Principle - handles only user-related API calls.
 */

import { apiClient } from './client';

// ==================== TYPES ====================

/**
 * User subscription status
 */
export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'past_due' | 'inactive';

/**
 * User subscription information
 */
export interface UserSubscription {
  id: string;
  status: SubscriptionStatus;
  plan: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

/**
 * User profile (child profile)
 */
export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  age?: number;
  language: 'en' | 'fr';
  progress: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Complete user data with profiles and subscription
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: string;
  lastLogin: string | null;
  profiles: UserProfile[];
  subscription: UserSubscription | null;
  metadata?: Record<string, any>;
}

/**
 * User list item (lightweight version for lists)
 */
export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  createdAt: string;
  lastLogin: string | null;
  profileCount: number;
  subscription: {
    status: SubscriptionStatus | null;
    plan: string;
  } | null;
}

/**
 * Pagination response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

/**
 * User filter options
 */
export interface UserFilters {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  subscription?: 'all' | 'free' | 'trial' | 'paid';
  sortBy?: 'createdAt' | 'lastLogin' | 'email' | 'name';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Update user data
 */
export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

/**
 * Create profile data
 */
export interface CreateProfileData {
  name: string;
  avatarUrl?: string;
  age?: number;
  language: 'en' | 'fr';
}

/**
 * Update profile data
 */
export interface UpdateProfileData {
  name?: string;
  avatarUrl?: string;
  age?: number;
  language?: 'en' | 'fr';
}

// ==================== API FUNCTIONS ====================

/**
 * Get paginated list of users
 */
export const getUsers = async (
  page = 1,
  perPage = 20,
  filters?: UserFilters
): Promise<PaginatedResponse<UserListItem>> => {
  try {
    const response = await apiClient.get('/api/admin/users', {
      params: {
        page,
        perPage,
        search: filters?.search,
        status: filters?.status,
        subscription: filters?.subscription,
        sortBy: filters?.sortBy,
        sortOrder: filters?.sortOrder,
      },
    });

    if (response.data.success) {
      const { users, total, page: currentPage, perPage: itemsPerPage } = response.data.data;
      
      // Transform to UserListItem format
      const transformedUsers: UserListItem[] = users.map((user: any) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        profileCount: user.profiles || 0,
        subscription: user.subscription,
      }));

      return {
        data: transformedUsers,
        total,
        page: currentPage,
        perPage: itemsPerPage,
        totalPages: Math.ceil(total / itemsPerPage),
      };
    }
    
    throw new Error('Failed to fetch users');
  } catch (error: any) {
    console.error('❌ Error fetching users:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};

/**
 * Get single user with full details
 */
export const getUserById = async (userId: string): Promise<User> => {
  try {
    const response = await apiClient.get(`/api/admin/users/${userId}`);

    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error('Failed to fetch user');
  } catch (error: any) {
    console.error('❌ Error fetching user:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch user');
  }
};

/**
 * Update user metadata
 */
export const updateUser = async (userId: string, data: UpdateUserData): Promise<User> => {
  try {
    const response = await apiClient.put(`/api/admin/users/${userId}`, data);

    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error('Failed to update user');
  } catch (error: any) {
    console.error('❌ Error updating user:', error);
    throw new Error(error.response?.data?.message || 'Failed to update user');
  }
};

/**
 * Delete user account (WARNING: This deletes auth user and all data)
 */
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const response = await apiClient.delete(`/api/admin/users/${userId}`);

    if (!response.data.success) {
      throw new Error('Failed to delete user');
    }
  } catch (error: any) {
    console.error('❌ Error deleting user:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete user');
  }
};

/**
 * Get user's profiles
 */
export const getUserProfiles = async (userId: string): Promise<UserProfile[]> => {
  try {
    const response = await apiClient.get(`/api/admin/users/${userId}/profiles`);

    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error('Failed to fetch profiles');
  } catch (error: any) {
    console.error('❌ Error fetching profiles:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch profiles');
  }
};

/**
 * Create a new profile for a user
 */
export const createUserProfile = async (
  userId: string,
  data: CreateProfileData
): Promise<UserProfile> => {
  try {
    const response = await apiClient.post(`/api/admin/users/${userId}/profiles`, data);

    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error('Failed to create profile');
  } catch (error: any) {
    console.error('❌ Error creating profile:', error);
    throw new Error(error.response?.data?.message || 'Failed to create profile');
  }
};

/**
 * Update a profile
 */
export const updateUserProfile = async (
  userId: string,
  profileId: string,
  data: UpdateProfileData
): Promise<UserProfile> => {
  try {
    const response = await apiClient.put(
      `/api/admin/users/${userId}/profiles/${profileId}`,
      data
    );

    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error('Failed to update profile');
  } catch (error: any) {
    console.error('❌ Error updating profile:', error);
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

/**
 * Delete a profile
 */
export const deleteUserProfile = async (userId: string, profileId: string): Promise<void> => {
  try {
    const response = await apiClient.delete(
      `/api/admin/users/${userId}/profiles/${profileId}`
    );

    if (!response.data.success) {
      throw new Error('Failed to delete profile');
    }
  } catch (error: any) {
    console.error('❌ Error deleting profile:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete profile');
  }
};

/**
 * Cancel user's subscription
 */
export const cancelUserSubscription = async (
  userId: string,
  immediately = false
): Promise<void> => {
  try {
    const response = await apiClient.post(`/api/admin/users/${userId}/cancel-subscription`, {
      immediately,
    });

    if (!response.data.success) {
      throw new Error('Failed to cancel subscription');
    }
  } catch (error: any) {
    console.error('❌ Error canceling subscription:', error);
    throw new Error(error.response?.data?.message || 'Failed to cancel subscription');
  }
};

/**
 * Send password reset email to user
 */
export const sendPasswordReset = async (userId: string): Promise<void> => {
  try {
    const response = await apiClient.post(`/api/admin/users/${userId}/send-password-reset`);

    if (!response.data.success) {
      throw new Error('Failed to send password reset');
    }
  } catch (error: any) {
    console.error('❌ Error sending password reset:', error);
    throw new Error(error.response?.data?.message || 'Failed to send password reset');
  }
};

/**
 * Get user statistics summary
 */
export const getUserStats = async (): Promise<{
  total: number;
  active: number;
  inactive: number;
  withSubscription: number;
  newThisMonth: number;
  totalProfiles: number;
}> => {
  try {
    const response = await apiClient.get('/api/admin/users/stats');

    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error('Failed to fetch user stats');
  } catch (error: any) {
    console.error('❌ Error fetching user stats:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch user stats');
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get full name from first and last name
 */
export const getFullName = (user: UserListItem | User): string => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.firstName) return user.firstName;
  if (user.lastName) return user.lastName;
  return user.email.split('@')[0];
};

/**
 * Get user initials for avatar
 */
export const getUserInitials = (user: UserListItem | User): string => {
  const name = getFullName(user);
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Get subscription display text
 */
export const getSubscriptionDisplay = (
  subscription: UserListItem['subscription'] | UserSubscription | null
): string => {
  if (!subscription) return 'Free';
  if ('plan' in subscription && subscription.plan) {
    return subscription.plan;
  }
  return 'Free';
};

/**
 * Check if subscription is active
 */
export const isSubscriptionActive = (
  subscription: UserListItem['subscription'] | UserSubscription | null
): boolean => {
  if (!subscription) return false;
  const status = 'status' in subscription ? subscription.status : null;
  return status === 'active' || status === 'trialing';
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format relative time
 */
export const formatRelativeTime = (dateString: string | null): string => {
  if (!dateString) return 'Never';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};
