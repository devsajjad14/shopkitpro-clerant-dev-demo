'use client'

import { useState, memo } from 'react'
import { motion } from 'framer-motion'
import { FiFolder, FiChevronRight, FiRefreshCw } from 'react-icons/fi'
import FolderItem from './FolderItem'
import LoadingSpinner from './ui/LoadingSpinner'
import ErrorBoundary from './ui/ErrorBoundary'
import { useDirectoryData } from '../hooks/useDirectoryData'

const DirectoryTree = memo(function DirectoryTree() {
  const { 
    directories, 
    loading, 
    error, 
    toggleDirectory, 
    refreshDirectory,
    reload,
    forceRefresh 
  } = useDirectoryData()
  
  const [rootExpanded, setRootExpanded] = useState(true)

  const totalFiles = directories.reduce((sum, dir) => sum + dir.fileCount, 0)

  if (error) {
    return (
      <ErrorBoundary onReset={forceRefresh}>
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <button 
            onClick={forceRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            Force Retry (Clear Cache)
          </button>
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary onReset={forceRefresh}>
      <div className="space-y-2">
        {/* Root Media Folder */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div 
            className="flex items-center gap-3 p-4 hover:bg-white/70 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
            onClick={() => setRootExpanded(!rootExpanded)}
          >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: rootExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-gray-600 dark:text-gray-400"
          >
            <FiChevronRight className="w-4 h-4" />
          </motion.div>
          <FiFolder className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900 dark:text-white">📁 media/</span>
              <div className="flex items-center gap-4">
                {loading && <LoadingSpinner size="sm" />}
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    forceRefresh()
                  }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  title="Force refresh directories (clears cache)"
                >
                  <FiRefreshCw className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
                <span className="text-sm bg-[#00437f]/10 text-[#00437f] dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full">
                  {directories.length} folders
                </span>
                <span className="text-sm bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                  {totalFiles.toLocaleString()} files
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Root media directory</p>
          </div>
        </div>

        {/* Subdirectories */}
        {rootExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pl-6 pb-4 space-y-1"
          >
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading directories...</span>
              </div>
            ) : directories.length > 0 ? (
              directories.map((directory) => (
                <FolderItem
                  key={directory.id}
                  directory={directory}
                  onToggle={toggleDirectory}
                  onRefresh={refreshDirectory}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No directories found
              </div>
            )}
          </motion.div>
        )}
        </div>
      </div>
    </ErrorBoundary>
  )
})

export default DirectoryTree