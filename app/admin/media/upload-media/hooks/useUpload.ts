'use client'

import { useState, useCallback } from 'react'
import type { SelectedFile, UploadFolder } from '../types'
import { generateId, validateFile, getUploadEndpoint } from '../utils'

// Inline constant to reduce bundle size
const MAX_FILES = 50000
import { useUploadWithRefresh, useUploadProgress } from './useUploadWithRefresh'

export function useUpload() {
  const [selectedFolder, setSelectedFolder] = useState<UploadFolder | null>(null)
  const [files, setFiles] = useState<SelectedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  
  // Premium upload experience hooks
  const uploadWithRefresh = useUploadWithRefresh()
  const uploadProgress = useUploadProgress()

  // Add logging to folder selection
  const handleSetSelectedFolder = useCallback((folder: UploadFolder) => {
    console.log('📁 FOLDER SELECTED:', folder)
    console.log('📁 FOLDER ID:', `"${folder.id}"`)
    console.log('📁 FOLDER TYPE:', typeof folder.id)
    setSelectedFolder(folder)
  }, [])

  const addFiles = useCallback((fileList: FileList) => {
    const newFiles: SelectedFile[] = []
    const errors: string[] = []

    // Check file limit (5000 files)
    if (files.length + fileList.length > MAX_FILES) {
      errors.push(`Maximum ${MAX_FILES} files allowed`)
      return
    }

    Array.from(fileList).forEach((file) => {
      const validationError = validateFile(file)
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`)
        return
      }

      newFiles.push({
        file,
        id: generateId(),
        status: 'pending',
        progress: 0
      })
    })

    if (errors.length > 0) {
      console.error(`Upload errors:\n${errors.join('\n')}`)
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles])
    }
  }, [files.length])

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }, [])

  const clearAllFiles = useCallback(() => {
    setFiles([])
  }, [])

  const updateFileProgress = useCallback((fileId: string, progress: number) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, progress, status: 'uploading' as const } 
        : f
    ))
  }, [])

  const updateFileStatus = useCallback((
    fileId: string, 
    status: SelectedFile['status'], 
    error?: string
  ) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { 
            ...f, 
            status, 
            error, 
            progress: status === 'success' ? 100 : f.progress 
          } 
        : f
    ))
  }, [])

  const uploadFile = useCallback(async (
    selectedFile: SelectedFile, 
    folder: UploadFolder
  ): Promise<void> => {
    console.log(`🚀 Starting upload: ${selectedFile.file.name} → ${folder.name}`)
    
    const formData = new FormData()
    formData.append('file', selectedFile.file)
    
    // Check for banner folders - simplified detection
    const isBannerFolder = folder.id === 'main-banners' || folder.id === 'mini-banners'
    console.log('🎯 Banner folder check:', { folderId: folder.id, isBannerFolder })
    
    if (isBannerFolder) {
      console.log('✅ Banner folder detected!')
      console.log('🔍 DEBUG - Original filename:', selectedFile.file.name)
      console.log('🔍 DEBUG - Folder ID:', folder.id)
      // Use original filename as bannerName to preserve the file name
      const bannerName = selectedFile.file.name.replace(/\.[^/.]+$/, '') // Remove extension
      console.log('📝 Adding bannerName (original filename):', bannerName)
      formData.append('bannerName', bannerName)
      // Also send folder type to determine banner type correctly
      formData.append('folderType', folder.id)
      console.log('📝 Adding folderType:', folder.id)
    } else if (folder.id === 'products') {
      // Generate a unique styleId for the uploaded product image
      const styleId = `style_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
      formData.append('styleId', styleId)
      formData.append('isAlternate', 'false')
      formData.append('isVariant', 'false')
    } else if (folder.id === 'users') {
      // User profile API only needs the file
    } else if (folder.id === 'brands') {
      // Brand logo API expects brandId and optionally brandName
      const brandId = `brand_${Date.now()}`
      formData.append('brandId', brandId)
      formData.append('brandName', selectedFile.file.name.replace(/\.[^/.]+$/, ''))
    } else if (folder.id === 'site') {
      // Site asset API expects 'type' parameter (logo or favicon)
      formData.append('type', 'logo') // Default to logo for general site assets
    } else if (folder.id === 'pages') {
      // Page image API expects pageName and imageType
      formData.append('pageName', `page_${Date.now()}`)
      formData.append('imageType', 'content') // Default to content image
    } else {
      console.log('⚠️ Unknown folder type, using generic parameters:', folder.id)
      formData.append('folder', folder.path)
      formData.append('category', folder.id)
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          updateFileProgress(selectedFile.id, progress)
          // Update premium progress tracker
          uploadProgress.updateProgress(selectedFile.id, progress, selectedFile.file.name)
        }
      }

      xhr.onload = () => {
        console.log(`📡 Response: ${xhr.status} ${xhr.statusText}`)
        
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('✅ Upload successful')
          updateFileStatus(selectedFile.id, 'success')
          resolve()
        } else {
          console.log('❌ Upload failed:', xhr.responseText)
          
          let errorMessage = 'Upload failed'
          try {
            const response = JSON.parse(xhr.responseText)
            errorMessage = response.error || xhr.statusText
          } catch (parseError) {
            errorMessage = xhr.statusText || 'Unknown error'
          }
          
          updateFileStatus(selectedFile.id, 'error', errorMessage)
          reject(new Error(errorMessage))
        }
      }

      xhr.onerror = () => {
        updateFileStatus(selectedFile.id, 'error', 'Network error')
        reject(new Error('Network error'))
      }

      xhr.ontimeout = () => {
        updateFileStatus(selectedFile.id, 'error', 'Upload timeout')
        reject(new Error('Upload timeout'))
      }

      const endpoint = getUploadEndpoint(folder.id)
      console.log(`🎯 Uploading to: ${endpoint} for folder: ${folder.id}`)
      
      // Debug FormData contents
      const formDataEntries = Array.from(formData.entries())
      console.log('📦 FormData entries:', formDataEntries.map(([key, value]) => 
        key === 'file' ? [key, `File: ${(value as File).name}`] : [key, value]
      ))
      
      xhr.open('POST', endpoint, true)
      xhr.timeout = 60000 // 60 second timeout
      xhr.send(formData)
    })
  }, [updateFileProgress, updateFileStatus])

  const startUpload = useCallback(async () => {
    if (!selectedFolder || files.length === 0) return

    // Use premium upload experience with refresh
    await uploadWithRefresh.handleUploadWithRefresh(async () => {
      setIsUploading(true)
      uploadProgress.resetProgress()

      try {
        const pendingFiles = files.filter(f => f.status === 'pending')
        
        // Upload files sequentially to avoid overwhelming the server
        for (const file of pendingFiles) {
          try {
            await uploadFile(file, selectedFolder)
          } catch (error) {
            console.error(`Failed to upload ${file.file.name}:`, error)
            // Continue with other files even if one fails
          }
        }

        const successCount = files.filter(f => f.status === 'success').length
        const errorCount = files.filter(f => f.status === 'error').length
        
        if (successCount > 0) {
          console.log(
            `Successfully uploaded ${successCount} file(s) to ${selectedFolder.name}${
              errorCount > 0 ? ` (${errorCount} failed)` : ''
            }`
          )
        } else if (errorCount > 0) {
          console.error('All uploads failed. Please check the files and try again.')
        }

      } catch (error) {
        console.error('Upload error:', error)
        throw error // Re-throw to be handled by uploadWithRefresh
      } finally {
        setIsUploading(false)
      }
    }, () => {
      // Success callback: Clear all files after successful upload
      console.log('🎉 Upload completed! Clearing file queue...')
      clearAllFiles()
    })
  }, [selectedFolder, files, uploadFile, uploadWithRefresh, uploadProgress, clearAllFiles])

  return {
    selectedFolder,
    setSelectedFolder: handleSetSelectedFolder, // Use the logging version
    files,
    isUploading,
    addFiles,
    removeFile,
    clearAllFiles,
    startUpload,
    // Premium upload experience
    isProcessing: uploadWithRefresh.isProcessing,
    processingStage: uploadWithRefresh.processingStage,
    uploadProgress: uploadProgress.progress,
    currentFileName: uploadProgress.fileName
  }
}