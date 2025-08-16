'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  FiShoppingCart, 
  FiMail, 
  FiEye, 
  FiSearch,
  FiFilter,
  FiDownload,
  FiRefreshCw
} from 'react-icons/fi'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'

interface AbandonedCart {
  id: string
  sessionId: string
  customerEmail: string
  customerName: string
  totalAmount: number
  itemCount: number
  abandonedAt: string
  device: string
  browser: string
  source: string
  emailsSent: number
  lastEmailSent: string | null
  country: string
  city: string
}

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [timeRange, setTimeRange] = useState(7)
  const [filterDevice, setFilterDevice] = useState('all')
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchAbandonedCarts()
  }, [timeRange])

  const fetchAbandonedCarts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/abandoned-carts?days=${timeRange}`)
      const data = await response.json()
      
      if (data.success) {
        setCarts(data.carts)
      }
    } catch (error) {
      console.error('Failed to fetch abandoned carts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendRecoveryEmail = async (cartId: string) => {
    try {
      const response = await fetch(`/api/recovery/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId })
      })
      
      if (response.ok) {
        fetchAbandonedCarts() // Refresh the list
      }
    } catch (error) {
      console.error('Failed to send recovery email:', error)
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      // Trigger abandonment detection by calling the abandoned carts API
      await fetch(`/api/analytics/abandoned-carts?days=${timeRange}`)
      await fetchAbandonedCarts()
    } catch (error) {
      console.error('Failed to refresh abandoned carts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCarts = carts.filter(cart => {
    const matchesSearch = 
      cart.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cart.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cart.sessionId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDevice = filterDevice === 'all' || cart.device === filterDevice
    
    return matchesSearch && matchesDevice
  })

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return '📱'
      case 'desktop': return '💻'
      case 'tablet': return '📱'
      default: return '🖥️'
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-3xl"></div>
        <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                  <FiShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Abandoned Carts
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-base mt-1">
                    View and manage abandoned shopping carts
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm" 
                disabled={loading}
                className="h-11 px-6 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 hover:border-[#00437f] hover:bg-[#00437f]/5 rounded-xl transition-all duration-200"
              >
                <FiRefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="h-11 px-6 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 hover:border-[#00437f] hover:bg-[#00437f]/5 rounded-xl transition-all duration-200"
              >
                <FiDownload className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Policy Notice */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-3 h-3 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
            <div>
              <p className="text-base font-semibold text-gray-900 dark:text-white">24-Hour Abandonment Policy</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                All inactive shopping carts are automatically marked as abandoned after 24 hours of inactivity. 
                This ensures accurate tracking and timely recovery campaigns.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Filters */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
              <FiFilter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Filter abandoned carts by various criteria</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Search</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by email, name, or session ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-[#00437f]/20 rounded-xl transition-all duration-200"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Time Range</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="w-full h-12 px-3 py-2 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-[#00437f]/20 rounded-xl text-sm transition-all duration-200"
              >
                <option value={1}>Last 24 hours</option>
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Device</label>
              <select
                value={filterDevice}
                onChange={(e) => setFilterDevice(e.target.value)}
                className="w-full h-12 px-3 py-2 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-[#00437f]/20 rounded-xl text-sm transition-all duration-200"
              >
                <option value="all">All Devices</option>
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
                <option value="tablet">Tablet</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Carts</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{carts.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiShoppingCart className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Value</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${carts.reduce((sum, cart) => sum + cart.totalAmount, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiMail className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Avg Cart Value</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${carts.length > 0 ? (carts.reduce((sum, cart) => sum + cart.totalAmount, 0) / carts.length).toFixed(2) : '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiEye className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Emails Sent</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {carts.reduce((sum, cart) => sum + cart.emailsSent, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiMail className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Carts List */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
              <FiShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Abandoned Carts ({filteredCarts.length})</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Manage and recover abandoned shopping carts</p>
            </div>
          </div>
          
          {filteredCarts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
                <FiShoppingCart className="w-8 h-8 text-white" />
              </div>
              <p className="text-lg font-semibold">No abandoned carts found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Carts will appear here once customers abandon their shopping carts</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCarts.map((cart) => (
                <div key={cart.id} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                  <div className="relative bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-600/50 shadow-lg p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg text-white text-xl">
                          {getDeviceIcon(cart.device)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {cart.customerName || cart.customerEmail}
                            </h3>
                            <Badge variant="outline" className="text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500">
                              {cart.device}
                            </Badge>
                            {cart.emailsSent > 0 && (
                              <Badge variant="secondary" className="text-xs bg-gradient-to-r from-green-500 to-green-600 text-white">
                                {cart.emailsSent} emails
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                            {cart.itemCount} items • <span className="font-semibold text-green-600 dark:text-green-400">${cart.totalAmount.toFixed(2)}</span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Abandoned {getTimeAgo(cart.abandonedAt)} • {cart.browser} • {cart.source}
                          </p>
                          {cart.country && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              📍 {cart.city}, {cart.country}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <AlertDialog open={modalOpen && selectedCart?.id === cart.id} onOpenChange={open => { setModalOpen(open); if (!open) setSelectedCart(null) }}>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => { setSelectedCart(cart); setModalOpen(true) }}
                              className="h-10 px-4 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 hover:border-[#00437f] hover:bg-[#00437f]/5 rounded-xl transition-all duration-200"
                            >
                              <FiEye className="w-4 h-4 mr-2" /> View Details
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-2xl font-bold text-[#00437f] dark:text-blue-400 flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-lg flex items-center justify-center shadow-md">
                                  <FiShoppingCart className="w-4 h-4 text-white" />
                                </div>
                                Cart Details
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                                Cart details and customer information.
                              </AlertDialogDescription>
                              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative group">
                                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/5 rounded-lg blur-sm"></div>
                                  <div className="relative bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl rounded-lg p-4 border border-white/20 dark:border-gray-600/50">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Customer</div>
                                    <div className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                      <FiMail className="w-4 h-4 text-blue-500" /> 
                                      {selectedCart?.customerName || selectedCart?.customerEmail}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{selectedCart?.customerEmail}</div>
                                  </div>
                                </div>
                                <div className="relative group">
                                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-yellow-500/5 rounded-lg blur-sm"></div>
                                  <div className="relative bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl rounded-lg p-4 border border-white/20 dark:border-gray-600/50">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</div>
                                    <Badge variant="outline" className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-500">Abandoned</Badge>
                                  </div>
                                </div>
                                <div className="relative group">
                                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/5 rounded-lg blur-sm"></div>
                                  <div className="relative bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl rounded-lg p-4 border border-white/20 dark:border-gray-600/50">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Items</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{selectedCart?.itemCount || 0}</div>
                                  </div>
                                </div>
                                <div className="relative group">
                                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/5 rounded-lg blur-sm"></div>
                                  <div className="relative bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl rounded-lg p-4 border border-white/20 dark:border-gray-600/50">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Value</div>
                                    <div className="font-medium text-green-700 dark:text-green-400">${(selectedCart?.totalAmount || 0).toLocaleString()}</div>
                                  </div>
                                </div>
                                <div className="relative group">
                                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-500/5 rounded-lg blur-sm"></div>
                                  <div className="relative bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl rounded-lg p-4 border border-white/20 dark:border-gray-600/50">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Abandoned At</div>
                                    <div className="text-gray-700 dark:text-gray-300">{selectedCart?.abandonedAt ? new Date(selectedCart.abandonedAt).toLocaleString() : 'Unknown'}</div>
                                  </div>
                                </div>
                                {selectedCart?.device && (
                                  <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/5 rounded-lg blur-sm"></div>
                                    <div className="relative bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl rounded-lg p-4 border border-white/20 dark:border-gray-600/50">
                                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Device</div>
                                      <div className="text-gray-700 dark:text-gray-300 capitalize">{selectedCart.device}</div>
                                    </div>
                                  </div>
                                )}
                                {selectedCart?.country && (
                                  <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-indigo-500/5 rounded-lg blur-sm"></div>
                                    <div className="relative bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl rounded-lg p-4 border border-white/20 dark:border-gray-600/50">
                                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Location</div>
                                      <div className="text-gray-700 dark:text-gray-300">{selectedCart.country}{selectedCart.city ? `, ${selectedCart.city}` : ''}</div>
                                    </div>
                                  </div>
                                )}
                                <div className="relative group">
                                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-500/5 rounded-lg blur-sm"></div>
                                  <div className="relative bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl rounded-lg p-4 border border-white/20 dark:border-gray-600/50">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Emails Sent</div>
                                    <div className="text-gray-700 dark:text-gray-300">{selectedCart?.emailsSent || 0}</div>
                                  </div>
                                </div>
                                {selectedCart?.lastEmailSent && (
                                  <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-pink-500/5 rounded-lg blur-sm"></div>
                                    <div className="relative bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl rounded-lg p-4 border border-white/20 dark:border-gray-600/50">
                                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Email Sent</div>
                                      <div className="text-gray-700 dark:text-gray-300">{new Date(selectedCart.lastEmailSent).toLocaleString()}</div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </AlertDialogHeader>
                            <AlertDialogCancel className="mt-6 h-11 px-6 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 hover:border-[#00437f] hover:bg-[#00437f]/5 rounded-xl transition-all duration-200">Close</AlertDialogCancel>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 