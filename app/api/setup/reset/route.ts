import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { settings, adminUsers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Reset not allowed in production' },
        { status: 403 }
      )
    }

    // Clear all settings and admin users
    await db.delete(settings)
    await db.delete(adminUsers)
    
    return NextResponse.json({
      success: true,
      message: 'Setup reset successfully'
    })
  } catch (error) {
    console.error('Setup reset error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to reset setup' },
      { status: 500 }
    )
  }
} 