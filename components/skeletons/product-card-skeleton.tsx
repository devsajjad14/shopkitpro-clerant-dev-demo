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
    <div className='p-0 flex flex-col justify-between overflow-hidden shadow-xl rounded-2xl bg-white border border-gray-200 animate-pulse'>
      {/* Header - matches CardHeader */}
      <div className='p-0 relative bg-transparent border-none shadow-none'>
        {/* Image container - exact match */}
        <div className="relative aspect-[4/5] w-full max-w-[220px] mx-auto overflow-hidden flex items-center justify-center bg-gray-100 rounded-xl">
          <div className="w-full h-full bg-gray-200 rounded-xl p-3"></div>
        </div>
      </div>

      {/* Content - matches CardContent */}
      <div className='flex flex-col gap-3 p-5 sm:p-7'>
        {/* Title - matches CardTitle */}
        <div className='text-lg sm:text-xl font-semibold bg-gray-300 rounded h-6' style={{ minHeight: '3em' }}></div>
        
        {/* Price section */}
        <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
          <div className='h-6 bg-gray-300 rounded w-20'></div>
        </div>
        
        {/* Brand - matches CardDescription */}
        <div className='h-4 bg-gray-200 rounded w-16'></div>
      </div>

      {/* Footer - matches CardFooter */}
      <div className='p-5 sm:p-7 bg-gray-50 rounded-b-2xl'>
        <div className='w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full animate-pulse'></div>
      </div>
    </div>
  )
}

export default ProductCardSkeleton
