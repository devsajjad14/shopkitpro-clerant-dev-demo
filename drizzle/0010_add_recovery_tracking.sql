-- Add recovery tracking fields to cart_sessions table
ALTER TABLE cart_sessions 
ADD COLUMN IF NOT EXISTS recovered_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS recovery_session_id TEXT,
ADD COLUMN IF NOT EXISTS recovery_amount DECIMAL(10,2) DEFAULT 0;

-- Update the status enum to include 'recovered'
ALTER TABLE cart_sessions 
ALTER COLUMN status TYPE TEXT;

-- Add a check constraint to ensure valid status values
ALTER TABLE cart_sessions 
ADD CONSTRAINT cart_sessions_status_check 
CHECK (status IN ('active', 'abandoned', 'completed', 'expired', 'recovered'));

-- Add recovery_completed event type to cart_events
ALTER TABLE cart_events 
ALTER COLUMN event_type TYPE TEXT;

-- Add a check constraint to ensure valid event_type values
ALTER TABLE cart_events 
ADD CONSTRAINT cart_events_event_type_check 
CHECK (event_type IN ('add_item', 'remove_item', 'update_quantity', 'view_cart', 'start_checkout', 'complete_checkout', 'abandon_cart', 'recover_cart', 'recovery_completed')); 