/**
 * Content API Service
 * 
 * Functions to manage educational content (videos, templates, games, audio)
 */

import apiClient from './client';

// ==================== TYPES ====================

export type ContentType = 'video' | 'template' | 'game' | 'audio';
export type ContentStatus = 'draft' | 'published' | 'processing' | 'archived';

export interface Content {
  id: string;
  title: string;
  description?: string;
  type: ContentType;
  category?: string;
  subject?: string;
  asset_path?: string;
  external_url?: string;
  thumbnail_url?: string;
  file_size_mb?: number;
  duration_seconds?: number;
  status: ContentStatus;
  is_premium: boolean;
  views_count: number;
  likes_count: number;
  downloads_count: number;
  age_range?: string;
  difficulty_level?: number;
  learning_objectives?: string[];
  tags?: string[];
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentStats {
  byType: {
    video: number;
    template: number;
    game: number;
    audio: number;
  };
  byStatus: {
    published: number;
    draft: number;
    processing: number;
    archived: number;
  };
  totalViews: number;
  totalLikes: number;
  totalContent: number;
}

export interface ContentFilters {
  type?: ContentType;
  category?: string;
  status?: ContentStatus;
  subject?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// ==================== API FUNCTIONS ====================

/**
 * Get all content with optional filters
 */
export const getContent = async (filters?: ContentFilters): Promise<{ data: Content[]; total: number }> => {
  try {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.type) params.append('type', filters.type);
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.search) params.append('search', filters.search);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());
    }

    const response = await apiClient.get<{ success: boolean; data: Content[]; total: number }>(
      `/api/content?${params.toString()}`
    );
    
    if (response.data.success) {
      return { data: response.data.data, total: response.data.total };
    } else {
      throw new Error('Failed to fetch content');
    }
  } catch (error: any) {
    console.error('❌ Error fetching content:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch content');
  }
};

/**
 * Get content statistics
 */
export const getContentStats = async (): Promise<ContentStats> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: ContentStats }>(
      '/api/content/stats'
    );
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error('Failed to fetch content statistics');
    }
  } catch (error: any) {
    console.error('❌ Error fetching content stats:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch content statistics');
  }
};

/**
 * Get single content item by ID
 */
export const getContentById = async (id: string): Promise<Content> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: Content }>(
      `/api/content/${id}`
    );
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error('Content not found');
    }
  } catch (error: any) {
    console.error('❌ Error fetching content by ID:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch content');
  }
};

/**
 * Increment view count for content
 */
export const incrementContentView = async (id: string): Promise<void> => {
  try {
    await apiClient.post(`/api/content/${id}/view`);
  } catch (error: any) {
    console.error('❌ Error incrementing view count:', error);
    // Don't throw error - this is not critical
  }
};
