-- Migration: Move existing payment settings to new normalized structure
-- This migration moves data from the old payment_settings table to the new structure

-- Step 1: Migrate PayPal credentials to payment_gateway_credentials
INSERT INTO payment_gateway_credentials (gateway_id, credential_key, credential_value, is_secret)
SELECT 
  pg.id,
  'Client ID',
  ps.paypal_client_id,
  false
FROM payment_settings ps
CROSS JOIN payment_gateways pg
JOIN payment_methods pm ON pg.payment_method_id = pm.id
WHERE pm.name = 'paypal' 
  AND pg.name = 'paypal-commerce'
  AND ps.paypal_client_id IS NOT NULL
  AND ps.paypal_client_id != '';

INSERT INTO payment_gateway_credentials (gateway_id, credential_key, credential_value, is_secret)
SELECT 
  pg.id,
  'Client Secret',
  ps.paypal_client_secret,
  true
FROM payment_settings ps
CROSS JOIN payment_gateways pg
JOIN payment_methods pm ON pg.payment_method_id = pm.id
WHERE pm.name = 'paypal' 
  AND pg.name = 'paypal-commerce'
  AND ps.paypal_client_secret IS NOT NULL
  AND ps.paypal_client_secret != '';

-- Step 2: Migrate Stripe credentials to payment_gateway_credentials
INSERT INTO payment_gateway_credentials (gateway_id, credential_key, credential_value, is_secret)
SELECT 
  pg.id,
  'Publishable Key',
  ps.card_credentials->>'Publishable Key',
  false
FROM payment_settings ps
CROSS JOIN payment_gateways pg
JOIN payment_methods pm ON pg.payment_method_id = pm.id
WHERE pm.name = 'card' 
  AND pg.name = 'stripe'
  AND ps.card_credentials IS NOT NULL
  AND ps.card_credentials->>'Publishable Key' IS NOT NULL;

INSERT INTO payment_gateway_credentials (gateway_id, credential_key, credential_value, is_secret)
SELECT 
  pg.id,
  'Secret Key',
  ps.card_credentials->>'Secret Key',
  true
FROM payment_settings ps
CROSS JOIN payment_gateways pg
JOIN payment_methods pm ON pg.payment_method_id = pm.id
WHERE pm.name = 'card' 
  AND pg.name = 'stripe'
  AND ps.card_credentials IS NOT NULL
  AND ps.card_credentials->>'Secret Key' IS NOT NULL;

-- Step 3: Update payment gateways with connection status and test results
UPDATE payment_gateways 
SET 
  enabled = true,
  connection_status = 'connected',
  last_tested = ps.paypal_last_tested,
  test_result = ps.paypal_test_result
FROM payment_settings ps
JOIN payment_methods pm ON payment_gateways.payment_method_id = pm.id
WHERE pm.name = 'paypal' 
  AND payment_gateways.name = 'paypal-commerce'
  AND ps.paypal_connection_status = 'connected';

UPDATE payment_gateways 
SET 
  enabled = true,
  connection_status = 'connected',
  last_tested = ps.card_last_tested,
  test_result = ps.card_test_result
FROM payment_settings ps
JOIN payment_methods pm ON payment_gateways.payment_method_id = pm.id
WHERE pm.name = 'card' 
  AND payment_gateways.name = 'stripe'
  AND ps.card_connection_status = 'connected';

-- Step 4: Update payment methods enabled status
UPDATE payment_methods 
SET enabled = true
WHERE name = 'card' AND EXISTS (
  SELECT 1 FROM payment_settings WHERE card_enabled = true
);

UPDATE payment_methods 
SET enabled = true
WHERE name = 'paypal' AND EXISTS (
  SELECT 1 FROM payment_settings WHERE paypal_enabled = true
);

UPDATE payment_methods 
SET enabled = true
WHERE name = 'klarna' AND EXISTS (
  SELECT 1 FROM payment_settings WHERE klarna_enabled = true
);

UPDATE payment_methods 
SET enabled = true
WHERE name = 'cod' AND EXISTS (
  SELECT 1 FROM payment_settings WHERE cod_enabled = true
); 