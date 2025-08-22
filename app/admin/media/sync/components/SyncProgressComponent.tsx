import { memo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiLoader } from 'react-icons/fi'
import LoadingFallback from './LoadingFallback'
import type { SyncDirection, SyncStatus, SyncProgress, SyncStats, CompletionData } from './types'

interface SyncProgressComponentProps {
  syncDirection: SyncDirection
  syncStatus: SyncStatus
  progress: SyncProgress
  stats: SyncStats | null
  completionData: CompletionData | null
  progressPercent: number
  onRetry: () => void
  onReset: () => void
}

const SyncProgressComponent = memo(({ 
  syncDirection, 
  syncStatus, 
  progress, 
  stats, 
  completionData, 
  progressPercent,
  onRetry, 
  onReset 
}: SyncProgressComponentProps) => {
  // Dynamic imports for heavy dependencies
  const [iconComponents, setIconComponents] = useState<any>(null)

  useEffect(() => {
    let mounted = true
    
    import('react-icons/fi').then((icons) => {
      if (mounted) {
        setIconComponents(icons)
      }
    })

    return () => {
      mounted = false
    }
  }, [])

  if (!iconComponents) {
    return <LoadingFallback />
  }

  const { FiUpload, FiDownload, FiCheck, FiAlertCircle, FiPlay } = iconComponents

  return (
    <motion.div
      key="progress"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-8 bg-gradient-to-r from-[#00437f] to-[#003366]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                {syncDirection === 'upload' ? (
                  <FiUpload className="w-8 h-8 text-white" />
                ) : (
                  <FiDownload className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {syncDirection === 'upload' ? 'Local Media → Vercel Blob' : 'Vercel Blob → Local Media'}
                </h2>
                <p className="text-white/80">
                  {syncStatus === 'analyzing' && 'Analyzing files...'}
                  {syncStatus === 'syncing' && `${progress.current}/${progress.total} files processed`}
                  {syncStatus === 'complete' && 'Sync completed successfully!'}
                  {syncStatus === 'error' && 'Sync failed - please try again'}
                </p>
              </div>
            </div>

            {syncStatus === 'syncing' && (
              <div className="text-right text-white">
                <div className="text-3xl font-bold">{progressPercent}%</div>
                <div className="text-sm opacity-80">Complete</div>
              </div>
            )}
          </div>
        </div>

        {/* Progress Content */}
        <div className="p-8">
          {syncStatus === 'analyzing' && (
            <div className="text-center py-12">
              <FiLoader className="w-12 h-12 text-[#00437f] animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Analyzing Files...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Scanning directories and preparing file list
              </p>
            </div>
          )}

          {syncStatus === 'syncing' && progress.total > 0 && (
            <div>
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Progress
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {progress.current} / {progress.total} files
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <motion.div
                    className="h-4 rounded-full bg-gradient-to-r from-[#00437f] to-[#003366]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Current File */}
              {progress.currentFile && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    {progress.action === 'skipped' ? (
                      <FiCheck className="w-4 h-4 text-yellow-600" />
                    ) : (
                      <FiPlay className="w-4 h-4 text-gray-500 animate-pulse" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {progress.action === 'skipped' ? 'Skipped' : 'Currently Processing'}
                        {progress.action === 'skipped' && progress.reason && (
                          <span className="text-yellow-600 dark:text-yellow-400 ml-2">
                            ({progress.reason})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded truncate">
                        {progress.currentFile}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-4 bg-[#00437f]/10 dark:bg-[#00437f]/20 rounded-lg border border-[#00437f]/20">
                    <div className="text-2xl font-bold text-[#00437f] dark:text-[#00437f]">
                      {stats.localFiles}
                    </div>
                    <div className="text-xs text-[#00437f] dark:text-[#00437f]">Local Files</div>
                  </div>
                  <div className="text-center p-4 bg-[#00437f]/10 dark:bg-[#00437f]/20 rounded-lg border border-[#00437f]/20">
                    <div className="text-2xl font-bold text-[#00437f] dark:text-[#00437f]">
                      {stats.vercelFiles}
                    </div>
                    <div className="text-xs text-[#00437f] dark:text-[#00437f]">Vercel Files</div>
                  </div>
                  <div className="text-center p-4 bg-[#00437f]/10 dark:bg-[#00437f]/20 rounded-lg border border-[#00437f]/20">
                    <div className="text-2xl font-bold text-[#00437f] dark:text-[#00437f]">
                      {syncDirection === 'upload' ? stats.toUpload : stats.toDownload}
                    </div>
                    <div className="text-xs text-[#00437f] dark:text-[#00437f]">
                      To {syncDirection === 'upload' ? 'Upload' : 'Download'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                      {progress.current}
                    </div>
                    <div className="text-xs text-gray-700 dark:text-gray-300">Processed</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {syncStatus === 'complete' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#00437f]/10 dark:bg-[#00437f]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="w-8 h-8 text-[#00437f] dark:text-[#00437f]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Sync Completed Successfully!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {completionData ? (
                  <>
                    {completionData.totalFiles} files have been {syncDirection === 'upload' ? 'uploaded to' : 'downloaded from'} Vercel Blob
                    {(completionData.skippedFiles || 0) > 0 && (
                      <span className="block mt-1">
                        {completionData.skippedFiles} files were skipped (already present)
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    {syncDirection === 'upload' ? (progress.uploaded || 0) : (progress.downloaded || 0)} files have been {syncDirection === 'upload' ? 'uploaded to' : 'downloaded from'} Vercel Blob
                    {(progress.skipped || 0) > 0 && (
                      <span className="block mt-1">
                        {progress.skipped} files were skipped (already present)
                      </span>
                    )}
                  </>
                )}
              </p>
              <button
                onClick={onReset}
                className="px-6 py-3 bg-gradient-to-r from-[#00437f] to-[#003366] text-white rounded-lg hover:from-[#003366] hover:to-[#002855] transition-all duration-300 font-medium"
              >
                Start New Sync
              </button>
            </div>
          )}

          {syncStatus === 'error' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Sync Failed
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                An error occurred during the sync process. Please try again.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={onReset}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={onRetry}
                  className="px-6 py-3 bg-gradient-to-r from-[#00437f] to-[#003366] text-white rounded-lg hover:from-[#003366] hover:to-[#002855] transition-all duration-300 font-medium"
                >
                  Retry Sync
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
})

SyncProgressComponent.displayName = 'SyncProgressComponent'

export default SyncProgressComponent