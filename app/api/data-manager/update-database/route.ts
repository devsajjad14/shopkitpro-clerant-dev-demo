import { NextRequest, NextResponse } from 'next/server'
import { readdir, readFile, stat } from 'fs/promises'
import { join } from 'path'
import { db } from '@/lib/db'
import { 
  accounts, 
  products, 
  categories, 
  orders, 
  customers, 
  taxonomy,
  attributes,
  attributeValues,
  brands,
  settings,
  reviews,
  addresses,
  users,
  sessions,
  userProfiles,
  verificationTokens,
  productVariations,
  productAlternateImages,
  productAttributes,
  variantAttributes,
  taxRates,
  orderItems,
  refunds,
  coupons,
  adminUsers,
  shippingMethods,
  apiIntegrations,
  discounts,
  paymentGateways,
  paymentSettings,
  paymentTransactionLogs,
  paymentGatewayHealthChecks,
  dataModeSettings,
  mainBanners,
  mini_banners,
  pages,
  pageRevisions,
  pageCategories,
  pageCategoryRelations,
  pageAnalytics,
  cartAbandonmentToggle,
  cartSessions,
  cartEvents,
  cartsRecovered,
  campaignEmails
} from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

interface UpdateProgress {
  file: string
  status: 'processing' | 'completed' | 'error'
  message: string
  recordsProcessed?: number
  currentFile?: number
  totalFiles?: number
}

// Define table insertion order based on dependencies
// Tables are processed in order: parent tables first, then child tables that depend on them
const tableInsertionOrder = [
  // Level 1: Base tables with no dependencies (independent tables)
  'users',
  'categories',
  'taxonomy',
  'brands',
  'settings',
  'taxRates',
  'shippingMethods',
  'adminUsers',
  'apiIntegrations',
  'paymentGateways',
  'paymentSettings',
  'dataModeSettings',
  'mainBanners',
  'mini_banners',
  'pages',
  'pageCategories',
  'cartAbandonmentToggle',
  'customers',
  'verificationTokens',
  
  // Level 2: Tables that depend on users
  'accounts',           // depends on users.id
  'sessions',          // depends on users.id
  'userProfiles',      // depends on users.id
  'addresses',         // depends on users.id
  'coupons',           // depends on users.id (createdBy, updatedBy)
  
  // Level 3: Independent tables that should be processed after users
  'discounts',         // independent but processed after users for stability
  
  // Level 4: Tables that depend on attributes
  'attributes',        // independent but needed before attributeValues
  'attributeValues',   // depends on attributes.id
  
  // Level 5: Tables that depend on users and taxonomy (but no other dependencies)
  'products',          // independent but needed before product-related tables
  'reviews',           // depends on users.id and products.id
  
  // Level 6: Tables that depend on products
  'productVariations', // depends on products.id
  'productAlternateImages', // depends on products.id
  'productAttributes', // depends on products.id, attributes.id, attributeValues.id
  
  // Level 7: Tables that depend on productVariations
  'variantAttributes', // depends on productVariations.id, attributes.id, attributeValues.id
  
  // Level 8: Tables that depend on users and products
  'orders',            // depends on users.id
  'orderItems',        // depends on orders.id, products.id, productVariations.id
  
  // Level 9: Tables that depend on orders
  'refunds',           // depends on orders.id, users.id
  
  // Level 10: Cart and campaign tables
  'cartSessions',      // depends on users.id
  'cartEvents',        // depends on cartSessions.id
  'cartsRecovered',    // depends on cartSessions.id
  'campaignEmails',    // depends on users.id
  
  // Level 11: Payment and transaction tables
  'paymentTransactionLogs',
  'paymentGatewayHealthChecks',
  
  // Level 12: Page-related tables
  'pageRevisions',     // depends on pages.id
  'pageCategoryRelations', // depends on pages.id, pageCategories.id
  'pageAnalytics',     // depends on pages.id
]

// Corrected table order for deletion (child tables first, parent tables last)
const deletionOrder = [
  // Child tables with foreign keys (delete first)
  'variantAttributes',
  'productAttributes', 
  'productAlternateImages',
  'productVariations',
  'orderItems',
  'reviews',
  'pageRevisions',
  'pageCategoryRelations',
  'pageAnalytics',
  'cartEvents',
  'cartsRecovered',
  'paymentTransactionLogs',
  'paymentGatewayHealthChecks',
  'campaignEmails',
  'refunds',
  'cartSessions',
  'coupons',
  'discounts',
  'addresses',
  'userProfiles',
  'sessions',
  'accounts',
  'verificationTokens',
  'customers',
  'orders',
  'products',
  'categories',
  'brands',
  'attributes',
  'attributeValues',
  'taxonomy',
  'shippingMethods',
  'taxRates',
  'paymentGateways',
  'paymentSettings',
  'apiIntegrations',
  'adminUsers',
  'mainBanners',
  'mini_banners',
  'pages',
  'pageCategories',
  'cartAbandonmentToggle',
  'dataModeSettings',
  'settings',
  'users'
];

// Corrected table order for insertion (parent tables first, child tables last)
const insertionOrder = [
  // Parent tables (insert first)
  'users',
  'settings',
  'dataModeSettings',
  'cartAbandonmentToggle',
  'pageCategories',
  'pages',
  'mini_banners',
  'mainBanners',
  'adminUsers',
  'apiIntegrations',
  'paymentSettings',
  'paymentGateways',
  'taxRates',
  'shippingMethods',
  'taxonomy',
  'attributeValues',
  'attributes',
  'brands',
  'categories',
  'products',
  'orders',
  'customers',
  'verificationTokens',
  'accounts',
  'sessions',
  'userProfiles',
  'addresses',
  'discounts',
  'coupons',
  'cartSessions',
  'refunds',
  'campaignEmails',
  'paymentGatewayHealthChecks',
  'paymentTransactionLogs',
  'cartsRecovered',
  'cartEvents',
  'reviews',
  'productVariations', // Must be before variantAttributes
  'variantAttributes', // Depends on productVariations
  'productAttributes',
  'productAlternateImages',
  'orderItems',
  'pageAnalytics',
  'pageCategoryRelations',
  'pageRevisions'
];

// Table mapping for deletion operations
const tableMap = {
  users,
  accounts,
  sessions,
  verificationTokens,
  userProfiles,
  addresses,
  reviews,
  products,
  productVariations,
  productAlternateImages,
  productAttributes,
  variantAttributes,
  categories,
  taxonomy,
  attributes,
  attributeValues,
  brands,
  settings,
  taxRates,
  orders,
  orderItems,
  refunds,
  coupons,
  adminUsers,
  shippingMethods,
  apiIntegrations,
  discounts,
  paymentGateways,
  paymentSettings,
  paymentTransactionLogs,
  paymentGatewayHealthChecks,
  dataModeSettings,
  mainBanners,
  mini_banners,
  pages,
  pageRevisions,
  pageCategories,
  pageCategoryRelations,
  pageAnalytics,
  cartAbandonmentToggle,
  cartSessions,
  cartEvents,
  cartsRecovered,
  campaignEmails,
  customers
}

// Map of supported tables and their schemas
const supportedTables = {
  accounts,
  products,
  categories,
  orders,
  customers,
  taxonomy,
  attributes,
  attributeValues,
  brands,
  settings,
  reviews,
  addresses,
  users,
  sessions,
  userProfiles,
  verificationTokens,
  productVariations,
  productAlternateImages,
  productAttributes,
  variantAttributes,
  taxRates,
  orderItems,
  refunds,
  coupons,
  adminUsers,
  shippingMethods,
  apiIntegrations,
  discounts,
  paymentGateways,
  paymentSettings,
  paymentTransactionLogs,
  paymentGatewayHealthChecks,
  dataModeSettings,
  mainBanners,
  mini_banners,
  pages,
  pageRevisions,
  pageCategories,
  pageCategoryRelations,
  pageAnalytics,
  cartAbandonmentToggle,
  cartSessions,
  cartEvents,
  cartsRecovered,
  campaignEmails
}

// Helper functions for data processing
let generatedStyleIdCounter = 1000000 // Counter for generating unique styleIds

function pickFirst<T = any>(source: Record<string, any>, keys: string[]): T | undefined {
  for (const key of keys) {
    if (source[key] !== undefined) {
      return source[key]
    }
  }
  return undefined
}

function toInt(value: any): number | undefined {
  if (value === null || value === undefined) return undefined
  const parsed = parseInt(String(value))
  return isNaN(parsed) ? undefined : parsed
}

function toBool(value: any): boolean | undefined {
  if (value === null || value === undefined) return undefined
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const lower = value.toLowerCase()
    if (lower === 'true' || lower === '1' || lower === 'yes') return true
    if (lower === 'false' || lower === '0' || lower === 'no') return false
  }
  if (typeof value === 'number') return value !== 0
  return undefined
}

function toDecimalString(value: any, fallback: string = '0.00'): string {
  if (value === null || value === undefined) return fallback
  const parsed = parseFloat(String(value))
  return isNaN(parsed) ? fallback : parsed.toFixed(2)
}

// Function to map filename to table name (handle underscores and special cases)
function mapFilenameToTableName(filename: string): string {
  // Remove .json extension and any text in parentheses (like (4), (25), (1))
  let baseName = filename.replace('.json', '').toLowerCase()
  
  // Remove text in parentheses and any extra spaces
  baseName = baseName.replace(/\s*\([^)]*\)/g, '').trim()
  
  // Handle special filename mappings
  const filenameMappings: Record<string, string> = {
    'admin_users': 'adminUsers',
    'api_integration': 'apiIntegrations',
    'attribute_values': 'attributeValues',
    'campaign_emails': 'campaignEmails',
    'carts_recovered': 'cartsRecovered',
    'cart_abandonment_toggle': 'cartAbandonmentToggle',
    'cart_events': 'cartEvents',
    'cart_sessions': 'cartSessions',
    'data_mode_settings': 'dataModeSettings',
    'gateway_monitoring_logs': 'paymentGatewayHealthChecks',
    'main_banners': 'mainBanners',
    'mini_banners': 'mini_banners', // Keep as is since it's already in schema
    'order_items': 'orderItems',
    'page_analytics': 'pageAnalytics',
    'page_categories': 'pageCategories',
    'page_category_relations': 'pageCategoryRelations',
    'page_revisions': 'pageRevisions',
    'payment_gateways': 'paymentGateways',
    'payment_settings': 'paymentSettings',
    'payment_transaction_logs': 'paymentTransactionLogs',
    'product_alternate_images': 'productAlternateImages',
    'product_attributes': 'productAttributes',
    'product_variations': 'productVariations',
    'shipping_methods': 'shippingMethods',
    'tax_rates': 'taxRates',
    'user_profiles': 'userProfiles',
    'variant_attributes': 'variantAttributes',
    'verification_tokens': 'verificationTokens',
    'brands': 'brands',
    'categories': 'categories',
    'customers': 'customers',
    'discounts': 'discounts',
    'orders': 'orders',
    'pages': 'pages',
    'products': 'products',
    'refunds': 'refunds',
    'reviews': 'reviews',
    'sessions': 'sessions',
    'settings': 'settings',
    'taxonomy': 'taxonomy',
    'users': 'users'
  }
  
  return filenameMappings[baseName] || baseName
}

// Independent table processors
const tableProcessors = {
  users: (item: any) => {
    const processed: any = {}

    // Respect provided id when valid UUID, else allow default
    const idRaw = pickFirst(item, ['id', 'ID'])
    const fixedId = validateAndFixUUID(idRaw, 'users.id')
    if (fixedId) processed.id = fixedId

    // emailVerified
    const emailVerifiedRaw = pickFirst(item, ['emailVerified', 'email_verified'])
    if (typeof emailVerifiedRaw === 'string' && emailVerifiedRaw) {
      try { processed.emailVerified = new Date(emailVerifiedRaw) } catch {}
    }

    // Core fields
    const nameRaw = pickFirst(item, ['name', 'NAME', 'fullName', 'full_name'])
    if (nameRaw !== undefined) processed.name = String(nameRaw)

    const emailRaw = pickFirst(item, ['email', 'EMAIL'])
    if (emailRaw !== undefined) {
      processed.email = String(emailRaw).trim().toLowerCase()
    }

    const passwordRaw = pickFirst(item, ['password', 'PASSWORD'])
    if (passwordRaw !== undefined) processed.password = String(passwordRaw)

    const imageRaw = pickFirst(item, ['image', 'IMAGE', 'profileImage', 'profile_image'])
    if (imageRaw !== undefined) processed.image = String(imageRaw)

    // Fallbacks
    if (!processed.email) {
      const suffix = (processed.id || Math.random().toString(36).slice(2, 8))
      processed.email = `user-${suffix}@example.com`
    }
    if (!processed.name) processed.name = 'Unknown User'

    // Cleanup undefined
    Object.keys(processed).forEach(key => {
      if (processed[key] === undefined) delete processed[key]
    })

    return processed
  },

  apiIntegrations: (item: any) => {
    const processed: any = {}
    
    // Handle ID field
    const idRaw = pickFirst(item, ['id', 'ID'])
    const nId = toInt(idRaw)
    if (nId !== undefined) processed.id = nId
    
    // Handle required text fields
    const nameRaw = pickFirst(item, ['name', 'NAME'])
    if (nameRaw !== undefined) processed.name = String(nameRaw)
    
    const customerNameRaw = pickFirst(item, ['customerName', 'customer_name', 'customerName'])
    if (customerNameRaw !== undefined) processed.customerName = String(customerNameRaw)
    
    const customerPasswordRaw = pickFirst(item, ['customerPassword', 'customer_password', 'customerPassword'])
    if (customerPasswordRaw !== undefined) processed.customerPassword = String(customerPasswordRaw)
    
    const apiKeyRaw = pickFirst(item, ['apiKey', 'api_key', 'apiKey'])
    if (apiKeyRaw !== undefined) processed.apiKey = String(apiKeyRaw)
    
    const apiSecretRaw = pickFirst(item, ['apiSecret', 'api_secret', 'apiSecret'])
    if (apiSecretRaw !== undefined) processed.apiSecret = String(apiSecretRaw)
    
    const tokenRaw = pickFirst(item, ['token', 'TOKEN'])
    if (tokenRaw !== undefined) processed.token = String(tokenRaw)
    
    const refreshTokenRaw = pickFirst(item, ['refreshToken', 'refresh_token', 'refreshToken'])
    if (refreshTokenRaw !== undefined) processed.refreshToken = String(refreshTokenRaw)
    
    // Handle additionalFields JSON field
    const additionalFieldsRaw = pickFirst(item, ['additionalFields', 'additional_fields', 'additionalFields'])
    if (additionalFieldsRaw !== undefined) {
      if (typeof additionalFieldsRaw === 'string') {
        try {
          processed.additionalFields = JSON.parse(additionalFieldsRaw)
        } catch (error) {
          processed.additionalFields = {
            field1: '',
            field2: '',
            field3: '',
            field4: '',
            field5: '',
          }
        }
      } else if (typeof additionalFieldsRaw === 'object') {
        processed.additionalFields = additionalFieldsRaw
      } else {
        processed.additionalFields = {
          field1: '',
          field2: '',
          field3: '',
          field4: '',
          field5: '',
        }
      }
    }
    
    // Handle timestamp fields
    const createdAtRaw = pickFirst(item, ['createdAt', 'created_at', 'createdAt'])
    if (createdAtRaw && typeof createdAtRaw === 'string') {
      try {
        processed.createdAt = new Date(createdAtRaw)
      } catch (error) {
        processed.createdAt = new Date()
      }
    }
    
    const updatedAtRaw = pickFirst(item, ['updatedAt', 'updated_at', 'updatedAt'])
    if (updatedAtRaw && typeof updatedAtRaw === 'string') {
      try {
        processed.updatedAt = new Date(updatedAtRaw)
      } catch (error) {
        processed.updatedAt = new Date()
      }
    }
    
    // Ensure required fields have defaults if missing
    if (!processed.name) processed.name = 'Default API Integration'
    if (!processed.customerName) processed.customerName = 'Default Customer'
    if (!processed.customerPassword) processed.customerPassword = 'default_password'
    if (!processed.apiKey) processed.apiKey = 'default_api_key'
    if (!processed.apiSecret) processed.apiSecret = 'default_api_secret'
    if (!processed.token) processed.token = 'default_token'
    if (!processed.refreshToken) processed.refreshToken = 'default_refresh_token'
    if (!processed.additionalFields) {
      processed.additionalFields = {
        field1: '',
        field2: '',
        field3: '',
        field4: '',
        field5: '',
      }
    }
    
    return processed
  },

  products: (item: any) => {
    const processed: any = {}
    
    // Don't set id - it's auto-generated serial primary key
    
    // Map snake_case JSON fields to camelCase schema fields
    const styleIdRaw = pickFirst(item, ['styleId', 'style_id', 'STYLE_ID', 'StyleId', 'style'])
    if (styleIdRaw !== undefined) {
      processed.styleId = styleIdRaw // Use camelCase to match schema
    } else {
      // Derive a unique styleId fallback from digits of sku/barcode or generate one
      const skuRaw = pickFirst(item, ['sku', 'SKU'])
      const barcodeRaw = pickFirst(item, ['barcode', 'BARCODE'])
      const candidate = toInt(skuRaw) ?? toInt(barcodeRaw)
      processed.styleId = candidate ?? (generatedStyleIdCounter++)
    }
    
    const nameRaw = pickFirst(item, ['name', 'NAME'])
    if (nameRaw !== undefined) processed.name = String(nameRaw)
    
    const styleRaw = pickFirst(item, ['style', 'STYLE'])
    if (styleRaw !== undefined) processed.style = String(styleRaw)
    
    const quantityAvailableRaw = pickFirst(item, ['quantityAvailable', 'quantity_available', 'QUANTITY_AVAILABLE'])
    const qa = toInt(quantityAvailableRaw)
    if (qa !== undefined) processed.quantityAvailable = qa
    
    const stockQuantityRaw = pickFirst(item, ['stockQuantity', 'stock_quantity', 'STOCK_QUANTITY'])
    const sq = toInt(stockQuantityRaw)
    if (sq !== undefined) processed.stockQuantity = sq
    
    const lowStockThresholdRaw = pickFirst(item, ['lowStockThreshold', 'low_stock_threshold', 'LOW_STOCK_THRESHOLD'])
    const lst = toInt(lowStockThresholdRaw)
    if (lst !== undefined) processed.lowStockThreshold = lst
    
    const sellingPriceRaw = pickFirst(item, ['sellingPrice', 'selling_price', 'SELLING_PRICE'])
    processed.sellingPrice = toDecimalString(sellingPriceRaw, '0.00')
    
    const regularPriceRaw = pickFirst(item, ['regularPrice', 'regular_price', 'REGULAR_PRICE'])
    processed.regularPrice = toDecimalString(regularPriceRaw, '0.00')
    
    const trackInventoryRaw = pickFirst(item, ['trackInventory', 'track_inventory', 'TRACK_INVENTORY'])
    const ti = toBool(trackInventoryRaw)
    if (ti !== undefined) processed.trackInventory = ti
    
    const continueOosRaw = pickFirst(item, ['continueSellingOutOfStock', 'continue_selling_out_of_stock', 'CONTINUE_SELLING_OUT_OF_STOCK'])
    const coos = toBool(continueOosRaw)
    if (coos !== undefined) processed.continueSellingOutOfStock = coos
    
    const smallPictureRaw = pickFirst(item, ['smallPicture', 'small_picture', 'SMALL_PICTURE'])
    if (smallPictureRaw !== undefined) processed.smallPicture = String(smallPictureRaw)
    
    const mediumPictureRaw = pickFirst(item, ['mediumPicture', 'medium_picture', 'MEDIUM_PICTURE'])
    if (mediumPictureRaw !== undefined) processed.mediumPicture = String(mediumPictureRaw)
    
    const largePictureRaw = pickFirst(item, ['largePicture', 'large_picture', 'LARGE_PICTURE'])
    if (largePictureRaw !== undefined) processed.largePicture = String(largePictureRaw)
    
    const departmentRaw = pickFirst(item, ['department', 'dept', 'DEPT'])
    if (departmentRaw !== undefined) processed.department = String(departmentRaw)
    
    const typeRaw = pickFirst(item, ['type', 'typ', 'TYP'])
    if (typeRaw !== undefined) processed.type = String(typeRaw)
    
    const subTypeRaw = pickFirst(item, ['subType', 'subtyp', 'SUBTYP'])
    if (subTypeRaw !== undefined) processed.subType = String(subTypeRaw)
    
    const urlHandleRaw = pickFirst(item, ['urlHandle', 'url_handle', 'URL_HANDLE'])
    if (urlHandleRaw !== undefined) processed.urlHandle = String(urlHandleRaw)
    
    const barcodeRaw = pickFirst(item, ['barcode', 'BARCODE'])
    if (barcodeRaw !== undefined) processed.barcode = String(barcodeRaw)
    
    const skuRaw = pickFirst(item, ['sku', 'SKU'])
    if (skuRaw !== undefined) processed.sku = String(skuRaw)
    
    // Handle other optional fields
    const brandRaw = pickFirst(item, ['brand', 'BRAND'])
    if (brandRaw !== undefined) processed.brand = String(brandRaw)
    
    const longDescriptionRaw = pickFirst(item, ['longDescription', 'long_description', 'description'])
    if (longDescriptionRaw !== undefined) processed.longDescription = String(longDescriptionRaw)
    
    const tagsRaw = pickFirst(item, ['tags', 'TAGS'])
    if (tagsRaw !== undefined) processed.tags = String(tagsRaw)
    
    const onSaleRaw = pickFirst(item, ['onSale', 'on_sale'])
    if (onSaleRaw !== undefined) processed.onSale = String(onSaleRaw)
    
    const isNewRaw = pickFirst(item, ['isNew', 'is_new'])
    if (isNewRaw !== undefined) processed.isNew = String(isNewRaw)
    
    const forceBuyQtyLimitRaw = pickFirst(item, ['forceBuyQtyLimit', 'force_buy_qty_limit'])
    if (forceBuyQtyLimitRaw !== undefined) processed.forceBuyQtyLimit = String(forceBuyQtyLimitRaw)
    
    const lastReceivedRaw = pickFirst(item, ['lastReceived', 'last_rcvd'])
    if (lastReceivedRaw !== undefined) processed.lastReceived = String(lastReceivedRaw)
    
    const of7Raw = pickFirst(item, ['of7', 'OF7'])
    if (of7Raw !== undefined) processed.of7 = String(of7Raw)
    
    const of12Raw = pickFirst(item, ['of12', 'OF12'])
    if (of12Raw !== undefined) processed.of12 = String(of12Raw)
    
    const of13Raw = pickFirst(item, ['of13', 'OF13'])
    if (of13Raw !== undefined) processed.of13 = String(of13Raw)
    
    const of15Raw = pickFirst(item, ['of15', 'OF15'])
    if (of15Raw !== undefined) processed.of15 = String(of15Raw)
    
    // Handle timestamps
    const createdAtRaw = pickFirst(item, ['createdAt', 'created_at'])
    if (createdAtRaw !== undefined && createdAtRaw !== null) {
      processed.createdAt = new Date(createdAtRaw)
    }
    
    const updatedAtRaw = pickFirst(item, ['updatedAt', 'updated_at'])
    if (updatedAtRaw !== undefined && updatedAtRaw !== null) {
      processed.updatedAt = new Date(updatedAtRaw)
    }
    
    // Ensure required fields have defaults
    if (!processed.name) processed.name = 'Unnamed Product'
    if (!processed.style) processed.style = String(processed.styleId || 'unknown')
    if (!processed.sellingPrice) processed.sellingPrice = '0.00'
    if (!processed.regularPrice) processed.regularPrice = '0.00'
    if (!processed.trackInventory) processed.trackInventory = false
    if (!processed.stockQuantity) processed.stockQuantity = 0
    if (!processed.continueSellingOutOfStock) processed.continueSellingOutOfStock = false
    if (!processed.quantityAvailable) processed.quantityAvailable = 0
    if (!processed.onSale) processed.onSale = 'N'
    if (!processed.isNew) processed.isNew = 'N'
    
    // Remove undefined fields to prevent database errors
    Object.keys(processed).forEach(key => {
      if (processed[key] === undefined) {
        delete processed[key]
      }
    })
    
    return processed
  },

  discounts: (item: any) => {
    const processed: any = {}
    
    // Don't set id - it's auto-generated UUID
    // const idRaw = pickFirst(item, ['id', 'ID'])
    // if (idRaw !== undefined) processed.id = String(idRaw)
    
    const codeRaw = pickFirst(item, ['code', 'CODE'])
    if (codeRaw !== undefined) processed.code = String(codeRaw)
    
    const typeRaw = pickFirst(item, ['type', 'TYPE'])
    if (typeRaw !== undefined) processed.type = String(typeRaw)
    
    const valueRaw = pickFirst(item, ['value', 'VALUE'])
    if (valueRaw !== undefined) processed.value = toDecimalString(valueRaw)
    
    const startDateRaw = pickFirst(item, ['startDate', 'start_date', 'START_DATE'])
    if (startDateRaw && typeof startDateRaw === 'string') {
      try {
        processed.startDate = new Date(startDateRaw)
      } catch (error) {
        processed.startDate = new Date()
      }
    }
    
    const endDateRaw = pickFirst(item, ['endDate', 'end_date', 'END_DATE'])
    if (endDateRaw && typeof endDateRaw === 'string') {
      try {
        processed.endDate = new Date(endDateRaw)
      } catch (error) {
        processed.endDate = new Date()
      }
    }
    
    const usageCountRaw = pickFirst(item, ['usageCount', 'usage_count', 'USAGE_COUNT'])
    if (usageCountRaw !== undefined) processed.usageCount = toInt(usageCountRaw)
    
    const isActiveRaw = pickFirst(item, ['isActive', 'is_active', 'IS_ACTIVE'])
    const isActive = toBool(isActiveRaw)
    if (isActive !== undefined) processed.isActive = isActive
    
    // Handle timestamps
    const createdAtRaw = pickFirst(item, ['createdAt', 'created_at'])
    if (createdAtRaw && typeof createdAtRaw === 'string') {
      try {
        processed.createdAt = new Date(createdAtRaw)
      } catch (error) {
        processed.createdAt = new Date()
      }
    }
    
    const updatedAtRaw = pickFirst(item, ['updatedAt', 'updated_at'])
    if (updatedAtRaw && typeof updatedAtRaw === 'string') {
      try {
        processed.updatedAt = new Date(updatedAtRaw)
      } catch (error) {
        processed.updatedAt = new Date()
      }
    }
    
    // Remove undefined values
    Object.keys(processed).forEach(key => {
      if (processed[key] === undefined) {
        delete processed[key]
      }
    })
    
    return processed
  },

  addresses: (item: any) => {
    const processed: any = {}
    
    // Don't set id - it's auto-generated UUID
    // const idRaw = pickFirst(item, ['id', 'ID'])
    // if (idRaw !== undefined) processed.id = String(idRaw)
    
    // Handle userId - this is a foreign key to users.id
    const userIdRaw = pickFirst(item, ['userId', 'user_id', 'USER_ID', 'userId'])
    if (userIdRaw !== undefined) {
      // Ensure it's a valid UUID string
      const userIdStr = String(userIdRaw)
      if (userIdStr && userIdStr !== 'null' && userIdStr !== 'undefined') {
        processed.userId = userIdStr // Use userId to match schema field name
      }
    }
    
    const typeRaw = pickFirst(item, ['type', 'TYPE'])
    if (typeRaw !== undefined) processed.type = String(typeRaw)
    
    const isDefaultRaw = pickFirst(item, ['isDefault', 'is_default', 'IS_DEFAULT'])
    const isDefault = toBool(isDefaultRaw)
    if (isDefault !== undefined) processed.isDefault = isDefault // Use isDefault to match schema
    
    const streetRaw = pickFirst(item, ['street', 'STREET'])
    if (streetRaw !== undefined) processed.street = String(streetRaw)
    
    const street2Raw = pickFirst(item, ['street2', 'street_2', 'STREET_2'])
    if (street2Raw !== undefined) processed.street2 = String(street2Raw) // Use street2 to match schema
    
    const cityRaw = pickFirst(item, ['city', 'CITY'])
    if (cityRaw !== undefined) processed.city = String(cityRaw)
    
    const stateRaw = pickFirst(item, ['state', 'STATE'])
    if (stateRaw !== undefined) processed.state = String(stateRaw)
    
    const postalCodeRaw = pickFirst(item, ['postalCode', 'postal_code', 'POSTAL_CODE'])
    if (postalCodeRaw !== undefined) processed.postalCode = String(postalCodeRaw) // Use postalCode to match schema
    
    const countryRaw = pickFirst(item, ['country', 'COUNTRY'])
    if (countryRaw !== undefined) processed.country = String(countryRaw)
    
    // Handle timestamps
    const createdAtRaw = pickFirst(item, ['createdAt', 'created_at'])
    if (createdAtRaw && typeof createdAtRaw === 'string') {
      try {
        processed.createdAt = new Date(createdAtRaw) // Use createdAt to match schema
      } catch (error) {
        processed.createdAt = new Date()
      }
    }
    
    const updatedAtRaw = pickFirst(item, ['updatedAt', 'updated_at'])
    if (updatedAtRaw && typeof updatedAtRaw === 'string') {
      try {
        processed.updatedAt = new Date(updatedAtRaw) // Use updatedAt to match schema
      } catch (error) {
        processed.updatedAt = new Date()
      }
    }
    
    // Ensure required fields have defaults
    if (!processed.userId) {
      // Try to find an existing user ID from the database
      // For now, we'll use a placeholder that should be replaced with a real user ID
      processed.userId = '00000000-0000-0000-0000-000000000000'
    }
    
    // Validate userId - if it's not a valid UUID format, skip this record
    if (processed.userId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(processed.userId)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Skipping address with invalid userId format: ${processed.userId}`)
      }
      return null // This will be filtered out later
    }
    
    // If userId is the placeholder, skip this record to avoid foreign key constraint violations
    if (processed.userId === '00000000-0000-0000-0000-000000000000') {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Skipping address with placeholder userId to avoid foreign key constraint violation`)
      }
      return null // This will be filtered out later
    }
    if (!processed.type) processed.type = 'billing'
    if (!processed.street) processed.street = 'Unknown Street'
    if (!processed.city) processed.city = 'Unknown City'
    if (!processed.state) processed.state = 'Unknown State'
    if (!processed.postalCode) processed.postalCode = '00000'
    if (!processed.country) processed.country = 'Unknown Country'
    if (!processed.isDefault) processed.isDefault = false
    
    // Remove undefined fields to prevent database errors
    Object.keys(processed).forEach(key => {
      if (processed[key] === undefined) {
        delete processed[key]
      }
    })
    
    return processed
  },

  // Generic processor for tables without specific requirements
  default: (item: any) => {
    const processed: any = {}
    
    // Handle common timestamp fields
    const timestampFields = ['createdAt', 'updatedAt', 'DLU', 'created_at', 'updated_at']
    timestampFields.forEach(field => {
      if (item[field] && typeof item[field] === 'string') {
        try {
          processed[field] = new Date(item[field])
        } catch (error) {
          processed[field] = new Date()
        }
      }
    })
    
    // Copy all other fields as-is
    Object.keys(item).forEach(key => {
      if (!timestampFields.includes(key) && item[key] !== undefined) {
        processed[key] = item[key]
      }
    })
    
    return processed
  },

  shippingMethods: (item: any) => {
    const processed: any = {}
    
    const idRaw = pickFirst(item, ['id', 'ID'])
    if (idRaw !== undefined) processed.id = String(idRaw) // Keep as UUID string
    
    const priceRaw = pickFirst(item, ['price'])
    processed.price = toDecimalString(priceRaw, '0.00')
    
    const estimatedDaysRaw = pickFirst(item, ['estimatedDays', 'estimated_days'])
    const estimatedDays = toInt(estimatedDaysRaw)
    if (estimatedDays !== undefined) processed.estimatedDays = estimatedDays
    
    const isActiveRaw = pickFirst(item, ['isActive', 'is_active'])
    const isActive = toBool(isActiveRaw)
    if (isActive !== undefined) processed.isActive = isActive
    
    // Ensure required fields have defaults if missing
    if (!processed.name) processed.name = 'Standard Shipping'
    if (!processed.estimatedDays) processed.estimatedDays = 3
    
    return processed
  },

  adminUsers: (item: any) => {
    const processed: any = {}
    
    const idRaw = pickFirst(item, ['id', 'ID'])
    if (idRaw !== undefined) processed.id = String(idRaw) // Keep as UUID string
    
    const emailVerifiedRaw = pickFirst(item, ['emailVerified', 'email_verified'])
    const emailVerified = toBool(emailVerifiedRaw)
    if (emailVerified !== undefined) processed.emailVerified = emailVerified
    
    const isDeletedRaw = pickFirst(item, ['isDeleted', 'is_deleted'])
    const isDeleted = toBool(isDeletedRaw)
    if (isDeleted !== undefined) processed.isDeleted = isDeleted
    
    // Handle other fields
    const nameRaw = pickFirst(item, ['name', 'NAME'])
    if (nameRaw !== undefined) processed.name = String(nameRaw)
    
    const emailRaw = pickFirst(item, ['email', 'EMAIL'])
    if (emailRaw !== undefined) processed.email = String(emailRaw)
    
    const passwordHashRaw = pickFirst(item, ['passwordHash', 'password_hash'])
    if (passwordHashRaw !== undefined) processed.passwordHash = String(passwordHashRaw)
    
    const roleRaw = pickFirst(item, ['role', 'ROLE'])
    if (roleRaw !== undefined) processed.role = String(roleRaw)
    
    const statusRaw = pickFirst(item, ['status', 'STATUS'])
    if (statusRaw !== undefined) processed.status = String(statusRaw)
    
    // Ensure required fields have defaults if missing
    if (!processed.name) processed.name = 'Admin User'
    if (!processed.email) processed.email = `admin-${Date.now()}@example.com`
    if (!processed.passwordHash) processed.passwordHash = 'default-hash'
    if (!processed.role) processed.role = 'user'
    if (!processed.status) processed.status = 'active'
    
    return processed
  },

  productAttributes: (item: any) => {
    const processed: any = {}
    
    // ID is auto-generated, so don't set it from JSON data
    // const idRaw = pickFirst(item, ['id', 'ID'])
    // const id = toInt(idRaw)
    // if (id !== undefined) processed.id = id
    
    const productIdRaw = pickFirst(item, ['productId', 'product_id'])
    const productId = validateAndFixUUID(productIdRaw, 'product_attributes.productId')
    if (productId) {
      processed.productId = productId
    } else {
      console.warn('Skipping productAttributes record without valid productId:', item)
      return null
    }
    
    const attributeIdRaw = pickFirst(item, ['attributeId', 'attribute_id'])
    if (attributeIdRaw !== undefined) processed.attributeId = String(attributeIdRaw) // Keep as UUID string
    
    const attributeValueIdRaw = pickFirst(item, ['attributeValueId', 'attribute_value_id'])
    if (attributeValueIdRaw !== undefined) processed.attributeValueId = String(attributeValueIdRaw) // Keep as UUID string
    
    return processed
  },

  variantAttributes: (item: any) => {
    const processed: any = {}
    
    // ID is serial primary key, so don't set it from JSON data
    // const idRaw = pickFirst(item, ['id', 'ID'])
    // const id = toInt(idRaw)
    // if (id !== undefined) processed.id = id
    
    const variationIdRaw = pickFirst(item, ['variationId', 'variation_id', 'variationId'])
    const variationId = validateAndFixUUID(variationIdRaw, 'variant_attributes.variationId')
    if (variationId) {
      processed.variationId = variationId
    } else {
      console.warn('Skipping variantAttributes record without valid variationId:', item)
      return null
    }
    
    const attributeIdRaw = pickFirst(item, ['attributeId', 'attribute_id', 'attributeId'])
    if (attributeIdRaw !== undefined) {
      processed.attributeId = String(attributeIdRaw) // Keep as UUID string
    } else {
      console.warn('Skipping variantAttributes record without attributeId:', item)
      return null
    }
    
    const attributeValueIdRaw = pickFirst(item, ['attributeValueId', 'attribute_value_id', 'attributeValueId'])
    if (attributeValueIdRaw !== undefined) {
      processed.attributeValueId = String(attributeValueIdRaw) // Keep as UUID string
    } else {
      console.warn('Skipping variantAttributes record without attributeValueId:', item)
      return null
    }
    
    // Handle timestamps
    const createdAtRaw = pickFirst(item, ['createdAt', 'created_at'])
    if (createdAtRaw && typeof createdAtRaw === 'string') {
      try { processed.createdAt = new Date(createdAtRaw) } catch (error) { processed.createdAt = new Date() }
    }
    const updatedAtRaw = pickFirst(item, ['updatedAt', 'updated_at'])
    if (updatedAtRaw && typeof updatedAtRaw === 'string') {
      try { processed.updatedAt = new Date(updatedAtRaw) } catch (error) { processed.updatedAt = new Date() }
    }
    
    // Validate required fields
    if (!processed.variationId) { 
      console.warn('Skipping variantAttributes record without variationId:', item); 
      return null 
    }
    if (!processed.attributeId) { 
      console.warn('Skipping variantAttributes record without attributeId:', item); 
      return null 
    }
    if (!processed.attributeValueId) { 
      console.warn('Skipping variantAttributes record without attributeValueId:', item); 
      return null 
    }
    
    // Remove undefined fields to prevent database errors
    Object.keys(processed).forEach(key => { 
      if (processed[key] === undefined) { 
        delete processed[key] 
      } 
    })
    
    return processed
  },

  refunds: (item: any) => {
    const processed: any = {}
    
    // Don't set id - it's auto-generated UUID primary key
    
    // Map snake_case JSON fields to camelCase schema fields
    const orderIdRaw = pickFirst(item, ['orderId', 'order_id', 'orderId'])
    const validatedOrderId = validateAndFixUUID(orderIdRaw, 'orderId')
    if (validatedOrderId) {
      processed.orderId = validatedOrderId
    } else {
      console.warn('Skipping refunds record without valid orderId:', item)
      return null
    }
    
    const refundedByRaw = pickFirst(item, ['refundedBy', 'refunded_by', 'refundedBy'])
    const validatedRefundedBy = validateAndFixUUID(refundedByRaw, 'refundedBy')
    if (validatedRefundedBy) {
      processed.refundedBy = validatedRefundedBy
    }
    
    const amountRaw = pickFirst(item, ['amount', 'AMOUNT', 'Amount'])
    if (amountRaw !== undefined) {
      processed.amount = toDecimalString(amountRaw, '0.00')
    } else {
      console.warn('Skipping refunds record without amount:', item)
      return null
    }
    
    const refundFeeRaw = pickFirst(item, ['refundFee', 'refund_fee', 'refundFee'])
    const refundFee = toInt(refundFeeRaw)
    if (refundFee !== undefined) {
      processed.refundFee = refundFee
    }
    
    // Handle required fields
    const reasonRaw = pickFirst(item, ['reason', 'REASON', 'Reason'])
    if (reasonRaw !== undefined) {
      processed.reason = String(reasonRaw)
    } else {
      console.warn('Skipping refunds record without reason:', item)
      return null
    }
    
    const paymentStatusRaw = pickFirst(item, ['paymentStatus', 'payment_status', 'paymentStatus'])
    if (paymentStatusRaw !== undefined) {
      processed.paymentStatus = String(paymentStatusRaw)
    } else {
      processed.paymentStatus = 'pending'
    }
    
    const refundMethodRaw = pickFirst(item, ['refundMethod', 'refund_method', 'refundMethod'])
    if (refundMethodRaw !== undefined) {
      processed.refundMethod = String(refundMethodRaw)
    } else {
      processed.refundMethod = 'original_payment'
    }
    
    const refundPolicyRaw = pickFirst(item, ['refundPolicy', 'refund_policy', 'refundPolicy'])
    if (refundPolicyRaw !== undefined) {
      processed.refundPolicy = String(refundPolicyRaw)
    } else {
      processed.refundPolicy = 'standard'
    }
    
    const refundTypeRaw = pickFirst(item, ['refundType', 'refund_type', 'refundType'])
    if (refundTypeRaw !== undefined) {
      processed.refundType = String(refundTypeRaw)
    } else {
      processed.refundType = 'full'
    }
    
    const refundCurrencyRaw = pickFirst(item, ['refundCurrency', 'refund_currency', 'refundCurrency'])
    if (refundCurrencyRaw !== undefined) {
      processed.refundCurrency = String(refundCurrencyRaw)
    } else {
      processed.refundCurrency = 'USD'
    }
    
    // Handle optional fields
    const notesRaw = pickFirst(item, ['notes', 'NOTES', 'Notes'])
    if (notesRaw !== undefined) {
      processed.notes = String(notesRaw)
    }
    
    const customerEmailRaw = pickFirst(item, ['customerEmail', 'customer_email', 'customerEmail'])
    if (customerEmailRaw !== undefined) {
      processed.customerEmail = String(customerEmailRaw)
    }
    
    const customerNameRaw = pickFirst(item, ['customerName', 'customer_name', 'customerName'])
    if (customerNameRaw !== undefined) {
      processed.customerName = String(customerNameRaw)
    }
    
    const refundTransactionIdRaw = pickFirst(item, ['refundTransactionId', 'refund_transaction_id', 'refundTransactionId'])
    if (refundTransactionIdRaw !== undefined) {
      processed.refundTransactionId = String(refundTransactionIdRaw)
    }
    
    const adminNotesRaw = pickFirst(item, ['adminNotes', 'admin_notes', 'adminNotes'])
    if (adminNotesRaw !== undefined) {
      processed.adminNotes = String(adminNotesRaw)
    }
    
    // Handle JSON fields
    const refundItemsRaw = pickFirst(item, ['refundItems', 'refund_items', 'refundItems'])
    if (refundItemsRaw !== undefined) {
      try {
        processed.refundItems = typeof refundItemsRaw === 'string' ? JSON.parse(refundItemsRaw) : refundItemsRaw
      } catch (error) {
        console.warn('Invalid refundItems JSON for refunds record:', item)
      }
    }
    
    const refundStatusHistoryRaw = pickFirst(item, ['refundStatusHistory', 'refund_status_history', 'refundStatusHistory'])
    if (refundStatusHistoryRaw !== undefined) {
      try {
        processed.refundStatusHistory = typeof refundStatusHistoryRaw === 'string' ? JSON.parse(refundStatusHistoryRaw) : refundStatusHistoryRaw
      } catch (error) {
        console.warn('Invalid refundStatusHistory JSON for refunds record:', item)
      }
    }
    
    const refundDocumentsRaw = pickFirst(item, ['refundDocuments', 'refund_documents', 'refundDocuments'])
    if (refundDocumentsRaw !== undefined) {
      try {
        processed.refundDocuments = typeof refundDocumentsRaw === 'string' ? JSON.parse(refundDocumentsRaw) : refundDocumentsRaw
      } catch (error) {
        console.warn('Invalid refundDocuments JSON for refunds record:', item)
      }
    }
    
    const refundCommunicationRaw = pickFirst(item, ['refundCommunication', 'refund_communication', 'refundCommunication'])
    if (refundCommunicationRaw !== undefined) {
      try {
        processed.refundCommunication = typeof refundCommunicationRaw === 'string' ? JSON.parse(refundCommunicationRaw) : refundCommunicationRaw
      } catch (error) {
        console.warn('Invalid refundCommunication JSON for refunds record:', item)
      }
    }
    
    const refundAnalyticsRaw = pickFirst(item, ['refundAnalytics', 'refund_analytics', 'refundAnalytics'])
    if (refundAnalyticsRaw !== undefined) {
      try {
        processed.refundAnalytics = typeof refundAnalyticsRaw === 'string' ? JSON.parse(refundAnalyticsRaw) : refundAnalyticsRaw
      } catch (error) {
        console.warn('Invalid refundAnalytics JSON for refunds record:', item)
      }
    }
    
    // Handle timestamps
    const createdAtRaw = pickFirst(item, ['createdAt', 'created_at'])
    if (createdAtRaw && typeof createdAtRaw === 'string') {
      try { processed.createdAt = new Date(createdAtRaw) } catch (error) { processed.createdAt = new Date() }
    }
    
    const updatedAtRaw = pickFirst(item, ['updatedAt', 'updated_at'])
    if (updatedAtRaw && typeof updatedAtRaw === 'string') {
      try { processed.updatedAt = new Date(updatedAtRaw) } catch (error) { processed.updatedAt = new Date() }
    }
    
    const completedAtRaw = pickFirst(item, ['completedAt', 'completed_at'])
    if (completedAtRaw && typeof completedAtRaw === 'string') {
      try { processed.completedAt = new Date(completedAtRaw) } catch (error) { processed.completedAt = new Date() }
    }
    
    // Validate required fields
    if (!processed.orderId) {
      console.warn('Skipping refunds record without orderId:', item);
      return null
    }
    if (!processed.amount) {
      console.warn('Skipping refunds record without amount:', item);
      return null
    }
    if (!processed.reason) {
      console.warn('Skipping refunds record without reason:', item);
      return null
    }
    
    // Remove undefined fields to prevent database errors
    Object.keys(processed).forEach(key => {
      if (processed[key] === undefined) {
        delete processed[key]
      }
    })
    
    return processed
  },

  reviews: (item: any) => {
    const processed: any = {}
    
    const idRaw = pickFirst(item, ['id', 'ID'])
    if (idRaw !== undefined) processed.id = String(idRaw) // Keep as UUID string
    
    const userIdRaw = pickFirst(item, ['userId', 'user_id'])
    if (userIdRaw !== undefined) processed.userId = String(userIdRaw) // Keep as UUID string
    
    const productIdRaw = pickFirst(item, ['productId', 'product_id'])
    const productId = validateAndFixUUID(productIdRaw, 'reviews.productId')
    if (productId) {
      processed.productId = productId
    } else {
      console.warn('Skipping reviews record without valid productId:', item)
      return null
    }
    
    const ratingRaw = pickFirst(item, ['rating'])
    const rating = toInt(ratingRaw)
    if (rating !== undefined) processed.rating = rating
    
    const helpfulVotesRaw = pickFirst(item, ['helpfulVotes', 'helpful_votes'])
    const hv = toInt(helpfulVotesRaw)
    if (hv !== undefined) processed.helpfulVotes = hv
    
    const verifiedRaw = pickFirst(item, ['verifiedPurchase', 'verified_purchase'])
    const ver = toBool(verifiedRaw)
    if (ver !== undefined) processed.verifiedPurchase = ver
    
    // Handle other fields
    const titleRaw = pickFirst(item, ['title', 'TITLE'])
    if (titleRaw !== undefined) processed.title = String(titleRaw)
    
    const contentRaw = pickFirst(item, ['content', 'CONTENT'])
    if (contentRaw !== undefined) processed.content = String(contentRaw)
    
    // Ensure required fields have defaults if missing
    if (!processed.title) processed.title = 'Review'
    if (!processed.content) processed.content = 'No content provided'
    if (!processed.rating) processed.rating = 5
    
    return processed
  },

  cartSessions: (item: any) => {
    const processed: any = {}
    
    const idRaw = pickFirst(item, ['id', 'ID'])
    if (idRaw !== undefined) processed.id = String(idRaw) // Keep as UUID string
    
    const sessionIdRaw = pickFirst(item, ['sessionId', 'session_id'])
    if (sessionIdRaw !== undefined) processed.sessionId = String(sessionIdRaw)
    
    const userIdRaw = pickFirst(item, ['userId', 'user_id'])
    if (userIdRaw !== undefined) processed.userId = String(userIdRaw) // Keep as UUID string
    
    const totalAmountRaw = pickFirst(item, ['totalAmount', 'total_amount'])
    processed.totalAmount = toDecimalString(totalAmountRaw, '0.00')
    
    const itemCountRaw = pickFirst(item, ['itemCount', 'item_count'])
    const itemCount = toInt(itemCountRaw)
    if (itemCount !== undefined) processed.itemCount = itemCount
    
    const sessionDurationRaw = pickFirst(item, ['sessionDuration', 'session_duration'])
    const sessionDuration = toInt(sessionDurationRaw)
    if (sessionDuration !== undefined) processed.sessionDuration = sessionDuration
    
    // Handle other fields
    const cartHashRaw = pickFirst(item, ['cartHash', 'cart_hash'])
    if (cartHashRaw !== undefined) processed.cartHash = String(cartHashRaw)
    
    const statusRaw = pickFirst(item, ['status', 'STATUS'])
    if (statusRaw !== undefined) processed.status = String(statusRaw)
    
    // Ensure required fields have defaults if missing
    if (!processed.cartHash) processed.cartHash = `cart-${Date.now()}`
    if (!processed.status) processed.status = 'active'
    
    return processed
  },

  cartEvents: (item: any) => {
    const processed: any = {}
    
    const idRaw = pickFirst(item, ['id', 'ID'])
    if (idRaw !== undefined) processed.id = String(idRaw) // Keep as UUID string
    
    const sessionIdRaw = pickFirst(item, ['sessionId', 'session_id'])
    if (sessionIdRaw !== undefined) processed.sessionId = String(sessionIdRaw)
    
    const productIdRaw = pickFirst(item, ['productId', 'product_id'])
    const productId = validateAndFixUUID(productIdRaw, 'cart_events.productId')
    if (productId) {
      processed.productId = productId
    } else {
      console.warn('Skipping cartEvents record without valid productId:', item)
      return null
    }
    
    const quantityRaw = pickFirst(item, ['quantity'])
    const quantity = toInt(quantityRaw)
    if (quantity !== undefined) processed.quantity = quantity
    
    const priceRaw = pickFirst(item, ['price'])
    processed.price = toDecimalString(priceRaw, '0.00')
    
    const totalValueRaw = pickFirst(item, ['totalValue', 'total_value'])
    processed.totalValue = toDecimalString(totalValueRaw, '0.00')
    
    // Handle other fields
    const eventTypeRaw = pickFirst(item, ['eventType', 'event_type'])
    if (eventTypeRaw !== undefined) processed.eventType = String(eventTypeRaw)
    
    // Ensure required fields have defaults if missing
    if (!processed.eventType) processed.eventType = 'add_item'
    
    return processed
  },

  cartsRecovered: (item: any) => {
    const processed: any = {}
    
    const idRaw = pickFirst(item, ['id', 'ID'])
    if (idRaw !== undefined) processed.id = String(idRaw) // Keep as UUID string
    
    const abandonedCartIdRaw = pickFirst(item, ['abandonedCartId', 'abandoned_cart_id'])
    if (abandonedCartIdRaw !== undefined) processed.abandonedCartId = String(abandonedCartIdRaw) // Keep as UUID string
    
    const recoverySessionIdRaw = pickFirst(item, ['recoverySessionId', 'recovery_session_id'])
    if (recoverySessionIdRaw !== undefined) processed.recoverySessionId = String(recoverySessionIdRaw)
    
    const recoveryAmountRaw = pickFirst(item, ['recoveryAmount', 'recovery_amount'])
    processed.recoveryAmount = toDecimalString(recoveryAmountRaw, '0.00')
    
    const itemCountRaw = pickFirst(item, ['itemCount', 'item_count'])
    const itemCount = toInt(itemCountRaw)
    if (itemCount !== undefined) processed.itemCount = itemCount
    
    const timeToRecoveryHoursRaw = pickFirst(item, ['timeToRecoveryHours', 'time_to_recovery_hours'])
    const timeToRecoveryHours = parseFloat(String(timeToRecoveryHoursRaw || '0'))
    if (!isNaN(timeToRecoveryHours)) processed.timeToRecoveryHours = timeToRecoveryHours.toFixed(2)
    
    // Handle other fields
    const customerEmailRaw = pickFirst(item, ['customerEmail', 'customer_email'])
    if (customerEmailRaw !== undefined) processed.customerEmail = String(customerEmailRaw)
    
    // Ensure required fields have defaults if missing
    if (!processed.customerEmail) processed.customerEmail = 'unknown@example.com'
    
    return processed
  },

  campaignEmails: (item: any) => {
    const processed: any = {}
    
    const idRaw = pickFirst(item, ['id', 'ID'])
    if (idRaw !== undefined) processed.id = String(idRaw) // Keep as UUID string
    
    const sessionIdRaw = pickFirst(item, ['sessionId', 'session_id'])
    if (sessionIdRaw !== undefined) processed.sessionId = String(sessionIdRaw)
    
    const emailNumberRaw = pickFirst(item, ['emailNumber', 'email_number'])
    const emailNumber = toInt(emailNumberRaw)
    if (emailNumber !== undefined) processed.emailNumber = emailNumber
    
    const recoveryAmountRaw = pickFirst(item, ['recoveryAmount', 'recovery_amount'])
    processed.recoveryAmount = toDecimalString(recoveryAmountRaw, '0.00')
    
    // Handle other fields
    const customerEmailRaw = pickFirst(item, ['customerEmail', 'customer_email'])
    if (customerEmailRaw !== undefined) processed.customerEmail = String(customerEmailRaw)
    
    const statusRaw = pickFirst(item, ['status', 'STATUS'])
    if (statusRaw !== undefined) processed.status = String(statusRaw)
    
    // Ensure required fields have defaults if missing
    if (!processed.customerEmail) processed.customerEmail = 'unknown@example.com'
    if (!processed.status) processed.status = 'sent'
    
    return processed
  },

  taxonomy: (item: any) => {
    const processed: any = {}
    
    // Don't set WEB_TAXONOMY_ID - it's auto-generated serial primary key
    // if (item.WEB_TAXONOMY_ID && typeof item.WEB_TAXONOMY_ID === 'string') {
    //   processed.WEB_TAXONOMY_ID = parseInt(item.WEB_TAXONOMY_ID)
    // }
    
    // Handle integer fields
    const activeRaw = pickFirst(item, ['ACTIVE', 'active'])
    const active = toInt(activeRaw)
    if (active !== undefined) processed.ACTIVE = active
    
    const siteRaw = pickFirst(item, ['SITE', 'site'])
    const site = toInt(siteRaw)
    if (site !== undefined) processed.SITE = site
    
    // Handle date fields
    const dluRaw = pickFirst(item, ['DLU', 'dlu', 'createdAt', 'created_at'])
    if (dluRaw && typeof dluRaw === 'string') {
      try {
        processed.DLU = new Date(dluRaw)
      } catch (error) {
        processed.DLU = new Date()
      }
    }
    
    // Handle text fields
    const deptRaw = pickFirst(item, ['DEPT', 'dept'])
    if (deptRaw !== undefined) processed.DEPT = String(deptRaw)
    
    const typRaw = pickFirst(item, ['TYP', 'typ'])
    if (typRaw !== undefined) processed.TYP = String(typRaw)
    
    const subtyp1Raw = pickFirst(item, ['SUBTYP_1', 'subtyp_1'])
    if (subtyp1Raw !== undefined) processed.SUBTYP_1 = String(subtyp1Raw)
    
    const subtyp2Raw = pickFirst(item, ['SUBTYP_2', 'subtyp_2'])
    if (subtyp2Raw !== undefined) processed.SUBTYP_2 = String(subtyp2Raw)
    
    const subtyp3Raw = pickFirst(item, ['SUBTYP_3', 'subtyp_3'])
    if (subtyp3Raw !== undefined) processed.SUBTYP_3 = String(subtyp3Raw)
    
    const sortPositionRaw = pickFirst(item, ['SORT_POSITION', 'sort_position'])
    if (sortPositionRaw !== undefined) processed.SORT_POSITION = String(sortPositionRaw)
    
    const webUrlRaw = pickFirst(item, ['WEB_URL', 'web_url'])
    if (webUrlRaw !== undefined) processed.WEB_URL = String(webUrlRaw)
    
    const longDescriptionRaw = pickFirst(item, ['LONG_DESCRIPTION', 'long_description'])
    if (longDescriptionRaw !== undefined) processed.LONG_DESCRIPTION = String(longDescriptionRaw)
    
    const categoryStyleRaw = pickFirst(item, ['CATEGORY_STYLE', 'category_style'])
    if (categoryStyleRaw !== undefined) processed.CATEGORY_STYLE = String(categoryStyleRaw)
    
    const shortDescRaw = pickFirst(item, ['SHORT_DESC', 'short_desc'])
    if (shortDescRaw !== undefined) processed.SHORT_DESC = String(shortDescRaw)
    
    const longDescription2Raw = pickFirst(item, ['LONG_DESCRIPTION_2', 'long_description_2'])
    if (longDescription2Raw !== undefined) processed.LONG_DESCRIPTION_2 = String(longDescription2Raw)
    
    const metaTagsRaw = pickFirst(item, ['META_TAGS', 'meta_tags'])
    if (metaTagsRaw !== undefined) processed.META_TAGS = String(metaTagsRaw)
    
    const backgroundImageRaw = pickFirst(item, ['BACKGROUNDIMAGE', 'backgroundimage'])
    if (backgroundImageRaw !== undefined) processed.BACKGROUNDIMAGE = String(backgroundImageRaw)
    
    const shortDescOnPageRaw = pickFirst(item, ['SHORT_DESC_ON_PAGE', 'short_desc_on_page'])
    if (shortDescOnPageRaw !== undefined) processed.SHORT_DESC_ON_PAGE = String(shortDescOnPageRaw)
    
    const googleProductTaxonomyRaw = pickFirst(item, ['GOOGLEPRODUCTTAXONOMY', 'googleproducttaxonomy'])
    if (googleProductTaxonomyRaw !== undefined) processed.GOOGLEPRODUCTTAXONOMY = String(googleProductTaxonomyRaw)
    
    const categoryTemplateRaw = pickFirst(item, ['CATEGORYTEMPLATE', 'categorytemplate'])
    if (categoryTemplateRaw !== undefined) processed.CATEGORYTEMPLATE = String(categoryTemplateRaw)
    
    const bestsellerBgRaw = pickFirst(item, ['BESTSELLERBG', 'bestsellerbg'])
    if (bestsellerBgRaw !== undefined) processed.BESTSELLERBG = String(bestsellerBgRaw)
    
    const newArrivalBgRaw = pickFirst(item, ['NEWARRIVALBG', 'newarrivalbg'])
    if (newArrivalBgRaw !== undefined) processed.NEWARRIVALBG = String(newArrivalBgRaw)
    
    const pageBgColorRaw = pickFirst(item, ['PAGEBGCOLOR', 'pagebgcolor'])
    if (pageBgColorRaw !== undefined) processed.PAGEBGCOLOR = String(pageBgColorRaw)
    
    // Ensure required fields have defaults
    if (!processed.DEPT) processed.DEPT = 'DEFAULT'
    if (!processed.TYP) processed.TYP = 'EMPTY'
    if (!processed.SUBTYP_1) processed.SUBTYP_1 = 'EMPTY'
    if (!processed.SUBTYP_2) processed.SUBTYP_2 = 'EMPTY'
    if (!processed.SUBTYP_3) processed.SUBTYP_3 = 'EMPTY'
    if (!processed.WEB_URL) processed.WEB_URL = '/'
    if (!processed.ACTIVE) processed.ACTIVE = 1
    if (!processed.SITE) processed.SITE = 1
    
    // Remove undefined fields to prevent database errors
    Object.keys(processed).forEach(key => {
      if (processed[key] === undefined) {
        delete processed[key]
      }
    })
    
    return processed
  },

  attributes: (item: any) => {
    const processed: any = {}
    
    // Respect provided id when valid UUID; otherwise let DB generate
    const idRaw = pickFirst(item, ['id', 'ID'])
    const fixedId = validateAndFixUUID(idRaw, 'attributes.id')
    if (fixedId) processed.id = fixedId
    
    // Handle name (required text field)
    const nameRaw = pickFirst(item, ['name', 'NAME', 'Name'])
    if (nameRaw !== undefined) {
      processed.name = String(nameRaw)
    } else {
      // Skip records without name as it's required
      console.warn('Skipping attributes record without name:', item)
      return null
    }
    
    // Handle display (required text field)
    const displayRaw = pickFirst(item, ['display', 'DISPLAY', 'Display'])
    if (displayRaw !== undefined) {
      processed.display = String(displayRaw)
    } else {
      // Use name as fallback for display
      processed.display = processed.name
    }
    
    // Handle status (required text field with default 'draft')
    const statusRaw = pickFirst(item, ['status', 'STATUS', 'Status'])
    if (statusRaw !== undefined) {
      processed.status = String(statusRaw)
    } else {
      processed.status = 'draft'
    }
    
    // Handle showOnCategory (boolean field with default true)
    const showOnCategoryRaw = pickFirst(item, ['showOnCategory', 'show_on_category', 'showOnCategory'])
    const showOnCategory = toBool(showOnCategoryRaw)
    if (showOnCategory !== undefined) {
      processed.showOnCategory = showOnCategory
    } else {
      processed.showOnCategory = true
    }
    
    // Handle showOnProduct (boolean field with default true)
    const showOnProductRaw = pickFirst(item, ['showOnProduct', 'show_on_product', 'showOnProduct'])
    const showOnProduct = toBool(showOnProductRaw)
    if (showOnProduct !== undefined) {
      processed.showOnProduct = showOnProduct
    } else {
      processed.showOnProduct = true
    }
    
    // Handle timestamps
    const createdAtRaw = pickFirst(item, ['createdAt', 'created_at'])
    if (createdAtRaw && typeof createdAtRaw === 'string') {
      try {
        processed.createdAt = new Date(createdAtRaw)
      } catch (error) {
        processed.createdAt = new Date()
      }
    }
    
    const updatedAtRaw = pickFirst(item, ['updatedAt', 'updated_at'])
    if (updatedAtRaw && typeof updatedAtRaw === 'string') {
      try {
        processed.updatedAt = new Date(updatedAtRaw)
      } catch (error) {
        processed.updatedAt = new Date()
      }
    }
    
    // Ensure required fields have defaults
    if (!processed.name) {
      console.warn('Skipping attributes record without name:', item)
      return null
    }
    if (!processed.display) processed.display = processed.name
    if (!processed.status) processed.status = 'draft'
    if (!processed.showOnCategory) processed.showOnCategory = true
    if (!processed.showOnProduct) processed.showOnProduct = true
    
    // Remove undefined fields to prevent database errors
    Object.keys(processed).forEach(key => {
      if (processed[key] === undefined) {
        delete processed[key]
      }
    })
    
    return processed
  },

  attributeValues: (item: any) => {
    const processed: any = {}
    
    // Accept provided id if valid UUID
    const idRaw = pickFirst(item, ['id', 'ID'])
    const fixedId = validateAndFixUUID(idRaw, 'attribute_values.id')
    if (fixedId) processed.id = fixedId
    
    // Handle attributeId (required foreign key to attributes.id)
    const attributeIdRaw = pickFirst(item, ['attributeId', 'attribute_id', 'attributeId'])
    const fixedAttrId = validateAndFixUUID(attributeIdRaw, 'attribute_values.attribute_id')
    if (fixedAttrId) {
      processed.attributeId = fixedAttrId
    } else {
      // Skip records without attributeId as it's required
      console.warn('Skipping attributeValues record without attributeId:', item)
      return null
    }
    
    // Handle value (required text field)
    const valueRaw = pickFirst(item, ['value', 'VALUE', 'Value'])
    if (valueRaw !== undefined) {
      processed.value = String(valueRaw)
    } else {
      // Skip records without value as it's required
      console.warn('Skipping attributeValues record without value:', item)
      return null
    }
    
    // Handle timestamps
    const createdAtRaw = pickFirst(item, ['createdAt', 'created_at'])
    if (createdAtRaw && typeof createdAtRaw === 'string') {
      try {
        processed.createdAt = new Date(createdAtRaw)
      } catch (error) {
        processed.createdAt = new Date()
      }
    }
    
    const updatedAtRaw = pickFirst(item, ['updatedAt', 'updated_at'])
    if (updatedAtRaw && typeof updatedAtRaw === 'string') {
      try {
        processed.updatedAt = new Date(updatedAtRaw)
      } catch (error) {
        processed.updatedAt = new Date()
      }
    }
    
    // Ensure required fields have defaults
    if (!processed.attributeId) {
      console.warn('Skipping attributeValues record without attributeId:', item)
      return null
    }
    if (!processed.value) {
      console.warn('Skipping attributeValues record without value:', item)
      return null
    }
    
    // Remove undefined fields to prevent database errors
    Object.keys(processed).forEach(key => {
      if (processed[key] === undefined) {
        delete processed[key]
      }
    })
    
    return processed
  },

  brands: (item: any) => {
    const processed: any = {}
    
    // Don't set id - it's auto-generated serial primary key
    // const idRaw = pickFirst(item, ['id', 'ID'])
    // const nId = toInt(idRaw)
    // if (nId !== undefined) processed.id = nId
    
    const showOnCategoryRaw = pickFirst(item, ['showOnCategory', 'show_on_category'])
    const showOnCategory = toBool(showOnCategoryRaw)
    if (showOnCategory !== undefined) processed.showOnCategory = showOnCategory
    
    const showOnProductRaw = pickFirst(item, ['showOnProduct', 'show_on_product'])
    const showOnProduct = toBool(showOnProductRaw)
    if (showOnProduct !== undefined) processed.showOnProduct = showOnProduct
    
    // Handle other fields
    const nameRaw = pickFirst(item, ['name', 'NAME'])
    if (nameRaw !== undefined) processed.name = String(nameRaw)
    
    const aliasRaw = pickFirst(item, ['alias', 'ALIAS'])
    if (aliasRaw !== undefined) processed.alias = String(aliasRaw)
    
    const descriptionRaw = pickFirst(item, ['description', 'DESCRIPTION'])
    if (descriptionRaw !== undefined) processed.description = String(descriptionRaw)
    
    const logoRaw = pickFirst(item, ['logo', 'LOGO'])
    if (logoRaw !== undefined) processed.logo = String(logoRaw)
    
    const statusRaw = pickFirst(item, ['status', 'STATUS'])
    if (statusRaw !== undefined) processed.status = String(statusRaw)
    
    // Generate urlHandle from name or alias
    const urlHandleRaw = pickFirst(item, ['urlHandle', 'url_handle', 'url'])
    if (urlHandleRaw !== undefined) {
      processed.urlHandle = String(urlHandleRaw)
    } else {
      // Generate from name or alias
      const base = processed.name || processed.alias || `brand-${Date.now()}`
      processed.urlHandle = String(base).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }
    
    // Handle timestamps
    const createdAtRaw = pickFirst(item, ['createdAt', 'created_at'])
    if (createdAtRaw && typeof createdAtRaw === 'string') {
      try {
        processed.createdAt = new Date(createdAtRaw)
      } catch (error) {
        processed.createdAt = new Date()
      }
    }
    
    const updatedAtRaw = pickFirst(item, ['updatedAt', 'updated_at'])
    if (updatedAtRaw && typeof updatedAtRaw === 'string') {
      try {
        processed.updatedAt = new Date(updatedAtRaw)
      } catch (error) {
        processed.updatedAt = new Date()
      }
    }
    
    // Ensure required fields have defaults
    if (!processed.name) processed.name = 'Unknown Brand'
    if (!processed.alias) processed.alias = processed.name
    if (!processed.urlHandle) {
      const base = processed.name || `brand-${Date.now()}`
      processed.urlHandle = String(base).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }
    if (!processed.status) processed.status = 'active'
    if (!processed.showOnCategory) processed.showOnCategory = false
    if (!processed.showOnProduct) processed.showOnProduct = false
    
    // Remove undefined fields to prevent database errors
    Object.keys(processed).forEach(key => {
      if (processed[key] === undefined) {
        delete processed[key]
      }
    })
    
    return processed
  },

  coupons: (item: any) => {
    const processed: any = {}
    
    // Handle timestamps
    const startDateRaw = pickFirst(item, ['startDate', 'start_date'])
    if (startDateRaw && typeof startDateRaw === 'string') {
      try {
        processed.startDate = new Date(startDateRaw)
      } catch (error) {
        processed.startDate = new Date()
      }
    }
    
    const endDateRaw = pickFirst(item, ['endDate', 'end_date'])
    if (endDateRaw && typeof endDateRaw === 'string') {
      try {
        processed.endDate = new Date(endDateRaw)
      } catch (error) {
        processed.endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    }
    
    // Copy all other fields
    Object.keys(item).forEach(key => {
      if (!['startDate', 'endDate'].includes(key) && item[key] !== undefined) {
        processed[key] = item[key]
      }
    })
    
    // Ensure required fields
    if (!processed.startDate) processed.startDate = new Date()
    if (!processed.endDate) processed.endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    
    return processed
  },

  orders: (item: any) => {
    const processed: any = {}
    
    const totalAmountRaw = pickFirst(item, ['totalAmount', 'total_amount'])
    const subtotalRaw = pickFirst(item, ['subtotal'])
    const taxRaw = pickFirst(item, ['tax'])
    const shippingFeeRaw = pickFirst(item, ['shippingFee', 'shipping_fee'])
    const discountRaw = pickFirst(item, ['discount'])
    
    processed.totalAmount = toDecimalString(totalAmountRaw, '0.00')
    processed.subtotal = toDecimalString(subtotalRaw, '0.00')
    processed.tax = toDecimalString(taxRaw, '0.00')
    processed.shippingFee = toDecimalString(shippingFeeRaw, '0.00')
    processed.discount = toDecimalString(discountRaw, '0.00')
    
    // Copy all other fields
    Object.keys(item).forEach(key => {
      if (!['totalAmount', 'subtotal', 'tax', 'shippingFee', 'discount'].includes(key) && item[key] !== undefined) {
        processed[key] = item[key]
      }
    })
    
    return processed
  },

  orderItems: (item: any) => {
    const processed: any = {}
    
    const orderIdRaw = pickFirst(item, ['orderId', 'order_id'])
    const orderId = validateAndFixUUID(orderIdRaw, 'order_items.orderId')
    if (orderId) {
      processed.orderId = orderId
    } else {
      console.warn('Skipping orderItems record without valid orderId:', item)
      return null
    }
    
    const productIdRaw = pickFirst(item, ['productId', 'product_id'])
    const productId = validateAndFixUUID(productIdRaw, 'order_items.productId')
    if (productId) {
      processed.productId = productId
    } else {
      console.warn('Skipping orderItems record without valid productId:', item)
      return null
    }
    
    const variationIdRaw = pickFirst(item, ['variationId', 'variation_id'])
    if (variationIdRaw) {
      const variationId = validateAndFixUUID(variationIdRaw, 'order_items.variationId')
      if (variationId) {
        processed.variationId = variationId
      }
    }
    
    const quantityRaw = pickFirst(item, ['quantity'])
    const quantity = toInt(quantityRaw)
    if (quantity !== undefined) processed.quantity = quantity
    
    const unitPriceRaw = pickFirst(item, ['unitPrice', 'unit_price'])
    processed.unitPrice = toDecimalString(unitPriceRaw, '0.00')
    
    const totalPriceRaw = pickFirst(item, ['totalPrice', 'total_price'])
    processed.totalPrice = toDecimalString(totalPriceRaw, '0.00')
    
    // Copy all other fields
    Object.keys(item).forEach(key => {
      if (!['orderId', 'productId', 'variationId', 'quantity', 'unitPrice', 'totalPrice'].includes(key) && item[key] !== undefined) {
        processed[key] = item[key]
      }
    })
    
    return processed
  },

  userProfiles: (item: any) => {
    const processed: any = {}
    
    // id must equal an existing users.id (no default). Prefer explicit id; fallback to userId if provided.
    const rawId = pickFirst(item, ['id', 'ID', 'userId', 'user_id'])
    const fixedId = validateAndFixUUID(rawId, 'user_profiles.id')
    if (!fixedId) {
      return null
    }
    processed.id = fixedId

    const isActiveRaw = pickFirst(item, ['isActive', 'is_active'])
    const isActive = toBool(isActiveRaw)
    if (isActive !== undefined) processed.isActive = isActive
    
    const newsletterOptinRaw = pickFirst(item, ['newsletterOptin', 'newsletter_optin'])
    const newsletterOptin = toBool(newsletterOptinRaw)
    if (newsletterOptin !== undefined) processed.newsletterOptin = newsletterOptin
    
    // Handle other fields
    const firstNameRaw = pickFirst(item, ['firstName', 'first_name'])
    if (firstNameRaw !== undefined) processed.firstName = String(firstNameRaw)
    
    const lastNameRaw = pickFirst(item, ['lastName', 'last_name'])
    if (lastNameRaw !== undefined) processed.lastName = String(lastNameRaw)
    
    const phoneRaw = pickFirst(item, ['phone', 'PHONE'])
    if (phoneRaw !== undefined) processed.phone = String(phoneRaw)
    
    const avatarUrlRaw = pickFirst(item, ['avatarUrl', 'avatar_url'])
    if (avatarUrlRaw !== undefined) processed.avatarUrl = String(avatarUrlRaw)
    
    // Copy all other fields
    Object.keys(item).forEach(key => {
      if (!['isActive', 'newsletterOptin', 'firstName', 'lastName', 'phone', 'avatarUrl'].includes(key) && item[key] !== undefined) {
        processed[key] = item[key]
      }
    })
    
    return processed
  },

  productVariations: (item: any) => {
    const processed: any = {}
    
    // Process ID field - this is critical for foreign key relationships
    const rawId = pickFirst(item, ['id', 'ID'])
    const fixedId = validateAndFixUUID(rawId, 'product_variations.id')
    if (!fixedId) {
      return null // Skip records without valid ID
    }
    processed.id = fixedId
    
    const productIdRaw = pickFirst(item, ['productId', 'product_id'])
    const productId = toInt(productIdRaw)
    if (productId !== undefined) processed.productId = productId
    
    const skuIdRaw = pickFirst(item, ['skuId', 'sku_id'])
    const skuId = toInt(skuIdRaw)
    if (skuId !== undefined) processed.skuId = skuId
    
    const quantityRaw = pickFirst(item, ['quantity'])
    const quantity = toInt(quantityRaw)
    if (quantity !== undefined) processed.quantity = quantity
    
    const priceRaw = pickFirst(item, ['price'])
    processed.price = toDecimalString(priceRaw, '0.00')
    
    const availableRaw = pickFirst(item, ['available'])
    const available = toBool(availableRaw)
    if (available !== undefined) processed.available = available
    
    // Copy all other fields
    Object.keys(item).forEach(key => {
      if (!['id', 'productId', 'skuId', 'quantity', 'price', 'available'].includes(key) && item[key] !== undefined) {
        processed[key] = item[key]
      }
    })
    
    return processed
  },

  productAlternateImages: (item: any) => {
    const processed: any = {}
    
    const productIdRaw = pickFirst(item, ['productId', 'product_id'])
    const productId = validateAndFixUUID(productIdRaw, 'product_alternate_images.productId')
    if (productId) {
      processed.productId = productId
    } else {
      console.warn('Skipping productAlternateImages record without valid productId:', item)
      return null
    }
    
    // Copy all other fields
    Object.keys(item).forEach(key => {
      if (!['productId'].includes(key) && item[key] !== undefined) {
        processed[key] = item[key]
      }
    })
    
    return processed
  },

  paymentGateways: (item: any) => {
    const processed: any = {}
    
    // Don't set id - it's auto-generated UUID primary key
    
    // Map snake_case JSON fields to camelCase schema fields
    const gatewayNameRaw = pickFirst(item, ['gateway_name', 'gatewayName', 'name', 'NAME'])
    if (gatewayNameRaw !== undefined) processed.gatewayName = String(gatewayNameRaw)
    
    const gatewayTypeRaw = pickFirst(item, ['gateway_type', 'gatewayType', 'type', 'TYPE'])
    if (gatewayTypeRaw !== undefined) processed.gatewayType = String(gatewayTypeRaw)
    
    const displayNameRaw = pickFirst(item, ['display_name', 'displayName', 'display'])
    if (displayNameRaw !== undefined) processed.displayName = String(displayNameRaw)
    
    const isActiveRaw = pickFirst(item, ['is_active', 'isActive', 'active'])
    const isActive = toBool(isActiveRaw)
    if (isActive !== undefined) processed.isActive = isActive
    
    const environmentRaw = pickFirst(item, ['environment', 'env'])
    if (environmentRaw !== undefined) processed.environment = String(environmentRaw)
    
    const supportsDigitalWalletsRaw = pickFirst(item, ['supports_digital_wallets', 'supportsDigitalWallets', 'digitalWallets'])
    const supportsDigitalWallets = toBool(supportsDigitalWalletsRaw)
    if (supportsDigitalWallets !== undefined) processed.supportsDigitalWallets = supportsDigitalWallets
    
    const connectionStatusRaw = pickFirst(item, ['connection_status', 'connectionStatus', 'status'])
    if (connectionStatusRaw !== undefined) processed.connectionStatus = String(connectionStatusRaw)
    
    const credentialsRaw = pickFirst(item, ['credentials', 'creds'])
    if (credentialsRaw !== undefined) {
      try {
        processed.credentials = typeof credentialsRaw === 'string' ? JSON.parse(credentialsRaw) : credentialsRaw
      } catch (error) {
        console.warn('Failed to parse credentials JSON:', error)
        processed.credentials = {}
      }
    }
    
    const lastTestedRaw = pickFirst(item, ['last_tested', 'lastTested'])
    if (lastTestedRaw !== undefined && lastTestedRaw !== null) {
      processed.lastTested = new Date(lastTestedRaw)
    }
    
    const testResultRaw = pickFirst(item, ['test_result', 'testResult'])
    if (testResultRaw !== undefined) {
      try {
        processed.testResult = typeof testResultRaw === 'string' ? JSON.parse(testResultRaw) : testResultRaw
      } catch (error) {
        console.warn('Failed to parse testResult JSON:', error)
        processed.testResult = null
      }
    }
    
    const sortOrderRaw = pickFirst(item, ['sort_order', 'sortOrder', 'order'])
    const sortOrder = toInt(sortOrderRaw)
    if (sortOrder !== undefined) processed.sortOrder = sortOrder
    
    const createdAtRaw = pickFirst(item, ['created_at', 'createdAt'])
    if (createdAtRaw !== undefined && createdAtRaw !== null) {
      processed.createdAt = new Date(createdAtRaw)
    }
    
    const updatedAtRaw = pickFirst(item, ['updated_at', 'updatedAt'])
    if (updatedAtRaw !== undefined && updatedAtRaw !== null) {
      processed.updatedAt = new Date(updatedAtRaw)
    }
    
    // Ensure required fields have defaults
    if (!processed.gatewayName) processed.gatewayName = 'Unknown Gateway'
    if (!processed.gatewayType) processed.gatewayType = 'card'
    if (!processed.displayName) processed.displayName = 'Unknown Gateway'
    if (!processed.isActive) processed.isActive = true
    if (!processed.environment) processed.environment = 'sandbox'
    if (!processed.supportsDigitalWallets) processed.supportsDigitalWallets = false
    if (!processed.connectionStatus) processed.connectionStatus = 'not_connected'
    if (!processed.credentials) processed.credentials = {}
    if (!processed.sortOrder) processed.sortOrder = 0
    
    // Remove undefined fields to prevent database errors
    Object.keys(processed).forEach(key => {
      if (processed[key] === undefined) {
        delete processed[key]
      }
    })
    
    return processed
  },

  cartAbandonmentToggle: (item: any) => {
    const processed: any = {}
    
    // Don't set id - it's auto-generated serial primary key
    
    const isEnabledRaw = pickFirst(item, ['isEnabled', 'is_enabled', 'enabled'])
    const isEnabled = toBool(isEnabledRaw)
    if (isEnabled !== undefined) processed.isEnabled = isEnabled
    
    const emailDelayHoursRaw = pickFirst(item, ['emailDelayHours', 'email_delay_hours'])
    const emailDelayHours = toInt(emailDelayHoursRaw)
    if (emailDelayHours !== undefined) processed.emailDelayHours = emailDelayHours
    
    const maxEmailsRaw = pickFirst(item, ['maxEmails', 'max_emails'])
    const maxEmails = toInt(maxEmailsRaw)
    if (maxEmails !== undefined) processed.maxEmails = maxEmails
    
    // Handle other fields
    const subjectRaw = pickFirst(item, ['subject', 'SUBJECT'])
    if (subjectRaw !== undefined) processed.subject = String(subjectRaw)
    
    const templateRaw = pickFirst(item, ['template', 'TEMPLATE'])
    if (templateRaw !== undefined) processed.template = String(templateRaw)
    
    // Ensure required fields have defaults
    if (!processed.isEnabled) processed.isEnabled = true
    if (!processed.emailDelayHours) processed.emailDelayHours = 24
    if (!processed.maxEmails) processed.maxEmails = 3
    if (!processed.subject) processed.subject = 'Complete Your Purchase'
    if (!processed.template) processed.template = 'default'
    
    // Remove undefined fields to prevent database errors
    Object.keys(processed).forEach(key => {
      if (processed[key] === undefined) {
        delete processed[key]
      }
    })
    
    return processed
  },

  accounts: (item: any) => {
    const processed: any = {}
    
    // Handle userId - this should reference an existing user
    const userIdRaw = pickFirst(item, ['userId', 'user_id', 'userId'])
    if (userIdRaw !== undefined) processed.userId = String(userIdRaw)
    
    // Handle required fields
    const typeRaw = pickFirst(item, ['type', 'TYPE'])
    if (typeRaw !== undefined) processed.type = String(typeRaw)
    
    const providerRaw = pickFirst(item, ['provider', 'PROVIDER'])
    if (providerRaw !== undefined) processed.provider = String(providerRaw)
    
    const providerAccountIdRaw = pickFirst(item, ['providerAccountId', 'provider_account_id'])
    if (providerAccountIdRaw !== undefined) processed.providerAccountId = String(providerAccountIdRaw)
    
    // Handle optional fields
    const refreshTokenRaw = pickFirst(item, ['refresh_token', 'refreshToken'])
    if (refreshTokenRaw !== undefined) processed.refresh_token = String(refreshTokenRaw)
    
    const accessTokenRaw = pickFirst(item, ['access_token', 'accessToken'])
    if (accessTokenRaw !== undefined) processed.access_token = String(accessTokenRaw)
    
    const expiresAtRaw = pickFirst(item, ['expiresAt', 'expires_at'])
    const expiresAt = toInt(expiresAtRaw)
    if (expiresAt !== undefined) processed.expires_at = expiresAt
    
    const tokenTypeRaw = pickFirst(item, ['token_type', 'tokenType'])
    if (tokenTypeRaw !== undefined) processed.token_type = String(tokenTypeRaw)
    
    const scopeRaw = pickFirst(item, ['scope', 'SCOPE'])
    if (scopeRaw !== undefined) processed.scope = String(scopeRaw)
    
    const idTokenRaw = pickFirst(item, ['id_token', 'idToken'])
    if (idTokenRaw !== undefined) processed.id_token = String(idTokenRaw)
    
    const sessionStateRaw = pickFirst(item, ['session_state', 'sessionState'])
    if (sessionStateRaw !== undefined) processed.session_state = String(sessionStateRaw)
    
    // Ensure required fields have defaults
    if (!processed.type) processed.type = 'oauth'
    if (!processed.provider) processed.provider = 'unknown'
    if (!processed.providerAccountId) processed.providerAccountId = `acc_${Date.now()}`
    
    // Remove undefined fields to prevent database errors
    Object.keys(processed).forEach(key => {
      if (processed[key] === undefined) {
        delete processed[key]
      }
    })
    
    return processed
  },

  customers: (item: any) => {
    const processed: any = {}
    
    // ID is UUID primary key, so don't set it from JSON data
    
    // Handle required fields
    const firstNameRaw = pickFirst(item, ['firstName', 'first_name', 'firstName'])
    if (firstNameRaw !== undefined) processed.firstName = String(firstNameRaw)
    
    const lastNameRaw = pickFirst(item, ['lastName', 'last_name', 'lastName'])
    if (lastNameRaw !== undefined) processed.lastName = String(lastNameRaw)
    
    const emailRaw = pickFirst(item, ['email', 'EMAIL'])
    if (emailRaw !== undefined) processed.email = String(emailRaw)
    
    const passwordHashRaw = pickFirst(item, ['passwordHash', 'password_hash', 'passwordHash'])
    if (passwordHashRaw !== undefined) processed.passwordHash = String(passwordHashRaw)
    
    const phoneRaw = pickFirst(item, ['phone', 'PHONE'])
    if (phoneRaw !== undefined) processed.phone = String(phoneRaw)
    
    // Handle JSON fields
    const billingAddressRaw = pickFirst(item, ['billingAddress', 'billing_address', 'billingAddress'])
    if (billingAddressRaw !== undefined) {
      try {
        processed.billingAddress = typeof billingAddressRaw === 'string' ? JSON.parse(billingAddressRaw) : billingAddressRaw
      } catch (error) {
        console.warn('Invalid billingAddress JSON for customers:', billingAddressRaw)
      }
    }
    
    const shippingAddressRaw = pickFirst(item, ['shippingAddress', 'shipping_address', 'shippingAddress'])
    if (shippingAddressRaw !== undefined) {
      try {
        processed.shippingAddress = typeof shippingAddressRaw === 'string' ? JSON.parse(shippingAddressRaw) : shippingAddressRaw
      } catch (error) {
        console.warn('Invalid shippingAddress JSON for customers:', shippingAddressRaw)
      }
    }
    
    // Handle boolean fields
    const isActiveRaw = pickFirst(item, ['isActive', 'is_active', 'isActive'])
    const isActive = toBool(isActiveRaw)
    if (isActive !== undefined) processed.isActive = isActive
    
    const newsletterOptinRaw = pickFirst(item, ['newsletterOptin', 'newsletter_optin', 'newsletterOptin'])
    const newsletterOptin = toBool(newsletterOptinRaw)
    if (newsletterOptin !== undefined) processed.newsletterOptin = newsletterOptin
    
    // Handle timestamps
    const createdAtRaw = pickFirst(item, ['createdAt', 'created_at'])
    if (createdAtRaw && typeof createdAtRaw === 'string') {
      try { processed.createdAt = new Date(createdAtRaw) } catch (error) { processed.createdAt = new Date() }
    }
    const updatedAtRaw = pickFirst(item, ['updatedAt', 'updated_at'])
    if (updatedAtRaw && typeof updatedAtRaw === 'string') {
      try { processed.updatedAt = new Date(updatedAtRaw) } catch (error) { processed.updatedAt = new Date() }
    }
    
    // Ensure required fields have defaults if missing
    if (!processed.firstName) processed.firstName = 'Unknown'
    if (!processed.lastName) processed.lastName = 'Customer'
    if (!processed.email) processed.email = `customer-${Date.now()}@example.com`
    if (!processed.passwordHash) processed.passwordHash = 'default-hash'
    if (!processed.isActive) processed.isActive = true
    if (!processed.newsletterOptin) processed.newsletterOptin = false
    
    // Remove undefined fields to prevent database errors
    Object.keys(processed).forEach(key => {
      if (processed[key] === undefined) {
        delete processed[key]
      }
    })
    
    return processed
  },

  verificationTokens: (item: any) => {
    const processed: any = {}
    
    // Handle required fields
    const identifierRaw = pickFirst(item, ['identifier', 'IDENTIFIER'])
    if (identifierRaw !== undefined) processed.identifier = String(identifierRaw)
    
    const tokenRaw = pickFirst(item, ['token', 'TOKEN'])
    if (tokenRaw !== undefined) processed.token = String(tokenRaw)
    
    const expiresRaw = pickFirst(item, ['expires', 'EXPIRES'])
    if (expiresRaw && typeof expiresRaw === 'string') {
      try { processed.expires = new Date(expiresRaw) } catch (error) { processed.expires = new Date() }
    }
    
    // Ensure required fields have defaults if missing
    if (!processed.identifier) processed.identifier = `identifier-${Date.now()}`
    if (!processed.token) processed.token = `token-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
    if (!processed.expires) processed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    
    // Remove undefined fields to prevent database errors
    Object.keys(processed).forEach(key => {
      if (processed[key] === undefined) {
        delete processed[key]
      }
    })
    
    return processed
  }
}

// Main processing function
function processDataForTable(tableName: string, data: any[]): any[] {
  const processor = tableProcessors[tableName as keyof typeof tableProcessors] || tableProcessors.default
  
  
  
  const processedData = data.map((item, idx) => {
    try {
      const processed = processor(item)
      
      // If processor returns null, skip this item
      if (processed === null) {
        return null
      }
      
      // Remove any undefined fields to prevent database errors
      Object.keys(processed).forEach(key => {
        if (processed[key] === undefined) {
          delete processed[key]
        }
      })
      
      // Debug logging for users table
      if (tableName === 'users' && idx < 3) {
        // Log removed for verbosity
      }
      
      // Debug logging for attributes table
      if (tableName === 'attributes' && idx < 3) {
        // Log removed for verbosity
      }
      
      return processed
    } catch (error) {
      console.error(`Error processing item ${idx} for table ${tableName}:`, error)
      console.error('Original item:', item)
      return null // Return null if processing fails
    }
  }).filter(item => item !== null) // Filter out null items
  
  
  
  return processedData
}

// Function to process a single file with timeout protection
async function processFile(fileName: string, filePath: string, tableName: string, table: any, currentFile: number, totalFiles: number): Promise<UpdateProgress> {
  try {
    // Read and parse file with timeout
    const fileContent = await Promise.race([
      readFile(filePath, 'utf-8'),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('File read timeout')), 30000)
      )
    ]) as string
    
    const data = JSON.parse(fileContent)

    if (!Array.isArray(data)) {
      return {
        file: fileName,
        status: 'error',
        message: `Invalid JSON format in ${fileName}. Expected array.`,
        currentFile,
        totalFiles
      }
    }
    
    // Get initial record count for debugging
    let initialRecordCount = 0
    try {
      const initialResult = await db.select().from(table)
      initialRecordCount = initialResult.length
    } catch (error) {
      console.error(`Error getting initial record count for ${tableName}:`, error)
    }
    
    // Process data in batches to prevent memory issues
    const batchSize = 1000
    const processedData = processDataForTable(tableName, data)
    

    
    // Clear existing records from the table with robust checking
    // For tables with foreign key dependencies, we need to handle deletion carefully
    let tableCleared = false
    let recordsAfterDelete = 0
    
    try {
      // First attempt to delete all records
      await db.delete(table)
      
      // Check if there are still records after deletion attempt
      try {
        const checkResult = await db.select().from(table)
        recordsAfterDelete = checkResult.length
        
        if (recordsAfterDelete === 0) {
          tableCleared = true
        } else {
          // For tables that can't be fully cleared due to foreign key constraints,
          // we'll proceed with insertion which will add new records to existing ones
          tableCleared = false
        }
      } catch (checkError) {
        // If we can't check, assume deletion was successful
        tableCleared = true
      }
      
    } catch (error) {
      // Check how many records remain
      try {
        const checkResult = await db.select().from(table)
        recordsAfterDelete = checkResult.length
      } catch (checkError) {
        recordsAfterDelete = 0
      }
      // Continue with insertion - this will add new records without clearing old ones
    }
    
    let recordsProcessed = 0
    
    // Insert records in batches
    for (let i = 0; i < processedData.length; i += batchSize) {
      const batch = processedData.slice(i, i + batchSize)
      
      // EXPERT-LEVEL FIX: For users table, check for existing emails to prevent duplicates
      let finalBatch = batch
      if (tableName === 'users' && !tableCleared) {
        try {
          // Get existing emails from database
          const existingUsers = await db.select({ email: users.email }).from(users)
          const existingEmails = new Set(existingUsers.map(u => u.email))
          
          // Filter out users with existing emails
          const uniqueBatch = batch.filter(user => !existingEmails.has(user.email))
          
          finalBatch = uniqueBatch
        } catch (error) {
          // Continue with original batch if error
        }
      }
      
      if (finalBatch.length > 0) {
        try {
          await db.insert(table).values(finalBatch)
          recordsProcessed += finalBatch.length
        } catch (insertError) {
          // Handle insertion errors silently for now
          // The retry mechanism will handle failed files
        }
      }
    }
    
    // Get final record count from database
    const actualRecordCount = await db.select().from(table).then(result => result.length)
    
    return {
      file: fileName,
      status: 'completed',
      message: `Successfully processed ${recordsProcessed} records for ${fileName}, actual DB count: ${actualRecordCount}`,
      recordsProcessed: actualRecordCount
    }
    
  } catch (error) {
    console.error(`Error processing ${fileName}:`, error)
    return {
      file: fileName,
      status: 'error',
      message: `Error processing ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      currentFile,
      totalFiles
    }
  }
}

// Function to sort files based on table insertion order
function sortFilesByDependency(jsonFiles: string[]): string[] {
  const sortedFiles: string[] = []
  const processedTables = new Set<string>()
  
  // Process files in the defined order
  for (const tableName of insertionOrder) {
    const matchingFiles = jsonFiles.filter(file => {
      const fileTableName = mapFilenameToTableName(file)
      return fileTableName === tableName
    })
    
    for (const file of matchingFiles) {
      sortedFiles.push(file)
      processedTables.add(mapFilenameToTableName(file))
    }
  }
  
  // Add any remaining files that weren't in the insertion order
  for (const file of jsonFiles) {
    const fileTableName = mapFilenameToTableName(file)
    if (!processedTables.has(fileTableName)) {
      sortedFiles.push(file)
    }
  }
  
  return sortedFiles
}

// Global deletion function - deletes all records from tables in reverse dependency order
async function globalDeleteAllTables(): Promise<{ success: boolean; message: string; deletedTables: string[]; failedTables: string[] }> {
  const deletedTables: string[] = []
  const failedTables: string[] = []
  
  for (const tableName of deletionOrder) {
    try {
      const table = tableMap[tableName as keyof typeof tableMap]
      if (!table) {
        continue
      }
      
      // Get initial count
      const initialCount = await db.select().from(table)
      
      // Attempt to delete all records
      await db.delete(table)
      
      // Verify deletion
      const remainingCount = await db.select().from(table)
      
      if (remainingCount.length === 0) {
        deletedTables.push(tableName)
      } else {
        failedTables.push(tableName)
      }
      
    } catch (error) {
      failedTables.push(tableName)
    }
  }
  
  const message = `Global record deletion completed. Cleared: ${deletedTables.length}, Failed: ${failedTables.length}`
  
  return {
    success: deletedTables.length > 0,
    message,
    deletedTables,
    failedTables
  }
}

// Global insertion function - inserts all records into tables in dependency order
async function globalInsertAllTables(jsonFiles: string[]): Promise<{ success: boolean; message: string; processedFiles: string[]; failedFiles: string[]; results: Array<{ table: string; file: string; status: 'success' | 'failed' | 'skipped'; recordsInserted?: number; message?: string }> }> {
  const processedFiles: string[] = []
  const failedFiles: string[] = []
  const skippedTables: string[] = []
  const results: Array<{ table: string; file: string; status: 'success' | 'failed' | 'skipped'; recordsInserted?: number; message?: string }> = []
  
  for (const tableName of insertionOrder) {
    try {
      const table = tableMap[tableName as keyof typeof tableMap]
      if (!table) {
        skippedTables.push(tableName)
        continue
      }
      
      // Find corresponding JSON file
      const jsonFile = jsonFiles.find(file => {
        const mappedTableName = mapFilenameToTableName(file)
        return mappedTableName === tableName
      })
      
      if (!jsonFile) {
        skippedTables.push(tableName)
        results.push({ table: tableName, file: `${tableName}.json`, status: 'skipped', message: 'No JSON file found' })
        continue
      }
      
      // Process the file using simplified function
      const filePath = join(process.cwd(), 'data-db', jsonFile)
      const result = await processFileForGlobal(jsonFile, filePath, tableName, table)
      
      if (result.success) {
        processedFiles.push(jsonFile)
        results.push({ table: tableName, file: jsonFile, status: 'success', recordsInserted: result.recordsProcessed })
      } else {
        failedFiles.push(jsonFile)
        results.push({ table: tableName, file: jsonFile, status: 'failed', message: result.message })
        console.error(`[Import][${tableName}] ${result.message}`)
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      failedFiles.push(tableName)
      results.push({ table: tableName, file: `${tableName}.json`, status: 'failed', message: errorMessage })
      console.error(`[Import][${tableName}] Unexpected error during insert: ${errorMessage}`)
    }
  }
  
  const message = `Global insertion completed. Processed: ${processedFiles.length}, Failed: ${failedFiles.length}, Skipped: ${skippedTables.length}`
  if (failedFiles.length > 0) {
    console.error(`[Import] Failed tables/files: ${failedFiles.join(', ')}`)
  }
  
  return {
    success: processedFiles.length > 0,
    message,
    processedFiles,
    failedFiles,
    results
  }
}

// Simplified processFile function for global strategy
async function processFileForGlobal(fileName: string, filePath: string, tableName: string, table: any): Promise<{ success: boolean; message: string; recordsProcessed?: number }> {
  try {
    // Read and parse file with timeout
    const fileContent = await Promise.race([
      readFile(filePath, 'utf-8'),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('File read timeout')), 30000)
      )
    ]) as string
    
    const data = JSON.parse(fileContent)

    if (!Array.isArray(data)) {
      return {
        success: false,
        message: `Invalid JSON format in ${fileName}. Expected array.`
      }
    }

    // Validate and resolve foreign keys
    const validation = await validateAndResolveForeignKeys(data, tableName, tableMap)
    
    if (validation.validData.length === 0) {
      return {
        success: true,
        message: `No valid records to insert for ${tableName} (${validation.invalidRecords} invalid records filtered)`,
        recordsProcessed: 0
      }
    }
    
    // Process data for the specific table
    const processedData = processDataForTable(tableName, validation.validData)
    
    if (processedData.length === 0) {
      return {
        success: true,
        message: `No valid records to insert for ${tableName}`,
        recordsProcessed: 0
      }
    }
    
    // Insert processed data
    let recordsProcessed = 0
    try {
      const result = await db.insert(table).values(processedData)
      recordsProcessed = processedData.length
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`[Import][${tableName}] Insert failed: ${errorMessage}`)
      return {
        success: false,
        message: `Database error inserting into ${tableName}: ${errorMessage}`
      }
    }
    
    // Get final record count
    let finalRecordCount = 0
    try {
      const finalResult = await db.select().from(table)
      finalRecordCount = finalResult.length
    } catch (error) {
      // Silent error for record count
    }
    
    const message = `Successfully inserted ${recordsProcessed} records into ${tableName} (${finalRecordCount} total records)`
    
    return {
      success: true,
      message,
      recordsProcessed
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`[Import][${tableName}] Processing failed: ${errorMessage}`)
    return {
      success: false,
      message: `Error processing ${fileName}: ${errorMessage}`
    }
  }
}

// Expert-level foreign key constraint handling and intelligent retry logic
async function retryFailedFilesWithDependencies(failedFiles: string[], jsonFiles: string[], tableMap: any): Promise<{ success: boolean; message: string; retriedFiles: string[]; stillFailed: string[] }> {
  const retriedFiles: string[] = []
  const stillFailed: string[] = []
  
  // Group failed files by dependency type
  const userDependentFiles = failedFiles.filter(file => {
    const tableName = mapFilenameToTableName(file)
    return ['accounts', 'userProfiles', 'addresses', 'reviews', 'cartSessions'].includes(tableName)
  })
  
  const productDependentFiles = failedFiles.filter(file => {
    const tableName = mapFilenameToTableName(file)
    return ['productVariations', 'productAlternateImages', 'productAttributes', 'orderItems'].includes(tableName)
  })
  
  const attributeDependentFiles = failedFiles.filter(file => {
    const tableName = mapFilenameToTableName(file)
    return ['attributeValues'].includes(tableName)
  })
  
  const variantDependentFiles = failedFiles.filter(file => {
    const tableName = mapFilenameToTableName(file)
    return ['variantAttributes'].includes(tableName)
  })
  
  // Retry user-dependent files (users table should now exist)
  for (const file of userDependentFiles) {
    try {
      const tableName = mapFilenameToTableName(file)
      const table = tableMap[tableName]
      if (!table) {
        stillFailed.push(file)
        continue
      }
      const result = await processFileForGlobal(file, `data-db/${file}`, tableName, table)
      if (result.success) {
        retriedFiles.push(file)
      } else {
        stillFailed.push(file)
      }
    } catch (error) {
      stillFailed.push(file)
    }
  }
  
  // Retry product-dependent files (products table should now exist)
  for (const file of productDependentFiles) {
    try {
      const tableName = mapFilenameToTableName(file)
      const table = tableMap[tableName]
      if (!table) {
        stillFailed.push(file)
        continue
      }
      const result = await processFileForGlobal(file, `data-db/${file}`, tableName, table)
      if (result.success) {
        retriedFiles.push(file)
      } else {
        stillFailed.push(file)
      }
    } catch (error) {
      stillFailed.push(file)
    }
  }
  
  // Retry attribute-dependent files (attributes table should now exist)
  for (const file of attributeDependentFiles) {
    try {
      const tableName = mapFilenameToTableName(file)
      const table = tableMap[tableName]
      if (!table) {
        stillFailed.push(file)
        continue
      }
      const result = await processFileForGlobal(file, `data-db/${file}`, tableName, table)
      if (result.success) {
        retriedFiles.push(file)
      } else {
        stillFailed.push(file)
      }
    } catch (error) {
      stillFailed.push(file)
    }
  }
  
  // Retry variant-dependent files (product_variations table should now exist)
  for (const file of variantDependentFiles) {
    try {
      const tableName = mapFilenameToTableName(file)
      const table = tableMap[tableName]
      if (!table) {
        stillFailed.push(file)
        continue
      }
      const result = await processFileForGlobal(file, `data-db/${file}`, tableName, table)
      if (result.success) {
        retriedFiles.push(file)
      } else {
        stillFailed.push(file)
      }
    } catch (error) {
      stillFailed.push(file)
    }
  }
  
  return {
    success: retriedFiles.length > 0,
    message: `Expert-level retry completed. Retried: ${retriedFiles.length}, Still failed: ${stillFailed.length}`,
    retriedFiles,
    stillFailed
  }
}

// Enhanced UUID validation function
function validateAndFixUUID(value: any, fieldName: string): string | null {
  if (!value || value === 'null' || value === 'undefined') {
    return null
  }
  
  const uuidString = String(value).trim()
  
  // Basic UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(uuidString)) {
    return null
  }
  
  return uuidString
}

// Enhanced data validation and foreign key resolution
async function validateAndResolveForeignKeys(
  data: any[],
  tableName: string,
  tableMap: any
): Promise<{ validData: any[]; invalidRecords: number; resolvedForeignKeys: number }> {
  const validData: any[] = []
  let invalidRecords = 0
  let resolvedForeignKeys = 0

  let usersIdSet: Set<string> | null = null
  let productsIdSet: Set<number> | null = null
  let productsStyleToId: Map<number, number> | null = null
  let cartSessionIdSet: Set<string> | null = null

  const needsUsers = ['accounts', 'addresses', 'reviews', 'userProfiles', 'cartSessions'].includes(tableName)
  const needsProducts = ['productVariations', 'productAlternateImages', 'productAttributes', 'orderItems'].includes(tableName)
  const needsCartSessions = ['cartsRecovered'].includes(tableName)
  const needsAttributes = ['attributeValues', 'productAttributes', 'variantAttributes'].includes(tableName)

  if (needsUsers) {
    try {
      const rows = await db.select({ id: users.id }).from(users)
      usersIdSet = new Set(rows.map(r => r.id))
    } catch {}
  }
  if (needsProducts) {
    try {
      const rows = await db.select({ id: products.id, styleId: products.styleId }).from(products)
      productsIdSet = new Set(rows.map(r => r.id))
      productsStyleToId = new Map(rows.map(r => [Number(r.styleId), r.id]))
    } catch {}
  }
  let attributesIdSet: Set<string> | null = null
  let attributesNameToId: Map<string, string> | null = null
  if (needsAttributes) {
    try {
      const rows = await db.select({ id: attributes.id, name: attributes.name }).from(attributes)
      attributesIdSet = new Set(rows.map(r => r.id))
      attributesNameToId = new Map(rows.map(r => [String(r.name || '').toLowerCase(), r.id]))
    } catch {}
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  // Auto-create attribute by id when safe
  const ensureAttributeExists = async (attrId: string, hintValue?: string): Promise<boolean> => {
    if (!attrId || !uuidRegex.test(attrId)) return false
    if (attributesIdSet?.has(attrId)) return true
    try {
      const found = await db.select({ id: attributes.id }).from(attributes).where(eq(attributes.id, attrId))
      if (found.length > 0) {
        attributesIdSet?.add(attrId)
        return true
      }
      // Derive a best-effort name from value, otherwise Generic
      const v = String(hintValue || '').toLowerCase().trim()
      let name = 'Generic'
      if (v) {
        const sizeValues = new Set(['xs','s','small','m','medium','l','large','xl','xxl','xxxl'])
        const colorValues = new Set(['black','brown','orange','navy','gray','grey','green','blue','red','khaki','white','yellow','purple','pink'])
        const materialValues = new Set(['leather','cotton','polyester','wool','silk','linen'])
        if (sizeValues.has(v)) name = 'Size'
        else if (colorValues.has(v)) name = 'Color'
        else if (materialValues.has(v)) name = 'Material'
      }
      await db.insert(attributes).values({
        id: attrId,
        name,
        display: name,
        status: 'draft',
        showOnCategory: true,
        showOnProduct: true,
      })
      attributesIdSet?.add(attrId)
      if (attributesNameToId && !attributesNameToId.has(name.toLowerCase())) {
        attributesNameToId.set(name.toLowerCase(), attrId)
      }
      resolvedForeignKeys++
      return true
    } catch {
      return false
    }
  }
  if (needsCartSessions) {
    try {
      const rows = await db.select({ id: cartSessions.id }).from(cartSessions)
      cartSessionIdSet = new Set(rows.map(r => r.id))
    } catch {}
  }

  // Helpers to auto-create missing parents when safe
  const ensureUserExists = async (uid: string): Promise<boolean> => {
    if (!uid) return false
    if (usersIdSet?.has(uid)) return true
    try {
      const found = await db.select({ id: users.id }).from(users).where(eq(users.id, uid))
      if (found.length > 0) {
        usersIdSet?.add(uid)
        return true
      }
      const email = `import+${uid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}@example.com`
      await db.insert(users).values({ id: uid, email, name: 'Imported User' })
      usersIdSet?.add(uid)
      resolvedForeignKeys++
      return true
    } catch {
      return false
    }
  }

  const ensureCartSessionExists = async (cid: string): Promise<boolean> => {
    if (!cid) return false
    if (cartSessionIdSet?.has(cid)) return true
    try {
      const found = await db.select({ id: cartSessions.id }).from(cartSessions).where(eq(cartSessions.id, cid))
      if (found.length > 0) {
        cartSessionIdSet?.add(cid)
        return true
      }
      const short = cid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)
      await db.insert(cartSessions).values({
        id: cid,
        sessionId: `import-${short}`,
        cartHash: `import-${short}`,
        status: 'active',
      })
      cartSessionIdSet?.add(cid)
      resolvedForeignKeys++
      return true
    } catch {
      return false
    }
  }

  for (const record of data) {
    let isValid = true
    const processedRecord: any = { ...record }

    switch (tableName) {
      case 'accounts': {
        const uid = String(processedRecord.userId || '').trim()
        if (!uid || uid === 'null') { isValid = false; invalidRecords++; continue }
        if (!usersIdSet?.has(uid)) {
          const ok = await ensureUserExists(uid)
          if (!ok) { isValid = false; invalidRecords++; continue }
        }
        break
      }
      case 'userProfiles': {
        const uid = String(processedRecord.id || '').trim()
        if (!uid || uid === 'null') { isValid = false; invalidRecords++; continue }
        if (!usersIdSet?.has(uid)) {
          const ok = await ensureUserExists(uid)
          if (!ok) { isValid = false; invalidRecords++; continue }
        }
        break
      }
      case 'addresses':
      case 'reviews': {
        const uid = String(processedRecord.userId || '').trim()
        if (!uid || uid === 'null') { isValid = false; invalidRecords++; continue }
        if (!usersIdSet?.has(uid)) {
          const ok = await ensureUserExists(uid)
          if (!ok) { isValid = false; invalidRecords++; continue }
        }
        break
      }
      case 'cartSessions': {
        const uid = processedRecord.userId ? String(processedRecord.userId).trim() : ''
        if (uid && usersIdSet && !usersIdSet.has(uid)) {
          processedRecord.userId = null
          resolvedForeignKeys++
        }
        break
      }
      case 'productVariations':
      case 'productAlternateImages':
      case 'productAttributes':
      case 'orderItems': {
        const rawProductId = processedRecord.productId
        const pid = typeof rawProductId === 'string' ? parseInt(rawProductId, 10) : rawProductId
        if (pid != null && productsIdSet?.has(pid)) {
          // ok
        } else if (pid != null && productsStyleToId?.has(Number(pid))) {
          processedRecord.productId = productsStyleToId.get(Number(pid))!
          resolvedForeignKeys++
        } else {
          isValid = false
          invalidRecords++
          continue
        }
        break
      }
      case 'attributeValues': {
        const aid = String(processedRecord.attributeId || '').trim()
        if (!aid || aid === 'null' || !attributesIdSet?.has(aid)) {
          // First, try auto-create attribute with given id (preferred, preserves source IDs)
          const okById = await ensureAttributeExists(aid, processedRecord.value)
          if (!okById) {
            // Fallback: map by inferred attribute name if available
            const valueStr = String(processedRecord.value || '').toLowerCase().trim()
            let targetAttrName: string | null = null
            if (valueStr) {
              const sizeValues = new Set(['xs','s','small','m','medium','l','large','xl','xxl','xxxl'])
              const colorValues = new Set(['black','brown','orange','navy','gray','grey','green','blue','red','khaki','white','yellow','purple','pink'])
              const materialValues = new Set(['leather','cotton','polyester','wool','silk','linen'])
              if (sizeValues.has(valueStr)) targetAttrName = 'size'
              else if (colorValues.has(valueStr)) targetAttrName = 'color'
              else if (materialValues.has(valueStr)) targetAttrName = 'material'
            }
            if (targetAttrName && attributesNameToId?.has(targetAttrName)) {
              processedRecord.attributeId = attributesNameToId.get(targetAttrName)!
              resolvedForeignKeys++
            } else {
              isValid = false
              invalidRecords++
              continue
            }
          }
        }
        break
      }
      case 'cartsRecovered': {
        const cid = String(processedRecord.abandonedCartId || '').trim()
        if (!cid || cid === 'null') { isValid = false; invalidRecords++; continue }
        if (!cartSessionIdSet?.has(cid)) {
          const ok = await ensureCartSessionExists(cid)
          if (!ok) { isValid = false; invalidRecords++; continue }
        }
        break
      }
    }

    if (isValid) {
      validData.push(processedRecord)
    }
  }

  return { validData, invalidRecords, resolvedForeignKeys }
}

export async function POST(request: NextRequest) {
  try {
    const dataDbPath = join(process.cwd(), 'data-db')
    
    // Check if directory exists
    try {
      await stat(dataDbPath)
    } catch (error) {
      return NextResponse.json(
        { error: 'No data-db folder found. Please upload files first.' },
        { status: 404 }
      )
    }

    const files = await readdir(dataDbPath)
    const jsonFiles = files.filter(file => file.endsWith('.json'))
    
    if (jsonFiles.length === 0) {
      return NextResponse.json(
        { error: 'No JSON files found in data-db folder. Please upload files first.' },
        { status: 404 }
      )
    }

    // Start the expert-level global update process in the background
    const updateProcess = async () => {
      // Update status to indicate process has started
      await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/api/data-manager/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progress: [{
            file: 'Global Update',
            status: 'processing',
            message: 'Starting expert-level global delete-then-insert process...',
            currentFile: 1,
            totalFiles: 3
          }],
          summary: null,
          isUpdating: true
        })
      })

      try {
        // PHASE 1: GLOBAL DELETE ALL TABLES
        // Update progress for delete phase
        await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/api/data-manager/update-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            progress: [{
              file: 'Global Delete Phase',
              status: 'processing',
              message: 'Deleting all records from tables in reverse dependency order...',
              currentFile: 1,
              totalFiles: 3
            }],
            summary: null,
            isUpdating: true
          })
        })

        const deleteResult = await globalDeleteAllTables()
        
        // PHASE 2: GLOBAL INSERT ALL TABLES
        // Update progress for insert phase
        await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/api/data-manager/update-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            progress: [{
              file: 'Global Insert Phase',
              status: 'processing',
              message: 'Inserting all records into tables in dependency order...',
              currentFile: 2,
              totalFiles: 3
            }],
            summary: null,
            isUpdating: true
          })
        })

        const insertResult = await globalInsertAllTables(jsonFiles)
        
        // PHASE 3: EXPERT-LEVEL RETRY FAILED FILES WITH DEPENDENCIES
        let retryResult = null
        if (insertResult.failedFiles.length > 0) {
          // Update progress for retry phase
          await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/api/data-manager/update-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              progress: [{
                file: 'Expert Retry Phase',
                status: 'processing',
                message: `Retrying ${insertResult.failedFiles.length} failed files with dependency resolution...`,
                currentFile: 3,
                totalFiles: 3
              }],
              summary: null,
              isUpdating: true
            })
          })
          
          retryResult = await retryFailedFilesWithDependencies(insertResult.failedFiles, jsonFiles, tableMap)
        }
        
        // FINAL SUMMARY
        // Build detailed per-table result list for UI
        const perTableResults: Array<{ table: string; file?: string; status: 'success'|'failed'|'skipped'; recordsInserted?: number; message?: string }> = []
        for (const r of insertResult.results || []) {
          perTableResults.push(r)
        }
        const finalSummary = {
          deletePhase: deleteResult,
          insertPhase: insertResult,
          retryPhase: retryResult,
          totalFiles: jsonFiles.length,
          successfulFiles: insertResult.processedFiles.length + (retryResult?.retriedFiles.length || 0),
          errorFiles: retryResult?.stillFailed.length || insertResult.failedFiles.length,
          retriedFiles: retryResult?.retriedFiles.length || 0,
          deletedTables: deleteResult.deletedTables.length,
          failedDeletions: deleteResult.failedTables.length,
          totalTablesInOrder: insertionOrder.length,
          totalTablesInDeletionOrder: deletionOrder.length,
          perTableResults
        }
        
        // Update final status
        const finalStatus = insertResult.success ? 'success' : 'error'
        const retryInfo = retryResult ? `, Retried: ${retryResult.retriedFiles.length}` : ''
        const finalMessage = insertResult.success 
          ? `Expert-level update completed. Deleted: ${deleteResult.deletedTables.length}, Inserted: ${insertResult.processedFiles.length} files${retryInfo} (${insertionOrder.length} tables in order, ${deletionOrder.length} tables in deletion order)`
          : 'Expert-level update failed - insertion phase had errors'

        await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/api/data-manager/update-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            progress: [{
              file: 'Global Update Complete',
              status: finalStatus === 'success' ? 'completed' : 'error',
              message: finalMessage,
              currentFile: 3,
              totalFiles: 3
            }],
            summary: finalSummary,
            isUpdating: false
          })
        })

        // Update the data_updater table with final status
        try {
          await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/api/data-manager/update-timestamps`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              updateType: 'manual',
              status: finalStatus,
              message: finalMessage
            })
          })
        } catch (timestampError) {
          // Silent error for timestamp update
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        
        // Update error status
        await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/api/data-manager/update-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            progress: [{
              file: 'Global Update Failed',
              status: 'error',
              message: `Critical error: ${errorMessage}`,
              currentFile: 3,
              totalFiles: 3
            }],
            summary: { error: errorMessage },
            isUpdating: false
          })
        })

        // Update timestamps with error
        try {
          await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/api/data-manager/update-timestamps`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              updateType: 'manual',
              status: 'error',
              message: `Critical error: ${errorMessage}`
            })
          })
        } catch (timestampError) {
          // Silent error for timestamp update
        }
      }
    }

    // Start the background process
    updateProcess().catch(console.error)

    // Return immediately with success response
    return NextResponse.json({
      success: true,
      message: 'Expert-level global update process started. Check progress in real-time.',
      jobId: Date.now().toString()
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to start expert-level global update process' },
      { status: 500 }
    )
  }
} 