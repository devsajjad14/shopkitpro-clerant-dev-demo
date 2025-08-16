-- Clean up multiple records in data_updater table
-- Keep only the record with id = 1, delete all others

-- First, check what records exist
SELECT * FROM data_updater ORDER BY id;

-- Delete all records except the one with id = 1
DELETE FROM data_updater WHERE id != 1;

-- If no record with id = 1 exists, create one
INSERT INTO data_updater (id, selected_data_source, auto_update_enabled, update_interval_minutes, file_count, last_update_status, database_status, created_at, updated_at)
SELECT 1, 'local', false, 60, 0, 'idle', 'ready', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM data_updater WHERE id = 1);

-- Verify the result
SELECT * FROM data_updater;
