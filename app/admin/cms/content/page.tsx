'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiToggleLeft, FiToggleRight, FiExternalLink, FiZap, FiLayers, FiSettings, FiEdit3, FiEye } from 'react-icons/fi'
import { updateSetting } from '@/lib/actions/settings'
import { toast, Toaster } from 'sonner'
import useSettingStore from '@/hooks/use-setting-store'

export default function CMSPage() {
  const { getSetting, updateSetting: updateSettingStore, isLoaded } = useSettingStore()
  const [isSaving, setIsSaving] = useState(false)

  // Get CMS type from global store
  const cmsType = (getSetting('cmsType') || 'no_cms') as 'no_cms' | 'custom_cms' | 'builder_io'

  const handleToggle = async (type: 'custom_cms' | 'builder_io') => {
    if (isSaving) return

    setIsSaving(true)
    try {
      // Toggle logic: if same type is clicked, disable (set to no_cms)
      const newCmsType = cmsType === type ? 'no_cms' : type
      
      const result = await updateSetting('cmsType', newCmsType)
      if (result.success) {
        // Update global store immediately
        updateSettingStore('cmsType', newCmsType)
        
        toast.success('CMS setting updated successfully', {
          description: `${newCmsType === 'no_cms' ? 'CMS disabled' : 
            newCmsType === 'custom_cms' ? 'Custom CMS activated' : 'Builder.io activated'}`,
          duration: 3000,
          position: 'top-right',
          style: {
            background: '#10B981',
            color: 'white',
            border: 'none',
          },
        })
      } else {
        toast.error('Failed to update CMS setting', {
          description: result.error || 'Please try again',
          duration: 5000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: 'white',
            border: 'none',
          },
        })
      }
    } catch (error) {
      console.error('Error updating CMS setting:', error)
      toast.error('Failed to update CMS setting', {
        description: 'An unexpected error occurred',
        duration: 5000,
        position: 'top-right',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Computed states for UI
  const customCMSEnabled = cmsType === 'custom_cms'
  const builderIOEnabled = cmsType === 'builder_io'

  const openCMS = (type: 'custom' | 'builder') => {
    const url = type === 'custom' 
      ? '/custom-cms'
      : '/admin/cms/content/cms-builder'
    window.open(url, '_blank')
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00437f]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
      <Toaster position="top-right" richColors />
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Premium Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl"></div>
          <div className="relative flex items-center justify-between bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-lg flex items-center justify-center shadow-md">
                  <FiSettings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Content Management System
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                    Choose your preferred CMS platform
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-700/80 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className={`w-3 h-3 rounded-full ${cmsType !== 'no_cms' ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {cmsType === 'custom_cms' ? 'Custom CMS Active' : 
                   cmsType === 'builder_io' ? 'Builder.io Active' : 'No CMS Active'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Premium CMS Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Custom CMS Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className={`relative overflow-hidden rounded-2xl shadow-xl transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1 ${
              customCMSEnabled 
                ? 'bg-gradient-to-br from-[#00437f] to-[#003366] shadow-[#00437f]/25' 
                : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50'
            }`}>
              <div className="p-8">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${customCMSEnabled ? 'bg-white/20' : 'bg-gradient-to-br from-[#00437f]/10 to-[#003366]/10'}`}>
                      <FiZap className={`w-6 h-6 ${customCMSEnabled ? 'text-white' : 'text-[#00437f]'}`} />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold ${customCMSEnabled ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                        Custom CMS
                      </h3>
                      <p className={`text-sm ${customCMSEnabled ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'}`}>
                        Tailored for your needs
                      </p>
                    </div>
                  </div>
                  
                  {/* Toggle Switch */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleToggle('custom_cms')}
                    disabled={isSaving}
                    className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
                      customCMSEnabled ? 'bg-white/30' : 'bg-gray-200 dark:bg-gray-600'
                    } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <motion.div
                      animate={{ x: customCMSEnabled ? 32 : 4 }}
                      className="w-6 h-6 bg-white rounded-full shadow-lg"
                    />
                  </motion.button>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {[
                    'Lightning-fast performance',
                    'Intuitive user interface',
                    'Advanced content management',
                    'Dynamic banner system'
                  ].map((feature, index) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center gap-3 group/item"
                    >
                      <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        customCMSEnabled ? 'bg-white/60' : 'bg-[#00437f]'
                      } group-hover/item:scale-125`} />
                      <span className={`text-sm transition-all duration-300 ${
                        customCMSEnabled ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'
                      } group-hover/item:text-[#00437f] dark:group-hover/item:text-blue-400`}>
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Action Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openCMS('custom')}
                  disabled={!customCMSEnabled || isSaving}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
                    customCMSEnabled && !isSaving
                      ? 'bg-white text-[#00437f] hover:bg-white/90 shadow-lg transform hover:scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <FiExternalLink className="w-5 h-5" />
                  {customCMSEnabled ? 'Open Custom CMS' : 'Enable to Access'}
                </motion.button>
              </div>

              {/* Decorative Elements */}
              {customCMSEnabled && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
              )}
            </div>
          </motion.div>

          {/* Builder.io Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className={`relative overflow-hidden rounded-2xl shadow-xl transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1 ${
              builderIOEnabled 
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 shadow-gray-500/25' 
                : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50'
            }`}>
              <div className="p-8">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${builderIOEnabled ? 'bg-white/20' : 'bg-gradient-to-br from-gray-500/10 to-gray-600/10'}`}>
                      <FiLayers className={`w-6 h-6 ${builderIOEnabled ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold ${builderIOEnabled ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                        Builder.io
                      </h3>
                      <p className={`text-sm ${builderIOEnabled ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'}`}>
                        Visual drag & drop builder
                      </p>
                    </div>
                  </div>
                  
                  {/* Toggle Switch */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleToggle('builder_io')}
                    disabled={isSaving}
                    className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
                      builderIOEnabled ? 'bg-white/30' : 'bg-gray-200 dark:bg-gray-600'
                    } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <motion.div
                      animate={{ x: builderIOEnabled ? 32 : 4 }}
                      className="w-6 h-6 bg-white rounded-full shadow-lg"
                    />
                  </motion.button>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {[
                    'Visual drag & drop interface',
                    'Pre-built component library',
                    'Real-time preview',
                    'Responsive design tools'
                  ].map((feature, index) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center gap-3 group/item"
                    >
                      <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        builderIOEnabled ? 'bg-white/60' : 'bg-gray-500'
                      } group-hover/item:scale-125`} />
                      <span className={`text-sm transition-all duration-300 ${
                        builderIOEnabled ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'
                      } group-hover/item:text-gray-700 dark:group-hover/item:text-gray-200`}>
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Action Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openCMS('builder')}
                  disabled={!builderIOEnabled || isSaving}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
                    builderIOEnabled && !isSaving
                      ? 'bg-white text-gray-800 hover:bg-white/90 shadow-lg transform hover:scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <FiExternalLink className="w-5 h-5" />
                  {builderIOEnabled ? 'Open Builder.io' : 'Enable to Access'}
                </motion.button>
              </div>

              {/* Decorative Elements */}
              {builderIOEnabled && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
              )}
            </div>
          </motion.div>
        </div>

        {/* Premium Try CMS Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                  <FiEye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Try CMS Without Activating</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Preview both CMS platforms before making your choice</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.open('/custom-cms', '_blank')}
                  className="px-6 py-3 bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FiExternalLink className="w-4 h-4" />
                  Preview Custom CMS
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.open('/admin/cms/content/cms-builder', '_blank')}
                  className="px-6 py-3 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 hover:border-[#00437f] hover:bg-[#00437f]/5 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FiExternalLink className="w-4 h-4" />
                  Preview Builder.io
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 