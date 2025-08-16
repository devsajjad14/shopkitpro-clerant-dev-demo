import { NextResponse } from 'next/server'
import { migrateAsset } from '@/lib/services/platform-upload-service'
import { getSettings, updateSetting } from '@/lib/actions/settings'
import { getPlatformFromUrl } from '@/lib/utils/platform-utils'

export async function POST(request: Request) {
  try {
    const { targetPlatform } = await request.json()
    
    if (!targetPlatform || !['server', 'vercel'].includes(targetPlatform)) {
      return NextResponse.json(
        { error: 'Invalid target platform. Must be "server" or "vercel"' },
        { status: 400 }
      )
    }

    console.log(`Starting asset migration to ${targetPlatform} platform`)
    
    // Get current branding settings
    const settings = await getSettings('branding')
    const results = {
      logo: { success: false, url: '', error: '' },
      favicon: { success: false, url: '', error: '' }
    }

    // Migrate logo if it exists
    if (settings.logo) {
      const currentPlatform = getPlatformFromUrl(settings.logo)
      
      if (currentPlatform !== targetPlatform) {
        console.log(`Migrating logo from ${currentPlatform} to ${targetPlatform}`)
        const logoResult = await migrateAsset(settings.logo, targetPlatform, 'logo')
        
        if (logoResult.success && logoResult.url) {
          // Update setting with new URL
          await updateSetting('logo', logoResult.url)
          results.logo = { success: true, url: logoResult.url, error: '' }
          console.log(`Logo migrated successfully: ${logoResult.url}`)
        } else {
          results.logo = { success: false, url: settings.logo, error: logoResult.error || 'Failed to migrate logo' }
          console.error('Logo migration failed:', logoResult.error)
        }
      } else {
        results.logo = { success: true, url: settings.logo, error: 'Already on target platform' }
        console.log('Logo already on target platform')
      }
    }

    // Migrate favicon if it exists
    if (settings.favicon) {
      const currentPlatform = getPlatformFromUrl(settings.favicon)
      
      if (currentPlatform !== targetPlatform) {
        console.log(`Migrating favicon from ${currentPlatform} to ${targetPlatform}`)
        const faviconResult = await migrateAsset(settings.favicon, targetPlatform, 'favicon')
        
        if (faviconResult.success && faviconResult.url) {
          // Update setting with new URL
          await updateSetting('favicon', faviconResult.url)
          results.favicon = { success: true, url: faviconResult.url, error: '' }
          console.log(`Favicon migrated successfully: ${faviconResult.url}`)
        } else {
          results.favicon = { success: false, url: settings.favicon, error: faviconResult.error || 'Failed to migrate favicon' }
          console.error('Favicon migration failed:', faviconResult.error)
        }
      } else {
        results.favicon = { success: true, url: settings.favicon, error: 'Already on target platform' }
        console.log('Favicon already on target platform')
      }
    }

    const allSuccessful = results.logo.success && results.favicon.success
    
    return NextResponse.json({
      success: allSuccessful,
      results,
      message: allSuccessful 
        ? `All assets migrated successfully to ${targetPlatform}` 
        : `Some assets failed to migrate to ${targetPlatform}`
    })

  } catch (error) {
    console.error('Error in asset migration:', error)
    return NextResponse.json(
      { error: 'Failed to migrate assets', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}