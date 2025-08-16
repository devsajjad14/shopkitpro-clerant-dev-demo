'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiSearch, 
  FiFilter, 
  FiMoreVertical, 
  FiCalendar, 
  FiUser, 
  FiChevronLeft, 
  FiChevronRight, 
  FiChevronsLeft, 
  FiChevronsRight,
  FiLoader,
  FiGrid,
  FiList,
  FiGlobe,
  FiLock,
  FiEdit3,
  FiTrendingUp,
  FiFile,
  FiX,
  FiCheckCircle
} from 'react-icons/fi'
import { useToast } from '@/components/ui/use-toast'

// TypeScript interface for page data
interface Page {
  id: number
  title: string
  slug: string
  content?: string | null
  status: 'draft' | 'published'
  metaTitle?: string | null
  metaDescription?: string | null
  metaKeywords?: string | null
  canonicalUrl?: string | null
  featuredImage?: string | null
  isPublic: boolean
  allowComments: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  isDeleted?: boolean
}

export default function PagesPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // State management
  const [pages, setPages] = useState<Page[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [pageToDelete, setPageToDelete] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('updatedAt')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  
  const itemsPerPage = viewMode === 'list' ? 10 : 8

  // Fetch pages on component mount
  useEffect(() => {
    fetchPages()
  }, [currentPage, searchTerm, statusFilter, sortBy])

  // Fetch pages from API
  const fetchPages = async () => {
    try {
      setIsLoading(true)
      
      const params = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString(),
        sortBy,
        sortOrder: 'desc',
      })

      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const response = await fetch(`/api/pages?${params}`)
      const result = await response.json()

      if (result.success) {
        setPages(result.data)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch pages',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching pages:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch pages',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Delete page
  const confirmDelete = async () => {
    if (!pageToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/pages/${pageToDelete}?permanent=true`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Page deleted successfully',
        })
        setPages(pages.filter(page => page.id !== pageToDelete))
        setPageToDelete(null)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete page')
      }
    } catch (error) {
      console.error('Error deleting page:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete page',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Publish/Unpublish page
  const togglePublishStatus = async (pageId: number, currentStatus: string) => {
    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: currentStatus === 'published' ? 'unpublish' : 'publish' }),
      })

      if (response.ok) {
        const result = await response.json()
        setPages(pages.map(page => 
          page.id === pageId 
            ? { ...page, status: result.data.status, updatedAt: result.data.updatedAt }
            : page
        ))
        toast({
          title: 'Success',
          description: `Page ${currentStatus === 'published' ? 'unpublished' : 'published'} successfully`,
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || `Failed to ${currentStatus} page`)
      }
    } catch (error) {
      console.error(`Error ${currentStatus}ing page:`, error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : `Failed to ${currentStatus} page`,
        variant: 'destructive',
      })
    }
  }

  // Open view modal
  const openViewModal = (page: Page) => {
    setSelectedPage(page)
    setShowViewModal(true)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: {
        bg: 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30',
        border: 'border-green-200 dark:border-green-700',
        text: 'text-green-700 dark:text-green-300',
        dot: 'bg-green-500',
        label: 'Published'
      },
      draft: {
        bg: 'bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-900/30 dark:to-slate-900/30',
        border: 'border-gray-200 dark:border-gray-700',
        text: 'text-gray-700 dark:text-gray-300',
        dot: 'bg-gray-500',
        label: 'Draft'
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${config.bg} ${config.border} ${config.text} text-sm font-medium shadow-sm`}>
        <div className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`}></div>
        {config.label}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8"
        >
            <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Pages Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create, edit, and manage your website pages with our premium CMS
            </p>
            </div>
          
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/custom-cms/create-page')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
            <FiPlus className="w-5 h-5" />
            Create New Page
            </motion.button>
        </motion.div>

        {/* Filters and Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search pages..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                />
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <FiGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <FiList className="w-4 h-4" />
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              {['all', 'published', 'draft'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === status
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="updatedAt">Last Updated</option>
              <option value="createdAt">Date Created</option>
                <option value="title">Title</option>
              </select>
          </div>
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <FiLoader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading pages...</p>
            </div>
          </div>
        ) : pages.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
              <FiFile className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No pages found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first page'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
            <button
                  onClick={() => router.push('/custom-cms/create-page')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <FiPlus className="w-5 h-5" />
                  Create Your First Page
            </button>
              )}
          </div>
          </motion.div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {pages.map((page) => (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all overflow-hidden group"
                  >
                    {/* Featured Image */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                      {page.featuredImage ? (
                        <img
                          src={page.featuredImage}
                          alt={page.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FiFile className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    {/* Title and Actions */}
                    <div className="p-6 flex flex-col gap-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
                        {page.title}
                      </h3>
                      <div className="flex items-center justify-between gap-2 mt-2">
                        {/* Publish status badge on left */}
                        {getStatusBadge(page.status)}
                        {/* Actions on right */}
                        <div className="flex items-center gap-2 ml-auto">
                          <button
                            onClick={() => openViewModal(page)}
                            className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/custom-cms/create-page?id=${page.id}`)}
                            className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors shadow-sm"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPageToDelete(page.id)}
                            className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors shadow-sm"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                          {page.status === 'draft' && (
                            <button
                              onClick={() => togglePublishStatus(page.id, page.status)}
                              className="p-2 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 dark:from-green-900 dark:via-emerald-900 dark:to-teal-900 text-white rounded-lg shadow-lg hover:scale-105 hover:shadow-xl transition-all"
                              title="Publish"
                            >
                              <FiCheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Featured
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {pages.map((page) => (
                        <tr key={page.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-4">
                            {page.featuredImage ? (
                              <img src={page.featuredImage} alt={page.title} className="w-16 h-16 object-cover rounded-lg" />
                            ) : (
                              <FiFile className="w-8 h-8 text-gray-400" />
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {page.title}
                    </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Publish status badge on left */}
                              {getStatusBadge(page.status)}
                              {/* Actions on right */}
                              <div className="flex items-center gap-2 ml-auto">
                                <button
                                  onClick={() => openViewModal(page)}
                                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                        <FiEye className="w-4 h-4" />
                      </button>
                                <button
                                  onClick={() => router.push(`/custom-cms/create-page?id=${page.id}`)}
                                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                                <button
                                  onClick={() => setPageToDelete(page.id)}
                                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                                {page.status === 'draft' && (
                                  <button
                                    onClick={() => togglePublishStatus(page.id, page.status)}
                                    className="p-2 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 dark:from-green-900 dark:via-emerald-900 dark:to-teal-900 text-white rounded-lg shadow-lg hover:scale-105 hover:shadow-xl transition-all"
                                    title="Publish"
                                  >
                                    <FiCheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                    </div>
                  </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {pageToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-2xl"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Delete Page
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete this page? This action cannot be undone.
                </p>
                <div className="flex items-center gap-3">
              <button
                    onClick={() => setPageToDelete(null)}
                    className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                    Cancel
              </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
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

        {/* View Page Modal */}
        <AnimatePresence>
          {showViewModal && selectedPage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{selectedPage.title}</h3>
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <FiX className="w-5 h-5" />
              </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Featured Image */}
                  {selectedPage.featuredImage && (
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                      <img
                        src={selectedPage.featuredImage}
                        alt={selectedPage.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Page Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Page Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Status:</span>
                          <span>{getStatusBadge(selectedPage.status)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Template:</span>
                          <span className="capitalize">default template</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Page Type:</span>
                          <span className="capitalize">page</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Settings</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Public:</span>
                          <span className={selectedPage.isPublic ? 'text-green-600' : 'text-red-600'}>
                            {selectedPage.isPublic ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SEO Information */}
                  {(selectedPage.metaTitle || selectedPage.metaDescription) && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">SEO Information</h4>
                      <div className="space-y-2 text-sm">
                        {selectedPage.metaTitle && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Meta Title:</span>
                            <p className="text-gray-900 dark:text-white mt-1">{selectedPage.metaTitle}</p>
                          </div>
                        )}
                        {selectedPage.metaDescription && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Meta Description:</span>
                            <p className="text-gray-900 dark:text-white mt-1">{selectedPage.metaDescription}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Timestamps</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Created:</span>
                        <p className="text-gray-900 dark:text-white mt-1">{formatDate(selectedPage.createdAt)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                        <p className="text-gray-900 dark:text-white mt-1">{formatDate(selectedPage.updatedAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setShowViewModal(false)
                        router.push(`/custom-cms/create-page?id=${selectedPage.id}`)
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Edit Page
                    </button>
              <button
                      onClick={() => setShowViewModal(false)}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                      Close
              </button>
            </div>
          </div>
              </motion.div>
            </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  )
} 