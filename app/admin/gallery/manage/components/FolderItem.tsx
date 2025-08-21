'use client'

import { memo, useState, Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { FiFolder, FiChevronRight, FiFile, FiRefreshCw, FiImage } from 'react-icons/fi'
import { useDirectoryFiles } from '../hooks/useDirectoryFiles'
import { formatFileSize } from '../utils'
import { directoryService } from '../services/directory-service'
import LoadingSpinner from './ui/LoadingSpinner'
import FileActions from './ui/FileActions'
import type { DirectoryInfo, FileInfo } from '../services/directory-service'

// Lazy load modals to reduce bundle size
const ImagePreviewModal = lazy(() => import('./modals/ImagePreviewModal'))
const DeleteConfirmationModal = lazy(() => import('./modals/DeleteConfirmationModal'))

interface FolderItemProps {
  directory: DirectoryInfo
  onToggle: (id: string) => void
  onRefresh?: (id: string) => void
}

const FolderItem = memo(function FolderItem({ 
  directory, 
  onToggle, 
  onRefresh 
}: FolderItemProps) {
  const [showFiles, setShowFiles] = useState(false)
  const [showAllFiles, setShowAllFiles] = useState(false)
  const [previewFile, setPreviewFile] = useState<FileInfo | null>(null)
  const [deleteFile, setDeleteFile] = useState<FileInfo | null>(null)
  const { files, loading, refreshFiles } = useDirectoryFiles(
    showFiles ? directory.id : null
  )

  // Debug log to verify component is rendering
  console.log('🔍 FolderItem rendering:', directory.name, 'expanded:', directory.isExpanded, 'files:', files.length)

  const handleToggle = () => {
    console.log('🔄 Toggle folder:', directory.name, 'currently expanded:', directory.isExpanded)
    onToggle(directory.id)
    if (!directory.isExpanded) {
      setShowFiles(true)
    } else {
      setShowFiles(false)
      setShowAllFiles(false)
    }
  }

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRefresh?.(directory.id)
    refreshFiles()
  }

  const handleViewFile = (file: FileInfo) => {
    setPreviewFile(file)
  }

  const handleDeleteFile = (file: FileInfo) => {
    setDeleteFile(file)
  }

  const confirmDeleteFile = async (file: FileInfo) => {
    try {
      const success = await directoryService.deleteFile(file.url || '')
      if (success) {
        // Refresh the file list and directory info
        refreshFiles()
        onRefresh?.(directory.id)
        console.log('✅ File deleted successfully:', file.name)
      } else {
        throw new Error('Failed to delete file')
      }
    } catch (error) {
      console.error('❌ Error deleting file:', error)
      throw error
    }
  }

  return (
    <div className={`${directory.isExpanded ? 'bg-gray-50/50 dark:bg-gray-800/30' : ''} rounded-lg`}>
      {/* Folder Header */}
      <div 
        className="flex items-center gap-3 p-3 hover:bg-white/50 dark:hover:bg-gray-700/30 rounded-lg transition-colors cursor-pointer"
        onClick={handleToggle}
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: directory.isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 bg-gray-100 dark:bg-gray-700 rounded"
          title="Click to expand folder"
        >
          <FiChevronRight className="w-4 h-4" />
        </motion.div>
        
        <div className="text-gray-500 dark:text-gray-400">
          <FiFolder className="w-4 h-4" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {directory.icon} {directory.name}/
            </span>
            <div className="flex items-center gap-2">
              {onRefresh && (
                <button
                  onClick={handleRefresh}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  title="Refresh folder"
                >
                  <FiRefreshCw className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                </button>
              )}
              <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">
                {directory.fileCount} files
              </span>
              {directory.totalSize > 0 && (
                <span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 px-2 py-0.5 rounded-full">
                  {formatFileSize(directory.totalSize)}
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">{directory.description}</p>
        </div>
      </div>

      {/* File List */}
      {directory.isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="pl-8 pb-3 space-y-1"
        >
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner size="sm" />
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">Loading files...</span>
            </div>
          ) : files.length > 0 ? (
            <>
              {(showAllFiles ? files : files.slice(0, 5)).map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 text-xs hover:bg-gray-100/50 dark:hover:bg-gray-700/20 rounded-lg group transition-all duration-200">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="text-gray-400 dark:text-gray-500">
                      {file.isImage ? (
                        <FiImage className="w-4 h-4 text-green-500" />
                      ) : (
                        <FiFile className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-gray-700 dark:text-gray-300 truncate block font-medium">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <FileActions
                      file={file}
                      onView={handleViewFile}
                      onDelete={handleDeleteFile}
                      size="sm"
                    />
                  </div>
                </div>
              ))}
              
              {files.length > 5 && (
                <div className="text-center py-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowAllFiles(!showAllFiles)
                    }}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
                  >
                    {showAllFiles ? 'Show Less' : `+ ${files.length - 5} more files...`}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4 text-xs text-gray-500 dark:text-gray-400">
              No files found
            </div>
          )}
        </motion.div>
      )}

      {/* Modals - Lazy loaded */}
      {previewFile && (
        <Suspense fallback={null}>
          <ImagePreviewModal
            file={previewFile}
            isOpen={!!previewFile}
            onClose={() => setPreviewFile(null)}
            onDelete={handleDeleteFile}
            directoryName={directory.name}
          />
        </Suspense>
      )}

      {deleteFile && (
        <Suspense fallback={null}>
          <DeleteConfirmationModal
            file={deleteFile}
            isOpen={!!deleteFile}
            onClose={() => setDeleteFile(null)}
            onConfirm={confirmDeleteFile}
            directoryName={directory.name}
          />
        </Suspense>
      )}
    </div>
  )
})

export default FolderItem