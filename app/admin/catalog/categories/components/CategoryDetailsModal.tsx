'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { FiX, FiInfo, FiTag, FiClock, FiLink, FiFileText, FiFolder, FiEye, FiGrid, FiSettings, FiBarChart3 } from 'react-icons/fi'
import { Badge } from '@/components/ui/badge'

interface TaxonomyItem {
  WEB_TAXONOMY_ID: number
  DEPT: string
  TYP: string
  SUBTYP_1: string
  SUBTYP_2: string
  SUBTYP_3: string
  WEB_URL: string
  ACTIVE: number
  LONG_DESCRIPTION?: string | null
  SHORT_DESC?: string | null
  META_TAGS?: string | null
  SORT_POSITION?: number | null
  CREATED_AT?: string | null
  UPDATED_AT?: string | null
}

interface CategoryDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  categoryId: number | null
}

export default function CategoryDetailsModal({
  isOpen,
  onClose,
  categoryId,
}: CategoryDetailsModalProps) {
  const [category, setCategory] = useState<TaxonomyItem | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && categoryId) {
      fetchCategoryDetails()
    }
  }, [isOpen, categoryId])

  const fetchCategoryDetails = async () => {
    if (!categoryId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/catalog/categories/${categoryId}`)
      if (response.ok) {
        const data = await response.json()
        setCategory(data)
      } else {
        console.error('Failed to fetch category details')
      }
    } catch (error) {
      console.error('Error fetching category details:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not available'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 border-0 bg-transparent [&>button]:hidden">
        {/* Premium Modal Container */}
        <div className="relative w-full h-full">
          {/* Backdrop Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-blue-50/40 to-indigo-50/30 dark:from-gray-900/90 dark:via-gray-800/80 dark:to-gray-900/90 backdrop-blur-3xl"></div>
          
          {/* Main Modal Content */}
          <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-white/30 dark:border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden">
            
            {/* Dialog Header for Accessibility */}
            <DialogHeader className="sr-only">
              <DialogTitle>Category Details</DialogTitle>
              <DialogDescription>View comprehensive information about this category</DialogDescription>
            </DialogHeader>
            
            {/* Premium Header */}
            <div className="relative overflow-hidden">
              {/* Header Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#00437f]/10 via-[#00437f]/5 to-[#003366]/10"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent dark:from-gray-800/60"></div>
              
              <div className="relative flex items-center justify-between p-8 border-b border-white/20 dark:border-gray-700/30">
                <div className="flex items-center gap-4">
                  {/* Premium Icon */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-2xl blur-lg opacity-30"></div>
                    <div className="relative p-3 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-2xl shadow-lg">
                      <FiEye className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      Category Details
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      View comprehensive information about this category
                    </p>
                  </div>
                </div>
                
                {/* Premium Close Button */}
                <button
                  onClick={onClose}
                  className="group relative p-3 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300"
                  aria-label="Close dialog"
                >
                  <FiX className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              {loading ? (
                <div className="space-y-6">
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : category ? (
                                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   
                   {/* Main Information Card */}
                   <div className="group relative">
                     <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white/30 to-indigo-50/30 dark:from-blue-900/20 dark:via-gray-800/30 dark:to-indigo-900/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                     <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/40 dark:border-gray-700/40 rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:scale-[1.02] hover:border-[#00437f]/20 dark:hover:border-[#00437f]/30 transition-all duration-500 h-full flex flex-col">
                      
                      {/* Card Header */}
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                          <FiInfo className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Core category details</p>
                        </div>
                      </div>

                                             <div className="space-y-4 flex-grow">
                         <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/80 to-blue-50/40 dark:from-gray-700/50 dark:to-gray-600/30 rounded-2xl hover:from-gray-100/90 hover:to-blue-100/60 dark:hover:from-gray-600/70 dark:hover:to-gray-500/50 transition-all duration-300">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Category ID</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white bg-white/60 dark:bg-gray-700/60 px-3 py-1 rounded-lg">
                            #{category.WEB_TAXONOMY_ID}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/80 to-blue-50/40 dark:from-gray-700/50 dark:to-gray-600/30 rounded-2xl hover:from-gray-100/90 hover:to-blue-100/60 dark:hover:from-gray-600/70 dark:hover:to-gray-500/50 transition-all duration-300">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Department</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{category.DEPT}</span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/80 to-blue-50/40 dark:from-gray-700/50 dark:to-gray-600/30 rounded-2xl hover:from-gray-100/90 hover:to-blue-100/60 dark:hover:from-gray-600/70 dark:hover:to-gray-500/50 transition-all duration-300">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Type</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{category.TYP}</span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/80 to-blue-50/40 dark:from-gray-700/50 dark:to-gray-600/30 rounded-2xl hover:from-gray-100/90 hover:to-blue-100/60 dark:hover:from-gray-600/70 dark:hover:to-gray-500/50 transition-all duration-300">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</span>
                          <Badge 
                            variant={category.ACTIVE ? "default" : "secondary"}
                            className={`${category.ACTIVE 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                              : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg'
                            } hover:shadow-xl transition-all duration-300`}
                          >
                            {category.ACTIVE ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                                             </div>
                     </div>
                   </div>

                   {/* URL & Metadata Card */}
                   <div className="group relative">
                     <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-white/30 to-pink-50/30 dark:from-purple-900/20 dark:via-gray-800/30 dark:to-pink-900/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                     <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/40 dark:border-gray-700/40 rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:scale-[1.02] hover:border-[#00437f]/20 dark:hover:border-[#00437f]/30 transition-all duration-500 h-full flex flex-col">
                      
                      {/* Card Header */}
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                          <FiLink className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">URL & Metadata</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">SEO and navigation details</p>
                        </div>
                      </div>

                                             <div className="space-y-4 flex-grow">
                         <div className="p-4 bg-gradient-to-r from-gray-50/80 to-purple-50/40 dark:from-gray-700/50 dark:to-gray-600/30 rounded-2xl hover:from-gray-100/90 hover:to-purple-100/60 dark:hover:from-gray-600/70 dark:hover:to-gray-500/50 transition-all duration-300">
                          <div className="flex items-center gap-2 mb-2">
                            <FiLink className="h-4 w-4 text-[#00437f]" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Web URL</span>
                          </div>
                          <p className="text-sm font-mono text-gray-900 dark:text-white bg-white/60 dark:bg-gray-700/60 px-3 py-2 rounded-lg break-all">
                            {category.WEB_URL || 'Not available'}
                          </p>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-gray-50/80 to-purple-50/40 dark:from-gray-700/50 dark:to-gray-600/30 rounded-2xl hover:from-gray-100/90 hover:to-purple-100/60 dark:hover:from-gray-600/70 dark:hover:to-gray-500/50 transition-all duration-300">
                          <div className="flex items-center gap-2 mb-2">
                            <FiTag className="h-4 w-4 text-[#00437f]" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Meta Tags</span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white bg-white/60 dark:bg-gray-700/60 px-3 py-2 rounded-lg">
                            {category.META_TAGS || 'Not available'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/80 to-purple-50/40 dark:from-gray-700/50 dark:to-gray-600/30 rounded-2xl hover:from-gray-100/90 hover:to-purple-100/60 dark:hover:from-gray-600/70 dark:hover:to-gray-500/50 transition-all duration-300">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sort Position</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white bg-white/60 dark:bg-gray-700/60 px-3 py-1 rounded-lg">
                            {category.SORT_POSITION || 'Not set'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Descriptions Card */}
                  <div className="group relative lg:col-span-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-white/30 to-teal-50/30 dark:from-emerald-900/20 dark:via-gray-800/30 dark:to-teal-900/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/40 dark:border-gray-700/40 rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:scale-[1.02] hover:border-[#00437f]/20 dark:hover:border-[#00437f]/30 transition-all duration-500">
                      
                      {/* Card Header */}
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                          <FiFileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Descriptions</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Category content and details</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="p-4 bg-gradient-to-r from-gray-50/80 to-emerald-50/40 dark:from-gray-700/50 dark:to-gray-600/30 rounded-2xl hover:from-gray-100/90 hover:to-emerald-100/60 dark:hover:from-gray-600/70 dark:hover:to-gray-500/50 transition-all duration-300">
                          <div className="flex items-center gap-2 mb-3">
                            <FiFileText className="h-4 w-4 text-[#00437f]" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Short Description</span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white bg-white/60 dark:bg-gray-700/60 px-3 py-2 rounded-lg min-h-[60px]">
                            {category.SHORT_DESC || 'No short description available'}
                          </p>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-gray-50/80 to-emerald-50/40 dark:from-gray-700/50 dark:to-gray-600/30 rounded-2xl hover:from-gray-100/90 hover:to-emerald-100/60 dark:hover:from-gray-600/70 dark:hover:to-gray-500/50 transition-all duration-300">
                          <div className="flex items-center gap-2 mb-3">
                            <FiFileText className="h-4 w-4 text-[#00437f]" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Long Description</span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white bg-white/60 dark:bg-gray-700/60 px-3 py-2 rounded-lg min-h-[60px]">
                            {category.LONG_DESCRIPTION || 'No long description available'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timestamps Card */}
                  <div className="group relative lg:col-span-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-white/30 to-orange-50/30 dark:from-amber-900/20 dark:via-gray-800/30 dark:to-orange-900/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/40 dark:border-gray-700/40 rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:scale-[1.02] hover:border-[#00437f]/20 dark:hover:border-[#00437f]/30 transition-all duration-500">
                      
                      {/* Card Header */}
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                          <FiClock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Timestamps</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Creation and update information</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="p-4 bg-gradient-to-r from-gray-50/80 to-amber-50/40 dark:from-gray-700/50 dark:to-gray-600/30 rounded-2xl hover:from-gray-100/90 hover:to-amber-100/60 dark:hover:from-gray-600/70 dark:hover:to-gray-500/50 transition-all duration-300">
                          <div className="flex items-center gap-2 mb-2">
                            <FiClock className="h-4 w-4 text-[#00437f]" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Created At</span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white bg-white/60 dark:bg-gray-700/60 px-3 py-2 rounded-lg">
                            {formatDate(category.CREATED_AT)}
                          </p>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-gray-50/80 to-amber-50/40 dark:from-gray-700/50 dark:to-gray-600/30 rounded-2xl hover:from-gray-100/90 hover:to-amber-100/60 dark:hover:from-gray-600/70 dark:hover:to-gray-500/50 transition-all duration-300">
                          <div className="flex items-center gap-2 mb-2">
                            <FiClock className="h-4 w-4 text-[#00437f]" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Updated At</span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white bg-white/60 dark:bg-gray-700/60 px-3 py-2 rounded-lg">
                            {formatDate(category.UPDATED_AT)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl border border-red-200/50 dark:border-red-700/50">
                    <p className="text-red-600 dark:text-red-400 font-medium">
                      Failed to load category details. Please try again.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 