'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { 
  FiTrendingUp, 
  FiDollarSign, 
  FiClock, 
  FiUser,
  FiMail,
  FiShoppingCart,
  FiSearch,
  FiRefreshCw,
  FiEye,
  FiX
} from 'react-icons/fi'
import { toast } from 'sonner'

interface RecoveredCart {
  id: string
  abandonedCartId: string
  recoverySessionId: string
  customerName: string
  customerEmail: string
  recoveryAmount: number
  itemCount: number
  recoveredAt: string
  timeToRecoveryHours: number
  originalTotalAmount: number
  originalItemCount: number
  abandonedAt: string
  createdAt: string
}

export default function RecoveredCartsPage() {
  const [recoveredCarts, setRecoveredCarts] = useState<RecoveredCart[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCart, setSelectedCart] = useState<RecoveredCart | null>(null)
  const [stats, setStats] = useState({
    totalRecovered: 0,
    totalRevenue: 0,
    avgRecoveryTime: 0,
    avgRecoveryValue: 0
  })

  useEffect(() => {
    fetchRecoveredCarts()
  }, [])

  const fetchRecoveredCarts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analytics/recovered-carts?days=365')
      const data = await response.json()
      
      if (data.success) {
        setRecoveredCarts(data.carts || [])
        
        // Calculate stats
        const recoveries = data.carts || []
        const totalRevenue = recoveries.reduce((sum: number, cart: RecoveredCart) => sum + cart.recoveryAmount, 0)
        const avgRecoveryTime = recoveries.length > 0 
          ? recoveries.reduce((sum: number, cart: RecoveredCart) => sum + cart.timeToRecoveryHours, 0) / recoveries.length 
          : 0
        const avgRecoveryValue = recoveries.length > 0 ? totalRevenue / recoveries.length : 0
        
        setStats({
          totalRecovered: recoveries.length,
          totalRevenue,
          avgRecoveryTime,
          avgRecoveryValue
        })
      }
    } catch (error) {
      console.error('Failed to fetch recovered carts:', error)
      toast.error('Failed to load recovered carts')
    } finally {
      setLoading(false)
    }
  }

  const filteredCarts = recoveredCarts.filter(cart =>
    cart.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cart.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatTimeToRecovery = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)} minutes`
    if (hours < 24) return `${hours.toFixed(1)} hours`
    return `${(hours / 24).toFixed(1)} days`
  }

  const getRecoveryTimeColor = (hours: number) => {
    if (hours < 2) return 'text-green-600'
    if (hours < 24) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
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
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FiTrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Recovered Carts
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-base mt-1">
                    Successfully recovered abandoned shopping carts
                  </p>
                </div>
              </div>
            </div>
            <Button 
              onClick={fetchRecoveredCarts} 
              variant="outline" 
              size="sm" 
              disabled={loading}
              className="h-11 px-6 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 hover:border-[#00437f] hover:bg-[#00437f]/5 rounded-xl transition-all duration-200"
            >
              <FiRefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Premium Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Recovered</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.totalRecovered}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Carts successfully recovered</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiTrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recovered Revenue</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total revenue from recoveries</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiDollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Avg Recovery Time</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatTimeToRecovery(stats.avgRecoveryTime)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Average time to recovery</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiClock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Avg Recovery Value</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  ${stats.avgRecoveryValue.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Average value per recovery</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiShoppingCart className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Search and Filters */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <FiTrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recovered Carts</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">View all successfully recovered abandoned carts</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by customer name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-[#00437f]/20 rounded-xl transition-all duration-200"
              />
            </div>
            <Badge variant="secondary" className="text-sm bg-gradient-to-r from-green-500 to-green-600 text-white">
              {filteredCarts.length} recovered carts
            </Badge>
          </div>

          {filteredCarts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
                <FiTrendingUp className="w-8 h-8 text-white" />
              </div>
              <p className="text-lg font-semibold">No recovered carts yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Recovered carts will appear here once customers complete purchases after receiving recovery emails.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-xl blur-lg"></div>
                <div className="relative bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-600/50 shadow-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                      <tr>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Customer</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Recovery Amount</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Items</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Abandoned</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Recovered</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Time to Recovery</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/60 dark:bg-gray-800/60 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredCarts.map((cart) => (
                        <tr key={cart.id} className="hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 transition-all duration-300 group">
                          <td className="py-4 px-6">
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">{cart.customerName}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                                <FiMail className="w-3 h-3" />
                                {cart.customerEmail}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-green-600 dark:text-green-400">
                              ${cart.recoveryAmount.toFixed(2)}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant="outline" className="text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500">
                              {cart.itemCount} items
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              {new Date(cart.abandonedAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(cart.abandonedAt).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              {new Date(cart.recoveredAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(cart.recoveredAt).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className={`text-sm font-semibold ${getRecoveryTimeColor(cart.timeToRecoveryHours)}`}>
                              {formatTimeToRecovery(cart.timeToRecoveryHours)}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedCart(cart)}
                                  className="h-10 px-4 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 hover:border-[#00437f] hover:bg-[#00437f]/5 rounded-xl transition-all duration-200"
                                >
                                  <FiEye className="w-4 h-4 mr-2" />
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl relative sm:max-w-[600px] [&>button]:hidden max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-2xl" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999 }}>
                                {/* Custom Close Button */}
                                <DialogClose asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-4 top-4 h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-50"
                                  >
                                    <FiX className="h-4 w-4" />
                                    <span className="sr-only">Close</span>
                                  </Button>
                                </DialogClose>
                                
                                <DialogHeader className="pr-12">
                                  <DialogTitle className="text-xl font-semibold text-[#00437f] dark:text-blue-400">Recovery Details</DialogTitle>
                                  <DialogDescription className="text-gray-600 dark:text-gray-300">
                                    Detailed information about this cart recovery
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedCart && (
                                  <div className="space-y-6 pt-2">
                                    {/* Customer Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/5 rounded-lg blur-sm"></div>
                                        <div className="relative bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl rounded-lg p-4 border border-white/20 dark:border-gray-600/50">
                                          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide mb-3">
                                            <FiUser className="w-4 h-4 text-blue-600" />
                                            Customer Information
                                          </h4>
                                          <div className="space-y-2">
                                            <div className="flex justify-between">
                                              <span className="text-sm text-gray-600 dark:text-gray-400">Name:</span>
                                              <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedCart.customerName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
                                              <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedCart.customerEmail}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/5 rounded-lg blur-sm"></div>
                                        <div className="relative bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl rounded-lg p-4 border border-white/20 dark:border-gray-600/50">
                                          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide mb-3">
                                            <FiDollarSign className="w-4 h-4 text-green-600" />
                                            Financial Details
                                          </h4>
                                          <div className="space-y-2">
                                            <div className="flex justify-between">
                                              <span className="text-sm text-gray-600 dark:text-gray-400">Recovery Amount:</span>
                                              <span className="text-lg font-bold text-green-600 dark:text-green-400">${selectedCart.recoveryAmount.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-sm text-gray-600 dark:text-gray-400">Original Amount:</span>
                                              <span className="text-sm font-medium text-gray-900 dark:text-white">${selectedCart.originalTotalAmount?.toFixed(2) || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-sm text-gray-600 dark:text-gray-400">Items:</span>
                                              <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedCart.itemCount} items</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="space-y-3">
                                      <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide">
                                        <FiClock className="w-4 h-4 text-purple-600" />
                                        Recovery Timeline
                                      </h4>
                                      <div className="space-y-3">
                                        <div className="relative group">
                                          <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 via-transparent to-gray-500/5 rounded-lg blur-sm"></div>
                                          <div className="relative bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl rounded-lg p-4 border border-white/20 dark:border-gray-600/50 border-l-4 border-gray-400">
                                            <div className="flex items-center gap-4">
                                              <div className="flex-1">
                                                <p className="font-semibold text-gray-900 dark:text-white">Cart Abandoned</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">{new Date(selectedCart.abandonedAt).toLocaleString()}</p>
                                              </div>
                                              <Badge variant="secondary" className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">Abandoned</Badge>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="relative group">
                                          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/5 rounded-lg blur-sm"></div>
                                          <div className="relative bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl rounded-lg p-4 border border-white/20 dark:border-gray-600/50 border-l-4 border-green-500">
                                            <div className="flex items-center gap-4">
                                              <div className="flex-1">
                                                <p className="font-semibold text-gray-900 dark:text-white">Cart Recovered</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">{new Date(selectedCart.recoveredAt).toLocaleString()}</p>
                                              </div>
                                              <Badge variant="default" className="bg-gradient-to-r from-green-600 to-green-700 text-white">Recovered</Badge>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Recovery Performance */}
                                    <div className="space-y-3">
                                      <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide">
                                        <FiTrendingUp className="w-4 h-4 text-orange-600" />
                                        Recovery Performance
                                      </h4>
                                      <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/5 rounded-lg blur-sm"></div>
                                        <div className="relative bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl rounded-lg p-4 border border-white/20 dark:border-gray-600/50 space-y-3">
                                          <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Time to Recovery:</span>
                                            <span className={`text-sm font-semibold ${getRecoveryTimeColor(selectedCart.timeToRecoveryHours)}`}>
                                              {formatTimeToRecovery(selectedCart.timeToRecoveryHours)}
                                            </span>
                                          </div>
                                          <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                              <span className="text-sm text-gray-600 dark:text-gray-400">Recovery Session ID:</span>
                                              <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs font-mono border">{selectedCart.recoverySessionId}</code>
                                            </div>
                                            <div className="flex justify-between items-center">
                                              <span className="text-sm text-gray-600 dark:text-gray-400">Original Cart ID:</span>
                                              <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs font-mono border">{selectedCart.abandonedCartId}</code>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
                         </div>
           )}
         </div>
       </div>
     </div>
   )
 } 