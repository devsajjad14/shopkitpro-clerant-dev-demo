import { db } from '../lib/db'
import { dataUpdater } from '../lib/db/schema'
import { eq, ne } from 'drizzle-orm'

async function cleanupDataUpdater() {
  try {
    console.log('Starting cleanup of data_updater table...')
    
    // Check if record with id = 1 exists
    const existingRecord = await db.select().from(dataUpdater).where(eq(dataUpdater.id, 1)).limit(1)
    
    if (existingRecord.length === 0) {
      console.log('No record with id = 1 found. Creating one...')
      
      // Create a default record with id = 1
      await db.insert(dataUpdater).values({
        id: 1,
        selectedDataSource: 'local',
        autoUpdateEnabled: false,
        updateIntervalMinutes: 60,
        fileCount: 0,
        lastManualUpdate: null,
        lastAutoUpdate: null,
        lastUpdateStatus: 'idle',
        lastUpdateMessage: null,
        databaseStatus: 'ready',
        updatedAt: new Date()
      })
      
      console.log('Created default record with id = 1')
    } else {
      console.log('Record with id = 1 already exists')
    }
    
    // Delete all other records
    const deleteResult = await db.delete(dataUpdater).where(ne(dataUpdater.id, 1))
    console.log(`Deleted ${deleteResult.rowCount} extra records`)
    
    // Verify only one record remains
    const allRecords = await db.select().from(dataUpdater)
    console.log(`Table now contains ${allRecords.length} record(s)`)
    
    if (allRecords.length === 1) {
      console.log('Cleanup completed successfully!')
      console.log('Remaining record:', allRecords[0])
    } else {
      console.log('Warning: Table still contains multiple records')
    }
    
  } catch (error) {
    console.error('Error during cleanup:', error)
  } finally {
    process.exit(0)
  }
}

cleanupDataUpdater()
