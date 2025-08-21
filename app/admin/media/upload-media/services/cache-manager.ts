'use client'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>()
  private maxSize = 100 // Maximum number of cached entries
  private defaultTTL = 5 * 60 * 1000 // 5 minutes default TTL

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.getOldestKey()
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key)
      return null
    }

    // Update timestamp for LRU
    entry.timestamp = Date.now()
    return entry.data as T
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clear cache entries matching a pattern
  clearByPattern(pattern: string): number {
    let removedCount = 0
    const regex = new RegExp(pattern)
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        removedCount++
      }
    }
    
    return removedCount
  }

  // Get cache statistics
  getStats() {
    const now = Date.now()
    const entries = Array.from(this.cache.values())
    const validEntries = entries.filter(entry => now <= entry.expiry)
    
    return {
      totalEntries: this.cache.size,
      validEntries: validEntries.length,
      expiredEntries: this.cache.size - validEntries.length,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : null,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : null
    }
  }

  // Clean up expired entries
  cleanup(): number {
    const now = Date.now()
    let removedCount = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key)
        removedCount++
      }
    }
    
    return removedCount
  }

  private getOldestKey(): string | null {
    let oldestKey: string | null = null
    let oldestTimestamp = Infinity
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp
        oldestKey = key
      }
    }
    
    return oldestKey
  }
}

// Export singleton instance
export const cacheManager = new CacheManager()

// Auto cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    const removed = cacheManager.cleanup()
    if (removed > 0) {
      console.log(`Cache cleanup: removed ${removed} expired entries`)
    }
  }, 5 * 60 * 1000)
}