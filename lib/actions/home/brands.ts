// lib/actions/home/brands.ts
import { db, query } from '@/lib/db'
import { brands } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'
import { safeDataLoader } from '@/lib/utils/setup-check'

export async function getBrands(limit: number = 8): Promise<any[]> {
  return await safeDataLoader(
    async () => {
      const dbBrands = await db
        .select()
        .from(brands)
        .where(sql`status = 'active'`)
        .orderBy(sql`created_at DESC`)
        .limit(limit)
      return dbBrands.map((b) => ({
        name: b.name,
        imageUrl: b.logo || '/default-logo.jpg',
        url: `/search?brand=${encodeURIComponent(b.alias)}`,
      }))
    },
    [] // Return empty array if setup is required
  )
}
