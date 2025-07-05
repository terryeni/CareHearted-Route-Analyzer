'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { useToast } from '@/components/ui/toaster'
import { JobForm } from './job-form'
import { JobList } from './job-list'
import { RouteMap } from './route-map'
import { Job } from '@/lib/database.types'
import { 
  PlusIcon, 
  MapIcon, 
  ListBulletIcon, 
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

type TabType = 'jobs' | 'create' | 'map'

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('jobs')
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  const { user, signOut } = useAuth()
  const { success, error } = useToast()

  useEffect(() => {
    fetchJobs()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/jobs')
      if (!response.ok) throw new Error('Failed to fetch jobs')
      
      const data = await response.json()
      setJobs(data)
    } catch (err) {
      error('Failed to fetch jobs', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [error])

  const handleJobCreated = (newJob: Job) => {
    setJobs([newJob, ...jobs])
    setActiveTab('jobs')
    success('Job created successfully', `Job ${newJob.job_id} has been created`)
  }

  const handleJobUpdated = (updatedJob: Job) => {
    setJobs(jobs.map(job => job.id === updatedJob.id ? updatedJob : job))
    success('Job updated successfully', `Job ${updatedJob.job_id} has been updated`)
  }

  const handleJobDeleted = (jobId: string) => {
    setJobs(jobs.filter(job => job.id !== jobId))
    success('Job deleted successfully', 'The job has been removed')
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      success('Signed out successfully', 'You have been logged out')
    } catch (err) {
      error('Sign out failed', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const handleViewRoute = (job: Job) => {
    setSelectedJob(job)
    setActiveTab('map')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Route Planner
              </h1>
              <span className="text-sm text-gray-500">
                Workforce Management System
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserCircleIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {user?.user_metadata?.full_name || user?.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'jobs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ListBulletIcon className="h-5 w-5" />
              <span>Jobs</span>
            </button>
            
            <button
              onClick={() => setActiveTab('create')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <PlusIcon className="h-5 w-5" />
              <span>Create Job</span>
            </button>
            
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'map'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MapIcon className="h-5 w-5" />
              <span>Route Map</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'jobs' && (
          <JobList
            jobs={jobs}
            loading={loading}
            onJobUpdated={handleJobUpdated}
            onJobDeleted={handleJobDeleted}
            onViewRoute={handleViewRoute}
            onRefresh={fetchJobs}
          />
        )}
        
        {activeTab === 'create' && (
          <JobForm
            onJobCreated={handleJobCreated}
            userId={user?.id || ''}
          />
        )}
        
        {activeTab === 'map' && (
          <RouteMap
            selectedJob={selectedJob}
            jobs={jobs}
            onJobSelect={setSelectedJob}
          />
        )}
      </main>
    </div>
  )
}