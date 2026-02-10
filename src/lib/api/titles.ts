/**
 * Titles API Service
 * 
 * Functions to manage title definitions (CRUD operations for admin dashboard)
 */

import apiClient from './client';

// ==================== TYPES ====================

export type TitleSubject = 'fr' | 'math' | 'en' | 'daily' | 'special';

export interface TitleDefinition {
  id: string;
  name: string;
  description: string;
  subject: TitleSubject;
  level: number;
  required_count: number;
  icon_asset: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTitleInput {
  id: string;
  name: string;
  description?: string;
  subject: TitleSubject;
  level: number;
  required_count: number;
  icon_asset?: string | null;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateTitleInput {
  name?: string;
  description?: string;
  subject?: TitleSubject;
  level?: number;
  required_count?: number;
  icon_asset?: string | null;
  display_order?: number;
  is_active?: boolean;
}

// ==================== CONSTANTS ====================

export const TITLE_SUBJECTS: Record<TitleSubject, { label: string; color: string; bgColor: string; emoji: string }> = {
  fr: { label: 'Français', color: 'text-blue-700', bgColor: 'bg-blue-100', emoji: '🇫🇷' },
  math: { label: 'Mathématiques', color: 'text-orange-700', bgColor: 'bg-orange-100', emoji: '🔢' },
  en: { label: 'Anglais', color: 'text-green-700', bgColor: 'bg-green-100', emoji: '🇬🇧' },
  daily: { label: 'Vie Quotidienne', color: 'text-purple-700', bgColor: 'bg-purple-100', emoji: '🏠' },
  special: { label: 'Spécial', color: 'text-pink-700', bgColor: 'bg-pink-100', emoji: '⭐' },
};

export const TITLE_LEVELS: Record<number, { name: string; color: string }> = {
  1: { name: 'Débutant', color: 'text-gray-600' },
  2: { name: 'Explorateur', color: 'text-blue-600' },
  3: { name: 'Aventurier', color: 'text-green-600' },
  4: { name: 'Expert', color: 'text-orange-600' },
  5: { name: 'Maître', color: 'text-purple-600' },
};

// ==================== API FUNCTIONS ====================

/**
 * Get all title definitions (including inactive) for admin
 */
export const getAllTitles = async (): Promise<TitleDefinition[]> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: TitleDefinition[] }>(
      '/api/titles/admin/all'
    );
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error('Failed to fetch titles');
    }
  } catch (error: any) {
    console.error('❌ Error fetching titles:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch titles');
  }
};

/**
 * Get active title definitions (public)
 */
export const getActiveTitles = async (): Promise<TitleDefinition[]> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: TitleDefinition[] }>(
      '/api/titles/definitions'
    );
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error('Failed to fetch active titles');
    }
  } catch (error: any) {
    console.error('❌ Error fetching active titles:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch active titles');
  }
};

/**
 * Create a new title definition
 */
export const createTitle = async (input: CreateTitleInput): Promise<TitleDefinition> => {
  try {
    const response = await apiClient.post<{ success: boolean; data: TitleDefinition }>(
      '/api/titles/admin/create',
      input
    );
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error('Failed to create title');
    }
  } catch (error: any) {
    console.error('❌ Error creating title:', error);
    throw new Error(error.response?.data?.message || 'Failed to create title');
  }
};

/**
 * Update a title definition
 */
export const updateTitle = async (id: string, input: UpdateTitleInput): Promise<TitleDefinition> => {
  try {
    const response = await apiClient.put<{ success: boolean; data: TitleDefinition }>(
      `/api/titles/admin/${id}`,
      input
    );
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error('Failed to update title');
    }
  } catch (error: any) {
    console.error('❌ Error updating title:', error);
    throw new Error(error.response?.data?.message || 'Failed to update title');
  }
};

/**
 * Delete a title definition
 */
export const deleteTitle = async (id: string): Promise<void> => {
  try {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/api/titles/admin/${id}`
    );
    
    if (!response.data.success) {
      throw new Error('Failed to delete title');
    }
  } catch (error: any) {
    console.error('❌ Error deleting title:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete title');
  }
};
