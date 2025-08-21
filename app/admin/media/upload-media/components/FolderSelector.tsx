'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FiCheck } from 'react-icons/fi'
import type { UploadFolder } from '../types'

interface FolderSelectorProps {
  folders: UploadFolder[]
  selectedFolder: UploadFolder | null
  onFolderSelect: (folder: UploadFolder) => void
  disabled?: boolean
}

export default function FolderSelector({ 
  folders, 
  selectedFolder, 
  onFolderSelect, 
  disabled = false 
}: FolderSelectorProps) {
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {folders.map((folder) => (
          <motion.button
            key={folder.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onFolderSelect(folder)}
            className={`relative p-3 rounded-lg border text-left transition-all ${
              selectedFolder?.id === folder.id
                ? 'border-[#00437f] bg-[#00437f]/5'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{folder.icon}</span>
              <span className={`text-sm font-medium ${
                selectedFolder?.id === folder.id ? 'text-[#00437f]' : 'text-gray-900'
              }`}>
                {folder.name}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-2">{folder.description}</p>
            <div className="text-xs text-gray-400 font-mono">/{folder.path}</div>
            
            {selectedFolder?.id === folder.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-5 h-5 bg-[#00437f] rounded-full flex items-center justify-center"
              >
                <FiCheck className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {selectedFolder && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-center gap-2 text-sm">
            <FiCheck className="w-4 h-4 text-green-600" />
            <span className="text-green-800">
              Destination set to <strong>{selectedFolder.name}</strong>
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}