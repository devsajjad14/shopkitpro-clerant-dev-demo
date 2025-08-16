'use server'

import { Product } from '@/types/product-types'
import { FiltersList, TaxonomyItem } from '@/types/taxonomy.types'
import { Redis } from '@upstash/redis'
import { db } from '@/lib/db'
import {
  products,
  taxonomy,
  productVariations,
  productAttributes,
  variantAttributes,
} from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getProductsLocal } from './getproductsByUrl_local'

interface Props {
  currentTaxonomy: TaxonomyItem
  filtersList: FiltersList[]
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

// Smart search function with fuzzy matching
const smartSearch = (products: Product[], searchTerm: string): Product[] => {
  if (!searchTerm) return products

  const normalizedSearch = searchTerm.toLowerCase().trim()
  const searchRegex = new RegExp(
    normalizedSearch
      .split('')
      .map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('.*?'),
    'i'
  )

  return products.filter((product) => {
    const nameMatch = product.NAME?.match(searchRegex)
    const brandMatch = product.BRAND?.match(searchRegex)
    const score = (nameMatch ? 1 : 0) + (brandMatch ? 2 : 0)
    return score > 0
  })
}

// Helper function to ensure a parameter is always an array and decode each item
const ensureArray = (param: string | string[] | undefined): string[] => {
  if (!param) return []

  // Handle comma-separated string
  if (typeof param === 'string') {
    return param.split(',').map((item) => decodeURIComponent(item.trim()))
  }

  // Handle array of strings
  return param.map((item) => (item ? decodeURIComponent(item) : item))
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

const CACHE_TTL = 3600 * 24 // 24 hours in seconds

// In-memory cache for faster access
const inMemoryCache: {
  [key: string]: {
    products: Product[]
    timestamp: number
  }
} = {}

// Add this function to get taxonomy data by ID
async function getTaxonomyById(taxonomyId: string) {
  try {
    const result = await db
      .select()
      .from(taxonomy)
      .where(eq(taxonomy.WEB_TAXONOMY_ID, parseInt(taxonomyId)))
    return result[0] || null
  } catch (error) {
    console.error('Error fetching taxonomy by ID:', error)
    return null
  }
}

// Add this function to get category display name from taxonomy
function getCategoryDisplayName(taxonomyItem: any) {
  if (!taxonomyItem) return ''

  const hierarchy = []
  if (taxonomyItem.DEPT && taxonomyItem.DEPT !== 'EMPTY') {
    hierarchy.push(taxonomyItem.DEPT)
  }
  if (taxonomyItem.TYP && taxonomyItem.TYP !== 'EMPTY') {
    hierarchy.push(taxonomyItem.TYP)
  }
  if (taxonomyItem.SUBTYP_1 && taxonomyItem.SUBTYP_1 !== 'EMPTY') {
    hierarchy.push(taxonomyItem.SUBTYP_1)
  }
  if (taxonomyItem.SUBTYP_2 && taxonomyItem.SUBTYP_2 !== 'EMPTY') {
    hierarchy.push(taxonomyItem.SUBTYP_2)
  }
  if (taxonomyItem.SUBTYP_3 && taxonomyItem.SUBTYP_3 !== 'EMPTY') {
    hierarchy.push(taxonomyItem.SUBTYP_3)
  }

  return hierarchy.join(' > ') || taxonomyItem.DEPT || ''
}

export const getProducts = async (args: Props): Promise<{
  products: Product[]
  totalPages: number
  productCount: number
  isLoading: boolean
}> => {
  return getProductsLocal(args)
}
