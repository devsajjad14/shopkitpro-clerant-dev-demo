'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { Button } from '@/components/ui/button'
import {
  FiTrendingUp,
  FiDollarSign,
  FiShoppingCart,
  FiUsers,
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiChevronDown,
  FiArrowLeft,
  FiBarChart2,
  FiPieChart,
  FiActivity,
  FiTarget,
  FiX,
} from 'react-icons/fi'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'
import { Line as ChartLine, Bar as ChartBar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  Filler,
  ChartOptions,
  ScaleOptions,
  TooltipItem,
  ChartData
} from 'chart.js'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { addDays, format, isWithinInterval } from 'date-fns'
import { cn } from '@/lib/utils'
import { DateRange } from 'react-day-picker'
import { useRouter } from 'next/navigation'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  ChartLegend,
  Filler
)

interface SalesData {
  date: string
  revenue: number
  orders: number
  customers: number
  revenueMA: number
  ordersMA: number
  customersMA: number
}

interface CategoryData {
  category: string
  revenue: number
  orders: number
  type: string | null
}

interface ProductData {
  name: string
  sales: number
  revenue: number
}

interface Metrics {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  totalCustomers: number
  revenueChange: number
  ordersChange: number
  aovChange: number
  customersChange: number
}

interface SalesMetrics {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  averageOrderValue: number
  revenueChange: number
  ordersChange: number
  aovChange: number
  customersChange: number
}

interface SalesTrend {
  date: string
  revenue: number
  orders: number
  customers: number
  revenueMA: number
  ordersMA: number
  customersMA: number
}

interface AnalyticsContextType {
  timeRange: string
  setTimeRange: (range: string) => void
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
  isCustomRange: boolean
  setIsCustomRange: (isCustom: boolean) => void
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']



export default function SalesAnalyticsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<SalesMetrics>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    revenueChange: 0,
    ordersChange: 0,
    aovChange: 0,
    customersChange: 0
  })
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [productData, setProductData] = useState<ProductData[]>([])
  const [timeRange, setTimeRange] = useState('30d')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isCustomRange, setIsCustomRange] = useState(false)
  const router = useRouter()

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      let baseUrl = `/api/reports/sales`
      let queryParams = isCustomRange && dateRange?.from && dateRange?.to
        ? `startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`
        : `timeRange=${timeRange}`

      // Fetch metrics
      const metricsRes = await fetch(`${baseUrl}/metrics?${queryParams}`)
      if (!metricsRes.ok) {
        const errorData = await metricsRes.json()
        throw new Error(errorData.details || 'Failed to fetch metrics')
      }
      const metricsData = await metricsRes.json()
      setMetrics(metricsData)

      // Fetch sales trend
      const salesRes = await fetch(`${baseUrl}/trend?${queryParams}`)
      if (!salesRes.ok) {
        const errorData = await salesRes.json()
        throw new Error(errorData.details || 'Failed to fetch sales trend')
      }
      const salesTrendData = await salesRes.json()
      setSalesData(salesTrendData)

      // Fetch category data
      const categoryRes = await fetch(`${baseUrl}/categories?${queryParams}`)
      if (!categoryRes.ok) {
        const errorData = await categoryRes.json()
        throw new Error(errorData.details || 'Failed to fetch categories')
      }
      const categoryData = await categoryRes.json()
      setCategoryData(categoryData)

      // Fetch product data
      const productRes = await fetch(`${baseUrl}/products?${queryParams}`)
      if (!productRes.ok) {
        const errorData = await productRes.json()
        throw new Error(errorData.details || 'Failed to fetch products')
      }
      const productData = await productRes.json()
      setProductData(productData)

      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load sales data')
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to load sales data',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [timeRange, dateRange, isCustomRange])

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range)
    if (range?.from && range?.to) {
      setIsCustomRange(true)
      setTimeRange('custom')
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/reports/sales/export?timeRange=${timeRange}`)
      if (!response.ok) throw new Error('Failed to export data')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting data:', error)
      toast({
        title: "Error",
        description: "Failed to export sales data",
        variant: "destructive"
      })
    }
  }

  const chartData: ChartData<'line'> = {
    labels: salesData.map(d => d.date),
    datasets: [
      {
        label: 'Revenue',
        data: salesData.map(d => d.revenue),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Revenue (3-day MA)',
        data: salesData.map(d => d.revenueMA),
        borderColor: 'rgb(147, 197, 253)',
        borderDash: [5, 5],
        fill: false,
        tension: 0.4
      }
    ]
  }

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        type: 'linear',
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            if (typeof value === 'number') {
              return formatCurrency(value)
            }
            return value
          }
        }
      }
    }
  }

  // Calculate summary metrics
  const totalRevenue = salesData.reduce((sum, d) => sum + d.revenue, 0)
  const totalOrders = salesData.reduce((sum, d) => sum + d.orders, 0)
  const totalCustomers = salesData.reduce((sum, d) => sum + d.customers, 0)

  return (
    <AnalyticsContext.Provider value={{
      timeRange,
      setTimeRange,
      dateRange: dateRange || undefined,
      setDateRange: handleDateSelect,
      isCustomRange,
      setIsCustomRange
    }}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Premium Header */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00437f] to-[#003366] rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => router.back()}
                    className="p-3 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl hover:from-[#003366] hover:to-[#002855] text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <FiArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-[#00437f] to-[#003366] dark:from-white dark:via-blue-200 dark:to-blue-300 bg-clip-text text-transparent">
                      Sales Analytics
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      Track your sales performance and revenue metrics
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTimeRange('7d')
                      setIsCustomRange(false)
                      setDateRange({ from: undefined, to: undefined })
                    }}
                    className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 ${
                      timeRange === '7d' && !isCustomRange 
                        ? 'bg-gradient-to-r from-[#00437f] to-[#003366] text-white border-[#00437f] shadow-lg' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-[#00437f] hover:shadow-md'
                    }`}
                  >
                    <FiCalendar className="mr-2 h-4 w-4" />
                    7 Days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTimeRange('30d')
                      setIsCustomRange(false)
                      setDateRange({ from: undefined, to: undefined })
                    }}
                    className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 ${
                      timeRange === '30d' && !isCustomRange 
                        ? 'bg-gradient-to-r from-[#00437f] to-[#003366] text-white border-[#00437f] shadow-lg' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-[#00437f] hover:shadow-md'
                    }`}
                  >
                    <FiCalendar className="mr-2 h-4 w-4" />
                    30 Days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTimeRange('90d')
                      setIsCustomRange(false)
                      setDateRange({ from: undefined, to: undefined })
                    }}
                    className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 ${
                      timeRange === '90d' && !isCustomRange 
                        ? 'bg-gradient-to-r from-[#00437f] to-[#003366] text-white border-[#00437f] shadow-lg' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-[#00437f] hover:shadow-md'
                    }`}
                  >
                    <FiCalendar className="mr-2 h-4 w-4" />
                    90 Days
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={isCustomRange ? 'default' : 'outline'}
                        className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 ${
                          isCustomRange 
                            ? 'bg-gradient-to-r from-[#00437f] to-[#003366] text-white border-[#00437f] shadow-lg' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-[#00437f] hover:shadow-md'
                        }`}
                      >
                        <FiCalendar className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, 'LLL dd, y')} -{' '}
                              {format(dateRange.to, 'LLL dd, y')}
                            </>
                          ) : (
                            format(dateRange.from, 'LLL dd, y')
                          )
                        ) : (
                          <span>Custom Range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={(range) => {
                          setDateRange(range)
                          setIsCustomRange(true)
                        }}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                  <Button 
                    onClick={handleExport}
                    className="bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <FiDownload className="mr-2 h-4 w-4" />
                    Export Report
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={loadData}
                    className="border-2 border-gray-200 dark:border-gray-600 hover:border-[#00437f] hover:shadow-md transition-all duration-300"
                  >
                    <FiRefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(metrics.totalRevenue)}</p>
                    <p className={`text-xs ${metrics.revenueChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {metrics.revenueChange >= 0 ? '+' : ''}{formatPercentage(metrics.revenueChange)} from last period
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                    <FiDollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(metrics.totalOrders)}</p>
                    <p className={`text-xs ${metrics.ordersChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {metrics.ordersChange >= 0 ? '+' : ''}{formatPercentage(metrics.ordersChange)} from last period
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                    <FiShoppingCart className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Average Order Value</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(metrics.averageOrderValue)}</p>
                    <p className={`text-xs ${metrics.aovChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {metrics.aovChange >= 0 ? '+' : ''}{formatPercentage(metrics.aovChange)} from last period
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                    <FiTrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Customers</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(metrics.totalCustomers)}</p>
                    <p className={`text-xs ${metrics.customersChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {metrics.customersChange >= 0 ? '+' : ''}{formatPercentage(metrics.customersChange)} from last period
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                    <FiUsers className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Sales Trend Chart */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                  <FiActivity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sales Trend</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Daily revenue with 3-day moving average</p>
                </div>
              </div>
              
              {loading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-600 rounded-full"></div>
                      <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-[#00437f] rounded-full animate-spin"></div>
                      <div className="absolute top-2 left-2 w-8 h-8 border-4 border-transparent border-t-[#003366] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Loading sales data...</p>
                  </div>
                </div>
              ) : salesData.length === 0 ? (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <FiBarChart2 className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">
                      <p className="font-semibold text-lg">No sales data available</p>
                      <p className="text-sm">Sales data will appear here once available</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[400px]">
                  <ChartLine data={chartData} options={chartOptions} />
                </div>
              )}
            </div>
          </div>

          {/* Premium Category Distribution and Top Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                    <FiPieChart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Category Distribution</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Revenue breakdown by category</p>
                  </div>
                </div>
                <CategoryDistribution />
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                    <FiTarget className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Top Products</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Best performing products</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, index) => (
                        <div 
                          key={index} 
                          className="relative group p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50 animate-pulse"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600"></div>
                              <div className="space-y-2">
                                <div className="h-4 w-40 bg-gray-200 dark:bg-gray-600 rounded"></div>
                                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-600 rounded"></div>
                              </div>
                            </div>
                            <div className="text-right space-y-2">
                              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded"></div>
                              <div className="h-3 w-32 bg-gray-200 dark:bg-gray-600 rounded"></div>
                            </div>
                          </div>
                          <div className="mt-2 h-1.5 w-full bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                        </div>
                      ))}
                    </div>
                  ) : productData.length === 0 ? (
                    <div className="text-center py-6 space-y-4">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <FiTarget className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">
                        <p className="font-semibold text-lg">No product data available</p>
                        <p className="text-sm">Product data will appear here once available</p>
                      </div>
                    </div>
                  ) : (
                    productData.map((product, index) => (
                      <div 
                        key={product.name}
                        className="relative group p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-[#00437f]/20 transition-all duration-200 hover:shadow-md bg-gradient-to-r from-white/50 to-gray-50/30 dark:from-gray-800/50 dark:to-gray-700/30"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#00437f] to-[#003366] text-white font-semibold">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-[#00437f] transition-colors duration-200">
                                {product.name}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatNumber(product.sales)} units sold
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(product.revenue)}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {formatCurrency(product.revenue / product.sales)} avg. price
                            </div>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-2 h-1.5 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#00437f] to-[#003366] rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(product.revenue / (productData[0]?.revenue || 1)) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnalyticsContext.Provider>
  )
}

const useAnalytics = () => {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  return context
}

const CategoryDistribution = () => {
  const { toast } = useToast()
  const { timeRange, dateRange, isCustomRange } = useAnalytics()
  const [data, setData] = useState<CategoryData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      let url = '/api/reports/sales/categories'
      if (isCustomRange && dateRange?.from && dateRange?.to) {
        url = `/api/reports/sales/categories?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`
      } else {
        url = `/api/reports/sales/categories?timeRange=${timeRange}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to fetch category data')
      }
      const data = await response.json()
      setData(data)
    } catch (error) {
      console.error('Error fetching category data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch category data')
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to fetch category data',
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [timeRange, dateRange, isCustomRange])

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-600 rounded-full"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-[#00437f] rounded-full animate-spin"></div>
            <div className="absolute top-2 left-2 w-8 h-8 border-4 border-transparent border-t-[#003366] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Loading category data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <FiX className="h-8 w-8 text-red-500" />
        </div>
        <div className="text-red-600 dark:text-red-400">
          <p className="font-semibold text-lg">{error}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchData()}
          className="border-2 border-gray-200 dark:border-gray-600 hover:border-[#00437f] hover:shadow-md transition-all duration-300"
        >
          <FiRefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  // Calculate total revenue for percentage calculations
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)

  // Sort data by revenue and take top 10 categories
  const topCategories = [...data]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  const chartData: ChartData<'bar'> = {
    labels: topCategories.map(item => item.category),
    datasets: [
      {
        label: 'Revenue',
        data: topCategories.map(item => item.revenue),
        backgroundColor: COLORS.map(color => color + '80'), // Add transparency
        borderColor: COLORS,
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  }

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top 10 Categories by Revenue',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw as number
            return `Revenue: ${formatCurrency(value)}`
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
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        type: 'linear',
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCurrency(Number(value)),
        },
        grid: {
          color: '#e5e7eb'
        }
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="h-[400px]">
        <ChartBar data={chartData} options={options} />
      </div>

      {/* Category List */}
      <div className="space-y-3 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Details</h3>
        {topCategories.map((item, index) => (
          <div
            key={`${item.category}-${item.type || index}`}
            className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 hover:border-[#00437f]/20 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{item.category}</div>
                {item.type && item.type !== 'EMPTY' && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.type}</div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900 dark:text-white">{formatCurrency(item.revenue)}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatNumber(item.orders)} orders • {((item.revenue / totalRevenue) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const SalesTrend = () => {
  const { toast } = useToast()
  const { timeRange, dateRange, isCustomRange } = useAnalytics()
  const [data, setData] = useState<SalesTrend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      let url = '/api/reports/sales/trend'
      if (isCustomRange && dateRange?.from && dateRange?.to) {
        url = `/api/reports/sales/trend?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`
      } else {
        url = `/api/reports/sales/trend?timeRange=${timeRange}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to fetch trend data')
      }
      const data = await response.json()
      setData(data)
    } catch (error) {
      console.error('Error fetching trend data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch trend data')
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to fetch trend data',
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [timeRange, dateRange, isCustomRange])

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-600 rounded-full"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-[#00437f] rounded-full animate-spin"></div>
            <div className="absolute top-2 left-2 w-8 h-8 border-4 border-transparent border-t-[#003366] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Loading trend data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <FiX className="h-8 w-8 text-red-500" />
        </div>
        <div className="text-red-600 dark:text-red-400">
          <p className="font-semibold text-lg">{error}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchData()}
          className="border-2 border-gray-200 dark:border-gray-600 hover:border-[#00437f] hover:shadow-md transition-all duration-300"
        >
          <FiRefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  const chartData: ChartData<'line'> = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: 'Revenue',
        data: data.map(item => item.revenue),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Revenue (3-day MA)',
        data: data.map(item => item.revenueMA),
        borderColor: 'rgb(16, 185, 129)',
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
      }
    ],
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Sales Trend',
      },
    },
    scales: {
      y: {
        type: 'linear',
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCurrency(Number(value)),
        },
      },
    },
  }

  return (
    <div className="h-[400px]">
      <ChartLine data={chartData} options={options} />
    </div>
  )
}
