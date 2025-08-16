import { NextResponse } from 'next/server'
import { uploadAsset, deleteAsset } from '@/lib/services/platform-upload-service'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const brandId = formData.get('brandId') as string
    const brandName = formData.get('brandName') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    if (!brandId) {
      return NextResponse.json(
        { error: 'Brand ID is required' },
        { status: 400 }
      )
    }

    console.log(`Processing platform-aware brand logo upload - BrandId: ${brandId}, BrandName: ${brandName}, File: ${file.name}`)

    // Validate file size (5MB max for brand logos)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a valid image file' },
        { status: 400 }
      )
    }

    // Upload using platform-aware service
    const result = await uploadAsset(file, 'brand')

    if (result.success && result.url) {
      console.log(`Brand logo uploaded successfully to: ${result.url}`)
      
      return NextResponse.json({
        success: true,
        url: result.url,
        path: result.path
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to upload brand logo' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in platform-aware brand logo upload:', error)
    return NextResponse.json(
      { 
        error: 'Failed to upload brand logo',
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
    
    console.log('DELETE request received for brand logo URL:', imageUrl)
    
    if (!imageUrl) {
      console.error('No image URL provided for deletion')
      return NextResponse.json(
        { error: 'No image URL provided' },
        { status: 400 }
      )
    }

    console.log('Attempting to delete brand logo:', imageUrl)
    
    // Delete using platform-aware service
    const success = await deleteAsset(imageUrl)
    
    if (success) {
      console.log('Brand logo deleted successfully:', imageUrl)
      return NextResponse.json({ success: true, deletedUrl: imageUrl })
    } else {
      return NextResponse.json(
        { error: 'Failed to delete brand logo' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error deleting brand logo:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete brand logo', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}