'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPlus,
  FiX,
  FiEdit2,
  FiEye,
  FiTrash2,
  FiTruck,
  FiCheck,
  FiXCircle,
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

interface ShippingMethod {
  id: string
  name: string
  description: string | null
  price: string | number
  estimatedDays: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ShippingMethodFormData {
  name: string
  description: string
  price: string
  estimatedDays: string
  isActive: boolean
}

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  method: ShippingMethod | null
  onUpdate: (data: Partial<ShippingMethod>) => Promise<void>
  isUpdating: boolean
}

const EditModal = ({ isOpen, onClose, method, onUpdate, isUpdating }: EditModalProps) => {
  const [formData, setFormData] = useState<Partial<ShippingMethod>>({
    name: '',
    description: '',
    price: 0,
    estimatedDays: 0,
    isActive: true,
  })

  useEffect(() => {
    if (method) {
      setFormData({
        name: method.name,
        description: method.description || '',
        price: method.price,
        estimatedDays: method.estimatedDays,
        isActive: method.isActive,
      })
    }
  }, [method])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className='bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl border border-white/20 dark:border-gray-700/50'
      >
        <div className='p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
              Edit Shipping Method
            </h2>
            <Button
              variant='ghost'
              size='icon'
              onClick={onClose}
              className='text-gray-500 hover:text-[#00437f] hover:bg-[#00437f]/10 transition-all duration-200 rounded-lg'
            >
              <FiX className='h-5 w-5' />
            </Button>
          </div>

          <div className='grid grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-semibold text-gray-900 dark:text-white mb-2'>
                Name <span className='text-red-500'>*</span>
              </label>
              <Input
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                placeholder='Enter name'
                className='h-12 bg-white/50 dark:bg-gray-700/50 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-lg transition-all duration-300'
              />
            </div>

            <div>
              <label className='block text-sm font-semibold text-gray-900 dark:text-white mb-2'>
                Price <span className='text-red-500'>*</span>
              </label>
              <Input
                name="price"
                type='number'
                step='0.01'
                min='0'
                value={formData.price || ''}
                onChange={handleInputChange}
                placeholder='Enter price'
                className='h-12 bg-white/50 dark:bg-gray-700/50 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-lg transition-all duration-300'
              />
            </div>

            <div>
              <label className='block text-sm font-semibold text-gray-900 dark:text-white mb-2'>
                Estimated Days <span className='text-red-500'>*</span>
              </label>
              <Input
                name="estimatedDays"
                type='number'
                min='1'
                value={formData.estimatedDays || ''}
                onChange={handleInputChange}
                placeholder='Enter estimated days'
                className='h-12 bg-white/50 dark:bg-gray-700/50 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-lg transition-all duration-300'
              />
            </div>

            <div>
              <label className='block text-sm font-semibold text-gray-900 dark:text-white mb-2'>
                Status
              </label>
              <select
                name="isActive"
                value={formData.isActive ? 'true' : 'false'}
                onChange={handleInputChange}
                className='w-full h-12 bg-white/50 dark:bg-gray-700/50 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-lg px-3 transition-all duration-300'
              >
                <option value='true'>Active</option>
                <option value='false'>Inactive</option>
              </select>
            </div>

            <div className='col-span-2'>
              <label className='block text-sm font-semibold text-gray-900 dark:text-white mb-2'>
                Description
              </label>
              <Input
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                placeholder='Enter description'
                className='h-12 bg-white/50 dark:bg-gray-700/50 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-lg transition-all duration-300'
              />
            </div>
          </div>

          <div className='flex justify-end gap-4 mt-8'>
            <Button
              variant='outline'
              onClick={onClose}
              className='h-12 px-8 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200 rounded-lg'
            >
              Cancel
            </Button>
            <Button
              onClick={() => onUpdate(formData)}
              disabled={isUpdating}
              className='h-12 px-8 bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 rounded-lg'
            >
              {isUpdating ? (
                <div className='flex items-center gap-2'>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                  <span>Updating...</span>
                </div>
              ) : (
                'Update Method'
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
} 

export default function ShippingPage() {
  const [showForm, setShowForm] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<ShippingMethod | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [methods, setMethods] = useState<ShippingMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isViewLoading, setIsViewLoading] = useState(false)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [methodToDelete, setMethodToDelete] = useState<ShippingMethod | null>(null)

  const [formData, setFormData] = useState<ShippingMethodFormData>({
    name: '',
    description: '',
    price: '',
    estimatedDays: '',
    isActive: true,
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
  // Filtering and sorting state
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  
  const router = useRouter()

  useEffect(() => {
    fetchMethods()
  }, [])

  const fetchMethods = async () => {
    try {
      const response = await fetch('/api/admin/shipping')
      if (!response.ok) throw new Error('Failed to fetch shipping methods')
      const data = await response.json()
      setMethods(data)
    } catch (error) {
      console.error('Error fetching shipping methods:', error)
      toast.error('Failed to fetch shipping methods')
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      errors.name = 'Name is required'
    }

    if (!formData.price?.trim()) {
      errors.price = 'Price is required'
    } else if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      errors.price = 'Price must be a positive number'
    }

    if (!formData.estimatedDays?.trim()) {
      errors.estimatedDays = 'Estimated days is required'
    } else if (isNaN(Number(formData.estimatedDays)) || Number(formData.estimatedDays) < 1) {
      errors.estimatedDays = 'Estimated days must be at least 1'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAdd = async () => {
    if (validateForm()) {
      try {
        setIsAdding(true)
        const response = await fetch('/api/admin/shipping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            price: Number(formData.price),
            estimatedDays: Number(formData.estimatedDays),
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to create shipping method')
        }

        const newMethod = await response.json()
        setMethods([...methods, newMethod])
        setShowForm(false)
        setFormData({
          name: '',
          description: '',
          price: '',
          estimatedDays: '',
          isActive: true,
        })
        setFormErrors({})
        toast.success('Shipping method created successfully')
      } catch (error) {
        console.error('Error creating shipping method:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to create shipping method')
      } finally {
        setIsAdding(false)
      }
    }
  }

  const handleView = async (method: ShippingMethod) => {
    setIsViewLoading(true)
    setSelectedMethod(method)
    
    // Simulate loading time for premium experience
    await new Promise(resolve => setTimeout(resolve, 800))
    
    setShowViewModal(true)
    setIsViewLoading(false)
  }

  const handleEdit = (method: ShippingMethod) => {
    setSelectedMethod(method)
    setShowEditModal(true)
  }

  const handleUpdate = async (formData: Partial<ShippingMethod>) => {
    if (selectedMethod && formData.name) {
      try {
        setIsUpdating(true)
        if (!formData.price || !formData.estimatedDays) {
          toast.error('Please fill in all required fields')
          return
        }

        const response = await fetch('/api/admin/shipping', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedMethod.id, ...formData }),
        })

        if (!response.ok) throw new Error('Failed to update shipping method')

        const updatedMethod = await response.json()
        setMethods(methods.map((method) => (method.id === selectedMethod.id ? updatedMethod : method)))
        setShowEditModal(false)
        setSelectedMethod(null)
        toast.success('Shipping method updated successfully')
      } catch (error) {
        console.error('Error updating shipping method:', error)
        toast.error('Failed to update shipping method')
      } finally {
        setIsUpdating(false)
      }
    }
  }

  const handleDelete = async (id: string) => {
    const method = methods.find(m => m.id === id)
    if (!method) return

    setIsDeleteLoading(true)
    setMethodToDelete(method)
    
    // Simulate loading time for premium experience
    await new Promise(resolve => setTimeout(resolve, 800))
    
    setShowDeleteModal(true)
    setIsDeleteLoading(false)
  }

  const confirmDelete = async () => {
    if (!methodToDelete) return

    try {
      setIsDeleting(methodToDelete.id)
      const response = await fetch(`/api/admin/shipping?id=${methodToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete shipping method')

      setMethods(methods.filter((method) => method.id !== methodToDelete.id))
      setShowDeleteModal(false)
      setMethodToDelete(null)
      toast.success('Shipping method deleted successfully')
    } catch (error) {
      console.error('Error deleting shipping method:', error)
      toast.error('Failed to delete shipping method')
    } finally {
      setIsDeleting(null)
    }
  }

  // Apply filters and sorting
  const filteredAndSortedMethods = methods
    .filter(method => {
      const trimmedSearchQuery = searchQuery.trim().toLowerCase();
      const matchesSearch = method.name.toLowerCase().includes(trimmedSearchQuery) ||
                           method.description?.toLowerCase().includes(trimmedSearchQuery) ||
                           method.id.toLowerCase().includes(trimmedSearchQuery)
      
      let matchesStatus = true
      if (statusFilter === 'active') matchesStatus = method.isActive
      else if (statusFilter === 'inactive') matchesStatus = !method.isActive
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'price-asc':
          return Number(a.price) - Number(b.price)
        case 'price-desc':
          return Number(b.price) - Number(a.price)
        case 'days-asc':
          return a.estimatedDays - b.estimatedDays
        case 'days-desc':
          return b.estimatedDays - a.estimatedDays
        case 'oldest':
          const dateA = new Date(a.createdAt).getTime()
          const dateB = new Date(b.createdAt).getTime()
          return dateA - dateB
        case 'newest':
        default:
          const dateA2 = new Date(a.createdAt).getTime()
          const dateB2 = new Date(b.createdAt).getTime()
          return dateB2 - dateA2
      }
    })

  const totalPages = Math.ceil(filteredAndSortedMethods.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = filteredAndSortedMethods.slice(startIndex, startIndex + itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setSortBy('newest')
    setCurrentPage(1)
  }

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || sortBy !== 'newest'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  const ViewModal = () => (
    <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-0 p-0 [&>button]:hidden'>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-2xl">
            <DialogHeader className='flex-shrink-0 p-8 pb-6'>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                  <FiTruck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className='text-2xl font-bold text-gray-900 dark:text-white'>
                    Shipping Method Details
                  </DialogTitle>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">View complete shipping information</p>
                </div>
              </div>
            </DialogHeader>
            
            {selectedMethod && (
              <div className='px-8 pb-8 space-y-8 overflow-y-auto max-h-[70vh]'>
                {/* Method Header */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
                    <div className='flex items-center justify-between'>
                      <div className="space-y-2">
                        <h3 className='text-xl font-bold text-gray-900 dark:text-white'>
                          {selectedMethod.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            <FiCalendar className="h-4 w-4" />
                            <span>
                              {selectedMethod.createdAt
                                ? new Date(selectedMethod.createdAt).toLocaleDateString()
                                : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiClock className="h-4 w-4" />
                            <span>
                              {selectedMethod.createdAt
                                ? new Date(selectedMethod.createdAt).toLocaleTimeString()
                                : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-4'>
                        <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold shadow-lg border transition-all duration-300 ${
                          selectedMethod.isActive
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200'
                            : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            selectedMethod.isActive ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          {selectedMethod.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Method Details */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
                    <div className='grid grid-cols-2 gap-6'>
                      <div className="space-y-4">
                        <div>
                          <h4 className='text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2'>
                            <FiDollarSign className="h-4 w-4 text-[#00437f]" />
                            Price
                          </h4>
                          <p className='text-2xl font-bold text-[#00437f]'>
                            ${Number(selectedMethod.price).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <h4 className='text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2'>
                            <FiTruck className="h-4 w-4 text-[#00437f]" />
                            Delivery Time
                          </h4>
                          <p className='text-lg font-semibold text-gray-900 dark:text-white'>
                            {selectedMethod.estimatedDays} days
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className='text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2'>
                            <FiTag className="h-4 w-4 text-[#00437f]" />
                            Method ID
                          </h4>
                          <p className='text-sm font-mono text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg'>
                            {selectedMethod.id}
                          </p>
                        </div>
                        <div>
                          <h4 className='text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2'>
                            <FiCalendar className="h-4 w-4 text-[#00437f]" />
                            Last Updated
                          </h4>
                          <p className='text-sm text-gray-600 dark:text-gray-300'>
                            {selectedMethod.updatedAt
                              ? new Date(selectedMethod.updatedAt).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {selectedMethod.description && (
                      <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                        <div className="flex items-center gap-2 mb-2">
                          <FiEdit className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">Description</span>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">{selectedMethod.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
                  <FiTruck className='w-5 h-5 text-white' />
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900 dark:text-white tracking-tight'>
                    Shipping Methods
                  </h1>
                  <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>
                    {filteredAndSortedMethods.length} of {methods.length} methods
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
              Add Method
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
                    placeholder="Search by name, description..."
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
                      {[searchQuery, statusFilter, sortBy].filter(f => f !== 'all' && f !== 'newest' && f !== '').length}
                    </Badge>
                  )}
                </Button>
                <div className='flex items-center gap-2'>
                   <Button
                     variant="outline"
                     size="sm"
                     className='h-10 w-10 p-0 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200 rounded-lg'
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
                  
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {/* Sort By */}
                    <div className='space-y-2'>
                      <label className='text-sm font-semibold text-gray-900 dark:text-white'>Sort By</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className='h-10 bg-white/50 dark:bg-gray-700/50 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-lg transition-all duration-300'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                          <SelectItem value="name-asc">Name A-Z</SelectItem>
                          <SelectItem value="name-desc">Name Z-A</SelectItem>
                          <SelectItem value="price-asc">Price Low to High</SelectItem>
                          <SelectItem value="price-desc">Price High to Low</SelectItem>
                          <SelectItem value="days-asc">Days Low to High</SelectItem>
                          <SelectItem value="days-desc">Days High to Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status Filter */}
                    <div className='space-y-2'>
                      <label className='text-sm font-semibold text-gray-900 dark:text-white'>Status</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className='h-10 bg-white/50 dark:bg-gray-700/50 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-lg transition-all duration-300'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
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
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Methods Display */}
        <div className='space-y-4'>
          {isLoading ? (
            <div className='relative group'>
              <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl'></div>
              <Card className='relative p-8 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl text-center'>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00437f] mx-auto"></div>
                <p className="mt-3 text-base font-semibold text-gray-900 dark:text-white">Loading shipping methods...</p>
              </Card>
            </div>
          ) : currentItems.length === 0 ? (
            <div className='relative group'>
              <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl'></div>
              <Card className='relative p-8 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl text-center'>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">No shipping methods found</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  {hasActiveFilters ? 'Try adjusting your filters.' : 'Try adding a new shipping method.'}
                </p>
              </Card>
            </div>
          ) : (
            <div className='space-y-4'>
              {currentItems.map((method) => (
                <div key={method.id} className='relative group'>
                  <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
                  <Card className='relative p-6 border border-white/20 dark:border-gray-700/50 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1'>
                    <div className='flex items-center gap-6'>
                      {/* Icon */}
                      <div className='flex-shrink-0'>
                        <div className='w-16 h-16 bg-gradient-to-br from-[#00437f]/10 to-[#00437f]/20 rounded-xl flex items-center justify-center border-2 border-[#00437f]/20 group-hover:border-[#00437f]/40 transition-all duration-300'>
                          <FiTruck className="h-8 w-8 text-[#00437f] group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      </div>

                      {/* Method Info */}
                      <div className='flex-grow grid grid-cols-5 gap-6 items-center'>
                        <div className='col-span-2'>
                          <p className='font-bold text-gray-900 dark:text-white text-lg group-hover:text-[#00437f] transition-colors duration-300'>{method.name}</p>
                          <p className='text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300'>{method.description || 'No description'}</p>
                        </div>
                        <div>
                          <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>Price</p>
                          <p className='font-bold text-[#00437f] text-lg group-hover:text-[#003366] transition-colors duration-300'>${Number(method.price).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>Delivery Time</p>
                          <p className='font-semibold text-gray-900 dark:text-white text-sm group-hover:text-[#00437f] transition-colors duration-300'>
                            {method.estimatedDays} days
                          </p>
                        </div>
                        <div>
                          <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>Status</p>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                            method.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 group-hover:bg-green-200 dark:group-hover:bg-green-900/50'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 group-hover:bg-red-200 dark:group-hover:bg-red-900/50'
                          }`}>
                            {method.isActive ? (
                              <FiCheck className='mr-1.5 h-4 w-4' />
                            ) : (
                              <FiXCircle className='mr-1.5 h-4 w-4' />
                            )}
                            {method.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className='flex-shrink-0'>
                        <div className='flex items-center justify-end gap-2'>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(method)}
                            disabled={isViewLoading}
                            className='h-10 w-10 p-0 text-[#00437f] hover:text-[#003366] hover:bg-[#00437f]/10 transition-all duration-200 rounded-xl hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed'
                          >
                            {isViewLoading ? (
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#00437f]/30 border-t-[#00437f]"></div>
                            ) : (
                              <FiEye className="h-5 w-5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(method)}
                            className='h-10 w-10 p-0 text-[#00437f] hover:text-[#003366] hover:bg-[#00437f]/10 transition-all duration-200 rounded-xl hover:scale-110'
                          >
                            <FiEdit2 className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(method.id)}
                            disabled={isDeleting === method.id || isDeleteLoading}
                            className='h-10 w-10 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 transition-all duration-200 rounded-xl hover:scale-110'
                          >
                            {isDeleting === method.id || isDeleteLoading ? (
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-500/30 border-t-red-500"></div>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex justify-center items-center gap-2'>
            <Button
              variant='outline'
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className='h-10 px-4 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200 rounded-lg'
            >
              Previous
            </Button>
            <span className='text-gray-700 dark:text-gray-300 text-sm font-medium'>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant='outline'
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className='h-10 px-4 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200 rounded-lg'
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Add Method Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className='bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl border border-white/20 dark:border-gray-700/50'
            >
              <div className='p-6'>
                <div className='flex items-center justify-between mb-6'>
                  <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                    Add New Shipping Method
                  </h2>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setShowForm(false)}
                    className='text-gray-500 hover:text-[#00437f] hover:bg-[#00437f]/10 transition-all duration-200 rounded-lg'
                  >
                    <FiX className='h-5 w-5' />
                  </Button>
                </div>

                <div className='grid grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-semibold text-gray-900 dark:text-white mb-2'>
                      Name <span className='text-red-500'>*</span>
                    </label>
                    <Input
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      placeholder='Enter name'
                      className='h-12 bg-white/50 dark:bg-gray-700/50 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-lg transition-all duration-300'
                    />
                    {formErrors.name && <p className='text-red-500 text-xs mt-1'>{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-900 dark:text-white mb-2'>
                      Price <span className='text-red-500'>*</span>
                    </label>
                    <Input
                      name="price"
                      type='number'
                      step='0.01'
                      min='0'
                      value={formData.price || ''}
                      onChange={handleInputChange}
                      placeholder='Enter price'
                      className='h-12 bg-white/50 dark:bg-gray-700/50 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-lg transition-all duration-300'
                    />
                    {formErrors.price && <p className='text-red-500 text-xs mt-1'>{formErrors.price}</p>}
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-900 dark:text-white mb-2'>
                      Estimated Days <span className='text-red-500'>*</span>
                    </label>
                    <Input
                      name="estimatedDays"
                      type='number'
                      min='1'
                      value={formData.estimatedDays || ''}
                      onChange={handleInputChange}
                      placeholder='Enter estimated days'
                      className='h-12 bg-white/50 dark:bg-gray-700/50 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-lg transition-all duration-300'
                    />
                    {formErrors.estimatedDays && <p className='text-red-500 text-xs mt-1'>{formErrors.estimatedDays}</p>}
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-900 dark:text-white mb-2'>
                      Status
                    </label>
                    <select
                      name="isActive"
                      value={formData.isActive ? 'true' : 'false'}
                      onChange={handleInputChange}
                      className='w-full h-12 bg-white/50 dark:bg-gray-700/50 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-lg px-3 transition-all duration-300'
                    >
                      <option value='true'>Active</option>
                      <option value='false'>Inactive</option>
                    </select>
                  </div>

                  <div className='col-span-2'>
                    <label className='block text-sm font-semibold text-gray-900 dark:text-white mb-2'>
                      Description
                    </label>
                    <Input
                      name="description"
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      placeholder='Enter description'
                      className='h-12 bg-white/50 dark:bg-gray-700/50 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-lg transition-all duration-300'
                    />
                  </div>
                </div>

                <div className='flex justify-end gap-4 mt-8'>
                  <Button
                    variant='outline'
                    onClick={() => setShowForm(false)}
                    className='h-12 px-8 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200 rounded-lg'
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAdd}
                    disabled={isAdding}
                    className='h-12 px-8 bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 rounded-lg'
                  >
                    {isAdding ? (
                      <div className='flex items-center gap-2'>
                        <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                        <span>Adding...</span>
                      </div>
                    ) : (
                      'Add Method'
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Method Modal */}
      <AnimatePresence>
        {showEditModal && (
          <EditModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            method={selectedMethod}
            onUpdate={handleUpdate}
            isUpdating={isUpdating}
          />
        )}
      </AnimatePresence>

      {/* View Method Modal */}
      <AnimatePresence>
        {showViewModal && <ViewModal />}
      </AnimatePresence>

      {/* Premium Loading Overlay */}
      {isViewLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/20 via-transparent to-[#003366]/20 rounded-3xl blur-2xl"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-2xl">
              <div className="flex flex-col items-center gap-6">
                {/* Premium Spinner */}
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-600 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-[#00437f] rounded-full animate-spin"></div>
                  <div className="absolute top-2 left-2 w-12 h-12 border-4 border-transparent border-t-[#003366] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
                
                {/* Loading Text */}
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Loading Shipping Details</h3>
                  <p className="text-gray-600 dark:text-gray-300">Please wait while we fetch the complete shipping information...</p>
                </div>
                
                {/* Progress Dots */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#00437f] rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-[#00437f] rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                  <div className="w-2 h-2 bg-[#00437f] rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Loading Overlay */}
      {isDeleteLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-transparent to-red-600/20 rounded-3xl blur-2xl"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-2xl">
              <div className="flex flex-col items-center gap-6">
                {/* Premium Spinner */}
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-600 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-red-500 rounded-full animate-spin"></div>
                  <div className="absolute top-2 left-2 w-12 h-12 border-4 border-transparent border-t-red-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
                
                {/* Loading Text */}
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Preparing Delete Confirmation</h3>
                  <p className="text-gray-600 dark:text-gray-300">Please wait while we prepare the deletion confirmation...</p>
                </div>
                
                {/* Progress Dots */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && methodToDelete && (
          <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
            <DialogContent className='max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-slate-50 via-red-50/30 to-red-50/20 dark:from-gray-900 dark:via-red-900/20 dark:to-gray-900 border-0 p-0 [&>button]:hidden'>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-500/5 rounded-3xl blur-3xl"></div>
                <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-2xl">
                  <DialogHeader className='flex-shrink-0 p-8 pb-6'>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FiTrash2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <DialogTitle className='text-2xl font-bold text-gray-900 dark:text-white'>
                          Delete Shipping Method
                        </DialogTitle>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">Confirm deletion of this shipping method</p>
                      </div>
                    </div>
                  </DialogHeader>

                  <div className='flex-1 overflow-y-auto p-8 pt-0'>
                    <div className="space-y-6">
                      {/* Warning Message */}
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                        <div className="flex items-start gap-3">
                          <FiXCircle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Warning: This action cannot be undone</h4>
                            <p className="text-red-700 dark:text-red-300 text-sm">
                              Deleting this shipping method will permanently remove it from the system. 
                              All associated data will be lost and cannot be recovered.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Method Details */}
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Method to Delete:</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Name:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{methodToDelete.name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Price:</span>
                            <span className="font-medium text-gray-900 dark:text-white">${methodToDelete.price}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Delivery Time:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{methodToDelete.estimatedDays} days</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Status:</span>
                            <Badge 
                              variant={methodToDelete.isActive ? "default" : "secondary"}
                              className={`${methodToDelete.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
                            >
                              {methodToDelete.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          {methodToDelete.description && (
                            <div className="flex items-start justify-between">
                              <span className="text-gray-600 dark:text-gray-300">Description:</span>
                              <span className="font-medium text-gray-900 dark:text-white text-right max-w-xs">{methodToDelete.description}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='flex-shrink-0 p-8 pt-6 border-t border-gray-200 dark:border-gray-700'>
                    <div className='flex justify-end gap-4'>
                      <Button
                        variant='outline'
                        onClick={() => {
                          setShowDeleteModal(false)
                          setMethodToDelete(null)
                        }}
                        className='h-12 px-8 border-2 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-600/50 text-gray-700 dark:text-gray-300 transition-all duration-200 rounded-lg'
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={confirmDelete}
                        disabled={isDeleting === methodToDelete.id}
                        className='h-12 px-8 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 rounded-lg'
                      >
                        {isDeleting === methodToDelete.id ? (
                          <div className='flex items-center gap-2'>
                            <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                            <span>Deleting...</span>
                          </div>
                        ) : (
                          <div className='flex items-center gap-2'>
                            <FiTrash2 className="w-5 h-5" />
                            <span>Delete Method</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
} 