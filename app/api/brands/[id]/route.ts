import { NextRequest, NextResponse } from 'next/server'
import { getBrand, updateBrand, deleteBrand } from '@/lib/actions/brands'
import { db } from '@/lib/db'
import { brands } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid brand ID' },
        { status: 400 }
      )
    }

    const result = await getBrand(id)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    if (!result.data) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('Error fetching brand:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brand' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid brand ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    const { name, alias, description, urlHandle, logo, showOnCategory, showOnProduct, status } = body

    // Validate required fields
    if (!name || !urlHandle) {
      return NextResponse.json(
        { error: 'Name and URL handle are required' },
        { status: 400 }
      )
    }

    // Default alias to name if not provided
    const finalAlias = alias || name
    
    const updateData = {
      name,
      alias: finalAlias,
      description: description || '',
      urlHandle,
      logo: logo || '',
      showOnCategory: showOnCategory || false,
      showOnProduct: showOnProduct || false,
      status: status || 'active'
    }

    const result = await updateBrand(id, updateData, { cleanupOldLogo: true })

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
    console.error('Error updating brand:', error)
    return NextResponse.json(
      { error: 'Failed to update brand' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid brand ID' },
        { status: 400 }
      )
    }

    const result = await deleteBrand(id)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Brand deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting brand:', error)
    return NextResponse.json(
      { error: 'Failed to delete brand' },
      { status: 500 }
    )
  }
} 

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)
    const body = await request.json()

    // Validate brand ID
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid brand ID' },
        { status: 400 }
      )
    }

    // Update the brand
    const updatedBrand = await db
      .update(brands)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(brands.id, id))
      .returning()

    if (updatedBrand.length === 0) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedBrand[0],
    })
  } catch (error) {
    console.error('Error updating brand:', error)
    return NextResponse.json(
      { error: 'Failed to update brand' },
      { status: 500 }
    )
  }
} 