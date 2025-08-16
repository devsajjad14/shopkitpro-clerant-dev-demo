'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FiArrowLeft, FiTrash2, FiSearch, FiRefreshCw, FiEdit2, FiEye, FiUser, FiDollarSign, FiShoppingBag, FiMail, FiX, FiSettings, FiCreditCard, FiTruck, FiLoader, FiChevronDown, FiFilter, FiGrid, FiList, FiPlus, FiTrendingUp, FiTrendingDown, FiBarChart2, FiCheck, FiAlertTriangle, FiCalendar, FiMapPin, FiPhone } from 'react-icons/fi'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PremiumPagination } from '@/components/ui/premium-pagination'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface User {
  id: string
  name: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  billingAddress: {
    street: string
    street2: string | null
    city: string
    state: string
    postalCode: string
    country: string
  } | null
  shippingAddress: {
    street: string
    street2: string | null
    city: string
    state: string
    postalCode: string
    country: string
  } | null
}



const CustomerDetailsContent = memo(({ user }: { user: User }) => {
  return (
    <div className='px-8 pb-8 space-y-8 overflow-y-auto max-h-[70vh]'>
      {/* Customer Header */}
      <div className="relative group cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transform hover:scale-[1.01] transition-all duration-300 group-hover:bg-white/90 dark:group-hover:bg-gray-800/90">
          <div className='flex items-center justify-between'>
            <div className="space-y-2">
              <h3 className='text-xl font-bold text-gray-900 dark:text-white'>
                Customer #{user.id ? user.id.slice(0, 8) : 'N/A'}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <FiUser className="h-4 w-4" />
                  <span>{user.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiMail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <Badge className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold shadow-lg border bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 group-hover:from-green-100 group-hover:to-emerald-100 group-hover:shadow-xl transition-all duration-300">
                <div className="w-2 h-2 rounded-full mr-2 bg-green-500 group-hover:bg-green-600 transition-all duration-300"></div>
                Active Customer
              </Badge>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  // Handle edit - this will be handled by parent component
                }}
                className="h-10 px-4 bg-gradient-to-r from-[#00437f] to-[#003366] text-white border-0 hover:from-[#003366] hover:to-[#002855] shadow-lg hover:shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105"
              >
                <FiEdit2 className='h-4 w-4 mr-2' />
                Edit Customer
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="relative group cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transform hover:scale-[1.01] transition-all duration-300 group-hover:bg-white/90 dark:group-hover:bg-gray-800/90">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
              <FiUser className="w-5 h-5 text-white group-hover:scale-110 transition-all duration-300" />
            </div>
                          <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#00437f] dark:group-hover:text-blue-400 transition-all duration-300">Customer Information</h4>
                <p className="text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-all duration-300">Personal and contact details</p>
              </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</span>
                <span className="text-sm text-gray-900 dark:text-white font-semibold">{user.name}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</span>
                <span className="text-sm text-gray-900 dark:text-white">{user.email}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</span>
                <span className="text-sm text-gray-900 dark:text-white">{user.phone || 'Not provided'}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Customer ID</span>
                <span className="text-sm text-gray-900 dark:text-white font-mono">{user.id}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</span>
                <span className="text-sm text-gray-900 dark:text-white">{user.firstName || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</span>
                <span className="text-sm text-gray-900 dark:text-white">{user.lastName || 'Not provided'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Addresses Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Billing Address */}
        <div className="relative group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transform hover:scale-[1.01] transition-all duration-300 group-hover:bg-white/90 dark:group-hover:bg-gray-800/90">
            <div className="flex items-center gap-4 mb-6">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
              <FiCreditCard className="w-5 h-5 text-white group-hover:scale-110 transition-all duration-300" />
            </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400 transition-all duration-300">Billing Address</h4>
                <p className="text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-all duration-300">Payment and billing information</p>
              </div>
            </div>
            
            {user.billingAddress ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <FiMapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">{user.billingAddress.street}</span>
                </div>
                {user.billingAddress.street2 && (
                  <div className="flex items-center gap-2 text-sm">
                    <FiMapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">{user.billingAddress.street2}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <FiMapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    {user.billingAddress.city}, {user.billingAddress.state} {user.billingAddress.postalCode}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FiMapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">{user.billingAddress.country}</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiCreditCard className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No billing address</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Customer hasn't provided billing information</p>
              </div>
            )}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="relative group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-500/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transform hover:scale-[1.01] transition-all duration-300 group-hover:bg-white/90 dark:group-hover:bg-gray-800/90">
            <div className="flex items-center gap-4 mb-6">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
              <FiTruck className="w-5 h-5 text-white group-hover:scale-110 transition-all duration-300" />
            </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-all duration-300">Shipping Address</h4>
                <p className="text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-all duration-300">Delivery and shipping information</p>
              </div>
            </div>
            
            {user.shippingAddress ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <FiMapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">{user.shippingAddress.street}</span>
                </div>
                {user.shippingAddress.street2 && (
                  <div className="flex items-center gap-2 text-sm">
                    <FiMapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">{user.shippingAddress.street2}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <FiMapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    {user.shippingAddress.city}, {user.shippingAddress.state} {user.shippingAddress.postalCode}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FiMapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">{user.shippingAddress.country}</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiTruck className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No shipping address</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Customer hasn't provided shipping information</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
CustomerDetailsContent.displayName = 'CustomerDetailsContent'

export default function CustomersPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isViewLoading, setIsViewLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
  // New state for sorting and filtering
  const [sortBy, setSortBy] = useState('newest')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showFilters, setShowFilters] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/customers${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`)
      if (!response.ok) throw new Error('Failed to fetch customers')
      const data = await response.json()
      setUsers(data.customers)
    } catch (error) {
      console.error('Error loading users:', error)
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadUsers()
  }

  const handleDeleteClick = (id: string) => {
    setCustomerToDelete(id)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return
    
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/customers?id=${customerToDelete}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete customer')
      
      toast({
        title: "Success",
        description: "Customer deleted successfully"
      })
      loadUsers()
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
      setCustomerToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
    setCustomerToDelete(null)
  }

  const handleViewUser = useCallback(async (user: User) => {
    setIsViewLoading(true)
    setIsViewDialogOpen(true)
    // Simulate loading time for modal preparation
    await new Promise(resolve => setTimeout(resolve, 800))
    setSelectedUser(user)
    setIsViewLoading(false)
  }, [])

  const handleEditUser = (user: User) => {
    router.push(`/admin/sales/customers/${user.id}/edit`)
  }

  // Filter and sort logic
  const filteredAndSortedUsers = users.filter((user) => {
    const searchMatch = searchQuery === '' || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const statusMatch = statusFilter === 'all' || 
      (statusFilter === 'with_addresses' && (user.billingAddress || user.shippingAddress)) ||
      (statusFilter === 'without_addresses' && !user.billingAddress && !user.shippingAddress)
    
    return searchMatch && statusMatch
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.id).getTime() - new Date(a.id).getTime()
      case 'oldest':
        return new Date(a.id).getTime() - new Date(b.id).getTime()
      case 'name-asc':
        return a.name.localeCompare(b.name)
      case 'name-desc':
        return b.name.localeCompare(a.name)
      case 'email-asc':
        return a.email.localeCompare(b.email)
      case 'email-desc':
        return b.email.localeCompare(a.email)
      default:
        return 0
    }
  })

  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredAndSortedUsers.slice(startIndex, endIndex)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const clearFilters = () => {
    setSearchQuery('')
    setSortBy('newest')
    setStatusFilter('all')
    setCurrentPage(1)
  }

  const hasActiveFilters = searchQuery !== '' || sortBy !== 'newest' || statusFilter !== 'all'

  // Calculate overview statistics
  const totalUsers = users.length
  const usersWithAddresses = users.filter(u => u.billingAddress || u.shippingAddress).length
  const usersWithoutAddresses = users.filter(u => !u.billingAddress && !u.shippingAddress).length
  const activeUsers = users.length // All users are considered active for now

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
                  <FiUser className='w-5 h-5 text-white' />
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900 dark:text-white tracking-tight'>
                    Customers
                  </h1>
                  <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>
                    {filteredAndSortedUsers.length} of {users.length} customers
                  </p>
                </div>
              </div>
            </div>
            <Button 
              size="sm"
              className="bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              onClick={() => router.push('/admin/sales/customers/add')}
            >
              <FiPlus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </div>
        </div>

                 {/* Premium Overview Cards */}
         <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
           {/* Total Customers */}
           <div className='relative group'>
             <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
             <div className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]'>
              <div className='flex items-center justify-between'>
                <div className='space-y-2'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>Total Customers</p>
                  <p className='text-3xl font-bold text-gray-900 dark:text-white'>{totalUsers}</p>
                  <div className='flex items-center gap-1 text-sm text-green-600 dark:text-green-400'>
                    <FiTrendingUp className='h-4 w-4' />
                    <span>Active</span>
                  </div>
                </div>
                <div className='w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg'>
                  <FiUser className='w-6 h-6 text-white' />
                </div>
              </div>
            </div>
          </div>

                     {/* Customers with Addresses */}
           <div className='relative group'>
             <div className='absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
             <div className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]'>
              <div className='flex items-center justify-between'>
                <div className='space-y-2'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>With Addresses</p>
                  <p className='text-3xl font-bold text-green-600 dark:text-green-400'>{usersWithAddresses}</p>
                  <div className='flex items-center gap-1 text-sm text-green-600 dark:text-green-400'>
                    <FiCheck className='h-4 w-4' />
                    <span>Complete</span>
                  </div>
                </div>
                <div className='w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg'>
                  <FiMail className='w-6 h-6 text-white' />
                </div>
              </div>
            </div>
          </div>

                     {/* Customers without Addresses */}
           <div className='relative group'>
             <div className='absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-500/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
             <div className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]'>
              <div className='flex items-center justify-between'>
                <div className='space-y-2'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>Without Addresses</p>
                  <p className='text-3xl font-bold text-amber-600 dark:text-amber-400'>{usersWithoutAddresses}</p>
                  <div className='flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400'>
                    <FiAlertTriangle className='h-4 w-4' />
                    <span>Incomplete</span>
                  </div>
                </div>
                <div className='w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg'>
                  <FiSettings className='w-6 h-6 text-white' />
                </div>
              </div>
            </div>
          </div>

                     {/* Active Customers */}
           <div className='relative group'>
             <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
             <div className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]'>
              <div className='flex items-center justify-between'>
                <div className='space-y-2'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>Active Customers</p>
                  <p className='text-3xl font-bold text-blue-600 dark:text-blue-400'>{activeUsers}</p>
                  <div className='flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400'>
                    <FiBarChart2 className='h-4 w-4' />
                    <span>Engaged</span>
                  </div>
                </div>
                <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg'>
                  <FiTrendingUp className='w-6 h-6 text-white' />
                </div>
              </div>
            </div>
          </div>
        </div>

                 {/* Premium Search & Filters */}
         <div className='space-y-4'>
           {/* Main Search Bar */}
           <div className='relative group'>
             <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
             <Card className='relative p-4 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]'>
              <div className='flex items-center gap-3'>
                <div className='relative flex-grow'>
                  <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00437f]' />
                  <Input
                    type="text"
                    placeholder="Search by name, email, ID..."
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
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`h-10 w-10 p-0 rounded-lg ${
                      viewMode === 'list' 
                        ? 'bg-[#00437f] text-white hover:bg-[#003366]' 
                        : 'border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366]'
                    } transition-all duration-200`}
                  >
                    <FiList className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`h-10 w-10 p-0 rounded-lg ${
                      viewMode === 'grid' 
                        ? 'bg-[#00437f] text-white hover:bg-[#003366]' 
                        : 'border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366]'
                    } transition-all duration-200`}
                  >
                    <FiGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

                     {/* Advanced Filters */}
           {showFilters && (
             <div className='relative group'>
               <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
               <Card className='relative p-6 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]'>
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
                          <SelectItem value="email-asc">Email A-Z</SelectItem>
                          <SelectItem value="email-desc">Email Z-A</SelectItem>
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
                          <SelectItem value="all">All Customers</SelectItem>
                          <SelectItem value="with_addresses">With Addresses</SelectItem>
                          <SelectItem value="without_addresses">Without Addresses</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

                 {/* Premium Customer List */}
         <div className='relative group'>
           <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
           <Card className='relative border border-white/20 dark:border-gray-700/50 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]'>
            {isLoading ? (
              <div className='p-6 space-y-4'>
                {[...Array(5)].map((_, index) => (
                  <div key={index} className='animate-pulse'>
                    <div className='h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center px-4'>
                      <div className='space-y-3 flex-1 grid grid-cols-5 gap-4'>
                        <div className='h-4 bg-gray-200 dark:bg-gray-600 rounded col-span-1'></div>
                        <div className='h-4 bg-gray-200 dark:bg-gray-600 rounded col-span-1'></div>
                        <div className='h-4 bg-gray-200 dark:bg-gray-600 rounded col-span-1'></div>
                        <div className='h-4 bg-gray-200 dark:bg-gray-600 rounded col-span-1'></div>
                        <div className='flex justify-end gap-2'>
                          <div className='h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded'></div>
                          <div className='h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded'></div>
                          <div className='h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded'></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredAndSortedUsers.length === 0 ? (
              <div className='p-12 text-center'>
                <div className='w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <FiUser className='h-8 w-8 text-gray-400' />
                </div>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>No customers found</h3>
                <p className='text-gray-500 dark:text-gray-400'>Try adjusting your search or filters</p>
              </div>
                         ) : (
               <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
                 {currentItems.map((user) => {
                   if (viewMode === 'grid') {
                     // Grid View Layout
                     return (
                       <div key={user.id} className='relative group'>
                         <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
                         <Card className='relative p-4 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]'>
                           <div className='space-y-3'>
                             {/* Customer Avatar */}
                             <div className='aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-[#00437f]/5 to-[#00437f]/10 border border-[#00437f]/20 flex items-center justify-center'>
                               <div className='w-full h-full flex items-center justify-center text-[#00437f]'>
                                 <FiUser className="h-12 w-12" />
                               </div>
                             </div>

                             {/* Customer Info */}
                             <div className='space-y-2'>
                               <div>
                                 <p className='font-bold text-gray-900 dark:text-white text-base line-clamp-2'>{user.name}</p>
                                 <p className='text-xs text-gray-600 dark:text-gray-300 mt-1 flex items-center gap-1'>
                                   <FiMail className="h-3 w-3" />
                                   {user.email}
                                 </p>
                               </div>
                               
                               <div className='space-y-1'>
                                 <div className='flex items-center justify-between'>
                                   <span className='text-xs text-gray-500 dark:text-gray-400'>Phone</span>
                                   <span className='text-xs font-medium text-gray-700 dark:text-gray-300'>{user.phone || 'N/A'}</span>
                                 </div>
                                 
                                 <div className='flex items-center justify-between'>
                                   <span className='text-xs text-gray-500 dark:text-gray-400'>Status</span>
                                   {user.billingAddress || user.shippingAddress ? (
                                     <Badge className='bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800 text-xs'>
                                       <FiCheck className='h-2 w-2 mr-1' />
                                       Complete
                                     </Badge>
                                   ) : (
                                     <Badge className='bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-xs'>
                                       <FiAlertTriangle className='h-2 w-2 mr-1' />
                                       Incomplete
                                     </Badge>
                                   )}
                                 </div>
                               </div>
                             </div>

                             {/* Actions */}
                             <div className='flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700'>
                               <div className='flex items-center gap-1'>
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => handleViewUser(user)}
                                   className='h-8 w-8 p-0 text-[#00437f] hover:text-[#003366] hover:bg-[#00437f]/10 transition-all duration-200 rounded-lg'
                                 >
                                   <FiEye className="h-4 w-4" />
                                 </Button>
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => handleEditUser(user)}
                                   className='h-8 w-8 p-0 text-[#00437f] hover:text-[#003366] hover:bg-[#00437f]/10 transition-all duration-200 rounded-lg'
                                 >
                                   <FiEdit2 className="h-4 w-4" />
                                 </Button>
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => handleDeleteClick(user.id)}
                                   disabled={isDeleting && customerToDelete === user.id}
                                   className='h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-all duration-200 rounded-lg'
                                 >
                                   {isDeleting && customerToDelete === user.id ? (
                                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                                   ) : (
                                     <FiTrash2 className="h-4 w-4" />
                                   )}
                                 </Button>
                               </div>
                               <div className='text-xs text-gray-500 dark:text-gray-400 font-mono'>
                                 {user.id.slice(0, 8)}...
                               </div>
                             </div>
                           </div>
                         </Card>
                       </div>
                     )
                   } else {
                     // List View Layout
                     return (
                       <div key={user.id} className='relative group'>
                         <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
                         <Card className='relative p-6 border border-white/20 dark:border-gray-700/50 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]'>
                           <div className='flex items-center gap-6'>
                             {/* Avatar */}
                             <div className='flex-shrink-0'>
                               <div className='w-20 h-20 rounded-xl bg-gradient-to-br from-[#00437f]/5 to-[#00437f]/10 border-2 border-[#00437f]/20 flex items-center justify-center text-[#00437f]'>
                                 <FiUser className="h-8 w-8" />
                               </div>
                             </div>

                             {/* Customer Info */}
                             <div className='flex-grow grid grid-cols-6 gap-6 items-center'>
                               <div className='col-span-2'>
                                 <p className='font-bold text-gray-900 dark:text-white text-lg'>{user.name}</p>
                                 <p className='text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1'>
                                   <FiMail className="h-3 w-3" />
                                   {user.email}
                                 </p>
                               </div>
                               <div>
                                 <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>Phone</p>
                                 <p className='font-semibold text-gray-900 dark:text-white text-sm'>
                                   {user.phone || 'Not provided'}
                                 </p>
                               </div>
                               <div>
                                 <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>Customer ID</p>
                                 <p className='font-mono text-[#00437f] text-sm'>{user.id}</p>
                               </div>
                               <div>
                                 <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>Status</p>
                                 {user.billingAddress || user.shippingAddress ? (
                                   <Badge className='bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800'>
                                     <FiCheck className='h-3 w-3 mr-1' />
                                     Complete
                                   </Badge>
                                 ) : (
                                   <Badge className='bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800'>
                                     <FiAlertTriangle className='h-3 w-3 mr-1' />
                                     Incomplete
                                   </Badge>
                                 )}
                               </div>
                               <div>
                                 <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>Addresses</p>
                                 <div className='flex items-center gap-2 mt-1'>
                                   {user.billingAddress && (
                                     <span className='px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full'>
                                       Billing
                                     </span>
                                   )}
                                   {user.shippingAddress && (
                                     <span className='px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full'>
                                       Shipping
                                     </span>
                                   )}
                                   {!user.billingAddress && !user.shippingAddress && (
                                     <span className='px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full'>
                                       None
                                     </span>
                                   )}
                                 </div>
                               </div>
                             </div>

                             {/* Actions */}
                             <div className='flex-shrink-0'>
                               <div className='flex items-center justify-end gap-2'>
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => handleViewUser(user)}
                                   className='h-10 w-10 p-0 text-[#00437f] hover:text-[#003366] hover:bg-[#00437f]/10 transition-all duration-200 rounded-xl'
                                 >
                                   <FiEye className="h-5 w-5" />
                                 </Button>
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => handleEditUser(user)}
                                   className='h-10 w-10 p-0 text-[#00437f] hover:text-[#003366] hover:bg-[#00437f]/10 transition-all duration-200 rounded-xl'
                                 >
                                   <FiEdit2 className="h-5 w-5" />
                                 </Button>
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => handleDeleteClick(user.id)}
                                   disabled={isDeleting && customerToDelete === user.id}
                                   className='h-10 w-10 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 transition-all duration-200 rounded-xl'
                                 >
                                   {isDeleting && customerToDelete === user.id ? (
                                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                                   ) : (
                                     <FiTrash2 className="h-5 w-5" />
                                   )}
                                 </Button>
                               </div>
                             </div>
                           </div>
                         </Card>
                       </div>
                     )
                   }
                 })}
               </div>
             )}
          </Card>
        </div>

        {/* Premium Pagination */}
        {filteredAndSortedUsers.length > 10 && (
          <div className='mt-6'>
            <PremiumPagination
              totalPages={totalPages}
              currentPage={currentPage}
              totalItems={filteredAndSortedUsers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={paginate}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Premium Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="min-h-screen px-4 text-center">
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={handleDeleteCancel} />
              <div className="inline-block w-full max-w-md my-8 p-6 text-left align-middle bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <FiAlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Customer</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Are you sure you want to delete this customer? This will permanently remove their account and all associated data.
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handleDeleteCancel}
                    className="flex-1 border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                  >
                    {isDeleting ? (
                      <>
                        <FiLoader className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <FiTrash2 className="h-4 w-4 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Premium View Customer Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className='max-w-6xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-0 p-0 group [&>button]:hidden'>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]">
                <DialogHeader className='flex-shrink-0 p-8 pb-6'>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <FiUser className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <DialogTitle className='text-2xl font-bold text-gray-900 dark:text-white group-hover:text-[#00437f] transition-all duration-300'>
                        Customer Details
                      </DialogTitle>
                      <p className="text-gray-600 dark:text-gray-300 mt-1 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-all duration-300">View complete customer information</p>
                    </div>
                  </div>
                </DialogHeader>
                
                {selectedUser && (
                  <CustomerDetailsContent user={selectedUser} />
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

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
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Loading Customer Details</h3>
                    <p className="text-gray-600 dark:text-gray-300">Please wait while we fetch the complete customer information...</p>
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
      </div>
    </div>
  )
}
