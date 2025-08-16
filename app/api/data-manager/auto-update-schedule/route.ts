import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { dataUpdater } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Server startup time for cooldown protection
const SERVER_START_TIME = Date.now()
const STARTUP_COOLDOWN_MS = 60 * 60 * 1000 // 1 hour cooldown after server start

export async function GET() {
  try {
    const now = Date.now()
    
    // Get current config
    const config = await db
      .select()
      .from(dataUpdater)
      .where(eq(dataUpdater.id, 1))
      .limit(1)

    if (config.length === 0 || !config[0].autoUpdateEnabled) {
      return NextResponse.json({
        success: true,
        autoUpdateEnabled: false,
        nextUpdateIn: null,
        shouldPoll: false
      })
    }

    const currentConfig = config[0]
    
    // Check server startup cooldown
    const timeSinceServerStart = now - SERVER_START_TIME
    if (timeSinceServerStart < STARTUP_COOLDOWN_MS) {
      return NextResponse.json({
        success: true,
        autoUpdateEnabled: true,
        serverStartupCooldown: true,
        cooldownRemaining: STARTUP_COOLDOWN_MS - timeSinceServerStart,
        nextUpdateIn: STARTUP_COOLDOWN_MS - timeSinceServerStart,
        shouldPoll: false,
        message: 'Server startup cooldown active'
      })
    }

    // Check if enough time has passed since last auto update
    if (currentConfig.lastAutoUpdate) {
      const lastUpdateTime = new Date(currentConfig.lastAutoUpdate).getTime()
      const intervalMs = currentConfig.updateIntervalMinutes * 60 * 1000
      const timeSinceLastUpdate = now - lastUpdateTime
      const timeUntilNext = intervalMs - timeSinceLastUpdate
      
      // Only log debug info if update is within 24 hours to reduce spam
      if (timeUntilNext < 24 * 60 * 60 * 1000) {
        console.log(`🔍 Schedule Debug: lastUpdate=${new Date(lastUpdateTime).toISOString()}, interval=${currentConfig.updateIntervalMinutes}min, timeSince=${Math.floor(timeSinceLastUpdate/60000)}min, timeUntil=${Math.floor(timeUntilNext/60000)}min`)
      }
      
      if (timeUntilNext > 0) {
        // Calculate when to start polling (5 minutes before next update)
        const pollStartTime = Math.max(timeUntilNext - (5 * 60 * 1000), 60 * 1000) // At least 1 minute from now
        
        return NextResponse.json({
          success: true,
          autoUpdateEnabled: true,
          nextUpdateIn: timeUntilNext,
          shouldPoll: timeUntilNext <= (5 * 60 * 1000), // Only poll in last 5 minutes
          pollStartsIn: pollStartTime,
          lastAutoUpdate: currentConfig.lastAutoUpdate,
          updateIntervalMinutes: currentConfig.updateIntervalMinutes
        })
      }
    } else {
      console.log('🔍 Schedule Debug: No lastAutoUpdate found - should be ready for first update')
    }

    // Ready for update
    return NextResponse.json({
      success: true,
      autoUpdateEnabled: true,
      nextUpdateIn: 0,
      shouldPoll: true,
      readyForUpdate: true,
      updateIntervalMinutes: currentConfig.updateIntervalMinutes
    })

  } catch (error) {
    console.error('Auto Update Schedule: Error checking schedule:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      shouldPoll: false
    }, { status: 500 })
  }
}