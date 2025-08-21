'use client'

import { memo, useState, useEffect, useRef } from 'react'
import LoadingSpinner from './LoadingSpinner'

interface LazyComponentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  threshold?: number
  rootMargin?: string
}

const LazyComponent = memo(function LazyComponent({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '50px'
}: LazyComponentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoaded) {
          setIsVisible(true)
          // Delay loading slightly to improve perceived performance
          setTimeout(() => setIsLoaded(true), 100)
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold, rootMargin, isLoaded])

  return (
    <div ref={ref} className="min-h-[100px]">
      {isLoaded ? (
        children
      ) : isVisible ? (
        fallback || (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading component...</span>
          </div>
        )
      ) : null}
    </div>
  )
})

export default LazyComponent