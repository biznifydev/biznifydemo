"use client"

import { useState, useEffect } from "react"
import { X, Save, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DataEntryModalProps {
  isOpen: boolean
  onClose: () => void
  accountId: string
  accountName: string
  month: number
  year: number
  currentValue: number
  onSave: (accountId: string, month: number, value: number, applyToAllMonths: boolean) => Promise<void>
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function DataEntryModal({
  isOpen,
  onClose,
  accountId,
  accountName,
  month,
  year,
  currentValue,
  onSave
}: DataEntryModalProps) {
  const [value, setValue] = useState(currentValue.toString())
  const [applyToAllMonths, setApplyToAllMonths] = useState(false)
  const [saving, setSaving] = useState(false)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setValue(currentValue.toString())
      setApplyToAllMonths(false)
      setSaving(false)
    }
  }, [isOpen, currentValue])

  const handleSave = async () => {
    if (!value || isNaN(Number(value))) return
    
    setSaving(true)
    try {
      await onSave(accountId, month, Number(value), applyToAllMonths)
      onClose()
    } catch (error) {
      console.error('Error saving data:', error)
      alert(`Error saving data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Enter Financial Data</h2>
            <p className="text-sm text-gray-600 mt-1">
              {accountName} - {monthNames[month - 1]} {year}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Value Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                $
              </span>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                step="0.01"
                min="0"
                autoFocus
              />
            </div>
          </div>

          {/* Apply Options */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Apply to:
            </label>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  checked={!applyToAllMonths}
                  onChange={() => setApplyToAllMonths(false)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    This month only ({monthNames[month - 1]} {year})
                  </span>
                  <p className="text-xs text-gray-500">
                    Update only the current month's value
                  </p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  checked={applyToAllMonths}
                  onChange={() => setApplyToAllMonths(true)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    All months from {monthNames[month - 1]} onwards
                  </span>
                  <p className="text-xs text-gray-500">
                    Apply this value to {monthNames[month - 1]} and all future months in {year}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Preview */}
          {applyToAllMonths && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Preview</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                This will set ${Number(value).toLocaleString()} for {monthNames[month - 1]} through December {year}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!value || isNaN(Number(value)) || saving}
            className="min-w-[80px]"
          >
            {saving ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Save size={14} />
                <span>Save</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 