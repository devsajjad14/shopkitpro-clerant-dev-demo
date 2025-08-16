# File Lifecycle Management - Industry Best Practices Implementation

## Overview

This system implements comprehensive file lifecycle management for brand logos, following industry best practices to prevent orphaned files and ensure clean asset management.

## Features Implemented

### ✅ 1. **Automatic Cleanup on Logo Replacement**
- When editing a brand and uploading a new logo
- Old logo is automatically deleted from storage
- Supports both server (local filesystem) and Vercel (blob storage) platforms
- Graceful degradation if cleanup fails

### ✅ 2. **Automatic Cleanup on Brand Deletion**
- When deleting a brand, its logo is automatically deleted
- Prevents orphaned files in storage
- Database-first approach: checks for logo before deletion

### ✅ 3. **Robust Error Handling**
- Operations continue even if file cleanup fails
- Detailed logging for troubleshooting
- Non-blocking cleanup for better user experience

### ✅ 4. **Platform-Aware Cleanup**
- Works with both server (local files) and Vercel blob storage
- Uses appropriate deletion methods for each platform
- Validates file existence before attempting deletion

## Architecture

### Core Components

1. **File Cleanup Service** (`/lib/services/file-cleanup-service.ts`)
   - `cleanupBrandLogo()` - Safe logo cleanup with validation
   - `validateBrandLogoExists()` - Check if logo file exists
   - `safeBrandLogoDelete()` - Delete with proper error handling
   - `cleanupOrphanedBrandLogos()` - Batch cleanup of orphaned files

2. **Enhanced Brand Actions** (`/lib/actions/brands.ts`)
   - `updateBrand()` - Now includes optional old logo cleanup
   - `deleteBrand()` - Automatically cleans up brand logo before deletion

3. **Admin Cleanup API** (`/api/admin/cleanup/brand-logos`)
   - Manual cleanup endpoint for system maintenance
   - Returns detailed cleanup statistics

## Usage Examples

### Automatic Cleanup (Default Behavior)

```javascript
// When editing a brand - old logo automatically cleaned up
await updateBrand(brandId, { ...brandData, logo: newLogoUrl }, { cleanupOldLogo: true })

// When deleting a brand - logo automatically cleaned up
await deleteBrand(brandId)
```

### Manual Cleanup (Admin Operation)

```javascript
// Run manual cleanup of orphaned files
const response = await fetch('/api/admin/cleanup/brand-logos', { method: 'POST' })
const result = await response.json()
console.log(result.stats) // { deletedCount: 5, failedCount: 0, errors: [] }
```

## Industry Best Practices Implemented

### 🏆 1. **Atomic Operations**
- File operations are tied to database transactions
- Rollback capability if operations fail
- Database-first approach prevents data inconsistencies

### 🏆 2. **Graceful Degradation**
- System continues working if file cleanup fails
- User operations are not blocked by file system issues
- Detailed error logging for maintenance

### 🏆 3. **Resource Management**
- Proactive cleanup prevents storage bloat
- Automatic cleanup reduces manual maintenance
- Platform-aware operations for optimal performance

### 🏆 4. **Validation and Safety**
- File existence validation before operations
- Safe deletion with error handling
- Non-destructive operations where possible

### 🏆 5. **Observability**
- Comprehensive logging for all operations
- Cleanup statistics and reporting
- Error tracking and debugging information

## File Lifecycle Flowchart

```
Brand Creation with Logo:
1. Upload logo file → Get URL
2. Create brand record with logo URL
3. ✅ Brand + Logo saved atomically

Brand Logo Replacement:
1. Get current brand logo URL
2. Upload new logo file → Get new URL
3. Update brand record with new URL
4. Delete old logo file (async, non-blocking)
5. ✅ New logo active, old logo cleaned up

Brand Deletion:
1. Get brand record with logo URL
2. Delete logo file from storage
3. Delete brand record from database
4. ✅ Both brand and logo removed
```

## Configuration

### Environment Variables
- `NEXT_PUBLIC_APP_URL` - Base URL for internal API calls
- `BLOB_READ_WRITE_TOKEN` - Vercel blob storage access token (required for Vercel platform)
- Platform detection automatically handles server vs Vercel

### Storage Paths
- **Server Platform**: `./media/brands/`
- **Vercel Platform**: `brands/` (in Vercel blob storage)

### Platform-Specific Features

#### **Server Platform (Local Storage)**
- ✅ **File validation**: Direct filesystem access
- ✅ **Batch cleanup**: Scans directory for orphaned files
- ✅ **Atomic operations**: File system transactions
- ✅ **Fast operations**: Local file system performance

#### **Vercel Platform (Blob Storage)**
- ✅ **URL validation**: HTTP HEAD requests to verify existence  
- ✅ **Secure deletion**: Uses Vercel blob `del()` API
- ✅ **Smart error handling**: Handles 404/401 errors gracefully
- ✅ **Token validation**: Checks for required BLOB_READ_WRITE_TOKEN
- ⚠️ **Manual cleanup**: Vercel doesn't provide file listing API

## Enhanced Platform Support

### Server Platform Cleanup Logs
```
[FILE-CLEANUP] Starting cleanup for operation: replace, URL: /media/brands/old-logo.jpg
[SERVER-CLEANUP] Attempting to delete from server storage: /media/brands/old-logo.jpg
[SERVER-CLEANUP] Checking file exists: /path/to/media/brands/old-logo.jpg
[SERVER-CLEANUP] ✅ Successfully deleted from server storage: /path/to/media/brands/old-logo.jpg
[FILE-CLEANUP] ✅ Brand logo cleanup successful for operation: replace
```

### Vercel Platform Cleanup Logs
```
[FILE-CLEANUP] Starting cleanup for operation: replace, URL: https://example.blob.vercel-storage.com/brands/logo.jpg
[PLATFORM-DELETE] Auto-detected Vercel platform from URL
[VERCEL-CLEANUP] Attempting to delete from Vercel blob storage: https://example.blob.vercel-storage.com/brands/logo.jpg
[VERCEL-CLEANUP] ✅ Successfully deleted from Vercel blob storage: https://example.blob.vercel-storage.com/brands/logo.jpg
[FILE-CLEANUP] ✅ Brand logo cleanup successful for operation: replace
```

### Smart Platform Detection
The system now automatically detects the platform based on URL patterns:
- **Server URLs**: `/media/brands/filename.jpg` → Uses server cleanup
- **Vercel URLs**: `https://*.blob.vercel-storage.com/brands/filename.jpg` → Uses Vercel cleanup
- **Fallback**: Uses configured platform setting

## Monitoring and Maintenance

### Recommended Practices

1. **Regular Cleanup Jobs**
   ```bash
   # Run monthly cleanup of orphaned files
   curl -X POST http://localhost:3000/api/admin/cleanup/brand-logos
   ```

2. **Monitor Logs**
   - Check for cleanup failures in application logs
   - Monitor storage usage trends
   - Track error patterns for troubleshooting

3. **Storage Audits**
   - Compare database records with actual files
   - Identify and clean orphaned assets
   - Monitor storage usage and costs

## Error Handling Scenarios

| Scenario | Behavior | Recovery |
|----------|----------|----------|
| Logo upload fails | Brand creation continues without logo | User can retry logo upload |
| Old logo cleanup fails | New logo is still saved | Manual cleanup or retry |
| Storage unavailable | Operations logged as warnings | System continues normally |
| Database rollback | New files are orphaned temporarily | Next cleanup cycle removes them |

## Performance Considerations

1. **Non-blocking Cleanup**: File deletions don't block user operations
2. **Batch Operations**: Cleanup runs efficiently in batches
3. **Platform Optimization**: Uses native deletion methods for each platform
4. **Resource Limits**: Built-in timeouts and error handling

## Security Considerations

1. **Path Validation**: All file paths are validated before operations
2. **Access Control**: Cleanup endpoints require admin access
3. **Safe Deletions**: Only deletes files in designated directories
4. **Error Disclosure**: Sensitive information not exposed in errors

## Future Enhancements

- [ ] Scheduled cleanup jobs (cron-like)
- [ ] Storage usage analytics
- [ ] Backup before deletion
- [ ] Advanced orphan detection algorithms
- [ ] Multi-tenant cleanup isolation