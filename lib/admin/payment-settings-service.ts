// Dynamic imports for payment operations
const importDb = () => import('@/lib/db')
const importSchema = () => import('@/lib/db/schema')
const importDrizzle = () => import('drizzle-orm')

export async function getPaymentSettings() {
  const { db } = await importDb()
  const { paymentSettings } = await importSchema()
  const { eq } = await importDrizzle()
  
  return await db.select().from(paymentSettings).where(eq(paymentSettings.id, 1)).limit(1)
}

export async function updatePaymentSettings(data: any) {
  const { db } = await importDb()
  const { paymentSettings } = await importSchema()
  const { eq } = await importDrizzle()
  
  const existingSettings = await getPaymentSettings()
  
  if (existingSettings.length > 0) {
    return await db.update(paymentSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(paymentSettings.id, 1))
      .returning()
  } else {
    return await db.insert(paymentSettings)
      .values({ ...data, id: 1, createdAt: new Date(), updatedAt: new Date() })
      .returning()
  }
}