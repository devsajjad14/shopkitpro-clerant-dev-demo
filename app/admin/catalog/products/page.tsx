'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FiArrowLeft, FiPlus, FiSearch, FiEdit2, FiTrash2, FiChevronsLeft, FiChevronLeft, FiChevronRight, FiChevronsRight, FiMoreVertical, FiFilter, FiGrid, FiList, FiX, FiPackage, FiAlertTriangle } from 'react-icons/fi'
import { getProducts } from '@/lib/actions/products'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PremiumPagination } from '@/components/ui/premium-pagination'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Product {
  id: number
  styleId: number
  name: string
  style: string
  quantityAvailable: number
  onSale: string
  isNew: string
  smallPicture: string | null
  mediumPicture: string | null
  largePicture: string | null
  department: string | null
  categoryName?: string
  type: string | null
  subType: string | null
  brand: string | null
  sellingPrice: string
  regularPrice: string
  longDescription: string | null
  of7: string | null
  of12: string | null
  of13: string | null
  of15: string | null
  forceBuyQtyLimit: string | null
  lastReceived: string | null
  createdAt: Date | null
  updatedAt: Date | null
  variations: {
    id: number
    productId: number
    skuId: number
    color: string
    attr1Alias: string
    hex: string | null
    size: string
    subSize: string | null
    quantity: number
    colorImage: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }[]
  alternateImages: {
    id: number
    productId: number
    AltImage: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }[]
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
  // New state for sorting and filtering
  const [sortBy, setSortBy] = useState('newest')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [brandFilter, setBrandFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showFilters, setShowFilters] = useState(false)
  
  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await getProducts()
      const sortedData = data.sort((a, b) => {
        // Prioritize "New" products
        if (a.isNew === 'Y' && b.isNew !== 'Y') return -1
        if (a.isNew !== 'Y' && b.isNew === 'Y') return 1
        
        // Then sort by creation date (latest first)
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0

        return dateB - dateA
      })
      setProducts(sortedData)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProduct = async (product: Product) => {
    try {
      setIsDeleting(true)
      
      // Call the API route directly for product deletion with image cleanup
      const response = await fetch(`/api/products/${product.styleId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete product')
      }
      
      const result = await response.json()
      if (result.success) {
        setProducts(products.filter(p => p.styleId !== product.styleId))
        toast({
          title: "Success",
          description: "Product deleted successfully",
        })
      } else {
        throw new Error(result.error || 'Failed to delete product')
      }
      
      setIsDeleteDialogOpen(false)
      setProductToDelete(null)
    } catch (error) {
      console.error('Error deleting product:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An error occurred while deleting the product',
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Get unique categories, brands, and statuses for filters
  const categories = ['all', ...Array.from(new Set(products.map(p => p.categoryName || p.department).filter(Boolean)))]
  const brands = ['all', ...Array.from(new Set(products.map(p => p.brand).filter(Boolean)))]
  const statuses = ['all', 'active', 'sale', 'new', 'out-of-stock']

  // Apply filters and sorting
  const filteredAndSortedProducts = products
    .filter(product => {
      const trimmedSearchQuery = searchQuery.trim().toLowerCase();
      const matchesSearch = product.name.toLowerCase().includes(trimmedSearchQuery) ||
                           product.brand?.toLowerCase().includes(trimmedSearchQuery) ||
                           product.style?.toLowerCase().includes(trimmedSearchQuery) ||
                           product.styleId.toString().includes(trimmedSearchQuery)
      
      const matchesCategory = categoryFilter === 'all' || 
                             (product.categoryName === categoryFilter || product.department === categoryFilter)
      const matchesBrand = brandFilter === 'all' || product.brand === brandFilter
      
      let matchesStatus = true
      if (statusFilter === 'sale') matchesStatus = product.onSale === 'Y'
      else if (statusFilter === 'new') matchesStatus = product.isNew === 'Y'
      else if (statusFilter === 'out-of-stock') matchesStatus = product.quantityAvailable === 0
      
      return matchesSearch && matchesCategory && matchesBrand && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'price-asc':
          return Number(a.sellingPrice) - Number(b.sellingPrice)
        case 'price-desc':
          return Number(b.sellingPrice) - Number(a.sellingPrice)
        case 'stock-asc':
          return a.quantityAvailable - b.quantityAvailable
        case 'stock-desc':
          return b.quantityAvailable - a.quantityAvailable
        case 'oldest':
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateA - dateB
        case 'newest':
        default:
          const dateA2 = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB2 = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateB2 - dateA2
      }
    })

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' }
    if (quantity > 0) return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' }
    return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setCategoryFilter('all')
    setStatusFilter('all')
    setBrandFilter('all')
    setSortBy('newest')
    setCurrentPage(1)
  }

  const hasActiveFilters = searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' || brandFilter !== 'all' || sortBy !== 'newest'

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
                    Products
                  </h1>
                  <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>
                    {filteredAndSortedProducts.length} of {products.length} products
                  </p>
                </div>
              </div>
            </div>
            <Button 
              size="sm"
              className="bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              onClick={() => router.push('/admin/catalog/products/add')}
            >
              <FiPlus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
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
                    placeholder="Search by name, style, brand..."
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
                      {[searchQuery, categoryFilter, statusFilter, brandFilter, sortBy].filter(f => f !== 'all' && f !== 'newest' && f !== '').length}
                    </Badge>
                  )}
                </Button>
                <div className='flex items-center gap-2'>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`h-10 w-10 p-0 rounded-lg ${
                      viewMode === 'list' 
                        ? 'bg-[#00437f] text-white hover:bg-[#003366]' 
                        : 'border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366]'
                    } transition-all duration-200`}
                  >
                    <FiList className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`h-10 w-10 p-0 rounded-lg ${
                      viewMode === 'grid' 
                        ? 'bg-[#00437f] text-white hover:bg-[#003366]' 
                        : 'border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366]'
                    } transition-all duration-200`}
                  >
                    <FiGrid className="h-4 w-4" />
                  </Button>
                </div>
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
                  
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
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
                          <SelectItem value="name-asc">Name A-Z</SelectItem>
                          <SelectItem value="name-desc">Name Z-A</SelectItem>
                          <SelectItem value="price-asc">Price Low to High</SelectItem>
                          <SelectItem value="price-desc">Price High to Low</SelectItem>
                          <SelectItem value="stock-asc">Stock Low to High</SelectItem>
                          <SelectItem value="stock-desc">Stock High to Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Category Filter */}
                    <div className='space-y-2'>
                      <label className='text-sm font-semibold text-gray-900 dark:text-white'>Category</label>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className='h-10 bg-white/50 dark:bg-gray-700/50 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-lg transition-all duration-300'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.filter(cat => cat !== 'all').map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Brand Filter */}
                    <div className='space-y-2'>
                      <label className='text-sm font-semibold text-gray-900 dark:text-white'>Brand</label>
                      <Select value={brandFilter} onValueChange={setBrandFilter}>
                        <SelectTrigger className='h-10 bg-white/50 dark:bg-gray-700/50 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-lg transition-all duration-300'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Brands</SelectItem>
                          {brands.filter(brand => brand !== 'all').map(brand => (
                            <SelectItem key={brand} value={brand}>
                              {brand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status Filter */}
                    <div className='space-y-2'>
                      <label className='text-sm font-semibold text-gray-900 dark:text-white'>Status</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className='h-10 bg-white/50 dark:bg-gray-700/50 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-lg transition-all duration-300'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="sale">On Sale</SelectItem>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Active Filters Display */}
                  {hasActiveFilters && (
                    <div className='flex flex-wrap gap-2 pt-4 border-t border-[#00437f]/20 dark:border-[#00437f]/30'>
                      {searchQuery && (
                        <Badge className="flex items-center gap-2 bg-[#00437f] text-white px-3 py-1 rounded-lg text-xs">
                          Search: "{searchQuery}"
                          <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-red-200 transition-colors">
                            <FiX className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {categoryFilter !== 'all' && (
                        <Badge className="flex items-center gap-2 bg-[#00437f] text-white px-3 py-1 rounded-lg text-xs">
                          Category: {categoryFilter}
                          <button onClick={() => setCategoryFilter('all')} className="ml-1 hover:text-red-200 transition-colors">
                            <FiX className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {brandFilter !== 'all' && (
                        <Badge className="flex items-center gap-2 bg-[#00437f] text-white px-3 py-1 rounded-lg text-xs">
                          Brand: {brandFilter}
                          <button onClick={() => setBrandFilter('all')} className="ml-1 hover:text-red-200 transition-colors">
                            <FiX className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {statusFilter !== 'all' && (
                        <Badge className="flex items-center gap-2 bg-[#00437f] text-white px-3 py-1 rounded-lg text-xs">
                          Status: {statusFilter}
                          <button onClick={() => setStatusFilter('all')} className="ml-1 hover:text-red-200 transition-colors">
                            <FiX className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {sortBy !== 'newest' && (
                        <Badge className="flex items-center gap-2 bg-[#00437f] text-white px-3 py-1 rounded-lg text-xs">
                          Sort: {sortBy}
                          <button onClick={() => setSortBy('newest')} className="ml-1 hover:text-red-200 transition-colors">
                            <FiX className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Products List */}
        <div className='space-y-4'>
          {isLoading ? (
            <div className='relative group'>
              <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl'></div>
              <Card className='relative p-8 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl text-center'>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00437f] mx-auto"></div>
                <p className="mt-3 text-base font-semibold text-gray-900 dark:text-white">Loading products...</p>
              </Card>
            </div>
          ) : currentItems.length === 0 ? (
            <div className='relative group'>
              <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl'></div>
              <Card className='relative p-8 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl text-center'>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">No products found</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  {hasActiveFilters ? 'Try adjusting your filters.' : 'Try adjusting your search query.'}
                </p>
              </Card>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
              {currentItems.map((product) => {
                const stockStatus = getStockStatus(product.quantityAvailable)
                
                if (viewMode === 'grid') {
                  // Grid View Layout
                  return (
                    <div key={product.id} className='relative group'>
                      <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
                      <Card className='relative p-4 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]'>
                        <div className='space-y-3'>
                          {/* Image */}
                          <div className='aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-[#00437f]/5 to-[#00437f]/10 border border-[#00437f]/20'>
                            {product.smallPicture ? (
                              <img
                                src={product.smallPicture}
                                alt={product.name}
                                className='w-full h-full object-cover'
                              />
                            ) : (
                              <div className='w-full h-full flex items-center justify-center text-[#00437f]'>
                                <FiPackage className="h-8 w-8" />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className='space-y-2'>
                            <div>
                              <p className='font-bold text-gray-900 dark:text-white text-base line-clamp-2'>{product.name}</p>
                              <p className='text-xs text-gray-600 dark:text-gray-300 mt-1'>{product.brand || 'No Brand'}</p>
                            </div>
                            
                            <div className='flex items-center justify-between'>
                              <p className='font-bold text-[#00437f] text-base'>${Number(product.sellingPrice || 0).toFixed(2)}</p>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                                {stockStatus.text}
                              </span>
                            </div>

                            <div className='flex items-center gap-2'>
                              {product.onSale === 'Y' && (
                                <span className='px-2 py-1 text-xs font-medium bg-pink-100 text-pink-800 rounded-full'>
                                  Sale
                                </span>
                              )}
                              {product.isNew === 'Y' && (
                                <span className='px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full'>
                                  New
                                </span>
                              )}
                            </div>

                            <p className='text-xs text-gray-600 dark:text-gray-300'>
                              {product.categoryName || product.department || 'Uncategorized'}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className='flex items-center justify-end gap-2 pt-3 border-t border-[#00437f]/20'>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/admin/catalog/products/edit/${product.styleId.toString()}`)}
                              className='h-8 w-8 p-0 text-[#00437f] hover:text-[#003366] hover:bg-[#00437f]/10 transition-all duration-200 rounded-lg'
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setProductToDelete(product)
                                setIsDeleteDialogOpen(true)
                              }}
                              className='h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 rounded-lg'
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )
                } else {
                  // List View Layout
                  return (
                    <div key={product.id} className='relative group'>
                      <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
                      <Card className='relative p-6 border border-white/20 dark:border-gray-700/50 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]'>
                        <div className='flex items-center gap-6'>
                          {/* Image */}
                          <div className='flex-shrink-0'>
                            {product.smallPicture ? (
                              <img
                                src={product.smallPicture}
                                alt={product.name}
                                className='w-20 h-20 rounded-xl object-cover border-2 border-[#00437f]/20'
                              />
                            ) : (
                              <div className='w-20 h-20 rounded-xl bg-gradient-to-br from-[#00437f]/5 to-[#00437f]/10 border-2 border-[#00437f]/20 flex items-center justify-center text-[#00437f]'>
                                <FiPackage className="h-8 w-8" />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className='flex-grow grid grid-cols-6 gap-6 items-center'>
                            <div className='col-span-2'>
                              <p className='font-bold text-gray-900 dark:text-white text-lg'>{product.name}</p>
                              <p className='text-sm text-gray-600 dark:text-gray-300'>{product.brand || 'No Brand'} • {product.style || 'No Style'}</p>
                            </div>
                            <div>
                              <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>Category</p>
                              <p className='font-semibold text-gray-900 dark:text-white text-sm'>
                                {product.categoryName || product.department || 'Uncategorized'}
                              </p>
                            </div>
                            <div>
                              <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>Price</p>
                              <p className='font-bold text-[#00437f] text-lg'>${Number(product.sellingPrice || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>Stock</p>
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                                {stockStatus.text}
                              </span>
                            </div>
                            <div>
                              <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>Status</p>
                              <div className='flex items-center gap-2 mt-1'>
                                {product.onSale === 'Y' && (
                                  <span className='px-3 py-1 text-xs font-medium bg-pink-100 text-pink-800 rounded-full'>
                                    Sale
                                  </span>
                                )}
                                {product.isNew === 'Y' && (
                                  <span className='px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full'>
                                    New
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className='flex-shrink-0'>
                            <div className='flex items-center justify-end gap-2'>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/admin/catalog/products/edit/${product.styleId.toString()}`)}
                                className='h-10 w-10 p-0 text-[#00437f] hover:text-[#003366] hover:bg-[#00437f]/10 transition-all duration-200 rounded-xl'
                              >
                                <FiEdit2 className="h-5 w-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setProductToDelete(product)
                                  setIsDeleteDialogOpen(true)
                                }}
                                className='h-10 w-10 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 rounded-xl'
                              >
                                <FiTrash2 className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )
                }
              })}
            </div>
          )}
          
          <PremiumPagination 
            totalPages={totalPages}
            currentPage={currentPage}
            totalItems={filteredAndSortedProducts.length}
            itemsPerPage={itemsPerPage}
            onPageChange={paginate}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FiAlertTriangle className="h-5 w-5 text-red-500" />
              Delete Product
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone and will remove all associated images.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setProductToDelete(null)
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  productToDelete && handleDeleteProduct(productToDelete)
                }
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Deleting...
                  </div>
                ) : (
                  'Delete Product'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 