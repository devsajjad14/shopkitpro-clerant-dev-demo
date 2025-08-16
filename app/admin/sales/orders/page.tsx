'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiPackage,
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiX,
  FiEdit2,
  FiEdit,
  FiEye,
  FiTruck,
  FiMail,
  FiCalendar,
  FiDollarSign,
  FiUser,
  FiMapPin,
  FiCreditCard,
  FiTag,
  FiAlertCircle,
  FiClock,
  FiList,
  FiArrowLeft,
  FiLoader,
  FiTrash2,
  FiChevronsLeft,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsRight,
  FiTrendingUp,
  FiTrendingDown,
  FiBarChart2,
  FiCheck,
  FiAlertTriangle,
  FiPlus,
  FiShoppingCart,
} from 'react-icons/fi'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PremiumPagination } from '@/components/ui/premium-pagination'

interface OrderItem {
  id: string
  orderId: string
  productId: number
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  image?: string
  product?: {
    id: number
    name: string
    mediumPicture: string | null
    style: string
    brand: string | null
    styleId: number
  }
}

interface Order {
  id: string
  userId: string | null
  guestEmail: string | null
  status: string
  paymentMethod: string | null
  paymentStatus: string
  totalAmount: number
  subtotal: number
  tax: number
  discount: number
  shippingFee: number
  note: string | null
  createdAt: string
  updatedAt: string | null
  items?: OrderItem[]
  statusHistory?: {
    status: string
    date: string
    note: string
    updatedBy: string
  }[]
}

export default function OrdersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [ordersList, setOrdersList] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    paymentStatus: 'all',
    dateRange: 'all',
    priority: 'all',
  })
  const [showStatusUpdate, setShowStatusUpdate] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [showBulkUpdate, setShowBulkUpdate] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isViewLoading, setIsViewLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    loadOrders()
  }, [])

  const clearFilters = () => {
    setFilters({
      status: 'all',
      paymentStatus: 'all',
      dateRange: 'all',
      priority: 'all',
    })
    setSearchQuery('')
  }

  const hasActiveFilters = 
    filters.status !== 'all' ||
    filters.paymentStatus !== 'all' ||
    filters.dateRange !== 'all' ||
    filters.priority !== 'all' ||
    searchQuery.trim() !== ''

  const loadOrders = async () => {
    try {
      setIsLoading(true)
      // Fetch all orders by setting a high limit
      const response = await fetch('/api/orders?limit=1000')
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      setOrdersList(data.orders || [])
    } catch (error) {
      console.error('Error loading orders:', error)
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewOrder = async (order: Order) => {
    try {
      setIsViewLoading(true)
      const response = await fetch(`/api/orders/${order.id}`)
      if (!response.ok) throw new Error('Failed to fetch order details')
      const data = await response.json()
      
      // Ensure the order data has the required properties
      const safeOrder = {
        ...data,
        id: data.id || order.id || '',
        status: data.status || order.status || '',
        paymentMethod: data.paymentMethod || order.paymentMethod || '',
        items: data.items || [],
        createdAt: data.createdAt || order.createdAt || '',
        guestEmail: data.guestEmail || order.guestEmail || '',
        totalAmount: data.totalAmount || order.totalAmount || 0,
        subtotal: data.subtotal || order.subtotal || 0,
        tax: data.tax || order.tax || 0,
        discount: data.discount || order.discount || 0,
        shippingFee: data.shippingFee || order.shippingFee || 0,
        note: data.note || order.note || '',
        userId: data.userId || order.userId || null,
        paymentStatus: data.paymentStatus || order.paymentStatus || ''
      }
      
      setSelectedOrder(safeOrder)
      setIsViewDialogOpen(true)
    } catch (error) {
      console.error('Error fetching order details:', error)
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive",
      })
    } finally {
      setIsViewLoading(false)
    }
  }

  const handleCreateOrder = () => {
    router.push('/admin/sales/orders/add')
  }

  const handleDeleteOrder = async (order: Order) => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/orders?id=${order.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete order')

      toast({
        title: "Success",
        description: "Order deleted successfully",
      })
      loadOrders() // Reload the orders list
      setIsDeleteDialogOpen(false)
      setOrderToDelete(null)
    } catch (error) {
      console.error('Error deleting order:', error)
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditOrder = (order: Order) => {
    router.push(`/admin/sales/orders/edit/${order.id}`)
  }

  const filteredOrders = ordersList.filter((order) => {
    const searchMatch =
      order.guestEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())

    const statusMatch =
      filters.status === 'all' || order.status === filters.status

    const paymentStatusMatch =
      filters.paymentStatus === 'all' ||
      order.paymentStatus === filters.paymentStatus

    const priorityMatch =
      filters.priority === 'all' || order.status === filters.priority

    return searchMatch && statusMatch && paymentStatusMatch && priorityMatch
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredOrders.slice(startIndex, endIndex)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      // Alt + S to open status update
      if (e.altKey && e.key === 's' && selectedOrder) {
        setShowStatusUpdate(true)
      }

      // Alt + B to toggle bulk selection
      if (e.altKey && e.key === 'b') {
        setShowBulkUpdate(!showBulkUpdate)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedOrder, showBulkUpdate])

  // Status validation rules
  const validateStatusChange = (
    currentStatus: string,
    newStatus: string
  ): boolean => {
    const validTransitions: Record<string, string[]> = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: ['cancelled'],
      cancelled: [],
    }

    return validTransitions[currentStatus]?.includes(newStatus) || false
  }

  const handleStatusUpdate = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote,
        }),
      })

      if (!response.ok) throw new Error('Failed to update status')

      const updatedOrder = await response.json()
      setOrdersList((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: updatedOrder.status,
                statusHistory: [
                  ...(order.statusHistory || []),
                  {
                    status: updatedOrder.status,
                    date: new Date().toISOString(),
                    note: statusNote,
                    updatedBy: 'Admin',
                  },
                ],
              }
            : order
        )
      )

      toast({
        title: "Success",
        description: "Order status updated successfully",
      })
      setShowStatusUpdate(false)
      setNewStatus('')
      setStatusNote('')
    } catch (error) {
      console.error('Error updating order status:', error)
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    }
  }

  const handleBulkStatusUpdate = async () => {
    try {
      const response = await fetch('/api/orders/bulk-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderIds: selectedOrders,
          status: newStatus,
          note: statusNote,
        }),
      })

      if (!response.ok) throw new Error('Failed to update status')

      const updatedOrders = await response.json()
      setOrdersList((prev) =>
        prev.map((order) =>
          selectedOrders.includes(order.id)
            ? {
                ...order,
                status: updatedOrders.status,
                statusHistory: [
                  ...(order.statusHistory || []),
                  {
                    status: updatedOrders.status,
                    date: new Date().toISOString(),
                    note: statusNote,
                    updatedBy: 'Admin',
                  },
                ],
              }
            : order
        )
      )

      toast({
        title: "Success",
        description: "Orders status updated successfully",
      })
      setShowBulkUpdate(false)
      setNewStatus('')
      setStatusNote('')
      setSelectedOrders([])
    } catch (error) {
      console.error('Error updating orders status:', error)
      toast({
        title: "Error",
        description: "Failed to update orders status",
        variant: "destructive",
      })
    }
  }

  // Calculate overview statistics
  const totalOrders = ordersList.length
  const totalRevenue = ordersList.reduce(
    (sum, order) => sum + Number(order.totalAmount || 0),
    0
  )
  const pendingOrders = ordersList.filter((o) => o.status === 'pending').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/20 p-6">
      {/* Premium Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
              className="h-10 w-10 rounded-xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:bg-white/90 hover:shadow-xl transition-all duration-300"
            >
              <FiArrowLeft className="h-5 w-5 text-gray-700" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-600 flex items-center justify-center shadow-lg">
                <FiPackage className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  Orders Management
                </h1>
                <p className="text-gray-600 mt-1 font-medium">
                  Manage and track customer orders with precision
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleCreateOrder}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <FiPlus className="h-4 w-4" />
              Create Order
            </Button>
          </div>
        </div>
      </div>

      {/* Premium Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {totalOrders.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiPackage className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                  ${Number(totalRevenue).toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiTrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Orders</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent">
                  {pendingOrders.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiClock className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Processing</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-700 bg-clip-text text-transparent">
                  {ordersList.filter((o) => o.status === 'processing').length.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-violet-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiBarChart2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Premium Search & Filters */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-600/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
        <div className="relative bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-6 mb-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <div className="flex-1 relative w-full">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by order number, customer name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white/60 backdrop-blur-sm border border-white/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-gray-700 placeholder-gray-500 font-medium"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 px-6 rounded-xl bg-white/60 backdrop-blur-sm border border-white/30 text-gray-700 hover:bg-white/80 hover:shadow-lg transition-all duration-300 font-medium flex items-center gap-2"
              >
                <FiFilter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="h-5 w-5 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                    {[filters.status, filters.paymentStatus, filters.priority].filter(f => f !== 'all').length + (searchQuery.trim() ? 1 : 0)}
                  </span>
                )}
                {showFilters ? (
                  <FiChevronUp className="h-4 w-4" />
                ) : (
                  <FiChevronDown className="h-4 w-4" />
                )}
              </Button>

              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="h-12 px-4 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-300"
                >
                  <FiX className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="mt-6 p-6 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Order Status Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Order Status
                  </label>
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="h-11 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Status Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Status
                  </label>
                  <Select value={filters.paymentStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, paymentStatus: value }))}>
                    <SelectTrigger className="h-11 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                      <SelectValue placeholder="All Payment Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payment Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Priority
                  </label>
                  <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger className="h-11 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Premium Orders Table */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-600/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
        <div className="relative bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 via-blue-50/50 to-indigo-50/50 border-b border-white/30">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === filteredOrders.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrders(
                            filteredOrders.map((order) => order.id)
                          )
                        } else {
                          setSelectedOrders([])
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Order
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Customer
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      Status
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Payment
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      Total
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                      Date
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      Actions
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/30">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
                          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-pulse"></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-600">Loading orders...</span>
                      </div>
                    </td>
                  </tr>
                ) : ordersList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <FiPackage className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="text-gray-500">
                          <p className="font-semibold text-lg">No orders found</p>
                          <p className="text-sm">Orders will appear here once created</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((order, index) => order && (
                    <tr key={order.id} className={`hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-indigo-50/60 transition-all duration-300 group relative ${
                      index % 2 === 0 ? 'bg-white/40' : 'bg-gray-50/20'
                    }`}>
                      <td className="px-6 py-5">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOrders([...selectedOrders, order.id])
                            } else {
                              setSelectedOrders(
                                selectedOrders.filter((id) => id !== order.id)
                              )
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 transition-colors duration-200">
                            #{order.id ? order.id.slice(0, 8) : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Order ID
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900 text-sm">
                            {order.guestEmail || 'Guest User'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.userId ? 'Registered' : 'Guest Checkout'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <Badge
                          className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm border ${
                            order.status === 'pending' 
                              ? 'bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 border-yellow-200'
                              : order.status === 'processing'
                              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200'
                              : order.status === 'shipped'
                              ? 'bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border-purple-200'
                              : order.status === 'delivered' || order.status === 'completed'
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200'
                              : order.status === 'cancelled'
                              ? 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200'
                              : 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            order.status === 'pending' ? 'bg-yellow-500' :
                            order.status === 'processing' ? 'bg-blue-500' :
                            order.status === 'shipped' ? 'bg-purple-500' :
                            order.status === 'delivered' || order.status === 'completed' ? 'bg-green-500' :
                            order.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
                          }`}></div>
                          {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <Badge className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200 shadow-sm">
                            {order.paymentMethod
                              ? order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)
                              : 'N/A'}
                          </Badge>
                          <div className="text-xs text-gray-500">
                            {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-bold text-gray-900">
                          ${Number(order.totalAmount || 0).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {order.items?.length || 0} items
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-semibold text-gray-900">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString()
                            : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleTimeString()
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            onClick={() => handleViewOrder(order)}
                            variant="ghost"
                            size="sm"
                            disabled={isViewLoading}
                            className="h-9 w-9 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            title="View Details"
                          >
                            {isViewLoading ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#00437f]"></div>
                            ) : (
                              <FiEye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            onClick={() => handleEditOrder(order)}
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Edit Order"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              setOrderToDelete(order)
                              setIsDeleteDialogOpen(true)
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Delete Order"
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
        </div>
      </div>

      {/* Premium Pagination */}
      <div className="mt-6">
        <PremiumPagination 
          totalPages={totalPages}
          currentPage={currentPage}
          totalItems={filteredOrders.length}
          itemsPerPage={itemsPerPage}
          onPageChange={paginate}
        />
      </div>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className='max-w-6xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-0 p-0'>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-2xl">
              <DialogHeader className='flex-shrink-0 p-8 pb-6'>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                    <FiPackage className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className='text-2xl font-bold text-gray-900 dark:text-white'>
                      Order Details
                    </DialogTitle>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">View complete order information</p>
                  </div>
                </div>
              </DialogHeader>
              
              {selectedOrder && (
                <div className='px-8 pb-8 space-y-8 overflow-y-auto max-h-[70vh]'>
                  {/* Order Header */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
                      <div className='flex items-center justify-between'>
                        <div className="space-y-2">
                          <h3 className='text-xl font-bold text-gray-900 dark:text-white'>
                            Order #{selectedOrder.id ? selectedOrder.id.slice(0, 8) : 'N/A'}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-2">
                              <FiCalendar className="h-4 w-4" />
                              <span>
                                {selectedOrder.createdAt
                                  ? new Date(selectedOrder.createdAt).toLocaleDateString()
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FiClock className="h-4 w-4" />
                              <span>
                                {selectedOrder.createdAt
                                  ? new Date(selectedOrder.createdAt).toLocaleTimeString()
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className='flex items-center gap-4'>
                          <Badge
                            className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold shadow-lg border ${
                              selectedOrder.status === 'pending' 
                                ? 'bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 border-yellow-200'
                                : selectedOrder.status === 'processing'
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200'
                                : selectedOrder.status === 'shipped'
                                ? 'bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border-purple-200'
                                : selectedOrder.status === 'delivered' || selectedOrder.status === 'completed'
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200'
                                : selectedOrder.status === 'cancelled'
                                ? 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200'
                                : 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200'
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              selectedOrder.status === 'pending' ? 'bg-yellow-500' :
                              selectedOrder.status === 'processing' ? 'bg-blue-500' :
                              selectedOrder.status === 'shipped' ? 'bg-purple-500' :
                              selectedOrder.status === 'delivered' || selectedOrder.status === 'completed' ? 'bg-green-500' :
                              selectedOrder.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
                            }`}></div>
                            {selectedOrder.status ? selectedOrder.status.charAt(0).toUpperCase() +
                              selectedOrder.status.slice(1) : 'N/A'}
                          </Badge>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              setIsViewDialogOpen(false)
                              handleEditOrder(selectedOrder)
                            }}
                            className="h-10 px-4 bg-gradient-to-r from-[#00437f] to-[#003366] text-white border-0 hover:from-[#003366] hover:to-[#002855] shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <FiEdit2 className='h-4 w-4 mr-2' />
                            Edit Order
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Section */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-lg flex items-center justify-center shadow-lg">
                          <FiShoppingCart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">Order Items</h4>
                          <p className="text-gray-600 dark:text-gray-300">Products in this order</p>
                        </div>
                      </div>
                      
                      <div className='space-y-4'>
                        {!selectedOrder ? (
                          <div className="space-y-4">
                            {[...Array(3)].map((_, index) => (
                              <div key={index} className="animate-pulse">
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 bg-gray-200 rounded-md"></div>
                                  <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                  </div>
                                  <div className="text-right">
                                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : selectedOrder?.items && selectedOrder.items.length > 0 ? (
                          selectedOrder.items.map((item, index) => (
                            <div
                              key={index}
                              className='flex items-center justify-between p-4 hover:bg-[#00437f]/5 rounded-xl border border-gray-100/50 transition-all duration-200'
                            >
                              <div className='flex items-center gap-4'>
                                <div className='h-16 w-16 rounded-xl overflow-hidden bg-gray-100 shadow-sm'>
                                  <img
                                    src={item.product?.mediumPicture || '/images/site/placeholder.png'}
                                    alt={item.name}
                                    className='object-cover w-full h-full'
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.src = '/images/site/placeholder.png'
                                    }}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                                    {item.name}
                                  </p>
                                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                      <FiPackage className="h-3 w-3" />
                                      Quantity: {item.quantity}
                                    </span>
                                    {item.product?.style && (
                                      <span className="flex items-center gap-1">
                                        <FiTag className="h-3 w-3" />
                                        Style: {item.product.style}{' '}
                                        {item.product.styleId &&
                                          `(ID: ${item.product.styleId})`}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className='text-right space-y-1'>
                                <p className='text-lg font-bold text-[#00437f]'>
                                  ${Number(item.totalPrice || 0).toFixed(2)}
                                </p>
                                <p className='text-xs text-gray-500 dark:text-gray-400'>
                                  ${Number(item.unitPrice || 0).toFixed(2)} each
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className='py-12 text-center'>
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <FiShoppingCart className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">No items found in this order</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">This order doesn't contain any products</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Summary Section */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-lg flex items-center justify-center shadow-lg">
                          <FiDollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">Order Summary</h4>
                          <p className="text-gray-600 dark:text-gray-300">Payment and total information</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</span>
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {selectedOrder.paymentMethod ? selectedOrder.paymentMethod.charAt(0).toUpperCase() + selectedOrder.paymentMethod.slice(1) : 'N/A'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Status</span>
                            <Badge className={selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}>
                              {selectedOrder.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Customer</span>
                            <span className="text-sm text-gray-900 dark:text-white">{selectedOrder.guestEmail || 'Guest User'}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                            <span className="font-semibold text-gray-900 dark:text-white">${Number(selectedOrder.subtotal || 0).toFixed(2)}</span>
                          </div>
                          {Number(selectedOrder.discount || 0) > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-300">Discount</span>
                              <span className="font-semibold text-green-600">-${Number(selectedOrder.discount || 0).toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Tax</span>
                            <span className="font-semibold text-gray-900 dark:text-white">${Number(selectedOrder.tax || 0).toFixed(2)}</span>
                          </div>
                          {Number(selectedOrder.shippingFee || 0) > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-300">Shipping</span>
                              <span className="font-semibold text-gray-900 dark:text-white">${Number(selectedOrder.shippingFee || 0).toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                            <span className="text-xl font-bold text-[#00437f]">${Number(selectedOrder.totalAmount || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {selectedOrder.note && (
                        <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                          <div className="flex items-center gap-2 mb-2">
                            <FiEdit className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">Order Note</span>
                          </div>
                          <p className="text-sm text-blue-700 dark:text-blue-300">{selectedOrder.note}</p>
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
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Loading Order Details</h3>
                  <p className="text-gray-600 dark:text-gray-300">Please wait while we fetch the complete order information...</p>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FiAlertTriangle className="h-5 w-5 text-red-500" />
              Delete Order
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete order #
              {orderToDelete?.id ? orderToDelete.id.slice(0, 8) : 'N/A'}? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setOrderToDelete(null)
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  orderToDelete && handleDeleteOrder(orderToDelete)
                }
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="flex items-center gap-2">
                    <FiLoader className="h-4 w-4 animate-spin" />
                    Deleting...
                  </div>
                ) : (
                  'Delete Order'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}