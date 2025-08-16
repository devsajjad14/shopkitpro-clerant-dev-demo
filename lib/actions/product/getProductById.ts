'use server'

import { db } from '@/lib/db'
import { products, productAlternateImages } from '@/lib/db/schema'
import { Product } from '@/types/product-types'

interface FetchProductParams {
  id: number
}

export async function getProductById({ id }: { id: number }): Promise<{ product: Product | null }> {
  try {
    if (!id || isNaN(id)) {
      console.error('Invalid product ID:', id)
      return { product: null }
    }
    const dbProduct = await db.query.products.findFirst({ where: (products, { eq }) => eq(products.styleId, id) })
    if (!dbProduct) return { product: null }

    // Fetch alternate images for this product
    const alternates = await db.query.productAlternateImages.findMany({
      where: (img, { eq }) => eq(img.productId, dbProduct.id),
    });

    // Helper to normalize image paths for comparison
    function normalizeImagePath(path: string | null | undefined): string {
      if (!path) return '';
      return path.replace(/^\/+/, '').toLowerCase();
    }
    const mainImage = normalizeImagePath(dbProduct.largePicture);

    function getFilename(path: string | null | undefined): string {
      if (!path) return '';
      return path.split('/').pop()?.toLowerCase() || '';
    }
    const mainImageFile = getFilename(dbProduct.largePicture);

    // Fetch variations for this product, with their attributes
    const dbVariations = await db.query.productVariations.findMany({
      where: (v, { eq }) => eq(v.productId, dbProduct.id),
      with: {
        attributes: {
          with: {
            attribute: true,
            attributeValue: true,
          },
        },
      },
    });

    // Map variations to the structure, with fallback to main product for inventory/price
    const VARIATIONS = dbVariations.map((variation: any) => {
      let quantity = variation.quantity;
      let price = variation.price;
      if (quantity === undefined || quantity === null) quantity = dbProduct.quantityAvailable;
      if (price === undefined || price === null) price = dbProduct.sellingPrice;
      const base: any = {
        SKU_ID: variation.skuId || 0,
        sku: variation.sku ? String(variation.sku) : '',
        COLOR: '',
        ATTR1_ALIAS: '',
        HEX: '',
        SIZE: '',
        SUBSIZE: null,
        QUANTITY: quantity,
        PRICE: Number(price),
        COLORIMAGE: variation.colorImage || '',
        available: variation.available !== false,
      };
      variation.attributes.forEach((va: any) => {
        const attrName = va.attribute.name.toUpperCase();
        const attrValue = va.attributeValue.value;
        if (attrName === 'COLOR') base.COLOR = attrValue;
        else if (attrName === 'ATTR1_ALIAS') base.ATTR1_ALIAS = attrValue;
        else if (attrName === 'HEX') base.HEX = attrValue;
        else if (attrName === 'SIZE') base.SIZE = attrValue;
        else if (attrName === 'SUBSIZE') base.SUBSIZE = attrValue;
        else base[attrName] = attrValue;
      });
      return base;
    });

    // Fetch product-level attributes (for non-variant products)
    const dbProductAttributes = await db.query.productAttributes.findMany({
      where: (pa, { eq }) => eq(pa.productId, dbProduct.id),
      with: {
        attribute: true,
        attributeValue: true,
      },
    });
    if (dbProductAttributes.length > 0 && VARIATIONS.length === 0) {
      const defaultVariation: any = {
        SKU_ID: 0,
        sku: '',
        COLOR: '',
        ATTR1_ALIAS: '',
        HEX: '',
        SIZE: '',
        SUBSIZE: null,
        QUANTITY: dbProduct.quantityAvailable || 0,
        PRICE: Number(dbProduct.sellingPrice),
        COLORIMAGE: dbProduct.largePicture || '',
        available: true,
      };
      dbProductAttributes.forEach((pa: any) => {
        const attrName = pa.attribute.name.toUpperCase();
        const attrValue = pa.attributeValue.value;
        if (attrName === 'COLOR') defaultVariation.COLOR = attrValue;
        else if (attrName === 'ATTR1_ALIAS') defaultVariation.ATTR1_ALIAS = attrValue;
        else if (attrName === 'HEX') defaultVariation.HEX = attrValue;
        else if (attrName === 'SIZE') defaultVariation.SIZE = attrValue;
        else if (attrName === 'SUBSIZE') defaultVariation.SUBSIZE = attrValue;
        else defaultVariation[attrName] = attrValue;
      });
      VARIATIONS.push(defaultVariation);
    } else if (dbProductAttributes.length > 0) {
      VARIATIONS.forEach((variation: any) => {
        dbProductAttributes.forEach((pa: any) => {
          const attrName = pa.attribute.name.toUpperCase();
          const attrValue = pa.attributeValue.value;
          if (
            variation[attrName] === undefined ||
            variation[attrName] === null ||
            variation[attrName] === ''
          ) {
            variation[attrName] = attrValue;
          }
        });
      });
    }

    // Map DB fields to Product type, now with expert VARIATIONS
    const product: Product = {
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
      VARIATIONS,
      ALTERNATE_IMAGES: alternates
        .filter(img => {
          const altFile = getFilename(img.AltImage);
          if (!altFile || altFile === mainImageFile) return false;
          const isColorImage = VARIATIONS.some(variation => {
            if (!variation.COLORIMAGE) return false;
            const colorImageFile = getFilename(variation.COLORIMAGE);
            return colorImageFile && colorImageFile === altFile;
          });
          if (isColorImage) return false;
          const styleId = dbProduct.styleId.toString();
          const colorPattern = new RegExp(`^${styleId}_[a-zA-Z]+\.jpg$`, 'i');
          if (colorPattern.test(altFile)) return false;
          return true;
        })
        .map(img => ({
          SMALLALTPICTURE: img.AltImage || '',
          MEDIUMALTPICTURE: img.AltImage || '',
          LARGEALTPICTURE: img.AltImage || '',
        })),
      continueSellingOutOfStock: dbProduct.continueSellingOutOfStock || false,
    }
    return { product }
  } catch (error) {
    console.error('Error fetching product:', error)
    return { product: null }
  }
}
