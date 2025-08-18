import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { dataUpdater } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { updateAutoUpdateProgress, resetAutoUpdateProgress, setAutoUpdateCompleted } from '@/app/api/data-manager/auto-update-progress/route'

// Global lock to prevent concurrent auto updates with timestamp
let isAutoUpdateRunning = false
let lastUpdateStartTime = 0
let currentUpdateProcess: Promise<any> | null = null

// Server startup time for cooldown protection
const SERVER_START_TIME = Date.now()
const STARTUP_COOLDOWN_MS = 60 * 60 * 1000 // 1 hour cooldown after server start

// Rate limiting to prevent excessive API calls
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL_MS = 10 * 1000 // 10 seconds between requests

export async function POST() {
  try {
    const now = Date.now()
    
    // Rate limiting - prevent too frequent requests
    const timeSinceLastRequest = now - lastRequestTime
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
      // Silent block - don't log to prevent spam
      return NextResponse.json({
        success: true,
        message: 'Request too frequent - blocked',
        skipped: true,
        rateLimited: true,
        nextAllowedRequest: lastRequestTime + MIN_REQUEST_INTERVAL_MS
      })
    }
    
    lastRequestTime = now
    
    // Check server startup cooldown - prevent any auto-updates for first hour after server start
    const timeSinceServerStart = now - SERVER_START_TIME
    if (timeSinceServerStart < STARTUP_COOLDOWN_MS) {
      const minutesUntilCooldownEnd = Math.ceil((STARTUP_COOLDOWN_MS - timeSinceServerStart) / (60 * 1000))
      // Only log every 5 minutes to reduce spam
      if (minutesUntilCooldownEnd % 5 === 0 || minutesUntilCooldownEnd <= 5) {
        console.log(`❄️ Auto Update: Server startup cooldown active - ${minutesUntilCooldownEnd} minutes remaining`)
      }
      return NextResponse.json({
        success: true,
        message: `Auto update blocked - server startup cooldown (${minutesUntilCooldownEnd} minutes remaining)`,
        skipped: true,
        cooldownRemaining: STARTUP_COOLDOWN_MS - timeSinceServerStart,
        serverStartupCooldown: true
      })
    }
    
    // Check for concurrent auto updates with timeout protection
    if (isAutoUpdateRunning || currentUpdateProcess) {
      // If update has been running for more than 10 minutes, reset the flag
      if (now - lastUpdateStartTime > 10 * 60 * 1000) {
        console.log('⚠️ Auto Update: Long-running update detected, resetting locks')
        isAutoUpdateRunning = false
        currentUpdateProcess = null
      } else {
        console.log('⏸️ Auto Update: Already running, skipping this cycle')
        return NextResponse.json({
          success: true,
          message: 'Auto update already in progress - skipped',
          skipped: true
        })
      }
    }

    isAutoUpdateRunning = true
    lastUpdateStartTime = now
    console.log('🔄 Auto Update: Starting background database update...')

    // Create a promise to track this update process
    currentUpdateProcess = (async () => {
      return await executeAutoUpdateProcess()
    })()

    return await currentUpdateProcess

  } catch (error) {
    console.error('❌ Auto Update: Background update failed:', error)

    // Reset progress on error
    resetAutoUpdateProgress()

    // Update status to error
    try {
      await db.update(dataUpdater)
        .set({
          lastUpdateStatus: 'error',
          lastUpdateMessage: error instanceof Error ? error.message : 'Unknown error during auto update',
          updatedAt: new Date()
        })
        .where(eq(dataUpdater.id, 1))
    } catch (updateError) {
      console.error('❌ Failed to update error status:', updateError)
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Auto update failed'
    }, { status: 500 })
  } finally {
    // Always reset the locks
    isAutoUpdateRunning = false
    currentUpdateProcess = null
  }
}

async function executeAutoUpdateProcess() {
  try {
    // Get current config to check if auto update is enabled
    const config = await db
      .select()
      .from(dataUpdater)
      .where(eq(dataUpdater.id, 1))
      .limit(1)

    if (config.length === 0 || !config[0].autoUpdateEnabled) {
      console.log('⏸️ Auto Update: Disabled or no config found')
      return NextResponse.json({
        success: false,
        message: 'Auto update is disabled'
      })
    }

    const currentConfig = config[0]
    const now = Date.now()
    console.log(`✅ Auto Update: Enabled with ${currentConfig.updateIntervalMinutes}min interval`)

    // Check if enough time has passed since last auto update
    if (currentConfig.lastAutoUpdate) {
      const lastUpdateTime = new Date(currentConfig.lastAutoUpdate).getTime()
      const intervalMs = currentConfig.updateIntervalMinutes * 60 * 1000 // No minimum - respect exact interval
      const timeSinceLastUpdate = now - lastUpdateTime
      const timeUntilNext = intervalMs - timeSinceLastUpdate
      
      // TEMPORARY: Allow updates every 30 seconds for testing UI
      if (timeUntilNext > 0) {
        const minutesUntilNext = Math.ceil(timeUntilNext / (60 * 1000))
        const hoursUntilNext = Math.ceil(timeUntilNext / (60 * 60 * 1000))
        const daysUntilNext = Math.ceil(timeUntilNext / (24 * 60 * 60 * 1000))
        
        let timeDisplay = `${minutesUntilNext} minutes`
        if (minutesUntilNext > 60) {
          timeDisplay = `${hoursUntilNext} hours`
        }
        if (hoursUntilNext > 24) {
          timeDisplay = `${daysUntilNext} days`
        }
        
        console.log(`⏸️ Auto Update: Too soon - last update was ${Math.floor(timeSinceLastUpdate / (60 * 1000))}min ago, need to wait ${timeDisplay} more`)
        return NextResponse.json({
          success: true,
          message: `Auto update skipped - next update in ${timeDisplay}`,
          skipped: true,
          nextUpdateIn: timeUntilNext
        })
      }
    } else {
      // No previous auto update - this should be first time, so we need strict controls
      console.log('⏸️ Auto Update: No previous auto update found - this should be handled by frontend scheduling only')
      return NextResponse.json({
        success: true,
        message: 'Auto update skipped - first run should be scheduled by frontend',
        skipped: true,
        nextUpdateIn: currentConfig.updateIntervalMinutes * 60 * 1000
      })
    }

    // Initialize progress tracking
    updateAutoUpdateProgress({
      isRunning: true,
      phase: 'deleting',
      startTime: Date.now(),
      totalTables: deletionOrder.length
    })

    // Update status to pending
    await db.update(dataUpdater)
      .set({
        lastUpdateStatus: 'pending',
        lastUpdateMessage: 'Auto update in progress...',
        updatedAt: new Date()
      })
      .where(eq(dataUpdater.id, 1))

    // EXECUTE THE EXACT SAME LOGIC AS MANUAL UPDATE - Call individual APIs directly
    
    // DELETION PHASE - Using EXACT same approach as manual update
    let totalRecordsDeleted = 0
    let tablesDeletedCount = 0
    
    console.log(`🗑️ Auto Update: Starting deletion of ${deletionOrder.length} tables...`)
    
    for (let i = 0; i < deletionOrder.length; i++) {
      const tableName = deletionOrder[i]
      
      // Update progress
      updateAutoUpdateProgress({
        currentTable: tableName,
        tablesCompleted: i
      })
      
      try {
        // EXACT same API call as manual update
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
          
          // Update progress with completed table
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

    // INSERTION PHASE - Using EXACT same approach as manual update
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
      
      // Update progress
      updateAutoUpdateProgress({
        currentTable: tableName,
        tablesCompleted: i
      })
      
      try {
        // EXACT same API call as manual update
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
          
          // Update progress with completed table
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

    // Update status to success and set lastAutoUpdate timestamp
    await db.update(dataUpdater)
      .set({
        lastAutoUpdate: new Date(),
        lastUpdateStatus: 'success',
        lastUpdateMessage: `Auto update completed: ${totalRecordsInserted} records updated`,
        updatedAt: new Date()
      })
      .where(eq(dataUpdater.id, 1))

    console.log('🎉 Auto Update: Background update completed successfully')

    // Mark as complete with final stats
    setAutoUpdateCompleted({
      totalRecordsDeleted: totalRecordsDeleted,
      totalRecordsInserted: totalRecordsInserted,
      totalTablesProcessed: tablesInsertedCount
    })
    
    // Keep the progress visible for 10 minutes before resetting to allow user to see final results
    setTimeout(() => {
      resetAutoUpdateProgress()
    }, 10 * 60 * 1000) // 10 minutes

    return NextResponse.json({
      success: true,
      message: 'Auto update completed successfully',
      data: {
        recordsDeleted: totalRecordsDeleted,
        recordsInserted: totalRecordsInserted,
        tablesProcessed: tablesInsertedCount,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Auto Update: Execute process failed:', error)

    // Update status to error
    try {
      await db.update(dataUpdater)
        .set({
          lastUpdateStatus: 'error',
          lastUpdateMessage: error instanceof Error ? error.message : 'Unknown error during auto update',
          updatedAt: new Date()
        })
        .where(eq(dataUpdater.id, 1))
    } catch (updateError) {
      console.error('❌ Failed to update error status:', updateError)
    }

    throw error // Re-throw to be handled by the main catch block
  }
}

// Deletion order based on foreign key dependencies (child tables first)
// Note: settings table is excluded from deletion as it's a primary configuration table
const deletionOrder = [
  // Child tables with foreign keys first - delete these before their parent tables
  'variantAttributes', // references productVariations, attributes, attributeValues
  'productAttributes', // references products, attributes, attributeValues
  'productAlternateImages', // references products
  'productVariations', // references products
  'orderItems', // references orders, products, productVariations
  'reviews', // references products, users
  'refunds', // references orders
  'cartEvents', // references cartSessions, users
  'cartsRecovered', // references cartSessions
  'campaignEmails', // references cartSessions
  'paymentTransactionLogs', // references orders, paymentGateways
  'paymentGatewayHealthChecks', // references paymentGateways
  'pageRevisions', // references pages
  'pageCategoryRelations', // references pages, pageCategories
  'pageAnalytics', // references pages
  
  // Tables that reference other tables - delete these after their child tables but before parent tables
  'orders', // references addresses, users, customers, shippingMethods, taxRates
  'products', // references categories, brands (if any)
  'attributeValues', // references attributes
  
  // Independent tables - delete these last
  'cartSessions',
  'coupons',
  'discounts',
  'addresses', // referenced by orders
  'userProfiles', // references users
  'sessions', // references users
  'accounts', // references users
  'verificationTokens',
  'customers',
  'categories',
  'brands',
  'attributes', // referenced by attributeValues, productAttributes, variantAttributes
  'taxonomy',
  'shippingMethods', // referenced by orders
  'taxRates', // referenced by orders
  'paymentGateways', // referenced by paymentTransactionLogs, paymentGatewayHealthChecks
  'paymentSettings',
  'apiIntegrations',
  'adminUsers',
  'mainBanners',
  'mini_banners',
  'pages', // referenced by pageRevisions, pageCategoryRelations, pageAnalytics
  'pageCategories', // referenced by pageCategoryRelations
  'cartAbandonmentToggle',
  'dataModeSettings',
  'users' // referenced by orders, userProfiles, sessions, accounts, reviews, cartEvents
]

// Insertion order based on foreign key dependencies (parent tables first)
// This is the EXACT same order used by manual updates - PROVEN TO WORK!
const insertionOrder = [
  'users',
  'categories',
  'taxonomy',
  'brands',
  'settings',
  'taxRates',
  'shippingMethods',
  'adminUsers',
  'apiIntegrations',
  'paymentGateways',
  'paymentSettings',
  'dataModeSettings',
  'mainBanners',
  'mini_banners',
  'pages',
  'pageCategories',
  'cartAbandonmentToggle',
  'customers',
  'verificationTokens',
  'accounts',
  'sessions',
  'userProfiles',
  'addresses',
  'coupons',
  'discounts',
  'attributes',
  'attributeValues',
  'products',
  'orders',
  'productVariations',
  'productAttributes',
  'productAlternateImages',
  'variantAttributes',
  'orderItems',
  'reviews',
  'refunds',
  'cartSessions',
  'cartEvents',
  'cartsRecovered',
  'campaignEmails',
  'paymentTransactionLogs',
  'paymentGatewayHealthChecks',
  'pageRevisions',
  'pageCategoryRelations',
  'pageAnalytics'
]

// 🎯 AUTO-UPDATE NOW USES THE EXACT SAME API CALLS AS MANUAL UPDATE
// ✅ No more separate logic - both manual and auto use identical proven code paths
// ✅ Same error handling, same order, same individual API calls  
// ✅ Only difference: manual shows popup, auto shows progress API