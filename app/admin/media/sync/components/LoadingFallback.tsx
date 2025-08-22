import { memo } from 'react'
import { FiLoader } from 'react-icons/fi'

const LoadingFallback = memo(() => (
  <div className="flex items-center justify-center py-8">
    <FiLoader className="w-8 h-8 animate-spin text-[#00437f] mr-3" />
    <span className="text-gray-600 dark:text-gray-400">Loading...</span>
  </div>
))

LoadingFallback.displayName = 'LoadingFallback'

export default LoadingFallback