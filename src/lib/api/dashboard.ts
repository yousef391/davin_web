/**
 * Dashboard API Service
 * 
 * Functions to fetch real data from your backend for the admin dashboard.
 * No authentication required for now (add later when you secure the admin panel).
 */

import apiClient from './client';

// ==================== TYPES ====================

export interface DashboardStats {
  users: number;
  profiles: number;
  subscriptions: number;
  monthlyRevenue: number;
  newUsersThisMonth: number;
  contentViews: number;
  avgSessionTime: string;
  videosWatched: number;
  gamesPlayed: number;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  lastLogin: string | null;
  emailVerified: boolean;
  profiles: number;
  subscription: {
    status: string;
    plan: string;
  } | null;
}

export interface AdminSubscription {
  id: string;
  userId: string;
  userName: string;
  email: string;
  status: string;
  plan: string;
  stripePriceId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== API FUNCTIONS ====================

/**
 * Get dashboard statistics
 * Fetches overview stats like total users, revenue, subscriptions
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: DashboardStats }>(
      '/api/admin/stats'
    );
    
    if (response.data.success) {
      console.log('✅ Dashboard stats fetched:', response.data.data);
      return response.data.data;
    } else {
      throw new Error('Failed to fetch dashboard stats');
    }
  } catch (error: any) {
    console.error('❌ Error fetching dashboard stats:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch dashboard statistics');
  }
};

/**
 * Get all users with profiles and subscription info
 */
export const getAdminUsers = async (page = 1, perPage = 50, search = ''): Promise<{
  users: AdminUser[];
  total: number;
  page: number;
  perPage: number;
}> => {
  try {
    const response = await apiClient.get('/api/admin/users', {
      params: { page, perPage, search }
    });
    
    if (response.data.success) {
      console.log('✅ Users fetched:', response.data.data.users.length);
      return response.data.data;
    } else {
      throw new Error('Failed to fetch users');
    }
  } catch (error: any) {
    console.error('❌ Error fetching users:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};

/**
 * Get all subscriptions with user details
 */
export const getAdminSubscriptions = async (): Promise<AdminSubscription[]> => {
  try {
    const response = await apiClient.get('/api/admin/subscriptions');
    
    if (response.data.success) {
      console.log('✅ Subscriptions fetched:', response.data.data.length);
      return response.data.data;
    } else {
      throw new Error('Failed to fetch subscriptions');
    }
  } catch (error: any) {
    console.error('❌ Error fetching subscriptions:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch subscriptions');
  }
};

export default {
  getDashboardStats,
  getAdminUsers,
  getAdminSubscriptions,
};
