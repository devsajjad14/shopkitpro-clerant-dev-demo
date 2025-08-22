'use client'

import { memo, useState, Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { FiFolder, FiChevronRight, FiFile, FiRefreshCw, FiImage, FiChevronLeft, FiChevronsLeft, FiChevronsRight, FiSearch, FiTrash2, FiX } from 'react-icons/fi'
import { useDirectoryFiles } from '../hooks/useDirectoryFiles'
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
  const [currentPage, setCurrentPage] = useState(1)
  const [previewFile, setPreviewFile] = useState<FileInfo | null>(null)
  const [deleteFile, setDeleteFile] = useState<FileInfo | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const { files, loading, refreshFiles } = useDirectoryFiles(
    directory.isExpanded ? directory.id : null
  )

  // Search filtering
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination settings
  const filesPerPage = 10
  const totalPages = Math.ceil(filteredFiles.length / filesPerPage)
  const startIndex = (currentPage - 1) * filesPerPage
  const endIndex = startIndex + filesPerPage
  const currentFiles = filteredFiles.slice(startIndex, endIndex)

  const handleToggle = () => {
    onToggle(directory.id)
    // Reset states when toggling
    setCurrentPage(1)
    if (directory.isExpanded) {
      // Closing folder - clear search
      setSearchTerm('')
    }
  }

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRefresh?.(directory.id)
    refreshFiles()
    setCurrentPage(1) // Reset to first page after refresh
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
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

  const handleDeleteAll = async () => {
    try {
      setIsDeleting(true)
      console.log('🗑️ Deleting all files in directory:', directory.name)
      
      // Delete all files in parallel
      const deletePromises = files.map(file => directoryService.deleteFile(file.url || ''))
      const results = await Promise.allSettled(deletePromises)
      
      // Count successful deletions
      const successCount = results.filter(result => result.status === 'fulfilled' && result.value === true).length
      const failCount = files.length - successCount
      
      console.log(`✅ Delete completed: ${successCount} successful, ${failCount} failed`)
      
      // Refresh the file list and directory info
      refreshFiles()
      onRefresh?.(directory.id)
      setShowDeleteAllConfirm(false)
      
      if (failCount > 0) {
        throw new Error(`${failCount} files failed to delete`)
      }
    } catch (error) {
      console.error('❌ Error deleting files:', error)
      // Don't close modal on error, let user try again
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const clearSearch = () => {
    setSearchTerm('')
    setCurrentPage(1)
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
                {loading ? (
                  'Loading...'
                ) : searchTerm && directory.isExpanded ? (
                  `${filteredFiles.length}/${files.length}`
                ) : (
                  `${files.length || directory.fileCount} files`
                )}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">{directory.description}</p>
        </div>
      </div>

      {/* File List */}
      {directory.isExpanded && (
        <div className="pl-8 pb-3 space-y-1">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner size="sm" />
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">Loading files...</span>
            </div>
          ) : null}
          {!loading && files.length > 0 ? (
            <>
              {/* File List - Paginated */}
              {currentFiles.map((file, index) => (
                <div key={startIndex + index} className="flex items-center justify-between p-3 text-xs hover:bg-gray-100/50 dark:hover:bg-gray-700/20 rounded-lg group transition-all duration-200">
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
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between py-3 px-2 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg mt-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredFiles.length)} of {filteredFiles.length} files
                    {searchTerm && ` (filtered from ${files.length} total)`}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {/* First Page */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePageChange(1)
                      }}
                      disabled={currentPage === 1}
                      className="p-1.5 text-xs hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="First page"
                    >
                      <FiChevronsLeft className="w-3 h-3" />
                    </button>
                    
                    {/* Previous Page */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePreviousPage()
                      }}
                      disabled={currentPage === 1}
                      className="p-1.5 text-xs hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Previous page"
                    >
                      <FiChevronLeft className="w-3 h-3" />
                    </button>
                    
                    {/* Page Numbers */}
                    {(() => {
                      const visiblePages = []
                      const maxVisible = 5
                      let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
                      let endPage = Math.min(totalPages, startPage + maxVisible - 1)
                      
                      if (endPage - startPage + 1 < maxVisible) {
                        startPage = Math.max(1, endPage - maxVisible + 1)
                      }
                      
                      for (let i = startPage; i <= endPage; i++) {
                        visiblePages.push(i)
                      }
                      
                      return visiblePages.map(page => (
                        <button
                          key={page}
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePageChange(page)
                          }}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            page === currentPage 
                              ? 'bg-blue-600 text-white' 
                              : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {page}
                        </button>
                      ))
                    })()}
                    
                    {/* Next Page */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNextPage()
                      }}
                      disabled={currentPage === totalPages}
                      className="p-1.5 text-xs hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Next page"
                    >
                      <FiChevronRight className="w-3 h-3" />
                    </button>
                    
                    {/* Last Page */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePageChange(totalPages)
                      }}
                      disabled={currentPage === totalPages}
                      className="p-1.5 text-xs hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Last page"
                    >
                      <FiChevronsRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4 text-xs text-gray-500 dark:text-gray-400">
              No files found
            </div>
          )
          }
        </div>
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

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4" style={{ margin: 0, padding: '1rem' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 w-full max-w-lg mx-auto"
            style={{ 
              maxHeight: 'calc(100vh - 2rem)',
              overflowY: 'auto',
              position: 'relative'
            }}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 rounded-xl flex items-center justify-center shadow-lg">
                <FiTrash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Delete All Files
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100/60 dark:bg-gray-700/60 px-2 py-1 rounded-md inline-block">
                  📁 {directory.name}/ folder
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-50 to-red-50 dark:from-amber-900/20 dark:to-red-900/20 border border-amber-200/60 dark:border-amber-700/60 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                You're about to permanently delete <span className="font-bold text-red-600 dark:text-red-400">{files.length} files</span> from this folder.
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-medium">
                ⚠️ This action cannot be undone
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                disabled={isDeleting}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-700/80 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all duration-200 backdrop-blur-sm border border-gray-200/60 dark:border-gray-600/60 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={isDeleting}
                className="group px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
              >
                <span className="flex items-center gap-2">
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
                      Delete All Files
                    </>
                  )}
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
})

export default FolderItem