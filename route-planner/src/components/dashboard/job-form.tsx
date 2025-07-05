'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/toaster'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Job } from '@/lib/database.types'
import { validatePostcode, normalizePostcode } from '@/lib/utils'
import { 
  PlusIcon, 
  XMarkIcon
} from '@heroicons/react/24/outline'

interface JobFormProps {
  onJobCreated: (job: Job) => void
  userId: string
}

export function JobForm({ onJobCreated, userId }: JobFormProps) {
  const [formData, setFormData] = useState({
    client_name: '',
    job_type: 'delivery_only' as const,
    postcodes: [''],
    vehicle_size: 'small_van' as const,
    notes: '',
    preferred_date_start: '',
    preferred_date_end: ''
  })
  const [loading, setLoading] = useState(false)
  const [postcodeErrors, setPostcodeErrors] = useState<string[]>([])

  const { error } = useToast()

  const jobTypes = [
    { value: 'delivery_only', label: 'Delivery Only' },
    { value: 'install_stand', label: 'Install Stand' },
    { value: 'display_backdrop', label: 'Display Backdrop' },
    { value: 'shelving', label: 'Shelving' }
  ]

  const vehicleSizes = [
    { value: 'small_van', label: 'Small Van' },
    { value: 'lwb', label: 'LWB Van' },
    { value: 'tail_lift', label: 'Tail Lift' }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePostcodeChange = (index: number, value: string) => {
    const newPostcodes = [...formData.postcodes]
    newPostcodes[index] = value
    setFormData(prev => ({
      ...prev,
      postcodes: newPostcodes
    }))

    // Validate postcode
    const newErrors = [...postcodeErrors]
    if (value && !validatePostcode(value)) {
      newErrors[index] = 'Invalid postcode format'
    } else {
      newErrors[index] = ''
    }
    setPostcodeErrors(newErrors)
  }

  const addPostcode = () => {
    setFormData(prev => ({
      ...prev,
      postcodes: [...prev.postcodes, '']
    }))
    setPostcodeErrors([...postcodeErrors, ''])
  }

  const removePostcode = (index: number) => {
    if (formData.postcodes.length > 1) {
      setFormData(prev => ({
        ...prev,
        postcodes: prev.postcodes.filter((_, i) => i !== index)
      }))
      setPostcodeErrors(postcodeErrors.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate all postcodes
      const validatedPostcodes = formData.postcodes
        .filter(pc => pc.trim())
        .map(pc => normalizePostcode(pc))

      if (validatedPostcodes.length === 0) {
        error('Validation Error', 'Please add at least one postcode')
        return
      }

      // Check for validation errors
      const hasErrors = postcodeErrors.some(err => err !== '')
      if (hasErrors) {
        error('Validation Error', 'Please fix postcode errors before submitting')
        return
      }

      const jobData = {
        ...formData,
        postcodes: validatedPostcodes,
        created_by: userId
      }

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create job')
      }

      const newJob = await response.json()
      onJobCreated(newJob)

      // Reset form
      setFormData({
        client_name: '',
        job_type: 'delivery_only',
        postcodes: [''],
        vehicle_size: 'small_van',
        notes: '',
        preferred_date_start: '',
        preferred_date_end: ''
      })
      setPostcodeErrors([''])

    } catch (err) {
      error('Failed to create job', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Create New Job</h2>
        <p className="text-sm text-gray-600 mt-1">
          Fill in the details to create a new delivery or installation job
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Name
            </label>
            <input
              type="text"
              value={formData.client_name}
              onChange={(e) => handleInputChange('client_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter client name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Type
            </label>
            <select
              value={formData.job_type}
              onChange={(e) => handleInputChange('job_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {jobTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Size
            </label>
            <select
              value={formData.vehicle_size}
              onChange={(e) => handleInputChange('vehicle_size', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {vehicleSizes.map(size => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Postcodes
          </label>
          <div className="space-y-2">
            {formData.postcodes.map((postcode, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={postcode}
                  onChange={(e) => handlePostcodeChange(index, e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    postcodeErrors[index] ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter postcode (e.g., SW1A 1AA)"
                />
                {formData.postcodes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePostcode(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
            {postcodeErrors.some(err => err) && (
              <p className="text-sm text-red-600 mt-1">
                {postcodeErrors.find(err => err)}
              </p>
            )}
            <button
              type="button"
              onClick={addPostcode}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add another postcode</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Start Date
            </label>
            <input
              type="date"
              value={formData.preferred_date_start}
              onChange={(e) => handleInputChange('preferred_date_start', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred End Date
            </label>
            <input
              type="date"
              value={formData.preferred_date_end}
              onChange={(e) => handleInputChange('preferred_date_end', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter any special instructions or notes..."
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              setFormData({
                client_name: '',
                job_type: 'delivery_only',
                postcodes: [''],
                vehicle_size: 'small_van',
                notes: '',
                preferred_date_start: '',
                preferred_date_end: ''
              })
              setPostcodeErrors([''])
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Reset
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                <span>Create Job</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}