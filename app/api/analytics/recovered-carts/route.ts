import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cartSessions, cartsRecovered } from '@/lib/db/schema'
import { eq, and, gte, lte, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get recovered carts with joined data from original abandoned cart
    const recoveredCarts = await db
      .select({
        id: cartsRecovered.id,
        abandonedCartId: cartsRecovered.abandonedCartId,
        recoverySessionId: cartsRecovered.recoverySessionId,
        customerEmail: cartsRecovered.customerEmail,
        customerName: cartsRecovered.customerName,
        recoveryAmount: cartsRecovered.recoveryAmount,
        itemCount: cartsRecovered.itemCount,
        recoveredAt: cartsRecovered.recoveredAt,
        timeToRecoveryHours: cartsRecovered.timeToRecoveryHours,
        // Original cart data
        originalTotalAmount: cartSessions.totalAmount,
        originalItemCount: cartSessions.itemCount,
        abandonedAt: cartSessions.abandonedAt,
        createdAt: cartSessions.createdAt,
      })
      .from(cartsRecovered)
      .leftJoin(cartSessions, eq(cartsRecovered.abandonedCartId, cartSessions.id))
      .where(
        and(
          gte(cartsRecovered.recoveredAt, startDate)
        )
      )
      .orderBy(desc(cartsRecovered.recoveredAt))
      .limit(limit)

    const formattedCarts = recoveredCarts.map(cart => ({
      ...cart,
      recoveryAmount: parseFloat(cart.recoveryAmount?.toString() || '0'),
      originalTotalAmount: parseFloat(cart.originalTotalAmount?.toString() || '0'),
      timeToRecoveryHours: parseFloat(cart.timeToRecoveryHours?.toString() || '0'),
      itemCount: cart.itemCount || 0,
      originalItemCount: cart.originalItemCount || 0,
    }))

    return NextResponse.json({
      success: true,
      carts: formattedCarts,
      total: formattedCarts.length,
      timeRange: `${days} days`
    })

  } catch (error) {
    console.error('Failed to fetch recovered carts:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 