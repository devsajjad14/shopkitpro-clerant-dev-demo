import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cartSessions } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId, userId, email, name } = body
    if (!sessionId || !userId) {
      return NextResponse.json({ success: false, error: 'Missing sessionId or userId' }, { status: 400 })
    }
    // Find the guest session
    const guestSession = await db.query.cartSessions.findFirst({
      where: and(eq(cartSessions.sessionId, sessionId), eq(cartSessions.userId, null)),
    })
    // Find any active user session
    const userSession = await db.query.cartSessions.findFirst({
      where: and(eq(cartSessions.userId, userId), eq(cartSessions.status, 'active')),
    })
    if (guestSession && userSession) {
      // Merge guest cart into user cart (sum itemCount, totalAmount)
      const mergedItemCount = (userSession.itemCount || 0) + (guestSession.itemCount || 0)
      const mergedTotalAmount = (parseFloat(userSession.totalAmount || '0') + parseFloat(guestSession.totalAmount || '0')).toString()
      await db.update(cartSessions)
        .set({
          itemCount: mergedItemCount,
          totalAmount: mergedTotalAmount,
          updatedAt: new Date(),
        })
        .where(eq(cartSessions.sessionId, userSession.sessionId))
      // Delete the guest session
      await db.delete(cartSessions).where(eq(cartSessions.sessionId, guestSession.sessionId))
      return NextResponse.json({ success: true, merged: true, deletedGuest: true })
    } else if (guestSession) {
      // No user session, just update guest session to user
      await db.update(cartSessions)
        .set({
          userId,
          customerEmail: email || null,
          customerName: name || null,
          updatedAt: new Date(),
        })
        .where(eq(cartSessions.sessionId, sessionId))
      return NextResponse.json({ success: true, merged: true, updatedGuest: true })
    } else if (userSession) {
      // Only user session exists, nothing to do
      return NextResponse.json({ success: true, merged: false, userSessionExists: true })
    }
    // No session found, nothing to merge
    return NextResponse.json({ success: true, merged: false, noSession: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: error?.message || 'Unknown error' }, { status: 500 })
  }
} 