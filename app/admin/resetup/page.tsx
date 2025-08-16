'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FiTrash2, FiAlertTriangle, FiX, FiCheck, FiRefreshCw, FiDatabase, FiUsers, FiShoppingBag, FiSettings, FiBarChart2, FiFileText, FiShield, FiArrowLeft } from 'react-icons/fi'
import { useToast } from '@/components/ui/use-toast'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const dataTypes = [
  { icon: FiShoppingBag, label: 'Products & Inventory', color: 'from-blue-500 to-blue-600' },
  { icon: FiUsers, label: 'Customer Accounts', color: 'from-green-500 to-green-600' },
  { icon: FiDatabase, label: 'Store Settings', color: 'from-purple-500 to-purple-600' },
  { icon: FiBarChart2, label: 'Analytics & Reports', color: 'from-orange-500 to-orange-600' },
  { icon: FiFileText, label: 'CMS Content', color: 'from-pink-500 to-pink-600' },
  { icon: FiShield, label: 'Admin Users', color: 'from-red-500 to-red-600' },
]

export default function ResetupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [animatedIndex, setAnimatedIndex] = useState(0)
  const [showProcessing, setShowProcessing] = useState(false)
  const [processingPhase, setProcessingPhase] = useState(0)
  const [processingProgress, setProcessingProgress] = useState(0)

  // Animate data types sequentially
  useEffect(() => {
    if (showConfirmation) {
      const interval = setInterval(() => {
        setAnimatedIndex((prev) => (prev + 1) % dataTypes.length)
      }, 800)
      return () => clearInterval(interval)
    }
  }, [showConfirmation])

  const processingPhases = [
    { title: "Initializing Reset Process", description: "Preparing to reset your store", icon: "⚡" },
    { title: "Backing Up Configuration", description: "Saving current settings", icon: "💾" },
    { title: "Clearing Database Tables", description: "Removing all data structures", icon: "🗄️" },
    { title: "Resetting Store Settings", description: "Restoring factory defaults", icon: "⚙️" },
    { title: "Clearing Cache & Sessions", description: "Removing cached data", icon: "🧹" },
    { title: "Finalizing Reset", description: "Completing the process", icon: "✨" },
  ]

  const simulateProcessing = async () => {
    setShowProcessing(true)
    setProcessingPhase(0)
    setProcessingProgress(0)

    for (let phase = 0; phase < processingPhases.length; phase++) {
      setProcessingPhase(phase)
      
      // Simulate progress for each phase
      for (let progress = 0; progress <= 100; progress += 2) {
        setProcessingProgress(progress)
        await new Promise(resolve => setTimeout(resolve, 30))
      }
      
      // Brief pause between phases
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    // Final success animation
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Now perform the actual reset
    await performActualReset()
  }

  const performActualReset = async () => {
    try {
      const response = await fetch('/api/setup/delete-all-tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "✅ Store Reset Successfully",
          description: `Successfully reset your store. Redirecting to setup wizard...`,
        })
        
        // Clear admin auth and any cached data
        localStorage.removeItem('adminAuth')
        localStorage.removeItem('adminUser')
        sessionStorage.clear()
        
        // Force a complete page refresh to setup page since all data was cleared
        // Add timestamp to bypass any caching issues
        setTimeout(() => {
          window.location.href = `/setup?reset=${Date.now()}`
        }, 2000)
      } else {
        toast({
          title: "❌ Error Resetting Store",
          description: data.error || 'An unexpected error occurred',
          variant: "destructive",
        })
        setShowProcessing(false)
      }
    } catch (error) {
      console.error('Error resetting store:', error)
      toast({
        title: "❌ Network Error",
        description: "Failed to reset store. Please check your connection and try again.",
        variant: "destructive",
      })
      setShowProcessing(false)
    } finally {
      setIsDeleting(false)
      setShowConfirmation(false)
    }
  }

  const handleResetup = async () => {
    setIsDeleting(true)
    setShowConfirmation(false)
    await simulateProcessing()
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <div className='max-w-4xl mx-auto p-6 space-y-6'>
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
                <div className='w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md'>
                  <FiRefreshCw className='w-5 h-5 text-white' />
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900 dark:text-white tracking-tight'>
                    Resetup Store
                  </h1>
                  <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>
                    Reset your store and start fresh from scratch
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Warning Section */}
        <div className='relative group'>
          <div className='absolute inset-0 bg-gradient-to-br from-red-500/5 via-orange-500/5 to-red-500/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
          <Card className='relative p-6 border border-red-200/50 dark:border-red-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl transition-all duration-300 group-hover:shadow-2xl'>
            <div className='flex items-start gap-4'>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex-shrink-0"
              >
                <div className='w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg'>
                  <FiAlertTriangle className='h-6 w-6 text-white' />
                </div>
              </motion.div>
              
              <div className='flex-1'>
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-xl font-bold text-gray-900 dark:text-white mb-3"
                >
                  ⚠️ Store Reset Warning
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-gray-700 dark:text-gray-300 mb-4 text-base leading-relaxed"
                >
                  This action will permanently delete all data and reset your store to factory settings. 
                  This process cannot be undone and will require a complete re-setup.
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm p-4 rounded-lg border border-red-200/50 dark:border-red-700/50"
                >
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-base">
                    The following data will be permanently deleted:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dataTypes.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                        className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                      >
                        <div className={`w-8 h-8 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center shadow-sm`}>
                          <item.icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">{item.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </Card>
        </div>

        {/* Premium Action Section */}
        <div className='relative group'>
          <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
          <Card className='relative p-6 border border-white/20 dark:border-gray-700/50 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl hover:shadow-xl transition-all duration-300 group-hover:shadow-2xl'>
            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowConfirmation(true)}
                disabled={isDeleting}
                className={`
                  inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-2xl
                  ${isDeleting 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-500/25 hover:shadow-red-500/40 hover:shadow-2xl'
                  }
                `}
              >
                <motion.div
                  animate={isDeleting ? { rotate: 360 } : {}}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <FiTrash2 className="h-6 w-6" />
                </motion.div>
                {isDeleting ? 'Resetting Store...' : 'Resetup Store'}
              </motion.button>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-gray-600 dark:text-gray-400 mt-4 text-base"
              >
                Click the button above to reset your store and start fresh
              </motion.p>
            </div>
          </Card>
        </div>

        {/* Premium Confirmation Modal */}
        <AnimatePresence>
          {showConfirmation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-6 border border-white/20 dark:border-gray-700/50"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-red-500 to-red-600 mb-4 shadow-lg"
                  >
                    <FiAlertTriangle className="h-8 w-8 text-white" />
                  </motion.div>
                  
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xl font-bold text-gray-900 dark:text-white mb-3"
                  >
                    Final Confirmation
                  </motion.h3>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-600 dark:text-gray-400 mb-6 text-base leading-relaxed"
                  >
                    Are you absolutely sure you want to reset your store? This will delete all data and cannot be undone.
                  </motion.p>
                  
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirmation(false)}
                      disabled={isDeleting}
                      className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-semibold text-sm"
                    >
                      <FiX className="h-4 w-4 inline mr-2" />
                      Cancel
                    </Button>
                    
                    <Button
                      onClick={handleResetup}
                      disabled={isDeleting}
                      className={`
                        flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center text-sm
                        ${isDeleting 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl'
                        }
                      `}
                    >
                      {isDeleting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Resetting...
                        </>
                      ) : (
                        <>
                          <FiCheck className="h-4 w-4 mr-2" />
                          Reset Store
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Premium Processing Animation Overlay */}
        <AnimatePresence>
          {showProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 z-[60]"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full p-8 border border-white/20 dark:border-gray-700/50 relative overflow-hidden"
              >
                {/* Animated Background */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#00437f]/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#00437f]/20 rounded-full blur-2xl animate-bounce"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl animate-pulse"></div>
                </div>

                <div className="relative z-10 text-center">
                  {/* Main Icon */}
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                      scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="w-24 h-24 bg-gradient-to-r from-[#00437f] via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                  >
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="text-4xl"
                    >
                      {processingPhases[processingPhase]?.icon || "⚡"}
                    </motion.div>
                  </motion.div>

                  {/* Phase Title */}
                  <motion.h3
                    key={processingPhase}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
                  >
                    {processingPhases[processingPhase]?.title || "Processing..."}
                  </motion.h3>

                  {/* Phase Description */}
                  <motion.p
                    key={`desc-${processingPhase}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-600 dark:text-gray-400 mb-6 text-lg"
                  >
                    {processingPhases[processingPhase]?.description || "Please wait..."}
                  </motion.p>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <span>Progress</span>
                      <span>{processingProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${processingProgress}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-[#00437f] via-purple-500 to-pink-500 rounded-full relative"
                      >
                        <motion.div
                          animate={{ 
                            x: ["0%", "100%"],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                          }}
                          className="absolute inset-0 bg-white/30 rounded-full"
                        />
                      </motion.div>
                    </div>
                  </div>

                  {/* Phase Indicators */}
                  <div className="flex justify-center gap-2 mb-6">
                    {processingPhases.map((_, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0 }}
                        animate={{ 
                          scale: index <= processingPhase ? 1 : 0.5,
                          backgroundColor: index <= processingPhase 
                            ? "rgb(0, 67, 127)" 
                            : "rgb(229, 231, 235)"
                        }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                          index <= processingPhase ? 'bg-[#00437f]' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Loading Animation */}
                  <div className="flex justify-center gap-1">
                    {[...Array(3)].map((_, index) => (
                      <motion.div
                        key={index}
                        animate={{ 
                          y: [0, -10, 0],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{ 
                          duration: 0.6, 
                          repeat: Infinity, 
                          delay: index * 0.2,
                          ease: "easeInOut"
                        }}
                        className="w-2 h-2 bg-gradient-to-r from-[#00437f] to-purple-500 rounded-full"
                      />
                    ))}
                  </div>

                  {/* Floating Particles */}
                  {[...Array(6)].map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ 
                        x: Math.random() * 400 - 200, 
                        y: Math.random() * 300 - 150,
                        opacity: 0 
                      }}
                      animate={{ 
                        x: Math.random() * 400 - 200, 
                        y: Math.random() * 300 - 150,
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        delay: index * 0.5,
                        ease: "easeInOut"
                      }}
                      className="absolute w-2 h-2 bg-gradient-to-r from-[#00437f] to-purple-400 rounded-full blur-sm"
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 