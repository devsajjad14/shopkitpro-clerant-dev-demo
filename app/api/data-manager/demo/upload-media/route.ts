import { NextRequest, NextResponse } from 'next/server'
import { put, list } from '@vercel/blob'
import fs from 'fs/promises'
import path from 'path'
import { existsSync, mkdirSync } from 'fs'

// Supported media file extensions
const SUPPORTED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.avif',
  '.mp4', '.webm', '.ogg', '.mp3', '.wav', '.pdf',
  '.zip', '.rar', '.doc', '.docx', '.xls', '.xlsx'
]

// Dynamic function to get category for any folder name
function getCategoryForFolder(folderName: string): string {
  // Return the folder name as-is (this handles any characters: hyphens, underscores, etc)
  return folderName || 'general'
}

// Dynamic function to get server media path for any folder name
function getServerMediaPath(category: string): string {
  return path.join(process.cwd(), 'media', category)
}

// Dynamic function to get Vercel blob path for any folder name  
function getVercelBlobPath(category: string, fileName: string): string {
  return `media/${category}/${fileName}`
}

async function getDirectoryContents(dirPath: string): Promise<{ files: string[], folders: string[] }> {
  const files: string[] = []
  const folders: string[] = []
  
  console.log(`🔍 Reading directory: ${dirPath}`)
  
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true })
    
    for (const item of items) {
      if (item.isDirectory()) {
        folders.push(item.name)
        console.log(`📁 Found folder: ${item.name}`)
        
        // Recursively get files from subdirectories
        const subPath = path.join(dirPath, item.name)
        const subContents = await getDirectoryContents(subPath)
        
        console.log(`📁 Folder "${item.name}" contains ${subContents.files.length} files`)
        
        // Add files with relative path
        subContents.files.forEach(file => {
          const relativePath = path.join(item.name, file)
          files.push(relativePath)
          console.log(`   Added file: ${relativePath}`)
        })
      } else if (item.isFile()) {
        const ext = path.extname(item.name).toLowerCase()
        if (SUPPORTED_EXTENSIONS.includes(ext)) {
          files.push(item.name)
          console.log(`📄 Found root file: ${item.name}`)
        } else {
          console.log(`❌ Skipped unsupported file: ${item.name} (extension: ${ext})`)
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error reading directory ${dirPath}:`, error)
  }
  
  console.log(`📊 Directory ${dirPath} summary: ${files.length} files, ${folders.length} folders`)
  
  return { files, folders }
}

async function checkFileExistsOnServer(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function checkFileExistsOnVercel(filePath: string): Promise<boolean> {
  try {
    const { blobs } = await list({ prefix: filePath, limit: 1 })
    return blobs.length > 0
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { platform, source } = await request.json()

    if (!platform || !source) {
      return NextResponse.json({
        success: false,
        error: 'Platform and source are required'
      }, { status: 400 })
    }

    console.log(`🖼️ Starting demo media upload from ${source} to ${platform}`)
    console.log(`🔧 Using dynamic folder mapping - any folder name will be supported`)

    // Get demo media directory path
    const demoMediaPath = path.join(process.cwd(), source)
    
    if (!existsSync(demoMediaPath)) {
      return NextResponse.json({
        success: false,
        error: `Demo media directory not found: ${source}`
      }, { status: 404 })
    }

    // Get all files from demo-media directory
    const { files: allFiles, folders } = await getDirectoryContents(demoMediaPath)
    console.log(`📁 Found ${allFiles.length} media files in ${folders.length} folders`)
    console.log(`📁 Folders found: ${folders.join(', ')}`)
    console.log(`📁 Sample files: ${allFiles.slice(0, 5).join(', ')}`)
    
    // Expert debugging for banner files specifically
    const bannerFiles = allFiles.filter(file => file.includes('banner'))
    console.log(`🎯 EXPERT DEBUG - Banner files found: ${bannerFiles.length}`)
    bannerFiles.forEach(file => console.log(`   Banner file: "${file}"`))

    let uploadedFiles = 0
    let skippedFiles = 0
    const uploadResults: string[] = []

    // Process each file
    for (const relativeFilePath of allFiles) {
      const fullSourcePath = path.join(demoMediaPath, relativeFilePath)
      const fileName = path.basename(relativeFilePath)
      const folderName = path.dirname(relativeFilePath)
      
      // Expert debugging for banner folders
      if (relativeFilePath.includes('banner')) {
        console.log(`🔍 EXPERT DEBUG - Banner file detected:`)
        console.log(`   RelativePath: "${relativeFilePath}"`)
        console.log(`   FileName: "${fileName}"`)
        console.log(`   FolderName: "${folderName}"`)
        console.log(`   FullPath: "${fullSourcePath}"`)
      }
      
      // Use dynamic category determination - works with any folder name
      const category = getCategoryForFolder(folderName)
      
      console.log(`📂 Processing: ${relativeFilePath} → Folder: "${folderName}" → Category: "${category}"`)

      try {
        let fileExists = false
        let targetPath = ''

        if (platform === 'server') {
          // Server upload - dynamic path for any folder name
          const serverMediaDir = getServerMediaPath(category)
          targetPath = path.join(serverMediaDir, fileName)
          
          // Check if file exists
          fileExists = await checkFileExistsOnServer(targetPath)
          
          if (!fileExists) {
            // Create directory if it doesn't exist
            if (!existsSync(serverMediaDir)) {
              mkdirSync(serverMediaDir, { recursive: true })
            }
            
            // Copy file to server media directory
            const fileContent = await fs.readFile(fullSourcePath)
            await fs.writeFile(targetPath, fileContent)
            
            uploadedFiles++
            uploadResults.push(`✅ Uploaded: ${category}/${fileName}`)
            console.log(`✅ Uploaded to server: ${targetPath}`)
          } else {
            skippedFiles++
            uploadResults.push(`⏭️ Skipped (exists): ${category}/${fileName}`)
            console.log(`⏭️ Skipped existing file: ${targetPath}`)
          }

        } else if (platform === 'vercel') {
          // Vercel blob upload - dynamic path for any folder name
          const blobPath = getVercelBlobPath(category, fileName)
          
          // Check if file exists in Vercel blob
          fileExists = await checkFileExistsOnVercel(blobPath)
          
          if (!fileExists) {
            // Upload to Vercel blob
            const fileBuffer = await fs.readFile(fullSourcePath)
            
            await put(blobPath, fileBuffer, {
              access: 'public',
              addRandomSuffix: false,
              contentType: getMimeType(fileName),
              cacheControlMaxAge: 31536000 // 1 year cache
            })
            
            uploadedFiles++
            uploadResults.push(`✅ Uploaded: ${blobPath}`)
            console.log(`✅ Uploaded to Vercel blob: ${blobPath}`)
          } else {
            skippedFiles++
            uploadResults.push(`⏭️ Skipped (exists): ${blobPath}`)
            console.log(`⏭️ Skipped existing blob: ${blobPath}`)
          }
        }

      } catch (fileError) {
        console.error(`❌ Failed to process ${relativeFilePath}:`, fileError)
        uploadResults.push(`❌ Failed: ${relativeFilePath} - ${fileError instanceof Error ? fileError.message : 'Unknown error'}`)
      }
    }

    console.log(`🖼️ Demo media upload completed: ${uploadedFiles} uploaded, ${skippedFiles} skipped`)

    return NextResponse.json({
      success: true,
      message: `Demo media upload completed`,
      uploadedFiles,
      skippedFiles,
      totalFiles: allFiles.length,
      folders,
      platform,
      results: uploadResults.slice(0, 20) // Limit results for response size
    })

  } catch (error: any) {
    console.error(`❌ Demo media upload failed:`, error)
    return NextResponse.json({
      success: false,
      error: 'Failed to upload demo media',
      details: error.message
    }, { status: 500 })
  }
}

// Helper function to get MIME type
function getMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase()
  
  const mimeTypes: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg', 
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
    '.svg': 'image/svg+xml',
    '.avif': 'image/avif',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ogg': 'video/ogg',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  }
  
  return mimeTypes[ext] || 'application/octet-stream'
}