import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cartSessions, cartEvents, cartsRecovered, campaignEmails } from '@/lib/db/schema'
import { eq, and, gte, lte, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    // Get recovery statistics from carts_recovered table
    const recoveryStats = await db
      .select({
        totalRecovered: sql<number>`COUNT(*)::int`,
        totalRecoveryAmount: sql<number>`COALESCE(SUM(CAST(recovery_amount AS DECIMAL)), 0)::decimal`,
        avgRecoveryAmount: sql<number>`COALESCE(AVG(CAST(recovery_amount AS DECIMAL)), 0)::decimal`,
        avgTimeToRecovery: sql<number>`COALESCE(AVG(CAST(time_to_recovery_hours AS DECIMAL)), 0)::decimal`,
      })
      .from(cartsRecovered)
      .where(
        and(
          gte(cartsRecovered.recoveredAt, startDate),
          lte(cartsRecovered.recoveredAt, endDate)
        )
      )

    // Get total abandoned carts in the same period
    const abandonedStats = await db
      .select({
        totalAbandoned: sql<number>`COUNT(*)::int`,
      })
      .from(cartSessions)
      .where(
        and(
          eq(cartSessions.status, 'abandoned'),
          gte(cartSessions.abandonedAt!, startDate),
          lte(cartSessions.abandonedAt!, endDate)
        )
      )

    // Calculate recovery rate
    const totalAbandoned = abandonedStats[0]?.totalAbandoned || 0
    const totalRecovered = recoveryStats[0]?.totalRecovered || 0
    const recoveryRate = totalAbandoned > 0 ? (totalRecovered / totalAbandoned) * 100 : 0

    // Get email stats from campaign_emails table
    const emailStats = await db
      .select({
        totalEmailsSent: sql<number>`COUNT(*)::int`,
      })
      .from(campaignEmails)
      .where(
        and(
          eq(campaignEmails.status, 'sent'),
          gte(campaignEmails.sentAt!, startDate),
          lte(campaignEmails.sentAt!, endDate)
        )
      )

    const totalEmailsSent = emailStats[0]?.totalEmailsSent || 0

    // Get recent recoveries (last 10) with joined data
    const recentRecoveries = await db
      .select({
        id: cartsRecovered.id,
        customerName: cartsRecovered.customerName,
        customerEmail: cartsRecovered.customerEmail,
        recoveryAmount: cartsRecovered.recoveryAmount,
        itemCount: cartsRecovered.itemCount,
        abandonedAt: cartSessions.abandonedAt,
        recoveredAt: cartsRecovered.recoveredAt,
        timeToRecoveryHours: cartsRecovered.timeToRecoveryHours,
        originalCartId: cartsRecovered.abandonedCartId,
      })
      .from(cartsRecovered)
      .leftJoin(cartSessions, eq(cartsRecovered.abandonedCartId, cartSessions.id))
      .where(
        and(
          gte(cartsRecovered.recoveredAt, startDate),
          lte(cartsRecovered.recoveredAt, endDate)
        )
      )
      .orderBy(cartsRecovered.recoveredAt)
      .limit(10)

    return NextResponse.json({
      success: true,
      data: {
        recoveryRate: Math.round(recoveryRate * 100) / 100, // Round to 2 decimal places
        totalRecovered,
        totalAbandoned,
        totalRecoveryAmount: parseFloat(recoveryStats[0]?.totalRecoveryAmount?.toString() || '0'),
        avgRecoveryAmount: parseFloat(recoveryStats[0]?.avgRecoveryAmount?.toString() || '0'),
        avgTimeToRecovery: parseFloat(recoveryStats[0]?.avgTimeToRecovery?.toString() || '0'),
        emailMetrics: {
          totalSent: totalEmailsSent,
          totalOpened: 0, // Not tracking opens for individual sends
          totalClicked: 0, // Not tracking clicks for individual sends
          openRate: 0,
          clickRate: 0,
        },
        recentRecoveries: recentRecoveries.map(recovery => ({
          ...recovery,
          recoveryAmount: parseFloat(recovery.recoveryAmount?.toString() || '0'),
          timeToRecoveryHours: parseFloat(recovery.timeToRecoveryHours?.toString() || '0')
        }))
      }
    })

  } catch (error) {
    console.error('Error fetching recovery stats:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 