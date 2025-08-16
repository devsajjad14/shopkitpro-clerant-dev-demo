'use server'

import { TaxonomyItem } from '@/types/taxonomy.types'
import { db, query } from '@/lib/db'
import { taxonomy } from '@/lib/db/schema'
import { inMemoryCache, redis } from '@/lib/cache/taxonomy-cache'
import { safeDataLoader } from '@/lib/utils/setup-check'

const CACHE_TTL_SECONDS = 3600 * 24 * 7 // 7 days
const API_URL =
  'https://www.alumnihall.com/mobileapi/api.cfc?method=getWebTaxonomy'

const streamResponse = async (res: Response): Promise<string> => {
  const reader = res.body?.getReader()
  if (!reader) throw new Error('Failed to get readable stream')

  const decoder = new TextDecoder()
  let result = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    result += decoder.decode(value, { stream: true })
  }

  return result
}

export const fetchTaxonomyData = async (): Promise<TaxonomyItem[]> => {
  // Use in-memory cache for local DB queries
  if (inMemoryCache.local) {
    return inMemoryCache.local
  }

  return await safeDataLoader(
    async () => {
      const localTaxonomy = await db.select().from(taxonomy)
      // Map DLU (Date|null) to string|null for TaxonomyItem compatibility
      const mappedTaxonomy = localTaxonomy.map(item => ({
        ...item,
        DLU: item.DLU ? item.DLU.toISOString() : null,
      }))
      inMemoryCache.local = mappedTaxonomy as unknown as TaxonomyItem[]
      return inMemoryCache.local
    },
    [] // Return empty array if setup is required
  )
}
