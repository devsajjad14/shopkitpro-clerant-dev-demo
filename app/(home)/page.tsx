// app/(home)/page.tsx
'use cache'
import { getCarouselData } from '@/lib/actions/home/carousel'
import { getMiniBanners } from '@/lib/actions/home/mini-banners'
import { getFeaturedProducts } from '@/lib/actions/home/featured-products'
import { getSettings } from '@/lib/actions/settings'
import HomePage from '@/components/home/HomePage'

export default async function HomePageServer() {
  // Fetch settings server-side
  const settings = await getSettings()

  // Use settings for counts, with fallback values
  const mainBannersCount = Number(settings.mainBanners) || 3
  const miniBannersCount = Number(settings.miniBanners) || 3
  const featuredProductsCount = Number(settings.featuredProducts) || 8

  // Always use local data for featured products 
  const featuredProducts = await getFeaturedProducts(featuredProductsCount)
  const [carouselData, miniBanners] = await Promise.all([
    getCarouselData(mainBannersCount),
    getMiniBanners(miniBannersCount),
  ])

  return (
    <HomePage 
      carouselData={carouselData}
      miniBanners={miniBanners}
      featuredProducts={featuredProducts}
      settings={settings}
    />
  )
}
