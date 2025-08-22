'use client'

import * as React from 'react'
import Image from 'next/image'
import { Button } from '@/components/common/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { CarouselItem } from '@/types/carousel-types'
import Link from 'next/link'

type HomeCarouselProps = {
  items: CarouselItem[]
}

export default function HomeCarousel({ items }: HomeCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(true)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll functionality
  React.useEffect(() => {
    if (!isAutoPlaying || items.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, items.length])

  const scrollPrev = React.useCallback(() => {
    setIsAutoPlaying(false)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [items.length])

  const scrollNext = React.useCallback(() => {
    setIsAutoPlaying(false)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [items.length])

  return (
    <div className='px-0 sm:px-4'>
      <div 
        ref={containerRef} 
        className='overflow-hidden relative group rounded-2xl'
        style={{ 
          contain: 'layout style paint',
          willChange: 'transform'
        }}
      >
        <div 
          className='flex transition-transform duration-500 ease-in-out'
          style={{ 
            transform: `translateX(-${currentIndex * 100}%)`,
            backfaceVisibility: 'hidden'
          }}
        >
          {items.map((item, index) => (
            <div key={index} className='flex-[0_0_100%] min-w-0 relative'>
              <Link href={item.url} className='block'>
                <div className='aspect-[16/7] md:aspect-[16/6] relative'>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className='object-cover'
                    priority={index === 0}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    sizes='(max-width: 768px) 100vw, 50vw'
                  />
                  <div className='absolute inset-0 bg-black/20 flex items-center justify-center text-center'>
                    <div className='max-w-2xl space-y-6 px-4'>
                      <h3 className='text-xl md:text-6xl font-bold text-white drop-shadow-2xl'>
                        {item.title}
                      </h3>
                      <Button className='bg-white text-black hover:bg-gray-100 font-semibold text-lg px-8 py-3 rounded-full shadow-lg transform transition-all hover:scale-105'>
                        {item.buttonCaption}
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        {items.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className='absolute left-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/80 rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10'
              aria-label='Previous slide'
            >
              <ArrowLeft className='h-6 w-6' />
            </button>
            <button
              onClick={scrollNext}
              className='absolute right-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/80 rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10'
              aria-label='Next slide'
            >
              <ArrowRight className='h-6 w-6' />
            </button>
          </>
        )}

        {/* Slide Indicators */}
        {items.length > 1 && (
          <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2'>
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false)
                  setCurrentIndex(index)
                  setTimeout(() => setIsAutoPlaying(true), 10000)
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
