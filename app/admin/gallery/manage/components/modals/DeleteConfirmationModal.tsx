'use client'

import { memo, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiTrash2, FiAlertTriangle, FiX, FiImage } from 'react-icons/fi'
import LoadingSpinner from '../ui/LoadingSpinner'
import type { FileInfo } from '../../services/directory-service'

interface DeleteConfirmationModalProps {
  file: FileInfo | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (file: FileInfo) => Promise<void>
  directoryName?: string
}

const DeleteConfirmationModal = memo(function DeleteConfirmationModal({
  file,
  isOpen,
  onClose,
  onConfirm,
  directoryName
}: DeleteConfirmationModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Ensure client-side rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  // Expert-level body scroll lock
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

    return () => {
      // Restore original body styles
      document.body.style.overflow = originalStyle.overflow
      document.body.style.paddingRight = originalStyle.paddingRight
      document.body.style.position = originalStyle.position
    }
  }, [isOpen])

  const handleConfirm = async () => {
    if (!file) return

    try {
      setIsDeleting(true)
      setError(null)
      await onConfirm(file)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    if (!isDeleting) {
      setError(null)
      onClose()
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
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30 
              }}
              className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden"
              style={{
                width: 'min(90vw, 448px)',
                minWidth: '300px'
              }}
            >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-red-50 via-red-25 to-red-50 dark:from-red-900/20 dark:via-red-800/10 dark:to-red-900/20 border-b border-red-200 dark:border-red-800">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-md">
                  <FiTrash2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-900 dark:text-red-200">
                    Delete File
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    This action cannot be undone
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isDeleting}
                  className="ml-auto p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                >
                  <FiX className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* File Preview */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-6">
                <div className="flex-shrink-0">
                  {file.isImage && file.url ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <FiImage className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {directoryName && `${directoryName} • `}
                    {file.type.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Warning Message */}
              <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-6">
                <FiAlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Are you sure you want to delete this file?
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    This will permanently remove the file from your media library and cannot be undone.
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6"
                >
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="w-4 h-4" />
                      Delete File
                    </>
                  )}
                </button>
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

export default DeleteConfirmationModal