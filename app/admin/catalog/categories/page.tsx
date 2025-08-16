'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FiArrowLeft, FiPlus, FiSearch, FiChevronRight, FiChevronDown, FiEye, FiEdit2, FiTrash2, FiFilter, FiX, FiFolder, FiAlertTriangle } from 'react-icons/fi'
import { useToast } from '@/components/ui/use-toast'
import CategoryDetailsModal from './components/CategoryDetailsModal'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PremiumPagination } from '@/components/ui/premium-pagination'

interface TaxonomyItem {
  WEB_TAXONOMY_ID: number
  DEPT: string
  TYP: string
  SUBTYP_1: string
  SUBTYP_2: string
  SUBTYP_3: string
  WEB_URL: string
  ACTIVE: number
}

interface CategoryNode {
  id: number
  name: string
  url: string
  active: number
  children: CategoryNode[]
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<TaxonomyItem[]>([])
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [showEditConfirm, setShowEditConfirm] = useState(false)
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null)
  const [editCategoryName, setEditCategoryName] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null)
  const [deleteCategoryName, setDeleteCategoryName] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/admin/catalog/categories')
        if (!response.ok) throw new Error('Failed to fetch categories')
        const data = await response.json()
        setCategories(data)
        setError(null)
      } catch (error) {
        setError('Failed to fetch categories. Please try again later.')
        toast({
          title: 'Error',
          description: 'Failed to fetch categories data',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategories()
  }, [toast])

  const handleDeleteClick = (node: CategoryNode) => {
    setDeleteCategoryId(node.id)
    setDeleteCategoryName(node.name)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteCategoryId) return
    
    setIsDeleting(true)
    setDeletingCategoryId(deleteCategoryId)

    try {
      const response = await fetch(`/api/admin/catalog/categories/${deleteCategoryId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete category')

      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      })

      // Refresh the categories list
      const updatedResponse = await fetch('/api/admin/catalog/categories')
      const updatedData = await updatedResponse.json()
      setCategories(updatedData)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setDeletingCategoryId(null)
      setShowDeleteConfirm(false)
      setDeleteCategoryId(null)
      setDeleteCategoryName('')
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
    setDeleteCategoryId(null)
    setDeleteCategoryName('')
  }

  const handleEditClick = (node: CategoryNode) => {
    setEditCategoryId(node.id)
    setEditCategoryName(node.name)
    setShowEditConfirm(true)
  }

  const handleEditConfirm = () => {
    if (editCategoryId) {
      router.push(`/admin/catalog/categories/${editCategoryId}/edit`)
    }
    setShowEditConfirm(false)
    setEditCategoryId(null)
    setEditCategoryName('')
  }

  const handleEditCancel = () => {
    setShowEditConfirm(false)
    setEditCategoryId(null)
    setEditCategoryName('')
  }

  const buildCategoryTree = (items: TaxonomyItem[]): CategoryNode[] => {
    const nodeMap = new Map<number, CategoryNode>()
    const rootNodes: CategoryNode[] = []

    // First pass: Create all nodes
    items.forEach(item => {
      const node: CategoryNode = {
        id: item.WEB_TAXONOMY_ID,
        name: '',  // We'll set the name based on the level
        url: item.WEB_URL,
        active: item.ACTIVE,
        children: []
      }
      nodeMap.set(item.WEB_TAXONOMY_ID, node)
    })

    // Second pass: Build hierarchy and set names
    items.forEach(item => {
      const node = nodeMap.get(item.WEB_TAXONOMY_ID)!
      
      // Check from deepest level first
      if (item.SUBTYP_3 !== 'EMPTY' && item.SUBTYP_3 !== '') {
        node.name = item.SUBTYP_3
        // Find parent SUBTYP_2
        const parentItem = items.find(p => 
          p.DEPT === item.DEPT && 
          p.TYP === item.TYP && 
          p.SUBTYP_1 === item.SUBTYP_1 && 
          p.SUBTYP_2 === item.SUBTYP_2 && 
          p.SUBTYP_3 === 'EMPTY'
        )
        if (parentItem) {
          const parentNode = nodeMap.get(parentItem.WEB_TAXONOMY_ID)!
          parentNode.children.push(node)
        }
      } else if (item.SUBTYP_2 !== 'EMPTY' && item.SUBTYP_2 !== '') {
        node.name = item.SUBTYP_2
        // Find parent SUBTYP_1
        const parentItem = items.find(p => 
          p.DEPT === item.DEPT && 
          p.TYP === item.TYP && 
          p.SUBTYP_1 === item.SUBTYP_1 && 
          p.SUBTYP_2 === 'EMPTY' && 
          p.SUBTYP_3 === 'EMPTY'
        )
        if (parentItem) {
          const parentNode = nodeMap.get(parentItem.WEB_TAXONOMY_ID)!
          parentNode.children.push(node)
        }
      } else if (item.SUBTYP_1 !== 'EMPTY' && item.SUBTYP_1 !== '') {
        node.name = item.SUBTYP_1
        // Find parent TYP
        const parentItem = items.find(p => 
          p.DEPT === item.DEPT && 
          p.TYP === item.TYP && 
          p.SUBTYP_1 === 'EMPTY' && 
          p.SUBTYP_2 === 'EMPTY' && 
          p.SUBTYP_3 === 'EMPTY'
        )
        if (parentItem) {
          const parentNode = nodeMap.get(parentItem.WEB_TAXONOMY_ID)!
          parentNode.children.push(node)
        }
      } else if (item.TYP !== 'EMPTY' && item.TYP !== '') {
        node.name = item.TYP
        // Find parent DEPT
        const parentItem = items.find(p => 
          p.DEPT === item.DEPT && 
          p.TYP === 'EMPTY' && 
          p.SUBTYP_1 === 'EMPTY' && 
          p.SUBTYP_2 === 'EMPTY' && 
          p.SUBTYP_3 === 'EMPTY'
        )
        if (parentItem) {
          const parentNode = nodeMap.get(parentItem.WEB_TAXONOMY_ID)!
          parentNode.children.push(node)
        }
      } else {
        // This is a department node
        node.name = item.DEPT
        rootNodes.push(node)
      }
    })

    // Sort the tree
    const sortTree = (nodes: CategoryNode[]) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name))
      nodes.forEach(node => sortTree(node.children))
    }
    sortTree(rootNodes)

    return rootNodes
  }

  // Flatten tree for search and pagination
  const flattenTree = (nodes: CategoryNode[], level: number = 0): (CategoryNode & { level: number })[] => {
    let result: (CategoryNode & { level: number })[] = []
    nodes.forEach(node => {
      result.push({ ...node, level })
      if (expandedNodes.has(node.id)) {
        result = result.concat(flattenTree(node.children, level + 1))
      }
    })
    return result
  }

  const categoryTree = buildCategoryTree(categories)
  const flattenedCategories = flattenTree(categoryTree)

  // Apply filters
  const filteredCategories = flattenedCategories.filter(category => {
    const trimmedSearchQuery = searchQuery.trim().toLowerCase()
    const matchesSearch = category.name.toLowerCase().includes(trimmedSearchQuery) ||
                         category.url.toLowerCase().includes(trimmedSearchQuery)
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && category.active === 1) ||
                         (statusFilter === 'inactive' && category.active === 0)
    
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = filteredCategories.slice(startIndex, startIndex + itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const toggleNode = (nodeId: number) => {
    setExpandedNodes(prev => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setCurrentPage(1)
  }

  const hasActiveFilters = searchQuery || statusFilter !== 'all'

  const renderCategoryNode = (node: CategoryNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children.length > 0

    // Calculate progressive indentation based on level
    const getIndentation = (level: number) => {
      switch(level) {
        case 0: return ''; // Department level - no indentation
        case 1: return 'ml-8'; // Type level
        case 2: return 'ml-16'; // SUBTYP_1 level
        case 3: return 'ml-24'; // SUBTYP_2 level
        case 4: return 'ml-32'; // SUBTYP_3 level
        default: return 'ml-32'; // Any deeper levels
      }
    }

    return (
      <div key={node.id} className={`space-y-2 ${level > 0 ? 'mt-2' : ''}`}>
        <div 
          className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
            level === 0 
              ? 'bg-white border border-gray-200 shadow-sm hover:shadow-md' 
              : level === 1 
              ? 'bg-gray-50/80 hover:bg-gray-100/80 border-l-4 border-l-blue-500' 
              : 'bg-white/80 hover:bg-gray-50/80 border-l-4 border-l-indigo-400'
          } ${getIndentation(level)}`}
        >
          {hasChildren && (
            <button
              onClick={() => toggleNode(node.id)}
              className={`p-1.5 rounded-full transition-colors duration-200 ${
                level === 0 
                  ? 'hover:bg-gray-100' 
                  : level === 1 
                  ? 'hover:bg-blue-50' 
                  : 'hover:bg-indigo-50'
              }`}
            >
              {isExpanded ? (
                <FiChevronDown className={`h-4 w-4 ${
                  level === 0 
                    ? 'text-gray-600' 
                    : level === 1 
                    ? 'text-blue-600' 
                    : 'text-indigo-600'
                }`} />
              ) : (
                <FiChevronRight className={`h-4 w-4 ${
                  level === 0 
                    ? 'text-gray-600' 
                    : level === 1 
                    ? 'text-blue-600' 
                    : 'text-indigo-600'
                }`} />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}
          <div className="flex-1 flex items-center gap-3">
            <span className={`font-medium ${
              level === 0 
                ? 'text-gray-900' 
                : level === 1 
                ? 'text-blue-900' 
                : 'text-indigo-900'
            }`}>
              {node.name}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                node.active === 1
                  ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                  : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'
              }`}
            >
              {node.active === 1 ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedCategoryId(node.id)}
              className={`h-8 w-8 ${
                level === 0 
                  ? 'hover:bg-gray-100' 
                  : level === 1 
                  ? 'hover:bg-blue-50' 
                  : 'hover:bg-indigo-50'
              }`}
            >
              <FiEye className={`h-4 w-4 ${
                level === 0 
                  ? 'text-gray-600' 
                  : level === 1 
                  ? 'text-blue-600' 
                  : 'text-indigo-600'
              }`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditClick(node)}
              className={`h-8 w-8 ${
                level === 0 
                  ? 'hover:bg-gray-100' 
                  : level === 1 
                  ? 'hover:bg-blue-50' 
                  : 'hover:bg-indigo-50'
              }`}
            >
              <FiEdit2 className={`h-4 w-4 ${
                level === 0 
                  ? 'text-gray-600' 
                  : level === 1 
                  ? 'text-blue-600' 
                  : 'text-indigo-600'
              }`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteClick(node)}
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              disabled={isDeleting && deletingCategoryId === node.id}
            >
              {isDeleting && deletingCategoryId === node.id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              ) : (
                <FiTrash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        {isExpanded && (
          <div className="relative">
            {level === 0 && (
              <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200" />
            )}
            <div className="space-y-2">
              {node.children.map(child => renderCategoryNode(child, level + 1))}
            </div>
          </div>
        )}
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
                  <FiFolder className='w-5 h-5 text-white' />
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900 dark:text-white tracking-tight'>
                    Categories
                  </h1>
                  <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>
                    {filteredCategories.length} of {flattenedCategories.length} categories
                  </p>
                </div>
              </div>
            </div>
            <Button 
              size="sm"
              className="bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              onClick={() => window.location.href = '/admin/catalog/categories/add'}
            >
              <FiPlus className="mr-2 h-4 w-4" />
              Add Category
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
                    placeholder="Search by name, URL..."
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

        {/* Main Content */}
        <div className='relative group'>
          <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
          <Card className='relative p-6 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl transition-all duration-300'>
            <div className='space-y-3'>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00437f]"></div>
                    <p className="text-sm text-gray-500">Loading categories...</p>
                  </div>
                </div>
              ) : error ? (
                <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg'>
                  {error}
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center text-gray-500 py-8 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  {searchQuery || statusFilter !== 'all' ? 'No categories match your filters' : 'No categories found'}
                </div>
              ) : (
                <div className="space-y-2">
                  {currentItems.map((category) => (
                    <div key={category.id} className={`space-y-2 ${category.level > 0 ? 'mt-2' : ''}`}>
                      <div 
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                          category.level === 0 
                            ? 'bg-white border border-gray-200 shadow-sm hover:shadow-md' 
                            : category.level === 1 
                            ? 'bg-gray-50/80 hover:bg-gray-100/80 border-l-4 border-l-blue-500' 
                            : 'bg-white/80 hover:bg-gray-50/80 border-l-4 border-l-indigo-400'
                        } ${category.level === 0 ? '' : `ml-${category.level * 8}`}`}
                      >
                        <div className="w-6" />
                        <div className="flex-1 flex items-center gap-3">
                          <span className={`font-medium ${
                            category.level === 0 
                              ? 'text-gray-900' 
                              : category.level === 1 
                              ? 'text-blue-900' 
                              : 'text-indigo-900'
                          }`}>
                            {category.name}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              category.active === 1
                                ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                                : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'
                            }`}
                          >
                            {category.active === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedCategoryId(category.id)}
                            className={`h-8 w-8 ${
                              category.level === 0 
                                ? 'hover:bg-gray-100' 
                                : category.level === 1 
                                ? 'hover:bg-blue-50' 
                                : 'hover:bg-indigo-50'
                            }`}
                          >
                            <FiEye className={`h-4 w-4 ${
                              category.level === 0 
                                ? 'text-gray-600' 
                                : category.level === 1 
                                ? 'text-blue-600' 
                                : 'text-indigo-600'
                            }`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(category)}
                            className={`h-8 w-8 ${
                              category.level === 0 
                                ? 'hover:bg-gray-100' 
                                : category.level === 1 
                                ? 'hover:bg-blue-50' 
                                : 'hover:bg-indigo-50'
                            }`}
                          >
                            <FiEdit2 className={`h-4 w-4 ${
                              category.level === 0 
                                ? 'text-gray-600' 
                                : category.level === 1 
                                ? 'text-blue-600' 
                                : 'text-indigo-600'
                            }`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(category)}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={isDeleting && deletingCategoryId === category.id}
                          >
                            {isDeleting && deletingCategoryId === category.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <FiTrash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Pagination */}
        {filteredCategories.length > 0 && (
          <PremiumPagination 
            totalPages={totalPages}
            currentPage={currentPage}
            totalItems={filteredCategories.length}
            itemsPerPage={itemsPerPage}
            onPageChange={paginate}
          />
        )}

        {/* Category Details Modal */}
        <CategoryDetailsModal
          isOpen={selectedCategoryId !== null}
          onClose={() => setSelectedCategoryId(null)}
          categoryId={selectedCategoryId}
        />

                 {/* Edit Confirmation Modal */}
         {showEditConfirm && (
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
             <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-2xl max-w-md w-full transform transition-all">
               <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl"></div>
               <div className="relative">
                 <div className="flex items-center justify-center mb-6">
                   <div className="p-3 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl">
                     <FiAlertTriangle className="h-8 w-8 text-white" />
                   </div>
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                   Confirm Edit
                 </h3>
                 <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 text-center leading-relaxed">
                   You are about to edit the category <span className="font-semibold text-gray-900 dark:text-white">"{editCategoryName}"</span>. 
                   <br />
                   Are you sure you want to proceed?
                 </p>
                 <div className="flex gap-3">
                   <Button 
                     variant="outline" 
                     onClick={handleEditCancel} 
                     className="flex-1 h-11 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-[#00437f]/10 hover:text-[#00437f] hover:border-[#00437f]/40 rounded-xl"
                   >
                     Cancel
                   </Button>
                   <Button 
                     onClick={handleEditConfirm} 
                     className="flex-1 h-11 bg-gradient-to-r from-[#00437f] to-[#003366] text-white shadow-lg hover:shadow-xl rounded-xl"
                   >
                     Confirm Edit
                   </Button>
                 </div>
               </div>
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
                   You are about to delete the category <span className="font-semibold text-red-600 dark:text-red-400">"{deleteCategoryName}"</span>. 
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
                       'Delete Category'
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