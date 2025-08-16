export default function CartLoading() {
  return (
    <div className='space-y-4 sm:space-y-6'>
      {/* Header Skeleton */}
      <div className='flex items-center justify-between'>
        <div className='h-8 sm:h-10 w-48 sm:w-64 bg-gray-200 rounded-lg'></div>
        <div className='h-6 w-16 sm:w-20 bg-gray-200 rounded-md'></div>
      </div>
      
      {/* Cart Items Skeletons */}
      <div className='space-y-4 sm:space-y-6'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='animate-pulse'>
            <div className='flex gap-3 sm:gap-4'>
              {/* Product Image Skeleton */}
              <div className='h-20 w-20 sm:h-24 sm:w-24 lg:h-32 lg:w-32 bg-gray-200 rounded-xl flex-shrink-0'></div>
              
              {/* Product Info Skeleton */}
              <div className='flex-1 space-y-2 sm:space-y-3'>
                <div className='space-y-2'>
                  <div className='h-4 sm:h-5 bg-gray-200 rounded w-3/4'></div>
                  <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                  <div className='h-3 bg-gray-200 rounded w-1/3'></div>
                </div>
                
                {/* Price and Controls Skeleton */}
                <div className='flex items-center justify-between'>
                  <div className='h-6 w-16 bg-gray-200 rounded'></div>
                  <div className='flex items-center gap-2'>
                    <div className='h-8 w-20 bg-gray-200 rounded-md'></div>
                    <div className='h-6 w-16 bg-gray-200 rounded'></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
