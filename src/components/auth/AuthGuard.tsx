'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AuthGuardProps {
  children: React.ReactNode
}

/**
 * AuthGuard - Protects routes from unauthenticated access
 * 
 * Checks localStorage for admin_authenticated flag.
 * Redirects to /login if not authenticated.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Check authentication status
    const authStatus = localStorage.getItem('admin_authenticated')
    
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
      // Redirect to login if not authenticated
      if (pathname !== '/login') {
        router.push('/login')
      }
    }
  }, [pathname, router])

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // If on login page, show children regardless of auth status
  if (pathname === '/login') {
    return <>{children}</>
  }

  // If not authenticated, don't render protected content
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

/**
 * Logout function - clears auth state and redirects to login
 */
export function logout() {
  localStorage.removeItem('admin_authenticated')
  localStorage.removeItem('admin_email')
  window.location.href = '/login'
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('admin_authenticated') === 'true'
}

/**
 * Get current admin email
 */
export function getAdminEmail(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('admin_email')
}
