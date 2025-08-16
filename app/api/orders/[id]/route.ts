import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, orderItems, addresses, products, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Fetch order with all relationships
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: {
          with: {
            product: true
          }
        },
        shippingAddress: true,
        billingAddress: true,
        user: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Transform the data to match frontend expectations
    const transformedOrder = {
      orderId: order.id,
      customerEmail: order.user?.email || order.guestEmail || '',
      paymentMethod: order.paymentMethod || 'PayPal',
      status: order.status,
      paymentStatus: order.paymentStatus,
      items: order.items?.map(item => ({
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        price: parseFloat(item.unitPrice.toString()),
        image: item.product?.mediumPicture || item.product?.smallPicture || `/images/prodimages/product${item.productId}.jpg`,
        color: item.color,
        size: item.size,
        sku: item.sku
      })) || [],
      taxAmount: parseFloat(order.tax.toString()),
      shippingAmount: parseFloat(order.shippingFee.toString()),
      totalAmount: parseFloat(order.totalAmount.toString()),
      subtotal: parseFloat(order.subtotal.toString()),
      discount: parseFloat(order.discount.toString()),
      shippingAddress: order.shippingAddress ? {
        street: order.shippingAddress.street,
        street2: order.shippingAddress.street2,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        postalCode: order.shippingAddress.postalCode,
        country: order.shippingAddress.country
      } : {},
      billingAddress: order.billingAddress ? {
        street: order.billingAddress.street,
        street2: order.billingAddress.street2,
        city: order.billingAddress.city,
        state: order.billingAddress.state,
        postalCode: order.billingAddress.postalCode,
        country: order.billingAddress.country
      } : {},
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      note: order.note
    }

    return NextResponse.json(transformedOrder)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const body = await request.json()
    const { items, ...orderData } = body

    // Calculate totals in actual dollars
    const subtotal = items.reduce((sum: number, item: any) => {
      const itemPrice = parseFloat(String(item.price))
      const itemQuantity = parseInt(String(item.quantity))
      return sum + (itemPrice * itemQuantity)
    }, 0)

    // Use actual dollar amounts without cents conversion
    const updatedOrderData = {
      ...orderData,
      totalAmount: subtotal + 
        (orderData.taxAmount ? parseFloat(orderData.taxAmount) : 0) +
        (orderData.shippingAmount ? parseFloat(orderData.shippingAmount) : 0) -
        (orderData.discountValue ? parseFloat(orderData.discountValue) : 0),
      subtotal,
      tax: orderData.taxAmount ? parseFloat(orderData.taxAmount) : 0,
      discount: orderData.discountValue ? parseFloat(orderData.discountValue) : 0,
      shippingFee: orderData.shippingAmount ? parseFloat(orderData.shippingAmount) : 0,
      updatedAt: new Date(),
    }

    // Update the order
    const [updatedOrder] = await db
      .update(orders)
      .set(updatedOrderData)
      .where(eq(orders.id, resolvedParams.id))
      .returning()

    // If there are items to update
    if (items && items.length > 0) {
      // Delete existing order items
      await db.delete(orderItems).where(eq(orderItems.orderId, resolvedParams.id))

      // Insert new order items with actual dollar amounts
      const orderItemsData = items.map((item: any) => ({
        orderId: resolvedParams.id,
        productId: parseInt(item.productId),
        name: item.productName,
        quantity: item.quantity,
        unitPrice: parseFloat(String(item.price)), // Use actual dollar amount
        totalPrice: parseFloat(String(item.price)) * parseInt(String(item.quantity)), // Use actual dollar amount
      }))

      await db.insert(orderItems).values(orderItemsData)

      // Update product quantities
      for (const item of items) {
        await db
          .update(products)
          .set({
            quantityAvailable: sql`${products.quantityAvailable} - ${item.quantity}`,
          })
          .where(eq(products.id, parseInt(item.productId)))
      }
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
} 