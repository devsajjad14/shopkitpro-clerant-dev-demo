import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cartSessions } from '@/lib/db/schema'
import { gte, eq } from 'drizzle-orm'

export async function GET() {
  try {
    // Get all sessions
    const allSessions = await db
      .select()
      .from(cartSessions)
      .orderBy(cartSessions.createdAt)

    // Calculate start date (7 days ago)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)
    startDate.setHours(0, 0, 0, 0)

    // Get sessions from last 7 days
    const recentSessions = await db
      .select()
      .from(cartSessions)
      .where(gte(cartSessions.createdAt, startDate))
      .orderBy(cartSessions.createdAt)

    // Test raw SQL query
    const rawResult = await db.execute(`
      SELECT
        DATE_TRUNC('day', created_at) AS day,
        COUNT(*) FILTER (WHERE status = 'abandoned') AS abandoned,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed,
        COUNT(*) AS total
      FROM cart_sessions
      WHERE created_at >= '${startDate.toISOString()}'
      GROUP BY day
      ORDER BY day ASC
    `)

    return NextResponse.json({
      success: true,
      debug: {
        startDate: startDate.toISOString(),
        totalSessions: allSessions.length,
        recentSessionsCount: recentSessions.length,
        allSessions: allSessions.map(s => ({
          id: s.id,
          createdAt: s.createdAt,
          status: s.status,
          totalAmount: s.totalAmount
        })),
        recentSessions: recentSessions.map(s => ({
          id: s.id,
          createdAt: s.createdAt,
          status: s.status,
          totalAmount: s.totalAmount
        })),
        rawSqlResult: rawResult
      }
    })
  } catch (error) {
    console.error('Test API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 