'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { FiEye, FiTrash2, FiDownload, FiExternalLink } from 'react-icons/fi'
import type { FileInfo } from '../../services/directory-service'

interface FileActionsProps {
  file: FileInfo
  onView?: (file: FileInfo) => void
  onDelete?: (file: FileInfo) => void
  showLabels?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'horizontal' | 'vertical'
}

const FileActions = memo(function FileActions({
  file,
  onView,
  onDelete,
  showLabels = false,
  size = 'md',
  variant = 'horizontal'
}: FileActionsProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (file.url) {
      const link = document.createElement('a')
      link.href = file.url
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleExternalView = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (file.url) {
      window.open(file.url, '_blank')
    }
  }

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation()
    onView?.(file)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(file)
  }

  const actions = [
    {
      icon: FiEye,
      onClick: handleView,
      title: 'Preview',
      label: 'View',
      className: 'hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400',
      show: !!onView
    },
    {
      icon: FiDownload,
      onClick: handleDownload,
      title: 'Download',
      label: 'Download',
      className: 'hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400',
      show: !!file.url
    },
    {
      icon: FiExternalLink,
      onClick: handleExternalView,
      title: 'Open in new tab',
      label: 'Open',
      className: 'hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400',
      show: !!file.url
    },
    {
      icon: FiTrash2,
      onClick: handleDelete,
      title: 'Delete',
      label: 'Delete',
      className: 'hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400',
      show: !!onDelete
    }
  ].filter(action => action.show)

  if (variant === 'vertical') {
    return (
      <div className="flex flex-col gap-1">
        {actions.map((action, index) => (
          <motion.button
            key={action.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={action.onClick}
            className={`${buttonSizeClasses[size]} rounded-lg transition-all duration-200 text-gray-500 dark:text-gray-400 ${action.className} group`}
            title={action.title}
          >
            <action.icon className={`${sizeClasses[size]} transition-transform group-hover:scale-110`} />
            {showLabels && (
              <span className="text-xs mt-1 block">{action.label}</span>
            )}
          </motion.button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {actions.map((action, index) => (
        <motion.button
          key={action.title}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className={`${buttonSizeClasses[size]} rounded-lg transition-all duration-200 text-gray-500 dark:text-gray-400 ${action.className} group relative`}
          title={action.title}
        >
          <action.icon className={`${sizeClasses[size]} transition-transform group-hover:scale-110`} />
          
          {showLabels && (
            <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-md whitespace-nowrap">
              {action.label}
            </span>
          )}
        </motion.button>
      ))}
    </div>
  )
})

export default FileActions