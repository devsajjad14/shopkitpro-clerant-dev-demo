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
    const { getUpdateConfig } = await importAutoUpdateManager()
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

  } catch (error) {
    console.error('❌ Auto Update: Execute process failed:', error)
    
    const { updateErrorStatus } = await importAutoUpdateManager()
    await updateErrorStatus(error)

    throw error // Re-throw to be handled by the main catch block
  }
}

// 🎯 AUTO-UPDATE NOW USES THE EXACT SAME API CALLS AS MANUAL UPDATE
// ✅ No more separate logic - both manual and auto use identical proven code paths
// ✅ Same error handling, same order, same individual API calls  
// ✅ Only difference: manual shows popup, auto shows progress API