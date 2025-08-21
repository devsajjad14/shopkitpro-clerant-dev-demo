'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { useDirectoryData } from '../hooks/useDirectoryData'
import { formatFileSize } from '../utils'
import LoadingSpinner from './ui/LoadingSpinner'
import ErrorBoundary from './ui/ErrorBoundary'

const StatCard = memo(function StatCard({ 
  value, 
  label, 
  gradientFrom, 
  gradientTo, 
  textColor,
  delay = 0
}: {
  value: string | number
  label: string
  gradientFrom: string
  gradientTo: string
  textColor: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`p-4 bg-gradient-to-r ${gradientFrom} ${gradientTo} backdrop-blur-sm rounded-xl border border-opacity-50 hover:scale-105 transition-transform duration-200`}
    >
      <div className={`text-2xl font-bold ${textColor} mb-1`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className={`text-sm ${textColor.replace('700', '600').replace('400', '300')}`}>
        {label}
      </div>
    </motion.div>
  )
})

const DirectoryStats = memo(function DirectoryStats() {
  const { stats, loading, error } = useDirectoryData()

  if (loading) {
    return (
      <div className="mt-8 flex items-center justify-center py-8">
        <LoadingSpinner size="md" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading statistics...</span>
      </div>
    )
  }

  if (error || !stats) {
    return null
  }

  // Get top file types
  const topFileTypes = Object.entries(stats.filesByType)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  return (
    <ErrorBoundary>
      <div className="mt-8 space-y-6">
        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            value={stats.totalFiles}
            label="Total Files"
            gradientFrom="from-blue-50/70"
            gradientTo="to-indigo-50/70 dark:from-blue-900/20 dark:to-indigo-900/20"
            textColor="text-blue-700 dark:text-blue-400"
            delay={0.1}
          />
          
          <StatCard
            value={stats.totalFolders}
            label="Categories"
            gradientFrom="from-purple-50/70"
            gradientTo="to-pink-50/70 dark:from-purple-900/20 dark:to-pink-900/20"
            textColor="text-purple-700 dark:text-purple-400"
            delay={0.2}
          />

          <StatCard
            value={formatFileSize(stats.totalSize)}
            label="Total Size"
            gradientFrom="from-green-50/70"
            gradientTo="to-emerald-50/70 dark:from-green-900/20 dark:to-emerald-900/20"
            textColor="text-green-700 dark:text-green-400"
            delay={0.3}
          />
        </div>

        {/* File Type Breakdown */}
        {topFileTypes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="p-4 bg-gradient-to-r from-gray-50/70 to-slate-50/70 dark:from-gray-800/20 dark:to-slate-800/20 backdrop-blur-sm rounded-xl border border-opacity-50"
          >
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              File Types
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {topFileTypes.map(([type, count], index) => (
                <div key={type} className="text-center">
                  <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {count}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 uppercase">
                    {type}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </ErrorBoundary>
  )
})

export default DirectoryStats