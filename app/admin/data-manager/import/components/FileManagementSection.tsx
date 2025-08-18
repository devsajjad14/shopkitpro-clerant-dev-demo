'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  FiFolder,
  FiFile,
  FiChevronDown,
  FiChevronRight,
  FiTrash2,
  FiRefreshCw
} from 'react-icons/fi'

interface FileItem {
  name: string
  size: number
  path: string
  lastModified?: string
}

interface FileManagementSectionProps {
  selectedDataSource: 'local' | 'vercel'
  fileList: FileItem[]
  isLoadingFiles: boolean
  isFileListExpanded: boolean
  setIsFileListExpanded: (expanded: boolean) => void
  fetchFiles: () => Promise<void>
  deleteFile: (filename: string) => Promise<void>
}

export function FileManagementSection({
  selectedDataSource,
  fileList,
  isLoadingFiles,
  isFileListExpanded,
  setIsFileListExpanded,
  fetchFiles,
  deleteFile
}: FileManagementSectionProps) {
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set())

  const handleDeleteFile = async (filename: string) => {
    setDeletingFiles(prev => new Set(prev).add(filename))
    try {
      await deleteFile(filename)
    } finally {
      setDeletingFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(filename)
        return newSet
      })
    }
  }

  return (
    <div className='mb-6'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className='p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-800/50 dark:via-blue-900/20 dark:to-indigo-900/20 border border-slate-200/60 dark:border-slate-600/40 rounded-2xl shadow-lg'
      >
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg'>
              <FiFolder className='w-6 h-6 text-white' />
            </div>
            <div>
              <h3 className='text-xl font-bold text-slate-800 dark:text-slate-200'>
                File Management (JSON Only)
              </h3>
              <div className='flex items-center gap-2 mt-1'>
                <p className='text-sm text-slate-600 dark:text-slate-400'>
                  Upload files to
                </p>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full border transition-all duration-200 ${
                  selectedDataSource === 'vercel'
                    ? 'bg-[#00437f]/10 text-[#00437f] border-[#00437f]/20 dark:bg-[#00437f]/20 dark:border-[#00437f]/30'
                    : 'bg-[#00437f]/10 text-[#00437f] border-[#00437f]/20 dark:bg-[#00437f]/20 dark:text-[#00437f] dark:border-[#00437f]/30'
                }`}>
                  {selectedDataSource === 'vercel' ? 'Vercel Blob Storage' : 'Local Data-Db Folder'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* File List */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <button
              onClick={() => setIsFileListExpanded(!isFileListExpanded)}
              className='flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-[#00437f] dark:hover:text-[#00437f] transition-colors duration-200'
            >
              <div className='flex items-center gap-2 text-sm font-medium'>
                {isFileListExpanded ? (
                  <FiChevronDown className='w-4 h-4' />
                ) : (
                  <FiChevronRight className='w-4 h-4' />
                )}
              </div>
              <span className='font-semibold text-slate-700 dark:text-slate-300'>
                {selectedDataSource === 'vercel' ? 'Vercel Blob Storage Files' : 'Local Data-Db Folder Files'}
              </span>
              <span className='px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-full'>
                {fileList.length} files
              </span>
            </button>
            
            <button
              onClick={fetchFiles}
              disabled={isLoadingFiles}
              className='flex items-center gap-2 px-3 py-1.5 bg-[#00437f] hover:bg-[#003366] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all duration-200'
            >
              <FiRefreshCw className={`w-3 h-3 ${isLoadingFiles ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {isFileListExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className='overflow-hidden'
            >
              {isLoadingFiles ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='flex flex-col items-center justify-center py-12 space-y-4'
                >
                  <div className='flex items-center space-x-2'>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className='w-6 h-6 border-2 border-[#00437f] border-t-transparent rounded-full'
                    />
                  </div>
                  <div className='text-center'>
                    <motion.h3
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className='text-lg font-semibold text-slate-700 dark:text-slate-300'
                    >
                      Loading Files
                    </motion.h3>
                    <p className='text-sm text-slate-500 dark:text-slate-400'>
                      Fetching files from {selectedDataSource === 'vercel' ? 'Vercel Blob Storage' : 'Local Data-Db Folder'}
                    </p>
                  </div>
                </motion.div>
              ) : fileList.length === 0 ? (
                <div className='text-center py-8'>
                  <FiFile className='w-12 h-12 text-slate-400 mx-auto mb-3' />
                  <p className='text-slate-600 dark:text-slate-400'>No files found</p>
                  <p className='text-sm text-slate-500 dark:text-slate-500'>
                    Upload some JSON files to get started
                  </p>
                </div>
              ) : (
                <div className='space-y-2 max-h-64 overflow-y-auto'>
                  {fileList.map((file, index) => (
                    <motion.div
                      key={file.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className='flex items-center justify-between p-3 bg-white/80 dark:bg-slate-700/50 rounded-lg border border-slate-200/50 dark:border-slate-600/50'
                    >
                      <div className='flex items-center gap-3 flex-1 min-w-0'>
                        <div className='p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded'>
                          <FiFile className='w-3 h-3 text-blue-600 dark:text-blue-400' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='font-medium text-slate-700 dark:text-slate-300 truncate'>
                            {file.name}
                          </p>
                          <div className='flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400'>
                            <span>{(file.size / 1024).toFixed(1)} KB</span>
                            {file.lastModified && (
                              <span>{new Date(file.lastModified).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteFile(file.name)}
                        disabled={deletingFiles.has(file.name)}
                        className='flex items-center gap-1 px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-200 disabled:opacity-50'
                      >
                        {deletingFiles.has(file.name) ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className='w-3 h-3 border border-red-600 border-t-transparent rounded-full'
                          />
                        ) : (
                          <FiTrash2 className='w-3 h-3' />
                        )}
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}