'use client'

import { Suspense } from 'react'
import * as React from 'react'
import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/error-boundary/error-boundary'
import { MiniBannersSkeleton } from '@/components/skeletons/mini-banners-skeleton'
import { HomeCarouselSkeleton } from '@/components/skeletons/carousel-skeleton'
import HomeCarousel from '@/components/home/home-carousel'
import { ProductCardSkeleton } from '@/components/skeletons/product-card-skeleton'
import { CompanyIntroSkeleton } from '@/components/skeletons/company-intro-skeleton'
import { BrandLogosSkeleton } from '@/components/skeletons/brand-logos-skeleton'
import { useCmsType } from '@/lib/hooks/use-cms-type'
import useSettingStore from '@/hooks/use-setting-store'
import type { CarouselItem } from '@/types/carousel-types'

// Lazy dynamic imports for better performance
const MiniBanners = dynamic(() => import('@/components/home/mini-banners'), {
  loading: () => <MiniBannersSkeleton />,
  ssr: false,
})

const FeaturedProductsSection = dynamic(
  () => import('@/components/product/FeaturedProductsSection'),
  {
    loading: () => <ProductSliderSkeleton />,
    ssr: false
  }
)

const CompanyIntro = dynamic(() => import('@/components/home/company-intro'), {
  loading: () => <CompanyIntroSkeleton />,
  ssr: false,
})

const BrandLogoSlider = dynamic(() => import('@/components/home/brand-logos'), {
  loading: () => <BrandLogosSkeleton />,
  ssr: false,
})

// CMS Placeholder Components
function CMSPlaceholder({ title, message }: { title: string; message: string }) {
  return (
    <div className="w-full py-16 px-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
        <p className="text-gray-500">{message}</p>
      </div>
    </div>
  )
}

function PremiumHeroCarouselPlaceholder() {
  const [currentSlide, setCurrentSlide] = React.useState(0)
  const [isTransitioning, setIsTransitioning] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)
  const [touchStart, setTouchStart] = React.useState(0)
  const [touchEnd, setTouchEnd] = React.useState(0)
  
  // Simplified mobile detection with immediate render
  React.useEffect(() => {
    const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768
    setIsMobile(isMobileDevice)
  }, [])

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }
  }
  
  const slides = [
    {
      gradient: 'from-slate-50 via-blue-50 to-indigo-100',
      overlay: 'from-slate-900/10 via-blue-900/20 to-indigo-900/30',
      title: 'Premium Collection',
      subtitle: 'Discover our finest selection of world-class products crafted for excellence',
      cta: 'Shop Premium'
    },
    {
      gradient: 'from-rose-50 via-pink-50 to-purple-100',
      overlay: 'from-rose-900/10 via-pink-900/20 to-purple-900/30',
      title: 'New Arrivals',
      subtitle: 'Fresh styles and cutting-edge designs just landed in our store',
      cta: 'Explore New'
    },
    {
      gradient: 'from-emerald-50 via-teal-50 to-cyan-100',
      overlay: 'from-emerald-900/10 via-teal-900/20 to-cyan-900/30',
      title: 'Special Offers',
      subtitle: 'Limited time deals on our most popular items - don\'t miss out',
      cta: 'View Offers'
    }
  ]

  const nextSlide = React.useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentSlide(prev => (prev + 1) % slides.length)
    setTimeout(() => setIsTransitioning(false), 600)
  }, [isTransitioning, slides.length])

  const prevSlide = React.useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentSlide(prev => prev > 0 ? prev - 1 : slides.length - 1)
    setTimeout(() => setIsTransitioning(false), 600)
  }, [isTransitioning, slides.length])

  const goToSlide = React.useCallback((index: number) => {
    if (isTransitioning || index === currentSlide) return
    setIsTransitioning(true)
    setCurrentSlide(index)
    setTimeout(() => setIsTransitioning(false), 600)
  }, [isTransitioning, currentSlide])

  // Auto-slide functionality - disabled on mobile for performance
  React.useEffect(() => {
    if (isMobile || typeof window === 'undefined') return // No auto-slide on mobile
    
    const interval = setInterval(() => {
      if (!isTransitioning && document.visibilityState === 'visible') {
        nextSlide()
      }
    }, 6000)
    
    return () => clearInterval(interval)
  }, [nextSlide, isTransitioning, isMobile])

  const currentSlideData = slides[currentSlide]
  
  return (
    <div 
      className="relative w-full h-full overflow-hidden" 
      style={{ contain: 'layout style paint' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.gradient}`} />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/10 via-blue-900/20 to-indigo-900/30" />
      
      {/* Content - Perfectly centered */}
      <div className="absolute inset-0 flex items-center justify-center text-center px-4 sm:px-8 lg:px-16">
        <div className="max-w-xs sm:max-w-2xl lg:max-w-4xl" style={{ minHeight: '120px' }}>
          <h1 className="text-lg sm:text-3xl lg:text-5xl xl:text-6xl font-bold text-gray-800 mb-2 sm:mb-6 lg:mb-8 leading-tight" style={{ minHeight: '1.5rem' }}>
            {currentSlideData.title}
          </h1>
          <p className="text-xs sm:text-lg lg:text-xl text-gray-600 mb-3 sm:mb-8 lg:mb-10 leading-relaxed" style={{ minHeight: '0.75rem' }}>
            Configure CMS to show dynamic content here
          </p>
          <button className="inline-flex items-center px-3 py-1.5 sm:px-8 sm:py-4 lg:px-10 lg:py-5 bg-white/90 backdrop-blur-sm rounded-full text-gray-800 font-semibold shadow-lg hover:shadow-xl hover:bg-white transition-all duration-200 text-xs sm:text-lg lg:text-xl" style={{ minHeight: '28px', minWidth: '80px' }}>
            <span>{currentSlideData.cta}</span>
            <svg className="w-3 h-3 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
      
      
      {/* Navigation arrows - Always visible */}
      <div>
        <button 
          onClick={prevSlide}
          disabled={isTransitioning}
          className="absolute left-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/80 hover:bg-white rounded-full flex items-center justify-center border border-white/30 text-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
          aria-label="Previous slide"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          onClick={nextSlide}
          disabled={isTransitioning}
          className="absolute right-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/80 hover:bg-white rounded-full flex items-center justify-center border border-white/30 text-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
          aria-label="Next slide"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function PremiumMiniBannersPlaceholder({ count }: { count: number }) {
  const bannerData = [
    {
      gradient: 'from-slate-100 via-blue-50 to-indigo-100',
      overlay: 'from-slate-900/20 via-blue-900/30 to-indigo-900/40',
      title: 'Premium Collection',
      subtitle: 'Discover our finest products'
    },
    {
      gradient: 'from-gray-100 via-slate-50 to-gray-200',
      overlay: 'from-gray-900/20 via-slate-900/30 to-gray-900/40',
      title: 'New Arrivals',
      subtitle: 'Fresh styles just landed'
    },
    {
      gradient: 'from-stone-100 via-amber-50 to-orange-100',
      overlay: 'from-stone-900/20 via-amber-900/30 to-orange-900/40',
      title: 'Special Offers',
      subtitle: 'Limited time deals'
    },
    {
      gradient: 'from-emerald-50 via-teal-50 to-cyan-100',
      overlay: 'from-emerald-900/20 via-teal-900/30 to-cyan-900/40',
      title: 'Eco Friendly',
      subtitle: 'Sustainable choices'
    },
    {
      gradient: 'from-rose-50 via-pink-50 to-purple-100',
      overlay: 'from-rose-900/20 via-pink-900/30 to-purple-900/40',
      title: 'Trending Now',
      subtitle: 'What everyone loves'
    }
  ]
  
  return (
    <div className='w-full bg-gray-50 px-0 sm:px-4'>
      <div className='w-full'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4'>
          {Array.from({ length: count }).map((_, index) => {
            const banner = bannerData[index % bannerData.length]
            return (
              <div
                key={index}
                className='relative pb-[100%] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl group cursor-pointer hover:scale-[1.02] mobile-optimized'
                style={{ contain: 'layout style paint' }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${banner.gradient}`} />
                <div className={`absolute inset-0 bg-gradient-to-b ${banner.overlay}`} />
                
                {/* Pattern overlay for desktop only */}
                <div className="hidden lg:block absolute inset-0 opacity-5">
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23000\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"7\" cy=\"7\" r=\"1\"/%3E%3Ccircle cx=\"7\" cy=\"27\" r=\"1\"/%3E%3Ccircle cx=\"7\" cy=\"47\" r=\"1\"/%3E%3Ccircle cx=\"27\" cy=\"7\" r=\"1\"/%3E%3Ccircle cx=\"27\" cy=\"27\" r=\"1\"/%3E%3Ccircle cx=\"27\" cy=\"47\" r=\"1\"/%3E%3Ccircle cx=\"47\" cy=\"7\" r=\"1\"/%3E%3Ccircle cx=\"47\" cy=\"27\" r=\"1\"/%3E%3Ccircle cx=\"47\" cy=\"47\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
                    }}
                  ></div>
                </div>
                
                <div className='absolute inset-0 flex flex-col items-center justify-center p-6 text-center'>
                  <h3 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2 drop-shadow-sm leading-tight'>
                    {banner.title}
                  </h3>
                  <p className='text-sm text-gray-600 mb-4 font-medium drop-shadow-sm'>
                    Configure CMS to show dynamic content here
                  </p>
                  <div className='bg-white/90 backdrop-blur-sm text-gray-800 px-6 py-2.5 rounded-full font-semibold text-sm shadow-lg border border-white/20 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:shadow-xl mobile-optimized'>
                    SHOP NOW
                  </div>
                </div>
                
                {/* Corner accent */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm border border-white/30 group-hover:scale-110 transition-transform duration-200 mobile-optimized">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function PremiumBrandLogosPlaceholder() {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isTransitioning, setIsTransitioning] = React.useState(false)
  
  const brands = [
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
  ]

  const scrollPrev = React.useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex(prev => prev > 0 ? prev - 1 : brands.length - 1)
    setTimeout(() => setIsTransitioning(false), 500)
  }, [isTransitioning, brands.length])

  const scrollNext = React.useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex(prev => (prev + 1) % brands.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }, [isTransitioning, brands.length])
  
  return (
    <section className="w-full py-12 sm:py-16 overflow-hidden" aria-label="Trusted Brand Partners">
      {/* Header */}
      <div className="text-center mb-12" style={{ height: '80px' }}>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
          Trusted Brands
        </h2>
        <div className="mx-auto w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
      </div>

      {/* Brand slider */}
      <div className="relative group mb-8">
        <div 
          className="overflow-hidden"
          style={{ 
            height: '120px',
            contain: 'layout style paint'
          }}
        >
          <div
            className={`flex gap-6 ${isTransitioning ? 'transition-transform duration-500 ease-out' : ''}`}
            style={{ 
              transform: `translateX(-${currentIndex * 184}px)`, // 160px brand width + 24px gap
              willChange: 'transform'
            }}
          >
            {brands.map((brand, index) => (
              <div
                key={`brand-${brand.id}-${index}`}
                className="flex-shrink-0 w-40 group/brand"
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <div 
                    className={`w-28 h-28 bg-gradient-to-br ${brand.color} rounded-lg flex items-center justify-center mb-2 shadow-lg group-hover/brand:shadow-xl group-hover/brand:scale-105 transition-all duration-200 mobile-optimized`}
                    style={{ 
                      transform: 'translateZ(0)',
                      backfaceVisibility: 'hidden'
                    }}
                  >
                    <span className="text-white font-bold text-2xl font-sans tracking-tight">
                      {brand.name.charAt(0)}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-gray-700 text-center leading-tight">
                    {brand.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation controls - Always visible on mobile */}
        <button
          onClick={scrollPrev}
          disabled={isTransitioning}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 bg-white/95 hover:bg-white shadow-xl hover:shadow-2xl rounded-full flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 z-20 backdrop-blur-md border border-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous brands"
        >
          <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={scrollNext}
          disabled={isTransitioning}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 bg-white/95 hover:bg-white shadow-xl hover:shadow-2xl rounded-full flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 z-20 backdrop-blur-md border border-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next brands"
        >
          <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  )
}

function PremiumCompanyIntroPlaceholder() {
  return (
    <section className='bg-gradient-to-r from-blue-50 to-gray-100 py-12 sm:py-16'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-12'>
          {/* Image Section - Mobile optimized */}
          <div className='w-full lg:w-1/2'>
            <div className='relative group overflow-hidden rounded-xl shadow-2xl'>
              <div className='w-full h-[320px] sm:h-[400px] lg:h-[500px] bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 transition-transform duration-500 group-hover:scale-[1.02] flex items-center justify-center'>
                <div className="text-center text-gray-600">
                  <svg className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 mx-auto mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm sm:text-base font-medium text-slate-500">Configure CMS to show dynamic content here</p>
                </div>
              </div>
              <div className='absolute inset-0 bg-gradient-to-t from-black/5 to-transparent group-hover:from-black/10 transition-all duration-500'></div>
            </div>
          </div>

          {/* Text Section - Mobile optimized */}
          <div className='w-full lg:w-1/2 text-center lg:text-left space-y-4 sm:space-y-6'>
            <h1 className='text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight hover:text-indigo-600 transition-colors duration-300'>
              Welcome to Our World of Innovation
            </h1>
            <p className='text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed'>
              At our company, we are dedicated to delivering cutting-edge
              solutions that empower businesses and individuals alike. With a
              focus on innovation, quality, and customer satisfaction, we strive
              to create products and services that make a real difference.
            </p>
            <p className='text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed'>
              Our team of experts is passionate about technology and committed
              to helping you achieve your goals. Whether you are looking for
              eCommerce solutions, web design, or custom software, we have got
              you covered.
            </p>
            <p className='text-sm sm:text-base text-gray-900'>
              Ready to get started?{' '}
              <span className='text-indigo-600 font-semibold hover:text-indigo-800 transition-all duration-300 hover:underline cursor-pointer'>
                Learn more about us
              </span>{' '}
              and discover how we can help you succeed.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

interface HomePageProps {
  carouselData: { data: CarouselItem[] }
  miniBanners: any[]
  featuredProducts: any[]
  settings: any
}

export default function HomePage({ carouselData, miniBanners, featuredProducts, settings }: HomePageProps) {
  const { cmsType, isCustomCms, isBuilderIO, isNoCms } = useCmsType()
  const { isLoaded } = useSettingStore()

  function parseBoolean(val: any) {
    if (typeof val === 'boolean') return val
    if (typeof val === 'string') return val === 'true' || val === '1'
    if (typeof val === 'number') return val === 1
    return Boolean(val)
  }

  // Use settings for counts, with fallback values
  const mainBannersCount = Number(settings.mainBanners) || 3
  const miniBannersCount = Number(settings.miniBanners) || 3
  const featuredProductsCount = Number(settings.featuredProducts) || 8
  const showCompanySection = parseBoolean(settings.showCompanySection)

  // Preload critical resources
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // Preload critical images for LCP
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmOGZhZmMiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlMmU4ZjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg=='
      document.head.appendChild(link)
    }
  }, [])

  // Don't block rendering - show skeletons for better Core Web Vitals

  return (
    <div className='min-h-screen bg-gray-50'>
        <main className='mx-auto max-w-[1920px] px-4 sm:px-6' style={{ contain: 'layout style paint' }}>
        {/* Hero Carousel - Proper desktop proportions */}
        <section className='relative pt-2 mb-4 sm:mb-6 lg:mb-8 px-0 sm:px-4' style={{ contain: 'layout' }}>
          <div className='h-[300px] sm:h-[450px] lg:h-[550px] xl:h-[600px] relative overflow-hidden rounded-lg sm:rounded-2xl bg-gray-50' style={{ 
            backfaceVisibility: 'hidden',
            willChange: 'auto'
          }}>
            {!isLoaded ? (
              <div className="absolute inset-0 flex items-center justify-center mobile-loading">
                {/* Optimized mobile-first skeleton */}
                <div className="text-center space-y-3 sm:space-y-6 px-4 sm:px-8">
                  <div className="mobile-skeleton">
                    <div className="h-6 sm:h-10 lg:h-14 bg-gray-300 rounded mx-auto w-48 sm:w-64 lg:w-80"></div>
                  </div>
                  <div className="mobile-skeleton">
                    <div className="h-4 sm:h-6 lg:h-7 bg-gray-200 rounded mx-auto w-56 sm:w-72 lg:w-96"></div>
                  </div>
                  <div className="mobile-skeleton">
                    <div className="h-8 sm:h-10 lg:h-12 bg-white/80 rounded-full mx-auto w-24 sm:w-32 lg:w-40 border shadow-md"></div>
                  </div>
                </div>
              </div>
            ) : isNoCms ? (
              <PremiumHeroCarouselPlaceholder />
            ) : isCustomCms ? (
              <CMSPlaceholder title="Custom CMS" message="Custom CMS will go here" />
            ) : isBuilderIO ? (
              <CMSPlaceholder title="Builder.IO" message="Builder.IO is coming soon" />
            ) : (
              <Suspense fallback={<div className="mobile-loading w-full h-96 bg-gray-50 rounded-2xl mobile-skeleton"></div>}>
                <HomeCarousel items={carouselData.data.slice(0, mainBannersCount)} />
              </Suspense>
            )}
          </div>
        </section>

        {/* Mini Banners - Viewport optimized */}
        <ErrorBoundary fallback={<MiniBannersSkeleton />}>
          <section className='mb-6 sm:mb-8 lg:mb-10 px-0 sm:px-4' style={{ contain: 'layout style paint' }}>
            <div>
              {!isLoaded ? (
                <div className="mobile-loading"><MiniBannersSkeleton /></div>
              ) : isNoCms ? (
                <Suspense fallback={<MiniBannersSkeleton />}>
                  <PremiumMiniBannersPlaceholder count={miniBannersCount} />
                </Suspense>
              ) : isCustomCms ? (
                <CMSPlaceholder title="Custom CMS Mini Banners" message="Custom CMS will go here" />
              ) : isBuilderIO ? (
                <CMSPlaceholder title="Builder.IO Mini Banners" message="Builder.IO is coming soon" />
              ) : (
                <Suspense fallback={<MiniBannersSkeleton />}>
                  <MiniBanners banners={miniBanners.slice(0, miniBannersCount)} />
                </Suspense>
              )}
            </div>
          </section>
        </ErrorBoundary>

        {/* Company Intro */}
        <ErrorBoundary fallback={<CompanyIntroSkeleton />}>
          <section className={`mb-6 sm:mb-8 lg:mb-10 px-0 sm:px-4 ${!isLoaded || !showCompanySection ? 'hidden' : ''}`}>
            <div className='rounded-2xl overflow-hidden'>
              {!isLoaded ? (
                <div className="mobile-loading"><CompanyIntroSkeleton /></div>
              ) : isNoCms ? (
                <PremiumCompanyIntroPlaceholder />
              ) : isCustomCms ? (
                <CMSPlaceholder title="Custom CMS Company Intro" message="Custom CMS will go here" />
              ) : isBuilderIO ? (
                <CMSPlaceholder title="Builder.IO Company Intro" message="Builder.IO is coming soon" />
              ) : (
                <Suspense fallback={<CompanyIntroSkeleton />}>
                  <CompanyIntro />
                </Suspense>
              )}
            </div>
          </section>
        </ErrorBoundary>

        {/* Featured Products - Performance optimized */}
        <ErrorBoundary fallback={<ProductSliderSkeleton />}>
          <section className='mb-6 sm:mb-8 lg:mb-10 px-0 sm:px-4' style={{ contain: 'layout style paint' }}>
            <div className='rounded-2xl' style={{ overflow: 'visible' }}>
              <Suspense fallback={<ProductSliderSkeleton />}>
                <FeaturedProductsSection featuredProducts={featuredProducts.slice(0, featuredProductsCount)} />
              </Suspense>
            </div>
          </section>
        </ErrorBoundary>

        {/* Brand Logos */}
        <ErrorBoundary fallback={<BrandLogosSkeleton />}>
          <section className='mb-6 sm:mb-8 lg:mb-10 pb-8 sm:pb-12 px-0 sm:px-4'>
            <div className='rounded-2xl overflow-hidden'>
              {!isLoaded ? (
                <div className="mobile-loading"><BrandLogosSkeleton /></div>
              ) : isNoCms ? (
                <PremiumBrandLogosPlaceholder />
              ) : isCustomCms ? (
                <CMSPlaceholder title="Custom CMS Brand Logos" message="Custom CMS will go here" />
              ) : isBuilderIO ? (
                <CMSPlaceholder title="Builder.IO Brand Logos" message="Builder.IO is coming soon" />
              ) : (
                <BrandLogoSlider />
              )}
            </div>
          </section>
        </ErrorBoundary>
      </main>
    </div>
  )
}

function ProductSliderSkeleton() {
  return (
    <div className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-50/30 py-6 sm:py-12 lg:py-16 px-2 sm:px-4 lg:px-8" style={{ isolation: 'isolate' }}>
      {/* Header skeleton - matches actual slider */}
      <div className="mb-6 sm:mb-8 lg:mb-12 text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gray-300 rounded-2xl mb-3 sm:mb-4 lg:mb-6 shadow-lg animate-pulse"></div>
        <div className="h-6 sm:h-8 lg:h-10 bg-gray-300 rounded mx-auto w-48 sm:w-64 lg:w-80 mb-2 sm:mb-3 lg:mb-4 animate-pulse"></div>
        <div className="h-4 sm:h-5 lg:h-6 bg-gray-200 rounded mx-auto w-56 sm:w-72 lg:w-96 mb-3 sm:mb-4 lg:mb-6 animate-pulse"></div>
        <div className="mx-auto w-20 h-1 rounded-full bg-gray-300 animate-pulse" />
      </div>
      {/* Product grid skeleton - matches actual layout */}
      <div className="relative group py-2 sm:py-4 lg:py-8 px-1 sm:px-2 lg:px-4 -mx-1 sm:-mx-2 lg:-mx-4">
        <div className="flex gap-2 sm:gap-4 lg:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-[0_0_calc(100%-1rem)] sm:flex-[0_0_calc(50%-1rem)] md:flex-[0_0_calc(33.333%-1rem)] lg:flex-[0_0_calc(25%-1rem)]">
              <ProductCardSkeleton view='grid' />
            </div>
          ))}
        </div>
        {/* Navigation arrows skeleton - matches actual position */}
        <div className="absolute left-0 sm:left-1 lg:left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-300 rounded-full animate-pulse shadow-xl z-30"></div>
        <div className="absolute right-0 sm:right-1 lg:right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-300 rounded-full animate-pulse shadow-xl z-30"></div>
      </div>
    </div>
  )
}