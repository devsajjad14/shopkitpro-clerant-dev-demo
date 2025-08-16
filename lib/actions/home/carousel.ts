import { unstable_cache as cache } from 'next/cache'

type CarouselItem = {
  title: string
  url: string
  image: string
  buttonCaption: string
}

type CarouselResponse = {
  success: boolean
  data: CarouselItem[]
}

async function fetchCarouselData(count: number): Promise<CarouselResponse> {
  try {
    // In production: Replace with actual DB/API call
    const carouselData: CarouselItem[] = [
      {
        title: 'FOOTWEAR COLLECTION',
        url: '#',
        image: '/images/main-banners/main1.webp',
        buttonCaption: 'Shop Now',
      },
      {
        title: 'FIREARMS COLLECTION',
        url: '#',
        image: '/images/main-banners/main2.webp',
        buttonCaption: 'Check Them Out',
      },
      {
        title: 'APPAREL COLLECTION',
        url: '#',
        image: '/images/main-banners/main3.webp',
        buttonCaption: 'Explore Now',
      },
    ]

    return { success: true, data: carouselData.slice(0, count) }
  } catch (error) {
    console.error('Error fetching carousel data:', error)
    return { success: false, data: [] }
  }
}

export const getCarouselData = cache(
  (count: number) => fetchCarouselData(count),
  (count: number) => ['home-carousel-data', String(count)],
  {
    tags: ['carousel'],
    revalidate: 3600 * 24 * 7, // 1 hour
  }
)
