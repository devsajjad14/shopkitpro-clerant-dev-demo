'use client'

import { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { FiFolder, FiServer, FiCloud } from 'react-icons/fi'
import { Card } from '@/components/ui/card'
import ErrorBoundary from './ui/ErrorBoundary'
import useSettingStore from '@/hooks/use-setting-store'

// Lazy load heavy tree components
const DirectoryTree = lazy(() => import('./DirectoryTree'))

export default function MediaDirectoryView() {
  // Get platform from global settings store
  const platform = useSettingStore((state) => state.getPlatform())
  const isLoaded = useSettingStore((state) => state.isLoaded)
  const settings = useSettingStore((state) => state.settings)
  
  console.log('🔍 [MediaDirectoryView] Platform from settings:', platform, 'isLoaded:', isLoaded)
  console.log('🔍 [MediaDirectoryView] Full settings:', settings)

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
          <div className='flex items-center justify-between mb-8'>
            <div className='flex items-center gap-3'>
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
            
            {/* Platform Mode Indicator */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-lg border border-white/20 dark:border-gray-700/50 shadow-md">
              {isLoaded ? (
                <>
                  {platform === 'vercel' ? (
                    <FiCloud className="w-4 h-4 text-blue-600" />
                  ) : (
                    <FiServer className="w-4 h-4 text-[#00437f]" />
                  )}
                  <div className="text-center">
                    <div className="text-xs font-semibold text-gray-900 dark:text-white">
                      {platform === 'vercel' ? 'Vercel' : 'Server'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Platform</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 bg-gray-400 rounded-full animate-pulse" />
                  <div className="text-center">
                    <div className="text-xs font-semibold text-gray-900 dark:text-white">Loading...</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Platform</div>
                  </div>
                </>
              )}
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
          
          
        </Card>
      </motion.div>
    </ErrorBoundary>
  )
}