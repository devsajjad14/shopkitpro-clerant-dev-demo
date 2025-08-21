'use client'

import { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { FiFolder } from 'react-icons/fi'
import { Card } from '@/components/ui/card'
import ErrorBoundary from './ui/ErrorBoundary'

// Lazy load heavy tree components
const DirectoryTree = lazy(() => import('./DirectoryTree'))
const DirectoryStats = lazy(() => import('./DirectoryStats'))

export default function MediaDirectoryView() {
  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className='relative group'
      >
        <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
        <Card className='relative p-8 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl transition-all duration-300 group-hover:shadow-2xl'>
          
          {/* Header */}
          <div className='flex items-center gap-3 mb-8'>
            <div className='p-3 bg-gradient-to-r from-[#00437f] to-[#003366] rounded-xl shadow-md'>
              <FiFolder className='w-6 h-6 text-white' />
            </div>
            <div>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                Media Directory Structure
              </h2>
              <p className='text-gray-600 dark:text-gray-400'>
                Browse and manage your media files dynamically
              </p>
            </div>
          </div>

          {/* Directory Tree - Lazy loaded */}
          <Suspense fallback={
            <div className="space-y-4">
              <div className="w-full h-16 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
          }>
            <DirectoryTree />
          </Suspense>
          
          {/* Summary Stats - Lazy loaded */}
          <Suspense fallback={
            <div className="mt-8 space-y-3">
              <div className="w-48 h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          }>
            <DirectoryStats />
          </Suspense>
          
        </Card>
      </motion.div>
    </ErrorBoundary>
  )
}