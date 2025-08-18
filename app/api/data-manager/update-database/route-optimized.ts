import { NextRequest, NextResponse } from 'next/server'

// Minimal imports for basic functionality
const importCoreOperations = () => import('@/lib/core/db-operations')
const importDataValidation = () => import('@/lib/core/data-validation')
const importFileOperations = () => import('@/lib/data-manager/file-operations')
const importDatabaseOperations = () => import('@/lib/data-manager/db-operations')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dataSource = 'local', tables: selectedTables } = body

    if (!selectedTables || !Array.isArray(selectedTables)) {
      return NextResponse.json(
        { error: 'Please select at least one table to update' },
        { status: 400 }
      )
    }

    // Dynamic import of heavy operations
    const [
      { executeInBatches, tableInsertionOrder },
      { validateTableData },
      { getDataFiles, readJsonFile },
      { performDatabaseUpdate }
    ] = await Promise.all([
      importCoreOperations(),
      importDataValidation(),
      importFileOperations(),
      importDatabaseOperations()
    ])

    console.log(`🚀 Starting optimized database update for ${selectedTables.length} tables`)

    // Process in background to avoid timeout
    const updateProcess = async () => {
      try {
        const dataFiles = await getDataFiles(dataSource, selectedTables)
        
        await executeInBatches(dataFiles, 5, async (batch) => {
          for (const file of batch) {
            const tableName = file.replace('.json', '')
            const filePath = join(process.cwd(), 'data', dataSource === 'demo' ? 'demo' : 'json', file)
            const data = await readJsonFile(filePath)
            
            if (validateTableData(tableName, data)) {
              await performDatabaseUpdate(tableName, data)
            }
          }
        })

        console.log('✅ Database update completed successfully')
      } catch (error) {
        console.error('❌ Database update failed:', error)
      }
    }

    // Start background process
    updateProcess()

    return NextResponse.json({
      success: true,
      message: 'Database update started in background',
      tablesCount: selectedTables.length
    })

  } catch (error) {
    console.error('Database update error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Database Update Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoint: '/api/data-manager/update-database',
    supportedMethods: ['POST'],
    description: 'Updates database tables with JSON data files'
  })
}