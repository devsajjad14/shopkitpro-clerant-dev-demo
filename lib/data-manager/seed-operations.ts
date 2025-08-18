// Optimized seed operations

class SeedOperations {
  async seedTable(
    tableName: string, 
    data: any[], 
    schema: any, 
    db: any
  ): Promise<number> {
    try {
      // Get table from schema
      const table = this.getTableFromSchema(tableName, schema)
      if (!table) {
        throw new Error(`Table ${tableName} not found in schema`)
      }

      // Clear existing data first
      console.log(`🗑️ Clearing existing data for ${tableName}`)
      await db.delete(table)

      // Insert data in batches for better performance
      const batchSize = 100
      const batches = Math.ceil(data.length / batchSize)
      let totalInserted = 0

      for (let i = 0; i < batches; i++) {
        const start = i * batchSize
        const end = Math.min(start + batchSize, data.length)
        const batch = data.slice(start, end)

        // Transform data if needed
        const transformedBatch = this.transformSeedData(batch, tableName)

        if (transformedBatch.length > 0) {
          await db.insert(table).values(transformedBatch)
          totalInserted += transformedBatch.length
          console.log(`📦 Inserted batch ${i + 1}/${batches} for ${tableName} (${transformedBatch.length} records)`)
        }
      }

      return totalInserted

    } catch (error) {
      console.error(`❌ Error seeding ${tableName}:`, error)
      throw error
    }
  }

  private getTableFromSchema(tableName: string, schema: any): any {
    // Map table names to schema exports
    const tableMap: Record<string, string> = {
      'taxonomy': 'taxonomy',
      'attributes': 'attributes',
      'attribute_values': 'attributeValues',
      'brands': 'brands',
      'products': 'products',
      'product_alternate_images': 'productAlternateImages',
      'product_variations': 'productVariations',
      'settings': 'settings',
      'api_integration': 'apiIntegrations',
      'users': 'users',
      'user_profiles': 'userProfiles',
      'addresses': 'addresses',
      'data_mode_settings': 'dataModeSettings',
      'coupons': 'coupons',
      'reviews': 'reviews',
      'orders': 'orders',
      'order_items': 'orderItems'
    }

    const schemaName = tableMap[tableName]
    return schemaName ? schema[schemaName] : null
  }

  private transformSeedData(data: any[], tableName: string): any[] {
    // Basic data transformation for seed data
    return data.map(item => {
      const transformed: any = { ...item }

      // Handle timestamps
      if (transformed.createdAt && typeof transformed.createdAt === 'string') {
        transformed.createdAt = new Date(transformed.createdAt)
      }
      if (transformed.updatedAt && typeof transformed.updatedAt === 'string') {
        transformed.updatedAt = new Date(transformed.updatedAt)
      }

      // Handle boolean conversions
      const booleanFields = ['active', 'enabled', 'isDefault', 'emailVerified', 'isAdmin']
      booleanFields.forEach(field => {
        if (transformed[field] !== undefined) {
          transformed[field] = Boolean(transformed[field])
        }
      })

      // Handle numeric conversions
      const numericFields = ['price', 'salePrice', 'stock', 'weight', 'quantity', 'total']
      numericFields.forEach(field => {
        if (transformed[field] !== undefined && typeof transformed[field] === 'string') {
          const num = parseFloat(transformed[field])
          if (!isNaN(num)) {
            transformed[field] = num.toString()
          }
        }
      })

      return transformed
    })
  }
}

export default new SeedOperations()