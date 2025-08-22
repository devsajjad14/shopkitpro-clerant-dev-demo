import { memo, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiRefreshCw } from 'react-icons/fi'
import LoadingFallback from './LoadingFallback'
import type { SyncDirection } from './types'

interface SyncSelectionComponentProps {
  onStartSync: (direction: SyncDirection) => void
}

const SyncSelectionComponent = memo(({ onStartSync }: SyncSelectionComponentProps) => {
  const [iconComponents, setIconComponents] = useState<any>(null)

  // Proper useEffect for dynamic imports
  useEffect(() => {
    let mounted = true
    
    import('react-icons/fi').then((icons) => {
      if (mounted) {
        setIconComponents(icons)
      }
    })

    return () => {
      mounted = false
    }
  }, [])

  if (!iconComponents) {
    return <LoadingFallback />
  }

  const { FiUpload, FiDownload, FiCloud, FiHardDrive, FiArrowRight, FiArrowLeft, FiFolder, FiImage, FiCheck } = iconComponents

  const features = {
    upload: [
      { icon: FiFolder, text: "Preserves Structure" },
      { icon: FiImage, text: "All Media Types" },
      { icon: FiCheck, text: "Batch Upload" },
      { icon: FiRefreshCw, text: "Progress Tracking" }
    ],
    download: [
      { icon: FiFolder, text: "Preserves Structure" },
      { icon: FiImage, text: "All Media Types" },
      { icon: FiCheck, text: "Smart Filtering" },
      { icon: FiRefreshCw, text: "Progress Tracking" }
    ]
  }

  return (
    <motion.div
      key="selection"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-6xl mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Upload Option */}
        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onStartSync('upload')}
          className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 group-hover:from-[#00437f]/10 group-hover:to-[#00437f]/10 transition-all duration-500" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <FiUpload className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Local Media → Vercel Blob</h3>
                <p className="text-gray-500 dark:text-gray-400">Upload to Cloud</p>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Upload all media files from your local directory to Vercel Blob storage, preserving folder structure.
            </p>

            <button
              onClick={() => onStartSync('upload')}
              className="flex items-center justify-center gap-4 mb-6 p-4 bg-[#00437f] hover:bg-[#003366] rounded-lg transition-all duration-300 transform hover:scale-105 w-full group"
            >
              <div className="flex items-center gap-2">
                <FiHardDrive className="w-5 h-5 text-white" />
                <span className="text-sm font-medium text-white">Local Media</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <FiArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform duration-300" />
                <span className="text-xs text-white font-medium">Upload</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCloud className="w-5 h-5 text-white" />
                <span className="text-sm font-medium text-white">Vercel Blob</span>
              </div>
            </button>

            <div className="grid grid-cols-2 gap-3">
              {features.upload.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <feature.icon className="w-4 h-4 text-[#00437f]" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Download Option */}
        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onStartSync('download')}
          className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 group-hover:from-[#00437f]/10 group-hover:to-[#00437f]/10 transition-all duration-500" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <FiDownload className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Vercel Blob → Local Media</h3>
                <p className="text-gray-500 dark:text-gray-400">Download to Local</p>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Download all media files from Vercel Blob storage to your local directory, excluding Data-Db folder.
            </p>

            <button
              onClick={() => onStartSync('download')}
              className="flex items-center justify-center gap-4 mb-6 p-4 bg-[#00437f] hover:bg-[#003366] rounded-lg transition-all duration-300 transform hover:scale-105 w-full group"
            >
              <div className="flex items-center gap-2">
                <FiCloud className="w-5 h-5 text-white" />
                <span className="text-sm font-medium text-white">Vercel Blob</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <FiArrowLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="text-xs text-white font-medium">Download</span>
              </div>
              <div className="flex items-center gap-2">
                <FiHardDrive className="w-5 h-5 text-white" />
                <span className="text-sm font-medium text-white">Local Media</span>
              </div>
            </button>

            <div className="grid grid-cols-2 gap-3">
              {features.download.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <feature.icon className="w-4 h-4 text-[#00437f]" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="p-3 bg-[#00437f]/10 dark:bg-[#00437f]/20 rounded-lg w-fit mb-4">
            <FiRefreshCw className="w-6 h-6 text-[#00437f] dark:text-[#00437f]" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Bidirectional Sync</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Keep your local and cloud media in perfect sync with real-time progress tracking.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="p-3 bg-[#00437f]/10 dark:bg-[#00437f]/20 rounded-lg w-fit mb-4">
            <FiFolder className="w-6 h-6 text-[#00437f] dark:text-[#00437f]" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Structure Preservation</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Maintains exact folder hierarchy and file organization across platforms.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="p-3 bg-[#00437f]/10 dark:bg-[#00437f]/20 rounded-lg w-fit mb-4">
            <FiCheck className="w-6 h-6 text-[#00437f] dark:text-[#00437f]" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Smart Processing</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Intelligent filtering and error handling ensure reliable media synchronization.</p>
        </div>
      </div>
    </motion.div>
  )
})

SyncSelectionComponent.displayName = 'SyncSelectionComponent'

export default SyncSelectionComponent