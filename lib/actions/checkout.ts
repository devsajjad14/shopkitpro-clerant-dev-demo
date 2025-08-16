'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { addresses } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

type FormState = {
  error?: string
  success?: boolean
} | null

export async function saveBillingAddress(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const street = formData.get('street')?.toString()
    const city = formData.get('city')?.toString()
    const state = formData.get('state')?.toString()
    const postalCode = formData.get('postalCode')?.toString()
    const country = formData.get('country')?.toString()
    const isDefault = formData.get('isDefault') === 'true'

    if (!street || !city || !state || !postalCode || !country) {
      return { error: 'All required fields must be filled' }
    }

    // If this is set as default, unset any other default billing address
    if (isDefault) {
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(
          and(
            eq(addresses.userId, session.user.id),
            eq(addresses.type, 'billing')
          )
        )
    }

    // Check if user already has a billing address
    const existingAddress = await db.query.addresses.findFirst({
      where: and(
        eq(addresses.userId, session.user.id),
        eq(addresses.type, 'billing')
      ),
    })

    if (existingAddress) {
      // Update existing billing address
      await db
        .update(addresses)
        .set({
          street,
          city,
          state,
          postalCode,
          country,
          isDefault,
          updatedAt: new Date(),
        })
        .where(eq(addresses.id, existingAddress.id))
    } else {
      // Create new billing address
      await db.insert(addresses).values({
        userId: session.user.id,
        type: 'billing',
        street,
        city,
        state,
        postalCode,
        country,
        isDefault,
      })
    }

    return { success: true }
  } catch (error) {
    return { error: 'Failed to save billing address' }
  }
}

export async function saveShippingAddress(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const street = formData.get('street')?.toString()
    const city = formData.get('city')?.toString()
    const state = formData.get('state')?.toString()
    const postalCode = formData.get('postalCode')?.toString()
    const country = formData.get('country')?.toString()
    const isDefault = formData.get('isDefault') === 'on'

    if (!street || !city || !state || !postalCode || !country) {
      return { error: 'All required fields must be filled' }
    }

    // If this is set as default, unset any other default shipping address
    if (isDefault) {
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(
          and(
            eq(addresses.userId, session.user.id),
            eq(addresses.type, 'shipping')
          )
        )
    }

    // Check if user already has a shipping address
    const existingAddress = await db.query.addresses.findFirst({
      where: and(
        eq(addresses.userId, session.user.id),
        eq(addresses.type, 'shipping')
      ),
    })

    if (existingAddress) {
      // Update existing shipping address
      await db
        .update(addresses)
        .set({
          street,
          city,
          state,
          postalCode,
          country,
          isDefault,
          updatedAt: new Date(),
        })
        .where(eq(addresses.id, existingAddress.id))
    } else {
      // Create new shipping address
      await db.insert(addresses).values({
        userId: session.user.id,
        type: 'shipping',
        street,
        city,
        state,
        postalCode,
        country,
        isDefault,
      })
    }

    return { success: true }
  } catch (error) {
    return { error: 'Failed to save shipping address' }
  }
}
