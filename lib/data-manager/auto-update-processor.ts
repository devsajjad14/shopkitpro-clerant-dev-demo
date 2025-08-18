import { db } from '@/lib/db'
import { dataUpdater } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Dynamic imports for heavy operations
const importProgressUpdater = () => import('@/app/api/data-manager/auto-update-progress/route')

// Table processing orders
export const deletionOrder = [
  'variantAttributes', 'productAttributes', 'productAlternateImages', 'productVariations',
  'orderItems', 'reviews', 'refunds', 'cartEvents', 'cartsRecovered', 'campaignEmails',
  'paymentTransactionLogs', 'paymentGatewayHealthChecks', 'pageRevisions', 'pageCategoryRelations',
  'pageAnalytics', 'orders', 'products', 'attributeValues', 'cartSessions', 'coupons',
  'discounts', 'addresses', 'userProfiles', 'sessions', 'accounts', 'verificationTokens',
  'customers', 'categories', 'brands', 'attributes', 'taxonomy', 'shippingMethods',
  'taxRates', 'paymentGateways', 'paymentSettings', 'apiIntegrations', 'adminUsers',
  'mainBanners', 'mini_banners', 'pages', 'pageCategories', 'cartAbandonmentToggle',
  'dataModeSettings', 'users'
]

export const insertionOrder = [
  'users', 'categories', 'taxonomy', 'brands', 'settings', 'taxRates', 'shippingMethods',
  'adminUsers', 'apiIntegrations', 'paymentGateways', 'paymentSettings', 'dataModeSettings',
  'mainBanners', 'mini_banners', 'pages', 'pageCategories', 'cartAbandonmentToggle',
  'customers', 'verificationTokens', 'accounts', 'sessions', 'userProfiles', 'addresses',
  'coupons', 'discounts', 'attributes', 'attributeValues', 'products', 'orders',
  'productVariations', 'productAttributes', 'productAlternateImages', 'variantAttributes',
  'orderItems', 'reviews', 'refunds', 'cartSessions', 'cartEvents', 'cartsRecovered',
  'campaignEmails', 'paymentTransactionLogs', 'paymentGatewayHealthChecks', 'pageRevisions',
  'pageCategoryRelations', 'pageAnalytics'
]

export function checkUpdateInterval(config: any): { blocked: boolean, response?: any } {
  const now = Date.now()
  
  if (config.lastAutoUpdate) {
    const lastUpdateTime = new Date(config.lastAutoUpdate).getTime()
    const intervalMs = config.updateIntervalMinutes * 60 * 1000
    const timeSinceLastUpdate = now - lastUpdateTime
    const timeUntilNext = intervalMs - timeSinceLastUpdate
    
    if (timeUntilNext > 0) {
      const minutesUntilNext = Math.ceil(timeUntilNext / (60 * 1000))
      const hoursUntilNext = Math.ceil(timeUntilNext / (60 * 60 * 1000))
      const daysUntilNext = Math.ceil(timeUntilNext / (24 * 60 * 60 * 1000))
      
      let timeDisplay = `${minutesUntilNext} minutes`
      if (minutesUntilNext > 60) timeDisplay = `${hoursUntilNext} hours`
      if (hoursUntilNext > 24) timeDisplay = `${daysUntilNext} days`
      
      console.log(`⏸️ Auto Update: Too soon - last update was ${Math.floor(timeSinceLastUpdate / (60 * 1000))}min ago, need to wait ${timeDisplay} more`)
      return {
        blocked: true,
        response: {
          success: true,
          message: `Auto update skipped - next update in ${timeDisplay}`,
          skipped: true,
          nextUpdateIn: timeUntilNext
        }
      }
    }
  } else {
    console.log('⏸️ Auto Update: No previous auto update found - this should be handled by frontend scheduling only')
    return {
      blocked: true,
      response: {
        success: true,
        message: 'Auto update skipped - first run should be scheduled by frontend',
        skipped: true,
        nextUpdateIn: config.updateIntervalMinutes * 60 * 1000
      }
    }
  }
  
  return { blocked: false }
}

export async function processTableDeletion(): Promise<{ totalDeleted: number, tablesProcessed: number }> {
  const { updateAutoUpdateProgress } = await importProgressUpdater()
  
  let totalRecordsDeleted = 0
  let tablesDeletedCount = 0
  
  console.log(`🗑️ Auto Update: Starting deletion of ${deletionOrder.length} tables...`)
  
  for (let i = 0; i < deletionOrder.length; i++) {
    const tableName = deletionOrder[i]
    
    updateAutoUpdateProgress({
      currentTable: tableName,
      tablesCompleted: i
    })
    
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/api/data-manager/delete-table`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status} for table ${tableName}: ${errorText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        totalRecordsDeleted += result.recordsDeleted || 0
        tablesDeletedCount += 1
        
        updateAutoUpdateProgress({
          tablesCompleted: i + 1,
          recordsProcessed: totalRecordsDeleted
        })
        
        if (result.skipped) {
          console.log(`⏭️  Auto Update: Skipped ${tableName} - ${result.message}`)
        } else {
          console.log(`✅ Auto Update: Deleted ${result.recordsDeleted} records from ${tableName}`)
        }
      } else {
        throw new Error(`Failed to delete table ${tableName}: ${result.error}`)
      }
    } catch (error) {
      console.error(`❌ Auto Update: Error deleting table ${tableName}:`, error)
      throw new Error(`Table deletion failed for ${tableName}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  console.log(`✅ Auto Update: Deleted ${totalRecordsDeleted} records from ${tablesDeletedCount} tables`)
  return { totalDeleted: totalRecordsDeleted, tablesProcessed: tablesDeletedCount }
}

export async function processTableInsertion(): Promise<{ totalInserted: number, tablesProcessed: number }> {
  const { updateAutoUpdateProgress } = await importProgressUpdater()
  
  updateAutoUpdateProgress({
    phase: 'inserting',
    tablesCompleted: 0,
    totalTables: insertionOrder.length,
    recordsProcessed: 0
  })
  
  let totalRecordsInserted = 0
  let tablesInsertedCount = 0
  
  console.log(`📛 Auto Update: Starting insertion of ${insertionOrder.length} tables...`)
  
  for (let i = 0; i < insertionOrder.length; i++) {
    const tableName = insertionOrder[i]
    
    updateAutoUpdateProgress({
      currentTable: tableName,
      tablesCompleted: i
    })
    
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/api/data-manager/insert-table`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status} for table ${tableName}: ${errorText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        totalRecordsInserted += result.recordsInserted || 0
        tablesInsertedCount += 1
        
        updateAutoUpdateProgress({
          tablesCompleted: i + 1,
          recordsProcessed: totalRecordsInserted
        })
        
        if (result.skipped) {
          console.log(`⏭️  Auto Update: Skipped ${tableName} - ${result.message}`)
        } else {
          console.log(`✅ Auto Update: Inserted ${result.recordsInserted} records into ${tableName}`)
        }
      } else {
        throw new Error(`Failed to insert table ${tableName}: ${result.error}`)
      }
    } catch (error) {
      console.error(`❌ Auto Update: Error inserting table ${tableName}:`, error)
      throw new Error(`Table insertion failed for ${tableName}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  console.log(`✅ Auto Update: Inserted ${totalRecordsInserted} records into ${tablesInsertedCount} tables`)
  return { totalInserted: totalRecordsInserted, tablesProcessed: tablesInsertedCount }
}

export async function finalizeUpdate(totalDeleted: number, totalInserted: number, tablesProcessed: number): Promise<void> {
  const { setAutoUpdateCompleted, resetAutoUpdateProgress } = await importProgressUpdater()
  
  await db.update(dataUpdater)
    .set({
      lastAutoUpdate: new Date(),
      lastUpdateStatus: 'success',
      lastUpdateMessage: `Auto update completed: ${totalInserted} records updated`,
      updatedAt: new Date()
    })
    .where(eq(dataUpdater.id, 1))

  console.log('🎉 Auto Update: Background update completed successfully')

  setAutoUpdateCompleted({
    totalRecordsDeleted: totalDeleted,
    totalRecordsInserted: totalInserted,
    totalTablesProcessed: tablesProcessed
  })
  
  setTimeout(() => {
    resetAutoUpdateProgress()
  }, 10 * 60 * 1000)
}