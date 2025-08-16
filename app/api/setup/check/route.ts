import { NextRequest, NextResponse } from 'next/server'
import { checkIfSetupRequired } from '@/lib/actions/setup-wizard'

export async function GET(request: NextRequest) {
  try {
    // Clear any cached setup status to ensure fresh check
    const { clearSetupStatusCache } = await import('@/lib/utils/setup-check')
    clearSetupStatusCache()
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Setup check timeout')), 10000) // 10 second timeout
    })

    const setupCheckPromise = checkIfSetupRequired()
    
    const setupStatus = await Promise.race([setupCheckPromise, timeoutPromise]) as any
    
    return NextResponse.json({
      success: true,
      data: setupStatus
    })
  } catch (error: any) {
    console.error('Setup check API error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    // Always default to requiring setup if there's any error or timeout
    return NextResponse.json({
      success: true,
      data: {
        isSetupRequired: true,
        hasSettings: false,
        hasAdminUsers: false
      }
    })
  }
} 