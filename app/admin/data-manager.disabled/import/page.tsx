'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
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
  FiPlus
} from 'react-icons/fi'
import { AutoSync } from '../../../../components/admin/data-manager/AutoSync'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

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

// File Type Restriction Modal
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
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-xl">
                <FiAlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  File Type Restriction
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Only JSON files are supported for import
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                The following files were rejected:
              </h4>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <ul className="space-y-2">
                  {rejectedFiles.map((fileName, index) => (
                    <li key={index} className="flex items-center gap-2 text-red-700 dark:text-red-300">
                      <FiX className="w-4 h-4" />
                      <span className="text-sm font-medium">{fileName}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <h4 className="text-md font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                <FiInfo className="w-4 h-4" />
                Why JSON Only?
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Ensures data structure consistency</li>
                <li>• Prevents security vulnerabilities</li>
                <li>• Guarantees reliable imports</li>
                <li>• Maintains database integrity</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="text-md font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                <FiCheckCircle className="w-4 h-4" />
                How to Convert Your Files
              </h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Export data from our Export Manager as JSON</li>
                <li>• Use online converters for CSV to JSON</li>
                <li>• Save Excel files as JSON format</li>
                <li>• Contact support for conversion assistance</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-6 py-2 bg-[#00437f] text-white font-semibold rounded-lg hover:bg-black transition-colors"
            >
              I Understand
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Database Update Popup Component
function DatabaseUpdatePopup({ 
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
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => {
          // Close on background click only if the process is complete
          if (e.target === e.currentTarget && importPhase.phase === 'complete' && onClose) {
            onClose()
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        >
          {/* Premium Header with Dynamic Background */}
          <motion.div 
            className="relative overflow-hidden"
            initial={{ background: "linear-gradient(90deg, #00437f 0%, #003366 100%)" }}
            animate={{ 
              background: importPhase.phase === 'deleting' 
                ? "linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)"
                : importPhase.phase === 'inserting'
                ? "linear-gradient(90deg, #059669 0%, #047857 100%)"
                : importPhase.phase === 'complete'
                ? "linear-gradient(90deg, #059669 0%, #047857 100%)"
                : "linear-gradient(90deg, #00437f 0%, #003366 100%)"
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5"></div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <motion.h2 
                    className="text-3xl font-bold bg-gradient-to-r from-white via-blue-50 to-white bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    Database Update Center
                  </motion.h2>
                  <motion.p 
                    className="text-white/90 mt-2 text-base font-medium leading-relaxed max-w-2xl"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    Transform your database with precision and speed. Watch real-time progress as we clean and rebuild your data infrastructure.
                  </motion.p>
                  
                  {/* Dynamic Status Messages */}
                  {importPhase.phase === 'deleting' && (
                    <motion.div 
                      className="mt-4 p-4 bg-gradient-to-r from-red-500/20 via-rose-500/20 to-red-500/20 backdrop-blur-sm rounded-xl border border-red-400/40 shadow-lg shadow-red-500/20"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/30 rounded-lg">
                          <FiTrash2 className="w-4 h-4 text-red-100" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Database Cleanup in Progress
                          </p>
                          <p className="text-xs text-red-100/80 mt-0.5">
                            Removing existing data structures
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-red-900/30 rounded-lg border-l-2 border-red-400/60">
                        <p className="text-xs text-red-100/90 font-medium">
                          💡 Settings table preserved - your configuration remains intact
                        </p>
                      </div>
                    </motion.div>
                  )}
                  
                  {importPhase.phase === 'inserting' && (
                    <motion.div 
                      className="mt-4 p-4 bg-gradient-to-r from-emerald-500/20 via-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl border border-emerald-400/40 shadow-lg shadow-emerald-500/20"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/30 rounded-lg">
                          <FiDatabase className="w-4 h-4 text-emerald-100" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Data Insertion in Progress
                          </p>
                          <p className="text-xs text-emerald-100/80 mt-0.5">
                            Building new database structure
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-emerald-900/30 rounded-lg border-l-2 border-emerald-400/60">
                        <p className="text-xs text-emerald-100/90 font-medium">
                          ⚡ High-performance bulk import in progress
                        </p>
                      </div>
                    </motion.div>
                  )}
                  
                  {importPhase.phase === 'complete' && (
                    <motion.div 
                      className="mt-4 p-4 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-500/20 backdrop-blur-sm rounded-xl border border-green-400/40 shadow-lg shadow-green-500/20"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/30 rounded-lg">
                          <FiCheckCircle className="w-4 h-4 text-green-100" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            All Operations Complete!
                          </p>
                          <p className="text-xs text-green-100/80 mt-0.5">
                            Database successfully updated
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-green-900/30 rounded-lg border-l-2 border-green-400/60">
                        <p className="text-xs text-green-100/90 font-medium">
                          🎉 Your database is now refreshed and ready for use
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                {/* Close Button - Only show when process is complete */}
                {importPhase.phase === 'complete' && onClose && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 shadow-lg transition-all duration-200 hover:shadow-white/20"
                  >
                    <FiX className="w-5 h-5 text-white" />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Content with Premium Animations */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Phase 1: Deletion Progress - Slides out when complete */}
            <AnimatePresence mode="wait">
              {(importPhase.phase === 'deleting' || importPhase.phase === 'deletion-complete') && (
                <motion.div
                  key="deletion-phase"
                  initial={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ 
                    opacity: 0, 
                    x: -100, 
                    height: 0,
                    transition: { duration: 0.8, ease: "easeInOut" }
                  }}
                  className='space-y-4'
                >
                  {/* Premium Progress Header */}
                  <motion.div 
                    className='flex items-center justify-between'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          importPhase.phase === 'deleting' 
                            ? 'bg-red-500 shadow-lg shadow-red-500/30' 
                            : 'bg-green-500 shadow-lg shadow-green-500/30'
                        }`}
                        animate={{ 
                          scale: importPhase.phase === 'deleting' ? [1, 1.1, 1] : 1,
                          rotate: importPhase.phase === 'deleting' ? [0, 360] : 0
                        }}
                        transition={{ 
                          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                          rotate: { duration: 3, repeat: Infinity, ease: "linear" }
                        }}
                      >
                        {importPhase.phase === 'deleting' ? (
                          <FiTrash2 className='w-6 h-6 text-white' />
                        ) : (
                          <FiCheckCircle className='w-6 h-6 text-white' />
                        )}
                      </motion.div>
                      <div>
                        <h4 className='text-xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 dark:from-slate-100 dark:via-white dark:to-slate-100 bg-clip-text text-transparent'>
                          {importPhase.phase === 'deleting' ? 'Deleting Tables...' : 'Deletion Complete!'}
                        </h4>
                        <p className='text-sm text-slate-600 dark:text-slate-300 font-medium'>
                          {importPhase.phase === 'deleting' 
                            ? 'Removing existing database records' 
                            : 'All tables successfully deleted'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className='flex items-center gap-2'>
                      {importPhase.phase === 'deleting' && (
                        <motion.div 
                          className='flex items-center gap-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg text-sm font-medium text-red-700 dark:text-red-200'
                          animate={{ opacity: [1, 0.8, 1] }}
                          transition={{ duration: 1.8, repeat: Infinity }}
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <FiRefreshCw className='w-4 h-4' />
                          </motion.div>
                          <span className='font-semibold'>Processing deletion queue...</span>
                        </motion.div>
                      )}
                      {importPhase.phase === 'deletion-complete' && (
                        <motion.div 
                          className='flex items-center gap-3 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg text-sm font-semibold text-emerald-700 dark:text-emerald-200'
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                          >
                            <FiCheckCircle className='w-4 h-4' />
                          </motion.div>
                          <span className='font-bold'>Deletion Complete ✨</span>
                        </motion.div>
                      )}
                      <Button
                        onClick={onReset}
                        variant="outline"
                        size="sm"
                        className='px-3 py-1 text-xs border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      >
                        <FiRotateCcw className='w-3 h-3 mr-1' />
                        Reset
                      </Button>
                    </div>
                  </motion.div>

                  {/* Premium Progress Summary Cards */}
                  <motion.div 
                    className='grid grid-cols-1 md:grid-cols-4 gap-4'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    {[
                      { 
                        label: 'Completed', 
                        count: importPhase.deletionProgress.filter(item => item.status === 'completed').length,
                        color: 'green',
                        icon: FiCheckCircle
                      },
                      { 
                        label: 'Processing', 
                        count: importPhase.deletionProgress.filter(item => item.status === 'deleting').length,
                        color: 'blue',
                        icon: FiRefreshCw
                      },
                      { 
                        label: 'Failed', 
                        count: importPhase.deletionProgress.filter(item => item.status === 'failed').length,
                        color: 'red',
                        icon: FiAlertCircle
                      },
                      { 
                        label: 'Pending', 
                        count: importPhase.deletionProgress.filter(item => item.status === 'pending').length,
                        color: 'gray',
                        icon: FiClock
                      }
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
                          stat.color === 'green' ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700' :
                          stat.color === 'blue' ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-700' :
                          stat.color === 'red' ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200 dark:from-red-900/20 dark:to-pink-900/20 dark:border-red-700' :
                          'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 dark:from-gray-900/20 dark:to-slate-900/20 dark:border-gray-700'
                        }`}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      >
                        <div className='text-center'>
                          <div className={`text-2xl font-extrabold ${
                            stat.color === 'green' ? 'text-green-600' :
                            stat.color === 'blue' ? 'text-blue-600' :
                            stat.color === 'red' ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {stat.count}
                          </div>
                          <div className='text-sm text-slate-600 dark:text-slate-300 mt-1 font-semibold tracking-wide'>{stat.label}</div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Premium Progress List with Staggered Animations */}
                  <motion.div 
                    className='max-h-96 overflow-y-auto space-y-2'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  >
                    {importPhase.deletionProgress.map((item, index) => (
                      <motion.div
                        key={item.table}
                        initial={{ opacity: 0, x: -50, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ 
                          delay: 1.0 + index * 0.08, 
                          duration: 0.5,
                          type: "spring",
                          stiffness: 100
                        }}
                        whileHover={{ x: 5, transition: { duration: 0.2 } }}
                        className={`p-4 rounded-xl border transition-all duration-300 ${
                          item.status === 'pending' 
                            ? 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border-gray-200 dark:border-gray-700'
                            : item.status === 'deleting'
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700'
                            : item.status === 'completed'
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700'
                            : 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-700'
                        }`}
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-4'>
                            <motion.div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                item.status === 'pending' 
                                  ? 'bg-gray-200 dark:bg-gray-700'
                                  : item.status === 'deleting'
                                  ? 'bg-blue-500 shadow-lg shadow-blue-500/30'
                                  : item.status === 'completed'
                                  ? 'bg-green-500 shadow-lg shadow-green-500/30'
                                  : 'bg-red-500 shadow-lg shadow-red-500/30'
                              }`}
                              animate={item.status === 'deleting' ? { rotate: 360 } : {}}
                              transition={item.status === 'deleting' ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
                            >
                              {item.status === 'pending' && <FiClock className='w-5 h-5 text-gray-500' />}
                              {item.status === 'deleting' && <FiRefreshCw className='w-5 h-5 text-white' />}
                              {item.status === 'completed' && <FiCheckCircle className='w-5 h-5 text-white' />}
                              {item.status === 'failed' && <FiAlertCircle className='w-5 h-5 text-white' />}
                            </motion.div>
                            <div>
                              <div className='font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 dark:from-slate-100 dark:via-white dark:to-slate-100 bg-clip-text text-transparent capitalize text-lg tracking-wide'>
                                {item.table.replace(/([A-Z])/g, ' $1').trim()}
                              </div>
                              <div className='text-sm text-slate-600 dark:text-slate-300 mt-1 font-semibold tracking-wide'>
                                {item.message}
                              </div>
                              {item.error && item.status === 'failed' && (
                                <motion.div 
                                  className='text-xs text-red-700 dark:text-red-300 mt-2 p-3 bg-gradient-to-r from-red-50 via-pink-50 to-red-50 dark:from-red-900/30 dark:via-pink-900/30 dark:to-red-900/30 rounded-lg border border-red-200/60 dark:border-red-600/40 shadow-sm'
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  transition={{ delay: 0.5, duration: 0.3 }}
                                >
                                  <strong className='font-bold text-red-800 dark:text-red-200'>Error Details:</strong> <span className='font-medium'>{item.error}</span>
                                </motion.div>
                              )}
                            </div>
                          </div>
                          <div className='text-right'>
                            {item.status === 'completed' && (
                              <motion.div 
                                className='text-sm font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 dark:from-emerald-900/50 dark:via-green-900/50 dark:to-emerald-900/50 px-4 py-2 rounded-full shadow-lg border border-emerald-200/50 dark:border-emerald-600/50'
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3, duration: 0.4 }}
                              >
                                {item.recordsDeleted} records
                              </motion.div>
                            )}
                            {item.status === 'failed' && (
                              <motion.div 
                                className='text-sm font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent bg-gradient-to-r from-red-50 via-pink-50 to-red-50 dark:from-red-900/50 dark:via-pink-900/50 dark:to-red-900/50 px-3 py-2 rounded-full shadow-lg border border-red-200/50 dark:border-red-600/50'
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3, duration: 0.4 }}
                              >
                                Failed
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Deletion Complete Message with Premium Animation */}
                  {importPhase.phase === 'deletion-complete' && (
                    <motion.div
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
                      className='pt-6'
                    >
                      <div className='p-6 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-green-900/20 border border-green-200 dark:border-green-700 rounded-xl shadow-lg'>
                        <div className='flex items-center gap-4 mb-4'>
                          <motion.div 
                            className='w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30'
                            animate={{ 
                              scale: [1, 1.2, 1],
                              rotate: [0, 10, -10, 0]
                            }}
                            transition={{ 
                              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                              rotate: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                            }}
                          >
                            <FiCheckCircle className='w-6 h-6 text-white' />
                          </motion.div>
                          <div>
                            <h5 className='text-xl font-bold bg-gradient-to-r from-green-700 via-emerald-600 to-green-700 bg-clip-text text-transparent'>
                              Deletion Complete!
                            </h5>
                            <p className='text-green-700 dark:text-green-200 font-semibold'>
                              All tables have been successfully deleted. Starting data insertion automatically...
                            </p>
                          </div>
                        </div>
                        
                        <motion.div 
                          className='mb-6 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg text-center'
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8, duration: 0.6 }}
                        >
                          <div className='text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 bg-clip-text text-transparent'>
                            {importPhase.deletionProgress.reduce((total, item) => total + item.recordsDeleted, 0).toLocaleString()}
                          </div>
                          <div className='text-sm text-green-700 dark:text-green-200 font-semibold tracking-wide'>Total Records Deleted</div>
                        </motion.div>
                        
                        <motion.div 
                          className='flex items-center justify-center gap-3 text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg'
                          animate={{ opacity: [1, 0.8, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <FiRefreshCw className='w-5 h-5 animate-spin' />
                          <span className='font-bold text-blue-700 dark:text-blue-200'>Preparing for insertion...</span>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Phase 2: Insertion Progress - Slides in after deletion */}
            <AnimatePresence mode="wait">
              {importPhase.phase === 'inserting' && (
                <motion.div
                  key="insertion-phase"
                  initial={{ opacity: 0, x: 100, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  transition={{ duration: 1.0, ease: "easeInOut" }}
                  className='space-y-4 mt-6'
                >
                  {/* Premium Insertion Header */}
                  <motion.div 
                    className='flex items-center justify-between'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className='w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30'
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 360]
                        }}
                        transition={{ 
                          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                          rotate: { duration: 3, repeat: Infinity, ease: "linear" }
                        }}
                      >
                        <FiDatabase className='w-6 h-6 text-white' />
                      </motion.div>
                      <div>
                        <h4 className='text-xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 dark:from-slate-100 dark:via-white dark:to-slate-100 bg-clip-text text-transparent'>
                          Inserting Tables...
                        </h4>
                        <p className='text-sm text-slate-600 dark:text-slate-300 font-medium'>
                          Building new database structure with fresh data
                        </p>
                      </div>
                    </div>
                    
                    <motion.div 
                      className='flex items-center gap-2 text-sm text-green-600'
                      animate={{ opacity: [1, 0.7, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <FiRefreshCw className='w-4 h-4 animate-spin' />
                      <span className='font-semibold text-green-700 dark:text-green-200'>Processing...</span>
                    </motion.div>
                  </motion.div>

                  {/* Premium Insertion Progress Summary */}
                  <motion.div 
                    className='grid grid-cols-1 md:grid-cols-4 gap-4'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    {[
                      { 
                        label: 'Completed', 
                        count: importPhase.insertionProgress.filter(item => item.status === 'completed').length,
                        color: 'green',
                        icon: FiCheckCircle
                      },
                      { 
                        label: 'Processing', 
                        count: importPhase.insertionProgress.filter(item => item.status === 'inserting').length,
                        color: 'blue',
                        icon: FiRefreshCw
                      },
                      { 
                        label: 'Failed', 
                        count: importPhase.insertionProgress.filter(item => item.status === 'failed').length,
                        color: 'red',
                        icon: FiAlertCircle
                      },
                      { 
                        label: 'Pending', 
                        count: importPhase.insertionProgress.filter(item => item.status === 'pending').length,
                        color: 'gray',
                        icon: FiClock
                      }
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
                          stat.color === 'green' ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700' :
                          stat.color === 'blue' ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-700' :
                          stat.color === 'red' ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200 dark:from-red-900/20 dark:to-pink-900/20 dark:border-red-700' :
                          'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 dark:from-gray-900/20 dark:to-slate-900/20 dark:border-gray-700'
                        }`}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      >
                        <div className='text-center'>
                          <div className={`text-2xl font-extrabold ${
                            stat.color === 'green' ? 'text-green-600' :
                            stat.color === 'blue' ? 'text-blue-600' :
                            stat.color === 'red' ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {stat.count}
                          </div>
                          <div className='text-sm text-slate-600 dark:text-slate-300 mt-1 font-semibold tracking-wide'>{stat.label}</div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Premium Insertion Progress List */}
                  <motion.div 
                    className='max-h-96 overflow-y-auto space-y-2'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                  >
                    {importPhase.insertionProgress.map((item, index) => (
                      <motion.div
                        key={item.table}
                        initial={{ opacity: 0, x: -50, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ 
                          delay: 1.1 + index * 0.08, 
                          duration: 0.5,
                          type: "spring",
                          stiffness: 100
                        }}
                        whileHover={{ x: 5, transition: { duration: 0.2 } }}
                        className={`p-4 rounded-xl border transition-all duration-300 ${
                          item.status === 'pending' 
                            ? 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border-gray-200 dark:border-gray-700'
                            : item.status === 'inserting'
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700'
                            : item.status === 'completed'
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700'
                            : 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-700'
                        }`}
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-4'>
                            <motion.div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                item.status === 'pending' 
                                  ? 'bg-gray-200 dark:bg-gray-700'
                                  : item.status === 'inserting'
                                  ? 'bg-blue-500 shadow-lg shadow-blue-500/30'
                                  : item.status === 'completed'
                                  ? 'bg-green-500 shadow-lg shadow-green-500/30'
                                  : 'bg-red-500 shadow-lg shadow-red-500/30'
                              }`}
                              animate={item.status === 'inserting' ? { rotate: 360 } : {}}
                              transition={item.status === 'inserting' ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
                            >
                              {item.status === 'pending' && <FiClock className='w-5 h-5 text-gray-500' />}
                              {item.status === 'inserting' && <FiRefreshCw className='w-5 h-5 text-white' />}
                              {item.status === 'completed' && <FiCheckCircle className='w-5 h-5 text-white' />}
                              {item.status === 'failed' && <FiAlertCircle className='w-5 h-5 text-white' />}
                            </motion.div>
                            <div>
                              <div className='font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 dark:from-slate-100 dark:via-white dark:to-slate-100 bg-clip-text text-transparent capitalize text-lg tracking-wide'>
                                {item.table.replace(/([A-Z])/g, ' $1').trim()}
                              </div>
                              <div className='text-sm text-slate-600 dark:text-slate-300 mt-1 font-semibold tracking-wide'>
                                {item.message}
                              </div>
                              {item.error && item.status === 'failed' && (
                                <motion.div 
                                  className='text-xs text-red-700 dark:text-red-300 mt-2 p-3 bg-gradient-to-r from-red-50 via-pink-50 to-red-50 dark:from-red-900/30 dark:via-pink-900/30 dark:to-red-900/30 rounded-lg border border-red-200/60 dark:border-red-600/40 shadow-sm'
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  transition={{ delay: 0.5, duration: 0.3 }}
                                >
                                  <strong className='font-bold text-red-800 dark:text-red-200'>Error Details:</strong> <span className='font-medium'>{item.error}</span>
                                </motion.div>
                              )}
                            </div>
                          </div>
                          <div className='text-right'>
                            {item.status === 'completed' && (
                              <motion.div 
                                className='text-sm font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 dark:from-emerald-900/50 dark:via-green-900/50 dark:to-emerald-900/50 px-4 py-2 rounded-full shadow-lg border border-emerald-200/50 dark:border-emerald-600/50'
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3, duration: 0.4 }}
                              >
                                {item.recordsInserted} records
                              </motion.div>
                            )}
                            {item.status === 'failed' && (
                              <motion.div 
                                className='text-sm font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent bg-gradient-to-r from-red-50 via-pink-50 to-red-50 dark:from-red-900/50 dark:via-pink-900/50 dark:to-red-900/50 px-3 py-2 rounded-full shadow-lg border border-red-200/50 dark:border-red-600/50'
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3, duration: 0.4 }}
                              >
                                Failed
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Phase 3: Completion Message - Premium Finale */}
            <AnimatePresence mode="wait">
              {importPhase.phase === 'complete' && (
                <motion.div
                  key="completion-phase"
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 1.2, type: "spring", damping: 20 }}
                  className='space-y-6 mt-6'
                >
                  {/* Premium Completion Header */}
                  <motion.div
                    className='p-8 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl shadow-2xl text-center'
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    <motion.div 
                      className='w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30 mx-auto mb-6'
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{ 
                        scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                        rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                      }}
                    >
                      <FiCheckCircle className='w-10 h-10 text-white' />
                    </motion.div>
                    
                    <motion.h3 
                      className='text-3xl font-bold text-green-800 dark:text-green-200 mb-4'
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                    >
                      All Operations Complete!
                    </motion.h3>
                    
                    <motion.p 
                      className='text-lg text-green-700 dark:text-green-300 mb-6'
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.6 }}
                    >
                      Database has been successfully updated with {importPhase.insertionProgress.reduce((total, item) => total + item.recordsInserted, 0).toLocaleString()} new records
                    </motion.p>
                    
                    <motion.div 
                      className='grid grid-cols-2 gap-6 mb-6'
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0, duration: 0.6 }}
                    >
                      <div className='text-center p-4 bg-green-100 dark:bg-green-900/30 rounded-xl'>
                        <div className='text-2xl font-bold text-green-800 dark:text-green-200'>
                          {importPhase.insertionProgress.filter(item => item.status === 'completed').length}
                        </div>
                        <div className='text-sm text-green-700 dark:text-green-300'>Tables Processed</div>
                      </div>
                      <div className='text-center p-4 bg-green-100 dark:bg-green-900/30 rounded-xl'>
                        <div className='text-2xl font-bold text-green-800 dark:text-green-200'>
                          {importPhase.insertionProgress.reduce((total, item) => total + item.recordsInserted, 0).toLocaleString()}
                        </div>
                        <div className='text-sm text-green-700 dark:text-green-300'>Total Records</div>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Final Results Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                    className='space-y-4'
                  >
                    <div className='flex items-center justify-between'>
                      <h4 className='text-xl font-semibold text-gray-900 dark:text-white'>
                        Insertion Results Summary
                      </h4>
                      <div className='flex items-center gap-2'>
                        <FiCheckCircle className='w-5 h-5 text-green-600' />
                        <span className='text-sm text-green-600 font-medium'>Completed</span>
                      </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-800/50 dark:to-green-900/20 rounded-xl border border-gray-200 dark:border-gray-700'>
                      <div className='text-center'>
                        <div className='text-2xl font-bold text-green-600'>
                          {importPhase.insertionProgress.filter(item => item.status === 'completed').length}
                        </div>
                        <div className='text-sm text-gray-600 dark:text-gray-400'>Completed</div>
                      </div>
                      <div className='text-center'>
                        <div className='text-2xl font-bold text-blue-600'>
                          {importPhase.insertionProgress.filter(item => item.status === 'inserting').length}
                        </div>
                        <div className='text-sm text-gray-600 dark:text-gray-400'>Processing</div>
                      </div>
                      <div className='text-center'>
                        <div className='text-2xl font-bold text-red-600'>
                          {importPhase.insertionProgress.filter(item => item.status === 'failed').length}
                        </div>
                        <div className='text-sm text-gray-600 dark:text-gray-400'>Failed</div>
                      </div>
                      <div className='text-center'>
                        <div className='text-2xl font-bold text-gray-600'>
                          {importPhase.insertionProgress.filter(item => item.status === 'pending').length}
                        </div>
                        <div className='text-sm text-gray-600 dark:text-gray-400'>Pending</div>
                      </div>
                    </div>

                    {/* Detailed Results List */}
                    <div className='max-h-96 overflow-y-auto space-y-2'>
                      {importPhase.insertionProgress.map((item, index) => (
                        <motion.div
                          key={item.table}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.4 + index * 0.05, duration: 0.4 }}
                          className={`p-3 rounded-lg border transition-all duration-300 ${
                            item.status === 'pending' 
                              ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                              : item.status === 'inserting'
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                              : item.status === 'completed'
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-gray-700'
                          }`}
                        >
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                item.status === 'pending' 
                                  ? 'bg-gray-200 dark:bg-gray-700'
                                  : item.status === 'inserting'
                                  ? 'bg-blue-500'
                                  : item.status === 'completed'
                                  ? 'bg-green-500'
                                  : 'bg-red-500'
                              }`}>
                                {item.status === 'pending' && <FiClock className='w-4 h-4 text-gray-500' />}
                                {item.status === 'inserting' && <FiRefreshCw className='w-4 h-4 text-white animate-spin' />}
                                {item.status === 'completed' && <FiCheckCircle className='w-4 h-4 text-white' />}
                                {item.status === 'failed' && <FiAlertCircle className='w-4 h-4 text-white' />}
                              </div>
                              <div>
                                <div className='font-medium text-gray-900 dark:text-white capitalize'>
                                  {item.table.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                                <div className='text-sm text-gray-600 dark:text-gray-400'>
                                  {item.message}
                                </div>
                                {item.error && item.status === 'failed' && (
                                  <div className='text-xs text-red-600 dark:text-red-400 mt-1 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-700'>
                                    <strong className='font-bold text-red-800 dark:text-red-200'>Error Details:</strong> <span className='font-medium'>{item.error}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className='text-right'>
                              {item.status === 'completed' && (
                                <div className='text-sm font-medium text-green-600'>
                                  {item.recordsInserted} records
                                </div>
                              )}
                              {item.status === 'failed' && (
                                <div className='text-sm font-medium text-red-600'>
                                  Failed
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
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
  const [uploadMessage, setUploadMessage] = useState('')
  const [fileList, setFileList] = useState<FileItem[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [isFileListExpanded, setIsFileListExpanded] = useState(false)
  
  // New state for deletion functionality
  const [importPhase, setImportPhase] = useState<ImportPhase>({
    phase: 'idle',
    deletionProgress: [],
    insertionProgress: []
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const [isInserting, setIsInserting] = useState(false)
  
  // Popup state
  const [showPopup, setShowPopup] = useState(false)

  // Data source configuration state
  const [isUpdatingDataSource, setIsUpdatingDataSource] = useState(false)
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const [isUpdatingInterval, setIsUpdatingInterval] = useState(false)
  const intervalUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // File operation loading states
  const [isDeletingFile, setIsDeletingFile] = useState<string | null>(null) // Track which file is being deleted
  const [isDeletingAll, setIsDeletingAll] = useState(false)

  // Data updater tracking state
  const [lastUpdateInfo, setLastUpdateInfo] = useState<{
    lastManualUpdate: Date | null
    lastAutoUpdate: Date | null
    lastUpdateStatus: string
    lastUpdateMessage: string | null
    nextUpdateIn?: number
  } | null>(null)
  const [isLoadingTimestamps, setIsLoadingTimestamps] = useState(true)
  const [isAutoUpdateActive, setIsAutoUpdateActive] = useState(false)
  const [isAutoUpdateRunning, setIsAutoUpdateRunning] = useState(false)
  const [autoUpdateStatus, setAutoUpdateStatus] = useState<{
    status: 'idle' | 'cooldown' | 'waiting' | 'ready' | 'polling' | 'updating'
    message?: string
    timeRemaining?: number
  }>({ status: 'idle' })
  
  const [autoUpdateProgress, setAutoUpdateProgress] = useState<{
    phase: 'idle' | 'deleting' | 'inserting' | 'complete'
    currentTable?: string
    tablesCompleted: number
    totalTables: number
    recordsProcessed: number
    startTime?: number
    completedStats?: {
      totalRecordsDeleted: number
      totalRecordsInserted: number
      totalTablesProcessed: number
      completedAt: number | null
    }
  }>({ phase: 'idle', tablesCompleted: 0, totalTables: 0, recordsProcessed: 0 })
  const autoUpdateRunningRef = useRef(false)

  // Deletion order based on foreign key dependencies (child tables first)
  // Note: settings table is excluded from deletion as it's a primary configuration table
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

  // Insertion order based on foreign key dependencies (parent tables first)
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

  // Fetch files from data-db folder
  const fetchFiles = async () => {
    setIsLoadingFiles(true)
    
    try {
      const response = await fetch('/api/data-manager/files')
      if (response.ok) {
        const data = await response.json()
        setFileList(data.files || [])
      } else {
        const errorData = await response.json()
        toast.error(`Failed to fetch files: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      toast.error(`Error fetching files: ${error instanceof Error ? error.message : 'Network error'}`)
      console.error('Error fetching files:', error)
    } finally {
      // Add slight delay to show premium loading animation
      setTimeout(() => {
        setIsLoadingFiles(false)
      }, 250)
    }
  }

  // Fetch files for a specific data source (bypasses database read)
  const fetchFilesForDataSource = async (dataSource: 'local' | 'vercel') => {
    setIsLoadingFiles(true)
    
    try {
      // Create a temporary API endpoint or modify existing one to accept data source parameter
      const response = await fetch(`/api/data-manager/files?dataSource=${dataSource}`)
      if (response.ok) {
        const data = await response.json()
        setFileList(data.files || [])
        
        // Premium success feedback for file loading
        if (data.files && data.files.length > 0) {
          toast.success(`📁 Loaded ${data.files.length} file${data.files.length !== 1 ? 's' : ''} from ${dataSource === 'vercel' ? 'Vercel Blob' : 'Local Storage'}`)
        }
      } else {
        const errorData = await response.json()
        toast.error(`Failed to load files: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      toast.error(`Error loading files: ${error instanceof Error ? error.message : 'Network error'}`)
      console.error('Error fetching files for data source:', error)
    } finally {
      // Add slight delay to show premium loading animation
      setTimeout(() => {
        setIsLoadingFiles(false)
      }, 300)
    }
  }

  // Remove individual file with premium loading state
  const removeFile = async (fileName: string) => {
    setIsDeletingFile(fileName) // Immediate loading state for this specific file
    
    try {
      const response = await fetch('/api/data-manager/files', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName }),
      })

      if (response.ok) {
        // Premium success feedback with toast
        toast.success(`✅ Successfully deleted ${fileName}`)
        
        // Optimistic UI update with premium animation delay
        setTimeout(() => {
          setFileList(prev => prev.filter(file => file.name !== fileName))
          setIsDeletingFile(null)
        }, 600) // Slightly faster for premium experience
      } else {
        const errorData = await response.json()
        setIsDeletingFile(null)
        toast.error(`Failed to delete ${fileName}: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      setIsDeletingFile(null)
      toast.error(`Error deleting ${fileName}: ${error instanceof Error ? error.message : 'Network error'}`)
      console.error('Error removing file:', error)
    }
  }

  // Delete all files with premium loading state
  const deleteAllFiles = async () => {
    setIsDeletingAll(true) // Immediate loading state for delete all
    const originalFileCount = fileList.length
    
    try {
      const response = await fetch('/api/data-manager/files', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deleteAll: true }),
      })

      if (response.ok) {
        // Premium success feedback with toast
        toast.success(`🗑️ Successfully deleted all ${originalFileCount} files!`)
        
        // Premium loading experience with staggered file removal animation
        for (let i = 0; i < originalFileCount; i++) {
          setTimeout(() => {
            setFileList(prev => {
              if (prev.length > 0) {
                return prev.slice(1) // Remove first file from list with animation
              }
              return prev
            })
          }, i * 80) // Faster stagger for premium feel
        }
        
        // Reset delete all state after animation completes
        setTimeout(() => {
          setIsDeletingAll(false)
        }, originalFileCount * 80 + 400) // Shorter delay
      } else {
        const errorData = await response.json()
        setIsDeletingAll(false)
        toast.error(`Failed to delete all files: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      setIsDeletingAll(false)
      toast.error(`Error deleting all files: ${error instanceof Error ? error.message : 'Network error'}`)
      console.error('Error deleting all files:', error)
    }
  }

  // Load current data source configuration
  const loadDataSourceConfig = async () => {
    try {
      setIsLoadingConfig(true)
      console.log('🔍 Loading data source configuration on page load...')
      const response = await fetch('/api/data-manager/config')
      if (response.ok) {
        const result = await response.json()
        console.log('🔍 Config API Response:', result)
        if (result.success && result.data) {
          console.log(`🔍 Database selectedDataSource: ${result.data.selectedDataSource}`)
          console.log(`🔍 Setting UI to: ${result.data.selectedDataSource || 'local'}`)
          setSelectedDataSource(result.data.selectedDataSource || 'local')
          setAutoSyncEnabled(result.data.autoUpdateEnabled || false)
          setSyncInterval(result.data.updateIntervalMinutes || 60)
        } else {
          console.log('🚨 Config API returned no data or failed:', result)
        }
      } else {
        console.log('🚨 Config API response not OK:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('🚨 Error loading data source configuration:', error)
    } finally {
      setIsLoadingConfig(false)
    }
  }

  // Update data source configuration in database
  const updateDataSourceConfig = async (newDataSource: 'local' | 'vercel', previousDataSource: 'local' | 'vercel') => {
    if (isUpdatingDataSource) return
    
    setIsUpdatingDataSource(true)
    try {
      const payload = {
        selectedDataSource: newDataSource,
        autoUpdateEnabled: autoSyncEnabled,
        updateIntervalMinutes: syncInterval
      }
      console.log('🔄 Saving data source config:', payload)
      
      const response = await fetch('/api/data-manager/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      console.log('🔄 Save response:', result)
      
      if (result.success) {
        // Immediately fetch files from the new data source without relying on database
        fetchFilesForDataSource(newDataSource)
        
        toast.success(`Data source updated!`, {
          description: `Successfully switched to ${newDataSource === 'local' ? 'Local Data-Db Folder' : 'Vercel Blob Storage'}`,
          duration: 3000
        })
      } else {
        // Revert UI state if database update failed
        setSelectedDataSource(previousDataSource)
        setIsLoadingFiles(false)
        fetchFiles() // Refresh with previous data source
        
        console.error('Failed to update data source configuration:', result.error)
        toast.error('Update failed', {
          description: result.error || 'Failed to update data source configuration',
          duration: 5000
        })
      }
    } catch (error) {
      // Revert UI state if request failed
      setSelectedDataSource(previousDataSource)
      setIsLoadingFiles(false)
      fetchFiles() // Refresh with previous data source
      
      console.error('Error updating data source configuration:', error)
      toast.error('Connection error', {
        description: 'Unable to connect to server. Please try again.',
        duration: 5000
      })
    } finally {
      setIsUpdatingDataSource(false)
    }
  }

  // Handle data source selection with database update
  const handleDataSourceChange = (newDataSource: 'local' | 'vercel') => {
    if (newDataSource !== selectedDataSource) {
      const previousDataSource = selectedDataSource
      
      // Immediately update UI state for instant feedback
      setSelectedDataSource(newDataSource)
      
      // Clear current file list immediately to show loading state
      setFileList([])
      setIsLoadingFiles(true)
      
      // Update database and refresh file list
      updateDataSourceConfig(newDataSource, previousDataSource)
    }
  }

  // Helper functions for deletion progress
  const initializeDeletionProgress = () => {
    return deletionOrder.map(table => ({
      table,
      status: 'pending' as const,
      recordsDeleted: 0,
      message: 'Waiting to delete...'
    }))
  }

  // CORE DELETION FUNCTION - Used by both manual and auto update
  const executeCoreTableDeletion = async (
    onProgress?: (tableName: string, updates: Partial<DeletionProgress>) => void,
    onTableUpdate?: (tableName: string, completed: number, total: number, records: number) => void
  ) => {
    let totalRecords = 0
    let tablesProcessed = 0
    
    // Delete tables one by one in the correct order (EXACT same logic as manual)
    for (let i = 0; i < deletionOrder.length; i++) {
      const tableName = deletionOrder[i]
      
      // Update status to deleting
      onProgress?.(tableName, {
        status: 'deleting',
        message: 'Deleting records...'
      })
      
      // Update table progress for auto-update
      onTableUpdate?.(tableName, i, deletionOrder.length, totalRecords)

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
          
          // Handle skipped tables (like settings)
          if (result.skipped) {
            onProgress?.(tableName, {
              status: 'completed',
              recordsDeleted: 0,
              message: result.message || 'Table skipped - data preserved'
            })
          } else {
            // Update progress with success
            totalRecords += result.recordsDeleted
            tablesProcessed += 1
            
            onProgress?.(tableName, {
              status: 'completed',
              recordsDeleted: result.recordsDeleted,
              message: `Deleted ${result.recordsDeleted} records successfully`
            })
          }
          
          // Update progress after completion
          onTableUpdate?.(tableName, i + 1, deletionOrder.length, totalRecords)
          
        } else {
          // Handle error response safely (EXACT same error handling)
          let errorMessage = 'Deletion failed'
          let errorDetails = ''
          try {
            const errorText = await response.text()
            const errorData = JSON.parse(errorText)
            errorMessage = errorData.message || errorData.error || 'Deletion failed'
            errorDetails = errorData.details || ''
          } catch {
            errorMessage = `HTTP ${response.status} ${response.statusText}`
          }

          const fullError = errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage
          throw new Error(fullError)
        }
      } catch (error) {
        // Update progress with failure
        onProgress?.(tableName, {
          status: 'failed',
          message: `Deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        throw error // Re-throw to stop the process
      }
    }
    
    return { success: true, totalRecords, tablesProcessed }
  }

  const updateDeletionProgress = (tableName: string, updates: Partial<DeletionProgress>) => {
    setImportPhase(prev => ({
      ...prev,
      deletionProgress: prev.deletionProgress.map(item => 
        item.table === tableName ? { ...item, ...updates } : item
      )
    }))
  }

  // Helper functions for insertion progress
  const initializeInsertionProgress = () => {
    return insertionOrder.map(table => ({
      table,
      status: 'pending' as const,
      recordsInserted: 0,
      message: 'Waiting to insert...'
    }))
  }

  // CORE INSERTION FUNCTION - Used by both manual and auto update
  const executeCoreTableInsertion = async (
    onProgress?: (tableName: string, updates: Partial<InsertionProgress>) => void,
    onTableUpdate?: (tableName: string, completed: number, total: number, records: number) => void
  ) => {
    let totalRecords = 0
    let tablesProcessed = 0
    
    // Insert tables one by one in the correct order (EXACT same logic as manual)
    for (let i = 0; i < insertionOrder.length; i++) {
      const tableName = insertionOrder[i]
      
      // Update status to inserting
      onProgress?.(tableName, {
        status: 'inserting',
        message: 'Inserting records...'
      })
      
      // Update table progress for auto-update
      onTableUpdate?.(tableName, i, insertionOrder.length, totalRecords)

      try {
        const response = await fetch('/api/data-manager/insert-table', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tableName }),
        })

        if (response.ok) {
          const result = await response.json()
          
          // Handle settings table updates
          if (tableName === 'settings' || result.updated) {
            onProgress?.(tableName, {
              status: 'completed',
              recordsInserted: result.recordsInserted || 0,
              message: result.message || 'Settings updated successfully - configuration preserved'
            })
          } else {
            // Update progress with success for other tables
            totalRecords += result.recordsInserted
            tablesProcessed += 1
            
            onProgress?.(tableName, {
              status: 'completed',
              recordsInserted: result.recordsInserted,
              message: `Inserted ${result.recordsInserted} records successfully`
            })
          }
          
          // Update progress after completion
          onTableUpdate?.(tableName, i + 1, insertionOrder.length, totalRecords)
          
        } else {
          // Handle error response safely (EXACT same error handling)
          let errorMessage = 'Insertion failed'
          let errorDetails = ''
          try {
            const errorText = await response.text()
            const errorData = JSON.parse(errorText)
            errorMessage = errorData.message || errorData.error || 'Insertion failed'
            errorDetails = errorData.details || ''
          } catch {
            errorMessage = `HTTP ${response.status} ${response.statusText}`
          }

          const fullError = errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage
          throw new Error(fullError)
        }
      } catch (error) {
        // Update progress with failure
        onProgress?.(tableName, {
          status: 'failed',
          message: `Insertion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        throw error // Re-throw to stop the process
      }
    }
    
    return { success: true, totalRecords, tablesProcessed }
  }

  const updateInsertionProgress = (tableName: string, updates: Partial<InsertionProgress>) => {
    setImportPhase(prev => ({
      ...prev,
      insertionProgress: prev.insertionProgress.map(item => 
        item.table === tableName ? { ...item, ...updates } : item
      )
    }))
  }

  // Main deletion handler - NOW USES THE SAME CORE LOGIC AS AUTO-UPDATE
  const handleDatabaseUpdate = async () => {
    // Filter for JSON files only
    const jsonFiles = fileList.filter(file => file.name.toLowerCase().endsWith('.json'))
    if (isDeleting || jsonFiles.length === 0) return

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
      // Use the EXACT SAME core deletion logic as auto-update (PROVEN TO WORK)
      await executeCoreTableDeletion(
        updateDeletionProgress, // Update UI progress for manual updates
        undefined // No auto-update progress API needed for manual
      )

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
    } finally {
      setIsDeleting(false)
    }
  }

  // Reset function to clear progress
  const resetProgress = () => {
    setImportPhase({
      phase: 'idle',
      deletionProgress: [],
      insertionProgress: []
    })
    setIsDeleting(false)
    setIsInserting(false)
  }

  // Main insertion handler - NOW USES THE SAME CORE LOGIC AS AUTO-UPDATE  
  const handleContinueInsertion = async () => {
    // Filter for JSON files only
    const jsonFiles = fileList.filter(file => file.name.toLowerCase().endsWith('.json'))
    if (isInserting || jsonFiles.length === 0) return

    setIsInserting(true)
    
    // Initialize insertion progress tracking
    const initialProgress = initializeInsertionProgress()
    setImportPhase(prev => ({
      ...prev,
      phase: 'inserting',
      insertionProgress: initialProgress
    }))

    try {
      // Use the EXACT SAME core insertion logic as auto-update (PROVEN TO WORK)
      await executeCoreTableInsertion(
        updateInsertionProgress, // Update UI progress for manual updates
        undefined // No auto-update progress API needed for manual
      )

      // All insertions complete
      setImportPhase(prev => ({
        ...prev,
        phase: 'complete'
      }))

      // Refresh data updater info to show latest update status
      fetchDataUpdaterInfo()
      
      // Also manually update the timestamp to ensure it's recorded
      try {
        await fetch('/api/data-manager/update-timestamps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            updateType: 'manual',
            status: 'success',
            message: 'Database update completed successfully'
          })
        })
      } catch (error) {
        console.error('Error updating timestamp:', error)
      }

      // Auto-close popup after 5 seconds and refresh data
      setTimeout(() => {
        setShowPopup(false)
        // Refresh data updater info when popup closes
        setTimeout(() => {
          fetchDataUpdaterInfo()
        }, 500) // Small delay to ensure popup is fully closed
      }, 5000)

    } catch (error) {
      console.error('Error during insertion process:', error)
    } finally {
      setIsInserting(false)
    }
  }

  useEffect(() => {
    const initializeData = async () => {
      // Load both config and timestamp data in parallel
      await Promise.all([
        loadDataSourceConfig(),
        fetchDataUpdaterInfo()
      ])
    }
    
    fetchFiles()
    initializeData()
  }, [])

  // Refresh data updater info intelligently - more frequent when update is due
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    const scheduleNextRefresh = () => {
      if (interval) clearInterval(interval)
      
      // More frequent updates when auto-update is active and update is due soon
      const refreshInterval = isAutoUpdateActive && lastUpdateInfo?.nextUpdateIn && lastUpdateInfo.nextUpdateIn < 5 * 60 * 1000 
        ? 30000 // 30 seconds when update is due within 5 minutes
        : 2 * 60 * 1000 // 2 minutes otherwise
      
      interval = setInterval(() => {
        fetchDataUpdaterInfo().then(() => scheduleNextRefresh())
      }, refreshInterval)
    }
    
    scheduleNextRefresh()
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isAutoUpdateActive, lastUpdateInfo?.nextUpdateIn])

  // Intelligent Auto Update Background Process with Server-Side Scheduling
  useEffect(() => {
    let scheduleTimer: NodeJS.Timeout | null = null
    let pollTimer: NodeJS.Timeout | null = null
    let progressTimer: NodeJS.Timeout | null = null
    
    const checkAutoUpdateSchedule = async () => {
      if (!autoSyncEnabled || syncInterval <= 0) {
        setIsAutoUpdateActive(false)
        return
      }
      
      try {
        const response = await fetch('/api/data-manager/auto-update-schedule')
        const schedule = await response.json()
        
        console.log('🔍 Auto Update Debug: Schedule response:', {
          success: schedule.success,
          autoUpdateEnabled: schedule.autoUpdateEnabled,
          shouldPoll: schedule.shouldPoll,
          nextUpdateIn: schedule.nextUpdateIn,
          serverStartupCooldown: schedule.serverStartupCooldown,
          readyForUpdate: schedule.readyForUpdate
        })
        
        if (!schedule.success || !schedule.autoUpdateEnabled) {
          console.log('⏸️ Auto Update: Disabled or failed')
          setIsAutoUpdateActive(false)
          return
        }
        
        setIsAutoUpdateActive(true)
        
        if (schedule.serverStartupCooldown) {
          // Server is in cooldown - wait until cooldown ends
          const cooldownMinutes = Math.ceil(schedule.cooldownRemaining / (60 * 1000))
          console.log(`❄️ Auto Update: Server cooldown active - ${cooldownMinutes} minutes remaining`)
          
          setAutoUpdateStatus({
            status: 'cooldown',
            message: `Server startup cooldown - ${cooldownMinutes} minutes remaining`,
            timeRemaining: schedule.cooldownRemaining
          })
          
          scheduleTimer = setTimeout(checkAutoUpdateSchedule, Math.min(schedule.cooldownRemaining, 5 * 60 * 1000))
          return
        }
        
        if (schedule.shouldPoll) {
          // Start polling for auto-update
          console.log('🔄 Auto Update: Starting intelligent polling')
          setAutoUpdateStatus({ status: 'polling', message: 'Polling for update...' })
          startPolling()
        } else if (schedule.nextUpdateIn > 0) {
          // Schedule next check
          const minutes = Math.ceil(schedule.nextUpdateIn / (60 * 1000))
          console.log(`⏰ Auto Update: Next update in ${minutes} minutes`)
          
          setAutoUpdateStatus({
            status: 'waiting',
            message: `Next update in ${minutes} minutes`,
            timeRemaining: schedule.nextUpdateIn
          })
          
          // Check again when polling should start (5 minutes before update)
          // For long intervals (>1 hour), check every hour. For shorter intervals, use pollStartsIn
          let checkDelay = schedule.pollStartsIn || schedule.nextUpdateIn
          
          if (schedule.nextUpdateIn > 60 * 60 * 1000) { // More than 1 hour
            checkDelay = Math.min(60 * 60 * 1000, schedule.nextUpdateIn) // Check every hour max
          } else {
            checkDelay = Math.max(checkDelay, 60000) // At least 1 minute for short intervals
          }
          
          console.log(`🔍 Auto Update Debug: Scheduling next check in ${Math.ceil(checkDelay / 60000)} minutes`)
          scheduleTimer = setTimeout(checkAutoUpdateSchedule, checkDelay)
        } else {
          console.log('🔍 Auto Update Debug: No specific action taken, nextUpdateIn:', schedule.nextUpdateIn)
          
          // Check if an update just completed (nextUpdateIn is very large, meaning just reset)
          if (schedule.nextUpdateIn > 50 * 60 * 1000) { // More than 50 minutes = just completed
            setAutoUpdateStatus({ status: 'ready', message: 'Update completed - next in ' + Math.ceil(schedule.nextUpdateIn / (60 * 1000)) + ' minutes' })
            setIsAutoUpdateRunning(false)
            autoUpdateRunningRef.current = false
            stopProgressPolling()
          } else {
            setAutoUpdateStatus({ status: 'ready', message: 'Ready for update' })
          }
        }
        
      } catch (error) {
        console.error('❌ Auto Update: Error checking schedule:', error)
        // Retry in 5 minutes on error
        scheduleTimer = setTimeout(checkAutoUpdateSchedule, 5 * 60 * 1000)
      }
    }
    
    const startPolling = () => {
      if (pollTimer) return // Already polling
      
      const pollInterval = 30000 // 30 seconds during polling window
      console.log('🔄 Auto Update: Starting polling every 30 seconds')
      
      const executePoll = async () => {
        if (autoUpdateRunningRef.current) {
          return // Skip if already running
        }
        
        try {
          setIsAutoUpdateRunning(true)
          autoUpdateRunningRef.current = true
          setAutoUpdateStatus({ status: 'updating', message: 'Updating database...' })
          
          // Start progress polling
          startProgressPolling()
          
          const response = await fetch('/api/data-manager/auto-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          })
          
          const result = await response.json()
          
          if (result.success) {
            if (result.skipped) {
              if (result.rateLimited) {
                // Rate limited - this is expected during polling
                return
              } else if (result.serverStartupCooldown) {
                console.log('❄️ Auto Update: Server cooldown detected, stopping polling')
                stopPolling()
                checkAutoUpdateSchedule() // Recheck schedule
                return
              } else if (result.nextUpdateIn) {
                const minutesUntilNext = Math.ceil(result.nextUpdateIn / (60 * 1000))
                if (minutesUntilNext > 5) {
                  console.log(`⏭️ Auto Update: Next update in ${minutesUntilNext} minutes, stopping polling`)
                  stopPolling()
                  checkAutoUpdateSchedule()
                  return
                }
              }
            } else {
              console.log('✅ Auto Update: Background update completed successfully')
              
              // Update status to show completion
              setAutoUpdateStatus({ 
                status: 'ready', 
                message: 'Update completed successfully' 
              })
              
              // Refresh data and stop polling
              fetchDataUpdaterInfo()
              stopPolling()
              stopProgressPolling()
              
              // Clear updating flags
              setIsAutoUpdateRunning(false)
              autoUpdateRunningRef.current = false
              
              // Schedule next check based on interval
              scheduleTimer = setTimeout(checkAutoUpdateSchedule, syncInterval * 60 * 1000)
            }
          } else if (!result.success) {
            console.error('❌ Auto Update: Background update failed:', result.message)
          }
        } catch (error) {
          console.error('❌ Auto Update: Failed to trigger background update:', error)
        } finally {
          setIsAutoUpdateRunning(false)
          autoUpdateRunningRef.current = false
        }
      }
      
      // Start polling immediately, then at intervals
      executePoll()
      pollTimer = setInterval(executePoll, pollInterval)
    }
    
    const stopPolling = () => {
      if (pollTimer) {
        clearInterval(pollTimer)
        pollTimer = null
        console.log('🛑 Auto Update: Stopped polling')
      }
    }

    const startProgressPolling = () => {
      if (progressTimer) return // Already polling progress
      
      console.log('📊 Auto Update: Starting progress polling')
      
      const checkProgress = async () => {
        try {
          const response = await fetch('/api/data-manager/auto-update-progress')
          const result = await response.json()
          
          if (result.success && result.progress) {
            setAutoUpdateProgress(result.progress)
            
            // If auto-update is running but we weren't aware, update our state
            if (result.progress.isRunning && !autoUpdateRunningRef.current) {
              setIsAutoUpdateRunning(true)
              autoUpdateRunningRef.current = true
              setAutoUpdateStatus({ status: 'updating', message: 'Updating database...' })
              console.log('🔄 Auto Update: Detected running auto-update, updating status')
            }
            
            // Stop progress polling when complete but keep progress visible
            if (result.progress.phase === 'complete') {
              stopProgressPolling()
              // Update status to reflect completion
              setIsAutoUpdateRunning(false)
              autoUpdateRunningRef.current = false
              setAutoUpdateStatus({ status: 'ready', message: 'Update completed successfully' })
              // Keep progress visible - don't auto-hide completed progress
            }
          }
        } catch (error) {
          console.error('❌ Auto Update: Error fetching progress:', error)
        }
      }
      
      // Check immediately, then every 2 seconds
      checkProgress()
      progressTimer = setInterval(checkProgress, 2000)
    }

    const stopProgressPolling = () => {
      if (progressTimer) {
        clearInterval(progressTimer)
        progressTimer = null
        console.log('🛑 Auto Update: Stopped progress polling')
      }
    }
    
    if (autoSyncEnabled && syncInterval > 0 && !isLoadingTimestamps) {
      checkAutoUpdateSchedule()
      
      // Also start light progress monitoring to catch auto-updates that start on their own schedule
      const lightProgressCheck = setInterval(async () => {
        if (!autoUpdateRunningRef.current) {
          try {
            const response = await fetch('/api/data-manager/auto-update-progress')
            const result = await response.json()
            
            if (result.success && result.progress && result.progress.isRunning && result.progress.phase !== 'idle') {
              console.log('🔄 Auto Update: Detected auto-update in progress, starting full progress polling')
              startProgressPolling()
            }
          } catch (error) {
            // Silent fail for background check
          }
        }
      }, 30000) // Check every 30 seconds
      
      return () => {
        if (scheduleTimer) clearTimeout(scheduleTimer)
        if (pollTimer) clearInterval(pollTimer)
        if (progressTimer) clearInterval(progressTimer)
        if (intervalUpdateTimeoutRef.current) clearTimeout(intervalUpdateTimeoutRef.current)
        clearInterval(lightProgressCheck)
        setIsAutoUpdateActive(false)
      }
    } else {
      setIsAutoUpdateActive(false)
      
      // Return basic cleanup if auto-sync is disabled
      return () => {
        if (intervalUpdateTimeoutRef.current) clearTimeout(intervalUpdateTimeoutRef.current)
        setIsAutoUpdateActive(false)
      }
    }
  }, [autoSyncEnabled, syncInterval, isLoadingTimestamps])

  // Fetch data updater info for last update tracking with intelligent scheduling
  const fetchDataUpdaterInfo = useCallback(async () => {
    try {
      setIsLoadingTimestamps(true)
      
      // Fetch both data updater info and schedule information
      const [updaterResponse, scheduleResponse] = await Promise.all([
        fetch('/api/data-manager/get-data-updater'),
        fetch('/api/data-manager/auto-update-schedule')
      ])
      
      if (updaterResponse.ok) {
        const result = await updaterResponse.json()
        if (result.success && result.data) {
          const lastManualUpdateDate = result.data.lastManualUpdate ? new Date(result.data.lastManualUpdate) : null
          const lastAutoUpdateDate = result.data.lastAutoUpdate ? new Date(result.data.lastAutoUpdate) : null
          
          let nextUpdateIn: number | undefined
          
          // Get schedule information
          if (scheduleResponse.ok) {
            const schedule = await scheduleResponse.json()
            if (schedule.success && schedule.nextUpdateIn !== null) {
              nextUpdateIn = schedule.nextUpdateIn
            }
          }
          
          const updateInfo = {
            lastManualUpdate: lastManualUpdateDate,
            lastAutoUpdate: lastAutoUpdateDate,
            lastUpdateStatus: result.data.lastUpdateStatus || 'idle',
            lastUpdateMessage: result.data.lastUpdateMessage,
            nextUpdateIn
          }
          
          setLastUpdateInfo(updateInfo)
          
          // Update auto sync settings from database
          if (result.data.autoUpdateEnabled !== undefined) {
            setAutoSyncEnabled(result.data.autoUpdateEnabled)
          }
          if (result.data.updateIntervalMinutes !== undefined) {
            setSyncInterval(result.data.updateIntervalMinutes)
          }
          if (result.data.selectedDataSource) {
            setSelectedDataSource(result.data.selectedDataSource)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data updater info:', error)
    } finally {
      setIsLoadingTimestamps(false)
    }
  }, [])

  // Helper function to format time ago - memoized for performance
  const formatTimeAgo = useCallback((date: Date | null) => {
    if (!date) return 'Never'
    
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    return `${days} day${days !== 1 ? 's' : ''} ago`
  }, [])

  // Memoized computed values to prevent unnecessary re-calculations
  const lastUpdateDisplays = useMemo(() => ({
    manual: formatTimeAgo(lastUpdateInfo?.lastManualUpdate || null),
    auto: formatTimeAgo(lastUpdateInfo?.lastAutoUpdate || null)
  }), [lastUpdateInfo?.lastManualUpdate, lastUpdateInfo?.lastAutoUpdate, formatTimeAgo])

  const nextUpdateDisplay = useMemo(() => {
    if (!lastUpdateInfo?.nextUpdateIn || lastUpdateInfo.nextUpdateIn <= 0) {
      return 'Ready for update'
    }
    
    const minutes = Math.ceil(lastUpdateInfo.nextUpdateIn / (60 * 1000))
    const hours = Math.ceil(lastUpdateInfo.nextUpdateIn / (60 * 60 * 1000))
    const days = Math.ceil(lastUpdateInfo.nextUpdateIn / (24 * 60 * 60 * 1000))
    
    if (minutes <= 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`
    if (hours <= 24) return `${hours} hour${hours !== 1 ? 's' : ''}`
    return `${days} day${days !== 1 ? 's' : ''}`
  }, [lastUpdateInfo?.nextUpdateIn])

  // Handle auto update toggle change with instant DB save
  const handleAutoUpdateToggle = async (enabled: boolean) => {
    try {
      setAutoSyncEnabled(enabled)
      
      const response = await fetch('/api/data-manager/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autoUpdateEnabled: enabled,
          updateIntervalMinutes: syncInterval,
          selectedDataSource
        })
      })
      
      if (!response.ok) {
        console.error('Failed to update auto update toggle')
        // Revert on failure
        setAutoSyncEnabled(!enabled)
      }
    } catch (error) {
      console.error('Error updating auto update toggle:', error)
      // Revert on failure
      setAutoSyncEnabled(!enabled)
    }
  }

  // Define interval configurations for reliability
  const intervalConfigs = [
    { minutes: 60, label: '1 Hour', shortLabel: '1h' },
    { minutes: 360, label: '6 Hours', shortLabel: '6h' },
    { minutes: 720, label: '12 Hours', shortLabel: '12h' },
    { minutes: 1440, label: '24 Hours', shortLabel: '24h' },
    { minutes: 2880, label: '1 Day', shortLabel: '1d' },
    { minutes: 10080, label: '1 Week', shortLabel: '1w' },
    { minutes: 43200, label: '1 Month', shortLabel: '1m' }
  ]

  // Get current interval config
  const getCurrentIntervalConfig = () => {
    return intervalConfigs.find(config => config.minutes === syncInterval) || intervalConfigs[0]
  }

  // Get slider index from interval minutes
  const getSliderIndexFromInterval = (intervalMinutes: number) => {
    const index = intervalConfigs.findIndex(config => config.minutes === intervalMinutes)
    return index >= 0 ? index : 0
  }

  // Simple immediate interval change - no debounce to avoid issues
  const handleIntervalChange = async (newInterval: number) => {
    // Prevent multiple concurrent updates
    if (isUpdatingInterval) {
      console.log('⏸️ Update already in progress, skipping')
      return
    }

    console.log(`🔄 Changing interval to: ${newInterval}min`)
    
    // Clear any pending timeout
    if (intervalUpdateTimeoutRef.current) {
      clearTimeout(intervalUpdateTimeoutRef.current)
      intervalUpdateTimeoutRef.current = null
    }
    
    setIsUpdatingInterval(true)
    
    // Optimistically update UI
    const previousInterval = syncInterval
    setSyncInterval(newInterval)
    
    // Show loading toast
    const newConfig = intervalConfigs.find(config => config.minutes === newInterval)
    toast.loading(`Saving ${newConfig?.label}...`, { 
      id: 'interval-update'
    })
    
    try {
      const requestBody = {
        autoUpdateEnabled: autoSyncEnabled,
        updateIntervalMinutes: newInterval,
        selectedDataSource
      }
      console.log('📤 Sending request:', requestBody)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch('/api/data-manager/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      console.log(`📡 Response: ${response.status} ${response.statusText}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('📊 API Result:', result)
      
      if (!result.success) {
        throw new Error(result.error || 'Save failed')
      }
      
      // Success
      toast.success(`✅ Interval set to ${newConfig?.label}`, { 
        id: 'interval-update',
        duration: 2000
      })
      
      console.log(`✅ Successfully saved: ${newConfig?.label}`)
      
    } catch (error) {
      console.error('❌ Save failed:', error)
      
      // Revert UI on error
      setSyncInterval(previousInterval)
      
      let errorMessage = 'Unknown error'
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out after 10 seconds'
        } else {
          errorMessage = error.message
        }
      }
      
      toast.error(`❌ Failed to save: ${errorMessage}`, { 
        id: 'interval-update',
        duration: 4000 
      })
      
    } finally {
      setIsUpdatingInterval(false)
      console.log('🏁 Update process completed')
    }
  }



  // Test function for manual auto update trigger (for testing purposes)
  const triggerAutoUpdateTest = async () => {
    console.log('🗋 Testing: Manual trigger of auto update process')
    try {
      const response = await fetch('/api/data-manager/auto-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Testing: Manual auto update completed successfully')
        fetchDataUpdaterInfo()
      } else {
        console.error('❌ Testing: Manual auto update failed:', result.message)
      }
    } catch (error) {
      console.error('❌ Testing: Failed to trigger manual auto update:', error)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const fileArray = Array.from(files)
      
      // Separate JSON and non-JSON files
      const jsonFiles: File[] = []
      const rejectedFileNames: string[] = []
      
      fileArray.forEach(file => {
        const isJsonFile = file.name.toLowerCase().endsWith('.json') || file.type === 'application/json'
        if (isJsonFile) {
          jsonFiles.push(file)
        } else {
          rejectedFileNames.push(file.name)
        }
      })
      
      // Show modal if any files were rejected
      if (rejectedFileNames.length > 0) {
        setRejectedFiles(rejectedFileNames)
        setShowFileTypeModal(true)
        
        // If there are also valid JSON files, add them
        if (jsonFiles.length > 0) {
          setSelectedFiles(prev => [...prev, ...jsonFiles])
          // Reset import progress when new files are selected
          setImportProgress(0)
          setUploadStatus('idle')
          setUploadMessage('')
        }
        return
      }
      
      // All files are JSON - proceed normally
      if (jsonFiles.length > 0) {
        setSelectedFiles(prev => [...prev, ...jsonFiles])
        // Reset import progress when new files are selected
        setImportProgress(0)
        setUploadStatus('idle')
        setUploadMessage('')
        
        toast.success(`${jsonFiles.length} JSON file${jsonFiles.length > 1 ? 's' : ''} selected successfully`)
      }
    }
  }

  const handleImport = async () => {
    if (selectedFiles.length === 0) return
    
    // Double-check that all files are JSON before processing
    const nonJsonFiles = selectedFiles.filter(file => 
      !file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json'
    )
    
    if (nonJsonFiles.length > 0) {
      toast.error(`Cannot import non-JSON files: ${nonJsonFiles.map(f => f.name).join(', ')}`)
      return
    }

    // Immediate visual feedback - no delay
    setUploadStatus('uploading')
    setImportProgress(5) // Start immediately at 5%
    setUploadMessage('')

    try {
      // Create FormData to send files
      const formData = new FormData()
      selectedFiles.forEach((file, index) => {
        formData.append(`files`, file)
      })
      formData.append('dataSource', selectedDataSource)

      // Faster, more responsive progress simulation
      setImportProgress(15) // Immediate jump to show activity
      
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 85) {
            clearInterval(progressInterval)
            return 85 // Stop at 85%, complete at 100% after API response
          }
          return prev + Math.random() * 15 + 5 // Variable increments for realistic feel
        })
      }, 150) // Faster updates

      // Make actual API call to upload files
      const response = await fetch('/api/data-manager/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (response.ok) {
        const result = await response.json()
        
        // Complete progress with premium animation
        setImportProgress(100)
        setUploadStatus('success')
        setUploadMessage(`Successfully uploaded ${selectedFiles.length} file(s) to ${selectedDataSource === 'local' ? 'Local Data-Db Folder' : 'Vercel Blob Storage'}`)
        
        // Immediately refresh file list to show new files (no delay)
        fetchFilesForDataSource(selectedDataSource)
        
        // Premium success feedback with toast
        toast.success(`🎉 Successfully uploaded ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''} to ${selectedDataSource === 'vercel' ? 'Vercel Blob' : 'Local Storage'}!`)
        
        // Clear selected files and reset UI after success animation
        setTimeout(() => {
          setSelectedFiles([])
          setImportProgress(0)
          setUploadStatus('idle')
          setUploadMessage('')
        }, 2500) // Slightly shorter delay
      } else {
        const error = await response.json()
        setUploadStatus('error')
        setUploadMessage(error.message || 'Upload failed. Please try again.')
        setImportProgress(0)
        
        // Premium error feedback
        toast.error(`Upload failed: ${error.message || 'Please try again'}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('error')
      setUploadMessage('Upload failed. Please check your connection and try again.')
      setImportProgress(0)
      
      // Premium error feedback
      toast.error('Upload failed. Please check your connection and try again.')
    }
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
                  <FiDatabase className='w-5 h-5 text-white' />
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900 dark:text-white tracking-tight'>
                    Data Manager
                  </h1>
                  <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>
                    Advanced data import and synchronization tools
                  </p>
                  <div className='mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg'>
                    <p className='text-amber-800 dark:text-amber-200 text-xs font-medium flex items-center gap-2'>
                      <FiInfo className='w-3 h-3' />
                      Data Importer only processes JSON files for secure and reliable imports
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* Premium Data Source Selection Section */}
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
                <FiDatabase className='w-6 h-6 text-white' />
              </div>
              <div>
                <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                  Data Source Configuration
                </h2>
                <p className='text-gray-600 dark:text-gray-400'>
                  Select your preferred data source location
                </p>
              </div>
            </div>

                         <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
               {/* Local Data-Db Folder Option */}
               <motion.div
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ duration: 0.5, delay: 0.3 }}
                 className='relative group/card'
               >
                 <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-xl blur-xl group-hover/card:blur-2xl transition-all duration-500'></div>
                                   <div 
                    onClick={() => handleDataSourceChange('local')}
                    className={`relative p-6 bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-800/90 dark:to-gray-800/70 backdrop-blur-xl rounded-xl border-2 transition-all duration-300 cursor-pointer group-hover/card:shadow-xl transform hover:scale-105 ${
                      selectedDataSource === 'local' 
                        ? 'border-[#00437f] dark:border-[#00437f] shadow-lg' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-[#00437f] dark:hover:border-[#00437f]'
                    }`}
                  >
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center gap-3'>
                        <div className={`p-2 rounded-lg shadow-md transition-all duration-300 ${
                          selectedDataSource === 'local' 
                            ? 'bg-gradient-to-r from-[#00437f] to-[#003366]' 
                            : 'bg-gradient-to-r from-gray-400 to-gray-500'
                        }`}>
                          <FiDatabase className='w-5 h-5 text-white' />
                        </div>
                        <div>
                          <h3 className='font-semibold text-gray-900 dark:text-white text-lg'>
                            Local Data-Db Folder
                          </h3>
                          <p className='text-sm text-gray-600 dark:text-gray-400'>
                            Project root directory
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDataSourceChange('local')
                          }}
                          disabled={isUpdatingDataSource || isLoadingConfig}
                          className={`px-4 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                            selectedDataSource === 'local'
                              ? 'bg-[#00437f] text-white hover:bg-[#003366] shadow-md'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          } ${isUpdatingDataSource ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isUpdatingDataSource ? (
                            <div className="flex items-center gap-1">
                              <div className="animate-spin rounded-full h-2 w-2 border-b border-current"></div>
                              <span>...</span>
                            </div>
                          ) : (
                            selectedDataSource === 'local' ? 'ON' : 'OFF'
                          )}
                        </Button>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full transition-all duration-200 ${
                          selectedDataSource === 'local'
                            ? 'text-[#00437f] bg-[#00437f]/10 dark:bg-[#00437f]/20'
                            : 'text-gray-500 bg-gray-100 dark:bg-gray-700'
                        }`}>
                          Default
                        </span>
                      </div>
                    </div>
                    
                    <div className='space-y-3'>
                      <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                        <FiCheckCircle className={`w-4 h-4 transition-all duration-200 ${
                          selectedDataSource === 'local' ? 'text-[#00437f]' : 'text-gray-400'
                        }`} />
                        <span>Fast local access</span>
                      </div>
                      <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                        <FiCheckCircle className={`w-4 h-4 transition-all duration-200 ${
                          selectedDataSource === 'local' ? 'text-[#00437f]' : 'text-gray-400'
                        }`} />
                        <span>Offline capability</span>
                      </div>
                      <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                        <FiCheckCircle className={`w-4 h-4 transition-all duration-200 ${
                          selectedDataSource === 'local' ? 'text-[#00437f]' : 'text-gray-400'
                        }`} />
                        <span>Direct file system access</span>
                      </div>
                    </div>

                    <div className={`mt-4 p-3 rounded-lg border transition-all duration-200 ${
                      selectedDataSource === 'local'
                        ? 'bg-[#00437f]/10 dark:bg-[#00437f]/20 border-[#00437f]/20 dark:border-[#00437f]/30'
                        : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}>
                      <div className={`flex items-center gap-2 text-xs font-medium ${
                        selectedDataSource === 'local' ? 'text-[#00437f]' : 'text-gray-500'
                      }`}>
                        <FiSettings className='w-3 h-3' />
                        <span>Path: /data-db/</span>
                      </div>
                    </div>
                  </div>
               </motion.div>

               {/* Vercel Blob Data-Db Folder Option */}
               <motion.div
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ duration: 0.5, delay: 0.4 }}
                 className='relative group/card'
               >
                 <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-xl blur-xl group-hover/card:blur-2xl transition-all duration-500'></div>
                                   <div 
                    onClick={() => handleDataSourceChange('vercel')}
                    className={`relative p-6 bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-800/90 dark:to-gray-800/70 backdrop-blur-xl rounded-xl border-2 transition-all duration-300 cursor-pointer group-hover/card:shadow-xl transform hover:scale-105 ${
                      selectedDataSource === 'vercel' 
                        ? 'border-[#00437f] dark:border-[#00437f] shadow-lg' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-[#00437f] dark:hover:border-[#00437f]'
                    }`}
                  >
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center gap-3'>
                        <div className={`p-2 rounded-lg shadow-md transition-all duration-300 ${
                          selectedDataSource === 'vercel' 
                            ? 'bg-gradient-to-r from-[#00437f] to-[#003366]' 
                            : 'bg-gradient-to-r from-gray-400 to-gray-500'
                        }`}>
                          <FiDatabase className='w-5 h-5 text-white' />
                        </div>
                        <div>
                          <h3 className='font-semibold text-gray-900 dark:text-white text-lg'>
                            Vercel Blob Storage
                          </h3>
                          <p className='text-sm text-gray-600 dark:text-gray-400'>
                            Cloud-based data storage
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDataSourceChange('vercel')
                          }}
                          disabled={isUpdatingDataSource || isLoadingConfig}
                          className={`px-4 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                            selectedDataSource === 'vercel'
                              ? 'bg-[#00437f] text-white hover:bg-[#003366] shadow-md'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          } ${isUpdatingDataSource ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isUpdatingDataSource ? (
                            <div className="flex items-center gap-1">
                              <div className="animate-spin rounded-full h-2 w-2 border-b border-current"></div>
                              <span>...</span>
                            </div>
                          ) : (
                            selectedDataSource === 'vercel' ? 'ON' : 'OFF'
                          )}
                        </Button>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full transition-all duration-200 ${
                          selectedDataSource === 'vercel'
                            ? 'text-[#00437f] bg-[#00437f]/10 dark:bg-[#00437f]/20'
                            : 'text-gray-500 bg-gray-100 dark:bg-gray-700'
                        }`}>
                          Cloud
                        </span>
                      </div>
                    </div>
                    
                    <div className='space-y-3'>
                      <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                        <FiCheckCircle className={`w-4 h-4 transition-all duration-200 ${
                          selectedDataSource === 'vercel' ? 'text-[#00437f]' : 'text-gray-400'
                        }`} />
                        <span>Global accessibility</span>
                      </div>
                      <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                        <FiCheckCircle className={`w-4 h-4 transition-all duration-200 ${
                          selectedDataSource === 'vercel' ? 'text-[#00437f]' : 'text-gray-400'
                        }`} />
                        <span>Automatic backups</span>
                      </div>
                      <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                        <FiCheckCircle className={`w-4 h-4 transition-all duration-200 ${
                          selectedDataSource === 'vercel' ? 'text-[#00437f]' : 'text-gray-400'
                        }`} />
                        <span>Scalable storage</span>
                      </div>
                    </div>

                    <div className={`mt-4 p-3 rounded-lg border transition-all duration-200 ${
                      selectedDataSource === 'vercel'
                        ? 'bg-[#00437f]/10 dark:bg-[#00437f]/20 border-[#00437f]/20 dark:border-[#00437f]/30'
                        : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}>
                      <div className={`flex items-center gap-2 text-xs font-medium ${
                        selectedDataSource === 'vercel' ? 'text-[#00437f]' : 'text-gray-500'
                      }`}>
                        <FiSettings className='w-3 h-3' />
                        <span>Path: vercel-blob://data-db/</span>
                      </div>
                    </div>
                  </div>
               </motion.div>
             </div>

                                       {/* Premium Selection Indicator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className='mt-6 p-4 bg-gradient-to-r from-[#00437f]/10 to-[#003366]/10 dark:from-[#00437f]/20 dark:to-[#003366]/20 border border-[#00437f]/20 dark:border-[#00437f]/30 rounded-lg'
              >
                <div className='flex items-center gap-3'>
                  <div className='w-3 h-3 bg-[#00437f] rounded-full animate-pulse'></div>
                  <div>
                    <p className='text-sm font-medium text-[#00437f] dark:text-[#00437f]'>
                      Currently Selected: {selectedDataSource === 'local' ? 'Local Data-Db Folder' : 'Vercel Blob Storage'}
                    </p>
                    <p className='text-xs text-gray-600 dark:text-gray-400'>
                      {selectedDataSource === 'local' 
                        ? 'Data will be imported from your project\'s root directory'
                        : 'Data will be imported from Vercel Blob storage'
                      }
                    </p>
                  </div>
                </div>
              </motion.div>
          </Card>
        </motion.div>

                                   <div className='space-y-8'>
           
                       {/* Premium Data Importer Section */}
             <div className='relative group'>
               <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
               <Card className='relative p-8 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl transition-all duration-300 group-hover:shadow-2xl'>
               <div className='flex items-center gap-3 mb-6'>
                 <div className='p-3 bg-gradient-to-r from-[#00437f] to-[#003366] rounded-xl shadow-md'>
                   <FiUpload className='w-6 h-6 text-white' />
                 </div>
                                   <div>
                    <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                      Smart Data Importer
                    </h2>
                    <p className='text-gray-600 dark:text-gray-400'>
                      Import files to {selectedDataSource === 'local' ? 'Local Data-Db Folder' : 'Vercel Blob Storage'}
                    </p>
                  </div>
               </div>

                               {/* Premium Data Source Status */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className='mb-6 p-4 bg-gradient-to-r from-[#00437f]/10 to-blue-50 dark:from-[#00437f]/20 dark:to-blue-900/20 border border-[#00437f]/20 dark:border-[#00437f]/30 rounded-xl'
                >
                  <div className='flex items-center gap-3 mb-3'>
                    <div className='w-3 h-3 bg-[#00437f] rounded-full animate-pulse'></div>
                    <span className='text-sm font-medium text-[#00437f] dark:text-[#00437f]'>
                      Connection Status
                    </span>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                                             <span className='text-sm text-gray-600 dark:text-gray-400'>
                         {selectedDataSource === 'local' ? 'Local Data-Db Folder' : 'Vercel Blob Storage'}
                       </span>
                      <span className='text-xs px-2 py-1 bg-[#00437f]/10 dark:bg-[#00437f]/20 text-[#00437f] dark:text-[#00437f] rounded-full font-medium'>
                        Connected
                      </span>
                    </div>
                  </div>
                </motion.div>

                                 {/* Premium Import Options */}
                 <div className='mb-6 space-y-4'>
                  
                   {/* Bold Highlight Message */}
                   <motion.div
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.4 }}
                     className='p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-600 rounded-lg'
                   >
                     <div className='flex items-center gap-3'>
                       <div className='p-2 bg-yellow-500 rounded-lg'>
                         <FiInfo className='w-4 h-4 text-white' />
                       </div>
                       <div>
                         <p className='text-sm font-bold text-yellow-800 dark:text-yellow-200'>
                           💡 IMPORTANT: Import is OPTIONAL
                         </p>
                         <p className='text-xs text-yellow-700 dark:text-yellow-300'>
                           Only use when you want to update data with new files
                         </p>
                       </div>
                     </div>
                   </motion.div>

                   

                   
                 </div>

               







               {/* Premium Import Progress */}
               {importProgress > 0 && (
                 <motion.div
                   initial={{ opacity: 0, y: -10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className='mb-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-[#00437f]/10 dark:border-[#00437f]/20'
                 >
                   <div className='flex items-center justify-between mb-3'>
                     <div className='flex items-center space-x-2'>
                       <motion.div
                         animate={{ 
                           scale: [1, 1.2, 1],
                           opacity: [0.5, 1, 0.5]
                         }}
                         transition={{ duration: 1.5, repeat: Infinity }}
                         className='w-2 h-2 bg-[#00437f] rounded-full'
                       />
                       <span className='text-sm font-medium text-[#00437f] dark:text-[#00437f]'>
                         Uploading to {selectedDataSource === 'local' ? 'Local Data-Db Folder' : 'Vercel Blob Storage'}...
                       </span>
                     </div>
                     <motion.span 
                       key={importProgress}
                       initial={{ scale: 1.2, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       className='text-sm font-semibold text-[#00437f] dark:text-[#00437f] bg-[#00437f]/10 px-2 py-1 rounded-md'
                     >
                       {importProgress}%
                     </motion.span>
                   </div>
                   <div className='relative w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden'>
                     <motion.div
                       className='absolute inset-0 bg-gradient-to-r from-[#00437f]/20 via-[#00437f]/30 to-[#00437f]/20 rounded-full'
                       animate={{ x: ['-100%', '100%'] }}
                       transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                     />
                     <motion.div
                       className='relative bg-gradient-to-r from-[#00437f] via-[#0066cc] to-[#003366] h-3 rounded-full shadow-lg'
                       initial={{ width: 0 }}
                       animate={{ width: `${importProgress}%` }}
                       transition={{ duration: 0.5, ease: "easeOut" }}
                     >
                       <motion.div
                         className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full'
                         animate={{ x: ['-100%', '100%'] }}
                         transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                       />
                     </motion.div>
                   </div>
                   <div className='mt-2 text-xs text-slate-500 dark:text-slate-400 text-center'>
                     Processing {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
                   </div>
                 </motion.div>
               )}

               {/* Premium File Management Section */}
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

                   {/* File Selection Area */}
                   <div className='mb-6'>
                     <motion.div
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ duration: 0.4, delay: 0.1 }}
                       className='relative'
                     >
                       {/* Hidden File Input */}
                       <input
                         type="file"
                         multiple
                         accept=".json"
                         onChange={handleFileUpload}
                         className="hidden"
                         id="file-upload-input"
                       />
                       
                       {/* Beautiful File Selection Button */}
                       <label
                         htmlFor="file-upload-input"
                         className='block w-full p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-900/20 hover:from-slate-100 hover:to-blue-100 dark:hover:from-slate-700/50 dark:hover:to-blue-800/30 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] group'
                       >
                         <div className='text-center'>
                           <div className='w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110'>
                             <FiPlus className='w-8 h-8 text-white' />
                           </div>
                           <h4 className='text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2'>
                             Select Files to Upload
                           </h4>
                           <p className='text-sm text-slate-500 dark:text-slate-400 mb-3'>
                             Click to browse or drag and drop your JSON files
                           </p>
                           <div className='inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm rounded-lg border border-slate-200/60 dark:border-slate-600/40'>
                             <FiFile className='w-4 h-4 text-slate-500' />
                             <span className='text-sm font-medium text-slate-600 dark:text-slate-400'>
                               Supported: .json only
                             </span>
                           </div>
                         </div>
                       </label>
                     </motion.div>

                     {/* Selected Files Display */}
                     {selectedFiles.length > 0 && (
                       <motion.div
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.4, delay: 0.2 }}
                         className='mt-4'
                       >
                         <div className='bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-600/40 rounded-xl p-4'>
                           <div className='flex items-center justify-between mb-3'>
                             <h5 className='font-semibold text-slate-700 dark:text-slate-300'>
                               Selected Files ({selectedFiles.length})
                             </h5>
                             <Button
                               onClick={() => setSelectedFiles([])}
                               variant="outline"
                               size="sm"
                               className='text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-700'
                             >
                               Clear All
                             </Button>
                           </div>
                           <div className='space-y-2 max-h-32 overflow-y-auto'>
                             {selectedFiles.map((file, index) => (
                               <motion.div
                                 key={index}
                                 initial={{ opacity: 0, x: -20 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 transition={{ delay: index * 0.1, duration: 0.3 }}
                                 className='flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg'
                               >
                                 <div className='flex items-center gap-2'>
                                   <FiFile className='w-4 h-4 text-slate-500' />
                                   <span className='text-sm text-slate-600 dark:text-slate-400 font-medium'>
                                     {file.name}
                                   </span>
                                   <span className='text-xs text-slate-400 dark:text-slate-500'>
                                     ({(file.size / 1024).toFixed(1)} KB)
                                   </span>
                                 </div>
                                 <Button
                                   onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}
                                   variant="ghost"
                                   size="sm"
                                   className='text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 h-8 w-8'
                                 >
                                   <FiX className='w-4 h-4' />
                                 </Button>
                               </motion.div>
                             ))}
                           </div>
                         </div>
                       </motion.div>
                     )}
                   </div>

                   {/* Premium Upload Button */}
                   <div className='flex justify-center mb-6'>
                     <Button
                       onClick={handleImport}
                       disabled={selectedFiles.length === 0 || importProgress > 0 || uploadStatus === 'uploading'}
                       className={`relative overflow-hidden bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002244] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl border-0 ${
                         uploadStatus === 'uploading' ? 'pointer-events-none' : ''
                       }`}
                     >
                       <AnimatePresence mode="wait">
                         {uploadStatus === 'uploading' ? (
                           <motion.div
                             key="uploading"
                             initial={{ opacity: 0, scale: 0.8 }}
                             animate={{ opacity: 1, scale: 1 }}
                             exit={{ opacity: 0, scale: 0.8 }}
                             className='flex items-center'
                           >
                             <motion.div
                               animate={{ rotate: 360 }}
                               transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                               className='w-5 h-5 mr-2'
                             >
                               <FiRefreshCw className='w-5 h-5' />
                             </motion.div>
                             <span>Uploading...</span>
                             <motion.div
                               className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent'
                               animate={{ x: ['-100%', '100%'] }}
                               transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                             />
                           </motion.div>
                         ) : uploadStatus === 'success' ? (
                           <motion.div
                             key="success"
                             initial={{ opacity: 0, scale: 0.8 }}
                             animate={{ opacity: 1, scale: 1 }}
                             exit={{ opacity: 0, scale: 0.8 }}
                             className='flex items-center'
                           >
                             <motion.div
                               initial={{ scale: 0 }}
                               animate={{ scale: 1 }}
                               transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                             >
                               <FiCheckCircle className='w-5 h-5 mr-2 text-green-300' />
                             </motion.div>
                             <span>Uploaded!</span>
                           </motion.div>
                         ) : (
                           <motion.div
                             key="idle"
                             initial={{ opacity: 0, scale: 0.8 }}
                             animate={{ opacity: 1, scale: 1 }}
                             exit={{ opacity: 0, scale: 0.8 }}
                             className='flex items-center'
                           >
                             <FiPlus className='w-5 h-5 mr-2' />
                             <span>Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}</span>
                           </motion.div>
                         )}
                       </AnimatePresence>
                     </Button>
                   </div>

                   {/* File List Toggle */}
                   <motion.div
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.4, delay: 0.3 }}
                     className='bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-600/40 rounded-xl overflow-hidden'
                   >
                     {/* Toggle Header */}
                     <div className='flex items-center justify-between w-full p-4'>
                       <motion.div 
                         onClick={() => setIsFileListExpanded(!isFileListExpanded)}
                         className='flex items-center justify-between flex-1 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200 cursor-pointer p-2 rounded-lg'
                         whileHover={{ scale: 1.01 }}
                         whileTap={{ scale: 0.99 }}
                       >
                         <div className='flex items-center gap-3'>
                           <div className={`p-2 rounded-lg ${
                             selectedDataSource === 'vercel' 
                               ? 'bg-gradient-to-r from-[#00437f] to-[#003366]' 
                               : 'bg-gradient-to-r from-slate-500 to-slate-600'
                           }`}>
                             {selectedDataSource === 'vercel' ? (
                               <FiDatabase className='w-4 h-4 text-white' />
                             ) : (
                               <FiFile className='w-4 h-4 text-white' />
                             )}
                           </div>
                           <span className='font-semibold text-slate-700 dark:text-slate-300'>
                             {selectedDataSource === 'vercel' ? 'Vercel Blob Storage Files' : 'Local Data-Db Folder Files'}
                           </span>
                           <span className='px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-full'>
                             {fileList.length} files
                           </span>
                         </div>
                         
                         <motion.div
                           className='p-3 bg-slate-100 dark:bg-slate-700 rounded-lg'
                           animate={{ rotate: isFileListExpanded ? 180 : 0 }}
                           transition={{ duration: 0.3, ease: "easeInOut" }}
                         >
                           <FiChevronDown className='w-7 h-7 text-slate-600 dark:text-slate-400' />
                         </motion.div>
                       </motion.div>

                       {/* Delete All Button - Only show when expanded and files exist */}
                       {isFileListExpanded && fileList.length > 0 && (
                         <Button
                           onClick={(e) => {
                             e.stopPropagation()
                             deleteAllFiles()
                           }}
                           disabled={isDeletingAll}
                           variant="outline"
                           size="sm"
                           className={`ml-3 transition-all duration-200 ${
                             isDeletingAll
                               ? 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-600 cursor-not-allowed'
                               : 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-700'
                           }`}
                         >
                           {isDeletingAll ? (
                             <motion.div
                               animate={{ rotate: 360 }}
                               transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                               className="flex items-center"
                             >
                               <FiRefreshCw className='w-3 h-3 mr-1' />
                               <span>Deleting...</span>
                             </motion.div>
                           ) : (
                             <>
                               <FiTrash2 className='w-3 h-3 mr-1' />
                               Delete All
                             </>
                           )}
                         </Button>
                       )}
                     </div>

                     {/* Toggle Content */}
                     <AnimatePresence>
                       {isFileListExpanded && (
                         <motion.div
                           initial={{ height: 0, opacity: 0 }}
                           animate={{ height: "auto", opacity: 1 }}
                           exit={{ height: 0, opacity: 0 }}
                           transition={{ duration: 0.4, ease: "easeInOut" }}
                           className='border-t border-slate-200/60 dark:border-slate-600/40'
                         >
                           <div className='p-4'>
                             {isLoadingFiles ? (
                               <motion.div
                                 initial={{ opacity: 0, y: 20 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 className='flex flex-col items-center justify-center py-12'
                               >
                                 {/* Premium Loading Animation */}
                                 <div className='relative mb-4'>
                                   <motion.div
                                     animate={{ rotate: 360 }}
                                     transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                     className='w-12 h-12 border-4 border-[#00437f]/20 border-t-[#00437f] rounded-full'
                                   />
                                   <motion.div
                                     animate={{ rotate: -360 }}
                                     transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                     className='absolute inset-2 w-8 h-8 border-2 border-slate-300/30 border-b-slate-500 rounded-full'
                                   />
                                 </div>
                                 <div className='text-center'>
                                   <motion.h3
                                     animate={{ opacity: [1, 0.5, 1] }}
                                     transition={{ duration: 1.5, repeat: Infinity }}
                                     className='text-lg font-semibold text-[#00437f] dark:text-[#00437f] mb-2'
                                   >
                                     Loading Files
                                   </motion.h3>
                                   <p className='text-sm text-slate-500 dark:text-slate-400'>
                                     Fetching files from {selectedDataSource === 'vercel' ? 'Vercel Blob Storage' : 'Local Data-Db Folder'}
                                   </p>
                                 </div>
                               </motion.div>
                             ) : fileList.length === 0 ? (
                               <motion.div
                                 initial={{ opacity: 0, scale: 0.95 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 className='text-center py-8'
                               >
                                 <div className='w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center'>
                                   <FiFolder className='w-8 h-8 text-slate-400' />
                                 </div>
                                 <p className='text-slate-500 dark:text-slate-400 font-medium'>No files found</p>
                                 <p className='text-sm text-slate-400 dark:text-slate-500'>Upload some files to get started</p>
                               </motion.div>
                             ) : (
                               <motion.div
                                 initial={{ opacity: 0 }}
                                 animate={{ opacity: 1 }}
                                 className='space-y-3'
                               >
                                 {fileList.map((file, index) => (
                                   <motion.div
                                     key={file.name}
                                     initial={{ opacity: 0, x: -20 }}
                                     animate={{ 
                                       opacity: isDeletingFile === file.name ? 0.5 : 1, 
                                       x: 0,
                                       scale: isDeletingFile === file.name ? 0.95 : 1
                                     }}
                                     exit={{ opacity: 0, x: 20, scale: 0.9 }}
                                     transition={{ delay: index * 0.1, duration: 0.3, type: "spring", stiffness: 100 }}
                                     whileHover={{ scale: isDeletingFile === file.name ? 0.95 : 1.02, x: isDeletingFile === file.name ? 0 : 5 }}
                                     className={`p-4 backdrop-blur-sm border rounded-xl transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-lg ${
                                       isDeletingFile === file.name
                                         ? 'bg-red-50/70 dark:bg-red-900/20 border-red-200/60 dark:border-red-700/40'
                                         : 'bg-white/70 dark:bg-slate-800/70 border-slate-200/60 dark:border-slate-600/40 hover:bg-white dark:hover:bg-slate-800'
                                     }`}
                                   >
                                     <div className='flex items-center gap-4'>
                                       {/* File Icon with Data Source Indicator */}
                                       <div className='relative'>
                                         <div className={`p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-200 ${
                                           (file as any).dataSource === 'vercel' 
                                             ? 'bg-gradient-to-r from-[#00437f] to-[#003366] group-hover:from-[#003366] group-hover:to-[#002855]' 
                                             : 'bg-gradient-to-r from-[#00437f] to-[#003366] group-hover:from-[#003366] group-hover:to-[#002855]'
                                         }`}>
                                           <FiFile className='w-5 h-5 text-white' />
                                         </div>
                                         {/* Data Source Badge */}
                                         <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 shadow-md flex items-center justify-center ${
                                           (file as any).dataSource === 'vercel' ? 'bg-[#00437f]' : 'bg-[#00437f]'
                                         }`}>
                                           {(file as any).dataSource === 'vercel' ? (
                                             <FiDatabase className='w-2 h-2 text-white' />
                                           ) : (
                                             <FiFolder className='w-2 h-2 text-white' />
                                           )}
                                         </div>
                                       </div>
                                       
                                       {/* File Info */}
                                       <div className='flex-1 min-w-0'>
                                         <div className='flex items-center gap-2 mb-1'>
                                           <p className='font-semibold text-slate-800 dark:text-slate-200 text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200'>
                                             {file.name}
                                           </p>
                                           {/* Premium Data Source Badge */}
                                           <span className={`px-2 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                                             (file as any).dataSource === 'vercel'
                                               ? 'bg-[#00437f]/10 text-[#00437f] border border-[#00437f]/20 dark:bg-[#00437f]/20 dark:text-[#00437f] dark:border-[#00437f]/30'
                                               : 'bg-[#00437f]/10 text-[#00437f] border border-[#00437f]/20 dark:bg-[#00437f]/20 dark:text-[#00437f] dark:border-[#00437f]/30'
                                           }`}>
                                             {(file as any).dataSource === 'vercel' ? 'Vercel Blob' : 'Local Storage'}
                                           </span>
                                         </div>
                                         <div className='flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400'>
                                           <div className='flex items-center gap-1'>
                                             <FiBarChart className='w-3 h-3' />
                                             <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                           </div>
                                           {file.lastModified && (
                                             <div className='flex items-center gap-1'>
                                               <FiClock className='w-3 h-3' />
                                               <span>{new Date(file.lastModified).toLocaleDateString()}</span>
                                             </div>
                                           )}
                                         </div>
                                       </div>
                                       
                                       {/* Action Buttons */}
                                       <div className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200'>
                                         {/* View/Download Button for Vercel files */}
                                         {(file as any).dataSource === 'vercel' && (file as any).url && (
                                           <button
                                             onClick={(e) => {
                                               e.stopPropagation()
                                               window.open((file as any).downloadUrl || (file as any).url, '_blank')
                                             }}
                                             className='p-2 text-slate-500 hover:text-[#00437f] hover:bg-[#00437f]/10 rounded-lg transition-all duration-200'
                                           >
                                             <FiDatabase className='w-4 h-4' />
                                           </button>
                                         )}
                                         {/* Delete Button with Premium Loading */}
                                         <button
                                           onClick={(e) => {
                                             e.stopPropagation()
                                             removeFile(file.name)
                                           }}
                                           disabled={isDeletingFile === file.name}
                                           className={`p-2 rounded-lg transition-all duration-200 ${
                                             isDeletingFile === file.name
                                               ? 'text-red-500 bg-red-50 dark:bg-red-500/20 cursor-not-allowed'
                                               : 'text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20'
                                           }`}
                                         >
                                           {isDeletingFile === file.name ? (
                                             <motion.div
                                               animate={{ rotate: 360 }}
                                               transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                             >
                                               <FiRefreshCw className='w-4 h-4' />
                                             </motion.div>
                                           ) : (
                                             <FiTrash2 className='w-4 h-4' />
                                           )}
                                         </button>
                                       </div>
                                     </div>
                                   </motion.div>
                                 ))}
                               </motion.div>
                             )}
                           </div>
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </motion.div>
                 </motion.div>
               </div>

             </Card>
           </div>

                                                                                       {/* Premium Update DB Data Section */}
             <div className='relative group'>
               <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
               <Card className='relative p-8 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl transition-all duration-300 group-hover:shadow-2xl'>
                                 <div className='flex items-center gap-3 mb-6'>
                    <div className='p-3 bg-gradient-to-r from-[#00437f] to-[#003366] rounded-xl shadow-md'>
                      <FiDatabase className='w-6 h-6 text-white' />
                    </div>
                    <div>
                      <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                        Update DB Data
                      </h2>
                      <p className='text-gray-600 dark:text-gray-400'>
                        Update database records with uploaded files
                      </p>
                    </div>
                  </div>

                                                                                                                       {/* Premium Update Controls */}
                 <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch'>
                   {/* Update Data Now Column */}
                   <div className='space-y-4 flex flex-col h-full'>
                                           <div className='flex items-center gap-3 mb-4'>
                        <div className='p-2 bg-gradient-to-r from-[#00437f] to-[#003366] rounded-lg shadow-md'>
                          <FiPlay className='w-5 h-5 text-white' />
                        </div>
                        <div>
                          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                            Update Data Now
                          </h3>
                          <p className='text-sm text-gray-600 dark:text-gray-400'>
                            Manually update database with current files
                          </p>
                        </div>
                      </div>
                      
                      {/* Update Data Now Controls - Expandable Area */}
                      <div className='flex-grow flex flex-col justify-between space-y-4'>
                      <div className='p-4 bg-gradient-to-r from-[#00437f]/10 to-[#003366]/10 dark:from-[#00437f]/20 dark:to-[#003366]/20 border border-[#00437f]/20 dark:border-[#00437f]/30 rounded-lg'>
                        <div className='flex items-center gap-2 mb-3'>
                          <div className='w-2 h-2 bg-[#00437f] rounded-full animate-pulse'></div>
                          <span className='text-sm font-medium text-[#00437f] dark:text-[#00437f]'>
                            Ready to Update
                          </span>
                        </div>
                        <div className='space-y-2'>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm text-gray-600 dark:text-gray-400'>
                              Files in {selectedDataSource === 'local' ? 'Local Data-Db Folder' : 'Vercel Blob Storage'}
                            </span>
                            <span className='text-xs px-2 py-1 bg-[#00437f]/10 dark:bg-[#00437f]/20 text-[#00437f] dark:text-[#00437f] rounded-full font-medium'>
                              {fileList.length} files
                            </span>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm text-gray-600 dark:text-gray-400'>
                              Database Status
                            </span>
                            <span className='text-xs px-2 py-1 bg-[#00437f]/10 dark:bg-[#00437f]/20 text-[#00437f] dark:text-[#00437f] rounded-full font-medium'>
                              Ready
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        onClick={handleDatabaseUpdate}
                        disabled={isDeleting || fileList.filter(file => file.name.toLowerCase().endsWith('.json')).length === 0}
                        className='w-full bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        {isDeleting ? (
                          <>
                            <FiRefreshCw className='w-5 h-5 inline mr-2 animate-spin' />
                            Deleting Tables...
                          </>
                        ) : (
                          <>
                            <FiPlay className='w-5 h-5 inline mr-2' />
                            Update Database Now
                          </>
                        )}
                      </Button>
                      </div>
                      
                      {/* Spacer for vertical distribution */}
                      <div className='flex-1'></div>
                      
                      {/* Progress display is now handled by the popup component */}

                      <div className='p-3 bg-gradient-to-br from-[#00437f]/10 to-[#003366]/10 dark:from-[#00437f]/20 dark:to-[#003366]/20 border border-[#00437f]/20 dark:border-[#00437f]/30 rounded-lg'>
                        <div className='flex items-center gap-2 mb-2'>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            lastUpdateInfo?.lastUpdateStatus === 'success' 
                              ? 'bg-green-500' 
                              : lastUpdateInfo?.lastUpdateStatus === 'error'
                              ? 'bg-red-500'
                              : lastUpdateInfo?.lastUpdateStatus === 'pending'
                              ? 'bg-yellow-500 animate-pulse'
                              : 'bg-[#00437f] animate-pulse'
                          }`}></div>
                          {isLoadingTimestamps ? (
                            <div className='flex items-center gap-2'>
                              <div className='h-3 bg-[#00437f]/20 rounded animate-pulse w-16'></div>
                              <div className='h-3 bg-[#00437f]/20 rounded animate-pulse w-20'></div>
                            </div>
                          ) : (
                            <span className='text-xs font-medium text-[#00437f] dark:text-[#00437f]'>
                              Last Updated: {formatTimeAgo(lastUpdateInfo?.lastManualUpdate)}
                            </span>
                          )}
                        </div>
                        <div className='text-xs text-gray-700 dark:text-gray-300 leading-relaxed'>
                          <p className='mb-1'>
                            {lastUpdateInfo?.lastUpdateStatus === 'success' 
                              ? 'Database successfully updated with the latest files.'
                              : lastUpdateInfo?.lastUpdateStatus === 'error'
                              ? `Update failed: ${lastUpdateInfo.lastUpdateMessage || 'Unknown error'}`
                              : lastUpdateInfo?.lastUpdateStatus === 'pending'
                              ? 'Database update is currently in progress...'
                              : 'Updates database records with the latest files from your selected data source.'
                            }
                          </p>
                          {lastUpdateInfo?.lastUpdateStatus !== 'error' && (
                            <p>
                              This will replace existing database records with the new data from uploaded files.
                            </p>
                          )}
                        </div>
                      </div>
                   </div>
                   
                   {/* Auto Update Column */}
                   <div className='space-y-4 flex flex-col h-full'>
                     <div className='flex items-center gap-3 mb-4'>
                       <div className='p-2 bg-gradient-to-r from-[#00437f] to-[#003366] rounded-lg shadow-md'>
                         <FiRefreshCw className='w-5 h-5 text-white' />
                       </div>
                       <div>
                         <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                           Auto Update
                         </h3>
                         <p className='text-sm text-gray-600 dark:text-gray-400'>
                           Automatically sync database with files
                         </p>
                       </div>
                     </div>
                     
                     {/* Auto Update Controls - Expandable Area */}
                     <div className='flex-grow flex flex-col justify-between space-y-6'>
                     {/* Auto Update Toggle */}
                     <div className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700'>
                       {isLoadingConfig ? (
                         <>
                           <div className='flex items-center gap-3'>
                             <div className='w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse'></div>
                             <div>
                               <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20 mb-1'></div>
                               <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12'></div>
                             </div>
                           </div>
                           <div className='h-7 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-12'></div>
                         </>
                       ) : (
                         <>
                           <div className='flex items-center gap-3'>
                             <div className={`p-2 rounded-lg ${autoSyncEnabled ? 'bg-[#00437f]/20' : 'bg-gray-200 dark:bg-gray-700'}`}>
                               {autoSyncEnabled ? (
                                 <FiPlay className='w-4 h-4 text-[#00437f]' />
                               ) : (
                                 <FiPause className='w-4 h-4 text-gray-500' />
                               )}
                             </div>
                             <div>
                               <p className='font-medium text-gray-900 dark:text-white text-sm'>Auto Update</p>
                               <p className='text-xs text-gray-500 dark:text-gray-400'>
                                 {autoSyncEnabled ? 'Enabled' : 'Disabled'}
                               </p>
                             </div>
                           </div>
                           <Button
                             onClick={() => handleAutoUpdateToggle(!autoSyncEnabled)}
                             size="sm"
                             className={`px-3 py-1 rounded-lg transition-all duration-200 ${
                               autoSyncEnabled 
                                 ? 'bg-[#00437f] text-white hover:bg-[#003366]' 
                                 : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                             }`}
                           >
                             {autoSyncEnabled ? 'ON' : 'OFF'}
                           </Button>
                         </>
                       )}
                     </div>
                     
                     {/* Update Interval */}
                     <div className='space-y-3'>
                       {isLoadingConfig ? (
                         <div className='flex items-center justify-between'>
                           <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24'></div>
                           <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16'></div>
                         </div>
                       ) : (
                         <div className='flex items-center justify-between'>
                           <label className='text-sm font-medium text-gray-900 dark:text-white'>Update Interval</label>
                           <div className='flex items-center gap-2'>
                             {isUpdatingInterval && (
                               <div className='w-4 h-4 border-2 border-[#00437f] border-t-transparent rounded-full animate-spin'></div>
                             )}
                             <span className='text-sm text-[#00437f] font-medium'>
                               {getCurrentIntervalConfig().label}
                             </span>
                           </div>
                         </div>
                       )}
                       
                       {/* Premium Slider */}
                       {isLoadingConfig ? (
                         <div className='relative space-y-2'>
                           <div className='w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse'></div>
                           <div className='flex justify-between'>
                             {intervalConfigs.map((_, i) => (
                               <div key={i} className='h-3 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
                             ))}
                           </div>
                         </div>
                       ) : (
                         <div className='relative'>
                           {/* Loading overlay during update */}
                           {isUpdatingInterval && (
                             <div className='absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10'>
                               <div className='flex items-center gap-2 text-sm text-[#00437f] font-medium'>
                                 <div className='w-4 h-4 border-2 border-[#00437f] border-t-transparent rounded-full animate-spin'></div>
                                 Saving...
                               </div>
                             </div>
                           )}
                           
                           <input
                             type="range"
                             min="0"
                             max={intervalConfigs.length - 1}
                             step="1"
                             value={getSliderIndexFromInterval(syncInterval)}
                             onChange={(e) => {
                               const sliderIndex = Number(e.target.value)
                               const newInterval = intervalConfigs[sliderIndex]?.minutes
                               if (newInterval && newInterval !== syncInterval) {
                                 handleIntervalChange(newInterval)
                               }
                             }}
                             disabled={isUpdatingInterval}
                             className={`w-full h-2 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg appearance-none cursor-pointer premium-slider transition-opacity ${
                               isUpdatingInterval ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
                             }`}
                           />
                           
                           {/* Slider Labels */}
                           <div className='flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2'>
                             {intervalConfigs.map((config, index) => (
                               <span 
                                 key={config.minutes}
                                 className={`transition-colors cursor-pointer ${
                                   getSliderIndexFromInterval(syncInterval) === index 
                                     ? 'text-[#00437f] font-semibold' 
                                     : 'hover:text-gray-700 dark:hover:text-gray-300'
                                 }`}
                                 onClick={() => {
                                   if (!isUpdatingInterval && config.minutes !== syncInterval) {
                                     handleIntervalChange(config.minutes)
                                   }
                                 }}
                               >
                                 {config.shortLabel}
                               </span>
                             ))}
                           </div>
                           
                           {/* Current Selection Display */}
                           <div className={`mt-3 p-2 rounded-lg border transition-all duration-300 ${
                             isUpdatingInterval 
                               ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                               : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                           }`}>
                             <div className='text-center'>
                               <div className='text-xs text-gray-500 dark:text-gray-400 mb-1'>
                                 {isUpdatingInterval ? 'Saving Selection...' : 'Currently Selected'}
                               </div>
                               <div className='text-sm font-semibold text-[#00437f] dark:text-blue-400 flex items-center justify-center gap-2'>
                                 {isUpdatingInterval && (
                                   <div className='w-3 h-3 border-2 border-[#00437f] border-t-transparent rounded-full animate-spin'></div>
                                 )}
                                 {getCurrentIntervalConfig().label}
                               </div>
                               <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                                 ({getCurrentIntervalConfig().minutes.toLocaleString()} minutes)
                               </div>
                             </div>
                           </div>
                         </div>
                       )}
                     </div>
                     </div>
                     
                     {/* Spacer for vertical distribution */}
                     <div className='flex-1'></div>
                     
                     {/* Last Update Status */}
                     <div className='p-3 bg-[#00437f]/10 dark:bg-[#00437f]/20 border border-[#00437f]/20 dark:border-[#00437f]/30 rounded-lg'>
                       <div className='flex items-center gap-2 mb-1'>
                         <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                           isAutoUpdateRunning 
                             ? 'bg-orange-500' 
                             : isAutoUpdateActive 
                             ? 'bg-green-500' 
                             : autoSyncEnabled 
                             ? 'bg-blue-500' 
                             : 'bg-[#00437f]'
                         }`}></div>
                         <span className='text-xs font-medium text-[#00437f]'>Last Update</span>
                         {isAutoUpdateRunning ? (
                           <span className='text-xs text-orange-600 dark:text-orange-400 font-medium'>• Updating</span>
                         ) : isAutoUpdateActive ? (
                           <span className='text-xs text-green-600 dark:text-green-400 font-medium'>• Active</span>
                         ) : null}
                       </div>
                       {isLoadingTimestamps ? (
                         <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24'></div>
                       ) : (
                         <div className='text-xs'>
                           {autoSyncEnabled ? (
                             <div className='space-y-1'>
                               <p className='text-gray-600 dark:text-gray-400'>
                                 Last: {formatTimeAgo(lastUpdateInfo?.lastAutoUpdate)}
                               </p>
                               <p className={`font-medium ${
                                 autoUpdateStatus.status === 'cooldown' ? 'text-orange-600 dark:text-orange-400' :
                                 autoUpdateStatus.status === 'waiting' ? 'text-blue-600 dark:text-blue-400' :
                                 autoUpdateStatus.status === 'polling' ? 'text-green-600 dark:text-green-400' :
                                 autoUpdateStatus.status === 'updating' ? 'text-purple-600 dark:text-purple-400' :
                                 'text-gray-600 dark:text-gray-400'
                               }`}>
                                 Status: {autoUpdateStatus.message || 'Active'}
                               </p>
                             </div>
                           ) : (
                             <p className='text-gray-600 dark:text-gray-400'>Auto update disabled</p>
                           )}
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
            </Card>

            {/* Auto Update Progress Display */}
            {autoUpdateProgress.phase !== 'idle' && (
              <Card className='mt-4'>
                <div className='p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg'>
                        <FiDatabase className='w-5 h-5 text-white' />
                      </div>
                      <div>
                        <h3 className='font-semibold text-gray-900 dark:text-white'>Auto Update Progress</h3>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          {autoUpdateProgress.phase === 'deleting' ? 'Cleaning database tables' :
                           autoUpdateProgress.phase === 'inserting' ? 'Inserting new records' :
                           autoUpdateProgress.phase === 'complete' ? 'Update completed successfully!' : 'Processing...'}
                        </p>
                      </div>
                    </div>
                    {autoUpdateProgress.startTime && (
                      <div className='text-right text-sm text-gray-600 dark:text-gray-400'>
                        <div>Elapsed: {Math.floor((Date.now() - autoUpdateProgress.startTime) / 1000)}s</div>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className='mb-4'>
                    <div className='flex justify-between items-center mb-2'>
                      <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                        {autoUpdateProgress.currentTable ? 
                          `Processing: ${autoUpdateProgress.currentTable}` :
                          `${autoUpdateProgress.tablesCompleted} / ${autoUpdateProgress.totalTables} tables`
                        }
                      </span>
                      <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                        {autoUpdateProgress.totalTables > 0 ? 
                          Math.round((autoUpdateProgress.tablesCompleted / autoUpdateProgress.totalTables) * 100) : 0}%
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          autoUpdateProgress.phase === 'deleting' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                          autoUpdateProgress.phase === 'inserting' ? 'bg-gradient-to-r from-blue-500 to-green-500' :
                          'bg-gradient-to-r from-green-500 to-emerald-500'
                        }`}
                        style={{ 
                          width: `${autoUpdateProgress.totalTables > 0 ? 
                            (autoUpdateProgress.tablesCompleted / autoUpdateProgress.totalTables) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  {autoUpdateProgress.phase === 'complete' && autoUpdateProgress.completedStats ? (
                    // Show completion stats
                    <div className='space-y-4'>
                      <div className='p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg'>
                        <h4 className='font-bold text-green-800 dark:text-green-200 mb-2'>Update Completed Successfully!</h4>
                        <div className='grid grid-cols-3 gap-4 text-center'>
                          <div>
                            <div className='text-2xl font-bold text-red-600 dark:text-red-400'>
                              {autoUpdateProgress.completedStats.totalRecordsDeleted.toLocaleString()}
                            </div>
                            <div className='text-sm text-gray-600 dark:text-gray-400'>Records Deleted</div>
                          </div>
                          <div>
                            <div className='text-2xl font-bold text-green-600 dark:text-green-400'>
                              {autoUpdateProgress.completedStats.totalRecordsInserted.toLocaleString()}
                            </div>
                            <div className='text-sm text-gray-600 dark:text-gray-400'>Records Inserted</div>
                          </div>
                          <div>
                            <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                              {autoUpdateProgress.completedStats.totalTablesProcessed}
                            </div>
                            <div className='text-sm text-gray-600 dark:text-gray-400'>Tables Processed</div>
                          </div>
                        </div>
                        {autoUpdateProgress.completedStats.completedAt && (
                          <div className='mt-3 text-center text-sm text-gray-600 dark:text-gray-400'>
                            Completed at {new Date(autoUpdateProgress.completedStats.completedAt).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Show live progress stats
                    <div className='grid grid-cols-3 gap-4 text-center'>
                      <div className='p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                        <div className='text-lg font-bold text-gray-900 dark:text-white'>
                          {autoUpdateProgress.tablesCompleted}
                        </div>
                        <div className='text-sm text-gray-600 dark:text-gray-400'>Tables Done</div>
                      </div>
                      <div className='p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                        <div className='text-lg font-bold text-gray-900 dark:text-white'>
                          {autoUpdateProgress.recordsProcessed.toLocaleString()}
                        </div>
                        <div className='text-sm text-gray-600 dark:text-gray-400'>Records Processed</div>
                      </div>
                      <div className='p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                        <div className='text-lg font-bold text-gray-900 dark:text-white'>
                          {autoUpdateProgress.totalTables - autoUpdateProgress.tablesCompleted}
                        </div>
                        <div className='text-sm text-gray-600 dark:text-gray-400'>Remaining</div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Premium Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className='mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
        >
          {[
            {
              icon: FiShield,
              title: "Data Validation",
              description: "Advanced validation rules ensure data integrity",
              color: "from-[#00437f] to-[#003366]"
            },
            {
              icon: FiZap,
              title: "Real-time Sync",
              description: "Instant synchronization with webhook support",
              color: "from-[#00437f] to-[#003366]"
            },
            {
              icon: FiDatabase,
              title: "Multi-format Support",
              description: "JSON, CSV, XML, and custom formats",
              color: "from-[#00437f] to-[#003366]"
            },
            {
              icon: FiBarChart,
              title: "Analytics Dashboard",
              description: "Comprehensive sync analytics and reporting",
              color: "from-[#00437f] to-[#003366]"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className='relative group/card'
            >
              <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-xl blur-xl group-hover/card:blur-2xl transition-all duration-500'></div>
              <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-6 hover:shadow-xl transition-all duration-300 group-hover/card:shadow-2xl transform hover:scale-105'>
                <div className={`p-3 bg-gradient-to-r ${feature.color} rounded-lg w-fit mb-4 shadow-md`}>
                  <feature.icon className='w-6 h-6 text-white' />
                </div>
                <h3 className='font-semibold text-gray-900 dark:text-white mb-2'>
                  {feature.title}
                </h3>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  {feature.description}
                </p>
              </Card>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Database Update Popup */}
      <DatabaseUpdatePopup
        isOpen={showPopup}
        importPhase={importPhase}
        isDeleting={isDeleting}
        isInserting={isInserting}
        onReset={resetProgress}
        onContinueInsertion={handleContinueInsertion}
        onClose={() => {
          setShowPopup(false)
          fetchDataUpdaterInfo() // Refresh data when popup is manually closed
        }}
      />

      {/* File Type Restriction Modal */}
      <FileTypeRestrictionModal
        isOpen={showFileTypeModal}
        onClose={() => setShowFileTypeModal(false)}
        rejectedFiles={rejectedFiles}
      />

             <style jsx>{`
         .premium-slider::-webkit-slider-thumb {
           appearance: none;
           height: 24px;
           width: 24px;
           border-radius: 50%;
           background: linear-gradient(135deg, #00437f 0%, #003366 100%);
           cursor: pointer;
           box-shadow: 0 4px 12px rgba(0, 67, 127, 0.3);
           border: 3px solid white;
           transition: all 0.2s ease;
         }
         
         .premium-slider::-webkit-slider-thumb:hover {
           transform: scale(1.1);
           box-shadow: 0 6px 16px rgba(0, 67, 127, 0.4);
         }
         
         .premium-slider::-moz-range-thumb {
           height: 24px;
           width: 24px;
           border-radius: 50%;
           background: linear-gradient(135deg, #00437f 0%, #003366 100%);
           cursor: pointer;
           border: 3px solid white;
           box-shadow: 0 4px 12px rgba(0, 67, 127, 0.3);
         }
         
         .premium-slider::-webkit-slider-track {
           background: linear-gradient(to right, #00437f 0%, #003366 100%);
           height: 6px;
           border-radius: 3px;
           border: none;
         }
         
         .premium-slider::-moz-range-track {
           background: linear-gradient(to right, #00437f 0%, #003366 100%);
           height: 6px;
           border-radius: 3px;
           border: none;
         }
       `}</style>
    </div>
  )
} 