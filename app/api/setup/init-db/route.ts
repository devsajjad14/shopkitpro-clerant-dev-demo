import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/actions/setup-wizard'

export async function POST(request: NextRequest) {
  try {
    console.log('Database initialization API called')
    const result = await initializeDatabase()
    
    console.log('Database initialization result:', result)
    
    if (!result.success) {
      // If it's a timeout but tables might have been created, return a special status
      if (result.error && (result.error.includes('timeout') || result.error.includes('timed out'))) {
        console.log('Database initialization timed out, but tables may have been created')
        return NextResponse.json({
          success: false,
          error: result.error,
          message: 'Database initialization timed out, but tables may have been created. Please try completing setup.',
          isTimeout: true
        }, { status: 408 }) // 408 Request Timeout
      }
      
      console.log('Database initialization failed:', result.error)
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
    
    console.log('Database initialization successful')
    return NextResponse.json({
      success: true,
      message: result.message || 'Database initialized successfully'
    })
  } catch (error: any) {
    console.error('Database initialization API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to initialize database' },
      { status: 500 }
    )
  }
} 