'use client'

import * as React from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/common/carousel'
import Link from 'next/link'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

type BrandLogo = {
  name: string
  imageUrl: string
  url: string
}

type BrandLogoSliderProps = {
  brandLogos: BrandLogo[]
}

export default function BrandLogoSlider({ brandLogos }: BrandLogoSliderProps) {
  // Add error boundary for the component
  const [hasError, setHasError] = React.useState(false)

  React.useEffect(() => {
    // Reset error state on mount
    setHasError(false)
  }, [])

  if (hasError) {
    return (
      <div className='w-full bg-gradient-to-r from-blue-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='text-center text-gray-500'>
          <p>Failed to load brand logos. Please refresh the page.</p>
        </div>
      </div>
    )
  }

  if (!brandLogos || !brandLogos.length) {
    return (
      <div className='w-full bg-gradient-to-r from-blue-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='text-center text-gray-500'>
          <p>No brand logos available.</p>
        </div>
      </div>
    )
  }

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    skipSnaps: true,
  })

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-14 px-0 sm:px-4 sm:px-6 lg:px-8 rounded-2xl shadow-xl">
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight inline-block">
          Our Trusted Brands
        </h2>
        <div className="mx-auto mt-3 w-24 h-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" />
      </div>
      <div className="w-full relative group">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {brandLogos.map((brandLogo) => (
              <div
                key={brandLogo.name}
                className="flex-[0_0_45%] sm:flex-[0_0_25%] md:flex-[0_0_12.5%] pb-4 mx-1 md:mx-2"
              >
                <Link href={brandLogo.url || '/'} className="block">
                  <div className="relative aspect-[3/2] bg-white rounded-2xl shadow-lg hover:shadow-2xl transform transition-all duration-300 group overflow-hidden border border-gray-100 hover:border-indigo-400 p-6 hover:scale-105 hover:brightness-110">
                    {/* Logo Image */}
                    <Image
                      src={brandLogo.imageUrl || '/default-logo.jpg'}
                      alt={brandLogo.name}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 640px) 60px, (max-width: 768px) 80px, 100px"
                      onError={() => setHasError(true)}
                    />
                    {/* Subtle Overlay Effect */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 rounded-2xl" />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
        {/* Carousel Navigation Buttons - visible on all screens */}
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
