import { db } from '@/lib/db'
import { cartSessions, cartEvents, cartAbandonmentToggle } from '@/lib/db/schema'
import { eq, and, desc, isNull, lt } from 'drizzle-orm'
import { getCartAbandonmentStatus } from '@/lib/actions/cart-abandonment-toggle'
import { sql } from 'drizzle-orm'
import { generateCartHash } from '@/lib/utils/cart-hash'

export class CartTrackingService {
  // Check if cart abandonment tracking is enabled
  static async isTrackingEnabled(): Promise<boolean> {
    try {
      return await getCartAbandonmentStatus()
    } catch (error) {
      console.error('Error checking tracking status:', error)
      return false
    }
  }

  // Create or get existing cart session with proper cart hash logic
  static async getOrCreateSession(sessionId: string, userId?: string, customerEmail?: string, customerName?: string, cartData?: any, isCompletedOrder: boolean = false) {
    try {
      // Check if tracking is enabled
      const isEnabled = await this.isTrackingEnabled()
      if (!isEnabled) {
        console.log('Cart tracking is disabled')
        return null
      }

      // Validate that we have a customer email (user must be logged in)
      if (!customerEmail) {
        console.log('No customer email provided, skipping cart tracking')
        return null
      }

      // Validate cart data - only track if there are items and total amount > 0
      // BUT allow completed orders even with zero data (order was already placed)
      let itemCount = 0
      let totalAmount = 0
      let cartItems: any[] = []

      if (cartData) {
        itemCount = cartData.itemCount || 0
        totalAmount = parseFloat(cartData.totalAmount || '0')
        cartItems = cartData.items || []
      }

      // Skip validation for completed orders (order was already placed successfully)
      if (!isCompletedOrder && (itemCount <= 0 || totalAmount <= 0)) {
        console.log('❌ Cart tracking skipped: No items or zero total amount', { itemCount, totalAmount, cartData })
        return null
      }

      // Generate cart hash to identify unique carts
      const cartHash = generateCartHash(cartItems)
      console.log('🛒 Cart hash generated:', cartHash, 'for items:', cartItems.length)

      // Check if user has an existing cart with the same hash
      let existingSession = null
      if (customerEmail) {
        existingSession = await db.query.cartSessions.findFirst({
          where: and(
            eq(cartSessions.customerEmail, customerEmail),
            eq(cartSessions.cartHash, cartHash)
          ),
          orderBy: [desc(cartSessions.updatedAt)],
        })
      }

      if (existingSession) {
        console.log('🔄 Found existing cart with same hash:', existingSession.id, 'Status:', existingSession.status)
        
        // If cart is recovered or completed, create a new session
        if (existingSession.status === 'recovered' || existingSession.status === 'completed') {
          console.log('📝 Creating new cart session (previous was recovered/completed)')
          const [newSession] = await db.insert(cartSessions).values({
            sessionId,
            cartHash,
            userId: userId || null,
            customerEmail: customerEmail || null,
            customerName: customerName || null,
            status: 'active',
            totalAmount: totalAmount > 0 ? String(totalAmount) : '0',
            itemCount: itemCount > 0 ? itemCount : 0,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          }).returning()
          return newSession
        }

        // If cart is active or abandoned, update the existing session
        console.log('🔄 Updating existing cart session')
        const updateData: any = {
          sessionId,
          userId: userId || existingSession.userId,
          customerName: customerName || existingSession.customerName,
          updatedAt: new Date(),
        }

        // Update cart data if provided
        if (cartData) {
          if (itemCount > 0) updateData.itemCount = itemCount
          if (totalAmount > 0) updateData.totalAmount = String(totalAmount)
        }

        // If cart was abandoned, reactivate it
        if (existingSession.status === 'abandoned') {
          updateData.status = 'active'
          updateData.abandonedAt = null
          console.log('🔄 Reactivating abandoned cart')
        }

        await db.update(cartSessions)
          .set(updateData)
          .where(eq(cartSessions.id, existingSession.id))
        
        return { ...existingSession, ...updateData }
      } else {
        // No existing cart with same hash, create new session
        console.log('🆕 Creating new cart session with hash:', cartHash)
        const [newSession] = await db.insert(cartSessions).values({
          sessionId,
          cartHash,
          userId: userId || null,
          customerEmail: customerEmail || null,
          customerName: customerName || null,
          status: 'active',
          totalAmount: totalAmount > 0 ? String(totalAmount) : '0',
          itemCount: itemCount > 0 ? itemCount : 0,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        }).returning()
        return newSession
      }
    } catch (error) {
      console.error('Error creating/getting cart session:', error)
      return null
    }
  }

  // Track cart event
  static async trackEvent(sessionId: string, eventType: 'add_item' | 'remove_item' | 'update_quantity' | 'view_cart' | 'start_checkout' | 'complete_checkout' | 'abandon_cart' | 'recover_cart' | 'recovery_completed', data?: any) {
    try {
      // Check if tracking is enabled
      const isEnabled = await this.isTrackingEnabled()
      if (!isEnabled) return null

      const eventData = {
        sessionId,
        eventType,
        productId: data?.productId || null,
        productName: data?.productName || null,
        quantity: data?.quantity || 1,
        price: data?.price || null,
        totalValue: data?.totalValue || null,
        metadata: data?.metadata || null,
      }

      const [event] = await db.insert(cartEvents).values(eventData).returning()
      return event
    } catch (error) {
      console.error('Error tracking cart event:', error)
      return null
    }
  }

  // Update cart session with current data
  static async updateSession(sessionId: string, data: any) {
    try {
      // Check if tracking is enabled
      const isEnabled = await this.isTrackingEnabled()
      if (!isEnabled) return null

      const updateData: any = {
        updatedAt: new Date(),
      }

      if (data.totalAmount !== undefined) updateData.totalAmount = data.totalAmount
      if (data.itemCount !== undefined) updateData.itemCount = data.itemCount
      if (data.customerEmail !== undefined) updateData.customerEmail = data.customerEmail
      if (data.customerName !== undefined) updateData.customerName = data.customerName
      if (data.device !== undefined) updateData.device = data.device
      if (data.browser !== undefined) updateData.browser = data.browser
      if (data.source !== undefined) updateData.source = data.source
      if (data.utmSource !== undefined) updateData.utmSource = data.utmSource
      if (data.utmMedium !== undefined) updateData.utmMedium = data.utmMedium
      if (data.utmCampaign !== undefined) updateData.utmCampaign = data.utmCampaign
      if (data.country !== undefined) updateData.country = data.country
      if (data.city !== undefined) updateData.city = data.city

      const [updatedSession] = await db.update(cartSessions)
        .set(updateData)
        .where(eq(cartSessions.sessionId, sessionId))
        .returning()

      return updatedSession
    } catch (error) {
      console.error('Error updating cart session:', error)
      return null
    }
  }

  // Mark cart as abandoned
  static async markAbandoned(sessionId: string, totalAmount?: number, itemCount?: number) {
    try {
      // Check if tracking is enabled
      const isEnabled = await this.isTrackingEnabled()
      if (!isEnabled) return null

      const updateData: any = {
        status: 'abandoned',
        abandonedAt: new Date(),
        updatedAt: new Date(),
      }

      if (totalAmount !== undefined) {
        updateData.totalAmount = totalAmount
      }

      if (itemCount !== undefined) {
        updateData.itemCount = itemCount
      }

      const [abandonedSession] = await db.update(cartSessions)
        .set(updateData)
        .where(eq(cartSessions.sessionId, sessionId))
        .returning()

      // Track abandonment event
      await this.trackEvent(sessionId, 'abandon_cart', {
        metadata: { abandonedAt: new Date() }
      })

      return abandonedSession
    } catch (error) {
      console.error('Error marking cart as abandoned:', error)
      return null
    }
  }

  // Mark cart as completed
  static async markCompleted(sessionId: string, totalAmount?: number, itemCount?: number) {
    try {
      const updateData: any = {
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date(),
      }

      if (totalAmount !== undefined) {
        updateData.totalAmount = totalAmount
      }

      if (itemCount !== undefined) {
        updateData.itemCount = itemCount
      }

      const [completedSession] = await db.update(cartSessions)
        .set(updateData)
        .where(eq(cartSessions.sessionId, sessionId))
        .returning()

      // Track completion event
      await this.trackEvent(sessionId, 'complete_checkout', {
        totalValue: totalAmount,
        metadata: { completedAt: new Date() }
      })

      return completedSession
    } catch (error) {
      console.error('Error marking cart as completed:', error)
      return null
    }
  }

  // EXPERT: Mark carts as abandoned based on updatedAt threshold
  static async markAbandonedByInactivity(minutesThreshold: number = 1440): Promise<number> {
    try {
      const now = new Date()
      const thresholdTime = new Date(now.getTime() - minutesThreshold * 60 * 1000)
      
      const result = await db
        .update(cartSessions)
        .set({
          status: 'abandoned',
          abandonedAt: now
        })
        .where(
          and(
            eq(cartSessions.status, 'active'),
            lt(cartSessions.updatedAt, thresholdTime)
          )
        )
      
      return result.rowCount || 0
    } catch (error) {
      console.error('Failed to mark abandoned carts by inactivity:', error)
      return 0
    }
  }

  // Get abandoned carts for recovery campaigns
  static async getAbandonedCarts(hoursAgo: number = 24) {
    try {
      const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000)
      
      const abandonedCarts = await db.query.cartSessions.findMany({
        where: and(
          eq(cartSessions.status, 'abandoned'),
          eq(cartSessions.abandonedAt, cutoffTime)
        ),
        orderBy: [desc(cartSessions.abandonedAt)]
      })

      return abandonedCarts
    } catch (error) {
      console.error('Error getting abandoned carts:', error)
      return []
    }
  }

  // Get cart analytics
  static async getCartAnalytics(days: number = 30) {
    try {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      
      // Get total sessions
      const totalSessions = await db.select({ count: sql`count(*)` })
        .from(cartSessions)
        .where(eq(cartSessions.createdAt, cutoffDate))

      // Get abandoned sessions
      const abandonedSessions = await db.select({ count: sql`count(*)` })
        .from(cartSessions)
        .where(and(
          eq(cartSessions.status, 'abandoned'),
          eq(cartSessions.abandonedAt, cutoffDate)
        ))

      // Get completed sessions
      const completedSessions = await db.select({ count: sql`count(*)` })
        .from(cartSessions)
        .where(and(
          eq(cartSessions.status, 'completed'),
          eq(cartSessions.completedAt, cutoffDate)
        ))

      // Get total abandoned value
      const abandonedValue = await db.select({ 
        total: sql`sum(total_amount)` 
      })
        .from(cartSessions)
        .where(and(
          eq(cartSessions.status, 'abandoned'),
          eq(cartSessions.abandonedAt, cutoffDate)
        ))

      return {
        totalSessions: Number(totalSessions[0]?.count) || 0,
        abandonedSessions: Number(abandonedSessions[0]?.count) || 0,
        completedSessions: Number(completedSessions[0]?.count) || 0,
        abandonedValue: Number(abandonedValue[0]?.total) || 0,
        abandonmentRate: Number(totalSessions[0]?.count) ? 
          (Number(abandonedSessions[0]?.count) / Number(totalSessions[0]?.count)) * 100 : 0
      }
    } catch (error) {
      console.error('Error getting cart analytics:', error)
      return {
        totalSessions: 0,
        abandonedSessions: 0,
        completedSessions: 0,
        abandonedValue: 0,
        abandonmentRate: 0
      }
    }
  }

  // Helper function to get device type
  static getDeviceType(userAgent: string): string {
    if (/mobile/i.test(userAgent)) return 'mobile'
    if (/tablet/i.test(userAgent)) return 'tablet'
    return 'desktop'
  }

  // Helper function to get browser
  static getBrowser(userAgent: string): string {
    if (/chrome/i.test(userAgent)) return 'chrome'
    if (/firefox/i.test(userAgent)) return 'firefox'
    if (/safari/i.test(userAgent)) return 'safari'
    if (/edge/i.test(userAgent)) return 'edge'
    return 'other'
  }

  // Helper function to get traffic source
  static getSource(referrer: string, utmSource?: string): string {
    if (utmSource) return utmSource
    if (!referrer) return 'direct'
    if (/google/i.test(referrer)) return 'organic'
    if (/facebook/i.test(referrer)) return 'social'
    if (/bing/i.test(referrer)) return 'organic'
    return 'referral'
  }
} 