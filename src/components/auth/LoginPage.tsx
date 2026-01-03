'use client'

import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, Chrome } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as authService from '@/lib/api/auth'

/**
 * LoginPage Component
 * 
 * This is the authentication screen for admin dashboard.
 * It connects to your backend API to verify credentials.
 */
export function LoginPage() {
  // Router for navigation (Next.js way to redirect)
  const router = useRouter()
  
  // Component state (like variables that trigger re-render when changed)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  /**
   * Handle email/password login
   * 
   * Flow:
   * 1. User submits form
   * 2. We call authService.login() which sends request to backend
   * 3. Backend validates credentials with Supabase
   * 4. If valid, backend returns tokens + user data
   * 5. authService.login() saves tokens to localStorage
   * 6. We redirect to dashboard
   */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault() // Prevent page refresh
    setError('') // Clear any previous errors
    setIsLoading(true) // Show loading state

    try {
      // Call our auth service to login
      const response = await authService.login({ email, password })
      
      // Check if login was successful
      if (response.success) {
        console.log('✅ Login successful!', response.data)
        
        // Redirect to main dashboard
        router.push('/')
      } else {
        // Should not happen (would throw error instead)
        setError(response.message || 'Login failed')
      }
    } catch (err: any) {
      // Handle errors (wrong password, network issues, etc.)
      console.error('❌ Login failed:', err)
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      // Always stop loading, even if error
      setIsLoading(false)
    }
  }

  /**
   * Handle Google OAuth login
   * 
   * Opens Google login popup window
   * Note: For admin dashboard, you may want to restrict this
   * to only allow certain Google Workspace domains
   */
  const handleGoogleLogin = async () => {
    setError('')
    setIsLoading(true)
    
    try {
      // This opens Google login in a popup
      authService.loginWithGoogle()
      
      // Note: The actual login completion happens in the OAuth callback
      // You'll need to handle the callback from Google
      console.log('Google login popup opened')
    } catch (err: any) {
      console.error('❌ Google login failed:', err)
      setError('Google login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
            <span className="text-3xl">🎨</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Le Petit Davinci
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Admin Dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Sign In
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@lepetitdavinci.com"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-primary hover:text-primary-dark font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <Chrome size={20} />
            Sign in with Google
          </button>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Protected by enterprise-grade security
          </p>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Need access?{' '}
            <button className="text-primary hover:text-primary-dark font-medium">
              Contact support
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
