import { NextResponse } from 'next/server'
import { list } from '@vercel/blob'

export async function GET() {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({
        error: 'BLOB_READ_WRITE_TOKEN not configured',
        blobs: [],
        count: 0
      })
    }

    // List all blobs without any prefix to see what's actually stored
    const { blobs } = await list({
      limit: 1000
    })

    const blobInfo = blobs.map(blob => ({
      pathname: blob.pathname,
      url: blob.url,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
    }))

    return NextResponse.json({
      success: true,
      count: blobs.length,
      blobs: blobInfo,
      debug: {
        tokenConfigured: !!process.env.BLOB_READ_WRITE_TOKEN,
        tokenLength: process.env.BLOB_READ_WRITE_TOKEN?.length || 0
      }
    })
  } catch (error) {
    console.error('Debug blob listing error:', error)
    return NextResponse.json({
      error: 'Failed to list blobs',
      details: error instanceof Error ? error.message : 'Unknown error',
      blobs: [],
      count: 0
    }, { status: 500 })
  }
}