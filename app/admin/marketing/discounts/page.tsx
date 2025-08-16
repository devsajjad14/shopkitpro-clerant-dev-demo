'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FiSearch, FiDollarSign, FiCalendar, FiLoader, FiArrowLeft, FiFilter, FiX, FiTrendingUp, FiTrendingDown, FiBarChart2, FiRefreshCw } from 'react-icons/fi'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PremiumPagination } from '@/components/ui/premium-pagination'

type Discount = {
  id: string
  orderId: string
  discountType: string
  discountValue: number
  createdAt: string
  order: {
    totalAmount: number
    customerName: string | null
    customerEmail: string | null
  }
}

export default function DiscountsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
  // New state for sorting and filtering
  const [sortBy, setSortBy] = useState('newest')
  const [discountTypeFilter, setDiscountTypeFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadDiscounts()
  }, [])

  const loadDiscounts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/orders')
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      
      // Filter orders with discounts and transform data
      const discountsData = data.orders
        .filter((order: any) => order.discount > 0)
        .map((order: any) => ({
          id: order.id,
          orderId: order.id,
          discountType: 'fixed', // Default to fixed since we don't store type
          discountValue: Number(order.discount), // Ensure it's a number
          createdAt: order.createdAt,
          order: {
            totalAmount: Number(order.totalAmount), // Ensure it's a number
            customerName: order.userId ? 'Registered Customer' : 'Guest',
            customerEmail: order.guestEmail || 'N/A'
          }
        }))
      
      setDiscounts(discountsData)
    } catch (error) {
      console.error('Error loading discounts:', error)
      toast({
        title: "Error",
        description: "Failed to load discounts",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  // Filter and sort discounts
  const filteredAndSortedDiscounts = discounts
    .filter(discount => {
      const matchesSearch = 
        (discount.order.customerEmail?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (discount.order.customerName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        discount.orderId.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesType = discountTypeFilter === 'all' || discount.discountType === discountTypeFilter
      
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'discount-high':
          return b.discountValue - a.discountValue
        case 'discount-low':
          return a.discountValue - b.discountValue
        case 'total-high':
          return b.order.totalAmount - a.order.totalAmount
        case 'total-low':
          return a.order.totalAmount - b.order.totalAmount
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedDiscounts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentDiscounts = filteredAndSortedDiscounts.slice(startIndex, endIndex)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const clearFilters = () => {
    setSearchQuery('')
    setSortBy('newest')
    setDiscountTypeFilter('all')
    setCurrentPage(1)
  }

  const hasActiveFilters = searchQuery || sortBy !== 'newest' || discountTypeFilter !== 'all'

  // Calculate statistics
  const totalDiscounts = discounts.length
  const totalDiscountValue = discounts.reduce((sum, discount) => sum + discount.discountValue, 0)
  const averageDiscount = totalDiscounts > 0 ? totalDiscountValue / totalDiscounts : 0
  const recentDiscounts = discounts.filter(discount => {
    const discountDate = new Date(discount.createdAt)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return discountDate >= thirtyDaysAgo
  }).length

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <div className='max-w-7xl mx-auto p-6 space-y-6'>
        {/* Premium Header */}
        <div className='relative'>
          <div className='absolute inset-0 bg-gradient-to-r from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl'></div>
          <div className='relative flex items-center justify-between bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg'>
            <div className='space-y-2'>
              <div className='flex items-center gap-3'>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => router.back()} 
                  className="h-8 w-8 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200"
                >
                  <FiArrowLeft className="h-4 w-4" />
                </Button>
                <div className='w-10 h-10 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-lg flex items-center justify-center shadow-md'>
                  <FiDollarSign className='w-5 h-5 text-white' />
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900 dark:text-white tracking-tight'>
                    Order Discounts
                  </h1>
                  <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>
                    {filteredAndSortedDiscounts.length} of {discounts.length} discounts
                  </p>
                </div>
              </div>
            </div>
            <Button 
              size="sm"
              onClick={loadDiscounts}
              disabled={isLoading}
              className="bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiRefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Premium Overview Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {/* Total Discounts */}
          <div className='relative group'>
            <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500'></div>
            <Card className='relative p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>Total Discounts</p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>{totalDiscounts}</p>
                </div>
                <div className='w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-lg flex items-center justify-center shadow-lg'>
                  <FiDollarSign className='w-6 h-6 text-white' />
                </div>
              </div>
            </Card>
          </div>

          {/* Total Discount Value */}
          <div className='relative group'>
            <div className='absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500'></div>
            <Card className='relative p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>Total Value</p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>${totalDiscountValue.toFixed(2)}</p>
                </div>
                <div className='w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg'>
                  <FiTrendingUp className='w-6 h-6 text-white' />
                </div>
              </div>
            </Card>
          </div>

          {/* Average Discount */}
          <div className='relative group'>
            <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-500/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500'></div>
            <Card className='relative p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>Average Discount</p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>${averageDiscount.toFixed(2)}</p>
                </div>
                <div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg'>
                  <FiBarChart2 className='w-6 h-6 text-white' />
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Discounts */}
          <div className='relative group'>
            <div className='absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-500/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500'></div>
            <Card className='relative p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>Last 30 Days</p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>{recentDiscounts}</p>
                </div>
                <div className='w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg'>
                  <FiCalendar className='w-6 h-6 text-white' />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Premium Search & Filters */}
        <div className='space-y-4'>
          {/* Main Search Bar */}
          <div className='relative group'>
            <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
            <Card className='relative p-4 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl transition-all duration-300'>
              <div className='flex items-center gap-3'>
                <div className='relative flex-grow'>
                  <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00437f]' />
                  <Input
                    type="text"
                    placeholder="Search by order ID, customer name, or email..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className='pl-10 h-10 text-sm border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 rounded-lg focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-300'
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className='flex items-center gap-2 h-10 px-4 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200 rounded-lg'
                >
                  <FiFilter className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs bg-[#00437f] text-white">
                      {[searchQuery, discountTypeFilter, sortBy].filter(f => f !== 'all' && f !== 'newest' && f !== '').length}
                    </Badge>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className='relative group'>
              <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
              <Card className='relative p-6 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl transition-all duration-300'>
                <div className='space-y-6'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-xl font-bold text-gray-900 dark:text-white'>Advanced Filters</h3>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className='text-gray-500 hover:text-[#00437f] hover:bg-[#00437f]/10 transition-all duration-200 rounded-lg'
                      >
                        <FiX className="h-4 w-4 mr-2" />
                        Clear All
                      </Button>
                    )}
                  </div>
                  
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {/* Sort By */}
                    <div className='space-y-2'>
                      <label className='text-sm font-semibold text-gray-900 dark:text-white'>Sort By</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className='h-10 bg-white/50 dark:bg-gray-700/50 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-lg transition-all duration-300'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                          <SelectItem value="discount-high">Discount High to Low</SelectItem>
                          <SelectItem value="discount-low">Discount Low to High</SelectItem>
                          <SelectItem value="total-high">Order Total High to Low</SelectItem>
                          <SelectItem value="total-low">Order Total Low to High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Discount Type Filter */}
                    <div className='space-y-2'>
                      <label className='text-sm font-semibold text-gray-900 dark:text-white'>Discount Type</label>
                      <Select value={discountTypeFilter} onValueChange={setDiscountTypeFilter}>
                        <SelectTrigger className='h-10 bg-white/50 dark:bg-gray-700/50 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-lg transition-all duration-300'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                          <SelectItem value="percentage">Percentage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Premium Discounts Table */}
        <div className='relative group'>
          <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
          <Card className='relative border border-white/20 dark:border-gray-700/50 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-2xl transition-all duration-300'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-gray-200/50 dark:border-gray-700/50'>
                    <th className='text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white'>Order ID</th>
                    <th className='text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white'>Customer</th>
                    <th className='text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white'>Discount Amount</th>
                    <th className='text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white'>Order Total</th>
                    <th className='text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white'>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className='text-center py-12'>
                        <div className='flex flex-col items-center gap-4'>
                          <div className='relative'>
                            <div className='w-12 h-12 border-4 border-gray-200 dark:border-gray-600 rounded-full'></div>
                            <div className='absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-[#00437f] rounded-full animate-spin'></div>
                            <div className='absolute top-2 left-2 w-8 h-8 border-4 border-transparent border-t-[#003366] rounded-full animate-spin' style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                          </div>
                          <div className='text-center'>
                            <p className='text-gray-900 dark:text-white font-medium'>Loading discounts</p>
                            <p className='text-gray-500 dark:text-gray-400 text-sm'>Please wait while we fetch the data...</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : currentDiscounts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className='text-center py-12'>
                        <div className='flex flex-col items-center gap-4'>
                          <div className='w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center'>
                            <FiDollarSign className='h-8 w-8 text-gray-400' />
                          </div>
                          <div className='text-center'>
                            <p className='text-gray-900 dark:text-white font-medium'>No discounts found</p>
                            <p className='text-gray-500 dark:text-gray-400 text-sm'>
                              {hasActiveFilters ? 'Try adjusting your filters' : 'No discounts have been applied to orders yet'}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentDiscounts.map((discount) => (
                      <tr key={discount.id} className='border-b border-gray-100/50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-all duration-200 group'>
                        <td className='py-4 px-6'>
                          <span className='font-semibold text-gray-900 dark:text-white group-hover:text-[#00437f] transition-all duration-200'>#{discount.orderId}</span>
                        </td>
                        <td className='py-4 px-6'>
                          <div>
                            <div className='font-medium text-gray-900 dark:text-white'>{discount.order.customerName}</div>
                            <div className='text-sm text-gray-500 dark:text-gray-400'>{discount.order.customerEmail}</div>
                          </div>
                        </td>
                        <td className='py-4 px-6'>
                          <div className='flex items-center text-green-600 dark:text-green-400 font-semibold'>
                            <FiDollarSign className='mr-1 h-4 w-4' />
                            {Number(discount.discountValue).toFixed(2)}
                          </div>
                        </td>
                        <td className='py-4 px-6'>
                          <div className='flex items-center text-gray-900 dark:text-white font-medium'>
                            <FiDollarSign className='mr-1 h-4 w-4 text-gray-500' />
                            {Number(discount.order.totalAmount).toFixed(2)}
                          </div>
                        </td>
                        <td className='py-4 px-6'>
                          <div className='flex items-center text-gray-500 dark:text-gray-400'>
                            <FiCalendar className='mr-2 h-4 w-4' />
                            {new Date(discount.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Premium Pagination */}
        {totalPages > 1 && (
          <div className='flex justify-center'>
            <PremiumPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={paginate}
              totalItems={filteredAndSortedDiscounts.length}
              itemsPerPage={itemsPerPage}
              startIndex={startIndex + 1}
              endIndex={Math.min(endIndex, filteredAndSortedDiscounts.length)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
