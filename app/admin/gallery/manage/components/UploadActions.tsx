'use client'

import { motion } from 'framer-motion'
import { FiZap, FiLoader } from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { SelectedFile, UploadFolder } from '../types'

interface UploadActionsProps {
  selectedFolder: UploadFolder | null
  files: SelectedFile[]
  isUploading: boolean
  onStartUpload: () => void
  onClearAll: () => void
}

export default function UploadActions({
  selectedFolder,
  files,
  isUploading,
  onStartUpload,
  onClearAll
}: UploadActionsProps) {
  const pendingFiles = files.filter(f => f.status === 'pending')
  const canUpload = selectedFolder && pendingFiles.length > 0 && !isUploading
  const hasFiles = files.length > 0

  if (!hasFiles) {
    return null
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {pendingFiles.length} file{pendingFiles.length !== 1 ? 's' : ''} ready
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedFolder ? `Upload to ${selectedFolder.name}` : 'Select folder first'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onClearAll}
            disabled={isUploading}
            className="px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700"
          >
            Clear
          </Button>
          
          <Button
            onClick={onStartUpload}
            disabled={!canUpload}
            className="px-6 py-2 bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002244] text-white font-semibold shadow-lg"
          >
            {isUploading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <FiLoader className="w-4 h-4" />
                </motion.div>
                Uploading...
              </>
            ) : (
              <>
                <FiZap className="w-4 h-4 mr-2" />
                Upload {pendingFiles.length} File{pendingFiles.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}