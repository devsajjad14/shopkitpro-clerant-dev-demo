import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { clearSetupStatusCache } from '@/lib/utils/setup-check'

export async function POST(request: NextRequest) {
  try {
    // Clear all caches first
    clearSetupStatusCache()
    
    // Force a fresh database check
    const result = await db.execute(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'settings'
      ) as table_exists
    `)

    const tableExists = result.rows[0]?.table_exists

    if (!tableExists) {
      return NextResponse.json({
        success: true,
        isSetup: false,
        message: 'Settings table does not exist - setup required'
      })
    }

    // Check if settings table has any data
    const settingsResult = await db.execute(`
      SELECT COUNT(*) as count FROM settings
    `)

    const hasSettings = settingsResult.rows[0]?.count > 0

    return NextResponse.json({
      success: true,
      isSetup: hasSettings,
      message: hasSettings ? 'Setup is complete' : 'Setup required - no settings data found'
    })
  } catch (error) {
    console.error('Force setup check error:', error)
    return NextResponse.json({
      success: false,
      isSetup: false,
      error: 'Failed to check setup status'
    }, { status: 500 })
  }
} 