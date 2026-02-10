'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, Trash2, Loader2, AlertCircle, Crown, Edit2, 
  Search, ToggleLeft, ToggleRight, X 
} from 'lucide-react'
import * as titlesAPI from '@/lib/api/titles'

export function TitlesPage() {
  const [titles, setTitles] = useState<titlesAPI.TitleDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSubject, setFilterSubject] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingTitle, setEditingTitle] = useState<titlesAPI.TitleDefinition | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  // Fetch titles
  const fetchTitles = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await titlesAPI.getAllTitles()
      setTitles(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load titles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTitles()
  }, [])

  const filteredTitles = titles.filter(title => {
    const matchesSearch = title.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (title.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    const matchesSubject = filterSubject === 'all' || title.subject === filterSubject
    return matchesSearch && matchesSubject
  })

  const handleCreateTitle = () => {
    setEditingTitle(null)
    setShowModal(true)
  }

  const handleEditTitle = (title: titlesAPI.TitleDefinition) => {
    setEditingTitle(title)
    setShowModal(true)
  }

  const handleDeleteTitle = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce titre?')) return
    
    try {
      setDeleteLoading(id)
      await titlesAPI.deleteTitle(id)
      await fetchTitles()
    } catch (err: any) {
      alert('Failed to delete title: ' + err.message)
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleToggleActive = async (title: titlesAPI.TitleDefinition) => {
    try {
      await titlesAPI.updateTitle(title.id, { is_active: !title.is_active })
      await fetchTitles()
    } catch (err: any) {
      alert('Failed to update title: ' + err.message)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingTitle(null)
  }

  const handleTitleSaved = () => {
    handleModalClose()
    fetchTitles()
  }

  const getSubjectBadge = (subject: titlesAPI.TitleSubject | string | null | undefined) => {
    const defaultConfig = { 
      label: String(subject || 'Unknown'), 
      color: 'text-gray-600', 
      bgColor: 'bg-gray-100',
      emoji: '📚'
    }
    const config = (subject && titlesAPI.TITLE_SUBJECTS[subject as titlesAPI.TitleSubject]) || defaultConfig
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
        <span>{config.emoji}</span>
        {config.label}
      </span>
    )
  }

  const getLevelBadge = (level: number) => {
    const config = titlesAPI.TITLE_LEVELS[level] || { name: `Level ${level}`, color: 'text-gray-600' }
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
        {config.name} (L{level})
      </span>
    )
  }

  // Stats
  const stats = {
    total: titles.length,
    active: titles.filter(t => t.is_active).length,
    bySubject: Object.keys(titlesAPI.TITLE_SUBJECTS).reduce((acc, s) => {
      acc[s] = titles.filter(t => t.subject === s).length
      return acc
    }, {} as Record<string, number>)
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
          onClick={fetchTitles}
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Titres</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Créer et gérer les titres de progression pour les utilisateurs
          </p>
        </div>
        <button 
          onClick={handleCreateTitle}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Créer un Titre
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            <Crown className="text-primary" size={18} />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Actifs</p>
            <div className="w-3 h-3 bg-green-500 rounded-full" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-blue-600 dark:text-blue-400">🇫🇷 Français</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.bySubject.fr || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-orange-600 dark:text-orange-400">🔢 Maths</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.bySubject.math || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-green-600 dark:text-green-400">🇬🇧 Anglais</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.bySubject.en || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-purple-600 dark:text-purple-400">🏠 Quotidien</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.bySubject.daily || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par nom ou description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
          >
            <option value="all">Toutes les matières</option>
            {Object.entries(titlesAPI.TITLE_SUBJECTS).map(([key, config]) => (
              <option key={key} value={key}>{config.emoji} {config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Titles Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Titre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Matière
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Niveau
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Requis
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTitles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  {searchQuery || filterSubject !== 'all' 
                    ? 'Aucun titre ne correspond à vos filtres'
                    : 'Aucun titre. Créez votre premier titre!'}
                </td>
              </tr>
            ) : (
              filteredTitles.map((title) => (
                <tr key={title.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                        <Crown className="text-white" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{title.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {title.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getSubjectBadge(title.subject)}
                  </td>
                  <td className="px-6 py-4">
                    {getLevelBadge(title.level)}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">
                    {title.required_count} activités
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(title)}
                      className={`flex items-center gap-2 ${
                        title.is_active 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-gray-400'
                      }`}
                    >
                      {title.is_active ? (
                        <ToggleRight size={24} />
                      ) : (
                        <ToggleLeft size={24} />
                      )}
                      <span className="text-sm">
                        {title.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditTitle(title)}
                        className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteTitle(title.id)}
                        disabled={deleteLoading === title.id}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Supprimer"
                      >
                        {deleteLoading === title.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <TitleModal
          title={editingTitle}
          onClose={handleModalClose}
          onSave={handleTitleSaved}
        />
      )}
    </div>
  )
}

// ==================== TITLE MODAL ====================

interface TitleModalProps {
  title: titlesAPI.TitleDefinition | null
  onClose: () => void
  onSave: () => void
}

function TitleModal({ title, onClose, onSave }: TitleModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    id: title?.id || '',
    name: title?.name || '',
    description: title?.description || '',
    subject: title?.subject || 'fr' as titlesAPI.TitleSubject,
    level: title?.level || 1,
    required_count: title?.required_count || 0,
    icon_asset: title?.icon_asset || '',
    display_order: title?.display_order || 0,
    is_active: title?.is_active ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.id.trim() || !formData.name.trim()) {
      alert('ID et nom du titre sont requis')
      return
    }

    try {
      setLoading(true)

      const input = {
        id: formData.id.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        subject: formData.subject,
        level: formData.level,
        required_count: formData.required_count,
        icon_asset: formData.icon_asset.trim() || null,
        display_order: formData.display_order,
        is_active: formData.is_active,
      }

      if (title) {
        await titlesAPI.updateTitle(title.id, input)
      } else {
        await titlesAPI.createTitle(input)
      }

      onSave()
    } catch (err: any) {
      alert('Échec de sauvegarde: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {title ? 'Modifier le Titre' : 'Créer un Titre'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* ID (only for new) */}
          {!title && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ID du Titre *
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                placeholder="ex: fr-expert"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Format: matière-niveau (ex: fr-maitre, math-expert)</p>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom du Titre *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
              placeholder="ex: Maître des mots"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
              rows={2}
              placeholder="Décrivez ce titre..."
            />
          </div>

          {/* Subject & Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Matière
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value as titlesAPI.TitleSubject }))}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
              >
                {Object.entries(titlesAPI.TITLE_SUBJECTS).map(([key, config]) => (
                  <option key={key} value={key}>{config.emoji} {config.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Niveau
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
              >
                {Object.entries(titlesAPI.TITLE_LEVELS).map(([key, config]) => (
                  <option key={key} value={key}>{config.name} (Level {key})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Required Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Activités Requises
            </label>
            <input
              type="number"
              min={0}
              value={formData.required_count}
              onChange={(e) => setFormData(prev => ({ ...prev, required_count: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">Nombre d&apos;activités à compléter pour débloquer ce titre</p>
          </div>

          {/* Display Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ordre d&apos;affichage
            </label>
            <input
              type="number"
              min={0}
              value={formData.display_order}
              onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
              className={`flex items-center gap-2 ${
                formData.is_active ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              {formData.is_active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {formData.is_active ? 'Titre actif et déblocable' : 'Titre inactif'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {title ? 'Enregistrer' : 'Créer le Titre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
