// Dynamic imports for database operations
const importDb = () => import('@/lib/db')
const importSchema = () => import('@/lib/db/schema')

interface DeleteResult {
  status: string
  message: string
  count: number
}

export async function performSeedDeletion(): Promise<Record<string, DeleteResult>> {
  const { db } = await importDb()
  const { 
    products, 
    productAlternateImages,
    productVariations,
    brands,
    apiIntegrations,
    coupons,
    reviews,
    attributes,
    attributeValues,
    userProfiles,
    addresses,
    settings,
    dataModeSettings,
    taxonomy,
    users,
    orders,
    orderItems
  } = await importSchema()

  console.log('Starting data deletion...')
  const results: Record<string, DeleteResult> = {}

  // Deletion order based on dependencies
  const deletionTasks = [
    { name: 'reviews', table: reviews },
    { name: 'orderItems', table: orderItems },
    { name: 'orders', table: orders },
    { name: 'coupons', table: coupons },
    { name: 'productAlternateImages', table: productAlternateImages },
    { name: 'productVariations', table: productVariations },
    { name: 'products', table: products },
    { name: 'attributeValues', table: attributeValues },
    { name: 'attributes', table: attributes },
    { name: 'brands', table: brands },
    { name: 'taxonomy', table: taxonomy },
    { name: 'addresses', table: addresses },
    { name: 'userProfiles', table: userProfiles },
    { name: 'users', table: users },
    { name: 'apiIntegrations', table: apiIntegrations },
    { name: 'dataModeSettings', table: dataModeSettings },
    { name: 'settings', table: settings }
  ]

  for (const task of deletionTasks) {
    try {
      console.log(`Deleting ${task.name}...`)
      await db.delete(task.table)
      results[task.name] = {
        status: 'completed',
        message: `Successfully deleted ${task.name}`,
        count: 0
      }
    } catch (error) {
      console.error(`Error deleting ${task.name}:`, error)
      results[task.name] = {
        status: 'error',
        message: `Failed to delete ${task.name}`,
        count: 0
      }
      throw new Error(`Failed to delete ${task.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return results
}