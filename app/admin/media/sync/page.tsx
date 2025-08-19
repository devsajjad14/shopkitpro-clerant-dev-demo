'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import motion components to avoid SSR issues
const motion = dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion })), {
  ssr: false
})
const AnimatePresence = dynamic(() => import('framer-motion').then(mod => ({ default: mod.AnimatePresence })), {
  ssr: false
})
import { 
  FiUpload, 
  FiDownload, 
  FiRefreshCw, 
  FiCloud, 
  FiHardDrive, 
  FiArrowRight, 
  FiArrowLeft,
  FiLoader,
  FiCheck,
  FiAlertCircle,
  FiFolder,
  FiImage,
  FiPlay
} from 'react-icons/fi'
import { toast } from 'sonner'
// import { DeploymentOverlay } from '@/components/ui/deployment-overlay'
const DeploymentOverlay = dynamic(() => import('@/components/ui/deployment-overlay').then(mod => ({ default: mod.DeploymentOverlay })), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">Loading...</div>
})

type SyncDirection = 'upload' | 'download' | null
type SyncStatus = 'idle' | 'analyzing' | 'syncing' | 'complete' | 'error'

interface SyncProgress {
  current: number
  total: number
  currentFile?: string
  phase?: string
  uploaded?: number
  downloaded?: number
  skipped?: number
  action?: 'uploading' | 'downloading' | 'skipped'
  reason?: string
}

function SyncMediaPageContent() {
  const [syncDirection, setSyncDirection] = useState<SyncDirection>(null)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [progress, setProgress] = useState<SyncProgress>({ current: 0, total: 0 })
  const [stats, setStats] = useState<{
    localFiles: number
    vercelFiles: number
    toUpload: number
    toDownload: number
  } | null>(null)
  const [completionData, setCompletionData] = useState<{
    totalFiles: number
    skippedFiles?: number
    processedFiles?: number
  } | null>(null)

  const startSync = async (direction: SyncDirection) => {
    if (!direction || syncStatus === 'syncing') return

    setSyncDirection(direction)
    setSyncStatus('analyzing')
    setProgress({ current: 0, total: 0 })
    
    const actionText = direction === 'upload' ? 'Local Media → Vercel Blob' : 'Vercel Blob → Local Media'
    toast.loading(`${actionText}...`, { id: 'sync-media' })

    try {
      const endpoint = direction === 'upload' 
        ? '/api/admin/media/upload-to-vercel'
        : '/api/admin/media/download-from-vercel'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      setSyncStatus('syncing')
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      
      if (!reader) {
        throw new Error('No response body')
      }

      console.log(`🔍 Starting ${direction} sync...`)

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line)
              
              if (data.type === 'progress') {
                console.log('📊 Progress update:', data)
                setProgress({
                  current: data.current,
                  total: data.total,
                  currentFile: data.currentFile,
                  phase: data.phase,
                  uploaded: data.uploaded,
                  downloaded: data.downloaded,
                  skipped: data.skipped,
                  action: data.action,
                  reason: data.reason
                })
              } else if (data.type === 'stats') {
                setStats(data.stats)
              } else if (data.type === 'complete') {
                console.log('🎉 Completion data:', data)
                setSyncStatus('complete')
                setCompletionData({
                  totalFiles: data.totalFiles || 0,
                  skippedFiles: data.skippedFiles || 0,
                  processedFiles: data.processedFiles || 0
                })
                const skipMessage = data.skippedFiles > 0 ? `, ${data.skippedFiles} skipped` : ''
                toast.success(`✅ ${actionText} completed! ${data.totalFiles} files processed${skipMessage}`, {
                  id: 'sync-media',
                  duration: 5000
                })
              } else if (data.type === 'error') {
                throw new Error(data.message)
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }

    } catch (error) {
      console.error('❌ Sync failed:', error)
      setSyncStatus('error')
      toast.error(`Failed to sync: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        id: 'sync-media',
        duration: 5000
      })
    }
  }

  const resetSync = () => {
    setSyncDirection(null)
    setSyncStatus('idle')
    setProgress({ current: 0, total: 0 })
    setStats(null)
    setCompletionData(null)
  }

  const progressPercent = progress.total > 0 
    ? Math.round((progress.current / progress.total) * 100)
    : 0

  return (
    <DeploymentOverlay
      restrictedOnVercel={true}
      restrictedOnServer={false}
      restrictionTitle="Media Sync Restricted"
      restrictionMessage="Server-to-cloud media synchronization requires file system access and is not available on Vercel deployments. This feature is designed for server or VPS environments where resources can be synced between local storage and cloud storage."
      allowDismiss={false}
      className="min-h-screen"
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-3">
          <div className="relative">
            <div className="p-3 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl shadow-lg">
              <FiRefreshCw className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#00437f] rounded-full border-2 border-white shadow-sm animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-[#00437f] to-[#003366] dark:from-white dark:via-[#00437f] dark:to-[#003366] bg-clip-text text-transparent">
              Media Sync Center
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Bidirectional media synchronization between local storage and Vercel Blob
            </p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {syncDirection === null ? (
          /* Selection Interface */
          <motion.div
            key="selection"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-6xl mx-auto"
          >
            {/* Sync Options */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Upload Option */}
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startSync('upload')}
                className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 group-hover:from-[#00437f]/10 group-hover:to-[#00437f]/10 transition-all duration-500"></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <FiUpload className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Local Media → Vercel Blob</h3>
                      <p className="text-gray-500 dark:text-gray-400">Upload to Cloud</p>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    Upload all media files from your local <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">client/media</code> directory to Vercel Blob storage, preserving folder structure.
                  </p>

                  {/* Flow Button */}
                  <button
                    onClick={() => startSync('upload')}
                    className="flex items-center justify-center gap-4 mb-6 p-4 bg-[#00437f] hover:bg-[#003366] rounded-lg transition-all duration-300 transform hover:scale-105 w-full group"
                  >
                    <div className="flex items-center gap-2">
                      <FiHardDrive className="w-5 h-5 text-white" />
                      <span className="text-sm font-medium text-white">Local Media</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <FiArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform duration-300" />
                      <span className="text-xs text-white font-medium">Upload</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiCloud className="w-5 h-5 text-white" />
                      <span className="text-sm font-medium text-white">Vercel Blob</span>
                    </div>
                  </button>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: FiFolder, text: "Preserves Structure" },
                      { icon: FiImage, text: "All Media Types" },
                      { icon: FiCheck, text: "Batch Upload" },
                      { icon: FiRefreshCw, text: "Progress Tracking" }
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <feature.icon className="w-4 h-4 text-[#00437f]" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Download Option */}
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startSync('download')}
                className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 group-hover:from-[#00437f]/10 group-hover:to-[#00437f]/10 transition-all duration-500"></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <FiDownload className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Vercel Blob → Local Media</h3>
                      <p className="text-gray-500 dark:text-gray-400">Download to Local</p>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    Download all media files from Vercel Blob storage to your local <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">client/media</code> directory, excluding Data-Db folder.
                  </p>

                  {/* Flow Button */}
                  <button
                    onClick={() => startSync('download')}
                    className="flex items-center justify-center gap-4 mb-6 p-4 bg-[#00437f] hover:bg-[#003366] rounded-lg transition-all duration-300 transform hover:scale-105 w-full group"
                  >
                    <div className="flex items-center gap-2">
                      <FiCloud className="w-5 h-5 text-white" />
                      <span className="text-sm font-medium text-white">Vercel Blob</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <FiArrowLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform duration-300" />
                      <span className="text-xs text-white font-medium">Download</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiHardDrive className="w-5 h-5 text-white" />
                      <span className="text-sm font-medium text-white">Local Media</span>
                    </div>
                  </button>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: FiFolder, text: "Preserves Structure" },
                      { icon: FiImage, text: "All Media Types" },
                      { icon: FiCheck, text: "Smart Filtering" },
                      { icon: FiRefreshCw, text: "Progress Tracking" }
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <feature.icon className="w-4 h-4 text-[#00437f]" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="p-3 bg-[#00437f]/10 dark:bg-[#00437f]/20 rounded-lg w-fit mb-4">
                  <FiRefreshCw className="w-6 h-6 text-[#00437f] dark:text-[#00437f]" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Bidirectional Sync</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Keep your local and cloud media in perfect sync with real-time progress tracking.</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="p-3 bg-[#00437f]/10 dark:bg-[#00437f]/20 rounded-lg w-fit mb-4">
                  <FiFolder className="w-6 h-6 text-[#00437f] dark:text-[#00437f]" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Structure Preservation</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Maintains exact folder hierarchy and file organization across platforms.</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="p-3 bg-[#00437f]/10 dark:bg-[#00437f]/20 rounded-lg w-fit mb-4">
                  <FiCheck className="w-6 h-6 text-[#00437f] dark:text-[#00437f]" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Smart Processing</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Intelligent filtering and error handling ensure reliable media synchronization.</p>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Sync Progress Interface */
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

                    {/* Sync Progress Breakdown */}
                    {(progress.uploaded !== undefined || progress.downloaded !== undefined || progress.skipped !== undefined) && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-[#00437f]/10 dark:bg-[#00437f]/20 rounded-lg border border-[#00437f]/20">
                          <div className="text-2xl font-bold text-[#00437f] dark:text-[#00437f]">
                            {syncDirection === 'upload' ? (progress.uploaded || 0) : (progress.downloaded || 0)}
                          </div>
                          <div className="text-xs text-[#00437f] dark:text-[#00437f]">
                            {syncDirection === 'upload' ? 'Uploaded' : 'Downloaded'}
                          </div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {progress.skipped || 0}
                          </div>
                          <div className="text-xs text-yellow-700 dark:text-yellow-300">Skipped</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                            {progress.total - progress.current}
                          </div>
                          <div className="text-xs text-gray-700 dark:text-gray-300">Remaining</div>
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
                      onClick={resetSync}
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
                        onClick={resetSync}
                        className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => startSync(syncDirection)}
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
        )}
      </AnimatePresence>
      </div>
    </DeploymentOverlay>
  )
}

export default function SyncMediaPage() {
  try {
    return <SyncMediaPageContent />
  } catch (error) {
    console.error('Sync media page error:', error)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center">
              <FiRefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Media Sync Center</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Bidirectional media synchronization between local storage and Vercel Blob
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}