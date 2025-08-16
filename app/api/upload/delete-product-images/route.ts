import { NextResponse } from 'next/server'
import { list, del } from '@vercel/blob'

export async function POST(request: Request) {
  try {
    const { filenames } = await request.json()

    if (!filenames || !Array.isArray(filenames)) {
      return NextResponse.json(
        { error: 'filenames array is required' },
        { status: 400 }
      )
    }

    console.log('Attempting to delete product images by filenames:', filenames)

    // List all blobs in the products directory
    const { blobs } = await list({ prefix: 'products/' })
    
    // Find blobs that match the requested filenames
    const targets = blobs.filter(blob => {
      const blobFilename = blob.pathname.replace('products/', '')
      return filenames.includes(blobFilename)
    })

    if (targets.length === 0) {
      console.log('No matching images found to delete')
      return NextResponse.json({ 
        success: true, 
        deletedCount: 0,
        message: 'No matching images found to delete'
      })
    }

    // Delete all matching blobs
    const deletePromises = targets.map(blob => del(blob.url))
    await Promise.all(deletePromises)

    console.log(`Successfully deleted ${targets.length} images:`, targets.map(t => t.pathname))

    return NextResponse.json({
      success: true,
      deletedCount: targets.length,
      deletedFiles: targets.map(t => t.pathname.replace('products/', ''))
    })

  } catch (error) {
    console.error('Error deleting product images by filenames:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 