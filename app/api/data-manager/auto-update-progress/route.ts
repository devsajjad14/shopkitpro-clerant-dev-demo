import { NextResponse } from 'next/server'

// Global progress tracking for auto-update with completed stats
let autoUpdateProgress = {
  isRunning: false,
  phase: 'idle' as 'idle' | 'deleting' | 'inserting' | 'complete',
  currentTable: null as string | null,
  tablesCompleted: 0,
  totalTables: 0,
  recordsProcessed: 0,
  startTime: null as number | null,
  lastUpdate: Date.now(),
  // Final completion stats
  completedStats: {
    totalRecordsDeleted: 0,
    totalRecordsInserted: 0,
    totalTablesProcessed: 0,
    completedAt: null as number | null
  }
}

// Export functions to update progress from auto-update route
export function updateAutoUpdateProgress(updates: Partial<typeof autoUpdateProgress>) {
  autoUpdateProgress = { ...autoUpdateProgress, ...updates, lastUpdate: Date.now() }
}

export function setAutoUpdateCompleted(stats: {
  totalRecordsDeleted: number
  totalRecordsInserted: number  
  totalTablesProcessed: number
}) {
  autoUpdateProgress = {
    ...autoUpdateProgress,
    phase: 'complete',
    currentTable: null,
    isRunning: false,
    lastUpdate: Date.now(),
    completedStats: {
      ...stats,
      completedAt: Date.now()
    }
  }
}

export function resetAutoUpdateProgress() {
  autoUpdateProgress = {
    isRunning: false,
    phase: 'idle',
    currentTable: null,
    tablesCompleted: 0,
    totalTables: 0,
    recordsProcessed: 0,
    startTime: null,
    lastUpdate: Date.now(),
    completedStats: {
      totalRecordsDeleted: 0,
      totalRecordsInserted: 0,
      totalTablesProcessed: 0,
      completedAt: null
    }
  }
}

export async function GET() {
  try {
    // Calculate progress percentage
    const progressPercent = autoUpdateProgress.totalTables > 0 
      ? Math.round((autoUpdateProgress.tablesCompleted / autoUpdateProgress.totalTables) * 100)
      : 0

    // Calculate elapsed time
    const elapsedTime = autoUpdateProgress.startTime 
      ? Date.now() - autoUpdateProgress.startTime
      : 0

    return NextResponse.json({
      success: true,
      progress: {
        ...autoUpdateProgress,
        progressPercent,
        elapsedTime: Math.round(elapsedTime / 1000), // in seconds
        estimatedTimeRemaining: autoUpdateProgress.totalTables > 0 && autoUpdateProgress.tablesCompleted > 0
          ? Math.round((elapsedTime / autoUpdateProgress.tablesCompleted) * (autoUpdateProgress.totalTables - autoUpdateProgress.tablesCompleted) / 1000)
          : null
      }
    })
  } catch (error) {
    console.error('Error getting auto-update progress:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}