// IMPORTANT: If you seed or import data with explicit WEB_TAXONOMY_ID values, run this SQL ONCE after seeding:
//
// DO $$
// DECLARE
//   seq_name text;
// BEGIN
//   SELECT pg_get_serial_sequence('taxonomy', 'WEB_TAXONOMY_ID') INTO seq_name;
//   EXECUTE format('SELECT setval(%L, (SELECT COALESCE(MAX("WEB_TAXONOMY_ID"), 0) + 1 FROM taxonomy), false)', seq_name);
// END$$;
//
// This ensures the sequence is in sync. Do NOT reset the sequence in API code.

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { taxonomy } from '@/lib/db/schema/taxonomy'
import { eq, sql } from 'drizzle-orm'
import { inMemoryCache, redis } from '@/lib/cache/taxonomy-cache'

export async function GET() {
  try {
    const categories = await db.select().from(taxonomy)
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.DEPT || !data.WEB_URL) {
      return NextResponse.json(
        { error: 'DEPT and WEB_URL are required' },
        { status: 400 }
      )
    }

    // Check for duplicate WEB_URL
    const existingCategory = await db
      .select()
      .from(taxonomy)
      .where(eq(taxonomy.WEB_URL, data.WEB_URL))
      .limit(1)

    if (existingCategory.length > 0) {
      return NextResponse.json(
        { error: 'A category with this URL already exists' },
        { status: 400 }
      )
    }

    // Get the current max WEB_TAXONOMY_ID
    const maxIdResult = await db
      .select({ maxId: sql<number>`MAX("WEB_TAXONOMY_ID")` })
      .from(taxonomy)
    let newId = (maxIdResult[0]?.maxId || 9999) + 1
    if (newId < 10000) newId = 10000

    // Ensure newId is not already taken (in case of legacy data)
    while (true) {
      const exists = await db
        .select()
        .from(taxonomy)
        .where(eq(taxonomy.WEB_TAXONOMY_ID, newId))
        .limit(1)
      if (exists.length === 0) break
      newId++
    }

    // Set default values for optional fields
    const categoryData = {
      ...data,
      WEB_TAXONOMY_ID: newId,
      TYP: data.TYP || 'EMPTY',
      SUBTYP_1: data.SUBTYP_1 || 'EMPTY',
      SUBTYP_2: data.SUBTYP_2 || 'EMPTY',
      SUBTYP_3: data.SUBTYP_3 || 'EMPTY',
      ACTIVE: data.ACTIVE ?? 1,
      SHORT_DESC: data.SHORT_DESC || '',
      LONG_DESCRIPTION: data.LONG_DESCRIPTION || '',
      META_TAGS: data.META_TAGS || '',
      SITE: 1
    }

    // Insert the new category
    const [newCategory] = await db.insert(taxonomy).values(categoryData).returning()

    // Purge taxonomy caches (in-memory and Redis)
    inMemoryCache.local = null
    inMemoryCache.remote = null
    try {
      await redis.del('taxonomy-data-local')
      await redis.del('taxonomy-data-remote')
    } catch (cacheError) {
      console.error('Failed to clear taxonomy Redis cache:', cacheError)
    }

    // Trigger cache revalidation for homepage and categories page
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || ''
    try {
      await fetch(`${baseUrl}/api/revalidate?path=/`, { method: 'POST' })
      await fetch(`${baseUrl}/api/revalidate?path=/categories`, { method: 'POST' })
    } catch (revalError) {
      console.error('Cache revalidation failed:', revalError)
    }

    return NextResponse.json(newCategory)
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
} 