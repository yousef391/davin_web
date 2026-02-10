'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, Trash2, Loader2, AlertCircle, BookOpen, Calculator, Globe, 
  ChevronDown, ChevronRight, Edit, Eye, Search, Filter, FolderPlus
} from 'lucide-react'
import * as levelsAPI from '@/lib/api/levels'
import { CreateLevelModal } from './CreateLevelModal'
import { CreateSectionModal } from './CreateSectionModal'

type SubjectType = 'en' | 'fr' | 'math'

const SUBJECT_INFO: Record<SubjectType, { label: string; icon: React.ReactNode; color: string }> = {
  en: { label: 'English', icon: <Globe className="text-blue-500" />, color: 'blue' },
  fr: { label: 'French', icon: <BookOpen className="text-purple-500" />, color: 'purple' },
  math: { label: 'Math', icon: <Calculator className="text-green-500" />, color: 'green' },
}

export function LevelsPage() {
  const [sections, setSections] = useState<levelsAPI.Section[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSubject, setActiveSubject] = useState<SubjectType>('en')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCreateSectionModal, setShowCreateSectionModal] = useState(false)
  const [selectedSection, setSelectedSection] = useState<levelsAPI.Section | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch sections
  const fetchSections = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await levelsAPI.getAllSections()
      setSections(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load sections')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSections()
  }, [])

  const filteredSections = sections
    .filter(s => s.subject === activeSubject)
    .filter(s => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return s.title.toLowerCase().includes(q) || 
        s.levels?.some(l => l.title.toLowerCase().includes(q))
    })

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }

  const handleDeleteLevel = async (levelId: string) => {
    if (!confirm('Are you sure you want to delete this level?')) return
    
    try {
      setDeleteLoading(levelId)
      await levelsAPI.deleteLevel(levelId)
      await fetchSections()
    } catch (err: any) {
      alert('Failed to delete level: ' + err.message)
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleCreateLevel = (section: levelsAPI.Section) => {
    console.log('📂 Opening create modal for section:', {
      id: section.id,
      title: section.title,
      levels: section.levels?.map(l => ({ id: l.id, level_number: l.level_number, title: l.title })),
      levels_count: section.levels?.length || 0,
    })
    setSelectedSection(section)
    setShowCreateModal(true)
  }

  const handleLevelCreated = () => {
    setShowCreateModal(false)
    setSelectedSection(null)
    fetchSections()
  }

  const getTemplateLabel = (template: string) => {
    return levelsAPI.TEMPLATE_CONFIGS[template as levelsAPI.TemplateType]?.label || template
  }

  const getTemplateCategory = (template: string) => {
    return levelsAPI.TEMPLATE_CONFIGS[template as levelsAPI.TemplateType]?.category || 'Other'
  }

  const getTotalLevels = (subject: SubjectType) => {
    return sections
      .filter(s => s.subject === subject)
      .reduce((acc, s) => acc + (s.levels?.length || 0), 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="text-red-500" size={48} />
        <p className="text-red-500">{error}</p>
        <button 
          onClick={fetchSections}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Levels Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage educational levels and activities
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.entries(SUBJECT_INFO) as [SubjectType, typeof SUBJECT_INFO['en']][]).map(([key, info]) => (
          <div 
            key={key}
            onClick={() => setActiveSubject(key)}
            className={`bg-white dark:bg-gray-800 p-6 rounded-lg border-2 cursor-pointer transition-all ${
              activeSubject === key 
                ? `border-${info.color}-500 shadow-lg` 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">{info.label}</p>
              {info.icon}
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {getTotalLevels(key)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {sections.filter(s => s.subject === key).length} sections
            </p>
          </div>
        ))}
      </div>

      {/* Search Bar and Add Section Button */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search levels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <button
          onClick={() => setShowCreateSectionModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <FolderPlus size={18} />
          Add Section
        </button>
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {filteredSections.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No sections found</p>
          </div>
        ) : (
          filteredSections.map((section) => (
            <div 
              key={section.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Section Header */}
              <div 
                onClick={() => toggleSection(section.id)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center gap-3">
                  {expandedSections.has(section.id) ? (
                    <ChevronDown className="text-gray-400" size={20} />
                  ) : (
                    <ChevronRight className="text-gray-400" size={20} />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Section {section.section_number} • {section.levels?.length || 0} levels
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCreateLevel(section)
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm"
                >
                  <Plus size={16} />
                  Add Level
                </button>
              </div>

              {/* Levels List */}
              {expandedSections.has(section.id) && (
                <div className="border-t border-gray-200 dark:border-gray-700">
                  {section.levels && section.levels.length > 0 ? (
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Level
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Title
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Template/Steps
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Category
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {section.levels
                          .sort((a, b) => a.level_number - b.level_number)
                          .map((level) => {
                            const activityCount = level.activities?.length || 0
                            const isMultiStep = activityCount > 1
                            return (
                            <tr key={level.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center justify-center w-8 h-8 bg-primary/10 text-primary font-semibold rounded-full">
                                  {level.level_number}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {level.title}
                                  </p>
                                  {level.introduction && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                      {level.introduction}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {isMultiStep ? (
                                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full">
                                    {activityCount} steps
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                                    {getTemplateLabel(level.template)}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {isMultiStep ? 'Multi-Step' : getTemplateCategory(level.template)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      const data = isMultiStep 
                                        ? { activities: level.activities } 
                                        : { template: level.template, config: level.config }
                                      alert(JSON.stringify(data, null, 2))
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-blue-500 rounded"
                                    title={isMultiStep ? 'View Activities' : 'View Config'}
                                  >
                                    <Eye size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLevel(level.id)}
                                    disabled={deleteLoading === level.id}
                                    className="p-1.5 text-gray-400 hover:text-red-500 rounded disabled:opacity-50"
                                    title="Delete"
                                  >
                                    {deleteLoading === level.id ? (
                                      <Loader2 className="animate-spin" size={16} />
                                    ) : (
                                      <Trash2 size={16} />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )})}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      No levels in this section yet
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Level Modal */}
      {showCreateModal && selectedSection && (
        <CreateLevelModal
          section={selectedSection}
          onClose={() => {
            setShowCreateModal(false)
            setSelectedSection(null)
          }}
          onCreated={handleLevelCreated}
        />
      )}

      {/* Create Section Modal */}
      {showCreateSectionModal && (
        <CreateSectionModal
          subject={activeSubject}
          existingSections={sections}
          onClose={() => setShowCreateSectionModal(false)}
          onCreated={() => {
            setShowCreateSectionModal(false)
            fetchSections()
          }}
        />
      )}
    </div>
  )
}
