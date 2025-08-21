'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUploadCloud, FiImage, FiFileText, FiAlertCircle } from 'react-icons/fi'
import { ALLOWED_FILE_TYPES, MAX_FILES, MAX_FILE_SIZE } from '../config'

interface FileUploaderProps {
  onFilesSelect: (files: FileList) => void
  disabled?: boolean
  selectedFolder: string | null
}

export default function FileUploader({ 
  onFilesSelect, 
  disabled = false,
  selectedFolder 
}: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    setDragCounter(0)
    
    if (!disabled && e.dataTransfer.files) {
      onFilesSelect(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter(prev => prev + 1)
    if (!isDragOver) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter(prev => {
      const newCounter = prev - 1
      if (newCounter === 0) {
        setIsDragOver(false)
      }
      return newCounter
    })
  }

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesSelect(e.target.files)
    }
    // Reset input value to allow same file selection again
    e.target.value = ''
  }

  // Show folder selection prompt with animation
  if (!selectedFolder) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-12 border-2 border-dashed border-gray-300 rounded-2xl text-center bg-gray-50/50 backdrop-blur-sm"
      >
        <motion.div
          animate={{ 
            rotate: [0, -5, 5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            repeatDelay: 3
          }}
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl mb-6"
        >
          <FiImage className="w-8 h-8 text-white" />
        </motion.div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Select a Folder First
        </h3>
        <p className="text-gray-600 mb-4 max-w-sm mx-auto">
          Choose your destination folder above to unlock the file upload area
        </p>
        
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 bg-gray-400 rounded-full"
          />
          <span>Waiting for folder selection</span>
        </div>
      </motion.div>
    )
  }

  // Main upload area with stunning animations
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_FILE_TYPES.join(',')}
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
        />
        
        {/* Upload Drop Zone */}
        <motion.div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
          whileHover={{ scale: disabled ? 1 : 1.02 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          className={`relative p-12 border-2 border-dashed rounded-3xl text-center transition-all duration-300 cursor-pointer group ${
            isDragOver
              ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 scale-105'
              : disabled
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
              : 'border-gray-300 bg-gradient-to-br from-white to-gray-50 hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50'
          }`}
        >
          {/* Animated Background Effects */}
          <AnimatePresence>
            {isDragOver && (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-3xl"
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-blue-500/5 rounded-3xl animate-pulse"
                />
              </>
            )}
          </AnimatePresence>

          {/* Upload Icon with Animation */}
          <motion.div
            animate={{
              y: isDragOver ? [-5, 5, -5] : [0, -10, 0],
              rotate: isDragOver ? [0, 5, -5, 0] : 0
            }}
            transition={{
              duration: isDragOver ? 0.6 : 2,
              repeat: Infinity,
              repeatDelay: isDragOver ? 0 : 1
            }}
            className="relative z-10 mb-6"
          >
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-3xl transition-all duration-300 ${
              isDragOver
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/30'
                : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 group-hover:from-blue-100 group-hover:to-indigo-100 group-hover:text-blue-600'
            }`}>
              <FiUploadCloud className="w-10 h-10" />
            </div>
          </motion.div>

          {/* Content */}
          <div className="relative z-10">
            <motion.h3
              animate={{ scale: isDragOver ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.6, repeat: isDragOver ? Infinity : 0 }}
              className={`text-2xl font-bold mb-3 transition-colors duration-300 ${
                isDragOver ? 'text-blue-900' : 'text-gray-900 group-hover:text-blue-900'
              }`}
            >
              {isDragOver ? 'Drop files here!' : 'Upload your files'}
            </motion.h3>
            
            <p className={`text-lg mb-6 transition-colors duration-300 ${
              isDragOver ? 'text-blue-700' : 'text-gray-600 group-hover:text-blue-700'
            }`}>
              {isDragOver ? 'Release to upload' : (
                <>Drag & drop files or <span className="font-semibold text-blue-600 underline">browse</span> to upload to <span className="font-bold">{selectedFolder}</span></>
              )}
            </p>

            {/* File Types & Limits */}
            <div className="space-y-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-300 ${
                  isDragOver 
                    ? 'bg-white border-blue-200 text-blue-900 shadow-lg' 
                    : 'bg-white border-gray-200 text-gray-700 group-hover:border-blue-200 group-hover:text-blue-700'
                }`}
              >
                <FiImage className="w-5 h-5" />
                <span className="font-medium">JPG, PNG, GIF, WebP, SVG</span>
              </motion.div>
              
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <FiFileText className="w-4 h-4" />
                  <span>Max {MAX_FILES} files</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiAlertCircle className="w-4 h-4" />
                  <span>{MAX_FILE_SIZE / 1024 / 1024}MB per file</span>
                </div>
              </div>
            </div>
          </div>

          {/* Drag Overlay Effect */}
          <AnimatePresence>
            {isDragOver && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-4 border-2 border-blue-400 border-dashed rounded-2xl bg-blue-500/10 backdrop-blur-sm flex items-center justify-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="text-blue-600 font-bold text-xl"
                >
                  Release to Upload!
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}