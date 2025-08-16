import { db } from '../index'
import { paymentSettings, paymentGateways, paymentGatewayCredentials, paymentMethods } from '../schema'
import { eq, and } from 'drizzle-orm'

export async function migrateExistingData() {
  try {
    // Get existing payment settings
    const existingSettings = await db.select().from(paymentSettings).limit(1)
    
    if (existingSettings.length === 0) {
      return { success: true, message: 'No existing data to migrate' }
    }

    const settings = existingSettings[0]

    // Get payment methods
    const methods = await db.select().from(paymentMethods)
    const cardMethod = methods.find(m => m.name === 'card')
    const paypalMethod = methods.find(m => m.name === 'paypal')

    if (!cardMethod || !paypalMethod) {
      throw new Error('Payment methods not found. Run setupPaymentMethods first.')
    }

    // Get gateways
    const gateways = await db.select().from(paymentGateways)
    const stripeGateway = gateways.find(g => g.name === 'stripe' && g.paymentMethodId === cardMethod.id)
    const paypalGateway = gateways.find(g => g.name === 'paypal-commerce' && g.paymentMethodId === paypalMethod.id)

    if (!stripeGateway || !paypalGateway) {
      throw new Error('Payment gateways not found. Run setupPaymentMethods first.')
    }

    // Migrate PayPal credentials
    if (settings.paypalClientId && settings.paypalClientId.trim() !== '') {
      await db.insert(paymentGatewayCredentials).values([
        {
          gatewayId: paypalGateway.id,
          credentialKey: 'Client ID',
          credentialValue: settings.paypalClientId,
          isSecret: false,
        },
        {
          gatewayId: paypalGateway.id,
          credentialKey: 'Client Secret',
          credentialValue: settings.paypalClientSecret || '',
          isSecret: true,
        },
      ])

      // Update PayPal gateway status
      await db.update(paymentGateways)
        .set({
          enabled: settings.paypalEnabled || false,
          connectionStatus: settings.paypalConnectionStatus || 'not_connected',
          lastTested: settings.paypalLastTested,
          testResult: settings.paypalTestResult,
        })
        .where(eq(paymentGateways.id, paypalGateway.id))
    }

    // Migrate Stripe credentials
    if (settings.cardCredentials && typeof settings.cardCredentials === 'object') {
      const credentials = settings.cardCredentials as any
      
      if (credentials['Secret Key'] && credentials['Publishable Key']) {
        await db.insert(paymentGatewayCredentials).values([
          {
            gatewayId: stripeGateway.id,
            credentialKey: 'Publishable Key',
            credentialValue: credentials['Publishable Key'],
            isSecret: false,
          },
          {
            gatewayId: stripeGateway.id,
            credentialKey: 'Secret Key',
            credentialValue: credentials['Secret Key'],
            isSecret: true,
          },
        ])

        // Update Stripe gateway status
        await db.update(paymentGateways)
          .set({
            enabled: settings.cardEnabled || false,
            connectionStatus: settings.cardConnectionStatus || 'not_connected',
            lastTested: settings.cardLastTested,
            testResult: settings.cardTestResult,
          })
          .where(eq(paymentGateways.id, stripeGateway.id))
      }
    }

    // Update payment methods enabled status
    if (settings.cardEnabled) {
      await db.update(paymentMethods)
        .set({ enabled: true })
        .where(eq(paymentMethods.id, cardMethod.id))
    }

    if (settings.paypalEnabled) {
      await db.update(paymentMethods)
        .set({ enabled: true })
        .where(eq(paymentMethods.id, paypalMethod.id))
    }

    if (settings.klarnaEnabled) {
      const klarnaMethod = methods.find(m => m.name === 'klarna')
      if (klarnaMethod) {
        await db.update(paymentMethods)
          .set({ enabled: true })
          .where(eq(paymentMethods.id, klarnaMethod.id))
      }
    }

    if (settings.codEnabled) {
      const codMethod = methods.find(m => m.name === 'cod')
      if (codMethod) {
        await db.update(paymentMethods)
          .set({ enabled: true })
          .where(eq(paymentMethods.id, codMethod.id))
      }
    }

    return { success: true, message: 'Data migration completed' }

  } catch (error) {
    console.error('Error migrating data:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
} 