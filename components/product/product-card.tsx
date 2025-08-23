// components/product/ProductCard.tsx
import Image from 'next/image'
import React from 'react'
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

interface ProductCardProps {
  product: Product
  priority?: boolean
}

// Optimized image loader with device-specific sizes
const alumnihallLoader = ({
  src,
  width,
  quality = 75,
}: {
  src: string
  width: number
  quality?: number
}) => {
  if (src.startsWith('http')) return src // Use DB/remote URL as-is
  const url = new URL(src, 'https://www.alumnihall.com/prodimages/')
  const filename = url.pathname.split('/').pop() || ''
  const optimizedQuality = Math.min(quality, 80)
  return `https://www.alumnihall.com/prodimages/${filename}?w=${width}&q=${optimizedQuality}`
}

// Responsive image sizes configuration
const getImageSizes = () => {
  return '(max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 300px'
}

const ProductCard = React.memo(({ product, priority = false }: ProductCardProps) => {
  return (
    <Card
      key={product.STYLE_ID}
      className='p-0 flex flex-col justify-between overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl bg-white border border-gray-200 group/card cursor-pointer'
    >
      <Link
        href={`/product/id/${product.STYLE_ID}/name/${urlFriendly(
          product.NAME
        )}`}
        prefetch={false}
      >
        <CardHeader className='p-0 relative bg-transparent border-none shadow-none'>
          {/* Minimalist Premium Image Container */}
          <div className="relative aspect-[4/5] w-full max-w-[220px] mx-auto overflow-hidden flex items-center justify-center bg-gray-100 rounded-xl transition-all duration-500 group-hover/card:scale-105">
            <Image
              loader={alumnihallLoader}
              src={product.MEDIUMPICTURE}
              alt={product.NAME}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 220px"
              className="object-contain rounded-xl p-3 transition-transform duration-300"
              quality={priority ? 85 : 75}
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
              decoding='async'
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyEH4QTgZHfv/Z"
              unoptimized={process.env.NODE_ENV !== 'production'}
            />
            {/* Subtle shimmer effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute -left-1/3 top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer rounded-xl" />
            </div>
          </div>
        </CardHeader>
      </Link>

      <CardContent className='flex flex-col gap-3 p-5 sm:p-7'>
        <CardTitle
          className='text-lg sm:text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-300 line-clamp-2'
          style={{ minHeight: '3em' }}
        >
          {product.NAME}
        </CardTitle>
        {product.SELLING_PRICE < product.REGULAR_PRICE ? (
          <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
            <p className='text-lg sm:text-xl font-bold text-red-500'>
              ${product.SELLING_PRICE}
            </p>
            <p className='text-sm sm:text-base font-medium line-through text-gray-400'>
              ${product.REGULAR_PRICE}
            </p>
          </div>
        ) : (
          <p className='text-lg sm:text-xl font-bold text-gray-800'>
            ${product.REGULAR_PRICE}
          </p>
        )}
        <CardDescription className='text-sm sm:text-base text-gray-600 line-clamp-2'>
          {product.BRAND}
        </CardDescription>
      </CardContent>

      <CardFooter className='p-5 sm:p-7 bg-gray-50 rounded-b-2xl'>
        <Link
          href={`/product/id/${product.STYLE_ID}/name${urlFriendly(
            product.NAME
          )}`}
          className='w-full'
        >
          <Button className='w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl text-base font-semibold rounded-full py-3'>
            <span>VIEW DETAIL</span>
            <ArrowRight className='w-4 h-4 sm:w-5 sm:h-5' />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
})

ProductCard.displayName = 'ProductCard'

export default ProductCard
