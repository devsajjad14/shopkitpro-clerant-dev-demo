import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import * as schema from '@/lib/db/schema'

// List of all table objects from schema (excluding relations and types)
const tableDefinitions = {
  users: schema.users,
  accounts: schema.accounts,
  sessions: schema.sessions,
  verificationTokens: schema.verificationTokens,
  userProfiles: schema.userProfiles,
  addresses: schema.addresses,
  reviews: schema.reviews,
  products: schema.products,
  productVariations: schema.productVariations,
  productAlternateImages: schema.productAlternateImages,
  productAttributes: schema.productAttributes,
  variantAttributes: schema.variantAttributes,
  categories: schema.categories,
  settings: schema.settings,
  attributes: schema.attributes,
  attributeValues: schema.attributeValues,
  taxonomy: schema.taxonomy,
  brands: schema.brands,
  customers: schema.customers,
  taxRates: schema.taxRates,
  orders: schema.orders,
  orderItems: schema.orderItems,
  refunds: schema.refunds,
  coupons: schema.coupons,
  adminUsers: schema.adminUsers,
  shippingMethods: schema.shippingMethods,
  apiIntegrations: schema.apiIntegrations,
  discounts: schema.discounts,
  paymentGateways: schema.paymentGateways,
  paymentSettings: schema.paymentSettings,
  paymentTransactionLogs: schema.paymentTransactionLogs,
  paymentGatewayHealthChecks: schema.paymentGatewayHealthChecks,
  dataModeSettings: schema.dataModeSettings,
  mainBanners: schema.mainBanners,
  mini_banners: schema.mini_banners,
  pages: schema.pages,
  pageRevisions: schema.pageRevisions,
  pageCategories: schema.pageCategories,
  pageCategoryRelations: schema.pageCategoryRelations,
  pageAnalytics: schema.pageAnalytics,
  cartAbandonmentToggle: schema.cartAbandonmentToggle,
  cartSessions: schema.cartSessions,
  cartEvents: schema.cartEvents,
  cartsRecovered: schema.cartsRecovered,
  campaignEmails: schema.campaignEmails,
  dataUpdater: schema.dataUpdater
}

// Hardcoded column counts based on your schema (for reliability)
const tableColumnCounts: Record<string, number> = {
  users: 5,
  accounts: 9,
  sessions: 3,
  verificationTokens: 3,
  userProfiles: 7,
  addresses: 10,
  reviews: 8,
  products: 28,
  productVariations: 8,
  productAlternateImages: 4,
  productAttributes: 5,
  variantAttributes: 5,
  categories: 6,
  settings: 6,
  attributes: 6,
  attributeValues: 4,
  taxonomy: 18,
  brands: 9,
  customers: 12,
  taxRates: 8,
  orders: 15,
  orderItems: 9,
  refunds: 26,
  coupons: 19,
  adminUsers: 12,
  shippingMethods: 6,
  apiIntegrations: 9,
  discounts: 10,
  paymentGateways: 12,
  paymentSettings: 44,
  paymentTransactionLogs: 11,
  paymentGatewayHealthChecks: 7,
  dataModeSettings: 4,
  mainBanners: 32,
  mini_banners: 32,
  pages: 12,
  pageRevisions: 9,
  pageCategories: 8,
  pageCategoryRelations: 2,
  pageAnalytics: 7,
  cartAbandonmentToggle: 6,
  cartSessions: 19,
  cartEvents: 9,
  cartsRecovered: 7,
  campaignEmails: 10,
  dataUpdater: 9
}

// Get table metadata with record counts and last updated timestamps
export async function GET(request: NextRequest) {
  try {
    console.log('Starting table information fetch...')
    const tableInfo = []

    // Process each table from our schema
    for (const [tableName, table] of Object.entries(tableDefinitions)) {
      try {
        console.log(`Processing table: ${tableName}`)

        // Get exact count using Drizzle
        const countResult = await db.select({ count: sql<number>`COUNT(*)` }).from(table)
        const count = Number(countResult[0]?.count || 0)

        // Try to get last updated timestamp
        let lastUpdated = 'Unknown'
        try {
          // Try updatedAt first, then createdAt
          const timestampResult = await db.select({
            lastUpdated: sql`MAX(COALESCE(updated_at, created_at))`
          }).from(table)
          
          if (timestampResult[0]?.lastUpdated) {
            lastUpdated = formatTimeAgo(new Date(timestampResult[0].lastUpdated))
          }
        } catch (timestampError) {
          console.log(`No timestamp columns found for ${tableName}`)
        }

        // Get column count from our hardcoded list (most reliable)
        const columnCount = tableColumnCounts[tableName] || 0

        // Estimate table size based on record count
        let totalSize = 'Unknown'
        if (count > 0) {
          if (count < 100) {
            totalSize = '< 1KB'
          } else if (count < 1000) {
            totalSize = '< 10KB'
          } else if (count < 10000) {
            totalSize = '< 100KB'
          } else if (count < 100000) {
            totalSize = '< 1MB'
          } else {
            totalSize = '> 1MB'
          }
        } else {
          totalSize = 'Empty'
        }

        // Format table name for display
        const displayName = tableName
          .replace(/([A-Z])/g, ' $1') // Add space before capital letters
          .replace(/_/g, ' ') // Replace underscores with spaces
          .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
          .trim()

        tableInfo.push({
          id: tableName,
          name: displayName,
          tableName: tableName,
          count: count,
          lastUpdated: lastUpdated,
          totalSize: totalSize,
          tableSize: totalSize,
          columns: columnCount,
          primaryKeys: 1, // Most tables have a primary key
          nullable: Math.floor(columnCount / 2) // Estimate
        })

        console.log(`Successfully processed ${tableName}: ${count} records, ${columnCount} columns, ${totalSize}`)

      } catch (error) {
        console.error(`Error processing table ${tableName}:`, error)
        
        // Still add the table with basic info
        const displayName = tableName
          .replace(/([A-Z])/g, ' $1')
          .replace(/_/g, ' ')
          .replace(/^./, str => str.toUpperCase())
          .trim()

        tableInfo.push({
          id: tableName,
          name: displayName,
          tableName: tableName,
          count: 0,
          lastUpdated: 'Unknown',
          totalSize: 'Unknown',
          tableSize: 'Unknown',
          columns: tableColumnCounts[tableName] || 0,
          primaryKeys: 0,
          nullable: 0
        })
      }
    }

    console.log(`Successfully processed ${tableInfo.length} tables`)

    return NextResponse.json({
      success: true,
      tables: tableInfo,
      totalTables: tableInfo.length,
      totalRecords: tableInfo.reduce((sum, table) => sum + table.count, 0)
    })

  } catch (error: any) {
    console.error('Error fetching table information:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch table information',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
  return `${Math.floor(diffInSeconds / 31536000)} years ago`
}