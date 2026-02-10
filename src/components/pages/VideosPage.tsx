'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Plus, Trash2, Loader2, AlertCircle, Video, Upload, 
  Search, ToggleLeft, ToggleRight, X, Play, Download, FileVideo
} from 'lucide-react'
import * as videosAPI from '@/lib/api/videos'

export function VideosPage() {
  const [videos, setVideos] = useState<videosAPI.DownloadableVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  // Fetch videos
  const fetchVideos = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await videosAPI.getAdminVideos()
      setVideos(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load videos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (video.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || video.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette vidéo?')) return
    
    try {
      setDeleteLoading(id)
      await videosAPI.deleteVideo(id)
      await fetchVideos()
    } catch (err: any) {
      alert('Failed to delete video: ' + err.message)
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleToggleActive = async (video: videosAPI.DownloadableVideo) => {
    try {
      await videosAPI.updateVideo(video.id, { is_active: !video.is_active })
      await fetchVideos()
    } catch (err: any) {
      alert('Failed to update video: ' + err.message)
    }
  }

  const getCategoryBadge = (category: string) => {
    const config = videosAPI.VIDEO_CATEGORIES[category as videosAPI.VideoCategory] || 
      { label: category, emoji: '📺' }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
        <span>{config.emoji}</span>
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vidéos Téléchargeables</h1>
          <p className="text-gray-600 mt-1">
            Gérez les vidéos que les utilisateurs peuvent télécharger
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Uploader une vidéo
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">Toutes catégories</option>
          {Object.entries(videosAPI.VIDEO_CATEGORIES).map(([key, val]) => (
            <option key={key} value={key}>{val.emoji} {val.label}</option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Video className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Vidéos</p>
              <p className="text-xl font-bold">{videos.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Play className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Actives</p>
              <p className="text-xl font-bold">{videos.filter(v => v.is_active).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Taille Totale</p>
              <p className="text-xl font-bold">
                {videosAPI.formatFileSize(videos.reduce((acc, v) => acc + (v.file_size_bytes || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileVideo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Aucune vidéo</h3>
          <p className="text-gray-500 mt-1">
            {searchQuery || filterCategory !== 'all' 
              ? 'Aucune vidéo ne correspond à vos filtres'
              : 'Uploadez votre première vidéo'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className={`bg-white rounded-lg border overflow-hidden transition-all ${
                video.is_active ? 'border-gray-200' : 'border-gray-200 opacity-60'
              }`}
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-100 relative">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {getCategoryBadge(video.category)}
                </div>
                {!video.is_active && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-medium">Désactivée</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 truncate">{video.title}</h3>
                {video.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{video.description}</p>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    {videosAPI.formatFileSize(video.file_size_bytes)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(video)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title={video.is_active ? 'Désactiver' : 'Activer'}
                    >
                      {video.is_active ? (
                        <ToggleRight className="w-5 h-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(video.id)}
                      disabled={deleteLoading === video.id}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      {deleteLoading === video.id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="w-5 h-5 text-red-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadVideoModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false)
            fetchVideos()
          }}
        />
      )}
    </div>
  )
}

// Upload Modal Component
function UploadVideoModal({ 
  onClose, 
  onSuccess 
}: { 
  onClose: () => void
  onSuccess: () => void 
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('general')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  // File size warning threshold (50MB Supabase limit)
  const MAX_SIZE_MB = 50
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
  const isFileTooLarge = videoFile && videoFile.size > MAX_SIZE_BYTES

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setError('Le titre est requis')
      return
    }
    if (!videoFile) {
      setError('Veuillez sélectionner une vidéo')
      return
    }
    
    // Warn but don't block if file is large
    if (isFileTooLarge) {
      setError(`La vidéo fait ${videosAPI.formatFileSize(videoFile.size)} (limite: ${MAX_SIZE_MB}MB). Veuillez compresser la vidéo avant de l'uploader.`)
      return
    }

    try {
      setUploading(true)
      setError(null)
      
      await videosAPI.uploadVideo({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        video: videoFile,
        thumbnail: thumbnailFile || undefined,
      })
      
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to upload video')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">Uploader une vidéo</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nom de la vidéo"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de la vidéo..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {Object.entries(videosAPI.VIDEO_CATEGORIES).map(([key, val]) => (
                <option key={key} value={key}>{val.emoji} {val.label}</option>
              ))}
            </select>
          </div>

          {/* Video File */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fichier vidéo *
            </label>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
            >
              {videoFile ? (
                <div className="flex items-center justify-center gap-2">
                  <FileVideo className="w-5 h-5 text-purple-600" />
                  <span className="text-purple-600 font-medium">{videoFile.name}</span>
                  <span className="text-gray-400">({videosAPI.formatFileSize(videoFile.size)})</span>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Cliquez pour sélectionner une vidéo</p>
                  <p className="text-xs text-gray-400 mt-1">MP4, WebM (max 500MB)</p>
                </div>
              )}
            </button>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Miniature (optionnel)
            </label>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => thumbnailInputRef.current?.click()}
              className="w-full px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
            >
              {thumbnailFile ? (
                <div className="flex items-center justify-center gap-2">
                  <img
                    src={URL.createObjectURL(thumbnailFile)}
                    alt="Thumbnail"
                    className="w-16 h-10 object-cover rounded"
                  />
                  <span className="text-purple-600 font-medium">{thumbnailFile.name}</span>
                </div>
              ) : (
                <p className="text-gray-600 text-sm">Cliquez pour ajouter une miniature</p>
              )}
            </button>
          </div>

          {/* Size Warning */}
          {isFileTooLarge && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
              <div>
                <p className="text-amber-700 text-sm font-medium">Fichier trop volumineux</p>
                <p className="text-amber-600 text-xs mt-1">
                  Limite: {MAX_SIZE_MB}MB. Votre fichier: {videosAPI.formatFileSize(videoFile?.size || 0)}
                </p>
                <p className="text-amber-600 text-xs mt-1">
                  Utilisez <a href="https://www.freeconvert.com/video-compressor" target="_blank" rel="noopener" className="underline">FreeConvert</a> pour compresser la vidéo.
                </p>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={uploading || !title.trim() || !videoFile || !!isFileTooLarge}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Uploader
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
