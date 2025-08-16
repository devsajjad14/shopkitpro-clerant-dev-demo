-- Cleanup script for data_updater table
-- This script ensures only one record (id = 1) exists in the table

-- First, check if record with id = 1 exists
DO $$
BEGIN
    -- If no record with id = 1 exists, create one
    IF NOT EXISTS (SELECT 1 FROM data_updater WHERE id = 1) THEN
        INSERT INTO data_updater (
            id, 
            selected_data_source, 
            auto_update_enabled, 
            update_interval_minutes, 
            last_manual_update, 
            last_auto_update, 
            last_update_status, 
            last_update_message, 
            file_count, 
            database_status, 
            created_at, 
            updated_at
        ) VALUES (
            1, 
            'local', 
            false, 
            60, 
            NULL, 
            NULL, 
            'idle', 
            NULL, 
            0, 
            'ready', 
            NOW(), 
            NOW()
        );
        RAISE NOTICE 'Created default record with id = 1';
    ELSE
        RAISE NOTICE 'Record with id = 1 already exists';
    END IF;
END $$;

-- Delete all other records (keeping only id = 1)
DELETE FROM data_updater WHERE id != 1;

-- Verify the cleanup
SELECT 
    'Cleanup completed' as status,
    COUNT(*) as remaining_records,
    MAX(id) as max_id,
    MIN(id) as min_id
FROM data_updater;

-- Show the remaining record
SELECT * FROM data_updater;
