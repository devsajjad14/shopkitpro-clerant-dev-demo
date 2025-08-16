import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cartSessions, cartEvents } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cartId = searchParams.get('cartId')

    if (!cartId) {
      return NextResponse.json({
        success: false,
        error: 'Cart ID is required'
      }, { status: 400 })
    }

    // Get the cart session
    const cartSession = await db
      .select()
      .from(cartSessions)
      .where(eq(cartSessions.id, cartId))
      .limit(1)

    if (cartSession.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Cart session not found'
      }, { status: 404 })
    }

    const session = cartSession[0]


    // Fetch cart items from view_cart event metadata
    const viewCartEvent = await db
      .select({
        metadata: cartEvents.metadata,
      })
      .from(cartEvents)
      .where(
        and(
          eq(cartEvents.sessionId, session.sessionId),
          eq(cartEvents.eventType, 'view_cart')
        )
      )
      .orderBy(cartEvents.createdAt)
      .limit(1)



    // Extract cart items from view_cart event metadata
    let cartItems: Array<{
      id: string,
      name: string,
      price: number,
      quantity: number,
      image: string,
      category: string,
      color?: string,
      size?: string,
      productId?: number
    }> = []
    
    if (viewCartEvent.length > 0 && viewCartEvent[0].metadata) {
      const metadata = viewCartEvent[0].metadata as any
      
      if (metadata.cartData && metadata.cartData.items && Array.isArray(metadata.cartData.items)) {
        cartItems = metadata.cartData.items.map((item: any) => ({
          id: item.id || `${item.productId}-${item.color}-${item.size}` || Math.random().toString(),
          name: item.name || 'Unknown Product',
          price: parseFloat(item.price?.toString() || '0'),
          quantity: item.quantity || 1,
          image: item.image || '/placeholder-product.jpg',
          category: 'Recovered Item',
          color: item.color,
          size: item.size,
          productId: item.productId
        }))
      }
    }

    // If no items found in view_cart, try add_item events as fallback
    if (cartItems.length === 0) {
      const cartItemsEvents = await db
        .select({
          productName: cartEvents.productName,
          quantity: cartEvents.quantity,
          price: cartEvents.price,
          productId: cartEvents.productId,
        })
        .from(cartEvents)
        .where(
          and(
            eq(cartEvents.sessionId, session.sessionId),
            eq(cartEvents.eventType, 'add_item')
          )
        )

      cartItems = cartItemsEvents.map(event => ({
        id: event.productId?.toString() || Math.random().toString(),
        name: event.productName || 'Unknown Product',
        price: parseFloat(event.price?.toString() || '0'),
        quantity: event.quantity || 1,
        image: '/placeholder-product.jpg',
        category: 'Recovered Item'
      }))
    }

    return NextResponse.json({
      success: true,
      cartItems,
      totalAmount: parseFloat(session.totalAmount?.toString() || '0'),
      itemCount: session.itemCount || 0,
      customerEmail: session.customerEmail,
      customerName: session.customerName
    })

  } catch (error) {
    console.error('Failed to fetch cart data:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 