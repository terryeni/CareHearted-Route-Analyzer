'use client'

/// <reference types="google.maps" />
import { useState, useEffect, useRef } from 'react'
import { Job } from '@/lib/database.types'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useToast } from '@/components/ui/toaster'
import { Loader } from '@googlemaps/js-api-loader'
import { 
  MapIcon, 
  RocketLaunchIcon
} from '@heroicons/react/24/outline'

interface RouteMapProps {
  selectedJob: Job | null
  jobs: Job[]
  onJobSelect: (job: Job) => void
}

export function RouteMap({ selectedJob, jobs, onJobSelect }: RouteMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null)
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null)
  const [loading, setLoading] = useState(false)
  const [routeData, setRouteData] = useState<google.maps.DirectionsResult | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const { error, success } = useToast()

  useEffect(() => {
    initializeMap()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedJob && map && directionsService && directionsRenderer) {
      loadJobRoute(selectedJob)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJob, map, directionsService, directionsRenderer])

  const initializeMap = async () => {
    try {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        version: 'weekly',
        libraries: ['places', 'geometry']
      })

      const google = await loader.load()
      
      if (!mapRef.current) return

      const mapInstance = new google.maps.Map(mapRef.current, {
        zoom: 10,
        center: { lat: 51.5074, lng: -0.1278 }, // London center
        mapTypeId: google.maps.MapTypeId.ROADMAP
      })

      const directionsServiceInstance = new google.maps.DirectionsService()
      const directionsRendererInstance = new google.maps.DirectionsRenderer({
        draggable: false,
        suppressMarkers: false
      })

      directionsRendererInstance.setMap(mapInstance)

      setMap(mapInstance)
      setDirectionsService(directionsServiceInstance)
      setDirectionsRenderer(directionsRendererInstance)
      setMapLoaded(true)

    } catch (err) {
      console.error('Failed to initialize map:', err)
      error('Map initialization failed', 'Please check your Google Maps API key')
    }
  }

  const loadJobRoute = async (job: Job) => {
    if (!directionsService || !directionsRenderer) return

    setLoading(true)
    try {
      // First, try to get existing route data
      const response = await fetch(`/api/optimize-route?jobId=${job.id}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.route_data) {
          // Display existing optimized route
          displayRoute(data.route_data)
          setRouteData(data)
          return
        }
      }

      // If no existing route, create a simple route display
      if (job.postcodes.length === 0) {
        error('No postcodes found', 'This job has no postcodes to display')
        return
      }

      // Create waypoints from postcodes
      const waypoints = job.postcodes.slice(1, -1).map(postcode => ({
        location: postcode + ', UK',
        stopover: true
      }))

      const request = {
        origin: job.postcodes[0] + ', UK',
        destination: job.postcodes[job.postcodes.length - 1] + ', UK',
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      }

      directionsService.route(request, (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
        if (status === 'OK' && result) {
          displayRoute(result)
          setRouteData(result)
        } else {
          error('Route display failed', `Could not display route: ${status}`)
        }
      })

    } catch (err) {
      error('Failed to load route', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const displayRoute = (routeData: google.maps.DirectionsResult) => {
    if (!directionsRenderer) return
    
    directionsRenderer.setDirections(routeData)
    
    // Add custom info windows for waypoints
    if (routeData.routes && routeData.routes[0]) {
      // You can add custom markers or info windows here if needed
    }
  }

  const handleOptimizeRoute = async (job: Job) => {
    if (!job) return

    setLoading(true)
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

      const data = await response.json()
      
      // Display the optimized route
      if (data.optimizedRoute && data.optimizedRoute.routeData) {
        displayRoute(data.optimizedRoute.routeData)
        setRouteData(data.optimizedRoute)
      }

      success('Route optimized successfully', 'The route has been optimized and displayed')
      
    } catch (err) {
      error('Route optimization failed', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const getRouteInfo = (): { distance: string; time: string } | null => {
    if (!routeData || !routeData.routes || !routeData.routes[0]) return null

    const route = routeData.routes[0]
    let totalDistance = 0
    let totalTime = 0

    route.legs.forEach((leg) => {
      if (leg.distance && leg.duration) {
        totalDistance += leg.distance.value
        totalTime += leg.duration.value
      }
    })

    return {
      distance: (totalDistance / 1000).toFixed(1) + ' km',
      time: Math.round(totalTime / 60) + ' minutes'
    }
  }

  if (!mapLoaded) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading map...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Job Selection */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Route Visualization</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Job
            </label>
            <select
              value={selectedJob?.id || ''}
              onChange={(e) => {
                const job = jobs.find(j => j.id === e.target.value)
                if (job) onJobSelect(job)
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
        {routeData && getRouteInfo() && (
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
          </div>
        )}
      </div>

      {/* Map */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="relative">
          <div
            ref={mapRef}
            id="route-map"
            className="h-96 w-full"
            style={{ minHeight: '400px' }}
          />
          
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-2 text-gray-600">Loading route...</p>
              </div>
            </div>
          )}
          
          {!selectedJob && (
            <div className="absolute inset-0 bg-gray-50 bg-opacity-90 flex items-center justify-center">
              <div className="text-center">
                <MapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a job to view its route</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}