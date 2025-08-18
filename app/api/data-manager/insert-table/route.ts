import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Dynamic imports for heavy operations
const loadDbOperations = () => import('@/lib/data-manager/db-operations')
const loadTableConfig = () => import('@/lib/data-manager/table-config')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tableName, data, clearExisting = true } = body

    if (!tableName || !data) {
      return NextResponse.json(
        { error: 'Table name and data are required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Data must be an array' },
        { status: 400 }
      )
    }

    console.log(`📥 Starting table insertion for ${tableName}: ${data.length} records`)

    // Dynamic imports
    const [dbOps, tableConfig] = await Promise.all([
      loadDbOperations(),
      loadTableConfig()
    ])

    // Validate table name
    if (!tableConfig.tableInsertionOrder.includes(tableName as any)) {
      return NextResponse.json(
        { error: `Invalid table name: ${tableName}` },
        { status: 400 }
      )
    }

    // Start insertion process
    const insertionProcess = async () => {
      try {
        // Use the database operations module
        const success = await dbOps.default.insertTableData(
          tableName, 
          data, 
          clearExisting
        )

        if (success) {
          console.log(`✅ Successfully inserted ${data.length} records into ${tableName}`)
          return {
            success: true,
            message: `Successfully inserted ${data.length} records into ${tableName}`,
            recordsInserted: data.length
          }
        } else {
          throw new Error('Insertion process failed')
        }

      } catch (error) {
        console.error(`❌ Insertion failed for ${tableName}:`, error)
        throw error
      }
    }

    // Execute insertion
    const result = await insertionProcess()

    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ Table insertion error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to insert table data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}