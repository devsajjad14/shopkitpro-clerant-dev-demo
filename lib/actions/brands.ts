'use server'

import { db } from '@/lib/db'
import { brands } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { deleteAsset } from '@/lib/services/platform-upload-service'

export async function getBrands() {
  try {
    const allBrands = await db.select().from(brands).orderBy(desc(brands.createdAt))
    return { success: true, data: allBrands }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to fetch brands' }
  }
}

export async function getBrand(id: number) {
  try {
    const brand = await db
      .select()
      .from(brands)
      .where(eq(brands.id, id))
      .limit(1)
    return { success: true, data: brand[0] }
  } catch (error) {
    return { success: false, error: 'Failed to fetch brand' }
  }
}

export async function createBrand(data: {
  name: string
  alias: string
  description?: string
  urlHandle: string
  logo?: string
  showOnCategory: boolean
  showOnProduct: boolean
  status: string
}) {
  try {
    const [brand] = await db.insert(brands).values(data).returning()
    revalidatePath('/admin/catalog/brands')
    return { success: true, data: brand }
  } catch (error) {
    return { success: false, error: 'Failed to create brand' }
  }
}

export async function updateBrand(
  id: number,
  data: {
    name: string
    alias: string
    description?: string
    urlHandle: string
    logo?: string
    showOnCategory: boolean
    showOnProduct: boolean
    status: string
  }
) {
  try {
    // If updating logo, get the current brand to clean up old logo
    if (data.logo) {
      console.log('[BRAND-UPDATE] New logo provided, checking for old logo to cleanup')
      const currentBrand = await db
        .select({ logo: brands.logo })
        .from(brands)
        .where(eq(brands.id, id))
        .limit(1)
        
      if (currentBrand[0]?.logo && currentBrand[0].logo !== data.logo) {
        console.log('[BRAND-UPDATE] Cleaning up old brand logo:', currentBrand[0].logo)
        const isVercelUrl = currentBrand[0].logo.includes('blob.vercel-storage.com')
        console.log('[BRAND-UPDATE] Platform detected:', isVercelUrl ? 'Vercel' : 'Server')
        
        try {
          const deleteSuccess = await deleteAsset(currentBrand[0].logo)
          if (deleteSuccess) {
            console.log('[BRAND-UPDATE] ✅ Old brand logo deleted successfully from', isVercelUrl ? 'Vercel' : 'Server')
          } else {
            console.log('[BRAND-UPDATE] ⚠️ Old brand logo delete returned false, but continuing...')
          }
        } catch (cleanupError) {
          console.error('[BRAND-UPDATE] Failed to cleanup old brand logo:', cleanupError)
          // Don't fail the update if cleanup fails
        }
      }
    }

    // Update the brand
    const [brand] = await db
      .update(brands)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(brands.id, id))
      .returning()

    revalidatePath('/admin/catalog/brands')
    revalidatePath('/custom-cms/brand-logos')
    return { success: true, data: brand }
  } catch (error) {
    console.error('Error updating brand:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to update brand' }
  }
}

export async function deleteBrand(id: number) {
  try {
    // Get the brand first to clean up its logo
    console.log('[BRAND-DELETE] Getting brand data for cleanup:', id)
    const brand = await db
      .select()
      .from(brands)
      .where(eq(brands.id, id))
      .limit(1)
    
    if (!brand[0]) {
      return { success: false, error: 'Brand not found' }
    }
    
    // Clean up brand logo if it exists
    if (brand[0].logo) {
      console.log('[BRAND-DELETE] Cleaning up brand logo:', brand[0].logo)
      const isVercelUrl = brand[0].logo.includes('blob.vercel-storage.com')
      console.log('[BRAND-DELETE] Platform detected:', isVercelUrl ? 'Vercel' : 'Server')
      
      try {
        const deleteSuccess = await deleteAsset(brand[0].logo)
        if (deleteSuccess) {
          console.log('[BRAND-DELETE] ✅ Brand logo deleted successfully from', isVercelUrl ? 'Vercel' : 'Server')
        } else {
          console.log('[BRAND-DELETE] ⚠️ Brand logo delete returned false, but continuing...')
        }
      } catch (cleanupError) {
        console.error('[BRAND-DELETE] Failed to cleanup brand logo:', cleanupError)
        // Don't fail the deletion if cleanup fails
      }
    } else {
      console.log('[BRAND-DELETE] No brand logo to clean up')
    }
    
    // Delete the brand from database
    await db.delete(brands).where(eq(brands.id, id))
    revalidatePath('/admin/catalog/brands')
    revalidatePath('/custom-cms/brand-logos')
    return { success: true }
  } catch (error) {
    console.error('Error deleting brand:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to delete brand' }
  }
} 