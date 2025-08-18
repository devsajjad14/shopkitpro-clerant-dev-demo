import { NextResponse } from 'next/server'
import { db, query } from '@/lib/db'
import { orders, orderItems, ordersRelations, users, products } from '@/lib/db/schema'
import { desc, eq, ne, sql, SQL } from 'drizzle-orm'

interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

interface Order {
  id: string
  guestEmail: string | null
  userId: string | null
  status: string
  paymentMethod: string | null
  paymentStatus: string
  totalAmount: number
  subtotal: number
  tax: number
  discount: number
  shippingFee: number
  note: string | null
  createdAt: Date
  updatedAt: Date | null
  items?: OrderItem[]
}

interface OrderRequest {
  customerEmail: string
  customerName: string
  shippingAddress: string
  paymentMethod: string
  status: string
  note?: string
  items: OrderItem[]
  discountType: string
  discountValue: string
  taxAmount: string
  shippingAmount: string
  userId?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''

    const offset = (page - 1) * limit

    // Build the where clause
    const whereConditions: SQL[] = []
    if (search) {
      whereConditions.push(
        sql`(${orders.guestEmail} ILIKE ${`%${search}%`})`
      )
    }
    if (status) {
      if (status.startsWith('!')) {
        // Handle "not equals" condition
        whereConditions.push(ne(orders.status, status.substring(1)))
      } else {
        whereConditions.push(eq(orders.status, status))
      }
    }
    if (startDate) {
      whereConditions.push(sql`${orders.createdAt} >= ${startDate}`)
    }
    if (endDate) {
      whereConditions.push(sql`${orders.createdAt} <= ${endDate}`)
    }

    // Get total count
    const [{ count }] = await query(async () => {
      return await db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(whereConditions.length > 0 ? sql`${sql.join(whereConditions, sql` AND `)}` : undefined)
    })

    // Get orders with items
    const ordersList = await query(async () => {
      const ordersResult = await db
        .select()
        .from(orders)
        .where(whereConditions.length > 0 ? sql`${sql.join(whereConditions, sql` AND `)}` : undefined)
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset)

      // Get items for each order
      const ordersWithItems = await Promise.all(
        ordersResult.map(async (order) => {
          const items = await db
            .select({
              id: orderItems.id,
              orderId: orderItems.orderId,
              productId: orderItems.productId,
              name: orderItems.name,
              quantity: orderItems.quantity,
              unitPrice: orderItems.unitPrice,
              totalPrice: orderItems.totalPrice,
              product: {
                id: products.id,
                name: products.name,
                mediumPicture: products.mediumPicture,
                style: products.style,
                styleId: products.styleId,
                brand: products.brand
              }
            })
            .from(orderItems)
            .leftJoin(products, eq(orderItems.productId, products.id))
            .where(eq(orderItems.orderId, order.id))

          return {
            ...order,
            items
          }
        })
      )

      return ordersWithItems
    })

    return NextResponse.json({
      orders: ordersList,
      total: Number(count),
      page,
      limit,
      totalPages: Math.ceil(Number(count) / limit),
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      customerEmail,
      shippingAddress,
      billingAddress,
      paymentMethod,
      status,
      paymentStatus,
      note,
      items,
      userId,
      discountType,
      discountValue,
      taxAmount,
      shippingAmount,
      phone,
    } = body

    // Calculate subtotal from items
    const subtotal = items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity)
    }, 0)

    // Calculate total amount including tax and shipping
    const totalAmount = subtotal + 
      (taxAmount ? parseFloat(taxAmount) : 0) +
      (shippingAmount ? parseFloat(shippingAmount) : 0) -
      (discountValue ? parseFloat(discountValue) : 0)

    // Create the order
    const orderData = {
      guestEmail: customerEmail,
      shippingAddress,
      billingAddress,
      paymentMethod,
      status,
      paymentStatus: paymentStatus || (paymentMethod === 'paypal' ? 'paid' : 'pending'),
      note,
      userId,
      totalAmount: String(totalAmount),
      subtotal: String(subtotal),
      discount: discountValue ? String(parseFloat(discountValue)) : '0',
      tax: taxAmount ? String(parseFloat(taxAmount)) : '0',
      shippingFee: shippingAmount ? String(parseFloat(shippingAmount)) : '0',
    }

    // Insert the order
    const [order] = await query(async () => {
      return await db.insert(orders).values(orderData).returning()
    })

    // Map styleId to productId if needed
    const resolvedOrderItemsData: any[] = [];
    for (const item of items || []) {
      let product: any = null;
      // Try as real product id first
      if (item.productId) {
        product = await db.query.products.findFirst({
          where: eq(products.id, parseInt(item.productId, 10)),
        });
      }
      // If not found, try as styleId (from productId or styleId field)
      if (!product) {
        const styleIdToTry = item.styleId || item.productId;
        if (styleIdToTry) {
          product = await db.query.products.findFirst({
            where: eq(products.styleId, parseInt(styleIdToTry, 10)),
          });
        }
      }
      if (!product) continue; // skip if not found
      resolvedOrderItemsData.push({
        orderId: order.id,
        productId: product.id, // always the real PK
        name: item.productName,
        quantity: item.quantity,
        unitPrice: String(item.price),
        totalPrice: String(item.price * item.quantity),
      });
    }
    if (resolvedOrderItemsData.length > 0) {
      await query(async () => {
        await db.insert(orderItems).values(resolvedOrderItemsData)
      })
    }

    // Update product quantities
    for (const item of items || []) {
      await query(async () => {
        await db
          .update(products)
          .set({
            quantityAvailable: sql`${products.quantityAvailable} - ${item.quantity}`,
          })
          .where(eq(products.id, parseInt(item.productId, 10)))
      })
    }

    // Fetch order with items from DB for response
    const [orderWithItems] = await query(async () => {
      const items = await db
        .select({
          id: orderItems.id,
          orderId: orderItems.orderId,
          productId: orderItems.productId,
          name: orderItems.name,
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
          totalPrice: orderItems.totalPrice,
          product: {
            id: products.id,
            name: products.name,
            mediumPicture: products.mediumPicture,
            style: products.style,
            styleId: products.styleId,
            brand: products.brand
          }
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id))
      return [{ ...order, items }]
    })

    return NextResponse.json(orderWithItems)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Delete order items first (due to foreign key constraint)
    await db.delete(orderItems).where(eq(orderItems.orderId, id))
    
    // Then delete the order
    await db.delete(orders).where(eq(orders.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const [updatedOrder] = await db
      .update(orders)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning()

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
} 