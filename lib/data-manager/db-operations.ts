// Optimized database operations with lazy loading
import { db } from '@/lib/db'
import { readFile } from 'fs/promises'
import { join } from 'path'

// Lazy load database schema imports
const loadDbSchema = async () => {
  const { 
    accounts, products, categories, orders, customers, taxonomy,
    attributes, attributeValues, brands, settings, reviews, addresses,
    users, sessions, userProfiles, verificationTokens, productVariations,
    productAlternateImages, productAttributes, variantAttributes, taxRates,
    orderItems, refunds, coupons, adminUsers, shippingMethods, apiIntegrations,
    discounts, paymentGateways, paymentSettings, paymentTransactionLogs,
    paymentGatewayHealthChecks, dataModeSettings, mainBanners, mini_banners,
    pages, pageRevisions, pageCategories, pageCategoryRelations, pageAnalytics,
    cartAbandonmentToggle, cartSessions, cartEvents, cartsRecovered, campaignEmails
  } = await import('@/lib/db/schema')
  
  return {
    accounts, products, categories, orders, customers, taxonomy,
    attributes, attributeValues, brands, settings, reviews, addresses,
    users, sessions, userProfiles, verificationTokens, productVariations,
    productAlternateImages, productAttributes, variantAttributes, taxRates,
    orderItems, refunds, coupons, adminUsers, shippingMethods, apiIntegrations,
    discounts, paymentGateways, paymentSettings, paymentTransactionLogs,
    paymentGatewayHealthChecks, dataModeSettings, mainBanners, mini_banners,
    pages, pageRevisions, pageCategories, pageCategoryRelations, pageAnalytics,
    cartAbandonmentToggle, cartSessions, cartEvents, cartsRecovered, campaignEmails
  }
}

// Lazy load data transformers
const loadTransformers = async () => {
  return await import('./data-transformers')
}

class DatabaseOperations {
  private schema: any = null
  private transformers: any = null

  private async ensureLoaded() {
    if (!this.schema) {
      this.schema = await loadDbSchema()
    }
    if (!this.transformers) {
      this.transformers = await loadTransformers()
    }
  }

  async insertTableData(tableName: string, data: any[], clearExisting: boolean = true): Promise<boolean> {
    try {
      await this.ensureLoaded()

      // Get table schema
      const table = this.schema[tableName]
      if (!table) {
        throw new Error(`Table ${tableName} not found in schema`)
      }

      if (!Array.isArray(data) || data.length === 0) {
        console.log(`⚠️ No data provided for ${tableName}`)
        return true
      }

      // Clear existing data if requested
      if (clearExisting) {
        console.log(`🗑️ Clearing existing data for ${tableName}`)
        await db.delete(table)
      }

      // Insert new data in batches
      const batchSize = 100
      const batches = Math.ceil(data.length / batchSize)

      console.log(`📦 Inserting ${data.length} records in ${batches} batches for ${tableName}`)

      for (let i = 0; i < batches; i++) {
        const start = i * batchSize
        const end = Math.min(start + batchSize, data.length)
        const batch = data.slice(start, end)

        // Transform data
        const transformedBatch = await this.transformBatch(batch, tableName)

        // Insert batch
        if (transformedBatch.length > 0) {
          await db.insert(table).values(transformedBatch)
          console.log(`✅ Inserted batch ${i + 1}/${batches} for ${tableName}`)
        }
      }

      console.log(`🎉 Successfully inserted ${data.length} records for ${tableName}`)
      return true

    } catch (error) {
      console.error(`❌ Error inserting data for ${tableName}:`, error)
      return false
    }
  }

  async processTable(tableName: string, dataPath: string): Promise<boolean> {
    try {
      await this.ensureLoaded()

      // Get table schema
      const table = this.schema[tableName]
      if (!table) {
        throw new Error(`Table ${tableName} not found in schema`)
      }

      // Load data file
      const filePath = join(dataPath, `${tableName}.json`)
      const fileContent = await readFile(filePath, 'utf-8')
      const jsonData = JSON.parse(fileContent)

      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        console.log(`⚠️ No data found for ${tableName}`)
        return true
      }

      // Clear existing data
      console.log(`🗑️ Clearing existing data for ${tableName}`)
      await db.delete(table)

      // Insert new data in batches
      const batchSize = 100
      const batches = Math.ceil(jsonData.length / batchSize)

      console.log(`📦 Inserting ${jsonData.length} records in ${batches} batches for ${tableName}`)

      for (let i = 0; i < batches; i++) {
        const start = i * batchSize
        const end = Math.min(start + batchSize, jsonData.length)
        const batch = jsonData.slice(start, end)

        // Transform data based on table type
        const transformedBatch = await this.transformBatch(batch, tableName)

        // Insert batch
        if (transformedBatch.length > 0) {
          await db.insert(table).values(transformedBatch)
          console.log(`✅ Inserted batch ${i + 1}/${batches} for ${tableName}`)
        }
      }

      console.log(`🎉 Successfully processed ${jsonData.length} records for ${tableName}`)
      return true

    } catch (error) {
      console.error(`❌ Error processing ${tableName}:`, error)
      return false
    }
  }

  private async transformBatch(batch: any[], tableName: string): Promise<any[]> {
    // Simple transformation based on table type
    // This is a minimal version - full transformations would be in separate modules
    return batch.map(item => {
      const transformed: any = { ...item }

      // Basic timestamp transformation
      for (const field of ['createdAt', 'updatedAt', 'DLU']) {
        if (transformed[field]) {
          const timestamp = this.transformers.parseTimestamp(transformed[field])
          if (timestamp) {
            transformed[field] = timestamp
          }
        }
      }

      // Basic boolean transformation
      for (const field of ['active', 'enabled', 'isDefault', 'emailVerified']) {
        if (transformed[field] !== undefined) {
          transformed[field] = this.transformers.parseBoolean(transformed[field])
        }
      }

      return transformed
    })
  }
}

// Export singleton instance
export default new DatabaseOperations()