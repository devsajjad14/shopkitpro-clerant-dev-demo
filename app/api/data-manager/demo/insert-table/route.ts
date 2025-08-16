import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { db } from '@/lib/db'
import { eq, count } from 'drizzle-orm'
import {
  accounts, products, categories, orders, customers, taxonomy,
  attributes, attributeValues, brands, settings, reviews, addresses, users, sessions, userProfiles, verificationTokens, productVariations, productAlternateImages, productAttributes, variantAttributes, taxRates, orderItems, refunds, coupons, adminUsers, shippingMethods, apiIntegrations, discounts, paymentGateways, paymentSettings, paymentTransactionLogs, paymentGatewayHealthChecks, dataModeSettings, mainBanners, mini_banners, pages, pageRevisions, pageCategories, pageCategoryRelations, pageAnalytics, cartAbandonmentToggle, cartSessions, cartEvents, cartsRecovered, campaignEmails
} from '@/lib/db/schema'

// Table mapping for insertion (same as import system)
const tableMap: Record<string, any> = {
  users, categories, taxonomy, brands, settings, taxRates, shippingMethods, adminUsers, apiIntegrations, paymentGateways, paymentSettings, dataModeSettings, mainBanners, mini_banners, pages, pageCategories, cartAbandonmentToggle, customers, verificationTokens, accounts, sessions, userProfiles, addresses, coupons, discounts, attributes, attributeValues, products, orders, refunds, cartSessions, cartEvents, cartsRecovered, campaignEmails, paymentTransactionLogs, paymentGatewayHealthChecks, productVariations, productAlternateImages, productAttributes, variantAttributes, orderItems, reviews, pageRevisions, pageCategoryRelations, pageAnalytics
}

// Filename to table mapping for demo data
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

export async function POST(request: NextRequest) {
  try {
    const { tableName, dataSource } = await request.json()

    if (!tableName) {
      return NextResponse.json({
        success: false,
        error: 'Table name is required'
      }, { status: 400 })
    }

    console.log(`📥 Loading demo data for table: ${tableName} from source: ${dataSource}`)

    // Get the actual table object from the mapping
    const table = tableMap[tableName]
    if (!table) {
      return NextResponse.json({
        success: false,
        error: `Table '${tableName}' not found in schema`
      }, { status: 400 })
    }

    let recordsInserted = 0

    if (dataSource === 'local') {
      // Load from local demo-data folder
      const filename = `${tableName}.json`
      const demoDataPath = join(process.cwd(), 'demo-data', filename)
      
      try {
        console.log(`📂 Reading demo data from: ${demoDataPath}`)
        const fileContent = await readFile(demoDataPath, 'utf-8')
        const demoData = JSON.parse(fileContent)
        
        if (Array.isArray(demoData) && demoData.length > 0) {
          console.log(`📊 Found ${demoData.length} demo records for ${tableName}`)
          
          // Insert records one by one using Drizzle ORM
          for (const record of demoData) {
            try {
              // Convert keys to camelCase to match Drizzle schema
              const cleanRecord = convertKeysToCamelCase(record)
              
              // Remove id field to let database auto-generate
              delete cleanRecord.id
              
              // Fix any UUID or integer fields if needed
              for (const key in cleanRecord) {
                if (key.includes('Id') && cleanRecord[key]) {
                  cleanRecord[key] = validateAndFixInteger(cleanRecord[key])
                }
                if (key.includes('uuid') && cleanRecord[key]) {
                  cleanRecord[key] = validateAndFixUUID(cleanRecord[key])
                }
              }
              
              // Insert using Drizzle ORM
              await db.insert(table).values(cleanRecord)
              recordsInserted++
              
            } catch (insertError: any) {
              console.error(`❌ Failed to insert record in ${tableName}:`, insertError.message)
              // Continue with other records
            }
          }
          
          console.log(`✅ Successfully inserted ${recordsInserted} records into ${tableName}`)
        } else {
          console.log(`⚠️ No demo data found for ${tableName}`)
        }
        
      } catch (fileError: any) {
        console.error(`❌ Failed to read demo data file for ${tableName}:`, fileError.message)
        return NextResponse.json({
          success: false,
          error: `Failed to read demo data file: ${fileError.message}`,
          tableName
        }, { status: 500 })
      }
      
    } else if (dataSource === 'download') {
      // TODO: Implement download from remote server
      console.log(`🌐 Download demo data not implemented yet for ${tableName}`)
      return NextResponse.json({
        success: false,
        error: 'Download demo data source not implemented yet'
      }, { status: 501 })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully loaded ${recordsInserted} demo records into ${tableName}`,
      recordsInserted,
      tableName
    })

  } catch (error: any) {
    console.error(`❌ Demo data loading failed:`, error)
    return NextResponse.json({
      success: false,
      error: 'Failed to load demo data',
      details: error.message
    }, { status: 500 })
  }
}