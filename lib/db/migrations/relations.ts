import { relations } from "drizzle-orm/relations";
import { users, addresses, sessions, userProfiles, reviews, attributes, attributeValues, products, productVariations, productAlternateImages, orders, orderItems, coupons, shippingMethods, taxRates, refunds, productAttributes, variantAttributes, paymentSettings, gatewayMonitoringLogs, paymentTransactionLogs, accounts } from "./schema";

export const addressesRelations = relations(addresses, ({one, many}) => ({
	user: one(users, {
		fields: [addresses.userId],
		references: [users.id]
	}),
	orders_shippingAddressId: many(orders, {
		relationName: "orders_shippingAddressId_addresses_id"
	}),
	orders_billingAddressId: many(orders, {
		relationName: "orders_billingAddressId_addresses_id"
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	addresses: many(addresses),
	sessions: many(sessions),
	userProfiles: many(userProfiles),
	reviews: many(reviews),
	coupons_createdBy: many(coupons, {
		relationName: "coupons_createdBy_users_id"
	}),
	coupons_updatedBy: many(coupons, {
		relationName: "coupons_updatedBy_users_id"
	}),
	orders: many(orders),
	refunds: many(refunds),
	paymentSettings_createdBy: many(paymentSettings, {
		relationName: "paymentSettings_createdBy_users_id"
	}),
	paymentSettings_updatedBy: many(paymentSettings, {
		relationName: "paymentSettings_updatedBy_users_id"
	}),
	paymentSettings_termsAcceptedBy: many(paymentSettings, {
		relationName: "paymentSettings_termsAcceptedBy_users_id"
	}),
	accounts: many(accounts),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const userProfilesRelations = relations(userProfiles, ({one}) => ({
	user: one(users, {
		fields: [userProfiles.id],
		references: [users.id]
	}),
}));

export const reviewsRelations = relations(reviews, ({one}) => ({
	user: one(users, {
		fields: [reviews.userId],
		references: [users.id]
	}),
}));

export const attributeValuesRelations = relations(attributeValues, ({one, many}) => ({
	attribute: one(attributes, {
		fields: [attributeValues.attributeId],
		references: [attributes.id]
	}),
	productAttributes: many(productAttributes),
	variantAttributes: many(variantAttributes),
}));

export const attributesRelations = relations(attributes, ({many}) => ({
	attributeValues: many(attributeValues),
	productAttributes: many(productAttributes),
	variantAttributes: many(variantAttributes),
}));

export const productVariationsRelations = relations(productVariations, ({one, many}) => ({
	product: one(products, {
		fields: [productVariations.productId],
		references: [products.id]
	}),
	orderItems: many(orderItems),
	variantAttributes: many(variantAttributes),
}));

export const productsRelations = relations(products, ({many}) => ({
	productVariations: many(productVariations),
	productAlternateImages: many(productAlternateImages),
	orderItems: many(orderItems),
	productAttributes: many(productAttributes),
}));

export const productAlternateImagesRelations = relations(productAlternateImages, ({one}) => ({
	product: one(products, {
		fields: [productAlternateImages.productId],
		references: [products.id]
	}),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
	productVariation: one(productVariations, {
		fields: [orderItems.variationId],
		references: [productVariations.id]
	}),
	product: one(products, {
		fields: [orderItems.productId],
		references: [products.id]
	}),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	orderItems: many(orderItems),
	user: one(users, {
		fields: [orders.userId],
		references: [users.id]
	}),
	address_shippingAddressId: one(addresses, {
		fields: [orders.shippingAddressId],
		references: [addresses.id],
		relationName: "orders_shippingAddressId_addresses_id"
	}),
	address_billingAddressId: one(addresses, {
		fields: [orders.billingAddressId],
		references: [addresses.id],
		relationName: "orders_billingAddressId_addresses_id"
	}),
	shippingMethod: one(shippingMethods, {
		fields: [orders.shippingMethodId],
		references: [shippingMethods.id]
	}),
	taxRate: one(taxRates, {
		fields: [orders.taxRateId],
		references: [taxRates.id]
	}),
	refunds: many(refunds),
}));

export const couponsRelations = relations(coupons, ({one}) => ({
	user_createdBy: one(users, {
		fields: [coupons.createdBy],
		references: [users.id],
		relationName: "coupons_createdBy_users_id"
	}),
	user_updatedBy: one(users, {
		fields: [coupons.updatedBy],
		references: [users.id],
		relationName: "coupons_updatedBy_users_id"
	}),
}));

export const shippingMethodsRelations = relations(shippingMethods, ({many}) => ({
	orders: many(orders),
}));

export const taxRatesRelations = relations(taxRates, ({many}) => ({
	orders: many(orders),
}));

export const refundsRelations = relations(refunds, ({one}) => ({
	order: one(orders, {
		fields: [refunds.orderId],
		references: [orders.id]
	}),
	user: one(users, {
		fields: [refunds.refundedBy],
		references: [users.id]
	}),
}));

export const productAttributesRelations = relations(productAttributes, ({one}) => ({
	product: one(products, {
		fields: [productAttributes.productId],
		references: [products.id]
	}),
	attribute: one(attributes, {
		fields: [productAttributes.attributeId],
		references: [attributes.id]
	}),
	attributeValue: one(attributeValues, {
		fields: [productAttributes.attributeValueId],
		references: [attributeValues.id]
	}),
}));

export const variantAttributesRelations = relations(variantAttributes, ({one}) => ({
	productVariation: one(productVariations, {
		fields: [variantAttributes.variationId],
		references: [productVariations.id]
	}),
	attribute: one(attributes, {
		fields: [variantAttributes.attributeId],
		references: [attributes.id]
	}),
	attributeValue: one(attributeValues, {
		fields: [variantAttributes.attributeValueId],
		references: [attributeValues.id]
	}),
}));

export const gatewayMonitoringLogsRelations = relations(gatewayMonitoringLogs, ({one}) => ({
	paymentSetting: one(paymentSettings, {
		fields: [gatewayMonitoringLogs.paymentSettingId],
		references: [paymentSettings.id]
	}),
}));

export const paymentSettingsRelations = relations(paymentSettings, ({one, many}) => ({
	gatewayMonitoringLogs: many(gatewayMonitoringLogs),
	paymentTransactionLogs: many(paymentTransactionLogs),
	user_createdBy: one(users, {
		fields: [paymentSettings.createdBy],
		references: [users.id],
		relationName: "paymentSettings_createdBy_users_id"
	}),
	user_updatedBy: one(users, {
		fields: [paymentSettings.updatedBy],
		references: [users.id],
		relationName: "paymentSettings_updatedBy_users_id"
	}),
	user_termsAcceptedBy: one(users, {
		fields: [paymentSettings.termsAcceptedBy],
		references: [users.id],
		relationName: "paymentSettings_termsAcceptedBy_users_id"
	}),
}));

export const paymentTransactionLogsRelations = relations(paymentTransactionLogs, ({one}) => ({
	paymentSetting: one(paymentSettings, {
		fields: [paymentTransactionLogs.paymentSettingId],
		references: [paymentSettings.id]
	}),
}));

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));