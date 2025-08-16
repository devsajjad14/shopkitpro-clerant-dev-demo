'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiX,
  FiEdit2,
  FiEye,
  FiDollarSign,
  FiUser,
  FiCalendar,
  FiAlertCircle,
  FiClock,
  FiList,
  FiArrowLeft,
  FiLoader,
  FiTrash2,
  FiFileText,
  FiMessageSquare,
  FiCheckCircle,
  FiXCircle,
  FiCreditCard,
  FiTag,
  FiBarChart2,
  FiPlus,
  FiEdit,
  FiCheck,
  FiPieChart,
  FiCircle,
  FiInbox,
  FiTrendingUp,
  FiTrendingDown,
  FiMoreVertical,
  FiGrid,
  FiSettings,
} from 'react-icons/fi'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDebounce } from '@/hooks/use-debounce'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { PremiumPagination } from '@/components/ui/premium-pagination'
import { useToast } from '@/hooks/use-toast'

type Refund = {
  id: number
  orderId: number
  amount: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  refundMethod: 'original_payment' | 'store_credit' | 'bank_transfer'
  refundedBy: number | null
  notes: string | null
  attachments: string[] | null
  createdAt: Date
  updatedAt: Date
  completedAt: Date | null
  refundTransactionId: string | null
  customerEmail: string | null
  customerName: string | null
  refundItems?: {
    productId: number
    quantity: number
    amount: number
    reason: string
  }[]
  adminNotes: string | null
  refundPolicy: string
  refundType: 'full' | 'partial'
  refundFee: number
  refundCurrency: string
  refundStatusHistory: {
    status: string
    timestamp: string
    note: string
    updatedBy: number
  }[]
  refundDocuments: {
    type: string
    url: string
    name: string
    uploadedAt: string
  }[]
  refundCommunication: {
    type: string
    content: string
    timestamp: string
    sender: string
  }[]
  refundAnalytics: {
    processingTime: number
    customerSatisfaction: number
    refundReasonCategory: string
    refundPattern: string
  } | null
  orderTotal?: number
}

export default function RefundsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [refundsList, setRefundsList] = useState<Refund[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    refundMethod: 'all',
    dateRange: 'all',
    refundType: 'all',
  })
  const [showStatusUpdate, setShowStatusUpdate] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [selectedRefunds, setSelectedRefunds] = useState<number[]>([])
  const [showBulkUpdate, setShowBulkUpdate] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [refundToDelete, setRefundToDelete] = useState<Refund | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [selectedRefundForStatus, setSelectedRefundForStatus] = useState<Refund | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isViewLoading, setIsViewLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  useEffect(() => {
    loadRefunds()
  }, [])

  const loadRefunds = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/refunds')
      if (!response.ok) throw new Error('Failed to fetch refunds')
      const data = await response.json()
      setRefundsList(data)
    } catch (error) {
      console.error('Error loading refunds:', error)
      toast({
        title: "Error",
        description: "Failed to load refunds",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/refunds/search?q=${encodeURIComponent(searchQuery)}`
      )
      if (!response.ok) throw new Error('Failed to search refunds')
      const data = await response.json()
      setRefundsList(data)
    } catch (error) {
      console.error('Error searching refunds:', error)
      toast({
        title: "Error",
        description: "Failed to search refunds",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewRefund = async (refund: Refund) => {
    try {
      setIsViewLoading(true)
      // Fetch order details to get the total amount
      const response = await fetch(`/api/orders/${refund.orderId}`)
      if (!response.ok) throw new Error('Failed to fetch order details')
      const orderData = await response.json()
      
      // Set the selected refund with order total - using actual amounts
      setSelectedRefund({
        ...refund,
        orderTotal: orderData.totalAmount,
        // If amount is in cents (> 1000 for a typical refund), convert it
        amount: refund.amount > 1000 ? refund.amount / 100 : refund.amount
      })
      setIsViewDialogOpen(true)
    } catch (error) {
      console.error('Error loading order details:', error)
      toast({
        title: "Error",
        description: "Failed to load complete refund details",
        variant: "destructive"
      })
      // If we can't get the order total, still show the refund with amount conversion if needed
      setSelectedRefund({
        ...refund,
        amount: refund.amount > 1000 ? refund.amount / 100 : refund.amount
      })
      setIsViewDialogOpen(true)
    } finally {
      setIsViewLoading(false)
    }
  }

  const handleCreateRefund = () => {
    router.push('/admin/sales/refunds/add')
  }

  const handleDeleteRefund = async (refund: Refund) => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/refunds?id=${refund.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete refund')

      toast({
        title: "Success",
        description: "Refund deleted successfully"
      })
      loadRefunds()
      setIsDeleteDialogOpen(false)
      setRefundToDelete(null)
    } catch (error) {
      console.error('Error deleting refund:', error)
      toast({
        title: "Error",
        description: "Failed to delete refund",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditRefund = (refund: Refund) => {
    router.push(`/admin/sales/refunds/edit/${refund.id}`)
  }

  const handleStatusUpdate = async () => {
    if (!selectedRefundForStatus) return

    try {
      setIsUpdatingStatus(true)
      const response = await fetch(`/api/refunds/${selectedRefundForStatus.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote || `Refund marked as ${newStatus}`,
        }),
      })

      if (!response.ok) throw new Error('Failed to update status')

      toast({
        title: "Success",
        description: "Status updated successfully"
      })
      loadRefunds()
      setIsStatusDialogOpen(false)
      setSelectedRefundForStatus(null)
      setNewStatus('pending')
      setStatusNote('')
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const getStatusBadgeColor = (status: string | undefined | null) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200'
    
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string | undefined | null) => {
    if (!status) return <FiCircle className="h-4 w-4" />
    
    switch (status.toLowerCase()) {
      case 'pending':
        return <FiClock className="h-4 w-4" />
      case 'approved':
        return <FiCheckCircle className="h-4 w-4" />
      case 'completed':
        return <FiCheck className="h-4 w-4" />
      case 'rejected':
        return <FiX className="h-4 w-4" />
      default:
        return <FiCircle className="h-4 w-4" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const calculateRefundStats = () => {
    const total = refundsList.length
    const partialRefunds = refundsList.filter(r => r.refundType === 'partial').length
    const fullRefunds = refundsList.filter(r => r.refundType === 'full').length
    const totalAmount = refundsList.reduce((sum, r) => sum + r.amount, 0)

    return {
      total,
      partialRefunds,
      fullRefunds,
      totalAmount,
      partialPercentage: (partialRefunds / total) * 100 || 0,
      fullPercentage: (fullRefunds / total) * 100 || 0,
    }
  }

  const stats = calculateRefundStats()

  // Pagination logic
  const filteredRefunds = refundsList.filter((refund) => {
    const searchMatch = searchQuery === '' || 
      refund.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.id.toString().includes(searchQuery)

    const statusMatch = filters.status === 'all' || refund.status === filters.status
    const methodMatch = filters.refundMethod === 'all' || refund.refundMethod === filters.refundMethod
    const typeMatch = filters.refundType === 'all' || refund.refundType === filters.refundType

    return searchMatch && statusMatch && methodMatch && typeMatch
  })

  const totalPages = Math.ceil(filteredRefunds.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredRefunds.slice(startIndex, endIndex)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const { toast } = useToast()

  const clearFilters = () => {
    setSearchQuery('')
    setFilters({
      status: 'all',
      refundMethod: 'all',
      dateRange: 'all',
      refundType: 'all',
    })
  }

  const hasActiveFilters = searchQuery || 
    filters.status !== 'all' || 
    filters.refundMethod !== 'all' || 
    filters.dateRange !== 'all' || 
    filters.refundType !== 'all'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Premium Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl"></div>
          <div className="relative flex items-center justify-between bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => router.back()} 
                  className="h-8 w-8 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200"
                >
                  <FiArrowLeft className="h-4 w-4" />
                </Button>
                <div className="w-10 h-10 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-lg flex items-center justify-center shadow-md">
                  <FiDollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Refunds
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                    {filteredRefunds.length} of {refundsList.length} refunds
                  </p>
                </div>
              </div>
            </div>
            <Button 
              size="sm"
              className="bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              onClick={handleCreateRefund}
            >
              <FiPlus className="mr-2 h-4 w-4" />
              New Refund
            </Button>
          </div>
        </div>

        {/* Premium Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Total Refunds Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
            <Card className="relative p-6 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Total Refunds</p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total.toLocaleString()}</h2>
                    <span className="text-sm font-medium text-[#00437f] dark:text-[#00437f]">
                      {formatCurrency(stats.totalAmount)}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                  <FiDollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={100} className="h-2 bg-gray-200 dark:bg-gray-700">
                  <div className="h-2 bg-gradient-to-r from-[#00437f] to-[#003366] rounded-full transition-all duration-300"></div>
                </Progress>
              </div>
            </Card>
          </div>

          {/* Partial Refunds Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-500/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
            <Card className="relative p-6 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Partial Refunds</p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.partialRefunds.toLocaleString()}</h2>
                    <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                      {((stats.partialRefunds / stats.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FiPieChart className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={stats.partialPercentage} className="h-2 bg-gray-200 dark:bg-gray-700">
                  <div className="h-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-300" style={{ width: `${stats.partialPercentage}%` }}></div>
                </Progress>
              </div>
            </Card>
          </div>

          {/* Full Refunds Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
            <Card className="relative p-6 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Full Refunds</p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.fullRefunds.toLocaleString()}</h2>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {((stats.fullRefunds / stats.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FiCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={stats.fullPercentage} className="h-2 bg-gray-200 dark:bg-gray-700">
                  <div className="h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-300" style={{ width: `${stats.fullPercentage}%` }}></div>
                </Progress>
              </div>
            </Card>
          </div>
        </div>

        {/* Premium Search & Filters */}
        <div className="space-y-4">
          {/* Main Search Bar */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
            <Card className="relative p-4 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="relative flex-grow">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00437f]" />
                  <Input
                    type="text"
                    placeholder="Search by refund ID, order ID, customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 h-10 text-sm border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 rounded-lg focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-300"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 h-10 px-4 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200 rounded-lg"
                >
                  <FiFilter className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs bg-[#00437f] text-white">
                      {[searchQuery, filters.status, filters.refundMethod, filters.dateRange, filters.refundType].filter(f => f !== 'all' && f !== '').length}
                    </Badge>
                  )}
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadRefunds}
                    disabled={isLoading}
                    className="h-10 w-10 p-0 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200 rounded-lg"
                  >
                    <FiRefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className="h-10 w-10 p-0 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200 rounded-lg"
                  >
                    <FiBarChart2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <Card className="relative p-6 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl transition-all duration-300">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Advanced Filters</h3>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-gray-500 hover:text-[#00437f] hover:bg-[#00437f]/10 transition-all duration-200 rounded-lg"
                      >
                        <FiX className="h-4 w-4 mr-2" />
                        Clear All
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Status Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900 dark:text-white">Status</label>
                      <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                        <SelectTrigger className="h-10 bg-white/50 dark:bg-gray-700/50 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-lg transition-all duration-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Refund Method Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900 dark:text-white">Refund Method</label>
                      <Select value={filters.refundMethod} onValueChange={(value) => setFilters({ ...filters, refundMethod: value })}>
                        <SelectTrigger className="h-10 bg-white/50 dark:bg-gray-700/50 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-lg transition-all duration-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Methods</SelectItem>
                          <SelectItem value="original_payment">Original Payment</SelectItem>
                          <SelectItem value="store_credit">Store Credit</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date Range Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900 dark:text-white">Date Range</label>
                      <Select value={filters.dateRange} onValueChange={(value) => setFilters({ ...filters, dateRange: value })}>
                        <SelectTrigger className="h-10 bg-white/50 dark:bg-gray-700/50 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-lg transition-all duration-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">This Week</SelectItem>
                          <SelectItem value="month">This Month</SelectItem>
                          <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Refund Type Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900 dark:text-white">Refund Type</label>
                      <Select value={filters.refundType} onValueChange={(value) => setFilters({ ...filters, refundType: value })}>
                        <SelectTrigger className="h-10 bg-white/50 dark:bg-gray-700/50 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-lg transition-all duration-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="full">Full Refund</SelectItem>
                          <SelectItem value="partial">Partial Refund</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Active Filters Display */}
                  {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-[#00437f]/20 dark:border-[#00437f]/30">
                      {searchQuery && (
                        <Badge variant="secondary" className="bg-[#00437f]/10 text-[#00437f] border-[#00437f]/20">
                          Search: {searchQuery}
                          <FiX className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                        </Badge>
                      )}
                      {filters.status !== 'all' && (
                        <Badge variant="secondary" className="bg-[#00437f]/10 text-[#00437f] border-[#00437f]/20">
                          Status: {filters.status}
                          <FiX className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setFilters({ ...filters, status: 'all' })} />
                        </Badge>
                      )}
                      {filters.refundMethod !== 'all' && (
                        <Badge variant="secondary" className="bg-[#00437f]/10 text-[#00437f] border-[#00437f]/20">
                          Method: {filters.refundMethod.replace(/_/g, ' ')}
                          <FiX className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setFilters({ ...filters, refundMethod: 'all' })} />
                        </Badge>
                      )}
                      {filters.dateRange !== 'all' && (
                        <Badge variant="secondary" className="bg-[#00437f]/10 text-[#00437f] border-[#00437f]/20">
                          Date: {filters.dateRange}
                          <FiX className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setFilters({ ...filters, dateRange: 'all' })} />
                        </Badge>
                      )}
                      {filters.refundType !== 'all' && (
                        <Badge variant="secondary" className="bg-[#00437f]/10 text-[#00437f] border-[#00437f]/20">
                          Type: {filters.refundType}
                          <FiX className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setFilters({ ...filters, refundType: 'all' })} />
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Refund Status</DialogTitle>
            <DialogDescription>
              Change the status of refund #{selectedRefundForStatus?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select
                value={newStatus}
                onValueChange={(value: 'pending' | 'approved' | 'completed' | 'rejected') => setNewStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <FiClock className="h-4 w-4 text-yellow-600" />
                      <span>Pending</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="approved">
                    <div className="flex items-center gap-2">
                      <FiCheckCircle className="h-4 w-4 text-green-600" />
                      <span>Approved</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      <FiCheck className="h-4 w-4 text-blue-600" />
                      <span>Completed</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="rejected">
                    <div className="flex items-center gap-2">
                      <FiX className="h-4 w-4 text-red-600" />
                      <span>Rejected</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Add a note about this status change (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isUpdatingStatus}>
              {isUpdatingStatus ? (
                <>
                  <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

        {/* Premium Refunds List */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
          <Card className="relative border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl transition-all duration-300">
            <ScrollArea className="h-[600px]">
              <div className="p-6">
                {isLoading ? (
                  <div className="flex h-32 items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-600 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-[#00437f] rounded-full animate-spin"></div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 font-medium">Loading refunds...</p>
                    </div>
                  </div>
                ) : refundsList.length === 0 ? (
                  <div className="flex h-32 flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
                      <FiAlertCircle className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">No refunds found</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Try adjusting your search or filters</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentItems.map((refund) => (
                      <div
                        key={refund.id}
                        className="flex items-center justify-between rounded-xl border border-gray-100/50 dark:border-gray-700/50 p-6 hover:bg-[#00437f]/5 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                      >
                        <div className="flex items-center space-x-6">
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-lg flex items-center justify-center shadow-md">
                                <FiDollarSign className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white text-lg">Refund #{refund.id}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  Order #{refund.orderId}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusBadgeColor(refund.status)}`}>
                            {getStatusIcon(refund.status)}
                            <span className="capitalize">{refund.status}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <p className="text-xl font-bold text-[#00437f] dark:text-[#00437f]">{formatCurrency(refund.amount)}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                              {refund.refundType} refund
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewRefund(refund)}
                              disabled={isViewLoading}
                              className="h-9 w-9 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                              title="View Details"
                            >
                              {isViewLoading ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#00437f]"></div>
                              ) : (
                                <FiEye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setRefundToDelete(refund)
                                setIsDeleteDialogOpen(true)
                              }}
                              className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                              title="Delete Refund"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Premium Pagination */}
        <div className="mt-6">
          <PremiumPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={paginate}
            totalItems={filteredRefunds.length}
            itemsPerPage={itemsPerPage}
          />
        </div>

      {/* Premium View Refund Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-0 p-0">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-2xl">

              
              <DialogHeader className="flex-shrink-0 p-8 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                    <FiDollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                      Refund Details
                    </DialogTitle>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">Complete refund information for #{selectedRefund?.id}</p>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="flex-1 overflow-y-auto p-8 pt-0">
                {selectedRefund && (
                  <div className="space-y-8">
                    {/* Refund Header Section */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                      <Card className="relative p-6 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl hover:shadow-2xl hover:scale-[1.02] transform transition-all duration-300 group-hover:border-[#00437f]/30">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-lg flex items-center justify-center shadow-md">
                                <FiFileText className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Order Reference</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">#{selectedRefund.orderId}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Refund Amount</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(selectedRefund.amount)}</p>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Amount Breakdown Section */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                      <Card className="relative p-6 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl hover:shadow-2xl hover:scale-[1.02] transform transition-all duration-300 group-hover:border-green-500/30">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                              <FiDollarSign className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Amount Breakdown</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">Detailed refund calculation</p>
                            </div>
                          </div>
                          
                          <div className="grid gap-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Order Total</span>
                              <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(selectedRefund.orderTotal || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <span className="text-sm font-medium text-green-700 dark:text-green-300">Amount Refunded</span>
                              <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(selectedRefund.amount)}</span>
                            </div>
                            {selectedRefund.refundType === 'partial' && (
                              <>
                                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Remaining Amount</span>
                                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                                    {formatCurrency(Math.max(0, (selectedRefund.orderTotal || 0) - selectedRefund.amount))}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Refund Progress</span>
                                    <span className="font-medium">
                                      {Math.min(100, Math.round((selectedRefund.amount / (selectedRefund.orderTotal || 1)) * 100))}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${Math.min(100, (selectedRefund.amount / (selectedRefund.orderTotal || 1)) * 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </Card>
                    </div>

                  <Separator />

                  {/* Refund Details */}
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Refund Type</p>
                        <Badge variant="outline" className="capitalize">
                          {selectedRefund.refundType}
                        </Badge>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm text-muted-foreground">Payment Method</p>
                        <Badge variant="outline" className="capitalize">
                          {(selectedRefund.refundMethod || '').replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="text-sm font-medium">{formatDate(selectedRefund.createdAt)}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm text-muted-foreground">Last Updated</p>
                        <p className="text-sm font-medium">{formatDate(selectedRefund.updatedAt)}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                    {/* Refund Details Section */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                      <Card className="relative p-6 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl hover:shadow-2xl hover:scale-[1.02] transform transition-all duration-300 group-hover:border-blue-500/30">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                              <FiSettings className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Refund Details</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">Status and method information</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Refund Type</p>
                              <Badge variant="outline" className="capitalize bg-[#00437f]/10 text-[#00437f] border-[#00437f]/20">
                                {selectedRefund.refundType}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Method</p>
                              <Badge variant="outline" className="capitalize bg-[#00437f]/10 text-[#00437f] border-[#00437f]/20">
                                {(selectedRefund.refundMethod || '').replace(/_/g, ' ')}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(selectedRefund.createdAt)}</p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(selectedRefund.updatedAt)}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Reason and Notes Section */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-500/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                      <Card className="relative p-6 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl hover:shadow-2xl hover:scale-[1.02] transform transition-all duration-300 group-hover:border-amber-500/30">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
                              <FiMessageSquare className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reason & Notes</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">Refund justification and additional information</p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason for Refund</p>
                              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                {selectedRefund.reason || 'No reason provided'}
                              </div>
                            </div>
                            {selectedRefund.notes && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Notes</p>
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                  {selectedRefund.notes}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Refund</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this refund? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (refundToDelete) {
                  handleDeleteRefund(refundToDelete)
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
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
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Loading Refund Details</h3>
                  <p className="text-gray-600 dark:text-gray-300">Please wait while we fetch the complete refund information...</p>
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
