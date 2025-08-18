'use client'

import { useState, useEffect, useRef, useCallback, useMemo, Suspense, lazy } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiArrowLeft,
  FiAlertCircle,
  FiClock,
  FiPlay,
  FiPause,
  FiRotateCcw,
  FiBarChart,
  FiTrendingUp,
  FiShield,
  FiZap
} from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { detectDeploymentEnvironment } from '@/lib/utils/deployment-detection'

// Dynamic imports for heavy components
const DataSourceSelection = lazy(() => import('./components/DataSourceSelection').then(module => ({ default: module.DataSourceSelection })))
const SmartDataImporter = lazy(() => import('./components/SmartDataImporter').then(module => ({ default: module.SmartDataImporter })))
const FileManagementSection = lazy(() => import('./components/FileManagementSection').then(module => ({ default: module.FileManagementSection })))
const AutoSync = lazy(() => import('../../../../components/admin/data-manager/AutoSync').then(module => ({ default: module.AutoSync })))
import { LoadingFallback } from './components/LoadingFallback'

interface FileItem {
  name: string
  size: number
  path: string
  lastModified?: string
}

interface DeletionProgress {
  table: string
  status: 'pending' | 'deleting' | 'completed' | 'failed'
  recordsDeleted: number
  message: string
  error?: string
}

interface InsertionProgress {
  table: string
  status: 'pending' | 'inserting' | 'completed' | 'failed'
  recordsInserted: number
  message: string
  error?: string
}

interface ImportPhase {
  phase: 'idle' | 'deleting' | 'deletion-complete' | 'inserting' | 'complete'
  deletionProgress: DeletionProgress[]
  insertionProgress: InsertionProgress[]
}

// File Type Restriction Modal - Simplified
function FileTypeRestrictionModal({ 
  isOpen, 
  onClose, 
  rejectedFiles 
}: {
  isOpen: boolean
  onClose: () => void
  rejectedFiles: string[]
}) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose()
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-lg w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                File Type Restriction
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Only JSON files are allowed. The following files were rejected:
            </p>
            
            <div className="space-y-2 mb-6 max-h-32 overflow-y-auto">
              {rejectedFiles.map((filename, index) => (
                <div key={index} className="p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-800 dark:text-red-200 font-mono">{filename}</p>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
              >
                Understood
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function DataManagerImportPage() {
  const router = useRouter()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [importProgress, setImportProgress] = useState(0)
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false)
  const [syncInterval, setSyncInterval] = useState(60)
  const [showFileTypeModal, setShowFileTypeModal] = useState(false)
  const [rejectedFiles, setRejectedFiles] = useState<string[]>([])
  const [selectedDataSource, setSelectedDataSource] = useState<'local' | 'vercel'>('local')
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [deploymentEnv, setDeploymentEnv] = useState(detectDeploymentEnvironment())
  const [uploadMessage, setUploadMessage] = useState('')
  const [fileList, setFileList] = useState<FileItem[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [isFileListExpanded, setIsFileListExpanded] = useState(false)
  
  // Database operation states
  const [importPhase, setImportPhase] = useState<ImportPhase>({
    phase: 'idle',
    deletionProgress: [],
    insertionProgress: []
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const [isInserting, setIsInserting] = useState(false)
  const [isUpdatingDataSource, setIsUpdatingDataSource] = useState(false)
  const [isLoadingConfig, setIsLoadingConfig] = useState(false)
  const [lastUpdateInfo, setLastUpdateInfo] = useState<any>(null)
  const [nextUpdateTime, setNextUpdateTime] = useState<string | null>(null)
  const [isAutoUpdateActive, setIsAutoUpdateActive] = useState(false)

  // Deployment environment detection and auto-selection
  useEffect(() => {
    const env = detectDeploymentEnvironment()
    setDeploymentEnv(env)
    
    // Auto-select Vercel storage on Vercel platform
    if (env.platform === 'vercel' && selectedDataSource === 'local') {
      console.log('🔍 Vercel deployment detected - auto-selecting Vercel Blob Storage')
      setSelectedDataSource('vercel')
    }
  }, [])

  // File upload handler
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const jsonFiles: File[] = []
    const rejected: string[] = []

    files.forEach((file) => {
      if (file.type === 'application/json' || file.name.toLowerCase().endsWith('.json')) {
        jsonFiles.push(file)
      } else {
        rejected.push(file.name)
      }
    })

    if (rejected.length > 0) {
      setRejectedFiles(rejected)
      setShowFileTypeModal(true)
    }

    if (jsonFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...jsonFiles])
      toast.success(`Added ${jsonFiles.length} JSON file${jsonFiles.length !== 1 ? 's' : ''}`)
    }

    // Reset input
    event.target.value = ''
  }, [])

  // Upload handler
  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to upload')
      return
    }

    setUploadStatus('uploading')
    setImportProgress(0)
    setUploadMessage('')

    try {
      const formData = new FormData()
      selectedFiles.forEach((file) => {
        formData.append('files', file)
      })
      formData.append('dataSource', selectedDataSource)

      // Progress simulation
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 100)

      const response = await fetch('/api/admin/data-manager/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      setImportProgress(100)
      setUploadStatus('success')
      setUploadMessage(`Successfully uploaded ${selectedFiles.length} file(s) to ${selectedDataSource === 'local' ? 'Local Data-Db Folder' : 'Vercel Blob Storage'}`)
      
      fetchFiles()
      toast.success(`🎉 Successfully uploaded ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}!`)
      
      // Reset after success
      setTimeout(() => {
        setSelectedFiles([])
        setImportProgress(0)
        setUploadStatus('idle')
        setUploadMessage('')
      }, 3000)

    } catch (error) {
      console.error('Upload failed:', error)
      setUploadStatus('error')
      setUploadMessage(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      toast.error('Upload failed. Please try again.')
    }
  }, [selectedFiles, selectedDataSource])

  // File management functions
  const fetchFiles = useCallback(async () => {
    setIsLoadingFiles(true)
    try {
      const response = await fetch(`/api/admin/data-manager/files?source=${selectedDataSource}`)
      if (response.ok) {
        const data = await response.json()
        setFileList(data.files || [])
      }
    } catch (error) {
      console.error('Failed to fetch files:', error)
      toast.error('Failed to load files')
    } finally {
      setIsLoadingFiles(false)
    }
  }, [selectedDataSource])

  const deleteFile = useCallback(async (filename: string) => {
    try {
      const response = await fetch('/api/admin/data-manager/files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, source: selectedDataSource }),
      })

      if (response.ok) {
        toast.success(`Deleted ${filename}`)
        fetchFiles()
      } else {
        throw new Error('Delete failed')
      }
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error(`Failed to delete ${filename}`)
    }
  }, [selectedDataSource, fetchFiles])

  // Data source management
  const handleDataSourceChange = useCallback(async (newDataSource: 'local' | 'vercel') => {
    if (newDataSource !== selectedDataSource) {
      setIsUpdatingDataSource(true)
      setSelectedDataSource(newDataSource)
      
      try {
        const response = await fetch('/api/admin/data-manager/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectedDataSource: newDataSource,
            autoUpdateEnabled: autoSyncEnabled,
            updateIntervalMinutes: syncInterval
          }),
        })

        if (response.ok) {
          await fetchFiles()
          toast.success(`Switched to ${newDataSource === 'local' ? 'Local Data-Db Folder' : 'Vercel Blob Storage'}`)
        }
      } catch (error) {
        console.error('Failed to update data source:', error)
        toast.error('Failed to update data source')
      } finally {
        setIsUpdatingDataSource(false)
      }
    }
  }, [selectedDataSource, autoSyncEnabled, syncInterval, fetchFiles])

  // Load initial data
  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={() => router.push('/admin/data-manager')}
              className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 group"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-[#00437f] dark:group-hover:text-[#00437f] transition-colors duration-200" />
            </Button>
            
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-[#00437f] to-[#003366] dark:from-white dark:via-[#00437f] dark:to-[#003366] bg-clip-text text-transparent">
                Data Import Center
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Import and manage your JSON data files with intelligent processing
              </p>
            </div>
          </div>
        </motion.div>

        {/* Data Source Selection */}
        <Suspense fallback={<LoadingFallback height="h-64" message="Loading data source options..." />}>
          <DataSourceSelection
            selectedDataSource={selectedDataSource}
            isUpdatingDataSource={isUpdatingDataSource}
            isLoadingConfig={isLoadingConfig}
            handleDataSourceChange={handleDataSourceChange}
          />
        </Suspense>

        {/* Smart Data Importer */}
        <Suspense fallback={<LoadingFallback height="h-48" message="Loading data importer..." />}>
          <SmartDataImporter
            selectedDataSource={selectedDataSource}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            importProgress={importProgress}
            uploadStatus={uploadStatus}
            uploadMessage={uploadMessage}
            handleFileUpload={handleFileUpload}
            handleUpload={handleUpload}
            setShowFileTypeModal={setShowFileTypeModal}
          />
        </Suspense>

        {/* File Management */}
        <Suspense fallback={<LoadingFallback height="h-48" message="Loading file management..." />}>
          <FileManagementSection
            selectedDataSource={selectedDataSource}
            fileList={fileList}
            isLoadingFiles={isLoadingFiles}
            isFileListExpanded={isFileListExpanded}
            setIsFileListExpanded={setIsFileListExpanded}
            fetchFiles={fetchFiles}
            deleteFile={deleteFile}
          />
        </Suspense>

        {/* Auto Sync */}
        <Suspense fallback={<LoadingFallback height="h-32" message="Loading auto sync..." />}>
          <AutoSync
            enabled={autoSyncEnabled}
            onToggle={setAutoSyncEnabled}
            interval={syncInterval}
            onIntervalChange={setSyncInterval}
            selectedDataSource={selectedDataSource}
          />
        </Suspense>

        {/* File Type Restriction Modal */}
        <FileTypeRestrictionModal
          isOpen={showFileTypeModal}
          onClose={() => setShowFileTypeModal(false)}
          rejectedFiles={rejectedFiles}
        />
      </div>
    </div>
  )
}