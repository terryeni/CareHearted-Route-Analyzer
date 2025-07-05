import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

export function formatDistance(meters: number) {
  if (meters < 1000) {
    return `${meters}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

export function generateJobId() {
  const prefix = 'JOB'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export function validatePostcode(postcode: string): boolean {
  const postcodeRegex = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i
  return postcodeRegex.test(postcode.trim())
}

export function normalizePostcode(postcode: string): string {
  return postcode.trim().toUpperCase().replace(/\s+/g, ' ')
}