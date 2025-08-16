'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Server, Cloud, ChevronDown, CheckCircle, RotateCw, Lock, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import useSettingStore from '@/hooks/use-setting-store'
import { updateSetting } from '@/lib/actions/settings'
import { toast } from 'sonner'
import { detectDeploymentEnvironment, getPlatformDisplayInfo } from '@/lib/utils/deployment-detection'
import { RestrictionTooltip } from '@/components/ui/premium-tooltip'

export default function PlatformSwitcher() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [deploymentEnv, setDeploymentEnv] = useState(detectDeploymentEnvironment())
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const platform = useSettingStore((state) => state.getPlatform())
  const updateStoreSetting = useSettingStore((state) => state.updateSetting)
  const isLoaded = useSettingStore((state) => state.isLoaded)
  const allSettings = useSettingStore((state) => state.settings)

  const isVercel = platform === 'vercel'
  const isServer = platform === 'server'

  // Get deployment restrictions and display info
  const deploymentInfo = getPlatformDisplayInfo(deploymentEnv)
  const canSwitchToServer = deploymentEnv.capabilities.canUseServerStorage
  const canSwitchToVercel = deploymentEnv.capabilities.canUseVercelStorage

  // Re-detect deployment environment on mount for accuracy
  useEffect(() => {
    const detected = detectDeploymentEnvironment()
    setDeploymentEnv(detected)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handlePlatformSwitch = async (newPlatform: 'server' | 'vercel') => {
    if (newPlatform === platform || isUpdating) return

    // Check deployment restrictions
    if (newPlatform === 'server' && !canSwitchToServer) {
      toast.error('Server Storage Unavailable', {
        description: deploymentInfo.restrictions.serverStorage?.reason || 'Server storage not available in current deployment environment',
        icon: '🔒',
        duration: 4000
      })
      return
    }

    if (newPlatform === 'vercel' && !canSwitchToVercel) {
      toast.error('Vercel Storage Unavailable', {
        description: deploymentInfo.restrictions.vercelStorage?.reason || 'Vercel storage not properly configured',
        icon: '⚠️',
        duration: 4000
      })
      return
    }

    setIsUpdating(true)
    try {
      const result = await updateSetting('platform', newPlatform)
      
      if (result && result.success) {
        // Show success toast first
        toast.success(`Platform switched to ${newPlatform === 'vercel' ? 'Vercel' : 'Server'} successfully!`, {
          description: 'Updating platform settings...',
          icon: newPlatform === 'vercel' ? '☁️' : '🖥️',
          duration: 2000
        })
        
        // Close dropdown
        setIsDropdownOpen(false)
        setIsUpdating(false)
        
        // Update the Zustand store after a brief delay to allow for visual feedback
        setTimeout(() => {
          updateStoreSetting('platform', newPlatform)
        }, 500)
        
        // Global SettingsProvider will automatically refresh settings via its interval
        
      } else {
        console.error('Platform switch failed:', result)
        toast.error('Failed to switch platform', {
          description: (result && result.error) ? result.error : 'An error occurred while updating the platform setting.'
        })
        setIsUpdating(false)
      }
    } catch (error) {
      console.error('Platform switch error:', error)
      toast.error('Failed to switch platform', {
        description: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
      setIsUpdating(false)
    }
  }

  // Don't render anything until settings are loaded to prevent flashing wrong state
  if (!isLoaded) {
    return (
      <div className="relative">
        {/* Loading State - Hide everything until data loads */}
        <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 opacity-75">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg flex items-center justify-center shadow-sm">
              <RotateCw className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="hidden md:block">
              <div className="h-4 bg-gray-300 rounded animate-pulse w-24 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Platform Indicator Button - Only show when data is loaded */}
      <motion.button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-gray-50 to-blue-50 hover:from-gray-100 hover:to-blue-100 rounded-xl border border-gray-200 hover:border-blue-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center space-x-2">
          {isVercel ? (
            <>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm relative">
                <Cloud className="w-4 h-4 text-white" />
                {deploymentEnv.platform === 'vercel' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full"></div>
                )}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900">Resource Platform</p>
                <div className="flex items-center gap-1">
                  <p className="text-xs text-blue-600">Vercel Active</p>
                  {deploymentEnv.platform === 'vercel' && (
                    <span className="text-xs text-blue-500 font-medium">({deploymentInfo.name})</span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg flex items-center justify-center shadow-sm relative">
                <Server className="w-4 h-4 text-white" />
                {deploymentEnv.platform === 'server' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border border-white rounded-full"></div>
                )}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900">Resource Platform</p>
                <div className="flex items-center gap-1">
                  <p className="text-xs text-gray-600">Server Active</p>
                  {deploymentEnv.platform === 'server' && (
                    <span className="text-xs text-green-600 font-medium">({deploymentInfo.name})</span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        <motion.div
          animate={{ rotate: isDropdownOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isDropdownOpen && isLoaded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl bg-white border border-gray-100 ring-1 ring-black/5 focus:outline-none z-50"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Server className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Resource Platform</h3>
                    <p className="text-xs text-gray-500">Running on {deploymentInfo.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-xs border ${
                    deploymentEnv.platform === 'vercel' 
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-green-50 text-green-700 border-green-200'
                  }`}>
                    {deploymentInfo.icon} {deploymentInfo.name}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                    Live
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                {/* Server Option */}
                {canSwitchToServer ? (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePlatformSwitch('server')}
                    className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 ${
                      isServer
                        ? 'border-gray-300 bg-gray-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    } ${isUpdating ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${
                        isServer 
                          ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Server className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">Server Platform</h4>
                            <p className="text-xs text-gray-600 mt-1">Traditional server with full control</p>
                          </div>
                          {isServer && (
                            <div className="text-gray-600">
                              <CheckCircle className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                            Full Control
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                            Custom Config
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <RestrictionTooltip
                    restriction={deploymentInfo.restrictions.serverStorage!}
                    platformName="Server Platform"
                  >
                    <motion.div
                      className="relative p-4 rounded-xl border-2 border-amber-200 bg-amber-50/50 opacity-75 cursor-not-allowed transition-all duration-300"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm bg-amber-100 text-amber-600 relative">
                          <Server className="w-5 h-5" />
                          <Lock className="w-3 h-3 absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-amber-700 text-sm">Server Platform</h4>
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                              </div>
                              <p className="text-xs text-amber-600 mt-1">Not available on {deploymentInfo.name}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-amber-300">
                              Restricted
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-amber-300">
                              {deploymentInfo.name} Only
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </RestrictionTooltip>
                )}

                {/* Vercel Option */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePlatformSwitch('vercel')}
                  className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 ${
                    isVercel
                      ? 'border-blue-200 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  } ${isUpdating ? 'pointer-events-none opacity-50' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${
                      isVercel 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Cloud className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">Vercel Platform</h4>
                          <p className="text-xs text-gray-600 mt-1">Modern serverless with auto-scaling</p>
                        </div>
                        {isVercel && (
                          <div className="text-blue-600">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          Auto Scaling
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          Global CDN
                        </Badge>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Loading State */}
              {isUpdating && (
                <div className="flex items-center justify-center space-x-2 mt-4 pt-3 border-t border-gray-100">
                  <RotateCw className="w-4 h-4 text-blue-600 animate-spin" />
                  <span className="text-sm text-gray-600">Updating platform and refreshing...</span>
                </div>
              )}

              {/* Deployment Info */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700">Environment</span>
                  <span className="text-xs text-gray-500">{deploymentEnv.metadata.isProduction ? 'Production' : 'Development'}</span>
                </div>
                {deploymentEnv.platform !== 'server' && deploymentEnv.metadata.region && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">Region</span>
                    <span className="text-xs text-gray-500">{deploymentEnv.metadata.region}</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 text-center mt-3 pt-2 border-t border-gray-100">
                  {!canSwitchToServer 
                    ? `Running on ${deploymentInfo.name} • Server storage restricted`
                    : 'Page will refresh automatically to load new platform settings'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}