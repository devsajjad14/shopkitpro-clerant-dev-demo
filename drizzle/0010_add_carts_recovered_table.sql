-- Add carts_recovered table
CREATE TABLE IF NOT EXISTS carts_recovered (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  abandoned_cart_id UUID NOT NULL REFERENCES cart_sessions(id),
  recovery_session_id TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  recovery_amount DECIMAL(10,2) NOT NULL,
  item_count INTEGER NOT NULL,
  recovered_at TIMESTAMP DEFAULT NOW(),
  time_to_recovery_hours DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Remove recovery_campaigns table (no longer needed)
DROP TABLE IF EXISTS recovery_campaigns CASCADE;

-- Remove recovery-related columns from cart_sessions
ALTER TABLE cart_sessions 
DROP COLUMN IF EXISTS recovered_at,
DROP COLUMN IF EXISTS recovery_session_id,
DROP COLUMN IF EXISTS recovery_amount;

-- Update cart_sessions status enum to remove 'recovered'
ALTER TABLE cart_sessions 
DROP CONSTRAINT IF EXISTS cart_sessions_status_check;

ALTER TABLE cart_sessions 
ADD CONSTRAINT cart_sessions_status_check 
CHECK (status IN ('active', 'abandoned', 'completed', 'expired'));

-- Update cart_events event_type enum to remove 'recovery_completed' (we'll use 'recovery_completed' for now)
-- This is already correct in the schema 