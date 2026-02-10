'use client'

import { ReactNode, useEffect, useState } from 'react'
import { AuthGuard } from '@/components/auth/AuthGuard'

interface AppProviderProps {
  children: ReactNode
}

/**
 * AppProvider - Manages global app state (theme) and authentication
 * Removed Zustand dependency - using simple React state + localStorage
 */
export function AppProvider({ children }: AppProviderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme')
    
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null
  }

  return <AuthGuard>{children}</AuthGuard>
}
