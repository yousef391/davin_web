'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  BarChart3, 
  Package, 
  MessageSquare, 
  Users, 
  Settings, 
  LogOut,
  CreditCard 
} from 'lucide-react'

const menuItems = [
  { icon: BarChart3, label: 'Analytics', href: '/' },
  { icon: Users, label: 'Users', href: '/users' },
  { icon: CreditCard, label: 'Subscriptions', href: '/subscriptions' },
  { icon: Package, label: 'Content', href: '/content' },
  { icon: MessageSquare, label: 'Support', href: '/support' },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">🎨</span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">Le Petit Davinci</span>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors mb-4">
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>

        {/* User Card */}
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Need help</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">I'm here to contact</p>
            </div>
          </div>
          <button className="mt-3 w-full bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
            Get Support
          </button>
        </div>
      </div>
    </div>
  )
}
