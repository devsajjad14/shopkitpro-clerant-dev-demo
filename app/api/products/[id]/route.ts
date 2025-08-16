import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { deleteProduct } from '@/lib/actions/products'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const productId = parseInt(resolvedParams.id, 10)

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    const [product] = await db
      .select({
        id: products.id,
        name: products.name,
        sellingPrice: products.sellingPrice,
        regularPrice: products.regularPrice,
        mediumPicture: products.mediumPicture,
        quantityAvailable: products.quantityAvailable,
        style: products.style,
        brand: products.brand,
        styleId: products.styleId,
      })
      .from(products)
      .where(eq(products.id, productId))

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Transform the data to match the frontend expectations
    const transformedProduct = {
      id: product.id.toString(),
      name: product.name,
      selling_price: product.sellingPrice,
      regular_price: product.regularPrice,
      image: product.mediumPicture || '/images/site/placeholder.png',
      stock: product.quantityAvailable,
      style: product.style,
      brand: product.brand,
      styleId: product.styleId,
    }

    return NextResponse.json(transformedProduct)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const styleId = resolvedParams.id

    if (!styleId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    console.log(`[PRODUCT-DELETE-API] Attempting to delete product with styleId: ${styleId}`)
    
    const result = await deleteProduct(styleId)

    if (result.success) {
      console.log(`[PRODUCT-DELETE-API] ✅ Successfully deleted product: ${styleId}`)
      return NextResponse.json({
        success: true,
        message: result.message
      })
    } else {
      console.error(`[PRODUCT-DELETE-API] ❌ Failed to delete product: ${styleId}`, result.error)
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('[PRODUCT-DELETE-API] Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
} 