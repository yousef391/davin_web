'use client'

import { useState } from 'react'
import { X, Loader2, FolderPlus } from 'lucide-react'
import * as levelsAPI from '@/lib/api/levels'

interface CreateSectionModalProps {
  subject: levelsAPI.SubjectType
  existingSections: levelsAPI.Section[]
  onClose: () => void
  onCreated: () => void
}

const SUBJECT_LABELS: Record<levelsAPI.SubjectType, string> = {
  en: 'English',
  fr: 'French',
  math: 'Math',
}

const SUBJECT_COLORS: Record<levelsAPI.SubjectType, string> = {
  en: '#3B82F6', // blue
  fr: '#8B5CF6', // purple
  math: '#10B981', // green
}

export function CreateSectionModal({ 
  subject, 
  existingSections, 
  onClose, 
  onCreated 
}: CreateSectionModalProps) {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate next section number
  const subjectSections = existingSections.filter(s => s.subject === subject)
  const nextSectionNumber = subjectSections.length > 0 
    ? Math.max(...subjectSections.map(s => s.section_number)) + 1 
    : 1
  const nextDisplayOrder = subjectSections.length > 0
    ? Math.max(...subjectSections.map(s => s.display_order)) + 1
    : 1

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setError('Please enter a section title')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      await levelsAPI.createSection({
        subject,
        title: title.trim(),
        section_number: nextSectionNumber,
        color: SUBJECT_COLORS[subject],
        display_order: nextDisplayOrder,
      })

      onCreated()
    } catch (err: any) {
      setError(err.message || 'Failed to create section')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <FolderPlus className="text-primary" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Add New Section
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {SUBJECT_LABELS[subject]}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Section Number Preview */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-primary">{nextSectionNumber}</span>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Section Number</p>
              <p className="font-medium text-gray-900 dark:text-white">
                This will be Section {nextSectionNumber}
              </p>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Section Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Alphabet Basics, Numbers 1-10, Common Words..."
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              autoFocus
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Give this section a descriptive name
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Creating...
                </>
              ) : (
                <>
                  <FolderPlus size={18} />
                  Create Section
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
