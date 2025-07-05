'use client'

import React from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { LoginForm } from '@/components/auth/login-form'
import { Dashboard } from '@/components/dashboard/dashboard'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoginForm />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Dashboard />
    </div>
  )
}
