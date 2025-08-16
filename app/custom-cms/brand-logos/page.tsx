'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight, FiExternalLink, FiEye, FiChevronsLeft, FiChevronsRight, FiLoader, FiGrid, FiList } from 'react-icons/fi'
import { useToast } from '@/components/ui/use-toast'

interface Brand {
  id: number
  name: string
  alias: string
  description?: string
  urlHandle: string
  logo?: string
  showOnCategory: boolean
  showOnProduct: boolean
  status: string
  createdAt: string
  updatedAt: string
}



export default function BrandLogosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all')
  
  // Adjust page size based on view mode
  const effectivePageSize = viewMode === 'list' ? 12 : 8

  // Fetch brands from API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/brands')
        const result = await response.json()
        
        if (result.success) {
          setBrands(result.data)
        } else {
          console.error('Failed to fetch brands:', result.error)
          toast({
            title: 'Error',
            description: 'Failed to fetch brands',
            variant: 'destructive',
          })
        }
      } catch (error) {
        console.error('Error fetching brands:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch brands',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBrands()
  }, [toast])

  // View brand function
  const openViewModal = (brand: Brand) => {
    setSelectedBrand(brand)
    setShowViewModal(true)
  }

  // Delete brand function
  const confirmDelete = async () => {
    if (!brandToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/brands/${brandToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete brand')
      }

      // Remove from local state
      setBrands(prev => prev.filter(brand => brand.id !== brandToDelete))
      
      toast({
        title: 'Success!',
        description: 'Brand deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting brand:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete brand',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
      setBrandToDelete(null)
    }
  }

  // Filter brands by search and status
  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         brand.alias.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || brand.status === statusFilter
    return matchesSearch && matchesStatus
  })
  const totalBrands = filteredBrands.length
  const totalPages = Math.max(1, Math.ceil(totalBrands / effectivePageSize))
  const paginatedBrands = filteredBrands.slice((currentPage - 1) * effectivePageSize, currentPage * effectivePageSize)

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  // Generate page numbers with ellipsis (like mini-banners)
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    return pages
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-0 sm:px-6 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Brand Logos</h1>
            <p className="text-gray-600">Showcase and manage your brand partners in style</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/custom-cms/create-brand')}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <FiPlus className="w-5 h-5" />
            New Brand
          </motion.button>
        </div>
        {/* Search and View Controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Premium Search Bar */}
          <div className="relative max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 text-gray-400" />
            </div>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search brands..."
              className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200 backdrop-blur-sm"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center bg-white/80 dark:bg-gray-800/80 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                statusFilter === 'all'
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                statusFilter === 'active'
                  ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                statusFilter === 'draft'
                  ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Draft
            </button>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white/80 dark:bg-gray-800/80 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title="Grid View"
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title="List View"
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Grid */}
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <FiLoader className="w-8 h-8 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading brands...</p>
          </div>
        ) : paginatedBrands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-10 h-10 text-blue-400 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No brand logos yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Upload your first brand logo to get started</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all font-semibold"
              onClick={() => {/* TODO: open upload modal */}}
            >
              <FiPlus className="w-4 h-4" />
              Upload Logo
            </motion.button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
            {paginatedBrands.map((brand: Brand) => (
              <motion.div
                key={brand.id}
                whileHover={{ scale: 1.045, boxShadow: '0 12px 40px 0 rgba(59,130,246,0.13)' }}
                className="relative min-w-[220px] md:min-w-[260px] max-w-xs w-full bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 px-6 pt-7 pb-4 flex flex-col items-center group hover:border-blue-400 hover:shadow-2xl transition-all backdrop-blur-md"
                style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.85) 60%,rgba(59,130,246,0.07) 100%)' }}
              >
                {/* Brand Logo in glassy circle */}
                <div className="w-20 h-20 rounded-full bg-white/70 dark:bg-gray-800/70 border border-blue-100 dark:border-blue-900 shadow-lg flex items-center justify-center mb-3 transition-all group-hover:scale-105 group-hover:border-blue-400">
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} className="w-12 h-12 object-contain" />
                  ) : (
                    <span className="text-gray-300 text-3xl font-bold">?</span>
                  )}
                </div>
                {/* Brand Name & Alias */}
                <div className="w-full text-center mb-1">
                  <div className="text-lg font-extrabold text-gray-900 dark:text-white truncate" title={brand.name}>{brand.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={brand.alias}>{brand.alias}</div>
                </div>
                {/* Status Badge */}
                <div className="flex justify-center mb-3">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                    brand.status === 'active'
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700'
                      : 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      brand.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                    }`}></div>
                    {brand.status === 'active' ? 'Active' : 'Draft'}
                  </div>
                </div>

                {/* Action bar: View, Edit, Delete */}
                <div className="flex items-center justify-center gap-4 w-full mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button 
                    className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-green-100 dark:hover:bg-green-700 text-green-600 dark:text-green-400 transition-all shadow focus:ring-2 focus:ring-green-300" 
                    title="View"
                    onClick={() => openViewModal(brand)}
                  >
                    <FiEye className="w-5 h-5" />
                  </button>
                  <button 
                    className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-700 text-blue-600 dark:text-blue-400 transition-all shadow focus:ring-2 focus:ring-blue-300" 
                    title="Edit"
                    onClick={() => router.push(`/custom-cms/create-brand?id=${brand.id}`)}
                  >
                    <FiEdit2 className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-700 text-red-600 dark:text-red-400 transition-all shadow focus:ring-2 focus:ring-red-300"
                    title="Delete"
                    onClick={() => { setBrandToDelete(brand.id); setShowDeleteModal(true); }}
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {paginatedBrands.map((brand: Brand) => (
              <motion.div
                key={brand.id}
                whileHover={{ scale: 1.01, boxShadow: '0 8px 25px 0 rgba(59,130,246,0.1)' }}
                className="bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 hover:border-blue-300 hover:shadow-xl transition-all backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  {/* Brand Info */}
                  <div className="flex items-center gap-4 flex-1">
                    {/* Logo */}
                    <div className="w-12 h-12 rounded-lg bg-white/70 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 shadow-sm flex items-center justify-center">
                      {brand.logo ? (
                        <img src={brand.logo} alt={brand.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-gray-400 text-lg font-bold">?</span>
                      )}
                    </div>
                    
                    {/* Brand Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{brand.name}</h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{brand.alias}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <a
                          href={`https://${brand.urlHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <FiExternalLink className="w-3 h-3" />
                          {brand.urlHandle}
                        </a>
                        <span className="text-xs text-gray-400">•</span>
                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                          brand.status === 'active'
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700'
                            : 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            brand.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                          }`}></div>
                          {brand.status === 'active' ? 'Active' : 'Draft'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button 
                      className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-green-700 text-green-600 dark:text-green-400 transition-all shadow-sm" 
                      title="View"
                      onClick={() => openViewModal(brand)}
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-700 text-blue-600 dark:text-blue-400 transition-all shadow-sm" 
                      title="Edit"
                      onClick={() => router.push(`/custom-cms/create-brand?id=${brand.id}`)}
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-700 text-red-600 dark:text-red-400 transition-all shadow-sm"
                      title="Delete"
                      onClick={() => { setBrandToDelete(brand.id); setShowDeleteModal(true); }}
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 max-w-7xl mx-auto px-2">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{(currentPage - 1) * effectivePageSize + 1}</span>
            -<span className="font-semibold text-gray-900 dark:text-white">{Math.min(currentPage * effectivePageSize, totalBrands)}</span>
            of <span className="font-semibold text-gray-900 dark:text-white">{totalBrands}</span> brands
          </div>
          <div className="flex items-center gap-1">
            <button
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-700 text-gray-500 dark:text-gray-300 disabled:opacity-50"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              aria-label="First Page"
            >
              <FiChevronsLeft className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-700 text-gray-500 dark:text-gray-300 disabled:opacity-50"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous Page"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            {getPageNumbers().map((page, idx) =>
              typeof page === 'number' ? (
                <button
                  key={page}
                  className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition-all ${
                    page === currentPage
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-700'
                  }`}
                  onClick={() => goToPage(page as number)}
                >
                  {page}
                </button>
              ) : (
                <span key={idx} className="px-2 text-gray-400">...</span>
              )
            )}
            <button
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-700 text-gray-500 dark:text-gray-300 disabled:opacity-50"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next Page"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-700 text-gray-500 dark:text-gray-300 disabled:opacity-50"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Last Page"
            >
              <FiChevronsRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Upload Button (Mobile) */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl p-4 transition-all flex items-center justify-center sm:hidden"
        onClick={() => {/* TODO: open upload modal */}}
      >
        <FiPlus className="w-6 h-6" />
      </motion.button>

      {/* View Brand Modal */}
      <AnimatePresence>
        {showViewModal && selectedBrand && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                      {selectedBrand.logo ? (
                        <img src={selectedBrand.logo} alt={selectedBrand.name} className="w-10 h-10 object-contain" />
                      ) : (
                        <span className="text-white text-2xl font-bold">?</span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedBrand.name}</h2>
                      <p className="text-blue-100 text-sm">{selectedBrand.alias}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all backdrop-blur-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                {/* Brand Logo Section */}
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 shadow-lg flex items-center justify-center mb-4">
                    {selectedBrand.logo ? (
                      <img src={selectedBrand.logo} alt={selectedBrand.name} className="w-20 h-20 object-contain" />
                    ) : (
                      <span className="text-gray-400 text-4xl font-bold">?</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{selectedBrand.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{selectedBrand.alias}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Website</label>
                      <a
                        href={`https://${selectedBrand.urlHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-all"
                      >
                        <FiExternalLink className="w-4 h-4" />
                        <span className="font-medium">{selectedBrand.urlHandle}</span>
                      </a>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                      <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${
                        selectedBrand.status === 'active' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          selectedBrand.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        {selectedBrand.status.charAt(0).toUpperCase() + selectedBrand.status.slice(1)}
                      </div>
                    </div>
                  </div>

                  {/* Display Settings */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Display Settings</label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-sm text-gray-600 dark:text-gray-300">Show on Category Pages</span>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            selectedBrand.showOnCategory ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}>
                            {selectedBrand.showOnCategory && (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-sm text-gray-600 dark:text-gray-300">Show on Product Pages</span>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            selectedBrand.showOnProduct ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}>
                            {selectedBrand.showOnProduct && (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedBrand.description && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {selectedBrand.description}
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Created</label>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {new Date(selectedBrand.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Last Updated</label>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {new Date(selectedBrand.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    router.push(`/custom-cms/create-brand?id=${selectedBrand.id}`)
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <FiEdit2 className="w-4 h-4" />
                  Edit Brand
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 max-w-sm w-full flex flex-col items-center"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FiTrash2 className="w-8 h-8 text-red-500 mb-4" />
              <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Delete Brand Logo?</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">Are you sure you want to delete this brand logo? This cannot be undone.</p>
              <div className="flex gap-4">
                <button
                  className="px-5 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-semibold"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all font-semibold disabled:opacity-50"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin inline mr-2" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 