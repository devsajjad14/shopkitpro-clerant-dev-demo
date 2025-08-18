interface MediaAsset {
  id: string
  filename: string
  url: string
  type: string
  size: number
  category: string
  uploadedAt: Date
}

interface AssetStats {
  totalAssets: number
  totalSize: number
  categories: Record<string, number>
  types: Record<string, number>
}

export function applyAssetFilters(
  assets: MediaAsset[], 
  categoryFilter?: string, 
  searchFilter?: string
): MediaAsset[] {
  let filteredAssets = assets

  if (categoryFilter) {
    filteredAssets = assets.filter(asset => asset.category === categoryFilter)
  }

  if (searchFilter) {
    const searchLower = searchFilter.toLowerCase()
    filteredAssets = filteredAssets.filter(asset => 
      asset.filename.toLowerCase().includes(searchLower)
    )
  }

  return filteredAssets
}

export function sortAssetsByDate(assets: MediaAsset[]): MediaAsset[] {
  return assets.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
}

export function paginateAssets(
  assets: MediaAsset[], 
  page: number, 
  limit: number
): { 
  paginatedAssets: MediaAsset[], 
  totalAssets: number, 
  pagination: any 
} {
  const offset = limit === Number.MAX_SAFE_INTEGER ? 0 : (page - 1) * limit
  const totalAssets = assets.length
  const paginatedAssets = assets.slice(offset, offset + limit)
  
  const pagination = {
    page,
    limit,
    total: totalAssets,
    totalPages: Math.ceil(totalAssets / limit),
    hasNext: page < Math.ceil(totalAssets / limit),
    hasPrev: page > 1
  }

  return { paginatedAssets, totalAssets, pagination }
}

export function calculateAssetStats(assets: MediaAsset[], filteredAssets: MediaAsset[]): {
  stats: AssetStats,
  filteredStats: AssetStats
} {
  const stats = {
    totalAssets: assets.length,
    totalSize: assets.reduce((acc, asset) => acc + asset.size, 0),
    categories: assets.reduce((acc, asset) => {
      acc[asset.category] = (acc[asset.category] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    types: assets.reduce((acc, asset) => {
      acc[asset.type] = (acc[asset.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  const filteredStats = {
    totalAssets: filteredAssets.length,
    totalSize: filteredAssets.reduce((acc, asset) => acc + asset.size, 0),
    categories: filteredAssets.reduce((acc, asset) => {
      acc[asset.category] = (acc[asset.category] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    types: filteredAssets.reduce((acc, asset) => {
      acc[asset.type] = (acc[asset.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  return { stats, filteredStats }
}