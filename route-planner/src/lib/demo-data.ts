import { Job, Route, TeamAssignment } from './database.types'

// Demo user data
export const DEMO_USER = {
  id: 'demo-user-123',
  email: 'demo@routeplanner.com',
  user_metadata: {
    full_name: 'Demo User'
  }
}

// Demo jobs data
export const DEMO_JOBS: Job[] = [
  {
    id: 'job-1',
    job_id: 'JOB-2024-001',
    client_name: 'ACME Retail Store',
    job_type: 'shelving',
    postcodes: ['SW1A 1AA', 'W1K 6WC', 'E1 6AN', 'N1 9AG'],
    notes: 'Standard shelving installation. Customer prefers morning delivery. Parking available at rear.',
    preferred_date_start: '2024-01-15',
    preferred_date_end: '2024-01-17',
    vehicle_size: 'lwb',
    status: 'pending',
    created_by: 'demo-user-123',
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-10T09:00:00Z'
  },
  {
    id: 'job-2',
    job_id: 'JOB-2024-002',
    client_name: 'Fashion Forward Boutique',
    job_type: 'display_backdrop',
    postcodes: ['NW1 5LT', 'SW3 2DY', 'W2 1NY'],
    notes: 'High-end fashion backdrop installation. Requires careful handling. White gloves service.',
    preferred_date_start: '2024-01-20',
    preferred_date_end: '2024-01-22',
    vehicle_size: 'tail_lift',
    status: 'scheduled',
    created_by: 'demo-user-123',
    created_at: '2024-01-11T10:30:00Z',
    updated_at: '2024-01-12T14:20:00Z'
  },
  {
    id: 'job-3',
    job_id: 'JOB-2024-003',
    client_name: 'Quick Mart Express',
    job_type: 'delivery_only',
    postcodes: ['E2 8HD', 'SE1 2TH', 'SW8 2JU', 'W6 0NW', 'N4 3JP', 'E14 5AB'],
    notes: 'Express delivery service. Multiple stops required. Time-sensitive items.',
    preferred_date_start: '2024-01-12',
    preferred_date_end: '2024-01-12',
    vehicle_size: 'small_van',
    status: 'in_progress',
    created_by: 'demo-user-123',
    created_at: '2024-01-12T08:00:00Z',
    updated_at: '2024-01-12T09:15:00Z'
  },
  {
    id: 'job-4',
    job_id: 'JOB-2024-004',
    client_name: 'Tech Solutions Hub',
    job_type: 'install_stand',
    postcodes: ['EC1A 1BB', 'EC2A 3AY'],
    notes: 'Large display stand installation for tech conference. Requires specialist mounting equipment.',
    preferred_date_start: '2024-01-25',
    preferred_date_end: '2024-01-26',
    vehicle_size: 'tail_lift',
    status: 'completed',
    created_by: 'demo-user-123',
    created_at: '2024-01-08T16:45:00Z',
    updated_at: '2024-01-09T11:30:00Z'
  }
]

// Demo routes data
export const DEMO_ROUTES: Route[] = [
  {
    id: 'route-1',
    job_id: 'job-2',
    optimized_order: ['NW1 5LT', 'W2 1NY', 'SW3 2DY'],
    total_distance: 15420, // meters
    total_time: 8700, // seconds (2.4 hours)
    route_data: {
      routes: [{
        legs: [
          { distance: { value: 7200 }, duration: { value: 2100 } },
          { distance: { value: 4800 }, duration: { value: 1800 } },
          { distance: { value: 3420 }, duration: { value: 1200 } }
        ]
      }]
    },
    created_at: '2024-01-12T14:20:00Z',
    updated_at: '2024-01-12T14:20:00Z'
  }
]

// Demo team assignments
export const DEMO_TEAM_ASSIGNMENTS: TeamAssignment[] = [
  {
    id: 'assignment-1',
    job_id: 'job-2',
    assigned_to: ['installer-1', 'installer-2'],
    team_size: 2,
    estimated_days: 1,
    assignment_date: '2024-01-20',
    notes: 'Installer + Assistant - AI Risk Level: medium',
    created_at: '2024-01-12T14:20:00Z',
    updated_at: '2024-01-12T14:20:00Z'
  }
]

// Demo postcode coordinates for map display
export const DEMO_POSTCODE_COORDS: Record<string, { lat: number; lng: number }> = {
  'SW1A 1AA': { lat: 51.4994, lng: -0.1244 }, // Buckingham Palace
  'W1K 6WC': { lat: 51.5074, lng: -0.1278 }, // Oxford Street
  'E1 6AN': { lat: 51.5118, lng: -0.0755 }, // Tower Bridge area
  'N1 9AG': { lat: 51.5462, lng: -0.1058 }, // King's Cross
  'NW1 5LT': { lat: 51.5279, lng: -0.1293 }, // Regent's Park
  'SW3 2DY': { lat: 51.4940, lng: -0.1614 }, // Chelsea
  'W2 1NY': { lat: 51.5133, lng: -0.1814 }, // Paddington
  'E2 8HD': { lat: 51.5268, lng: -0.0531 }, // Bethnal Green
  'SE1 2TH': { lat: 51.5045, lng: -0.0865 }, // London Bridge
  'SW8 2JU': { lat: 51.4813, lng: -0.1302 }, // Vauxhall
  'W6 0NW': { lat: 51.4927, lng: -0.2339 }, // Hammersmith
  'N4 3JP': { lat: 51.5590, lng: -0.1018 }, // Finsbury Park
  'E14 5AB': { lat: 51.5045, lng: -0.0170 }, // Canary Wharf
  'EC1A 1BB': { lat: 51.5177, lng: -0.0968 }, // Barbican
  'EC2A 3AY': { lat: 51.5211, lng: -0.0824 }  // Shoreditch
}

// Demo AI analysis responses
export const DEMO_AI_RESPONSES = {
  risk_analysis: {
    riskLevel: 'medium' as const,
    flags: ['High-end materials require careful handling', 'Time-sensitive delivery window'],
    recommendations: ['Use experienced team', 'Bring protective equipment', 'Plan extra time for setup'],
    estimatedComplexity: 6,
    additionalRequirements: ['White gloves service', 'Specialist mounting tools']
  },
  job_summary: 'Fashion backdrop installation for Fashion Forward Boutique - 3 stops, 2 team members, 3 hours estimated'
}

// Check if we're in demo mode
export const isDemoMode = () => {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
}