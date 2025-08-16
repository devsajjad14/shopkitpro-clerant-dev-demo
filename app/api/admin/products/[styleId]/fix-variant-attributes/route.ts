import { NextRequest, NextResponse } from 'next/server'
import { fixMissingVariantAttributes } from '@/lib/actions/products'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ styleId: string }> }
) {
  const resolvedParams = await params;
  try {
    console.log('Fixing variant attributes for product:', resolvedParams.styleId)
    
    const result = await fixMissingVariantAttributes(resolvedParams.styleId)
    
    if (result.success) {
      return NextResponse.json({ success: true, message: result.message })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error fixing variant attributes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fix variant attributes' },
      { status: 500 }
    )
  }
} 