'use client'

import { Header } from '@/components/admin/layout/Header'
import { StatsGrid } from '@/components/admin/dashboard/StatsGrid'
import { AnalyticsCharts } from '@/components/admin/dashboard/AnalyticsCharts'
import { DataTable } from '@/components/admin/data/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  FiCheck,
  FiClock,
  FiX,
  FiAlertTriangle,
  FiPlus,
  FiUsers,
  FiDownload,
  FiSettings,
  FiTrendingUp,
  FiShoppingBag,
  FiPackage,
  FiStar,
  FiTrendingDown,
  FiDollarSign,
  FiCreditCard,
  FiArrowRight,
} from 'react-icons/fi'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
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
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DateRangeSelector } from './components/DateRangeSelector'
import { DateRange } from 'react-day-picker'
import CartAbandonmentDashboard from '@/components/admin/analytics/CartAbandonmentDashboard'

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

type Order = {
  id: string
  customer: string
  date: string
  amount: number
  status: 'completed' | 'pending' | 'cancelled' | 'failed'
  payment: string
}

const OrderTable = ({ orders }: { orders: Order[] }) => {
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'id',
      header: 'Order ID',
      cell: ({ row }) => (
        <div className='flex items-center space-x-2'>
          <div className='p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg'>
            <FiShoppingBag className='w-4 h-4 text-blue-600 dark:text-blue-400' />
          </div>
          <span className='font-medium text-blue-600 dark:text-blue-400'>
            {row.getValue('id')}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <div className='flex items-center space-x-2'>
          <div className='p-2 bg-gray-50 dark:bg-gray-800 rounded-lg'>
            <FiClock className='w-4 h-4 text-gray-600 dark:text-gray-400' />
          </div>
          <span>{new Date(row.getValue('date')).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'))
        return (
          <div className='flex items-center space-x-2'>
            <div className='p-2 bg-green-50 dark:bg-green-900/30 rounded-lg'>
              <FiDollarSign className='w-4 h-4 text-green-600 dark:text-green-400' />
            </div>
            <span className='font-medium'>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(amount)}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue<
          'completed' | 'pending' | 'cancelled' | 'failed'
        >('status')
        const iconMap = {
          completed: <FiCheck className='w-4 h-4' />,
          pending: <FiClock className='w-4 h-4' />,
          cancelled: <FiX className='w-4 h-4' />,
          failed: <FiAlertTriangle className='w-4 h-4' />,
        }
        const variantMap = {
          completed: 'default',
          pending: 'secondary',
          cancelled: 'destructive',
          failed: 'destructive',
        } as const
        const bgMap = {
          completed: 'bg-green-50 dark:bg-green-900/30',
          pending: 'bg-blue-50 dark:bg-blue-900/30',
          cancelled: 'bg-red-50 dark:bg-red-900/30',
          failed: 'bg-red-50 dark:bg-red-900/30',
        } as const

        return (
          <div className='flex items-center space-x-2'>
            <div className={`p-2 ${bgMap[status]} rounded-lg`}>
              {iconMap[status]}
            </div>
            <Badge variant={variantMap[status]} className='capitalize'>
              {status}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: 'payment',
      header: 'Payment',
      cell: ({ row }) => (
        <div className='flex items-center space-x-2'>
          <div className='p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg'>
            <FiCreditCard className='w-4 h-4 text-purple-600 dark:text-purple-400' />
          </div>
          <span className='capitalize'>{row.getValue('payment')}</span>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={orders}
      className='bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700'
    />
  )
}

// Recent Orders Table without pagination
const RecentOrdersTable = ({ orders }: { orders: Order[] }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <FiCheck className='w-4 h-4' />
      case 'pending': return <FiClock className='w-4 h-4' />
      case 'cancelled': return <FiX className='w-4 h-4' />
      case 'failed': return <FiAlertTriangle className='w-4 h-4' />
      default: return <FiClock className='w-4 h-4' />
    }
  }

  const getStatusBadge = (status: string) => {
    const variantMap = {
      completed: 'default',
      pending: 'secondary',
      cancelled: 'destructive',
      failed: 'destructive',
    } as const
    const bgMap = {
      completed: 'bg-green-50 dark:bg-green-900/30',
      pending: 'bg-blue-50 dark:bg-blue-900/30',
      cancelled: 'bg-red-50 dark:bg-red-900/30',
      failed: 'bg-red-50 dark:bg-red-900/30',
    } as const

    return (
      <div className='flex items-center space-x-2'>
        <div className={`p-2 ${bgMap[status as keyof typeof bgMap] || bgMap.pending} rounded-lg`}>
          {getStatusIcon(status)}
        </div>
        <Badge variant={variantMap[status as keyof typeof variantMap] || 'secondary'} className='capitalize'>
          {status}
        </Badge>
      </div>
    )
  }

  return (
    <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700'>
      <div className='overflow-x-auto'>
        <table className='w-full divide-y divide-gray-200 dark:divide-gray-700'>
          <thead className='bg-gray-50 dark:bg-gray-700/50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                Order ID
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                Date
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                Amount
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                Payment
              </th>
            </tr>
          </thead>
          <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
            {orders.map((order, index) => (
              <tr
                key={index}
                className='hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors'
              >
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center space-x-2'>
                    <div className='p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg'>
                      <FiShoppingBag className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                    </div>
                    <span className='font-medium text-blue-600 dark:text-blue-400'>
                      {order.id}
                    </span>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center space-x-2'>
                    <div className='p-2 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                      <FiClock className='w-4 h-4 text-gray-600 dark:text-gray-400' />
                    </div>
                    <span>{new Date(order.date).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center space-x-2'>
                    <div className='p-2 bg-green-50 dark:bg-green-900/30 rounded-lg'>
                      <FiDollarSign className='w-4 h-4 text-green-600 dark:text-green-400' />
                    </div>
                    <span className='font-medium'>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(order.amount)}
                    </span>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  {getStatusBadge(order.status)}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center space-x-2'>
                    <div className='p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg'>
                      <FiCreditCard className='w-4 h-4 text-purple-600 dark:text-purple-400' />
                    </div>
                    <span className='capitalize'>{order.payment}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// New data for sales forecast
const salesForecastData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Actual Sales',
      data: [4000, 3000, 5000, 2780, 1890, 2390],
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1,
    },
    {
      label: 'Forecast',
      data: [4200, 3500, 4800, 3000, 2000, 2500],
      backgroundColor: 'rgba(16, 185, 129, 0.5)',
      borderColor: 'rgb(16, 185, 129)',
      borderWidth: 1,
    },
  ],
}

const salesByCategoryData = {
  labels: ['Electronics', 'Clothing', 'Books', 'Home', 'Other'],
  datasets: [
    {
      data: [35, 25, 20, 15, 5],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(139, 92, 246)',
        'rgb(239, 68, 68)',
      ],
      borderWidth: 1,
    },
  ],
}

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value: number | string) {
          if (typeof value === 'number') {
            return `$${value.toLocaleString()}`
          }
          return value
        },
      },
    },
  },
}

const doughnutOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'right' as const,
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          const label = context.label || ''
          const value = context.raw || 0
          const total = context.dataset.data.reduce(
            (a: number, b: number) => a + b,
            0
          )
          const percentage = ((value / total) * 100).toFixed(1)
          return `${label}: ${percentage}%`
        },
      },
    },
  },
  cutout: '70%',
}

const CustomerSatisfaction = () => (
  <Card className='p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white'>
    <div className='flex items-center justify-between mb-4'>
      <h3 className='text-lg font-semibold'>Customer Satisfaction</h3>
    </div>
    <div className='space-y-4'>
      <div>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-sm opacity-80'>Overall Rating</span>
          <span className='text-2xl font-bold'>4.8/5</span>
        </div>
        <div className='h-2 w-full bg-white/20 rounded-full overflow-hidden'>
          <div
            className='h-full bg-white rounded-full transition-all duration-500'
            style={{ width: '96%' }}
          />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <div className='bg-white/10 rounded-lg p-3'>
          <p className='text-sm opacity-80'>Positive Reviews</p>
          <p className='text-xl font-bold mt-1'>92%</p>
        </div>
        <div className='bg-white/10 rounded-lg p-3'>
          <p className='text-sm opacity-80'>Response Rate</p>
          <p className='text-xl font-bold mt-1'>98%</p>
        </div>
      </div>
    </div>
  </Card>
)

const SalesForecast = () => (
  <Card className='p-6'>
    <div className='flex items-center justify-between mb-6'>
      <h3 className='text-lg font-semibold'>Sales Forecast</h3>
    </div>
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      <div className='h-[300px]'>
        <Bar data={salesForecastData} options={chartOptions} />
      </div>
      <div className='h-[300px]'>
        <Doughnut data={salesByCategoryData} options={doughnutOptions} />
      </div>
    </div>
  </Card>
)

const QuickActions = () => (
  <Card className='p-6'>
    <h3 className='text-lg font-semibold mb-4'>Quick Actions</h3>
    <div className='grid grid-cols-2 gap-4'>
      <Button className='h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white'>
        <FiPlus className='w-5 h-5' />
        <span>New Order</span>
      </Button>
      <Button className='h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-br from-green-500 to-green-600 text-white'>
        <FiUsers className='w-5 h-5' />
        <span>Add Customer</span>
      </Button>
      <Button className='h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-br from-purple-500 to-purple-600 text-white'>
        <FiDownload className='w-5 h-5' />
        <span>Export Data</span>
      </Button>
      <Button className='h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-br from-orange-500 to-orange-600 text-white'>
        <FiSettings className='w-5 h-5' />
        <span>Settings</span>
      </Button>
    </div>
  </Card>
)

const PerformanceMetrics = () => (
  <Card className='p-6'>
    <h3 className='text-lg font-semibold mb-4'>Performance Metrics</h3>
    <div className='space-y-4'>
      <div className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-blue-100 dark:bg-blue-900 rounded-lg'>
            <FiTrendingUp className='w-5 h-5 text-blue-600 dark:text-blue-400' />
          </div>
          <div>
            <p className='font-medium'>Average Order Value</p>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Last 30 days
            </p>
          </div>
        </div>
        <span className='text-lg font-bold'>$156.80</span>
      </div>
      <div className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-green-100 dark:bg-green-900 rounded-lg'>
            <FiShoppingBag className='w-5 h-5 text-green-600 dark:text-green-400' />
          </div>
          <div>
            <p className='font-medium'>Cart Abandonment</p>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Last 30 days
            </p>
          </div>
        </div>
        <span className='text-lg font-bold'>12.4%</span>
      </div>
    </div>
  </Card>
)

const InventoryStatus = () => (
  <Card className='p-6 h-[500px] flex flex-col'>
    <div className='flex items-center justify-between mb-4'>
      <h3 className='text-lg font-semibold'>Inventory Status</h3>
    </div>
    <div className='flex-1 min-h-0 overflow-y-auto'>
      <div className='space-y-6'>
        <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium'>Low Stock Items</span>
            <span className='text-sm text-red-600 dark:text-red-400'>
              12 Items
            </span>
          </div>
          <Progress value={12} className='h-2' />
          <p className='text-xs text-gray-500 mt-2'>
            Items below minimum threshold
          </p>
        </div>

        <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium'>Out of Stock</span>
            <span className='text-sm text-red-600 dark:text-red-400'>
              5 Items
            </span>
          </div>
          <Progress value={5} className='h-2' />
          <p className='text-xs text-gray-500 mt-2'>
            Items requiring immediate attention
          </p>
        </div>

        <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium'>Top Selling Products</span>
            <span className='text-sm text-green-600 dark:text-green-400'>
              In Stock
            </span>
          </div>
          <div className='space-y-2 mt-2'>
            <div className='flex justify-between text-sm'>
              <span>Premium Headphones</span>
              <span className='text-green-600'>45 units</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span>Wireless Mouse</span>
              <span className='text-green-600'>38 units</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span>Mechanical Keyboard</span>
              <span className='text-green-600'>29 units</span>
            </div>
          </div>
        </div>

        <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium'>Recent Restocks</span>
            <span className='text-sm text-blue-600 dark:text-blue-400'>
              Last 7 days
            </span>
          </div>
          <div className='space-y-2 mt-2'>
            <div className='flex justify-between text-sm'>
              <span>Gaming Monitor</span>
              <span className='text-blue-600'>+50 units</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span>Smart Watch</span>
              <span className='text-blue-600'>+30 units</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span>Bluetooth Speaker</span>
              <span className='text-blue-600'>+25 units</span>
            </div>
          </div>
        </div>

        <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium'>Inventory Value</span>
            <span className='text-sm text-purple-600 dark:text-purple-400'>
              $245,890
            </span>
          </div>
          <Progress value={75} className='h-2' />
          <p className='text-xs text-gray-500 mt-2'>
            Total value of current inventory
          </p>
        </div>

        <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium'>Return Rate</span>
            <span className='text-sm text-yellow-600 dark:text-yellow-400'>
              2.4%
            </span>
          </div>
          <Progress value={2.4} className='h-2' />
          <p className='text-xs text-gray-500 mt-2'>Last 30 days return rate</p>
        </div>
      </div>
    </div>
  </Card>
)

// Update chart data
const customerSegmentsData = {
  labels: ['New Customers', 'Returning', 'Loyal', 'Inactive'],
  datasets: [
    {
      data: [35, 40, 20, 5],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(239, 68, 68)',
      ],
      borderWidth: 1,
    },
  ],
}

const revenueProfitData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Revenue',
      data: [45000, 52000, 48000, 55000, 62000, 58000],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
    },
    {
      label: 'Profit',
      data: [15000, 18000, 16000, 19000, 22000, 20000],
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
    },
  ],
}

const pieChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        padding: 20,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          const label = context.label || ''
          const value = context.raw || 0
          return `${label}: ${value}%`
        },
      },
    },
  },
  cutout: '60%',
}

const lineChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value: number | string) {
          if (typeof value === 'number') {
            return value >= 1000
              ? `$${(value / 1000).toFixed(1)}k`
              : `$${value}`
          }
          return value
        },
      },
    },
  },
}

export default function DashboardPage() {
  const router = useRouter()
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [lowStockItems, setLowStockItems] = useState(0)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [topCategories, setTopCategories] = useState<
    Array<{
      name: string
      value: number
      color: string
      orderCount: number
      totalSales: number
    }>
  >([])
  const [trendingProducts, setTrendingProducts] = useState<
    Array<{
      id: string
      name: string
      style: string
      image: string
      orders: number
      sales: number
      stock: number
    }>
  >([])
  const [salesForecastData, setSalesForecastData] = useState({
    labels: [],
    datasets: [],
  })
  const [salesByCategoryData, setSalesByCategoryData] = useState({
    labels: [],
    datasets: [],
  })
  const [inventoryInsights, setInventoryInsights] = useState<{
    lowStockItems: number
    outOfStockItems: number
    topSellingProducts: Array<{
      name: string
      stock: number
    }>
    inventoryValue: number
    recentRestocks: Array<{
      name: string
      stock: number
    }>
    returnRate: number
  }>({
    lowStockItems: 0,
    outOfStockItems: 0,
    topSellingProducts: [],
    inventoryValue: 0,
    recentRestocks: [],
    returnRate: 0,
  })
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date()
    const from = new Date()
    from.setFullYear(today.getFullYear(), 0, 1) // January 1st of current year
    return { from, to: today }
  })
  const [loading, setLoading] = useState(true)
  const [cartAbandonmentEnabled, setCartAbandonmentEnabled] = useState<boolean>(false)

  useEffect(() => {
    async function fetchToggle() {
      try {
        const res = await fetch('/api/cart-abandonment-toggle')
        const data = await res.json()
        setCartAbandonmentEnabled(!!data?.data?.isEnabled)
      } catch {
        setCartAbandonmentEnabled(false)
      }
    }
    fetchToggle()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Format dates for API
      const fromDate = dateRange?.from ? dateRange.from.toISOString() : ''
      const toDate = dateRange?.to ? dateRange.to.toISOString() : ''

      // Fetch dashboard stats
      try {
        const statsResponse = await fetch(
          `/api/admin/dashboard/stats?from=${fromDate}&to=${toDate}`
        )
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setTotalRevenue(statsData.totalRevenue || 0)
          setTotalOrders(statsData.totalOrders || 0)
          setTotalUsers(statsData.totalUsers || 0)
          setLowStockItems(statsData.lowStockItems || 0)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }

      // Fetch sales forecast and category data
      try {
        const salesResponse = await fetch(
          `/api/admin/dashboard/sales-forecast?from=${fromDate}&to=${toDate}`
        )
        if (salesResponse.ok) {
          const salesData = await salesResponse.json()
          setSalesForecastData(salesData.salesData || { labels: [], datasets: [] })
          setSalesByCategoryData(salesData.categoryData || { labels: [], datasets: [] })
        }
      } catch (error) {
        console.error('Error fetching sales data:', error)
      }

      // Fetch recent orders
      try {
        const ordersResponse = await fetch(
          `/api/admin/dashboard/recent-orders?from=${fromDate}&to=${toDate}`
        )
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json()
          setRecentOrders(ordersData || [])
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
      }

      // Fetch top categories
      try {
        const categoriesResponse = await fetch(
          `/api/admin/dashboard/top-categories?from=${fromDate}&to=${toDate}`
        )
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setTopCategories(categoriesData || [])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }

      // Fetch trending products
      try {
        const productsResponse = await fetch(
          `/api/admin/dashboard/trending-products?from=${fromDate}&to=${toDate}`
        )
        if (productsResponse.ok) {
          const productsData = await productsResponse.json()
          setTrendingProducts(productsData || [])
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      }

      // Fetch inventory insights
      try {
        const inventoryResponse = await fetch(
          `/api/admin/dashboard/inventory-insights?from=${fromDate}&to=${toDate}`
        )
        if (inventoryResponse.ok) {
          const inventoryData = await inventoryResponse.json()
          setInventoryInsights(inventoryData || {
            lowStockItems: 0,
            outOfStockItems: 0,
            topSellingProducts: [],
            inventoryValue: 0,
            recentRestocks: [],
            returnRate: 0,
          })
        }
      } catch (error) {
        console.error('Error fetching inventory:', error)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [dateRange])

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900/30 p-6'>
      {/* Header */}
      <div className='relative group mb-8'>
        <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-3xl group-hover:blur-4xl transition-all duration-500'></div>
        <div className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-4xl font-bold bg-gradient-to-r from-[#00437f] via-[#003366] to-[#002244] bg-clip-text text-transparent mb-2'>
                Dashboard
              </h1>
              <p className='text-gray-600 dark:text-gray-300 text-lg font-medium'>
                Welcome to your premium admin dashboard
              </p>
            </div>
            <DateRangeSelector onDateRangeChange={setDateRange} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <div className='relative group'>
          <div className='absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
          <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1'>
                  Total Revenue
                </p>
                <h3 className='text-3xl font-bold text-[#00437f] dark:text-blue-400'>
                  ${(totalRevenue || 0).toLocaleString()}
                </h3>
              </div>
              <div className='p-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg'>
                <FiTrendingUp className='w-7 h-7' />
              </div>
            </div>
          </Card>
        </div>

        <div className='relative group'>
          <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
          <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1'>
                  Total Orders
                </p>
                <h3 className='text-3xl font-bold text-[#00437f] dark:text-blue-400'>
                  {(totalOrders || 0).toLocaleString()}
                </h3>
              </div>
              <div className='p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'>
                <FiShoppingBag className='w-7 h-7' />
              </div>
            </div>
          </Card>
        </div>

        <div className='relative group'>
          <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-500/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
          <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1'>
                  Total Users
                </p>
                <h3 className='text-3xl font-bold text-[#00437f] dark:text-blue-400'>
                  {(totalUsers || 0).toLocaleString()}
                </h3>
              </div>
              <div className='p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg'>
                <FiUsers className='w-7 h-7' />
              </div>
            </div>
          </Card>
        </div>

        <div className='relative group'>
          <div className='absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-yellow-500/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
          <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1'>
                  Low Stock Items
                </p>
                <h3 className='text-3xl font-bold text-[#00437f] dark:text-blue-400'>
                  {(lowStockItems || 0).toLocaleString()}
                </h3>
              </div>
              <div className='p-4 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg'>
                <FiPackage className='w-7 h-7' />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Sales Forecast */}
      <div className='relative group mb-8'>
        <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-3xl group-hover:blur-4xl transition-all duration-500'></div>
        <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]'>
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h3 className='text-2xl font-bold text-[#00437f] dark:text-blue-400 mb-2'>
                Sales Forecast
              </h3>
              <p className='text-gray-600 dark:text-gray-300 font-medium'>
                Revenue trends and category distribution
              </p>
            </div>
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            <div className='h-[350px]'>
              <Bar data={salesForecastData} options={chartOptions} />
            </div>
            <div className='h-[350px]'>
              <Doughnut data={salesByCategoryData} options={doughnutOptions} />
            </div>
          </div>
        </Card>
      </div>

      {/* Trending Products and Categories */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
        {/* Trending Products */}
        <div className='relative group'>
          <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
          <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h3 className='text-xl font-bold text-[#00437f] dark:text-blue-400 mb-1'>
                  Trending Products
                </h3>
                <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>
                  Top performing products
                </p>
              </div>
            </div>
            <div className='space-y-4'>
              {trendingProducts.map((product) => (
                <div
                  key={product.id}
                  className='flex items-center justify-between p-4 bg-gray-50/80 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600/30 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200'
                >
                  <div className='flex items-center space-x-4'>
                    <img
                      src={product.image}
                      alt={product.name}
                      className='w-14 h-14 object-cover rounded-xl shadow-sm'
                    />
                    <div>
                      <h3 className='font-semibold text-gray-900 dark:text-white'>
                        {product.name}
                      </h3>
                      <p className='text-sm text-gray-600 dark:text-gray-300'>
                        Style: {product.style}
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm font-semibold text-[#00437f] dark:text-blue-400'>
                      {product.orders} orders
                    </p>
                    <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      ${product.sales.toFixed(2)}
                    </p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                      Stock: {product.stock}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Top Categories */}
        <div className='relative group'>
          <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
          <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h3 className='text-xl font-bold text-[#00437f] dark:text-blue-400 mb-1'>
                  Top Categories
                </h3>
                <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>
                  Sales by category
                </p>
              </div>
            </div>
            <div className='space-y-6'>
              {topCategories.map((category) => (
                <div key={category.name} className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                      {category.name}
                    </span>
                    <span className='text-sm font-bold text-[#00437f] dark:text-blue-400'>
                      {category.value}%
                    </span>
                  </div>
                  <div className='h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden'>
                    <div
                      className={`h-full ${category.color} rounded-full transition-all duration-500 shadow-sm`}
                      style={{ width: `${category.value}%` }}
                    />
                  </div>
                  <div className='flex justify-between text-xs text-gray-500 dark:text-gray-400'>
                    <span>{category.orderCount} orders</span>
                    <span>${category.totalSales.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Inventory Insights */}
      <div className='relative group mb-8'>
        <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-3xl group-hover:blur-4xl transition-all duration-500'></div>
        <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]'>
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h3 className='text-2xl font-bold text-[#00437f] dark:text-blue-400 mb-2'>
                Inventory Insights
              </h3>
              <p className='text-gray-600 dark:text-gray-300 font-medium'>
                Stock levels and inventory management
              </p>
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='p-6 bg-gray-50/80 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-600/30'>
              <div className='flex items-center justify-between mb-3'>
                <span className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  Low Stock Items
                </span>
                <span className='text-sm font-bold text-red-600 dark:text-red-400'>
                  {inventoryInsights.lowStockItems} Items
                </span>
              </div>
              <div className='h-3 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500 shadow-sm'
                  style={{
                    width: `${(inventoryInsights.lowStockItems / 100) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className='p-6 bg-gray-50/80 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-600/30'>
              <div className='flex items-center justify-between mb-3'>
                <span className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  Out of Stock
                </span>
                <span className='text-sm font-bold text-red-600 dark:text-red-400'>
                  {inventoryInsights.outOfStockItems} Items
                </span>
              </div>
              <div className='h-3 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500 shadow-sm'
                  style={{
                    width: `${(inventoryInsights.outOfStockItems / 100) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className='p-6 bg-gray-50/80 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-600/30'>
              <div className='flex items-center justify-between mb-3'>
                <span className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  Inventory Value
                </span>
                <span className='text-sm font-bold text-green-600 dark:text-green-400'>
                  ${inventoryInsights.inventoryValue.toLocaleString()}
                </span>
              </div>
              <div className='h-3 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500 shadow-sm'
                  style={{ width: '75%' }}
                />
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
            <div className='p-6 bg-gray-50/80 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-600/30'>
              <div className='flex items-center justify-between mb-4'>
                <span className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  Top Selling Products
                </span>
                <span className='text-sm font-bold text-green-600 dark:text-green-400'>
                  In Stock
                </span>
              </div>
              <div className='space-y-3'>
                {inventoryInsights.topSellingProducts.map((product, index) => (
                  <div
                    key={`top-selling-${index}`}
                    className='flex justify-between text-sm'
                  >
                    <span className='font-medium'>{product.name}</span>
                    <span className='text-green-600 font-semibold'>{product.stock} units</span>
                  </div>
                ))}
              </div>
            </div>

            <div className='p-6 bg-gray-50/80 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-600/30'>
              <div className='flex items-center justify-between mb-4'>
                <span className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  Recent Restocks
                </span>
                <span className='text-sm font-bold text-blue-600 dark:text-blue-400'>
                  Last 7 days
                </span>
              </div>
              <div className='space-y-3'>
                {inventoryInsights.recentRestocks.map((product, index) => (
                  <div
                    key={`recent-restock-${index}`}
                    className='flex justify-between text-sm'
                  >
                    <span className='font-medium'>{product.name}</span>
                    <span className='text-blue-600 font-semibold'>+{product.stock} units</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className='mt-8'>
            <div className='p-6 bg-gray-50/80 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-600/30'>
              <div className='flex items-center justify-between mb-3'>
                <span className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  Return Rate
                </span>
                <span className='text-sm font-bold text-yellow-600 dark:text-yellow-400'>
                  {inventoryInsights.returnRate}%
                </span>
              </div>
              <div className='h-3 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full transition-all duration-500 shadow-sm'
                  style={{ width: `${inventoryInsights.returnRate}%` }}
                />
              </div>
              <p className='text-xs text-gray-500 mt-2'>
                Last 30 days return rate
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <div className='relative group mb-8'>
        <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-3xl group-hover:blur-4xl transition-all duration-500'></div>
        <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]'>
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h3 className='text-2xl font-bold text-[#00437f] dark:text-blue-400 mb-2'>
                Recent Orders
              </h3>
              <p className='text-gray-600 dark:text-gray-300 font-medium'>
                Latest transactions and order status
              </p>
            </div>
            <Button
              onClick={() => router.push('/admin/sales/orders')}
              className='flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#00437f] to-[#003366] text-white hover:from-[#003366] hover:to-[#002244] rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold'
            >
              <span>View All Orders</span>
              <FiArrowRight className='w-5 h-5' />
            </Button>
          </div>
          <RecentOrdersTable orders={recentOrders} />
        </Card>
      </div>

      {/* Cart Abandonment Analytics */}
      {cartAbandonmentEnabled && (
        <div className='relative group mb-8'>
          <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-3xl group-hover:blur-4xl transition-all duration-500'></div>
          <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]'>
            <div className='flex items-center justify-between mb-8'>
              <div>
                <h3 className='text-2xl font-bold text-[#00437f] dark:text-blue-400 mb-2'>
                  Cart Abandonment Analytics
                </h3>
                <p className='text-gray-600 dark:text-gray-300 font-medium'>
                  Track abandoned carts and recover lost sales
                </p>
              </div>
            </div>
            
            {/* 24-Hour Policy Notice */}
            <div className="w-full p-6 bg-gray-50/80 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600/30 rounded-2xl mb-8">
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-[#00437f] rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">24-Hour Abandonment Policy</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    All inactive shopping carts are automatically marked as abandoned after 24 hours of inactivity. 
                    This ensures accurate tracking and timely recovery campaigns.
                  </p>
                </div>
              </div>
            </div>
            
            <CartAbandonmentDashboard />
          </Card>
        </div>
      )}
    </div>
  )
}
