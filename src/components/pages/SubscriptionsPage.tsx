'use client'

import { useState, useEffect } from 'react'
import { Search, Download, CreditCard, TrendingUp, DollarSign, Calendar, MoreVertical, ExternalLink, AlertCircle, Loader2 } from 'lucide-react'
import { getAdminSubscriptions, AdminSubscription } from '@/lib/api/dashboard'

export function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'trialing' | 'canceled' | 'inactive'>('all')

  // Fetch subscriptions from backend
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getAdminSubscriptions()
        setSubscriptions(data)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch subscriptions')
        console.error('Failed to fetch subscriptions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptions()
  }, [])

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.stripeCustomerId.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || sub.status.toLowerCase() === filterStatus
    
    return matchesSearch && matchesStatus
  })

  // Calculate stats from real data
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active')
  const trialingSubscriptions = subscriptions.filter(s => s.status === 'trialing')
  
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'trialing': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'canceled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'past_due': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'inactive': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subscriptions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor and manage all subscription plans</p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-primary" size={40} />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading subscriptions...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-200">Failed to load subscriptions</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-3 text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Content - Only show when not loading */}
      {!loading && !error && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Subscriptions</p>
                <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{activeSubscriptions.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">From {subscriptions.length} total</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Trialing</p>
                <DollarSign className="text-yellow-600 dark:text-yellow-400" size={20} />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{trialingSubscriptions.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Free trial users</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Revenue</p>
                <DollarSign className="text-purple-600 dark:text-purple-400" size={20} />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">$0</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Requires Stripe integration</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                <CreditCard className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{subscriptions.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">All subscriptions</p>
            </div>
          </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by user, email, or Stripe ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="trialing">Trialing</option>
            <option value="canceled">Canceled</option>
            <option value="inactive">Inactive</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white">
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Customer</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Plan</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Period</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Stripe IDs</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      {subscriptions.length === 0 
                        ? 'No subscriptions yet. Create the subscriptions table using the SQL script.' 
                        : 'No subscriptions match your filters.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {sub.userName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{sub.userName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{sub.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        {sub.plan || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeColor(sub.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          sub.status === 'active' ? 'bg-green-600 dark:bg-green-400' : 
                          sub.status === 'trialing' ? 'bg-yellow-600 dark:bg-yellow-400' : 
                          'bg-red-600 dark:bg-red-400'
                        }`}></span>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        <p className="flex items-center gap-1">
                          <Calendar size={14} className="text-gray-400" />
                          {formatDate(sub.currentPeriodStart)}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                          to {formatDate(sub.currentPeriodEnd)}
                        </p>
                        {sub.cancelAtPeriodEnd && (
                          <p className="text-orange-600 dark:text-orange-400 text-xs mt-1">
                            Cancels at end
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        <button 
                          onClick={() => window.open(`https://dashboard.stripe.com/customers/${sub.stripeCustomerId}`, '_blank')}
                          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <CreditCard size={12} />
                          {sub.stripeCustomerId}
                          <ExternalLink size={10} />
                        </button>
                        <p className="text-gray-500 dark:text-gray-400">
                          Sub: {sub.stripeSubscriptionId || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 dark:text-white">{formatDate(sub.createdAt)}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
          </p>
        </div>
      </div>
      </>
      )}
    </div>
  )
}
