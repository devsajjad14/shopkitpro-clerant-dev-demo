'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiDatabase, 
  FiTrash2, 
  FiUpload, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiClock, 
  FiRefreshCw,
  FiPlay,
  FiPause,
  FiBarChart,
  FiTrendingUp,
  FiZap,
  FiShield,
  FiGlobe,
  FiInfo
} from 'react-icons/fi'

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

interface DatabaseUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  onStartUpdate: () => Promise<void>
  deletionProgress: DeletionProgress[]
  insertionProgress: InsertionProgress[]
  currentPhase: 'idle' | 'deleting' | 'deletion-complete' | 'inserting' | 'complete'
  isProcessing: boolean
}

export default function DatabaseUpdateModal({
  isOpen,
  onClose,
  onStartUpdate,
  deletionProgress,
  insertionProgress,
  currentPhase,
  isProcessing
}: DatabaseUpdateModalProps) {
  const [isStarted, setIsStarted] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Auto-close timer for completion
  useEffect(() => {
    if (currentPhase === 'complete') {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [currentPhase, onClose])

  const handleStartUpdate = async () => {
    if (!showConfirmation) {
      setShowConfirmation(true)
      return
    }
    
    setIsStarted(true)
    setShowConfirmation(false)
    await onStartUpdate()
  }

  const handleClose = () => {
    if (isProcessing) return // Prevent closing during operation
    onClose()
    setIsStarted(false)
    setShowConfirmation(false)
  }

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'deleting': return <FiTrash2 className="w-6 h-6 text-red-500" />
      case 'inserting': return <FiUpload className="w-6 h-6 text-blue-500" />
      case 'complete': return <FiCheckCircle className="w-6 h-6 text-green-500" />
      default: return <FiDatabase className="w-6 h-6 text-gray-500" />
    }
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'deleting': return 'from-red-500/20 to-red-600/20'
      case 'inserting': return 'from-blue-500/20 to-blue-600/20'
      case 'complete': return 'from-green-500/20 to-green-600/20'
      default: return 'from-gray-500/20 to-gray-600/20'
    }
  }

  const getPhaseText = (phase: string) => {
    switch (phase) {
      case 'deleting': return 'Database Cleanup in Progress'
      case 'inserting': return 'Data Import in Progress'
      case 'complete': return 'Database Update Complete!'
      default: return 'Ready to Update Database'
    }
  }

  const totalTables = deletionProgress.length
  const completedDeletions = deletionProgress.filter(item => item.status === 'completed').length
  const completedInsertions = insertionProgress.filter(item => item.status === 'completed').length
  const totalRecordsDeleted = deletionProgress.reduce((sum, item) => sum + item.recordsDeleted, 0)
  const totalRecordsInserted = insertionProgress.reduce((sum, item) => sum + item.recordsInserted, 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
        >
          {/* Main Modal Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.6
            }}
            className="relative w-full h-full max-w-7xl max-h-[95vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden flex flex-col"
          >


            {/* Header Section */}
            <div className="flex-shrink-0 p-4 border-b border-slate-700/50">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Database Update Center
                </h2>
                <p className="text-slate-300 text-sm mb-3 max-w-2xl mx-auto">
                  Transform your database with precision and speed. Watch real-time progress as we clean and rebuild your data infrastructure.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-300 text-xs">
                  <FiInfo className="w-3 h-3" />
                  Settings table will not be deleted - it's a primary table that preserves your configuration. During import, existing settings will be updated with new data.
                </div>
              </div>
            </div>

            {/* Phase Header */}
            <div className="flex-shrink-0 p-3 border-b border-slate-700/30 bg-slate-800/30">
              <div className="flex items-center justify-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getPhaseColor(currentPhase)}`} />
                <h3 className="text-lg font-semibold text-white capitalize">
                  {currentPhase === 'idle' ? 'Ready to Start' : 
                   currentPhase === 'deleting' ? 'Database Cleanup in Progress' :
                   currentPhase === 'deletion-complete' ? 'Cleanup Complete' :
                   currentPhase === 'inserting' ? 'Data Insertion in Progress' :
                   'All Operations Complete!'}
                </h3>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="flex-shrink-0 p-3 bg-slate-800/20 border-b border-slate-700/30">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                  <div className="text-lg font-bold text-blue-400">
                    {currentPhase === 'idle' ? 0 : 
                     currentPhase === 'deleting' ? deletionProgress.filter(item => item.status === 'completed').length :
                     deletionProgress.filter(item => item.status === 'completed').length}
                  </div>
                  <div className="text-xs text-slate-300">Completed</div>
                </div>
                <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                  <div className="text-lg font-bold text-yellow-400">
                    {currentPhase === 'idle' ? 0 : 
                     currentPhase === 'deleting' ? deletionProgress.filter(item => item.status === 'deleting').length :
                     insertionProgress.filter(item => item.status === 'inserting').length}
                  </div>
                  <div className="text-xs text-slate-300">Processing</div>
                </div>
                <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                  <div className="text-lg font-bold text-red-400">
                    {currentPhase === 'idle' ? 0 : 
                     currentPhase === 'deleting' ? deletionProgress.filter(item => item.status === 'failed').length :
                     insertionProgress.filter(item => item.status === 'failed').length}
                  </div>
                  <div className="text-xs text-slate-300">Failed</div>
                </div>
                <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                  <div className="text-lg font-bold text-slate-400">
                    {currentPhase === 'idle' ? 0 : 
                     currentPhase === 'deleting' ? deletionProgress.filter(item => item.status === 'pending').length :
                     insertionProgress.filter(item => item.status === 'pending').length}
                  </div>
                  <div className="text-xs text-slate-300">Pending</div>
                </div>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="flex-shrink-0 p-3 bg-slate-800/10 border-b border-slate-700/20">
              <div className="space-y-2">
                {currentPhase === 'deleting' && (
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Deletion Progress</span>
                      <span>{deletionProgress.filter(item => item.status === 'completed').length} / {deletionProgress.length}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(deletionProgress.filter(item => item.status === 'completed').length / deletionProgress.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                {currentPhase === 'inserting' && (
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Insertion Progress</span>
                      <span>{insertionProgress.filter(item => item.status === 'completed').length} / {insertionProgress.length}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(insertionProgress.filter(item => item.status === 'completed').length / insertionProgress.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Initial State - Start Button */}
            {currentPhase === 'idle' && (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl">
                    <FiDatabase className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Ready to Start Database Update</h3>
                    <p className="text-slate-300 text-sm mb-6">
                      Click the button below to begin the database cleanup and data import process
                    </p>
                    <button
                      onClick={handleStartUpdate}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      Start Database Update
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Progress List - This section now gets the remaining space */}
            {currentPhase !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex-1 min-h-0 overflow-hidden"
              >
                <div className="h-full overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {/* Show deletion progress when deleting */}
                  {currentPhase === 'deleting' && deletionProgress.map((item, index) => (
                    <motion.div
                      key={item.table}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl border transition-all duration-300 ${
                        item.status === 'pending' 
                          ? 'bg-slate-800/50 border-slate-600/30'
                          : item.status === 'deleting'
                          ? 'bg-red-900/20 border-red-500/30'
                          : item.status === 'completed'
                          ? 'bg-green-900/20 border-green-500/30'
                          : 'bg-red-900/20 border-red-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            item.status === 'pending' 
                              ? 'bg-slate-600'
                              : item.status === 'deleting'
                              ? 'bg-red-500'
                              : item.status === 'completed'
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`}>
                            {item.status === 'pending' && <FiClock className="w-5 h-5 text-white" />}
                            {item.status === 'deleting' && <FiRefreshCw className="w-5 h-5 text-white animate-spin" />}
                            {item.status === 'completed' && <FiCheckCircle className="w-5 h-5 text-white" />}
                            {item.status === 'failed' && <FiAlertCircle className="w-5 h-5 text-white" />}
                          </div>
                          <div>
                            <div className="font-semibold text-white capitalize">
                              {item.table.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <div className="text-sm text-slate-300">
                              {item.message}
                            </div>
                            {item.error && (
                              <div className="text-xs text-red-400 mt-2 p-2 bg-red-900/20 rounded border border-red-500/30">
                                <strong>Error:</strong> {item.error}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {item.status === 'completed' && (
                            <div className="text-sm font-medium text-green-400">
                              {item.recordsDeleted.toLocaleString()} records
                            </div>
                          )}
                          {item.status === 'failed' && (
                            <div className="text-sm font-medium text-red-400">
                              Failed
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Show insertion progress when inserting */}
                  {currentPhase === 'inserting' && insertionProgress.map((item, index) => (
                    <motion.div
                      key={item.table}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl border transition-all duration-300 ${
                        item.status === 'pending' 
                          ? 'bg-slate-800/50 border-slate-600/30'
                          : item.status === 'inserting'
                          ? 'bg-blue-900/20 border-blue-500/30'
                          : item.status === 'completed'
                          ? 'bg-green-900/20 border-green-500/30'
                          : 'bg-red-900/20 border-red-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            item.status === 'pending' 
                              ? 'bg-slate-600'
                              : item.status === 'inserting'
                              ? 'bg-blue-500'
                              : item.status === 'completed'
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`}>
                            {item.status === 'pending' && <FiClock className="w-5 h-5 text-white" />}
                            {item.status === 'inserting' && <FiRefreshCw className="w-5 h-5 text-white animate-spin" />}
                            {item.status === 'completed' && <FiCheckCircle className="w-5 h-5 text-white" />}
                            {item.status === 'failed' && <FiAlertCircle className="w-5 h-5 text-white" />}
                          </div>
                          <div>
                            <div className="font-semibold text-white capitalize">
                              {item.table.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <div className="text-sm text-slate-300">
                              {item.message}
                            </div>
                            {item.error && (
                              <div className="text-xs text-red-400 mt-2 p-2 bg-red-900/20 rounded border border-red-500/30">
                                <strong>Error:</strong> {item.error}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {item.status === 'completed' && (
                            <div className="text-sm font-medium text-green-400">
                              {item.recordsInserted.toLocaleString()} records
                            </div>
                          )}
                          {item.status === 'failed' && (
                            <div className="text-sm font-medium text-red-400">
                              Failed
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Show completion summary when done */}
                  {currentPhase === 'complete' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl text-center"
                    >
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4">
                        <FiCheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">All Operations Complete!</h3>
                      <p className="text-green-300 mb-4">
                        Database has been successfully updated with {totalRecordsInserted.toLocaleString()} new records
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-slate-300">
                          <div className="font-semibold">Tables Processed</div>
                          <div className="text-green-400">{totalTables}</div>
                        </div>
                        <div className="text-slate-300">
                          <div className="font-semibold">Total Records</div>
                          <div className="text-green-400">{totalRecordsInserted.toLocaleString()}</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
