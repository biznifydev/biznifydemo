'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Minus, Plus } from 'lucide-react'

interface BudgetRow {
  id: string
  name: string
  type: string
  level: number
  monthlyData: Record<number, number>
  total: number
  isExpanded: boolean
  isCalculated?: boolean
  isSummary?: boolean
  children?: BudgetRow[]
}

interface BudgetTableProps {
  data: { rows: BudgetRow[] }
  onCellClick: (categoryId: string, month: number, value: number) => void
  onAddCategory?: (name: string, type: string, parentId?: string) => void
  onUpdateCategory?: (id: string, name: string) => void
  onDeleteCategory?: (id: string) => void
}

export function BudgetTable({ data, onCellClick }: BudgetTableProps) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (rowId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId)
    } else {
      newExpanded.add(rowId)
    }
    setExpandedRows(newExpanded)
  }

  const getRowStyle = (row: BudgetRow) => {
    if (row.isCalculated || row.isSummary) {
      return 'bg-purple-50' // Total rows with purple background
    }
    if (row.level === 0 && row.children && row.children.length > 0) {
      return 'bg-gray-50' // Category totals with lighter background
    }
    return 'bg-white' // Regular rows
  }

  const getAccountCellStyle = (row: BudgetRow) => {
    if (row.isCalculated || row.isSummary) {
      return 'text-purple-800 font-bold'
    }
    if (row.level === 0 && row.children && row.children.length > 0) {
      return 'font-bold text-gray-900' // Category headers
    }
    return 'text-gray-700' // Regular items
  }

  const getDataCellStyle = (row: BudgetRow) => {
    if (row.isCalculated || row.isSummary) {
      return 'text-purple-800 font-bold'
    }
    if (row.level === 0 && row.children && row.children.length > 0) {
      return 'font-bold text-gray-900' // Category totals
    }
    return 'hover:bg-blue-50 cursor-pointer'
  }

  const getIndentation = (level: number) => {
    return level * 16 // 16px per level for more compact design
  }

  const handleCellClick = (row: BudgetRow, month: number) => {
    if (row.isCalculated || row.isSummary) return // Don't allow editing calculated/summary rows
    
    const currentValue = row.monthlyData[month] || 0
    const newValue = prompt(`Enter value for ${row.name} - ${monthNames[month - 1]}:`, currentValue.toString())
    
    if (newValue !== null) {
      const numValue = parseFloat(newValue) || 0
      onCellClick(row.id, month, numValue)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const renderExpandIcon = (row: BudgetRow) => {
    if (row.children && row.children.length > 0) {
      const isExpanded = expandedRows.has(row.id)
      return (
        <button
          onClick={() => toggleRow(row.id)}
          className="p-0.5 hover:bg-gray-100 rounded text-gray-500"
        >
          {isExpanded ? (
            <Minus className="w-3 h-3" />
          ) : (
            <Plus className="w-3 h-3" />
          )}
        </button>
      )
    }
    return <div className="w-4 h-4"></div> // Empty space for alignment
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-200">
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 w-8"></th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Category</th>
              {monthNames.map((month, index) => (
                <th key={month} className="px-2 py-2 text-right text-xs font-semibold text-gray-700">
                  {month}
                </th>
              ))}
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr key={row.id} className={`${getRowStyle(row)} border-b border-gray-100`}>
                <td className="px-3 py-2">
                  {renderExpandIcon(row)}
                </td>
                <td className={`px-3 py-2 ${getAccountCellStyle(row)}`}>
                  <div 
                    className="flex items-center"
                    style={{ paddingLeft: `${getIndentation(row.level)}px` }}
                  >
                    {row.name}
                  </div>
                </td>
                {months.map((month) => (
                  <td
                    key={month}
                    className={`px-2 py-2 text-right ${getDataCellStyle(row)}`}
                    onClick={() => handleCellClick(row, month)}
                  >
                    {formatCurrency(row.monthlyData[month] || 0)}
                  </td>
                ))}
                <td className={`px-3 py-2 text-right ${row.isCalculated || row.isSummary ? 'text-purple-800 font-bold' : row.level === 0 && row.children && row.children.length > 0 ? 'font-bold text-gray-900' : ''}`}>
                  {formatCurrency(row.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 