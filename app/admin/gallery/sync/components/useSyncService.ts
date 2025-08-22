import { useCallback } from 'react'
import { toast } from 'sonner'
import type { SyncDirection, SyncAction } from './types'

export const useSyncService = () => {
  const startSync = useCallback(async (
    direction: SyncDirection,
    dispatch: React.Dispatch<SyncAction>
  ) => {
    if (!direction) return

    dispatch({ type: 'SET_DIRECTION', payload: direction })
    dispatch({ type: 'SET_STATUS', payload: 'analyzing' })
    dispatch({ type: 'SET_PROGRESS', payload: { current: 0, total: 0 } })
    
    const actionText = direction === 'upload' ? 'Local Media → Vercel Blob' : 'Vercel Blob → Local Media'
    toast.loading(`${actionText}...`, { id: 'sync-media' })

    try {
      const endpoint = direction === 'upload' 
        ? '/api/admin/media/upload-to-vercel'
        : '/api/admin/media/download-from-vercel'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      dispatch({ type: 'SET_STATUS', payload: 'syncing' })
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      
      if (!reader) {
        throw new Error('No response body')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line)
              
              if (data.type === 'progress') {
                dispatch({ 
                  type: 'SET_PROGRESS', 
                  payload: {
                    current: data.current,
                    total: data.total,
                    currentFile: data.currentFile,
                    phase: data.phase,
                    uploaded: data.uploaded,
                    downloaded: data.downloaded,
                    skipped: data.skipped,
                    action: data.action,
                    reason: data.reason
                  }
                })
              } else if (data.type === 'stats') {
                dispatch({ type: 'SET_STATS', payload: data.stats })
              } else if (data.type === 'complete') {
                dispatch({ type: 'SET_STATUS', payload: 'complete' })
                dispatch({ 
                  type: 'SET_COMPLETION', 
                  payload: {
                    totalFiles: data.totalFiles || 0,
                    skippedFiles: data.skippedFiles || 0,
                    processedFiles: data.processedFiles || 0
                  }
                })
                const skipMessage = data.skippedFiles > 0 ? `, ${data.skippedFiles} skipped` : ''
                toast.success(`✅ ${actionText} completed! ${data.totalFiles} files processed${skipMessage}`, {
                  id: 'sync-media',
                  duration: 5000
                })
              } else if (data.type === 'error') {
                throw new Error(data.message)
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }

    } catch (error) {
      console.error('❌ Sync failed:', error)
      dispatch({ type: 'SET_STATUS', payload: 'error' })
      toast.error(`Failed to sync: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        id: 'sync-media',
        duration: 5000
      })
    }
  }, [])

  return { startSync }
}