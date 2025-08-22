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
    <div className="w-full bg-gradient-to-br from-gray-50 via-white to-blue-50 py-12 px-2 sm:px-8 rounded-2xl shadow-xl">
      {title && (
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight inline-block">
            {title}
          </h2>
          <div className="mx-auto mt-3 w-24 h-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" />
        </div>
      )}
      <div className="relative group">
        <div 
          ref={containerRef} 
          className="overflow-hidden"
          style={{ 
            contain: 'layout style paint',
            willChange: 'transform'
          }}
        >
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ 
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              backfaceVisibility: 'hidden'
            }}
          >
            {products.map((product) => (
              <div
                key={product.STYLE_ID}
                className="flex-[0_0_100%] sm:flex-[0_0_45%] md:flex-[0_0_25%] lg:flex-[0_0_20%] pb-4 mx-1 md:mx-2"
                style={{ contain: 'layout style paint' }}
              >
                <ProductCard product={product} />
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
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
              aria-label="Previous products"
            >
              <ArrowLeft className="h-6 w-6 text-black" />
            </button>
            <button
              onClick={scrollNext}
              disabled={currentIndex >= maxIndex}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
              aria-label="Next products"
            >
              <ArrowRight className="h-6 w-6 text-black" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
