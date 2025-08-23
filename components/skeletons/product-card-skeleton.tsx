// components/skeletons/product-card-skeleton.tsx
import * as React from 'react'

interface ProductCardSkeletonProps {
  view?: 'list' | 'grid' // Made optional with default
}

export function ProductCardSkeleton({
  view = 'grid', // Default value
}: ProductCardSkeletonProps) {
  if (view === 'list') {
    return (
      <div className='p-0 flex flex-row justify-between overflow-hidden shadow-lg m-2 animate-pulse'>
        <div className='relative w-32 h-32 overflow-hidden bg-gray-200' />
        <div className='flex-1 p-4 space-y-2'>
          <div className='h-6 bg-gray-300 rounded-lg w-3/4' />
          <div className='h-6 bg-gray-300 rounded-lg w-1/2' />
          <div className='h-4 bg-gray-300 rounded-lg w-1/3' />
        </div>
        <div className='p-4'>
          <div className='w-full h-10 bg-gray-300 rounded-lg' />
        </div>
      </div>
    )
  }

  // Grid view - exact match to ProductCard
  return (
    <div className='p-0 flex flex-col justify-between overflow-hidden shadow-xl rounded-2xl bg-white border border-gray-200 animate-pulse' style={{ minHeight: '380px' }}>
      {/* Header - matches CardHeader */}
      <div className='p-0 relative bg-transparent border-none shadow-none'>
        {/* Image container - exact match */}
        <div className="relative aspect-[4/5] w-full max-w-[180px] sm:max-w-[200px] lg:max-w-[220px] mx-auto overflow-hidden flex items-center justify-center bg-gray-100 rounded-xl" style={{ height: '144px' }}>
          <div className="w-full h-full bg-gray-200 rounded-xl p-3"></div>
        </div>
      </div>

      {/* Content - matches CardContent */}
      <div className='flex flex-col gap-2 sm:gap-3 p-3 sm:p-4 lg:p-5'>
        {/* Title - matches CardTitle */}
        <div className='text-sm sm:text-base lg:text-lg font-semibold bg-gray-300 rounded h-4 sm:h-5 lg:h-6' style={{ minHeight: '2.5em' }}></div>
        
        {/* Price section */}
        <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
          <div className='h-4 sm:h-5 lg:h-6 bg-gray-300 rounded w-16 sm:w-20'></div>
        </div>
        
        {/* Brand - matches CardDescription */}
        <div className='h-3 sm:h-4 bg-gray-200 rounded w-12 sm:w-16'></div>
      </div>

      {/* Footer - matches CardFooter */}
      <div className='p-3 sm:p-4 lg:p-5 bg-gray-50 rounded-b-2xl'>
        <div className='w-full h-8 sm:h-10 lg:h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full animate-pulse'></div>
      </div>
    </div>
  )
}

export default ProductCardSkeleton
