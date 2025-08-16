'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PremiumPaginationProps {
  totalPages: number
  currentPage: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  showQuickJump?: boolean
  variant?: 'default' | 'compact'
}

export function PremiumPagination({
  totalPages,
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  isLoading = false,
  showQuickJump = true,
  variant = 'default'
}: PremiumPaginationProps) {

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = []
    const maxVisible = variant === 'compact' ? 5 : 7
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      if (currentPage <= Math.ceil(maxVisible / 2)) {
        for (let i = 1; i <= maxVisible - 1; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push('...', totalPages)
      } else if (currentPage >= totalPages - Math.floor(maxVisible / 2)) {
        pageNumbers.push(1, '...')
        for (let i = totalPages - maxVisible + 2; i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else {
        pageNumbers.push(1, '...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push('...', totalPages)
      }
    }
    return pageNumbers
  }

  const pages = getPageNumbers()

  return (
    <div className="space-y-4">
      {/* Premium Item Count Display */}
      {variant === 'default' && (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
          <div className="relative flex items-center justify-between bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-4 border border-white/20 dark:border-gray-700/50 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Showing</p>
                <p className="text-base font-bold text-gray-900 dark:text-white">
                  {startIndex + 1}-{endIndex} of {totalItems.toLocaleString()} items
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-gray-700/50 rounded-lg border-2 border-[#00437f]/20 dark:border-[#00437f]/30 backdrop-blur-sm">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Page</span>
                <span className="text-sm font-bold text-[#00437f]">{currentPage}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">of</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{totalPages}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compact Display */}
      {variant === 'compact' && (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
          <div className="relative flex items-center justify-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-4 border border-white/20 dark:border-gray-700/50 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span className="text-base font-semibold text-gray-900 dark:text-white">
                {startIndex + 1}-{endIndex} of {totalItems.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Page {currentPage} of {totalPages}</span>
            </div>
          </div>
        </div>
      )}

             {/* Pagination Controls */}
       <div className="relative group">
         <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
         <div className="relative flex items-center justify-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-4 border border-white/20 dark:border-gray-700/50 shadow-lg">
           <nav className="flex items-center gap-2" aria-label="Pagination">
             {/* First Page */}
             <Button
               variant="outline"
               size="sm"
               onClick={() => onPageChange(1)}
               disabled={currentPage === 1 || isLoading}
               className="flex items-center gap-1 px-3 py-2 text-sm font-medium border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] disabled:opacity-50 transition-all duration-200 rounded-lg"
             >
               <ChevronsLeft className="h-4 w-4" />
               {variant === 'default' && <span className="hidden sm:inline">First</span>}
             </Button>

             {/* Previous Page */}
             <Button
               variant="outline"
               size="sm"
               onClick={() => onPageChange(currentPage - 1)}
               disabled={currentPage === 1 || isLoading}
               className="flex items-center gap-1 px-3 py-2 text-sm font-medium border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] disabled:opacity-50 transition-all duration-200 rounded-lg"
             >
               <ChevronLeft className="h-4 w-4" />
               {variant === 'default' && <span className="hidden sm:inline">Previous</span>}
             </Button>

             {/* Page Numbers */}
             <div className="flex items-center gap-1">
               {pages.map((page, index) =>
                 typeof page === 'number' ? (
                   <Button
                     key={index}
                     variant={currentPage === page ? "default" : "outline"}
                     size="sm"
                     onClick={() => onPageChange(page)}
                     className={`px-3 py-2 text-sm font-medium min-w-[36px] transition-all duration-200 rounded-lg ${
                       currentPage === page
                         ? 'bg-gradient-to-r from-[#00437f] to-[#003366] text-white border-[#00437f] hover:from-[#003366] hover:to-[#002855] shadow-md hover:shadow-lg transform hover:scale-105'
                         : 'border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white hover:bg-[#00437f]/10 hover:text-[#00437f] hover:border-[#00437f]/40'
                     }`}
                   >
                     {page}
                   </Button>
                 ) : (
                   <span
                     key={index}
                     className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400"
                   >
                     ...
                   </span>
                 )
               )}
             </div>

             {/* Next Page */}
             <Button
               variant="outline"
               size="sm"
               onClick={() => onPageChange(currentPage + 1)}
               disabled={currentPage === totalPages || isLoading}
               className="flex items-center gap-1 px-3 py-2 text-sm font-medium border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] disabled:opacity-50 transition-all duration-200 rounded-lg"
             >
               {variant === 'default' && <span className="hidden sm:inline">Next</span>}
               <ChevronRight className="h-4 w-4" />
             </Button>

             {/* Last Page */}
             <Button
               variant="outline"
               size="sm"
               onClick={() => onPageChange(totalPages)}
               disabled={currentPage === totalPages || isLoading}
               className="flex items-center gap-1 px-3 py-2 text-sm font-medium border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] disabled:opacity-50 transition-all duration-200 rounded-lg"
             >
               {variant === 'default' && <span className="hidden sm:inline">Last</span>}
               <ChevronsRight className="h-4 w-4" />
             </Button>
           </nav>
         </div>
       </div>

             {/* Quick Jump to Page */}
       {showQuickJump && totalPages > 10 && variant === 'default' && (
         <div className="relative group">
           <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
           <div className="relative flex items-center justify-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-4 border border-white/20 dark:border-gray-700/50 shadow-lg">
             <div className="flex items-center gap-3">
               <span className="text-sm font-semibold text-gray-900 dark:text-white">Jump to:</span>
               <input
                 type="number"
                 min={1}
                 max={totalPages}
                 value={currentPage}
                 onChange={(e) => {
                   const page = parseInt(e.target.value)
                   if (page >= 1 && page <= totalPages) {
                     onPageChange(page)
                   }
                 }}
                 className="w-16 px-3 py-2 text-sm font-medium border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 rounded-lg focus:ring-2 focus:ring-[#00437f]/20 focus:border-[#00437f] transition-all duration-300 text-center"
               />
               <span className="text-sm font-medium text-gray-700 dark:text-gray-300">of {totalPages}</span>
             </div>
           </div>
         </div>
       )}
    </div>
  )
} 