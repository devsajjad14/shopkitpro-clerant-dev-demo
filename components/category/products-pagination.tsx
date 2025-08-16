// products-pagination.tsx
'use client'

import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import React from 'react'

interface ProductsPaginationProps {
  totalPages: number
  currentPage: number
  isLoading?: boolean
  totalProducts?: number
  productsPerPage?: number
}

const ProductsPagination: React.FC<ProductsPaginationProps> = React.memo(({
  totalPages,
  currentPage,
  isLoading = false,
  totalProducts = 0,
  productsPerPage = 8,
}) => {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || isLoading) return

    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  // Calculate product range
  const startIndex = (currentPage - 1) * productsPerPage
  const endIndex = Math.min(startIndex + productsPerPage, totalProducts)
  
  // Hide pagination when showing all products
  const isShowingAll = productsPerPage >= 1000

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    if (isLoading) {
      return (
        <div className='flex items-center justify-center gap-2'>
          <Loader2 className='h-5 w-5 animate-spin text-gray-800' />
        </div>
      )
    }

    const buttons = []
    const maxButtons = 5
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2))
    const end = Math.min(totalPages, start + maxButtons - 1)

    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1)
    }

    // First Page button
    if (start > 1) {
      buttons.push(
        <Button
          key='first'
          variant='ghost'
          size='icon'
          onClick={() => handlePageChange(1)}
          disabled={isLoading}
          aria-label='Go to first page'
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </Button>
      )
    }

    // Previous button
    buttons.push(
      <Button
        key='prev'
        variant='ghost'
        size='icon'
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        aria-label='Previous page'
      >
        <ChevronLeft className='h-4 w-4' />
      </Button>
    )

    // Numbered buttons
    for (let i = start; i <= end; i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === currentPage ? 'default' : 'ghost'}
          size='icon'
          onClick={() => handlePageChange(i)}
          disabled={isLoading}
          aria-label={`Go to page ${i}`}
          className={i === currentPage ? 'font-bold' : ''}
        >
          {i}
        </Button>
      )
    }

    // Next button
    buttons.push(
      <Button
        key='next'
        variant='ghost'
        size='icon'
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        aria-label='Next page'
      >
        <ChevronRight className='h-4 w-4' />
      </Button>
    )

    // Last Page button
    if (end < totalPages) {
      buttons.push(
        <Button
          key='last'
          variant='ghost'
          size='icon'
          onClick={() => handlePageChange(totalPages)}
          disabled={isLoading}
          aria-label='Go to last page'
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </Button>
      )
    }

    return buttons
  }

  return (
    <div className='space-y-4 px-4 sm:px-0'>
      {/* Premium Product Count Display */}
      {totalProducts > 0 && (
        <div className="flex items-center justify-center bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
              <svg className="w-4 h-4 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium text-gray-900">Showing</p>
              <p className="text-base font-bold text-gray-900">
                {isShowingAll ? `All ${totalProducts.toLocaleString()}` : `${startIndex + 1}-${endIndex} of ${totalProducts.toLocaleString()}`} products
              </p>
            </div>
          </div>
          
          {!isShowingAll && (
            <div className="hidden sm:flex items-center gap-2 ml-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-gray-200">
                <span className="text-xs font-medium text-gray-700">Page</span>
                <span className="text-sm font-bold text-blue-800">{currentPage}</span>
                <span className="text-xs text-gray-700">of</span>
                <span className="text-sm font-medium text-gray-700">{totalPages}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls - Hide when showing all products */}
      {!isShowingAll && (
        <div className='flex items-center justify-center gap-1 sm:gap-2'>
          {renderPaginationButtons()}
        </div>
      )}
    </div>
  )
})

export default ProductsPagination
