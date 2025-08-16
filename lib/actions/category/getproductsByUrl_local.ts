'use server'

import { Product } from '@/types/product-types'
import { FiltersList, TaxonomyItem } from '@/types/taxonomy.types'
import { db } from '@/lib/db'
import { products, taxonomy, productVariations, productAttributes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

interface Props {
  currentTaxonomy: TaxonomyItem
  filtersList: FiltersList[]
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
  dataMode?: 'local'
}

const ensureArray = (param: string | string[] | undefined): string[] => {
  if (!param) return []
  if (typeof param === 'string') {
    return param.split(',').map((item) => decodeURIComponent(item.trim()))
  }
  return param.map((item) => (item ? decodeURIComponent(item) : item))
}

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

function getCategoryDisplayName(taxonomyItem: any) {
  if (!taxonomyItem) return ''
  const hierarchy = []
  if (taxonomyItem.DEPT && taxonomyItem.DEPT !== 'EMPTY') hierarchy.push(taxonomyItem.DEPT)
  if (taxonomyItem.TYP && taxonomyItem.TYP !== 'EMPTY') hierarchy.push(taxonomyItem.TYP)
  if (taxonomyItem.SUBTYP_1 && taxonomyItem.SUBTYP_1 !== 'EMPTY') hierarchy.push(taxonomyItem.SUBTYP_1)
  if (taxonomyItem.SUBTYP_2 && taxonomyItem.SUBTYP_2 !== 'EMPTY') hierarchy.push(taxonomyItem.SUBTYP_2)
  if (taxonomyItem.SUBTYP_3 && taxonomyItem.SUBTYP_3 !== 'EMPTY') hierarchy.push(taxonomyItem.SUBTYP_3)
  return hierarchy.join(' > ') || taxonomyItem.DEPT || ''
}

export const getProductsLocal = async ({
  currentTaxonomy,
  filtersList,
  params,
  searchParams,
  dataMode = 'local',
}: Props): Promise<{
  products: Product[]
  totalPages: number
  productCount: number
  isLoading: boolean
}> => {
  const perPage = parseInt(searchParams?.perPage as string) || 8
  const page = parseInt(searchParams?.page as string) || 1
  const sortBy = (searchParams?.sortBy as string) || 'nameAZ'
  const searchTerm = (searchParams?.search as string) || ''
  const offset = (page - 1) * perPage
  const isAllProducts = perPage === 1000
  try {
    let dbQuery = db.select().from(products)
    if (currentTaxonomy?.WEB_TAXONOMY_ID) {
      dbQuery = dbQuery.where(eq(products.department, String(currentTaxonomy.WEB_TAXONOMY_ID)))
    }
    const dbProducts = await dbQuery
    const filteredDbProducts = dbProducts.filter((product) => {
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
      return true
    })
    const mappedProducts = await Promise.all(
      filteredDbProducts.map(async (product, idx) => {
        let categoryName = ''
        if (product.department) {
          const taxonomyData = await getTaxonomyById(product.department)
          categoryName = getCategoryDisplayName(taxonomyData)
        }
        const dbProductVariations: any[] = await db.query.productVariations.findMany({
          where: eq(productVariations.productId, product.id),
          with: {
            attributes: {
              with: {
                attribute: true,
                attributeValue: true,
              },
            },
          },
        })
        dbProductVariations.forEach((variation: any) => {
        })
        const variations = dbProductVariations.map((variation: any) => {
          const variationData: any = {
            SKU: variation.sku || '',
            SKU_ID: variation.skuId ? Number(variation.skuId) : 0,
            BARCODE: variation.barcode || '',
            PRICE: variation.price ? Number(variation.price) : 0,
            QUANTITY: variation.quantity || 0,
            COLOR_IMAGE: variation.colorImage || '',
            AVAILABLE: variation.available || false,
            CREATED_AT: variation.createdAt || null,
            UPDATED_AT: variation.updatedAt || null,
            COLOR: variation.COLOR || '',
            SIZE: variation.SIZE || '',
            sku: variation.sku ? String(variation.sku) : '',
          }
          variation.attributes.forEach((va: any) => {
            const attrName = va.attribute.name.toUpperCase()
            const attrValue = va.attributeValue.value
            if (!variationData[attrName]) {
              variationData[attrName] = attrValue
            }
          })
          return variationData
        })
        const dbProductAttributes: any[] = await db.query.productAttributes.findMany({
          where: eq(productAttributes.productId, product.id),
          with: {
            attribute: true,
            attributeValue: true,
          },
        })
        if (dbProductAttributes.length > 0) {
          if (variations.length === 0) {
            const defaultVariation: any = {}
            dbProductAttributes.forEach((pa: any) => {
              const attrName = pa.attribute.name.toUpperCase()
              const attrValue = pa.attributeValue.value
              defaultVariation[attrName] = attrValue
            })
            variations.push(defaultVariation)
          } else {
            variations.forEach((variation: any) => {
              dbProductAttributes.forEach((pa: any) => {
                const attrName = pa.attribute.name.toUpperCase()
                const attrValue = pa.attributeValue.value
                if (
                  variation[attrName] === undefined ||
                  variation[attrName] === null ||
                  variation[attrName] === ''
                ) {
                  variation[attrName] = attrValue
                }
              })
            })
          }
        }
        return {
          ROW_NUMBER: idx + 1,
          STARTINGROW: 0,
          ENDINGROW: 0,
          STYLE_ID: product.styleId,
          NAME: product.name,
          STYLE: product.style,
          QUANTITY_AVAILABLE: product.quantityAvailable,
          ON_SALE: product.onSale,
          IS_NEW: product.isNew,
          SMALLPICTURE: product.smallPicture
            ? product.smallPicture.startsWith('http')
              ? product.smallPicture
              : `/uploads/products/${product.smallPicture}`
            : '',
          MEDIUMPICTURE: product.mediumPicture
            ? product.mediumPicture.startsWith('http')
              ? product.mediumPicture
              : `/uploads/products/${product.mediumPicture}`
            : '',
          LARGEPICTURE: product.largePicture
            ? product.largePicture.startsWith('http')
              ? product.largePicture
              : `/uploads/products/${product.largePicture}`
            : '',
          DEPT: categoryName,
          TYP: product.type || '',
          SUBTYP: product.subType || '',
          BRAND: (product.brand || '') + '',
          OF7: product.of7,
          OF12: product.of12,
          OF13: product.of13,
          OF15: product.of15,
          FORCE_BUY_QTY_LIMIT: product.forceBuyQtyLimit,
          LAST_RCVD: product.lastReceived,
          SELLING_PRICE: Number(product.sellingPrice),
          REGULAR_PRICE: Number(product.regularPrice),
          LONG_DESCRIPTION: product.longDescription || '',
          VARIATIONS: variations,
          ALTERNATE_IMAGES: [],
        }
      })
    )
    const sortedProducts = [...mappedProducts].sort((a, b) => {
      const compareStrings = (a?: string, b?: string) =>
        !a && !b ? 0 : !a ? 1 : !b ? -1 : a.localeCompare(b)
      const compareNumbers = (a?: number, b?: number) =>
        a === undefined && b === undefined
          ? 0
          : a === undefined
          ? 1
          : b === undefined
          ? -1
          : a - b
      switch (sortBy) {
        case 'nameAZ':
          return compareStrings(a.NAME, b.NAME)
        case 'nameZA':
          return compareStrings(b.NAME, a.NAME)
        case 'priceLowToHigh':
          return compareNumbers(a.REGULAR_PRICE, b.REGULAR_PRICE)
        case 'priceHighToLow':
          return compareNumbers(b.REGULAR_PRICE, a.REGULAR_PRICE)
        case 'brand':
          return compareStrings(a.BRAND, b.BRAND)
        default:
          return 0
      }
    })
    const filteredProducts = sortedProducts.filter((product) => {
      const filterGroups = filtersList.reduce((acc, filterConfig) => {
        const filterValues = ensureArray(searchParams[filterConfig.name])
        if (filterValues.length > 0) {
          acc[filterConfig.name] = filterValues
        }
        return acc
      }, {} as Record<string, string[]>)
      if (Object.keys(filterGroups).length === 0) return true
      return Object.entries(filterGroups).every(
        ([filterName, filterValues]) => {
          const filterConfig = filtersList.find((f) => f.name === filterName)
          if (!filterConfig) return true
          if (filterConfig.isPrice) {
            const range = filterValues[0]
            const productPrice = parseFloat(product.SELLING_PRICE.toString())
            switch (range) {
              case 'Under $50':
                return productPrice < 50
              case '$50 - $100':
                return productPrice >= 50 && productPrice <= 100
              case '$100 - $200':
                return productPrice >= 100 && productPrice <= 200
              case 'Over $200':
                return productPrice > 200
              default:
                return true
            }
          }
          if (filterConfig.from === 'VARIATIONS') {
            if (!product.VARIATIONS || !Array.isArray(product.VARIATIONS))
              return false
            return filterValues.some((value) =>
              product.VARIATIONS.some(
                (v) => v[filterName.toUpperCase() as keyof typeof v] === value
              )
            )
          }
          const productValue = product[
            filterName.toUpperCase() as keyof typeof product
          ]
            ?.toString()
            .trim()
          return filterValues.some((value) => value.trim() === productValue)
        }
      )
    })
    const paginated = isAllProducts
      ? filteredProducts
      : filteredProducts.slice(offset, offset + perPage)
    const totalPages = Math.ceil(filteredProducts.length / perPage)
    return {
      products: paginated,
      totalPages,
      productCount: filteredProducts.length,
      isLoading: false,
    }
  } catch (err) {
    console.error('Local products DB error:', err)
    return { products: [], totalPages: 1, productCount: 0, isLoading: false }
  }
} 