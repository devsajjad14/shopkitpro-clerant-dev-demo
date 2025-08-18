'use client'

import { motion } from 'framer-motion'
import { 
  FiDatabase,
  FiCheckCircle,
  FiSettings
} from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { DeploymentOverlay } from '@/components/ui/deployment-overlay'

interface DataSourceSelectionProps {
  selectedDataSource: 'local' | 'vercel'
  isUpdatingDataSource: boolean
  isLoadingConfig: boolean
  handleDataSourceChange: (dataSource: 'local' | 'vercel') => void
}

export function DataSourceSelection({
  selectedDataSource,
  isUpdatingDataSource,
  isLoadingConfig,
  handleDataSourceChange
}: DataSourceSelectionProps) {
  return (
    <div className='mb-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='mb-6'
      >
        <div className='flex items-center gap-3 mb-4'>
          <div className='p-3 bg-gradient-to-r from-[#00437f] to-[#003366] rounded-xl shadow-md'>
            <FiDatabase className='w-6 h-6 text-white' />
          </div>
          <div>
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
              Data Source Selection
            </h2>
            <p className='text-gray-600 dark:text-gray-400'>
              Select your preferred data source location
            </p>
          </div>
        </div>
      </motion.div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Local Data-Db Folder Option */}
        <DeploymentOverlay
          restrictedOnVercel={true}
          restrictedOnServer={false}
          restrictionTitle="Local Storage Restricted"
          restrictionMessage="Local Data-Db folder access requires server file system capabilities and is not available on Vercel Cloud deployments. Please use Vercel Blob Storage for cloud-compatible data management."
          allowDismiss={false}
        >
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
        </DeploymentOverlay>

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
                    Cloud storage solution
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
                <span>Cloud Storage</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}