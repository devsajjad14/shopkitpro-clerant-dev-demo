import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paymentSettings, paymentGateways, defaultPaymentSettings } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    // Fetch payment settings from database
    const settings = await db.select().from(paymentSettings)
    
    if (settings.length === 0) {
      // Return default settings if none exist
      return NextResponse.json({
        paypalEnabled: true,
        cardEnabled: true,
        klarnaEnabled: false,
        codEnabled: false,
        message: 'Using default payment settings'
      })
    }

    // Find specific payment method settings
    const generalSettings = settings.find(s => s.name === 'General' || s.paymentMethod === 'general')
    const paypalSettings = settings.find(s => s.name === 'PayPal')
    const stripeSettings = settings.find(s => s.name === 'Stripe')

    const squareSettings = settings.find(s => s.name === 'Square')
    const authorizeSettings = settings.find(s => s.name === 'Authorize.Net')
    const paypalCommerceSettings = settings.find(s => s.name === 'PayPal Commerce')
    const klarnaSettings = settings.find(s => s.name === 'Klarna')
    const codSettings = settings.find(s => s.name === 'COD')
    const paypalCommerceCardSettings = settings.find(s => s.name === 'PayPal Commerce Card' || s.paymentMethod === 'paypal-commerce-card');
    
    // Find the active card gateway record
    const cardGatewayRecords = [
      paypalCommerceCardSettings,
      stripeSettings,
      squareSettings,
      authorizeSettings,
    ];

    // Find the active card gateway record (use camelCase only)
    const activeCardRecord = cardGatewayRecords.find(
      rec => rec && rec.cardEnabled && rec.isActive
    );
    // Fallback to Stripe if none active
    const fallbackCardRecord = stripeSettings;

    // Build response object
    const response = {
      // General settings (enable/disable flags)
      paypalEnabled: generalSettings?.paypalEnabled || paypalSettings?.isActive || false,
      cardEnabled: !!activeCardRecord,
      klarnaEnabled: generalSettings?.klarnaEnabled || klarnaSettings?.isActive || false,
      codEnabled: generalSettings?.codEnabled || codSettings?.isActive || false,
      
      // PayPal settings
      paypalClientId: paypalSettings?.clientId || paypalSettings?.paypalClientId || '',
      paypalClientSecret: paypalSettings?.clientSecret || paypalSettings?.paypalClientSecret || '',
      paypalMode: paypalSettings?.environment || paypalSettings?.paypalMode || 'sandbox',
      paypalReuseCredentials: paypalSettings?.paypalReuseCredentials || false,
      paypalConnectionStatus: paypalSettings?.connectionStatus || paypalSettings?.paypalConnectionStatus || 'not_connected',
      
      // Stripe settings (individual fields like PayPal)
      stripePublishableKey: stripeSettings?.publishableKey || '',
      stripeSecretKey: stripeSettings?.secretKey || '',
      
      // Card settings (from active record)
      cardGateway: activeCardRecord?.cardGateway || fallbackCardRecord?.cardGateway || 'stripe',
      cardEnvironment: activeCardRecord?.cardEnvironment || fallbackCardRecord?.cardEnvironment || 'sandbox',
      cardDigitalWalletsEnabled: activeCardRecord?.cardDigitalWalletsEnabled || fallbackCardRecord?.cardDigitalWalletsEnabled || false,
      cardConnectionStatus: activeCardRecord?.cardConnectionStatus || fallbackCardRecord?.cardConnectionStatus || 'not_connected',
      cardCredentials: activeCardRecord?.cardCredentials || {},
      
      // Klarna settings
      klarnaMerchantId: klarnaSettings?.merchantId || klarnaSettings?.klarnaMerchantId || '',
      klarnaUsername: klarnaSettings?.username || klarnaSettings?.klarnaUsername || '',
      klarnaPassword: klarnaSettings?.password || klarnaSettings?.klarnaPassword || '',
      klarnaConnectionStatus: klarnaSettings?.connectionStatus || klarnaSettings?.klarnaConnectionStatus || 'not_connected',
      klarnaRegion: klarnaSettings?.klarnaRegion || 'North America', // <-- ensure region is returned
      
      // COD settings
      codInstructions: codSettings?.instructions || codSettings?.codInstructions || '',
      codRequirePhone: codSettings?.requirePhone || codSettings?.codRequirePhone || false,
      
      message: 'Payment settings retrieved successfully'
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Error fetching payment settings:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch payment settings',
        paypalEnabled: true, // Default to enabled
        cardEnabled: true,
        klarnaEnabled: false,
        codEnabled: false
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('===PAYMENT SETTINGS SAVE START===')
    const body = await request.json()
    
    console.log('API received body:', {
      ...body,
      paypalClientId: body.paypalClientId ? `[${body.paypalClientId.length} chars]` : 'empty',
      paypalClientSecret: body.paypalClientSecret ? `[${body.paypalClientSecret.length} chars]` : 'empty',
      cardCredentials: body.cardCredentials ? `[${JSON.stringify(body.cardCredentials).length} chars]` : 'empty'
    })
    
    console.log('Selected card gateway:', body.cardGateway)
    console.log('Card credentials type:', typeof body.cardCredentials)
    
    // Get existing settings
    const existingSettings = await db.select().from(paymentSettings)
    
    console.log('Existing settings found:', existingSettings.length)
    console.log('Existing settings names:', existingSettings.map(s => s.name))
    
    // Find specific payment method settings
    const existingGeneralSettings = existingSettings.find(s => s.paymentMethod === 'general')
    const existingPaypalSettings = existingSettings.find(s => s.name === 'PayPal')
    const existingStripeSettings = existingSettings.find(s => s.name === 'Stripe')
    const existingKlarnaSettings = existingSettings.find(s => s.name === 'Klarna')
    const existingCodSettings = existingSettings.find(s => s.name === 'COD')
    
    // Handle general payment settings (enable/disable flags)
    const generalSettingsData = {
      name: 'General',
      paymentMethod: 'general',
      isActive: true,
      environment: 'sandbox' as const,
      // Payment method enable/disable flags
      paypalEnabled: body.paypalEnabled || false,
      cardEnabled: body.cardEnabled || false,
      klarnaEnabled: body.klarnaEnabled || false,
      codEnabled: body.codEnabled || false,
      updatedAt: new Date(),
    }
    
    if (!existingGeneralSettings) {
      console.log('Creating new general payment settings...')
      await db.insert(paymentSettings).values(generalSettingsData)
    } else {
      console.log('Updating existing general payment settings...')
      await db
        .update(paymentSettings)
        .set(generalSettingsData)
        .where(eq(paymentSettings.id, existingGeneralSettings.id))
    }
    
    // Clean up legacy/conflicting PayPal Commerce records
    const legacyPaypalCommerceRecords = existingSettings.filter(s => s.paymentMethod === 'paypal-commerce' || s.name === 'PayPal Commerce');
    for (const legacy of legacyPaypalCommerceRecords) {
      await db.delete(paymentSettings).where(eq(paymentSettings.id, legacy.id));
    }

    // Upsert PayPal button record
    if (body.paypalClientId || body.paypalClientSecret || body.paypalEnabled !== undefined) {
      const paypalButtonSettingsData = {
        name: 'PayPal',
        paymentMethod: 'paypal',
        isActive: body.paypalEnabled || false,
        environment: body.paypalMode || 'sandbox',
        // Button fields only
        paypalEnabled: body.paypalEnabled || false,
        paypalClientId: body.paypalClientId || null,
        paypalClientSecret: body.paypalClientSecret || null,
        paypalMode: body.paypalMode || 'sandbox',
        paypalReuseCredentials: body.paypalReuseCredentials || false,
        paypalConnectionStatus: body.paypalConnectionStatus || 'not_connected',
        // Card fields always null/false
        cardEnabled: false,
        cardGateway: null,
        cardCredentials: null,
        cardEnvironment: null,
        cardDigitalWalletsEnabled: false,
        cardConnectionStatus: 'not_connected',
        supportsDigitalWallets: false,
        updatedAt: new Date(),
      };
      const existingPaypalButtonSettings = existingSettings.find(s => s.name === 'PayPal' && s.paymentMethod === 'paypal');
      if (!existingPaypalButtonSettings) {
        await db.insert(paymentSettings).values(paypalButtonSettingsData);
      } else {
        await db
          .update(paymentSettings)
          .set(paypalButtonSettingsData)
          .where(eq(paymentSettings.id, existingPaypalButtonSettings.id));
      }
    }

    // Always upsert PayPal Commerce Card record if cardGateway is 'paypal-commerce'
    if (body.cardGateway === 'paypal-commerce') {
      console.log('Upserting PayPal Commerce Card record...');
      let parsedCredentials = body.cardCredentials;
      if (typeof body.cardCredentials === 'string') {
        try {
          parsedCredentials = JSON.parse(body.cardCredentials);
        } catch (error) {
          parsedCredentials = {};
        }
      }
      const paypalCardSettingsData = {
        name: 'PayPal Commerce Card',
        paymentMethod: 'paypal-commerce-card',
        isActive: body.cardEnabled || false,
        environment: body.cardEnvironment || 'sandbox',
        cardEnabled: body.cardEnabled || false,
        cardGateway: body.cardGateway,
        cardCredentials: parsedCredentials || null,
        cardEnvironment: body.cardEnvironment || 'sandbox',
        cardDigitalWalletsEnabled: body.cardDigitalWalletsEnabled || false,
        cardConnectionStatus: body.cardConnectionStatus || 'not_connected',
        supportsDigitalWallets: body.cardDigitalWalletsEnabled || false,
        paypalEnabled: false,
        paypalClientId: null,
        paypalClientSecret: null,
        paypalMode: null,
        paypalReuseCredentials: false,
        paypalConnectionStatus: 'not_connected',
        updatedAt: new Date(),
      };
      const existingPaypalCardSettings = existingSettings.find(s => s.name === 'PayPal Commerce Card' && s.paymentMethod === 'paypal-commerce-card');
      if (!existingPaypalCardSettings) {
        await db.insert(paymentSettings).values(paypalCardSettingsData);
        console.log('Inserted new PayPal Commerce Card record:', paypalCardSettingsData);
      } else {
        await db
          .update(paymentSettings)
          .set(paypalCardSettingsData)
          .where(eq(paymentSettings.id, existingPaypalCardSettings.id));
        console.log('Updated existing PayPal Commerce Card record:', paypalCardSettingsData);
      }
    }

    // Handle card gateway settings for other gateways (stripe, square, authorize)
    if (body.cardGateway && body.cardGateway !== 'paypal-commerce' && (body.cardEnabled !== undefined || body.cardCredentials)) {
      const gatewayNameMap: Record<string, string> = {
        'stripe': 'Stripe',
        'square': 'Square',
        'authorize': 'Authorize.Net',
      };
      const gatewayName = gatewayNameMap[body.cardGateway] || body.cardGateway;
      const existingGatewaySettings = existingSettings.find(
        s => s.name === gatewayName || s.paymentMethod === body.cardGateway
      );
      // Parse cardCredentials if it's a string
      let parsedCredentials = body.cardCredentials;
      if (typeof body.cardCredentials === 'string') {
        try {
          parsedCredentials = JSON.parse(body.cardCredentials);
        } catch (error) {
          console.error('Error parsing card credentials:', error);
          parsedCredentials = {};
        }
      }
      const gatewaySettingsData = {
        name: gatewayName,
        paymentMethod: body.cardGateway,
        isActive: body.cardEnabled || false,
        environment: body.cardEnvironment || 'sandbox',
        cardEnabled: body.cardEnabled || false,
        cardGateway: body.cardGateway,
        cardEnvironment: body.cardEnvironment || 'sandbox',
        cardDigitalWalletsEnabled: body.cardDigitalWalletsEnabled || false,
        cardConnectionStatus: body.cardConnectionStatus || 'not_connected',
        cardCredentials: parsedCredentials || null,
        connectionStatus: body.cardConnectionStatus || 'not_connected',
        supportsDigitalWallets: body.cardDigitalWalletsEnabled || false,
        updatedAt: new Date(),
      };
      if (!existingGatewaySettings) {
        console.log(`Creating new ${gatewayName} payment settings...`);
        await db.insert(paymentSettings).values(gatewaySettingsData);
      } else {
        console.log(`Updating existing ${gatewayName} payment settings...`);
        await db
          .update(paymentSettings)
          .set(gatewaySettingsData)
          .where(eq(paymentSettings.id, existingGatewaySettings.id));
      }
    }
    
    // When enabling a card gateway, disable all others
    if (body.cardEnabled && body.cardGateway) {
      const cardGatewayNames = [
        { name: 'Stripe', paymentMethod: 'stripe' },
        { name: 'Square', paymentMethod: 'square' },
        { name: 'Authorize.Net', paymentMethod: 'authorize' },
        { name: 'PayPal Commerce Card', paymentMethod: 'paypal-commerce-card' },
      ];
      for (const gw of cardGatewayNames) {
        if (!(body.cardGateway === 'paypal-commerce' && gw.paymentMethod === 'paypal-commerce-card') &&
            !(body.cardGateway === 'stripe' && gw.paymentMethod === 'stripe') &&
            !(body.cardGateway === 'square' && gw.paymentMethod === 'square') &&
            !(body.cardGateway === 'authorize' && gw.paymentMethod === 'authorize')) {
          const rec = existingSettings.find(s => s.name === gw.name && s.paymentMethod === gw.paymentMethod);
          if (rec && (rec.cardEnabled || rec.isActive)) {
            await db.update(paymentSettings)
              .set({ cardEnabled: false, isActive: false })
              .where(eq(paymentSettings.id, rec.id));
          }
        }
      }
    }
    
    // Handle Klarna settings
    if (body.klarnaMerchantId || body.klarnaUsername || body.klarnaPassword || body.klarnaEnabled !== undefined) {
      const klarnaSettingsData = {
        name: 'Klarna',
        paymentMethod: 'klarna',
        isActive: body.klarnaEnabled || false,
        environment: 'sandbox' as const, // Klarna typically uses sandbox/live
        // Klarna specific fields
        merchantId: body.klarnaMerchantId || null,
        username: body.klarnaUsername || null,
        password: body.klarnaPassword || null,
        // Legacy Klarna fields
        klarnaEnabled: body.klarnaEnabled || false,
        klarnaMerchantId: body.klarnaMerchantId || null,
        klarnaUsername: body.klarnaUsername || null,
        klarnaPassword: body.klarnaPassword || null,
        klarnaConnectionStatus: body.klarnaConnectionStatus || 'not_connected',
        klarnaRegion: body.klarnaRegion || 'North America', // <-- ensure region is saved
        // Connection status
        connectionStatus: body.klarnaConnectionStatus || 'not_connected',
        updatedAt: new Date(),
      }
      
      if (!existingKlarnaSettings) {
        console.log('Creating new Klarna payment settings...')
        await db.insert(paymentSettings).values(klarnaSettingsData)
      } else {
        console.log('Updating existing Klarna payment settings...')
        await db
          .update(paymentSettings)
          .set(klarnaSettingsData)
          .where(eq(paymentSettings.id, existingKlarnaSettings.id))
      }
    }
    
    // Handle COD settings
    if (body.codInstructions || body.codRequirePhone !== undefined || body.codEnabled !== undefined) {
      const codSettingsData = {
        name: 'COD',
        paymentMethod: 'cod',
        isActive: body.codEnabled || false,
        environment: 'live' as const, // COD is always live
        // COD specific fields
        instructions: body.codInstructions || null,
        requirePhone: body.codRequirePhone || false,
        // Legacy COD fields
        codEnabled: body.codEnabled || false,
        codInstructions: body.codInstructions || null,
        codRequirePhone: body.codRequirePhone || false,
        updatedAt: new Date(),
      }
      
      if (!existingCodSettings) {
        console.log('Creating new COD payment settings...')
        await db.insert(paymentSettings).values(codSettingsData)
      } else {
        console.log('Updating existing COD payment settings...')
        await db
          .update(paymentSettings)
          .set(codSettingsData)
          .where(eq(paymentSettings.id, existingCodSettings.id))
      }
    }
    
    console.log('===PAYMENT SETTINGS SAVE END===')
    return NextResponse.json({
      success: true,
      message: 'Payment settings saved successfully'
    })
    
  } catch (error) {
    console.error('Error saving payment settings:', error)
    console.log('===PAYMENT SETTINGS SAVE END===')
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to save payment settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 