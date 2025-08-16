import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'main-banners')

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bannerName = formData.get('bannerName') as string

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }
    if (!bannerName) {
      return NextResponse.json({ error: 'Banner name is required' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${bannerName.replace(/\s+/g, '-')}-${Date.now()}.${ext}`
    const filePath = path.join(UPLOAD_DIR, filename)

    await fs.mkdir(UPLOAD_DIR, { recursive: true })
    await fs.writeFile(filePath, buffer)

    return NextResponse.json({ imageUrl: `/uploads/main-banners/${filename}`, filename })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload banner image' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { imageUrl } = await request.json()
    if (!imageUrl) return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 })
    const filePath = path.join(process.cwd(), 'public', imageUrl)
    await fs.unlink(filePath).catch(() => {})
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete banner image' }, { status: 500 })
  }
} 