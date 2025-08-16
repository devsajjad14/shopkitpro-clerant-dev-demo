import { NextResponse } from 'next/server'
import { uploadAsset, deleteAsset } from '@/lib/services/platform-upload-service'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const styleId = formData.get('styleId') as string
    const isAlternate = formData.get('isAlternate') === 'true'
    const isVariant = formData.get('isVariant') === 'true'
    const color = formData.get('color') as string
    const alternateIndex = formData.get('alternateIndex') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    if (!styleId) {
      return NextResponse.json(
        { error: 'StyleId is required' },
        { status: 400 }
      )
    }

    console.log(`Processing platform-aware product image upload - StyleId: ${styleId}, IsAlternate: ${isAlternate}, IsVariant: ${isVariant}`)

    // Validate file size (10MB max for product images)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a valid image file (JPEG, PNG, GIF, or WebP)' },
        { status: 400 }
      )
    }

    // Determine asset type and options
    let assetType: 'product' | 'product-alt' | 'product-variant'
    let options: {
      styleId: string;
      isAlternate?: boolean;
      alternateIndex?: string;
      color?: string;
    } = { styleId }

    if (isVariant && color) {
      assetType = 'product-variant'
      options.color = color
    } else if (isAlternate && alternateIndex) {
      assetType = 'product-alt'
      options.isAlternate = true
      options.alternateIndex = alternateIndex
    } else {
      assetType = 'product'
    }

    // Upload using platform-aware service
    const result = await uploadAsset(file, assetType, undefined, options)

    if (result.success) {
      console.log(`Product image uploaded successfully: ${result.url || 'multiple URLs'}`)
      
      // Return response in format compatible with existing code
      if (assetType === 'product' && result.urls) {
        // Main product image with three sizes
        return NextResponse.json({
          success: true,
          mainImage: result.urls.large,
          mediumImage: result.urls.medium,
          smallImage: result.urls.small,
          urls: result.urls
        })
      } else if (assetType === 'product-alt') {
        // Alternate image
        return NextResponse.json({
          success: true,
          altImage: result.url,
          AltImage: result.url,
          alternateIndex
        })
      } else if (assetType === 'product-variant') {
        // Variant/color image
        return NextResponse.json({
          success: true,
          mainImage: result.url,
          url: result.url,
          color
        })
      }
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to upload product image' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in platform-aware product image upload:', error)
    return NextResponse.json(
      { 
        error: 'Failed to upload product image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    
    console.log('DELETE request received for product image URL:', imageUrl)
    
    if (!imageUrl) {
      console.error('No image URL provided for deletion')
      return NextResponse.json(
        { error: 'No image URL provided' },
        { status: 400 }
      )
    }

    console.log('Attempting to delete product image:', imageUrl)
    
    // Delete using platform-aware service
    const success = await deleteAsset(imageUrl)
    
    if (success) {
      console.log('Product image deleted successfully:', imageUrl)
      return NextResponse.json({ success: true, deletedUrl: imageUrl })
    } else {
      return NextResponse.json(
        { error: 'Failed to delete product image' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error deleting product image:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete product image', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}