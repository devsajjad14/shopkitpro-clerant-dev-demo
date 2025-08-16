'use server'
import { Product, Variation, AlternateImage } from '@/types/product-types'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'

export async function getRecommendedProducts(limit: number, dept: string): Promise<Product[]> {
  // Only fetch local products
  try {
    const deptValue = String(dept).trim()
    const dbProducts = await db.query.products.findMany({
      where: (p, { eq }) => eq(p.department, deptValue),
      limit,
    })
    return dbProducts.map((dbProduct) => ({
      ROW_NUMBER: 0,
      STARTINGROW: 0,
      ENDINGROW: 0,
      STYLE_ID: dbProduct.styleId,
      NAME: dbProduct.name || '',
      STYLE: dbProduct.style || '',
      QUANTITY_AVAILABLE: dbProduct.quantityAvailable || 0,
      ON_SALE: dbProduct.onSale || 'N',
      IS_NEW: dbProduct.isNew || 'N',
      SMALLPICTURE: dbProduct.smallPicture || '',
      MEDIUMPICTURE: dbProduct.mediumPicture || '',
      LARGEPICTURE: dbProduct.largePicture || '',
      DEPT: dbProduct.department || '',
      TYP: dbProduct.type || '',
      SUBTYP: dbProduct.subType || '',
      BRAND: dbProduct.brand || '',
      SELLING_PRICE: Number(dbProduct.sellingPrice),
      REGULAR_PRICE: Number(dbProduct.regularPrice),
      LONG_DESCRIPTION: dbProduct.longDescription || '',
      OF7: dbProduct.of7 || null,
      OF12: dbProduct.of12 || null,
      OF13: dbProduct.of13 || null,
      OF15: dbProduct.of15 || null,
      FORCE_BUY_QTY_LIMIT: dbProduct.forceBuyQtyLimit || null,
      LAST_RCVD: dbProduct.lastReceived || null,
      VARIATIONS: [],
      ALTERNATE_IMAGES: [],
    }))
  } catch (error) {
    console.error('[getRecommendedProducts] local DB error:', error)
    return []
  }
}
