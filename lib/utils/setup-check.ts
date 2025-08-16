import { db, query } from '@/lib/db'
import { writeFileSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'

// Global setup status cache
let setupStatusCache: { isRequired: boolean; timestamp: number } | null = null
const CACHE_DURATION = 5000 // 5 seconds

// Setup flag file path
const SETUP_FLAG_FILE = join(process.cwd(), '.setup-completed')

// Check if setup has been completed by looking for a flag file
export function isSetupCompletedSync(): boolean {
  try {
    // Check if setup flag file exists
    if (existsSync(SETUP_FLAG_FILE)) {
      return true
    }
    
    // Check environment variable as fallback
    if (process.env.SHOPKIT_SETUP_COMPLETED === 'true') {
      return true
    }
    
    return false
  } catch (error) {
    console.log('Setup flag check failed:', error)
    return false
  }
}

// Mark setup as completed
export function markSetupCompleted(): void {
  try {
    writeFileSync(SETUP_FLAG_FILE, new Date().toISOString())
    console.log('Setup marked as completed')
  } catch (error) {
    console.error('Failed to mark setup as completed:', error)
  }
}

// Clear setup flag (useful when tables are deleted)
export function clearSetupFlag(): void {
  try {
    if (existsSync(SETUP_FLAG_FILE)) {
      const fs = require('fs')
      fs.unlinkSync(SETUP_FLAG_FILE)
      console.log('Setup flag cleared')
    }
    
    // Also clear environment variable if set
    if (process.env.SHOPKIT_SETUP_COMPLETED) {
      delete process.env.SHOPKIT_SETUP_COMPLETED
    }
    
    // Clear any cached setup status
    clearSetupStatusCache()
  } catch (error) {
    console.error('Failed to clear setup flag:', error)
  }
}

// Check if setup has been completed
export async function isSetupCompleted(): Promise<boolean> {
  return isSetupCompletedSync()
}

// Ultra-safe setup check that doesn't touch the database at all
export async function isSetupRequiredUltraSafe(): Promise<boolean> {
  // Check cache first
  if (setupStatusCache && Date.now() - setupStatusCache.timestamp < CACHE_DURATION) {
    return setupStatusCache.isRequired
  }

  // Check if setup is completed using flag file
  const setupCompleted = isSetupCompletedSync()
  const setupRequired = !setupCompleted
  
  setupStatusCache = {
    isRequired: setupRequired,
    timestamp: Date.now()
  }
  
  return setupRequired
}

// Check database connection health without querying specific tables
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await query(async () => {
      await db.execute('SELECT 1')
    })
    return true
  } catch (error: any) {
    console.log('Database health check failed:', error.message)
    return false
  }
}

// Check if a table exists in the database using a safer approach
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    // First check if database is accessible
    const isHealthy = await checkDatabaseHealth()
    if (!isHealthy) {
      console.log('Database not healthy, assuming table does not exist')
      return false
    }

    // Use a more defensive query approach
    await query(async () => {
      await db.execute(`SELECT 1 FROM information_schema.tables WHERE table_name = '${tableName}' LIMIT 1`)
    })
    return true
  } catch (error: any) {
    console.log(`Table ${tableName} does not exist or database error:`, error.message)
    return false
  }
}

// Check if setup is required (if any required tables don't exist)
export async function isSetupRequired(): Promise<boolean> {
  // Check cache first
  if (setupStatusCache && Date.now() - setupStatusCache.timestamp < CACHE_DURATION) {
    return setupStatusCache.isRequired
  }

  try {
    // First check database health
    const isHealthy = await checkDatabaseHealth()
    if (!isHealthy) {
      console.log('Database not healthy, setup required')
      setupStatusCache = {
        isRequired: true,
        timestamp: Date.now()
      }
      return true
    }

    // Check if required tables exist
    const settingsTableExists = await tableExists('settings')
    const adminUsersTableExists = await tableExists('admin_users')
    
    const setupRequired = !settingsTableExists || !adminUsersTableExists
    
    // Cache the result
    setupStatusCache = {
      isRequired: setupRequired,
      timestamp: Date.now()
    }
    
    return setupRequired
  } catch (error) {
    console.error('Error checking setup status:', error)
    // Default to setup required if there's any error
    setupStatusCache = {
      isRequired: true,
      timestamp: Date.now()
    }
    return true
  }
}

// Clear setup status cache (useful after setup completion)
export function clearSetupStatusCache() {
  setupStatusCache = null
}

// Safe data loader - returns empty data if setup is required
export async function safeDataLoader<T>(
  loader: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    // Use synchronous flag check for instant response
    const setupCompleted = isSetupCompletedSync()
    if (!setupCompleted) {
      console.log('Setup required (flag-based), returning fallback data immediately')
      return fallback
    }
    
    // Only execute the loader if setup is completed
    return await loader()
  } catch (error) {
    console.error('Error in safe data loader:', error)
    return fallback
  }
}

// Force check setup status (bypasses cache)
export async function forceCheckSetupStatus(): Promise<boolean> {
  setupStatusCache = null
  return await isSetupRequired()
}

// Emergency fallback - always returns true if any error occurs
export async function isSetupRequiredSafe(): Promise<boolean> {
  try {
    return await isSetupRequired()
  } catch (error) {
    console.error('Emergency setup check failed:', error)
    return true // Always require setup if anything goes wrong
  }
} 