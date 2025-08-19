'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiUpload, 
  FiDatabase, 
  FiFileText, 
  FiCheckCircle, 
  FiAlertCircle,
  FiClock,
  FiRefreshCw,
  FiToggleRight,
  FiToggleLeft,
  FiSettings,
  FiBarChart,
  FiTrendingUp,
  FiShield,
  FiZap,
  FiArrowLeft,
  FiPlay,
  FiPause,
  FiRotateCcw,
  FiInfo,
  FiTrash2,
  FiX,
  FiFolder,
  FiFile,
  FiChevronDown,
  FiChevronRight,
  FiPlus,
  FiDownload,
  FiImage,
  FiUploadCloud
} from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

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

interface MediaUploadProgress {
  file: string
  status: 'pending' | 'uploading' | 'completed' | 'skipped' | 'failed'
  message: string
  category?: string
  error?: string
}

interface MediaUploadPhase {
  phase: 'idle' | 'uploading' | 'complete'
  uploadProgress: MediaUploadProgress[]
  totalFiles: number
  uploadedFiles: number
  skippedFiles: number
  platform: string
  processedFolders?: string[]
  currentFolder?: string
  folderStates?: Array<{
    name: string
    status: 'pending' | 'processing' | 'completed'
    files: number
  }>
}

// World-Class Premium Demo Data Loading Experience
function DemoDataLoadPopup({ 
  isOpen, 
  importPhase, 
  isDeleting, 
  isInserting, 
  onReset, 
  onContinueInsertion,
  onClose 
}: {
  isOpen: boolean
  importPhase: ImportPhase
  isDeleting: boolean
  isInserting: boolean
  onReset: () => void
  onContinueInsertion: () => void
  onClose?: () => void
}) {
  const router = useRouter()

  // Auto-redirect after completion
  useEffect(() => {
    if (importPhase.phase === 'complete') {
      const timer = setTimeout(() => {
        if (onClose) {
          onClose()
        }
        router.push('/admin')
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [importPhase.phase, onClose, router])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {/* Expert-Level Cinematic Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      >
        {/* Sophisticated Multi-Layer Background */}
        <div className="absolute inset-0">
          {/* Primary Gradient Layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-gray-900/98 to-slate-800/95" />
          
          {/* Secondary Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#00437f]/10 via-transparent to-[#00437f]/5" />
          
          {/* Premium Orbital Effects */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 360],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-conic from-[#00437f]/20 via-transparent to-[#00437f]/20 rounded-full blur-3xl"
          />
          
          <motion.div
            animate={{
              scale: [1.2, 0.8, 1.2],
              rotate: [-360, 0],
              opacity: [0.05, 0.2, 0.05]
            }}
            transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-conic from-blue-500/10 via-transparent to-[#00437f]/15 rounded-full blur-3xl"
          />
          
          {/* Elite Floating Elements */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                x: [0, Math.random() * 400 - 200, 0],
                y: [0, Math.random() * 400 - 200, 0],
                opacity: [0, 0.6, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 10 + Math.random() * 8,
                repeat: Infinity,
                delay: Math.random() * 8,
                ease: "easeInOut"
              }}
              className="absolute w-1 h-1 bg-[#00437f]/40 rounded-full blur-[0.5px]"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
            />
          ))}
        </div>

        {/* World-Class Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 40, rotateX: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 40, rotateX: -12 }}
          transition={{ 
            duration: 1.4, 
            ease: [0.16, 1, 0.3, 1],
            type: "spring",
            stiffness: 120,
            damping: 20
          }}
          className="relative w-full max-w-lg mx-4"
        >
          {/* Elite Outer Aura */}
          <motion.div
            animate={{
              scale: [1, 1.03, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-8 bg-gradient-to-r from-[#00437f]/30 via-blue-500/20 to-[#00437f]/30 rounded-[3rem] blur-2xl"
          />
          
          {/* Premium Glass Morphism Container */}
          <div className="relative">
            {/* Multi-Layer Background */}
            <div className="absolute inset-0 bg-white/95 backdrop-blur-2xl rounded-2xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/90 to-gray-50/80 rounded-2xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#00437f]/5 to-transparent rounded-2xl" />
            
            {/* Elite Border System */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#00437f]/20 via-transparent to-[#00437f]/20 p-[1px]">
              <div className="h-full w-full rounded-2xl bg-gradient-to-br from-white/95 via-white/98 to-gray-50/95" />
            </div>
            
            {/* Dynamic Accent Lines */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, delay: 0.8, ease: "easeOut" }}
              className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-[#00437f] to-transparent rounded-t-2xl"
            />
            
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, delay: 1.2, ease: "easeOut" }}
              className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-[#00437f]/60 to-transparent rounded-b-2xl"
            />
            
            {/* Main Content Area */}
            <div className="relative z-10 p-6">
              {/* Ultra-Compact Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center mb-4"
              >
                {/* Minimal Premium Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.3,
                    type: "spring",
                    stiffness: 400,
                    damping: 25
                  }}
                  className="relative inline-flex mb-3"
                >
                  {/* Sleek Icon Container */}
                  <div className="relative w-12 h-12 bg-gradient-to-br from-[#00437f] via-[#0066cc] to-[#00437f] rounded-lg flex items-center justify-center shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg" />
                    <motion.div
                      animate={{
                        scale: [1, 1.03, 1],
                        rotateY: [0, 180, 360]
                      }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <FiDatabase className="w-6 h-6 text-white relative z-10" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Streamlined Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-lg font-bold mb-3 tracking-tight"
                >
                  <span className="bg-gradient-to-r from-[#00437f] via-black to-[#00437f] bg-clip-text text-transparent">
                    Demo Data Engine
                  </span>
                </motion.h2>
                
                {/* Compact Progress Metrics */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="flex items-center justify-center gap-4"
                >
                  {importPhase.phase === 'deleting' && (
                    <>
                      <div className="text-center px-3 py-1.5 bg-gray-50/60 rounded-lg border border-gray-200/40">
                        <motion.div
                          key={importPhase.deletionProgress.filter(p => p.status === 'completed').length}
                          initial={{ scale: 1.05, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.25 }}
                          className="text-lg font-bold text-gray-900"
                        >
                          {importPhase.deletionProgress.filter(p => p.status === 'completed').length}
                        </motion.div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Cleared</div>
                      </div>
                      <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
                      <div className="text-center px-3 py-1.5 bg-gray-50/40 rounded-lg border border-gray-200/20">
                        <div className="text-lg font-bold text-gray-500">
                          {importPhase.deletionProgress.length - importPhase.deletionProgress.filter(p => p.status === 'completed').length}
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Remaining</div>
                      </div>
                    </>
                  )}
                  {importPhase.phase === 'inserting' && (
                    <>
                      <div className="text-center px-3 py-1.5 bg-gray-50/60 rounded-lg border border-gray-200/40">
                        <motion.div
                          key={importPhase.insertionProgress.filter(p => p.status === 'completed').length}
                          initial={{ scale: 1.05, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.25 }}
                          className="text-lg font-bold text-gray-900"
                        >
                          {importPhase.insertionProgress.filter(p => p.status === 'completed').length}
                        </motion.div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Loaded</div>
                      </div>
                      <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
                      <div className="text-center px-3 py-1.5 bg-gray-50/40 rounded-lg border border-gray-200/20">
                        <div className="text-lg font-bold text-gray-500">
                          {importPhase.insertionProgress.length - importPhase.insertionProgress.filter(p => p.status === 'completed').length}
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Remaining</div>
                      </div>
                    </>
                  )}
                </motion.div>
              </motion.div>

              {/* Premium Operation Display - Perfectly Centered */}
              <div className="flex items-center justify-center py-2">
                {importPhase.phase === 'deleting' && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center w-full"
                  >
                    {(() => {
                      const currentDeleting = importPhase.deletionProgress.find(p => p.status === 'deleting')
                      const lastCompleted = importPhase.deletionProgress.filter(p => p.status === 'completed').slice(-1)[0]
                      const currentTable = currentDeleting || lastCompleted
                      
                      if (!currentTable) return null
                      
                      return (
                        <div className="max-w-lg mx-auto">
                          {/* Elite Status Indicator */}
                          <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ 
                              duration: 0.8,
                              type: "spring",
                              stiffness: 200,
                              damping: 15
                            }}
                            className="relative mb-6 flex items-center justify-center"
                          >
                            {/* Premium Compact Loader */}
                            <div className="relative w-24 h-24">
                              {/* Outer Ring */}
                              <motion.div
                                animate={{ rotate: currentTable.status === 'deleting' ? 360 : 0 }}
                                transition={{ 
                                  duration: currentTable.status === 'deleting' ? 2 : 0,
                                  repeat: currentTable.status === 'deleting' ? Infinity : 0,
                                  ease: "linear"
                                }}
                                className="absolute inset-0 border-4 border-gray-200/30 border-t-[#00437f]/80 rounded-full"
                              />
                              
                              {/* Inner Ring */}
                              <motion.div
                                animate={{ rotate: currentTable.status === 'deleting' ? -360 : 0 }}
                                transition={{ 
                                  duration: currentTable.status === 'deleting' ? 1.5 : 0,
                                  repeat: currentTable.status === 'deleting' ? Infinity : 0,
                                  ease: "linear"
                                }}
                                className="absolute inset-4 border-2 border-gray-100/30 border-b-[#00437f]/60 rounded-full"
                              />
                              
                              {/* Center Icon */}
                              <div className={`absolute inset-4 rounded-full flex items-center justify-center shadow-2xl ${
                                currentTable.status === 'completed' 
                                  ? 'bg-gradient-to-br from-[#00437f] to-[#0066cc]' 
                                  : currentTable.status === 'deleting'
                                  ? 'bg-gradient-to-br from-[#00437f] to-black'
                                  : 'bg-gradient-to-br from-gray-500 to-gray-700'
                              }`}>
                                <motion.div
                                  animate={currentTable.status === 'deleting' ? {
                                    scale: [1, 1.2, 1],
                                    rotateX: [0, 180, 360]
                                  } : {}}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                  {currentTable.status === 'deleting' && <FiTrash2 className="w-6 h-6 text-white" />}
                                  {currentTable.status === 'completed' && <FiCheckCircle className="w-6 h-6 text-white" />}
                                  {currentTable.status === 'failed' && <FiAlertCircle className="w-6 h-6 text-white" />}
                                </motion.div>
                              </div>
                              
                              {/* Energy Field */}
                              <motion.div
                                animate={{
                                  scale: [1, 1.2, 1],
                                  opacity: [0.2, 0.4, 0.2]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className={`absolute -inset-6 rounded-full blur-xl ${
                                  currentTable.status === 'completed' 
                                    ? 'bg-[#00437f]/30' 
                                    : currentTable.status === 'deleting'
                                    ? 'bg-[#00437f]/30'
                                    : 'bg-gray-500/30'
                                }`}
                              />
                            </div>
                          </motion.div>

                          {/* Premium Action Description */}
                          <motion.div
                            key={currentTable.table + currentTable.status}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center"
                          >
                            <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight capitalize">
                              {currentTable.status === 'deleting' && `Clearing ${currentTable.table.replace('_', ' ')}`}
                              {currentTable.status === 'completed' && `✓ Cleared ${currentTable.table.replace('_', ' ')}`}
                              {currentTable.status === 'failed' && `✗ Failed ${currentTable.table.replace('_', ' ')}`}
                            </h3>
                            
                            <p className="text-gray-600 mb-6 text-lg">
                              {currentTable.message}
                            </p>
                            
                            {/* Elite Stats Badge */}
                            {currentTable.recordsDeleted > 0 && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="inline-flex items-center gap-3 px-6 py-3 bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-200/50"
                              >
                                <div className="w-2 h-2 bg-[#00437f] rounded-full animate-pulse" />
                                <span className="text-gray-900 font-semibold tracking-wide">
                                  {currentTable.recordsDeleted.toLocaleString()} records processed
                                </span>
                              </motion.div>
                            )}
                          </motion.div>
                        </div>
                      )
                    })()}
                  </motion.div>
                )}

                {importPhase.phase === 'inserting' && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center w-full"
                  >
                    {(() => {
                      const currentInserting = importPhase.insertionProgress.find(p => p.status === 'inserting')
                      const lastCompleted = importPhase.insertionProgress.filter(p => p.status === 'completed').slice(-1)[0]
                      const currentTable = currentInserting || lastCompleted
                      
                      if (!currentTable) return null
                      
                      return (
                        <div className="max-w-lg mx-auto">
                          {/* Elite Loading Animation */}
                          <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ 
                              duration: 0.8,
                              type: "spring",
                              stiffness: 200,
                              damping: 15
                            }}
                            className="relative mb-6 flex items-center justify-center"
                          >
                            {/* Premium Data Flow Loader */}
                            <div className="relative w-24 h-24">
                              {/* Data Stream Rings */}
                              <motion.div
                                animate={{ rotate: currentTable.status === 'inserting' ? 360 : 0 }}
                                transition={{ 
                                  duration: currentTable.status === 'inserting' ? 3 : 0,
                                  repeat: currentTable.status === 'inserting' ? Infinity : 0,
                                  ease: "linear"
                                }}
                                className="absolute inset-0 border-4 border-transparent border-t-[#00437f] border-r-[#00437f]/60 rounded-full"
                              />
                              
                              <motion.div
                                animate={{ rotate: currentTable.status === 'inserting' ? -360 : 0 }}
                                transition={{ 
                                  duration: currentTable.status === 'inserting' ? 2 : 0,
                                  repeat: currentTable.status === 'inserting' ? Infinity : 0,
                                  ease: "linear"
                                }}
                                className="absolute inset-3 border-2 border-transparent border-b-white/60 border-l-white/40 rounded-full"
                              />
                              
                              {/* Center Download Icon */}
                              <div className={`absolute inset-4 rounded-full flex items-center justify-center shadow-2xl ${
                                currentTable.status === 'completed' 
                                  ? 'bg-gradient-to-br from-[#00437f] to-[#0066cc]' 
                                  : currentTable.status === 'inserting'
                                  ? 'bg-gradient-to-br from-[#00437f] to-[#0066cc]'
                                  : 'bg-gradient-to-br from-gray-500 to-gray-700'
                              }`}>
                                <motion.div
                                  animate={currentTable.status === 'inserting' ? {
                                    y: [0, -4, 0],
                                    scale: [1, 1.1, 1]
                                  } : {}}
                                  transition={{ duration: 1, repeat: Infinity }}
                                >
                                  {currentTable.status === 'inserting' && <FiDownload className="w-6 h-6 text-white" />}
                                  {currentTable.status === 'completed' && <FiCheckCircle className="w-6 h-6 text-white" />}
                                  {currentTable.status === 'failed' && <FiAlertCircle className="w-6 h-6 text-white" />}
                                </motion.div>
                              </div>
                              
                              {/* Data Particles */}
                              {currentTable.status === 'inserting' && [...Array(6)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  animate={{
                                    y: [0, -40, 0],
                                    opacity: [0, 1, 0],
                                    scale: [0, 1, 0]
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                    ease: "easeInOut"
                                  }}
                                  className="absolute w-1 h-1 bg-white/80 rounded-full"
                                  style={{
                                    left: `${45 + Math.cos(i * 60 * Math.PI / 180) * 15}%`,
                                    top: `${45 + Math.sin(i * 60 * Math.PI / 180) * 15}%`
                                  }}
                                />
                              ))}
                              
                              {/* Energy Aura */}
                              <motion.div
                                animate={{
                                  scale: [1, 1.3, 1],
                                  opacity: [0.2, 0.4, 0.2]
                                }}
                                transition={{ duration: 2.5, repeat: Infinity }}
                                className={`absolute -inset-6 rounded-full blur-xl ${
                                  currentTable.status === 'completed' 
                                    ? 'bg-[#00437f]/30' 
                                    : currentTable.status === 'inserting'
                                    ? 'bg-[#00437f]/30'
                                    : 'bg-gray-500/30'
                                }`}
                              />
                            </div>
                          </motion.div>

                          {/* Premium Status Text */}
                          <motion.div
                            key={currentTable.table + currentTable.status}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center"
                          >
                            <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight capitalize">
                              {currentTable.status === 'inserting' && `Loading ${currentTable.table.replace('_', ' ')}`}
                              {currentTable.status === 'completed' && `✓ Loaded ${currentTable.table.replace('_', ' ')}`}
                              {currentTable.status === 'failed' && `✗ Failed ${currentTable.table.replace('_', ' ')}`}
                            </h3>
                            
                            <p className="text-gray-600 mb-6 text-lg">
                              {currentTable.message}
                            </p>
                            
                            {/* Premium Records Badge */}
                            {currentTable.recordsInserted > 0 && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="inline-flex items-center gap-3 px-6 py-3 bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-200/50"
                              >
                                <div className="w-2 h-2 bg-[#00437f] rounded-full animate-pulse" />
                                <span className="text-gray-900 font-semibold tracking-wide">
                                  {currentTable.recordsInserted.toLocaleString()} records loaded
                                </span>
                              </motion.div>
                            )}
                          </motion.div>
                        </div>
                      )
                    })()}
                  </motion.div>
                )}

                {importPhase.phase === 'complete' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      duration: 1.2,
                      type: "spring",
                      stiffness: 200,
                      damping: 15
                    }}
                    className="text-center"
                  >
                    {/* Victory Animation */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        duration: 0.8,
                        type: "spring",
                        stiffness: 300,
                        damping: 10,
                        delay: 0.2
                      }}
                      className="relative mb-8 flex items-center justify-center"
                    >
                      <div className="relative w-24 h-24">
                        {/* Success Ring */}
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="absolute inset-0 border-4 border-[#00437f]/30 border-t-[#00437f] rounded-full"
                        />
                        
                        {/* Inner Success Indicator */}
                        <div className="absolute inset-4 bg-gradient-to-br from-[#00437f] to-[#0066cc] rounded-full flex items-center justify-center shadow-2xl">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ 
                              duration: 0.6,
                              type: "spring",
                              stiffness: 300,
                              delay: 0.5
                            }}
                          >
                            <FiCheckCircle className="w-8 h-8 text-white" />
                          </motion.div>
                        </div>
                        
                        {/* Success Particles */}
                        {[...Array(12)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                              scale: [0, 1, 0],
                              opacity: [0, 1, 0],
                              x: [0, Math.cos(i * 30 * Math.PI / 180) * 60],
                              y: [0, Math.sin(i * 30 * Math.PI / 180) * 60]
                            }}
                            transition={{
                              duration: 2,
                              delay: 0.8 + i * 0.1,
                              ease: "easeOut"
                            }}
                            className="absolute w-2 h-2 bg-[#00437f] rounded-full top-1/2 left-1/2"
                          />
                        ))}
                        
                        {/* Victory Aura */}
                        <motion.div
                          animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.2, 0.4, 0.2]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="absolute -inset-8 bg-[#00437f]/20 rounded-full blur-2xl"
                        />
                      </div>
                    </motion.div>

                    <motion.h3
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                      className="text-3xl font-black text-gray-900 mb-4 tracking-tight"
                    >
                      Demo Data Ready!
                    </motion.h3>
                    
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.8 }}
                      className="text-gray-600 mb-8 text-lg"
                    >
                      Your store is now powered with professional sample data
                    </motion.p>
                    
                    {/* Success Badges */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 1 }}
                      className="flex justify-center gap-3 flex-wrap"
                    >
                      {['Products', 'Categories', 'Settings', 'Users'].map((item, index) => (
                        <motion.div
                          key={item}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ 
                            duration: 0.5, 
                            delay: 1.2 + index * 0.1,
                            type: "spring",
                            stiffness: 200
                          }}
                          className="px-4 py-2 bg-[#00437f]/10 backdrop-blur-sm text-[#00437f] rounded-xl text-sm font-semibold border border-[#00437f]/20"
                        >
                          ✓ {item}
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </div>

              {/* Elite Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex justify-center gap-4 mt-4 pt-3 border-t border-gray-100/50"
              >
                {importPhase.phase === 'complete' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button 
                      onClick={onClose} 
                      className="group relative px-8 py-4 bg-gradient-to-r from-[#00437f] via-[#0066cc] to-[#00437f] hover:from-[#003366] hover:via-[#0055aa] hover:to-[#003366] text-white font-bold rounded-2xl shadow-2xl hover:shadow-[#00437f]/25 transition-all duration-500 overflow-hidden border border-[#00437f]/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 group-hover:from-white/10 group-hover:via-white/30 group-hover:to-white/10 transition-all duration-500" />
                      <div className="relative flex items-center gap-3">
                        <FiCheckCircle className="w-5 h-5" />
                        <span className="text-lg font-semibold">Continue to Dashboard</span>
                      </div>
                    </Button>
                  </motion.div>
                )}
                
                {importPhase.phase === 'deletion-complete' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button 
                      onClick={onContinueInsertion} 
                      className="group relative px-8 py-4 bg-gradient-to-r from-[#00437f] via-[#0066cc] to-[#00437f] hover:from-[#003366] hover:via-[#0055aa] hover:to-[#003366] text-white font-bold rounded-2xl shadow-2xl hover:shadow-[#00437f]/25 transition-all duration-500 overflow-hidden border border-[#00437f]/30"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 group-hover:from-white/5 group-hover:via-white/20 group-hover:to-white/5 transition-all duration-500" />
                      <div className="relative flex items-center gap-3">
                        <FiPlay className="w-5 h-5" />
                        <span className="text-lg font-semibold">Load Sample Data</span>
                      </div>
                    </Button>
                  </motion.div>
                )}
                
                {(importPhase.phase === 'deleting' || importPhase.phase === 'inserting') && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button 
                      disabled 
                      className="relative px-8 py-4 bg-gradient-to-r from-white/10 to-white/5 text-white/80 font-bold rounded-2xl cursor-not-allowed backdrop-blur-sm border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="relative"
                        >
                          <FiRefreshCw className="w-5 h-5" />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 w-5 h-5 border border-white/30 rounded-full"
                          />
                        </motion.div>
                        <span className="text-lg font-semibold">Processing...</span>
                      </div>
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// World-Class Demo Media Upload Experience
function DemoMediaUploadPopup({ 
  isOpen, 
  mediaUploadPhase, 
  onClose 
}: {
  isOpen: boolean
  mediaUploadPhase: MediaUploadPhase
  onClose?: () => void
}) {
  const router = useRouter()

  // Auto-redirect after completion
  useEffect(() => {
    if (mediaUploadPhase.phase === 'complete') {
      const timer = setTimeout(() => {
        if (onClose) {
          onClose()
        }
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [mediaUploadPhase.phase, onClose])
  
  if (!isOpen) return null

  return (
    <AnimatePresence>
      {/* Expert-Level Cinematic Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      >
        {/* Sophisticated Multi-Layer Background */}
        <div className="absolute inset-0">
          {/* Primary Gradient Layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-gray-900/98 to-slate-800/95" />
          
          {/* Secondary Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#00437f]/10 via-transparent to-[#00437f]/5" />
          
          {/* Premium Orbital Effects */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 360],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-conic from-[#00437f]/20 via-transparent to-[#00437f]/20 rounded-full blur-3xl"
          />
          
          <motion.div
            animate={{
              scale: [1.2, 0.8, 1.2],
              rotate: [-360, 0],
              opacity: [0.05, 0.2, 0.05]
            }}
            transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-conic from-blue-500/10 via-transparent to-[#00437f]/15 rounded-full blur-3xl"
          />
          
          {/* Elite Floating Elements */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                x: [0, Math.random() * 400 - 200, 0],
                y: [0, Math.random() * 400 - 200, 0],
                opacity: [0, 0.6, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 10 + Math.random() * 8,
                repeat: Infinity,
                delay: Math.random() * 8,
                ease: "easeInOut"
              }}
              className="absolute w-1 h-1 bg-[#00437f]/40 rounded-full blur-[0.5px]"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
            />
          ))}
        </div>

        {/* Compact Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ 
            duration: 0.4, 
            ease: [0.16, 1, 0.3, 1]
          }}
          className="relative w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden"
        >
          {/* Elite Outer Aura */}
          <motion.div
            animate={{
              scale: [1, 1.03, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-8 bg-gradient-to-r from-[#00437f]/30 via-blue-500/20 to-[#00437f]/30 rounded-[3rem] blur-2xl"
          />
          
          {/* Premium Glass Morphism Container */}
          <div className="relative">
            {/* Multi-Layer Background */}
            <div className="absolute inset-0 bg-white/95 backdrop-blur-2xl rounded-2xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/90 to-gray-50/80 rounded-2xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#00437f]/5 to-transparent rounded-2xl" />
            
            {/* Elite Border System */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#00437f]/20 via-transparent to-[#00437f]/20 p-[1px]">
              <div className="h-full w-full rounded-2xl bg-gradient-to-br from-white/95 via-white/98 to-gray-50/95" />
            </div>
            
            {/* Dynamic Accent Lines */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, delay: 0.8, ease: "easeOut" }}
              className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-[#00437f] to-transparent rounded-t-2xl"
            />
            
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, delay: 1.2, ease: "easeOut" }}
              className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-[#00437f]/60 to-transparent rounded-b-2xl"
            />
            
            {/* Main Content Area */}
            <div className="relative z-10 p-6">
              {/* Ultra-Compact Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center mb-4"
              >
                {/* Simple Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative inline-flex mb-2"
                >
                  <div className="w-8 h-8 bg-[#00437f] rounded-lg flex items-center justify-center">
                    <FiUploadCloud className="w-4 h-4 text-white" />
                  </div>
                </motion.div>

                {/* Simple Title */}
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-base font-semibold text-gray-900 mb-1"
                >
                  Media Upload
                </motion.h2>
              </motion.div>

              {/* Premium Progress Content */}
              <div className="flex items-center justify-center py-2">
                {mediaUploadPhase.phase === 'uploading' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center w-full"
                  >
                    {/* Elite Progress Stats */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="flex items-center justify-center gap-4 mb-6"
                    >
                      <div className="text-center px-3 py-1.5 bg-gray-50/60 rounded-lg border border-gray-200/40">
                        <motion.div
                          key={mediaUploadPhase.uploadedFiles + mediaUploadPhase.skippedFiles}
                          initial={{ scale: 1.05, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.25 }}
                          className="text-lg font-bold text-gray-900"
                        >
                          {mediaUploadPhase.uploadedFiles === 0 && mediaUploadPhase.skippedFiles > 0 
                            ? mediaUploadPhase.skippedFiles 
                            : mediaUploadPhase.uploadedFiles}
                        </motion.div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                          {mediaUploadPhase.uploadedFiles === 0 && mediaUploadPhase.skippedFiles > 0 
                            ? 'Skipped' 
                            : 'Uploaded'}
                        </div>
                      </div>
                      <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
                      <div className="text-center px-3 py-1.5 bg-gray-50/40 rounded-lg border border-gray-200/20">
                        <div className="text-lg font-bold text-gray-500">
                          {mediaUploadPhase.totalFiles}
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Total</div>
                      </div>
                    </motion.div>

                    {/* Compact Processing Display */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      className="space-y-2 mb-4"
                    >
                      {/* Processing Steps */}
                      <motion.div
                        className="space-y-2"
                      >
                        {/* Current Processing */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5 }}
                          className="flex items-center gap-3 px-3 py-2 bg-gray-50/80 rounded-lg border border-gray-200/50"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-gray-300 border-t-[#00437f] rounded-full"
                          />
                          <div className="flex-1">
                            <span className="text-gray-700 font-medium text-sm">Processing Media Assets</span>
                          </div>
                          <motion.span
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-xs text-[#00437f] font-medium px-2 py-1 bg-[#00437f]/10 rounded-full"
                          >
                            Active
                          </motion.span>
                        </motion.div>

                        {/* Progress Info */}
                        <div className="text-center py-2">
                          {mediaUploadPhase.uploadedFiles === 0 && mediaUploadPhase.skippedFiles > 0 ? (
                            <span className="text-sm text-amber-600">
                              Files skipped - <span className="font-semibold">already exist</span> on {mediaUploadPhase.platform}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-600">
                              Uploading to <span className="font-semibold text-[#00437f]">{mediaUploadPhase.platform}</span>
                            </span>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* Progress Badge */}
                    <div className="text-center">
                      <div className="inline-flex items-center gap-3 px-4 py-2 bg-gray-50/80 rounded-lg border border-gray-200/50">
                        <div className="w-2 h-2 bg-[#00437f] rounded-full animate-pulse" />
                        <span className="text-gray-900 font-medium text-sm">
                          {mediaUploadPhase.totalFiles > 0 
                            ? Math.round((mediaUploadPhase.uploadedFiles + mediaUploadPhase.skippedFiles) / mediaUploadPhase.totalFiles * 100)
                            : 0}% Complete
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {mediaUploadPhase.phase === 'complete' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      duration: 1.2,
                      type: "spring",
                      stiffness: 200,
                      damping: 15
                    }}
                    className="text-center"
                  >
                    {/* Victory Animation */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        duration: 0.8,
                        type: "spring",
                        stiffness: 300,
                        damping: 10,
                        delay: 0.2
                      }}
                      className="relative mb-6 flex items-center justify-center"
                    >
                      <div className="relative w-24 h-24">
                        {/* Success Ring */}
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="absolute inset-0 border-4 border-[#00437f]/30 border-t-[#00437f] rounded-full"
                        />
                        
                        {/* Inner Success Indicator */}
                        <div className="absolute inset-4 bg-gradient-to-br from-[#00437f] to-[#0066cc] rounded-full flex items-center justify-center shadow-2xl">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ 
                              duration: 0.6,
                              type: "spring",
                              stiffness: 300,
                              delay: 0.5
                            }}
                          >
                            <FiCheckCircle className="w-8 h-8 text-white" />
                          </motion.div>
                        </div>
                        
                        {/* Success Particles */}
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                              scale: [0, 1, 0],
                              opacity: [0, 1, 0],
                              x: [0, Math.cos(i * 45 * Math.PI / 180) * 40],
                              y: [0, Math.sin(i * 45 * Math.PI / 180) * 40]
                            }}
                            transition={{
                              duration: 1.5,
                              delay: 0.8 + i * 0.1,
                              ease: "easeOut"
                            }}
                            className="absolute w-1.5 h-1.5 bg-[#00437f] rounded-full top-1/2 left-1/2"
                          />
                        ))}
                        
                        {/* Victory Aura */}
                        <motion.div
                          animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.2, 0.4, 0.2]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="absolute -inset-8 bg-[#00437f]/20 rounded-full blur-2xl"
                        />
                      </div>
                    </motion.div>

                    <motion.h3
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      className="text-2xl font-bold text-gray-900 mb-3"
                    >
                      Upload Complete!
                    </motion.h3>
                    
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                      className="text-gray-600 mb-6"
                    >
                      <span className="font-semibold text-[#00437f]">{mediaUploadPhase.uploadedFiles}</span> files uploaded successfully
                      {mediaUploadPhase.skippedFiles > 0 && (
                        <span>, <span className="font-semibold text-gray-500">{mediaUploadPhase.skippedFiles}</span> skipped</span>
                      )}
                    </motion.p>
                    
                    {/* Success Badges */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1 }}
                      className="flex justify-center gap-2 flex-wrap"
                    >
                      {(mediaUploadPhase.processedFolders || []).slice(0, 4).map((folder, index) => (
                        <motion.div
                          key={folder}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: 1.2 + index * 0.1,
                            type: "spring",
                            stiffness: 200
                          }}
                          className="px-3 py-1 bg-[#00437f]/10 backdrop-blur-sm text-[#00437f] rounded-lg text-xs font-medium border border-[#00437f]/20 capitalize"
                        >
                          ✓ {folder.replace('-', ' ').replace('_', ' ')}
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </div>

              {/* Elite Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex justify-center gap-4 mt-4 pt-3 border-t border-gray-100/50"
              >
                {mediaUploadPhase.phase === 'complete' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button 
                      onClick={onClose} 
                      className="group relative px-8 py-4 bg-gradient-to-r from-[#00437f] via-[#0066cc] to-[#00437f] hover:from-[#003366] hover:via-[#0055aa] hover:to-[#003366] text-white font-bold rounded-2xl shadow-2xl hover:shadow-[#00437f]/25 transition-all duration-500 overflow-hidden border border-[#00437f]/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 group-hover:from-white/5 group-hover:via-white/20 group-hover:to-white/5 transition-all duration-500" />
                      <div className="relative flex items-center gap-3">
                        <FiCheckCircle className="w-5 h-5" />
                        <span className="text-lg font-semibold">Continue</span>
                      </div>
                    </Button>
                  </motion.div>
                )}
                
                {mediaUploadPhase.phase === 'uploading' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button 
                      disabled 
                      className="relative px-8 py-4 bg-gradient-to-r from-white/10 to-white/5 text-white/80 font-bold rounded-2xl cursor-not-allowed backdrop-blur-sm border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="relative"
                        >
                          <FiRefreshCw className="w-5 h-5" />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 w-5 h-5 border border-white/30 rounded-full"
                          />
                        </motion.div>
                        <span className="text-lg font-semibold">Uploading...</span>
                      </div>
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function LoadDemoDataPage() {
  const router = useRouter()
  const [selectedDataSource, setSelectedDataSource] = useState<'local' | 'download'>('local')
  const [showPopup, setShowPopup] = useState(false)
  const [showMediaPopup, setShowMediaPopup] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isInserting, setIsInserting] = useState(false)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const [importPhase, setImportPhase] = useState<ImportPhase>({
    phase: 'idle',
    deletionProgress: [],
    insertionProgress: []
  })
  const [mediaUploadPhase, setMediaUploadPhase] = useState<MediaUploadPhase>({
    phase: 'idle',
    uploadProgress: [],
    totalFiles: 0,
    uploadedFiles: 0,
    skippedFiles: 0,
    platform: 'server',
    processedFolders: []
  })

  const handleDataSourceChange = (source: 'local' | 'download') => {
    setSelectedDataSource(source)
  }

  // Deletion order (EXACT same as working import system)
  const deletionOrder = [
    // Child tables with foreign keys first - delete these before their parent tables
    'variantAttributes', // references productVariations, attributes, attributeValues
    'productAttributes', // references products, attributes, attributeValues
    'productAlternateImages', // references products
    'productVariations', // references products
    'orderItems', // references orders, products, productVariations
    'reviews', // references products, users
    'refunds', // references orders
    'cartEvents', // references cartSessions, users
    'cartsRecovered', // references cartSessions
    'campaignEmails', // references cartSessions
    'paymentTransactionLogs', // references orders, paymentGateways
    'paymentGatewayHealthChecks', // references paymentGateways
    'pageRevisions', // references pages
    'pageCategoryRelations', // references pages, pageCategories
    'pageAnalytics', // references pages
    
    // Tables that reference other tables - delete these after their child tables but before parent tables
    'orders', // references addresses, users, customers, shippingMethods, taxRates
    'products', // references categories, brands (if any)
    'attributeValues', // references attributes
    
    // Independent tables - delete these last
    'cartSessions',
    'coupons',
    'discounts',
    'addresses', // referenced by orders
    'userProfiles', // references users
    'sessions', // references users
    'accounts', // references users
    'verificationTokens',
    'customers',
    'categories',
    'brands',
    'attributes', // referenced by attributeValues, productAttributes, variantAttributes
    'taxonomy',
    'shippingMethods', // referenced by orders
    'taxRates', // referenced by orders
    'paymentGateways', // referenced by paymentTransactionLogs, paymentGatewayHealthChecks
    'paymentSettings',
    'apiIntegrations',
    'adminUsers',
    'mainBanners',
    'mini_banners',
    'pages', // referenced by pageRevisions, pageCategoryRelations, pageAnalytics
    'pageCategories', // referenced by pageCategoryRelations
    'cartAbandonmentToggle',
    'dataModeSettings',
    'users' // referenced by orders, userProfiles, sessions, accounts, reviews, cartEvents
  ]

  // Table insertion order (EXACT same as working import system - 44 tables)
  const insertionOrder = [
    'users',
    'categories',
    'taxonomy',
    'brands',
    'settings',
    'taxRates',
    'shippingMethods',
    'adminUsers',
    'apiIntegrations',
    'paymentGateways',
    'paymentSettings',
    'dataModeSettings',
    'mainBanners',
    'mini_banners',
    'pages',
    'pageCategories',
    'cartAbandonmentToggle',
    'customers',
    'verificationTokens',
    'accounts',
    'sessions',
    'userProfiles',
    'addresses',
    'coupons',
    'discounts',
    'attributes',
    'attributeValues',
    'products',
    'orders',
    'productVariations',
    'productAttributes',
    'productAlternateImages',
    'variantAttributes',
    'orderItems',
    'reviews',
    'refunds',
    'cartSessions',
    'cartEvents',
    'cartsRecovered',
    'campaignEmails',
    'paymentTransactionLogs',
    'paymentGatewayHealthChecks',
    'pageRevisions',
    'pageCategoryRelations',
    'pageAnalytics'
  ]

  // Initialize deletion progress tracking
  const initializeDeletionProgress = () => {
    return deletionOrder.map(table => ({
      table,
      status: 'pending' as const,
      recordsDeleted: 0,
      message: 'Waiting to delete...'
    }))
  }

  // Initialize insertion progress tracking
  const initializeInsertionProgress = () => {
    return insertionOrder.map(table => ({
      table,
      status: 'pending' as const,
      recordsInserted: 0,
      message: 'Waiting to insert...'
    }))
  }

  // Update deletion progress
  const updateDeletionProgress = (tableName: string, updates: Partial<DeletionProgress>) => {
    setImportPhase(prev => ({
      ...prev,
      deletionProgress: prev.deletionProgress.map(p => 
        p.table === tableName ? { ...p, ...updates } : p
      )
    }))
  }

  // Update insertion progress
  const updateInsertionProgress = (tableName: string, updates: Partial<InsertionProgress>) => {
    setImportPhase(prev => ({
      ...prev,
      insertionProgress: prev.insertionProgress.map(p => 
        p.table === tableName ? { ...p, ...updates } : p
      )
    }))
  }

  // Core deletion function (EXACT same as import system)
  const executeCoreTableDeletion = async (
    onProgress?: (tableName: string, updates: Partial<DeletionProgress>) => void
  ) => {
    let totalRecords = 0
    let tablesProcessed = 0
    
    // Delete tables one by one in the correct order (EXACT same logic as import)
    for (let i = 0; i < deletionOrder.length; i++) {
      const tableName = deletionOrder[i]
      
      // Update status to deleting
      onProgress?.(tableName, {
        status: 'deleting',
        message: 'Deleting records...'
      })

      try {
        const response = await fetch('/api/data-manager/delete-table', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tableName }),
        })

        if (response.ok) {
          const result = await response.json()
          const records = result.recordsDeleted || 0
          totalRecords += records
          tablesProcessed++

          onProgress?.(tableName, {
            status: 'completed',
            recordsDeleted: records,
            message: `Deleted ${records} records`
          })
        } else {
          const errorResult = await response.json()
          onProgress?.(tableName, {
            status: 'failed',
            message: errorResult.error || 'Deletion failed',
            error: errorResult.error
          })
        }
      } catch (error) {
        onProgress?.(tableName, {
          status: 'failed',
          message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
  }

  // Core insertion function (EXACT same as import but uses demo-data API)
  const executeCoreTableInsertion = async (
    onProgress?: (tableName: string, updates: Partial<InsertionProgress>) => void
  ) => {
    let totalRecords = 0
    let tablesProcessed = 0
    
    // Insert tables one by one in the correct order (EXACT same logic as import)
    for (let i = 0; i < insertionOrder.length; i++) {
      const tableName = insertionOrder[i]
      
      // Update status to inserting
      onProgress?.(tableName, {
        status: 'inserting',
        message: 'Inserting records...'
      })

      try {
        // Use same API as import system but point to demo-data folder
        const response = await fetch('/api/data-manager/insert-table', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            tableName,
            sourceFolder: 'demo-data' // Use demo-data folder instead of data-db
          }),
        })

        if (response.ok) {
          const result = await response.json()
          const records = result.recordsInserted || 0
          totalRecords += records
          tablesProcessed++

          onProgress?.(tableName, {
            status: 'completed',
            recordsInserted: records,
            message: `Inserted ${records} records`
          })
        } else {
          const errorResult = await response.json()
          onProgress?.(tableName, {
            status: 'failed',
            message: errorResult.error || 'Insertion failed',
            error: errorResult.error
          })
        }
      } catch (error) {
        onProgress?.(tableName, {
          status: 'failed',
          message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
  }

  // Main handler for loading demo data (EXACT same as import system)
  const handleLoadDemoData = async () => {
    if (isDeleting) return

    setIsDeleting(true)
    
    // Show popup and initialize progress tracking
    setShowPopup(true)
    const initialProgress = initializeDeletionProgress()
    setImportPhase({
      phase: 'deleting',
      deletionProgress: initialProgress,
      insertionProgress: []
    })

    try {
      // Execute core deletion function (EXACT same as import)
      await executeCoreTableDeletion(updateDeletionProgress)

      // All deletions complete - automatically start insertion
      setImportPhase(prev => ({
        ...prev,
        phase: 'deletion-complete'
      }))

      // Automatically start insertion after a short delay
      setTimeout(() => {
        handleContinueInsertion()
      }, 1000)

    } catch (error) {
      console.error('Error during deletion process:', error)
      toast.error('Failed to delete existing data. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle continuing with data insertion after deletion (EXACT same as import)
  const handleContinueInsertion = async () => {
    setIsInserting(true)
    
    const initialInsertionProgress = initializeInsertionProgress()
    setImportPhase(prev => ({
      ...prev,
      phase: 'inserting',
      insertionProgress: initialInsertionProgress
    }))

    try {
      // Execute core insertion function (EXACT same as import but uses demo-data)
      await executeCoreTableInsertion(updateInsertionProgress)

      // All insertions complete
      setImportPhase(prev => ({
        ...prev,
        phase: 'complete'
      }))

      toast.success('Demo data loaded successfully!')

    } catch (error) {
      console.error('Error during insertion process:', error)
      toast.error('Failed to insert demo data. Please try again.')
    } finally {
      setIsInserting(false)
    }
  }

  // Reset progress
  const resetProgress = () => {
    setImportPhase({
      phase: 'idle',
      deletionProgress: [],
      insertionProgress: []
    })
    setIsDeleting(false)
    setIsInserting(false)
  }

  // Handle demo media upload with popup
  const handleLoadDemoMedia = async () => {
    if (isUploadingMedia || isDeleting || isInserting) return

    setIsUploadingMedia(true)
    setShowMediaPopup(true)
    
    // Initialize media upload phase
    const platform = selectedDataSource === 'local' ? 'server' : 'vercel'
    setMediaUploadPhase({
      phase: 'uploading',
      uploadProgress: [],
      totalFiles: 0,
      uploadedFiles: 0,
      skippedFiles: 0,
      platform,
      processedFolders: []
    })
    
    try {
      console.log('🖼️ Starting demo media upload...')

      // Call API to upload demo media
      const response = await fetch('/api/data-manager/demo/upload-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          source: 'demo-media' // Always from demo-media folder
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Create progress entries from results and show progressive updates
        const uploadProgress: MediaUploadProgress[] = []
        const processedFolders = new Set<string>()
        
        if (result.results && Array.isArray(result.results)) {
          result.results.forEach((resultItem: string) => {
            const [status, filePath] = resultItem.split(': ')
            const fileName = filePath.split('/').pop() || filePath
            const category = filePath.includes('/') ? filePath.split('/')[0] : 'general'
            
            // Track processed folders for completion screen
            processedFolders.add(category)
            
            uploadProgress.push({
              file: fileName,
              status: status.includes('✅') ? 'completed' : status.includes('⏭️') ? 'skipped' : 'failed',
              message: status.includes('✅') ? 'Uploaded successfully' : status.includes('⏭️') ? 'Already exists' : 'Upload failed',
              category
            })
          })
        }

        // Simple Amazing Processing Animation
        setMediaUploadPhase(prev => ({
          ...prev,
          totalFiles: result.totalFiles || uploadProgress.length,
          uploadedFiles: 0,
          skippedFiles: 0
        }))

        // Simulate amazing processing with realistic timing
        setTimeout(() => {
          // Update progress during processing
          setMediaUploadPhase(prev => ({
            ...prev,
            uploadedFiles: Math.floor((result.uploadedFiles || 0) * 0.3),
            skippedFiles: Math.floor((result.skippedFiles || 0) * 0.3)
          }))
        }, 2000)

        setTimeout(() => {
          // More progress
          setMediaUploadPhase(prev => ({
            ...prev,
            uploadedFiles: Math.floor((result.uploadedFiles || 0) * 0.6),
            skippedFiles: Math.floor((result.skippedFiles || 0) * 0.6)
          }))
        }, 4000)

        setTimeout(() => {
          // Almost complete
          setMediaUploadPhase(prev => ({
            ...prev,
            uploadedFiles: Math.floor((result.uploadedFiles || 0) * 0.9),
            skippedFiles: Math.floor((result.skippedFiles || 0) * 0.9)
          }))
        }, 6000)

        // Complete the process
        setTimeout(() => {
          setMediaUploadPhase(prev => ({
            ...prev,
            phase: 'complete',
            uploadedFiles: result.uploadedFiles || 0,
            skippedFiles: result.skippedFiles || 0,
            processedFolders: Array.from(processedFolders)
          }))
          
          // Auto-close after completion
          setTimeout(() => {
            setShowMediaPopup(false)
            setMediaUploadPhase({
              phase: 'idle',
              uploadProgress: [],
              totalFiles: 0,
              uploadedFiles: 0,
              skippedFiles: 0,
              platform: 'server',
              processedFolders: []
            })
          }, 3000)
        }, 8000) // 8 seconds total processing time

        console.log('🖼️ Demo media upload results:', {
          uploadedFiles: result.uploadedFiles,
          skippedFiles: result.skippedFiles,
          totalFiles: result.totalFiles,
          folders: result.folders
        })
      } else {
        setMediaUploadPhase(prev => ({ ...prev, phase: 'complete' }))
        toast.error(`❌ Demo media upload failed: ${result.error || 'Unknown error'}`)
        console.error('🖼️ Demo media upload failed:', result.error)
      }

    } catch (error) {
      setMediaUploadPhase(prev => ({ ...prev, phase: 'complete' }))
      console.error('🖼️ Demo media upload error:', error)
      toast.error('Failed to upload demo media. Please try again.')
    } finally {
      setIsUploadingMedia(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900'>
      {/* Premium Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className='relative overflow-hidden'
      >
        {/* Background Pattern */}
        <div className='absolute inset-0 bg-gradient-to-r from-[#00437f]/5 to-[#003366]/5 dark:from-[#00437f]/10 dark:to-[#003366]/10'>
          <div className='absolute inset-0' style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,67,127,0.15) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        <div className='relative container mx-auto px-6 py-12'>
          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='mb-8'
          >
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className='group flex items-center gap-2 text-gray-600 hover:text-[#00437f] dark:text-gray-400 dark:hover:text-blue-400 transition-all duration-300'
            >
              <div className='p-2 rounded-full bg-white/50 dark:bg-gray-800/50 group-hover:bg-[#00437f]/10 dark:group-hover:bg-blue-400/10 transition-all duration-300'>
                <FiArrowLeft className='h-4 w-4' />
              </div>
              <span className='font-medium'>Back to Data Manager</span>
            </Button>
          </motion.div>

          {/* Hero Content */}
          <div className='text-center max-w-4xl mx-auto'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className='mb-6'
            >
              <div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-3xl shadow-2xl mb-6 relative'>
                <div className='absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl'></div>
                <FiDownload className='w-10 h-10 text-white relative z-10' />
                <div className='absolute -inset-4 bg-gradient-to-br from-[#00437f]/20 to-[#003366]/20 rounded-3xl blur-xl'></div>
              </div>
              
              <h1 className='text-5xl md:text-6xl font-black bg-gradient-to-r from-[#00437f] via-[#0066cc] to-[#003366] bg-clip-text text-transparent mb-4'>
                Demo Experience Center
              </h1>
              
              <p className='text-xl text-gray-600 dark:text-gray-300 font-medium leading-relaxed'>
                Explore your store's features with <span className='text-[#00437f] dark:text-blue-400 font-bold'>sample data for testing</span>. Perfect for understanding functionality before adding your real products and content.
              </p>
            </motion.div>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className='flex flex-wrap justify-center gap-3 mb-8'
            >
              {[
                { icon: FiDatabase, text: "Test Products" },
                { icon: FiImage, text: "Sample Media" }, 
                { icon: FiZap, text: "Quick Testing" },
                { icon: FiCheckCircle, text: "Explore Features" }
              ].map((feature, index) => (
                <div key={index} className='flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-full border border-[#00437f]/20 dark:border-blue-400/20'>
                  <feature.icon className='w-4 h-4 text-[#00437f] dark:text-blue-400' />
                  <span className='text-sm font-semibold text-gray-700 dark:text-gray-300'>{feature.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className='container mx-auto px-6 pb-12'>


        {/* Action Cards Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12'>
          {/* Demo Data Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className='group'
          >
            <div className='relative overflow-hidden bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-800/90 dark:via-gray-800/70 dark:to-gray-800/50 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-gray-700/20 shadow-2xl group-hover:shadow-3xl transition-all duration-500'>
              {/* Floating Orbs */}
              <div className='absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-[#00437f]/20 to-[#003366]/20 rounded-full blur-xl animate-pulse'></div>
              <div className='absolute bottom-4 left-4 w-8 h-8 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-lg animate-bounce'></div>
              
              <div className='relative p-8'>
                {/* Icon */}
                <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-2xl shadow-xl mb-6 relative'>
                  <FiDatabase className='w-8 h-8 text-white' />
                  <div className='absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl'></div>
                </div>

                {/* Content */}
                <div className='mb-8'>
                  <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-3'>
                    Demo Store Data
                  </h3>
                  <p className='text-gray-600 dark:text-gray-400 leading-relaxed mb-4'>
                    Populate your database with realistic product catalogs, categories, and store settings
                  </p>
                  
                  {/* Features */}
                  <div className='space-y-2 mb-6'>
                    {[
                      'Sample Products & Categories',
                      'Store Configuration',
                      'Admin User Accounts'
                    ].map((feature, index) => (
                      <div key={index} className='flex items-center gap-2 text-sm'>
                        <div className='w-1.5 h-1.5 bg-[#00437f] rounded-full'></div>
                        <span className='text-gray-700 dark:text-gray-300'>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className='flex items-center gap-3 mb-6 p-3 bg-[#00437f]/5 dark:bg-[#00437f]/10 rounded-xl'>
                  <div className='w-3 h-3 bg-green-500 rounded-full animate-pulse'></div>
                  <div className='flex-1'>
                    <div className='text-sm font-semibold text-gray-900 dark:text-white'>
                      Database Ready
                    </div>
                    <div className='text-xs text-gray-600 dark:text-gray-400'>
                      Source: {selectedDataSource === 'local' ? 'Demo-data folder' : 'Remote download'}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleLoadDemoData}
                  disabled={isDeleting || isInserting}
                  className='w-full h-14 bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#00437f] text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-105 disabled:opacity-50'
                >
                  {isDeleting ? (
                    <>
                      <FiRefreshCw className='w-5 h-5 mr-3 animate-spin' />
                      Clearing Existing Data...
                    </>
                  ) : isInserting ? (
                    <>
                      <FiRefreshCw className='w-5 h-5 mr-3 animate-spin' />
                      Loading Demo Data...
                    </>
                  ) : (
                    <>
                      <FiPlay className='w-5 h-5 mr-3' />
                      Load Demo Store Data
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Demo Media Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className='group'
          >
            <div className='relative overflow-hidden bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-800/90 dark:via-gray-800/70 dark:to-gray-800/50 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-gray-700/20 shadow-2xl group-hover:shadow-3xl transition-all duration-500'>
              {/* Floating Orbs */}
              <div className='absolute top-4 right-4 w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-lg animate-pulse'></div>
              <div className='absolute bottom-6 left-6 w-6 h-6 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-md animate-bounce delay-300'></div>
              
              <div className='relative p-8'>
                {/* Icon */}
                <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 rounded-2xl shadow-xl mb-6 relative'>
                  <FiImage className='w-8 h-8 text-white' />
                  <div className='absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl'></div>
                </div>

                {/* Content */}
                <div className='mb-8'>
                  <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-3'>
                    Demo Media Assets
                  </h3>
                  <p className='text-gray-600 dark:text-gray-400 leading-relaxed mb-4'>
                    Upload professional product images, banners, and media assets to showcase your store
                  </p>
                  
                  {/* Features */}
                  <div className='space-y-2 mb-6'>
                    {[
                      'Product Images & Galleries',
                      'Brand Logos & Banners',
                      'Marketing Materials'
                    ].map((feature, index) => (
                      <div key={index} className='flex items-center gap-2 text-sm'>
                        <div className='w-1.5 h-1.5 bg-purple-600 rounded-full'></div>
                        <span className='text-gray-700 dark:text-gray-300'>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className='flex items-center gap-3 mb-6 p-3 bg-purple-600/5 dark:bg-purple-600/10 rounded-xl'>
                  <div className={`w-3 h-3 rounded-full ${isUploadingMedia ? 'bg-yellow-500 animate-spin' : 'bg-green-500 animate-pulse'}`}></div>
                  <div className='flex-1'>
                    <div className='text-sm font-semibold text-gray-900 dark:text-white'>
                      {isUploadingMedia ? 'Uploading Media...' : 'Upload Ready'}
                    </div>
                    <div className='text-xs text-gray-600 dark:text-gray-400'>
                      Target: {selectedDataSource === 'local' ? 'Server media directory' : 'Vercel blob storage'}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleLoadDemoMedia}
                  disabled={isUploadingMedia || isDeleting || isInserting}
                  className='w-full h-14 bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 dark:from-white dark:to-gray-100 dark:hover:from-gray-100 dark:hover:to-white text-white dark:text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-105 disabled:opacity-50'
                >
                  {isUploadingMedia ? (
                    <>
                      <FiRefreshCw className='w-5 h-5 mr-3 animate-spin' />
                      Uploading Media Files...
                    </>
                  ) : (
                    <>
                      <FiUploadCloud className='w-5 h-5 mr-3' />
                      Load Demo Media Assets
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Demo Data Loading Popup */}
      <DemoDataLoadPopup
        isOpen={showPopup}
        importPhase={importPhase}
        isDeleting={isDeleting}
        isInserting={isInserting}
        onReset={resetProgress}
        onContinueInsertion={handleContinueInsertion}
        onClose={() => {
          setShowPopup(false)
          resetProgress()
        }}
      />

      {/* Demo Media Upload Popup */}
      <DemoMediaUploadPopup
        isOpen={showMediaPopup}
        mediaUploadPhase={mediaUploadPhase}
        onClose={() => {
          setShowMediaPopup(false)
          setMediaUploadPhase({
            phase: 'idle',
            uploadProgress: [],
            totalFiles: 0,
            uploadedFiles: 0,
            skippedFiles: 0,
            platform: 'server',
            processedFolders: []
          })
        }}
      />
    </div>
  )
}