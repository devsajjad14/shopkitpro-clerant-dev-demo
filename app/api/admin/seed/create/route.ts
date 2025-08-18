import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'

// Dynamic imports for heavy operations
const loadSeedData = () => import('@/app/admin/seed/seed.json')
const loadDbSchema = () => import('@/lib/db/schema')
const loadSeedOperations = () => import('@/lib/data-manager/seed-operations')

type ResultStatus = 'idle' | 'working' | 'completed' | 'skipped' | 'error'

interface Result {
  status: ResultStatus
  message: string
  count: number
}

const seedTables = [
  'taxonomy',
  'attributes', 
  'attribute_values',
  'brands',
  'products',
  'product_alternate_images',
  'product_variations',
  'settings',
  'api_integration',
  'users',
  'user_profiles',
  'addresses',
  'data_mode_settings',
  'coupons',
  'reviews',
  'orders',
  'order_items'
] as const

export async function POST() {
  const results: Record<string, Result> = {}
  
  // Initialize results
  seedTables.forEach(table => {
    results[table] = { status: 'idle', message: '', count: 0 }
  })

  try {
    console.log('🌱 Starting optimized seed data creation...')

    // Dynamic imports (loaded only when needed)
    const [seedData, schema, operations] = await Promise.all([
      loadSeedData(),
      loadDbSchema(),
      loadSeedOperations()
    ])

    // Process each table
    for (const tableName of seedTables) {
      try {
        results[tableName].status = 'working'
        
        const tableData = (seedData as any)[tableName]
        if (!tableData || !Array.isArray(tableData)) {
          results[tableName] = {
            status: 'skipped',
            message: 'No data found',
            count: 0
          }
          continue
        }

        console.log(`📦 Processing ${tableName}: ${tableData.length} records`)

        // Use operations module for processing
        const count = await operations.default.seedTable(
          tableName,
          tableData,
          schema,
          db
        )

        results[tableName] = {
          status: 'completed',
          message: `Successfully inserted ${count} records`,
          count
        }

        console.log(`✅ Completed ${tableName}: ${count} records`)

      } catch (error) {
        console.error(`❌ Error seeding ${tableName}:`, error)
        results[tableName] = {
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
          count: 0
        }
      }
    }

    const totalCount = Object.values(results)
      .reduce((sum, result) => sum + result.count, 0)

    console.log(`🎉 Seed operation completed: ${totalCount} total records`)

    return NextResponse.json({
      success: true,
      message: `Seed data creation completed: ${totalCount} records processed`,
      results,
      totalRecords: totalCount
    })

  } catch (error) {
    console.error('❌ Seed operation failed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create seed data',
        message: error instanceof Error ? error.message : 'Unknown error',
        results
      },
      { status: 500 }
    )
  }
}