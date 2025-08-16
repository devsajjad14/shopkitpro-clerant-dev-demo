'use client'

import { Badge } from '@/components/ui/badge'
import { Server, Cloud } from 'lucide-react'
import useSettingStore from '@/hooks/use-setting-store'

export function PlatformIndicator() {
  const platform = useSettingStore((state) => state.getPlatform())
  const settings = useSettingStore((state) => state.settings)
  
  const isVercel = platform === 'vercel'
  
  return (
    <div className="flex items-center space-x-2">
      {isVercel ? (
        <>
          <Cloud className="w-4 h-4 text-blue-600" />
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Vercel Platform
          </Badge>
        </>
      ) : (
        <>
          <Server className="w-4 h-4 text-green-600" />
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Server Hosting
          </Badge>
        </>
      )}
    </div>
  )
}

// Hook for easy platform checking in other components
export function usePlatform() {
  const getPlatform = useSettingStore((state) => state.getPlatform)
  return getPlatform()
}

// Helper functions for conditional rendering based on platform
export const isPlatform = {
  server: () => useSettingStore.getState().getPlatform() === 'server',
  vercel: () => useSettingStore.getState().getPlatform() === 'vercel',
}