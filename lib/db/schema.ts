// lib/db/schema.ts

import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  primaryKey,
  boolean,
  serial,
  varchar,
  jsonb,
  decimal,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  email: text('email').unique().notNull(),
  password: text('password'),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
})

export const accounts = pgTable(
  'accounts',
  {
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

export const sessions = pgTable('sessions', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
)

// Add these tables to your existing schema
// lib/db/schema.ts
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  firstName: text('first_name'),
  lastName: text('last_name'),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
  isActive: boolean('is_active').default(true).notNull(),
  newsletterOptin: boolean('newsletter_optin').default(false).notNull(),
})
export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'billing' or 'shipping'
  isDefault: boolean('is_default').default(false),
  street: text('street').notNull(),
  street2: text('street_2'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  postalCode: text('postal_code').notNull(),
  country: text('country').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
})

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull(),
  rating: integer('rating').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  images: text('images').array(),
  verifiedPurchase: boolean('verified_purchase').default(false),
  helpfulVotes: integer('helpful_votes').default(0),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
})

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  styleId: integer('style_id').notNull().unique(),
  name: text('name').notNull(),
  style: text('style').notNull(),
  quantityAvailable: integer('quantity_available').notNull().default(0),
  onSale: text('on_sale').notNull().default('N'),
  isNew: text('is_new').notNull().default('N'),
  smallPicture: text('small_picture'),
  mediumPicture: text('medium_picture'),
  largePicture: text('large_picture'),
  department: text('dept'),
  type: text('typ'),
  subType: text('subtyp'),
  brand: text('brand'),
  sellingPrice: decimal('selling_price', { precision: 10, scale: 2 }).notNull(),
  regularPrice: decimal('regular_price', { precision: 10, scale: 2 }).notNull(),
  longDescription: text('long_description'),
  of7: text('of7'),
  of12: text('of12'),
  of13: text('of13'),
  of15: text('of15'),
  forceBuyQtyLimit: text('force_buy_qty_limit'),
  lastReceived: text('last_rcvd'),
  tags: text('tags'),
  urlHandle: text('url_handle'),
  barcode: text('barcode'),
  sku: text('sku'),
  trackInventory: boolean('track_inventory').notNull().default(false),
  stockQuantity: integer('stock_quantity').notNull().default(0),
  continueSellingOutOfStock: boolean('continue_selling_out_of_stock')
    .notNull()
    .default(false),
  lowStockThreshold: integer('low_stock_threshold'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const productVariations = pgTable('product_variations', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  skuId: integer('sku_id').notNull(),
  quantity: integer('quantity').notNull().default(0),
  colorImage: text('color_image'),
  sku: text('sku'),
  barcode: text('barcode'),
  price: decimal('price', { precision: 10, scale: 2 })
    .notNull()
    .default('0.00'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  available: boolean('available').notNull().default(false),
})
// Add relations
export const productAlternateImages = pgTable('product_alternate_images', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  AltImage: text('AltImage'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const productAttributes = pgTable('product_attributes', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  attributeId: uuid('attribute_id')
    .notNull()
    .references(() => attributes.id),
  attributeValueId: uuid('attribute_value_id')
    .notNull()
    .references(() => attributeValues.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const variantAttributes = pgTable('variant_attributes', {
  id: serial('id').primaryKey(),
  variationId: integer('variation_id')
    .notNull()
    .references(() => productVariations.id, { onDelete: 'cascade' }),
  attributeId: uuid('attribute_id')
    .notNull()
    .references(() => attributes.id),
  attributeValueId: uuid('attribute_value_id')
    .notNull()
    .references(() => attributeValues.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  parentId: text('parent_id'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
})

export const settings = pgTable('settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: text('value'),
  type: text('type').notNull(), // 'string', 'number', 'boolean', 'json', 'file'
  group: text('group').notNull(), // 'general', 'branding', 'colors', 'store'
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
})

export const attributes = pgTable('attributes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  display: text('display').notNull(),
  status: text('status').notNull().default('draft'),
  showOnCategory: boolean('show_on_category').notNull().default(true),
  showOnProduct: boolean('show_on_product').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const attributeValues = pgTable('attribute_values', {
  id: uuid('id').primaryKey().defaultRandom(),
  attributeId: uuid('attribute_id')
    .notNull()
    .references(() => attributes.id),
  value: text('value').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Add relations
export const attributesRelations = relations(attributes, ({ many }) => ({
  values: many(attributeValues),
}))

export const attributeValuesRelations = relations(
  attributeValues,
  ({ one }) => ({
    attribute: one(attributes, {
      fields: [attributeValues.attributeId],
      references: [attributes.id],
    }),
  })
)

export const productsRelations = relations(products, ({ many }) => ({
  variations: many(productVariations),
  alternateImages: many(productAlternateImages),
  attributes: many(productAttributes),
}))

export const productVariationsRelations = relations(
  productVariations,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariations.productId],
      references: [products.id],
    }),
    attributes: many(variantAttributes),
  })
)

export const productAlternateImagesRelations = relations(
  productAlternateImages,
  ({ one }) => ({
    product: one(products, {
      fields: [productAlternateImages.productId],
      references: [products.id],
    }),
  })
)

export const productAttributesRelations = relations(
  productAttributes,
  ({ one }) => ({
    product: one(products, {
      fields: [productAttributes.productId],
      references: [products.id],
    }),
    attribute: one(attributes, {
      fields: [productAttributes.attributeId],
      references: [attributes.id],
    }),
    attributeValue: one(attributeValues, {
      fields: [productAttributes.attributeValueId],
      references: [attributeValues.id],
    }),
  })
)

export const variantAttributesRelations = relations(
  variantAttributes,
  ({ one }) => ({
    variation: one(productVariations, {
      fields: [variantAttributes.variationId],
      references: [productVariations.id],
    }),
    attribute: one(attributes, {
      fields: [variantAttributes.attributeId],
      references: [attributes.id],
    }),
    attributeValue: one(attributeValues, {
      fields: [variantAttributes.attributeValueId],
      references: [attributeValues.id],
    }),
  })
)

export const taxonomy = pgTable('taxonomy', {
  WEB_TAXONOMY_ID: serial('WEB_TAXONOMY_ID').primaryKey(),
  DEPT: text('DEPT').notNull(),
  TYP: text('TYP').notNull().default('EMPTY'),
  SUBTYP_1: text('SUBTYP_1').notNull().default('EMPTY'),
  SUBTYP_2: text('SUBTYP_2').notNull().default('EMPTY'),
  SUBTYP_3: text('SUBTYP_3').notNull().default('EMPTY'),
  SORT_POSITION: text('SORT_POSITION'),
  WEB_URL: text('WEB_URL').notNull(),
  LONG_DESCRIPTION: text('LONG_DESCRIPTION'),
  DLU: timestamp('DLU').default(sql`CURRENT_TIMESTAMP`),
  CATEGORY_STYLE: text('CATEGORY_STYLE'),
  SHORT_DESC: text('SHORT_DESC'),
  LONG_DESCRIPTION_2: text('LONG_DESCRIPTION_2'),
  META_TAGS: text('META_TAGS'),
  ACTIVE: integer('ACTIVE').notNull().default(1),
  BACKGROUNDIMAGE: text('BACKGROUNDIMAGE'),
  SHORT_DESC_ON_PAGE: text('SHORT_DESC_ON_PAGE'),
  GOOGLEPRODUCTTAXONOMY: text('GOOGLEPRODUCTTAXONOMY'),
  SITE: integer('SITE').notNull().default(1),
  CATEGORYTEMPLATE: text('CATEGORYTEMPLATE'),
  BESTSELLERBG: text('BESTSELLERBG'),
  NEWARRIVALBG: text('NEWARRIVALBG'),
  PAGEBGCOLOR: text('PAGEBGCOLOR'),
})

export const brands = pgTable('brands', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  alias: text('alias').notNull(),
  description: text('description'),
  urlHandle: text('url_handle').notNull(),
  logo: text('logo'),
  showOnCategory: boolean('show_on_category').notNull().default(false),
  showOnProduct: boolean('show_on_product').notNull().default(false),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  phone: varchar('phone', { length: 20 }),
  billingAddress: jsonb('billing_address').$type<{
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }>(),
  shippingAddress: jsonb('shipping_address').$type<{
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }>(),
  isActive: boolean('is_active').default(true).notNull(),
  newsletterOptin: boolean('newsletter_optin').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

// Add relations
export const customersRelations = relations(customers, ({ many }) => ({
  reviews: many(reviews),
}))

export const reviewsRelations = relations(reviews, ({ one }) => ({
  customer: one(customers, {
    fields: [reviews.userId],
    references: [customers.id],
  }),
}))

export const taxRates = pgTable('tax_rates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  rate: decimal('rate', { precision: 5, scale: 2 }).notNull(), // Store as percentage (e.g., 8.5 for 8.5%)
  country: text('country').notNull(),
  state: text('state'),
  zipCode: text('zip_code'),
  isActive: boolean('is_active').default(true),
  priority: integer('priority').default(0), // Higher priority rates are applied first
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
})

// Add relations for tax rates
export const taxRatesRelations = relations(taxRates, ({ many }) => ({
  orders: many(orders),
}))

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  guestEmail: text('guest_email'),
  status: text('status').notNull().default('pending'),
  paymentStatus: text('payment_status').notNull().default('pending'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 })
    .notNull()
    .default('0'),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 })
    .notNull()
    .default('0'),
  tax: decimal('tax', { precision: 10, scale: 2 }).notNull().default('0'),
  taxRateId: uuid('tax_rate_id').references(() => taxRates.id),
  shippingFee: decimal('shipping_fee', { precision: 10, scale: 2 })
    .notNull()
    .default('0'),
  discount: decimal('discount', { precision: 10, scale: 2 })
    .notNull()
    .default('0'),
  paymentMethod: text('payment_method'),
  shippingAddressId: uuid('shipping_address_id').references(() => addresses.id),
  billingAddressId: uuid('billing_address_id').references(() => addresses.id),
  shippingMethodId: uuid('shipping_method_id').references(
    () => shippingMethods.id
  ),
  note: text('note'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
})

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id),
  variationId: integer('variation_id').references(() => productVariations.id),
  name: text('name').notNull(),
  sku: text('sku'),
  color: text('color'),
  size: text('size'),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
})

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  shippingAddress: one(addresses, {
    fields: [orders.shippingAddressId],
    references: [addresses.id],
  }),
  billingAddress: one(addresses, {
    fields: [orders.billingAddressId],
    references: [addresses.id],
  }),
  items: many(orderItems),
  shippingMethod: one(shippingMethods, {
    fields: [orders.shippingMethodId],
    references: [shippingMethods.id],
  }),
  taxRate: one(taxRates, {
    fields: [orders.taxRateId],
    references: [taxRates.id],
  }),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variation: one(productVariations, {
    fields: [orderItems.variationId],
    references: [productVariations.id],
  }),
}))

export const refunds = pgTable('refunds', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  reason: text('reason').notNull(),
  payment_status: text('payment_status', {
    enum: ['pending', 'approved', 'rejected', 'completed'],
  })
    .notNull()
    .default('pending'),
  refundMethod: text('refund_method', {
    enum: ['original_payment', 'store_credit', 'bank_transfer'],
  }).notNull(),
  refundedBy: uuid('refunded_by').references(() => users.id),
  notes: text('notes'),
  attachments: text('attachments').array(), // URLs to attached files
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  refundTransactionId: text('refund_transaction_id'), // For payment gateway reference
  customerEmail: text('customer_email'),
  customerName: text('customer_name'),
  refundItems: jsonb('refund_items').$type<
    {
      productId: number
      quantity: number
      amount: number
      reason: string
    }[]
  >(),
  adminNotes: text('admin_notes'),
  refundPolicy: text('refund_policy').notNull().default('standard'),
  refundType: text('refund_type', { enum: ['full', 'partial'] }).notNull(),
  refundFee: integer('refund_fee').default(0), // in cents
  refundCurrency: text('refund_currency').notNull().default('USD'),
  refundStatusHistory: jsonb('refund_status_history').$type<
    {
      status: string
      timestamp: string
      note: string
      updatedBy: string
    }[]
  >(),
  refundDocuments: jsonb('refund_documents').$type<
    {
      type: string
      url: string
      name: string
      uploadedAt: string
    }[]
  >(),
  refundCommunication: jsonb('refund_communication').$type<
    {
      type: string
      content: string
      timestamp: string
      sender: string
    }[]
  >(),
  refundAnalytics: jsonb('refund_analytics').$type<{
    processingTime: number
    customerSatisfaction: number
    refundReasonCategory: string
    refundPattern: string
  }>(),
})

// Add relations
export const refundsRelations = relations(refunds, ({ one }) => ({
  order: one(orders, {
    fields: [refunds.orderId],
    references: [orders.id],
  }),
  refundedByUser: one(users, {
    fields: [refunds.refundedBy],
    references: [users.id],
  }),
}))

export const coupons = pgTable('coupons', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  description: text('description'),
  type: text('type', { enum: ['percentage', 'fixed'] }).notNull(),
  value: integer('value').notNull(), // For percentage: 0-100, For fixed: amount in cents
  minPurchaseAmount: integer('min_purchase_amount'), // Minimum order amount in cents
  maxDiscountAmount: integer('max_discount_amount'), // Maximum discount amount in cents
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  usageLimit: integer('usage_limit'), // Total number of times coupon can be used
  usageCount: integer('usage_count').default(0), // Number of times coupon has been used
  perCustomerLimit: integer('per_customer_limit'), // Number of times a single customer can use
  isActive: boolean('is_active').default(true),
  isFirstTimeOnly: boolean('is_first_time_only').default(false),
  isNewCustomerOnly: boolean('is_new_customer_only').default(false),
  excludedProducts: jsonb('excluded_products').$type<string[]>(), // Product IDs that can't use this coupon
  excludedCategories: jsonb('excluded_categories').$type<string[]>(), // Category IDs that can't use this coupon
  includedProducts: jsonb('included_products').$type<string[]>(), // Only these products can use this coupon
  includedCategories: jsonb('included_categories').$type<string[]>(), // Only these categories can use this coupon
  customerGroups: jsonb('customer_groups').$type<string[]>(), // Customer groups that can use this coupon
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  analytics: jsonb('analytics').$type<{
    totalDiscountsGiven: number
    totalRevenueImpact: number
    averageOrderValue: number
    redemptionRate: number
    lastUsedAt: string | null
  }>(),
})

export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('user'),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
  profileImage: varchar('profile_image', { length: 255 }),
  phoneNumber: varchar('phone_number', { length: 20 }),
  address: text('address'),
  emailVerified: boolean('email_verified').default(false).notNull(),
  verificationToken: varchar('verification_token', { length: 255 }),
  isDeleted: boolean('is_deleted').default(false).notNull(),
})

export const shippingMethods = pgTable('shipping_methods', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  estimatedDays: integer('estimated_days').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
})

// Add relations for shipping methods
export const shippingMethodsRelations = relations(
  shippingMethods,
  ({ many }) => ({
    orders: many(orders),
  })
)

export const apiIntegrations = pgTable('api_integration', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  customerName: text('customer_name').notNull(),
  customerPassword: text('customer_password').notNull(),
  apiKey: text('api_key').notNull(),
  apiSecret: text('api_secret').notNull(),
  token: text('token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  additionalFields: jsonb('additional_fields')
    .$type<{
      field1: string
      field2: string
      field3: string
      field4: string
      field5: string
    }>()
    .notNull()
    .default({
      field1: '',
      field2: '',
      field3: '',
      field4: '',
      field5: '',
    }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type ApiIntegration = typeof apiIntegrations.$inferSelect
export type NewApiIntegration = typeof apiIntegrations.$inferInsert

export const discounts = pgTable('discounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  description: text('description'),
  type: text('type').notNull(), // 'fixed' or 'percentage'
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  minPurchaseAmount: decimal('min_purchase_amount', {
    precision: 10,
    scale: 2,
  }),
  maxDiscountAmount: decimal('max_discount_amount', {
    precision: 10,
    scale: 2,
  }),
  startDate: timestamp('start_date', { mode: 'date' }).notNull(),
  endDate: timestamp('end_date', { mode: 'date' }).notNull(),
  usageLimit: integer('usage_limit'),
  usageCount: integer('usage_count').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
})

// Payment Gateways (Universal gateway configuration)
export const paymentGateways = pgTable('payment_gateways', {
  id: uuid('id').primaryKey().defaultRandom(),
  gatewayName: text('gateway_name').notNull(), // 'stripe', 'paypal', 'square', 'authorize'
  gatewayType: text('gateway_type').notNull(), // 'card', 'paypal', 'klarna', 'cod'
  displayName: text('display_name').notNull(), // 'Stripe', 'PayPal Commerce Platform', 'Square'
  isActive: boolean('is_active').notNull().default(false),
  environment: text('environment', { enum: ['sandbox', 'live'] })
    .notNull()
    .default('sandbox'),
  supportsDigitalWallets: boolean('supports_digital_wallets')
    .notNull()
    .default(false),
  connectionStatus: text('connection_status', {
    enum: ['not_connected', 'connected', 'error', 'testing'],
  })
    .notNull()
    .default('not_connected'),
  credentials: jsonb('credentials').notNull().default('{}'), // Flexible credential storage
  lastTested: timestamp('last_tested'),
  testResult: jsonb('test_result'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Payment Settings (Flexible - one record per payment gateway/method)
export const paymentSettings = pgTable('payment_settings', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Basic Info
  name: text('name').notNull(), // 'PayPal', 'Stripe', 'Klarna', 'COD', etc.
  isActive: boolean('is_active').notNull().default(true),
  environment: text('environment', { enum: ['sandbox', 'live'] })
    .notNull()
    .default('sandbox'),

  // Payment Method Type (for legacy compatibility)
  paymentMethod: text('payment_method'), // 'general', 'paypal', 'stripe', 'klarna', 'cod'

  // All possible API fields (most will be null for each record)
  clientId: text('client_id'),
  clientSecret: text('client_secret'),
  publishableKey: text('publishable_key'),
  secretKey: text('secret_key'),
  merchantId: text('merchant_id'),
  username: text('username'),
  password: text('password'),
  apiLoginId: text('api_login_id'),
  transactionKey: text('transaction_key'),
  serviceKey: text('service_key'),
  applicationId: text('application_id'),
  accessToken: text('access_token'),
  locationId: text('location_id'),

  // Legacy PayPal fields (for backward compatibility)
  paypalEnabled: boolean('paypal_enabled').default(false),
  paypalClientId: text('paypal_client_id'),
  paypalClientSecret: text('paypal_client_secret'),
  paypalMode: text('paypal_mode', { enum: ['sandbox', 'live'] }).default(
    'sandbox'
  ),
  paypalReuseCredentials: boolean('paypal_reuse_credentials').default(false),
  paypalConnectionStatus: text('paypal_connection_status').default(
    'not_connected'
  ),

  // Legacy Card fields (for backward compatibility)
  cardEnabled: boolean('card_enabled').default(false),
  cardGateway: text('card_gateway'), // 'stripe', 'square', 'authorize'
  cardEnvironment: text('card_environment', {
    enum: ['sandbox', 'live'],
  }).default('sandbox'),
  cardDigitalWalletsEnabled: boolean('card_digital_wallets_enabled').default(
    false
  ),
  cardConnectionStatus: text('card_connection_status').default('not_connected'),
  cardCredentials: jsonb('card_credentials'), // JSON object for gateway-specific credentials

  // Klarna fields
  klarnaEnabled: boolean('klarna_enabled').default(false),
  klarnaMerchantId: text('klarna_merchant_id'),
  klarnaUsername: text('klarna_username'),
  klarnaPassword: text('klarna_password'),
  klarnaConnectionStatus: text('klarna_connection_status').default(
    'not_connected'
  ),
  klarnaRegion: varchar('klarna_region', { length: 32 }),

  // COD fields
  codEnabled: boolean('cod_enabled').default(false),
  codInstructions: text('cod_instructions'),
  codRequirePhone: boolean('cod_require_phone').notNull().default(false),
  codMinOrderAmount: decimal('cod_min_order_amount', {
    precision: 10,
    scale: 2,
  }),
  codMaxOrderAmount: decimal('cod_max_order_amount', {
    precision: 10,
    scale: 2,
  }),

  // Connection Status
  connectionStatus: text('connection_status').default('not_connected'),
  lastTested: timestamp('last_tested'),
  testResult: jsonb('test_result'),

  // Additional Settings
  reuseCredentials: boolean('reuse_credentials').default(false),
  supportsDigitalWallets: boolean('supports_digital_wallets').default(false),

  // COD specific fields (duplicate for flexibility)
  instructions: text('instructions'),
  requirePhone: boolean('require_phone').default(false),
  minOrderAmount: decimal('min_order_amount', { precision: 10, scale: 2 }),
  maxOrderAmount: decimal('max_order_amount', { precision: 10, scale: 2 }),

  // Advanced Settings
  processingFees: jsonb('processing_fees').$type<{
    cardFee: number
    cardFeeFixed: number
    paypalFee: number
    paypalFeeFixed: number
    klarnaFee: number
    klarnaFeeFixed: number
  }>(),

  allowedCountries: text('allowed_countries').array(),
  restrictedCountries: text('restricted_countries').array(),

  // Security & Compliance
  pciCompliant: boolean('pci_compliant').notNull().default(false),
  encryptionLevel: text('encryption_level', {
    enum: ['basic', 'standard', 'premium'],
  })
    .notNull()
    .default('standard'),

  // Analytics & Monitoring
  totalTransactions: integer('total_transactions').notNull().default(0),
  totalRevenue: decimal('total_revenue', { precision: 15, scale: 2 })
    .notNull()
    .default('0'),
  averageTransactionValue: decimal('average_transaction_value', {
    precision: 10,
    scale: 2,
  }),
  successRate: decimal('success_rate', { precision: 5, scale: 2 }),

  // Audit Trail
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  // Metadata & Configuration
  metadata: jsonb('metadata').$type<{
    version: string
    lastBackup: string
    configurationHash: string
    customSettings?: Record<string, any>
  }>(),

  // Webhook & Integration Settings
  webhookUrl: text('webhook_url'),
  webhookSecret: text('webhook_secret'),
  webhookEnabled: boolean('webhook_enabled').notNull().default(false),
  webhookLastTriggered: timestamp('webhook_last_triggered'),

  // Error Logging
  lastError: jsonb('last_error').$type<{
    message: string
    code: string
    timestamp: string
    processor: string
    details?: any
  }>(),

  // Performance Metrics
  averageResponseTime: integer('average_response_time'),
  uptimePercentage: decimal('uptime_percentage', { precision: 5, scale: 2 }),
  lastDowntime: timestamp('last_downtime'),

  // Compliance & Legal
  termsAccepted: boolean('terms_accepted').notNull().default(false),
  termsAcceptedAt: timestamp('terms_accepted_at'),
  termsAcceptedBy: uuid('terms_accepted_by').references(() => users.id),

  // Backup & Recovery
  backupEnabled: boolean('backup_enabled').notNull().default(true),
  lastBackupAt: timestamp('last_backup_at'),
  backupFrequency: text('backup_frequency', {
    enum: ['daily', 'weekly', 'monthly'],
  })
    .notNull()
    .default('daily'),
})

// Payment Gateways Relations
export const paymentGatewaysRelations = relations(
  paymentGateways,
  ({ many }) => ({
    // Can add relations here if needed
  })
)

// Payment Settings Relations (simplified)
export const paymentSettingsRelations = relations(
  paymentSettings,
  ({ one }) => ({
    createdByUser: one(users, {
      fields: [paymentSettings.createdBy],
      references: [users.id],
    }),
    updatedByUser: one(users, {
      fields: [paymentSettings.updatedBy],
      references: [users.id],
    }),
    termsAcceptedByUser: one(users, {
      fields: [paymentSettings.termsAcceptedBy],
      references: [users.id],
    }),
  })
)

// Payment Transaction Logs (for audit trail)
export const paymentTransactionLogs = pgTable('payment_transaction_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  paymentSettingId: uuid('payment_setting_id').references(
    () => paymentSettings.id
  ),
  transactionId: text('transaction_id'),
  gateway: text('gateway').notNull(),
  method: text('method').notNull(), // 'card', 'paypal', 'klarna', 'cod'
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('USD'),
  status: text('status', {
    enum: ['pending', 'success', 'failed', 'cancelled', 'refunded'],
  }).notNull(),
  gatewayResponse: jsonb('gateway_response'),
  errorMessage: text('error_message'),
  processingTime: integer('processing_time'), // in milliseconds
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Payment Gateway Health Checks
export const paymentGatewayHealthChecks = pgTable('gateway_monitoring_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  paymentSettingId: uuid('payment_setting_id').references(
    () => paymentSettings.id
  ),
  gateway: text('gateway').notNull(),
  status: text('status', {
    enum: ['healthy', 'degraded', 'down', 'testing'],
  }).notNull(),
  responseTime: integer('response_time'), // in milliseconds
  errorCount: integer('error_count').notNull().default(0),
  lastCheckAt: timestamp('last_check_at').notNull(),
  nextCheckAt: timestamp('next_check_at'),
  details: jsonb('details').$type<{
    endpoint: string
    method: string
    statusCode?: number
    errorMessage?: string
    gatewayVersion?: string
  }>(),
})

// Export types
export type PaymentGateway = typeof paymentGateways.$inferSelect
export type NewPaymentGateway = typeof paymentGateways.$inferInsert
export type PaymentSettings = typeof paymentSettings.$inferSelect
export type NewPaymentSettings = typeof paymentSettings.$inferInsert
export type PaymentTransactionLog = typeof paymentTransactionLogs.$inferSelect
export type NewPaymentTransactionLog =
  typeof paymentTransactionLogs.$inferInsert
export type PaymentGatewayHealthCheck =
  typeof paymentGatewayHealthChecks.$inferSelect
export type NewPaymentGatewayHealthCheck =
  typeof paymentGatewayHealthChecks.$inferInsert

// Data Mode Settings (for API endpoints configuration)
export const dataModeSettings = pgTable('data_mode_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  mode: text('mode', { enum: ['local', 'remote'] })
    .notNull()
    .default('local'),
  endpoints: jsonb('endpoints').$type<{
    new?: string
    sale?: string
    product?: string
    category?: string
    featured?: string
    taxonomy?: string
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type DataModeSettings = typeof dataModeSettings.$inferSelect
export type NewDataModeSettings = typeof dataModeSettings.$inferInsert

// Default payment settings (will be created if none exist)
export const defaultPaymentSettings: NewPaymentSettings = {
  name: 'PayPal',
  isActive: true,
  environment: 'sandbox',
  paymentMethod: 'general',
  allowedCountries: null,
  restrictedCountries: null,
  pciCompliant: false,
  encryptionLevel: 'standard',
  totalTransactions: 0,
  totalRevenue: '0',
  averageTransactionValue: null,
  successRate: null,
  createdBy: null,
  updatedBy: null,
  metadata: null,
  webhookUrl: null,
  webhookSecret: null,
  webhookEnabled: false,
  webhookLastTriggered: null,
  lastError: null,
  averageResponseTime: null,
  uptimePercentage: null,
  lastDowntime: null,
  termsAccepted: false,
  termsAcceptedAt: null,
  termsAcceptedBy: null,
  backupEnabled: true,
  lastBackupAt: null,
  backupFrequency: 'daily',
  // Legacy fields
  paypalEnabled: true,
  cardEnabled: true,
  klarnaEnabled: false,
  codEnabled: false,
}

// Main Banners Table for CMS
export const mainBanners = pgTable('main_banners', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  content: text('content').notNull(), // HTML content
  imageUrl: text('image_url'), // Vercel Blob image URL
  status: text('status', {
    enum: ['draft', 'active', 'scheduled', 'inactive'],
  }).default('draft'),
  priority: integer('priority').default(1),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  // Toggle states
  showTitle: boolean('show_title').default(true),
  showSubtitle: boolean('show_subtitle').default(true),
  showButton: boolean('show_button').default(true),
  // Position data (JSON objects)
  titlePosition: jsonb('title_position').$type<{ x: number; y: number }>(),
  subtitlePosition: jsonb('subtitle_position').$type<{
    x: number
    y: number
  }>(),
  ctaPosition: jsonb('cta_position').$type<{ x: number; y: number }>(),
  // Custom font sizes
  titleCustomFontSize: integer('title_custom_font_size'),
  subtitleCustomFontSize: integer('subtitle_custom_font_size'),
  ctaCustomFontSize: integer('cta_custom_font_size'),
  // Margin and padding data
  titleMarginTop: integer('title_margin_top'),
  titleMarginRight: integer('title_margin_right'),
  titleMarginBottom: integer('title_margin_bottom'),
  titleMarginLeft: integer('title_margin_left'),
  titlePaddingTop: integer('title_padding_top'),
  titlePaddingRight: integer('title_padding_right'),
  titlePaddingBottom: integer('title_padding_bottom'),
  titlePaddingLeft: integer('title_padding_left'),
  subtitleMarginTop: integer('subtitle_margin_top'),
  subtitleMarginRight: integer('subtitle_margin_right'),
  subtitleMarginBottom: integer('subtitle_margin_bottom'),
  subtitleMarginLeft: integer('subtitle_margin_left'),
  subtitlePaddingTop: integer('subtitle_padding_top'),
  subtitlePaddingRight: integer('subtitle_padding_right'),
  subtitlePaddingBottom: integer('subtitle_padding_bottom'),
  subtitlePaddingLeft: integer('subtitle_padding_left'),
  buttonMarginTop: integer('button_margin_top'),
  buttonMarginRight: integer('button_margin_right'),
  buttonMarginBottom: integer('button_margin_bottom'),
  buttonMarginLeft: integer('button_margin_left'),
  buttonPaddingTop: integer('button_padding_top'),
  buttonPaddingRight: integer('button_padding_right'),
  buttonPaddingBottom: integer('button_padding_bottom'),
  buttonPaddingLeft: integer('button_padding_left'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export type MainBanner = typeof mainBanners.$inferSelect
export type NewMainBanner = typeof mainBanners.$inferInsert

// Mini Banners Table for CMS
export const mini_banners = pgTable('mini_banners', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  content: text('content').notNull(), // HTML content
  imageUrl: text('image_url'), // Vercel Blob image URL
  status: text('status', {
    enum: ['draft', 'active', 'scheduled', 'inactive'],
  }).default('draft'),
  priority: integer('priority').default(1),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  // Toggle states
  showTitle: boolean('show_title').default(true),
  showSubtitle: boolean('show_subtitle').default(true),
  showButton: boolean('show_button').default(true),
  // Position data (JSON objects)
  titlePosition: jsonb('title_position').$type<{ x: number; y: number }>(),
  subtitlePosition: jsonb('subtitle_position').$type<{
    x: number
    y: number
  }>(),
  ctaPosition: jsonb('cta_position').$type<{ x: number; y: number }>(),
  // Custom font sizes
  titleCustomFontSize: integer('title_custom_font_size'),
  subtitleCustomFontSize: integer('subtitle_custom_font_size'),
  ctaCustomFontSize: integer('cta_custom_font_size'),
  // Margin and padding data
  titleMarginTop: integer('title_margin_top'),
  titleMarginRight: integer('title_margin_right'),
  titleMarginBottom: integer('title_margin_bottom'),
  titleMarginLeft: integer('title_margin_left'),
  titlePaddingTop: integer('title_padding_top'),
  titlePaddingRight: integer('title_padding_right'),
  titlePaddingBottom: integer('title_padding_bottom'),
  titlePaddingLeft: integer('title_padding_left'),
  subtitleMarginTop: integer('subtitle_margin_top'),
  subtitleMarginRight: integer('subtitle_margin_right'),
  subtitleMarginBottom: integer('subtitle_margin_bottom'),
  subtitleMarginLeft: integer('subtitle_margin_left'),
  subtitlePaddingTop: integer('subtitle_padding_top'),
  subtitlePaddingRight: integer('subtitle_padding_right'),
  subtitlePaddingBottom: integer('subtitle_padding_bottom'),
  subtitlePaddingLeft: integer('subtitle_padding_left'),
  buttonMarginTop: integer('button_margin_top'),
  buttonMarginRight: integer('button_margin_right'),
  buttonMarginBottom: integer('button_margin_bottom'),
  buttonMarginLeft: integer('button_margin_left'),
  buttonPaddingTop: integer('button_padding_top'),
  buttonPaddingRight: integer('button_padding_right'),
  buttonPaddingBottom: integer('button_padding_bottom'),
  buttonPaddingLeft: integer('button_padding_left'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export type MiniBanner = typeof mini_banners.$inferSelect
export type NewMiniBanner = typeof mini_banners.$inferInsert

// TypeScript types for pages
export type Page = typeof pages.$inferSelect
export type NewPage = typeof pages.$inferInsert

export type PageRevision = typeof pageRevisions.$inferSelect
export type NewPageRevision = typeof pageRevisions.$inferInsert

export type PageCategory = typeof pageCategories.$inferSelect
export type NewPageCategory = typeof pageCategories.$inferInsert

export type PageCategoryRelation = typeof pageCategoryRelations.$inferSelect
export type NewPageCategoryRelation = typeof pageCategoryRelations.$inferInsert

export type PageAnalytics = typeof pageAnalytics.$inferSelect
export type NewPageAnalytics = typeof pageAnalytics.$inferInsert

// Pages table for CMS
export const pages = pgTable('pages', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(), // UI: Title
  slug: text('slug').notNull().unique(), // UI: Slug
  content: text('content'), // UI: Main page content (HTML/rich text)
  status: text('status', { enum: ['draft', 'published'] })
    .notNull()
    .default('draft'), // UI: 'draft', 'published' only

  // SEO Fields (UI)
  metaTitle: text('meta_title'), // UI: SEO meta title
  metaDescription: text('meta_description'), // UI: SEO meta description
  metaKeywords: text('meta_keywords'), // UI: SEO meta keywords
  canonicalUrl: text('canonical_url'), // UI: Canonical URL

  featuredImage: text('featured_image'), // UI: Featured image URL
  isPublic: boolean('is_public').default(true).notNull(), // UI: Visibility (public/private)
  allowComments: boolean('allow_comments').default(false).notNull(), // UI: Allow comments

  // --- Advanced fields below are not currently exposed in UI ---
  // excerpt: text('excerpt'), // Not in UI
  // template: text('template').default('default'), // Not in UI
  // pageType: text('page_type').default('page'), // Not in UI
  // parentId: integer('parent_id'), // For page hierarchy (not in UI, and avoid self-reference error)
  // menuOrder: integer('menu_order').default(0), // Navigation order (not in UI)
  // showInMenu: boolean('show_in_menu').default(true).notNull(), // Not in UI
  // showInSitemap: boolean('show_in_sitemap').default(true).notNull(), // Not in UI
  // publishedAt: timestamp('published_at', { mode: 'date' }), // Not in UI
  // scheduledAt: timestamp('scheduled_at', { mode: 'date' }), // Not in UI
  // authorId: uuid('author_id'), // Not in UI
  // lastEditedBy: uuid('last_edited_by'), // Not in UI
  // viewCount: integer('view_count').default(0).notNull(), // Not in UI
  // lastViewedAt: timestamp('last_viewed_at', { mode: 'date' }), // Not in UI
  // customFields: jsonb('custom_fields'), // Not in UI
  // pageSettings: jsonb('page_settings'), // Not in UI

  // Timestamps
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),

  // Soft Delete
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
  isDeleted: boolean('is_deleted').default(false).notNull(),
})

// Page revisions for version control
export const pageRevisions = pgTable('page_revisions', {
  id: serial('id').primaryKey(),
  pageId: integer('page_id')
    .notNull()
    .references(() => pages.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content'),
  excerpt: text('excerpt'),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  template: text('template'),
  authorId: uuid('author_id').references(() => users.id),
  revisionNumber: integer('revision_number').notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

// Page categories/tags for organization
export const pageCategories = pgTable('page_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  // parentId: integer('parent_id').references(() => pageCategories.id), // Not in UI, avoid self-reference error
  color: text('color'), // For UI display
  icon: text('icon'), // Icon class or URL
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
})

// Many-to-many relationship between pages and categories
export const pageCategoryRelations = pgTable(
  'page_category_relations',
  {
    pageId: integer('page_id').notNull(), // .references(() => pages.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id').notNull(), // .references(() => pageCategories.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    compoundKey: primaryKey({ columns: [table.pageId, table.categoryId] }),
  })
)

// Page analytics for tracking performance
export const pageAnalytics = pgTable('page_analytics', {
  id: serial('id').primaryKey(),
  pageId: integer('page_id')
    .notNull()
    .references(() => pages.id, { onDelete: 'cascade' }),
  date: timestamp('date', { mode: 'date' }).notNull(),
  views: integer('views').default(0).notNull(),
  uniqueViews: integer('unique_views').default(0).notNull(),
  timeOnPage: integer('time_on_page').default(0).notNull(), // Average time in seconds
  bounceRate: decimal('bounce_rate', { precision: 5, scale: 2 }).default('0'), // Percentage
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

// Cart Abandonment Toggle Table
export const cartAbandonmentToggle = pgTable('cart_abandonment_toggle', {
  id: serial('id').primaryKey(),
  isEnabled: boolean('is_enabled').default(false).notNull(),
  description: text('description').default('Cart abandonment tracking and recovery feature'),
  lastToggledBy: uuid('last_toggled_by').references(() => users.id),
  lastToggledAt: timestamp('last_toggled_at', { mode: 'date' }).defaultNow(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
})

// Cart Sessions Table - Track individual cart sessions
export const cartSessions = pgTable('cart_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: text('session_id').unique().notNull(),
  cartHash: text('cart_hash').notNull(), // Hash of cart items to identify unique carts
  userId: uuid('user_id').references(() => users.id),
  customerEmail: text('customer_email'),
  customerName: text('customer_name'),
  status: text('status', { enum: ['active', 'abandoned', 'completed', 'expired'] }).default('active').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).default('0'),
  itemCount: integer('item_count').default(0),
  sessionDuration: integer('session_duration').default(0), // in seconds
  device: text('device'), // mobile, desktop, tablet
  browser: text('browser'),
  source: text('source'), // direct, organic, paid, social
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  country: text('country'),
  city: text('city'),
  abandonedAt: timestamp('abandoned_at', { mode: 'date' }),
  completedAt: timestamp('completed_at', { mode: 'date' }),
  expiresAt: timestamp('expires_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
})

// Cart Events Table - Track all cart activities
export const cartEvents = pgTable('cart_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: text('session_id').notNull(),
  eventType: text('event_type', { enum: ['add_item', 'remove_item', 'update_quantity', 'view_cart', 'start_checkout', 'complete_checkout', 'abandon_cart', 'recover_cart', 'recovery_completed'] }).notNull(),
  productId: integer('product_id').references(() => products.id),
  productName: text('product_name'),
  quantity: integer('quantity').default(1),
  price: decimal('price', { precision: 10, scale: 2 }),
  totalValue: decimal('total_value', { precision: 10, scale: 2 }),
  metadata: jsonb('metadata'), // Additional event data
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
})

// Carts Recovered Table - Track recovered abandoned carts
export const cartsRecovered = pgTable('carts_recovered', {
  id: uuid('id').primaryKey().defaultRandom(),
  abandonedCartId: uuid('abandoned_cart_id').notNull().references(() => cartSessions.id),
  recoverySessionId: text('recovery_session_id').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerName: text('customer_name'),
  recoveryAmount: decimal('recovery_amount', { precision: 10, scale: 2 }).notNull(),
  itemCount: integer('item_count').notNull(),
  recoveredAt: timestamp('recovered_at', { mode: 'date' }).defaultNow(),
  timeToRecoveryHours: decimal('time_to_recovery_hours', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
})

// Campaign Emails Table - Track sent recovery emails (for individual sends)
export const campaignEmails = pgTable('campaign_emails', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: text('session_id').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerName: text('customer_name'),
  emailNumber: integer('email_number').default(1), // 1st, 2nd, 3rd email
  status: text('status', { enum: ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'] }).default('sent').notNull(),
  sentAt: timestamp('sent_at', { mode: 'date' }).defaultNow(),
  openedAt: timestamp('opened_at', { mode: 'date' }),
  clickedAt: timestamp('clicked_at', { mode: 'date' }),
  recoveredAt: timestamp('recovered_at', { mode: 'date' }),
  recoveryAmount: decimal('recovery_amount', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
})

// Recovery Campaigns Table - Template definitions for cart recovery campaigns
export const recoveryCampaigns = pgTable('recovery_campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  subject: text('subject').notNull(),
  delayHours: integer('delay_hours').default(24).notNull(),
  discountType: text('discount_type', { enum: ['percentage', 'fixed'] }),
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }),
  discountCode: text('discount_code'),
  maxEmails: integer('max_emails').default(3).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
})

// Data Updater Table - Store data manager import configuration and status
export const dataUpdater = pgTable('data_updater', {
  id: serial('id').primaryKey(),
  selectedDataSource: text('selected_data_source', { enum: ['local', 'vercel'] }).default('local').notNull(),
  autoUpdateEnabled: boolean('auto_update_enabled').default(false).notNull(),
  updateIntervalMinutes: integer('update_interval_minutes').default(60).notNull(),
  lastManualUpdate: timestamp('last_manual_update', { mode: 'date' }),
  lastAutoUpdate: timestamp('last_auto_update', { mode: 'date' }),
  lastUpdateStatus: text('last_update_status', { enum: ['success', 'error', 'pending', 'idle'] }).default('idle').notNull(),
  lastUpdateMessage: text('last_update_message'),
  fileCount: integer('file_count').default(0).notNull(),
  databaseStatus: text('database_status', { enum: ['ready', 'error', 'updating', 'disconnected'] }).default('ready').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
})

// Type exports for Cart Abandonment Toggle
export type CartAbandonmentToggle = typeof cartAbandonmentToggle.$inferSelect
export type NewCartAbandonmentToggle = typeof cartAbandonmentToggle.$inferInsert

// Type exports for Cart Sessions
export type CartSession = typeof cartSessions.$inferSelect
export type NewCartSession = typeof cartSessions.$inferInsert

// Type exports for Cart Events
export type CartEvent = typeof cartEvents.$inferSelect
export type NewCartEvent = typeof cartEvents.$inferInsert

// Type exports for Carts Recovered
export type CartRecovered = typeof cartsRecovered.$inferSelect
export type NewCartRecovered = typeof cartsRecovered.$inferInsert

// Type exports for Campaign Emails
export type CampaignEmail = typeof campaignEmails.$inferSelect
export type NewCampaignEmail = typeof campaignEmails.$inferInsert

// Type exports for Recovery Campaigns
export type RecoveryCampaign = typeof recoveryCampaigns.$inferSelect
export type NewRecoveryCampaign = typeof recoveryCampaigns.$inferInsert

// Type exports for Data Updater
export type DataUpdater = typeof dataUpdater.$inferSelect
export type NewDataUpdater = typeof dataUpdater.$inferInsert
