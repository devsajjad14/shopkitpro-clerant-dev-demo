import { NextResponse } from 'next/server'

// Dynamic imports to reduce bundle size
const importSeedOperations = () => import('@/lib/seed/operations')
const importDbOperations = () => import('@/lib/core/db-operations')

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { seedType = 'minimal' } = body

    // Dynamic import of heavy operations
    const [
      { createSeedData },
      { executeInBatches }
    ] = await Promise.all([
      importSeedOperations(),
      importDbOperations()
    ])

    console.log(`🌱 Starting ${seedType} seed data creation`)

    // Process seed creation in batches to avoid memory issues
    const result = await executeInBatches(
      ['users', 'categories', 'products', 'orders'], 
      2, 
      async (tables) => {
        for (const table of tables) {
          await createSeedData(table, seedType)
        }
      }
    )

    return NextResponse.json({
      success: true,
      message: `${seedType} seed data created successfully`,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Seed creation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Seed creation failed'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Seed Data Creation Service',
    status: 'healthy',
    supportedTypes: ['minimal', 'full', 'demo'],
    timestamp: new Date().toISOString()
  })
}