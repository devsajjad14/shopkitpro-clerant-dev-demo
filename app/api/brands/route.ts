import { NextRequest, NextResponse } from 'next/server'
import { getBrands, createBrand } from '@/lib/actions/brands'

export async function GET() {
  try {
    const result = await getBrands()
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { name, alias, description, urlHandle, logo, showOnCategory, showOnProduct, status } = body

    // Validate required fields
    if (!name || !alias || !urlHandle) {
      return NextResponse.json(
        { error: 'Name, alias, and URL handle are required' },
        { status: 400 }
      )
    }

    const result = await createBrand({
      name,
      alias,
      description,
      urlHandle,
      logo,
      showOnCategory: showOnCategory || false,
      showOnProduct: showOnProduct || false,
      status: status || 'active'
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('Error creating brand:', error)
    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    )
  }
} 