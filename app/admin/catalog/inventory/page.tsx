'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiAlertCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiPackage,
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiBarChart2,
  FiCheck,
  FiX,
  FiEdit2,
  FiChevronUp,
  FiLoader,
  FiChevronsLeft,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsRight,
  FiArrowLeft,
  FiSettings,
  FiDollarSign,
  FiTrendingUp as FiTrendingUpIcon,
} from 'react-icons/fi'
import { getProducts, updateProduct, getProduct } from '@/lib/actions/products'
import { PremiumPagination } from '@/components/ui/premium-pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface InventoryItem {
  id: number
  styleId: number
  sku: string
  name: string
  category: string
  currentStock: number
  lowStockThreshold: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  lastUpdated: string
  trend: 'up' | 'down' | 'stable'
  value: number
}

export default function InventoryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState<number>(0)
  const [editReason, setEditReason] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10) // Show 10 inventory items per page
  const [filters, setFilters] = useState({
    stockStatus: 'all',
    category: 'all',
    trend: 'all',
    valueRange: 'all'
  })

  const [inventory, setInventory] = useState<InventoryItem[]>([])

  useEffect(() => {
    loadInventory()
  }, [])

  const loadInventory = async () => {
    try {
      setIsLoading(true)
      const products = await getProducts()
      
      const inventoryItems = products.map(product => ({
        id: product.id,
        styleId: product.styleId,
        sku: product.sku || '',
        name: product.name,
        category: product.department || 'Uncategorized',
        currentStock: product.stockQuantity || 0,
        lowStockThreshold: product.lowStockThreshold || 10,
        status: getStockStatus(product.stockQuantity || 0, product.lowStockThreshold || 10),
        lastUpdated: product.updatedAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        trend: 'stable' as const, // This would need to be calculated based on historical data
        value: ((product.stockQuantity || 0) * (Number(product.sellingPrice) || 0))
      }))

      setInventory(inventoryItems)
    } catch (error) {
      console.error('Error loading inventory:', error)
      toast({
        title: 'Error',
        description: 'Failed to load inventory data',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStockStatus = (currentStock: number, lowStockThreshold: number): 'in_stock' | 'low_stock' | 'out_of_stock' => {
    if (currentStock === 0) return 'out_of_stock'
    if (currentStock <= lowStockThreshold) return 'low_stock'
    return 'in_stock'
  }

  // Calculate inventory metrics
  const totalItems = inventory.length
  const totalValue = inventory.reduce((sum, item) => sum + item.value, 0)
  const lowStockItems = inventory.filter(item => item.status === 'low_stock').length
  const outOfStockItems = inventory.filter(item => item.status === 'out_of_stock').length

  const filteredInventory = inventory.filter(item => {
    // Search filter
    const searchMatch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())

    // Stock status filter
    const stockStatusMatch = 
      filters.stockStatus === 'all' ||
      (filters.stockStatus === 'zero' && item.currentStock === 0) ||
      (filters.stockStatus === 'low' && item.status === 'low_stock') ||
      (filters.stockStatus === 'high' && item.status === 'in_stock')

    // Category filter
    const categoryMatch = 
      filters.category === 'all' ||
      item.category === filters.category

    // Trend filter
    const trendMatch = 
      filters.trend === 'all' ||
      item.trend === filters.trend

    // Value range filter
    const valueMatch = 
      filters.valueRange === 'all' ||
      (filters.valueRange === 'low' && item.value < 1000) ||
      (filters.valueRange === 'medium' && item.value >= 1000 && item.value < 5000) ||
      (filters.valueRange === 'high' && item.value >= 5000)

    return searchMatch && stockStatusMatch && categoryMatch && trendMatch && valueMatch
  })
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredInventory.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Get unique categories for filter
  const categories = Array.from(new Set(inventory.map(item => item.category)))

  const handleStartEdit = (item: InventoryItem) => {
    setEditingId(item.styleId)
    setEditValue(item.currentStock)
    setEditReason('')
  }

  const handleSaveEdit = async (styleId: number) => {
    if (editValue < 0) {
      toast({
        title: 'Error',
        description: 'Stock cannot be negative',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSaving(true)
      const product = inventory.find(item => item.styleId === styleId)
      if (!product) {
        toast({
          title: 'Error',
          description: 'Product not found',
          variant: 'destructive',
        })
        return
      }

      // Get the full product data first
      const fullProduct = await getProduct(styleId.toString())
      if (!fullProduct) {
        toast({
          title: 'Error',
          description: 'Failed to get product data',
          variant: 'destructive',
        })
        return
      }

      // Create update object with required fields
      const updateData = {
        styleId: fullProduct.styleId,
        name: fullProduct.name,
        style: fullProduct.style,
        quantityAvailable: fullProduct.quantityAvailable,
        onSale: fullProduct.onSale,
        isNew: fullProduct.isNew,
        smallPicture: fullProduct.smallPicture || '',
        mediumPicture: fullProduct.mediumPicture || '',
        largePicture: fullProduct.largePicture || '',
        department: fullProduct.department || '',
        type: fullProduct.type || '',
        subType: fullProduct.subType || '',
        brand: fullProduct.brand || '',
        sellingPrice: Number(fullProduct.sellingPrice),
        regularPrice: Number(fullProduct.regularPrice),
        longDescription: fullProduct.longDescription || '',
        of7: fullProduct.of7 || '',
        of12: fullProduct.of12 || '',
        of13: fullProduct.of13 || '',
        of15: fullProduct.of15 || '',
        forceBuyQtyLimit: fullProduct.forceBuyQtyLimit || '',
        lastReceived: fullProduct.lastReceived || '',
        tags: fullProduct.tags || '',
        urlHandle: fullProduct.urlHandle || '',
        barcode: fullProduct.barcode || '',
        sku: fullProduct.sku || '',
        trackInventory: fullProduct.trackInventory,
        stockQuantity: editValue,
        lowStockThreshold: product.lowStockThreshold,
        continueSellingOutOfStock: fullProduct.continueSellingOutOfStock,
        variations: fullProduct.variations,
        alternateImages: fullProduct.alternateImages
      }

      const response = await updateProduct(styleId.toString(), updateData)

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Stock updated successfully',
        })
        await loadInventory() // Reload inventory data
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to update stock',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating stock:', error)
      toast({
        title: 'Error',
        description: 'Failed to update stock',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
      setEditingId(null)
      setEditValue(0)
      setEditReason('')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValue(0)
    setEditReason('')
  }

  const clearFilters = () => {
    setFilters({
      stockStatus: 'all',
      category: 'all',
      trend: 'all',
      valueRange: 'all'
    })
    setSearchQuery('')
    setCurrentPage(1)
  }

  const hasActiveFilters = searchQuery || 
    filters.stockStatus !== 'all' || 
    filters.category !== 'all' || 
    filters.trend !== 'all' || 
    filters.valueRange !== 'all'

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
        <div className='max-w-7xl mx-auto p-6'>
          <div className='flex items-center justify-center min-h-[400px]'>
            <div className='flex flex-col items-center gap-4'>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00437f]"></div>
              <p className='text-sm text-gray-500'>Loading inventory data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
                  <FiPackage className='w-5 h-5 text-white' />
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900 dark:text-white tracking-tight'>
                    Inventory Management
                  </h1>
                  <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>
                    Track and manage your product inventory
                  </p>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadInventory()}
                className="h-10 px-4 border-2 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-all duration-200"
              >
                <FiRefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button 
                className="h-10 px-4 bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white shadow-md hover:shadow-lg rounded-xl transition-all duration-200 transform hover:scale-105"
                onClick={() => router.push('/admin/catalog/inventory/adjust')}
              >
                <FiPlus className="mr-2 h-4 w-4" />
                Adjust Stock
              </Button>
            </div>
          </div>
        </div>

        {/* Inventory Overview Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {/* Total Items Card */}
          <div className='relative group'>
            <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
            <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Total Items</p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white mt-1'>{totalItems}</p>
                </div>
                <div className='h-12 w-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-md'>
                  <FiPackage className='h-6 w-6 text-white' />
                </div>
              </div>
            </Card>
          </div>

          {/* Total Value Card */}
          <div className='relative group'>
            <div className='absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
            <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Total Value</p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white mt-1'>${totalValue.toLocaleString()}</p>
                </div>
                <div className='h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md'>
                  <FiDollarSign className='h-6 w-6 text-white' />
                </div>
              </div>
            </Card>
          </div>

          {/* Low Stock Items Card */}
          <div className='relative group'>
            <div className='absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-yellow-500/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
            <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Low Stock Items</p>
                  <p className='text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1'>{lowStockItems}</p>
                </div>
                <div className='h-12 w-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md'>
                  <FiAlertCircle className='h-6 w-6 text-white' />
                </div>
              </div>
            </Card>
          </div>

          {/* Out of Stock Card */}
          <div className='relative group'>
            <div className='absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-500/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
            <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Out of Stock</p>
                  <p className='text-2xl font-bold text-red-600 dark:text-red-400 mt-1'>{outOfStockItems}</p>
                </div>
                <div className='h-12 w-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-md'>
                  <FiAlertCircle className='h-6 w-6 text-white' />
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
                    placeholder="Search by SKU, name, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                      {[searchQuery, filters.stockStatus, filters.category, filters.trend, filters.valueRange].filter(f => f !== 'all' && f !== '').length}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Filters Section */}
              {showFilters && (
                <div className='mt-4 pt-4 border-t border-[#00437f]/20 dark:border-[#00437f]/30'>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>Stock Status</label>
                      <Select value={filters.stockStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, stockStatus: value }))}>
                        <SelectTrigger className='h-9 text-sm border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Stock Levels</SelectItem>
                          <SelectItem value="zero">Zero Stock</SelectItem>
                          <SelectItem value="low">Low Stock</SelectItem>
                          <SelectItem value="high">High Stock</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-2'>
                      <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>Category</label>
                      <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger className='h-9 text-sm border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-2'>
                      <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>Stock Trend</label>
                      <Select value={filters.trend} onValueChange={(value) => setFilters(prev => ({ ...prev, trend: value }))}>
                        <SelectTrigger className='h-9 text-sm border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Trends</SelectItem>
                          <SelectItem value="up">Trending Up</SelectItem>
                          <SelectItem value="down">Trending Down</SelectItem>
                          <SelectItem value="stable">Stable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-2'>
                      <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>Value Range</label>
                      <Select value={filters.valueRange} onValueChange={(value) => setFilters(prev => ({ ...prev, valueRange: value }))}>
                        <SelectTrigger className='h-9 text-sm border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Values</SelectItem>
                          <SelectItem value="low">Under $1,000</SelectItem>
                          <SelectItem value="medium">$1,000 - $5,000</SelectItem>
                          <SelectItem value="high">Over $5,000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {hasActiveFilters && (
                    <div className='mt-4 flex justify-end'>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className='h-8 px-3 text-sm text-[#00437f] hover:text-[#003366] hover:bg-[#00437f]/10'
                      >
                        <FiX className="h-4 w-4 mr-1" />
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Inventory List */}
        <div className='relative group'>
          <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
          <Card className='relative overflow-hidden border border-white/20 dark:border-gray-700/50 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-2xl transition-all duration-300'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-[#00437f]/10'>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider'>
                      <div className='flex items-center gap-2'>
                        <div className='w-2 h-2 bg-[#00437f] rounded-full'></div>
                        Product Details
                      </div>
                    </th>
                    <th className='px-5 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider'>
                      <div className='flex items-center gap-2'>
                        <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                        Stock Level
                      </div>
                    </th>
                    <th className='px-5 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider'>
                      <div className='flex items-center gap-2'>
                        <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
                        Status
                      </div>
                    </th>
                    <th className='px-5 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider'>
                      <div className='flex items-center gap-2'>
                        <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
                        Trend
                      </div>
                    </th>
                    <th className='px-5 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider'>
                      <div className='flex items-center gap-2'>
                        <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
                        Value
                      </div>
                    </th>
                    <th className='px-5 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider'>
                      <div className='flex items-center gap-2'>
                        <div className='w-2 h-2 bg-rose-500 rounded-full'></div>
                        Last Updated
                      </div>
                    </th>
                    <th className='px-5 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider'>
                      <div className='flex items-center justify-end gap-2'>
                        <div className='w-2 h-2 bg-indigo-500 rounded-full'></div>
                        Actions
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-[#00437f]/10'>
                  {currentItems.map((item, index) => (
                    <tr key={item.styleId} className={`hover:bg-[#00437f]/5 transition-colors duration-200 ${
                      index % 2 === 0 ? 'bg-white/50 dark:bg-gray-800/50' : 'bg-gray-50/30 dark:bg-gray-700/30'
                    }`}>
                      <td className='px-6 py-4'>
                        <div className='space-y-2'>
                          <div className='font-semibold text-gray-900 dark:text-white text-sm leading-tight'>
                            {item.name}
                          </div>
                          <div className='flex items-center gap-2'>
                            <Badge variant="outline" className='text-xs border-[#00437f]/30 text-[#00437f] bg-[#00437f]/5'>
                              {item.sku}
                            </Badge>
                            <Badge variant="outline" className='text-xs border-blue-300 text-blue-700 bg-blue-50'>
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className='px-5 py-4'>
                        {editingId === item.styleId ? (
                          <div className='space-y-2'>
                            <div className='flex items-center gap-2'>
                              <Input
                                type="number"
                                min="0"
                                value={editValue}
                                onChange={(e) => setEditValue(parseInt(e.target.value))}
                                className='h-8 w-28 px-2 text-sm border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 rounded-lg focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200'
                              />
                              <Button
                                size="icon"
                                onClick={() => handleSaveEdit(item.styleId)}
                                className='h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200 rounded-lg'
                              >
                                <FiCheck className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                onClick={handleCancelEdit}
                                className='h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 rounded-lg'
                              >
                                <FiX className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <Input
                              placeholder="Reason for change..."
                              value={editReason}
                              onChange={(e) => setEditReason(e.target.value)}
                              className='h-7 w-full px-2 text-xs border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 rounded-lg focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200'
                            />
                          </div>
                        ) : (
                          <div 
                            className='flex items-center gap-2 cursor-pointer group/stock'
                            onClick={() => handleStartEdit(item)}
                          >
                            <div className='relative'>
                              <div className='text-sm font-semibold text-gray-900 dark:text-white group-hover/stock:text-[#00437f] transition-all duration-200 flex items-center gap-2'>
                                <Badge className='bg-gradient-to-r from-[#00437f] to-[#003366] text-white px-2 py-1 text-xs font-medium'>
                                  {item.currentStock.toLocaleString()}
                                </Badge>
                                <span className='text-xs text-gray-500'>units</span>
                                <span className='text-xs text-[#00437f] bg-[#00437f]/10 px-1.5 py-0.5 rounded-full font-medium'>
                                  Edit
                                </span>
                              </div>
                              <div className='text-xs text-gray-500 mt-1'>
                                Low stock at <span className='text-orange-600 font-medium'>{item.lowStockThreshold}</span> units
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className='px-5 py-4'>
                        <Badge 
                          variant={item.status === 'in_stock' ? 'default' : 'secondary'}
                          className={`text-xs px-2 py-1 ${
                            item.status === 'in_stock' 
                              ? 'bg-green-500 text-white ring-1 ring-green-600/20' 
                              : item.status === 'low_stock'
                              ? 'bg-yellow-500 text-white ring-1 ring-yellow-600/20'
                              : 'bg-red-500 text-white ring-1 ring-red-600/20'
                          }`}
                        >
                          {item.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Badge>
                      </td>
                      <td className='px-5 py-4'>
                        <div className='flex items-center justify-center'>
                          {item.trend === 'up' ? (
                            <Badge variant="outline" className='text-green-600 bg-green-50 border-green-200 text-xs'>
                              <FiTrendingUp className="h-3 w-3 mr-1" />
                              Up
                            </Badge>
                          ) : item.trend === 'down' ? (
                            <Badge variant="outline" className='text-red-600 bg-red-50 border-red-200 text-xs'>
                              <FiTrendingDown className="h-3 w-3 mr-1" />
                              Down
                            </Badge>
                          ) : (
                            <Badge variant="outline" className='text-gray-600 bg-gray-50 border-gray-200 text-xs'>
                              <div className='h-3 w-3 text-center text-xs mr-1'>—</div>
                              Stable
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className='px-5 py-4'>
                        <div className='text-sm font-semibold text-gray-900 dark:text-white bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-700/30'>
                          ${item.value.toLocaleString()}
                        </div>
                        <div className='text-xs text-gray-500 mt-1'>
                          ${item.currentStock > 0 ? (item.value / item.currentStock).toFixed(2) : '0.00'} per unit
                        </div>
                      </td>
                      <td className='px-5 py-4'>
                        <div className='text-xs font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600'>
                          {new Date(item.lastUpdated).toLocaleDateString()}
                        </div>
                        <div className='text-xs text-gray-500 mt-1'>
                          {new Date(item.lastUpdated).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className='px-5 py-4 text-right'>
                        <Button
                          size="sm"
                          onClick={() => handleStartEdit(item)}
                          className='h-8 px-3 text-xs font-medium text-white bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] rounded-lg transition-all duration-200 transform hover:scale-105'
                        >
                          <FiEdit2 className="h-3 w-3 mr-1" />
                          Edit Stock
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Premium Pagination */}
        {filteredInventory.length > 10 && (
          <div className='relative group'>
            <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
            <div className='relative p-6 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl transition-all duration-300'>
              <PremiumPagination 
                totalPages={totalPages}
                currentPage={currentPage}
                totalItems={filteredInventory.length}
                itemsPerPage={itemsPerPage}
                onPageChange={paginate}
              />
            </div>
          </div>
        )}

        {/* Edit Stock Modal */}
        {editingId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-2xl max-w-md w-full transform transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl">
                      <FiSettings className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Stock Level</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancelEdit}
                    className="h-8 w-8 text-gray-400 hover:text-gray-500"
                  >
                    <FiX className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                      Current Stock
                    </label>
                    <div className='text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2'>
                      {inventory.find(item => item.styleId === editingId)?.currentStock} units
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                      New Stock Level
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={editValue}
                      onChange={(e) => setEditValue(parseInt(e.target.value))}
                      className='h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200'
                    />
                  </div>

                  <div className='space-y-2'>
                    <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                      Reason for Change
                    </label>
                    <Input
                      placeholder="Enter reason for stock adjustment..."
                      value={editReason}
                      onChange={(e) => setEditReason(e.target.value)}
                      className='h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200'
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="h-11 px-6 border-2 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-all duration-200"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleSaveEdit(editingId)}
                    disabled={isSaving}
                    className="h-11 px-6 bg-gradient-to-r from-[#00437f] to-[#003366] text-white shadow-lg hover:shadow-xl rounded-xl transition-all duration-200"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 