import Papa from 'papaparse'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Job, Route, TeamAssignment } from './database.types'
import { formatDate, formatTime, formatDistance } from './utils'

export interface JobScheduleData {
  job: Job
  route: Route | null
  teamAssignment: TeamAssignment | null
}

export class ExportUtils {
  static generateCSV(jobs: JobScheduleData[]): string {
    const data = jobs.map(({ job, route, teamAssignment }) => ({
      'Job ID': job.job_id,
      'Client Name': job.client_name,
      'Job Type': job.job_type,
      'Number of Stops': job.postcodes.length,
      'Postcodes': job.postcodes.join(', '),
      'Vehicle Size': job.vehicle_size,
      'Status': job.status,
      'Preferred Date Start': job.preferred_date_start ? formatDate(job.preferred_date_start) : 'N/A',
      'Preferred Date End': job.preferred_date_end ? formatDate(job.preferred_date_end) : 'N/A',
      'Total Distance': route ? formatDistance(route.total_distance) : 'N/A',
      'Total Time': route ? formatTime(Math.round(route.total_time / 60)) : 'N/A',
      'Optimized Route': route ? route.optimized_order.join(' → ') : 'N/A',
      'Team Size': teamAssignment ? teamAssignment.team_size : 'N/A',
      'Estimated Days': teamAssignment ? teamAssignment.estimated_days : 'N/A',
      'Assignment Date': teamAssignment ? formatDate(teamAssignment.assignment_date) : 'N/A',
      'Notes': job.notes || 'N/A',
      'Team Notes': teamAssignment?.notes || 'N/A',
      'Created Date': formatDate(job.created_at)
    }))

    return Papa.unparse(data)
  }

  static downloadCSV(jobs: JobScheduleData[], filename: string = 'job-schedule.csv') {
    const csv = this.generateCSV(jobs)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  static async generatePDF(
    jobs: JobScheduleData[],
    includeMap: boolean = true,
    mapElementId?: string
  ): Promise<jsPDF> {
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.width
    const pageHeight = pdf.internal.pageSize.height
    let yPosition = 20

    // Title
    pdf.setFontSize(20)
    pdf.text('Job Schedule Report', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 20

    // Summary
    pdf.setFontSize(12)
    pdf.text(`Total Jobs: ${jobs.length}`, 20, yPosition)
    yPosition += 10
    pdf.text(`Generated: ${formatDate(new Date())}`, 20, yPosition)
    yPosition += 20

    // Jobs details
    for (const { job, route, teamAssignment } of jobs) {
      // Check if we need a new page
      if (yPosition > pageHeight - 100) {
        pdf.addPage()
        yPosition = 20
      }

      // Job header
      pdf.setFontSize(14)
      pdf.text(`Job: ${job.job_id}`, 20, yPosition)
      yPosition += 10

      // Job details
      pdf.setFontSize(10)
      const details = [
        `Client: ${job.client_name}`,
        `Type: ${job.job_type}`,
        `Stops: ${job.postcodes.length}`,
        `Vehicle: ${job.vehicle_size}`,
        `Status: ${job.status}`,
        route ? `Distance: ${formatDistance(route.total_distance)}` : '',
        route ? `Time: ${formatTime(Math.round(route.total_time / 60))}` : '',
        teamAssignment ? `Team: ${teamAssignment.team_size} members` : '',
        teamAssignment ? `Days: ${teamAssignment.estimated_days}` : ''
      ].filter(Boolean)

      details.forEach(detail => {
        pdf.text(detail, 25, yPosition)
        yPosition += 5
      })

      // Route order
      if (route && route.optimized_order.length > 0) {
        yPosition += 5
        pdf.text('Route Order:', 25, yPosition)
        yPosition += 5
        
        const routeText = route.optimized_order.join(' → ')
        const splitRoute = pdf.splitTextToSize(routeText, pageWidth - 50)
        pdf.text(splitRoute, 30, yPosition)
        yPosition += splitRoute.length * 5
      }

      // Notes
      if (job.notes) {
        yPosition += 5
        pdf.text('Notes:', 25, yPosition)
        yPosition += 5
        const splitNotes = pdf.splitTextToSize(job.notes, pageWidth - 50)
        pdf.text(splitNotes, 30, yPosition)
        yPosition += splitNotes.length * 5
      }

      yPosition += 10
    }

    // Add map if requested
    if (includeMap && mapElementId) {
      const mapElement = document.getElementById(mapElementId)
      if (mapElement) {
        try {
          const canvas = await html2canvas(mapElement, {
            useCORS: true,
            scale: 0.5
          })
          
          const imgData = canvas.toDataURL('image/png')
          pdf.addPage()
          pdf.text('Route Map', pageWidth / 2, 20, { align: 'center' })
          
          const imgWidth = pageWidth - 40
          const imgHeight = (canvas.height * imgWidth) / canvas.width
          
          pdf.addImage(imgData, 'PNG', 20, 30, imgWidth, imgHeight)
        } catch (error) {
          console.error('Failed to capture map:', error)
        }
      }
    }

    return pdf
  }

  static async downloadPDF(
    jobs: JobScheduleData[],
    filename: string = 'job-schedule.pdf',
    includeMap: boolean = true,
    mapElementId?: string
  ) {
    const pdf = await this.generatePDF(jobs, includeMap, mapElementId)
    pdf.save(filename)
  }

  static generateRouteManifest(job: Job, route: Route): string {
    const manifest = [
      `Route Manifest - ${job.job_id}`,
      `Client: ${job.client_name}`,
      `Job Type: ${job.job_type}`,
      `Vehicle: ${job.vehicle_size}`,
      `Total Distance: ${formatDistance(route.total_distance)}`,
      `Total Time: ${formatTime(Math.round(route.total_time / 60))}`,
      '',
      'Route Order:',
      ...route.optimized_order.map((postcode, index) => `${index + 1}. ${postcode}`),
      '',
      'Notes:',
      job.notes || 'No additional notes'
    ]

    return manifest.join('\n')
  }

  static generateTeamBriefing(
    job: Job,
    route: Route | null,
    teamAssignment: TeamAssignment | null
  ): string {
    const briefing = [
      `Team Briefing - ${job.job_id}`,
      `Date: ${formatDate(new Date())}`,
      '',
      `Client: ${job.client_name}`,
      `Job Type: ${job.job_type}`,
      `Number of Stops: ${job.postcodes.length}`,
      `Vehicle Required: ${job.vehicle_size}`,
      '',
      'Team Details:',
      teamAssignment ? `Team Size: ${teamAssignment.team_size} members` : 'Team not assigned',
      teamAssignment ? `Estimated Days: ${teamAssignment.estimated_days}` : '',
      teamAssignment ? `Assignment Date: ${formatDate(teamAssignment.assignment_date)}` : '',
      '',
      route ? `Total Distance: ${formatDistance(route.total_distance)}` : '',
      route ? `Total Time: ${formatTime(Math.round(route.total_time / 60))}` : '',
      '',
      'Route Order:',
      ...(route ? route.optimized_order.map((postcode, index) => `${index + 1}. ${postcode}`) : ['Route not optimized']),
      '',
      'Special Instructions:',
      job.notes || 'No special instructions',
      teamAssignment?.notes || ''
    ].filter(Boolean)

    return briefing.join('\n')
  }
}

export const exportUtils = ExportUtils