'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
  FiSearch,
  FiTrash2,
  FiEdit2,
  FiPlus,
  FiDollarSign,
  FiPercent,
  FiCalendar,
  FiUsers,
  FiTag,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiLoader,
  FiArrowLeft,
  FiFilter,
  FiX,
  FiTrendingUp,
  FiTrendingDown,
  FiBarChart2,
  FiRefreshCw,
  FiAward,
  FiSettings,
  FiInfo,
} from 'react-icons/fi'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { PremiumPagination } from '@/components/ui/premium-pagination'

type Coupon = {
  id: string
  code: string
  description: string
  type: 'percentage' | 'fixed'
  value: number
  minPurchaseAmount: number | null
  maxDiscountAmount: number | null
  startDate: string
  endDate: string
  usageLimit: number | null
  usageCount: number
  perCustomerLimit: number | null
  isActive: boolean
  isFirstTimeOnly: boolean
  isNewCustomerOnly: boolean
  excludedProducts: string[]
  excludedCategories: string[]
  includedProducts: string[]
  includedCategories: string[]
  customerGroups: string[]
  createdAt: string
  updatedAt: string
  analytics: {
    totalDiscountsGiven: number
    totalRevenueImpact: number
    averageOrderValue: number
    redemptionRate: number
    lastUsedAt: string | null
  }
}

export default function CouponsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
  // New state for sorting and filtering
  const [sortBy, setSortBy] = useState('newest')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [isViewLoading, setIsViewLoading] = useState(false)
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    type: 'percentage',
    isActive: true,
    isFirstTimeOnly: false,
    isNewCustomerOnly: false,
    excludedProducts: [],
    excludedCategories: [],
    includedProducts: [],
    includedCategories: [],
    customerGroups: [],
  })

  useEffect(() => {
  const loadCoupons = async () => {
    try {
      const response = await fetch('/api/coupons')
        if (!response.ok) {
          throw new Error('Failed to load coupons')
        }
      const data = await response.json()
      setCoupons(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load coupons",
        variant: "destructive"
      })
    } finally {
        setLoading(false)
    }
  }

    loadCoupons()
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSortBy('newest')
    setTypeFilter('all')
    setStatusFilter('all')
    setCurrentPage(1)
  }

  const hasActiveFilters = searchQuery || sortBy !== 'newest' || typeFilter !== 'all' || statusFilter !== 'all'

  const handleViewCoupon = async (coupon: Coupon) => {
    setIsViewLoading(true)
    setSelectedCoupon(coupon)
    
    // Simulate loading time for better UX
    setTimeout(() => {
      setIsViewLoading(false)
      setShowViewDialog(true)
    }, 800)
  }

  const handleDeleteClick = (coupon: Coupon) => {
    setCouponToDelete(coupon)
    setShowDeleteDialog(true)
  }

  const handleEditClick = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setShowEditDialog(true)
  }

  const handleAddClick = () => {
    setNewCoupon({
      type: 'percentage',
      isActive: true,
      isFirstTimeOnly: false,
      isNewCustomerOnly: false,
      excludedProducts: [],
      excludedCategories: [],
      includedProducts: [],
      includedCategories: [],
      customerGroups: [],
    })
    setShowAddDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!couponToDelete) return

    try {
      setLoading(true)
      const response = await fetch(`/api/coupons?id=${couponToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete coupon')

      toast({
        title: "Success",
        description: "Coupon deleted successfully"
      })
      setCoupons(coupons.filter(c => c.id !== couponToDelete.id))
      setShowDeleteDialog(false)
      setCouponToDelete(null)
    } catch (error) {
      console.error('Error deleting coupon:', error)
      toast({
        title: "Error",
        description: "Failed to delete coupon",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCoupon) return

    try {
      const response = await fetch(`/api/coupons/${editingCoupon.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingCoupon),
      })

      if (!response.ok) throw new Error('Failed to update coupon')

      toast({
        title: "Success",
        description: "Coupon updated successfully"
      })
      setCoupons(coupons.map(c => c.id === editingCoupon.id ? editingCoupon : c))
      setShowEditDialog(false)
      setEditingCoupon(null)
    } catch (error) {
      console.error('Error updating coupon:', error)
      toast({
        title: "Error",
        description: "Failed to update coupon",
        variant: "destructive"
      })
    }
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCoupon),
      })

      if (!response.ok) throw new Error('Failed to create coupon')

      toast({
        title: "Success",
        description: "Coupon created successfully"
      })
      setCoupons(prevCoupons => [...prevCoupons, newCoupon as Coupon])
      setShowAddDialog(false)
      setNewCoupon({})
    } catch (error) {
      console.error('Error creating coupon:', error)
      toast({
        title: "Error",
        description: "Failed to create coupon",
        variant: "destructive"
      })
    }
  }

  // Helper function to check if coupon is active - moved before filtering logic
  const isCouponActive = (coupon: Coupon) => {
    const now = new Date()
    return (
      coupon.isActive &&
      new Date(coupon.startDate) <= now &&
      new Date(coupon.endDate) >= now &&
      (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit)
    )
  }

  const filteredAndSortedCoupons = coupons
    .filter(coupon => {
      const matchesSearch = coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coupon.description?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesType = typeFilter === 'all' || coupon.type === typeFilter
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && isCouponActive(coupon)) ||
        (statusFilter === 'inactive' && !isCouponActive(coupon))
      
      return matchesSearch && matchesType && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'code':
          return a.code.localeCompare(b.code)
        case 'usage':
          return b.usageCount - a.usageCount
        case 'value':
          return b.value - a.value
        default:
          return 0
      }
    })

  const totalPages = Math.ceil(filteredAndSortedCoupons.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCoupons = filteredAndSortedCoupons.slice(startIndex, endIndex)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Premium Header */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00437f] to-[#003366] rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl">
                  <FiTag className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-[#00437f] to-[#003366] dark:from-white dark:via-blue-200 dark:to-blue-300 bg-clip-text text-transparent">
                    Coupons
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Manage discount coupons and promotional codes
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => router.push('/admin/marketing/coupons/add')} 
                className="bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <FiPlus className="mr-2 h-4 w-4" />
                Add Coupon
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Coupons</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{coupons.length}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <FiTag className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Coupons</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {coupons.filter(c => isCouponActive(c)).length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <FiCheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Usage</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {coupons.reduce((sum, c) => sum + c.usageCount, 0)}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                  <FiUsers className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Expired Soon</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {coupons.filter(c => {
                      const endDate = new Date(c.endDate)
                      const now = new Date()
                      const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                      return daysUntilExpiry <= 7 && daysUntilExpiry > 0
                    }).length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                  <FiClock className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00437f] to-[#003366] rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-10"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search coupons by code or description..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 h-11 border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-2 border-gray-200 dark:border-gray-600 hover:border-[#00437f] hover:bg-[#00437f]/5 transition-all duration-200"
                >
                  <FiFilter className="mr-2 h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                      !
                    </Badge>
                  )}
                </Button>
                
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FiX className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/30 dark:border-gray-600/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
                        <FiFilter className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Filters</h3>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                        <div className="relative space-y-3">
                          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <FiTrendingUp className="h-4 w-4 text-blue-500" />
                            Sort By
                          </Label>
                          <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="border-2 border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-blue-400 hover:bg-white/80 dark:hover:bg-gray-700/80 shadow-sm hover:shadow-md">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-xl shadow-xl">
                              <SelectItem value="newest" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                <div className="flex items-center gap-2">
                                  <FiTrendingUp className="h-4 w-4 text-blue-500" />
                                  Newest First
                                </div>
                              </SelectItem>
                              <SelectItem value="oldest" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                <div className="flex items-center gap-2">
                                  <FiTrendingDown className="h-4 w-4 text-blue-500" />
                                  Oldest First
                                </div>
                              </SelectItem>
                              <SelectItem value="code" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                <div className="flex items-center gap-2">
                                  <FiTag className="h-4 w-4 text-blue-500" />
                                  Code A-Z
                                </div>
                              </SelectItem>
                              <SelectItem value="usage" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                <div className="flex items-center gap-2">
                                  <FiUsers className="h-4 w-4 text-blue-500" />
                                  Most Used
                                </div>
                              </SelectItem>
                              <SelectItem value="value" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                <div className="flex items-center gap-2">
                                  <FiDollarSign className="h-4 w-4 text-blue-500" />
                                  Highest Value
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/5 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                        <div className="relative space-y-3">
                          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <FiTag className="h-4 w-4 text-green-500" />
                            Type
                          </Label>
                          <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="border-2 border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 hover:border-green-400 hover:bg-white/80 dark:hover:bg-gray-700/80 shadow-sm hover:shadow-md">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-xl shadow-xl">
                              <SelectItem value="all" className="hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                                <div className="flex items-center gap-2">
                                  <FiTag className="h-4 w-4 text-green-500" />
                                  All Types
                                </div>
                              </SelectItem>
                              <SelectItem value="percentage" className="hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                                <div className="flex items-center gap-2">
                                  <FiPercent className="h-4 w-4 text-green-500" />
                                  Percentage
                                </div>
                              </SelectItem>
                              <SelectItem value="fixed" className="hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                                <div className="flex items-center gap-2">
                                  <FiDollarSign className="h-4 w-4 text-green-500" />
                                  Fixed Amount
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/5 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                        <div className="relative space-y-3">
                          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <FiCheckCircle className="h-4 w-4 text-purple-500" />
                            Status
                          </Label>
                          <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="border-2 border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 hover:border-purple-400 hover:bg-white/80 dark:hover:bg-gray-700/80 shadow-sm hover:shadow-md">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-xl shadow-xl">
                              <SelectItem value="all" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                                <div className="flex items-center gap-2">
                                  <FiBarChart2 className="h-4 w-4 text-purple-500" />
                                  All Status
                                </div>
                              </SelectItem>
                              <SelectItem value="active" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                                <div className="flex items-center gap-2">
                                  <FiCheckCircle className="h-4 w-4 text-green-500" />
                                  Active
                                </div>
                              </SelectItem>
                              <SelectItem value="inactive" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                                <div className="flex items-center gap-2">
                                  <FiXCircle className="h-4 w-4 text-red-500" />
                                  Inactive
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FiInfo className="h-4 w-4" />
                          <span>Showing {filteredAndSortedCoupons.length} of {coupons.length} coupons</span>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={clearFilters}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                        >
                          <FiRefreshCw className="mr-2 h-4 w-4" />
                          Reset Filters
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Coupons Table */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00437f] to-[#003366] rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-10"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 border-4 border-[#00437f]/20 border-t-[#00437f] rounded-full animate-spin"></div>
                  </div>
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Loading coupons...</span>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Code</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Description</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Value</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Usage</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Validity</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCoupons.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-16">
                          <div className="flex flex-col items-center gap-3">
                            <FiTag className="h-12 w-12 text-gray-400" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">No coupons found</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your search or filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentCoupons.map((coupon) => (
                        <tr key={coupon.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-200">
                          <td className="py-4 px-6">
                            <span className="font-mono font-semibold text-gray-900 dark:text-white">{coupon.code}</span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="max-w-xs truncate text-gray-700 dark:text-gray-300">{coupon.description}</div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge 
                              variant={coupon.type === 'percentage' ? 'secondary' : 'default'}
                              className="font-medium"
                            >
                              {coupon.type === 'percentage' ? (
                                <FiPercent className="mr-1 h-3 w-3" />
                              ) : (
                                <FiDollarSign className="mr-1 h-3 w-3" />
                              )}
                              {coupon.type}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            {coupon.type === 'percentage' ? (
                              <span className="text-blue-600 dark:text-blue-400 font-semibold">{coupon.value}%</span>
                            ) : (
                              <span className="text-green-600 dark:text-green-400 font-semibold">{formatCurrency(coupon.value)}</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                              <FiUsers className="mr-2 h-4 w-4" />
                              <span className="font-medium">{coupon.usageCount}</span>
                              {coupon.usageLimit && (
                                <span className="text-gray-500 dark:text-gray-400"> / {coupon.usageLimit}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <FiCalendar className="mr-2 h-4 w-4" />
                              {formatDate(coupon.startDate)} - {formatDate(coupon.endDate)}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge 
                              variant={isCouponActive(coupon) ? "default" : "destructive"}
                              className="font-medium"
                            >
                              {isCouponActive(coupon) ? (
                                <FiCheckCircle className="mr-1 h-3 w-3" />
                              ) : (
                                <FiXCircle className="mr-1 h-3 w-3" />
                              )}
                              {isCouponActive(coupon) ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewCoupon(coupon)}
                                disabled={isViewLoading}
                                className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 transition-colors duration-200"
                              >
                                {isViewLoading && selectedCoupon?.id === coupon.id ? (
                                  <div className="w-4 h-4 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                                ) : (
                                  <FiEye className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push(`/admin/marketing/coupons/${coupon.id}/edit`)}
                                className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 transition-colors duration-200"
                              >
                                <FiEdit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(coupon)}
                                className="h-8 w-8 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors duration-200"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {filteredAndSortedCoupons.length > 10 && (
          <div className="mt-6">
            <PremiumPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredAndSortedCoupons.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                <FiTrash2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Delete Coupon</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-300 mt-1">
                  Are you sure you want to delete this coupon? This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-red-50/80 dark:bg-red-900/20 backdrop-blur-xl border border-red-200 dark:border-red-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                  <FiTag className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Coupon to Delete</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">This coupon will be permanently removed</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-red-200 dark:border-red-700/30">
                  <FiTag className="h-5 w-5 text-red-500" />
                  <span className="font-mono font-bold text-lg text-gray-900 dark:text-white">{couponToDelete?.code}</span>
                  <Badge variant="destructive" className="ml-auto">
                    <FiTrash2 className="mr-1 h-3 w-3" />
                    Will be deleted
                  </Badge>
                </div>
                {couponToDelete?.description && (
                  <div className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-600/30">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{couponToDelete.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={loading}
              className="border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <FiX className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={loading}
              className="gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <FiTrash2 className="h-4 w-4" />
                  Delete Coupon
                </>
              )}
            </Button>
          </DialogFooter>
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
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Loading Coupon Details</h3>
                  <p className="text-gray-600 dark:text-gray-300">Please wait while we fetch the complete coupon information...</p>
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

      {/* View Coupon Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="sr-only">Coupon Details</DialogTitle>
          </DialogHeader>
          {selectedCoupon && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="p-3 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl">
                  <FiTag className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Coupon Details</h2>
                  <p className="text-gray-600 dark:text-gray-300">View complete coupon information</p>
                </div>
              </div>

              {/* Coupon Preview Card */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                        <FiAward className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Coupon Preview</h3>
                    </div>
                    <Badge variant={isCouponActive(selectedCoupon) ? "default" : "destructive"} className="font-medium">
                      {isCouponActive(selectedCoupon) ? (
                        <FiCheckCircle className="mr-1 h-3 w-3" />
                      ) : (
                        <FiXCircle className="mr-1 h-3 w-3" />
                      )}
                      {isCouponActive(selectedCoupon) ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-2xl text-blue-900 dark:text-blue-100">{selectedCoupon.code}</span>
                      <span className="text-lg text-blue-600 dark:text-blue-300 font-semibold">
                        {selectedCoupon.type === 'percentage' ? `${selectedCoupon.value}%` : formatCurrency(selectedCoupon.value)}
                      </span>
                    </div>
                    <p className="text-blue-700 dark:text-blue-200 font-medium">{selectedCoupon.description}</p>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                      <FiTag className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Coupon Code</Label>
                      <p className="font-mono font-semibold text-gray-900 dark:text-white">{selectedCoupon.code}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</Label>
                      <Badge variant={selectedCoupon.type === 'percentage' ? 'secondary' : 'default'} className="font-medium">
                        {selectedCoupon.type === 'percentage' ? (
                          <FiPercent className="mr-1 h-3 w-3" />
                        ) : (
                          <FiDollarSign className="mr-1 h-3 w-3" />
                        )}
                        {selectedCoupon.type}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Value</Label>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {selectedCoupon.type === 'percentage' ? (
                          <span className="text-blue-600 dark:text-blue-400">{selectedCoupon.value}%</span>
                        ) : (
                          <span className="text-green-600 dark:text-green-400">{formatCurrency(selectedCoupon.value)}</span>
                        )}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                      <p className="text-gray-900 dark:text-white">{selectedCoupon.description || 'No description'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Validity & Usage */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                      <FiCalendar className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Validity & Usage</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</Label>
                      <div className="flex items-center gap-2">
                        <FiCalendar className="h-4 w-4 text-gray-500" />
                        <p className="text-gray-900 dark:text-white">{formatDate(selectedCoupon.startDate)}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date</Label>
                      <div className="flex items-center gap-2">
                        <FiCalendar className="h-4 w-4 text-gray-500" />
                        <p className="text-gray-900 dark:text-white">{formatDate(selectedCoupon.endDate)}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Usage Count</Label>
                      <div className="flex items-center gap-2">
                        <FiUsers className="h-4 w-4 text-gray-500" />
                        <p className="text-gray-900 dark:text-white">{selectedCoupon.usageCount}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Usage Limit</Label>
                      <div className="flex items-center gap-2">
                        <FiUsers className="h-4 w-4 text-gray-500" />
                        <p className="text-gray-900 dark:text-white">{selectedCoupon.usageLimit || 'Unlimited'}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Per Customer Limit</Label>
                      <div className="flex items-center gap-2">
                        <FiUsers className="h-4 w-4 text-gray-500" />
                        <p className="text-gray-900 dark:text-white">{selectedCoupon.perCustomerLimit || 'Unlimited'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Restrictions & Settings */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                      <FiSettings className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Restrictions & Settings</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Purchase</Label>
                      <div className="flex items-center gap-2">
                        <FiDollarSign className="h-4 w-4 text-gray-500" />
                        <p className="text-gray-900 dark:text-white">
                          {selectedCoupon.minPurchaseAmount ? formatCurrency(selectedCoupon.minPurchaseAmount) : 'No minimum'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Maximum Discount</Label>
                      <div className="flex items-center gap-2">
                        <FiDollarSign className="h-4 w-4 text-gray-500" />
                        <p className="text-gray-900 dark:text-white">
                          {selectedCoupon.maxDiscountAmount ? formatCurrency(selectedCoupon.maxDiscountAmount) : 'No limit'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Time Only</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant={selectedCoupon.isFirstTimeOnly ? "default" : "secondary"} className="font-medium">
                          {selectedCoupon.isFirstTimeOnly ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Customers Only</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant={selectedCoupon.isNewCustomerOnly ? "default" : "secondary"} className="font-medium">
                          {selectedCoupon.isNewCustomerOnly ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setShowViewDialog(false)}
                  className="border-2 border-gray-200 dark:border-gray-600 hover:border-[#00437f] hover:bg-[#00437f]/5 transition-all duration-200"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowViewDialog(false)
                    router.push(`/admin/marketing/coupons/${selectedCoupon.id}/edit`)
                  }}
                  className="bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <FiEdit2 className="mr-2 h-4 w-4" />
                  Edit Coupon
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <FiEdit2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Edit Coupon</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-300 mt-1">
                  Update the coupon details below with enhanced controls.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-xl border border-blue-200 dark:border-blue-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    <FiTag className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="code" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <FiTag className="h-4 w-4 text-blue-500" />
                      Coupon Code
                    </Label>
                    <Input
                      id="code"
                      value={editingCoupon?.code}
                      onChange={(e) => setEditingCoupon(prev => prev ? { ...prev, code: e.target.value } : null)}
                      required
                      className="border-2 border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-blue-400 hover:bg-white/80 dark:hover:bg-gray-700/80 shadow-sm hover:shadow-md"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="type" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <FiDollarSign className="h-4 w-4 text-blue-500" />
                      Discount Type
                    </Label>
                    <Select
                      value={editingCoupon?.type}
                      onValueChange={(value) => setEditingCoupon(prev => prev ? { ...prev, type: value as 'percentage' | 'fixed' } : null)}
                    >
                      <SelectTrigger className="border-2 border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-blue-400 hover:bg-white/80 dark:hover:bg-gray-700/80 shadow-sm hover:shadow-md">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-xl shadow-xl">
                        <SelectItem value="percentage" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                          <div className="flex items-center gap-2">
                            <FiPercent className="h-4 w-4 text-blue-500" />
                            Percentage Discount
                          </div>
                        </SelectItem>
                        <SelectItem value="fixed" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                          <div className="flex items-center gap-2">
                            <FiDollarSign className="h-4 w-4 text-blue-500" />
                            Fixed Amount Discount
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <FiInfo className="h-4 w-4 text-blue-500" />
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={editingCoupon?.description}
                    onChange={(e) => setEditingCoupon(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="border-2 border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-blue-400 hover:bg-white/80 dark:hover:bg-gray-700/80 shadow-sm hover:shadow-md"
                  />
                </div>
              </div>
            </div>

            {/* Value & Limits Section */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-green-50/80 dark:bg-green-900/20 backdrop-blur-xl border border-green-200 dark:border-green-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                    <FiDollarSign className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Value & Limits</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="value" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <FiDollarSign className="h-4 w-4 text-green-500" />
                      Discount Value
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      value={editingCoupon?.value}
                      onChange={(e) => setEditingCoupon(prev => prev ? { ...prev, value: parseInt(e.target.value) } : null)}
                      required
                      className="border-2 border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 hover:border-green-400 hover:bg-white/80 dark:hover:bg-gray-700/80 shadow-sm hover:shadow-md"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="minPurchaseAmount" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <FiDollarSign className="h-4 w-4 text-green-500" />
                      Minimum Purchase
                    </Label>
                    <Input
                      id="minPurchaseAmount"
                      type="number"
                      value={editingCoupon?.minPurchaseAmount || ''}
                      onChange={(e) => setEditingCoupon(prev => prev ? { ...prev, minPurchaseAmount: parseInt(e.target.value) } : null)}
                      className="border-2 border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 hover:border-green-400 hover:bg-white/80 dark:hover:bg-gray-700/80 shadow-sm hover:shadow-md"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Validity Section */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-purple-50/80 dark:bg-purple-900/20 backdrop-blur-xl border border-purple-200 dark:border-purple-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                    <FiCalendar className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Validity Period</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="startDate" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <FiCalendar className="h-4 w-4 text-purple-500" />
                      Start Date
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={editingCoupon?.startDate.split('T')[0]}
                      onChange={(e) => setEditingCoupon(prev => prev ? { ...prev, startDate: e.target.value } : null)}
                      required
                      className="border-2 border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 hover:border-purple-400 hover:bg-white/80 dark:hover:bg-gray-700/80 shadow-sm hover:shadow-md"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="endDate" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <FiCalendar className="h-4 w-4 text-purple-500" />
                      End Date
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={editingCoupon?.endDate.split('T')[0]}
                      onChange={(e) => setEditingCoupon(prev => prev ? { ...prev, endDate: e.target.value } : null)}
                      required
                      className="border-2 border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 hover:border-purple-400 hover:bg-white/80 dark:hover:bg-gray-700/80 shadow-sm hover:shadow-md"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Limits Section */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-orange-50/80 dark:bg-orange-900/20 backdrop-blur-xl border border-orange-200 dark:border-orange-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                    <FiUsers className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Usage Limits</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="usageLimit" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <FiUsers className="h-4 w-4 text-orange-500" />
                      Total Usage Limit
                    </Label>
                    <Input
                      id="usageLimit"
                      type="number"
                      value={editingCoupon?.usageLimit || ''}
                      onChange={(e) => setEditingCoupon(prev => prev ? { ...prev, usageLimit: parseInt(e.target.value) } : null)}
                      className="border-2 border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 hover:border-orange-400 hover:bg-white/80 dark:hover:bg-gray-700/80 shadow-sm hover:shadow-md"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="perCustomerLimit" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <FiUsers className="h-4 w-4 text-orange-500" />
                      Per Customer Limit
                    </Label>
                    <Input
                      id="perCustomerLimit"
                      type="number"
                      value={editingCoupon?.perCustomerLimit || ''}
                      onChange={(e) => setEditingCoupon(prev => prev ? { ...prev, perCustomerLimit: parseInt(e.target.value) } : null)}
                      className="border-2 border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 hover:border-orange-400 hover:bg-white/80 dark:hover:bg-gray-700/80 shadow-sm hover:shadow-md"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Section */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-pink-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-pink-50/80 dark:bg-pink-900/20 backdrop-blur-xl border border-pink-200 dark:border-pink-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg">
                    <FiSettings className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Coupon Settings</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-pink-200 dark:border-pink-700/30">
                    <div className="flex items-center gap-3">
                      <FiCheckCircle className="h-5 w-5 text-pink-500" />
                      <div>
                        <Label htmlFor="isActive" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Active Status</Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Enable or disable this coupon</p>
                      </div>
                    </div>
                    <Switch
                      id="isActive"
                      checked={editingCoupon?.isActive}
                      defaultChecked={editingCoupon?.isActive}
                      onClick={() => setEditingCoupon(prev => prev ? { ...prev, isActive: !prev.isActive } : null)}
                      className="data-[state=checked]:bg-pink-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-pink-200 dark:border-pink-700/30">
                    <div className="flex items-center gap-3">
                      <FiUsers className="h-5 w-5 text-pink-500" />
                      <div>
                        <Label htmlFor="isFirstTimeOnly" className="text-sm font-semibold text-gray-700 dark:text-gray-300">First Time Only</Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Restrict to first-time customers only</p>
                      </div>
                    </div>
                    <Switch
                      id="isFirstTimeOnly"
                      checked={editingCoupon?.isFirstTimeOnly}
                      defaultChecked={editingCoupon?.isFirstTimeOnly}
                      onClick={() => setEditingCoupon(prev => prev ? { ...prev, isFirstTimeOnly: !prev.isFirstTimeOnly } : null)}
                      className="data-[state=checked]:bg-pink-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-pink-200 dark:border-pink-700/30">
                    <div className="flex items-center gap-3">
                      <FiUsers className="h-5 w-5 text-pink-500" />
                      <div>
                        <Label htmlFor="isNewCustomerOnly" className="text-sm font-semibold text-gray-700 dark:text-gray-300">New Customers Only</Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Restrict to new customers only</p>
                      </div>
                    </div>
                    <Switch
                      id="isNewCustomerOnly"
                      checked={editingCoupon?.isNewCustomerOnly}
                      defaultChecked={editingCoupon?.isNewCustomerOnly}
                      onClick={() => setEditingCoupon(prev => prev ? { ...prev, isNewCustomerOnly: !prev.isNewCustomerOnly } : null)}
                      className="data-[state=checked]:bg-pink-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                className="border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <FiX className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <FiCheckCircle className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Coupon</DialogTitle>
            <DialogDescription>
              Create a new discount coupon.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newCode">Code</Label>
                <Input
                  id="newCode"
                  value={newCoupon.code || ''}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, code: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newType">Type</Label>
                <Select
                  value={newCoupon.type}
                  onValueChange={(value) => setNewCoupon(prev => ({ ...prev, type: value as 'percentage' | 'fixed' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newDescription">Description</Label>
              <Input
                id="newDescription"
                value={newCoupon.description || ''}
                onChange={(e) => setNewCoupon(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newValue">Value</Label>
                <Input
                  id="newValue"
                  type="number"
                  value={newCoupon.value || ''}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, value: parseInt(e.target.value) }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newMinPurchaseAmount">Minimum Purchase Amount</Label>
                <Input
                  id="newMinPurchaseAmount"
                  type="number"
                  value={newCoupon.minPurchaseAmount || ''}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, minPurchaseAmount: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newStartDate">Start Date</Label>
                <Input
                  id="newStartDate"
                  type="date"
                  value={newCoupon.startDate || ''}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newEndDate">End Date</Label>
                <Input
                  id="newEndDate"
                  type="date"
                  value={newCoupon.endDate || ''}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newUsageLimit">Usage Limit</Label>
                <Input
                  id="newUsageLimit"
                  type="number"
                  value={newCoupon.usageLimit || ''}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, usageLimit: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPerCustomerLimit">Per Customer Limit</Label>
                <Input
                  id="newPerCustomerLimit"
                  type="number"
                  value={newCoupon.perCustomerLimit || ''}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, perCustomerLimit: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="newIsActive"
                  checked={newCoupon.isActive}
                  defaultChecked={newCoupon.isActive}
                  onClick={() => setNewCoupon(prev => ({ ...prev, isActive: !prev.isActive }))}
                />
                <Label htmlFor="newIsActive">Active</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="newIsFirstTimeOnly"
                  checked={newCoupon.isFirstTimeOnly}
                  defaultChecked={newCoupon.isFirstTimeOnly}
                  onClick={() => setNewCoupon(prev => ({ ...prev, isFirstTimeOnly: !prev.isFirstTimeOnly }))}
                />
                <Label htmlFor="newIsFirstTimeOnly">First Time Only</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="newIsNewCustomerOnly"
                  checked={newCoupon.isNewCustomerOnly}
                  defaultChecked={newCoupon.isNewCustomerOnly}
                  onClick={() => setNewCoupon(prev => ({ ...prev, isNewCustomerOnly: !prev.isNewCustomerOnly }))}
                />
                <Label htmlFor="newIsNewCustomerOnly">New Customers Only</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Coupon
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
