import ProductCardSkeleton from '@/components/skeletons/product-card-skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen w-full max-w-screen-2xl mx-auto px-4 py-8 flex flex-col gap-10 animate-pulse">
      {/* Hero Banner Skeleton */}
      <div className="w-full h-40 sm:h-56 md:h-72 bg-gradient-to-r from-gray-200 to-gray-100 rounded-2xl mb-8" />
      {/* Featured Products Skeleton */}
      <div>
        <div className="h-8 w-1/3 bg-gray-200 rounded mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <ProductCardSkeleton key={i} view="grid" />
          ))}
        </div>
      </div>
      {/* Brands/Banners Skeleton */}
      <div className="flex gap-4 mt-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 w-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  )
} 