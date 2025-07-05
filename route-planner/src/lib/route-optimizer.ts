import { Loader } from '@googlemaps/js-api-loader'

export interface RoutePoint {
  postcode: string
  address?: string
  lat?: number
  lng?: number
  notes?: string
}

export interface OptimizedRoute {
  order: string[]
  totalDistance: number
  totalTime: number
  waypoints: RoutePoint[]
  routeData: google.maps.DirectionsResult
}

export interface TimeEstimate {
  travelTime: number
  jobTime: number
  totalTime: number
}

// Job time estimates in minutes
export const JOB_TIME_ESTIMATES = {
  delivery_only: 15,
  install_stand: 60,
  display_backdrop: 45,
  shelving: 30
}

export class RouteOptimizer {
  private googleMaps: typeof google | null = null
  private directionsService: google.maps.DirectionsService | null = null
  private distanceMatrixService: google.maps.DistanceMatrixService | null = null
  private geocoder: google.maps.Geocoder | null = null

  constructor() {
    this.initializeGoogleMaps()
  }

  private async initializeGoogleMaps() {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ['places', 'geometry']
    })

    this.googleMaps = await loader.load()
    this.directionsService = new this.googleMaps.maps.DirectionsService()
    this.distanceMatrixService = new this.googleMaps.maps.DistanceMatrixService()
    this.geocoder = new this.googleMaps.maps.Geocoder()
  }

  async geocodePostcodes(postcodes: string[]): Promise<RoutePoint[]> {
    if (!this.geocoder) {
      throw new Error('Geocoder not initialized')
    }
    
    const results: RoutePoint[] = []
    
    for (const postcode of postcodes) {
      try {
        const response = await this.geocoder.geocode({
          address: postcode + ', UK'
        })
        
        if (response.results && response.results.length > 0) {
          const location = response.results[0].geometry.location
          results.push({
            postcode,
            address: response.results[0].formatted_address,
            lat: location.lat(),
            lng: location.lng()
          })
        } else {
          results.push({ postcode }) // Keep postcode even if geocoding fails
        }
      } catch (error) {
        console.error(`Failed to geocode ${postcode}:`, error)
        results.push({ postcode }) // Keep postcode even if geocoding fails
      }
    }
    
    return results
  }

  async optimizeRoute(
    origin: string,
    postcodes: string[],
    jobType: string
  ): Promise<OptimizedRoute> {
    await this.initializeGoogleMaps()
    
    if (!this.directionsService || !this.googleMaps) {
      throw new Error('Google Maps services not initialized')
    }
    
    // First, geocode all postcodes
    const waypoints = await this.geocodePostcodes(postcodes)
    const validWaypoints = waypoints.filter(wp => wp.lat && wp.lng)
    
    if (validWaypoints.length === 0) {
      throw new Error('No valid postcodes found')
    }

    // Use Google's route optimization
    const request = {
      origin,
      destination: origin, // Return to origin
      waypoints: validWaypoints.map(wp => ({
        location: new this.googleMaps!.maps.LatLng(wp.lat!, wp.lng!),
        stopover: true
      })),
      optimizeWaypoints: true,
      travelMode: this.googleMaps!.maps.TravelMode.DRIVING,
      unitSystem: this.googleMaps!.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false
    }

    return new Promise((resolve, reject) => {
      this.directionsService!.route(request, (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
        if (status === 'OK' && result) {
          const route = result.routes[0]
          const waypointOrder = result.routes[0].waypoint_order
          
          // Calculate total distance and time
          let totalDistance = 0
          let totalTime = 0
          
          route.legs.forEach((leg) => {
            if (leg.distance && leg.duration) {
              totalDistance += leg.distance.value
              totalTime += leg.duration.value
            }
          })

          // Add job time estimates
          const jobTimePerStop = JOB_TIME_ESTIMATES[jobType as keyof typeof JOB_TIME_ESTIMATES] || 30
          const totalJobTime = postcodes.length * jobTimePerStop * 60 // Convert to seconds

          const optimizedOrder = waypointOrder.map((index: number) => 
            validWaypoints[index].postcode
          )

          resolve({
            order: optimizedOrder,
            totalDistance,
            totalTime: totalTime + totalJobTime,
            waypoints: validWaypoints,
            routeData: result
          })
        } else {
          reject(new Error(`Route optimization failed: ${status}`))
        }
      })
    })
  }

  calculateTimeEstimate(
    jobType: string,
    numberOfStops: number,
    travelTimeMinutes: number
  ): TimeEstimate {
    const jobTimePerStop = JOB_TIME_ESTIMATES[jobType as keyof typeof JOB_TIME_ESTIMATES] || 30
    const totalJobTime = numberOfStops * jobTimePerStop
    
    return {
      travelTime: travelTimeMinutes,
      jobTime: totalJobTime,
      totalTime: travelTimeMinutes + totalJobTime
    }
  }

  calculateTeamRecommendation(
    jobType: string,
    numberOfStops: number,
    totalTimeHours: number
  ): { teamSize: number; estimatedDays: number; recommendation: string } {
    const maxWorkingHoursPerDay = 8
    const baseTeamSize = 1
    
    let teamSize = baseTeamSize
    let recommendation = 'Driver only'
    
    // Complex jobs need installers
    if (jobType !== 'delivery_only') {
      teamSize = 2
      recommendation = 'Installer + Assistant'
      
      // Very complex jobs or many stops
      if (numberOfStops > 20 || totalTimeHours > 12) {
        teamSize = 3
        recommendation = 'Team of 3 (Driver + 2 Installers)'
      }
    }
    
    // Calculate estimated days
    const totalWorkHours = totalTimeHours
    const estimatedDays = Math.ceil(totalWorkHours / (maxWorkingHoursPerDay * teamSize))
    
    return {
      teamSize,
      estimatedDays,
      recommendation
    }
  }
}

export const routeOptimizer = new RouteOptimizer()