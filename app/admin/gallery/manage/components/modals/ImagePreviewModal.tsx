'use client'

import { memo, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiX, 
  FiDownload, 
  FiTrash2, 
  FiCopy, 
  FiExternalLink,
  FiInfo,
  FiImage,
  FiMaximize2,
  FiMinimize2
} from 'react-icons/fi'
import { formatFileSize, formatDate } from '../../utils'
import type { FileInfo } from '../../services/directory-service'

interface ImagePreviewModalProps {
  file: FileInfo | null
  isOpen: boolean
  onClose: () => void
  onDelete?: (file: FileInfo) => void
  directoryName?: string
}

const ImagePreviewModal = memo(function ImagePreviewModal({
  file,
  isOpen,
  onClose,
  onDelete,
  directoryName
}: ImagePreviewModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Ensure client-side rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset states when modal opens/closes
  useEffect(() => {
    if (isOpen && file) {
      setImageLoaded(false)
      setImageError(false)
      setIsFullscreen(false)
    }
  }, [isOpen, file])

  // Expert-level body scroll lock and escape handling
  useEffect(() => {
    if (!isOpen) return

    // Store original body styles
    const originalStyle = {
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
      position: document.body.style.position
    }

    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    // Lock body scroll and prevent layout shift
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`
    document.body.style.position = 'relative'

    // Escape key handler
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false)
        } else {
          onClose()
        }
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      // Restore original body styles
      document.body.style.overflow = originalStyle.overflow
      document.body.style.paddingRight = originalStyle.paddingRight
      document.body.style.position = originalStyle.position
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, isFullscreen, onClose])

  const handleCopyUrl = async () => {
    if (file?.url) {
      try {
        await navigator.clipboard.writeText(window.location.origin + file.url)
        // You could add a toast notification here
        console.log('URL copied to clipboard')
      } catch (err) {
        console.error('Failed to copy URL:', err)
      }
    }
  }

  const handleDownload = () => {
    if (file?.url) {
      const link = document.createElement('a')
      link.href = file.url
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleDelete = () => {
    if (file && onDelete) {
      onDelete(file)
    }
  }

  // Don't render on server or if not mounted
  if (!mounted || !isOpen || !file) return null

  // Expert Modal Component
  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div
          className="fixed inset-0"
          style={{
            zIndex: 999999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh'
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => isFullscreen ? setIsFullscreen(false) : onClose()}
          />

          {/* Modal Container */}
          <div
            className="absolute inset-0 flex items-center justify-center p-4"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.4 
              }}
              className="relative bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col"
              style={{
                width: isFullscreen ? '100vw' : 'min(90vw, 900px)',
                height: isFullscreen ? '100vh' : 'min(85vh, 650px)',
                maxWidth: isFullscreen ? '100vw' : '900px',
                maxHeight: isFullscreen ? '100vh' : '650px',
                minWidth: '320px',
                minHeight: '400px',
                borderRadius: isFullscreen ? '0' : '12px'
              }}
            >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md flex-shrink-0">
                  <FiImage className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                    {file.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                    {directoryName && `${directoryName} • `}
                    {formatFileSize(file.size)} • {formatDate(file.lastModified)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-2">
                <button
                  onClick={handleCopyUrl}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Copy URL"
                >
                  <FiCopy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
                </button>
                
                <button
                  onClick={handleDownload}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Download"
                >
                  <FiDownload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
                </button>

                <button
                  onClick={() => file.url && window.open(file.url, '_blank')}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Open in new tab"
                >
                  <FiExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
                </button>

                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? (
                    <FiMinimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <FiMaximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
                  )}
                </button>

                {onDelete && (
                  <button
                    onClick={handleDelete}
                    className="p-1.5 sm:p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors group"
                    title="Delete file"
                  >
                    <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300" />
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Close"
                >
                  <FiX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Image Content */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
              {file.isImage ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  {!imageLoaded && !imageError && (
                    <div className="flex items-center justify-center w-full h-full min-h-[300px] bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
                      />
                    </div>
                  )}
                  
                  {imageError ? (
                    <div className="flex flex-col items-center justify-center w-full h-full min-h-[300px] bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <FiImage className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 text-center">
                        Failed to load image
                      </p>
                      <button
                        onClick={() => {
                          setImageError(false)
                          setImageLoaded(false)
                        }}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <motion.img
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: imageLoaded ? 1 : 0, scale: imageLoaded ? 1 : 0.95 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      src={file.url}
                      alt={file.name}
                      className={`max-w-full max-h-full object-contain rounded-lg shadow-lg ${
                        !imageLoaded ? 'invisible absolute' : ''
                      }`}
                      style={{
                        maxWidth: isFullscreen ? '100%' : 'calc(100% - 2rem)',
                        maxHeight: isFullscreen ? '100%' : 'calc(100% - 2rem)',
                        width: 'auto',
                        height: 'auto'
                      }}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageError(true)}
                    />
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 w-full h-full">
                  <FiInfo className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                    This file type cannot be previewed
                  </p>
                  <button
                    onClick={handleDownload}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Download File
                  </button>
                </div>
              )}
            </div>

            {/* Footer with File Info */}
            <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex-shrink-0">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block">Type:</span>
                  <p className="font-medium text-gray-900 dark:text-white uppercase truncate">
                    {file.type}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block">Size:</span>
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <div className="lg:col-span-1 col-span-2">
                  <span className="text-gray-500 dark:text-gray-400 block">Modified:</span>
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {formatDate(file.lastModified)}
                  </p>
                </div>
                <div className="lg:col-span-1 col-span-2">
                  <span className="text-gray-500 dark:text-gray-400 block">Path:</span>
                  <p className="font-medium text-gray-900 dark:text-white truncate" title={file.url}>
                    {file.url}
                  </p>
                </div>
              </div>
            </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )

  // Render modal in portal to document body
  return createPortal(modalContent, document.body)
})

export default ImagePreviewModal