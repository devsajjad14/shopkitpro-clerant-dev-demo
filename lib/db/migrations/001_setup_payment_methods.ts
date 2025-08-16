import { db } from '../index'
import { paymentMethods, paymentGateways } from '../schema'

export async function setupPaymentMethods() {
  try {
    // Insert payment methods
    const [cardMethod] = await db.insert(paymentMethods).values({
      name: 'card',
      displayName: 'Credit/Debit Card',
      enabled: true,
      description: 'Process credit and debit card payments',
      icon: 'credit-card',
      sortOrder: 1,
    }).returning()

    const [paypalMethod] = await db.insert(paymentMethods).values({
      name: 'paypal',
      displayName: 'PayPal Commerce Platform',
      enabled: true,
      description: 'PayPal, Venmo, Pay Later, and Credit/Debit Cards',
      icon: 'paypal',
      sortOrder: 2,
    }).returning()

    const [klarnaMethod] = await db.insert(paymentMethods).values({
      name: 'klarna',
      displayName: 'Klarna',
      enabled: false,
      description: 'Buy Now, Pay Later',
      icon: 'klarna',
      sortOrder: 3,
    }).returning()

    const [codMethod] = await db.insert(paymentMethods).values({
      name: 'cod',
      displayName: 'Cash on Delivery',
      enabled: false,
      description: 'Pay when you receive your order',
      icon: 'cash',
      sortOrder: 4,
    }).returning()

    // Insert payment gateways for card payments
    await db.insert(paymentGateways).values([
      {
        name: 'stripe',
        displayName: 'Stripe',
        paymentMethodId: cardMethod.id,
        enabled: false,
        supportsDigitalWallets: true,
      },

      {
        name: 'square',
        displayName: 'Square',
        paymentMethodId: cardMethod.id,
        enabled: false,
        supportsDigitalWallets: false,
      },
      {
        name: 'authorize',
        displayName: 'Authorize.Net',
        paymentMethodId: cardMethod.id,
        enabled: false,
        supportsDigitalWallets: false,
      },
      {
        name: 'paypal-commerce',
        displayName: 'PayPal Commerce',
        paymentMethodId: cardMethod.id,
        enabled: false,
        supportsDigitalWallets: true,
      },
    ])

    // Insert payment gateway for PayPal
    await db.insert(paymentGateways).values({
      name: 'paypal-commerce',
      displayName: 'PayPal Commerce Platform',
      paymentMethodId: paypalMethod.id,
      enabled: false,
      supportsDigitalWallets: true,
    })

    // Insert payment gateway for Klarna
    await db.insert(paymentGateways).values({
      name: 'klarna',
      displayName: 'Klarna',
      paymentMethodId: klarnaMethod.id,
      enabled: false,
      supportsDigitalWallets: false,
    })

    return { success: true, message: 'Payment methods and gateways setup completed' }

  } catch (error) {
    console.error('Error setting up payment methods:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
} 