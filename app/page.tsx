'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Demo credentials
  const demoCredentials = {
    username: 'demo@coinbase.com',
    password: 'demo123456'
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (username === demoCredentials.username && password === demoCredentials.password) {
      // Store auth in sessionStorage
      sessionStorage.setItem('authenticated', 'true')
      router.push('/home')
    } else {
      setError('Invalid credentials. Please use the demo credentials shown above.')
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-coinbase-blue rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">C</span>
          </div>
        </div>

        {/* Credentials Display */}
        <div className="bg-coinbase-light-blue border border-coinbase-blue rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-coinbase-blue mb-2">Demo Credentials:</h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Username:</span> {demoCredentials.username}</p>
            <p><span className="font-medium">Password:</span> {demoCredentials.password}</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Sign in</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="username"
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coinbase-blue focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coinbase-blue focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-coinbase-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-coinbase-blue hover:underline">
              Forgot password?
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

