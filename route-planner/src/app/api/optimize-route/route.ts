import { createServerSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { routeOptimizer } from '@/lib/route-optimizer'
import { aiAnalyzer } from '@/lib/ai-analyzer'
import { InsertRoute, InsertTeamAssignment } from '@/lib/database.types'
import { isDemoMode, DEMO_JOBS, DEMO_AI_RESPONSES } from '@/lib/demo-data'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId, origin = 'London, UK' } = body

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    let job
    if (isDemoMode()) {
      // Find job in demo data
      job = DEMO_JOBS.find(j => j.id === jobId)
      if (!job) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        )
      }
    } else {
      // Fetch job from database
      const supabase = createServerSupabaseClient()
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single()

      if (jobError || !jobData) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        )
      }
      job = jobData
    }

    if (isDemoMode()) {
      // Demo mode - return mock optimized route
      const mockOptimizedRoute = {
        order: job.postcodes,
        totalDistance: 15420,
        totalTime: 8700,
        waypoints: job.postcodes.map((pc: string) => ({ postcode: pc })),
        routeData: {
          routes: [{
            legs: job.postcodes.map(() => ({ 
              distance: { value: 5000 }, 
              duration: { value: 1800 } 
            }))
          }]
        }
      }

      const mockTeamRecommendation = {
        teamSize: job.job_type === 'delivery_only' ? 1 : 2,
        estimatedDays: 1,
        recommendation: job.job_type === 'delivery_only' ? 'Driver only' : 'Installer + Assistant'
      }

      return NextResponse.json({
        route: {
          id: `demo-route-${Date.now()}`,
          job_id: jobId,
          optimized_order: mockOptimizedRoute.order,
          total_distance: mockOptimizedRoute.totalDistance,
          total_time: mockOptimizedRoute.totalTime,
          route_data: mockOptimizedRoute.routeData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        teamAssignment: {
          id: `demo-assignment-${Date.now()}`,
          job_id: jobId,
          assigned_to: [],
          team_size: mockTeamRecommendation.teamSize,
          estimated_days: mockTeamRecommendation.estimatedDays,
          assignment_date: job.preferred_date_start || new Date().toISOString().split('T')[0],
          notes: mockTeamRecommendation.recommendation,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        teamRecommendation: mockTeamRecommendation,
        aiAnalysis: DEMO_AI_RESPONSES.risk_analysis,
        optimizedRoute: mockOptimizedRoute
      })
    }

    // Real mode - use actual services
    const supabase = createServerSupabaseClient()

    // Optimize the route
    const optimizedRoute = await routeOptimizer.optimizeRoute(
      origin,
      job.postcodes,
      job.job_type
    )

    // Get team recommendation
    const totalTimeHours = optimizedRoute.totalTime / 3600
    const teamRecommendation = routeOptimizer.calculateTeamRecommendation(
      job.job_type,
      job.postcodes.length,
      totalTimeHours
    )

    // Analyze job notes with AI if available
    let aiAnalysis = null
    if (job.notes) {
      try {
        aiAnalysis = await aiAnalyzer.analyzeJobNotes(
          job.job_type,
          job.notes,
          job.postcodes
        )
      } catch (error) {
        console.error('AI analysis failed:', error)
      }
    }

    // Save route to database
    const routeData: InsertRoute = {
      job_id: jobId,
      optimized_order: optimizedRoute.order,
      total_distance: optimizedRoute.totalDistance,
      total_time: optimizedRoute.totalTime,
      route_data: JSON.parse(JSON.stringify(optimizedRoute.routeData))
    }

    const { data: savedRoute, error: routeError } = await supabase
      .from('routes')
      .insert(routeData)
      .select()
      .single()

    if (routeError) {
      return NextResponse.json(
        { error: 'Failed to save route' },
        { status: 500 }
      )
    }

    // Create team assignment
    const assignmentDate = job.preferred_date_start || new Date().toISOString()
    const teamAssignmentData: InsertTeamAssignment = {
      job_id: jobId,
      assigned_to: [], // Will be populated when assigning specific team members
      team_size: teamRecommendation.teamSize,
      estimated_days: teamRecommendation.estimatedDays,
      assignment_date: assignmentDate,
      notes: `${teamRecommendation.recommendation}${aiAnalysis ? ` - AI Risk Level: ${aiAnalysis.riskLevel}` : ''}`
    }

    const { data: savedAssignment, error: assignmentError } = await supabase
      .from('team_assignments')
      .insert(teamAssignmentData)
      .select()
      .single()

    if (assignmentError) {
      console.error('Failed to save team assignment:', assignmentError)
    }

    // Update job status
    await supabase
      .from('jobs')
      .update({ status: 'scheduled' })
      .eq('id', jobId)

    return NextResponse.json({
      route: savedRoute,
      teamAssignment: savedAssignment,
      teamRecommendation,
      aiAnalysis,
      optimizedRoute
    })
  } catch (error) {
    console.error('Error optimizing route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    const { data: route, error } = await supabase
      .from('routes')
      .select(`
        *,
        jobs(*),
        team_assignments(*)
      `)
      .eq('job_id', jobId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(route)
  } catch (error) {
    console.error('Error fetching route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}