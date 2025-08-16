import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { dataUpdater } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { updateType, status, message } = body // updateType: 'manual' | 'auto'

    // Get current config with id = 1 to match the get endpoint
    const currentConfig = await db
      .select()
      .from(dataUpdater)
      .where(eq(dataUpdater.id, 1))
      .limit(1)
    
    if (currentConfig.length === 0) {
      return NextResponse.json(
        { error: 'No configuration found with id = 1' },
        { status: 404 }
      )
    }

    const updateData: any = {
      lastUpdateStatus: status || 'success',
      lastUpdateMessage: message || null,
      updatedAt: new Date()
    }

    // Update appropriate timestamp based on update type
    if (updateType === 'manual') {
      updateData.lastManualUpdate = new Date()
    } else if (updateType === 'auto') {
      updateData.lastAutoUpdate = new Date()
    }

    const updatedConfig = await db.update(dataUpdater)
      .set(updateData)
      .where(eq(dataUpdater.id, currentConfig[0].id))
      .returning()

    return NextResponse.json({
      success: true,
      data: updatedConfig[0],
      message: `${updateType} update timestamp recorded`
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update timestamps' },
      { status: 500 }
    )
  }
} 