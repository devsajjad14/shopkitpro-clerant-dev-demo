import { Redis } from '@upstash/redis'
import { TaxonomyItem } from '@/types/taxonomy.types'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const inMemoryCache: { local: TaxonomyItem[] | null } = { local: null } 