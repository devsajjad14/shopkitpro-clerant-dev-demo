# Platform Selection Feature

This document describes the new platform selection feature implemented in ShopKit Pro.

## Overview

The platform selection feature allows store owners to choose their deployment platform during setup and switch between platforms from the admin dashboard. This setting is stored in the database and available site-wide through the Zustand settings store.

## Features Implemented

### 1. Setup Wizard Integration
- Added a new "Deployment Platform" step (Step 3) in the setup wizard
- Premium UI with animated platform selection cards
- Two options: Server Hosting and Vercel Platform
- Default selection: Server Hosting
- Elegant descriptions and feature comparisons

### 2. Database Integration
- Platform setting stored in the `settings` table
- Default value: "server"
- Group: "general"
- Type: "string"
- Values: "server" or "vercel"

### 3. Admin Header Integration
- Premium platform switcher in the admin header
- Live platform switching capability
- Real-time UI updates with animations
- Success/error notifications via Sonner toast
- Dropdown with detailed platform descriptions

### 4. Zustand Store Enhancement
- Added `getPlatform()` method to settings store
- Returns 'server' or 'vercel' with proper typing
- Available site-wide after settings load

## Usage Examples

### Basic Platform Detection
```typescript
import useSettingStore from '@/hooks/use-setting-store'

function MyComponent() {
  const platform = useSettingStore((state) => state.getPlatform())
  
  return (
    <div>
      Current platform: {platform}
    </div>
  )
}
```

### Using the Platform Hook
```typescript
import { usePlatform } from '@/components/platform/PlatformIndicator'

function MyComponent() {
  const platform = usePlatform()
  
  return (
    <div>
      {platform === 'vercel' ? (
        <VercelOnlyFeature />
      ) : (
        <ServerOnlyFeature />
      )}
    </div>
  )
}
```

### Conditional Rendering
```typescript
{platform === 'vercel' && <VercelSpecificComponent />}
{platform === 'server' && <ServerSpecificComponent />}
```

## Files Modified/Created

### Modified Files
1. `lib/actions/setup-wizard.ts` - Added platform field and initial setting
2. `components/setup-wizard/SetupWizard.tsx` - Added platform selection step
3. `app/api/setup/complete/route.ts` - Added platform validation
4. `hooks/use-setting-store.ts` - Added getPlatform() method
5. `app/admin/components/AdminHeader.tsx` - Integrated platform switcher

### New Files
1. `components/admin/PlatformSwitcher.tsx` - Premium platform switcher component
2. `components/platform/PlatformIndicator.tsx` - Platform indicator and utilities
3. `app/admin/platform-test/page.tsx` - Test page for platform functionality

## API Endpoints

### Platform Update
- **Endpoint**: Uses existing `updateSetting` function
- **Parameter**: key: "platform", value: "server" | "vercel"
- **Response**: Standard settings response with success/error

## Database Schema

The platform setting is stored in the existing `settings` table:

```sql
-- Example record
INSERT INTO settings (key, value, type, group) 
VALUES ('platform', 'server', 'string', 'general');
```

## Testing

### Test Pages
- `/admin/platform-test` - Comprehensive test page showing:
  - Current platform detection
  - Platform-specific features
  - Settings debug view
  - Usage examples

### Setup Testing
1. Run the setup wizard
2. Navigate to Step 3 (Deployment Platform)
3. Select between Server Hosting and Vercel Platform
4. Complete setup
5. Verify platform setting in admin

### Admin Testing
1. Access any admin page
2. Locate platform switcher in header (top-right)
3. Click to open platform selection dropdown
4. Switch between platforms
5. Verify real-time updates and notifications

## Premium Features

### Setup Wizard
- ✅ Animated platform selection cards
- ✅ Gradient backgrounds and shadows
- ✅ Feature comparison badges
- ✅ Hover animations and interactions
- ✅ Premium typography and spacing

### Admin Header
- ✅ Elegant platform indicator button
- ✅ Animated dropdown with smooth transitions
- ✅ Real-time platform switching
- ✅ Success/error notifications
- ✅ Loading states and feedback
- ✅ Detailed platform descriptions

### Components
- ✅ TypeScript typed for platform values
- ✅ Responsive design for mobile/desktop
- ✅ Consistent with existing design system
- ✅ Accessible keyboard navigation
- ✅ Error handling and fallbacks

## Technical Implementation

### State Management Flow
1. Platform selected during setup
2. Saved to database in settings table
3. Loaded into Zustand store on app startup
4. Available site-wide via getPlatform() method
5. Updates propagated immediately on change

### Component Architecture
- `PlatformSwitcher`: Main admin header component
- `PlatformIndicator`: Display-only component with utilities
- `usePlatform`: Hook for easy platform access
- Store integration: Direct Zustand store access

This implementation provides a world-class, premium platform selection experience that integrates seamlessly with the existing ShopKit Pro architecture.