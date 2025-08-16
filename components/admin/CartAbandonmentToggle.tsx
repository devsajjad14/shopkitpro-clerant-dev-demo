'use client'

import { useState, useEffect } from 'react'
import { FiShoppingCart, FiZap, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { getCartAbandonmentStatus, toggleCartAbandonment } from '@/lib/actions/cart-abandonment-toggle'

export default function CartAbandonmentToggle() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isToggling, setIsToggling] = useState(false)

  useEffect(() => {
    loadSetting()
  }, [])

  const loadSetting = async () => {
    try {
      const enabled = await getCartAbandonmentStatus()
      setIsEnabled(enabled)
    } catch (error) {
      console.error('Error loading cart abandonment setting:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = async () => {
    if (isToggling) return
    
    setIsToggling(true)
    try {
      const newState = !isEnabled
      const result = await toggleCartAbandonment(newState)
      
      if (result.success) {
        setIsEnabled(newState)
      } else {
        console.error('Failed to toggle setting:', result.error)
      }
    } catch (error) {
      console.error('Error toggling cart abandonment:', error)
    } finally {
      setIsToggling(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${isEnabled ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
            <FiShoppingCart className={`w-5 h-5 ${isEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cart Abandonment Analytics
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track abandoned carts and recover lost sales
            </p>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isEnabled 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {isEnabled ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* Toggle Switch */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <FiZap className="w-4 h-4" />
            <span>Real-time tracking & recovery campaigns</span>
          </div>
        </div>
        
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className={`
            relative inline-flex h-12 w-24 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isEnabled 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 focus:ring-green-500' 
              : 'bg-gray-200 dark:bg-gray-700 focus:ring-gray-500'
            }
            ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}
          `}
        >
          <span
            className={`
              inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-all duration-300 ease-in-out
              ${isEnabled ? 'translate-x-12' : 'translate-x-1'}
            `}
          >
            {isToggling ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                {isEnabled ? (
                  <FiCheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <FiXCircle className="w-4 h-4 text-gray-400" />
                )}
              </div>
            )}
          </span>
        </button>
      </div>

      {/* Features List */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            <span>Real-time cart tracking</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
            <span>Automated recovery emails</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span>Abandonment analytics</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
            <span>Revenue recovery insights</span>
          </div>
        </div>
      </div>
    </div>
  )
} 