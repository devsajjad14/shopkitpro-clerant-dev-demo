import { db, query } from '@/lib/db'
import { settings, adminUsers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { exec } from 'child_process'
import { promisify } from 'util'
import { tableExists, clearSetupStatusCache, markSetupCompleted, isSetupCompletedSync } from '@/lib/utils/setup-check'

const execAsync = promisify(exec)

export type SetupWizardData = {
  storeName: string
  storeEmail: string
  phoneNumber: string
  storeAddress: string
  siteTitle?: string
  description?: string
  keywords?: string
  adminName: string
  adminEmail: string
  adminPassword: string
  platform?: string
}

export async function checkDatabaseHealth() {
  try {
    await query(async () => {
      await db.execute('SELECT 1')
    })
    return { success: true, message: 'Database connection is healthy' }
  } catch (error: any) {
    console.error('Database health check failed:', error)
    return {
      success: false,
      error: 'Database connection failed',
      details: error.message
    }
  }
}

export async function checkIfSetupRequired() {
  try {
    // Use flag-based approach first - no database queries
    const setupCompleted = isSetupCompletedSync()

    if (!setupCompleted) {
      console.log('Setup flag not found, setup required')
      return {
        isSetupRequired: true,
        hasSettings: false,
        hasAdminUsers: false
      }
    }

    // If setup flag exists, let's verify tables actually exist
    // This ensures setup wizard appears even if flag exists but tables were deleted
    const tablesExist = await checkIfTablesExist()
    if (!tablesExist) {
      console.log('Setup flag exists but tables do not exist, setup required')
      return {
        isSetupRequired: true,
        hasSettings: false,
        hasAdminUsers: false
      }
    }

    // Setup is completed and tables exist
    console.log('Setup completed and tables exist')
    return {
      isSetupRequired: false,
      hasSettings: true,
      hasAdminUsers: true
    }
  } catch (error: any) {
    console.error('Setup check error:', error)
    // Always default to setup required for any error
    return {
      isSetupRequired: true,
      hasSettings: false,
      hasAdminUsers: false
    }
  }
}

export async function checkIfTablesExist(): Promise<boolean> {
  try {
    console.log('Checking if tables exist...')
    
    // Try to actually query the tables to see if they exist
    const settingsTableExists = await query(async () => {
      try {
        console.log('Checking settings table...')
        await db.select().from(settings).limit(1)
        console.log('Settings table exists')
        return true
      } catch (error: any) {
        if (error.code === '42P01') { // relation does not exist
          console.log('Settings table does not exist')
          return false
        }
        console.error('Error checking settings table:', error)
        throw error
      }
    })
    
    const adminUsersTableExists = await query(async () => {
      try {
        console.log('Checking admin_users table...')
        await db.select().from(adminUsers).limit(1)
        console.log('Admin users table exists')
        return true
      } catch (error: any) {
        if (error.code === '42P01') { // relation does not exist
          console.log('Admin users table does not exist')
          return false
        }
        console.error('Error checking admin_users table:', error)
        throw error
      }
    })
    
    const bothTablesExist = settingsTableExists && adminUsersTableExists
    console.log(`Table check result: settings=${settingsTableExists}, admin_users=${adminUsersTableExists}, both=${bothTablesExist}`)
    
    return bothTablesExist
  } catch (error) {
    console.error('Error checking if tables exist:', error)
    return false
  }
}

export async function initializeDatabase() {
  try {
    console.log('Initializing database...')
    
    // Always run drizzle-kit push to ensure tables are created
    // Don't skip even if tables seem to exist, as the check might be unreliable
    console.log('Running drizzle-kit push to create tables...')
    
    // Increase timeout to 90 seconds and add better error handling
    const { stdout, stderr } = await execAsync('npx drizzle-kit push', {
      cwd: process.cwd(),
      timeout: 90000 // 90 second timeout (increased from 60)
    })
    
    // Check if there are any real errors in stderr
    if (stderr && !stderr.includes('warning')) {
      console.error('Drizzle push stderr:', stderr)
      return { success: false, error: 'Database initialization failed' }
    }
    
    console.log('Database initialized successfully:', stdout)
    
    // Add a small delay to ensure tables are fully created
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Verify tables were actually created with retry logic
    let tablesExist = false
    let retryCount = 0
    const maxRetries = 3
    
    while (!tablesExist && retryCount < maxRetries) {
      console.log(`Checking if tables exist (attempt ${retryCount + 1}/${maxRetries})...`)
      tablesExist = await checkIfTablesExist()
      
      if (!tablesExist) {
        retryCount++
        if (retryCount < maxRetries) {
          console.log(`Tables not found, waiting 2 seconds before retry...`)
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
    }
    
    if (!tablesExist) {
      console.error('Tables were not created despite successful drizzle-kit push after retries')
      return { success: false, error: 'Database tables were not created' }
    }
    
    console.log('Tables verified successfully')
    return { success: true, message: 'Database initialized successfully' }
  } catch (error: any) {
    console.error('Database initialization error:', error)
    
    // Check if the command was killed by timeout but might have succeeded
    if (error.signal === 'SIGTERM' || error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      console.log('Database initialization timed out, checking if tables were created...')
      
      try {
        // Add a delay before checking to ensure any pending operations complete
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        // Check if tables were actually created despite the timeout with retry logic
        let tablesExist = false
        let retryCount = 0
        const maxRetries = 3
        
        while (!tablesExist && retryCount < maxRetries) {
          console.log(`Checking if tables exist after timeout (attempt ${retryCount + 1}/${maxRetries})...`)
          tablesExist = await checkIfTablesExist()
          
          if (!tablesExist) {
            retryCount++
            if (retryCount < maxRetries) {
              console.log(`Tables not found after timeout, waiting 2 seconds before retry...`)
              await new Promise(resolve => setTimeout(resolve, 2000))
            }
          }
        }
        
        if (tablesExist) {
          console.log('Tables were created successfully despite timeout')
          return { success: true, message: 'Database initialized successfully (tables created)' }
        } else {
          console.log('Tables were not created, timeout was real')
          return { success: false, error: 'Database initialization timed out' }
        }
      } catch (checkError) {
        console.error('Error checking table existence after timeout:', checkError)
        return { success: false, error: 'Database initialization timed out' }
      }
    }
    
    return { success: false, error: 'Failed to initialize database' }
  }
}

export async function createInitialSettings(data: SetupWizardData) {
  try {
    // Check if settings table exists before inserting using the same robust method
    const settingsTableExists = await query(async () => {
      try {
        await db.select().from(settings).limit(1)
        return true
      } catch (error: any) {
        if (error.code === '42P01') { // relation does not exist
          return false
        }
        throw error
      }
    })
    
    if (!settingsTableExists) {
      console.log('Settings table does not exist, skipping settings creation')
      return { success: false, error: 'Settings table does not exist' }
    }

    const settingsToInsert = [
      {
        key: 'siteTitle',
        value: data.siteTitle || data.storeName,
        type: 'string',
        group: 'general'
      },
      {
        key: 'description',
        value: data.description || `Welcome to ${data.storeName}`,
        type: 'string',
        group: 'general'
      },
      {
        key: 'keywords',
        value: data.keywords || '',
        type: 'string',
        group: 'general'
      },
      {
        key: 'storeName',
        value: data.storeName,
        type: 'string',
        group: 'store'
      },
      {
        key: 'storeEmail',
        value: data.storeEmail,
        type: 'string',
        group: 'store'
      },
      {
        key: 'phoneNumber',
        value: data.phoneNumber,
        type: 'string',
        group: 'store'
      },
      {
        key: 'storeAddress',
        value: data.storeAddress,
        type: 'string',
        group: 'store'
      },
      {
        key: 'mainBanners',
        value: '3',
        type: 'number',
        group: 'home'
      },
      {
        key: 'miniBanners',
        value: '3',
        type: 'number',
        group: 'home'
      },
      {
        key: 'featuredProducts',
        value: '8',
        type: 'number',
        group: 'home'
      },
      {
        key: 'brandLogos',
        value: '6',
        type: 'number',
        group: 'home'
      },
      {
        key: 'productsPerPage',
        value: '12',
        type: 'number',
        group: 'theme'
      },
      {
        key: 'relatedProducts',
        value: '4',
        type: 'number',
        group: 'theme'
      },
      {
        key: 'showBreadcrumbs',
        value: 'true',
        type: 'boolean',
        group: 'theme'
      },
      {
        key: 'showProductReviews',
        value: 'true',
        type: 'boolean',
        group: 'theme'
      },
      {
        key: 'showRelatedProducts',
        value: 'true',
        type: 'boolean',
        group: 'theme'
      },
      {
        key: 'defaultViewMode',
        value: 'grid',
        type: 'string',
        group: 'theme'
      },
      {
        key: 'enableFilters',
        value: 'true',
        type: 'boolean',
        group: 'theme'
      },
      {
        key: 'platform',
        value: data.platform || 'server',
        type: 'string',
        group: 'general'
      }
    ]

    await query(async () => {
      await db.insert(settings).values(settingsToInsert)
    })

    return { success: true }
  } catch (error) {
    console.error('Settings creation error:', error)
    return { success: false, error: 'Failed to create settings' }
  }
}

export async function createAdminUser(data: SetupWizardData) {
  try {
    // Check if admin_users table exists before inserting using the same robust method
    const adminUsersTableExists = await query(async () => {
      try {
        await db.select().from(adminUsers).limit(1)
        return true
      } catch (error: any) {
        if (error.code === '42P01') { // relation does not exist
          return false
        }
        throw error
      }
    })
    
    if (!adminUsersTableExists) {
      console.log('Admin users table does not exist, skipping admin user creation')
      return { success: false, error: 'Admin users table does not exist' }
    }

    const hashedPassword = await bcrypt.hash(data.adminPassword, 12)

    const adminUser = await query(async () => {
      return await db.insert(adminUsers).values({
        name: data.adminName,
        email: data.adminEmail,
        passwordHash: hashedPassword,
        role: 'admin',
        status: 'active',
        emailVerified: true,
        phoneNumber: data.phoneNumber,
        address: data.storeAddress
      }).returning()
    })

    return { success: true, user: adminUser[0] }
  } catch (error) {
    console.error('Admin user creation error:', error)
    return { success: false, error: 'Failed to create admin user' }
  }
}

export async function completeSetup(data: SetupWizardData) {
  try {
    // Create settings first
    const settingsResult = await createInitialSettings(data)
    if (!settingsResult.success) {
      return settingsResult
    }

    // Create admin user
    const adminResult = await createAdminUser(data)
    if (!adminResult.success) {
      return adminResult
    }

    // Mark setup as completed using flag file
    markSetupCompleted()

    // Clear setup status cache after successful setup
    clearSetupStatusCache()

    return {
      success: true,
      user: adminResult.user,
      message: 'Setup completed successfully'
    }
  } catch (error) {
    console.error('Setup completion error:', error)
    return { success: false, error: 'Failed to complete setup' }
  }
} 