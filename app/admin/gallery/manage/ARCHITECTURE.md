# Media Directory Structure - Modular Architecture

## Overview

This modular architecture is designed to prevent Vercel's 250MB serverless function limit while providing a dynamic, scalable media management system.

## Architecture Components

### 🏗️ Core Services

#### 1. Directory Service (`services/directory-service.ts`)
- **Purpose**: Centralized data management for directories and files
- **Features**:
  - API integration with caching
  - Fallback data handling
  - Type-safe interfaces
  - Cache invalidation strategies

#### 2. Cache Manager (`services/cache-manager.ts`)
- **Purpose**: Intelligent caching with LRU eviction
- **Features**:
  - TTL-based expiration
  - Memory management
  - Cache statistics
  - Automatic cleanup

### 🎯 API Endpoints

#### Directory Info: `/api/admin/media/directory/[id]`
- Returns directory metadata (file count, size, last modified)
- Handles filesystem operations safely
- Provides fallback for missing directories

#### Statistics: `/api/admin/media/stats`
- Aggregates data across all directories
- Calculates file type distributions
- Identifies largest/recent files

#### Files: `/api/admin/media/files/[directoryId]`
- Lists files in specific directory
- Includes metadata (size, type, last modified)
- Provides public URLs for file access

### 🎨 UI Components

#### Core Components
1. **MediaDirectoryView** - Main container with error boundaries
2. **DirectoryTree** - Expandable tree with real-time data
3. **DirectoryStats** - Dynamic statistics dashboard
4. **FileManagement** - Recent/largest files viewer
5. **FolderItem** - Individual folder with lazy file loading

#### Utility Components
1. **LoadingSpinner** - Consistent loading states
2. **ErrorBoundary** - Graceful error handling
3. **LazyComponent** - Intersection Observer based lazy loading
4. **BundleOptimizer** - Lazy imports for heavy components

### 🔄 Custom Hooks

#### useDirectoryData
- Manages directory list and statistics
- Provides refresh/reload capabilities
- Handles loading and error states

#### useDirectoryFiles
- Loads files for specific directory
- Conditional loading based on expansion state
- Automatic caching integration

## Performance Optimizations

### 1. Bundle Size Management
```typescript
// Lazy loading of heavy components
const LazyFileManagement = lazy(() => import('./FileManagement'))

// Intersection Observer for viewport-based loading
<LazyComponent threshold={0.1}>
  <HeavyComponent />
</LazyComponent>
```

### 2. Caching Strategy
```typescript
// Multi-layer caching
cacheManager.set(key, data, ttl)  // Client-side cache
// + API response caching
// + Conditional fetching
```

### 3. Error Boundaries
```typescript
// Component-level error isolation
<ErrorBoundary onReset={reload}>
  <DirectoryTree />
</ErrorBoundary>
```

## File Structure

```
upload-media/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── ErrorBoundary.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── LazyComponent.tsx
│   ├── BundleOptimizer.tsx    # Bundle size management
│   ├── DirectoryStats.tsx     # Statistics dashboard
│   ├── DirectoryTree.tsx      # Main tree component
│   ├── FileManagement.tsx     # File viewer
│   ├── FolderItem.tsx         # Individual folder
│   └── MediaDirectoryView.tsx # Main container
├── hooks/
│   ├── useDirectoryData.ts    # Directory state management
│   └── useDirectoryFiles.ts   # File loading hook
├── services/
│   ├── cache-manager.ts       # Caching system
│   └── directory-service.ts   # API integration
├── config.ts                  # Configuration
├── types.ts                   # TypeScript definitions
└── utils.ts                   # Utility functions
```

## API Endpoints Structure

```
/api/admin/media/
├── directory/[id]/            # GET directory info
├── stats/                     # GET aggregated statistics
└── files/[directoryId]/       # GET files in directory
```

## Benefits

### 1. Vercel Optimization
- **Modular imports**: Only load needed components
- **Lazy loading**: Reduce initial bundle size
- **Tree shaking**: Eliminate unused code
- **Code splitting**: Separate chunks for heavy components

### 2. Performance
- **Intelligent caching**: Reduce API calls
- **Error boundaries**: Prevent cascading failures
- **Viewport loading**: Load components when needed
- **Memory management**: LRU cache eviction

### 3. Maintainability
- **Single responsibility**: Each component has one job
- **Type safety**: Full TypeScript coverage
- **Error handling**: Graceful degradation
- **Modular architecture**: Easy to extend/modify

### 4. User Experience
- **Loading states**: Clear feedback during operations
- **Error recovery**: Retry mechanisms
- **Real-time updates**: Fresh data when needed
- **Responsive design**: Works on all devices

## Usage Examples

### Adding a New Directory Type
1. Update `config.ts` with new folder definition
2. Add API handling in directory service
3. Components automatically adapt to new type

### Implementing New Statistics
1. Extend `DirectoryStats` interface
2. Update `/api/admin/media/stats` endpoint
3. Modify `DirectoryStats` component display

### Creating Custom File Views
1. Extend `FileInfo` interface if needed
2. Create new component with error boundary
3. Use existing hooks for data management

## Security Considerations

- **Path traversal prevention**: All paths validated
- **File access control**: Only media directory access
- **Input sanitization**: File names and paths cleaned
- **Error message sanitization**: No sensitive path exposure

## Future Enhancements

1. **Real-time updates**: WebSocket integration
2. **Search functionality**: Full-text file search
3. **File operations**: Delete, rename, move files
4. **Thumbnail generation**: Preview images
5. **Upload progress**: Real-time upload tracking