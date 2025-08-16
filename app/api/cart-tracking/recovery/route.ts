import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cartSessions, cartEvents, cartsRecovered } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { CartTrackingService } from '@/lib/services/cart-tracking-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, userId, email, name, cartData, recoveryCartId, recoveryEmail } = body

    // Validate required fields
    if (!sessionId || !recoveryCartId || !recoveryEmail) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: sessionId, recoveryCartId, recoveryEmail'
      }, { status: 400 })
    }

    // Check if this is actually a recovery (cartId should exist and have been abandoned)
    const abandonedCart = await db
      .select()
      .from(cartSessions)
      .where(eq(cartSessions.id, recoveryCartId))
      .limit(1)

    if (abandonedCart.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Recovery cart not found'
      }, { status: 404 })
    }

    const originalSession = abandonedCart[0]

    // Verify the email matches
    if (originalSession.customerEmail !== recoveryEmail) {
      return NextResponse.json({
        success: false,
        error: 'Email mismatch for recovery'
      }, { status: 400 })
    }

    // Check if this cart was abandoned (has abandoned_at timestamp)
    if (!originalSession.abandonedAt) {
      return NextResponse.json({
        success: false,
        error: 'Cart was not abandoned'
      }, { status: 400 })
    }

    // Check if this cart is already recovered
    const existingRecovery = await db
      .select()
      .from(cartsRecovered)
      .where(eq(cartsRecovered.abandonedCartId, recoveryCartId))
      .limit(1)

    if (existingRecovery.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cart already recovered'
      }, { status: 400 })
    }

    // Calculate time to recovery in hours
    const timeToRecoveryHours = originalSession.abandonedAt 
      ? (new Date().getTime() - originalSession.abandonedAt.getTime()) / (1000 * 60 * 60)
      : 0

    console.log('🔄 Creating recovery record:', {
      abandonedCartId: recoveryCartId,
      recoverySessionId: sessionId,
      recoveryAmount: cartData?.totalAmount || 0,
      timeToRecoveryHours
    })

    // Create recovery record
    const recoveryRecord = await db
      .insert(cartsRecovered)
      .values({
        abandonedCartId: recoveryCartId,
        recoverySessionId: sessionId,
        customerEmail: recoveryEmail,
        customerName: originalSession.customerName,
        recoveryAmount: cartData?.totalAmount || 0,
        itemCount: cartData?.itemCount || 0,
        timeToRecoveryHours: timeToRecoveryHours
      })
      .returning()

    console.log('✅ Recovery record created:', recoveryRecord[0])

    // Track the recovery event
    try {
      await CartTrackingService.trackEvent(
        originalSession.sessionId,
        'recovery_completed',
        {
          itemCount: cartData?.itemCount || 0,
          totalAmount: cartData?.totalAmount || 0,
          metadata: {
            recoveryCartId,
            recoveryEmail,
            newSessionId: sessionId,
            originalAbandonedAt: originalSession.abandonedAt,
            recoveryCompletedAt: new Date().toISOString(),
            timeToRecoveryHours
          }
        }
      )
    } catch (eventError) {
      console.error('Error tracking recovery event:', eventError)
    }

    return NextResponse.json({
      success: true,
      message: 'Recovery tracked successfully',
      recoveryData: {
        originalCartId: recoveryCartId,
        originalAbandonedAt: originalSession.abandonedAt,
        recoveryCompletedAt: new Date(),
        timeToRecoveryHours
      }
    })

  } catch (error) {
    console.error('Error tracking recovery:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 