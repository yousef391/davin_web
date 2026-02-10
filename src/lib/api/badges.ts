/**
 * Badges API Service
 * 
 * Functions to manage badge definitions (CRUD operations for admin dashboard)
 */

import apiClient from './client';

// ==================== TYPES ====================

export type ConditionType = 'levels_completed' | 'stars_earned' | 'streak_days' | 'perfect_level' | 'time_spent';

export type BadgeVariant = 'bronze' | 'silver' | 'gold' | 'platinum' | 'special';

export interface ConditionValue {
  subject?: string;
  count?: number;
  total?: number;
  days?: number;
  minutes?: number;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  variant: BadgeVariant;
  icon_asset: string | null;
  condition_type: ConditionType;
  condition_value: ConditionValue;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBadgeInput {
  name: string;
  description?: string;
  variant: BadgeVariant;
  icon_asset?: string | null;
  condition_type: ConditionType;
  condition_value?: ConditionValue;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateBadgeInput {
  name?: string;
  description?: string;
  variant?: BadgeVariant;
  icon_asset?: string | null;
  condition_type?: ConditionType;
  condition_value?: ConditionValue;
  display_order?: number;
  is_active?: boolean;
}

// ==================== CONSTANTS ====================

export const BADGE_VARIANTS: Record<BadgeVariant, { label: string; color: string; bgColor: string }> = {
  bronze: { label: 'Bronze', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  silver: { label: 'Silver', color: 'text-gray-600', bgColor: 'bg-gray-200' },
  gold: { label: 'Gold', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  platinum: { label: 'Platinum', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  special: { label: 'Special', color: 'text-pink-600', bgColor: 'bg-pink-100' },
};

export const CONDITION_TYPES: Record<ConditionType, { label: string; description: string }> = {
  levels_completed: { 
    label: 'Levels Completed', 
    description: 'Awarded when user completes a specific number of levels in a subject' 
  },
  stars_earned: { 
    label: 'Stars Earned', 
    description: 'Awarded when user earns a total number of stars' 
  },
  streak_days: { 
    label: 'Streak Days', 
    description: 'Awarded for maintaining a daily learning streak' 
  },
  perfect_level: { 
    label: 'Perfect Level', 
    description: 'Awarded for completing a level with 3 stars' 
  },
  time_spent: { 
    label: 'Time Spent', 
    description: 'Awarded for spending a certain amount of time learning' 
  },
};

// ==================== API FUNCTIONS ====================

/**
 * Get all badge definitions (including inactive) for admin
 */
export const getAllBadges = async (): Promise<BadgeDefinition[]> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: BadgeDefinition[] }>(
      '/api/badges/admin/all'
    );
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error('Failed to fetch badges');
    }
  } catch (error: any) {
    console.error('❌ Error fetching badges:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch badges');
  }
};

/**
 * Get active badge definitions (public)
 */
export const getActiveBadges = async (): Promise<BadgeDefinition[]> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: BadgeDefinition[] }>(
      '/api/badges/definitions'
    );
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error('Failed to fetch active badges');
    }
  } catch (error: any) {
    console.error('❌ Error fetching active badges:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch active badges');
  }
};

/**
 * Create a new badge definition
 */
export const createBadge = async (input: CreateBadgeInput): Promise<BadgeDefinition> => {
  try {
    const response = await apiClient.post<{ success: boolean; data: BadgeDefinition }>(
      '/api/badges/admin/create',
      input
    );
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error('Failed to create badge');
    }
  } catch (error: any) {
    console.error('❌ Error creating badge:', error);
    throw new Error(error.response?.data?.message || 'Failed to create badge');
  }
};

/**
 * Update a badge definition
 */
export const updateBadge = async (id: string, input: UpdateBadgeInput): Promise<BadgeDefinition> => {
  try {
    const response = await apiClient.put<{ success: boolean; data: BadgeDefinition }>(
      `/api/badges/admin/${id}`,
      input
    );
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error('Failed to update badge');
    }
  } catch (error: any) {
    console.error('❌ Error updating badge:', error);
    throw new Error(error.response?.data?.message || 'Failed to update badge');
  }
};

/**
 * Delete a badge definition
 */
export const deleteBadge = async (id: string): Promise<void> => {
  try {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/api/badges/admin/${id}`
    );
    
    if (!response.data.success) {
      throw new Error('Failed to delete badge');
    }
  } catch (error: any) {
    console.error('❌ Error deleting badge:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete badge');
  }
};
