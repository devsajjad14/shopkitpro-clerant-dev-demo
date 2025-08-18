import { NextResponse } from 'next/server'

const importPaymentSettingsService = () => import('@/lib/admin/payment-settings-service')

export async function GET() {
  try {
    const { getPaymentSettings } = await importPaymentSettingsService()
    const settings = await getPaymentSettings()
    
    return NextResponse.json({
      success: true,
      settings: settings[0] || null
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get payment settings'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { updatePaymentSettings } = await importPaymentSettingsService()
    
    const result = await updatePaymentSettings(data)
    
    return NextResponse.json({
      success: true,
      settings: result[0],
      message: 'Payment settings updated successfully'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update payment settings'
    }, { status: 500 })
  }
}