import * as React from 'react'

export function HomeCarouselSkeleton() {
  return (
    <div className='hero-carousel relative overflow-hidden rounded-lg sm:rounded-2xl' style={{ backgroundColor: '#f8fafc' }}>
      {/* Exact background match */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/10 via-blue-900/20 to-indigo-900/30" />
      
      {/* Content skeleton matching exact layout */}
      <div className="relative flex items-center justify-center h-full text-center px-4 sm:px-8">
        <div className="max-w-sm sm:max-w-4xl">
          {/* Title skeleton - exact match */}
          <div className="animate-pulse mb-4 sm:mb-6">
            <div className="h-8 sm:h-16 md:h-20 bg-gray-300/60 rounded-lg mx-auto" 
                 style={{ width: '280px', maxWidth: '90%' }}></div>
          </div>
          {/* Subtitle skeleton - exact match */}
          <div className="animate-pulse mb-4 sm:mb-8">
            <div className="h-4 sm:h-6 md:h-7 bg-gray-300/50 rounded-lg mx-auto" 
                 style={{ width: '320px', maxWidth: '95%' }}></div>
          </div>
          {/* Button skeleton - exact match */}
          <div className="animate-pulse">
            <div className="h-10 sm:h-14 bg-white/70 rounded-full mx-auto border border-white/30 shadow-lg" 
                 style={{ width: '140px' }}></div>
          </div>
        </div>
      </div>
      
      {/* Navigation dots skeleton */}
      <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full shadow-lg"></div>
        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white/60 rounded-full"></div>
        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white/60 rounded-full"></div>
      </div>
      
      {/* Navigation arrows skeleton - desktop only */}
      <div className="hidden sm:block absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/80 rounded-full shadow-lg border border-white/30"></div>
      <div className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/80 rounded-full shadow-lg border border-white/30"></div>
    </div>
  )
}
