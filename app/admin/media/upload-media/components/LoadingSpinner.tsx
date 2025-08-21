'use client'

import { memo } from 'react'

// Lightweight loading spinner - memoized to prevent re-renders
const LoadingSpinner = memo(function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-6" role="status" aria-label="Loading">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 border-3 border-[#00437f]/20 rounded-full"></div>
        <div className="absolute inset-0 border-3 border-t-[#00437f] rounded-full animate-spin"></div>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  )
})

export default LoadingSpinner