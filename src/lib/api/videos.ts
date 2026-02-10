/**
 * Downloadable Videos API Service
 * 
 * Functions to manage admin-uploaded videos for offline download
 */

import apiClient from './client';

// ==================== TYPES ====================

export interface DownloadableVideo {
  id: string;
  title: string;
  description?: string;
  category: string;
  video_url: string;
  thumbnail_url?: string;
  file_size_bytes?: number;
  duration_seconds?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VideoUploadPayload {
  title: string;
  description?: string;
  category?: string;
  video: File;
  thumbnail?: File;
}

// ==================== CATEGORIES ====================

export const VIDEO_CATEGORIES = {
  general: { label: 'Général', emoji: '📺' },
  french: { label: 'Français', emoji: '🇫🇷' },
  math: { label: 'Mathématiques', emoji: '🔢' },
  english: { label: 'Anglais', emoji: '🇬🇧' },
  science: { label: 'Sciences', emoji: '🔬' },
  story: { label: 'Histoires', emoji: '📖' },
  music: { label: 'Musique', emoji: '🎵' },
} as const;

export type VideoCategory = keyof typeof VIDEO_CATEGORIES;

// ==================== API FUNCTIONS ====================

/**
 * Get all videos for admin (including inactive)
 */
export const getAdminVideos = async (): Promise<DownloadableVideo[]> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: DownloadableVideo[] }>(
      '/api/videos/admin/list'
    );
    
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error('Failed to fetch videos');
  } catch (error: any) {
    console.error('❌ Error fetching admin videos:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch videos');
  }
};

/**
 * Get public videos (active only)
 */
export const getVideos = async (category?: string): Promise<DownloadableVideo[]> => {
  try {
    const params = category && category !== 'all' ? `?category=${category}` : '';
    const response = await apiClient.get<{ success: boolean; data: DownloadableVideo[] }>(
      `/api/videos${params}`
    );
    
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error('Failed to fetch videos');
  } catch (error: any) {
    console.error('❌ Error fetching videos:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch videos');
  }
};

/**
 * Upload a new video
 */
export const uploadVideo = async (payload: VideoUploadPayload): Promise<DownloadableVideo> => {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    if (payload.description) formData.append('description', payload.description);
    formData.append('category', payload.category || 'general');
    formData.append('video', payload.video);
    if (payload.thumbnail) formData.append('thumbnail', payload.thumbnail);

    const response = await apiClient.post<{ success: boolean; data: DownloadableVideo }>(
      '/api/videos/admin/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 600000, // 10 min timeout for large videos
      }
    );
    
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error('Failed to upload video');
  } catch (error: any) {
    console.error('❌ Error uploading video:', error);
    throw new Error(error.response?.data?.error || 'Failed to upload video');
  }
};

/**
 * Update video metadata
 */
export const updateVideo = async (id: string, updates: Partial<DownloadableVideo>): Promise<DownloadableVideo> => {
  try {
    const response = await apiClient.put<{ success: boolean; data: DownloadableVideo }>(
      `/api/videos/admin/${id}`,
      updates
    );
    
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error('Failed to update video');
  } catch (error: any) {
    console.error('❌ Error updating video:', error);
    throw new Error(error.response?.data?.error || 'Failed to update video');
  }
};

/**
 * Delete a video
 */
export const deleteVideo = async (id: string): Promise<void> => {
  try {
    const response = await apiClient.delete<{ success: boolean }>(`/api/videos/admin/${id}`);
    
    if (!response.data.success) {
      throw new Error('Failed to delete video');
    }
  } catch (error: any) {
    console.error('❌ Error deleting video:', error);
    throw new Error(error.response?.data?.error || 'Failed to delete video');
  }
};

/**
 * Format file size to human readable
 */
export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return 'Unknown';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};
