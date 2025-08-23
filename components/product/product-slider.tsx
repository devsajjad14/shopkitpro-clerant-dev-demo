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
  const [hasError, setHasError] = React.useState(false)
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setHasError(false)
  }, [])

  const scrollPrev = React.useCallback(() => {
    if (!products?.length) return
    setCurrentIndex((prevIndex) => 
      prevIndex > 0 ? prevIndex - 1 : Math.max(0, products.length - 4)
    )
  }, [products?.length])

  const scrollNext = React.useCallback(() => {
    if (!products?.length) return
    setCurrentIndex((prevIndex) => 
      prevIndex < products.length - 4 ? prevIndex + 1 : 0
    )
  }, [products?.length])

  if (hasError) {
    return (
      <div className='w-full bg-white py-8 px-2 sm:px-4'>
        <div className='text-center text-gray-500'>
          <p>Failed to load products. Please refresh the page.</p>
        </div>
      </div>
    )
  }

  if (!products || !products.length) {
    return (
      <div className='w-full bg-white py-8 px-2 sm:px-4'>
        <div className='text-center text-gray-500'>
          <p>No products available.</p>
        </div>
      </div>
    )
  }

  const itemsPerView = 4
  const maxIndex = Math.max(0, products.length - itemsPerView)

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-50/30 py-16 px-4 sm:px-8" style={{ isolation: 'isolate' }}>
      {title && (
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Discover our carefully curated selection of premium products
          </p>
          <div className="mx-auto w-20 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600" />
        </div>
      )}
      <div className="relative group py-8 px-4 -mx-4">
        <div 
          ref={containerRef} 
          className="rounded-xl"
        >
          <div 
            className="flex transition-transform duration-500 ease-out gap-6"
            style={{ 
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              backfaceVisibility: 'hidden'
            }}
          >
            {products.map((product, index) => (
              <div
                key={product.STYLE_ID}
                className="flex-[0_0_calc(100%-1.5rem)] sm:flex-[0_0_calc(50%-1.5rem)] md:flex-[0_0_calc(33.333%-1.5rem)] lg:flex-[0_0_calc(25%-1.5rem)] hover:scale-[1.02] transition-transform duration-500 hover:z-[999] relative"
                style={{ contain: 'layout style paint' }}
              >
                <ProductCard product={product} priority={index < 2} />
              </div>
            ))}
          </div>
        </div>
        
        {/* Navigation Buttons */}
        {products.length > itemsPerView && (
          <>
            <button
              onClick={scrollPrev}
              disabled={currentIndex === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/95 hover:bg-white shadow-lg hover:shadow-xl rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 backdrop-blur-sm border border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
              aria-label="Previous products"
              style={{ outline: 'none', boxShadow: 'none' }}
            >
              <ArrowLeft className="h-5 w-5 text-gray-700 hover:text-gray-900 transition-colors duration-200" />
            </button>
            <button
              onClick={scrollNext}
              disabled={currentIndex >= maxIndex}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/95 hover:bg-white shadow-lg hover:shadow-xl rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 backdrop-blur-sm border border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
              aria-label="Next products"
              style={{ outline: 'none', boxShadow: 'none' }}
            >
              <ArrowRight className="h-5 w-5 text-gray-700 hover:text-gray-900 transition-colors duration-200" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
