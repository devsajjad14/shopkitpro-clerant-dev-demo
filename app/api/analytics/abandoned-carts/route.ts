import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cartSessions, cartAbandonmentToggle, campaignEmails, cartsRecovered } from '@/lib/db/schema'
import { eq, and, gte, lte, desc, count, max, lt, isNull } from 'drizzle-orm'

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
    const limit = parseInt(searchParams.get('limit') || '50')
    
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

    // Get abandoned carts (now including newly marked ones)
    const abandonedCarts = await db
      .select({
        id: cartSessions.id,
        sessionId: cartSessions.sessionId,
        customerEmail: cartSessions.customerEmail,
        customerName: cartSessions.customerName,
        totalAmount: cartSessions.totalAmount,
        itemCount: cartSessions.itemCount,
        abandonedAt: cartSessions.abandonedAt,
        device: cartSessions.device,
        browser: cartSessions.browser,
        source: cartSessions.source,
        createdAt: cartSessions.createdAt,
      })
      .from(cartSessions)
      .where(
        and(
          gte(cartSessions.createdAt, startDate),
          eq(cartSessions.status, 'abandoned')
        )
      )
      .orderBy(desc(cartSessions.abandonedAt))
      .limit(limit)

    // For each cart, get real emailsSent, lastEmailSent, and recovery status
    const cartsWithEmailInfo = await Promise.all(abandonedCarts.map(async cart => {
      // Count emails sent
      const sent = await db.select({ count: count() }).from(campaignEmails).where(
        eq(campaignEmails.sessionId, cart.sessionId)
      )
      const emailsSent = sent[0]?.count ? Number(sent[0].count) : 0
      // Get last sent date
      const lastSent = await db.select({ last: max(campaignEmails.sentAt) }).from(campaignEmails).where(
        eq(campaignEmails.sessionId, cart.sessionId)
      )
      const lastEmailSent = lastSent[0]?.last || null
      
      // Check if cart has been recovered
      const recoveryCheck = await db.select().from(cartsRecovered).where(
        eq(cartsRecovered.abandonedCartId, cart.id)
      ).limit(1)
      const recovered = recoveryCheck.length > 0
      
      return {
        ...cart,
        emailsSent,
        lastEmailSent,
        recovered,
        totalAmount: parseFloat(cart.totalAmount || '0'),
        itemCount: cart.itemCount || 0,
      }
    }))

    return NextResponse.json({
      success: true,
      carts: cartsWithEmailInfo,
      total: cartsWithEmailInfo.length,
      timeRange: `${days} days`
    })

  } catch (error) {
    console.error('Failed to fetch abandoned carts:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 