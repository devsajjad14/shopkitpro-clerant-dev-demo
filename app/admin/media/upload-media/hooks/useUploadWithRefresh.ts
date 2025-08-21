'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { SelectedFile, UploadFolder } from '../types'

type ProcessingStage = 'uploading' | 'processing' | 'refreshing' | 'complete'

interface UseUploadWithRefreshReturn {
  isProcessing: boolean
  processingStage: ProcessingStage
  uploadProgress: number
  currentFileName: string
  handleUploadWithRefresh: (uploadFn: () => Promise<void>, onSuccess?: () => void) => Promise<void>
}

export function useUploadWithRefresh(): UseUploadWithRefreshReturn {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('uploading')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentFileName, setCurrentFileName] = useState('')

  const handleUploadWithRefresh = useCallback(async (uploadFn: () => Promise<void>, onSuccess?: () => void) => {
    try {
      setIsProcessing(true)
      setProcessingStage('uploading')
      setUploadProgress(0)

      // Execute the upload function
      await uploadFn()

      // Move to processing stage
      setProcessingStage('processing')
      await new Promise(resolve => setTimeout(resolve, 1500)) // Give time for processing

      // Move to refreshing stage
      setProcessingStage('refreshing')
      await new Promise(resolve => setTimeout(resolve, 800))

      // Show completion
      setProcessingStage('complete')
      await new Promise(resolve => setTimeout(resolve, 1200))

      // Call success callback to clear files
      if (onSuccess) {
        onSuccess()
      }

      // Hard reload the page to completely refresh everything
      window.location.reload()

    } catch (error) {
      console.error('Upload with refresh failed:', error)
      throw error
    } finally {
      setIsProcessing(false)
      setUploadProgress(0)
      setCurrentFileName('')
    }
  }, [router])

  return {
    isProcessing,
    processingStage,
    uploadProgress,
    currentFileName,
    handleUploadWithRefresh
  }
}

// Enhanced upload progress tracking
export function useUploadProgress() {
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState('')

  const updateProgress = useCallback((fileId: string, newProgress: number, filename?: string) => {
    setProgress(newProgress)
    if (filename) {
      setFileName(filename)
    }
  }, [])

  const resetProgress = useCallback(() => {
    setProgress(0)
    setFileName('')
  }, [])

  return {
    progress,
    fileName,
    updateProgress,
    resetProgress
  }
}