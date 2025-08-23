'use client'

import * as React from 'react'
import ProductCard from './product-card'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Product } from '@/types/product-types'

type ProductSliderProps = {
  title?: string
  products: Product[]
}

export default function ProductSlider({ title, products }: ProductSliderProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    const updateItemsPerView = () => {
      setItemsPerView(getItemsPerView())
    }
    updateItemsPerView()
    window.addEventListener('resize', updateItemsPerView)
    return () => window.removeEventListener('resize', updateItemsPerView)
  }, [])

  const scrollPrev = React.useCallback(() => {
    if (!products?.length) return
    setCurrentIndex((prevIndex) => 
      prevIndex > 0 ? prevIndex - 1 : 0
    )
  }, [products?.length])

  const scrollNext = React.useCallback(() => {
    if (!products?.length) return
    setCurrentIndex((prevIndex) => 
      prevIndex < products.length - 4 ? prevIndex + 1 : prevIndex
    )
  }, [products?.length])

  if (!products || !products.length) {
    return (
      <div className='w-full bg-white py-8 px-2 sm:px-4'>
        <div className='text-center text-gray-500'>
          <p>No products available.</p>
        </div>
      </div>
    )
  }

  const getItemsPerView = () => {
    if (typeof window === 'undefined') return 1
    if (window.innerWidth < 640) return 1 // mobile
    if (window.innerWidth < 1024) return 2 // tablet
    return 4 // desktop
  }
  
  const [itemsPerView, setItemsPerView] = React.useState(1)
  const maxIndex = Math.max(0, products.length - itemsPerView)

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-50/30 py-6 sm:py-12 lg:py-16 px-2 sm:px-4 lg:px-8" style={{ isolation: 'isolate' }}>
      {title && (
        <div className="mb-6 sm:mb-8 lg:mb-12 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-3 sm:mb-4 lg:mb-6 shadow-lg">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4 leading-tight">
            {title}
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto mb-3 sm:mb-4 lg:mb-6">
            Discover our carefully curated selection of premium products
          </p>
          <div className="mx-auto w-20 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600" />
        </div>
      )}
      
      <div className="relative group py-2 sm:py-4 lg:py-8 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <div 
          ref={containerRef} 
          className="rounded-xl overflow-hidden"
        >
          <div 
            className="flex transition-transform duration-500 ease-out gap-2 sm:gap-4 lg:gap-6"
            style={{ 
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              backfaceVisibility: 'hidden'
            }}
          >
            {products.map((product, index) => (
              <div
                key={product.STYLE_ID}
                className="flex-[0_0_calc(100%-1rem)] sm:flex-[0_0_calc(50%-1rem)] lg:flex-[0_0_calc(25%-1.5rem)] hover:scale-[1.02] transition-transform duration-500 hover:z-[999] relative"
                style={{ contain: 'layout style paint' }}
              >
                <ProductCard product={product} priority={index < 2} />
              </div>
            ))}
          </div>
        </div>
        
        {/* Navigation Buttons - Always visible and working */}
        {products.length > itemsPerView && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute -left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/95 hover:bg-white shadow-lg hover:shadow-xl rounded-full flex items-center justify-center transition-all duration-300 z-20 backdrop-blur-sm border border-gray-100 hover:scale-110 active:scale-95"
              aria-label="Previous products"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 hover:text-gray-900 transition-colors duration-200" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute -right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/95 hover:bg-white shadow-lg hover:shadow-xl rounded-full flex items-center justify-center transition-all duration-300 z-20 backdrop-blur-sm border border-gray-100 hover:scale-110 active:scale-95"
              aria-label="Next products"
            >
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 hover:text-gray-900 transition-colors duration-200" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}