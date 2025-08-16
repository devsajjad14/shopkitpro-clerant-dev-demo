-- Migration: Set up payment methods and gateways
-- This migration creates the initial payment methods and gateways

-- Insert payment methods
INSERT INTO payment_methods (id, name, display_name, enabled, description, icon, sort_order) VALUES
  (gen_random_uuid(), 'card', 'Credit/Debit Card', true, 'Process credit and debit card payments', 'credit-card', 1),
  (gen_random_uuid(), 'paypal', 'PayPal Commerce Platform', true, 'PayPal, Venmo, Pay Later, and Credit/Debit Cards', 'paypal', 2),
  (gen_random_uuid(), 'klarna', 'Klarna', false, 'Buy Now, Pay Later', 'klarna', 3),
  (gen_random_uuid(), 'cod', 'Cash on Delivery', false, 'Pay when you receive your order', 'cash', 4);

-- Insert payment gateways for card payments
INSERT INTO payment_gateways (id, name, display_name, payment_method_id, enabled, supports_digital_wallets) 
SELECT 
  gen_random_uuid(),
  'stripe',
  'Stripe',
  pm.id,
  false,
  true
FROM payment_methods pm WHERE pm.name = 'card';

INSERT INTO payment_gateways (id, name, display_name, payment_method_id, enabled, supports_digital_wallets) 
SELECT 
  gen_random_uuid(),
  
  pm.id,
  false,
  true
FROM payment_methods pm WHERE pm.name = 'card';

INSERT INTO payment_gateways (id, name, display_name, payment_method_id, enabled, supports_digital_wallets) 
SELECT 
  gen_random_uuid(),
  'square',
  'Square',
  pm.id,
  false,
  false
FROM payment_methods pm WHERE pm.name = 'card';

INSERT INTO payment_gateways (id, name, display_name, payment_method_id, enabled, supports_digital_wallets) 
SELECT 
  gen_random_uuid(),
  'authorize',
  'Authorize.Net',
  pm.id,
  false,
  false
FROM payment_methods pm WHERE pm.name = 'card';

INSERT INTO payment_gateways (id, name, display_name, payment_method_id, enabled, supports_digital_wallets) 
SELECT 
  gen_random_uuid(),
  'paypal-commerce',
  'PayPal Commerce',
  pm.id,
  false,
  true
FROM payment_methods pm WHERE pm.name = 'card';

-- Insert payment gateways for PayPal
INSERT INTO payment_gateways (id, name, display_name, payment_method_id, enabled, supports_digital_wallets) 
SELECT 
  gen_random_uuid(),
  'paypal-commerce',
  'PayPal Commerce Platform',
  pm.id,
  false,
  true
FROM payment_methods pm WHERE pm.name = 'paypal';

-- Insert payment gateways for Klarna
INSERT INTO payment_gateways (id, name, display_name, payment_method_id, enabled, supports_digital_wallets) 
SELECT 
  gen_random_uuid(),
  'klarna',
  'Klarna',
  pm.id,
  false,
  false
FROM payment_methods pm WHERE pm.name = 'klarna'; 