import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { eq, count } from 'drizzle-orm'
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

// Table mapping for deletion
const tableMap: Record<string, any> = {
  users,
  categories,
  taxonomy,
  brands,
  settings,
  taxRates,
  shippingMethods,
  adminUsers,
  apiIntegrations,
  paymentGateways,
  paymentSettings,
  dataModeSettings,
  mainBanners,
  mini_banners,
  pages,
  pageCategories,
  cartAbandonmentToggle,
  customers,
  verificationTokens,
  accounts,
  sessions,
  userProfiles,
  addresses,
  coupons,
  discounts,
  attributes,
  attributeValues,
  products,
  orders,
  refunds,
  cartSessions,
  cartEvents,
  cartsRecovered,
  campaignEmails,
  paymentTransactionLogs,
  paymentGatewayHealthChecks,
  productVariations,
  productAlternateImages,
  productAttributes,
  variantAttributes,
  orderItems,
  reviews,
  pageRevisions,
  pageCategoryRelations,
  pageAnalytics
}

export async function POST(request: NextRequest) {
  try {
    const { tableName } = await request.json()
    
    if (!tableName) {
      return NextResponse.json(
        { success: false, error: 'Table name is required' },
        { status: 400 }
      )
    }

    // Skip deletion of settings table as it's a primary configuration table
    if (tableName === 'settings') {
      return NextResponse.json({
        success: true,
        message: 'Settings table skipped - configuration data preserved',
        tableName,
        recordsDeleted: 0,
        skipped: true
      })
    }

    const table = tableMap[tableName]
    if (!table) {
      return NextResponse.json(
        { success: false, error: `Table '${tableName}' not found` },
        { status: 400 }
      )
    }

    // Count records before deletion
    let recordCount = 0
    try {
      const countResult = await db.select({ count: count() }).from(table)
      recordCount = Number(countResult[0]?.count || 0)
    } catch (error) {
      console.warn(`Could not count records in ${tableName}:`, error)
    }

    // Delete all records from the table
    await db.delete(table)

    console.log(`Successfully deleted ${recordCount} records from ${tableName}`)

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${recordCount} records from ${tableName}`,
      tableName,
      recordsDeleted: recordCount
    })

  } catch (error: any) {
    console.error(`Error deleting table:`, error)
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to delete table`,
        details: error.message 
      },
      { status: 500 }
    )
  }
}
