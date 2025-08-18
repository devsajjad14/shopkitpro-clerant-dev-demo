// Optimized data transformation utilities

// Utility function to pick first available field
export function pickFirst<T>(item: any, fields: string[]): T | null {
  for (const field of fields) {
    if (item[field] !== undefined && item[field] !== null) {
      return item[field]
    }
  }
  return null
}

// Parse timestamps
export function parseTimestamp(value: any): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value)
    return isNaN(parsed.getTime()) ? null : parsed
  }
  return null
}

// Parse boolean values
export function parseBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim()
    return lower === 'true' || lower === '1' || lower === 'yes'
  }
  if (typeof value === 'number') return value === 1
  return false
}

// Parse decimal values
export function parseDecimal(value: any): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '')
    const num = parseFloat(cleaned)
    return isNaN(num) ? null : num.toString()
  }
  return null
}

// Parse integer values
export function parseInteger(value: any): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return Math.floor(value)
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9-]/g, '')
    const num = parseInt(cleaned, 10)
    return isNaN(num) ? null : num
  }
  return null
}

// Generate unique slug
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

// Common timestamp fields
export const timestampFields = [
  'createdAt', 'updatedAt', 'DLU', 'created_at', 'updated_at'
] as const