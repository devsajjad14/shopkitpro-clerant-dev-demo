// components/product/ProductCardServerSide.tsx
import Image from 'next/image'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../ui/button'
import { Product } from '@/types/product-types'
import { urlFriendly } from '@/lib/utils/index'
import { addCacheBuster } from '@/lib/utils/image-utils'

interface ProductCardProps {
  product: Product
  viewMode?: 'grid' | 'list'
  priority?: boolean // Add priority prop
}

// Helper function to construct optimized image URL
const getOptimizedImageUrl = (url: string, width: number) => {
  if (!url) return ''
  // If already a full URL (Vercel Blob or remote), return as-is with cache-busting
  if (url.startsWith('http')) {
    return addCacheBuster(url)
  }
  // Otherwise, assume it's a local file and already mapped correctly
  return url
}

// Responsive image sizes configuration
const getImageSizes = () => {
  return '(max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 300px'
}

export default function ProductCardServerSide({
  product,
  viewMode = 'grid',
  priority = false, // Default to false
}: ProductCardProps) {
  return (
    <Card
      className={`p-0 flex ${
        viewMode === 'list' ? 'flex-row items-center' : 'flex-col'
      } justify-between overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 m-0 h-full`}
    >
      <Link
        href={`/product/id/${product.STYLE_ID}/name${urlFriendly(
          product.NAME
        )}`}
        prefetch={false}
        className={`group ${
          viewMode === 'list' ? 'w-1/4 min-w-[200px]' : 'w-full'
        }`}
      >
        <CardHeader className='p-0 relative bg-transparent border-none shadow-none'>
          {/* Minimalist Premium Image Container */}
          <div
            className={`relative ${viewMode === 'list' ? 'aspect-square min-w-[120px] max-w-[180px]' : 'aspect-[4/5]'} w-full max-w-[220px] mx-auto overflow-hidden flex justify-center bg-transparent rounded-xl transition-all duration-300 group-hover:scale-105 pt-7 pb-2`}
          >
            <Image
              src={getOptimizedImageUrl(
                product.MEDIUMPICTURE,
                viewMode === 'list' ? 400 : 600
              )}
              alt={product.NAME}
              width={viewMode === 'list' ? 400 : 600}
              height={viewMode === 'list' ? 400 : 600}
              sizes={getImageSizes()}
              className='object-contain rounded-xl transition-transform duration-300'
              quality={85}
              priority={priority} // Pass priority prop
            />
            {/* Subtle shimmer effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute -left-1/3 top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer rounded-xl" />
            </div>
          </div>
        </CardHeader>
      </Link>

      <div
        className={`flex ${
          viewMode === 'list' ? 'flex-1 flex-col justify-between' : 'flex-col'
        } gap-2`}
      >
        <CardContent
          className={`flex flex-col gap-2 ${
            viewMode === 'list' ? 'p-2' : 'p-4 sm:p-6'
          }`}
        >
          <CardTitle
            className={`${
              viewMode === 'list' ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
            } font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-300 line-clamp-2`}
          >
            {product.NAME}
          </CardTitle>

          {product.SELLING_PRICE < product.REGULAR_PRICE ? (
            <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
              <p
                className={`${
                  viewMode === 'list'
                    ? 'text-xl sm:text-2xl'
                    : 'text-lg sm:text-xl'
                } font-bold text-red-500`}
              >
                ${product.SELLING_PRICE.toFixed(2)}
              </p>
              <p
                className={`${
                  viewMode === 'list'
                    ? 'text-base sm:text-lg'
                    : 'text-sm sm:text-base'
                } font-medium line-through text-gray-700`}
              >
                ${product.REGULAR_PRICE.toFixed(2)}
              </p>
            </div>
          ) : (
            <p
              className={`${
                viewMode === 'list'
                  ? 'text-xl sm:text-2xl'
                  : 'text-lg sm:text-xl'
              } font-bold text-gray-800`}
            >
              ${product.REGULAR_PRICE.toFixed(2)}
            </p>
          )}

          <CardDescription
            className={`${
              viewMode === 'list'
                ? 'text-base sm:text-lg'
                : 'text-sm sm:text-base'
            } text-gray-800 line-clamp-2`}
          >
            {product.BRAND}
          </CardDescription>

          {/* Add category display */}
          {product.DEPT && (
            <div className='flex items-center gap-1'>
              <span className='text-xs text-gray-800 font-medium'>
                Category:
              </span>
              <span className='text-xs text-blue-700 font-medium'>
                {product.DEPT}
              </span>
            </div>
          )}
        </CardContent>

        <CardFooter
          className={`${
            viewMode === 'list' ? 'p-6' : 'p-4 sm:p-6'
          } bg-gray-50 ${viewMode === 'list' ? '' : 'rounded-b-lg'}`}
        >
          <Link
            href={`/product/id/${product.STYLE_ID}/name${urlFriendly(
              product.NAME
            )}`}
            className='w-full'
            prefetch={false}
          >
            <Button
              className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl ${
                viewMode === 'list'
                  ? 'text-base sm:text-lg py-6'
                  : 'text-sm sm:text-base'
              }`}
              aria-label={`View details for ${product.NAME}`}
            >
              <span>VIEW DETAIL</span>
              <ArrowRight
                className={`${
                  viewMode === 'list'
                    ? 'w-5 h-5 sm:w-6 sm:h-6'
                    : 'w-4 h-4 sm:w-5 sm:h-5'
                }`}
              />
            </Button>
          </Link>
        </CardFooter>
      </div>
    </Card>
  )
}
