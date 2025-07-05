'use client'

import { useState } from 'react'
import { Job } from '@/lib/database.types'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useToast } from '@/components/ui/toaster'
import { formatDate } from '@/lib/utils'
import { exportUtils } from '@/lib/export-utils'
import { 
  MapIcon, 
  TrashIcon, 
  ArrowPathIcon,
  DocumentArrowDownIcon,
  RocketLaunchIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface JobListProps {
  jobs: Job[]
  loading: boolean
  onJobUpdated: (job: Job) => void
  onJobDeleted: (jobId: string) => void
  onViewRoute: (job: Job) => void
  onRefresh: () => void
}

export function JobList({ 
  jobs, 
  loading, 
  onJobUpdated, 
  onJobDeleted, 
  onViewRoute, 
  onRefresh 
}: JobListProps) {
  const [optimizingJob, setOptimizingJob] = useState<string | null>(null)
  const { success, error } = useToast()

  const handleOptimizeRoute = async (job: Job) => {
    setOptimizingJob(job.id)
    try {
      const response = await fetch('/api/optimize-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobId: job.id })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to optimize route')
      }

      await response.json()
      success('Route optimized successfully', `Route for ${job.job_id} has been optimized`)
      
      // Update job status
      onJobUpdated({ ...job, status: 'scheduled' })
      
    } catch (err) {
      error('Route optimization failed', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setOptimizingJob(null)
    }
  }

  const handleDeleteJob = async (job: Job) => {
    if (!confirm(`Are you sure you want to delete job ${job.job_id}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/jobs?id=${job.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete job')
      }

      onJobDeleted(job.id)
    } catch (err) {
      error('Failed to delete job', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const handleExportCSV = () => {
    const jobData = jobs.map(job => ({
      job,
      route: null,
      teamAssignment: null
    }))
    
    exportUtils.downloadCSV(jobData, `jobs-${new Date().toISOString().split('T')[0]}.csv`)
    success('Export successful', 'Jobs exported to CSV')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />
      case 'scheduled':
        return <RocketLaunchIcon className="h-4 w-4 text-blue-500" />
      case 'in_progress':
        return <ArrowPathIcon className="h-4 w-4 text-orange-500" />
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4 text-red-500" />
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-orange-100 text-orange-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Jobs</h2>
            <p className="text-sm text-gray-600 mt-1">
              {jobs.length} job{jobs.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onRefresh}
              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <ArrowPathIcon className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stops
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {job.job_id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{job.client_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {job.job_type.replace('_', ' ')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {job.postcodes.length}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {getStatusIcon(job.status)}
                    <span>{job.status.replace('_', ' ')}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(job.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onViewRoute(job)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      title="View Route"
                    >
                      <MapIcon className="h-4 w-4" />
                    </button>
                    
                    {job.status === 'pending' && (
                      <button
                        onClick={() => handleOptimizeRoute(job)}
                        disabled={optimizingJob === job.id}
                        className="text-green-600 hover:text-green-900 p-1 rounded disabled:opacity-50"
                        title="Optimize Route"
                      >
                        {optimizingJob === job.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <RocketLaunchIcon className="h-4 w-4" />
                        )}
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteJob(job)}
                      className="text-red-600 hover:text-red-900 p-1 rounded"
                      title="Delete Job"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {jobs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No jobs found</div>
          <p className="text-gray-400">Create your first job to get started</p>
        </div>
      )}
    </div>
  )
}