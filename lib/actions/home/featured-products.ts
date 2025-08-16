import { db, query } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { Product } from '@/types/product-types'
import { sql } from 'drizzle-orm'
import { safeDataLoader } from '@/lib/utils/setup-check'

export const getFeaturedProducts = async (limit: number): Promise<Product[]> => {
  return await safeDataLoader(
    async () => {
      // Fallback: select the most recent products if there is no isFeatured field
      const dbProducts = await db
        .select()
        .from(products)
        .orderBy(sql`created_at DESC`)
        .limit(limit)
      // Map DB products to Product type expected by the frontend
      return dbProducts.map((p, idx) => ({
        ROW_NUMBER: idx + 1,
        STARTINGROW: 1,
        ENDINGROW: limit,
        STYLE_ID: p.styleId,
        NAME: p.name,
        STYLE: p.style,
        QUANTITY_AVAILABLE: p.quantityAvailable,
        ON_SALE: p.onSale,
        IS_NEW: p.isNew,
        SMALLPICTURE: p.smallPicture || '',
        MEDIUMPICTURE: p.mediumPicture || '',
        LARGEPICTURE: p.largePicture || '',
        DEPT: p.department || '',
        TYP: p.type || '',
        SUBTYP: p.subType || '',
        BRAND: p.brand || '',
        OF7: p.of7 || '',
        OF12: p.of12 || '',
        OF13: p.of13 || '',
        OF15: p.of15 || '',
        FORCE_BUY_QTY_LIMIT: p.forceBuyQtyLimit || '',
        LAST_RCVD: p.lastReceived || '',
        SELLING_PRICE: Number(p.sellingPrice) || 0,
        REGULAR_PRICE: Number(p.regularPrice) || 0,
        LONG_DESCRIPTION: p.longDescription || '',
        VARIATIONS: [],
        ALTERNATE_IMAGES: [],
      }))
    },
    [] // Return empty array if setup is required
  )
}
