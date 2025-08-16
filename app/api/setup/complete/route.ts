import { NextRequest, NextResponse } from 'next/server'
import { completeSetup, SetupWizardData } from '@/lib/actions/setup-wizard'
import { z } from 'zod'

const setupSchema = z.object({
  storeName: z.string().min(1, 'Store name is required'),
  storeEmail: z.string().email('Valid email is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  storeAddress: z.string().min(1, 'Store address is required'),
  siteTitle: z.string().optional(),
  description: z.string().optional(),
  keywords: z.string().optional(),
  platform: z.enum(['server', 'vercel']).optional().default('server'),
  adminName: z.string().min(1, 'Admin name is required'),
  adminEmail: z.string().email('Valid admin email is required'),
  adminPassword: z.string().min(8, 'Password must be at least 8 characters')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = setupSchema.parse(body)
    
    // Complete setup
    const result = await completeSetup(validatedData)
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: {
        user: result.user,
        message: result.message
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: error.errors
        },
        { status: 400 }
      )
    }
    
    console.error('Setup completion error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to complete setup' },
      { status: 500 }
    )
  }
} 