'use client'

import { useState } from 'react'
import { X, Loader2, Upload, Youtube, Image, Gamepad2, Music } from 'lucide-react' // Added icons
import { AssetPicker } from '../ui/AssetPicker'
import * as contentAPI from '@/lib/api/content'

interface CreateContentModalProps {
  onClose: () => void
  onCreated: () => void
}

type ContentType = 'video' | 'template' | 'game' | 'audio'

export function CreateContentModal({ onClose, onCreated }: CreateContentModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [type, setType] = useState<ContentType>('video')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')

  // Asset Picker State
  const [showAssetPicker, setShowAssetPicker] = useState(false)
  const [targetField, setTargetField] = useState<'url' | 'thumbnail'>('url')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
        console.log('Creating content:', { title, category, type, url, description, thumbnailUrl })
        
        await contentAPI.createContent({
          title,
          category,
          type,
          asset_path: url, // Mapping generic URL to asset_path as per our hybrid logic (API handles mapping to external_url if needed)
          external_url: url, // Or explicit if prefer
          description,
          thumbnail_url: thumbnailUrl,
          status: 'published'
        })
        
        onCreated()
        onClose()
    } catch (err: any) {
      console.error('Failed to create content:', err)
      setError(err.message || 'Failed to create content')
    } finally {
      setLoading(false)
    }
  }

  const openPicker = (field: 'url' | 'thumbnail') => {
    setTargetField(field)
    setShowAssetPicker(true)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Content</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content Type</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'video', label: 'Video', icon: Youtube },
                { id: 'template', label: 'Template', icon: Image },
                { id: 'game', label: 'Game', icon: Gamepad2 },
                { id: 'audio', label: 'Audio', icon: Music },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id as ContentType)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors ${
                    type === t.id
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <t.icon size={20} className="mb-1" />
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g. Science, Math, Art"
            />
          </div>

          {/* URL / File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {type === 'video' ? 'Video URL (YouTube or File)' : 'File URL'} *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder={type === 'video' ? 'https://youtube.com/...' : 'https://...'}
                required
              />
              <button
                type="button"
                onClick={() => openPicker('url')}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                title="Upload/Select File"
              >
                <Upload size={20} />
              </button>
            </div>
            {type === 'video' && (
              <p className="text-xs text-gray-500 mt-1">
                For YouTube, just paste the link. For uploaded videos, use the upload button.
              </p>
            )}
          </div>

          {/* Thumbnail Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thumbnail URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={() => openPicker('thumbnail')}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                <Upload size={20} />
              </button>
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
             <textarea
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
               rows={3}
             />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
            >
              {loading && <Loader2 className="animate-spin" size={16} />}
              Create
            </button>
          </div>
        </form>
      </div>

       {showAssetPicker && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <AssetPicker
            onSelect={(selectedUrl) => {
              if (targetField === 'url') setUrl(selectedUrl)
              else setThumbnailUrl(selectedUrl)
              setShowAssetPicker(false)
            }}
            onCancel={() => setShowAssetPicker(false)}
          />
        </div>
      )}
    </div>
  )
}
