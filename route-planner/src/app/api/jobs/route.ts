import { createServerSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { InsertJob, UpdateJob } from '@/lib/database.types'
import { generateJobId, validatePostcode, normalizePostcode } from '@/lib/utils'
import { isDemoMode, DEMO_JOBS } from '@/lib/demo-data'

export async function GET(request: NextRequest) {
  try {
    if (isDemoMode()) {
      // Return demo data in demo mode
      const { searchParams } = new URL(request.url)
      const status = searchParams.get('status')
      
      let filteredJobs = DEMO_JOBS
      if (status) {
        filteredJobs = DEMO_JOBS.filter(job => job.status === status)
      }
      
      return NextResponse.json(filteredJobs)
    }
    
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = searchParams.get('limit')
    const page = searchParams.get('page')

    let query = supabase
      .from('jobs')
      .select(`
        *,
        routes(*),
        team_assignments(*)
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (limit) {
      const limitNum = parseInt(limit)
      const pageNum = parseInt(page || '1')
      const offset = (pageNum - 1) * limitNum
      query = query.range(offset, offset + limitNum - 1)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const {
      client_name,
      job_type,
      postcodes,
      vehicle_size,
      notes,
      preferred_date_start,
      preferred_date_end,
      created_by
    } = body

    if (!client_name || !job_type || !postcodes || !vehicle_size) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate postcodes
    const validatedPostcodes = postcodes.map((postcode: string) => {
      const normalized = normalizePostcode(postcode)
      if (!validatePostcode(normalized)) {
        throw new Error(`Invalid postcode: ${postcode}`)
      }
      return normalized
    })

    // Generate job ID
    const jobId = generateJobId()

    const jobData: InsertJob = {
      job_id: jobId,
      client_name,
      job_type,
      postcodes: validatedPostcodes,
      vehicle_size,
      notes,
      preferred_date_start,
      preferred_date_end,
      created_by: created_by || 'demo-user-123',
      status: 'pending'
    }

    if (isDemoMode()) {
      // In demo mode, simulate successful creation
      const newJob = {
        id: `demo-job-${Date.now()}`,
        ...jobData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return NextResponse.json(newJob, { status: 201 })
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('jobs')
      .insert(jobData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    // Validate postcodes if they're being updated
    if (updateData.postcodes) {
      updateData.postcodes = updateData.postcodes.map((postcode: string) => {
        const normalized = normalizePostcode(postcode)
        if (!validatePostcode(normalized)) {
          throw new Error(`Invalid postcode: ${postcode}`)
        }
        return normalized
      })
    }

    const jobUpdateData: UpdateJob = {
      ...updateData,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('jobs')
      .update(jobUpdateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Job deleted successfully' })
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}