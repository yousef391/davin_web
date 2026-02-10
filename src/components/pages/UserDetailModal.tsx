'use client'

import { useState, useEffect } from 'react'
import {
  X,
  Loader2,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Users,
  Edit2,
  Trash2,
  Plus,
  Key,
  AlertTriangle,
  Check,
  XCircle,
  Globe,
} from 'lucide-react'
import * as usersAPI from '@/lib/api/users'

interface UserDetailModalProps {
  userId: string
  onClose: () => void
  onUpdated: () => void
}

type TabType = 'details' | 'profiles' | 'subscription'

export function UserDetailModal({ userId, onClose, onUpdated }: UserDetailModalProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<usersAPI.User | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('details')
  
  // Edit states
  const [isEditing, setIsEditing] = useState(false)
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [saving, setSaving] = useState(false)
  
  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Profile creation
  const [showCreateProfile, setShowCreateProfile] = useState(false)
  const [newProfileName, setNewProfileName] = useState('')
  const [newProfileAge, setNewProfileAge] = useState<number | undefined>()
  const [newProfileLanguage, setNewProfileLanguage] = useState<'en' | 'fr'>('en')

  useEffect(() => {
    fetchUser()
  }, [userId])

  const fetchUser = async () => {
    try {
      setLoading(true)
      setError(null)
      const userData = await usersAPI.getUserById(userId)
      setUser(userData)
      setEditFirstName(userData.firstName)
      setEditLastName(userData.lastName)
      setEditPhone(userData.phone || '')
    } catch (err: any) {
      setError(err.message || 'Failed to load user')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveUser = async () => {
    if (!user) return
    
    try {
      setSaving(true)
      await usersAPI.updateUser(user.id, {
        firstName: editFirstName,
        lastName: editLastName,
        phone: editPhone || undefined,
      })
      await fetchUser()
      setIsEditing(false)
      onUpdated()
    } catch (err: any) {
      alert('Failed to update user: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSendPasswordReset = async () => {
    if (!user) return
    
    try {
      setActionLoading('password')
      await usersAPI.sendPasswordReset(user.id)
      alert('Password reset email sent successfully!')
    } catch (err: any) {
      alert('Failed to send password reset: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async () => {
    if (!user) return
    
    try {
      setActionLoading('delete')
      await usersAPI.deleteUser(user.id)
      onUpdated()
      onClose()
    } catch (err: any) {
      alert('Failed to delete user: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancelSubscription = async (immediately: boolean) => {
    if (!user) return
    
    try {
      setActionLoading('subscription')
      await usersAPI.cancelUserSubscription(user.id, immediately)
      await fetchUser()
      onUpdated()
      alert(immediately 
        ? 'Subscription canceled immediately' 
        : 'Subscription will cancel at period end')
    } catch (err: any) {
      alert('Failed to cancel subscription: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleCreateProfile = async () => {
    if (!user || !newProfileName.trim()) return
    
    try {
      setActionLoading('createProfile')
      await usersAPI.createUserProfile(user.id, {
        name: newProfileName.trim(),
        age: newProfileAge,
        language: newProfileLanguage,
      })
      await fetchUser()
      setShowCreateProfile(false)
      setNewProfileName('')
      setNewProfileAge(undefined)
      setNewProfileLanguage('en')
      onUpdated()
    } catch (err: any) {
      alert('Failed to create profile: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteProfile = async (profileId: string) => {
    if (!user) return
    if (!confirm('Are you sure you want to delete this profile? This will delete all progress data.')) return
    
    try {
      setActionLoading(`deleteProfile-${profileId}`)
      await usersAPI.deleteUserProfile(user.id, profileId)
      await fetchUser()
      onUpdated()
    } catch (err: any) {
      alert('Failed to delete profile: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md">
          <div className="text-red-500 flex items-center gap-2 mb-4">
            <AlertTriangle size={24} />
            <span>{error || 'User not found'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  const fullName = usersAPI.getFullName(user)
  const initials = usersAPI.getUserInitials(user)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{fullName}</h2>
              <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'details', label: 'Details', icon: UserIcon },
            { id: 'profiles', label: `Profiles (${user.profiles.length})`, icon: Users },
            { id: 'subscription', label: 'Subscription', icon: CreditCard },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">User Information</h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1 text-primary hover:text-primary-dark text-sm"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={editFirstName}
                          onChange={(e) => setEditFirstName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={editLastName}
                          onChange={(e) => setEditLastName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="+1 234 567 8900"
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveUser}
                        disabled={saving}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setEditFirstName(user.firstName)
                          setEditLastName(user.lastName)
                          setEditPhone(user.phone || '')
                        }}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Mail size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="text-gray-900 dark:text-white">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="text-gray-900 dark:text-white">{user.phone || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Joined</p>
                        <p className="text-gray-900 dark:text-white">{usersAPI.formatDate(user.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Last Login</p>
                        <p className="text-gray-900 dark:text-white">{usersAPI.formatRelativeTime(user.lastLogin)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Status */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Account Status</h3>
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                    user.emailVerified 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {user.emailVerified ? <Check size={16} /> : <XCircle size={16} />}
                    {user.emailVerified ? 'Email Verified' : 'Email Not Verified'}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleSendPasswordReset}
                    disabled={actionLoading === 'password'}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50"
                  >
                    {actionLoading === 'password' ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Key size={16} />
                    )}
                    Send Password Reset
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                  >
                    <Trash2 size={16} />
                    Delete User
                  </button>
                </div>
              </div>

              {/* Delete Confirmation */}
              {showDeleteConfirm && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-3">
                    <AlertTriangle size={20} />
                    <span className="font-semibold">Confirm Delete</span>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                    This will permanently delete the user account, all profiles, and subscription data. This action cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteUser}
                      disabled={actionLoading === 'delete'}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {actionLoading === 'delete' ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        'Yes, Delete User'
                      )}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profiles Tab */}
          {activeTab === 'profiles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Child Profiles ({user.profiles.length})
                </h3>
                <button
                  onClick={() => setShowCreateProfile(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm"
                >
                  <Plus size={16} />
                  Add Profile
                </button>
              </div>

              {/* Create Profile Form */}
              {showCreateProfile && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Create New Profile</h4>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        placeholder="Child's name"
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        value={newProfileAge || ''}
                        onChange={(e) => setNewProfileAge(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="Age"
                        min={1}
                        max={12}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Language
                      </label>
                      <select
                        value={newProfileLanguage}
                        onChange={(e) => setNewProfileLanguage(e.target.value as 'en' | 'fr')}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="en">English</option>
                        <option value="fr">French</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateProfile}
                      disabled={!newProfileName.trim() || actionLoading === 'createProfile'}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                    >
                      {actionLoading === 'createProfile' ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        'Create Profile'
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateProfile(false)
                        setNewProfileName('')
                        setNewProfileAge(undefined)
                      }}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Profiles List */}
              {user.profiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No profiles yet
                </div>
              ) : (
                <div className="space-y-3">
                  {user.profiles.map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                          {profile.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{profile.name}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            {profile.age && <span>Age: {profile.age}</span>}
                            <span className="flex items-center gap-1">
                              <Globe size={14} />
                              {profile.language === 'en' ? 'English' : 'French'}
                            </span>
                            <span>Created: {usersAPI.formatDate(profile.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteProfile(profile.id)}
                        disabled={actionLoading === `deleteProfile-${profile.id}`}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg disabled:opacity-50"
                      >
                        {actionLoading === `deleteProfile-${profile.id}` ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              {user.subscription ? (
                <>
                  {/* Subscription Info */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Subscription Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Plan</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {user.subscription.plan}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          user.subscription.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : user.subscription.status === 'trialing'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {user.subscription.status}
                        </span>
                      </div>
                      {user.subscription.currentPeriodStart && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Current Period Start</p>
                          <p className="text-gray-900 dark:text-white">
                            {usersAPI.formatDate(user.subscription.currentPeriodStart)}
                          </p>
                        </div>
                      )}
                      {user.subscription.currentPeriodEnd && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Current Period End</p>
                          <p className="text-gray-900 dark:text-white">
                            {usersAPI.formatDate(user.subscription.currentPeriodEnd)}
                          </p>
                        </div>
                      )}
                    </div>

                    {user.subscription.cancelAtPeriodEnd && (
                      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                          ⚠️ Subscription will cancel at the end of the billing period
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Subscription Actions */}
                  {(user.subscription.status === 'active' || user.subscription.status === 'trialing') && !user.subscription.cancelAtPeriodEnd && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Subscription Actions</h3>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleCancelSubscription(false)}
                          disabled={actionLoading === 'subscription'}
                          className="px-4 py-2 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 disabled:opacity-50"
                        >
                          Cancel at Period End
                        </button>
                        <button
                          onClick={() => handleCancelSubscription(true)}
                          disabled={actionLoading === 'subscription'}
                          className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 disabled:opacity-50"
                        >
                          Cancel Immediately
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <CreditCard size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Active Subscription</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    This user is on the free plan
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
