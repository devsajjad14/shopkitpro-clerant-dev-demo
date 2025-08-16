'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ArrowRight, ArrowLeft, Loader2, Sparkles, Store, User, Settings, Globe, Shield, Zap, Star, Database, Server, Rocket, Crown, Cloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { useAdminAuthStore } from '@/store/admin-auth-store'

interface SetupWizardData {
  storeName: string
  storeEmail: string
  phoneNumber: string
  storeAddress: string
  siteTitle: string
  description: string
  keywords: string
  adminName: string
  adminEmail: string
  adminPassword: string
  platform: string
}

const steps = [
  {
    id: 1,
    title: 'Store Information',
    description: 'Tell us about your business',
    icon: Store,
    fields: ['storeName', 'storeEmail', 'phoneNumber', 'storeAddress']
  },
  {
    id: 2,
    title: 'Website Settings',
    description: 'Customize your online presence',
    icon: Globe,
    fields: ['siteTitle', 'description', 'keywords']
  },
  {
    id: 3,
    title: 'Resource Platform',
    description: 'Choose your hosting platform',
    icon: Cloud,
    fields: ['platform']
  },
  {
    id: 4,
    title: 'Admin Account',
    description: 'Create your administrator account',
    icon: User,
    fields: ['adminName', 'adminEmail', 'adminPassword']
  }
]

export default function SetupWizard() {
  const router = useRouter()
  const { login } = useAdminAuthStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<SetupWizardData>({
    storeName: '',
    storeEmail: '',
    phoneNumber: '',
    storeAddress: '',
    siteTitle: '',
    description: '',
    keywords: '',
    platform: 'server',
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)
  const [loginStatus, setLoginStatus] = useState<'pending' | 'success' | 'failed'>('pending')
  const [redirectProgress, setRedirectProgress] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [setupPhase, setSetupPhase] = useState<'setup' | 'login' | 'complete'>('setup')
  const [setupProgress, setSetupProgress] = useState(0)
  const [currentSetupStep, setCurrentSetupStep] = useState(0)
  const [setupSteps] = useState([
    { name: 'Initializing Database', icon: Database, color: 'bg-[#00437f]' },
    { name: 'Creating Store Settings', icon: Store, color: 'bg-[#00437f]' },
    { name: 'Setting Up Admin Account', icon: Crown, color: 'bg-[#00437f]' },
    { name: 'Configuring Server', icon: Server, color: 'bg-[#00437f]' },
    { name: 'Launching Your Store', icon: Rocket, color: 'bg-[#00437f]' }
  ])

  const updateData = (field: keyof SetupWizardData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateStep = (step: number): boolean => {
    const currentStepData = steps.find(s => s.id === step)
    if (!currentStepData) return false

    const newErrors: Record<string, string> = {}

    currentStepData.fields.forEach(field => {
      const value = data[field as keyof SetupWizardData]
      
      if (!value || value.trim() === '') {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`
      } else if (field.includes('Email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors[field] = 'Please enter a valid email address'
      } else if (field === 'adminPassword' && value.length < 8) {
        newErrors[field] = 'Password must be at least 8 characters long'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const completeSetup = async () => {
    if (!validateStep(currentStep)) return

    setLoading(true)
    setErrors({}) // Clear previous errors
    setSetupProgress(0)
    setCurrentSetupStep(0)
    
    let cleanupProgress: (() => void) | null = null
    
    try {
      console.log('Starting setup process...')
      
      // Simulate setup progress with stunning animations
      const simulateProgress = () => {
        const progressInterval = setInterval(() => {
          setSetupProgress(prev => {
            if (prev >= 100) {
              clearInterval(progressInterval)
              return 100
            }
            return prev + 2
          })
        }, 100)

        const stepInterval = setInterval(() => {
          setCurrentSetupStep(prev => {
            if (prev >= setupSteps.length - 1) {
              clearInterval(stepInterval)
              return setupSteps.length - 1
            }
            return prev + 1
          })
        }, 2000)

        return () => {
          clearInterval(progressInterval)
          clearInterval(stepInterval)
        }
      }

      // Start progress simulation
      cleanupProgress = simulateProgress()
      
      // Step 1: Initialize database
      console.log('Step 1: Initializing database...')
      let initResponse
      try {
        initResponse = await fetch('/api/setup/init-db', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      } catch (fetchError) {
        console.error('Network error during database initialization:', fetchError)
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection.')
      }
      
      let initResult
      try {
        initResult = await initResponse.json()
      } catch (parseError) {
        console.error('Failed to parse database init response:', parseError)
        throw new Error('Server response error: Invalid response from server.')
      }
      
      console.log('Database init result:', initResult)
      
      if (!initResult.success) {
        // Handle specific error cases
        if (initResult.error && (initResult.error.includes('timeout') || initResult.error.includes('timed out'))) {
          console.log('Database init timeout, but tables might be created. Continuing with setup...')
          // Continue with setup even if there was a timeout, as tables might have been created
        } else if (initResult.error && initResult.error.includes('already exists')) {
          console.log('Tables already exist, continuing with setup...')
          // Continue with setup if tables already exist
        } else {
          // For other errors, try to check if tables exist anyway
          console.log('Database init failed, checking if tables exist anyway...')
          try {
            const checkResponse = await fetch('/api/setup/status', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              }
            })
            const checkResult = await checkResponse.json()
            
            if (checkResult.success && checkResult.isSetup) {
              console.log('Tables exist despite initialization error, continuing with setup...')
              // Continue with setup if tables exist
            } else {
              throw new Error(initResult.error || 'Failed to initialize database')
            }
          } catch (checkError) {
            console.error('Failed to check table existence:', checkError)
            throw new Error(initResult.error || 'Failed to initialize database')
          }
        }
      }

      // Step 2: Complete setup
      console.log('Step 2: Completing setup...')
      let response
      try {
        response = await fetch('/api/setup/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
      } catch (fetchError) {
        console.error('Network error during setup completion:', fetchError)
        throw new Error('Network error: Unable to complete setup. Please check your internet connection.')
      }

      let result
      try {
        result = await response.json()
      } catch (parseError) {
        console.error('Failed to parse setup completion response:', parseError)
        throw new Error('Server response error: Invalid response from server.')
      }

      console.log('Setup completion result:', result)

      if (result.success) {
        console.log('Setup completed successfully!')
        setSetupComplete(true)
        
        // Clear all caches after successful setup
        try {
          await fetch('/api/setup/clear-cache', { method: 'POST' })
          console.log('All caches cleared successfully')
        } catch (cacheError) {
          console.error('Failed to clear cache:', cacheError)
        }
        
        // Step 3: Auto-login
        console.log('Step 3: Attempting auto-login...')
        try {
          const loginSuccess = await login(data.adminEmail, data.adminPassword)
          
          if (loginSuccess) {
            console.log('Auto-login successful, redirecting to admin...')
            setLoginStatus('success')
            
            // Start progress animation
            const progressInterval = setInterval(() => {
              setRedirectProgress(prev => {
                if (prev >= 100) {
                  clearInterval(progressInterval)
                  return 100
                }
                return prev + 2
              })
            }, 50) // Update every 50ms for smooth animation (5 seconds total)
            
            // Handle redirect when progress reaches 100%
            setTimeout(() => {
              clearInterval(progressInterval)
              // Use window.location for more reliable redirect
              window.location.href = '/admin/help'
            }, 5000) // 5 seconds total for progress animation
            
          } else {
            console.error('Auto-login failed')
            setLoginStatus('failed')
            // Still redirect but show a message
            setTimeout(() => {
              alert('Setup completed successfully! Please log in manually.')
              router.push('/admin/login')
            }, 2000)
          }
        } catch (loginError) {
          console.error('Login error:', loginError)
          setLoginStatus('failed')
          // Setup completed but login failed, redirect to login page
          setTimeout(() => {
            alert('Setup completed successfully! Please log in manually.')
            router.push('/admin/login')
          }, 2000)
        }
      } else {
        // Handle specific setup completion errors
        let errorMessage = 'Setup failed. Please try again.'
        
        if (result.error) {
          if (result.error.includes('already exists') || result.error.includes('duplicate')) {
            errorMessage = 'Setup already completed. You can log in with your existing credentials.'
            // If setup is already complete, try to redirect to help page
            setTimeout(() => {
              window.location.href = '/admin/help'
            }, 2000)
          } else if (result.error.includes('validation')) {
            errorMessage = 'Please check your input data and try again.'
          } else if (result.error.includes('database')) {
            errorMessage = 'Database error occurred. Please try again or contact support.'
          } else {
            errorMessage = result.error
          }
        }
        
        setErrors({ general: errorMessage })
      }
    } catch (error: any) {
      console.error('Setup error:', error)
      
      // Handle specific error types
      let errorMessage = 'Setup failed. Please try again.'
      
      if (error.message.includes('Network error')) {
        errorMessage = error.message
      } else if (error.message.includes('Server response error')) {
        errorMessage = error.message
      } else if (error.message.includes('already exists')) {
        errorMessage = 'Setup already completed. You can log in with your existing credentials.'
        // If setup is already complete, try to redirect to help page
        setTimeout(() => {
          window.location.href = '/admin/help'
        }, 2000)
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.'
      } else if (error.message.includes('permission')) {
        errorMessage = 'Permission denied. Please check your credentials.'
      } else {
        errorMessage = error.message || 'An unexpected error occurred. Please try again.'
      }
      
      setErrors({ general: errorMessage })
    } finally {
      setLoading(false)
      // Clean up progress simulation
      if (typeof cleanupProgress === 'function') {
        cleanupProgress()
      }
    }
  }

  const progress = (currentStep / steps.length) * 100

  if (setupComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 via-gray-500/5 to-blue-500/5 animate-pulse"></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-bounce"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-400/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 max-w-xl w-full"
        >
          {/* Main Completion Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20">
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.2, 
                  duration: 0.8, 
                  type: "spring",
                  stiffness: 200
                }}
                className="w-20 h-20 bg-[#00437f] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg relative"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-[#00437f]/20 rounded-full"
                />
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-3xl font-bold text-gray-900 mb-2"
              >
                Setup Complete! 🎉
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="text-gray-600 text-base mb-6"
              >
                {loginStatus === 'pending' && 'Your store is ready to go! You\'ll be redirected to the help center in a moment.'}
                {loginStatus === 'success' && 'Auto-login successful! Redirecting to help center...'}
                {loginStatus === 'failed' && 'Setup completed! You\'ll be redirected to the login page to sign in manually.'}
              </motion.p>
            </div>

            {/* Status Display */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mb-6"
            >
              <div className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-blue-100">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 bg-[#00437f] rounded-lg flex items-center justify-center shadow-lg"
                >
                  <Loader2 className="w-5 h-5 text-white" />
                </motion.div>
                <div className="text-center">
                  <h3 className="text-base font-semibold text-gray-900">
                    Preparing your help center
                  </h3>
                  <p className="text-xs text-gray-600">
                    Setting up your dashboard...
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="mb-6"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-gray-700">Redirect Progress</span>
                <span className="text-xs font-bold text-[#00437f]">{redirectProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-[#00437f] rounded-full relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${redirectProgress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </motion.div>
              </div>
            </motion.div>

            {/* Animated Success Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="grid grid-cols-3 gap-3 mb-6"
            >
              {[
                { icon: '✓', label: 'Database', color: 'bg-gray-100 text-gray-600' },
                { icon: '✓', label: 'Settings', color: 'bg-blue-100 text-blue-600' },
                { icon: '✓', label: 'Account', color: 'bg-purple-100 text-purple-600' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4 + index * 0.2 }}
                  className="text-center"
                >
                  <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center mx-auto mb-1 shadow-sm`}>
                    <span className="text-sm font-bold">{item.icon}</span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">{item.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Loading Animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="flex justify-center mb-4"
            >
              <div className="flex space-x-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ 
                      duration: 0.6, 
                      repeat: Infinity, 
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                    className="w-2.5 h-2.5 bg-[#00437f] rounded-full"
                  />
                ))}
              </div>
            </motion.div>

            {/* Manual Redirect Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="text-center pt-4 border-t border-gray-200"
            >
              <p className="text-xs text-gray-500 mb-2">
                If you're not redirected automatically, click below:
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  window.location.href = '/admin/help'
                }}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#00437f] hover:bg-[#003366] text-white rounded-lg text-sm font-medium transition-colors shadow-lg"
              >
                <span>Go to Help Center</span>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  →
                </motion.div>
              </motion.button>
            </motion.div>

            {/* Success Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 0, 
                    x: Math.random() * 300 - 150, 
                    y: Math.random() * 300 - 150 
                  }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    x: Math.random() * 300 - 150, 
                    y: Math.random() * 300 - 150 
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    delay: i * 0.5,
                    ease: "easeOut"
                  }}
                  className="absolute w-1.5 h-1.5 bg-[#00437f]/30 rounded-full"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Stunning Loading Overlay
  if (loading && setupProgress > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 via-gray-500/5 to-blue-500/5 animate-pulse"></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-bounce"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-400/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 max-w-2xl w-full"
        >
          {/* Main Loading Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
            {/* Header */}
            <div className="text-center mb-8">
                             <motion.div
                 animate={{ rotate: 360 }}
                 transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                 className="w-20 h-20 bg-[#00437f] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
               >
                 <Sparkles className="w-10 h-10 text-white" />
               </motion.div>
               <h2 className="text-3xl font-bold text-gray-900 mb-2">
                 Setting Up Your Store
               </h2>
              <p className="text-gray-600 text-lg">
                Creating something amazing for you...
              </p>
            </div>

            {/* Current Step Display */}
            <div className="mb-8">
              <motion.div
                key={currentSetupStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center space-x-4 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-blue-100"
              >
                                 <div className={`w-12 h-12 ${setupSteps[currentSetupStep]?.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  {React.createElement(setupSteps[currentSetupStep]?.icon, { className: 'w-6 h-6 text-white' })}
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {setupSteps[currentSetupStep]?.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Step {currentSetupStep + 1} of {setupSteps.length}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">Setup Progress</span>
                                 <span className="text-sm font-bold text-[#00437f]">{setupProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                 <motion.div
                   className="h-full bg-[#00437f] rounded-full relative"
                   initial={{ width: 0 }}
                   animate={{ width: `${setupProgress}%` }}
                   transition={{ duration: 0.5, ease: "easeOut" }}
                 >
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                 </motion.div>
              </div>
            </div>

            {/* Animated Steps */}
            <div className="grid grid-cols-5 gap-2 mb-6">
              {setupSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ 
                    scale: index <= currentSetupStep ? 1 : 0.8,
                    opacity: index <= currentSetupStep ? 1 : 0.5
                  }}
                                     className={`w-full h-2 rounded-full transition-all duration-500 ${
                     index <= currentSetupStep 
                       ? 'bg-[#00437f]' 
                       : 'bg-gray-200'
                   }`}
                />
              ))}
            </div>

            {/* Loading Animation */}
            <div className="flex justify-center">
              <div className="flex space-x-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ 
                      duration: 0.6, 
                      repeat: Infinity, 
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                                         className="w-3 h-3 bg-[#00437f] rounded-full"
                  />
                ))}
              </div>
            </div>

            {/* Encouraging Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center mt-6"
            >
              <p className="text-sm text-gray-500">
                ✨ This will only take a moment...
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center mb-5">
            <div className="w-14 h-14 bg-[#00437f] rounded-xl flex items-center justify-center mr-5 shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to ShopKit Pro
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Let's get your online store up and running in just a few minutes
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm text-gray-500 font-medium">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2.5 bg-gray-100" />
        </motion.div>

        {/* Steps Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-10"
        >
          <div className="flex space-x-5">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shadow-lg transition-all duration-300 ${
                    step.id <= currentStep
                      ? 'bg-[#00437f] text-white scale-110'
                      : 'bg-white text-gray-500 border-2 border-gray-200'
                  }`}
                >
                  {step.id < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-10 h-1 mx-3 rounded-full transition-all duration-300 ${
                      step.id < currentStep ? 'bg-[#00437f]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Step Content */}
          <div className="lg:col-span-2">
                         <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm min-h-[700px]">
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shadow-lg">
                    {React.createElement(steps[currentStep - 1].icon, {
                      className: 'w-6 h-6 text-[#00437f]'
                    })}
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">{steps[currentStep - 1].title}</CardTitle>
                    <CardDescription className="text-base text-gray-600 mt-1">{steps[currentStep - 1].description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
                             <CardContent className="pt-0 pb-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                                         className="space-y-8"
                   >
                     {currentStep === 1 && (
                       <div className="space-y-8">
                        <div className="space-y-3">
                          <Label htmlFor="storeName" className="text-sm font-semibold text-gray-900">Store Name *</Label>
                          <Input
                            id="storeName"
                            value={data.storeName}
                            onChange={(e) => updateData('storeName', e.target.value)}
                            placeholder="Enter your store name"
                            className={`h-11 text-sm ${errors.storeName ? 'border-red-500 focus:border-red-500' : 'focus:border-[#00437f]'}`}
                          />
                          {errors.storeName && (
                            <p className="text-red-500 text-xs mt-1">{errors.storeName}</p>
                          )}
                          <p className="text-gray-500 text-xs mt-1">
                            This will be the name of your online store
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          <Label htmlFor="storeEmail" className="text-sm font-semibold text-gray-900">Store Email *</Label>
                          <Input
                            id="storeEmail"
                            type="email"
                            value={data.storeEmail}
                            onChange={(e) => updateData('storeEmail', e.target.value)}
                            placeholder="store@example.com"
                            className={`h-11 text-sm ${errors.storeEmail ? 'border-red-500 focus:border-red-500' : 'focus:border-[#00437f]'}`}
                          />
                          {errors.storeEmail && (
                            <p className="text-red-500 text-xs mt-1">{errors.storeEmail}</p>
                          )}
                          <p className="text-gray-500 text-xs mt-1">
                            Primary contact email for your store
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          <Label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-900">Phone Number *</Label>
                          <Input
                            id="phoneNumber"
                            value={data.phoneNumber}
                            onChange={(e) => updateData('phoneNumber', e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            className={`h-11 text-sm ${errors.phoneNumber ? 'border-red-500 focus:border-red-500' : 'focus:border-[#00437f]'}`}
                          />
                          {errors.phoneNumber && (
                            <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                          )}
                          <p className="text-gray-500 text-xs mt-1">
                            Contact phone number for customer support
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          <Label htmlFor="storeAddress" className="text-sm font-semibold text-gray-900">Store Address *</Label>
                          <Textarea
                            id="storeAddress"
                            value={data.storeAddress}
                            onChange={(e) => updateData('storeAddress', e.target.value)}
                            placeholder="Enter your store's physical address"
                            rows={3}
                            className={`text-sm resize-none ${errors.storeAddress ? 'border-red-500 focus:border-red-500' : 'focus:border-[#00437f]'}`}
                          />
                          {errors.storeAddress && (
                            <p className="text-red-500 text-xs mt-1">{errors.storeAddress}</p>
                          )}
                          <p className="text-gray-500 text-xs mt-1">
                            Physical address for your business (optional for online-only stores)
                          </p>
                        </div>
                      </div>
                    )}

                                         {currentStep === 2 && (
                       <div className="space-y-8">
                        <div className="space-y-2">
                          <Label htmlFor="siteTitle" className="text-sm font-semibold text-gray-900">Website Title</Label>
                          <Input
                            id="siteTitle"
                            value={data.siteTitle}
                            onChange={(e) => updateData('siteTitle', e.target.value)}
                            placeholder={data.storeName || "Your Store Name"}
                            className="h-11 text-sm focus:border-[#00437f]"
                          />
                          <p className="text-gray-500 text-xs mt-1">
                            This will appear in browser tabs and search results
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-sm font-semibold text-gray-900">Website Description</Label>
                          <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => updateData('description', e.target.value)}
                            placeholder={`Welcome to ${data.storeName || 'your store'}`}
                            rows={4}
                            className="text-sm resize-none focus:border-[#00437f]"
                          />
                          <p className="text-gray-500 text-xs mt-1">
                            Brief description of your store for search engines
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="keywords" className="text-sm font-semibold text-gray-900">Keywords</Label>
                          <Input
                            id="keywords"
                            value={data.keywords}
                            onChange={(e) => updateData('keywords', e.target.value)}
                            placeholder="online store, ecommerce, shopping"
                            className="h-11 text-sm focus:border-[#00437f]"
                          />
                          <p className="text-gray-500 text-xs mt-1">
                            Comma-separated keywords for SEO (optional)
                          </p>
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-8">
                        <div className="mb-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                              <Crown className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">Choose Your Resource Platform</h3>
                              <p className="text-sm text-gray-600">Select where you want to host your store</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Label className="text-sm font-semibold text-gray-900 block mb-4">Resource Platform *</Label>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Server Option */}
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => updateData('platform', 'server')}
                              className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 ${
                                data.platform === 'server'
                                  ? 'border-[#00437f] bg-blue-50 shadow-lg'
                                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-start space-x-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-md ${
                                  data.platform === 'server' ? 'bg-[#00437f] text-white' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  <Server className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h4 className="font-bold text-gray-900">Resource Platform</h4>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-3">
                                    Traditional server hosting with full control and flexibility
                                  </p>
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-2 text-xs text-gray-700">
                                      <CheckCircle className="w-3 h-3 text-gray-500" />
                                      <span>Full server control</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs text-gray-700">
                                      <CheckCircle className="w-3 h-3 text-gray-500" />
                                      <span>Custom configurations</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs text-gray-700">
                                      <CheckCircle className="w-3 h-3 text-gray-500" />
                                      <span>Better for complex setups</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>

                            {/* Vercel Option */}
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => updateData('platform', 'vercel')}
                              className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 ${
                                data.platform === 'vercel'
                                  ? 'border-[#00437f] bg-blue-50 shadow-lg'
                                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-start space-x-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-md ${
                                  data.platform === 'vercel' ? 'bg-[#00437f] text-white' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  <Cloud className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h4 className="font-bold text-gray-900">Vercel Platform</h4>
                                    <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-1">Serverless</Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-3">
                                    Modern serverless platform with automatic scaling
                                  </p>
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-2 text-xs text-gray-700">
                                      <CheckCircle className="w-3 h-3 text-blue-500" />
                                      <span>Auto scaling</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs text-gray-700">
                                      <CheckCircle className="w-3 h-3 text-blue-500" />
                                      <span>Zero maintenance</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs text-gray-700">
                                      <CheckCircle className="w-3 h-3 text-blue-500" />
                                      <span>Global CDN included</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </div>

                          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Sparkles className="w-3 h-3 text-blue-600" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-blue-800 font-semibold text-sm mb-1">Platform Configuration</h4>
                                <p className="text-blue-700 text-sm leading-relaxed">
                                  This setting determines how your store will be deployed and configured. 
                                  You can change this later in your admin settings if needed.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                                         {currentStep === 4 && (
                       <div className="space-y-8">
                        <div className="space-y-2">
                          <Label htmlFor="adminName" className="text-sm font-semibold text-gray-900">Full Name *</Label>
                          <Input
                            id="adminName"
                            value={data.adminName}
                            onChange={(e) => updateData('adminName', e.target.value)}
                            placeholder="Enter your full name"
                            className={`h-11 text-sm ${errors.adminName ? 'border-red-500 focus:border-red-500' : 'focus:border-[#00437f]'}`}
                          />
                          {errors.adminName && (
                            <p className="text-red-500 text-xs mt-1">{errors.adminName}</p>
                          )}
                          <p className="text-gray-500 text-xs mt-1">
                            Your full name for the administrator account
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="adminEmail" className="text-sm font-semibold text-gray-900">Email Address *</Label>
                          <Input
                            id="adminEmail"
                            type="email"
                            value={data.adminEmail}
                            onChange={(e) => updateData('adminEmail', e.target.value)}
                            placeholder="admin@example.com"
                            className={`h-11 text-sm ${errors.adminEmail ? 'border-red-500 focus:border-red-500' : 'focus:border-[#00437f]'}`}
                          />
                          {errors.adminEmail && (
                            <p className="text-red-500 text-xs mt-1">{errors.adminEmail}</p>
                          )}
                          <p className="text-gray-500 text-xs mt-1">
                            Email address for your administrator account
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="adminPassword" className="text-sm font-semibold text-gray-900">Password *</Label>
                          <Input
                            id="adminPassword"
                            type="password"
                            value={data.adminPassword}
                            onChange={(e) => updateData('adminPassword', e.target.value)}
                            placeholder="Create a strong password"
                            className={`h-11 text-sm ${errors.adminPassword ? 'border-red-500 focus:border-red-500' : 'focus:border-[#00437f]'}`}
                          />
                          {errors.adminPassword && (
                            <p className="text-red-500 text-xs mt-1">{errors.adminPassword}</p>
                          )}
                          <p className="text-gray-500 text-xs mt-1">
                            Must be at least 8 characters long
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl shadow-sm"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 text-sm font-bold">!</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-red-800 font-semibold text-sm mb-1">Setup Error</h4>
                        <p className="text-red-700 text-sm leading-relaxed">{errors.general}</p>
                        {errors.general.includes('already completed') && (
                          <div className="mt-3 pt-3 border-t border-red-200">
                            <p className="text-red-600 text-xs mb-2">
                              💡 Tip: If setup was already completed, you can try logging in directly.
                            </p>
                                                         <button
                               onClick={() => {
                                 setErrors({})
                                 window.location.href = '/admin'
                               }}
                               className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-md transition-colors"
                             >
                               Go to Admin Dashboard
                             </button>
                          </div>
                        )}
                        {!errors.general.includes('already completed') && (
                          <div className="mt-3 pt-3 border-t border-red-200">
                            <button
                              onClick={() => {
                                setErrors({})
                                completeSetup()
                              }}
                              className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-md transition-colors"
                            >
                              Try Again
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-12 pt-8 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center space-x-2 h-11 px-5 text-sm font-medium border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  {currentStep < steps.length ? (
                    <Button
                      onClick={nextStep}
                      className="flex items-center space-x-2 h-11 px-6 text-sm font-medium bg-[#00437f] hover:bg-[#003366] text-white shadow-lg"
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={completeSetup}
                      disabled={loading}
                      className="flex items-center space-x-2 h-11 px-6 text-sm font-medium bg-[#00437f] hover:bg-[#003366] text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
                    >
                      <Sparkles className="w-4 h-4" />
                      Complete Setup
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Step Info */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                  <Zap className="w-4 h-4 text-[#00437f] mr-2" />
                  What's Next?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-300 ${
                        step.id === currentStep
                          ? 'bg-gray-50 border-2 border-[#00437f]/20 shadow-md'
                          : step.id < currentStep
                          ? 'bg-gray-50 border-2 border-gray-300'
                          : 'bg-gray-50 border-2 border-gray-200'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 shadow-sm ${
                          step.id < currentStep
                            ? 'bg-[#00437f] text-white'
                            : step.id === currentStep
                            ? 'bg-[#00437f] text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {step.id < currentStep ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          step.id
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-bold text-xs ${
                          step.id === currentStep ? 'text-[#00437f]' : 'text-gray-900'
                        }`}>
                          {step.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Features Preview */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                  <Star className="w-4 h-4 text-[#00437f] mr-2" />
                  What You'll Get
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shadow-sm">
                      <Store className="w-4 h-4 text-[#00437f]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">Complete E-commerce</h4>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">Products, orders, customers, and inventory management</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shadow-sm">
                      <Settings className="w-4 h-4 text-[#00437f]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">Admin Dashboard</h4>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">Analytics, reports, and comprehensive management tools</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shadow-sm">
                      <Globe className="w-4 h-4 text-[#00437f]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">Custom CMS</h4>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">Pages, banners, content management, and SEO tools</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shadow-sm">
                      <Shield className="w-4 h-4 text-[#00437f]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">Secure & Fast</h4>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">Enterprise-grade security and lightning-fast performance</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 