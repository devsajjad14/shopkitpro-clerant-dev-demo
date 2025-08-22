'use client'

import * as React from 'react'

// Premium brand collection - 12 world-class brands
const PREMIUM_BRANDS = [
  { name: 'Nike', id: 1, color: 'from-orange-500 to-red-600' },
  { name: 'Adidas', id: 2, color: 'from-blue-600 to-blue-800' },
  { name: 'Puma', id: 3, color: 'from-yellow-500 to-orange-600' },
  { name: 'Under Armour', id: 4, color: 'from-gray-700 to-black' },
  { name: 'New Balance', id: 5, color: 'from-red-500 to-red-700' },
  { name: 'Reebok', id: 6, color: 'from-indigo-600 to-purple-700' },
  { name: 'Converse', id: 7, color: 'from-red-600 to-pink-600' },
  { name: 'Vans', id: 8, color: 'from-black to-gray-800' },
  { name: 'ASICS', id: 9, color: 'from-blue-500 to-cyan-600' },
  { name: 'Jordan', id: 10, color: 'from-red-700 to-black' },
  { name: 'Fila', id: 11, color: 'from-blue-700 to-indigo-800' },
  { name: 'Champion', id: 12, color: 'from-red-600 to-red-800' },
] as const

export default function BrandLogoSlider() {
  const [currentIndex, setCurrentIndex] = React.useState(0) // Start from beginning
  const [isTransitioning, setIsTransitioning] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Simple and reliable scroll functions
  const scrollPrev = React.useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex(prev => prev > 0 ? prev - 1 : PREMIUM_BRANDS.length - 1)
    setTimeout(() => setIsTransitioning(false), 500)
  }, [isTransitioning])

  const scrollNext = React.useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex(prev => (prev + 1) % PREMIUM_BRANDS.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }, [isTransitioning])

  return (
    <section className="w-full py-12 sm:py-16 overflow-hidden" aria-label="Trusted Brand Partners">
      {/* Zero layout shift header with fixed dimensions */}
      <div className="text-center mb-12" style={{ height: '80px' }}>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
          Trusted Brands
        </h2>
        <div className="mx-auto w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
      </div>

      {/* Expert-level infinite brand slider */}
      <div className="relative group mb-8">
        <div 
          className="overflow-hidden"
          style={{ 
            height: '120px',
            contain: 'layout style paint'
          }}
        >
          <div
            ref={containerRef}
            className={`flex gap-6 ${isTransitioning ? 'transition-transform duration-500 ease-out' : ''}`}
            style={{ 
              transform: `translateX(-${currentIndex * 152}px)`, // 128px brand width + 24px gap
              willChange: 'transform'
            }}
          >
            {/* Display brands */}
            {PREMIUM_BRANDS.map((brand, index) => (
              <div
                key={`brand-${brand.id}-${index}`}
                className="flex-shrink-0 w-32 group/brand"
              >
                <div className="flex flex-col items-center justify-center h-full">
                  {/* Premium brand icon with enhanced styling */}
                  <div 
                    className={`w-16 h-16 bg-gradient-to-br ${brand.color} rounded-2xl flex items-center justify-center mb-2 shadow-lg group-hover/brand:shadow-xl group-hover/brand:scale-105 transition-all duration-300`}
                    style={{ 
                      transform: 'translateZ(0)',
                      backfaceVisibility: 'hidden'
                    }}
                  >
                    <span className="text-white font-bold text-lg font-sans tracking-tight">
                      {brand.name.charAt(0)}
                    </span>
                  </div>
                  
                  {/* Brand name with premium typography */}
                  <p className="text-xs font-medium text-gray-700 text-center leading-tight">
                    {brand.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expert-level navigation controls */}
        <button
          onClick={scrollPrev}
          disabled={isTransitioning}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/95 hover:bg-white shadow-xl hover:shadow-2xl rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 backdrop-blur-md border border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
          aria-label="Previous brands"
          style={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
          }}
        >
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={scrollNext}
          disabled={isTransitioning}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/95 hover:bg-white shadow-xl hover:shadow-2xl rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 backdrop-blur-md border border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
          aria-label="Next brands"
          style={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
          }}
        >
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

      </div>
    </section>
  )
}
