import { NextRequest, NextResponse } from 'next/server'

// Global variable to store update progress (in production, use Redis or similar)
let updateProgress: any[] = []
let isUpdating = false
let updateSummary: any = null
let lastUpdateTime = 0

export async function GET() {
  return NextResponse.json({
    isUpdating,
    progress: updateProgress,
    summary: updateSummary,
    lastUpdateTime
  })
}

export async function POST(request: NextRequest) {
  const { progress, summary, isUpdating: updating } = await request.json()
  
  updateProgress = progress || []
  updateSummary = summary || null
  isUpdating = updating || false
  lastUpdateTime = Date.now()
  
  return NextResponse.json({ success: true })
} 