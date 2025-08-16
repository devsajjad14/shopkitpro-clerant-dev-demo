import { setupPaymentMethods } from '../lib/db/migrations/001_setup_payment_methods'

async function main() {
  
  try {
    // Step 1: Setup payment methods and gateways
    const result = await setupPaymentMethods()
    
    if (result.success) {
      console.log('✅ Payment methods setup completed')
      console.log('Now run: npx drizzle-kit push')
      console.log('Then run the data migration script')
    } else {
      console.error('❌ Payment methods setup failed:', result.error)
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

main() 