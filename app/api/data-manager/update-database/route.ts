import { NextRequest, NextResponse } from 'next/server'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { db } from '@/lib/db'
import { tableInsertionOrder, deletionOrder } from '@/lib/data-manager/table-config'

// Dynamic imports for heavy database operations
const importDataTransformers = () => import('@/lib/data-manager/data-transformers')
const importDbOperations = () => import('@/lib/data-manager/db-operations')

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { dataSource = 'local', tables: selectedTables } = body

    // Validate input
    if (!selectedTables || !Array.isArray(selectedTables)) {
      return NextResponse.json(
        { error: 'Please select at least one table to update' },
        { status: 400 }
      )
    }

    console.log(`🚀 Starting optimized database update for ${selectedTables.length} tables`)

    // Start background update process
    const updateProcess = async () => {
      try {
        // Dynamic import of heavy utilities
        const [{ default: dbOps }, { parseTimestamp }] = await Promise.all([
          importDbOperations(),
          importDataTransformers().then(m => ({ parseTimestamp: m.parseTimestamp }))
        ])

        // Update progress endpoint
        const updateProgress = async (progress: any) => {
          try {
            await fetch('/api/data-manager/update-timestamps', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                updateType: 'manual',
                ...progress
              })
            })
          } catch (error) {
            console.warn('Failed to update progress:', error)
          }
        }

        await updateProgress({ 
          status: 'running', 
          message: 'Starting database update process...' 
        })

        // Get data source path
        const dataPath = dataSource === 'local' 
          ? join(process.cwd(), 'data-db')
          : 'vercel-blob' // Handle Vercel blob separately

        // Process each table
        const results = {
          processed: 0,
          failed: 0,
          errors: [] as string[]
        }

        for (const tableName of selectedTables) {
          try {
            await updateProgress({
              status: 'running',
              message: `Processing ${tableName}...`,
              currentTable: tableName
            })

            // Load and process table data
            const success = await dbOps.processTable(tableName, dataPath)
            
            if (success) {
              results.processed++
              console.log(`✅ Successfully updated ${tableName}`)
            } else {
              results.failed++
              results.errors.push(`Failed to update ${tableName}`)
              console.error(`❌ Failed to update ${tableName}`)
            }

          } catch (error) {
            results.failed++
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            results.errors.push(`${tableName}: ${errorMessage}`)
            console.error(`❌ Error updating ${tableName}:`, error)
          }
        }

        // Final progress update
        const finalStatus = results.failed === 0 ? 'completed' : 'completed_with_errors'
        await updateProgress({
          status: finalStatus,
          message: `Update complete: ${results.processed} processed, ${results.failed} failed`,
          processed: results.processed,
          failed: results.failed,
          errors: results.errors
        })

        console.log(`🎉 Database update completed: ${results.processed} processed, ${results.failed} failed`)

      } catch (error) {
        console.error('❌ Update process failed:', error)
        
        try {
          await fetch('/api/data-manager/update-timestamps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              updateType: 'manual',
              status: 'error',
              message: `Critical error: ${error instanceof Error ? error.message : 'Unknown error'}`
            })
          })
        } catch (updateError) {
          console.warn('Failed to update error status:', updateError)
        }
      }
    }

    // Start background process
    updateProcess().catch(console.error)

    // Return immediately
    return NextResponse.json({
      success: true,
      message: 'Database update started. Check progress in real-time.',
      jobId: Date.now().toString(),
      tablesSelected: selectedTables.length
    })

  } catch (error) {
    console.error('❌ Failed to start database update:', error)
    return NextResponse.json(
      { 
        error: 'Failed to start database update process',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}