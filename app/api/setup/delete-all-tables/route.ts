import { NextRequest, NextResponse } from 'next/server'
import { db, query } from '@/lib/db'
import { clearSetupStatusCache, clearSetupFlag } from '@/lib/utils/setup-check'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    console.log('Deleting all database tables...')

    // Get all table names from the database
    const tables = await query(async () => {
      const result = await db.execute(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE 'pg_%' 
        AND tablename NOT LIKE 'information_schema%'
        AND tablename NOT LIKE 'sql_%'
      `)
      return result.rows.map((row: any) => row.tablename)
    })

    console.log('Found tables to delete:', tables)

    if (tables.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No tables found to delete' 
      })
    }

    // Drop all tables
    for (const tableName of tables) {
      try {
        await query(async () => {
          await db.execute(`DROP TABLE IF EXISTS "${tableName}" CASCADE`)
        })
        console.log(`Dropped table: ${tableName}`)
      } catch (error) {
        console.error(`Error dropping table ${tableName}:`, error)
      }
    }

    // Clear setup flag and cache
    clearSetupFlag()
    clearSetupStatusCache()
    
    // Note: Middleware cache will auto-expire in 1 minute, but we'll handle it differently

    console.log('All tables deleted successfully')

    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${tables.length} tables`,
      deletedTables: tables
    })

  } catch (error: any) {
    console.error('Error deleting tables:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete tables',
        details: error.message 
      },
      { status: 500 }
    )
  }
} 