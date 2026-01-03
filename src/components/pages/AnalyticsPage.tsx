'use client'

import { useEffect, useState } from 'react'
import { Calendar, Users, Video, TrendingUp, Play, Image, Gamepad2 } from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { MetricCard } from '@/components/ui/MetricCard'
import { UserActivityChart } from '@/components/ui/UserActivityChart'
import { DonutChart } from '@/components/ui/DonutChart'
import * as dashboardAPI from '@/lib/api/dashboard'

/**
 * Analytics Dashboard - Main Overview Page
 * 
 * This page fetches REAL data from your backend and displays it.
 * Uses React hooks to manage state and side effects.
 */
export function AnalyticsPage() {
  // State to store dashboard data from API
  const [stats, setStats] = useState({
    users: 0,
    profiles: 0,
    subscriptions: 0,
    monthlyRevenue: 0,
    newUsersThisMonth: 0,
    contentViews: 0,
    avgSessionTime: '0m',
    videosWatched: 0,
    gamesPlayed: 0,
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * useEffect Hook - Runs when component loads
   * 
   * Think of this like initState() in Flutter - it runs once when page opens.
   * We use it to fetch data from the backend.
   */
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Call the API to get real stats
        const data = await dashboardAPI.getDashboardStats()
        
        // Update state with real data
        setStats(data)
        
        console.log('✅ Dashboard data loaded:', data)
      } catch (err: any) {
        console.error('❌ Failed to load dashboard:', err)
        setError(err.message || 'Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, []) // Empty array means "run once when component mounts"

  const usersData = [
    { name: 'Active', value: 76, color: '#34d399' },
    { name: 'New', value: 18, color: '#fbbf24' },
    { name: 'Inactive', value: 6, color: '#f87171' },
  ]

  const subscriptionsData = [
    { name: 'Yearly', value: 45, color: '#a855f7' },
    { name: 'Monthly', value: 40, color: '#60a5fa' },
    { name: 'Trial', value: 15, color: '#fbbf24' },
  ]

  const contentEngagementData = [
    { name: 'Videos', value: 52, color: '#a855f7' },
    { name: 'Games', value: 28, color: '#34d399' },
    { name: 'Templates', value: 20, color: '#60a5fa' },
  ]

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Date */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Educational content performance overview</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <Calendar size={18} className="text-gray-600 dark:text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Last 30 days</span>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.users.toLocaleString()}
          change="12.5%"
          trend="up"
          icon={Users}
        />
        <StatCard 
          title="Active Subscriptions" 
          value={stats.subscriptions.toLocaleString()}
          change="8.3%"
          trend="up"
          icon={TrendingUp}
        />
        <StatCard 
          title="Content Views" 
          value={stats.contentViews > 0 ? stats.contentViews.toLocaleString() : 'N/A'}
          change="23.1%"
          trend="up"
          icon={Play}
        />
        <StatCard 
          title="Avg Session Time" 
          value={stats.avgSessionTime}
          change="15.2%"
          trend="up"
          icon={Video}
        />
      </div>

      {/* Engagement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Videos Watched" 
          value={stats.videosWatched > 0 ? stats.videosWatched.toLocaleString() : 'N/A'}
          change="18.7%"
          trend="up"
          icon={Video}
        />
        <StatCard 
          title="Games Played" 
          value={stats.gamesPlayed > 0 ? stats.gamesPlayed.toLocaleString() : 'N/A'}
          change="22.4%"
          trend="up"
          icon={Gamepad2}
        />
        
        {/* Donut Charts */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-center">
          <DonutChart title="Users" data={usersData} />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-center">
          <DonutChart title="Subscriptions" data={subscriptionsData} />
        </div>
      </div>

      {/* Content Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UserActivityChart />
        </div>
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Content Engagement</h3>
            <DonutChart title="" data={contentEngagementData} />
          </div>
          <MetricCard
            title="Monthly Revenue"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
            subtitle="Current Month"
            trend="+15.2%"
            icon={
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
            }
          />
        </div>
      </div>

      {/* Popular Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Most Popular Content</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Content</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Type</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Category</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Views</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Avg Watch Time</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {[
                { title: 'Learn Alphabet A-Z', type: 'Video', category: 'Education', views: '12.5K', watchTime: '12:30', engagement: '92%' },
                { title: 'Numbers 1-10 Song', type: 'Video', category: 'Education', views: '8.2K', watchTime: '7:15', engagement: '88%' },
                { title: 'Tic Tac Toe', type: 'Game', category: 'Games', views: '15.2K', watchTime: '5:45', engagement: '95%' },
                { title: 'Animal Coloring - Lion', type: 'Template', category: 'Animals', views: '4.5K', watchTime: '8:20', engagement: '78%' },
                { title: 'Animal Sounds Collection', type: 'Audio', category: 'Animals', views: '9.8K', watchTime: '15:00', engagement: '85%' },
              ].map((item, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {item.type === 'Video' ? '🎬' : item.type === 'Game' ? '🎮' : item.type === 'Template' ? '🖼️' : '🔊'}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{item.category}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{item.views}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{item.watchTime}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 dark:bg-green-400 rounded-full" 
                          style={{ width: item.engagement }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{item.engagement}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
