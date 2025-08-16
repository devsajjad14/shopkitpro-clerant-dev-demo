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
  FiMail,
  FiEye,
  FiArrowRight,
  FiRefreshCw,
  FiAlertTriangle,
  FiToggleLeft,
  FiToggleRight
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
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'

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
  activeSessions: number
  abandonmentRate: number
  totalRevenue: number
  lostRevenue: number
  averageOrderValue: number
  recoveryRate: number
  emailsSent: number
  emailsOpened: number
  emailsClicked: number
  abandonmentTrend: { day: string, totalSessions: number, abandonedSessions: number, completedSessions: number }[] // Updated for new chart data
  deviceBreakdown: { [key: string]: number } // Added for new chart data
  dailyRevenue: number[] // Added for daily revenue chart
}

interface RecoveryStats {
  recoveryRate: number
  totalRecovered: number
  totalAbandoned: number
  totalRecoveryAmount: number
  avgRecoveryAmount: number
  emailMetrics: {
    totalSent: number
    totalOpened: number
    totalClicked: number
    openRate: number
    clickRate: number
  }
  recentRecoveries: Array<{
    id: string
    customerName: string
    customerEmail: string
    recoveryAmount: number
    itemCount: number
    abandonedAt: string
    recoveredAt: string
    timeToRecovery: number
  }>
}

// Simple Toggle Component
function CartAbandonmentToggle() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchToggleStatus()
  }, [])

  const fetchToggleStatus = async () => {
    try {
      const response = await fetch('/api/cart-abandonment-toggle')
      const data = await response.json()
      setIsEnabled(data.success && data.data?.isEnabled)
    } catch (error) {
      console.error('Failed to fetch toggle status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async () => {
    try {
      const response = await fetch('/api/cart-abandonment-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: !isEnabled })
      })
      
      if (response.ok) {
        setIsEnabled(!isEnabled)
      }
    } catch (error) {
      console.error('Failed to toggle cart abandonment:', error)
    }
  }

  if (loading) {
    return <div className="animate-pulse h-10 bg-gray-200 rounded-lg w-32"></div>
  }

  return (
    <Button
      onClick={handleToggle}
      variant="outline"
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        isEnabled 
          ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
      }`}
    >
      {isEnabled ? (
        <>
          <FiToggleRight className="w-5 h-5 text-green-600" />
          <span>Enabled</span>
        </>
      ) : (
        <>
          <FiToggleLeft className="w-5 h-5 text-gray-600" />
          <span>Disabled</span>
        </>
      )}
    </Button>
  )
}

export default function CartAbandonmentPage() {
  const [analytics, setAnalytics] = useState<CartAnalytics | null>(null)
  const [recoveryStats, setRecoveryStats] = useState<RecoveryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Check if cart abandonment is enabled
      const toggleResponse = await fetch('/api/cart-abandonment-toggle')
      const toggleData = await toggleResponse.json()
      console.log('Toggle data:', toggleData)
      setIsEnabled(toggleData.success && toggleData.data?.isEnabled)

      if (toggleData.success && toggleData.data?.isEnabled) {
        // Fetch analytics data
        const analyticsResponse = await fetch('/api/analytics/cart-abandonment?days=7')
        const analyticsData = await analyticsResponse.json()
        console.log('Analytics data:', analyticsData)
        
        if (analyticsData.success) {
          setAnalytics(analyticsData.analytics)
          console.log('Set analytics:', analyticsData.analytics)
        }
        
        // Fetch recovery stats
        const recoveryResponse = await fetch('/api/analytics/recovery-stats?period=7')
        const recoveryData = await recoveryResponse.json()
        console.log('Recovery data:', recoveryData)
        
        if (recoveryData.success) {
          setRecoveryStats(recoveryData.data)
          console.log('Set recovery stats:', recoveryData.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch cart abandonment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      // Trigger abandonment detection by calling the analytics API
      await fetch('/api/analytics/cart-abandonment?days=7')
      await fetchData()
    } catch (error) {
      console.error('Failed to refresh cart abandonment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const enableCartAbandonment = async () => {
    try {
      const response = await fetch('/api/cart-abandonment-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: true })
      })
      
      if (response.ok) {
        setIsEnabled(true)
        await fetchData()
        toast.success('Cart abandonment tracking enabled!')
      }
    } catch (error) {
      console.error('Failed to enable cart abandonment:', error)
      toast.error('Failed to enable cart abandonment tracking')
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

  // Build chart data from real analytics
  const abandonmentTrendData = analytics?.abandonmentTrend && analytics.abandonmentTrend.length > 0 ? {
    labels: analytics.abandonmentTrend.map((d: any) => new Date(d.day).toLocaleDateString()),
    datasets: [
      {
        label: 'Abandonment Rate (%)',
        data: analytics.abandonmentTrend.map((d: any) => d.abandonmentRate),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
    ],
  } : null;

  const deviceLabels = analytics?.deviceBreakdown ? Object.keys(analytics.deviceBreakdown) : [];
  const deviceCounts = analytics?.deviceBreakdown ? Object.values(analytics.deviceBreakdown) : [];
  const deviceData = deviceLabels.length > 0 ? {
    labels: deviceLabels,
    datasets: [
      {
        data: deviceCounts,
        backgroundColor: [
          'rgb(59, 130, 246)', // blue
          'rgb(16, 185, 129)', // green
          'rgb(245, 158, 11)', // yellow
          'rgb(239, 68, 68)', // red
          'rgb(107, 114, 128)', // gray
        ],
      },
    ],
  } : null;

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

  // Show enable message if cart abandonment is disabled
  if (!isEnabled) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              Cart Abandonment
              <CartAbandonmentToggle />
            </h1>
            <p className="text-gray-600 mt-2">
              Track and recover abandoned shopping carts to increase conversions
            </p>
          </div>
        </div>

        {/* Enable Cart Abandonment Message */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FiShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Cart Abandonment Tracking is Disabled
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Enable cart abandonment tracking to start monitoring cart sessions, 
                identify abandoned carts, and send recovery emails to increase conversions.
              </p>
              <Button onClick={enableCartAbandonment} className="bg-blue-600 hover:bg-blue-700">
                <FiToggleRight className="w-4 h-4 mr-2" />
                Enable Cart Abandonment Tracking
              </Button>
            </div>
          </CardContent>
        </Card>
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
                    Cart Abandonment
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-base mt-1">
                    Track and recover abandoned shopping carts to increase conversions
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-11 px-6 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 hover:text-red-900 font-semibold shadow-sm flex items-center gap-2 rounded-xl transition-all duration-200"
                  >
                    <FiAlertTriangle className="w-5 h-5 text-red-500" />
                    Erase All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Erase All Data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will <span className="font-semibold text-red-600">permanently delete</span> <b>all cart abandonment and session data</b> from your database. This action cannot be undone.<br /><br />
                      <span className="text-sm text-gray-500">All analytics, abandoned carts, and recovery campaign data will be erased. <b>Your cart abandonment toggle settings will be preserved.</b> Are you sure you want to proceed?</span>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-sm"
                      onClick={async () => {
                        const res = await fetch('/api/cart-abandonment/erase-all', { method: 'POST' })
                        const data = await res.json()
                        if (data.success) {
                          toast.success('All cart abandonment data erased! Toggle settings preserved.')
                          window.location.reload()
                        } else {
                          toast.error('Failed to erase data: ' + (data.error || 'Unknown error'))
                        }
                      }}
                    >
                      Confirm Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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

             {/* Premium Key Metrics */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="relative group">
           <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
           <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Abandonment Rate</h3>
               <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                 <FiShoppingCart className="h-5 w-5 text-white" />
               </div>
             </div>
             <div className="text-3xl font-bold mb-3">
               <span className={getAbandonmentRateColor(analytics?.abandonmentRate || 0)}>
                 {(analytics?.abandonmentRate || 0).toFixed(1)}%
               </span>
             </div>
             <Progress value={analytics?.abandonmentRate || 0} className="mb-3" />
             <p className="text-xs text-gray-600 dark:text-gray-400">
               {analytics?.abandonedSessions || 0} of {analytics?.totalSessions || 0} carts abandoned
             </p>
           </div>
         </div>

         <div className="relative group">
           <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
           <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recovery Rate</h3>
               <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                 <FiTrendingUp className="h-5 w-5 text-white" />
               </div>
             </div>
             <div className="text-3xl font-bold mb-3">
               <span className={getRecoveryRateColor(recoveryStats?.recoveryRate || 0)}>
                 {(recoveryStats?.recoveryRate || 0).toFixed(1)}%
               </span>
             </div>
             <Progress value={recoveryStats?.recoveryRate || 0} className="mb-3" />
             <p className="text-xs text-gray-600 dark:text-gray-400">
               {recoveryStats?.totalRecovered || 0} of {recoveryStats?.totalAbandoned || 0} carts recovered
             </p>
           </div>
         </div>

         <div className="relative group">
           <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
           <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Lost Revenue</h3>
               <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                 <FiDollarSign className="h-5 w-5 text-white" />
               </div>
             </div>
             <div className="text-3xl font-bold text-red-600 mb-3">
               ${(analytics?.lostRevenue || 0).toLocaleString()}
             </div>
             <p className="text-xs text-gray-600 dark:text-gray-400">
               Potential revenue from abandoned carts
             </p>
           </div>
         </div>

         <div className="relative group">
           <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
           <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Avg Order Value</h3>
               <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                 <FiUsers className="h-5 w-5 text-white" />
               </div>
             </div>
             <div className="text-3xl font-bold text-green-600 mb-3">
               ${(analytics?.averageOrderValue || 0).toFixed(2)}
             </div>
             <p className="text-xs text-gray-600 dark:text-gray-400">
               Average value of completed orders
             </p>
           </div>
         </div>
       </div>

      {/* Premium Recovery Metrics */}
      {recoveryStats && (
        <div className="space-y-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FiTrendingUp className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recovery Performance</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-green-500/10 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                  <div className="relative bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-600/50 shadow-lg p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recovery Rate</h3>
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                        <FiTrendingUp className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold mb-2">
                      <span className={getRecoveryRateColor(recoveryStats.recoveryRate || 0)}>
                        {(recoveryStats.recoveryRate || 0).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={recoveryStats.recoveryRate} className="mb-2" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {recoveryStats.totalRecovered} of {recoveryStats.totalAbandoned} carts recovered
                    </p>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-green-500/10 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                  <div className="relative bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-600/50 shadow-lg p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recovered Revenue</h3>
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                        <FiDollarSign className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      ${(recoveryStats.totalRecoveryAmount || 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Total revenue from recovered carts
                    </p>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-blue-500/10 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                  <div className="relative bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-600/50 shadow-lg p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Avg Recovery Value</h3>
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                        <FiUsers className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      ${(recoveryStats.avgRecoveryAmount || 0).toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Average value of recovered orders
                    </p>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-purple-500/10 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                  <div className="relative bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-600/50 shadow-lg p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Performance</h3>
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                        <FiMail className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      {recoveryStats.emailMetrics?.totalSent || 0}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Recovery emails sent
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Recent Recoveries */}
          {recoveryStats.recentRecoveries.length > 0 && (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FiTrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Recoveries</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Latest cart recoveries from abandoned carts</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {recoveryStats.recentRecoveries.map((recovery) => (
                    <div key={recovery.id} className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-green-500/10 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                      <div className="relative bg-green-50/80 dark:bg-green-900/20 backdrop-blur-xl rounded-xl border border-green-200/50 dark:border-green-700/30 shadow-lg p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                              <FiTrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{recovery.customerName}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{recovery.customerEmail}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {recovery.itemCount || 0} items • {(recovery.timeToRecovery || 0).toFixed(1)} hours to recover
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600 text-lg">${(recovery.recoveryAmount || 0).toFixed(2)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(recovery.recoveredAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Premium Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                <FiShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Cart Status Distribution</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Breakdown of cart sessions by status</p>
              </div>
            </div>
            <div className="h-64">
              {!analytics || analytics.totalSessions === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <FiShoppingCart className="w-12 h-12 mb-2" />
                  <div className="text-lg font-semibold">No cart data yet</div>
                  <div className="text-sm">Status distribution will appear here once you have data.</div>
                </div>
              ) : (
                <Doughnut 
                  data={{
                    labels: ['Completed', 'Abandoned', 'Recovered'],
                    datasets: [{
                      data: [
                        analytics.completedSessions,
                        analytics.abandonedSessions,
                        recoveryStats?.totalRecovered || 0
                      ],
                      backgroundColor: [
                        'rgb(34, 197, 94)', // green
                        'rgb(239, 68, 68)', // red
                        'rgb(168, 85, 247)' // purple
                      ],
                      borderColor: [
                        'rgb(22, 163, 74)',
                        'rgb(220, 38, 38)',
                        'rgb(147, 51, 234)'
                      ],
                      borderWidth: 2,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 20,
                          usePointStyle: true,
                          font: {
                            size: 12
                          }
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                <FiTrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Daily Cart Activity</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Cart sessions created over the last 7 days</p>
              </div>
            </div>
            <div className="h-64">
              {!analytics ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <FiTrendingUp className="w-12 h-12 mb-2" />
                  <div className="text-lg font-semibold">No cart activity yet</div>
                  <div className="text-sm">Cart activity will appear here once users start adding items to cart.</div>
                </div>
              ) : (
                <Bar 
                  data={{
                    labels: (() => {
                      const labels = []
                      for (let i = 6; i >= 0; i--) {
                        const date = new Date()
                        date.setDate(date.getDate() - i)
                        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
                      }
                      return labels
                    })(),
                    datasets: [
                      {
                        label: 'Cart Sessions',
                        data: (() => {
                          console.log('Rendering chart with analytics:', analytics)
                          console.log('abandonmentTrend:', analytics?.abandonmentTrend)
                          return analytics.abandonmentTrend?.map(item => Number(item.totalSessions)) || [0, 0, 0, 0, 0, 0, 0]
                        })(),
                        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 1,
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          usePointStyle: true,
                          font: {
                            size: 12
                          }
                        }
                      }
                    },
                    scales: {
                      x: {
                        grid: {
                          display: false
                        },
                        ticks: {
                          font: {
                            size: 12
                          }
                        }
                      },
                      y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return Math.floor(Number(value));
                          }
                        },
                        title: {
                          display: true,
                          text: 'Number of Sessions'
                        }
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Premium Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiTrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recovered Carts</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">View all recovered cart sessions</p>
              </div>
            </div>
            <Button asChild className="w-full h-12 bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white shadow-md hover:shadow-lg rounded-xl transition-all duration-200 transform hover:scale-105">
              <a href="/admin/cart-abandonment/recovered">
                View Recovered Carts
                <FiArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                <FiShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Abandoned Carts</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">View and manage abandoned carts</p>
              </div>
            </div>
            <Button asChild className="w-full h-12 bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white shadow-md hover:shadow-lg rounded-xl transition-all duration-200 transform hover:scale-105">
              <a href="/admin/cart-abandonment/carts">
                View Carts
                <FiArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 