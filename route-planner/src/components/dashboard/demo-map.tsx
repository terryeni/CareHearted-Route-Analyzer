'use client'

import { useState } from 'react'
import { Job } from '@/lib/database.types'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useToast } from '@/components/ui/toaster'
import { DEMO_POSTCODE_COORDS } from '@/lib/demo-data'
import { 
  MapIcon, 
  RocketLaunchIcon
} from '@heroicons/react/24/outline'

interface DemoMapProps {
  selectedJob: Job | null
  jobs: Job[]
  onJobSelect: (job: Job) => void
}

export function DemoMap({ selectedJob, jobs, onJobSelect }: DemoMapProps) {
  const [loading, setLoading] = useState(false)
  const [routeOptimized, setRouteOptimized] = useState(false)
  const { success } = useToast()

  const handleOptimizeRoute = async (job: Job) => {
    setLoading(true)
    try {
      const response = await fetch('/api/optimize-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobId: job.id })
      })

      if (response.ok) {
        setRouteOptimized(true)
        success('Route optimized successfully', 'Demo route has been optimized and displayed')
      }
    } catch (err) {
      console.error('Demo route optimization:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRouteInfo = () => {
    if (!selectedJob || !routeOptimized) return null
    
    return {
      distance: '15.4 km',
      time: '145 minutes'
    }
  }

  return (
    <div className="space-y-6">
      {/* Job Selection */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Route Visualization (Demo Mode)</h2>
        
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <MapIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Demo Mode Active</h3>
              <p className="text-sm text-blue-700 mt-1">
                This is a demonstration version. In production, this would show interactive Google Maps with real route optimization.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Job
            </label>
            <select
              value={selectedJob?.id || ''}
              onChange={(e) => {
                const job = jobs.find(j => j.id === e.target.value)
                if (job) {
                  onJobSelect(job)
                  setRouteOptimized(false)
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a job to view route</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.job_id} - {job.client_name} ({job.postcodes.length} stops)
                </option>
              ))}
            </select>
          </div>
          
          {selectedJob && (
            <div className="flex items-end space-x-2">
              <button
                onClick={() => handleOptimizeRoute(selectedJob)}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <RocketLaunchIcon className="h-4 w-4" />
                )}
                <span>Optimize Route</span>
              </button>
            </div>
          )}
        </div>

        {/* Job Info */}
        {selectedJob && (
          <div className="bg-gray-50 rounded-md p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Job ID:</span>
                <span className="ml-2 text-gray-900">{selectedJob.job_id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Client:</span>
                <span className="ml-2 text-gray-900">{selectedJob.client_name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Type:</span>
                <span className="ml-2 text-gray-900">{selectedJob.job_type.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Stops:</span>
                <span className="ml-2 text-gray-900">{selectedJob.postcodes.length}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Vehicle:</span>
                <span className="ml-2 text-gray-900">{selectedJob.vehicle_size.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  selectedJob.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  selectedJob.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedJob.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Route Info */}
        {routeOptimized && getRouteInfo() && (
          <div className="bg-blue-50 rounded-md p-4 mb-4">
            <h3 className="font-medium text-blue-900 mb-2">Route Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-700">Total Distance:</span>
                <span className="ml-2 text-blue-900">{getRouteInfo()?.distance}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Estimated Time:</span>
                <span className="ml-2 text-blue-900">{getRouteInfo()?.time}</span>
              </div>
            </div>
            
            {/* Optimized Route Order */}
            {selectedJob && routeOptimized && (
              <div className="mt-4">
                <h4 className="font-medium text-blue-900 mb-2">Optimized Route Order:</h4>
                <div className="space-y-1">
                  {selectedJob.postcodes.map((postcode, index) => (
                    <div key={postcode} className="flex items-center space-x-2 text-sm">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                        {index + 1}
                      </span>
                      <span className="text-blue-900">{postcode}</span>
                      {DEMO_POSTCODE_COORDS[postcode] && (
                        <span className="text-blue-600 text-xs">
                          ({DEMO_POSTCODE_COORDS[postcode].lat.toFixed(4)}, {DEMO_POSTCODE_COORDS[postcode].lng.toFixed(4)})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Demo Map Display */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="relative">
          <div className="h-96 w-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
            {!selectedJob ? (
              <div className="text-center">
                <MapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a job to view its route</p>
              </div>
            ) : !routeOptimized ? (
              <div className="text-center">
                <div className="w-24 h-24 bg-white rounded-lg shadow-md flex items-center justify-center mb-4">
                  <MapIcon className="h-8 w-8 text-blue-600" />
                </div>
                                 <p className="text-gray-700 font-medium">Click &quot;Optimize Route&quot; to see the optimized path</p>
                <p className="text-gray-500 text-sm mt-1">In production, this would show an interactive Google Map</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-32 h-32 bg-white rounded-lg shadow-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <RocketLaunchIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">Route Optimized!</p>
                  </div>
                </div>
                <p className="text-gray-700 font-medium">Demo route visualization complete</p>
                <p className="text-gray-500 text-sm mt-1">
                  {selectedJob.postcodes.length} stops • {getRouteInfo()?.distance} • {getRouteInfo()?.time}
                </p>
                <div className="mt-4 text-xs text-gray-500 max-w-md mx-auto">
                  <p>In production mode, this area would display:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Interactive Google Maps with route visualization</li>
                    <li>Turn-by-turn directions</li>
                    <li>Real-time traffic information</li>
                    <li>Draggable waypoints for manual optimization</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-2 text-gray-600">Optimizing route...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}