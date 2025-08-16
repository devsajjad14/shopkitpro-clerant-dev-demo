'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { 
  FiCalendar, 
  FiChevronDown, 
  FiUsers, 
  FiDollarSign, 
  FiShoppingCart, 
  FiDownload, 
  FiRefreshCw,
  FiArrowLeft,
  FiBarChart2,
  FiPieChart,
  FiActivity,
  FiTarget,
  FiTrendingUp,
  FiUserCheck,
  FiX,
} from 'react-icons/fi'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts'

interface CustomerMetrics {
  totalCustomers: number
  activeCustomers: number
  averageOrderValue: number
  repeatPurchaseRate: number
  customerChange: number
  aovChange: number
  repeatRateChange: number
}

interface CustomerData {
  date: string
  newCustomers: number
  activeCustomers: number
  orders: number
  revenue: number
}

interface TopCustomer {
  id: string
  name: string
  email: string
  totalOrders: number
  totalSpent: number
  lastOrderDate: string
  averageOrderValue: number
}

interface PurchasePattern {
  timeOfDay: string
  orders: number
  revenue: number
  averageOrderValue: number
}

export default function CustomerInsightsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [timeRange, setTimeRange] = useState('30d')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isCustomRange, setIsCustomRange] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<{
    metrics: CustomerMetrics
    customerData: CustomerData[]
    topCustomers: TopCustomer[]
    purchasePatterns: PurchasePattern[]
  } | null>(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      let url = `/api/reports/customer-insights?timeRange=${timeRange}`
      
      if (isCustomRange && dateRange?.from && dateRange?.to) {
        url += `&startDate=${format(dateRange.from, 'yyyy-MM-dd')}&endDate=${format(dateRange.to, 'yyyy-MM-dd')}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch data')
      
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch customer insights data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [timeRange, dateRange])

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range)
    if (range?.from && range?.to) {
      setIsCustomRange(true)
      setTimeRange('custom')
    }
  }

  const handleExport = async () => {
    try {
      let url = `/api/reports/customer/export?timeRange=${timeRange}`
      
      if (isCustomRange && dateRange?.from && dateRange?.to) {
        url += `&startDate=${format(dateRange.from, 'yyyy-MM-dd')}&endDate=${format(dateRange.to, 'yyyy-MM-dd')}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to export data')
      
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `customer-report-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting data:', error)
      toast({
        title: "Error",
        description: "Failed to export customer insights data",
        variant: "destructive"
      })
    }
  }

  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '0'
    return Number(value).toFixed(0)
  }

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(value))
  }

  const formatPercent = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '0%'
    return `${Number(value).toFixed(2)}%`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-600 rounded-full"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-[#00437f] rounded-full animate-spin"></div>
              <div className="absolute top-2 left-2 w-8 h-8 border-4 border-transparent border-t-[#003366] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Loading customer insights...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <FiX className="h-8 w-8 text-gray-400" />
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              <p className="font-semibold text-lg">No data available</p>
              <p className="text-sm">Customer insights data will appear here once available</p>
            </div>
          </div>
        </div>
      </div>
    )
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
                    Customer Insights
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Track your customer behavior and engagement metrics
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
                    setDateRange(undefined)
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
                    setDateRange(undefined)
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
                    setDateRange(undefined)
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
                      variant="outline"
                      size="sm"
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
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Custom Range</span>
                      )}
                      <FiChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={handleDateSelect}
                      numberOfMonths={2}
                      className="rounded-md border"
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
                  onClick={fetchData}
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Customers</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(data.metrics.totalCustomers)}</p>
                  <p className={`text-xs ${data.metrics.customerChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {data.metrics.customerChange >= 0 ? '+' : ''}{formatPercent(data.metrics.customerChange)} from previous period
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <FiUsers className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Customers</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(data.metrics.activeCustomers || 0)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Active in last {timeRange === '7d' ? '7' : timeRange === '90d' ? '90' : '30'} days
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <FiUserCheck className="h-6 w-6 text-white" />
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
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(data.metrics.averageOrderValue)}</p>
                  <p className={`text-xs ${data.metrics.aovChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {data.metrics.aovChange >= 0 ? '+' : ''}{formatPercent(data.metrics.aovChange)} from previous period
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                  <FiDollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Repeat Purchase Rate</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatPercent(data.metrics.repeatPurchaseRate)}</p>
                  <p className={`text-xs ${data.metrics.repeatRateChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {data.metrics.repeatRateChange >= 0 ? '+' : ''}{formatPercent(data.metrics.repeatRateChange)} from previous period
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                  <FiShoppingCart className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Customer Growth & Engagement */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                <FiPieChart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Customer Growth & Engagement</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">Customer distribution and engagement metrics</p>
              </div>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: 'New Customers',
                        value: data.customerData.reduce((sum, day) => sum + (day.newCustomers || 0), 0),
                        fill: '#82ca9d'
                      },
                      {
                        name: 'Active Customers',
                        value: data.customerData.reduce((sum, day) => sum + (day.activeCustomers || 0), 0),
                        fill: '#ffc658'
                      },
                      {
                        name: 'Repeat Customers',
                        value: data.metrics.repeatPurchaseRate,
                        fill: '#ff8042'
                      },
                      {
                        name: 'One-time Customers',
                        value: 100 - data.metrics.repeatPurchaseRate,
                        fill: '#8884d8'
                      }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => {
                      if (percent === 0) return '';
                      return `${name}: ${(percent * 100).toFixed(0)}%`;
                    }}
                  >
                    {[
                      { fill: '#82ca9d' },
                      { fill: '#ffc658' },
                      { fill: '#ff8042' },
                      { fill: '#8884d8' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      if (name === 'Repeat Customers' || name === 'One-time Customers') {
                        return [`${value.toFixed(1)}%`, name];
                      }
                      return [value.toLocaleString(), name];
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Premium Top Customers */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                <FiTarget className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Top Customers</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">Best performing customers by value</p>
              </div>
            </div>
            <div className="space-y-4">
              {data.topCustomers.map((customer, index) => (
                <div
                  key={customer.id}
                  className="relative group p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-[#00437f]/20 transition-all duration-200 hover:shadow-md bg-gradient-to-r from-white/50 to-gray-50/30 dark:from-gray-800/50 dark:to-gray-700/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#00437f] to-[#003366] text-white font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-[#00437f] transition-colors duration-200">
                          {customer.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <FiShoppingCart className="mr-1 h-4 w-4" />
                            {customer.totalOrders} orders
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <FiDollarSign className="mr-1 h-4 w-4" />
                            {formatCurrency(customer.totalSpent)} spent
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(customer.averageOrderValue)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Average Order Value</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Last order: {new Date(customer.lastOrderDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Premium Customer Purchase Patterns */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <FiActivity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Customer Purchase Patterns</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">Purchase behavior by time of day</p>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.purchasePatterns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timeOfDay" />
                  <YAxis 
                    yAxisId="left"
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name.includes('Revenue') || name.includes('Average')) {
                        return [`$${value.toLocaleString()}`, name]
                      }
                      return [value.toLocaleString(), name]
                    }}
                  />
                  <Legend />
                  <Bar
                    yAxisId="right"
                    dataKey="orders"
                    fill="#8884d8"
                    name="Orders"
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    fill="#82ca9d"
                    name="Revenue"
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="averageOrderValue"
                    fill="#ffc658"
                    name="Average Order Value"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
