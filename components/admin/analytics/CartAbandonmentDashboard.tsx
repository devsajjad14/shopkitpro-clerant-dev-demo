'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  FiShoppingCart, 
  FiDollarSign, 
  FiUsers, 
  FiTrendingUp, 
  FiTrendingDown,
  FiClock,
  FiMail,
  FiEye,
  FiArrowRight,
  FiRefreshCw
} from 'react-icons/fi'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

interface CartAnalytics {
  totalSessions: number
  abandonedSessions: number
  completedSessions: number
  abandonmentRate: number
  totalRevenue: number
  lostRevenue: number
  averageOrderValue: number
  recoveryRate: number
  emailsSent: number
  emailsOpened: number
  emailsClicked: number
}

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
}

export default function CartAbandonmentDashboard() {
  const [analytics, setAnalytics] = useState<CartAnalytics | null>(null)
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState(7) // days

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // Fetch analytics data
      const analyticsResponse = await fetch(`/api/analytics/cart-abandonment?days=${timeRange}`)
      const analyticsData = await analyticsResponse.json()
      
      if (analyticsData.success) {
        setAnalytics(analyticsData.analytics)
      }

      // Fetch abandoned carts
      const cartsResponse = await fetch(`/api/analytics/abandoned-carts?days=${timeRange}`)
      const cartsData = await cartsResponse.json()
      
      if (cartsData.success) {
        setAbandonedCarts(cartsData.carts)
      }
    } catch (error) {
      console.error('Failed to fetch cart abandonment analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAbandonmentRateColor = (rate: number) => {
    if (rate < 50) return 'text-green-600'
    if (rate < 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRecoveryRateColor = (rate: number) => {
    if (rate > 20) return 'text-green-600'
    if (rate > 10) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      // Trigger abandonment detection by calling the analytics API
      await fetch('/api/analytics/cart-abandonment?days=7')
      await fetchAnalytics()
    } catch (error) {
      console.error('Failed to refresh abandonment data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No cart abandonment data available
          </div>
        </CardContent>
      </Card>
    )
  }

  // Remove chart data and chart rendering for trend, device, and email performance
  // Only keep key metrics and abandoned carts table

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Cart Abandonment Analytics</h2>
          <p className="text-gray-600">Track and analyze abandoned shopping carts</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
          <FiRefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abandonment Rate</CardTitle>
            <FiShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getAbandonmentRateColor(analytics?.abandonmentRate || 0)}>
                {(analytics?.abandonmentRate || 0).toFixed(1)}%
              </span>
            </div>
            <Progress value={analytics?.abandonmentRate || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {analytics?.abandonedSessions || 0} of {analytics?.totalSessions || 0} carts abandoned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lost Revenue</CardTitle>
            <FiDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${(analytics?.lostRevenue || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Potential revenue from abandoned carts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <FiUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${(analytics?.averageOrderValue || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Average value of completed orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Abandoned Carts Table with Email Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Abandoned Carts</CardTitle>
          <CardDescription>Latest abandoned carts that need attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {abandonedCarts && abandonedCarts.length > 0 ? (
              abandonedCarts.slice(0, 5).map((cart) => (
                <div key={cart.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <FiShoppingCart className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {cart.customerName || cart.customerEmail}
                      </p>
                      <p className="text-sm text-gray-500">
                        {cart.itemCount || 0} items • ${(cart.totalAmount || 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">
                        Abandoned {cart.abandonedAt ? new Date(cart.abandonedAt).toLocaleString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No abandoned carts found</p>
              </div>
            )}
          </div>
          {abandonedCarts && abandonedCarts.length > 5 && (
            <div className="mt-4 text-center">
              <Button variant="outline">
                View All Abandoned Carts
                <FiArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 