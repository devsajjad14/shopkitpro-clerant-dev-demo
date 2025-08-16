# Database Cleanup Scripts

## data_updater Table Cleanup

The `data_updater` table stores configuration and status information for the data manager. Sometimes this table can accumulate multiple records, which can cause issues with the "Last Updated" display.

### Option 1: Run SQL Script (Recommended)

1. Connect to your PostgreSQL database
2. Run the SQL script:
   ```sql
   \i client/scripts/cleanup-data-updater.sql
   ```

This script will:
- Ensure only one record with `id = 1` exists
- Delete all other records
- Create a default record if none exists

### Option 2: Run TypeScript Script

1. Navigate to the client directory: `cd client`
2. Run the script:
   ```bash
   npx tsx scripts/cleanup-data-updater.ts
   ```

### What This Fixes

- Resolves "Never updated" display issue
- Ensures consistent data updater configuration
- Prevents multiple records from accumulating
- Maintains proper `last_manual_update` timestamp tracking

### After Cleanup

The system will:
- Display the correct "Last Updated" time
- Properly track database update timestamps
- Maintain consistent configuration settings

### Verification

After running the cleanup, you can verify by checking:
```sql
SELECT * FROM data_updater;
```

You should see only one record with `id = 1`.
