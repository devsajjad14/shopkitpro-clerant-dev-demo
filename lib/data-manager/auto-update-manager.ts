import { db } from '@/lib/db'
import { dataUpdater } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Global lock to prevent concurrent auto updates with timestamp
let isAutoUpdateRunning = false
let lastUpdateStartTime = 0
let currentUpdateProcess: Promise<any> | null = null

// Server startup time for cooldown protection
const SERVER_START_TIME = Date.now()
const STARTUP_COOLDOWN_MS = 60 * 60 * 1000 // 1 hour cooldown after server start

// Rate limiting to prevent excessive API calls
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL_MS = 10 * 1000 // 10 seconds between requests

export interface UpdateConfig {
  autoUpdateEnabled: boolean
  updateIntervalMinutes: number
  lastAutoUpdate?: Date
}

export interface UpdateResponse {
  success: boolean
  message: string
  skipped?: boolean
  rateLimited?: boolean
  cooldownRemaining?: number
  serverStartupCooldown?: boolean
  nextAllowedRequest?: number
  error?: string
}

export function checkRateLimit(): { blocked: boolean, response?: UpdateResponse } {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
    return {
      blocked: true,
      response: {
        success: true,
        message: 'Request too frequent - blocked',
        skipped: true,
        rateLimited: true,
        nextAllowedRequest: lastRequestTime + MIN_REQUEST_INTERVAL_MS
      }
    }
  }
  
  lastRequestTime = now
  return { blocked: false }
}

export function checkStartupCooldown(): { blocked: boolean, response?: UpdateResponse } {
  const now = Date.now()
  const timeSinceServerStart = now - SERVER_START_TIME
  
  if (timeSinceServerStart < STARTUP_COOLDOWN_MS) {
    const minutesUntilCooldownEnd = Math.ceil((STARTUP_COOLDOWN_MS - timeSinceServerStart) / (60 * 1000))
    
    if (minutesUntilCooldownEnd % 5 === 0 || minutesUntilCooldownEnd <= 5) {
      console.log(`❄️ Auto Update: Server startup cooldown active - ${minutesUntilCooldownEnd} minutes remaining`)
    }
    
    return {
      blocked: true,
      response: {
        success: true,
        message: `Auto update blocked - server startup cooldown (${minutesUntilCooldownEnd} minutes remaining)`,
        skipped: true,
        cooldownRemaining: STARTUP_COOLDOWN_MS - timeSinceServerStart,
        serverStartupCooldown: true
      }
    }
  }
  
  return { blocked: false }
}

export function checkConcurrentUpdate(): { blocked: boolean, response?: UpdateResponse } {
  const now = Date.now()
  
  if (isAutoUpdateRunning || currentUpdateProcess) {
    if (now - lastUpdateStartTime > 10 * 60 * 1000) {
      console.log('⚠️ Auto Update: Long-running update detected, resetting locks')
      isAutoUpdateRunning = false
      currentUpdateProcess = null
      return { blocked: false }
    } else {
      console.log('⏸️ Auto Update: Already running, skipping this cycle')
      return {
        blocked: true,
        response: {
          success: true,
          message: 'Auto update already in progress - skipped',
          skipped: true
        }
      }
    }
  }
  
  return { blocked: false }
}

export function acquireUpdateLock(): void {
  isAutoUpdateRunning = true
  lastUpdateStartTime = Date.now()
  console.log('🔄 Auto Update: Starting background database update...')
}

export function releaseUpdateLock(): void {
  isAutoUpdateRunning = false
  currentUpdateProcess = null
}

export function setCurrentUpdateProcess(process: Promise<any>): void {
  currentUpdateProcess = process
}

export async function getUpdateConfig(): Promise<UpdateConfig | null> {
  const config = await db
    .select()
    .from(dataUpdater)
    .where(eq(dataUpdater.id, 1))
    .limit(1)

  if (config.length === 0 || !config[0].autoUpdateEnabled) {
    console.log('⏸️ Auto Update: Disabled or no config found')
    return null
  }

  return config[0] as UpdateConfig
}

export async function updateErrorStatus(error: any): Promise<void> {
  try {
    await db.update(dataUpdater)
      .set({
        lastUpdateStatus: 'error',
        lastUpdateMessage: error instanceof Error ? error.message : 'Unknown error during auto update',
        updatedAt: new Date()
      })
      .where(eq(dataUpdater.id, 1))
  } catch (updateError) {
    console.error('❌ Failed to update error status:', updateError)
  }
}