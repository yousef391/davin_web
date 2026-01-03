import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down'
  icon?: LucideIcon
}

export function StatCard({ title, value, change, trend, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">{title}</span>
        {Icon && (
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <Icon size={18} className="text-gray-600 dark:text-gray-400" />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
        {change && (
          <span className={`text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {change}
          </span>
        )}
      </div>
      {change && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">vs last month</p>
      )}
    </div>
  )
}
