import { NextResponse } from 'next/server'
import { getSettings } from '@/lib/actions/settings'

export async function GET() {
  try {
    // Fetch all settings categories
    const generalSettings = await getSettings('general')
    const colorSettings = await getSettings('colors')
    const storeSettings = await getSettings('store')
    const brandingSettings = await getSettings('branding')
    
    // Combine all settings
    const allSettings = {
      ...generalSettings,
      ...colorSettings,
      ...storeSettings,
      ...brandingSettings,
    }
    
    return NextResponse.json({
      success: true,
      settings: allSettings
    })
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch settings',
        settings: {}
      },
      { status: 500 }
    )
  }
}