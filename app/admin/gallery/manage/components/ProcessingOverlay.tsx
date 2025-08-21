'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FiUpload, FiCheck, FiRefreshCw } from 'react-icons/fi'

interface ProcessingOverlayProps {
  isVisible: boolean
  stage: 'uploading' | 'processing' | 'refreshing' | 'complete'
  uploadProgress?: number
  fileName?: string
}

function ProcessingOverlay({ 
  isVisible, 
  stage, 
  uploadProgress = 0,
  fileName = ''
}: ProcessingOverlayProps) {
  const getStageInfo = () => {
    switch (stage) {
      case 'uploading':
        return {
          icon: FiUpload,
          title: 'Uploading File',
          subtitle: fileName,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        }
      case 'processing':
        return {
          icon: FiRefreshCw,
          title: 'Processing Image',
          subtitle: 'Optimizing and resizing...',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50'
        }
      case 'refreshing':
        return {
          icon: FiRefreshCw,
          title: 'Refreshing Gallery',
          subtitle: 'Loading updated content...',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50'
        }
      case 'complete':
        return {
          icon: FiCheck,
          title: 'Upload Complete',
          subtitle: 'File uploaded successfully!',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        }
    }
  }

  const { icon: Icon, title, subtitle, color, bgColor } = getStageInfo()

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            className={`${bgColor} rounded-2xl p-8 mx-4 max-w-md w-full shadow-2xl border border-white/20`}
          >
            {/* Icon with animation */}
            <div className="flex justify-center mb-6">
              <div className={`${bgColor.replace('50', '100')} rounded-full p-4`}>
                <motion.div
                  animate={{ 
                    rotate: stage === 'processing' || stage === 'refreshing' ? 360 : 0 
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: stage === 'processing' || stage === 'refreshing' ? Infinity : 0,
                    ease: "linear" 
                  }}
                >
                  <Icon className={`w-8 h-8 ${color}`} />
                </motion.div>
              </div>
            </div>

            {/* Content */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                {subtitle}
              </p>

              {/* Progress bar for uploading stage */}
              {stage === 'uploading' && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Progress</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* Animated dots for processing stages */}
              {(stage === 'processing' || stage === 'refreshing') && (
                <div className="flex justify-center space-x-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className={`w-2 h-2 rounded-full ${color.replace('text-', 'bg-')}`}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Success checkmark animation */}
              {stage === 'complete' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex justify-center"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <motion.div
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    >
                      <FiCheck className="w-8 h-8 text-green-600" />
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ProcessingOverlay