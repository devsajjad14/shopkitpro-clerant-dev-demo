import { NextRequest, NextResponse } from 'next/server'

// Lightweight dynamic imports
const importTableOps = () => import('@/lib/core/db-operations')
const importValidation = () => import('@/lib/core/data-validation')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tableName, data, batchSize = 100 } = body

    if (!tableName || !data) {
      return NextResponse.json({
        error: 'Table name and data are required'
      }, { status: 400 })
    }

    // Dynamic imports
    const [
      { executeInBatches },
      { validateTableData, sanitizeData }
    ] = await Promise.all([
      importTableOps(),
      importValidation()
    ])

    // Validate and sanitize data
    if (!validateTableData(tableName, data)) {
      return NextResponse.json({
        error: 'Invalid data format'
      }, { status: 400 })
    }

    const cleanData = sanitizeData(data)
    
    console.log(`📊 Inserting ${cleanData.length} records into ${tableName}`)

    // Process in batches to avoid memory issues
    let insertedCount = 0
    await executeInBatches(cleanData, batchSize, async (batch) => {
      // Import heavy DB operations only when needed
      const { insertBatch } = await import('@/lib/data-manager/db-operations')
      await insertBatch(tableName, batch)
      insertedCount += batch.length
    })

    return NextResponse.json({
      success: true,
      message: `Inserted ${insertedCount} records into ${tableName}`,
      insertedCount
    })

  } catch (error) {
    console.error('Insert table error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Insert failed'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Table Insert Service',
    status: 'healthy',
    supportedOperations: ['batch-insert'],
    maxBatchSize: 500,
    timestamp: new Date().toISOString()
  })
}