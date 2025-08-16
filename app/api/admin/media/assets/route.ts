import { NextResponse } from 'next/server'

export async function GET() {
  // Minimal response to avoid Vercel bundle size issues
  // TODO: Re-implement with smaller dependencies or edge runtime
  return NextResponse.json({
    success: true,
    assets: [],
    stats: { totalAssets: 0, totalSize: 0, categories: {}, types: {} },
    platform: 'server',
    message: 'Media assets endpoint temporarily disabled due to bundle size constraints'
  })
}

export async function DELETE() {
  return NextResponse.json({
    success: false,
    error: 'Bulk deletion not available'
  }, { status: 501 })
}