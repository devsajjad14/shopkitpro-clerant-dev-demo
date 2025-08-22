export type SyncDirection = 'upload' | 'download' | null
export type SyncStatus = 'idle' | 'analyzing' | 'syncing' | 'complete' | 'error'

export interface SyncProgress {
  current: number
  total: number
  currentFile?: string
  phase?: string
  uploaded?: number
  downloaded?: number
  skipped?: number
  action?: 'uploading' | 'downloading' | 'skipped'
  reason?: string
}

export interface SyncStats {
  localFiles: number
  vercelFiles: number
  toUpload: number
  toDownload: number
}

export interface CompletionData {
  totalFiles: number
  skippedFiles?: number
  processedFiles?: number
}

export interface SyncState {
  direction: SyncDirection
  status: SyncStatus
  progress: SyncProgress
  stats: SyncStats | null
  completionData: CompletionData | null
}

export type SyncAction = 
  | { type: 'SET_DIRECTION'; payload: SyncDirection }
  | { type: 'SET_STATUS'; payload: SyncStatus }
  | { type: 'SET_PROGRESS'; payload: SyncProgress }
  | { type: 'SET_STATS'; payload: SyncStats }
  | { type: 'SET_COMPLETION'; payload: CompletionData }
  | { type: 'RESET' }