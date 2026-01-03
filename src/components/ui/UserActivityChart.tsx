'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'

const data = [
  { month: 'JAN', value: 100 },
  { month: 'FEB', value: 120 },
  { month: 'MAR', value: 150 },
  { month: 'APR', value: 180 },
  { month: 'MAY', value: 200 },
  { month: 'JUN', value: 170 },
  { month: 'JUL', value: 190 },
  { month: 'AUG', value: 220 },
  { month: 'SEP', value: 280 },
  { month: 'OCT', value: 320 },
  { month: 'NOV', value: 370 },
  { month: 'DEC', value: 420 },
]

export function UserActivityChart() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Overall User Activity</h3>
        <select className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option>2021</option>
          <option>2022</option>
          <option>2023</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis 
            dataKey="month" 
            stroke="#9CA3AF" 
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            stroke="#9CA3AF" 
            fontSize={12}
            tickLine={false}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#a855f7" 
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
