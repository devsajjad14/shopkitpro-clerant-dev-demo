interface ProductHeaderInfoProps {
  brand: string
  name: string
  styleCode?: string
  rating: number
  reviewCount: number
  category?: string
}

export function ProductHeaderInfo({
  brand,
  name,
  styleCode,
  rating,
  reviewCount,
  category,
}: ProductHeaderInfoProps) {
  return (
    <div className='mb-4 sm:mb-6 lg:mb-8'>
      {/* Brand and Category Section */}
      <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4'>
        <span className='text-sm sm:text-base font-medium text-gray-500'>{brand}</span>
        {category && (
          <>
            <span className='hidden sm:inline text-gray-300'>•</span>
            <span className='text-sm sm:text-base text-gray-500'>{category}</span>
          </>
        )}
      </div>

      {/* Product Name */}
      <h1 className='text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-3 sm:mb-4'>
        {name}
      </h1>

      {/* Rating and Reviews Section */}
      <div className='flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4'>
        <div className='flex items-center'>
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
            </svg>
          ))}
          <span className='text-xs sm:text-sm text-gray-500 ml-2 sm:ml-3'>
            {reviewCount > 0 ? `(${reviewCount} reviews)` : 'No reviews yet'}
          </span>
        </div>
      </div>

      {/* SKU Section */}
      {styleCode && (
        <div className='mt-3 sm:mt-4'>
          <span className='text-xs sm:text-sm text-gray-500 font-medium'>
            SKU: <span className='font-normal'>{styleCode}</span>
          </span>
        </div>
      )}
    </div>
  )
}
