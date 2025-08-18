import { NextRequest, NextResponse } from 'next/server'

const importOrdersService = () => import('@/lib/orders/orders-service')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filters = {
      search: searchParams.get('search'),
      status: searchParams.get('status')
    }
    
    const { getAllOrders } = await importOrdersService()
    const orders = await getAllOrders(filters)
    
    return NextResponse.json({
      success: true,
      orders
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch orders'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const orderData = await request.json()
    const { createOrder } = await importOrdersService()
    
    const result = await createOrder(orderData)
    
    return NextResponse.json({
      success: true,
      order: result[0],
      message: 'Order created successfully'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order'
    }, { status: 500 })
  }
}