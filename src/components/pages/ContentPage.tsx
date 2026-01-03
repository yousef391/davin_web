'use client'

import { useState, useEffect } from 'react'
import { Search, Upload, Video, Image, Music, Gamepad2, Filter, Plus, MoreVertical, Eye, Download, Trash2, AlertCircle, Loader2 } from 'lucide-react'
import * as contentAPI from '@/lib/api/content'

type ContentType = 'video' | 'template' | 'game' | 'audio' | 'all'

export function ContentPage() {
  const [content, setContent] = useState<contentAPI.Content[]>([])
  const [stats, setStats] = useState<contentAPI.ContentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ContentType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Fetch content and stats from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [contentData, statsData] = await Promise.all([
          contentAPI.getContent({ limit: 100 }),
          contentAPI.getContentStats()
        ])

        setContent(contentData.data)
        setStats(statsData)
      } catch (err: any) {
        setError(err.message || 'Failed to load content')
        console.error('Failed to fetch content:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter content
  const filteredContent = content.filter(item => {
    const matchesTab = activeTab === 'all' || item.type === activeTab
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory
    
    return matchesTab && matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(content.map(item => item.category).filter(Boolean)))

  const getTypeThumbnail = (type: string) => {
    switch (type) {
      case 'video': return '🎬'
      case 'template': return '🖼️'
      case 'game': return '🎮'
      case 'audio': return '🔊'
      default: return '📄'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
      case 'processing': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'archived': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (mb?: number) => {
    if (!mb) return 'N/A'
    return `${mb.toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Content Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage videos, templates, games, and audio resources</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors">
          <Upload size={20} />
          Upload Content
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Videos</p>
            <Video className="text-purple-600 dark:text-purple-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.byType.video || 0}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Educational videos</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Templates</p>
            <Image className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.byType.template || 0}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Drawing & coloring</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Games</p>
            <Gamepad2 className="text-green-600 dark:text-green-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.byType.game || 0}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Interactive games</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Audio</p>
            <Music className="text-pink-600 dark:text-pink-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.byType.audio || 0}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Sound effects & music</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto">
            {[
              { id: 'all', label: 'All Content', icon: Filter },
              { id: 'video', label: 'Videos', icon: Video },
              { id: 'template', label: 'Templates', icon: Image },
              { id: 'game', label: 'Games', icon: Gamepad2 },
              { id: 'audio', label: 'Audio', icon: Music },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ContentType)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <tab.icon size={18} />
                <span className="font-medium whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search content by title or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white">
              <Download size={20} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Thumbnail */}
            <div className="relative bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 aspect-video flex items-center justify-center">
              <span className="text-6xl">{getTypeThumbnail(item.type)}</span>
              <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeColor(item.status)}`}>
                {item.status}
              </span>
            </div>

            {/* Content Info */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  {formatDuration(item.duration_seconds) && (
                    <span className="flex items-center gap-1">
                      <Video size={14} />
                      {formatDuration(item.duration_seconds)}
                    </span>
                  )}
                  <span>{formatFileSize(item.file_size_mb)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye size={14} />
                  {item.views_count.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(item.created_at)}</span>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Eye size={16} className="text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Download size={16} className="text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                    <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredContent.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No content found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your search or filters</p>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors mx-auto">
            <Plus size={20} />
            Upload New Content
          </button>
        </div>
      )}
    </div>
  )
}
