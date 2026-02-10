'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, Trash2, Loader2, AlertCircle, Award, Edit2, 
  Search, ToggleLeft, ToggleRight, X 
} from 'lucide-react'
import * as badgesAPI from '@/lib/api/badges'

export function BadgesPage() {
  const [badges, setBadges] = useState<badgesAPI.BadgeDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterVariant, setFilterVariant] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingBadge, setEditingBadge] = useState<badgesAPI.BadgeDefinition | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  // Fetch badges
  const fetchBadges = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await badgesAPI.getAllBadges()
      setBadges(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load badges')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBadges()
  }, [])

  const filteredBadges = badges.filter(badge => {
    const matchesSearch = badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesVariant = filterVariant === 'all' || badge.variant === filterVariant
    return matchesSearch && matchesVariant
  })

  const handleCreateBadge = () => {
    setEditingBadge(null)
    setShowModal(true)
  }

  const handleEditBadge = (badge: badgesAPI.BadgeDefinition) => {
    setEditingBadge(badge)
    setShowModal(true)
  }

  const handleDeleteBadge = async (id: string) => {
    if (!confirm('Are you sure you want to delete this badge?')) return
    
    try {
      setDeleteLoading(id)
      await badgesAPI.deleteBadge(id)
      await fetchBadges()
    } catch (err: any) {
      alert('Failed to delete badge: ' + err.message)
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleToggleActive = async (badge: badgesAPI.BadgeDefinition) => {
    try {
      await badgesAPI.updateBadge(badge.id, { is_active: !badge.is_active })
      await fetchBadges()
    } catch (err: any) {
      alert('Failed to update badge: ' + err.message)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingBadge(null)
  }

  const handleBadgeSaved = () => {
    handleModalClose()
    fetchBadges()
  }

  const getVariantBadge = (variant: badgesAPI.BadgeVariant | string | null | undefined) => {
    const defaultConfig = { 
      label: String(variant || 'Unknown'), 
      color: 'text-gray-600', 
      bgColor: 'bg-gray-100' 
    }
    const config = (variant && badgesAPI.BADGE_VARIANTS[variant as badgesAPI.BadgeVariant]) || defaultConfig
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getConditionLabel = (badge: badgesAPI.BadgeDefinition) => {
    const type = badgesAPI.CONDITION_TYPES[badge.condition_type]
    const value = badge.condition_value

    if (badge.condition_type === 'levels_completed') {
      return `${value.count || 0} levels in ${value.subject || 'any subject'}`
    }
    if (badge.condition_type === 'stars_earned') {
      return `${value.total || 0} total stars`
    }
    if (badge.condition_type === 'streak_days') {
      return `${value.days || 0} day streak`
    }

    return type?.label || badge.condition_type
  }

  // Stats
  const stats = {
    total: badges.length,
    active: badges.filter(b => b.is_active).length,
    byVariant: Object.keys(badgesAPI.BADGE_VARIANTS).reduce((acc, v) => {
      acc[v] = badges.filter(b => b.variant === v).length
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
          onClick={fetchBadges}
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Badge Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Create and manage achievement badges for users
          </p>
        </div>
        <button 
          onClick={handleCreateBadge}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Create Badge
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Badges</p>
            <Award className="text-primary" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
            <div className="w-3 h-3 bg-green-500 rounded-full" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-orange-600 dark:text-orange-400">Bronze</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.byVariant.bronze || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">Gold</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.byVariant.gold || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-purple-600 dark:text-purple-400">Platinum</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.byVariant.platinum || 0}</p>
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
              placeholder="Search badges by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
            />
          </div>

          {/* Variant Filter */}
          <select
            value={filterVariant}
            onChange={(e) => setFilterVariant(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
          >
            <option value="all">All Variants</option>
            {Object.entries(badgesAPI.BADGE_VARIANTS).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Badges Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Badge
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Variant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Condition
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredBadges.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  {searchQuery || filterVariant !== 'all' 
                    ? 'No badges match your filters'
                    : 'No badges yet. Create your first badge!'}
                </td>
              </tr>
            ) : (
              filteredBadges.map((badge) => (
                <tr key={badge.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                        <Award className="text-white" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{badge.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getVariantBadge(badge.variant)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {badgesAPI.CONDITION_TYPES[badge.condition_type]?.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getConditionLabel(badge)}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">
                    {badge.display_order}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(badge)}
                      className={`flex items-center gap-2 ${
                        badge.is_active 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-gray-400'
                      }`}
                    >
                      {badge.is_active ? (
                        <ToggleRight size={24} />
                      ) : (
                        <ToggleLeft size={24} />
                      )}
                      <span className="text-sm">
                        {badge.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditBadge(badge)}
                        className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteBadge(badge.id)}
                        disabled={deleteLoading === badge.id}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deleteLoading === badge.id ? (
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
        <BadgeModal
          badge={editingBadge}
          onClose={handleModalClose}
          onSave={handleBadgeSaved}
        />
      )}
    </div>
  )
}

// ==================== BADGE MODAL ====================

interface BadgeModalProps {
  badge: badgesAPI.BadgeDefinition | null
  onClose: () => void
  onSave: () => void
}

function BadgeModal({ badge, onClose, onSave }: BadgeModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: badge?.name || '',
    description: badge?.description || '',
    variant: badge?.variant || 'bronze' as badgesAPI.BadgeVariant,
    icon_asset: badge?.icon_asset || '',
    condition_type: badge?.condition_type || 'levels_completed' as badgesAPI.ConditionType,
    condition_subject: badge?.condition_value.subject || '',
    condition_count: badge?.condition_value.count || 1,
    condition_total: badge?.condition_value.total || 10,
    condition_days: badge?.condition_value.days || 7,
    display_order: badge?.display_order || 0,
    is_active: badge?.is_active ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Badge name is required')
      return
    }

    try {
      setLoading(true)

      // Build condition_value based on condition_type
      let condition_value: badgesAPI.ConditionValue = {}
      switch (formData.condition_type) {
        case 'levels_completed':
          condition_value = { 
            subject: formData.condition_subject || undefined, 
            count: formData.condition_count 
          }
          break
        case 'stars_earned':
          condition_value = { total: formData.condition_total }
          break
        case 'streak_days':
          condition_value = { days: formData.condition_days }
          break
      }

      const input = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        variant: formData.variant,
        icon_asset: formData.icon_asset.trim() || null,
        condition_type: formData.condition_type,
        condition_value,
        display_order: formData.display_order,
        is_active: formData.is_active,
      }

      if (badge) {
        await badgesAPI.updateBadge(badge.id, input)
      } else {
        await badgesAPI.createBadge(input)
      }

      onSave()
    } catch (err: any) {
      alert('Failed to save badge: ' + err.message)
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
            {badge ? 'Edit Badge' : 'Create Badge'}
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
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Badge Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
              placeholder="e.g., Math Master"
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
              placeholder="Describe what this badge represents..."
            />
          </div>

          {/* Variant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Variant
            </label>
            <select
              value={formData.variant}
              onChange={(e) => setFormData(prev => ({ ...prev, variant: e.target.value as badgesAPI.BadgeVariant }))}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
            >
              {Object.entries(badgesAPI.BADGE_VARIANTS).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          {/* Condition Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Condition Type
            </label>
            <select
              value={formData.condition_type}
              onChange={(e) => setFormData(prev => ({ ...prev, condition_type: e.target.value as badgesAPI.ConditionType }))}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
            >
              {Object.entries(badgesAPI.CONDITION_TYPES).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {badgesAPI.CONDITION_TYPES[formData.condition_type]?.description}
            </p>
          </div>

          {/* Condition Value - Dynamic based on type */}
          {formData.condition_type === 'levels_completed' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject (optional)
                </label>
                <select
                  value={formData.condition_subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, condition_subject: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                >
                  <option value="">Any Subject</option>
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="math">Math</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Levels Required
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.condition_count}
                  onChange={(e) => setFormData(prev => ({ ...prev, condition_count: parseInt(e.target.value) || 1 }))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {formData.condition_type === 'stars_earned' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total Stars Required
              </label>
              <input
                type="number"
                min={1}
                value={formData.condition_total}
                onChange={(e) => setFormData(prev => ({ ...prev, condition_total: parseInt(e.target.value) || 1 }))}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
              />
            </div>
          )}

          {formData.condition_type === 'streak_days' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Days Required
              </label>
              <input
                type="number"
                min={1}
                value={formData.condition_days}
                onChange={(e) => setFormData(prev => ({ ...prev, condition_days: parseInt(e.target.value) || 1 }))}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
              />
            </div>
          )}

          {/* Display Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Display Order
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
              {formData.is_active ? 'Badge is active and can be earned' : 'Badge is inactive'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {badge ? 'Save Changes' : 'Create Badge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
