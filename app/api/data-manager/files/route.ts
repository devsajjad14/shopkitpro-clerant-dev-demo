import { NextRequest, NextResponse } from 'next/server'
import { readdir, stat, unlink, rmdir } from 'fs/promises'
import { join } from 'path'
import { list, del } from '@vercel/blob'
import { db } from '@/lib/db'
import { dataUpdater } from '@/lib/db/schema'

export async function GET(request: NextRequest) {
  try {
    // Check if dataSource parameter is provided in URL
    const { searchParams } = new URL(request.url)
    const dataSourceParam = searchParams.get('dataSource') as 'local' | 'vercel' | null
    
    let dataSource: 'local' | 'vercel'
    
    if (dataSourceParam && ['local', 'vercel'].includes(dataSourceParam)) {
      // Use the provided data source parameter
      dataSource = dataSourceParam
    } else {
      // Fallback to database configuration
      const config = await db.select().from(dataUpdater).limit(1)
      dataSource = config[0]?.selectedDataSource || 'local'
    }

    let fileList = []

    if (dataSource === 'vercel') {
      // List files from Vercel Blob Storage
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json({
          error: 'Vercel Blob storage not configured',
          files: []
        })
      }

      try {
        const { blobs } = await list({
          prefix: 'Data-Db/',
          token: process.env.BLOB_READ_WRITE_TOKEN,
        })

        fileList = blobs
          .filter(blob => blob.pathname.toLowerCase().endsWith('.json'))
          .map(blob => ({
            name: blob.pathname.replace('Data-Db/', ''),
            size: blob.size,
            path: blob.pathname,
            url: blob.url,
            downloadUrl: blob.downloadUrl,
            lastModified: blob.uploadedAt,
            dataSource: 'vercel'
          }))
      } catch (error) {
        console.error('Error listing Vercel Blob files:', error)
        return NextResponse.json({
          error: 'Failed to list files from Vercel Blob storage',
          files: []
        })
      }
    } else {
      // List files from local file system
      const dataDbPath = join(process.cwd(), 'data-db')
      
      try {
        await stat(dataDbPath)
      } catch (error) {
        // Directory doesn't exist, return empty array
        return NextResponse.json({ files: [] })
      }

      try {
        const files = await readdir(dataDbPath)

        for (const fileName of files) {
          try {
            const filePath = join(dataDbPath, fileName)
            const fileStats = await stat(filePath)
            
            if (fileStats.isFile() && fileName.toLowerCase().endsWith('.json')) {
              fileList.push({
                name: fileName,
                size: fileStats.size,
                path: filePath,
                lastModified: fileStats.mtime.toISOString(),
                dataSource: 'local'
              })
            }
          } catch (error) {
            console.error(`Error reading file ${fileName}:`, error)
          }
        }
      } catch (error) {
        console.error('Error reading local directory:', error)
        return NextResponse.json({
          error: 'Failed to list local files',
          files: []
        })
      }
    }

    return NextResponse.json({ 
      files: fileList,
      dataSource: dataSource,
      count: fileList.length
    })
  } catch (error) {
    console.error('Error listing files:', error)
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { fileName, deleteAll } = await request.json()
    
    // Get current data source configuration
    const config = await db.select().from(dataUpdater).limit(1)
    const dataSource = config[0]?.selectedDataSource || 'local'

    if (dataSource === 'vercel') {
      // Delete from Vercel Blob Storage
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json(
          { error: 'Vercel Blob storage not configured' },
          { status: 500 }
        )
      }

      if (deleteAll) {
        try {
          // List all files first
          const { blobs } = await list({
            prefix: 'Data-Db/',
            token: process.env.BLOB_READ_WRITE_TOKEN,
          })

          // Delete all files
          const deletePromises = blobs.map(blob => 
            del(blob.url, { token: process.env.BLOB_READ_WRITE_TOKEN })
          )
          
          await Promise.all(deletePromises)
          
          return NextResponse.json({ 
            success: true, 
            message: `All ${blobs.length} files deleted from Vercel Blob Storage`,
            dataSource: 'vercel'
          })
        } catch (error) {
          console.error('Error deleting all Vercel Blob files:', error)
          return NextResponse.json(
            { error: 'Failed to delete all files from Vercel Blob storage' },
            { status: 500 }
          )
        }
      } else if (fileName) {
        try {
          // Delete specific file from Vercel Blob
          const blobPath = `Data-Db/${fileName}`
          
          // First, list to find the exact URL
          const { blobs } = await list({
            prefix: blobPath,
            token: process.env.BLOB_READ_WRITE_TOKEN,
          })

          if (blobs.length === 0) {
            return NextResponse.json(
              { error: `File ${fileName} not found in Vercel Blob storage` },
              { status: 404 }
            )
          }

          // Delete the file
          await del(blobs[0].url, { token: process.env.BLOB_READ_WRITE_TOKEN })
          
          return NextResponse.json({ 
            success: true, 
            message: `File ${fileName} deleted from Vercel Blob Storage`,
            dataSource: 'vercel'
          })
        } catch (error) {
          console.error(`Error deleting file ${fileName} from Vercel Blob:`, error)
          return NextResponse.json(
            { error: `Failed to delete file ${fileName} from Vercel Blob storage` },
            { status: 500 }
          )
        }
      }
    } else {
      // Delete from local file system (existing logic)
      const dataDbPath = join(process.cwd(), 'data-db')

      if (deleteAll) {
        try {
          const files = await readdir(dataDbPath)
          for (const file of files) {
            const filePath = join(dataDbPath, file)
            const fileStats = await stat(filePath)
            if (fileStats.isFile()) {
              await unlink(filePath)
            }
          }
          return NextResponse.json({ 
            success: true, 
            message: `All ${files.length} files deleted from local storage`,
            dataSource: 'local'
          })
        } catch (error) {
          console.error('Error deleting all local files:', error)
          return NextResponse.json(
            { error: 'Failed to delete all files from local storage' },
            { status: 500 }
          )
        }
      } else if (fileName) {
        try {
          const filePath = join(dataDbPath, fileName)
          await unlink(filePath)
          return NextResponse.json({ 
            success: true, 
            message: `File ${fileName} deleted from local storage`,
            dataSource: 'local'
          })
        } catch (error) {
          console.error(`Error deleting file ${fileName} from local storage:`, error)
          return NextResponse.json(
            { error: `Failed to delete file ${fileName} from local storage` },
            { status: 500 }
          )
        }
      }
    }

    return NextResponse.json(
      { error: 'No file specified for deletion' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in DELETE request:', error)
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
} 