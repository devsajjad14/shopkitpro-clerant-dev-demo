'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiLoader,
  FiArrowLeft,
  FiChevronsLeft,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsRight,
  FiFilter,
  FiX,
  FiAward,
  FiEye,
  FiAlertTriangle,
} from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { getBrands, deleteBrand } from '@/lib/actions/brands'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PremiumPagination } from '@/components/ui/premium-pagination'

interface Brand {
  id: number
  name: string
  alias: string
  description: string | null
  urlHandle: string
  logo: string | null
  showOnCategory: boolean
  showOnProduct: boolean
  status: string
  createdAt: string
  updatedAt: string
}

export default function BrandsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [brandToView, setBrandToView] = useState<Brand | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10) // Show 10 brands per page
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      const response = await getBrands()
      if (response.success && response.data) {
        const brandsWithDates = response.data.map((brand) => ({
          ...brand,
          createdAt: brand.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: brand.updatedAt?.toISOString() || new Date().toISOString(),
        }))
        // Sort by creation date (newest first)
        const sortedBrands = brandsWithDates.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setBrands(sortedBrands)
      } else {
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

  const handleDeleteClick = (brand: Brand) => {
    setBrandToDelete(brand)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!brandToDelete) return

    setIsDeleting(true)

    try {
      const response = await deleteBrand(brandToDelete.id)
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Brand deleted successfully',
        })
        setBrands((prev) =>
          prev.filter((brand) => brand.id !== brandToDelete.id)
        )
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to delete brand',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error deleting brand:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete brand',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
      setBrandToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
    setBrandToDelete(null)
  }

  const filteredBrands = brands.filter(
    (brand) => {
      const trimmedSearchQuery = searchQuery.trim().toLowerCase()
      const matchesSearch = brand.name.toLowerCase().includes(trimmedSearchQuery) ||
                           brand.alias.toLowerCase().includes(trimmedSearchQuery)
      
      const matchesStatus = statusFilter === 'all' || brand.status === statusFilter
      
      return matchesSearch && matchesStatus
    }
  )
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredBrands.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setCurrentPage(1)
  }

  const hasActiveFilters = searchQuery || statusFilter !== 'all'

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
        <div className='max-w-7xl mx-auto p-6'>
          <div className='flex items-center justify-center min-h-[400px]'>
            <div className='flex flex-col items-center gap-4'>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00437f]"></div>
              <p className='text-sm text-gray-500'>Loading brands...</p>
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
                  <FiAward className='w-5 h-5 text-white' />
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900 dark:text-white tracking-tight'>
                    Brands
                  </h1>
                  <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>
                    {filteredBrands.length} of {brands.length} brands
                  </p>
                </div>
              </div>
            </div>
            <Button 
              size="sm"
              className="bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              onClick={() => router.push('/admin/catalog/brands/add')}
            >
              <FiPlus className="mr-2 h-4 w-4" />
              Add Brand
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
                    placeholder="Search brands by name or alias..."
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
                      {[searchQuery, statusFilter].filter(f => f !== 'all' && f !== '').length}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Filters Section */}
              {showFilters && (
                <div className='mt-4 pt-4 border-t border-[#00437f]/20 dark:border-[#00437f]/30'>
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>Status:</span>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className='w-32 h-8 text-sm border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className='h-8 px-3 text-sm text-[#00437f] hover:text-[#003366] hover:bg-[#00437f]/10'
                      >
                        <FiX className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Main Content - Brand Cards */}
        <div className='relative group'>
          <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
          <div className='relative p-6 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl transition-all duration-300'>
            {filteredBrands.length === 0 ? (
              <div className="text-center text-gray-500 py-12 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                {searchQuery || statusFilter !== 'all' ? 'No brands match your filters' : 'No brands found'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                 {currentItems.map((brand) => (
                   <div key={brand.id} className="relative group">
                     <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                     <Card className="relative rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] flex flex-col bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50">
                       <div className="p-4 flex-grow">
                         {/* Logo Row */}
                         <div className="flex justify-center mb-3">
                           <div className="relative">
                             {brand.logo ? (
                               <img 
                                 src={brand.logo} 
                                 alt={brand.name} 
                                 className="w-20 h-20 object-contain rounded-lg bg-gradient-to-br from-[#00437f]/5 to-[#00437f]/10 p-2 border-2 border-[#00437f]/20 shadow-md" 
                               />
                             ) : (
                               <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#00437f]/5 to-[#00437f]/10 border-2 border-[#00437f]/20 flex items-center justify-center text-[#00437f] text-xs font-medium shadow-md">
                                 No logo
                               </div>
                             )}
                             {/* Status Badge on Hover */}
                             <div className="absolute -bottom-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                               <Badge 
                                 variant={brand.status === 'active' ? 'default' : 'secondary'}
                                 className={`text-xs px-2 py-1 ${
                                   brand.status === 'active' 
                                     ? 'bg-green-500 text-white ring-1 ring-green-600/20' 
                                     : 'bg-gray-500 text-white ring-1 ring-gray-600/20'
                                 }`}
                               >
                                 {brand.status}
                               </Badge>
                             </div>
                           </div>
                         </div>
                         
                                                   {/* Name Row */}
                          <div className="text-center mb-3">
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{brand.name}</h3>
                            {brand.alias && brand.alias !== brand.name && (
                              <p className="text-sm text-gray-600 dark:text-gray-300">{brand.alias}</p>
                            )}
                          </div>
                         
                         {/* Visibility Badges */}
                         <div className="flex items-center justify-center gap-2 text-sm">
                           {brand.showOnCategory && (
                             <Badge variant='outline' className="border-[#00437f]/30 text-[#00437f] bg-[#00437f]/5 text-xs">
                               Category
                             </Badge>
                           )}
                           {brand.showOnProduct && (
                             <Badge variant='outline' className="border-[#00437f]/30 text-[#00437f] bg-[#00437f]/5 text-xs">
                               Product
                             </Badge>
                           )}
                         </div>
                       </div>
                                             <div className="p-3 border-t border-[#00437f]/10 bg-gradient-to-r from-[#00437f]/5 to-transparent rounded-b-xl">
                         <div className="flex items-center justify-end gap-1">
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             onClick={() => {
                               setBrandToView(brand)
                               setViewDialogOpen(true)
                             }}
                             className="h-8 w-8 text-[#00437f] hover:text-[#003366] hover:bg-[#00437f]/10 transition-all duration-200"
                           >
                             <FiEye className="w-4 h-4" />
                           </Button>
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             onClick={() => router.push(`/admin/catalog/brands/edit/${brand.id}`)} 
                             className="h-8 w-8 text-[#00437f] hover:text-[#003366] hover:bg-[#00437f]/10 transition-all duration-200"
                           >
                             <FiEdit2 className="w-4 h-4" />
                           </Button>
                           <Button
                             variant="ghost"
                             size="icon"
                             onClick={() => handleDeleteClick(brand)}
                             className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                           >
                             <FiTrash2 className="w-4 h-4" />
                           </Button>
                         </div>
                       </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Premium Pagination */}
        {filteredBrands.length > 10 && (
          <div className='relative group'>
            <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
            <div className='relative p-6 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl transition-all duration-300'>
              <PremiumPagination 
                totalPages={totalPages}
                currentPage={currentPage}
                totalItems={filteredBrands.length}
                itemsPerPage={itemsPerPage}
                onPageChange={paginate}
              />
            </div>
          </div>
        )}
        
                 

         {/* Delete Confirmation Modal */}
         {showDeleteConfirm && (
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
             <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-2xl max-w-md w-full transform transition-all">
               <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-red-500/10 rounded-2xl blur-xl"></div>
               <div className="relative">
                 <div className="flex items-center justify-center mb-6">
                   <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                     <FiAlertTriangle className="h-8 w-8 text-white" />
                   </div>
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                   Confirm Delete
                 </h3>
                 <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 text-center leading-relaxed">
                   You are about to delete the brand <span className="font-semibold text-red-600 dark:text-red-400">"{brandToDelete?.name}"</span>. 
                   <br />
                   <span className="text-red-600 dark:text-red-400 font-medium">This action cannot be undone!</span>
                 </p>
                 <div className="flex gap-3">
                   <Button 
                     variant="outline" 
                     onClick={handleDeleteCancel} 
                     className="flex-1 h-11 border-2 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl"
                   >
                     Cancel
                   </Button>
                   <Button 
                     onClick={handleDeleteConfirm}
                     disabled={isDeleting}
                     className="flex-1 h-11 bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl rounded-xl disabled:opacity-50"
                   >
                     {isDeleting ? (
                       <>
                         <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                         Deleting...
                       </>
                     ) : (
                       'Delete Brand'
                     )}
                   </Button>
                 </div>
               </div>
             </div>
           </div>
         )}

         {/* Premium Brand Details Modal */}
         <AlertDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
           <AlertDialogContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 max-w-2xl">
             <AlertDialogHeader>
               <AlertDialogTitle className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-lg flex items-center justify-center">
                   <FiAward className="w-4 h-4 text-white" />
                 </div>
                 Brand Details
               </AlertDialogTitle>
             </AlertDialogHeader>
             {brandToView && (
               <div className="space-y-6">
                 {/* Brand Header */}
                 <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-[#00437f]/5 to-transparent rounded-xl border border-[#00437f]/10">
                   <div className="relative">
                     {brandToView.logo ? (
                       <img 
                         src={brandToView.logo} 
                         alt={brandToView.name} 
                         className="w-24 h-24 object-contain rounded-xl bg-gradient-to-br from-[#00437f]/5 to-[#00437f]/10 p-3 border-2 border-[#00437f]/20 shadow-lg" 
                       />
                     ) : (
                       <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-[#00437f]/5 to-[#00437f]/10 border-2 border-[#00437f]/20 flex items-center justify-center text-[#00437f] text-sm font-medium shadow-lg">
                         No logo
                       </div>
                     )}
                     <div className="absolute -bottom-1 -right-1">
                       <Badge 
                         variant={brandToView.status === 'active' ? 'default' : 'secondary'}
                         className={`text-xs px-2 py-1 ${
                           brandToView.status === 'active' 
                             ? 'bg-green-500 text-white ring-1 ring-green-600/20' 
                             : 'bg-gray-500 text-white ring-1 ring-gray-600/20'
                         }`}
                       >
                         {brandToView.status}
                       </Badge>
                     </div>
                   </div>
                   <div className="flex-1">
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{brandToView.name}</h2>
                     {brandToView.alias && brandToView.alias !== brandToView.name && (
                       <p className="text-gray-600 dark:text-gray-300 mb-3">{brandToView.alias}</p>
                     )}
                     <div className="flex items-center gap-2">
                       {brandToView.showOnCategory && (
                         <Badge variant='outline' className="border-[#00437f]/30 text-[#00437f] bg-[#00437f]/5">
                           Category
                         </Badge>
                       )}
                       {brandToView.showOnProduct && (
                         <Badge variant='outline' className="border-[#00437f]/30 text-[#00437f] bg-[#00437f]/5">
                           Product
                         </Badge>
                       )}
                     </div>
                   </div>
                 </div>

                 {/* Brand Information */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-3">
                     <div className="p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600/30">
                       <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">URL Handle</h4>
                       <p className="text-gray-900 dark:text-white font-mono text-sm">{brandToView.urlHandle}</p>
                     </div>
                     <div className="p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600/30">
                       <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Created</h4>
                       <p className="text-gray-900 dark:text-white text-sm">
                         {new Date(brandToView.createdAt).toLocaleDateString()}
                       </p>
                     </div>
                   </div>
                   <div className="space-y-3">
                     <div className="p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600/30">
                       <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Last Updated</h4>
                       <p className="text-gray-900 dark:text-white text-sm">
                         {new Date(brandToView.updatedAt).toLocaleDateString()}
                       </p>
                     </div>
                     <div className="p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600/30">
                       <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Brand ID</h4>
                       <p className="text-gray-900 dark:text-white font-mono text-sm">#{brandToView.id}</p>
                     </div>
                   </div>
                 </div>

                 {/* Description */}
                 {brandToView.description && (
                   <div className="p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600/30">
                     <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h4>
                     <p className="text-gray-900 dark:text-white text-sm leading-relaxed">{brandToView.description}</p>
                   </div>
                 )}
               </div>
             )}
             <AlertDialogFooter>
               <AlertDialogCancel className="border-[#00437f]/20 text-[#00437f] hover:bg-[#00437f]/10">
                 Close
               </AlertDialogCancel>
               <Button
                 onClick={() => {
                   setViewDialogOpen(false)
                   router.push(`/admin/catalog/brands/edit/${brandToView?.id}`)
                 }}
                 className="bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white"
               >
                 <FiEdit2 className="w-4 h-4 mr-2" />
                 Edit Brand
               </Button>
             </AlertDialogFooter>
           </AlertDialogContent>
         </AlertDialog>
      </div>
    </div>
  )
} 