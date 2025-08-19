'use client'

import { useState } from 'react'
import { FiDownload, FiImage, FiFolder, FiCheck, FiX, FiLoader } from 'react-icons/fi'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'

// Dynamically import motion to avoid SSR issues
const motion = dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion })), {
  ssr: false
})

function MediaPageContent() {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<{
    current: number
    total: number
    currentFile?: string
    downloaded?: number
    skipped?: number
    action?: 'downloading' | 'skipped'
    reason?: string
  }>({ current: 0, total: 0 })

  const downloadMediaFromVercel = async () => {
    if (isDownloading) return

    try {
      setIsDownloading(true)
      setDownloadProgress({ current: 0, total: 0 })
      
      toast.loading('Starting download from Vercel Blob...', { id: 'media-download' })

      const response = await fetch('/api/admin/media/download-from-vercel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      
      if (!reader) {
        throw new Error('No response body')
      }

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
                setDownloadProgress({
                  current: data.current,
                  total: data.total,
                  currentFile: data.currentFile,
                  downloaded: data.downloaded,
                  skipped: data.skipped,
                  action: data.action,
                  reason: data.reason
                })
              } else if (data.type === 'complete') {
                const skipMessage = data.skippedFiles > 0 ? `, ${data.skippedFiles} skipped` : ''
                toast.success(`✅ Downloaded ${data.totalFiles} files${skipMessage} to client/media`, {
                  id: 'media-download',
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
      console.error('❌ Download failed:', error)
      toast.error(`Failed to download media: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        id: 'media-download',
        duration: 5000
      })
    } finally {
      setIsDownloading(false)
      setDownloadProgress({ current: 0, total: 0 })
    }
  }

  const progressPercent = downloadProgress.total > 0 
    ? Math.round((downloadProgress.current / downloadProgress.total) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-lg">
            <FiImage className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Media Manager</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and download media files from Vercel Blob storage
        </p>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="text-center py-12">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-full flex items-center justify-center mb-6">
            <FiFolder className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Download Media from Vercel Blob
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Download all media files and folders from your Vercel Blob storage to the local client/media directory, preserving folder structure.
          </p>
          
          <div className="mb-6 px-4 py-2 bg-[#00437f]/10 dark:bg-[#00437f]/20 border border-[#00437f]/20 dark:border-[#00437f]/30 rounded-lg max-w-md mx-auto">
            <p className="text-sm text-[#00437f] dark:text-[#00437f]">
              <strong>Note:</strong> Data-Db folder will be excluded from download
            </p>
          </div>

          {/* Download Button */}
          <button
            onClick={downloadMediaFromVercel}
            disabled={isDownloading}
            className={`inline-flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all ${
              isDownloading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {isDownloading ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <FiDownload className="w-5 h-5" />
                Download Media from Vercel
              </>
            )}
          </button>

          {/* Progress Display */}
          {isDownloading && downloadProgress.total > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Progress: {downloadProgress.current} / {downloadProgress.total} files
                </span>
                <span className="text-sm font-bold text-[#00437f]">
                  {progressPercent}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                <motion.div
                  className="bg-gradient-to-r from-[#00437f] to-[#003366] h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Current File */}
              {downloadProgress.currentFile && (
                <div className="text-xs truncate">
                  <span className={`${
                    downloadProgress.action === 'skipped' 
                      ? 'text-yellow-600 dark:text-yellow-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {downloadProgress.action === 'skipped' ? 'Skipped' : 'Downloading'}: {downloadProgress.currentFile}
                    {downloadProgress.action === 'skipped' && downloadProgress.reason && (
                      <span className="ml-2 text-xs">({downloadProgress.reason})</span>
                    )}
                  </span>
                </div>
              )}

              {/* Progress Breakdown */}
              {(downloadProgress.downloaded !== undefined || downloadProgress.skipped !== undefined) && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="text-center p-2 bg-[#00437f]/10 dark:bg-[#00437f]/20 rounded border border-[#00437f]/20">
                    <div className="text-sm font-bold text-[#00437f] dark:text-[#00437f]">
                      {downloadProgress.downloaded || 0}
                    </div>
                    <div className="text-xs text-[#00437f] dark:text-[#00437f]">Downloaded</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                    <div className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                      {downloadProgress.skipped || 0}
                    </div>
                    <div className="text-xs text-yellow-700 dark:text-yellow-300">Skipped</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-900/20 rounded border border-gray-200 dark:border-gray-700">
                    <div className="text-sm font-bold text-gray-600 dark:text-gray-400">
                      {downloadProgress.total - downloadProgress.current}
                    </div>
                    <div className="text-xs text-gray-700 dark:text-gray-300">Remaining</div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="p-4 bg-[#00437f]/10 dark:bg-[#00437f]/20 border border-[#00437f]/20 rounded-lg">
              <FiFolder className="w-8 h-8 text-[#00437f] mx-auto mb-2" />
              <h3 className="font-medium text-[#00437f] dark:text-[#00437f] mb-1">Folder Structure</h3>
              <p className="text-xs text-[#00437f] dark:text-[#00437f]">Preserves original folder organization</p>
            </div>

            <div className="p-4 bg-[#00437f]/10 dark:bg-[#00437f]/20 border border-[#00437f]/20 rounded-lg">
              <FiDownload className="w-8 h-8 text-[#00437f] mx-auto mb-2" />
              <h3 className="font-medium text-[#00437f] dark:text-[#00437f] mb-1">Local Storage</h3>
              <p className="text-xs text-[#00437f] dark:text-[#00437f]">Files saved to client/media directory</p>
            </div>

            <div className="p-4 bg-[#00437f]/10 dark:bg-[#00437f]/20 border border-[#00437f]/20 rounded-lg">
              <FiImage className="w-8 h-8 text-[#00437f] mx-auto mb-2" />
              <h3 className="font-medium text-[#00437f] dark:text-[#00437f] mb-1">All Media Types</h3>
              <p className="text-xs text-[#00437f] dark:text-[#00437f]">Images, videos, documents, etc.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function MediaPage() {
  try {
    return <MediaPageContent />
  } catch (error) {
    console.error('Media page error:', error)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center">
              <FiImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Media Manager</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Manage and download media files from Vercel Blob storage
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