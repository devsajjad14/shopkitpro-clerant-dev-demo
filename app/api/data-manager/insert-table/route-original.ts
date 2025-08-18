import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { db } from '@/lib/db'
import { eq, count } from 'drizzle-orm'
import {
  accounts, products, categories, orders, customers, taxonomy,
  attributes, attributeValues, brands, settings, reviews, addresses, users, sessions, userProfiles, verificationTokens, productVariations, productAlternateImages, productAttributes, variantAttributes, taxRates, orderItems, refunds, coupons, adminUsers, shippingMethods, apiIntegrations, discounts, paymentGateways, paymentSettings, paymentTransactionLogs, paymentGatewayHealthChecks, dataModeSettings, mainBanners, mini_banners, pages, pageRevisions, pageCategories, pageCategoryRelations, pageAnalytics, cartAbandonmentToggle, cartSessions, cartEvents, cartsRecovered, campaignEmails
} from '@/lib/db/schema'

// Table mapping for insertion
const tableMap: Record<string, any> = {
  users, categories, taxonomy, brands, settings, taxRates, shippingMethods, adminUsers, apiIntegrations, paymentGateways, paymentSettings, dataModeSettings, mainBanners, mini_banners, pages, pageCategories, cartAbandonmentToggle, customers, verificationTokens, accounts, sessions, userProfiles, addresses, coupons, discounts, attributes, attributeValues, products, orders, refunds, cartSessions, cartEvents, cartsRecovered, campaignEmails, paymentTransactionLogs, paymentGatewayHealthChecks, productVariations, productAlternateImages, productAttributes, variantAttributes, orderItems, reviews, pageRevisions, pageCategoryRelations, pageAnalytics
}

// Filename to table mapping
const filenameToTableMap: Record<string, string> = {
  'users.json': 'users',
  'categories.json': 'categories',
  'taxonomy.json': 'taxonomy',
  'brands.json': 'brands',
  'settings.json': 'settings',
  'tax_rates.json': 'taxRates',
  'shipping_methods.json': 'shippingMethods',
  'admin_users.json': 'adminUsers',
  'api_integration.json': 'apiIntegrations',
  'payment_gateways.json': 'paymentGateways',
  'payment_settings.json': 'paymentSettings',
  'data_mode_settings.json': 'dataModeSettings',
  'main_banners.json': 'mainBanners',
  'mini_banners.json': 'mini_banners',
  'pages.json': 'pages',
  'page_categories.json': 'pageCategories',
  'cart_abandonment_toggle.json': 'cartAbandonmentToggle',
  'customers.json': 'customers',
  'verification_tokens.json': 'verificationTokens',
  'accounts.json': 'accounts',
  'sessions.json': 'sessions',
  'user_profiles.json': 'userProfiles',
  'addresses.json': 'addresses',
  'coupons.json': 'coupons',
  'discounts.json': 'discounts',
  'attributes.json': 'attributes',
  'attribute_values.json': 'attributeValues',
  'products.json': 'products',
  'orders.json': 'orders',
  'product_variations.json': 'productVariations',
  'product_alternate_images.json': 'productAlternateImages',
  'product_attributes.json': 'productAttributes',
  'variant_attributes.json': 'variantAttributes',
  'order_items.json': 'orderItems',
  'reviews.json': 'reviews',
  'refunds.json': 'refunds',
  'cart_sessions.json': 'cartSessions',
  'cart_events.json': 'cartEvents',
  'carts_recovered.json': 'cartsRecovered',
  'campaign_emails.json': 'campaignEmails',
  'payment_transaction_logs.json': 'paymentTransactionLogs',
  'gateway_monitoring_logs.json': 'paymentGatewayHealthChecks',
  'page_revisions.json': 'pageRevisions',
  'page_category_relations.json': 'pageCategoryRelations',
  'page_analytics.json': 'pageAnalytics'
}

// Helper function to convert snake_case to camelCase
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())
}

// Helper function to convert all keys from snake_case to camelCase
function convertKeysToCamelCase(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(convertKeysToCamelCase)
  if (typeof obj === 'object') {
    const newObj: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const camelKey = toCamelCase(key)
        newObj[camelKey] = convertKeysToCamelCase(obj[key])
      }
    }
    return newObj
  }
  return obj
}

// Helper function to validate and fix UUID fields
function validateAndFixUUID(value: any): string | null {
  if (!value || value === '') return null
  if (typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    return value
  }
  return null
}

// Helper function to validate and fix integer fields
function validateAndFixInteger(value: any): number | null {
  if (value === null || value === undefined || value === '') return null
  const num = parseInt(value)
  return isNaN(num) ? null : num
}

// Helper function to validate and fix date fields
function validateAndFixDate(value: any): Date | null {
  if (!value || value === '') return null
  if (value instanceof Date) return value
  
  if (typeof value === 'string') {
    // Handle common date formats including PostgreSQL timestamp format
    let date: Date
    
    // Try to parse as ISO string first
    date = new Date(value)
    if (!isNaN(date.getTime())) return date
    
    // Try to parse PostgreSQL timestamp format (YYYY-MM-DD HH:MM:SS.SSS)
    const pgTimestampMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/)
    if (pgTimestampMatch) {
      const [, year, month, day, hour, minute, second, millisecond] = pgTimestampMatch
      date = new Date(
        parseInt(year),
        parseInt(month) - 1, // Month is 0-indexed
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second),
        millisecond ? parseInt(millisecond) : 0
      )
      if (!isNaN(date.getTime())) return date
    }
    
    // Try to parse common date formats
    const timestamp = Date.parse(value)
    if (!isNaN(timestamp)) return new Date(timestamp)
    
    // If all else fails, return null
    return null
  }
  
  if (typeof value === 'number') {
    // Handle timestamp
    const date = new Date(value)
    return isNaN(date.getTime()) ? null : date
  }
  
  return null
}

// Helper function to safely get a date with fallback
function safeDate(value: any, fallback: Date = new Date()): Date {
  const date = validateAndFixDate(value)
  return date || fallback
}

// Data processors for each table
const tableProcessors: { [key: string]: (data: any[]) => any[] } = {
  users: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || undefined,
    email: item.email || '',
    name: item.name || '',
    emailVerified: safeDate(item.email_verified),
    image: item.image || null,
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  categories: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || '',
    name: item.name || '',
    description: item.description || null,
    parentId: item.parent_id || null,
    slug: item.slug || '',
    image: item.image || null,
    isActive: item.is_active !== undefined ? item.is_active : true,
    sortOrder: item.sort_order || 0,
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  taxonomy: (data) => data.map(item => ({
    WEB_TAXONOMY_ID: item.WEB_TAXONOMY_ID || undefined,
    DEPT: item.DEPT || '',
    TYP: item.TYP || 'EMPTY',
    SUBTYP_1: item.SUBTYP_1 || 'EMPTY',
    SUBTYP_2: item.SUBTYP_2 || 'EMPTY',
    SUBTYP_3: item.SUBTYP_3 || 'EMPTY',
    SORT_POSITION: item.SORT_POSITION || '',
    WEB_URL: item.WEB_URL || '',
    LONG_DESCRIPTION: item.LONG_DESCRIPTION || null,
    DLU: safeDate(item.DLU),
    CATEGORY_STYLE: item.CATEGORY_STYLE || null,
    SHORT_DESC: item.SHORT_DESC || null,
    LONG_DESCRIPTION_2: item.LONG_DESCRIPTION_2 || null,
    META_TAGS: item.META_TAGS || null,
    ACTIVE: item.ACTIVE !== undefined ? item.ACTIVE : 1,
    BACKGROUNDIMAGE: item.BACKGROUNDIMAGE || null,
    SHORT_DESC_ON_PAGE: item.SHORT_DESC_ON_PAGE || null,
    GOOGLEPRODUCTTAXONOMY: item.GOOGLEPRODUCTTAXONOMY || null,
    SITE: item.SITE !== undefined ? item.SITE : 1,
    CATEGORYTEMPLATE: item.CATEGORYTEMPLATE || null,
    BESTSELLERBG: item.BESTSELLERBG || null,
    NEWARRIVALBG: item.NEWARRIVALBG || null,
    PAGEBGCOLOR: item.PAGEBGCOLOR || null,
  })),

  brands: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || '',
    name: item.name || '',
    description: item.description || null,
    logo: item.logo || null,
    website: item.website || null,
    isActive: item.is_active !== undefined ? item.is_active : true,
    sortOrder: item.sort_order || 0,
    urlHandle: item.url_handle || item.name?.toLowerCase().replace(/\s+/g, '-') || '',
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  settings: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || '',
    key: item.key || '',
    value: item.value || '',
    description: item.description || null,
    category: item.category || 'general',
    isPublic: item.is_public !== undefined ? item.is_public : false,
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  taxRates: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || '',
    name: item.name || '',
    rate: item.rate || 0,
    country: item.country || null,
    state: item.state || null,
    city: item.city || null,
    postalCode: item.postal_code || null,
    isActive: item.is_active !== undefined ? item.is_active : true,
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  shippingMethods: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || '',
    name: item.name || '',
    description: item.description || null,
    basePrice: item.base_price || 0,
    estimatedDays: item.estimated_days || 3,
    isActive: item.is_active !== undefined ? item.is_active : true,
    sortOrder: item.sort_order || 0,
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  adminUsers: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || '',
    name: item.name || '',
    email: item.email || '',
    passwordHash: item.password_hash || 'default-hash',
    role: item.role || 'user',
    status: item.status || 'active',
    lastLoginAt: safeDate(item.last_login_at),
    profileImage: item.profile_image || null,
    phoneNumber: item.phone_number || null,
    address: item.address || null,
    emailVerified: item.email_verified !== undefined ? item.email_verified : false,
    verificationToken: item.verification_token || null,
    isDeleted: item.is_deleted !== undefined ? item.is_deleted : false,
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  apiIntegrations: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || '',
    name: item.name || '',
    apiKey: item.api_key || '',
    apiSecret: item.api_secret || '',
    endpoint: item.endpoint || '',
    isActive: item.is_active !== undefined ? item.is_active : true,
    customerName: item.customer_name || item.name || '',
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  paymentGateways: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || '',
    name: item.name || '',
    gatewayName: item.gateway_name || item.name || '',
    apiKey: item.api_key || '',
    apiSecret: item.api_secret || '',
    isActive: item.is_active !== undefined ? item.is_active : true,
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  paymentSettings: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || '',
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  dataModeSettings: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || '',
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  mainBanners: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || '',
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  mini_banners: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || '',
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  pages: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || '',
    title: item.title || '',
    content: item.content || '',
    slug: item.slug || '',
    status: item.status || 'draft',
    metaTitle: item.meta_title || null,
    metaDescription: item.meta_description || null,
    metaKeywords: item.meta_keywords || null,
    canonicalUrl: item.canonical_url || null,
    featuredImage: item.featured_image || null,
    isPublic: item.is_public !== undefined ? item.is_public : true,
    allowComments: item.allow_comments !== undefined ? item.allow_comments : false,
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at),
    deletedAt: safeDate(item.deleted_at),
    isDeleted: item.is_deleted !== undefined ? item.is_deleted : false
  })),

  pageCategories: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || '',
    name: item.name || '',
    description: item.description || null,
    slug: item.slug || '',
    isActive: item.is_active !== undefined ? item.is_active : true,
    sortOrder: item.sort_order || 0,
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  cartAbandonmentToggle: (data) => data.map(item => ({
    id: item.id || '',
    isEnabled: item.is_enabled !== undefined ? item.is_enabled : false,
    description: item.description || null,
    lastToggledBy: item.last_toggled_by || null,
    lastToggledAt: safeDate(item.last_toggled_at),
    recoveryDelayHours: item.recovery_delay_hours || 24,
    maxRecoveryEmails: item.max_recovery_emails || 3,
    emailTemplate: item.email_template || null,
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  customers: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || '',
    passwordHash: item.password_hash || 'default-hash',
    email: item.email || '',
    firstName: item.first_name || '',
    lastName: item.last_name || '',
    phone: item.phone || null,
    dateOfBirth: safeDate(item.date_of_birth),
    gender: item.gender || null,
    address: item.address || null,
    city: item.city || null,
    state: item.state || null,
    country: item.country || null,
    postalCode: item.postal_code || null,
    isActive: item.is_active !== undefined ? item.is_active : true,
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  verificationTokens: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    identifier: item.identifier || '',
    token: item.token || '',
    expires: safeDate(item.expires, new Date(Date.now() + 24 * 60 * 60 * 1000))
  })),

  sessions: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    sessionToken: item.session_token || '',
    userId: validateAndFixUUID(item.userId), // Use userId directly from JSON
    expires: safeDate(item.expires_at, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
  })),

  accounts: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    userId: validateAndFixUUID(item.userId) || '', // Use userId directly from JSON
    type: item.type || 'oauth',
    provider: item.provider || '',
    providerAccountId: item.providerAccountId || '',
    refresh_token: item.refresh_token || null,
    access_token: item.access_token || null,
    expires_at: item.expires_at || null,
    token_type: item.token_type || null,
    scope: item.scope || null,
    id_token: item.id_token || null,
    session_state: item.session_state || null
  })),

  userProfiles: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: validateAndFixUUID(item.id),
    userId: validateAndFixUUID(item.user_id),
    firstName: item.first_name || '',
    lastName: item.last_name || '',
    phone: item.phone || null,
    dateOfBirth: safeDate(item.date_of_birth),
    gender: item.gender || null,
    address: item.address || null,
    city: item.city || null,
    state: item.state || null,
    country: item.country || null,
    postalCode: item.postal_code || null,
    preferences: item.preferences || null,
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  addresses: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || '',
    userId: validateAndFixUUID(item.user_id),
    type: item.type || 'shipping',
    firstName: item.first_name || '',
    lastName: item.last_name || '',
    company: item.company || null,
    addressLine1: item.address_line1 || '',
    addressLine2: item.address_line2 || null,
    city: item.city || '',
    state: item.state || '',
    country: item.country || '',
    postalCode: item.postal_code || '',
    phone: item.phone || null,
    isDefault: item.is_default !== undefined ? item.is_default : false,
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  coupons: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || '',
    code: item.code || '',
    description: item.description || null,
    discountType: item.discount_type || 'percentage',
    discountValue: item.discount_value || 0,
    minimumOrderAmount: item.minimum_order_amount || 0,
    maximumDiscount: item.maximum_discount || null,
    usageLimit: item.usage_limit || null,
    usedCount: item.used_count || 0,
    startDate: safeDate(item.start_date),
    endDate: safeDate(item.end_date, new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
    isActive: item.is_active !== undefined ? item.is_active : true,
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  discounts: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || '',
    name: item.name || '',
    description: item.description || null,
    discountType: item.discount_type || 'percentage',
    discountValue: item.discount_value || 0,
    minimumOrderAmount: item.minimum_order_amount || 0,
    maximumDiscount: item.maximum_discount || null,
    isActive: item.is_active !== undefined ? item.is_active : true,
    startDate: safeDate(item.start_date),
    endDate: safeDate(item.end_date, new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  attributes: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: validateAndFixUUID(item.id),
    name: item.name || '',
    description: item.description || null,
    type: item.type || 'text',
    isRequired: item.is_required !== undefined ? item.is_required : false,
    isFilterable: item.is_filterable !== undefined ? item.is_filterable : false,
    sortOrder: item.sort_order || 0,
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  attributeValues: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: validateAndFixUUID(item.id),
    attributeId: validateAndFixUUID(item.attribute_id),
    value: item.value || '',
    sortOrder: item.sort_order || 0,
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  products: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || undefined,
    styleId: item.style_id || 0,
    name: item.name || '',
    style: item.style || '',
    quantityAvailable: item.quantity_available || 0,
    onSale: item.on_sale || 'N',
    isNew: item.is_new || 'N',
    smallPicture: item.small_picture || null,
    mediumPicture: item.medium_picture || null,
    largePicture: item.large_picture || null,
    department: item.dept || null,
    type: item.typ || null,
    subType: item.subtyp || null,
    brand: item.brand || null,
    sellingPrice: item.selling_price || 0,
    regularPrice: item.regular_price || 0,
    longDescription: item.long_description || null,
    of7: item.of7 || null,
    of12: item.of12 || null,
    of13: item.of13 || null,
    of15: item.of15 || null,
    forceBuyQtyLimit: item.force_buy_qty_limit || null,
    lastReceived: item.last_rcvd || null,
    tags: item.tags || null,
    urlHandle: item.url_handle || item.name?.toLowerCase().replace(/\s+/g, '-') || '',
    barcode: item.barcode || null,
    sku: item.sku || null,
    trackInventory: item.track_inventory !== undefined ? item.track_inventory : false,
    stockQuantity: item.stock_quantity || 0,
    continueSellingOutOfStock: item.continue_selling_out_of_stock !== undefined ? item.continue_selling_out_of_stock : false,
    lowStockThreshold: item.low_stock_threshold || null,
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  orders: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || '',
    userId: validateAndFixUUID(item.user_id),
    taxRateId: validateAndFixUUID(item.tax_rate_id),
    shippingAddressId: validateAndFixUUID(item.shipping_address_id),
    billingAddressId: validateAndFixUUID(item.billing_address_id),
    shippingMethodId: validateAndFixUUID(item.shipping_method_id),
    status: item.status || 'pending',
    paymentStatus: item.payment_status || 'pending',
    totalAmount: item.total_amount || '0',
    subtotal: item.subtotal || '0',
    tax: item.tax || '0',
    shippingFee: item.shipping_fee || '0',
    discount: item.discount || '0',
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  productVariations: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || undefined,
    productId: validateAndFixInteger(item.product_id), // Keep as integer, not UUID
    skuId: item.sku_id || 0,
    quantity: item.quantity || 0,
    colorImage: item.color_image || null,
    sku: item.sku || null,
    barcode: item.barcode || null,
    price: item.price || 0,
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at),
    available: item.available !== undefined ? item.available : false
  })),

  productAlternateImages: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || undefined,
    productId: validateAndFixInteger(item.product_id), // Keep as integer, not UUID
    AltImage: item.AltImage || null,
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  productAttributes: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || undefined,
    productId: validateAndFixInteger(item.product_id), // Keep as integer, not UUID
    attributeId: validateAndFixUUID(item.attribute_id),
    attributeValueId: validateAndFixUUID(item.attribute_value_id),
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

          variantAttributes: (data) => data.map(item => ({
          ...convertKeysToCamelCase(item),
          id: item.id || undefined,
          variationId: validateAndFixInteger(item.variation_id), // Keep as integer, not UUID
          attributeId: validateAndFixUUID(item.attribute_id),
          attributeValueId: validateAndFixUUID(item.attribute_value_id),
          createdAt: safeDate(item.created_at),
          updatedAt: safeDate(item.updated_at)
        })),

  orderItems: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || '',
    orderId: validateAndFixUUID(item.order_id),
    productId: validateAndFixInteger(item.product_id), // Keep as integer, not UUID
    productVariationId: validateAndFixUUID(item.product_variation_id),
    quantity: item.quantity || 1,
    unitPrice: item.unit_price || 0,
    totalPrice: item.total_price || 0,
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  reviews: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || '',
    productId: validateAndFixInteger(item.product_id), // Keep as integer, not UUID
    userId: validateAndFixUUID(item.user_id),
    rating: item.rating || 5,
    title: item.title || '',
    comment: item.comment || '',
    isApproved: item.is_approved !== undefined ? item.is_approved : false,
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  refunds: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || '',
    orderId: validateAndFixUUID(item.order_id),
    amount: item.amount || 0,
    reason: item.reason || '',
    status: item.status || 'pending',
    processedAt: validateAndFixDate(item.processed_at),
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  cartSessions: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: validateAndFixUUID(item.id),
    sessionId: item.session_id || '',
    cartHash: item.cart_hash || '',
    userId: validateAndFixUUID(item.user_id),
    customerEmail: item.customer_email || null,
    customerName: item.customer_name || null,
    status: item.status || 'active',
    totalAmount: item.total_amount || 0,
    itemCount: item.item_count || 0,
    sessionDuration: item.session_duration || 0,
    device: item.device || null,
    browser: item.browser || null,
    source: item.source || null,
    utmSource: item.utm_source || null,
    utmMedium: item.utm_medium || null,
    utmCampaign: item.utm_campaign || null,
    country: item.country || null,
    city: item.city || null,
    abandonedAt: validateAndFixDate(item.abandoned_at),
    completedAt: validateAndFixDate(item.completed_at),
    expiresAt: validateAndFixDate(item.expires_at),
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  cartEvents: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: validateAndFixUUID(item.id),
    sessionId: item.session_id || '',
    eventType: item.event_type || 'add_item',
    productId: validateAndFixInteger(item.product_id),
    productName: item.product_name || null,
    quantity: item.quantity || 1,
    price: item.price || null,
    totalValue: item.total_value || null,
    metadata: item.metadata || null,
    createdAt: safeDate(item.created_at)
  })),

  cartsRecovered: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: validateAndFixUUID(item.id),
    abandonedCartId: validateAndFixUUID(item.abandoned_cart_id),
    recoverySessionId: item.recovery_session_id || '',
    customerEmail: item.customer_email || '',
    customerName: item.customer_name || null,
    recoveryAmount: item.recovery_amount || 0,
    itemCount: item.item_count || 0,
    recoveredAt: validateAndFixDate(item.recovered_at),
    timeToRecoveryHours: item.time_to_recovery_hours || null,
    createdAt: safeDate(item.created_at)
  })),

  campaignEmails: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: validateAndFixUUID(item.id),
    sessionId: item.session_id || '',
    customerEmail: item.customer_email || '',
    customerName: item.customer_name || null,
    emailNumber: item.email_number || 1,
    status: item.status || 'sent',
    sentAt: safeDate(item.sent_at),
    openedAt: validateAndFixDate(item.opened_at),
    clickedAt: validateAndFixDate(item.clicked_at),
    recoveredAt: validateAndFixDate(item.recovered_at),
    recoveryAmount: item.recovery_amount || null,
    createdAt: safeDate(item.created_at)
  })),

  paymentTransactionLogs: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || '',
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  paymentGatewayHealthChecks: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || '',
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  pageRevisions: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || '',
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  pageCategoryRelations: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || '',
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  })),

  pageAnalytics: (data) => data.map(item => ({
    ...convertKeysToCamelCase(item),
    id: item.id || '',
    createdAt: safeDate(item.created_at),
    updatedAt: safeDate(item.updated_at)
  }))
}

export async function POST(request: NextRequest) {
  let tableName: string | undefined
  try {
    const body = await request.json()
    tableName = body.tableName
    const sourceFolder = body.sourceFolder || 'data-db' // Default to data-db, allow demo-data

    if (!tableName) {
      return NextResponse.json(
        { success: false, error: 'Table name is required' },
        { status: 400 }
      )
    }

    const table = tableMap[tableName]
    if (!table) {
      return NextResponse.json(
        { success: false, error: `Table '${tableName}' not found` },
        { status: 400 }
      )
    }

    // Find the corresponding JSON file
    const jsonFile = Object.entries(filenameToTableMap).find(([_, table]) => table === tableName)?.[0]
    if (!jsonFile) {
      return NextResponse.json(
        { success: false, error: `No JSON file found for table '${tableName}'` },
        { status: 400 }
      )
    }

    // Read and parse the JSON file from specified source folder
    const filePath = join(process.cwd(), sourceFolder, jsonFile)
    console.log(`📂 Reading data from: ${filePath}`)
    const fileContent = await readFile(filePath, 'utf-8')
    const data = JSON.parse(fileContent)

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON data format' },
        { status: 400 }
      )
    }

    // Process data using table processor if available
    const processedData = tableProcessors[tableName] ? tableProcessors[tableName](data) : data

          // Special handling for settings table - update existing records instead of inserting
      if (tableName === 'settings' && processedData.length > 0) {
        // For settings table, we update existing records with new data
        // This preserves configuration while updating values
        let updatedCount = 0
        for (const setting of processedData) {
          if (setting.key) {
            // Try to update existing setting with same key
            await db
              .update(table)
              .set({
                value: setting.value,
                description: setting.description,
                category: setting.category,
                isPublic: setting.isPublic,
                updatedAt: new Date()
              })
              .where(eq(table.key, setting.key))
            updatedCount++
          }
        }
        console.log(`Successfully updated ${updatedCount} settings records`)
        
        return NextResponse.json({
          success: true,
          message: `Successfully updated ${updatedCount} settings records`,
          tableName,
          recordsInserted: updatedCount,
          updated: true
        })
      } else if (processedData.length > 0) {
        // For other tables, insert new records
        await db.insert(table).values(processedData)
      }

    console.log(`Successfully inserted ${processedData.length} records into ${tableName}`)

    return NextResponse.json({
      success: true,
      message: `Successfully inserted ${processedData.length} records into ${tableName}`,
      tableName,
      recordsInserted: processedData.length
    })

  } catch (error: any) {
    console.error(`Error inserting into table ${tableName || 'unknown'}:`, error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to insert into table ${tableName || 'unknown'}`,
        details: error.message
      },
      { status: 500 }
    )
  }
}
