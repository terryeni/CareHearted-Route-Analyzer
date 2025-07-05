import { createServerSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { routeOptimizer } from '@/lib/route-optimizer'
import { aiAnalyzer } from '@/lib/ai-analyzer'
import { InsertRoute, InsertTeamAssignment } from '@/lib/database.types'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    const { jobId, origin = 'London, UK' } = body

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    // Fetch job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

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