'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Plus, Edit2, Trash2 } from 'lucide-react'
import { Forecast } from '@/lib/types/forecast'

interface SavedForecastsDrawerProps {
  isOpen: boolean
  onClose: () => void
  forecasts: Forecast[]
  onSelectForecast: (forecastId: string) => void
  currentForecastId?: string
}

export function SavedForecastsDrawer({
  isOpen,
  onClose,
  forecasts,
  onSelectForecast,
  currentForecastId
}: SavedForecastsDrawerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newForecastName, setNewForecastName] = useState('')
  const [newForecastYear, setNewForecastYear] = useState(new Date().getFullYear())

  const handleCreateForecast = () => {
    if (newForecastName.trim()) {
      // This would call the create forecast function
      console.log('Creating forecast:', { name: newForecastName, year: newForecastYear })
      setShowCreateForm(false)
      setNewForecastName('')
      setNewForecastYear(new Date().getFullYear())
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="bg-white w-full max-w-md h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Saved Forecasts</h2>
            <p className="text-sm text-gray-600 mt-1">Select or create a forecast</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Create New Forecast */}
          {showCreateForm ? (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Create New Forecast</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Forecast Name
                  </label>
                  <input
                    type="text"
                    value={newForecastName}
                    onChange={(e) => setNewForecastName(e.target.value)}
                    placeholder="Enter forecast name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fiscal Year
                  </label>
                  <input
                    type="number"
                    value={newForecastYear}
                    onChange={(e) => setNewForecastYear(parseInt(e.target.value) || new Date().getFullYear())}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleCreateForecast} className="flex-1">
                    Create Forecast
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="w-full mb-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Forecast
            </Button>
          )}

          {/* Forecasts List */}
          <div className="space-y-3">
            {forecasts.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No forecasts found</p>
                <p className="text-sm text-gray-400">Create your first forecast to get started</p>
              </div>
            ) : (
              forecasts.map((forecast) => (
                <Card
                  key={forecast.id}
                  className={`cursor-pointer transition-colors ${
                    currentForecastId === forecast.id
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onSelectForecast(forecast.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{forecast.name}</h3>
                        {forecast.description && (
                          <p className="text-sm text-gray-600 mb-2">{forecast.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{forecast.fiscal_year}</span>
                          <span>•</span>
                          <span>{formatDate(forecast.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(forecast.status || 'draft')}`}>
                          {forecast.status || 'draft'}
                        </span>
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              // Handle edit
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              // Handle delete
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 