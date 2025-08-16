-- Add cart_hash column to cart_sessions table
ALTER TABLE cart_sessions ADD COLUMN cart_hash TEXT NOT NULL DEFAULT 'legacy_cart';

-- Create index for better performance when searching by cart_hash and user_id
CREATE INDEX idx_cart_sessions_cart_hash_user_id ON cart_sessions(cart_hash, user_id);

-- Update existing records to have a unique cart_hash (using session_id as fallback)
UPDATE cart_sessions SET cart_hash = 'legacy_' || session_id WHERE cart_hash = 'legacy_cart'; 