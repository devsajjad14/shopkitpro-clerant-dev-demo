'use client'

import { useState, useCallback, useRef, Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { 
  FiUploadCloud, 
  FiFolder, 
  FiArrowLeft,
  FiServer,
  FiCloud,
  FiLoader,
  FiFile
} from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { UPLOAD_FOLDERS } from './config'
import { useUpload } from './hooks/useUpload'
import useSettingStore from '@/hooks/use-setting-store'

// Lazy load heavy components to reduce initial bundle size
const ProcessingOverlay = lazy(() => import('./components/ProcessingOverlay'))
const MediaDirectoryView = lazy(() => import('./components/MediaDirectoryView'))

// Keep essential components as direct imports
import FileList from './components/FileList'
import FolderSelector from './components/FolderSelector'
import UploadActions from './components/UploadActions'


export default function MediaUploadPage() {
  const router = useRouter()
  
  const {
    selectedFolder,
    setSelectedFolder,
    files,
    isUploading,
    addFiles,
    removeFile,
    clearAllFiles,
    startUpload,
    // Premium upload experience
    isProcessing,
    processingStage,
    uploadProgress,
    currentFileName
  } = useUpload()

  // Get current platform from settings store
  const platform = useSettingStore((state) => state.getPlatform())
  const isLoaded = useSettingStore((state) => state.isLoaded)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const stats = {
    total: files.length,
    success: files.filter(f => f.status === 'success').length
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <div className='max-w-7xl mx-auto p-6 space-y-6'>
        
        {/* Premium Header */}
        <div className='relative'>
          <div className='absolute inset-0 bg-gradient-to-r from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl'></div>
          <div className='relative flex items-center justify-between bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg'>
            <div className='space-y-2'>
              <div className='flex items-center gap-3'>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => router.back()} 
                  className="h-8 w-8 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200"
                >
                  <FiArrowLeft className="h-4 w-4" />
                </Button>
                <div className='w-10 h-10 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-lg flex items-center justify-center shadow-md'>
                  <FiUploadCloud className='w-5 h-5 text-white' />
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900 dark:text-white tracking-tight'>
                    Media Upload
                  </h1>
                  <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>
                    Upload and organize your media files
                  </p>
                </div>
              </div>
            </div>
            
            {/* Platform Indicator */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-lg border border-white/20 dark:border-gray-700/50 shadow-md">
              {isLoaded ? (
                <>
                  {platform === 'vercel' ? (
                    <FiCloud className="w-4 h-4 text-blue-600" />
                  ) : (
                    <FiServer className="w-4 h-4 text-[#00437f]" />
                  )}
                  <div className="text-center">
                    <div className="text-xs font-semibold text-gray-900 dark:text-white">
                      {platform === 'vercel' ? 'Vercel' : 'Server'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Platform</div>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="text-xs text-gray-400">Loading...</div>
                  <div className="text-xs text-gray-500">Platform</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Premium Folder Selection Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className='relative group'
        >
          <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
          <Card className='relative p-8 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl transition-all duration-300 group-hover:shadow-2xl'>
            <div className='flex items-center gap-3 mb-8'>
              <div className='p-3 bg-gradient-to-r from-[#00437f] to-[#003366] rounded-xl shadow-md'>
                <FiFolder className='w-6 h-6 text-white' />
              </div>
              <div>
                <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                  Select Upload Destination
                </h2>
                <p className='text-gray-600 dark:text-gray-400'>
                  Choose where to organize your media files
                </p>
              </div>
            </div>

            {selectedFolder && (
              <div className="mb-6 text-right">
                <div className="text-sm font-medium text-[#00437f] dark:text-blue-400">Selected: {selectedFolder.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{selectedFolder.description}</div>
              </div>
            )}
              
              <FolderSelector
                folders={UPLOAD_FOLDERS}
                selectedFolder={selectedFolder}
                onFolderSelect={setSelectedFolder}
              />
              
              {selectedFolder && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-gradient-to-r from-[#00437f]/10 via-transparent to-[#00437f]/10 backdrop-blur-sm rounded-xl border border-[#00437f]/20 dark:border-[#00437f]/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{selectedFolder.icon}</div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{selectedFolder.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedFolder.description}</p>
                      <div className="mt-2 text-sm text-[#00437f] dark:text-blue-400 font-medium">
                        📁 Files will be saved to: /media/{selectedFolder.path}/
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
          </Card>
        </motion.div>

        {/* Premium File Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className='relative group'
        >
          <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
          <Card className='relative p-8 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl transition-all duration-300 group-hover:shadow-2xl'>
            <div className='flex items-center justify-between mb-8'>
              <div className='flex items-center gap-3'>
                <div className='p-3 bg-gradient-to-r from-[#00437f] to-[#003366] rounded-xl shadow-md'>
                  <FiUploadCloud className='w-6 h-6 text-white' />
                </div>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                    Upload Media Files
                  </h2>
                  <p className='text-gray-600 dark:text-gray-400'>
                    Add images to your media library
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-white">{files.length} files ready</div>
                <div className="text-sm text-[#00437f] dark:text-blue-400 font-medium">
                  {files.filter(f => f.status === 'success').length} uploaded
                </div>
              </div>
            </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!selectedFolder ? (
                <div className="border-2 border-dashed border-gray-300/50 dark:border-gray-600/50 rounded-2xl p-12 text-center bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-700/50 backdrop-blur-sm">
                  <FiFolder className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Select a Destination Folder</h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Choose your upload destination above to begin</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                    {UPLOAD_FOLDERS.slice(0, 4).map((folder) => (
                      <div key={folder.id} className="p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-700/50 shadow-md text-center hover:scale-105 transition-transform duration-200">
                        <div className="text-3xl mb-2">{folder.icon}</div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{folder.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={triggerFileSelect}
                    className="border-2 border-dashed border-[#00437f]/30 dark:border-[#00437f]/40 rounded-2xl p-16 text-center bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/10 backdrop-blur-sm hover:from-[#00437f]/10 hover:to-[#00437f]/15 transition-all duration-300 cursor-pointer group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      className="w-20 h-20 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                    >
                      <FiUploadCloud className="w-10 h-10 text-white" />
                    </motion.div>
                    
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Upload to {selectedFolder.name}</h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                      Drag & drop your files here or <span className="text-[#00437f] dark:text-blue-400 font-bold underline decoration-2">click to browse</span>
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-center">
                      <div className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-700/50 shadow-md hover:scale-105 transition-transform duration-200">
                        <div className="text-4xl mb-3">🖼️</div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white mb-2">Modern Formats</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">WebP, AVIF, HEIC</div>
                      </div>
                      <div className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-700/50 shadow-md hover:scale-105 transition-transform duration-200">
                        <div className="text-4xl mb-3">📸</div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white mb-2">Standard Images</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">JPG, PNG, GIF, SVG</div>
                      </div>
                      <div className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-700/50 shadow-md hover:scale-105 transition-transform duration-200">
                        <div className="text-4xl mb-3">⚡</div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white mb-2">Bulk Upload</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Up to 50,000 files, 10MB each</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Upload Queue - Within Upload Media Files Section */}
                  {files.length > 0 && (
                    <div className="mt-8">
                      <FileList
                        files={files}
                        onRemoveFile={removeFile}
                        disabled={isUploading}
                      />
                    </div>
                  )}

                  {/* Upload Actions - Within Upload Media Files Section */}
                  {files.length > 0 && (
                    <div className="mt-6">
                      <UploadActions
                        files={files}
                        selectedFolder={selectedFolder}
                        isUploading={isUploading}
                        onClearAll={clearAllFiles}
                        onStartUpload={startUpload}
                      />
                    </div>
                  )}

                  {/* Upload Tips */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-blue-50/70 dark:from-blue-900/20 dark:via-indigo-900/10 dark:to-blue-900/20 backdrop-blur-sm rounded-2xl border border-blue-200/50 dark:border-blue-800/30 shadow-md">
                    <h4 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-4 flex items-center gap-2">
                      💡 Upload Tips
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400">•</span>
                        <span>Use descriptive file names for better organization</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400">•</span>
                        <span>Optimize images for web to reduce file sizes</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400">•</span>
                        <span>WebP and AVIF formats provide best compression</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400">•</span>
                        <span>Files are automatically processed and optimized</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </Card>
        </motion.div>

        {/* Media Directory Structure - Lazy loaded */}
        <Suspense fallback={
          <Card className="p-8 animate-pulse bg-white/80 dark:bg-gray-800/80">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-xl animate-pulse"></div>
              <div>
                <div className="w-48 h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-2"></div>
                <div className="w-64 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="w-full h-16 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
          </Card>
        }>
          <MediaDirectoryView />
        </Suspense>

      </div>
      
      {/* Premium Processing Overlay - Lazy loaded */}
      {isProcessing && (
        <Suspense fallback={null}>
          <ProcessingOverlay
            isVisible={isProcessing}
            stage={processingStage}
            uploadProgress={uploadProgress}
            fileName={currentFileName}
          />
        </Suspense>
      )}
    </div>
  )
}