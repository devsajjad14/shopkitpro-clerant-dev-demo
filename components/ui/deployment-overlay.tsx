'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, Server, Shield, Lock, AlertTriangle, X } from 'lucide-react'
import { detectDeploymentEnvironment, getPlatformDisplayInfo } from '@/lib/utils/deployment-detection'

interface DeploymentOverlayProps {
  children: React.ReactNode
  restrictedOnVercel?: boolean
  restrictedOnServer?: boolean
  restrictionTitle?: string
  restrictionMessage?: string
  allowDismiss?: boolean
  className?: string
}

/**
 * Enterprise-grade deployment-aware overlay component
 * Provides intelligent restriction overlays based on deployment environment
 */
export function DeploymentOverlay({
  children,
  restrictedOnVercel = true,
  restrictedOnServer = false,
  restrictionTitle = "Feature Restricted",
  restrictionMessage,
  allowDismiss = false,
  className = ""
}: DeploymentOverlayProps) {
  const [deploymentEnv, setDeploymentEnv] = useState(detectDeploymentEnvironment())
  const [isDismissed, setIsDismissed] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)

  // Re-detect deployment environment on mount
  useEffect(() => {
    const detected = detectDeploymentEnvironment()
    setDeploymentEnv(detected)
  }, [])

  // Determine if overlay should be shown
  useEffect(() => {
    const shouldShow = 
      (!isDismissed) && 
      ((restrictedOnVercel && deploymentEnv.platform === 'vercel') ||
       (restrictedOnServer && deploymentEnv.platform === 'server'))
    
    setShowOverlay(shouldShow)
  }, [deploymentEnv, isDismissed, restrictedOnVercel, restrictedOnServer])

  const deploymentInfo = getPlatformDisplayInfo(deploymentEnv)
  
  // Generate contextual restriction message
  const getRestrictionMessage = () => {
    if (restrictionMessage) return restrictionMessage
    
    if (deploymentEnv.platform === 'vercel') {
      return "This feature requires server file system access and is not available on Vercel Cloud deployments. Server storage operations cannot be performed in serverless environments."
    }
    
    if (deploymentEnv.platform === 'server') {
      return "This feature is restricted on server deployments for security reasons. Please use the cloud-based alternative instead."
    }
    
    return "This feature is not available in your current deployment environment."
  }

  return (
    <div className={`relative ${className}`}>
      {/* Original Content */}
      <div className={showOverlay ? 'pointer-events-none select-none' : ''}>
        {children}
      </div>

      {/* Premium Restriction Overlay */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ 
              backdropFilter: 'blur(8px) saturate(180%)',
              WebkitBackdropFilter: 'blur(8px) saturate(180%)'
            }}
          >
            {/* Gradient Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-gray-50/90 to-blue-50/80 dark:from-gray-900/80 dark:via-gray-800/90 dark:to-gray-900/80" />
            
            {/* Animated Pattern */}
            <div className="absolute inset-0 opacity-10 dark:opacity-5">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-transparent to-purple-500/20"
                style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), 
                                   radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)`
                }}
              />
            </div>

            {/* Restriction Message Card */}
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
              className="relative max-w-2xl mx-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
            >
              {/* Header with Platform Badge */}
              <div className="relative p-8 pb-6 bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-red-50/40 dark:from-amber-900/20 dark:via-orange-900/15 dark:to-red-900/10 border-b border-amber-200/50 dark:border-amber-800/50">
                {/* Dismiss Button */}
                {allowDismiss && (
                  <button
                    onClick={() => setIsDismissed(true)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <div className="flex items-start gap-4">
                  {/* Restriction Icon */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
                        <Shield className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full shadow-lg">
                        <Lock className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      {restrictionTitle}
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </h3>
                    
                    {/* Platform Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold shadow-md ${
                        deploymentEnv.platform === 'vercel' 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                      }`}>
                        {deploymentEnv.platform === 'vercel' ? (
                          <Cloud className="w-4 h-4" />
                        ) : (
                          <Server className="w-4 h-4" />
                        )}
                        Running on {deploymentInfo.name}
                      </div>
                      {deploymentEnv.metadata.isProduction && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          Production
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="space-y-6">
                  {/* Main Message */}
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                      {getRestrictionMessage()}
                    </p>
                  </div>

                  {/* Deployment Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Cloud className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">Current Environment</span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Platform:</span>
                          <span className="font-medium">{deploymentInfo.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="font-medium">{deploymentEnv.metadata.isProduction ? 'Production' : 'Development'}</span>
                        </div>
                        {deploymentEnv.metadata.region && (
                          <div className="flex justify-between">
                            <span>Region:</span>
                            <span className="font-medium">{deploymentEnv.metadata.region}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-amber-50/80 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">Restrictions</span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Server Storage:</span>
                          <span className={`font-medium ${deploymentEnv.capabilities.canUseServerStorage ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {deploymentEnv.capabilities.canUseServerStorage ? '✓ Available' : '✗ Restricted'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cloud Storage:</span>
                          <span className={`font-medium ${deploymentEnv.capabilities.canUseVercelStorage ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {deploymentEnv.capabilities.canUseVercelStorage ? '✓ Available' : '✗ Restricted'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alternative Suggestion */}
                  {deploymentInfo.restrictions.serverStorage && (
                    <div className="p-4 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mt-1">
                          <div className="w-4 h-4 text-blue-600 dark:text-blue-400 font-bold">💡</div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Alternative Available</h4>
                          <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                            {deploymentInfo.restrictions.serverStorage.suggestion}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Background Click Handler (if dismiss allowed) */}
            {allowDismiss && (
              <div 
                className="absolute inset-0 -z-10"
                onClick={() => setIsDismissed(true)}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}