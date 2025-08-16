import { NextResponse } from 'next/server'
import { uploadAsset, deleteAsset, getPlatformFromUrl } from '@/lib/services/platform-upload-service'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as 'logo' | 'favicon'

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    if (!type || !['logo', 'favicon'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid asset type. Must be "logo" or "favicon"' },
        { status: 400 }
      )
    }

    console.log(`Processing platform-aware ${type} upload - File: ${file.name}, Size: ${file.size}`)

    // Validate file size
    const maxSize = type === 'logo' ? 2 * 1024 * 1024 : 1 * 1024 * 1024 // 2MB for logo, 1MB for favicon
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB` },
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

    // Upload using platform-aware service
    const result = await uploadAsset(file, type)

    if (result.success) {
      console.log(`${type} uploaded successfully: ${result.url}`)
      return NextResponse.json({
        success: true,
        url: result.url,
        type: type,
        path: result.path
      })
    } else {
      return NextResponse.json(
        { error: result.error || `Failed to upload ${type}` },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in platform-aware asset upload:', error)
    return NextResponse.json(
      { error: 'Failed to upload asset' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    
    console.log('DELETE request received for platform asset URL:', imageUrl)
    
    if (!imageUrl) {
      console.error('No image URL provided for deletion')
      return NextResponse.json(
        { error: 'No image URL provided' },
        { status: 400 }
      )
    }

    console.log('Attempting to delete platform asset:', imageUrl)
    
    // Delete using platform-aware service
    const success = await deleteAsset(imageUrl)
    
    if (success) {
      console.log('Platform asset deleted successfully:', imageUrl)
      return NextResponse.json({ success: true, deletedUrl: imageUrl })
    } else {
      return NextResponse.json(
        { error: 'Failed to delete asset' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error deleting platform asset:', error)
    return NextResponse.json(
      { error: 'Failed to delete asset', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}