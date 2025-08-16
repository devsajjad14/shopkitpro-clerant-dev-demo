export default function Loading() {
  return (
    <div className="min-h-screen w-full max-w-screen-lg mx-auto px-4 py-8 animate-pulse">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Image Skeleton */}
        <div className="w-full md:w-1/2 flex justify-center items-center">
          <div className="w-full h-80 sm:h-96 bg-gray-200 rounded-2xl" />
        </div>
        {/* Info Skeleton */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="h-8 w-2/3 bg-gray-200 rounded" />
          <div className="h-6 w-1/3 bg-gray-200 rounded" />
          <div className="h-10 w-1/2 bg-gray-200 rounded" />
          <div className="h-4 w-1/2 bg-gray-200 rounded mt-4" />
          <div className="h-4 w-1/3 bg-gray-200 rounded" />
          <div className="h-4 w-1/4 bg-gray-200 rounded" />
          <div className="h-12 w-40 bg-gray-200 rounded-lg mt-8" />
        </div>
      </div>
      {/* Description Skeleton */}
      <div className="mt-12 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-4 w-full bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  )
} 