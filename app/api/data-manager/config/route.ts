import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { dataUpdater } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    // Get the current data updater configuration
    const config = await db.select().from(dataUpdater).limit(1)
    
    if (config.length === 0) {
      // Create default configuration if none exists
      const defaultConfig = await db.insert(dataUpdater).values({
        selectedDataSource: 'local',
        autoUpdateEnabled: false,
        updateIntervalMinutes: 60,
        lastUpdateStatus: 'idle',
        fileCount: 0,
        databaseStatus: 'ready'
      }).returning()
      
      return NextResponse.json({
        success: true,
        data: defaultConfig[0]
      })
    }
    
    return NextResponse.json({
      success: true,
      data: config[0]
    })
  } catch (error) {
    console.error('Error fetching data updater config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      selectedDataSource,
      autoUpdateEnabled,
      updateIntervalMinutes,
      lastUpdateStatus,
      lastUpdateMessage,
      fileCount,
      databaseStatus
    } = body

    // Get current config
    const currentConfig = await db.select().from(dataUpdater).limit(1)
    
    if (currentConfig.length === 0) {
      // Create new configuration
      const newConfig = await db.insert(dataUpdater).values({
        selectedDataSource: selectedDataSource || 'local',
        autoUpdateEnabled: autoUpdateEnabled || false,
        updateIntervalMinutes: updateIntervalMinutes || 60,
        lastUpdateStatus: lastUpdateStatus || 'idle',
        lastUpdateMessage: lastUpdateMessage || null,
        fileCount: fileCount || 0,
        databaseStatus: databaseStatus || 'ready'
      }).returning()
      
      return NextResponse.json({
        success: true,
        data: newConfig[0],
        message: 'Configuration created successfully'
      })
    } else {
      // Update existing configuration
      const updatedConfig = await db.update(dataUpdater)
        .set({
          selectedDataSource: selectedDataSource !== undefined ? selectedDataSource : currentConfig[0].selectedDataSource,
          autoUpdateEnabled: autoUpdateEnabled !== undefined ? autoUpdateEnabled : currentConfig[0].autoUpdateEnabled,
          updateIntervalMinutes: updateIntervalMinutes !== undefined ? updateIntervalMinutes : currentConfig[0].updateIntervalMinutes,
          lastUpdateStatus: lastUpdateStatus !== undefined ? lastUpdateStatus : currentConfig[0].lastUpdateStatus,
          lastUpdateMessage: lastUpdateMessage !== undefined ? lastUpdateMessage : currentConfig[0].lastUpdateMessage,
          fileCount: fileCount !== undefined ? fileCount : currentConfig[0].fileCount,
          databaseStatus: databaseStatus !== undefined ? databaseStatus : currentConfig[0].databaseStatus,
          updatedAt: new Date()
        })
        .where(eq(dataUpdater.id, currentConfig[0].id))
        .returning()
      
      return NextResponse.json({
        success: true,
        data: updatedConfig[0],
        message: 'Configuration updated successfully'
      })
    }
  } catch (error) {
    console.error('Error updating data updater config:', error)
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    )
  }
} 