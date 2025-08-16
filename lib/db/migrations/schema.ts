import { pgTable, foreignKey, uuid, text, boolean, timestamp, unique, integer, serial, numeric, varchar, jsonb, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const addresses = pgTable("addresses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	type: text().notNull(),
	isDefault: boolean("is_default").default(false),
	street: text().notNull(),
	street2: text("street_2"),
	city: text().notNull(),
	state: text().notNull(),
	postalCode: text("postal_code").notNull(),
	country: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "addresses_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const sessions = pgTable("sessions", {
	sessionToken: text().primaryKey().notNull(),
	userId: uuid().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sessions_userId_users_id_fk"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text(),
	email: text().notNull(),
	password: text(),
	emailVerified: timestamp({ mode: 'string' }),
	image: text(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const categories = pgTable("categories", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text(),
	parentId: text("parent_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
	id: uuid().primaryKey().notNull(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	phone: text(),
	avatarUrl: text("avatar_url"),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	isActive: boolean("is_active").default(true).notNull(),
	newsletterOptin: boolean("newsletter_optin").default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.id],
			foreignColumns: [users.id],
			name: "user_profiles_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const reviews = pgTable("reviews", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	productId: text("product_id").notNull(),
	rating: integer().notNull(),
	title: text().notNull(),
	content: text().notNull(),
	images: text().array(),
	verifiedPurchase: boolean("verified_purchase").default(false),
	helpfulVotes: integer("helpful_votes").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "reviews_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const settings = pgTable("settings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	key: text().notNull(),
	value: text(),
	type: text().notNull(),
	group: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("settings_key_unique").on(table.key),
]);

export const attributes = pgTable("attributes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	display: text().notNull(),
	status: text().default('draft').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	showOnCategory: boolean("show_on_category").default(true).notNull(),
	showOnProduct: boolean("show_on_product").default(true).notNull(),
});

export const attributeValues = pgTable("attribute_values", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	attributeId: uuid("attribute_id").notNull(),
	value: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.attributeId],
			foreignColumns: [attributes.id],
			name: "attribute_values_attribute_id_attributes_id_fk"
		}),
]);

export const productVariations = pgTable("product_variations", {
	id: serial().primaryKey().notNull(),
	productId: integer("product_id").notNull(),
	skuId: integer("sku_id").notNull(),
	quantity: integer().default(0).notNull(),
	colorImage: text("color_image"),
	sku: text(),
	barcode: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	available: boolean().default(false).notNull(),
	price: numeric({ precision: 10, scale:  2 }).default('0.00').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_variations_product_id_products_id_fk"
		}).onDelete("cascade"),
]);

export const products = pgTable("products", {
	id: serial().primaryKey().notNull(),
	styleId: integer("style_id").notNull(),
	name: text().notNull(),
	style: text().notNull(),
	quantityAvailable: integer("quantity_available").default(0).notNull(),
	onSale: text("on_sale").default('N').notNull(),
	isNew: text("is_new").default('N').notNull(),
	smallPicture: text("small_picture"),
	mediumPicture: text("medium_picture"),
	largePicture: text("large_picture"),
	dept: text(),
	typ: text(),
	subtyp: text(),
	brand: text(),
	sellingPrice: numeric("selling_price", { precision: 10, scale:  2 }).notNull(),
	regularPrice: numeric("regular_price", { precision: 10, scale:  2 }).notNull(),
	longDescription: text("long_description"),
	of7: text(),
	of12: text(),
	of13: text(),
	of15: text(),
	forceBuyQtyLimit: text("force_buy_qty_limit"),
	lastRcvd: text("last_rcvd"),
	tags: text(),
	urlHandle: text("url_handle"),
	barcode: text(),
	sku: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	trackInventory: boolean("track_inventory").default(false).notNull(),
	stockQuantity: integer("stock_quantity").default(0).notNull(),
	continueSellingOutOfStock: boolean("continue_selling_out_of_stock").default(false).notNull(),
	lowStockThreshold: integer("low_stock_threshold"),
}, (table) => [
	unique("products_style_id_unique").on(table.styleId),
]);

export const taxonomy = pgTable("taxonomy", {
	webTaxonomyId: serial("WEB_TAXONOMY_ID").primaryKey().notNull(),
	dept: text("DEPT").notNull(),
	typ: text("TYP").default('EMPTY').notNull(),
	subtyp1: text("SUBTYP_1").default('EMPTY').notNull(),
	subtyp2: text("SUBTYP_2").default('EMPTY').notNull(),
	subtyp3: text("SUBTYP_3").default('EMPTY').notNull(),
	sortPosition: text("SORT_POSITION"),
	webUrl: text("WEB_URL").notNull(),
	longDescription: text("LONG_DESCRIPTION"),
	dlu: timestamp("DLU", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	categoryStyle: text("CATEGORY_STYLE"),
	shortDesc: text("SHORT_DESC"),
	longDescription2: text("LONG_DESCRIPTION_2"),
	metaTags: text("META_TAGS"),
	active: integer("ACTIVE").default(1).notNull(),
	backgroundimage: text("BACKGROUNDIMAGE"),
	shortDescOnPage: text("SHORT_DESC_ON_PAGE"),
	googleproducttaxonomy: text("GOOGLEPRODUCTTAXONOMY"),
	site: integer("SITE").default(1).notNull(),
	categorytemplate: text("CATEGORYTEMPLATE"),
	bestsellerbg: text("BESTSELLERBG"),
	newarrivalbg: text("NEWARRIVALBG"),
	pagebgcolor: text("PAGEBGCOLOR"),
});

export const brands = pgTable("brands", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	alias: text().notNull(),
	description: text(),
	urlHandle: text("url_handle").notNull(),
	logo: text(),
	showOnCategory: boolean("show_on_category").default(false).notNull(),
	showOnProduct: boolean("show_on_product").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	status: text().default('active').notNull(),
});

export const productAlternateImages = pgTable("product_alternate_images", {
	id: serial().primaryKey().notNull(),
	productId: integer("product_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	altImage: text("AltImage"),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_alternate_images_product_id_products_id_fk"
		}).onDelete("cascade"),
]);

export const customers = pgTable("customers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	firstName: varchar("first_name", { length: 100 }).notNull(),
	lastName: varchar("last_name", { length: 100 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	passwordHash: text("password_hash").notNull(),
	phone: varchar({ length: 20 }),
	billingAddress: jsonb("billing_address"),
	shippingAddress: jsonb("shipping_address"),
	isActive: boolean("is_active").default(true).notNull(),
	newsletterOptin: boolean("newsletter_optin").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("customers_email_unique").on(table.email),
]);

export const taxRates = pgTable("tax_rates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	rate: numeric({ precision: 5, scale:  2 }).notNull(),
	country: text().notNull(),
	state: text(),
	zipCode: text("zip_code"),
	isActive: boolean("is_active").default(true),
	priority: integer().default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const orderItems = pgTable("order_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	productId: integer("product_id").notNull(),
	variationId: integer("variation_id"),
	name: text().notNull(),
	sku: text(),
	color: text(),
	size: text(),
	quantity: integer().default(1).notNull(),
	unitPrice: numeric("unit_price", { precision: 10, scale:  2 }).notNull(),
	totalPrice: numeric("total_price", { precision: 10, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_items_order_id_orders_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.variationId],
			foreignColumns: [productVariations.id],
			name: "order_items_variation_id_product_variations_id_fk"
		}),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "order_items_product_id_products_id_fk"
		}),
]);

export const dataModeSettings = pgTable("data_mode_settings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	mode: text().default('local').notNull(),
	endpoints: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const shippingMethods = pgTable("shipping_methods", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	estimatedDays: integer("estimated_days").notNull(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const coupons = pgTable("coupons", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	code: text().notNull(),
	description: text(),
	type: text().notNull(),
	value: integer().notNull(),
	minPurchaseAmount: integer("min_purchase_amount"),
	maxDiscountAmount: integer("max_discount_amount"),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }).notNull(),
	usageLimit: integer("usage_limit"),
	usageCount: integer("usage_count").default(0),
	perCustomerLimit: integer("per_customer_limit"),
	isActive: boolean("is_active").default(true),
	isFirstTimeOnly: boolean("is_first_time_only").default(false),
	isNewCustomerOnly: boolean("is_new_customer_only").default(false),
	excludedProducts: jsonb("excluded_products"),
	excludedCategories: jsonb("excluded_categories"),
	includedProducts: jsonb("included_products"),
	includedCategories: jsonb("included_categories"),
	customerGroups: jsonb("customer_groups"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	createdBy: uuid("created_by"),
	updatedBy: uuid("updated_by"),
	metadata: jsonb(),
	analytics: jsonb(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "coupons_created_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "coupons_updated_by_users_id_fk"
		}),
	unique("coupons_code_unique").on(table.code),
]);

export const adminUsers = pgTable("admin_users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	passwordHash: varchar("password_hash", { length: 255 }).notNull(),
	role: varchar({ length: 50 }).default('user').notNull(),
	status: varchar({ length: 50 }).default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
	profileImage: varchar("profile_image", { length: 255 }),
	phoneNumber: varchar("phone_number", { length: 20 }),
	address: text(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	verificationToken: varchar("verification_token", { length: 255 }),
	isDeleted: boolean("is_deleted").default(false).notNull(),
}, (table) => [
	unique("admin_users_email_unique").on(table.email),
]);

export const apiIntegration = pgTable("api_integration", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	customerName: text("customer_name").notNull(),
	customerPassword: text("customer_password").notNull(),
	apiKey: text("api_key").notNull(),
	apiSecret: text("api_secret").notNull(),
	token: text().notNull(),
	refreshToken: text("refresh_token").notNull(),
	additionalFields: jsonb("additional_fields").default({"field1":"","field2":"","field3":"","field4":"","field5":""}).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const orders = pgTable("orders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	guestEmail: text("guest_email"),
	status: text().default('pending').notNull(),
	totalAmount: numeric("total_amount", { precision: 10, scale:  2 }).default('0').notNull(),
	subtotal: numeric({ precision: 10, scale:  2 }).default('0').notNull(),
	tax: numeric({ precision: 10, scale:  2 }).default('0').notNull(),
	shippingFee: numeric("shipping_fee", { precision: 10, scale:  2 }).default('0').notNull(),
	discount: numeric({ precision: 10, scale:  2 }).default('0').notNull(),
	paymentMethod: text("payment_method"),
	paymentStatus: text("payment_status").default('pending').notNull(),
	shippingAddressId: uuid("shipping_address_id"),
	billingAddressId: uuid("billing_address_id"),
	note: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	shippingMethodId: uuid("shipping_method_id"),
	taxRateId: uuid("tax_rate_id"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "orders_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.shippingAddressId],
			foreignColumns: [addresses.id],
			name: "orders_shipping_address_id_addresses_id_fk"
		}),
	foreignKey({
			columns: [table.billingAddressId],
			foreignColumns: [addresses.id],
			name: "orders_billing_address_id_addresses_id_fk"
		}),
	foreignKey({
			columns: [table.shippingMethodId],
			foreignColumns: [shippingMethods.id],
			name: "orders_shipping_method_id_shipping_methods_id_fk"
		}),
	foreignKey({
			columns: [table.taxRateId],
			foreignColumns: [taxRates.id],
			name: "orders_tax_rate_id_tax_rates_id_fk"
		}),
]);

export const refunds = pgTable("refunds", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	reason: text().notNull(),
	paymentStatus: text("payment_status").default('pending').notNull(),
	refundMethod: text("refund_method").notNull(),
	refundedBy: uuid("refunded_by"),
	notes: text(),
	attachments: text().array(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	refundTransactionId: text("refund_transaction_id"),
	customerEmail: text("customer_email"),
	customerName: text("customer_name"),
	refundItems: jsonb("refund_items"),
	adminNotes: text("admin_notes"),
	refundPolicy: text("refund_policy").default('standard').notNull(),
	refundType: text("refund_type").notNull(),
	refundFee: integer("refund_fee").default(0),
	refundCurrency: text("refund_currency").default('USD').notNull(),
	refundStatusHistory: jsonb("refund_status_history"),
	refundDocuments: jsonb("refund_documents"),
	refundCommunication: jsonb("refund_communication"),
	refundAnalytics: jsonb("refund_analytics"),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "refunds_order_id_orders_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.refundedBy],
			foreignColumns: [users.id],
			name: "refunds_refunded_by_users_id_fk"
		}),
]);

export const discounts = pgTable("discounts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	code: text().notNull(),
	description: text(),
	type: text().notNull(),
	value: numeric({ precision: 10, scale:  2 }).notNull(),
	minPurchaseAmount: numeric("min_purchase_amount", { precision: 10, scale:  2 }),
	maxDiscountAmount: numeric("max_discount_amount", { precision: 10, scale:  2 }),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }).notNull(),
	usageLimit: integer("usage_limit"),
	usageCount: integer("usage_count").default(0).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("discounts_code_unique").on(table.code),
]);

export const productAttributes = pgTable("product_attributes", {
	id: serial().primaryKey().notNull(),
	productId: integer("product_id").notNull(),
	attributeId: uuid("attribute_id").notNull(),
	attributeValueId: uuid("attribute_value_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_attributes_product_id_products_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.attributeId],
			foreignColumns: [attributes.id],
			name: "product_attributes_attribute_id_attributes_id_fk"
		}),
	foreignKey({
			columns: [table.attributeValueId],
			foreignColumns: [attributeValues.id],
			name: "product_attributes_attribute_value_id_attribute_values_id_fk"
		}),
]);

export const variantAttributes = pgTable("variant_attributes", {
	id: serial().primaryKey().notNull(),
	variationId: integer("variation_id").notNull(),
	attributeId: uuid("attribute_id").notNull(),
	attributeValueId: uuid("attribute_value_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.variationId],
			foreignColumns: [productVariations.id],
			name: "variant_attributes_variation_id_product_variations_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.attributeId],
			foreignColumns: [attributes.id],
			name: "variant_attributes_attribute_id_attributes_id_fk"
		}),
	foreignKey({
			columns: [table.attributeValueId],
			foreignColumns: [attributeValues.id],
			name: "variant_attributes_attribute_value_id_attribute_values_id_fk"
		}),
]);

export const gatewayMonitoringLogs = pgTable("gateway_monitoring_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	paymentSettingId: uuid("payment_setting_id"),
	gateway: text().notNull(),
	status: text().notNull(),
	responseTime: integer("response_time"),
	errorCount: integer("error_count").default(0).notNull(),
	lastCheckAt: timestamp("last_check_at", { mode: 'string' }).notNull(),
	nextCheckAt: timestamp("next_check_at", { mode: 'string' }),
	details: jsonb(),
}, (table) => [
	foreignKey({
			columns: [table.paymentSettingId],
			foreignColumns: [paymentSettings.id],
			name: "gateway_monitoring_logs_payment_setting_id_payment_settings_id_"
		}),
]);

export const paymentTransactionLogs = pgTable("payment_transaction_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	paymentSettingId: uuid("payment_setting_id"),
	transactionId: text("transaction_id"),
	gateway: text().notNull(),
	method: text().notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	currency: text().default('USD').notNull(),
	status: text().notNull(),
	gatewayResponse: jsonb("gateway_response"),
	errorMessage: text("error_message"),
	processingTime: integer("processing_time"),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.paymentSettingId],
			foreignColumns: [paymentSettings.id],
			name: "payment_transaction_logs_payment_setting_id_payment_settings_id"
		}),
]);

export const paymentSettings = pgTable("payment_settings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	environment: text().default('sandbox').notNull(),
	cardEnabled: boolean("card_enabled").default(false),
	paypalEnabled: boolean("paypal_enabled").default(false),
	klarnaEnabled: boolean("klarna_enabled").default(false),
	codEnabled: boolean("cod_enabled").default(false),
	codInstructions: text("cod_instructions"),
	codRequirePhone: boolean("cod_require_phone").default(false).notNull(),
	codMinOrderAmount: numeric("cod_min_order_amount", { precision: 10, scale:  2 }),
	codMaxOrderAmount: numeric("cod_max_order_amount", { precision: 10, scale:  2 }),
	processingFees: jsonb("processing_fees"),
	allowedCountries: text("allowed_countries").array(),
	restrictedCountries: text("restricted_countries").array(),
	pciCompliant: boolean("pci_compliant").default(false).notNull(),
	encryptionLevel: text("encryption_level").default('standard').notNull(),
	totalTransactions: integer("total_transactions").default(0).notNull(),
	totalRevenue: numeric("total_revenue", { precision: 15, scale:  2 }).default('0').notNull(),
	averageTransactionValue: numeric("average_transaction_value", { precision: 10, scale:  2 }),
	successRate: numeric("success_rate", { precision: 5, scale:  2 }),
	createdBy: uuid("created_by"),
	updatedBy: uuid("updated_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	metadata: jsonb(),
	webhookUrl: text("webhook_url"),
	webhookSecret: text("webhook_secret"),
	webhookEnabled: boolean("webhook_enabled").default(false).notNull(),
	webhookLastTriggered: timestamp("webhook_last_triggered", { mode: 'string' }),
	lastError: jsonb("last_error"),
	averageResponseTime: integer("average_response_time"),
	uptimePercentage: numeric("uptime_percentage", { precision: 5, scale:  2 }),
	lastDowntime: timestamp("last_downtime", { mode: 'string' }),
	termsAccepted: boolean("terms_accepted").default(false).notNull(),
	termsAcceptedAt: timestamp("terms_accepted_at", { mode: 'string' }),
	termsAcceptedBy: uuid("terms_accepted_by"),
	backupEnabled: boolean("backup_enabled").default(true).notNull(),
	lastBackupAt: timestamp("last_backup_at", { mode: 'string' }),
	backupFrequency: text("backup_frequency").default('daily').notNull(),
	cardGateway: text("card_gateway"),
	cardEnvironment: text("card_environment").default('sandbox'),
	cardDigitalWalletsEnabled: boolean("card_digital_wallets_enabled").default(false),
	cardConnectionStatus: text("card_connection_status").default('not_connected'),
	cardCredentials: jsonb("card_credentials"),
	paypalReuseCredentials: boolean("paypal_reuse_credentials").default(false),
	paypalClientId: text("paypal_client_id"),
	paypalClientSecret: text("paypal_client_secret"),
	paypalMode: text("paypal_mode").default('sandbox'),
	paypalConnectionStatus: text("paypal_connection_status").default('not_connected'),
	klarnaMerchantId: text("klarna_merchant_id"),
	klarnaUsername: text("klarna_username"),
	klarnaPassword: text("klarna_password"),
	klarnaConnectionStatus: text("klarna_connection_status").default('not_connected'),
	name: text().notNull(),
	paymentMethod: text("payment_method"),
	clientId: text("client_id"),
	clientSecret: text("client_secret"),
	publishableKey: text("publishable_key"),
	secretKey: text("secret_key"),
	merchantId: text("merchant_id"),
	username: text(),
	password: text(),
	apiLoginId: text("api_login_id"),
	transactionKey: text("transaction_key"),
	serviceKey: text("service_key"),
	applicationId: text("application_id"),
	accessToken: text("access_token"),
	locationId: text("location_id"),
	connectionStatus: text("connection_status").default('not_connected'),
	lastTested: timestamp("last_tested", { mode: 'string' }),
	testResult: jsonb("test_result"),
	reuseCredentials: boolean("reuse_credentials").default(false),
	supportsDigitalWallets: boolean("supports_digital_wallets").default(false),
	instructions: text(),
	requirePhone: boolean("require_phone").default(false),
	minOrderAmount: numeric("min_order_amount", { precision: 10, scale:  2 }),
	maxOrderAmount: numeric("max_order_amount", { precision: 10, scale:  2 }),
	klarnaRegion: varchar("klarna_region", { length: 32 }),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "payment_settings_created_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "payment_settings_updated_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.termsAcceptedBy],
			foreignColumns: [users.id],
			name: "payment_settings_terms_accepted_by_users_id_fk"
		}),
]);

export const paymentGateways = pgTable("payment_gateways", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	gatewayName: text("gateway_name").notNull(),
	gatewayType: text("gateway_type").notNull(),
	displayName: text("display_name").notNull(),
	isActive: boolean("is_active").default(false).notNull(),
	environment: text().default('sandbox').notNull(),
	supportsDigitalWallets: boolean("supports_digital_wallets").default(false).notNull(),
	connectionStatus: text("connection_status").default('not_connected').notNull(),
	credentials: jsonb().default({}).notNull(),
	lastTested: timestamp("last_tested", { mode: 'string' }),
	testResult: jsonb("test_result"),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const mainBanners = pgTable("main_banners", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	content: text().notNull(),
	status: text().default('draft'),
	priority: integer().default(1),
	startDate: timestamp("start_date", { mode: 'string' }),
	endDate: timestamp("end_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	imageUrl: text("image_url"),
	showTitle: boolean("show_title").default(true),
	showSubtitle: boolean("show_subtitle").default(true),
	showButton: boolean("show_button").default(true),
	titlePosition: jsonb("title_position"),
	subtitlePosition: jsonb("subtitle_position"),
	ctaPosition: jsonb("cta_position"),
	titleCustomFontSize: integer("title_custom_font_size"),
	subtitleCustomFontSize: integer("subtitle_custom_font_size"),
	ctaCustomFontSize: integer("cta_custom_font_size"),
	titleMarginTop: integer("title_margin_top"),
	titleMarginRight: integer("title_margin_right"),
	titleMarginBottom: integer("title_margin_bottom"),
	titleMarginLeft: integer("title_margin_left"),
	titlePaddingTop: integer("title_padding_top"),
	titlePaddingRight: integer("title_padding_right"),
	titlePaddingBottom: integer("title_padding_bottom"),
	titlePaddingLeft: integer("title_padding_left"),
	subtitleMarginTop: integer("subtitle_margin_top"),
	subtitleMarginRight: integer("subtitle_margin_right"),
	subtitleMarginBottom: integer("subtitle_margin_bottom"),
	subtitleMarginLeft: integer("subtitle_margin_left"),
	subtitlePaddingTop: integer("subtitle_padding_top"),
	subtitlePaddingRight: integer("subtitle_padding_right"),
	subtitlePaddingBottom: integer("subtitle_padding_bottom"),
	subtitlePaddingLeft: integer("subtitle_padding_left"),
	buttonMarginTop: integer("button_margin_top"),
	buttonMarginRight: integer("button_margin_right"),
	buttonMarginBottom: integer("button_margin_bottom"),
	buttonMarginLeft: integer("button_margin_left"),
	buttonPaddingTop: integer("button_padding_top"),
	buttonPaddingRight: integer("button_padding_right"),
	buttonPaddingBottom: integer("button_padding_bottom"),
	buttonPaddingLeft: integer("button_padding_left"),
});

export const verificationTokens = pgTable("verification_tokens", {
	identifier: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	primaryKey({ columns: [table.identifier, table.token], name: "verification_tokens_identifier_token_pk"}),
]);

export const accounts = pgTable("accounts", {
	userId: uuid().notNull(),
	type: text().notNull(),
	provider: text().notNull(),
	providerAccountId: text().notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: integer("expires_at"),
	tokenType: text("token_type"),
	scope: text(),
	idToken: text("id_token"),
	sessionState: text("session_state"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "accounts_userId_users_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.provider, table.providerAccountId], name: "accounts_provider_providerAccountId_pk"}),
]);
