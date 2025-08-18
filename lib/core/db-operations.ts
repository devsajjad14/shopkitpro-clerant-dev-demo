export const tableInsertionOrder = [
  'stores',
  'users', 
  'categories',
  'brands',
  'banners',
  'pages',
  'products',
  'product_variants',
  'orders',
  'order_items',
  'reviews',
  'coupons',
  'menus',
  'faqs',
  'notifications'
] as const

export const deletionOrder = [...tableInsertionOrder].reverse()

export type TableName = typeof tableInsertionOrder[number]

export async function executeInBatches<T>(
  items: T[],
  batchSize: number,
  executor: (batch: T[]) => Promise<void>
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    await executor(batch)
  }
}