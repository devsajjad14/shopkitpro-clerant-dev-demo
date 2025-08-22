import { memo } from 'react'
import { motion } from 'framer-motion'
import { FiRefreshCw } from 'react-icons/fi'

const PageHeader = memo(() => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-8"
  >
    <div className="flex items-center gap-4 mb-3">
      <div className="relative">
        <div className="p-3 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl shadow-lg">
          <FiRefreshCw className="w-7 h-7 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#00437f] rounded-full border-2 border-white shadow-sm animate-pulse" />
      </div>
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-[#00437f] to-[#003366] dark:from-white dark:via-[#00437f] dark:to-[#003366] bg-clip-text text-transparent">
          Media Sync Center
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Bidirectional media synchronization between local storage and Vercel Blob
        </p>
      </div>
    </div>
  </motion.div>
))

PageHeader.displayName = 'PageHeader'

export default PageHeader