'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiDownload, 
  FiDatabase, 
  FiFileText, 
  FiCheckCircle, 
  FiAlertCircle,
  FiClock,
  FiSettings,
  FiBarChart,
  FiTrendingUp,
  FiShield,
  FiZap,
  FiFilter,
  FiCalendar,
  FiGrid,
  FiList,
  FiSearch,
  FiRefreshCw,
  FiPlay,
  FiPause,
  FiLoader
} from 'react-icons/fi'
import { toast } from 'sonner'

interface TableInfo {
  id: string
  name: string
  tableName: string
  count: number
  lastUpdated: string
  totalSize: string
  tableSize: string
  columns: number
  primaryKeys: number
  nullable: number
}

interface TablesResponse {
  success: boolean
  tables: TableInfo[]
  totalTables: number
  totalRecords: number
  error?: string
}

export default function DataManagerExportPage() {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [filteredTables, setFilteredTables] = useState<TableInfo[]>([])
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [excludedTables, setExcludedTables] = useState<string[]>([])
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'xml'>('json')
  const [exportProgress, setExportProgress] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [exportMode, setExportMode] = useState<'custom' | 'all' | 'exclude'>('custom')
  const [totalStats, setTotalStats] = useState({ tables: 0, records: 0 })
  const [error, setError] = useState<string | null>(null)

  // Fetch tables data on component mount
  useEffect(() => {
    fetchTables()
  }, [])

  // Filter tables based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTables(tables)
    } else {
      const filtered = tables.filter(table =>
        table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        table.tableName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredTables(filtered)
    }
  }, [tables, searchQuery])

  const fetchTables = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/data-manager/tables')
      const data: TablesResponse = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tables')
      }

      if (data.success) {
        setTables(data.tables)
        setTotalStats({
          tables: data.totalTables,
          records: data.totalRecords
        })
        toast.success(`Loaded ${data.totalTables} tables successfully`)
      } else {
        throw new Error(data.error || 'Failed to fetch tables')
      }
    } catch (error: any) {
      console.error('Error fetching tables:', error)
      setError(error.message)
      toast.error(`Failed to load tables: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTableToggle = (tableId: string) => {
    if (exportMode === 'exclude') {
      setExcludedTables(prev =>
        prev.includes(tableId)
          ? prev.filter(id => id !== tableId)
          : [...prev, tableId]
      )
    } else {
      setSelectedTables(prev =>
        prev.includes(tableId)
          ? prev.filter(id => id !== tableId)
          : [...prev, tableId]
      )
    }
  }

  const handleSelectAll = () => {
    setSelectedTables(filteredTables.map(table => table.id))
    toast.success(`Selected ${filteredTables.length} tables`)
  }

  const handleClearAll = () => {
    setSelectedTables([])
    setExcludedTables([])
    toast.success('Cleared all selections')
  }

  const handleExport = async () => {
    try {
      // Determine which tables to export
      let tablesToExport: string[] = []
      
      if (exportMode === 'all') {
        tablesToExport = tables.map(t => t.tableName)
      } else if (exportMode === 'exclude') {
        tablesToExport = tables
          .filter(t => !excludedTables.includes(t.id))
          .map(t => t.tableName)
      } else {
        tablesToExport = selectedTables.map(id => {
          const table = tables.find(t => t.id === id)
          return table?.tableName || id
        })
      }

      if (tablesToExport.length === 0) {
        toast.error('Please select at least one table to export')
        return
      }

      setIsExporting(true)
      setExportProgress(0)
      
      // Show progress animation
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/data-manager/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tables: tablesToExport,
          format: exportFormat,
          exportMode
        })
      })

      clearInterval(progressInterval)
      setExportProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Export failed')
      }

      // Try to read as text first to determine the response type
      const responseText = await response.text()
      
      let responseData
      try {
        // Try to parse as JSON
        responseData = JSON.parse(responseText)
      } catch (e) {
        // Not JSON, treat as file content
        responseData = null
      }
      
      if (responseData && responseData.multipleFiles) {
        // Handle multiple file downloads
        clearInterval(progressInterval)
        setExportProgress(100)
        
        // Download each table as a separate file
        for (const [tableName, tableData] of Object.entries(responseData.tables)) {
          try {
            let fileContent = ''
            let filename = ''
            let contentType = ''
            
            switch (exportFormat) {
              case 'csv':
                fileContent = convertTableToCSV(tableName, tableData as any[])
                filename = `${tableName}.csv`
                contentType = 'text/csv'
                break
              case 'xml':
                fileContent = convertTableToXML(tableName, tableData as any[])
                filename = `${tableName}.xml`
                contentType = 'application/xml'
                break
              default:
                fileContent = JSON.stringify(tableData, null, 2)
                filename = `${tableName}.json`
                contentType = 'application/json'
                break
            }
            
            // Create and download the file
            const blob = new Blob([fileContent], { type: contentType })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            
            // Small delay between downloads to prevent browser blocking
            await new Promise(resolve => setTimeout(resolve, 100))
          } catch (error) {
            console.error(`Failed to download ${tableName}:`, error)
          }
        }
        
        toast.success(`Successfully exported ${Object.keys(responseData.tables).length} tables as separate ${exportFormat.toUpperCase()} files`)
      } else {
        // Single file download - response is the file content
        const contentDisposition = response.headers.get('content-disposition')
        const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
        const filename = filenameMatch?.[1] || `export.${exportFormat}`
        
        // Determine content type based on format
        let contentType = 'application/octet-stream'
        switch (exportFormat) {
          case 'csv':
            contentType = 'text/csv'
            break
          case 'xml':
            contentType = 'application/xml'
            break
          case 'json':
            contentType = 'application/json'
            break
        }
        
        // Create and download the file
        const blob = new Blob([responseText], { type: contentType })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast.success(`Successfully exported ${tablesToExport.length} table as ${exportFormat.toUpperCase()}`)
      }
      
    } catch (error: any) {
      console.error('Export error:', error)
      toast.error(`Export failed: ${error.message}`)
    } finally {
      setIsExporting(false)
      setTimeout(() => setExportProgress(0), 2000)
    }
  }

  const getEffectiveSelectedTables = (): string[] => {
    if (exportMode === 'all') {
      return tables.map(t => t.id)
    } else if (exportMode === 'exclude') {
      return tables.map(t => t.id).filter(id => !excludedTables.includes(id))
    } else {
      return selectedTables
    }
  }

  const effectiveSelectedTables = getEffectiveSelectedTables()
  const selectedTablesCount = effectiveSelectedTables.length
  const selectedRecordsCount = effectiveSelectedTables.reduce((sum, id) => {
    const table = tables.find(t => t.id === id)
    return sum + (table?.count || 0)
  }, 0)

  // Helper functions for file conversion
  const convertTableToCSV = (tableName: string, data: any[]): string => {
    if (!Array.isArray(data) || data.length === 0) {
      return `# No data available for table: ${tableName}\n`
    }

    let csvContent = ''
    
    // Get headers from first row
    const headers = Object.keys(data[0])
    csvContent += headers.join(',') + '\n'
    
    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header]
        if (value === null || value === undefined) return ''
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return String(value)
      })
      csvContent += values.join(',') + '\n'
    }
    
    return csvContent
  }

  const convertTableToXML = (tableName: string, data: any[]): string => {
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xmlContent += `<${tableName}>\n`
    
    if (Array.isArray(data) && data.length > 0) {
      for (const row of data) {
        xmlContent += '  <record>\n'
        for (const [key, value] of Object.entries(row)) {
          const escapedValue = String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          xmlContent += `    <${key}>${escapedValue}</${key}>\n`
        }
        xmlContent += '  </record>\n'
      }
    }
    
    xmlContent += `</${tableName}>`
    
    return xmlContent
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-gray-200 border-t-[#00437f] rounded-full mx-auto mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading Database Tables
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Fetching table information and metadata...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Tables
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchTables}
            className="px-6 py-3 bg-[#00437f] text-white font-semibold rounded-lg hover:bg-black transition-colors flex items-center gap-2 mx-auto"
          >
            <FiRefreshCw className="w-4 h-4" />
            Retry
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">
                Database Export Manager
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Export and synchronize database tables with advanced configuration
              </p>
            </div>
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchTables}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Export Configuration Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Export Settings */}
            <div className="bg-white dark:bg-black rounded-3xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-[#00437f] rounded-xl shadow-lg">
                  <FiDownload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Export Settings
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Configure your data export
                  </p>
                </div>
              </div>

              {/* Format Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Export Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'json', label: 'JSON', icon: FiFileText },
                    { value: 'csv', label: 'CSV', icon: FiFileText },
                    { value: 'xml', label: 'XML', icon: FiFileText }
                  ].map((format) => (
                    <motion.button
                      key={format.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setExportFormat(format.value as any)}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                        exportFormat === format.value
                          ? 'border-[#00437f] bg-gray-50 dark:bg-gray-800 text-[#00437f] dark:text-white'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <format.icon className="w-5 h-5 mx-auto mb-2" />
                      <span className="text-sm font-medium">{format.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Selection Controls */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Selected Tables ({selectedTablesCount})
                  </label>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSelectAll}
                      className="px-3 py-1 text-xs bg-[#00437f] text-white rounded-lg hover:bg-black transition-colors"
                    >
                      Select All
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClearAll}
                      className="px-3 py-1 text-xs bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Clear
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Export Progress */}
              {exportProgress > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Exporting data...
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {exportProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <motion.div
                      className="bg-[#00437f] h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${exportProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* Export Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                disabled={selectedTablesCount === 0 || isExporting}
                className="w-full bg-[#00437f] hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                {isExporting ? (
                  <>
                    <FiLoader className="w-5 h-5 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FiDownload className="w-5 h-5" />
                    Export Data
                  </>
                )}
              </motion.button>
            </div>

            {/* Export Statistics */}
            <div className="bg-white dark:bg-black rounded-3xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Export Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FiDatabase className="w-5 h-5 text-[#00437f] dark:text-white" />
                    <span className="text-sm font-medium text-black dark:text-white">
                      Selected Tables
                    </span>
                  </div>
                  <span className="text-lg font-bold text-[#00437f] dark:text-white">
                    {selectedTablesCount}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FiBarChart className="w-5 h-5 text-[#00437f] dark:text-white" />
                    <span className="text-sm font-medium text-black dark:text-white">
                      Total Records
                    </span>
                  </div>
                  <span className="text-lg font-bold text-[#00437f] dark:text-white">
                    {selectedRecordsCount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FiTrendingUp className="w-5 h-5 text-[#00437f] dark:text-white" />
                    <span className="text-sm font-medium text-black dark:text-white">
                      Database Tables
                    </span>
                  </div>
                  <span className="text-sm text-[#00437f] dark:text-white">
                    {totalStats.tables} total
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tables Selection */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-black rounded-3xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Database Tables
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose which tables to export ({tables.length} available)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Search */}
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tables..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00437f]"
                    />
                  </div>
                  {/* View Mode Toggle */}
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-white dark:bg-gray-700 text-[#00437f] dark:text-white shadow-sm' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      <FiGrid className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'list' 
                          ? 'bg-white dark:bg-gray-700 text-[#00437f] dark:text-white shadow-sm' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      <FiList className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Premium Export Mode Options */}
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setExportMode('all'); setExcludedTables([]); setSelectedTables([]); }}
                  className={`flex-1 px-6 py-4 rounded-2xl border-2 transition-all duration-200 shadow-lg flex items-center gap-3 font-semibold text-lg justify-center ${
                    exportMode === 'all'
                      ? 'border-[#00437f] bg-gray-50 dark:bg-gray-800 text-[#00437f] dark:text-white'
                      : 'border-gray-200 dark:border-gray-600 hover:border-[#00437f] dark:hover:border-white text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <FiCheckCircle className="w-6 h-6" />
                  All Tables
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setExportMode('exclude'); setSelectedTables([]); }}
                  className={`flex-1 px-6 py-4 rounded-2xl border-2 transition-all duration-200 shadow-lg flex items-center gap-3 font-semibold text-lg justify-center ${
                    exportMode === 'exclude'
                      ? 'border-[#00437f] bg-gray-50 dark:bg-gray-800 text-[#00437f] dark:text-white'
                      : 'border-gray-200 dark:border-gray-600 hover:border-[#00437f] dark:hover:border-white text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <FiFilter className="w-6 h-6" />
                  All Tables Except...
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setExportMode('custom'); setExcludedTables([]); setSelectedTables([]); }}
                  className={`flex-1 px-6 py-4 rounded-2xl border-2 transition-all duration-200 shadow-lg flex items-center gap-3 font-semibold text-lg justify-center ${
                    exportMode === 'custom'
                      ? 'border-[#00437f] bg-gray-50 dark:bg-gray-800 text-[#00437f] dark:text-white'
                      : 'border-gray-200 dark:border-gray-600 hover:border-[#00437f] dark:hover:border-white text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <FiList className="w-6 h-6" />
                  Custom Selection
                </motion.button>
              </div>

              {/* Tables Grid/List */}
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
                {filteredTables.map((table, index) => (
                  <motion.div
                    key={table.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                      (exportMode === 'all' || 
                       (exportMode === 'exclude' && !excludedTables.includes(table.id)) || 
                       (exportMode === 'custom' && selectedTables.includes(table.id)))
                        ? 'border-[#00437f] bg-gray-50 dark:bg-gray-800 shadow-lg'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-black'
                    }`}
                    onClick={() => handleTableToggle(table.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          (exportMode === 'all' || 
                           (exportMode === 'exclude' && !excludedTables.includes(table.id)) || 
                           (exportMode === 'custom' && selectedTables.includes(table.id)))
                            ? 'bg-[#00437f] text-white'
                            : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                        }`}>
                          <FiDatabase className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {table.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>{table.count.toLocaleString()} records</span>
                            <span>•</span>
                            <span>{table.columns} columns</span>
                            <span>•</span>
                            <span>{table.totalSize}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {table.lastUpdated !== 'Unknown' && (
                          <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Updated
                            </p>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {table.lastUpdated}
                            </p>
                          </div>
                        )}
                        {(exportMode === 'all' || 
                          (exportMode === 'exclude' && !excludedTables.includes(table.id)) || 
                          (exportMode === 'custom' && selectedTables.includes(table.id))) && (
                          <FiCheckCircle className="w-5 h-5 text-[#00437f] dark:text-white" />
                        )}
                        {(exportMode === 'exclude' && excludedTables.includes(table.id)) && (
                          <FiAlertCircle className="w-5 h-5 text-red-400" title="Excluded" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredTables.length === 0 && (
                <div className="text-center py-12">
                  <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No tables found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery ? `No tables match "${searchQuery}"` : 'No tables available'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}