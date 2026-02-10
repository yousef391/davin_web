/**
 * Levels API Service
 * 
 * Functions to manage educational levels and sections
 */

import apiClient from './client';

// ==================== TYPES ====================

export type TemplateType = 
  | 'letter_tracing' 
  | 'audio_matching' 
  | 'listen_and_choose' 
  | 'fill_the_blank' 
  | 'reorder_words' 
  | 'multiple_choice'
  | 'solve_equation'
  | 'count_by'
  | 'number_matching'
  | 'arrange_numbers'
  | 'follow_pattern'
  | 'shape_pattern'
  | 'story_problem'
  | 'video'
  | 'memory_card'
  | 'story';

export type SubjectType = 'en' | 'fr' | 'math';

export interface Section {
  id: string;
  subject: SubjectType;
  title: string;
  section_number: number;
  color?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  levels?: Level[];
}

export interface Activity {
  id: string;
  level_id: string;
  step_number: number;
  template: TemplateType;
  config: Record<string, any>;
  title?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Level {
  id: string;
  section_id: string;
  level_number: number;
  title: string;
  introduction?: string;
  template: TemplateType;
  config: Record<string, any>;
  display_order: number;
  use_activities?: boolean;
  activities?: Activity[];
  created_at: string;
  updated_at: string;
}

export interface CreateActivityData {
  level_id: string;
  step_number: number;
  template: TemplateType;
  config: Record<string, any>;
  title?: string;
}

export interface CreateLevelData {
  section_id: string;
  level_number: number;
  title: string;
  introduction?: string;
  template: TemplateType;
  config: Record<string, any>;
  display_order: number;
}

export interface CreateSectionData {
  subject: SubjectType;
  title: string;
  section_number: number;
  color?: string;
  display_order: number;
}

// Template config schemas for reference
export const TEMPLATE_CONFIGS: Record<TemplateType, { label: string; category: string; fields: { name: string; type: string; label: string; required: boolean; description?: string }[] }> = {
  letter_tracing: {
    label: 'Letter Tracing',
    category: 'Language',
    fields: [
      { name: 'letter', type: 'text', label: 'Letter', required: true, description: 'The letter to trace (e.g., A, B, C)' },
      { name: 'prompt', type: 'text', label: 'Prompt', required: true, description: 'Instructions for the child' },
    ]
  },
  audio_matching: {
    label: 'Audio Matching',
    category: 'Language',
    fields: [
      { name: 'prompt', type: 'text', label: 'Prompt', required: true, description: 'Instructions for matching' },
      { name: 'pairs', type: 'audio_pairs', label: 'Audio-Word Pairs', required: true, description: 'Audio files matched with words' },
    ]
  },
  listen_and_choose: {
    label: 'Listen and Choose',
    category: 'Language',
    fields: [
      { name: 'label', type: 'text', label: 'Label', required: true, description: 'What to listen for' },
      { name: 'imageAssets', type: 'string_array', label: 'Image Assets', required: true, description: 'Paths to image options' },
      { name: 'correctAnswer', type: 'number', label: 'Correct Answer Index', required: true, description: '0-based index of correct image' },
    ]
  },
  fill_the_blank: {
    label: 'Fill the Blank',
    category: 'Language',
    fields: [
      { name: 'questionSuffix', type: 'text', label: 'Question Suffix', required: true, description: 'Text after the blank (e.g., "_at" for cat)' },
      { name: 'options', type: 'fill_options', label: 'Options', required: true, description: 'Answer choices' },
      { name: 'correctAnswer', type: 'number', label: 'Correct Answer Index', required: true, description: '0-based index of correct option' },
    ]
  },
  reorder_words: {
    label: 'Reorder Words',
    category: 'Language',
    fields: [
      { name: 'words', type: 'string_array', label: 'Words', required: true, description: 'Words to reorder' },
      { name: 'correctOrder', type: 'number_array', label: 'Correct Order', required: true, description: 'Indices in correct order' },
      { name: 'audioAssetPath', type: 'text', label: 'Audio URL (Optional)', required: false, description: 'Optional audio file URL. If empty, uses text-to-speech.' },
    ]
  },
  multiple_choice: {
    label: 'Multiple Choice',
    category: 'Language',
    fields: [
      { name: 'instruction', type: 'text', label: 'Instruction', required: true, description: 'The question to ask' },
      { name: 'options', type: 'selectable_options', label: 'Options', required: true, description: 'Answer choices with optional images' },
      { name: 'correctIndices', type: 'number_array', label: 'Correct Indices', required: true, description: 'Indices of correct answers' },
    ]
  },
  solve_equation: {
    label: 'Solve Equation',
    category: 'Math',
    fields: [
      { name: 'equation', type: 'text', label: 'Equation', required: true, description: 'Math equation (e.g., "2 + 2 = ?")' },
      { name: 'options', type: 'number_array', label: 'Options', required: true, description: 'Number choices' },
      { name: 'correctAnswer', type: 'number', label: 'Correct Answer Index', required: true, description: '0-based index of correct option' },
    ]
  },
  count_by: {
    label: 'Count By',
    category: 'Math',
    fields: [
      { name: 'instruction', type: 'text', label: 'Instruction', required: true, description: 'Counting instruction' },
      { name: 'initialSequence', type: 'number_array', label: 'Initial Sequence', required: true, description: 'Starting numbers shown' },
      { name: 'numberOfInputs', type: 'number', label: 'Number of Inputs', required: true, description: 'How many blanks to fill' },
      { name: 'correctAnswers', type: 'number_array', label: 'Correct Answers', required: true, description: 'Expected answers' },
    ]
  },
  number_matching: {
    label: 'Number Matching',
    category: 'Math',
    fields: [
      { name: 'instruction', type: 'text', label: 'Instruction', required: true, description: 'Matching instruction' },
      { name: 'items', type: 'number_items', label: 'Items', required: true, description: 'Number-image pairs to match' },
    ]
  },
  arrange_numbers: {
    label: 'Arrange Numbers',
    category: 'Math',
    fields: [
      { name: 'instruction', type: 'text', label: 'Instruction', required: true, description: 'Arrangement instruction' },
      { name: 'numbers', type: 'number_array', label: 'Numbers', required: true, description: 'Numbers to arrange' },
      { name: 'ascending', type: 'boolean', label: 'Ascending Order', required: true, description: 'True for smallest to largest' },
    ]
  },
  follow_pattern: {
    label: 'Follow Pattern',
    category: 'Math',
    fields: [
      { name: 'instruction', type: 'text', label: 'Instruction', required: true, description: 'Pattern instruction' },
      { name: 'examples', type: 'string_array', label: 'Examples', required: true, description: 'Pattern examples' },
      { name: 'question', type: 'text', label: 'Question', required: true, description: 'The question mark or blank' },
      { name: 'options', type: 'number_array', label: 'Options', required: true, description: 'Answer choices' },
      { name: 'correctAnswerIndex', type: 'number', label: 'Correct Answer Index', required: true, description: '0-based index' },
    ]
  },
  shape_pattern: {
    label: 'Shape Pattern',
    category: 'Math',
    fields: [
      { name: 'instruction', type: 'text', label: 'Instruction', required: true, description: 'Pattern instruction' },
      { name: 'patternImages', type: 'string_array', label: 'Pattern Images', required: true, description: 'Image paths for pattern' },
      { name: 'optionImages', type: 'string_array', label: 'Option Images', required: true, description: 'Image paths for options' },
      { name: 'correctIndex', type: 'number', label: 'Correct Index', required: true, description: '0-based index of correct option' },
      { name: 'patternType', type: 'text', label: 'Pattern Type', required: true, description: 'Type: shapes, colors, etc.' },
    ]
  },
  story_problem: {
    label: 'Story Problem',
    category: 'Math',
    fields: [
      { name: 'instruction', type: 'textarea', label: 'Story/Instruction', required: true, description: 'The story problem text' },
      { name: 'draggableOptions', type: 'draggable_options', label: 'Draggable Options', required: true, description: 'Items to drag' },
      { name: 'correctTotalValue', type: 'number', label: 'Correct Total Value', required: true, description: 'Expected total' },
      { name: 'unitName', type: 'text', label: 'Unit Name', required: true, description: 'Unit (apples, coins, etc.)' },
    ]
  },
  video: {
    label: 'Video',
    category: 'Media',
    fields: [
      { name: 'videoUrl', type: 'text', label: 'Video URL/Path', required: true, description: 'Path to video file' },
      { name: 'prompt', type: 'text', label: 'Prompt', required: false, description: 'Optional viewing prompt' },
    ]
  },
  memory_card: {
    label: 'Memory Card',
    category: 'Media',
    fields: [
      { name: 'instruction', type: 'text', label: 'Instruction', required: true, description: 'Game instruction' },
      { name: 'pairs', type: 'memory_pairs', label: 'Card Pairs', required: true, description: 'Image paths for matching pairs' },
    ]
  },
  story: {
    label: 'Story',
    category: 'Media',
    fields: [
      { name: 'elements', type: 'story_elements', label: 'Story Elements', required: true, description: 'Story content elements' },
    ]
  },
};

// ==================== API FUNCTIONS ====================

/**
 * Get all sections with levels for a subject
 */
export const getSections = async (subject: SubjectType): Promise<Section[]> => {
  try {
    const response = await apiClient.get<Section[]>(`/api/content/sections?subject=${subject}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching sections:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch sections');
  }
};

/**
 * Get all sections for all subjects
 */
export const getAllSections = async (): Promise<Section[]> => {
  try {
    const [en, fr, math] = await Promise.all([
      getSections('en'),
      getSections('fr'),
      getSections('math'),
    ]);
    return [...en, ...fr, ...math];
  } catch (error: any) {
    console.error('❌ Error fetching all sections:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch sections');
  }
};

/**
 * Create a new section
 */
export const createSection = async (data: CreateSectionData): Promise<Section> => {
  try {
    const response = await apiClient.post<Section>('/api/content/sections', data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating section:', error);
    throw new Error(error.response?.data?.error || 'Failed to create section');
  }
};

/**
 * Create a new level
 */
export const createLevel = async (data: CreateLevelData): Promise<Level> => {
  try {
    console.log('🔄 API createLevel called with:', data);
    const response = await apiClient.post<Level>('/api/content/levels', data);
    console.log('✅ Level created:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating level:', error);
    console.error('❌ Error response:', error.response?.data);
    throw new Error(error.response?.data?.error || 'Failed to create level');
  }
};

/**
 * Delete a level
 */
export const deleteLevel = async (levelId: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/content/levels/${levelId}`);
  } catch (error: any) {
    console.error('❌ Error deleting level:', error);
    throw new Error(error.response?.data?.error || 'Failed to delete level');
  }
};

/**
 * Delete a section
 */
export const deleteSection = async (sectionId: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/content/sections/${sectionId}`);
  } catch (error: any) {
    console.error('❌ Error deleting section:', error);
    throw new Error(error.response?.data?.error || 'Failed to delete section');
  }
};

/**
 * Update a level
 */
export const updateLevel = async (levelId: string, data: Partial<CreateLevelData>): Promise<Level> => {
  try {
    const response = await apiClient.put<Level>(`/api/content/levels/${levelId}`, data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating level:', error);
    throw new Error(error.response?.data?.error || 'Failed to update level');
  }
};

// ==================== ACTIVITY API FUNCTIONS ====================

/**
 * Get all activities for a level
 */
export const getActivities = async (levelId: string): Promise<Activity[]> => {
  try {
    const response = await apiClient.get<Activity[]>(`/api/content/levels/${levelId}/activities`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching activities:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch activities');
  }
};

/**
 * Create a new activity for a level
 */
export const createActivity = async (data: CreateActivityData): Promise<Activity> => {
  try {
    const response = await apiClient.post<Activity>('/api/content/activities', data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating activity:', error);
    throw new Error(error.response?.data?.error || 'Failed to create activity');
  }
};

/**
 * Create multiple activities for a level at once
 */
export const createActivitiesBulk = async (levelId: string, activities: Omit<CreateActivityData, 'level_id'>[]): Promise<Activity[]> => {
  try {
    const response = await apiClient.post<Activity[]>(`/api/content/levels/${levelId}/activities/bulk`, { activities });
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating activities:', error);
    throw new Error(error.response?.data?.error || 'Failed to create activities');
  }
};

/**
 * Update an activity
 */
export const updateActivity = async (activityId: string, data: Partial<CreateActivityData>): Promise<Activity> => {
  try {
    const response = await apiClient.put<Activity>(`/api/content/activities/${activityId}`, data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating activity:', error);
    throw new Error(error.response?.data?.error || 'Failed to update activity');
  }
};

/**
 * Delete an activity
 */
export const deleteActivity = async (activityId: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/content/activities/${activityId}`);
  } catch (error: any) {
    console.error('❌ Error deleting activity:', error);
    throw new Error(error.response?.data?.error || 'Failed to delete activity');
  }
};

/**
 * Create a multi-activity level (level with multiple steps)
 */
export const createMultiActivityLevel = async (
  levelData: Omit<CreateLevelData, 'template' | 'config'>,
  activities: Omit<CreateActivityData, 'level_id'>[]
): Promise<Level> => {
  try {
    // First create the level with a placeholder template
    const level = await createLevel({
      ...levelData,
      template: 'multiple_choice', // Placeholder, will use activities
      config: {},
    });

    // Then create all activities for this level
    if (activities.length > 0) {
      await createActivitiesBulk(level.id, activities);
    }

    return level;
  } catch (error: any) {
    console.error('❌ Error creating multi-activity level:', error);
    throw new Error(error.response?.data?.error || 'Failed to create multi-activity level');
  }
};

/**
 * Get the next available level number for a section
 */
export const getNextLevelNumber = async (sectionId: string): Promise<number> => {
  try {
    const response = await apiClient.get<{ next_level_number: number }>(`/api/content/sections/${sectionId}/next-level-number`);
    return response.data.next_level_number;
  } catch (error: any) {
    console.error('❌ Error getting next level number:', error);
    // Fallback to 1 if we can't determine
    return 1;
  }
};
