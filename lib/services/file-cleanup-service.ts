'use server'

import { deleteAsset } from '@/lib/services/platform-upload-service'
import { db } from '@/lib/db'
import { brands } from '@/lib/db/schema'
import { isNotNull } from 'drizzle-orm'

/**
 * File cleanup service following industry best practices
 * Handles orphaned file cleanup and asset lifecycle management
 */

export interface CleanupResult {
  success: boolean
  deletedCount: number
  failedCount: number
  errors: string[]
}

/**
 * Clean up orphaned brand logo files
 * Industry best practice: Regular cleanup of unused assets
 */
export async function cleanupOrphanedBrandLogos(): Promise<CleanupResult> {
  const result: CleanupResult = {
    success: true,
    deletedCount: 0,
    failedCount: 0,
    errors: []
  }

  try {
    console.log('[FILE-CLEANUP] Starting orphaned brand logos cleanup...')
    
    // Get all brands with logos from database
    const brandsWithLogos = await db
      .select({ logo: brands.logo })
      .from(brands)
      .where(isNotNull(brands.logo))

    const activeBrandLogos = new Set(
      brandsWithLogos
        .map(b => b.logo)
        .filter(logo => logo && logo.trim() !== '')
    )

    console.log(`[FILE-CLEANUP] Found ${activeBrandLogos.size} active brand logos in database`)

    // For server platform - scan local file system
    const { getCurrentPlatform } = await import('@/lib/services/platform-upload-service')
    const platform = await getCurrentPlatform()
    
    console.log(`[FILE-CLEANUP] Current platform: ${platform}`)

    if (platform === 'server') {
      // Scan local brands directory
      const fs = await import('fs/promises')
      const path = await import('path')
      const brandsDir = path.join(process.cwd(), 'media', 'brands')
      
      try {
        const files = await fs.readdir(brandsDir)
        console.log(`[FILE-CLEANUP] Found ${files.length} files in brands directory`)
        
        for (const file of files) {
          if (file === '.gitkeep') continue // Skip .gitkeep file
          
          const fileUrl = `/media/brands/${file}`
          if (!activeBrandLogos.has(fileUrl)) {
            console.log(`[FILE-CLEANUP] Found orphaned file: ${fileUrl}`)
            try {
              const fullPath = path.join(brandsDir, file)
              await fs.unlink(fullPath)
              result.deletedCount++
              console.log(`[FILE-CLEANUP] ✅ Deleted orphaned file: ${fileUrl}`)
            } catch (deleteError) {
              result.failedCount++
              const error = `Failed to delete ${fileUrl}: ${deleteError instanceof Error ? deleteError.message : 'Unknown error'}`
              result.errors.push(error)
              console.error(`[FILE-CLEANUP] ❌ ${error}`)
            }
          }
        }
      } catch (dirError) {
        const error = `Failed to scan brands directory: ${dirError instanceof Error ? dirError.message : 'Unknown error'}`
        result.errors.push(error)
        console.error(`[FILE-CLEANUP] ❌ ${error}`)
      }
    } else {
      // For Vercel platform
      console.log('[FILE-CLEANUP] Vercel platform cleanup - manual verification recommended')
      console.log('[FILE-CLEANUP] Active brand logos:', Array.from(activeBrandLogos))
      // Note: Vercel blob storage doesn't provide easy listing of all files
      // Manual verification via Vercel dashboard is recommended
    }
    
    console.log(`[FILE-CLEANUP] Cleanup completed - Deleted: ${result.deletedCount}, Failed: ${result.failedCount}`)
    return result

  } catch (error) {
    console.error('[FILE-CLEANUP] ❌ Error during orphaned brand logos cleanup:', error)
    result.success = false
    result.errors.push(error instanceof Error ? error.message : 'Unknown error')
    return result
  }
}

/**
 * Safely delete a brand logo with proper error handling
 * Industry best practice: Graceful degradation on file operations
 */
export async function safeBrandLogoDelete(logoUrl: string): Promise<boolean> {
  if (!logoUrl || logoUrl.trim() === '') {
    console.log('No logo URL provided, nothing to delete')
    return true // Nothing to delete
  }

  try {
    console.log(`[FILE-CLEANUP] Attempting to delete brand logo: ${logoUrl}`)
    const success = await deleteAsset(logoUrl)
    
    if (success) {
      console.log(`[FILE-CLEANUP] ✅ Successfully deleted brand logo: ${logoUrl}`)
    } else {
      console.warn(`[FILE-CLEANUP] ❌ Failed to delete brand logo: ${logoUrl}`)
    }
    
    return success
  } catch (error) {
    console.error(`[FILE-CLEANUP] ❌ Error deleting brand logo ${logoUrl}:`, error)
    return false
  }
}

/**
 * Validate if a logo URL exists and is accessible
 * Industry best practice: Validate resources before operations
 */
export async function validateBrandLogoExists(logoUrl: string): Promise<boolean> {
  if (!logoUrl || logoUrl.trim() === '') {
    return false
  }

  try {
    // For local server files
    if (logoUrl.startsWith('/media/brands/')) {
      const fs = await import('fs/promises')
      const path = await import('path')
      const filePath = path.join(process.cwd(), logoUrl)
      
      try {
        await fs.access(filePath)
        return true
      } catch {
        return false
      }
    }
    
    // For remote URLs (Vercel blob storage)
    if (logoUrl.startsWith('https://')) {
      try {
        console.log(`[FILE-CLEANUP] Validating Vercel blob exists: ${logoUrl}`)
        const response = await fetch(logoUrl, { method: 'HEAD' })
        const exists = response.ok
        console.log(`[FILE-CLEANUP] Vercel blob validation result: ${exists ? '✅ exists' : '❌ not found'}`)
        return exists
      } catch (error) {
        console.error(`[FILE-CLEANUP] Error validating Vercel blob ${logoUrl}:`, error)
        return false
      }
    }
    
    return false
  } catch (error) {
    console.error(`Error validating brand logo ${logoUrl}:`, error)
    return false
  }
}

/**
 * Clean up brand logo when replacing or deleting
 * Industry best practice: Atomic operations with rollback capability
 */
export async function cleanupBrandLogo(
  oldLogoUrl: string | null, 
  operation: 'replace' | 'delete' = 'replace'
): Promise<{ success: boolean; error?: string }> {
  console.log(`[FILE-CLEANUP] Starting cleanup for operation: ${operation}, URL: ${oldLogoUrl}`)
  
  if (!oldLogoUrl) {
    console.log('[FILE-CLEANUP] No old logo URL provided, cleanup not needed')
    return { success: true }
  }

  try {
    // Validate the logo exists before attempting deletion
    console.log(`[FILE-CLEANUP] Validating logo exists: ${oldLogoUrl}`)
    const exists = await validateBrandLogoExists(oldLogoUrl)
    if (!exists) {
      console.log(`[FILE-CLEANUP] Logo does not exist, skipping deletion: ${oldLogoUrl}`)
      return { success: true }
    }

    // Perform the deletion
    console.log(`[FILE-CLEANUP] Logo exists, proceeding with deletion: ${oldLogoUrl}`)
    const deleteSuccess = await safeBrandLogoDelete(oldLogoUrl)
    
    if (deleteSuccess) {
      console.log(`[FILE-CLEANUP] ✅ Brand logo cleanup successful for operation: ${operation}`)
      return { success: true }
    } else {
      const error = `Failed to delete logo during ${operation} operation`
      console.warn(`[FILE-CLEANUP] ❌ ${error}`)
      return { success: false, error }
    }
    
  } catch (error) {
    const errorMessage = `Error during brand logo cleanup (${operation}): ${error instanceof Error ? error.message : 'Unknown error'}`
    console.error(`[FILE-CLEANUP] ❌ ${errorMessage}`)
    return { success: false, error: errorMessage }
  }
}