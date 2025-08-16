import { unstable_cache as cache } from 'next/cache'

type MiniBanner = {
  title: string
  imgSrc: string
  url: string
}

async function fetchMiniBanners(count: number): Promise<MiniBanner[]> {
  // Dummy data (replace this with your actual database/API call)
  const banners: MiniBanner[] = [
    {
      title: 'Handguns',
      imgSrc: '/images/mini-banners/mini1.webp',
      url: '/c/firearms-handguns',
    },
    {
      title: 'Ammunition',
      imgSrc: '/images/mini-banners/mini2.webp',
      url: '/c/ammunition',
    },
    {
      title: 'Firearms Accessories',
      imgSrc: '/images/mini-banners/mini3.webp',
      url: '/c/firearms-accessories',
    },
  ]

  return banners.slice(0, count)
}

export const getMiniBanners = cache(
  (count: number) => fetchMiniBanners(count),
  (count: number) => ['mini-banners', String(count)],
  {
    tags: ['mini-banners'],
    revalidate: 3600 * 24 * 7, // Cache for 1 hour
  }
)
