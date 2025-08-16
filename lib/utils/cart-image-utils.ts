'use server'

import { db } from '@/lib/db'
import { products, productVariations, variantAttributes, attributes, attributeValues } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export interface LocalCartItemData {
  id: string
  productId: number
  name: string
  price: number
  quantity: number
  image: string
  color: string | null
  size: string | null
  styleCode: string
  maxQuantity: number
  variations?: any[]
}

export async function getLocalCartItemData(cartItems: LocalCartItemData[]): Promise<LocalCartItemData[]> {
  const enhancedItems = await Promise.all(
    cartItems.map(async (item) => {
      try {
        // Get product data
        const productData = await db.query.products.findFirst({
          where: eq(products.styleId, item.productId),
        })

        if (!productData) {
          console.warn(`Product not found for styleId: ${item.productId}`)
          return item
        }

        // Get product variations with attributes
        const variations = await db.query.productVariations.findMany({
          where: eq(productVariations.productId, productData.id),
          with: {
            attributes: {
              with: {
                attribute: true,
                attributeValue: true,
              },
            },
          },
        })

        // Map variations to match remote format
        const mappedVariations = variations.map((variation) => {
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
            COLOR: '',
            SIZE: '',
            sku: variation.sku ? String(variation.sku) : '',
          }

          // Map attributes
          variation.attributes.forEach((va: any) => {
            const attrName = va.attribute.name.toUpperCase()
            const attrValue = va.attributeValue.value
            if (!variationData[attrName]) {
              variationData[attrName] = attrValue
            }
            // Set COLOR and SIZE specifically
            if (attrName === 'COLOR') {
              variationData.COLOR = attrValue
            }
            if (attrName === 'SIZE') {
              variationData.SIZE = attrValue
            }
          })

          return variationData
        })

        // Determine the best image to use
        let finalImage = productData.mediumPicture || ''

        // If we have a color selected, try to find a color-specific image
        if (item.color && mappedVariations.length > 0) {
          const colorVariation = mappedVariations.find(
            (v) => v.COLOR && v.COLOR.trim().toLowerCase() === item.color?.trim().toLowerCase()
          )
          
          if (colorVariation && colorVariation.COLOR_IMAGE) {
            finalImage = colorVariation.COLOR_IMAGE
          }
        }

        // Format image URL for local mode
        if (finalImage && !finalImage.startsWith('http')) {
          finalImage = `/uploads/products/${finalImage}`
        }

        // Find the selected variation if color/size is present
        let selectedVariation = null;
        if (item.color && item.size && mappedVariations.length > 0) {
          selectedVariation = mappedVariations.find(
            (v) =>
              v.COLOR && v.COLOR.trim().toLowerCase() === item.color.trim().toLowerCase() &&
              v.SIZE && v.SIZE.trim().toLowerCase() === item.size.trim().toLowerCase()
          );
        }
        // Determine stock status
        const variationStock = selectedVariation ? selectedVariation.QUANTITY : undefined;
        const isVariationSelected = !!selectedVariation;
        const isVariationOutOfStock = isVariationSelected && (variationStock === undefined || variationStock === null || variationStock <= 0);

        return {
          ...item,
          name: productData.name,
          price: item.price,
          image: finalImage,
          styleCode: productData.style,
          maxQuantity: productData.quantityAvailable || 10,
          variations: mappedVariations,
          onSale: productData.onSale,
          continueSellingOutOfStock: productData.continueSellingOutOfStock,
          quantityAvailable: productData.quantityAvailable,
          variationStock,
          isVariationSelected,
          isVariationOutOfStock,
        }
      } catch (error) {
        console.error(`Error fetching local data for cart item ${item.id}:`, error)
        return item
      }
    })
  )

  return enhancedItems
} 