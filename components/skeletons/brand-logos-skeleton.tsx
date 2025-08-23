import * as React from 'react'

export function BrandLogosSkeleton() {
  return (
    <section className="w-full py-12 sm:py-16 overflow-hidden" aria-label="Trusted Brand Partners">
      {/* Header Skeleton */}
      <div className="text-center mb-12" style={{ height: '80px' }}>
        <div className="h-8 bg-gray-200 rounded-lg w-48 mx-auto mb-3 animate-pulse"></div>
        <div className="mx-auto w-20 h-1 bg-gray-200 rounded-full animate-pulse" />
      </div>

      {/* Brand slider skeleton */}
      <div className="relative group mb-8">
        <div 
          className="overflow-hidden"
          style={{ 
            height: '120px',
            contain: 'layout style paint'
          }}
        >
          <div className="flex gap-6 justify-center">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-40"
              >
                <div className="flex flex-col items-center justify-center h-full">
                  {/* Brand icon skeleton - matches actual size */}
                  <div className="w-28 h-28 bg-gray-200 rounded-lg mb-2 shadow-sm animate-pulse"></div>
                  
                  {/* Brand name skeleton */}
                  <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation controls skeleton */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-gray-200 rounded-full animate-pulse shadow-sm"></div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-gray-200 rounded-full animate-pulse shadow-sm"></div>
      </div>
    </section>
  )
}
