// Dynamic imports for order operations
const importDb = () => import('@/lib/db')
const importSchema = () => import('@/lib/db/schema')
const importDrizzle = () => import('drizzle-orm')

export async function getAllOrders(filters?: any) {
  const { db } = await importDb()
  const { orders, users, addresses } = await importSchema()
  const { eq, like, and, or, desc } = await importDrizzle()
  
  let query = db.select().from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .leftJoin(addresses, eq(orders.addressId, addresses.id))
  
  if (filters?.search) {
    query = query.where(
      or(
        like(orders.orderNumber, `%${filters.search}%`),
        like(users.email, `%${filters.search}%`)
      )
    )
  }
  
  if (filters?.status) {
    query = query.where(eq(orders.status, filters.status))
  }
  
  return await query.orderBy(desc(orders.createdAt))
}

export async function getOrderById(id: string) {
  const { db } = await importDb()
  const { orders, orderItems, users, addresses } = await importSchema()
  const { eq } = await importDrizzle()
  
  const order = await db.select().from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .leftJoin(addresses, eq(orders.addressId, addresses.id))
    .where(eq(orders.id, id))
    .limit(1)
    
  if (order.length === 0) return null
  
  const items = await db.select().from(orderItems)
    .where(eq(orderItems.orderId, id))
    
  return { ...order[0], items }
}

export async function createOrder(orderData: any) {
  const { db } = await importDb()
  const { orders } = await importSchema()
  
  return await db.insert(orders).values({
    ...orderData,
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning()
}

export async function updateOrder(id: string, updates: any) {
  const { db } = await importDb()
  const { orders } = await importSchema()
  const { eq } = await importDrizzle()
  
  return await db.update(orders)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning()
}