'use server'

import { db } from '@/lib/db'
import { cartAbandonmentToggle } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getCartAbandonmentStatus() {
  try {
    const toggle = await db.query.cartAbandonmentToggle.findFirst()
    
    // If no record exists, create one with default disabled state
    if (!toggle) {
      await db.insert(cartAbandonmentToggle).values({
        isEnabled: false,
        description: 'Cart abandonment tracking and recovery feature',
      })
      return false
    }
    
    return toggle.isEnabled
  } catch (error) {
    console.error('Error getting cart abandonment status:', error)
    return false
  }
}

export async function toggleCartAbandonment(enabled: boolean, userId?: string) {
  try {
    const existingToggle = await db.query.cartAbandonmentToggle.findFirst()
    
    if (existingToggle) {
      // Update existing toggle
      await db.update(cartAbandonmentToggle)
        .set({
          isEnabled: enabled,
          lastToggledBy: userId || null,
          lastToggledAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(cartAbandonmentToggle.id, existingToggle.id))
    } else {
      // Create new toggle
      await db.insert(cartAbandonmentToggle).values({
        isEnabled: enabled,
        description: 'Cart abandonment tracking and recovery feature',
        lastToggledBy: userId || null,
        lastToggledAt: new Date(),
      })
    }

    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Error toggling cart abandonment:', error)
    return { success: false, error: 'Failed to toggle cart abandonment' }
  }
}

export async function getCartAbandonmentDetails() {
  try {
    const toggle = await db.query.cartAbandonmentToggle.findFirst()
    return toggle
  } catch (error) {
    console.error('Error getting cart abandonment details:', error)
    return null
  }
} 