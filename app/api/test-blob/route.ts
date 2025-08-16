import { NextResponse } from 'next/server'
import { put, list } from '@vercel/blob'

export async function GET() {
  try {
    // Check if environment variable is set
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'BLOB_READ_WRITE_TOKEN not set',
        env: {
          NODE_ENV: process.env.NODE_ENV,
          hasToken: !!process.env.BLOB_READ_WRITE_TOKEN
        }
      })
    }

    // Test listing blobs
    try {
      const { blobs } = await list({ prefix: 'test/' })
      return NextResponse.json({
        success: true,
        message: 'Vercel Blob is working correctly',
        blobsCount: blobs.length,
        env: {
          NODE_ENV: process.env.NODE_ENV,
          hasToken: !!process.env.BLOB_READ_WRITE_TOKEN
        }
      })
    } catch (listError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to list blobs',
        details: listError instanceof Error ? listError.message : 'Unknown error',
        env: {
          NODE_ENV: process.env.NODE_ENV,
          hasToken: !!process.env.BLOB_READ_WRITE_TOKEN
        }
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      env: {
        NODE_ENV: process.env.NODE_ENV,
        hasToken: !!process.env.BLOB_READ_WRITE_TOKEN
      }
    })
  }
} 