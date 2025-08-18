export function validateTableData(tableName: string, data: any[]): boolean {
  if (!Array.isArray(data)) {
    console.error(`Invalid data format for table ${tableName}: expected array`)
    return false
  }
  
  if (data.length === 0) {
    console.warn(`No data found for table ${tableName}`)
    return true
  }
  
  return true
}

export function sanitizeData(data: any[]): any[] {
  return data.map(item => {
    const sanitized = { ...item }
    
    // Remove undefined values
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === undefined) {
        delete sanitized[key]
      }
    })
    
    return sanitized
  })
}