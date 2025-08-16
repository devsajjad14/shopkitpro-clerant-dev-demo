import ProductCardSkeleton from '@/components/skeletons/product-card-skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen w-full max-w-screen-2xl mx-auto flex flex-col md:flex-row gap-0 md:gap-8 px-0 sm:px-4 py-4 md:py-8">
      {/* SideNav Skeleton */}
      <aside className="w-full md:w-64 flex-shrink-0 mb-6 md:mb-0 md:mr-0 order-1 md:order-none">
        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 h-fit w-full animate-pulse">
          <div className="h-8 w-1/2 bg-gray-200 rounded mb-4" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </aside>
      {/* Main Content Skeleton */}
      <main className="flex-1 order-2 md:order-none md:pl-8 px-4 sm:px-0">
        {/* Breadcrumbs/Header Skeleton */}
        <div className="mb-6 px-4 sm:px-0">
          <div className="h-6 w-1/3 bg-gray-200 rounded mb-4" />
        </div>
        {/* Filter Skeleton */}
        <div className="mb-6 flex gap-4">
          <div className="h-10 w-32 bg-gray-200 rounded" />
          <div className="h-10 w-32 bg-gray-200 rounded" />
          <div className="h-10 w-32 bg-gray-200 rounded" />
        </div>
        {/* Product Grid Skeleton */}
        <section aria-label="Product grid" className="w-full">
          <div className="grid gap-x-6 gap-y-8 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr items-stretch">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} view="grid" />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
} 