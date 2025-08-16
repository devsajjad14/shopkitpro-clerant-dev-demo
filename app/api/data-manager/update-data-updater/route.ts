import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { dataUpdater } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('POST /api/data-manager/update-data-updater called with body:', body)
    
    const {
      selectedDataSource,
      autoUpdateEnabled,
      updateIntervalMinutes,
      fileCount,
      lastManualUpdate,
      lastUpdateStatus,
      lastUpdateMessage
    } = body
    
    // Validate required fields
    if (selectedDataSource === undefined || autoUpdateEnabled === undefined || updateIntervalMinutes === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['selectedDataSource', 'autoUpdateEnabled', 'updateIntervalMinutes']
        },
        { status: 400 }
      )
    }
    
    // Check if record with id = 1 exists
    const existingRecord = await db.select().from(dataUpdater).where(eq(dataUpdater.id, 1)).limit(1)
    
    if (existingRecord.length > 0) {
      // Update existing record
      console.log('Updating existing record with id = 1')
      const updateData = {
        selectedDataSource,
        autoUpdateEnabled,
        updateIntervalMinutes,
        fileCount: fileCount || existingRecord[0].fileCount,
        lastManualUpdate: lastManualUpdate ? new Date(lastManualUpdate) : existingRecord[0].lastManualUpdate,
        lastUpdateStatus: lastUpdateStatus || existingRecord[0].lastUpdateStatus,
        lastUpdateMessage: lastUpdateMessage || existingRecord[0].lastUpdateMessage,
        databaseStatus: 'ready',
        updatedAt: new Date()
      }
      
      await db.update(dataUpdater)
        .set(updateData)
        .where(eq(dataUpdater.id, 1))
      
      console.log('Successfully updated existing record')
    } else {
      // Insert new record with id = 1
      console.log('Creating new record with id = 1')
      const insertData = {
        id: 1,
        selectedDataSource,
        autoUpdateEnabled,
        updateIntervalMinutes,
        fileCount: fileCount || 0,
        lastManualUpdate: lastManualUpdate ? new Date(lastManualUpdate) : undefined,
        lastUpdateStatus: lastUpdateStatus || 'idle',
        lastUpdateMessage: lastUpdateMessage || undefined,
        databaseStatus: 'ready',
        updatedAt: new Date()
      }
      
      await db.insert(dataUpdater).values(insertData)
      console.log('Successfully created new record with id = 1')
    }
    
    return NextResponse.json({
      success: true,
      message: 'Data updater settings updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating data updater settings:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update data updater settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
