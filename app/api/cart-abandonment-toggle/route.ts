import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cartAbandonmentToggle } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const toggle = await db.query.cartAbandonmentToggle.findFirst()
    
    // If no record exists, create one with default disabled state
    if (!toggle) {
      const newToggle = await db.insert(cartAbandonmentToggle).values({
        isEnabled: false,
        description: 'Cart abandonment tracking and recovery feature',
      }).returning()
      
      return NextResponse.json({ 
        success: true, 
        data: newToggle[0] 
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      data: toggle 
    })
  } catch (error) {
    console.error('Error fetching cart abandonment toggle:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart abandonment toggle' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { isEnabled, userId } = body

    if (typeof isEnabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isEnabled must be a boolean' },
        { status: 400 }
      )
    }

    const existingToggle = await db.query.cartAbandonmentToggle.findFirst()

    if (existingToggle) {
      // Update existing toggle
      const updatedToggle = await db.update(cartAbandonmentToggle)
        .set({
          isEnabled,
          lastToggledBy: userId || null,
          lastToggledAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(cartAbandonmentToggle.id, existingToggle.id))
        .returning()

      return NextResponse.json({ 
        success: true, 
        data: updatedToggle[0] 
      })
    } else {
      // Create new toggle
      const newToggle = await db.insert(cartAbandonmentToggle).values({
        isEnabled,
        description: 'Cart abandonment tracking and recovery feature',
        lastToggledBy: userId || null,
        lastToggledAt: new Date(),
      }).returning()

      return NextResponse.json({ 
        success: true, 
        data: newToggle[0] 
      })
    }
  } catch (error) {
    console.error('Error updating cart abandonment toggle:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update cart abandonment toggle' },
      { status: 500 }
    )
  }
} 