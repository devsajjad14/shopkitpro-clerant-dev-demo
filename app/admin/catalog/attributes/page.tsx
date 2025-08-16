'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiFilter,
  FiChevronDown,
  FiTag,
  FiLoader,
  FiChevronsLeft,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsRight,
  FiArrowLeft,
  FiX,
  FiAlertTriangle,
} from 'react-icons/fi'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getAttributes, deleteAttribute } from '@/lib/actions/attributes'
import { PremiumPagination } from '@/components/ui/premium-pagination'

interface Attribute {
  id: string
  name: string
  display: string
  status: string
  createdAt: Date | null
  updatedAt: Date | null
  values: { 
    id: string
    value: string
    updatedAt: Date | null
    createdAt: Date | null
    attributeId: string
  }[]
}

export default function AttributesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10) // Show 10 attributes per page
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [attributeToDelete, setAttributeToDelete] = useState<Attribute | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadAttributes()
  }, [])

  const loadAttributes = async () => {
    setIsLoading(true)
    try {
      const data = await getAttributes()
      setAttributes(data)
    } catch (error) {
      console.error('Error loading attributes:', error)
      toast({
        title: 'Error',
        description: 'Failed to load attributes',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (attribute: Attribute) => {
    setAttributeToDelete(attribute)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!attributeToDelete) return

    setIsDeleting(true)

    try {
      const response = await deleteAttribute(attributeToDelete.id)
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Attribute deleted successfully',
        })
        setAttributes((prev) =>
          prev.filter((attr) => attr.id !== attributeToDelete.id)
        )
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to delete attribute',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error deleting attribute:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete attribute',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
      setAttributeToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
    setAttributeToDelete(null)
  }

  const filteredAttributes = attributes.filter(attr => {
    const trimmedSearchQuery = searchQuery.trim().toLowerCase()
    const matchesSearch = attr.name.toLowerCase().includes(trimmedSearchQuery) ||
                         attr.display.toLowerCase().includes(trimmedSearchQuery)
    
    const matchesStatus = statusFilter === 'all' || attr.status === statusFilter
    
    return matchesSearch && matchesStatus
  })
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredAttributes.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredAttributes.length / itemsPerPage)

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
              <p className='text-sm text-gray-500'>Loading attributes...</p>
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
                  <FiTag className='w-5 h-5 text-white' />
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900 dark:text-white tracking-tight'>
                    Attributes
                  </h1>
                  <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>
                    {filteredAttributes.length} of {attributes.length} attributes
                  </p>
                </div>
              </div>
            </div>
            <Button 
              size="sm"
              className="bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              onClick={() => router.push('/admin/catalog/attributes/add')}
            >
              <FiPlus className="mr-2 h-4 w-4" />
              Add Attribute
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
                    placeholder="Search attributes by name or display..."
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
                           <SelectItem value="draft">Draft</SelectItem>
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

        {/* Main Content - Attributes Table */}
        <div className='relative group'>
          <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
          <div className='relative p-6 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl transition-all duration-300'>
            {filteredAttributes.length === 0 ? (
              <div className="text-center text-gray-500 py-12 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                {searchQuery ? 'No attributes match your search' : 'No attributes found'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#00437f]/10">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Attribute
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Display Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Values
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#00437f]/10">
                    {currentItems.map((attribute) => (
                      <tr key={attribute.id} className="hover:bg-[#00437f]/5 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#00437f]/10 to-[#00437f]/20 rounded-lg flex items-center justify-center mr-3">
                              <FiTag className="h-4 w-4 text-[#00437f]" />
                            </div>
                            <div className="font-semibold text-gray-900 dark:text-white">{attribute.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {attribute.display}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {attribute.values.slice(0, 3).map((value, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="border-[#00437f]/30 text-[#00437f] bg-[#00437f]/5 text-xs"
                              >
                                {value.value}
                              </Badge>
                            ))}
                            {attribute.values.length > 3 && (
                              <Badge
                                variant="outline"
                                className="border-[#00437f]/30 text-[#00437f] bg-[#00437f]/5 text-xs"
                              >
                                +{attribute.values.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge 
                            variant={attribute.status === 'active' ? 'default' : 'secondary'}
                            className={`text-xs px-2 py-1 ${
                              attribute.status === 'active' 
                                ? 'bg-green-500 text-white ring-1 ring-green-600/20' 
                                : attribute.status === 'draft'
                                ? 'bg-yellow-500 text-white ring-1 ring-yellow-600/20'
                                : 'bg-gray-500 text-white ring-1 ring-gray-600/20'
                            }`}
                          >
                            {attribute.status.charAt(0).toUpperCase() + attribute.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/admin/catalog/attributes/${attribute.id}`)}
                              className="h-8 w-8 text-[#00437f] hover:text-[#003366] hover:bg-[#00437f]/10 transition-all duration-200"
                            >
                              <FiEye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/admin/catalog/attributes/${attribute.id}/edit`)}
                              className="h-8 w-8 text-[#00437f] hover:text-[#003366] hover:bg-[#00437f]/10 transition-all duration-200"
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(attribute)}
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Premium Pagination */}
        {filteredAttributes.length > 10 && (
          <div className='relative group'>
            <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
            <div className='relative p-6 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl transition-all duration-300'>
              <PremiumPagination 
                totalPages={totalPages}
                currentPage={currentPage}
                totalItems={filteredAttributes.length}
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
                  You are about to delete the attribute <span className="font-semibold text-red-600 dark:text-red-400">"{attributeToDelete?.name}"</span>. 
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
                      'Delete Attribute'
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