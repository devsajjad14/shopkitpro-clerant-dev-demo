import { NextRequest, NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/actions/setup-wizard'

export async function GET(request: NextRequest) {
  try {
    const healthCheck = await checkDatabaseHealth()
    
    if (healthCheck.success) {
      return NextResponse.json({
        success: true,
        data: {
          status: 'healthy',
          message: healthCheck.message
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        data: {
          status: 'unhealthy',
          error: healthCheck.error,
          details: healthCheck.details
        }
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Health check API error:', error)
    return NextResponse.json({
      success: false,
      data: {
        status: 'error',
        error: 'Health check failed',
        details: error.message
      }
    }, { status: 500 })
  }
} 