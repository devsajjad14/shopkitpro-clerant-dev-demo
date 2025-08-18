import { NextResponse } from 'next/server'

// Dynamic import for seed deletion operations
const importSeedDeleteOperations = () => import('@/lib/seed/seed-delete-operations')

export async function POST() {
  try {
    const { performSeedDeletion } = await importSeedDeleteOperations()
    const results = await performSeedDeletion()

    console.log('All seed data deleted successfully')
    
    return NextResponse.json({
      success: true,
      message: 'All seed data deleted successfully',
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error during seed data deletion:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to delete seed data',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}