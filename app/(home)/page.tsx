// app/(home)/page.tsx
'use cache'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { getCarouselData } from '@/lib/actions/home/carousel'
import { getMiniBanners } from '@/lib/actions/home/mini-banners'
import ErrorBoundary from '@/components/error-boundary/error-boundary'
import { MiniBannersSkeleton } from '@/components/skeletons/mini-banners-skeleton'
import { HomeCarouselSkeleton } from '@/components/skeletons/carousel-skeleton'
import HomeCarousel from '@/components/home/home-carousel'
import { ProductCardSkeleton } from '@/components/skeletons/product-card-skeleton'
import { CompanyIntroSkeleton } from '@/components/skeletons/company-intro-skeleton'
import { BrandLogosSkeleton } from '@/components/skeletons/brand-logos-skeleton'
// Removed getBrands import - now using static placeholders
import { getFeaturedProducts } from '@/lib/actions/home/featured-products'
import { getSettings } from '@/lib/actions/settings'

// Dynamic imports with proper error handling
const MiniBanners = dynamic(() => import('@/components/home/mini-banners'), {
  loading: () => <MiniBannersSkeleton />,
})

const FeaturedProductsSection = dynamic(
  () => import('@/components/product/FeaturedProductsSection'),
  {
    loading: () => <ProductSliderSkeleton />,
  }
)

const CompanyIntro = dynamic(() => import('@/components/home/company-intro'), {
  loading: () => <CompanyIntroSkeleton />,
})

const BrandLogoSlider = dynamic(() => import('@/components/home/brand-logos'), {
  loading: () => <BrandLogosSkeleton />,
})

function parseBoolean(val: any) {
  if (typeof val === 'boolean') return val
  if (typeof val === 'string') return val === 'true' || val === '1'
  if (typeof val === 'number') return val === 1
  return Boolean(val)
}

export default async function HomePage() {
  // Fetch settings server-side
  const settings = await getSettings()

  // Use settings for counts, with fallback values
  const mainBannersCount = Number(settings.mainBanners) || 3
  const miniBannersCount = Number(settings.miniBanners) || 3
  const featuredProductsCount = Number(settings.featuredProducts) || 8
  const brandLogosCount = Number(settings.brandLogos) || 6
  const showCompanySection = parseBoolean(settings.showCompanySection)

  // Always use local data for featured products 
  const featuredProducts = await getFeaturedProducts(featuredProductsCount)
  const [carouselData, miniBanners] = await Promise.all([
    getCarouselData(mainBannersCount),
    getMiniBanners(miniBannersCount),
  ])

  return (
    <div className='min-h-screen bg-gray-50'>
      <main className='mx-auto max-w-[1920px] px-4 sm:px-6'>
        {/* Hero Carousel */}
        <section className='relative pt-2 mb-8 px-0 sm:px-4'>
          <div className='rounded-2xl overflow-hidden'>
            <Suspense fallback={<HomeCarouselSkeleton />}>
              <HomeCarousel items={carouselData.data.slice(0, mainBannersCount)} />
            </Suspense>
          </div>
        </section>

        {/* Mini Banners */}
        <ErrorBoundary fallback={<MiniBannersSkeleton />}>
          <section className='mt-2 mb-8 px-0 sm:px-4'>
            <MiniBanners banners={miniBanners.slice(0, miniBannersCount)} />
          </section>
        </ErrorBoundary>

        {/* Company Intro */}
        <ErrorBoundary fallback={<div>Failed to load company intro.</div>}>
          <section className={`mt-8 mb-8 px-0 sm:px-4 ${!showCompanySection ? 'hidden' : ''}`}>
            <div className='rounded-2xl overflow-hidden'>
              <Suspense fallback={<CompanyIntroSkeleton />}>
                <CompanyIntro />
              </Suspense>
            </div>
          </section>
        </ErrorBoundary>

        {/* Featured Products */}
        <ErrorBoundary fallback={<ProductSliderSkeleton />}>
          <section className='mt-8 mb-8 px-0 sm:px-4'>
            <div className='rounded-2xl overflow-hidden'>
              <FeaturedProductsSection featuredProducts={featuredProducts} />
            </div>
          </section>
        </ErrorBoundary>

        {/* Brand Logos */}
        <ErrorBoundary fallback={<div>Failed to load brand logos.</div>}>
          <section className='mt-8 pb-12 px-0 sm:px-4'>
            <div className='rounded-2xl overflow-hidden'>
              <BrandLogoSlider />
            </div>
          </section>
        </ErrorBoundary>
      </main>
    </div>
  )
}

function ProductSliderSkeleton() {
  return (
    <div className='w-full py-8'>
      <h2 className='text-3xl font-bold mb-6'>Featured Products</h2>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} view='grid' />
        ))}
      </div>
    </div>
  )
}
