import { NextRequest, NextResponse } from 'next/server'
import { fixProductVariantAttributes } from '@/lib/actions/products'

export async function POST(request: NextRequest) {
  try {
    const { styleId } = await request.json()
    
    if (!styleId) {
      return NextResponse.json({ success: false, error: 'StyleId is required' }, { status: 400 })
    }
    
    const result = await fixProductVariantAttributes(styleId)
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 500 })
    }
  } catch (error) {
    console.error('Error fixing variant attributes:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 