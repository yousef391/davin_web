'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Download,
  Mail,
  Loader2,
  AlertCircle,
  RefreshCw,
  Eye,
  Trash2,
  Key,
  Users,
  CreditCard,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import * as usersAPI from '@/lib/api/users'
import { UserDetailModal } from './UserDetailModal'

type FilterStatus = 'all' | 'active' | 'inactive'
type FilterSubscription = 'all' | 'free' | 'trial' | 'paid'

export function UsersPage() {
  // Data state
  const [users, setUsers] = useState<usersAPI.UserListItem[]>([])
  const [stats, setStats] = useState<{
    total: number
    active: number
    inactive: number
    withSubscription: number
    newThisMonth: number
    totalProfiles: number
  } | null>(null)
  
  // Loading states
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination
  const [page, setPage] = useState(1)
  const [perPage] = useState(15)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterSubscription, setFilterSubscription] = useState<FilterSubscription>('all')
  
  // Modal states
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  
  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch users
  const fetchUsers = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true)
      else setRefreshing(true)
      setError(null)

      const response = await usersAPI.getUsers(page, perPage, {
        search: debouncedSearch || undefined,
        status: filterStatus,
        subscription: filterSubscription,
      })

      setUsers(response.data)
      setTotal(response.total)
      setTotalPages(response.totalPages)
    } catch (err: any) {
      console.error('Error fetching users:', err)
      setError(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [page, perPage, debouncedSearch, filterStatus, filterSubscription])

  // Fetch stats
  const fetchStats = async () => {
    try {
      const statsData = await usersAPI.getUserStats()
      setStats(statsData)
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  // Initial load and refetch on filter changes
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    fetchStats()
  }, [])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filterStatus, filterSubscription])

  const handleRefresh = () => {
    fetchUsers(false)
    fetchStats()
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return
    }

    try {
      setActionLoading(userId)
      await usersAPI.deleteUser(userId)
      await fetchUsers(false)
      await fetchStats()
    } catch (err: any) {
      alert('Failed to delete user: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSendPasswordReset = async (userId: string) => {
    try {
      setActionLoading(`password-${userId}`)
      await usersAPI.sendPasswordReset(userId)
      alert('Password reset email sent successfully!')
    } catch (err: any) {
      alert('Failed to send password reset: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Email', 'Status', 'Subscription', 'Profiles', 'Joined', 'Last Login'].join(','),
      ...users.map(user => [
        usersAPI.getFullName(user),
        user.email,
        user.emailVerified ? 'Active' : 'Inactive',
        usersAPI.getSubscriptionDisplay(user.subscription),
        user.profileCount,
        usersAPI.formatDate(user.createdAt),
        usersAPI.formatRelativeTime(user.lastLogin),
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getSubscriptionBadgeColor = (subscription: usersAPI.UserListItem['subscription']) => {
    const plan = usersAPI.getSubscriptionDisplay(subscription)
    switch (plan.toLowerCase()) {
      case 'yearly':
      case 'premium':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'monthly':
      case 'basic':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'trial':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage all registered users and their profiles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={20} className={`text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
            <Users size={20} className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats?.total ?? '-'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {stats?.newThisMonth ?? 0} new this month
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Active Users</p>
            <UserCheck size={20} className="text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats?.active ?? '-'}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            Email verified
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Paid Subscribers</p>
            <CreditCard size={20} className="text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats?.withSubscription ?? '-'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Active subscriptions
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Profiles</p>
            <UserX size={20} className="text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats?.totalProfiles ?? '-'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {stats && stats.total > 0 
              ? `Avg ${(stats.totalProfiles / stats.total).toFixed(1)} per user`
              : 'Child profiles'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={filterSubscription}
            onChange={(e) => setFilterSubscription(e.target.value as FilterSubscription)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
          >
            <option value="all">All Subscriptions</option>
            <option value="paid">Paid</option>
            <option value="trial">Trial</option>
            <option value="free">Free</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle size={20} />
            <span className="font-medium">{error}</span>
          </div>
          <button
            onClick={() => fetchUsers()}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Users Table */}
      {!loading && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">User</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Contact</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Profiles</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Subscription</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Last Login</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const fullName = usersAPI.getFullName(user)
                    const initials = usersAPI.getUserInitials(user)
                    const subscriptionDisplay = usersAPI.getSubscriptionDisplay(user.subscription)

                    return (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {initials}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{fullName}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {usersAPI.formatDate(user.createdAt)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                            <Mail size={14} className="text-gray-400" />
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-semibold">
                            {user.profileCount}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getSubscriptionBadgeColor(user.subscription)}`}>
                            {subscriptionDisplay}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                            user.emailVerified
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              user.emailVerified ? 'bg-green-600 dark:bg-green-400' : 'bg-gray-400'
                            }`}></span>
                            {user.emailVerified ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {usersAPI.formatRelativeTime(user.lastLogin)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedUserId(user.id)}
                              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleSendPasswordReset(user.id)}
                              disabled={actionLoading === `password-${user.id}`}
                              className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors disabled:opacity-50"
                              title="Send Password Reset"
                            >
                              {actionLoading === `password-${user.id}` ? (
                                <Loader2 className="animate-spin" size={18} />
                              ) : (
                                <Key size={18} />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, fullName)}
                              disabled={actionLoading === user.id}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete User"
                            >
                              {actionLoading === user.id ? (
                                <Loader2 className="animate-spin" size={18} />
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {users.length} of {total} users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                Page {page} of {totalPages || 1}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onUpdated={() => {
            fetchUsers(false)
            fetchStats()
          }}
        />
      )}
    </div>
  )
}
