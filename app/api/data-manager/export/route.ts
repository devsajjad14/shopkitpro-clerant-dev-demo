import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import * as schema from '@/lib/db/schema'

// Same table definitions as in tables API
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tables, format = 'json', exportMode = 'custom' } = body

    if (!tables || !Array.isArray(tables)) {
      return NextResponse.json(
        { success: false, error: 'Tables array is required' },
        { status: 400 }
      )
    }

    if (tables.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one table must be selected' },
        { status: 400 }
      )
    }

    const exportData: Record<string, any[]> = {}
    const exportMetadata = {
      exportedAt: new Date().toISOString(),
      format,
      exportMode,
      tablesCount: tables.length,
      totalRecords: 0
    }

    // Export each table
    for (const tableName of tables) {
      try {
        // Get table from our defined table definitions
        const table = tableDefinitions[tableName as keyof typeof tableDefinitions]
        
        if (!table) {
          console.warn(`Table ${tableName} not found in schema`)
          exportData[tableName] = {
            error: `Table not found in schema`,
            records: []
          }
          continue
        }

        // Get all data from the table using Drizzle
        const result = await db.select().from(table)
        
        // Convert PostgreSQL data to JSON-serializable format
        const processedData = result.map((row: any) => {
          const processedRow: any = {}
          for (const [key, value] of Object.entries(row)) {
            if (value instanceof Date) {
              processedRow[key] = value.toISOString()
            } else if (typeof value === 'bigint') {
              processedRow[key] = value.toString()
            } else {
              processedRow[key] = value
            }
          }
          return processedRow
        })

        exportData[tableName] = processedData
        exportMetadata.totalRecords += processedData.length

        console.log(`Exported ${processedData.length} records from ${tableName}`)
      } catch (error: any) {
        console.error(`Error exporting table ${tableName}:`, error)
        exportData[tableName] = {
          error: `Failed to export table: ${error.message}`,
          records: []
        }
      }
    }

    // For multiple tables, return a structured response for frontend to handle
    if (tables.length > 1) {
      // Return the data so frontend can trigger multiple downloads
      return NextResponse.json({
        success: true,
        multipleFiles: true,
        format: format,
        tables: exportData,
        message: `Prepared ${tables.length} tables for download`
      })
    }

    // Single table export - direct download
    const tableName = tables[0]
    const tableData = exportData[tableName] || []
    
    let responseData: any
    let contentType: string
    let filename: string

    switch (format) {
      case 'csv':
        responseData = convertTableToCSV(tableName, tableData)
        contentType = 'text/csv'
        filename = `${tableName}.csv`
        break
      
      case 'xml':
        responseData = convertTableToXML(tableName, tableData)
        contentType = 'application/xml'
        filename = `${tableName}.xml`
        break
      
      default:
        responseData = tableData
        contentType = 'application/json'
        filename = `${tableName}.json`
        break
    }

    // Return the data with appropriate headers for download
    const response = new NextResponse(
      format === 'json' ? JSON.stringify(responseData, null, 2) : responseData,
      {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )

    return response

  } catch (error: any) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to export data',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// Helper function to convert single table to CSV format
function convertTableToCSV(tableName: string, data: any[]): string {
  if (!Array.isArray(data) || data.length === 0) {
    return `# No data available for table: ${tableName}\n`
  }

  let csvContent = ''
  
  // Get headers from first row
  const headers = Object.keys(data[0])
  csvContent += headers.join(',') + '\n'
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header]
      if (value === null || value === undefined) return ''
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return String(value)
    })
    csvContent += values.join(',') + '\n'
  }
  
  return csvContent
}

// Helper function to convert single table to XML format
function convertTableToXML(tableName: string, data: any[]): string {
  let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xmlContent += `<${tableName}>\n`
  
  if (Array.isArray(data) && data.length > 0) {
    for (const row of data) {
      xmlContent += '  <record>\n'
      for (const [key, value] of Object.entries(row)) {
        const escapedValue = String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        xmlContent += `    <${key}>${escapedValue}</${key}>\n`
      }
      xmlContent += '  </record>\n'
    }
  }
  
  xmlContent += `</${tableName}>`
  
  return xmlContent
}