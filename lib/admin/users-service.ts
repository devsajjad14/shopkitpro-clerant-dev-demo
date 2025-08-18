// Dynamic imports for user operations
const importDb = () => import('@/lib/db')
const importSchema = () => import('@/lib/db/schema')
const importDrizzle = () => import('drizzle-orm')

export async function getAllAdminUsers(filters?: any) {
  const { db } = await importDb()
  const { adminUsers } = await importSchema()
  const { like, eq, desc } = await importDrizzle()
  
  let query = db.select().from(adminUsers)
  
  if (filters?.search) {
    query = query.where(like(adminUsers.email, `%${filters.search}%`))
  }
  
  if (filters?.role) {
    query = query.where(eq(adminUsers.role, filters.role))
  }
  
  return await query.orderBy(desc(adminUsers.createdAt))
}

export async function getUserById(id: string) {
  const { db } = await importDb()
  const { adminUsers } = await importSchema()
  const { eq } = await importDrizzle()
  
  return await db.select().from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1)
}

export async function createUser(userData: any) {
  const { db } = await importDb()
  const { adminUsers } = await importSchema()
  
  return await db.insert(adminUsers).values({
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning()
}

export async function updateUser(id: string, updates: any) {
  const { db } = await importDb()
  const { adminUsers } = await importSchema()
  const { eq } = await importDrizzle()
  
  return await db.update(adminUsers)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(adminUsers.id, id))
    .returning()
}

export async function deleteUser(id: string) {
  const { db } = await importDb()
  const { adminUsers } = await importSchema()
  const { eq } = await importDrizzle()
  
  return await db.delete(adminUsers)
    .where(eq(adminUsers.id, id))
    .returning()
}