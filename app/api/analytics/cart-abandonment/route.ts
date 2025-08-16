import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cartSessions, cartEvents, cartAbandonmentToggle, cartsRecovered } from '@/lib/db/schema'
import { eq, and, gte, sql, count, sum, lt } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    // Check if cart abandonment is enabled
    const toggleResult = await db.select().from(cartAbandonmentToggle).limit(1)
    if (toggleResult.length === 0 || !toggleResult[0].isEnabled) {
      return NextResponse.json({
        success: false,
        error: 'Cart abandonment tracking is disabled'
      }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)


    // EXPERT: Mark carts as abandoned based on updatedAt (24 hours for production)
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    // First, mark active carts as abandoned if they haven't been updated in 24 hours
    await db
      .update(cartSessions)
      .set({
        status: 'abandoned',
        abandonedAt: now
      })
      .where(
        and(
          eq(cartSessions.status, 'active'),
          lt(cartSessions.updatedAt, oneDayAgo)
        )
      )

    // Get total sessions with debugging
    const totalSessionsResult = await db
      .select({ count: count() })
      .from(cartSessions)
      .where(gte(cartSessions.createdAt, startDate))
    const totalSessions = totalSessionsResult[0]?.count || 0

    // Get abandoned sessions
    const abandonedSessionsResult = await db
      .select({ count: count() })
      .from(cartSessions)
      .where(
        and(
          gte(cartSessions.createdAt, startDate),
          eq(cartSessions.status, 'abandoned')
        )
      )
    const abandonedSessions = abandonedSessionsResult[0]?.count || 0

    // Get completed sessions
    const completedSessionsResult = await db
      .select({ count: count() })
      .from(cartSessions)
      .where(
        and(
          gte(cartSessions.createdAt, startDate),
          eq(cartSessions.status, 'completed')
        )
      )
    const completedSessions = completedSessionsResult[0]?.count || 0

    // Get active sessions
    const activeSessionsResult = await db
      .select({ count: count() })
      .from(cartSessions)
      .where(
        and(
          gte(cartSessions.createdAt, startDate),
          eq(cartSessions.status, 'active')
        )
      )
    const activeSessions = activeSessionsResult[0]?.count || 0

    // Calculate abandonment rate
    const abandonmentRate = totalSessions > 0 ? (abandonedSessions / totalSessions) * 100 : 0

    // Get total revenue from completed sessions
    const totalRevenueResult = await db
      .select({ total: sum(cartSessions.totalAmount) })
      .from(cartSessions)
      .where(
        and(
          gte(cartSessions.createdAt, startDate),
          eq(cartSessions.status, 'completed')
        )
      )
    const totalRevenue = parseFloat(totalRevenueResult[0]?.total || '0')

    // Get lost revenue from abandoned sessions
    const lostRevenueResult = await db
      .select({ total: sum(cartSessions.totalAmount) })
      .from(cartSessions)
      .where(
        and(
          gte(cartSessions.createdAt, startDate),
          eq(cartSessions.status, 'abandoned')
        )
      )
    const lostRevenue = parseFloat(lostRevenueResult[0]?.total || '0')

    // Calculate average order value
    const averageOrderValue = completedSessions > 0 ? totalRevenue / completedSessions : 0

    // Get recovery rate from carts_recovered table
    const recoveredSessionsResult = await db
      .select({ count: count() })
      .from(cartsRecovered)
      .where(gte(cartsRecovered.recoveredAt, startDate))
    const recoveredSessions = recoveredSessionsResult[0]?.count || 0
    const recoveryRate = abandonedSessions > 0 ? (recoveredSessions / abandonedSessions) * 100 : 0

    // Get email campaign stats (placeholder - will be implemented in Phase 5)
    const emailsSent = 0
    const emailsOpened = 0
    const emailsClicked = 0

    // --- Real Abandonment Trend (per day) ---
    let abandonmentTrend: { day: string, totalSessions: number, abandonedSessions: number, completedSessions: number }[] = []
    
    // Generate array of last 7 days (including today)
    const last7Days: string[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      // Set time to start of day to ensure proper comparison
      date.setHours(0, 0, 0, 0)
      last7Days.push(date.toISOString().split('T')[0])
    }
    
    
    // Get actual data from database using the same approach as test endpoint
    const trendResult = await db.execute(`
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
    
    
    // Create a map of actual data
    const dataMap = new Map()
    if (trendResult && Array.isArray(trendResult.rows)) {
      trendResult.rows.forEach((row: any) => {
        const dayKey = row.day.split(' ')[0] // Extract just the date part
        dataMap.set(dayKey, {
          abandoned: Number(row.abandoned),
          completed: Number(row.completed),
          total: Number(row.total)
        })
      })
    }
    
    
    // Build abandonment trend with all 7 days
    abandonmentTrend = last7Days.map(day => {
      const data = dataMap.get(day)
      if (data) {
        return {
          day,
          totalSessions: data.total,
          abandonedSessions: data.abandoned,
          completedSessions: data.completed
        }
      } else {
        return {
          day,
          totalSessions: 0,
          abandonedSessions: 0,
          completedSessions: 0
        }
      }
    })
    

    // --- Real Device Breakdown ---
    let deviceBreakdown: Record<string, number> = {}
    if (abandonedSessions > 0) {
      const deviceResult = await db.execute(
        sql`
          SELECT
            COALESCE(${cartSessions.device}, 'unknown') AS device,
            COUNT(*) AS count
          FROM ${cartSessions}
          WHERE ${cartSessions.createdAt} >= ${startDate}
            AND ${cartSessions.status} = 'abandoned'
          GROUP BY device
        `
      )
      if (Array.isArray(deviceResult) && deviceResult.length > 0) {
        for (const row of deviceResult) {
          deviceBreakdown[row.device] = Number(row.count)
        }
      } else {
        // If no device data but there is at least one abandoned cart, add 'unknown': 1
        deviceBreakdown = { unknown: 1 }
      }
    }

    // --- Daily Revenue Data ---
    const dailyRevenueResult = await db.execute(
      sql`
        SELECT
          DATE_TRUNC('day', ${cartSessions.createdAt}) AS day,
          SUM(${cartSessions.totalAmount}) AS revenue
        FROM ${cartSessions}
        WHERE ${cartSessions.createdAt} >= ${startDate}
          AND ${cartSessions.status} = 'completed'
        GROUP BY day
        ORDER BY day ASC
      `
    )
    
    // Create a map of daily revenue
    const revenueMap = new Map()
    if (Array.isArray(dailyRevenueResult)) {
      dailyRevenueResult.forEach((row: any) => {
        const dayKey = row.day.toISOString().split('T')[0]
        revenueMap.set(dayKey, Number(row.revenue))
      })
    }
    
    // Build daily revenue array for last 7 days
    const dailyRevenue = last7Days.map(day => {
      return revenueMap.get(day) || 0
    })

    const analytics = {
      totalSessions,
      abandonedSessions,
      completedSessions,
      activeSessions,
      abandonmentRate,
      totalRevenue,
      lostRevenue,
      averageOrderValue,
      recoveryRate,
      emailsSent,
      emailsOpened,
      emailsClicked,
      abandonmentTrend,
      deviceBreakdown,
      dailyRevenue,
    }

    return NextResponse.json({
      success: true,
      analytics,
      timeRange: `${days} days`
    })

  } catch (error) {
    console.error('Failed to fetch cart abandonment analytics:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 