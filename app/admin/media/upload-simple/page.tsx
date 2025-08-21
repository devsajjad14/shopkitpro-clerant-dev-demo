'use client'

import { useState } from 'react'
import { FiUpload, FiImage, FiLoader, FiCheck, FiX } from 'react-icons/fi'
import { toast } from 'sonner'

export default function MediaUploadPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{
    current: number
    total: number
    currentFile?: string
  }>({ current: 0, total: 0 })

  const uploadMediaToVercel = async () => {
    if (isUploading) return

    try {
      setIsUploading(true)
      setUploadProgress({ current: 0, total: 0 })
      
      toast.loading('Starting upload to Vercel Blob...', { id: 'media-upload' })

      const response = await fetch('/api/admin/media/upload-to-vercel', {
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
                setUploadProgress({
                  current: data.current,
                  total: data.total,
                  currentFile: data.currentFile
                })
              } else if (data.type === 'complete') {
                toast.success(`✅ Uploaded ${data.totalFiles} files to Vercel Blob`, {
                  id: 'media-upload',
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
      console.error('❌ Upload failed:', error)
      toast.error(`Failed to upload media: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        id: 'media-upload',
        duration: 5000
      })
    } finally {
      setIsUploading(false)
      setUploadProgress({ current: 0, total: 0 })
    }
  }

  const progressPercent = uploadProgress.total > 0 
    ? Math.round((uploadProgress.current / uploadProgress.total) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FiImage className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Media Upload</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Upload local media files to Vercel Blob storage
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
              <FiUpload className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Upload Media to Vercel Blob
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Upload all media files from client/media directory to Vercel Blob storage.
            </p>

            {/* Upload Button */}
            <button
              onClick={uploadMediaToVercel}
              disabled={isUploading}
              className={`inline-flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all ${
                isUploading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {isUploading ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FiUpload className="w-5 h-5" />
                  Upload to Vercel Blob
                </>
              )}
            </button>

            {/* Progress */}
            {isUploading && uploadProgress.total > 0 && (
              <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Progress: {uploadProgress.current} / {uploadProgress.total} files
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {progressPercent}%
                  </span>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {uploadProgress.currentFile && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Uploading: {uploadProgress.currentFile}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <FiUpload className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">Local to Cloud</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Upload from client/media to Vercel</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <FiImage className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">All Media Types</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Images, videos, documents</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <FiCheck className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">Progress Tracking</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Real-time upload progress</p>
          </div>
        </div>
      </div>
    </div>
  )
}