import * as React from 'react'

export function HomeCarouselSkeletonMinimal() {
  return (
    <div className="absolute inset-0 flex items-center justify-center mobile-loading">
      {/* Ultra-minimal skeleton for instant paint */}
      <div className="text-center space-y-3 sm:space-y-6 px-4 sm:px-8">
        <div className="mobile-skeleton">
          <div className="h-6 sm:h-10 lg:h-14 bg-gray-300 rounded mx-auto w-48 sm:w-64 lg:w-80"></div>
        </div>
        <div className="mobile-skeleton">
          <div className="h-4 sm:h-6 lg:h-7 bg-gray-200 rounded mx-auto w-56 sm:w-72 lg:w-96"></div>
        </div>
        <div className="mobile-skeleton">
          <div className="h-8 sm:h-10 lg:h-12 bg-white/80 rounded-full mx-auto w-24 sm:w-32 lg:w-40 border shadow-md"></div>
        </div>
      </div>
    </div>
  )
}