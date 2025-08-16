'use client'

import * as React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import ProductCard from './product-card'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Product } from '@/types/product-types'

type ProductSliderProps = {
  title?: string
  products: Product[]
}

export default function ProductSlider({ title, products }: ProductSliderProps) {
  // Add error boundary for the component
  const [hasError, setHasError] = React.useState(false)

  React.useEffect(() => {
    // Reset error state on mount
    setHasError(false)
  }, [])

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

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    skipSnaps: false,
  })

  // Scroll functions optimized with `useCallback`
  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  React.useEffect(() => {
    // Optional: Auto scroll behavior or carousel adjustments can go here
  }, [emblaApi])

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
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {products.map((product) => (
              <div
                key={product.STYLE_ID}
                className="flex-[0_0_100%] sm:flex-[0_0_45%] md:flex-[0_0_25%] lg:flex-[0_0_20%] pb-4 mx-1 md:mx-2"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
        {/* Navigation Buttons - visible on all screens */}
        <button
          onClick={scrollPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/80 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          aria-label="Previous slide"
        >
          <ArrowLeft className="h-6 w-6 text-black" />
        </button>
        <button
          onClick={scrollNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/80 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          aria-label="Next slide"
        >
          <ArrowRight className="h-6 w-6 text-black" />
        </button>
      </div>
    </div>
  )
}
