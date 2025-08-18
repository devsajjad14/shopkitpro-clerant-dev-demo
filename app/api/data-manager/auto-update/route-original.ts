import { NextResponse } from 'next/server'

// Dynamic imports for heavy operations
const importAutoUpdateManager = () => import('@/lib/data-manager/auto-update-manager')
const importAutoUpdateProcessor = () => import('@/lib/data-manager/auto-update-processor')
const importProgressUpdater = () => import('@/app/api/data-manager/auto-update-progress/route')

export async function POST() {
  try {
    const {
      checkRateLimit, 
      checkStartupCooldown, 
      checkConcurrentUpdate,
      acquireUpdateLock,
      setCurrentUpdateProcess,
      releaseUpdateLock
    } = await importAutoUpdateManager()
    
    // Rate limiting check
    const rateLimitCheck = checkRateLimit()
    if (rateLimitCheck.blocked) {
      return NextResponse.json(rateLimitCheck.response!)
    }
    
    // Startup cooldown check
    const cooldownCheck = checkStartupCooldown()
    if (cooldownCheck.blocked) {
      return NextResponse.json(cooldownCheck.response!)
    }
    
    // Concurrent update check
    const concurrentCheck = checkConcurrentUpdate()
    if (concurrentCheck.blocked) {
      return NextResponse.json(concurrentCheck.response!)
    }

    acquireUpdateLock()

    const updateProcess = executeAutoUpdateProcess()
    setCurrentUpdateProcess(updateProcess)

    return await updateProcess

  } catch (error) {
    console.error('❌ Auto Update: Background update failed:', error)

    const { resetAutoUpdateProgress } = await importProgressUpdater()
    const { updateErrorStatus } = await importAutoUpdateManager()
    
    resetAutoUpdateProgress()
    await updateErrorStatus(error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Auto update failed'
    }, { status: 500 })
  } finally {
    const { releaseUpdateLock } = await importAutoUpdateManager()
    releaseUpdateLock()
  }
}

async function executeAutoUpdateProcess() {
  try {
    const { getUpdateConfig, updateErrorStatus } = await importAutoUpdateManager()
    const { checkUpdateInterval, processTableDeletion, processTableInsertion, finalizeUpdate, deletionOrder } = await importAutoUpdateProcessor()
    const { updateAutoUpdateProgress } = await importProgressUpdater()
    
    const config = await getUpdateConfig()
    if (!config) {
      return NextResponse.json({
        success: false,
        message: 'Auto update is disabled'
      })
    }

    console.log(`✅ Auto Update: Enabled with ${config.updateIntervalMinutes}min interval`)

    // Check update interval
    const intervalCheck = checkUpdateInterval(config)
    if (intervalCheck.blocked) {
      return NextResponse.json(intervalCheck.response!)
    }

    // Initialize progress tracking
    updateAutoUpdateProgress({
      isRunning: true,
      phase: 'deleting',
      startTime: Date.now(),
      totalTables: deletionOrder.length
    })
    
    // Update status to pending
    const { db } = await import('@/lib/db')
    const { dataUpdater } = await import('@/lib/db/schema')
    const { eq } = await import('drizzle-orm')
    
    await db.update(dataUpdater)
      .set({
        lastUpdateStatus: 'pending',
        lastUpdateMessage: 'Auto update in progress...',
        updatedAt: new Date()
      })
      .where(eq(dataUpdater.id, 1))

    // Process table deletions
    const deletionResult = await processTableDeletion()
    
    // Process table insertions
    const insertionResult = await processTableInsertion()

    // Finalize update
    await finalizeUpdate(deletionResult.totalDeleted, insertionResult.totalInserted, insertionResult.tablesProcessed)

    return NextResponse.json({
      success: true,
      message: 'Auto update completed successfully',
      data: {
        recordsDeleted: deletionResult.totalDeleted,
        recordsInserted: insertionResult.totalInserted,
        tablesProcessed: insertionResult.tablesProcessed,
        timestamp: new Date().toISOString()
      }
    })

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