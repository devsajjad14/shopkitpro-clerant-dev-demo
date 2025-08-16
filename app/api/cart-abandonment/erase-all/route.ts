import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cartSessions, cartEvents, campaignEmails, cartsRecovered } from '@/lib/db/schema'

export async function POST(request: NextRequest) {
  try {
    // Delete all cart abandonment related data EXCEPT the toggle settings
    await db.delete(cartsRecovered)
    await db.delete(cartEvents)
    await db.delete(cartSessions)
    await db.delete(campaignEmails)

    // Note: We do NOT delete or modify cartAbandonmentToggle table
    // This preserves the user's toggle preference (enabled/disabled)

    return NextResponse.json({
      success: true,
      message: 'All cart abandonment data has been erased successfully. Toggle settings preserved.'
    })

  } catch (error) {
    console.error('Failed to erase cart abandonment data:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 