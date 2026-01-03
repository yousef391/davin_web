'use client'

import { ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { AppProvider } from './AppProvider'

interface DashboardLayoutProps {
  children: ReactNode
}

/**
 * DashboardLayout - Main layout wrapper for all dashboard pages
 * Includes Header (top) + Sidebar (left) + Main content area
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AppProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header />
          
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </AppProvider>
  )
}
