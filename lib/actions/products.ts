'use server'

import { db } from '@/lib/db'
import { products, productVariations, productAlternateImages, productAttributes, variantAttributes, orderItems, taxonomy } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'
import { eq, sql } from 'drizzle-orm'
import { list, del } from '@vercel/blob'

export interface ProductResponse {
  success: boolean
  error?: string
  message?: string
}

export async function createProduct(data: {
  styleId: number
  name: string
  style: string
  quantityAvailable: number
  onSale: string
  isNew: string
  smallPicture: string
  mediumPicture: string
  largePicture: string
  department: string
  type: string
  subType: string
  brand: string
  sellingPrice: number
  regularPrice: number
  longDescription: string
  of7: string | null
  of12: string | null
  of13: string | null
  of15: string | null
  forceBuyQtyLimit: string | null
  lastReceived: string | null
  tags: string
  urlHandle: string
  barcode: string
  sku: string
  trackInventory: boolean
  continueSellingOutOfStock: boolean
  stockQuantity: number
  productAttributes?: {
    attributeId: string
    attributeValues: {
      attributeValueId: string
      value: string
    }[]
  }[]
  variations: {
    skuId: number
    quantity: number
    colorImage: string
    sku: string
    barcode: string
    available: boolean
    price: string
    variantAttributes: {
      attributeId: string
      attributeValueId: string
      value: string
    }[]
  }[]
  alternateImages: {
    AltImage: string
  }[]
}): Promise<ProductResponse> {
  try {
    // Helper function to normalize boolean values for database
    const normalizeBooleanForDB = (value: any): boolean => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        return value.toUpperCase() === 'TRUE' || value === '1' || value === 'true';
      }
      if (typeof value === 'number') {
        return value === 1;
      }
      return false;
    };
    
    // Create the product
    const [product] = await db.insert(products).values({
      styleId: data.styleId,
      name: data.name,
      style: data.style,
      quantityAvailable: data.quantityAvailable,
      onSale: data.onSale,
      isNew: data.isNew,
      smallPicture: data.smallPicture,
      mediumPicture: data.mediumPicture,
      largePicture: data.largePicture,
      department: data.department,
      type: data.type,
      subType: data.subType,
      brand: data.brand,
      sellingPrice: data.sellingPrice,
      regularPrice: data.regularPrice,
      longDescription: data.longDescription,
      of7: data.of7,
      of12: data.of12,
      of13: data.of13,
      of15: data.of15,
      forceBuyQtyLimit: data.forceBuyQtyLimit,
      lastReceived: data.lastReceived,
      tags: data.tags,
      urlHandle: data.urlHandle,
      barcode: data.barcode,
      sku: data.sku,
      trackInventory: normalizeBooleanForDB(data.trackInventory),
      continueSellingOutOfStock: normalizeBooleanForDB(data.continueSellingOutOfStock),
      stockQuantity: data.stockQuantity,
    }).returning()

    // Create variations
    if (data.variations.length > 0) {
      const variationInserts = data.variations.map((variation: any) => ({
        productId: product.id,
        skuId: Math.abs(variation.skuId) % 99999 + 1,
        quantity: variation.quantity,
        colorImage: variation.colorImage,
        sku: variation.sku,
        barcode: variation.barcode,
        available: variation.available,
        price: String(variation.price ?? '0.00'),
      }))
      
      const insertedVariations = await db.insert(productVariations).values(variationInserts).returning()
      
      // Create variant attributes for each variation
      for (let i = 0; i < insertedVariations.length; i++) {
        const variation = data.variations[i]
        const insertedVariation = insertedVariations[i]
        
        if (variation.variantAttributes && variation.variantAttributes.length > 0) {
          await db.insert(variantAttributes).values(
            variation.variantAttributes.map(attr => ({
              variationId: insertedVariation.id,
              attributeId: attr.attributeId,
              attributeValueId: attr.attributeValueId,
            }))
          )
        }
      }
    }

    // Create product attributes if provided
    if (data.productAttributes && data.productAttributes.length > 0) {
      const productAttributeInserts = []
      for (const attr of data.productAttributes) {
        for (const value of attr.attributeValues) {
          productAttributeInserts.push({
            productId: product.id,
            attributeId: attr.attributeId,
            attributeValueId: value.attributeValueId,
          })
        }
      }
      
      if (productAttributeInserts.length > 0) {
        await db.insert(productAttributes).values(productAttributeInserts)
      }
    }

    // Create alternate images
    if (data.alternateImages.length > 0) {
      await db.insert(productAlternateImages).values(
        data.alternateImages.map(image => ({
          productId: product.id,
          AltImage: image.AltImage,
        }))
      )
    }

    revalidatePath('/admin/catalog/products')
    return { 
      success: true,
      message: 'Product created successfully'
    }
  } catch (error) {
    return { 
      success: false, 
      error: 'Failed to create product' 
    }
  }
}

// Add this function to get taxonomy data by ID
async function getTaxonomyById(taxonomyId: string) {
  try {
    const result = await db.select().from(taxonomy).where(eq(taxonomy.WEB_TAXONOMY_ID, parseInt(taxonomyId)))
    return result[0] || null
  } catch (error) {
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

export const getProducts = async () => {
  try {
    const allProducts = await db.query.products.findMany({
      with: {
        variations: true,
        alternateImages: true
      }
    })
    
    // Get category names for each product
    const productsWithCategories = await Promise.all(allProducts.map(async (product) => {
      let categoryName = ''
      if (product.department) {
        const taxonomyData = await getTaxonomyById(product.department)
        categoryName = getCategoryDisplayName(taxonomyData)
      }
      
      return {
        ...product,
        categoryName // Add category name to the product object
      }
    }))
    
    return productsWithCategories
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function getProduct(id: string) {
  try {
    const styleId = parseInt(id)
    if (isNaN(styleId)) {
      return null
    }

    const product = await db.query.products.findFirst({
      where: (products, { eq }) => eq(products.styleId, styleId),
      with: {
        variations: {
          with: {
            attributes: {
              with: {
                attribute: true,
                attributeValue: true
              }
            }
          }
        },
        alternateImages: true,
        attributes: {
          with: {
            attribute: true,
            attributeValue: true
          }
        }
      },
      columns: {
        id: true,
        styleId: true,
        name: true,
        style: true,
        quantityAvailable: true,
        onSale: true,
        isNew: true,
        smallPicture: true,
        mediumPicture: true,
        largePicture: true,
        department: true,
        type: true,
        subType: true,
        brand: true,
        sellingPrice: true,
        regularPrice: true,
        longDescription: true,
        of7: true,
        of12: true,
        of13: true,
        of15: true,
        forceBuyQtyLimit: true,
        lastReceived: true,
        tags: true,
        urlHandle: true,
        barcode: true,
        sku: true,
        trackInventory: true,
        continueSellingOutOfStock: true,
        stockQuantity: true,
        lowStockThreshold: true,
      }
    })
    
    // Helper function to normalize boolean values from database
    const normalizeBoolean = (value: any): boolean => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        return value.toUpperCase() === 'TRUE' || value === '1' || value === 'true';
      }
      if (typeof value === 'number') {
        return value === 1;
      }
      return false;
    };
    
    // Normalize the continueSellingOutOfStock value to ensure it's always a boolean
    if (product) {
      product.continueSellingOutOfStock = normalizeBoolean(product.continueSellingOutOfStock);
      product.trackInventory = normalizeBoolean(product.trackInventory);
    }
    
    return product
  } catch (error) {
    return null
  }
}

export async function updateProduct(
  styleId: string, 
  productData: any, 
  options: { 
    cleanupMainImages?: boolean;
    cleanupAlternateImages?: boolean;
    cleanupColorImages?: boolean;
  } = {}
) {
  try {
    const numericStyleId = parseInt(styleId)
    if (isNaN(numericStyleId)) {
      throw new Error('Invalid styleId')
    }

    // Get current product data for cleanup comparison
    let currentProduct: any = null
    if (options.cleanupMainImages || options.cleanupAlternateImages || options.cleanupColorImages) {
      currentProduct = await db.query.products.findFirst({
        where: (products, { eq }) => eq(products.styleId, numericStyleId),
        with: {
          variations: true,
          alternateImages: true
        }
      })
      
      if (!currentProduct) {
        throw new Error('Product not found for cleanup')
      }
    }

    // Helper function to normalize boolean values for database
    const normalizeBooleanForDB = (value: any): boolean => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        return value.toUpperCase() === 'TRUE' || value === '1' || value === 'true';
      }
      if (typeof value === 'number') {
        return value === 1;
      }
      return false;
    };
    
    // Update main product table
    await db.update(products).set({
      name: productData.name,
      longDescription: productData.longDescription,
      sellingPrice: productData.sellingPrice,
      regularPrice: productData.regularPrice,
      sku: productData.sku,
      barcode: productData.barcode,
      type: productData.type,
      style: productData.type,
      department: productData.department,
      brand: productData.brand,
      tags: productData.tags,
      of7: productData.of7,
      of12: productData.of12,
      of13: productData.of13,
      of15: productData.of15,
      urlHandle: productData.urlHandle,
      quantityAvailable: productData.quantityAvailable,
      trackInventory: normalizeBooleanForDB(productData.trackInventory),
      continueSellingOutOfStock: normalizeBooleanForDB(productData.continueSellingWhenOutOfStock),
      onSale: productData.onSale ? 'Y' : 'N',
      smallPicture: productData.smallImage,
      mediumPicture: productData.mediumImage,
      largePicture: productData.mainImage,
    }).where(eq(products.styleId, parseInt(styleId)))

    // Get the product ID for foreign key relationships
    const [product] = await db.select({ id: products.id }).from(products).where(eq(products.styleId, parseInt(styleId)))
    
    if (!product) {
      throw new Error('Product not found')
    }

    // Delete existing alternate images
    await db.delete(productAlternateImages).where(eq(productAlternateImages.productId, product.id))

    // Insert new alternate images
    if (productData.alternateImages && productData.alternateImages.length > 0) {
      const alternateImageData = productData.alternateImages.map((imageUrl: string) => ({
        productId: product.id,
        AltImage: imageUrl,
      }))
      await db.insert(productAlternateImages).values(alternateImageData)
    }

    // Handle product attributes - delete existing and insert new ones
    await db.delete(productAttributes).where(eq(productAttributes.productId, product.id))
    
    if (productData.productAttributes && productData.productAttributes.length > 0) {
      const productAttributeInserts = []
      for (const attr of productData.productAttributes) {
        for (const value of attr.attributeValues) {
          productAttributeInserts.push({
            productId: product.id,
            attributeId: attr.attributeId,
            attributeValueId: value.attributeValueId,
          })
        }
      }
      
      if (productAttributeInserts.length > 0) {
        await db.insert(productAttributes).values(productAttributeInserts)
      }
    }

    // Handle variations - delete all existing and insert new ones (same as createProduct)
    if (productData.variations && productData.variations.length > 0) {
      // Delete all existing variations and their attributes
      const existingVariations = await db.select({ id: productVariations.id })
        .from(productVariations)
        .where(eq(productVariations.productId, product.id))
      
      for (const variant of existingVariations) {
        // Delete variant attributes first
        await db.delete(variantAttributes).where(eq(variantAttributes.variationId, variant.id))
        // Then delete the variation
        await db.delete(productVariations).where(eq(productVariations.id, variant.id))
      }
      
      // Insert all new variations (same logic as createProduct)
      const variationInserts = productData.variations.map((variation: any) => ({
        productId: product.id,
        skuId: Math.abs(variation.skuId) % 99999 + 1,
        quantity: variation.quantity,
        colorImage: variation.colorImage,
        sku: variation.sku,
        barcode: variation.barcode,
        available: variation.available,
        price: String(variation.price ?? '0.00'),
      }))
      
      const insertedVariations = await db.insert(productVariations).values(variationInserts).returning()
      
      // Create variant attributes for each variation (same logic as createProduct)
      for (let i = 0; i < insertedVariations.length; i++) {
        const variation = productData.variations[i]
        const insertedVariation = insertedVariations[i]
        
        if (variation.variantAttributes && variation.variantAttributes.length > 0) {
          const variantAttributeInserts = variation.variantAttributes.map((attr: any) => ({
            variationId: insertedVariation.id,
            attributeId: attr.attributeId,
            attributeValueId: attr.attributeValueId,
          }))
          
          await db.insert(variantAttributes).values(variantAttributeInserts)
        }
      }
    } else {
      // If no variations are provided, delete all existing variations for this product
      const existingVariations = await db.select({ id: productVariations.id })
        .from(productVariations)
        .where(eq(productVariations.productId, product.id))
      
      for (const variant of existingVariations) {
        // Delete variant attributes first
        await db.delete(variantAttributes).where(eq(variantAttributes.variationId, variant.id))
        // Then delete the variation
        await db.delete(productVariations).where(eq(productVariations.id, variant.id))
      }
    }

    // Image cleanup after successful database update
    if (currentProduct && (options.cleanupMainImages || options.cleanupAlternateImages || options.cleanupColorImages)) {
      try {
        const { deleteAsset } = await import('@/lib/services/platform-upload-service')
        const imagesToCleanup: string[] = []

        console.log(`[PRODUCT-UPDATE] Starting image cleanup for product ${numericStyleId}`)
        console.log(`[PRODUCT-UPDATE] Cleanup options:`, {
          cleanupMainImages: options.cleanupMainImages,
          cleanupAlternateImages: options.cleanupAlternateImages,
          cleanupColorImages: options.cleanupColorImages
        })

        // 1. Cleanup Main Product Images
        if (options.cleanupMainImages) {
          const oldMainImages = [
            currentProduct.largePicture,
            currentProduct.mediumPicture,
            currentProduct.smallPicture
          ].filter(Boolean)

          const newMainImages = [
            productData.mainImage,
            productData.mediumImage,
            productData.smallImage
          ].filter(Boolean)

          console.log(`[PRODUCT-UPDATE] Old main images:`, oldMainImages)
          console.log(`[PRODUCT-UPDATE] New main images:`, newMainImages)

          // Find images that were replaced
          for (const oldImage of oldMainImages) {
            if (!newMainImages.includes(oldImage)) {
              imagesToCleanup.push(oldImage)
              console.log(`[PRODUCT-UPDATE] Main image marked for cleanup: ${oldImage}`)
            } else {
              console.log(`[PRODUCT-UPDATE] Main image kept (unchanged): ${oldImage}`)
            }
          }
        }

        // 2. Cleanup Alternate Images
        if (options.cleanupAlternateImages && currentProduct.alternateImages) {
          const oldAlternateImages = currentProduct.alternateImages
            .map((img: any) => img.AltImage)
            .filter(Boolean)

          const newAlternateImages = (productData.alternateImages || []).filter(Boolean)

          // Find alternate images that were replaced/removed
          for (const oldAltImage of oldAlternateImages) {
            if (!newAlternateImages.includes(oldAltImage)) {
              imagesToCleanup.push(oldAltImage)
              console.log(`[PRODUCT-UPDATE] Alternate image marked for cleanup: ${oldAltImage}`)
            }
          }
        }

        // 3. Cleanup Color/Variant Images (using same logic as alternate images)
        if (options.cleanupColorImages && currentProduct.variations) {
          const oldColorImages = currentProduct.variations
            .map((variant: any) => variant.colorImage)
            .filter(Boolean)

          const newColorImages = (productData.variations || [])
            .map((variant: any) => variant.colorImage)
            .filter(Boolean)

          // Find color images that were replaced/removed (same logic as alternates)
          for (const oldColorImage of oldColorImages) {
            if (!newColorImages.includes(oldColorImage)) {
              imagesToCleanup.push(oldColorImage)
              console.log(`[PRODUCT-UPDATE] Color image marked for cleanup: ${oldColorImage}`)
            }
          }
        }

        // Remove duplicates
        const uniqueImagesToCleanup = [...new Set(imagesToCleanup)]

        // Perform cleanup
        if (uniqueImagesToCleanup.length > 0) {
          console.log(`[PRODUCT-UPDATE] Cleaning up ${uniqueImagesToCleanup.length} images`)
          
          const cleanupResults = await Promise.allSettled(
            uniqueImagesToCleanup.map(async (imageUrl) => {
              try {
                const result = await deleteAsset(imageUrl)
                if (result) {
                  console.log(`[PRODUCT-UPDATE] ✅ Successfully cleaned up: ${imageUrl}`)
                } else {
                  console.warn(`[PRODUCT-UPDATE] ❌ Failed to cleanup: ${imageUrl}`)
                }
                return result
              } catch (error) {
                console.error(`[PRODUCT-UPDATE] ❌ Error cleaning up ${imageUrl}:`, error)
                return false
              }
            })
          )

          const successCount = cleanupResults.filter(
            (result) => result.status === 'fulfilled' && result.value === true
          ).length
          const failureCount = cleanupResults.length - successCount

          console.log(`[PRODUCT-UPDATE] Cleanup completed - Success: ${successCount}, Failed: ${failureCount}`)
        } else {
          console.log('[PRODUCT-UPDATE] No images need cleanup')
        }

      } catch (cleanupError) {
        console.error('[PRODUCT-UPDATE] Error during image cleanup:', cleanupError)
        // Don't fail the update if cleanup fails
      }
    }

    console.log(`[PRODUCT-UPDATE] Product ${numericStyleId} updated successfully`)
    return { success: true }
  } catch (error) {
    console.error('Error updating product:', error)
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function deleteProduct(id: string): Promise<ProductResponse> {
  try {
    const styleId = parseInt(id)
    if (isNaN(styleId)) {
      return { 
        success: false, 
        error: 'Invalid product ID' 
      }
    }

    // Get the product first with all related data
    const product = await db.query.products.findFirst({
      where: (products, { eq }) => eq(products.styleId, styleId),
      with: {
        variations: true,
        alternateImages: true
      }
    })

    if (!product) {
      return { 
        success: false, 
        error: 'Product not found' 
      }
    }

    // Get order count for better error message
    const orderResult = await db.execute(
      sql`SELECT COUNT(DISTINCT order_id) as order_count FROM order_items WHERE product_id = ${product.id}`
    )
    
    const orderCount = (orderResult as any)[0]?.order_count ?? 0

    if (orderCount > 0) {
      return {
        success: false,
        error: `Unable to delete "${product.name}" (Style ID: ${product.styleId})\n\nThis product appears in ${orderCount} order${orderCount === 1 ? '' : 's'} and cannot be deleted to maintain order history integrity.\n\nRecommended actions:\n• Consider deactivating the product instead\n• Set inventory to zero\n• Mark as discontinued`
      }
    }

    // If no orders exist, proceed with deletion

    // Delete all product images - FIXED APPROACH
    console.log(`[PRODUCT-DELETE] Starting image cleanup for styleId ${styleId}`)
    
    try {
      const { deleteAsset } = await import('@/lib/services/platform-upload-service')
      
      // Always try server-side cleanup first (since you're using server mode)
      const { unlink, readdir } = await import('fs/promises')
      const { join } = await import('path')
      const { existsSync } = await import('fs')
      
      const productsDir = join(process.cwd(), 'media', 'products')
      console.log(`[PRODUCT-DELETE] Products directory path: ${productsDir}`)
      
      if (existsSync(productsDir)) {
        try {
          const files = await readdir(productsDir)
          console.log(`[PRODUCT-DELETE] Found ${files.length} total files in products directory`)
          
          // Find all files for this product (comprehensive pattern matching)
          const productFiles = files.filter(filename => {
            const matchesPattern = (
              filename.startsWith(`${styleId}_`) ||    // 923009_l.jpg, 923009_alt_1.jpg
              filename.startsWith(`${styleId}-`) ||    // 923009-Small-Red.jpg  
              filename.includes(`_${styleId}_`) ||     // variant_923009_color.jpg
              filename.includes(`-${styleId}-`)        // variant-923009-color.jpg
            )
            
            if (matchesPattern) {
              console.log(`[PRODUCT-DELETE] ✅ Found file to delete: ${filename}`)
            }
            
            return matchesPattern
          })
          
          console.log(`[PRODUCT-DELETE] Total files to delete: ${productFiles.length}`)
          
          if (productFiles.length > 0) {
            // Delete all files synchronously to ensure completion
            for (const filename of productFiles) {
              const filePath = join(productsDir, filename)
              try {
                await unlink(filePath)
                console.log(`[PRODUCT-DELETE] ✅ Deleted: ${filename}`)
              } catch (err) {
                console.error(`[PRODUCT-DELETE] ❌ Failed to delete ${filename}:`, err)
              }
            }
            
            console.log(`[PRODUCT-DELETE] ✅ Server cleanup completed: ${productFiles.length} files processed`)
          } else {
            console.log(`[PRODUCT-DELETE] ⚠️  No files found matching styleId ${styleId}`)
            console.log(`[PRODUCT-DELETE] Sample files in directory:`, files.slice(0, 5))
          }
          
        } catch (readError) {
          console.error('[PRODUCT-DELETE] ❌ Error reading products directory:', readError)
        }
      } else {
        console.error(`[PRODUCT-DELETE] ❌ Products directory does not exist: ${productsDir}`)
      }
      
      // Also cleanup any database URLs (for Vercel or remote images)
      const imageUrls = [
        product.largePicture,
        product.mediumPicture, 
        product.smallPicture,
        ...(product.alternateImages?.map(alt => alt.AltImage) || []),
        ...(product.variations?.map(variant => variant.colorImage) || [])
      ].filter(Boolean)
      
      if (imageUrls.length > 0) {
        console.log(`[PRODUCT-DELETE] Also cleaning up ${imageUrls.length} database image URLs`)
        for (const imageUrl of imageUrls) {
          try {
            await deleteAsset(imageUrl)
            console.log(`[PRODUCT-DELETE] ✅ Cleaned up URL: ${imageUrl}`)
          } catch (urlError) {
            console.error(`[PRODUCT-DELETE] ❌ Failed to cleanup URL ${imageUrl}:`, urlError)
          }
        }
      }
      
    } catch (imageError) {
      console.error('[PRODUCT-DELETE] ❌ Critical error during image cleanup:', imageError)
      // Continue with database deletion even if image deletion fails
    }
    
    console.log(`[PRODUCT-DELETE] Image cleanup phase completed for styleId ${styleId}`)

    // First delete variations
    const deletedVariations = await db.delete(productVariations)
      .where(eq(productVariations.productId, product.id))
      .returning()

    // Then delete alternate images
    const deletedImages = await db.delete(productAlternateImages)
      .where(eq(productAlternateImages.productId, product.id))
      .returning()

    // Finally delete the product
    const deletedProduct = await db.delete(products)
      .where(eq(products.id, product.id))
      .returning()

    revalidatePath('/admin/catalog/products')
    return { 
      success: true,
      message: `Successfully deleted "${product.name}" (Style ID: ${product.styleId})`
    }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete product'
    }
  }
}

// Fix missing variant attributes for a specific product
export async function fixMissingVariantAttributes(styleId: string): Promise<ProductResponse> {
  try {
    const numericStyleId = parseInt(styleId)
    if (isNaN(numericStyleId)) {
      return { success: false, error: 'Invalid styleId' }
    }

    const product = await db.query.products.findFirst({
      where: (products, { eq }) => eq(products.styleId, numericStyleId),
      with: {
        variations: {
          with: {
            attributes: true
          }
        }
      }
    })

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    let fixedCount = 0
    for (const variation of product.variations) {
      if (!variation.attributes || variation.attributes.length === 0) {
        // Add default size and color attributes if missing
        const defaultAttributes = [
          { attributeId: 'size', attributeValueId: 'default', value: 'One Size' },
          { attributeId: 'color', attributeValueId: 'default', value: 'Default' }
        ]

        await db.insert(variantAttributes).values(
          defaultAttributes.map(attr => ({
            variationId: variation.id,
            attributeId: attr.attributeId,
            attributeValueId: attr.attributeValueId,
          }))
        )
        fixedCount++
      }
    }

    return { 
      success: true, 
      message: `Fixed variant attributes for ${fixedCount} variations` 
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fix variant attributes' 
    }
  }
}

// Fix variant attributes for all products
export async function fixProductVariantAttributes(styleId?: string): Promise<ProductResponse> {
  try {
    let products: any[]
    
    if (styleId) {
      const numericStyleId = parseInt(styleId)
      if (isNaN(numericStyleId)) {
        return { success: false, error: 'Invalid styleId' }
      }
      
      const product = await db.query.products.findFirst({
        where: (products, { eq }) => eq(products.styleId, numericStyleId),
        with: { variations: { with: { attributes: true } } }
      })
      
      products = product ? [product] : []
    } else {
      products = await db.query.products.findMany({
        with: { variations: { with: { attributes: true } } }
      })
    }

    let totalFixed = 0
    for (const product of products) {
      for (const variation of product.variations) {
        if (!variation.attributes || variation.attributes.length === 0) {
          const defaultAttributes = [
            { attributeId: 'size', attributeValueId: 'default' },
            { attributeId: 'color', attributeValueId: 'default' }
          ]

          await db.insert(variantAttributes).values(
            defaultAttributes.map(attr => ({
              variationId: variation.id,
              attributeId: attr.attributeId,
              attributeValueId: attr.attributeValueId,
            }))
          )
          totalFixed++
        }
      }
    }

    return { 
      success: true, 
      message: `Fixed variant attributes for ${totalFixed} variations across ${products.length} products` 
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fix product variant attributes' 
    }
  }
}

// Explicit exports for Vercel compatibility
export { fixMissingVariantAttributes, fixProductVariantAttributes } 