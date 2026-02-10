'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Plus, Trash2, GripVertical, ChevronDown, ChevronRight } from 'lucide-react'
import * as levelsAPI from '@/lib/api/levels'
import { validateActivity } from '@/lib/validation'
import { AssetPicker } from '../ui/AssetPicker'
import { Image as ImageIcon } from 'lucide-react'

interface ActivityStep {
  id: string;
  template: levelsAPI.TemplateType;
  config: Record<string, any>;
  title?: string;
  isExpanded: boolean;
}

interface CreateLevelModalProps {
  section: levelsAPI.Section
  onClose: () => void
  onCreated: () => void
}

export function CreateLevelModal({ section, onClose, onCreated }: CreateLevelModalProps) {
  const [loading, setLoading] = useState(false)
  const [loadingLevelNumber, setLoadingLevelNumber] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Basic fields
  const [title, setTitle] = useState('')
  const [introduction, setIntroduction] = useState('')
  const [levelNumber, setLevelNumber] = useState(1)
  
  // Fetch actual next level number from API
  useEffect(() => {
    const fetchNextLevelNumber = async () => {
      try {
        setLoadingLevelNumber(true)
        const nextNum = await levelsAPI.getNextLevelNumber(section.id)
        console.log('📊 Next level number from API:', nextNum)
        setLevelNumber(nextNum)
      } catch (err) {
        console.error('Failed to fetch next level number:', err)
        // Fallback: calculate from section.levels
        const fallback = section.levels && section.levels.length > 0
          ? Math.max(...section.levels.map(l => l.level_number)) + 1
          : 1
        setLevelNumber(fallback)
      } finally {
        setLoadingLevelNumber(false)
      }
    }
    fetchNextLevelNumber()
  }, [section.id, section.levels])
  
  // Multi-step mode
  const [isMultiStep, setIsMultiStep] = useState(false)
  const [activities, setActivities] = useState<ActivityStep[]>([])
  
  // Single activity mode (legacy)
  const [template, setTemplate] = useState<levelsAPI.TemplateType>('letter_tracing')
  const [config, setConfig] = useState<Record<string, any>>({})

  // Asset Picker State
  const [assetPickerOpen, setAssetPickerOpen] = useState(false)
  const [assetPickerCallback, setAssetPickerCallback] = useState<((url: string) => void) | null>(null)

  const openAssetPicker = (callback: (url: string) => void) => {
    setAssetPickerCallback(() => callback)
    setAssetPickerOpen(true)
  }

  const templateInfo = levelsAPI.TEMPLATE_CONFIGS[template]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)

      // --- VALIDATION START ---
      if (isMultiStep) {
        // Validate all activities in the list
        for (let i = 0; i < activities.length; i++) {
          const act = activities[i];
          const validationError = validateActivity(act.template, act.config);
          if (validationError) {
            setError(`Step ${i + 1} (${levelsAPI.TEMPLATE_CONFIGS[act.template].label}): ${validationError}`);
            setLoading(false);
            return;
          }
        }
      } else {
        // Validate single activity
        const validationError = validateActivity(template, config);
        if (validationError) {
          setError(validationError);
          setLoading(false);
          return;
        }
      }
      // --- VALIDATION END ---
      
      console.log('📤 Creating level with:', {
        section_id: section.id,
        section_title: section.title,
        level_number: levelNumber,
        existing_levels: section.levels?.map(l => l.level_number),
        title,
        isMultiStep,
      })
      
      if (isMultiStep && activities.length > 0) {
        // Create multi-step level with activities
        const levelData = {
          section_id: section.id,
          level_number: levelNumber,
          title,
          introduction,
          display_order: levelNumber,
        }
        
        const activityData = activities.map((activity, index) => ({
          step_number: index + 1,
          template: activity.template,
          config: activity.config,
          title: activity.title,
        }))
        
        await levelsAPI.createMultiActivityLevel(levelData, activityData)
      } else {
        // Create single-activity level
        await levelsAPI.createLevel({
          section_id: section.id,
          level_number: levelNumber,
          title,
          introduction,
          template,
          config,
          display_order: levelNumber,
        })
      }
      
      onCreated()
    } catch (err: any) {
      console.error('❌ Level creation error:', err)
      setError(err.message || 'Failed to create level')
    } finally {
      setLoading(false)
    }
  }

  const updateConfig = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }))
    // Optional: could run validation here for realtime feedback
  }

  // Reset config when template changes
  const handleTemplateChange = (newTemplate: levelsAPI.TemplateType) => {
    setTemplate(newTemplate)
    setConfig({}) // Reset config for new template
  }

  // Multi-step activity management
  const addActivity = () => {
    const newActivity: ActivityStep = {
      id: `activity-${Date.now()}`,
      template: 'letter_tracing',
      config: {},
      title: `Step ${activities.length + 1}`,
      isExpanded: true,
    }
    setActivities([...activities, newActivity])
  }

  const removeActivity = (id: string) => {
    setActivities(activities.filter(a => a.id !== id))
  }

  const updateActivity = (id: string, updates: Partial<ActivityStep>) => {
    setActivities(activities.map(a => 
      a.id === id ? { ...a, ...updates } : a
    ))
  }

  const toggleActivityExpanded = (id: string) => {
    setActivities(activities.map(a => 
      a.id === id ? { ...a, isExpanded: !a.isExpanded } : a
    ))
  }

  const updateActivityConfig = (id: string, field: string, value: any) => {
    setActivities(activities.map(a => 
      a.id === id ? { ...a, config: { ...a.config, [field]: value } } : a
    ))
  }

  const renderConfigField = (field: { name: string; type: string; label: string; required: boolean; description?: string }) => {
    const value = config[field.name]

    switch (field.type) {
      case 'text':
        const isAssetField = field.name.toLowerCase().includes('path') || field.name.toLowerCase().includes('url') || field.name.toLowerCase().includes('image')
        return (
          <div className="flex gap-2">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => updateConfig(field.name, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder={field.description}
              required={field.required}
            />
            {isAssetField && (
              <button
                type="button"
                onClick={() => openAssetPicker((url) => updateConfig(field.name, url))}
                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-600"
                title="Pick Asset"
              >
                <ImageIcon size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
            )}
          </div>
        )

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => updateConfig(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder={field.description}
            rows={3}
            required={field.required}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => updateConfig(field.name, parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder={field.description}
            required={field.required}
          />
        )

      case 'boolean':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => updateConfig(field.name, e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">{field.description}</span>
          </label>
        )

      case 'string_array':
        return <StringArrayField value={value || []} onChange={(v) => updateConfig(field.name, v)} placeholder={field.description || ''} onPickAsset={openAssetPicker} fieldName={field.name} />

      case 'number_array':
        return <NumberArrayField value={value || []} onChange={(v) => updateConfig(field.name, v)} placeholder={field.description || ''} />

      case 'audio_pairs':
        return <AudioPairsField value={value || []} onChange={(v) => updateConfig(field.name, v)} onPickAsset={openAssetPicker} />

      case 'fill_options':
        return <FillOptionsField value={value || []} onChange={(v) => updateConfig(field.name, v)} />

      case 'selectable_options':
        return <SelectableOptionsField value={value || []} onChange={(v) => updateConfig(field.name, v)} />

      case 'memory_pairs':
        return <MemoryPairsField value={value || []} onChange={(v) => updateConfig(field.name, v)} />

      case 'number_items':
        return <NumberItemsField value={value || []} onChange={(v) => updateConfig(field.name, v)} />

      case 'draggable_options':
        return <DraggableOptionsField value={value || []} onChange={(v) => updateConfig(field.name, v)} />

      case 'story_elements':
        return <StoryElementsField value={value || []} onChange={(v) => updateConfig(field.name, v)} />

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => updateConfig(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder={field.description}
          />
        )
    }
  }

  // Render config field for activity in multi-step mode
  const renderActivityConfigField = (activity: ActivityStep, field: { name: string; type: string; label: string; required: boolean; description?: string }) => {
    const value = activity.config[field.name]

    const handleChange = (newValue: any) => {
      updateActivityConfig(activity.id, field.name, newValue)
    }

    switch (field.type) {
      case 'text':
        const isAssetField = field.name.toLowerCase().includes('path') || field.name.toLowerCase().includes('url') || field.name.toLowerCase().includes('image')
        return (
          <div className="flex gap-2">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              placeholder={field.description}
              required={field.required}
            />
            {isAssetField && (
              <button
                type="button"
                onClick={() => openAssetPicker((url) => handleChange(url))}
                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-600"
                title="Pick Asset"
              >
                <ImageIcon size={18} className="text-gray-600 dark:text-gray-300" />
              </button>
            )}
          </div>
        )

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            placeholder={field.description}
            rows={2}
            required={field.required}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => handleChange(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            placeholder={field.description}
            required={field.required}
          />
        )

      case 'boolean':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleChange(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">{field.description}</span>
          </label>
        )

      case 'string_array':
        return <StringArrayField value={value || []} onChange={handleChange} placeholder={field.description || ''} onPickAsset={openAssetPicker} fieldName={field.name} />

      case 'number_array':
        return <NumberArrayField value={value || []} onChange={handleChange} placeholder={field.description || ''} />

      case 'audio_pairs':
        return <AudioPairsField value={value || []} onChange={handleChange} onPickAsset={openAssetPicker} />

      case 'fill_options':
        return <FillOptionsField value={value || []} onChange={handleChange} />

      case 'selectable_options':
        return <SelectableOptionsField value={value || []} onChange={handleChange} />

      case 'memory_pairs':
        return <MemoryPairsField value={value || []} onChange={handleChange} />

      case 'number_items':
        return <NumberItemsField value={value || []} onChange={handleChange} />

      case 'draggable_options':
        return <DraggableOptionsField value={value || []} onChange={handleChange} />

      case 'story_elements':
        return <StoryElementsField value={value || []} onChange={handleChange} />

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            placeholder={field.description}
          />
        )
    }
  }

  // Group templates by category
  const templatesByCategory = Object.entries(levelsAPI.TEMPLATE_CONFIGS).reduce((acc, [key, value]) => {
    if (!acc[value.category]) acc[value.category] = []
    acc[value.category].push({ key, ...value })
    return acc
  }, {} as Record<string, { key: string; label: string; category: string }[]>)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Level</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Section: {section.title}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Level Number *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={levelNumber}
                  onChange={(e) => setLevelNumber(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  min={1}
                  disabled={loadingLevelNumber}
                />
                {loadingLevelNumber && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" size={16} />
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Learn Letter A"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Introduction
            </label>
            <input
              type="text"
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Brief description shown to children"
            />
          </div>

          {/* Mode Toggle: Single vs Multi-Step */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="levelMode"
                  checked={!isMultiStep}
                  onChange={() => setIsMultiStep(false)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Single Activity
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="levelMode"
                  checked={isMultiStep}
                  onChange={() => setIsMultiStep(true)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Multi-Step Level
                </span>
                <span className="text-xs text-gray-500">(multiple activities)</span>
              </label>
            </div>
          </div>

          {/* Single Activity Mode */}
          {!isMultiStep && (
            <>
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Activity Template *
                </label>
                <div className="space-y-3">
                  {Object.entries(templatesByCategory).map(([category, templates]) => (
                    <div key={category}>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase">
                        {category}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {templates.map((t) => (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() => handleTemplateChange(t.key as levelsAPI.TemplateType)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              template === t.key
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Template-Specific Config */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {templateInfo.label} Configuration
                </h3>
                <div className="space-y-4">
                  {templateInfo.fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {field.label} {field.required && '*'}
                      </label>
                      {field.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{field.description}</p>
                      )}
                      {renderConfigField(field)}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Multi-Step Mode */}
          {isMultiStep && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Activities ({activities.length} steps)
                </h3>
                <button
                  type="button"
                  onClick={addActivity}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark"
                >
                  <Plus size={14} /> Add Step
                </button>
              </div>

              {activities.length === 0 && (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <p className="text-gray-500 dark:text-gray-400 mb-2">No activities yet</p>
                  <button
                    type="button"
                    onClick={addActivity}
                    className="text-primary hover:underline text-sm"
                  >
                    Add your first activity
                  </button>
                </div>
              )}

              {activities.map((activity, index) => {
                const activityTemplateInfo = levelsAPI.TEMPLATE_CONFIGS[activity.template]
                return (
                  <div 
                    key={activity.id} 
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    {/* Activity Header */}
                    <div 
                      onClick={() => toggleActivityExpanded(activity.id)}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical size={16} className="text-gray-400" />
                        {activity.isExpanded ? (
                          <ChevronDown size={16} className="text-gray-400" />
                        ) : (
                          <ChevronRight size={16} className="text-gray-400" />
                        )}
                        <span className="font-medium text-gray-900 dark:text-white">
                          Step {index + 1}: {activityTemplateInfo.label}
                        </span>
                        {activity.title && (
                          <span className="text-sm text-gray-500">({activity.title})</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeActivity(activity.id)
                        }}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Activity Config (Expanded) */}
                    {activity.isExpanded && (
                      <div className="p-4 space-y-4">
                        {/* Activity Title */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Step Title (optional)
                          </label>
                          <input
                            type="text"
                            value={activity.title || ''}
                            onChange={(e) => updateActivity(activity.id, { title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            placeholder="e.g., Trace Letter A"
                          />
                        </div>

                        {/* Template Selection for this activity */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Activity Template
                          </label>
                          <select
                            value={activity.template}
                            onChange={(e) => updateActivity(activity.id, { 
                              template: e.target.value as levelsAPI.TemplateType,
                              config: {} // Reset config when template changes
                            })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            {Object.entries(templatesByCategory).map(([category, templates]) => (
                              <optgroup key={category} label={category}>
                                {templates.map((t) => (
                                  <option key={t.key} value={t.key}>
                                    {t.label}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>

                        {/* Template-specific config fields */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            {activityTemplateInfo.label} Settings
                          </h4>
                          <div className="space-y-3">
                            {activityTemplateInfo.fields.map((field) => (
                              <div key={field.name}>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  {field.label} {field.required && '*'}
                                </label>
                                {field.description && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{field.description}</p>
                                )}
                                {renderActivityConfigField(activity, field)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !title || !template}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            Create Level
          </button>
        </div>
      </div>
      
      {/* Asset Picker Modal Overlay */}
      {assetPickerOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <AssetPicker
            onSelect={(url) => {
              if (assetPickerCallback) assetPickerCallback(url)
              setAssetPickerOpen(false)
              setAssetPickerCallback(null)
            }}
            onCancel={() => {
              setAssetPickerOpen(false)
              setAssetPickerCallback(null)
            }}
          />
        </div>
      )}
    </div>
  )
}

// ============ Array Field Components ============

function StringArrayField({ value, onChange, placeholder, onPickAsset, fieldName }: { value: string[]; onChange: (v: string[]) => void; placeholder: string; onPickAsset?: (cb: (url: string) => void) => void; fieldName?: string }) {
  const isAssetField = fieldName?.toLowerCase().includes('image') || fieldName?.toLowerCase().includes('path') || fieldName?.toLowerCase().includes('assets')

  return (
    <div className="space-y-2">
      {value.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => {
              const newValue = [...value]
              newValue[index] = e.target.value
              onChange(newValue)
            }}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            placeholder={`Item ${index + 1}`}
          />
          {isAssetField && onPickAsset && (
            <button
              type="button"
              onClick={() => onPickAsset((url) => {
                const newValue = [...value]
                newValue[index] = url
                onChange(newValue)
              })}
              className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-600"
            >
              <ImageIcon size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, ''])}
        className="flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <Plus size={14} /> Add Item
      </button>
    </div>
  )
}

function NumberArrayField({ value, onChange, placeholder }: { value: number[]; onChange: (v: number[]) => void; placeholder: string }) {
  return (
    <div className="space-y-2">
      {value.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="number"
            value={item}
            onChange={(e) => {
              const newValue = [...value]
              newValue[index] = parseInt(e.target.value) || 0
              onChange(newValue)
            }}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, 0])}
        className="flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <Plus size={14} /> Add Number
      </button>
    </div>
  )
}

function AudioPairsField({ value, onChange, onPickAsset }: { value: { audioAssetPath: string; word: string }[]; onChange: (v: any[]) => void; onPickAsset?: (cb: (url: string) => void) => void }) {
  return (
    <div className="space-y-2">
      {value.map((pair, index) => (
        <div key={index} className="flex gap-2 items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <input
            type="text"
            value={pair.audioAssetPath || ''}
            onChange={(e) => {
              const newValue = [...value]
              newValue[index] = { ...pair, audioAssetPath: e.target.value }
              onChange(newValue)
            }}
            className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            placeholder="Audio path"
          />
          {onPickAsset && (
            <button
              type="button"
              onClick={() => onPickAsset((url) => {
                const newValue = [...value]
                newValue[index] = { ...pair, audioAssetPath: url }
                onChange(newValue)
              })}
              className="p-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded border border-gray-300 dark:border-gray-600"
            >
              <ImageIcon size={14} className="text-gray-600 dark:text-gray-300" />
            </button>
          )}
          <input
            type="text"
            value={pair.word || ''}
            onChange={(e) => {
              const newValue = [...value]
              newValue[index] = { ...pair, word: e.target.value }
              onChange(newValue)
            }}
            className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            placeholder="Word"
          />
          <button type="button" onClick={() => onChange(value.filter((_, i) => i !== index))} className="p-1 text-red-500">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, { audioAssetPath: '', word: '' }])} className="flex items-center gap-1 text-sm text-primary hover:underline">
        <Plus size={14} /> Add Pair
      </button>
    </div>
  )
}

function FillOptionsField({ value, onChange }: { value: { optionText: string }[]; onChange: (v: any[]) => void }) {
  return (
    <div className="space-y-2">
      {value.map((opt, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={opt.optionText || ''}
            onChange={(e) => {
              const newValue = [...value]
              newValue[index] = { optionText: e.target.value }
              onChange(newValue)
            }}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
            placeholder={`Option ${index + 1}`}
          />
          <button type="button" onClick={() => onChange(value.filter((_, i) => i !== index))} className="p-2 text-red-500">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, { optionText: '' }])} className="flex items-center gap-1 text-sm text-primary hover:underline">
        <Plus size={14} /> Add Option
      </button>
    </div>
  )
}

function SelectableOptionsField({ value, onChange }: { value: { label: string; imagePath?: string }[]; onChange: (v: any[]) => void }) {
  return (
    <div className="space-y-2">
      {value.map((opt, index) => (
        <div key={index} className="flex gap-2 items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <input
            type="text"
            value={opt.label || ''}
            onChange={(e) => {
              const newValue = [...value]
              newValue[index] = { ...opt, label: e.target.value }
              onChange(newValue)
            }}
            className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            placeholder="Label"
          />
          <input
            type="text"
            value={opt.imagePath || ''}
            onChange={(e) => {
              const newValue = [...value]
              newValue[index] = { ...opt, imagePath: e.target.value }
              onChange(newValue)
            }}
            className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            placeholder="Image path (optional)"
          />
          <button type="button" onClick={() => onChange(value.filter((_, i) => i !== index))} className="p-1 text-red-500">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, { label: '', imagePath: '' }])} className="flex items-center gap-1 text-sm text-primary hover:underline">
        <Plus size={14} /> Add Option
      </button>
    </div>
  )
}

function MemoryPairsField({ value, onChange }: { value: { imagePath: string }[]; onChange: (v: any[]) => void }) {
  return (
    <div className="space-y-2">
      {value.map((pair, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={pair.imagePath || ''}
            onChange={(e) => {
              const newValue = [...value]
              newValue[index] = { imagePath: e.target.value }
              onChange(newValue)
            }}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
            placeholder="Image path for card pair"
          />
          <button type="button" onClick={() => onChange(value.filter((_, i) => i !== index))} className="p-2 text-red-500">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, { imagePath: '' }])} className="flex items-center gap-1 text-sm text-primary hover:underline">
        <Plus size={14} /> Add Card Pair
      </button>
    </div>
  )
}

function NumberItemsField({ value, onChange }: { value: { number: string; imageAsset: string; quantity: number }[]; onChange: (v: any[]) => void }) {
  return (
    <div className="space-y-2">
      {value.map((item, index) => (
        <div key={index} className="flex gap-2 items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <input
            type="text"
            value={item.number || ''}
            onChange={(e) => {
              const newValue = [...value]
              newValue[index] = { ...item, number: e.target.value }
              onChange(newValue)
            }}
            className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            placeholder="Num"
          />
          <input
            type="text"
            value={item.imageAsset || ''}
            onChange={(e) => {
              const newValue = [...value]
              newValue[index] = { ...item, imageAsset: e.target.value }
              onChange(newValue)
            }}
            className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            placeholder="Image asset path"
          />
          <input
            type="number"
            value={item.quantity || 0}
            onChange={(e) => {
              const newValue = [...value]
              newValue[index] = { ...item, quantity: parseInt(e.target.value) || 0 }
              onChange(newValue)
            }}
            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            placeholder="Qty"
          />
          <button type="button" onClick={() => onChange(value.filter((_, i) => i !== index))} className="p-1 text-red-500">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, { number: '', imageAsset: '', quantity: 1 }])} className="flex items-center gap-1 text-sm text-primary hover:underline">
        <Plus size={14} /> Add Item
      </button>
    </div>
  )
}

function DraggableOptionsField({ value, onChange }: { value: { id: string; label: string; value: number; imageAsset?: string }[]; onChange: (v: any[]) => void }) {
  const [pickerIndex, setPickerIndex] = useState<number | null>(null)

  return (
    <div className="space-y-2">
      {value.map((item, index) => (
        <div key={index} className="flex gap-2 items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <input
            type="text"
            value={item.id || ''}
            onChange={(e) => {
              const newValue = [...value]
              newValue[index] = { ...item, id: e.target.value }
              onChange(newValue)
            }}
            className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            placeholder="ID"
          />
          <input
            type="text"
            value={item.label || ''}
            onChange={(e) => {
              const newValue = [...value]
              newValue[index] = { ...item, label: e.target.value }
              onChange(newValue)
            }}
            className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            placeholder="Label"
          />
          <div className="flex -mr-px">
             <input
              type="text"
              value={item.imageAsset || ''}
              onChange={(e) => {
                const newValue = [...value]
                newValue[index] = { ...item, imageAsset: e.target.value }
                onChange(newValue)
              }}
              className="w-32 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-l bg-white dark:bg-gray-700 text-sm"
              placeholder="Image Path"
            />
            <button
              type="button"
              onClick={() => setPickerIndex(index)}
              className="px-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r bg-gray-100 dark:bg-gray-600 hover:bg-gray-200"
              title="Pick Asset"
            >
              <ImageIcon size={14} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <input
            type="number"
            value={item.value || 0}
            onChange={(e) => {
              const newValue = [...value]
              newValue[index] = { ...item, value: parseInt(e.target.value) || 0 }
              onChange(newValue)
            }}
            className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            placeholder="Val"
          />
          <button type="button" onClick={() => onChange(value.filter((_, i) => i !== index))} className="p-1 text-red-500">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, { id: String(value.length + 1), label: '', value: 0 }])} className="flex items-center gap-1 text-sm text-primary hover:underline">
        <Plus size={14} /> Add Option
      </button>
      
      {/* Local Asset Picker for this field */}
      {pickerIndex !== null && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <AssetPicker
            onSelect={(url) => {
              const newValue = [...value]
              newValue[pickerIndex] = { ...value[pickerIndex], imageAsset: url }
              onChange(newValue)
              setPickerIndex(null)
            }}
            onCancel={() => setPickerIndex(null)}
          />
        </div>
      )}
    </div>
  )
}

function StoryElementsField({ value, onChange }: { value: any[]; onChange: (v: any[]) => void }) {
  return (
    <div className="space-y-2">
      {value.map((el, index) => (
        <div key={index} className="flex gap-2 items-start p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <select
            value={el.type || 'text'}
            onChange={(e) => {
              const newValue = [...value]
              newValue[index] = { ...el, type: e.target.value }
              onChange(newValue)
            }}
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
          >
            <option value="text">Text</option>
            <option value="image">Image</option>
            <option value="audio">Audio</option>
          </select>
          <input
            type="text"
            value={el.content || ''}
            onChange={(e) => {
              const newValue = [...value]
              newValue[index] = { ...el, content: e.target.value }
              onChange(newValue)
            }}
            className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            placeholder="Content or path"
          />
          <button type="button" onClick={() => onChange(value.filter((_, i) => i !== index))} className="p-1 text-red-500">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, { type: 'text', content: '' }])} className="flex items-center gap-1 text-sm text-primary hover:underline">
        <Plus size={14} /> Add Element
      </button>
    </div>
  )
}
