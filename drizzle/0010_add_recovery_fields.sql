-- Add recovery tracking fields to cart_sessions table
ALTER TABLE cart_sessions
ADD COLUMN IF NOT EXISTS recovered_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS recovery_session_id TEXT,
ADD COLUMN IF NOT EXISTS recovery_amount DECIMAL(10,2) DEFAULT 0;

-- Update the status enum to include 'recovered' if it doesn't exist
-- First, let's check if 'recovered' is already in the enum
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'recovered' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'cart_sessions_status_enum')
    ) THEN
        ALTER TYPE cart_sessions_status_enum ADD VALUE 'recovered';
    END IF;
END $$;

-- Add recovery_completed event type to cart_events if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'recovery_completed' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'cart_events_event_type_enum')
    ) THEN
        ALTER TYPE cart_events_event_type_enum ADD VALUE 'recovery_completed';
    END IF;
END $$; 