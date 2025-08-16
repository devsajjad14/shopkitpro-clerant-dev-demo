'use server'

import { db } from '@/lib/db'
import { mini_banners, type NewMiniBanner, type MiniBanner } from '@/lib/db/schema'
import { eq, desc, asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { deleteAsset } from '@/lib/services/platform-upload-service'

// Get all mini banners
export async function getMiniBanners(): Promise<MiniBanner[]> {
  try {
    const banners = await db
      .select()
      .from(mini_banners)
      .orderBy(desc(mini_banners.createdAt))
    return banners
  } catch (error) {
    console.error('Error fetching mini banners:', error)
    throw new Error('Failed to fetch mini banners')
  }
}

// Get active mini banners
export async function getActiveMiniBanners(): Promise<MiniBanner[]> {
  try {
    const banners = await db
      .select()
      .from(mini_banners)
      .where(eq(mini_banners.status, 'active'))
      .orderBy(asc(mini_banners.priority), desc(mini_banners.createdAt))
    const now = new Date()
    return banners.filter(banner => {
      const startDateValid = !banner.startDate || new Date(banner.startDate) <= now
      const endDateValid = !banner.endDate || new Date(banner.endDate) >= now
      return startDateValid && endDateValid
    })
  } catch (error) {
    console.error('Error fetching active mini banners:', error)
    throw new Error('Failed to fetch active mini banners')
  }
}

// Get mini banner by ID
export async function getMiniBannerById(id: number): Promise<MiniBanner | null> {
  try {
    const banner = await db
      .select()
      .from(mini_banners)
      .where(eq(mini_banners.id, id))
      .limit(1)
    return banner[0] || null
  } catch (error) {
    console.error('Error fetching mini banner:', error)
    throw new Error('Failed to fetch mini banner')
  }
}

// Create new mini banner
export async function createMiniBanner(data: Omit<NewMiniBanner, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data?: MiniBanner; error?: string }> {
  try {
    const [banner] = await db
      .insert(mini_banners)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning()
    revalidatePath('/custom-cms/mini-banners')
    revalidatePath('/')
    return { success: true, data: banner }
  } catch (error) {
    console.error('Error creating mini banner:', error)
    return { success: false, error: 'Failed to create mini banner' }
  }
}

// Update mini banner
export async function updateMiniBanner(id: number, data: Partial<Omit<NewMiniBanner, 'id' | 'createdAt'>>): Promise<{ success: boolean; data?: MiniBanner; error?: string }> {
  try {
    // If updating imageUrl, get the current mini banner to clean up old image
    if (data.imageUrl) {
      console.log('[MINI-BANNER-UPDATE] New image provided, checking for old image to cleanup')
      const currentBanner = await getMiniBannerById(id)
      if (currentBanner?.imageUrl && currentBanner.imageUrl !== data.imageUrl) {
        console.log('[MINI-BANNER-UPDATE] Cleaning up old mini banner image:', currentBanner.imageUrl)
        const isVercelUrl = currentBanner.imageUrl.includes('blob.vercel-storage.com')
        console.log('[MINI-BANNER-UPDATE] Platform detected:', isVercelUrl ? 'Vercel' : 'Server')
        
        try {
          const deleteSuccess = await deleteAsset(currentBanner.imageUrl)
          if (deleteSuccess) {
            console.log('[MINI-BANNER-UPDATE] ✅ Old mini banner image deleted successfully from', isVercelUrl ? 'Vercel' : 'Server')
          } else {
            console.log('[MINI-BANNER-UPDATE] ⚠️ Old mini banner image delete returned false, but continuing...')
          }
        } catch (cleanupError) {
          console.error('[MINI-BANNER-UPDATE] Failed to cleanup old mini banner image:', cleanupError)
          // Don't fail the update if cleanup fails
        }
      }
    }

    const [banner] = await db
      .update(mini_banners)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(mini_banners.id, id))
      .returning()
    revalidatePath('/custom-cms/mini-banners')
    revalidatePath('/')
    return { success: true, data: banner }
  } catch (error) {
    console.error('Error updating mini banner:', error)
    return { success: false, error: 'Failed to update mini banner' }
  }
}

// Delete mini banner
export async function deleteMiniBanner(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the mini banner first to clean up its image
    console.log('[MINI-BANNER-DELETE] Getting mini banner data for cleanup:', id)
    const banner = await getMiniBannerById(id)
    
    if (!banner) {
      return { success: false, error: 'Mini banner not found' }
    }

    // Clean up mini banner image if it exists
    if (banner.imageUrl) {
      console.log('[MINI-BANNER-DELETE] Cleaning up mini banner image:', banner.imageUrl)
      const isVercelUrl = banner.imageUrl.includes('blob.vercel-storage.com')
      console.log('[MINI-BANNER-DELETE] Platform detected:', isVercelUrl ? 'Vercel' : 'Server')
      
      try {
        const deleteSuccess = await deleteAsset(banner.imageUrl)
        if (deleteSuccess) {
          console.log('[MINI-BANNER-DELETE] ✅ Mini banner image deleted successfully from', isVercelUrl ? 'Vercel' : 'Server')
        } else {
          console.log('[MINI-BANNER-DELETE] ⚠️ Mini banner image delete returned false, but continuing...')
        }
      } catch (cleanupError) {
        console.error('[MINI-BANNER-DELETE] Failed to cleanup mini banner image:', cleanupError)
        // Don't fail the deletion if cleanup fails
      }
    } else {
      console.log('[MINI-BANNER-DELETE] No mini banner image to clean up')
    }

    // Delete the mini banner from database
    await db
      .delete(mini_banners)
      .where(eq(mini_banners.id, id))
    revalidatePath('/custom-cms/mini-banners')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error deleting mini banner:', error)
    return { success: false, error: 'Failed to delete mini banner' }
  }
}

// Get mini banner statistics
export async function getMiniBannerStats(): Promise<{
  total: number
  active: number
  draft: number
  scheduled: number
  inactive: number
}> {
  try {
    const banners = await db.select().from(mini_banners)
    return {
      total: banners.length,
      active: banners.filter(b => b.status === 'active').length,
      draft: banners.filter(b => b.status === 'draft').length,
      scheduled: banners.filter(b => b.status === 'scheduled').length,
      inactive: banners.filter(b => b.status === 'inactive').length,
    }
  } catch (error) {
    console.error('Error fetching mini banner stats:', error)
    return {
      total: 0,
      active: 0,
      draft: 0,
      scheduled: 0,
      inactive: 0,
    }
  }
} 