'use client'

import { motion } from 'framer-motion'

interface LoadingFallbackProps {
  height?: string
  message?: string
}

export function LoadingFallback({ height = 'h-32', message = 'Loading...' }: LoadingFallbackProps) {
  return (
    <div className={`flex items-center justify-center ${height} bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700`}>
      <div className="flex flex-col items-center space-y-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 border-2 border-[#00437f] border-t-transparent rounded-full"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{message}</p>
      </div>
    </div>
  )
}