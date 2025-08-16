'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { PremiumPagination } from '@/components/ui/premium-pagination'
import {
  FiPlus,
  FiX,
  FiEdit2,
  FiEye,
  FiTrash2,
  FiPercent,
  FiCheck,
  FiXCircle,
  FiChevronsLeft,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsRight,
  FiArrowLeft,
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiTag,
  FiEdit,
} from 'react-icons/fi'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface TaxRate {
  id: string
  name: string
  rate: string | number
  country: string
  state: string | null
  zipCode: string | null
  isActive: boolean
  priority: number
  createdAt: string
  updatedAt: string
}

interface TaxRateFormData {
  name: string
  rate: string
  country: string
  state: string
  zipCode: string
  isActive: boolean
  priority: string
}

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  rate: TaxRate | null
  onUpdate: (data: Partial<TaxRate>) => Promise<void>
  isUpdating: boolean
}

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
] 

const EditModal = ({ isOpen, onClose, rate, onUpdate, isUpdating }: EditModalProps) => {
  const [formData, setFormData] = useState<TaxRateFormData>({
    name: '',
    rate: '',
    country: '',
    state: '',
    zipCode: '',
    isActive: true,
    priority: '0',
  })

  useEffect(() => {
    if (rate) {
      setFormData({
        name: rate.name,
        rate: rate.rate.toString(),
        country: rate.country,
        state: rate.state || '',
        zipCode: rate.zipCode || '',
        isActive: rate.isActive,
        priority: rate.priority.toString(),
      })
    }
  }, [rate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'isActive' ? value === 'true' : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rate) {
      await onUpdate({
        name: formData.name,
        rate: Number(formData.rate),
        country: formData.country,
        state: formData.state || null,
        zipCode: formData.zipCode || null,
        isActive: formData.isActive,
        priority: Number(formData.priority),
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-0 p-0 [&>button]:hidden'>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-2xl">
            <DialogHeader className='flex-shrink-0 p-8 pb-6'>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                  <FiEdit2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className='text-2xl font-bold text-gray-900 dark:text-white'>
                    Edit Tax Rate
                  </DialogTitle>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">Update tax rate information</p>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className='px-8 pb-8 space-y-6 overflow-y-auto max-h-[70vh]'>
              {/* Basic Information Section */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
                  <h4 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
                    <FiTag className="h-4 w-4 text-[#00437f]" />
                    Basic Information
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3'>
                        Name <span className='text-red-500'>*</span>
                      </label>
                      <Input
                        name='name'
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder='Enter rate name'
                        className='h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-[#00437f]/20 rounded-xl transition-all duration-200'
                        required
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3'>
                        Rate (%) <span className='text-red-500'>*</span>
                      </label>
                      <Input
                        name='rate'
                        type='number'
                        step='0.01'
                        min='0'
                        value={formData.rate}
                        onChange={handleInputChange}
                        placeholder='Enter rate'
                        className='h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-[#00437f]/20 rounded-xl transition-all duration-200'
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Information Section */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
                  <h4 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
                    <FiTag className="h-4 w-4 text-[#00437f]" />
                    Location Information
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3'>
                        Country <span className='text-red-500'>*</span>
                      </label>
                      <select
                        name='country'
                        value={formData.country}
                        onChange={handleInputChange}
                        className='w-full h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-[#00437f]/20 rounded-xl px-3 transition-all duration-200'
                        required
                      >
                        <option value="">Please select a country</option>
                        <option value="USA">USA</option>
                      </select>
                    </div>

                    <div>
                      <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3'>
                        State
                      </label>
                      <select
                        name='state'
                        value={formData.state}
                        onChange={handleInputChange}
                        className='w-full h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-[#00437f]/20 rounded-xl px-3 transition-all duration-200'
                        disabled={formData.country !== 'USA'}
                      >
                        <option value="">Please select a state</option>
                        {US_STATES.map((state) => (
                          <option key={state.value} value={state.value}>
                            {state.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3'>
                        ZIP Code
                      </label>
                      <Input
                        name='zipCode'
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder='Enter ZIP code'
                        className='h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-[#00437f]/20 rounded-xl transition-all duration-200'
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings Section */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
                  <h4 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
                    <FiTag className="h-4 w-4 text-[#00437f]" />
                    Settings
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3'>
                        Priority
                      </label>
                      <Input
                        name='priority'
                        type='number'
                        min='0'
                        value={formData.priority}
                        onChange={handleInputChange}
                        placeholder='Enter priority'
                        className='h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-[#00437f]/20 rounded-xl transition-all duration-200'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3'>
                        Status
                      </label>
                      <select
                        name='isActive'
                        value={formData.isActive ? 'true' : 'false'}
                        onChange={handleInputChange}
                        className='w-full h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-[#00437f]/20 rounded-xl px-3 transition-all duration-200'
                      >
                        <option value='true'>Active</option>
                        <option value='false'>Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
                  <div className='flex justify-end gap-4'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={onClose}
                      className='h-12 px-8 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-200'
                    >
                      Cancel
                    </Button>
                    <Button
                      type='submit'
                      disabled={isUpdating}
                      className='h-12 px-8 bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white shadow-md hover:shadow-lg rounded-xl transition-all duration-200 transform hover:scale-105'
                    >
                      {isUpdating ? (
                        <div className='flex items-center gap-2'>
                          <div className='w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin'></div>
                          <span>Updating...</span>
                        </div>
                      ) : (
                        'Update Rate'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 

export default function TaxPage() {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [selectedRate, setSelectedRate] = useState<TaxRate | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [rates, setRates] = useState<TaxRate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  
  // Premium state variables
  const [isViewLoading, setIsViewLoading] = useState(false)
  const [isEditLoading, setIsEditLoading] = useState(false)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [rateToDelete, setRateToDelete] = useState<TaxRate | null>(null)
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [countryFilter, setCountryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const [formData, setFormData] = useState<TaxRateFormData>({
    name: '',
    rate: '',
    country: '',
    state: '',
    zipCode: '',
    isActive: true,
    priority: '0',
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  useEffect(() => {
    fetchRates()
  }, [])

  const fetchRates = async () => {
    try {
      const response = await fetch('/api/admin/tax')
      if (!response.ok) throw new Error('Failed to fetch tax rates')
      const data = await response.json()
      setRates(data)
    } catch (error) {
      console.error('Error fetching tax rates:', error)
      toast.error('Failed to fetch tax rates')
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      errors.name = 'Name is required'
    }

    if (!formData.rate?.trim()) {
      errors.rate = 'Rate is required'
    } else if (isNaN(Number(formData.rate)) || Number(formData.rate) < 0) {
      errors.rate = 'Rate must be a positive number'
    }

    if (!formData.country?.trim()) {
      errors.country = 'Country is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAdd = async () => {
    if (validateForm()) {
      try {
        setIsAdding(true)
        const response = await fetch('/api/admin/tax', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            rate: Number(formData.rate),
            priority: Number(formData.priority),
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to create tax rate')
        }

        const newRate = await response.json()
        setRates(prev => [newRate, ...prev])
        setShowForm(false)
        setFormData({
          name: '',
          rate: '',
          country: '',
          state: '',
          zipCode: '',
          isActive: true,
          priority: '0',
        })
        setFormErrors({})
        toast.success('Tax rate created successfully')
      } catch (error) {
        console.error('Error creating tax rate:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to create tax rate')
      } finally {
        setIsAdding(false)
      }
    }
  }

  const handleView = async (rate: TaxRate) => {
    setIsViewLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setIsViewLoading(false)
    setSelectedRate(rate)
    setShowViewModal(true)
  }

  const handleEdit = async (rate: TaxRate) => {
    setIsEditLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setIsEditLoading(false)
    setSelectedRate(rate)
    setShowEditModal(true)
  }

  const handleUpdate = async (formData: Partial<TaxRate>) => {
    if (!selectedRate) return

    try {
      setIsUpdating(true)
      const response = await fetch(`/api/admin/tax/${selectedRate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update tax rate')
      }

      const updatedRate = await response.json()
      setRates(prev => prev.map(rate => rate.id === selectedRate.id ? updatedRate : rate))
      setShowEditModal(false)
      setSelectedRate(null)
      toast.success('Tax rate updated successfully')
    } catch (error) {
      console.error('Error updating tax rate:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update tax rate')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (id: string) => {
    const rate = rates.find(r => r.id === id)
    if (!rate) return
    
    setIsDeleteLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setRateToDelete(rate)
    setShowDeleteModal(true)
    setIsDeleteLoading(false)
  }

  const confirmDelete = async () => {
    if (!rateToDelete) return

    try {
      setIsDeleting(rateToDelete.id)
      const response = await fetch(`/api/admin/tax/${rateToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete tax rate')
      }

      setRates(prev => prev.filter(rate => rate.id !== rateToDelete.id))
      setShowDeleteModal(false)
      setRateToDelete(null)
      toast.success('Tax rate deleted successfully')
    } catch (error) {
      console.error('Error deleting tax rate:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete tax rate')
    } finally {
      setIsDeleting(null)
    }
  }

  // Filter and search logic
  const hasActiveFilters = searchQuery || countryFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all'
  
  const clearFilters = () => {
    setSearchQuery('')
    setCountryFilter('all')
    setStatusFilter('all')
    setPriorityFilter('all')
    setSortBy('newest')
  }

  const filteredAndSortedRates = rates
    .filter(rate => {
      const matchesSearch = rate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           rate.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           rate.rate.toString().includes(searchQuery)
      const matchesCountry = countryFilter === 'all' || rate.country === countryFilter
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && rate.isActive) ||
                           (statusFilter === 'inactive' && !rate.isActive)
      const matchesPriority = priorityFilter === 'all' || 
                             (priorityFilter === 'high' && rate.priority >= 8) ||
                             (priorityFilter === 'medium' && rate.priority >= 4 && rate.priority < 8) ||
                             (priorityFilter === 'low' && rate.priority < 4)
      return matchesSearch && matchesCountry && matchesStatus && matchesPriority
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'name':
          return a.name.localeCompare(b.name)
        case 'rate':
          return Number(b.rate) - Number(a.rate)
        case 'priority':
          return b.priority - a.priority
        default:
          return 0
      }
    })

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedRates.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredAndSortedRates.slice(startIndex, endIndex)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const ViewModal = () => (
    <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-0 p-0 [&>button]:hidden'>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-2xl">
            <DialogHeader className='flex-shrink-0 p-8 pb-6'>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                  <FiPercent className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className='text-2xl font-bold text-gray-900 dark:text-white'>
                    Tax Rate Details
                  </DialogTitle>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">View complete tax information</p>
                </div>
              </div>
            </DialogHeader>
            
            {selectedRate && (
              <div className='px-8 pb-8 space-y-8 overflow-y-auto max-h-[70vh]'>
                {/* Rate Header */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
                    <div className='flex items-center justify-between'>
                      <div className="space-y-2">
                        <h3 className='text-xl font-bold text-gray-900 dark:text-white'>
                          {selectedRate.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            <FiCalendar className="h-4 w-4" />
                            <span>
                              {selectedRate.createdAt
                                ? new Date(selectedRate.createdAt).toLocaleDateString()
                                : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiClock className="h-4 w-4" />
                            <span>
                              {selectedRate.createdAt
                                ? new Date(selectedRate.createdAt).toLocaleTimeString()
                                : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-4'>
                        <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold shadow-lg border transition-all duration-300 ${
                          selectedRate.isActive
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200'
                            : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            selectedRate.isActive ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          {selectedRate.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rate Details */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
                    <div className='grid grid-cols-2 gap-6'>
                      <div className="space-y-4">
                        <div>
                          <h4 className='text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2'>
                            <FiPercent className="h-4 w-4 text-[#00437f]" />
                            Tax Rate
                          </h4>
                          <p className='text-2xl font-bold text-[#00437f]'>
                            {Number(selectedRate.rate).toFixed(2)}%
                          </p>
                        </div>
                        <div>
                          <h4 className='text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2'>
                            <FiTag className="h-4 w-4 text-[#00437f]" />
                            Priority
                          </h4>
                          <p className='text-lg font-semibold text-gray-900 dark:text-white'>
                            {selectedRate.priority}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className='text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2'>
                            <FiTag className="h-4 w-4 text-[#00437f]" />
                            Rate ID
                          </h4>
                          <p className='text-sm font-mono text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg'>
                            {selectedRate.id}
                          </p>
                        </div>
                        <div>
                          <h4 className='text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2'>
                            <FiCalendar className="h-4 w-4 text-[#00437f]" />
                            Last Updated
                          </h4>
                          <p className='text-sm text-gray-600 dark:text-gray-300'>
                            {selectedRate.updatedAt
                              ? new Date(selectedRate.updatedAt).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Details */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
                    <h4 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
                      <FiTag className="h-4 w-4 text-[#00437f]" />
                      Location Details
                    </h4>
                    <div className='grid grid-cols-2 gap-6'>
                      <div>
                        <h5 className='text-sm font-semibold text-gray-900 dark:text-white mb-2'>Country</h5>
                        <p className='text-gray-600 dark:text-gray-300'>{selectedRate.country}</p>
                      </div>
                      <div>
                        <h5 className='text-sm font-semibold text-gray-900 dark:text-white mb-2'>State</h5>
                        <p className='text-gray-600 dark:text-gray-300'>{selectedRate.state || 'N/A'}</p>
                      </div>
                      <div>
                        <h5 className='text-sm font-semibold text-gray-900 dark:text-white mb-2'>ZIP Code</h5>
                        <p className='text-gray-600 dark:text-gray-300'>{selectedRate.zipCode || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  const LoadingOverlay = ({ isVisible, message }: { isVisible: boolean; message: string }) => (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md mx-4"
          >
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-[#00437f]/20 border-t-[#00437f] rounded-full animate-spin mx-auto"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[#00437f]/40 rounded-full animate-spin mx-auto" style={{ animationDelay: '-0.5s' }}></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Premium Experience</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  const DeleteModal = () => (
    <AnimatePresence>
      {showDeleteModal && rateToDelete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md"
          >
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiTrash2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Tax Rate</h3>
                <p className="text-gray-600 dark:text-gray-300">Are you sure you want to delete this tax rate? This action cannot be undone.</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Name:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{rateToDelete.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Rate:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{Number(rateToDelete.rate).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Country:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{rateToDelete.country}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setRateToDelete(null)
                  }}
                  className="flex-1 h-12 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  disabled={isDeleting === rateToDelete.id}
                  className="flex-1 h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {isDeleting === rateToDelete.id ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    'Delete Rate'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <div className='max-w-7xl mx-auto p-6 space-y-6'>
        {/* Premium Header */}
        <div className='relative'>
          <div className='absolute inset-0 bg-gradient-to-r from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl'></div>
          <div className='relative flex items-center justify-between bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg'>
            <div className='space-y-2'>
              <div className='flex items-center gap-3'>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => router.back()} 
                  className="h-8 w-8 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200"
                >
                  <FiArrowLeft className="h-4 w-4" />
                </Button>
                <div className='w-10 h-10 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-lg flex items-center justify-center shadow-md'>
                  <FiPercent className='w-5 h-5 text-white' />
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900 dark:text-white tracking-tight'>
                    Tax Rates
                  </h1>
                  <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>
                    {filteredAndSortedRates.length} of {rates.length} tax rates
                  </p>
                </div>
              </div>
            </div>
            <Button 
              size="sm"
              className="bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              onClick={() => setShowForm(true)}
            >
              <FiPlus className="mr-2 h-4 w-4" />
              Add Tax Rate
            </Button>
          </div>
        </div>

        {/* Premium Search & Filters */}
        <div className='space-y-4'>
          {/* Main Search Bar */}
          <div className='relative group'>
            <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
            <Card className='relative p-4 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl transition-all duration-300'>
              <div className='flex items-center gap-3'>
                <div className='relative flex-grow'>
                  <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00437f]' />
                  <Input
                    type="text"
                    placeholder="Search by name, country, rate..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-10 h-10 text-sm border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 rounded-lg focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-300'
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className='flex items-center gap-2 h-10 px-4 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200 rounded-lg'
                >
                  <FiFilter className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs bg-[#00437f] text-white">
                      {[searchQuery, countryFilter, statusFilter, priorityFilter, sortBy].filter(f => f !== 'all' && f !== 'newest' && f !== '').length}
                    </Badge>
                  )}
                </Button>
                <div className='flex items-center gap-2'>
                  <Button
                    variant="outline"
                    size="sm"
                    className='h-10 w-10 p-0 rounded-lg border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200'
                  >
                    <FiList className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className='relative group'>
              <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
              <Card className='relative p-6 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl transition-all duration-300'>
                <div className='space-y-6'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-xl font-bold text-gray-900 dark:text-white'>Advanced Filters</h3>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className='text-gray-500 hover:text-[#00437f] hover:bg-[#00437f]/10 transition-all duration-200 rounded-lg'
                      >
                        <FiX className="h-4 w-4 mr-2" />
                        Clear All
                      </Button>
                    )}
                  </div>
                  
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                    {/* Sort By */}
                    <div className='space-y-2'>
                      <label className='text-sm font-semibold text-gray-900 dark:text-white'>Sort By</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className='w-full h-10 px-3 text-sm border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 rounded-lg focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-300'
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="name">Name A-Z</option>
                        <option value="rate">Rate High-Low</option>
                        <option value="priority">Priority High-Low</option>
                      </select>
                    </div>

                    {/* Country Filter */}
                    <div className='space-y-2'>
                      <label className='text-sm font-semibold text-gray-900 dark:text-white'>Country</label>
                      <select
                        value={countryFilter}
                        onChange={(e) => setCountryFilter(e.target.value)}
                        className='w-full h-10 px-3 text-sm border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 rounded-lg focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-300'
                      >
                        <option value="all">All Countries</option>
                        {Array.from(new Set(rates.map(rate => rate.country))).map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div className='space-y-2'>
                      <label className='text-sm font-semibold text-gray-900 dark:text-white'>Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className='w-full h-10 px-3 text-sm border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 rounded-lg focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-300'
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    {/* Priority Filter */}
                    <div className='space-y-2'>
                      <label className='text-sm font-semibold text-gray-900 dark:text-white'>Priority</label>
                      <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className='w-full h-10 px-3 text-sm border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 rounded-lg focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-300'
                      >
                        <option value="all">All Priorities</option>
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                      </select>
                    </div>
                  </div>

                  {/* Active Filters Display */}
                  {hasActiveFilters && (
                    <div className='flex flex-wrap gap-2 pt-4 border-t border-[#00437f]/20 dark:border-[#00437f]/30'>
                      {searchQuery && (
                        <Badge className="flex items-center gap-2 bg-[#00437f] text-white px-3 py-1 rounded-lg text-xs">
                          Search: "{searchQuery}"
                          <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-red-200 transition-colors">
                            <FiX className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {countryFilter !== 'all' && (
                        <Badge className="flex items-center gap-2 bg-[#00437f] text-white px-3 py-1 rounded-lg text-xs">
                          Country: {countryFilter}
                          <button onClick={() => setCountryFilter('all')} className="ml-1 hover:text-red-200 transition-colors">
                            <FiX className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {statusFilter !== 'all' && (
                        <Badge className="flex items-center gap-2 bg-[#00437f] text-white px-3 py-1 rounded-lg text-xs">
                          Status: {statusFilter}
                          <button onClick={() => setStatusFilter('all')} className="ml-1 hover:text-red-200 transition-colors">
                            <FiX className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {sortBy !== 'newest' && (
                        <Badge className="flex items-center gap-2 bg-[#00437f] text-white px-3 py-1 rounded-lg text-xs">
                          Sort: {sortBy}
                          <button onClick={() => setSortBy('newest')} className="ml-1 hover:text-red-200 transition-colors">
                            <FiX className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {priorityFilter !== 'all' && (
                        <Badge className="flex items-center gap-2 bg-[#00437f] text-white px-3 py-1 rounded-lg text-xs">
                          Priority: {priorityFilter}
                          <button onClick={() => setPriorityFilter('all')} className="ml-1 hover:text-red-200 transition-colors">
                            <FiX className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Add Rate Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className='relative group'>
                <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
                <Card className='relative p-8 border border-white/20 dark:border-gray-700/50 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-2xl transition-all duration-300'>
                  <div className='flex items-center justify-between mb-6'>
                    <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
                      Add New Tax Rate
                    </h2>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => setShowForm(false)}
                      className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    >
                      <FiX className='h-5 w-5' />
                    </Button>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        Name <span className='text-red-500'>*</span>
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder='Enter rate name'
                        className={`h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500 ${
                          formErrors.name ? 'border-red-500' : ''
                        }`}
                      />
                      {formErrors.name && (
                        <p className='mt-1 text-sm text-red-500'>
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        Rate (%) <span className='text-red-500'>*</span>
                      </label>
                      <Input
                        type='number'
                        step='0.01'
                        min='0'
                        value={formData.rate}
                        onChange={(e) =>
                          setFormData({ ...formData, rate: e.target.value })
                        }
                        placeholder='Enter rate'
                        className={`h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500 ${
                          formErrors.rate ? 'border-red-500' : ''
                        }`}
                      />
                      {formErrors.rate && (
                        <p className='mt-1 text-sm text-red-500'>
                          {formErrors.rate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        Country <span className='text-red-500'>*</span>
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value, state: '' })
                        }
                        className={`w-full h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500 rounded-md px-3 ${
                          formErrors.country ? 'border-red-500' : ''
                        }`}
                      >
                        <option value="">Please select a country</option>
                        <option value="USA">USA</option>
                      </select>
                      {formErrors.country && (
                        <p className='mt-1 text-sm text-red-500'>
                          {formErrors.country}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        State
                      </label>
                      <select
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                        className='w-full h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500 rounded-md px-3'
                        disabled={formData.country !== 'USA'}
                      >
                        <option value="">Please select a state</option>
                        {US_STATES.map((state) => (
                          <option key={state.value} value={state.value}>
                            {state.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        ZIP Code
                      </label>
                      <Input
                        value={formData.zipCode}
                        onChange={(e) =>
                          setFormData({ ...formData, zipCode: e.target.value })
                        }
                        placeholder='Enter ZIP code'
                        className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        Priority
                      </label>
                      <Input
                        type='number'
                        min='0'
                        value={formData.priority}
                        onChange={(e) =>
                          setFormData({ ...formData, priority: e.target.value })
                        }
                        placeholder='Enter priority'
                        className='h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        Status
                      </label>
                      <select
                        value={formData.isActive ? 'true' : 'false'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isActive: e.target.value === 'true',
                          })
                        }
                        className='w-full h-12 bg-gray-50 dark:bg-gray-700/50 border-2 focus:border-blue-500 rounded-md px-3'
                      >
                        <option value='true'>Active</option>
                        <option value='false'>Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className='flex justify-end gap-4 mt-8'>
                    <Button
                      variant='outline'
                      onClick={() => setShowForm(false)}
                      className='h-12 px-8 border-gray-200 dark:border-gray-700'
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAdd}
                      disabled={isAdding}
                      className='h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                    >
                      {isAdding ? (
                        <div className='flex items-center gap-2'>
                          <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                          <span>Adding...</span>
                        </div>
                      ) : (
                        'Add Rate'
                      )}
                    </Button>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Premium Rates Table */}
        <div className='space-y-4'>
          {isLoading ? (
            <div className='relative group'>
              <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl'></div>
              <Card className='relative p-8 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl text-center'>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00437f] mx-auto"></div>
                <p className="mt-3 text-base font-semibold text-gray-900 dark:text-white">Loading tax rates...</p>
              </Card>
            </div>
          ) : currentItems.length === 0 ? (
            <div className='relative group'>
              <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl'></div>
              <Card className='relative p-8 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl text-center'>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">No tax rates found</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  {hasActiveFilters ? 'Try adjusting your filters.' : 'Try adjusting your search query.'}
                </p>
              </Card>
            </div>
          ) : (
            <div className='space-y-3'>
              {currentItems.map((rate) => (
                <div key={rate.id} className='relative group'>
                  <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
                  <Card className='relative p-6 border border-white/20 dark:border-gray-700/50 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]'>
                    <div className='flex items-center gap-6'>
                      {/* Icon */}
                      <div className='flex-shrink-0'>
                        <div className='w-16 h-16 rounded-xl bg-gradient-to-br from-[#00437f]/5 to-[#00437f]/10 border-2 border-[#00437f]/20 flex items-center justify-center text-[#00437f]'>
                          <FiPercent className="h-8 w-8" />
                        </div>
                      </div>

                      {/* Rate Info */}
                      <div className='flex-grow grid grid-cols-5 gap-6 items-center'>
                        <div className='col-span-2'>
                          <p className='font-bold text-gray-900 dark:text-white text-lg'>{rate.name}</p>
                          <p className='text-sm text-gray-600 dark:text-gray-300'>{rate.country} • {rate.state || 'N/A'}</p>
                        </div>
                        <div>
                          <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>Rate</p>
                          <p className='font-bold text-[#00437f] text-lg'>{Number(rate.rate).toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>Priority</p>
                          <p className='font-semibold text-gray-900 dark:text-white text-sm'>{rate.priority}</p>
                        </div>
                        <div>
                          <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>Status</p>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              rate.isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {rate.isActive ? (
                              <FiCheck className='mr-1.5 h-4 w-4' />
                            ) : (
                              <FiXCircle className='mr-1.5 h-4 w-4' />
                            )}
                            {rate.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className='flex-shrink-0'>
                        <div className='flex items-center justify-end gap-2'>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(rate)}
                            disabled={isViewLoading}
                            className='h-10 w-10 p-0 text-[#00437f] hover:text-[#003366] hover:bg-[#00437f]/10 transition-all duration-200 rounded-xl'
                          >
                            {isViewLoading ? (
                              <div className="w-5 h-5 border-2 border-[#00437f]/20 border-t-[#00437f] rounded-full animate-spin"></div>
                            ) : (
                              <FiEye className="h-5 w-5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(rate)}
                            disabled={isEditLoading}
                            className='h-10 w-10 p-0 text-[#00437f] hover:text-[#003366] hover:bg-[#00437f]/10 transition-all duration-200 rounded-xl'
                          >
                            {isEditLoading ? (
                              <div className="w-5 h-5 border-2 border-[#00437f]/20 border-t-[#00437f] rounded-full animate-spin"></div>
                            ) : (
                              <FiEdit2 className="h-5 w-5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(rate.id)}
                            disabled={isDeleteLoading}
                            className='h-10 w-10 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 transition-all duration-200 rounded-xl'
                          >
                            {isDeleteLoading ? (
                              <div className="w-5 h-5 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                            ) : (
                              <FiTrash2 className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Premium Pagination */}
        {!isLoading && rates.length > 0 && (
          <PremiumPagination 
            totalPages={totalPages}
            currentPage={currentPage}
            totalItems={filteredAndSortedRates.length}
            itemsPerPage={itemsPerPage}
            onPageChange={paginate}
          />
        )}
      </div>

      {/* View Modal */}
      <AnimatePresence>{showViewModal && <ViewModal />}</AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <EditModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false)
              setSelectedRate(null)
            }}
            rate={selectedRate}
            onUpdate={handleUpdate}
            isUpdating={isUpdating}
          />
        )}
      </AnimatePresence>

      {/* Premium Loading Overlays */}
      <LoadingOverlay isVisible={isViewLoading} message="Loading Tax Rate Details..." />
      <LoadingOverlay isVisible={isEditLoading} message="Loading Edit Form..." />
      <LoadingOverlay isVisible={isDeleteLoading} message="Preparing Delete..." />

      {/* Delete Confirmation Modal */}
      <DeleteModal />
    </div>
  )
} 