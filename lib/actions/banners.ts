'use server'

import { db } from '@/lib/db'
import { mainBanners, type NewMainBanner, type MainBanner } from '@/lib/db/schema'
import { eq, desc, asc, and, gte, lte } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { deleteAsset } from '@/lib/services/platform-upload-service'

// Get all banners
export async function getBanners(): Promise<MainBanner[]> {
  try {
    const banners = await db
      .select()
      .from(mainBanners)
      .orderBy(desc(mainBanners.createdAt))
    
    return banners
  } catch (error) {
    console.error('Error fetching banners:', error)
    throw new Error('Failed to fetch banners')
  }
}

// Get active banners
export async function getActiveBanners(): Promise<MainBanner[]> {
  try {
    const banners = await db
      .select()
      .from(mainBanners)
      .where(eq(mainBanners.status, 'active'))
      .orderBy(asc(mainBanners.priority), desc(mainBanners.createdAt))
    
    // Filter by date range in JavaScript for now
    const now = new Date()
    return banners.filter(banner => {
      const startDateValid = !banner.startDate || new Date(banner.startDate) <= now
      const endDateValid = !banner.endDate || new Date(banner.endDate) >= now
      return startDateValid && endDateValid
    })
  } catch (error) {
    console.error('Error fetching active banners:', error)
    throw new Error('Failed to fetch active banners')
  }
}

// Get banner by ID
export async function getBannerById(id: number): Promise<MainBanner | null> {
  try {
    const banner = await db
      .select()
      .from(mainBanners)
      .where(eq(mainBanners.id, id))
      .limit(1)
    
    return banner[0] || null
  } catch (error) {
    console.error('Error fetching banner:', error)
    throw new Error('Failed to fetch banner')
  }
}

// Create new banner
export async function createBanner(data: Omit<NewMainBanner, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data?: MainBanner; error?: string }> {
  try {
    const [banner] = await db
      .insert(mainBanners)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning()
    
    revalidatePath('/custom-cms/main-banners')
    revalidatePath('/') // Revalidate home page where banners are displayed
    
    return { success: true, data: banner }
  } catch (error) {
    console.error('Error creating banner:', error)
    return { success: false, error: 'Failed to create banner' }
  }
}

// Update banner
export async function updateBanner(id: number, data: Partial<Omit<NewMainBanner, 'id' | 'createdAt'>>): Promise<{ success: boolean; data?: MainBanner; error?: string }> {
  try {
    // If updating imageUrl, get the current banner to clean up old image
    if (data.imageUrl) {
      console.log('[BANNER-UPDATE] New image provided, checking for old image to cleanup')
      const currentBanner = await getBannerById(id)
      if (currentBanner?.imageUrl && currentBanner.imageUrl !== data.imageUrl) {
        console.log('[BANNER-UPDATE] Cleaning up old banner image:', currentBanner.imageUrl)
        const isVercelUrl = currentBanner.imageUrl.includes('blob.vercel-storage.com')
        console.log('[BANNER-UPDATE] Platform detected:', isVercelUrl ? 'Vercel' : 'Server')
        
        try {
          const deleteSuccess = await deleteAsset(currentBanner.imageUrl)
          if (deleteSuccess) {
            console.log('[BANNER-UPDATE] ✅ Old banner image deleted successfully from', isVercelUrl ? 'Vercel' : 'Server')
          } else {
            console.log('[BANNER-UPDATE] ⚠️ Old banner image delete returned false, but continuing...')
          }
        } catch (cleanupError) {
          console.error('[BANNER-UPDATE] Failed to cleanup old banner image:', cleanupError)
          // Don't fail the update if cleanup fails
        }
      }
    }

    const [banner] = await db
      .update(mainBanners)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(mainBanners.id, id))
      .returning()
    
    revalidatePath('/custom-cms/main-banners')
    revalidatePath('/') // Revalidate home page where banners are displayed
    
    return { success: true, data: banner }
  } catch (error) {
    console.error('Error updating banner:', error)
    return { success: false, error: 'Failed to update banner' }
  }
}

// Delete banner
export async function deleteBanner(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the banner first to clean up its image
    console.log('[BANNER-DELETE] Getting banner data for cleanup:', id)
    const banner = await getBannerById(id)
    
    if (!banner) {
      return { success: false, error: 'Banner not found' }
    }

    // Clean up banner image if it exists
    if (banner.imageUrl) {
      console.log('[BANNER-DELETE] Cleaning up banner image:', banner.imageUrl)
      const isVercelUrl = banner.imageUrl.includes('blob.vercel-storage.com')
      console.log('[BANNER-DELETE] Platform detected:', isVercelUrl ? 'Vercel' : 'Server')
      
      try {
        const deleteSuccess = await deleteAsset(banner.imageUrl)
        if (deleteSuccess) {
          console.log('[BANNER-DELETE] ✅ Banner image deleted successfully from', isVercelUrl ? 'Vercel' : 'Server')
        } else {
          console.log('[BANNER-DELETE] ⚠️ Banner image delete returned false, but continuing...')
        }
      } catch (cleanupError) {
        console.error('[BANNER-DELETE] Failed to cleanup banner image:', cleanupError)
        // Don't fail the deletion if cleanup fails
      }
    } else {
      console.log('[BANNER-DELETE] No banner image to clean up')
    }

    // Delete the banner from database
    await db
      .delete(mainBanners)
      .where(eq(mainBanners.id, id))
    
    revalidatePath('/custom-cms/main-banners')
    revalidatePath('/') // Revalidate home page where banners are displayed
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting banner:', error)
    return { success: false, error: 'Failed to delete banner' }
  }
}

// Update banner status
export async function updateBannerStatus(id: number, status: 'draft' | 'active' | 'scheduled' | 'inactive'): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(mainBanners)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(mainBanners.id, id))
    
    revalidatePath('/custom-cms/main-banners')
    revalidatePath('/') // Revalidate home page where banners are displayed
    
    return { success: true }
  } catch (error) {
    console.error('Error updating banner status:', error)
    return { success: false, error: 'Failed to update banner status' }
  }
}

// Update banner priority
export async function updateBannerPriority(id: number, priority: number): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(mainBanners)
      .set({
        priority,
        updatedAt: new Date(),
      })
      .where(eq(mainBanners.id, id))
    
    revalidatePath('/custom-cms/main-banners')
    revalidatePath('/') // Revalidate home page where banners are displayed
    
    return { success: true }
  } catch (error) {
    console.error('Error updating banner priority:', error)
    return { success: false, error: 'Failed to update banner priority' }
  }
}

// Get banner statistics
export async function getBannerStats(): Promise<{
  total: number
  active: number
  draft: number
  scheduled: number
  inactive: number
}> {
  try {
    const banners = await db.select().from(mainBanners)
    
    return {
      total: banners.length,
      active: banners.filter(b => b.status === 'active').length,
      draft: banners.filter(b => b.status === 'draft').length,
      scheduled: banners.filter(b => b.status === 'scheduled').length,
      inactive: banners.filter(b => b.status === 'inactive').length,
    }
  } catch (error) {
    console.error('Error fetching banner stats:', error)
    return {
      total: 0,
      active: 0,
      draft: 0,
      scheduled: 0,
      inactive: 0,
    }
  }
} 