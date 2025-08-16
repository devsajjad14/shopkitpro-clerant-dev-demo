// products-filter.tsx
'use client'

import { useCallback, useState, useEffect, useRef, useMemo } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { List, Grid, Loader2 } from 'lucide-react'
import { Input } from '../ui/input'
import ProductsPagination from '@/components/category/products-pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type SortOption = (typeof SORT_OPTIONS)[number]['value']
type ViewMode = 'list' | 'grid'
type PerPageOption = (typeof PER_PAGE_OPTIONS)[number]

const SORT_OPTIONS = [
  { value: 'nameAZ', label: 'Name (A-Z)' },
  { value: 'nameZA', label: 'Name (Z-A)' },
  { value: 'priceLowToHigh', label: 'Price (Low to High)' },
  { value: 'priceHighToLow', label: 'Price (High to Low)' },
  { value: 'brand', label: 'Brands' },
] as const

const PER_PAGE_OPTIONS = [8, 12, 16, 'All'] as const

function normalizePerPage(perPage: string | number | undefined): string {
  if (!perPage) return '8'
  if (perPage === '1000' || perPage === 1000 || perPage === 'All') return '1000'
  const allowed = ['8', '12', '16']
  if (allowed.includes(perPage.toString())) return perPage.toString()
  // If not allowed, return as string (will be added as option)
  return perPage.toString()
}

interface ProductsFilterProps {
  totalPages: number
  currentPage: number
  onViewChange?: (view: ViewMode) => void
  onLoadingChange?: (isLoading: boolean) => void
  defaultPerPage?: number | string
}

export default function ProductsFilter({
  totalPages,
  currentPage,
  onViewChange,
  onLoadingChange,
  defaultPerPage,
}: ProductsFilterProps) {
  const [view, setView] = useState<ViewMode>('grid')
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [localSearch, setLocalSearch] = useState('')
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

  // Memoize search params values to prevent unnecessary re-renders
  const searchValue = useMemo(() => searchParams.get('search') || '', [searchParams])
  const urlView = useMemo(() => searchParams.get('view') as ViewMode | null, [searchParams])
  const sortBy = useMemo(() => searchParams.get('sortBy') || 'nameAZ', [searchParams])

  // Initialize local search value and view mode from URL
  useEffect(() => {
    setLocalSearch(searchValue)
    if (urlView && (urlView === 'grid' || urlView === 'list')) {
      setView(urlView)
    }
  }, [searchValue, urlView])

  const createQueryString = useCallback(
    (name: string, value: string, resetPage = false) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)
      if (resetPage) params.set('page', '1')
      return params.toString()
    },
    [searchParams]
  )

  // Handle loading state changes
  useEffect(() => {
    onLoadingChange?.(isActionLoading)
  }, [isActionLoading, onLoadingChange])

  // Debounced search handler
  const handleSearch = useCallback(
    (value: string) => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }

      debounceTimeout.current = setTimeout(() => {
        router.push(`${pathname}?${createQueryString('search', value, true)}`)
      }, 300)
    },
    [pathname, createQueryString, router]
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalSearch(value)
    handleSearch(value)
  }

  const handleActionWithLoader = useCallback(async (action: () => void) => {
    setIsActionLoading(true)
    try {
      action()
      // Minimum loader display time for better UX
      await new Promise((resolve) => setTimeout(resolve, 300))
    } finally {
      setIsActionLoading(false)
    }
  }, [])

  const handlePerPageChange = useCallback((value: string) => {
    handleActionWithLoader(() => {
      // Handle "All" option by setting perPage to 1000
      const perPage = value === 'All' ? '1000' : value
      router.push(`${pathname}?${createQueryString('perPage', perPage, true)}`)
    })
  }, [handleActionWithLoader, router, pathname, createQueryString])

  const handleSortByChange = useCallback((value: string) => {
    handleActionWithLoader(() => {
      const sortBy = SORT_OPTIONS.some((opt) => opt.value === value)
        ? (value as SortOption)
        : 'nameAZ'
      router.push(`${pathname}?${createQueryString('sortBy', sortBy, false)}`)
    })
  }, [handleActionWithLoader, router, pathname, createQueryString])

  const handleViewChange = useCallback((newView: ViewMode) => {
    setView(newView)
    onViewChange?.(newView)
    // Sync view mode to URL
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', newView)
    router.push(`${pathname}?${params.toString()}`)
  }, [onViewChange, searchParams, router, pathname])

  const handleClearSearch = useCallback(() => {
    setLocalSearch('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('search')
    router.push(`${pathname}?${params.toString()}`)
  }, [searchParams, router, pathname])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
    }
  }, [])

  return (
    <div className='flex flex-col gap-6 w-full px-4 sm:px-0'>
      {/* Controls Section */}
      <div className='flex flex-col md:flex-row items-stretch md:items-center justify-between gap-y-4 gap-x-8 w-full'>
        {/* Sort and Show controls */}
        <div className='flex flex-col md:flex-row items-stretch md:items-center gap-y-2 gap-x-4 w-full md:w-auto'>
          <div className='flex items-center gap-2 w-full md:w-auto'>
            <span className='text-sm font-medium text-gray-600 whitespace-nowrap'>
              Sort By:
            </span>
            <Select
              value={sortBy}
              onValueChange={handleSortByChange}
              disabled={isActionLoading}
            >
              <SelectTrigger
                className='w-full md:w-[180px]'
                aria-label='Sort products by'
              >
                <SelectValue placeholder='Select' />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={`sort-${option.value}`} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center gap-2 w-full md:w-auto'>
            <span className='text-sm font-medium text-gray-600 whitespace-nowrap'>
              Show:
            </span>
            <Select
              value={normalizePerPage(searchParams.get('perPage') || defaultPerPage)}
              onValueChange={handlePerPageChange}
              disabled={isActionLoading}
            >
              <SelectTrigger
                className='w-full md:w-[120px]'
                aria-label='Products per page'
              >
                <SelectValue placeholder='Select' />
              </SelectTrigger>
              <SelectContent>
                {PER_PAGE_OPTIONS.map((option) => (
                  <SelectItem key={`perPage-${option}`} value={option.toString()}>
                    {option === 'All' ? 'All Products' : `${option} per page`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className='flex items-center gap-2 w-full md:w-auto'>
          <span className='text-sm font-medium text-gray-600'>View:</span>
          <div className='flex border border-gray-300 rounded-lg overflow-hidden'>
            <button
              onClick={() => handleViewChange('grid')}
              disabled={isActionLoading}
              className={`p-2 transition-colors ${
                view === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              } ${isActionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label='Grid view'
            >
              <Grid className='w-4 h-4' />
            </button>
            <button
              onClick={() => handleViewChange('list')}
              disabled={isActionLoading}
              className={`p-2 transition-colors ${
                view === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              } ${isActionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label='List view'
            >
              <List className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className='relative'>
        <Input
          type='text'
          placeholder='Search products...'
          value={localSearch}
          onChange={handleSearchChange}
          disabled={isActionLoading}
          className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        />
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          <svg
            className='h-5 w-5 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
        </div>
        {localSearch && (
          <button
            onClick={handleClearSearch}
            disabled={isActionLoading}
            className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600'
            aria-label='Clear search'
          >
            <svg
              className='h-5 w-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
