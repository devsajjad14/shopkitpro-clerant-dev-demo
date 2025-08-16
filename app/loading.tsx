import FooterSkeleton from '@/components/skeletons/FooterSkeleton'

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 animate-pulse">
      {/* Header Skeleton */}
      <header className="w-full bg-white shadow-sm px-4 sm:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="h-10 w-32 bg-gray-200 rounded-lg" />
        {/* Nav Links */}
        <div className="hidden md:flex gap-6 flex-1 justify-center">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-6 w-20 bg-gray-200 rounded" />
          ))}
        </div>
        {/* Actions (cart/user) */}
        <div className="flex gap-4">
          <div className="h-10 w-10 bg-gray-200 rounded-full" />
          <div className="h-10 w-10 bg-gray-200 rounded-full" />
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Page Title Skeleton */}
        <div className="h-10 w-1/3 bg-gray-200 rounded mb-6" />
        {/* Card Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-xl" />
          ))}
        </div>
        {/* Section Skeleton */}
        <div className="h-8 w-1/4 bg-gray-200 rounded mt-12 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </main>

      {/* Footer Skeleton */}
      <FooterSkeleton />
    </div>
  )
}
