// Production-grade performance monitoring utility
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Track API endpoint performance
  trackApiCall(endpoint: string, duration: number, success: boolean) {
    const key = `api:${endpoint}:${success ? 'success' : 'error'}`
    if (!this.metrics.has(key)) {
      this.metrics.set(key, [])
    }
    this.metrics.get(key)!.push(duration)
    
    // Keep only last 100 measurements
    const measurements = this.metrics.get(key)!
    if (measurements.length > 100) {
      measurements.shift()
    }
  }

  // Get performance stats
  getStats(endpoint?: string) {
    const stats: Record<string, any> = {}
    
    for (const [key, measurements] of this.metrics.entries()) {
      if (endpoint && !key.includes(endpoint)) continue
      
      const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length
      const max = Math.max(...measurements)
      const min = Math.min(...measurements)
      
      stats[key] = {
        count: measurements.length,
        avgMs: Math.round(avg * 100) / 100,
        maxMs: Math.round(max * 100) / 100,
        minMs: Math.round(min * 100) / 100,
        p95Ms: Math.round(this.percentile(measurements, 0.95) * 100) / 100
      }
    }
    
    return stats
  }

  private percentile(arr: number[], p: number): number {
    const sorted = [...arr].sort((a, b) => a - b)
    const index = Math.ceil(sorted.length * p) - 1
    return sorted[index] || 0
  }
}

// Performance monitoring decorator for API routes
export function withPerformanceMonitoring(
  handler: (req: any, res: any) => Promise<any>,
  endpoint: string
) {
  return async (req: any, res: any) => {
    const start = performance.now()
    let success = true
    
    try {
      const result = await handler(req, res)
      return result
    } catch (error) {
      success = false
      throw error
    } finally {
      const duration = performance.now() - start
      PerformanceMonitor.getInstance().trackApiCall(endpoint, duration, success)
    }
  }
}

// Bundle size tracking for development
export const trackBundleSize = (componentName: string, size: number) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`📦 Bundle size - ${componentName}: ${(size / 1024).toFixed(2)}KB`)
  }
}