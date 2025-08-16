'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FiTrash2, FiAlertTriangle, FiX, FiCheck } from 'react-icons/fi'
import { useToast } from '@/components/ui/use-toast'

export default function DeleteAllTablesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleDeleteAllTables = async () => {
    setIsDeleting(true)

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
          title: "✅ Tables Deleted Successfully",
          description: `Successfully deleted ${data.deletedTables?.length || 0} tables. Redirecting to setup wizard...`,
          duration: 5000,
        })
        
        // Clear admin auth and any cached data
        localStorage.removeItem('adminAuth')
        localStorage.removeItem('adminUser')
        sessionStorage.clear()
        
        // Force a complete page refresh to clear any cached setup status
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      } else {
        toast({
          title: "❌ Error Deleting Tables",
          description: data.error || 'An unexpected error occurred',
          variant: "destructive",
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Error deleting tables:', error)
      toast({
        title: "❌ Network Error",
        description: "Failed to delete tables. Please check your connection and try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsDeleting(false)
      setShowConfirmation(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Delete All Tables
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Reset the entire application database and return to setup wizard
          </p>
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
        >
          {/* Warning Section */}
          <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-4">
              <FiAlertTriangle className="h-6 w-6 text-red-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                  ⚠️ Critical Action Warning
                </h3>
                <p className="text-red-700 dark:text-red-300 mb-4">
                  This action will permanently delete ALL database tables and reset the entire application. 
                  This cannot be undone.
                </p>
                <div className="bg-red-100 dark:bg-red-900/40 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                    The following data will be permanently deleted:
                  </h4>
                  <ul className="text-red-700 dark:text-red-300 space-y-1 text-sm">
                    <li>• All products and inventory</li>
                    <li>• All orders and transactions</li>
                    <li>• All customer accounts and data</li>
                    <li>• All store settings and configurations</li>
                    <li>• All categories, brands, and attributes</li>
                    <li>• All admin users and permissions</li>
                    <li>• All marketing campaigns and analytics</li>
                    <li>• All CMS content and pages</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="text-center">
            <button
              onClick={() => setShowConfirmation(true)}
              disabled={isDeleting}
              className={`
                inline-flex items-center gap-3 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200
                ${isDeleting 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                }
              `}
            >
              <FiTrash2 className="h-6 w-6" />
              {isDeleting ? 'Deleting...' : 'Delete All Tables'}
            </button>
            
            <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">
              Click the button above to proceed with the deletion process
            </p>
          </div>
        </motion.div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                  <FiAlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Final Confirmation
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you absolutely sure you want to delete all tables? This action cannot be undone.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FiX className="h-4 w-4 inline mr-2" />
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleDeleteAllTables}
                    disabled={isDeleting}
                    className={`
                      flex-1 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center
                      ${isDeleting 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                      }
                    `}
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <FiCheck className="h-4 w-4 mr-2" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
} 