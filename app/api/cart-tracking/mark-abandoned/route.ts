import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cartSessions } from '@/lib/db/schema'
import { eq, and, lt } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    // Mark active sessions older than 24 hours as abandoned (for production)
    // Change to 30 minutes for testing if needed
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    // const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000)

    const result = await db
      .update(cartSessions)
      .set({
        status: 'abandoned',
        abandonedAt: now
      })
      .where(
        and(
          eq(cartSessions.status, 'active'),
          lt(cartSessions.updatedAt, oneDayAgo) // Change to thirtyMinutesAgo for testing
        )
      )

    return NextResponse.json({
      success: true,
      message: 'Abandoned carts marked successfully'
    })

  } catch (error) {
    console.error('Failed to mark abandoned carts:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 