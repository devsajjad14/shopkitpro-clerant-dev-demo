'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FiFile, FiCheck, FiX, FiLoader, FiClock, FiUpload, FiTrash2 } from 'react-icons/fi'
import type { SelectedFile, UploadStats } from '../types'
import { formatFileSize } from '../utils'

interface FileListProps {
  files: SelectedFile[]
  onRemoveFile: (id: string) => void
  disabled?: boolean
}

export default function FileList({ files, onRemoveFile, disabled = false }: FileListProps) {
  if (files.length === 0) {
    return null
  }

  const stats: UploadStats = files.reduce(
    (acc, file) => {
      acc.total++
      if (file.status === 'pending') acc.pending++
      if (file.status === 'uploading') acc.uploading++
      if (file.status === 'success') acc.success++
      if (file.status === 'error') acc.failed++
      return acc
    },
    { total: 0, pending: 0, uploading: 0, success: 0, failed: 0 }
  )

  const getStatusIcon = (status: SelectedFile['status']) => {
    switch (status) {
      case 'pending': return FiClock
      case 'uploading': return FiLoader
      case 'success': return FiCheck
      case 'error': return FiX
      default: return FiFile
    }
  }

  const getStatusColors = (status: SelectedFile['status']) => {
    switch (status) {
      case 'pending': return {
        bg: 'from-gray-50 to-gray-100',
        text: 'text-gray-600',
        icon: 'text-gray-500',
        border: 'border-gray-200'
      }
      case 'uploading': return {
        bg: 'from-blue-50 to-indigo-100',
        text: 'text-blue-700',
        icon: 'text-blue-600',
        border: 'border-blue-200'
      }
      case 'success': return {
        bg: 'from-green-50 to-emerald-100',
        text: 'text-green-700',
        icon: 'text-green-600',
        border: 'border-green-200'
      }
      case 'error': return {
        bg: 'from-red-50 to-rose-100',
        text: 'text-red-700',
        icon: 'text-red-600',
        border: 'border-red-200'
      }
      default: return {
        bg: 'from-gray-50 to-gray-100',
        text: 'text-gray-600',
        icon: 'text-gray-500',
        border: 'border-gray-200'
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 space-y-6"
    >
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Upload Queue</h3>
          <p className="text-gray-600 text-sm mt-1">{files.length} file{files.length !== 1 ? 's' : ''} selected</p>
        </div>
        
        <div className="flex items-center gap-4">
          {stats.success > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
            >
              <FiCheck className="w-4 h-4" />
              {stats.success}
            </motion.div>
          )}
          {stats.uploading > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <FiLoader className="w-4 h-4" />
              </motion.div>
              {stats.uploading}
            </motion.div>
          )}
          {stats.pending > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
            >
              <FiClock className="w-4 h-4" />
              {stats.pending}
            </motion.div>
          )}
          {stats.failed > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
            >
              <FiX className="w-4 h-4" />
              {stats.failed}
            </motion.div>
          )}
        </div>
      </div>

      {/* File List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <AnimatePresence>
            {files.map((selectedFile, index) => {
              const StatusIcon = getStatusIcon(selectedFile.status)
              const colors = getStatusColors(selectedFile.status)
              
              return (
                <motion.div
                  key={selectedFile.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className={`p-4 ${index !== files.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50/50 transition-all duration-200`}
                >
                  <div className="flex items-center gap-4">
                    {/* Status Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 + 0.1, type: "spring", stiffness: 500 }}
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} ${colors.border} border flex items-center justify-center ${colors.icon}`}
                    >
                      {selectedFile.status === 'uploading' ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <StatusIcon className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        <StatusIcon className="w-5 h-5" />
                      )}
                    </motion.div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {selectedFile.file.name}
                        </h4>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 + 0.2 }}
                          className={`px-2 py-1 ${colors.bg} ${colors.text} ${colors.border} border rounded-full text-xs font-medium capitalize`}
                        >
                          {selectedFile.status}
                        </motion.div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <span>{formatFileSize(selectedFile.file.size)}</span>
                        <span>•</span>
                        <span className="truncate">{selectedFile.file.type}</span>
                      </div>

                      {/* Progress Bar */}
                      <AnimatePresence>
                        {selectedFile.status === 'uploading' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-blue-600 font-medium">
                                {selectedFile.progress}% uploaded
                              </span>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="text-blue-500"
                              >
                                <FiUpload className="w-3 h-3" />
                              </motion.div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${selectedFile.progress}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Error Message */}
                      <AnimatePresence>
                        {selectedFile.error && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg"
                          >
                            <div className="flex items-center gap-2 text-sm text-red-700">
                              <FiX className="w-4 h-4" />
                              {selectedFile.error}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Remove Button */}
                    <AnimatePresence>
                      {!disabled && selectedFile.status !== 'uploading' && (
                        <motion.button
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onRemoveFile(selectedFile.id)}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 flex items-center justify-center transition-all duration-200 group"
                        >
                          <FiTrash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
        
        {/* Empty State */}
        {files.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 text-center text-gray-500"
          >
            <FiFile className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No files selected yet</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}