import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const dataSource = formData.get('dataSource') as string || 'local'

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    const uploadedFiles = []

    if (dataSource === 'vercel') {
      // Upload to Vercel Blob Storage
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json(
          { error: 'Vercel Blob storage not configured. Please set BLOB_READ_WRITE_TOKEN environment variable.' },
          { status: 500 }
        )
      }

      for (const file of files) {
        if (file instanceof File) {
          try {
            // Upload to Vercel Blob with Data-Db folder prefix
            const blobPath = `Data-Db/${file.name}`
            const blob = await put(blobPath, file, {
              access: 'public',
              token: process.env.BLOB_READ_WRITE_TOKEN,
            })
            
            uploadedFiles.push({
              name: file.name,
              size: file.size,
              path: blob.pathname,
              url: blob.url,
              downloadUrl: blob.downloadUrl,
              dataSource: 'vercel'
            })
          } catch (error) {
            console.error(`Error uploading ${file.name} to Vercel Blob:`, error)
            throw new Error(`Failed to upload ${file.name} to Vercel Blob storage`)
          }
        }
      }
    } else {
      // Upload to local file system (existing logic)
      const dataDbPath = join(process.cwd(), 'data-db')
      try {
        await mkdir(dataDbPath, { recursive: true })
      } catch (error) {
        console.error('Error creating data-db directory:', error)
      }

      for (const file of files) {
        if (file instanceof File) {
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          
          // Save file to data-db folder
          const filePath = join(dataDbPath, file.name)
          await writeFile(filePath, buffer)
          
          uploadedFiles.push({
            name: file.name,
            size: file.size,
            path: filePath,
            dataSource: 'local'
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${uploadedFiles.length} file(s) to ${dataSource === 'vercel' ? 'Vercel Blob Storage' : 'Local Data-Db Folder'}`,
      files: uploadedFiles,
      dataSource: dataSource,
      count: uploadedFiles.length
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload files' },
      { status: 500 }
    )
  }
} 