'use server'

import { db } from '@/lib/db'
import { attributes, attributeValues } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export interface AttributeResponse {
  success: boolean
  error?: string
  message?: string
}

export async function getAttributes() {
  try {
    const allAttributes = await db.query.attributes.findMany({
      with: {
        values: true,
      },
    })

    return allAttributes
  } catch (error) {
    console.error('Error fetching attributes:', error)
    return []
  }
}

export async function createAttribute(data: {
  name: string
  display: string
  values: string[]
  status: 'active' | 'draft' | 'archived'
  showOnCategory: boolean
  showOnProduct: boolean
}): Promise<AttributeResponse> {
  try {
    // Create the attribute
    const [attribute] = await db
      .insert(attributes)
      .values({
        name: data.name,
        display: data.display,
        status: data.status,
        showOnCategory: data.showOnCategory,
        showOnProduct: data.showOnProduct,
      })
      .returning()

    // Create the attribute values
    if (data.values.length > 0) {
      await db.insert(attributeValues).values(
        data.values.map((value) => ({
          attributeId: attribute.id,
          value: value,
        }))
      )
    }

    revalidatePath('/admin/catalog/attributes')
    return {
      success: true,
      message: 'Attribute created successfully',
    }
  } catch (error) {
    console.error('Error creating attribute:', error)
    return {
      success: false,
      error: 'Failed to create attribute',
    }
  }
}

export async function updateAttribute(
  id: string,
  data: {
    name: string
    display: string
    values: string[]
    status: string
    showOnCategory: boolean
    showOnProduct: boolean
  }
): Promise<AttributeResponse> {
  try {
    // Update attribute
    await db
      .update(attributes)
      .set({
        name: data.name,
        display: data.display,
        status: data.status,
        showOnCategory: data.showOnCategory,
        showOnProduct: data.showOnProduct,
        updatedAt: new Date(),
      })
      .where(eq(attributes.id, id))

    // Fetch existing values for this attribute
    const existingValues = await db.query.attributeValues.findMany({
      where: eq(attributeValues.attributeId, id),
    })
    const existingValueSet = new Set(existingValues.map((v) => v.value))

    // Insert only new values
    const valuesToInsert = data.values
      .filter((value) => !existingValueSet.has(value))
      .map((value) => ({
        attributeId: id,
        value: value,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

    if (valuesToInsert.length > 0) {
      await db.insert(attributeValues).values(valuesToInsert)
    }

    revalidatePath('/admin/catalog/attributes')
    return {
      success: true,
      message: 'Attribute updated successfully',
    }
  } catch (error) {
    console.error('Error updating attribute:', error)
    return {
      success: false,
      error: 'Failed to update attribute',
    }
  }
}

export async function deleteAttribute(id: string): Promise<AttributeResponse> {
  try {
    // Delete attribute values first
    await db.delete(attributeValues).where(eq(attributeValues.attributeId, id))

    // Then delete the attribute
    await db.delete(attributes).where(eq(attributes.id, id))

    revalidatePath('/admin/catalog/attributes')
    return {
      success: true,
      message: 'Attribute deleted successfully',
    }
  } catch (error) {
    console.error('Error deleting attribute:', error)
    return {
      success: false,
      error: 'Failed to delete attribute',
    }
  }
}

export async function getAttribute(id: string) {
  try {
    const attribute = await db.query.attributes.findFirst({
      where: eq(attributes.id, id),
      with: {
        values: true,
      },
    })

    if (!attribute) {
      throw new Error('Attribute not found')
    }

    return attribute
  } catch (error) {
    console.error('Error in getAttribute:', error)
    throw error
  }
}

export async function getCategoryFilterAttributes() {
  try {
    const attrs = await db.query.attributes.findMany({
      where: (attr, { eq }) => eq(attr.showOnCategory, true),
      orderBy: (attr, { asc }) => [asc(attr.display)],
      with: {
        values: true,
      },
    })
    return attrs
  } catch (error) {
    console.error('Error fetching category filter attributes:', error)
    return []
  }
}
