'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  FiUpload,
  FiInfo,
  FiX,
  FiPlus
} from 'react-icons/fi'
import { toast } from 'sonner'

interface SmartDataImporterProps {
  selectedDataSource: 'local' | 'vercel'
  selectedFiles: File[]
  setSelectedFiles: (files: File[]) => void
  importProgress: number
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error'
  uploadMessage: string
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleUpload: () => Promise<void>
  setShowFileTypeModal: (show: boolean) => void
}

export function SmartDataImporter({
  selectedDataSource,
  selectedFiles,
  setSelectedFiles,
  importProgress,
  uploadStatus,
  uploadMessage,
  handleFileUpload,
  handleUpload,
  setShowFileTypeModal
}: SmartDataImporterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles(selectedFiles.filter((_, index) => index !== indexToRemove))
  }

  return (
    <div className='mb-8'>
      <div className='flex items-center gap-3 mb-6'>
        <div className='p-3 bg-gradient-to-r from-[#00437f] to-[#003366] rounded-xl shadow-md'>
          <FiUpload className='w-6 h-6 text-white' />
        </div>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Smart Data Importer
          </h2>
          <p className='text-gray-600 dark:text-gray-400'>
            Import files to {selectedDataSource === 'local' ? 'Local Data-Db Folder' : 'Vercel Blob Storage'}
          </p>
        </div>
      </div>

      {/* Premium Data Source Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className='mb-6 p-4 bg-gradient-to-r from-[#00437f]/10 to-blue-50 dark:from-[#00437f]/20 dark:to-blue-900/20 border border-[#00437f]/20 dark:border-[#00437f]/30 rounded-xl'
      >
        <div className='flex items-center gap-3 mb-3'>
          <div className='w-3 h-3 bg-[#00437f] rounded-full animate-pulse'></div>
          <span className='text-sm font-medium text-[#00437f] dark:text-[#00437f]'>
            Connection Status
          </span>
        </div>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-600 dark:text-gray-400'>
              {selectedDataSource === 'local' ? 'Local Data-Db Folder' : 'Vercel Blob Storage'}
            </span>
            <span className='text-xs px-2 py-1 bg-[#00437f]/10 dark:bg-[#00437f]/20 text-[#00437f] dark:text-[#00437f] rounded-full font-medium'>
              Connected
            </span>
          </div>
        </div>
      </motion.div>

      {/* Important Notice */}
      <div className='mb-6 space-y-4'>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className='p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-600 rounded-lg'
        >
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-yellow-500 rounded-lg'>
              <FiInfo className='w-4 h-4 text-white' />
            </div>
            <div>
              <p className='text-sm font-bold text-yellow-800 dark:text-yellow-200'>
                💡 IMPORTANT: Import is OPTIONAL
              </p>
              <p className='text-xs text-yellow-700 dark:text-yellow-300'>
                Only use when you want to update data with new files
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress Bar */}
      {importProgress > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-[#00437f]/10 dark:border-[#00437f]/20'
        >
          <div className='flex items-center justify-between mb-3'>
            <div className='flex items-center space-x-2'>
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className='w-2 h-2 bg-[#00437f] rounded-full'
              />
              <span className='text-sm font-medium text-[#00437f] dark:text-[#00437f]'>
                Uploading to {selectedDataSource === 'local' ? 'Local Data-Db Folder' : 'Vercel Blob Storage'}...
              </span>
            </div>
            <motion.span 
              key={importProgress}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className='text-sm font-bold text-[#00437f] dark:text-[#00437f]'
            >
              {importProgress}%
            </motion.span>
          </div>
          <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden'>
            <motion.div
              className='h-full bg-gradient-to-r from-[#00437f] to-[#003366] rounded-full'
              initial={{ width: 0 }}
              animate={{ width: `${importProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}

      {/* File Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className='space-y-6'
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* File Selection Area */}
        <div 
          className="relative border-2 border-dashed border-[#00437f]/30 dark:border-[#00437f]/40 rounded-xl p-8 text-center cursor-pointer hover:border-[#00437f]/50 dark:hover:border-[#00437f]/60 transition-all duration-300 group"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-[#00437f]/10 dark:bg-[#00437f]/20 rounded-full group-hover:bg-[#00437f]/20 dark:group-hover:bg-[#00437f]/30 transition-colors duration-300">
              <FiPlus className="w-8 h-8 text-[#00437f] dark:text-[#00437f]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Select JSON Files to Import
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Click to browse or drag and drop your JSON files here
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Only .json files are accepted
              </p>
            </div>
          </div>
        </div>

        {/* Selected Files Display */}
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Selected Files ({selectedFiles.length})
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                      <FiUpload className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(index)
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Upload Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleUpload}
              disabled={uploadStatus === 'uploading'}
              className="w-full py-3 px-6 bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
            >
              {uploadStatus === 'uploading' ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Uploading...</span>
                </div>
              ) : (
                `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Upload Status */}
        {uploadMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${
              uploadStatus === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                : uploadStatus === 'error'
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
            }`}
          >
            <p className="text-sm font-medium">{uploadMessage}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}